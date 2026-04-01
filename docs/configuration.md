# Project Configuration

This guide covers all configuration options for PortalRH, including environment variables, Django settings, and application-specific configurations.

---

## 📁 Environment Variables

All environment variables are managed through the `.env` file. Copy `.env.example` to `.env` and configure as needed.

### Core Settings

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `SECRET_KEY` | string | ✅ Yes | - | Django secret key for cryptographic signing |
| `DEBUG` | boolean | ✅ Yes | `False` | Enable debug mode (never use in production) |
| `ALLOWED_HOSTS` | string | ✅ Yes | `localhost` | Comma-separated list of allowed hosts |

### Database Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `DATABASE_URL` | string | ✅ Yes | - | Database connection URL |

**Examples:**
```env
# SQLite (Development)
DATABASE_URL=sqlite:///db.sqlite3

# PostgreSQL (Production)
DATABASE_URL=postgres://user:password@localhost:5432/portalrh

# PostgreSQL with custom port
DATABASE_URL=postgres://user:password@localhost:5433/portalrh
```

### CORS Settings

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `CORS_ALLOWED_ORIGINS` | string | ⚠️ Recommended | - | Comma-separated list of allowed origins |
| `CORS_ALLOW_CREDENTIALS` | boolean | ⚠️ Recommended | `True` | Allow credentials in CORS requests |

**Example:**
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
CORS_ALLOW_CREDENTIALS=True
```

### JWT Settings

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `JWT_ACCESS_TOKEN_LIFETIME` | integer | No | `60` | Access token lifetime in minutes |
| `JWT_REFRESH_TOKEN_LIFETIME` | integer | No | `10080` | Refresh token lifetime in minutes (7 days) |

### Email Configuration (Optional)

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `EMAIL_BACKEND` | string | No | Console | Email backend |
| `EMAIL_HOST` | string | ⚠️ For email | - | SMTP host |
| `EMAIL_PORT` | integer | ⚠️ For email | `587` | SMTP port |
| `EMAIL_HOST_USER` | string | ⚠️ For email | - | SMTP username |
| `EMAIL_HOST_PASSWORD` | string | ⚠️ For email | - | SMTP password |
| `EMAIL_USE_TLS` | boolean | No | `True` | Enable TLS |

**Example (Gmail):**
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True
```

### Cache Settings

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `REDIS_URL` | string | No | `redis://localhost:6379/0` | Redis connection URL |
| `CELERY_BROKER_URL` | string | No | Same as REDIS_URL | Celery message broker |
| `CELERY_RESULT_BACKEND` | string | No | Same as REDIS_URL | Celery result backend |

### Cache Configuration (in settings)

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'portalrh-cache',
        'TIMEOUT': 300,  # 5 minutes default
    }
}

CACHE_TIMEOUTS = {
    'reports': 300,      # 5 minutes
    'dashboard': 300,    # 5 minutes
    'user_data': 900,    # 15 minutes
    'static_data': 3600, # 1 hour
}
```

---

## ⚙️ Django Settings Overview

### Installed Applications

The project includes the following Django apps:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    
    # Local apps
    'accounts',
    'staff',
    'employees',
    'leave_requests',
    'evaluations',
    'termination',
    'reports',
]
```

### REST Framework Configuration

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}
```

### Password Validators

```python
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 
     'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
```

### Internationalization

```python
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True
```

### Static Files

```python
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]
```

---

## 🔐 Security Configuration

### Production Security Settings

These settings are automatically applied when `DEBUG=False`:

```python
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_SECONDS = 31536000
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
```

### CORS Configuration

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'authorization',
    'content-type',
    'origin',
    'x-csrftoken',
    'x-requested-with',
    'cache-control',
    'x-file-name',
    'x-file-size',
]
```

---

## 📊 Application-Specific Settings

### Employees App

```python
# Document upload settings
EMPLOYEE_DOCUMENT_MAX_SIZE = 10 * 1024 * 1024  # 10MB
EMPLOYEE_DOCUMENT_ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png']

# Required documents for admission
REQUIRED_DOCUMENTS = [
    'rg',
    'cpf',
    'birth_certificate',
    'residence_proof',
    'photo',
]
```

### Evaluations App

```python
# Evaluation settings
EVALUATION_SCORE_MIN = 0
EVALUATION_SCORE_MAX = 10
EVALUATION_WEIGHT_MIN = 0.01
EVALUATION_WEIGHT_MAX = 10.00
```

### Leave Requests App

```python
# Leave settings
LEAVE_REQUEST_MAX_DAYS_PER_YEAR = 30
LEAVE_REQUEST_ADVANCE_NOTICE_DAYS = 30
```

### Reports App

```python
# Report settings
REPORT_CACHE_DEFAULT_DURATION = 3600  # 1 hour
REPORT_MAX_EXPORT_ROWS = 10000
```

---

## 🔄 Hot Configuration

Some settings can be changed without restarting the server:

1. **Admin Panel Settings**: Managed through Django admin
2. **Report Templates**: Managed through API
3. **Evaluation Templates**: Managed through API
4. **Leave Types**: Managed through API

---

## 📝 Configuration Best Practices

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use strong SECRET_KEY** - Generate with:
   ```python
   from django.core.management.utils import get_random_secret_key
   print(get_random_secret_key())
   ```
3. **Different settings per environment** - Use separate `.env` files
4. **Validate configuration on startup** - Add checks in `manage.py`
5. **Document custom settings** - Update this file for project-specific configs

---

**Next:** [Guidelines & Standards](guidelines.md)
