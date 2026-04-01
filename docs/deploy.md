# Deployment Guide

This guide covers deployment strategies, configurations, and best practices for deploying the Inventory Management System to production.

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Docker Deployment](#docker-deployment)
4. [Traditional Deployment](#traditional-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Database Setup](#database-setup)
7. [Static Files](#static-files)
8. [Web Server Configuration](#web-server-configuration)
9. [SSL/HTTPS Setup](#sslhttps-setup)
10. [Monitoring & Logging](#monitoring--logging)
11. [Backup Strategy](#backup-strategy)
12. [Troubleshooting](#troubleshooting)

---

## Deployment Overview

### Deployment Options

| Method | Best For | Complexity | Cost |
|--------|----------|------------|------|
| **Docker** | Modern deployments, scalability | Medium | Low-Medium |
| **Traditional (Gunicorn + Nginx)** | Full control, VPS | High | Low |
| **Platform as a Service** | Quick deployment, small teams | Low | Medium-High |
| **Cloud (AWS, GCP, Azure)** | Enterprise, scalability | High | Variable |

### Architecture Overview

```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │     (CDN)       │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     Nginx       │
                    │  (Reverse Proxy)│
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────▼────────┐          ┌────────▼────────┐
     │    Gunicorn     │          │   Static Files  │
     │   (App Server)  │          │     (Nginx)     │
     └────────┬────────┘          └─────────────────┘
              │
     ┌────────▼────────┐
     │    Django App   │
     └────────┬────────┘
              │
     ┌────────▼────────┐
     │   PostgreSQL    │
     │    Database     │
     └─────────────────┘
```

---

## Pre-Deployment Checklist

### Security

- [ ] Set `DEBUG = False`
- [ ] Generate new `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Review security settings
- [ ] Remove debug statements
- [ ] Update admin URL (optional)

### Database

- [ ] Set up production database (PostgreSQL)
- [ ] Configure database credentials
- [ ] Run all migrations
- [ ] Create database backup
- [ ] Test database connection

### Static Files

- [ ] Run `collectstatic`
- [ ] Configure static file serving
- [ ] Set up CDN (optional)
- [ ] Test static file access

### Environment

- [ ] Set up environment variables
- [ ] Configure `.env` file (production)
- [ ] Set up secrets management
- [ ] Review all settings

### Monitoring

- [ ] Set up error tracking (Sentry)
- [ ] Configure logging
- [ ] Set up uptime monitoring
- [ ] Configure alerts

---

## Docker Deployment

### Production docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    command: gunicorn app.wsgi:application --bind 0.0.0.0:8000 --workers 4
    volumes:
      - static_volume:/app/staticfiles
    expose:
      - 8000
    env_file:
      - .env
    depends_on:
      - db
    restart: always
    networks:
      - app-network

  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    restart: always
    networks:
      - app-network

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - static_volume:/app/staticfiles
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
    restart: always
    networks:
      - app-network

volumes:
  postgres_data:
  static_volume:

networks:
  app-network:
    driver: bridge
```

### Production Dockerfile

```dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt
RUN pip install gunicorn

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run migrations
RUN python manage.py migrate

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/admin/')" || exit 1

# Start server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "app.wsgi:application"]
```

### Nginx Configuration

**nginx.conf**:

```nginx
upstream django {
    server web:8000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Static files
    location /static/ {
        alias /app/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Media files
    location /media/ {
        alias /app/media/;
        expires 7d;
    }
    
    # Django app
    location / {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

### Deploy with Docker

```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose logs -f

# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Collect static files
docker-compose exec web python manage.py collectstatic --noinput

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Update deployment
git pull
docker-compose down
docker-compose up -d --build
```

---

## Traditional Deployment

### Requirements Installation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install -y python3.11 python3.11-venv python3-pip
sudo apt install -y postgresql postgresql-contrib nginx
sudo apt install -y build-essential libpq-dev

# Create project directory
sudo mkdir -p /var/www/sge
sudo chown $USER:$USER /var/www/sge
cd /var/www/sge

# Clone repository
git clone <repository-url> .
```

### Virtual Environment

```bash
# Create virtual environment
python3.11 -m venv venv

# Activate
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn
```

### Environment Variables

```bash
# Create .env file
sudo nano /var/www/sge/.env
```

```bash
# .env content
DEBUG=False
SECRET_KEY=your-super-secret-key-change-this
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

POSTGRES_DB=sge
POSTGRES_USER=sge_user
POSTGRES_PASSWORD=secure-password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# OpenAI (optional)
OPENAI_API_KEY=your-api-key
```

### Gunicorn Service

**/etc/systemd/system/sge.service**:

```ini
[Unit]
Description=SGE Gunicorn daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/sge
ExecStart=/var/www/sge/venv/bin/gunicorn \
    --access-logfile - \
    --workers 4 \
    --bind unix:/var/www/sge/sge.sock \
    app.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# Start and enable service
sudo systemctl start sge
sudo systemctl enable sge
sudo systemctl status sge
```

### Nginx Configuration

**/etc/nginx/sites-available/sge**:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        alias /var/www/sge/staticfiles/;
    }
    
    location /media/ {
        alias /var/www/sge/media/;
    }
    
    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/sge/sge.sock;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/sge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Cloud Deployment

### AWS Deployment (Elastic Beanstalk)

**.ebextensions/django.config**:

```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    DJANGO_SETTINGS_MODULE: app.settings
    SECRET_KEY: your-secret-key
    DEBUG: false
  
  aws:elasticbeanstalk:container:python:
    wsgi_path: app.wsgi:application
    num_processes: 4
    num_threads: 20

files:
  "/opt/elasticbeanstalk/hooks/appdeploy/pre/01_migrate.sh":
    mode: "000755"
    owner: root
    group: root
    content: |
      #!/bin/bash
      cd /var/app/ondeck
      source /var/app/ondeck/venv/bin/activate
      python manage.py migrate --noinput
      
  "/opt/elasticbeanstalk/hooks/appdeploy/pre/02_collectstatic.sh":
    mode: "000755"
    owner: root
    group: root
    content: |
      #!/bin/bash
      cd /var/app/ondeck
      source /var/app/ondeck/venv/bin/activate
      python manage.py collectstatic --noinput
```

```bash
# Deploy to Elastic Beanstalk
pip install awsebcli
eb init
eb create production
eb deploy
```

### Heroku Deployment

**Procfile**:

```
web: gunicorn app.wsgi:application --log-file -
release: python manage.py migrate
```

**runtime.txt**:

```
python-3.11.0
```

**heroku.yml**:

```yaml
build:
  docker:
    web: Dockerfile
release:
  image: web
  command:
    - python manage.py migrate
```

```bash
# Deploy to Heroku
heroku login
heroku create your-app-name
heroku container:login
heroku container:push web
heroku container:release web
heroku open
```

---

## Database Setup

### PostgreSQL Configuration

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Access PostgreSQL
sudo -u postgres psql
```

```sql
-- Create database and user
CREATE DATABASE sge;
CREATE USER sge_user WITH PASSWORD 'secure-password';
ALTER ROLE sge_user SET client_encoding TO 'utf8';
ALTER ROLE sge_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE sge_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE sge TO sge_user;
\q
```

### Database Optimization

```python
# app/settings.py

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'sge',
        'USER': 'sge_user',
        'PASSWORD': 'secure-password',
        'HOST': 'localhost',
        'PORT': '5432',
        'CONN_MAX_AGE': 600,  # Persistent connections
        'OPTIONS': {
            'connect_timeout': 10,
        },
    }
}
```

---

## Static Files

### Collection

```bash
# Collect static files
python manage.py collectstatic --noinput

# Clear and recollect
python manage.py collectstatic --clear --noinput
```

### WhiteNoise (Alternative to CDN)

```bash
pip install whitenoise
```

```python
# app/settings.py

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add after SecurityMiddleware
    # ... other middleware
]

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

---

## SSL/HTTPS Setup

### Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run
```

### Manual SSL Certificate

```bash
# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Copy certificates
sudo cp fullchain.pem /etc/nginx/ssl/
sudo cp privkey.pem /etc/nginx/ssl/

# Set permissions
sudo chmod 600 /etc/nginx/ssl/*
```

---

## Monitoring & Logging

### Django Logging

```python
# app/settings.py

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/sge.log',
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
        'django.request': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}
```

### Sentry Integration

```bash
pip install sentry-sdk
```

```python
# app/settings.py

import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="https://your-sentry-dsn@sentry.io/project-id",
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
    send_default_pii=True,
)
```

---

## Backup Strategy

### Database Backup Script

**/usr/local/bin/backup-sge.sh**:

```bash
#!/bin/bash

BACKUP_DIR="/backups/sge"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="sge"
DB_USER="sge_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_$DATE.sql

# Backup media files
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /var/www/sge/media/

# Delete old backups (keep 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Cron Job

```bash
# Edit crontab
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-sge.sh >> /var/log/sge-backup.log 2>&1
```

---

## Troubleshooting

### Common Issues

**502 Bad Gateway:**
```bash
# Check Gunicorn is running
sudo systemctl status sge

# Check socket exists
ls -la /var/www/sge/sge.sock

# Restart services
sudo systemctl restart sge
sudo systemctl restart nginx
```

**Static Files Not Loading:**
```bash
# Check collectstatic
python manage.py collectstatic --noinput

# Check Nginx configuration
sudo nginx -t

# Check file permissions
sudo chown -R www-data:www-data /var/www/sge/staticfiles
```

**Database Connection Error:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U sge_user -d sge -h localhost

# Check credentials in .env
```

**Permission Denied:**
```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/sge

# Fix permissions
sudo chmod -R 755 /var/www/sge
```

### Logs

```bash
# Django logs
sudo tail -f /var/log/django/sge.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Gunicorn logs
sudo journalctl -u sge -f

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

---

**Next Steps**: 
- [Contribution](contribution.md) - How to contribute
- [Release Notes](release-notes.md) - Version history
