import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke E2E do PortalRH (docs/QA_CHECKLIST.md, item 6).
 *
 * Pré-requisito: backend rodando com seed_demo populado, e o frontend
 * servido em BASE_URL (default http://localhost:3000). Não sobe os
 * servidores sozinho -- rode-os antes:
 *   backend:  python manage.py runserver
 *   frontend: npm run dev
 * então: npx playwright test
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
