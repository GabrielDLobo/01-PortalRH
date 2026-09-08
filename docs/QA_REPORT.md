# PortalRH — Relatório de QA e Pentest

**Data:** 2026-09-07
**Branch:** `qa/hardening`
**Escopo:** funcional (caminho feliz + borda), roteamento/acesso por papel, segurança/pentest.
**Ambiente testado:** backend local (SQLite, `DEBUG=True`/`DEMO_MODE=True` conforme o caso) com
`seed_demo` populado, mais verificação direta contra a demo pública em produção
(`https://portalrh-backend.vercel.app`, `https://portalrh-frontend.vercel.app`) para os itens de
configuração. Contas: `rh.demo@portalrh.com.br` (admin_rh) e `demo@portalrh.com.br`
(funcionario), senha `demo1234`.
**Método:** leitura dos serializers/views/urls reais (não dos tipos do frontend) para descobrir o
contrato, seguida de ataque direto à API via `curl`/`httpie` reproduzindo cada payload, e leitura
de código para XSS/SQLi onde o ataque direto não é o teste mais confiável (renderização é
responsabilidade do frontend, não da API).

Todos os itens 🔴 e 🟠 encontrados foram corrigidos nesta branch e re-testados (evidência abaixo
de cada um). Testes automatizados novos cobrindo os achados: 120/120 testes Django passando,
suíte Playwright (5/5) passando, `type-check`/`lint`/`build`/`vitest` do frontend limpos.

---

## 1. Matriz de casos

