"""
Testes do ciclo de QA/pentest (docs/QA_CHECKLIST.md) para o demo guard.

DemoModeMiddleware desliga a si mesmo via MiddlewareNotUsed quando
settings.DEMO_MODE é False NA INICIALIZAÇÃO do processo -- então
override_settings(DEMO_MODE=True) em um teste não reconstrói a pilha de
middleware do test client. Por isso testamos a função pura _is_blocked() e
instanciamos o middleware diretamente, em vez de depender do client padrão.
reset_demo já lê settings.DEMO_MODE em tempo de execução (dentro da view),
então esse pode ser testado normalmente com o test client + override_settings.
"""

from django.test import RequestFactory, TestCase, override_settings

from app.demo_mode import DemoModeMiddleware, _is_blocked


class DemoGuardLogicTestCase(TestCase):
    """_is_blocked(): quais requisições o guard deve recusar."""

    def setUp(self):
        self.factory = RequestFactory()

    def test_blocks_password_change(self):
        request = self.factory.post("/api/v1/accounts/users/change_password/")
        self.assertTrue(_is_blocked(request))

    def test_blocks_first_login_password_change(self):
        request = self.factory.post("/api/v1/accounts/auth/first-login-password-change/")
        self.assertTrue(_is_blocked(request))

    def test_blocks_user_create(self):
        request = self.factory.post("/api/v1/accounts/users/")
        self.assertTrue(_is_blocked(request))

    def test_blocks_user_delete(self):
        request = self.factory.delete("/api/v1/accounts/users/2/")
        self.assertTrue(_is_blocked(request))

    def test_blocks_user_update(self):
        request = self.factory.patch("/api/v1/accounts/users/2/")
        self.assertTrue(_is_blocked(request))

    def test_blocks_register(self):
        request = self.factory.post("/api/v1/accounts/auth/register/")
        self.assertTrue(_is_blocked(request))

    def test_allows_read_only_password_check(self):
        # GET não é bloqueado mesmo contendo "password" no caminho.
        request = self.factory.get("/api/v1/accounts/auth/check-password-change-required/")
        self.assertFalse(_is_blocked(request))

    def test_allows_normal_write_flows(self):
        # Criar uma solicitação de férias não deve ser afetado pelo guard.
        request = self.factory.post("/api/v1/leave-requests/requests/")
        self.assertFalse(_is_blocked(request))

    def test_allows_login(self):
        request = self.factory.post("/api/v1/accounts/auth/login/")
        self.assertFalse(_is_blocked(request))


class DemoModeMiddlewareTestCase(TestCase):
    """
    Instancia o middleware diretamente (bypassa o cache da pilha do Django).
    __init__ lê settings.DEMO_MODE e levanta MiddlewareNotUsed se for False,
    então o override precisa estar ativo no momento da construção.
    """

    def setUp(self):
        self.factory = RequestFactory()

    @override_settings(DEMO_MODE=True)
    def test_blocked_request_returns_403_with_friendly_message(self):
        middleware = DemoModeMiddleware(get_response=lambda r: None)
        request = self.factory.post("/api/v1/accounts/users/change_password/")
        response = middleware(request)
        self.assertEqual(response.status_code, 403)
        self.assertIn("desabilitada", response.content.decode())

    @override_settings(DEMO_MODE=True)
    def test_allowed_request_passes_through(self):
        sentinel = object()
        middleware = DemoModeMiddleware(get_response=lambda r: sentinel)
        request = self.factory.post("/api/v1/leave-requests/requests/")
        self.assertIs(middleware(request), sentinel)


class ResetDemoViewTestCase(TestCase):
    """POST /internal/reset-demo/ -- só existe e funciona com DEMO_MODE=True."""

    @override_settings(DEMO_MODE=False)
    def test_404_when_not_in_demo_mode(self):
        response = self.client.post("/internal/reset-demo/", secure=True)
        self.assertEqual(response.status_code, 404)

    @override_settings(DEMO_MODE=True, DEMO_RESET_TOKEN="test-token")
    def test_401_without_token(self):
        response = self.client.post("/internal/reset-demo/", secure=True)
        self.assertEqual(response.status_code, 401)

    @override_settings(DEMO_MODE=True, DEMO_RESET_TOKEN="test-token")
    def test_401_with_wrong_token(self):
        response = self.client.post(
            "/internal/reset-demo/", secure=True, HTTP_X_RESET_TOKEN="wrong-token"
        )
        self.assertEqual(response.status_code, 401)

    @override_settings(DEMO_MODE=True, DEMO_RESET_TOKEN="")
    def test_401_when_no_token_configured_server_side(self):
        # Fail-closed: sem DEMO_RESET_TOKEN configurado, nunca autoriza --
        # mesmo mandando uma string vazia como header.
        response = self.client.post("/internal/reset-demo/", secure=True, HTTP_X_RESET_TOKEN="")
        self.assertEqual(response.status_code, 401)

    @override_settings(DEMO_MODE=True)
    def test_405_for_get(self):
        response = self.client.get("/internal/reset-demo/", secure=True)
        self.assertEqual(response.status_code, 405)
