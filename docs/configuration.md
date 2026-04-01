# Configuration Guide

This guide covers all configuration options for PortalRH, including environment variables, Django settings, and frontend configuration.

---

## 📁 Environment Files

### Backend: `.env`

Located in the project root directory. Controls Django backend settings.

### Frontend: `.env`

Located in the `frontend/` directory. Controls React frontend settings.

---

## ⚙️ Backend Configuration (.env)

### Django Settings

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `SECRET_KEY` | Django secret key for cryptographic signing | Required | `django-insecure-...` |
| `DEBUG` | Enable debug mode (disable in production) | `True` | `True` or `False` |
| `ALLOWED_HOSTS` | Comma-separated list of allowed hosts | `localhost` | `localhost,127.0.0.1,example.com` |

### Database Settings

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `DATABASE_URL` | Database connection URL | SQLite | `postgres://user:pass@host:5432/db` |
| `POSTGRES_DB` | PostgreSQL database name | `portalrh` | `portalrh` |
| `POSTGRES_USER` | PostgreSQL username | `portalrh_user` | `portalrh_user` |
| `POSTGRES_PASSWORD` | PostgreSQL password | Required | `secure_password` |

### CORS Settings

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000` | `http://localhost:3000,https://app.example.com` |

### Email Settings (Optional)

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `EMAIL_BACKEND` | Email backend class | Console | `django.core.mail.backends.smtp.EmailBackend` |
| `EMAIL_HOST` | SMTP server host | - | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` | `587` |
| `EMAIL_USE_TLS` | Enable TLS | `True` | `True` or `False` |
| `EMAIL_HOST_USER` | SMTP username | - | `your-email@gmail.com` |
| `EMAIL_HOST_PASSWORD` | SMTP password/app password | - | `your-app-password` |
| `DEFAULT_FROM_EMAIL` | Default sender email | - | `noreply@example.com` |

### Frontend URL

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` | `https://portalrh.example.com` |

---

## 🎨 Frontend Configuration (frontend/.env)

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` | `https://api.example.com/api/v1` |
| `REACT_APP_ENV` | Environment name | `development` | `development`, `staging`, `production` |

---

## 📝 Example .env Files

### Development (.env)

```env
# ============================================================================
# DJANGO SETTINGS
# ============================================================================
SECRET_KEY=django-insecure-dev-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# ============================================================================
# DATABASE SETTINGS (SQLite for development)
# ============================================================================
DATABASE_URL=sqlite:///db.sqlite3

# ============================================================================
# CORS & SECURITY
# ============================================================================
CORS_ALLOWED_ORIGINS=http://localhost:3000

# ============================================================================
# FRONTEND
# ============================================================================
REACT_APP_API_URL=http://localhost:8000/api/v1
FRONTEND_URL=http://localhost:3000

# ============================================================================
# EMAIL CONFIGURATION (Console for development)
# ============================================================================
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=noreply@portalrh.local
```

### Production (.env.production)

```env
# ============================================================================
# DJANGO SETTINGS
# ============================================================================
SECRET_KEY=your-secure-production-secret-key-min-50-chars
DEBUG=False
ALLOWED_HOSTS=portalrh.example.com,www.portalrh.example.com

# ============================================================================
# DATABASE SETTINGS (PostgreSQL for production)
# ============================================================================
POSTGRES_DB=portalrh
POSTGRES_USER=portalrh_user
POSTGRES_PASSWORD=very-secure-production-password
DATABASE_URL=postgres://portalrh_user:very-secure-production-password@localhost:5432/portalrh

# ============================================================================
# CORS & SECURITY
# ============================================================================
CORS_ALLOWED_ORIGINS=https://portalrh.example.com

# ============================================================================
# FRONTEND
# ============================================================================
REACT_APP_API_URL=https://portalrh.example.com/api/v1
FRONTEND_URL=https://portalrh.example.com

# ============================================================================
# EMAIL CONFIGURATION (SMTP for production)
# ============================================================================
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@portalrh.example.com
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_ENV=development
```

---

## 🔐 Security Configuration