| # | Área | Caso | Resultado | Severidade | Correção |
|---|------|------|-----------|------------|----------|
| 1 | Segurança | Funcionario auto-promove `role` para `admin_rh` via `PATCH /accounts/users/{own_id}/` | ❌→✅ Corrigido | 🔴 Crítico | `UserUpdateSerializer.validate_role()` bloqueia mudança de papel por quem não é admin_rh |
| 2 | Segurança | Funcionario acessa `/reports/dashboard/employees_report/` (folha de pagamento completa) | ❌→✅ Corrigido | 🔴 Crítico | `DashboardViewSet.permission_classes = [IsAdminRH]` |
| 3 | Funcional | Criar solicitação de Férias sem `data_fim` explícito (payload real do frontend) | ❌→✅ Corrigido | 🔴 Crítico (bloqueava o caminho feliz) | `data_fim` passa a `required=False` no serializer + validação explícita movida para `validate()` |
| 4 | Segurança | Funcionario cria registro de pré-admissão via `POST /employees/pre-admissions/` | ❌→✅ Corrigido | 🟠 Alto | `PreAdmissionRHViewSet.get_permissions()` exige `IsAdminRH` em create/update/destroy |
| 5 | Config | `/api/docs/`, `/api/schema/`, `/api/redoc/` acessíveis em `DEMO_MODE` | ❌→✅ Corrigido | ⚪ Baixo | Gateados atrás de `not DEMO_MODE`, igual ao `/admin/` |
| 6 | Funcional | Férias: antecedência mínima respeitada | ✅ Passou | 🟠 | — |
| 7 | Funcional | Férias: `dias_gozo` obrigatório em férias | ✅ Passou | 🟠 | — |
| 8 | Funcional | Férias: abono pecuniário ≤ 10 dias | ✅ Passou | 🟠 | — |
| 9 | Funcional | Férias: gozo + abono ≤ 30 dias (30 exato aceito) | ✅ Passou | 🟠 | — |
| 10 | Funcional | Férias/licenças: data fim ≥ data início; data início não pode ser passado | ✅ Passou | 🟠 | — |
| 11 | Funcional | Licença (não-férias) sem `data_fim` é rejeitada | ✅ Passou | 🟠 | — (só passou a existir depois da correção do #3; ver nota) |
| 12 | Roteamento | Funcionario não acessa `/staff/employees/` (list/retrieve) nem via IDOR | ✅ Passou | 🔴 | — |
| 13 | Roteamento | IDOR em `/leave-requests/requests/{id}` de outro usuário → 404 | ✅ Passou | 🔴 | — |
| 14 | Roteamento | IDOR em `/evaluations/evaluations/{id}` de outro usuário → 404 | ✅ Passou | 🔴 | — |
| 15 | Roteamento | Funcionario bloqueado em `/termination/requests/` (list) | ✅ Passou | 🔴 | — |
| 16 | Roteamento | Deep-link a rota protegida sem sessão → redireciona para `/login` | ✅ Passou | 🟠 | — |
| 17 | Roteamento | Rota desconhecida não derruba o app; `RoleBasedHome` manda cada papel pro lugar certo após login | ✅ Passou | 🟡 | Nota: sem página 404 dedicada, ver §5 |
| 18 | Segurança | Escalonamento: funcionario chamando `users/stats/`, `auth/register/`, `users/` (list/create) | ✅ Passou (403) | 🔴 | — |
| 19 | Segurança | Demo guard: `change_password` bloqueado em `DEMO_MODE` (via API) | ✅ Passou (403) | 🔴 | — |
| 20 | Segurança | Demo guard: `auth/register/` e `DELETE /users/{id}/` bloqueados em `DEMO_MODE`, mesmo para RH | ✅ Passou (403) | 🔴 | — |
| 21 | Segurança | `/admin/` → 404 em `DEMO_MODE` (local e produção) | ✅ Passou | 🔴 | — |
| 22 | Segurança | Sem token → 401; token adulterado/malformado → 401 | ✅ Passou | 🟠 | — |
| 23 | Segurança | Brute force no login: throttle 5/min e django-axes (5 tentativas, cooloff 1h) | ✅ Passou | 🟠 | — |
| 24 | Segurança | XSS armazenado: payload `<script>` em `motivo` é aceito pela API (esperado) mas nunca renderizado como HTML no frontend | ✅ Passou (auditoria de código) | 🟠 | — |
| 25 | Segurança | SQLi via `django-filter`/`search` (`' OR '1'='1`, `DROP TABLE`) | ✅ Passou | 🟠 | — |
| 26 | Config | `DEBUG=False` em produção; erro malformado não vaza traceback | ✅ Passou | 🔴 | — |
| 27 | Config | Headers de segurança presentes em produção (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, COOP) | ✅ Passou | 🟠 | — |
| 28 | Config | Login same-origin (rewrite da Vercel) sem erro de CORS | ✅ Passou | 🟠 | — |
| 29 | Config | Throttle anon/user ativo (`30/min`, `120/min`) além do login | ✅ Passou (revisão de config) | 🟠 | — |
| 30 | Funcional | Avaliações: nota fora de 0–10 rejeitada; cálculo da nota final é média ponderada correta | ✅ Passou | 🟡 | — |
| 31 | Funcional | Avaliações: só admin_rh cria/gerencia/finaliza (design do produto) | ✅ Passou | — | — |
| 32 | Funcional | Rescisões: transições de status guardadas (rascunho→pendente→aprovada→processando→concluída); não editável após concluída | ✅ Passou | 🟠 | — |
| 33 | Funcional | Admissão (autoatendimento): salvar parcial e retomar persiste corretamente | ✅ Passou | 🟡 | — |
| 34 | Funcional | Relatórios: export PDF limitado a 50 registros; CSV/Excel sem limite | ✅ Passou / ⚠️ nota | ⚪ | Ver §5 (não corrigido, dataset da demo é pequeno) |
| 35 | Dependências | `jsPDF` com CVEs críticas (path traversal, injeção de PDF/JS arbitrário); `xlsx` com CVE alta (prototype pollution, ReDoS) sem correção disponível | ⚠️ Documentado, não corrigido | 🟠 (jsPDF) / 🟡 (xlsx) | Ver §5 |
| 36 | Funcional | `LeaveRequestUpdateSerializer`: `data_inicio`/`data_fim` podem ser alterados via PATCH sem revalidar contra `dias_gozo`/abono já aprovados | ⚠️ Documentado, não corrigido | 🟡 Médio | Ver §5 |

---

## 2. Achados críticos e altos — detalhe e correção

### 2.1 🔴 Escalonamento de privilégio via auto-edição de `role`

**Como foi encontrado:** o endpoint `PATCH /api/v1/accounts/users/{id}/` usa
`CanUpdateOwnProfile | IsAdminRH` (qualquer usuário pode editar o próprio registro) e
`UserUpdateSerializer` incluía `role` como campo gravável sem nenhuma restrição adicional.

**Prova de conceito:**
```
POST /api/v1/accounts/auth/login/  { email: demo@portalrh.com.br, password: demo1234 }
→ role: "funcionario"

PATCH /api/v1/accounts/users/2/  { "role": "admin_rh" }
→ 200 { ..., "role": "admin_rh" }

GET /api/v1/accounts/users/stats/   (com o MESMO token, sem novo login)
→ 200 { total_users: 18, ... }   # endpoint IsAdminRH-only, agora acessível
```
Uma conta demo de funcionário virava admin_rh completo com uma única requisição.

**Correção:** `accounts/serializers.py`, `UserUpdateSerializer.validate_role()` — rejeita a
mudança de `role` quando quem faz a requisição não é `admin_rh` e o valor difere do atual.
Admins continuam podendo alterar o papel de qualquer usuário (inclusive o próprio, sem quebrar
PATCHes parciais que reenviam o valor atual).

**Re-teste:** `PATCH` do funcionário agora devolve `400 {"role": ["Você não tem permissão..."]}`;
`role` no banco permanece `funcionario`; RH continua conseguindo promover/rebaixar outros.
Coberto por `accounts/tests.py::UserRoleEscalationTestCase` (4 casos).

### 2.2 🔴 Vazamento de PII/folha de pagamento via Relatórios

**Como foi encontrado:** `reports/views.py`, `DashboardViewSet` (a tela "Relatórios", que no
frontend é `adminOnly`) só exigia `IsAuthenticated`. Todas as ações (`employees_report`,
`leave_requests_report`, `terminations_report`, `evaluations_report`, `admissions_report`,
`export_report`) ficavam abertas a qualquer conta logada.

**Prova de conceito:** com o token do funcionário demo,
`GET /api/v1/reports/dashboard/employees_report/?format=json` devolvia `200` com nome completo,
e-mail, telefone, cargo, departamento **e salário** dos 18 funcionários da empresa — dado que a
própria UI nunca mostra para um funcionario (o item de menu "Relatórios" é `adminOnly`).

**Correção:** `reports/views.py` — `DashboardViewSet.permission_classes = [IsAdminRH]`.

**Re-teste:** funcionario agora recebe `403`; RH continua recebendo `200` com os dados completos.
Coberto por `reports/tests.py::DashboardReportPermissionTestCase` (3 casos, incluindo anônimo →
401).

*Nota de escopo:* os demais viewsets do app `reports` (`ReportTemplate`, `ReportExecution`,
`ReportSchedule`, `ReportBookmark`, `ReportCategory`) não são usados pela tela real de
Relatórios (o frontend só chama `DashboardViewSet`) e parecem scaffolding de uma iteração
anterior — inclusive com um bug pré-existente não relacionado a segurança
(`ReportCategoryViewSet.get_queryset` compara `user.role` com `"admin"/"rh"`, valores que não
existem no sistema de papéis atual, que é `admin_rh`/`funcionario`). Não removidos nem corrigidos
nesta passada por estarem fora do fluxo real da aplicação; registrado aqui para uma limpeza
futura.

### 2.3 🔴 Criação de Férias quebrada no caminho feliz

**Como foi encontrado:** ao tentar reproduzir pela API exatamente o payload que o frontend real
envia para uma solicitação de férias (`{tipo, data_inicio, dias_gozo, tem_abono_pecuniario,
dias_abono_pecuniario, motivo}`, **sem** `data_fim` — que deveria ser calculado automaticamente a
partir de `dias_gozo`), a API respondia `400 {"data_fim": ["Este campo é obrigatório."]}` antes
mesmo de `LeaveRequestCreateSerializer.validate()` rodar. `data_fim` é um `DateField` obrigatório
no modelo, e o `ModelSerializer` gera o campo como obrigatório por padrão — o que faz o
DRF rejeitar a requisição na validação de campo, sem chegar na lógica de negócio (que já existia
e estava correta) que calcularia `data_fim` a partir de `dias_gozo`.

**Impacto:** toda solicitação de férias feita pela tela real do sistema falhava com um erro que o
usuário não tem como resolver (o campo que "falta" nem aparece no formulário de férias). O
fluxo mais citado no pedido de QA ("Férias: solicitar, aprovar, rejeitar") estava com o
"solicitar" completamente quebrado para o tipo férias.

**Correção:** `leave_requests/serializers.py`:
- `data_fim` sobrescrito como `serializers.DateField(required=False)` no
  `LeaveRequestCreateSerializer`.
- `validate()` passou a exigir `data_fim` explicitamente para tipos que **não** são férias (que
  não têm cálculo automático), com mensagem clara.
- A checagem de "data de início no passado" foi tirada de dentro do `if data_fim` (antes, se
  `data_fim` estivesse ausente por qualquer motivo, essa checagem também era pulada
  silenciosamente).

**Re-teste:** solicitação de férias sem `data_fim` explícito agora retorna `201` com `data_fim`
calculado corretamente (`data_inicio + dias_gozo - 1`); as 4 regras CLT (antecedência,
`dias_gozo` obrigatório, abono ≤ 10, total ≤ 30) continuam bloqueando cada tentativa de burlar;
tipo não-férias sem `data_fim` agora recebe erro claro em vez de passar batido. Coberto por
`leave_requests/tests.py::LeaveRequestCreateAPIValidationTestCase` (9 casos).

### 2.4 🟠 Criação não autorizada de pré-admissões

**Como foi encontrado:** `employees/views.py`, `PreAdmissionRHViewSet` só declarava
`permission_classes = [permissions.IsAuthenticated]`; o bloqueio a não-admins vinha inteiramente
de `get_queryset()` devolver `.none()` — mas a ação `create` nunca passa por `get_queryset()`.

**Prova de conceito:** com o token do funcionário demo,
`POST /api/v1/employees/pre-admissions/` com um payload completo (candidato fictício, cargo
"CEO", salário arbitrário) devolvia `201 Created`.

**Correção:** `employees/views.py` — `PreAdmissionRHViewSet.get_permissions()` passa a exigir
`IsAdminRH` para `create`/`update`/`partial_update`/`destroy`, mantendo leitura sob
`IsAuthenticated` + o `get_queryset()` já existente (que devolve lista vazia, não 403, para
não-admins — comportamento preservado).

**Re-teste:** funcionario agora recebe `403` e nenhum registro é criado; RH continua criando
normalmente. Coberto por `employees/tests.py::PreAdmissionRHAuthorizationTestCase` (3 casos).

### 2.5 ⚪ Schema/docs da API expostos em produção

`api/schema/`, `api/docs/` (Swagger) e `api/redoc/` respondiam `200` publicamente mesmo com
`DEMO_MODE=True`, expondo a estrutura completa da API (todos os endpoints, campos, tipos) a
qualquer visitante. Item de severidade baixa no checklist ("fechado em produção ou aceito
conscientemente") — como o custo da correção é mínimo e reduz superfície de reconhecimento,
optei por corrigir: `app/urls.py` agora só registra essas três rotas quando `not DEMO_MODE`,
igual ao `/admin/`. Re-testado localmente (`DEMO_MODE=True` → 404 nas três) e recomendado
re-verificar em produção após o deploy desta branch.

---

## 3. Pentest — tentativas documentadas (o que NÃO deu certo, e por quê)

| Ataque tentado | Alvo | Resultado |
|---|---|---|
| Auto-promoção de `role` | `PATCH /accounts/users/{id}/` | **Encontrado e corrigido** (§2.1) |
| Acesso a relatório de folha de pagamento sem ser admin | `GET /reports/dashboard/employees_report/` | **Encontrado e corrigido** (§2.2) |
| Criação de pré-admissão sem ser admin | `POST /employees/pre-admissions/` | **Encontrado e corrigido** (§2.4) |
| `register/`, `users/` (create/list), `users/stats/` como funcionario | vários | Bloqueado, 403 (já correto) |
| IDOR trocando `id` em `staff/employees/{id}` | funcionario vendo dado de outro | Bloqueado, 403 (endpoint inteiro é admin_rh-only) |
| IDOR trocando `id` em `leave-requests/requests/{id}` | funcionario vendo solicitação de outro | Bloqueado, 404 |
| IDOR trocando `id` em `evaluations/evaluations/{id}` | funcionario vendo avaliação de outro | Bloqueado, 404 |
| Trocar senha com `DEMO_MODE=True` (funcionario) | `POST /accounts/users/change_password/` | Bloqueado, 403 "desabilitada no ambiente de demonstração" |
| Criar/excluir usuário com `DEMO_MODE=True` (mesmo como RH) | `POST /accounts/auth/register/`, `DELETE /accounts/users/{id}/` | Bloqueado, 403 (demo guard vale até para admin) |
| Acessar `/admin/` | Django admin | 404 em `DEMO_MODE` (local e produção) |
| Requisição sem `Authorization` | qualquer endpoint autenticado | 401 |
| Token JWT com último caractere trocado (assinatura inválida) | qualquer endpoint autenticado | 401 |
| Token JWT arbitrário (`Bearer not-a-real-jwt`) | qualquer endpoint autenticado | 401 |
| 5+ tentativas de login com senha errada, mesmo usuário | `/accounts/auth/login/` | 4ª tentativa já sofre throttle (`429`, 5/min); django-axes registra as falhas reais (4 antes do throttle interceptar) e bloquearia na 5ª (`AXES_FAILURE_LIMIT=5`) |
| `<script>alert(document.cookie)</script>` em `motivo` de uma solicitação de férias | campo de texto livre | API aceita e armazena (esperado — sanitização é responsabilidade de renderização); auditoria de código confirma **zero** ocorrências de `dangerouslySetInnerHTML`/`innerHTML=` no frontend e **zero** `mark_safe`/`\|safe` no backend — não há caminho para o payload virar HTML executável |
| `' OR '1'='1` e `x'; DROP TABLE accounts_user;--` em parâmetros de busca/filtro (`django-filter`) | `staff/employees?search=`, `leave-requests?status=` | Tratado como string literal (0 resultados) ou rejeitado pela validação de choices; tabela `accounts_user` confirmada intacta depois. Único uso de SQL não-parametrizado no projeto (`reports/services.py`, `.extra()` com `DATE_FORMAT`) usa uma string estática, sem interpolação de entrada do usuário |
| Requisição malformada (`not-json-at-all{{{`) contra produção | ver se `DEBUG` vaza traceback | `400` com mensagem genérica de parse, sem stack trace — confirma `DEBUG=False` em produção |
| Editar rescisão com status `concluida` | `PATCH /termination/requests/{id}/` | Bloqueado, 400 "Esta solicitação não pode mais ser editada" (`can_be_edited` exclui `concluida`, `aprovada_rh`, `processando`) |

---

## 4. Configuração de produção — verificado ao vivo

- `DEBUG=False`: confirmado (sem traceback em erro malformado; `check --deploy` já validado no
  deploy original sem avisos de segurança).
- Headers em `https://portalrh-backend.vercel.app`: `Strict-Transport-Security`,
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`,
  `Cross-Origin-Opener-Policy` — todos presentes.
- `/admin/` → `404` (confirmado local e produção).
- `/api/docs/`, `/api/schema/` → estavam `200` em produção antes desta branch; corrigido (§2.5),
  requer novo deploy para valer em produção.
- CORS/same-origin: `https://portalrh-frontend.vercel.app/api/*` segue via rewrite da Vercel
  (same-origin do ponto de vista do browser), sem preflight CORS na demo pública — configuração
  herdada do trabalho de deploy anterior, re-verificada aqui.
- Throttle: `login: 5/min`, `token_refresh: 10/min`, `anon: 30/min`, `user: 120/min` —
  configurados em `app/settings.py`; `login` observado disparando na prática durante os testes.

---

## 5. Itens documentados e não corrigidos nesta passada (com justificativa)

1. **🟡 `LeaveRequestUpdateSerializer` permite `data_inicio`/`data_fim` divergirem de
   `dias_gozo`/abono após a criação.** `dias_gozo` e os campos de abono não fazem parte dos
   campos editáveis do update (só `data_inicio`, `data_fim`, `motivo`, `observacoes`,
   `prioridade`, `anexo`), então o total "oficial" gozo+abono não pode ser burlado — mas o
   intervalo de datas em si pode ser esticado via PATCH sem revalidar contra esses números,
   gerando um `dias_solicitados` (calculado de `data_fim - data_inicio`) inconsistente com o que
   foi aprovado. Só afeta solicitações **pendentes** do próprio usuário (edição já é bloqueada
   depois de aprovada/rejeitada) e não escala privilégio nem vaza dado de terceiro — por isso
   classificado médio, não alto. Recomendação: reaplicar a mesma validação de
   `LeaveRequestCreateSerializer` dentro de `LeaveRequestUpdateSerializer.validate()`.

2. **🟠/🟡 Dependências do frontend com CVEs conhecidas.** `npm audit`: `jsPDF` (crítico — path
   traversal, injeção de PDF com execução arbitrária de JS, DoS via BMP malformado) e `xlsx`
   (alto — prototype pollution, ReDoS; **sem correção disponível** no momento). Ambos usados só
   na exportação client-side de Relatórios, agora `admin_rh`-only (§2.2), o que reduz a
   exposição prática (não é uma superfície alcançável por um atacante não-autenticado ou por um
   funcionario comum). Não corrigido nesta passada: o fix do jsPDF é upgrade de major version
   (`npm audit fix --force` → `jspdf@4.2.1`, mudança potencialmente breaking na geração de PDF) e
   precisa de teste manual dos 3 formatos de export antes de entrar; o do xlsx não tem fix
   publicado. Recomendação: tratar como item da Fase 5 (pentest final) com uma janela dedicada
   para testar a geração de relatórios pós-upgrade.

3. **⚪ Export CSV/Excel de Relatórios sem limite de linhas** (o PDF já limita a 50 registros).
   Com o dataset de demo (16–18 funcionários) não há risco prático de DoS; documentado para o
   caso de o volume de dados crescer (streaming ou paginação do export seria a correção).

4. **⚪ Sem página 404 dedicada no frontend.** Rotas desconhecidas caem no catch-all
   `<Route path="*" element={<Navigate to="/admission" />} />`, que nunca quebra a aplicação mas
   também não comunica "página não encontrada" — redireciona silenciosamente. Comportamento
   aceitável (não é uma falha de segurança nem trava o app), mas uma melhoria de UX futura.

5. **`pip-audit` não pôde ser executado nesta sessão** (falha de conexão com o índice do PyPI no
   ambiente local). O `pyproject.toml` já documenta um achado anterior conhecido
   (`PYSEC-2026-3609`/`PYSEC-2026-3654` em `pymdown-extensions`, usado só para build de docs,
   nunca instalado/alcançável na aplicação em produção). Recomenda-se rodar `pip-audit`
   novamente a partir do workflow de CI (`.github/workflows/`), que tem acesso de rede
   consistente.

---

## 6. Automação adicionada (commitada nesta branch)

- `app/tests.py` (novo) — `_is_blocked()` do demo guard (9 casos), `DemoModeMiddleware`
  instanciado diretamente (2 casos), `reset_demo` (5 casos: 404 fora do modo demo, 401 sem
  token/token errado/token vazio no servidor, 405 em GET).
- `accounts/tests.py` — `UserRoleEscalationTestCase` (4 casos, §2.1), `JWTAuthTestCase` (3 casos:
  sem token, token adulterado, token malformado).
- `leave_requests/tests.py` — `LeaveRequestCreateAPIValidationTestCase` (9 casos cobrindo as 4
  regras CLT + o bug do §2.3, incluindo o caminho feliz exato que o frontend usa).
- `reports/tests.py` — `DashboardReportPermissionTestCase` (3 casos, §2.2).
- `employees/tests.py` — `PreAdmissionRHAuthorizationTestCase` (3 casos, §2.4).
- `frontend/tests/e2e/smoke.spec.ts` (novo, Playwright) — login RH e Funcionário reaproveitando
  sessão (evita estourar o throttle de login rodando a suíte inteira), abre todas as telas de
  cada papel, falha se o console do navegador registrar qualquer erro; confirma que itens
  adminOnly não aparecem na sidebar do funcionario; confirma redirect para `/login` em deep-link
  sem sessão; confirma que rota desconhecida não quebra o app.
- `frontend/playwright.config.ts` (novo) + script `npm run test:e2e`.
- `frontend/vite.config.ts` — `test.exclude` para o Vitest não tentar rodar os specs do
  Playwright (que usam um runner incompatível).

**Resultado final da suíte:**
- Backend: `python manage.py test accounts leave_requests reports employees app evaluations
  termination staff` → **120/120 passando**.
- Frontend: `npm run type-check` limpo, `npm run lint` limpo (0 erros, warnings pré-existentes
  inalterados), `npm test` (Vitest) 1/1 passando, `npm run build` limpo, `npm run test:e2e`
  (Playwright) **5/5 passando**.

---

## 7. Sign-off

- [x] Todos os 🔴 e 🟠 encontrados foram corrigidos e re-testados (itens 1–4 da matriz).
- [x] `QA_REPORT.md` atualizado nesta data com o que passou/falhou e as correções aplicadas.
- [ ] Itens pendentes de decisão do Gabriel antes do próximo deploy: upgrade de `jsPDF`/`xlsx`
      (item 5.2) e reaplicar a validação de update em férias (item 5.1) — nenhum dos dois é
      bloqueante para publicar, ambos ficam registrados para a Fase 5.
