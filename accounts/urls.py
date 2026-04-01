from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import (
    UserViewSet, CustomTokenObtainPairView, RegisterView, 
    first_login_password_change, check_password_change_required
)


router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/first-login-password-change/', first_login_password_change, name='first_login_password_change'),
    path('auth/check-password-change-required/', check_password_change_required, name='check_password_change_required'),

    # User management endpoints
    path('', include(router.urls)),
]