### Secret Key Generation

Generate a secure secret key:

```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

Or use Python directly:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Allowed Hosts

Configure for different environments:

**Development:**
```env
ALLOWED_HOSTS=localhost,127.0.0.1
```

**Production:**
```env
ALLOWED_HOSTS=portalrh.example.com,www.portalrh.example.com,.example.com
```

**Docker:**
```env
ALLOWED_HOSTS=localhost,127.0.0.1,backend,127.0.0.1:8000
```

---

## 🗄️ Database Configuration

### SQLite (Development)

```env
DATABASE_URL=sqlite:///db.sqlite3
```

### PostgreSQL (Production)

**Local PostgreSQL:**
```env
DATABASE_URL=postgres://portalrh_user:password@localhost:5432/portalrh
```

**Remote PostgreSQL:**
```env
DATABASE_URL=postgres://portalrh_user:password@db.example.com:5432/portalrh
```

**Docker PostgreSQL:**
```env
DATABASE_URL=postgres://portalrh_user:password@db:5432/portalrh
```

---

## 📧 Email Configuration

### Console Backend (Development)

Emails are printed to console:

```env
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

### SMTP Backend (Production)

**Gmail:**
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@portalrh.example.com
```

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

**Custom SMTP:**
```env
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@yourdomain.com
EMAIL_HOST_PASSWORD=your-password
```

---

## 🌐 CORS Configuration

### Development

```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Production

```env
CORS_ALLOWED_ORIGINS=https://portalrh.example.com,https://www.portalrh.example.com
```

### Allow Credentials

If you need to send cookies/credentials:

```python
# In app/settings.py
CORS_ALLOW_CREDENTIALS = True
```

---

## 📊 Django Settings Reference

### Key Settings in `app/settings.py`

```python
# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Debug mode
DEBUG = config('DEBUG', default=False, cast=bool)

# Allowed hosts
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split(',')

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

---

## 🔄 Environment-Specific Settings

### Development

- `DEBUG = True`
- SQLite database
- Console email backend
- Verbose error messages
- Development server

### Staging

- `DEBUG = False`
- PostgreSQL database
- SMTP email backend
- Production-like settings
- Gunicorn server

### Production

- `DEBUG = False`
- PostgreSQL with replication
- SMTP with queue
- Security hardening
- Gunicorn + Nginx

---

## 🐳 Docker Configuration

### docker-compose.yml Environment Variables

```yaml
services:
  backend:
    environment:
      - DEBUG=${DEBUG}
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
  
  frontend:
    environment:
      - REACT_APP_API_URL=${REACT_APP_API_URL}
```

---

## ✅ Configuration Verification

### Backend

```bash
# Check Django configuration
python manage.py check

# Verify database connection
python manage.py dbshell

# Test email configuration
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Test message', 'from@example.com', ['to@example.com'])
```

### Frontend

```bash
cd frontend

# Check environment variables
npm run build

# Start production build locally
npm run serve
```

---

## ⚠️ Common Configuration Issues

### SECRET_KEY Errors

**Issue:** `Invalid SECRET_KEY`
**Solution:** Generate a new key and update `.env`

### Database Connection Failed

**Issue:** Cannot connect to database
**Solution:** 
- Verify DATABASE_URL format
- Check PostgreSQL is running
- Confirm credentials

### CORS Errors

**Issue:** CORS policy blocking requests
**Solution:** 
- Add frontend URL to CORS_ALLOWED_ORIGINS
- Ensure no trailing slashes

### Email Not Sending

**Issue:** Emails not being sent
**Solution:**
- Check SMTP credentials
- Verify app password (for Gmail)
- Check firewall settings

---

## 📚 Related Documentation

- [Installation Guide](installation.md) - Initial setup
- [Development Guide](development.md) - Development workflow
- [Deployment Guide](deployment.md) - Production deployment

---

## 🆘 Getting Help

For configuration issues:

1. Check Django documentation: https://docs.djangoproject.com/
2. Review environment variable names carefully
3. Ensure no extra spaces in .env values
4. Check GitHub Issues for similar problems
