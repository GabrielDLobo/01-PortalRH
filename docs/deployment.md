# Deployment Guide

This guide covers deployment strategies, configurations, and best practices for deploying PortalRH to production.

---

## 📋 Table of Contents

- [Deployment Overview](#deployment-overview)
- [Production Requirements](#production-requirements)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Platform Deployment](#cloud-platform-deployment)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)

---

## 🎯 Deployment Overview

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Users       │────▶│     Nginx       │────▶│   Gunicorn      │
│   (Browser)     │◀────│  (Reverse Proxy)│◀────│  (App Server)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                       │
                                                       ▼
                                                ┌─────────────────┐
                                                │    Django       │
                                                │    Backend      │
                                                └─────────────────┘
                                                       │
                                                       ▼
                                                ┌─────────────────┐
                                                │   PostgreSQL    │
                                                │   Database      │
                                                └─────────────────┘
```

### Deployment Checklist

- [ ] Production environment configured
- [ ] Database set up and migrated
- [ ] Static files collected
- [ ] Media storage configured
- [ ] SSL certificates installed
- [ ] Environment variables secured
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Security hardening applied

---

## 🖥️ Production Requirements

### Server Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 4 GB | 8+ GB |
| **Storage** | 20 GB | 100+ GB SSD |
| **Network** | 100 Mbps | 1 Gbps |

### Software Requirements

- **OS:** Ubuntu 22.04 LTS / Debian 11+
- **Python:** 3.10+
- **Node.js:** 18+ (for building frontend)
- **PostgreSQL:** 15+
- **Nginx:** 1.20+
- **Redis:** 6+ (optional, for caching)

---

## ⚙️ Environment Configuration

### Production .env

```env
# ============================================================================
# DJANGO SETTINGS
# ============================================================================
SECRET_KEY=your-super-secure-50-character-production-secret-key-here
DEBUG=False
ALLOWED_HOSTS=portalrh.example.com,www.portalrh.example.com,.example.com

# ============================================================================
# DATABASE SETTINGS
# ============================================================================
POSTGRES_DB=portalrh
POSTGRES_USER=portalrh_user
POSTGRES_PASSWORD=very-secure-production-password-change-this
DATABASE_URL=postgres://portalrh_user:very-secure-production-password-change-this@localhost:5432/portalrh

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
# EMAIL CONFIGURATION
# ============================================================================
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@portalrh.example.com

# ============================================================================
# SECURITY SETTINGS
# ============================================================================
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### Security Checklist

```python
# app/settings.py production settings

DEBUG = False

# Security settings
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True

SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Allowed hosts
ALLOWED_HOSTS = config('ALLOWED_HOSTS').split(',')
```

---

## 🗄️ Database Setup

### PostgreSQL Installation

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql-15 postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Database Creation

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE portalrh;
CREATE USER portalrh_user WITH PASSWORD 'secure-password';
ALTER ROLE portalrh_user SET client_encoding TO 'utf8';
ALTER ROLE portalrh_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE portalrh_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE portalrh TO portalrh_user;
\q

# Grant schema permissions
sudo -u postgres psql -d portalrh -c "GRANT ALL ON SCHEMA public TO portalrh_user;"
```

### Database Optimization

```sql
-- Enable connection pooling
ALTER SYSTEM SET max_connections = 200;

-- Configure shared buffers
ALTER SYSTEM SET shared_buffers = '256MB';

-- Enable query logging (for debugging)
ALTER SYSTEM SET log_statement = 'all';

-- Reload configuration
SELECT pg_reload_conf();
```

---

## 🐍 Backend Deployment

### 1. Clone Repository

```bash
cd /var/www
git clone https://github.com/GabrielDLobo/01-PortalRH.git portalrh
cd portalrh
```

### 2. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn
```

### 4. Configure Environment

```bash
cp .env.example .env
nano .env  # Edit with production values
```

### 5. Run Migrations

```bash
python manage.py migrate
```

### 6. Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### 7. Create Superuser

```bash
python manage.py createsuperuser
```

### 8. Create Gunicorn Service

**/etc/systemd/system/portalrh.service:**

```ini
[Unit]
Description=PortalRH Gunicorn daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/portalrh
ExecStart=/var/www/portalrh/venv/bin/gunicorn \
    --access-logfile - \
    --workers 3 \
    --bind unix:/var/www/portalrh/portalrh.sock \
    app.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# Start and enable service
sudo systemctl start portalrh
sudo systemctl enable portalrh
sudo systemctl status portalrh
```

---

## 🌐 Frontend Deployment

### Option 1: Build and Serve with Nginx

**1. Build Frontend:**

```bash
cd /var/www/portalrh/frontend

# Install dependencies
npm install

# Set production environment
export REACT_APP_API_URL=https://portalrh.example.com/api/v1

# Build
npm run build
```

**2. Configure Nginx:**

**/etc/nginx/sites-available/portalrh:**

```nginx
server {
    listen 80;
    server_name portalrh.example.com www.portalrh.example.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name portalrh.example.com www.portalrh.example.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/portalrh.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portalrh.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Frontend
    root /var/www/portalrh/frontend/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API proxy
    location /api/ {
        proxy_pass http://unix:/var/www/portalrh/portalrh.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location /static/ {
        alias /var/www/portalrh/staticfiles/;
    }
    
    # Media files
    location /media/ {
        alias /var/www/portalrh/media/;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/portalrh /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🐳 Docker Deployment

### docker-compose.yml (Production)

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    container_name: portalrh_db
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - portalrh_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: portalrh_backend
    environment:
      - DEBUG=${DEBUG}
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
    volumes:
      - media_files:/app/media
      - static_files:/app/static
    depends_on:
      db:
        condition: service_healthy
    networks:
      - portalrh_network
    restart: unless-stopped
    command: >
      sh -c "python manage.py migrate &&
             python manage.py collectstatic --noinput &&
             gunicorn app.wsgi:application --bind 0.0.0.0:8000 --workers 4"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: portalrh_frontend
    environment:
      - REACT_APP_API_URL=${REACT_APP_API_URL}
    depends_on:
      - backend
    networks:
      - portalrh_network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: portalrh_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - static_files:/var/www/static
      - media_files:/var/www/media
    depends_on:
      - backend
      - frontend
    networks:
      - portalrh_network
    restart: unless-stopped

volumes:
  postgres_data:
  media_files:
  static_files:

networks:
  portalrh_network:
    driver: bridge
```

### Docker Deployment Commands

```bash
# Build images
docker compose build

# Start services
docker compose up -d

# View logs
docker compose logs -f

# Run migrations
docker compose exec backend python manage.py migrate

# Create superuser
docker compose exec backend python manage.py createsuperuser

# Stop services
docker compose down

# Update deployment
git pull
docker compose build
docker compose up -d
```

---

## ☁️ Cloud Platform Deployment

### Vercel (Frontend)

**vercel.json:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-url.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://your-backend-url.com/api/v1"
  }
}
```

```bash
# Deploy to Vercel
cd frontend
vercel --prod
```

### Render (Backend)

**render.yaml:**

```yaml
services:
  - type: web
    name: portalrh-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app.wsgi:application --bind 0.0.0.0:$PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: SECRET_KEY
        generateValue: true
      - key: DATABASE_URL
        fromDatabase:
          name: portalrh-db
          property: connectionString
    
  - type: worker
    name: portalrh-worker
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python manage.py runworker
    envVars:
      - key: SECRET_KEY
        inherit: true
      - key: DATABASE_URL
        fromDatabase:
          name: portalrh-db
          property: connectionString

