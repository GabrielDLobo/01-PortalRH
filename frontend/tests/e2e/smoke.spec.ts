import { test, expect, Page } from '@playwright/test';

/**
 * Smoke E2E do PortalRH (docs/QA_CHECKLIST.md, item 6).
 *
 * Faz login como RH e como Funcionário (contas do seed_demo) e abre cada
 * tela navegável por papel, falhando se o console do navegador registrar
 * qualquer erro. Não valida dados específicos -- é um smoke test, não um
 * teste funcional completo (esses ficam nos testes de página/serviço).
 *
 * Cada describe faz UM login e reaproveita a sessão para todas as suas
 * asserções -- o endpoint de login é limitado a 5 tentativas/min (throttle
 * "login", ver app/settings.py), e um login por teste facilmente estoura
 * essa cota ao rodar a suíte inteira em sequência.
 */

const RH_EMAIL = 'rh.demo@portalrh.com.br';
const FUNCIONARIO_EMAIL = 'demo@portalrh.com.br';
const PASSWORD = 'demo1234';

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(PASSWORD);
  await page.getByRole('button', { name: 'Entrar no sistema' }).click();
  // Aguarda sair da tela de login (RoleBasedHome decide o destino).
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15000 });
}

async function visitAndAssertClean(page: Page, path: string, errors: string[]) {
  errors.length = 0;
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  expect(errors, `console errors on ${path}`).toEqual([]);
}

test.describe('Login', () => {
  test('renders the 3D orbit background and glass card without console errors', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Entrar no sistema' })).toBeVisible();
    await page.waitForTimeout(1000); // deixa o canvas montar e renderizar o primeiro frame
    expect(errors).toEqual([]);
  });

  test('shows a clear error for wrong credentials without leaking whether the email exists', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByLabel('E-mail').fill(RH_EMAIL);
    await page.getByLabel('Senha').fill('senha-errada');
    await page.getByRole('button', { name: 'Entrar no sistema' }).click();
    await expect(page.getByText(/e-mail ou senha inválidos/i)).toBeVisible();
  });
});

test.describe('RH (admin_rh)', () => {
  test('walks every screen, opens a deep link and an unknown route, all clean', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await login(page, RH_EMAIL);

    await visitAndAssertClean(page, '/', errors);
    await expect(page.getByText('Bom dia')).toBeVisible();

    await visitAndAssertClean(page, '/employees', errors);
    await expect(page.getByRole('heading', { name: 'Funcionários' })).toBeVisible();

    // Abre o primeiro funcionário da lista para testar a tela de Detalhe.
    // O onClick fica na primeira célula da linha, não na <tr> inteira.
    errors.length = 0;
    const firstNameCell = page.locator('tbody tr td').first();
    await firstNameCell.click();
    await page.waitForURL(/\/employees\/\d+/);
    await page.waitForLoadState('networkidle');
    expect(errors, 'console errors on employee detail').toEqual([]);

    await visitAndAssertClean(page, '/admission', errors);
    await expect(page.getByRole('heading', { name: 'Admissão' })).toBeVisible();

    await visitAndAssertClean(page, '/leaves', errors);
    await expect(page.getByRole('heading', { name: 'Férias e afastamentos' })).toBeVisible();

    await visitAndAssertClean(page, '/evaluations', errors);
    await expect(page.getByRole('heading', { name: 'Avaliações' })).toBeVisible();

    await visitAndAssertClean(page, '/terminations', errors);
    await expect(page.getByRole('heading', { name: 'Rescisões' })).toBeVisible();

    await visitAndAssertClean(page, '/reports', errors);
    await expect(page.getByRole('heading', { name: 'Relatórios' })).toBeVisible();

    await visitAndAssertClean(page, '/profile', errors);
    await expect(page.getByRole('heading', { name: 'Meu perfil' })).toBeVisible();

    // Rota desconhecida não derruba o app (mesma sessão, sem novo login).
    await visitAndAssertClean(page, '/uma-rota-que-nao-existe', errors);
  });
});

test.describe('Funcionário', () => {
  test('walks every screen it can reach, never sees admin-only nav, and admin routes stay locked', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await login(page, FUNCIONARIO_EMAIL);

    // RoleBasedHome manda funcionario para /admission, não para o Dashboard.
    await page.waitForURL(/\/admission/);
    await page.waitForLoadState('networkidle');
    expect(errors, 'console errors on self-service admission').toEqual([]);

    await visitAndAssertClean(page, '/leaves', errors);
    await expect(page.getByRole('heading', { name: 'Férias e afastamentos' })).toBeVisible();

    await visitAndAssertClean(page, '/profile', errors);
    await expect(page.getByRole('heading', { name: 'Meu perfil' })).toBeVisible();

    // Itens adminOnly não aparecem na sidebar para um funcionario.
    await expect(page.getByRole('link', { name: 'Funcionários' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Avaliações' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Rescisões' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Relatórios' })).toHaveCount(0);

    // Navegação direta a rota admin-only não vaza dados (mesma sessão).
    await page.goto('/reports');
    await expect(page.getByRole('heading', { name: 'Relatórios' })).toHaveCount(0);
  });
});

test.describe('Roteamento', () => {
  test('deep link to a protected route without a session redirects to /login', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Entrar no sistema' })).toBeVisible();
  });
});
