"""
URL configuration for PortalRH project.

All API endpoints follow the v1 versioning pattern:
    - /api/v1/accounts/ - User management
    - /api/v1/employees/ - Employee management
    - /api/v1/leave-requests/ - Leave request management
    - /api/v1/evaluations/ - Performance evaluations
    - /api/v1/reports/ - Report generation
    - /api/v1/termination/ - Employee termination
    - /api/v1/staff/ - Staff member management
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from app.demo_mode import reset_demo

urlpatterns = [
    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    # API Endpoints - All under /api/v1/ for consistency
    path("api/v1/accounts/", include("accounts.urls")),
    path("api/v1/employees/", include("employees.urls")),
    path("api/v1/leave-requests/", include("leave_requests.urls")),
    path("api/v1/evaluations/", include("evaluations.urls")),
    path("api/v1/reports/", include("reports.urls")),
    path("api/v1/termination/", include("termination.urls")),
    path("api/v1/staff/", include("staff.urls")),
    # Reset da demo (agendado por cron externo) — só responde com DEMO_MODE=True
    path("internal/reset-demo/", reset_demo, name="reset-demo"),
]

# Admin só fica disponível fora do modo demo.
if not settings.DEMO_MODE:
    urlpatterns = [path("admin/", admin.site.urls)] + urlpatterns

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
