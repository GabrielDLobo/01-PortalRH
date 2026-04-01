# Authentication and Security

This document provides comprehensive information about authentication, authorization, and security measures in the Inventory Management System.

## Table of Contents

1. [Authentication Overview](#authentication-overview)
2. [JWT Authentication](#jwt-authentication)
3. [Session Authentication](#session-authentication)
4. [Authorization & Permissions](#authorization--permissions)
5. [Security Measures](#security-measures)
6. [Password Management](#password-management)
7. [API Security](#api-security)
8. [Security Best Practices](#security-best-practices)

---

## Authentication Overview

The system implements dual authentication mechanisms:

| Method | Use Case | Token Type | Duration |
|--------|----------|------------|----------|
| **JWT** | API access | Bearer token | 1 day (access), 7 days (refresh) |
| **Session** | Web interface | Session cookie | 2 weeks |

### Authentication Flow

```mermaid
graph TD
    A[User Login] --> B{Authentication Type}
    B -->|Web Interface| C[Session Auth]
    B -->|API Access| D[JWT Auth]
    
    C --> E[Django Session]
    E --> F[Session Cookie]
    F --> G[Authenticated Request]
    
    D --> H[JWT Token Pair]
    H --> I[Access Token]
    H --> J[Refresh Token]
    I --> K[API Request with Bearer]
    J --> L[Token Refresh]
```

---

## JWT Authentication

### Token Structure

JWT tokens consist of three parts:
- **Header**: Algorithm and token type
- **Payload**: User claims and expiration
- **Signature**: Verification signature

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzEwMzQ1NjAwLCJpYXQiOjE3MTAyNTkyMDAsImp0aSI6ImFiYzEyMyIsInVzZXJfaWQiOjF9.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Token Configuration

```python
# app/settings.py

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}
```

### Obtaining Tokens

**Request:**
```http
POST /api/v1/authentication/token/
Content-Type: application/json

{
  "username": "admin",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzEwMzQ1NjAwLCJpYXQiOjE3MTAyNTkyMDAsImp0aSI6ImFiYzEyMyIsInVzZXJfaWQiOjF9.abc123",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTcxMDg2MDQwMCwiaWF0IjoxNzEwMjU5MjAwLCJqdGkiOiJkZWY0NTYiLCJ1c2VyX2lkIjoxfQ.def456"
}
```

### Using JWT Tokens

Include the access token in the Authorization header:

```http
GET /api/v1/products/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Refreshing Tokens

When the access token expires, use the refresh token:

```http
POST /api/v1/authentication/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.new_access_token"
}
```

### Verifying Tokens

```http
POST /api/v1/authentication/token/verify/
Content-Type: application/json

{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
- `200 OK` - Token is valid
- `401 Unauthorized` - Token is invalid or expired

---

## Session Authentication

### Web Interface Authentication

For the Django web interface, session-based authentication is used.

### Login Process

```python
# authentication/views.py

from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, 'Invalid credentials')
    
    return render(request, 'registration/login.html')
```

### Session Configuration

```python
# app/settings.py

SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_NAME = 'sessionid'
SESSION_COOKIE_AGE = 1209600  # 2 weeks
SESSION_SAVE_EVERY_REQUEST = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = True  # In production (HTTPS)
```

### Protected Views

```python
from django.contrib.auth.mixins import LoginRequiredMixin

class ProductListView(LoginRequiredMixin, ListView):
    model = Product
    template_name = 'products/product_list.html'
    login_url = '/login/'
```

---

## Authorization & Permissions

### Permission Types

Django provides four default permissions per model:

| Permission | Codename | Description |
|------------|----------|-------------|
| **View** | `view_<model>` | Can view objects |
| **Add** | `add_<model>` | Can create objects |
| **Change** | `change_<model>` | Can edit objects |
| **Delete** | `delete_<model>` | Can delete objects |

### Model Permissions

```python
# Example permissions for Product model

'products.view_product'      # Can view product
'products.add_product'       # Can add product
'products.change_product'    # Can change product
'products.delete_product'    # Can delete product

'brands.view_brand'
'brands.add_brand'
'brands.change_brand'
'brands.delete_brand'

# Similar for: categories, suppliers, inflows, outflows
```

### Permission Classes

```python
# app/settings.py

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
        'rest_framework.permissions.DjangoModelPermissions',
    ),
}
```

### Custom Permission Classes

```python
from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit objects.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners to edit objects.
    """
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user
```

### Using Permissions in Views

```python
# Class-based views
from django.contrib.auth.mixins import PermissionRequiredMixin

class ProductCreateView(PermissionRequiredMixin, CreateView):
    model = Product
    fields = ['title', 'price', 'quantity']
    permission_required = 'products.add_product'

# Function-based views
from django.contrib.auth.decorators import permission_required

@permission_required('products.change_product')
def product_update(request, pk):
    # Update logic
    pass

# API Views
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions

class ProductAPIViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
```

### User Groups

Create groups with specific permissions:

```python
from django.contrib.auth.models import Group, Permission

# Create Manager group
manager_group = Group.objects.create(name='Manager')

# Add permissions
permissions = [
    'products.view_product',
    'products.add_product',
    'products.change_product',
    'inflows.view_inflow',
    'inflows.add_inflow',
    'outflows.view_outflow',
    'outflows.add_outflow',
]

for codename in permissions:
    permission = Permission.objects.get(codename=codename)
    manager_group.permissions.add(permission)

# Assign user to group
user.groups.add(manager_group)
```

---

## Security Measures

### CSRF Protection

```python
# Middleware is enabled by default
MIDDLEWARE = [
    'django.middleware.csrf.CsrfViewMiddleware',
    # ...
]

# In templates
<form method="post">
    {% csrf_token %}
    <!-- form fields -->
</form>

# In API
# JWT tokens handle CSRF protection for API requests
```

### Password Hashing

```python
# app/settings.py

PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]
```

### Security Middleware

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

### Production Security Settings

```python
# app/settings.py (Production)

DEBUG = False

# SSL/HTTPS
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Security headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# HSTS
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Allowed hosts
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
CSRF_TRUSTED_ORIGINS = ['https://yourdomain.com']
```

---

## Password Management

### Password Validation

```python
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
```

### Password Reset Flow

```python
from django.contrib.auth.views import (
    PasswordResetView,
    PasswordResetDoneView,
    PasswordResetConfirmView,
    PasswordResetCompleteView,
)

urlpatterns = [
    path('password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password-reset/done/', PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('password-reset-complete/', PasswordResetCompleteView.as_view(), name='password_reset_complete'),
]
```

---

## API Security

### Rate Limiting

```python
# Install django-ratelimit
pip install django-ratelimit

# Usage in views
from ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='10/m')
def login_view(request):
    # Login logic
    pass
```

### Input Validation

```python
from rest_framework import serializers
from django.core.validators import MinValueValidator, MaxValueValidator

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['title', 'cost_price', 'selling_price', 'quantity']
    
    title = serializers.CharField(
        min_length=3,
        max_length=500,
        required=True
    )
    
    cost_price = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    selling_price = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    quantity = serializers.IntegerField(
        validators=[MinValueValidator(0)]
    )
    
    def validate(self, data):
        if data['selling_price'] < data['cost_price']:
            raise serializers.ValidationError(
                "Selling price cannot be less than cost price"
            )
        return data
```

### SQL Injection Prevention

Always use Django ORM instead of raw SQL:

```python
# ✅ Safe - Using ORM
products = Product.objects.filter(title__icontains=search_term)

# ❌ Unsafe - Raw SQL (vulnerable)
products = Product.objects.raw(
    f"SELECT * FROM products WHERE title LIKE '%{search_term}%'"
)
```

### XSS Prevention

Django templates auto-escape by default:

```html
<!-- ✅ Safe - Auto-escaped -->
{{ user_input }}

<!-- ❌ Unsafe - Only use if absolutely necessary -->
{{ user_input|safe }}
```

---

## Security Best Practices

### Checklist

- [ ] Use HTTPS in production
- [ ] Keep Django and dependencies updated
- [ ] Use strong password policies
- [ ] Implement rate limiting
- [ ] Enable security middleware
- [ ] Use environment variables for secrets
- [ ] Implement proper logging
- [ ] Regular security audits
- [ ] Backup data regularly
- [ ] Monitor for suspicious activity

### Environment Variables

```bash
# .env file (never commit to Git)
SECRET_KEY=your-super-secret-key
DEBUG=False
DATABASE_URL=postgres://user:pass@host:5432/dbname
OPENAI_API_KEY=your-api-key
```

```python
# Load in settings.py
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
```

### Security Headers

```python
# Add security headers in production

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

# Content Security Policy (optional)
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'")
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")
```

### Logging Security Events

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'security_file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/security.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django.security': {
            'handlers': ['security_file'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}
```

---

## User Model

### Default Django User

The system uses Django's default User model:

```python
from django.contrib.auth.models import User

# User fields
user.username
user.email
user.first_name
user.last_name
user.is_staff      # Can access admin
user.is_superuser  # Has all permissions
user.is_active     # Account is active
user.date_joined
user.last_login
```

### Creating Users

```python
# Create regular user
user = User.objects.create_user(
    username='john',
    email='john@example.com',
    password='securepassword'
)

# Create superuser
admin = User.objects.create_superuser(
    username='admin',
    email='admin@example.com',
    password='adminpassword'
)
```

---

**Next Steps**: 
- [Development](development.md) - Development workflow
- [Testing](testing.md) - Testing strategies
