# PortalRH — Checklist de QA e Pentest

Referência fixa para validar o sistema antes de cada publicação. Marque cada item.
Teste contra a demo com `python manage.py seed_demo` populado. Contas:
`rh.demo@portalrh.com.br` (admin_rh) e `demo@portalrh.com.br` (funcionário), senha `demo1234`.
Severidade: 🔴 crítico · 🟠 alto · 🟡 médio · ⚪ baixo.

## 1. Preparação
- [ ] `seed_demo` rodado; dashboard mostra números coerentes.
- [ ] `python manage.py check --deploy` sem avisos críticos.
- [ ] Console do navegador sem erros em nenhuma tela.

## 2. Funcional (caminho feliz + borda, mensagens em pt-BR)
### Autenticação
- [ ] Login RH e Funcionário retornam 200 + JWT; redirecionam pro destino certo por papel.
- [ ] Credenciais erradas: mensagem clara, sem vazar se o e-mail existe.
- [ ] Logout limpa a sessão/token.

### Admissão (wizard)
- [ ] Validação por etapa; não avança com campo obrigatório vazio.
- [ ] Salvar e retomar mantém os dados.
- [ ] Conclusão cria o registro corretamente.

### Funcionários
- [ ] CRUD completo; busca e filtros; tela de detalhe carrega dados reais.
- [ ] Excluir/editar reflete na lista sem recarregar quebrado.

### Férias (regras CLT — validar no SERIALIZER, não só no clean())
- [ ] Solicitar, aprovar, rejeitar; status e aprovador corretos.
- [ ] 🟠 Antecedência mínima respeitada nas futuras.
- [ ] 🟠 `dias_gozo` obrigatório em férias; abono ≤ 10; gozo + abono ≤ 30.
- [ ] 🟠 Data fim ≥ data início; tentativa de burlar cada regra pela API é bloqueada.

### Avaliações
- [ ] Notas 0–10; cálculo da nota final ponderada correto.
- [ ] Transições de status coerentes; ciclo com participantes.

### Rescisões
- [ ] Transições de status válidas; não editar após concluída.
- [ ] Verbas/observações coerentes com o motivo.

### Relatórios
- [ ] Export PDF/Excel/CSV gera arquivo válido.
- [ ] ⚪ Export muito grande não derruba o servidor (limite/stream).

### Perfil
- [ ] Dados corretos; no modo demo, troca de senha e edição bloqueadas com aviso.

## 3. Roteamento e acesso por papel
- [ ] 🔴 Funcionário NÃO acessa rotas/endpoints de admin_rh (URL direta e API).
- [ ] 🔴 `get_queryset`: funcionário só vê os próprios dados.
- [ ] 🔴 IDOR: trocar id em `/employees/{id}`, `/leave-requests/{id}`, `/evaluations/{id}` não revela dados de terceiros.
- [ ] Deep-link a rota protegida sem login → redireciona pro login.
- [ ] 404 tratado; nenhum redirect pra página errada após login (RoleBasedHome).

## 4. Segurança / Pentest (documentar cada tentativa)
- [ ] 🔴 Escalonamento: demo/funcionário chamando endpoints `IsAdminRH` → 403.
- [ ] 🔴 Demo guard: troca de senha e gestão de usuários bloqueadas em `DEMO_MODE` (via API).
- [ ] 🔴 `/admin/` → 404 em `DEMO_MODE`.
- [ ] 🟠 Sem token → 401; token expirado/adulterado → 401.
- [ ] 🟠 Brute force no login dispara o django-axes (lockout).
- [ ] 🟠 XSS: campos de texto renderizados não executam script.
- [ ] 🟠 SQLi: filtros do django-filter não injetáveis.
- [ ] ⚪ `/api/docs/` fechado em produção ou aceito conscientemente.

## 5. Configuração de produção
- [ ] 🔴 `DEBUG=False`; `SECRET_KEY` forte só em env.
- [ ] 🟠 Headers de segurança (HSTS, nosniff, XFO) presentes.
- [ ] 🟠 Login same-origin (rewrite) funcionando; sem erro de CORS.
- [ ] 🟠 Throttle (anon/user + login) ativo.
- [ ] 🟡 Reset agendado ativo (senão dados de demo acumulam).

## 6. Automação (commitar os testes)
- [ ] Testes de permissão/IDOR por papel (Django TestCase/pytest).
- [ ] Testes das validações de férias/avaliações.
- [ ] Testes de auth (401 sem token, token inválido).
- [ ] Smoke E2E (Playwright): login RH e Funcionário, abre cada tela sem erro de console.
- [ ] `build`, `lint`, `type-check` e a suíte toda verdes.

## 7. Sign-off
- [ ] Todos os 🔴 e 🟠 corrigidos e re-testados.
- [ ] `QA_REPORT.md` do ciclo atualizado (data, o que passou/falhou, correções).