databases:
  - name: portalrh-db
    databaseName: portalrh
    user: portalrh_user
```

### AWS Deployment

**Elastic Beanstalk (.ebextensions/django.config):**

```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    DJANGO_SETTINGS_MODULE: app.settings
    SECRET_KEY: your-secret-key
  aws:elasticbeanstalk:container:python:
    WSGIPath: app.wsgi:application
  aws:elasticbeanstalk:application:environment:
    DATABASE_URL: your-database-url
```

---

## 📊 Monitoring and Logging

### Django Logging Configuration

```python
# app/settings.py

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
            'filename': '/var/log/portalrh/django.log',
            'formatter': 'verbose',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'portalrh': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
```

### Monitoring Tools

**Sentry Integration:**

```bash
pip install sentry-sdk
```

```python
# app/settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=config('SENTRY_DSN'),
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
    send_default_pii=True,
)
```

**Health Check Endpoint:**

```python
# app/views.py
from django.http import JsonResponse
from django.db import connection

def health_check(request):
    try:
        connection.ensure_connection()
        db_status = 'healthy'
    except Exception:
        db_status = 'unhealthy'
    
    return JsonResponse({
        'status': 'healthy' if db_status == 'healthy' else 'unhealthy',
        'database': db_status,
        'timestamp': timezone.now().isoformat(),
    })
```

---

## 💾 Backup and Recovery

### Database Backup Script

**/usr/local/bin/backup-portalrh.sh:**

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/portalrh"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="portalrh"
DB_USER="portalrh_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup media files
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /var/www/portalrh/media/

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Cron Job Setup

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-portalrh.sh >> /var/log/portalrh-backup.log 2>&1
```

### Restore Database

```bash
# Restore from backup
gunzip < db_20240101_020000.sql.gz | psql -U portalrh_user portalrh

# Restore media files
tar -xzf media_20240101_020000.tar.gz -C /var/www/portalrh/
```

---

## 🔒 Security Hardening

### Firewall Configuration

```bash
# Install UFW
sudo apt install ufw

# Configure firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Verify
sudo ufw status
```

### Fail2Ban Configuration

```bash
# Install Fail2Ban
sudo apt install fail2ban

# Create jail configuration
sudo nano /etc/fail2ban/jail.local
```

**/etc/fail2ban/jail.local:**

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true
```

```bash
# Restart Fail2Ban
sudo systemctl restart fail2ban
```

---

## ✅ Deployment Verification

### Post-Deployment Checklist

```bash
# 1. Check services
sudo systemctl status nginx
sudo systemctl status portalrh
sudo systemctl status postgresql

# 2. Test database connection
python manage.py dbshell

# 3. Test API endpoint
curl https://portalrh.example.com/api/v1/

# 4. Check static files
ls -la /var/www/portalrh/staticfiles/

# 5. Check logs
tail -f /var/log/portalrh/django.log
tail -f /var/log/nginx/error.log

# 6. Run health check
curl https://portalrh.example.com/health/
```

---

## 📚 Related Documentation

- [Configuration Guide](configuration.md) - Environment settings
- [Authentication](authentication.md) - Security configuration
- [Development Guide](development.md) - Development workflow

---

## 🆘 Troubleshooting

### Common Issues

**502 Bad Gateway:**

```bash
# Check Gunicorn is running
sudo systemctl status portalrh

# Check socket permissions
ls -la /var/www/portalrh/portalrh.sock
```

**Static files not loading:**

```bash
# Recollect static files
python manage.py collectstatic --clear --noinput

# Check Nginx configuration
sudo nginx -t
sudo systemctl reload nginx
```

**Database connection errors:**

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U portalrh_user -d portalrh
```

---

## 📖 Resources

- [Django Deployment](https://docs.djangoproject.com/en/stable/howto/deployment/)
- [Gunicorn Documentation](https://docs.gunicorn.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
