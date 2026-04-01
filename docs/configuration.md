# Configuration Guide

This guide covers all configuration options for the Inventory Management System.

## Table of Contents

1. [Django Settings](#django-settings)
2. [Database Configuration](#database-configuration)
3. [Authentication Settings](#authentication-settings)
4. [REST Framework Configuration](#rest-framework-configuration)
5. [OpenAI Configuration](#openai-configuration)
6. [Webhook Configuration](#webhook-configuration)
7. [Environment Variables](#environment-variables)
8. [Production Settings](#production-settings)

---

## Django Settings

### Location
`app/settings.py`

### Core Settings

```python
# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Security
SECRET_KEY = 'your-secret-key-here'  # Change in production!
DEBUG = False  # Set to False in production

# Allowed hosts (production)
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com', 'localhost']

# Application definition
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
    'widget_tweaks',
    # Local apps
    'ai',
    'app',
    'authentication',
    'brands',
    'categories',
    'inflows',
    'outflows',
    'products',
    'suppliers',
]
```

### Internationalization

```python
LANGUAGE_CODE = 'pt-BR'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = False  # Disabled for simplicity
```

### Static Files

```python
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',  # Additional static directories
]
```

### Media Files

```python
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

---

## Database Configuration

### Development (SQLite)

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Production (PostgreSQL)

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'sge',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'sge_db',
        'PORT': '5432',
    }
}
```

### Environment Variables for Database

```python
import os

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'sge'),
        'USER': os.environ.get('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'postgres'),
        'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}
```

---

## Authentication Settings

### Login Configuration

```python
LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = '/home'
LOGOUT_REDIRECT_URL = 'login'
```

### Password Validation

```python
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
```

---

## REST Framework Configuration

### Location
`app/settings.py`

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
        'rest_framework.permissions.DjangoModelPermissions',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
}
```

### JWT Settings

```python
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
}
```

---

## OpenAI Configuration

### Location
`ai/agent.py`

```python
OPENAI_MODEL = 'gpt-3.5-turbo'
OPENAI_API_KEY = 'your-api-key-here'
```

### Using Environment Variables

```python
import os

OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
OPENAI_MODEL = os.environ.get('OPENAI_MODEL', 'gpt-3.5-turbo')
```

### Configuration Options

| Parameter | Default | Description |
|-----------|---------|-------------|
| `OPENAI_API_KEY` | `''` | Your OpenAI API key |
| `OPENAI_MODEL` | `'gpt-3.5-turbo'` | Model to use |
| `OPENAI_MAX_TOKENS` | `1000` | Max tokens in response |
| `OPENAI_TEMPERATURE` | `0.7` | Creativity level (0-1) |

---

## Webhook Configuration

### Location
`services/notify.py`

```python
WEBHOOK_URL = 'http://localhost:8001/api/V1/webhooks/order/'
WEBHOOK_ENABLED = True
WEBHOOK_TIMEOUT = 5  # seconds
```

### Webhook Events

```python
# Events that trigger webhooks
WEBHOOK_EVENTS = {
    'outflow_created': True,
    'product_low_stock': True,
    'inflow_created': False,
}
```

---

## Environment Variables

### .env File Example

Create a `.env` file in the project root:

```bash
# Django Settings
DEBUG=True
SECRET_KEY=your-super-secret-key-change-in-production

# Database
POSTGRES_DB=sge
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure-password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# OpenAI
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo

# Webhooks
WEBHOOK_URL=http://localhost:8001/api/V1/webhooks/order/
WEBHOOK_ENABLED=False

# Email (if configured)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True

# Security
ALLOWED_HOSTS=localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=http://localhost:8000
```

### Loading Environment Variables

Install python-dotenv:

```bash
pip install python-dotenv
```

In `settings.py`:

```python
from dotenv import load_dotenv

load_dotenv()  # Load .env file

SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
```

---

## Production Settings

### Security Settings

```python
DEBUG = False

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# HSTS
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Allowed hosts
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
CSRF_TRUSTED_ORIGINS = ['https://yourdomain.com']
```

### Logging Configuration

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
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/app.log',
            'formatter': 'verbose',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['file', 'console'],
        'level': 'INFO',
    },
}
```

### Cache Configuration (Redis)

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

### Session Configuration

```python
SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'
SESSION_COOKIE_AGE = 1209600  # 2 weeks
SESSION_SAVE_EVERY_REQUEST = True
```

---

## Cron Jobs Configuration

### Location
`cron/`

The project includes scheduled tasks via cron.

### Example Cron Entry

```bash
# Run daily at 2 AM
0 2 * * * /path/to/python /path/to/manage.py custom_command
```

---

## Docker Configuration

### docker-compose.yml

```yaml
version: '3.8'

services:
  sge_web:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - sge_db
    environment:
      - DEBUG=False
      - POSTGRES_DB=sge
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_HOST=sge_db
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
  
  sge_db:
    image: postgres:15
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=sge
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres

volumes:
  postgres_data:
  static_volume:
```

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run migrations
RUN python manage.py migrate

# Expose port
EXPOSE 8000

# Start server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

---

## Configuration Checklist

Before deploying to production:

- [ ] Set `DEBUG = False`
- [ ] Change `SECRET_KEY` to a secure random value
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set up PostgreSQL database
- [ ] Configure environment variables
- [ ] Enable SSL/HTTPS
- [ ] Set up static file serving
- [ ] Configure logging
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerts

---

**Next Steps**: 
- [Guidelines](guidelines.md) - Coding standards
- [Project Structure](project-structure.md) - Understand the codebase
