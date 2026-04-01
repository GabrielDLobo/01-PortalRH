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
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API Endpoints - All under /api/v1/ for consistency
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/employees/', include('employees.urls')),
    path('api/v1/leave-requests/', include('leave_requests.urls')),
    path('api/v1/evaluations/', include('evaluations.urls')),
    path('api/v1/reports/', include('reports.urls')),
    path('api/v1/termination/', include('termination.urls')),
    path('api/v1/staff/', include('staff.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
