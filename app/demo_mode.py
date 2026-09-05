"""
app/demo_mode.py — camada de demonstração do PortalRH (Fase 1)

Contém:
  1) DemoModeMiddleware — o "demo guard": quando DEMO_MODE=True, bloqueia
     ações sensíveis (troca de senha, criação/edição/exclusão de usuários,
     registro) para QUALQUER requisição. É fail-closed de propósito: como a
     API usa JWT (resolvido pelo DRF dentro da view, não no middleware), não
     dá para confiar em request.user aqui, então bloqueamos o endpoint em si.
     Leitura e o fluxo normal (criar solicitação de férias, preencher
     avaliação, etc.) continuam liberados — a demo parece viva, mas ninguém
     sequestra conta nem derruba o sistema.

  2) reset_demo — endpoint POST /internal/reset-demo/ protegido por token,
     que recria os dados fictícios chamando o management command seed_demo.
     Só funciona com DEMO_MODE=True e com o header X-Reset-Token correto.
     Feito para ser chamado por um agendador (Vercel Cron / GitHub Actions).

Ver docs/redesign-brief.md e a auditoria para o contexto completo.
"""

from __future__ import annotations

import hmac
from io import StringIO

from django.conf import settings
from django.core.management import call_command
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

DEMO_BLOCK_MESSAGE = "Esta ação está desabilitada no ambiente de demonstração."

# Substrings de caminho que sempre indicam troca/reset de senha.
_PASSWORD_SUBSTRINGS = ("password", "senha")

# Endpoints de gestão de usuários (criar/editar/excluir/registrar).
_USER_MGMT_PREFIXES = (
    "/api/v1/accounts/users",
    "/api/v1/accounts/auth/register",
)

_UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


def _is_blocked(request: HttpRequest) -> bool:
    """Decide se a requisição deve ser bloqueada no modo demo.

    Só bloqueamos métodos de escrita — GETs de leitura ficam sempre liberados
    (inclusive checagens inofensivas como check-password-change-required).
    """
    method = request.method
    if method not in _UNSAFE_METHODS:
        return False

    path = request.path

    # 1) Troca/redefinição de senha (change_password, first-login-password-change).
    if any(sub in path for sub in _PASSWORD_SUBSTRINGS):
        return True

    # 2) Criação/edição/exclusão de usuários e registro.
    if any(path.startswith(p) for p in _USER_MGMT_PREFIXES):
        return True

    return False


class DemoModeMiddleware:
    """Bloqueia ações sensíveis quando settings.DEMO_MODE está ligado."""

    def __init__(self, get_response):
        self.get_response = get_response
        # Otimização do Django: se a feature está desligada, remove o middleware.
        if not getattr(settings, "DEMO_MODE", False):
            from django.core.exceptions import MiddlewareNotUsed

            raise MiddlewareNotUsed()

    def __call__(self, request: HttpRequest) -> HttpResponse:
        if _is_blocked(request):
            return JsonResponse({"detail": DEMO_BLOCK_MESSAGE}, status=403)
        return self.get_response(request)


@csrf_exempt
def reset_demo(request: HttpRequest) -> JsonResponse:
    """
    Recria os dados fictícios da demo. Protegido por token no header.

    Uso (chamado pelo agendador):
        POST /internal/reset-demo/
        Header: X-Reset-Token: <settings.DEMO_RESET_TOKEN>
    """
    # Só existe no ambiente de demo.
    if not getattr(settings, "DEMO_MODE", False):
        return JsonResponse({"detail": "Recurso indisponível."}, status=404)

    if request.method != "POST":
        return JsonResponse({"detail": "Método não permitido."}, status=405)

    expected = getattr(settings, "DEMO_RESET_TOKEN", "") or ""
    provided = request.headers.get("X-Reset-Token", "") or ""

    # Sem token configurado no servidor => recusa (fail-closed).
    if not expected or not hmac.compare_digest(provided, expected):
        return JsonResponse({"detail": "Não autorizado."}, status=401)

    out = StringIO()
    try:
        call_command("seed_demo", stdout=out)
    except Exception as exc:  # noqa: BLE001 - devolve erro controlado ao agendador
        return JsonResponse({"status": "error", "detail": str(exc)}, status=500)

    return JsonResponse({"status": "ok", "message": "Ambiente de demonstração reiniciado."})
