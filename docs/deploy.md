# Deploy

This guide covers deployment procedures for PortalRH in production environments.

---

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database migrations prepared
- [ ] Static files collection tested
- [ ] SSL certificates ready
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Rollback plan documented

---

## 🌐 Deployment Options

PortalRH can be deployed using several methods:

1. **Vercel** (Recommended for simplicity)
2. **Docker** (Containerized deployment)
3. **Traditional VPS** (Manual deployment)
4. **Cloud Platforms** (AWS, GCP, Azure)

---

## 🚀 Vercel Deployment

### 1. Prepare for Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

### 2. Configure Project

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "app/wsgi.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app/wsgi.py"
    }
  ],
  "env": {
    "DJANGO_SETTINGS_MODULE": "app.settings",
    "PYTHON_VERSION": "3.10"
  }
}
```

### 3. Environment Variables

Set environment variables in Vercel dashboard:

```bash
SECRET_KEY=<production-secret-key>
DEBUG=False
DATABASE_URL=<postgres-connection-string>
ALLOWED_HOSTS=<your-domain.com>
```

### 4. Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

---

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Dockerfile
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# Expose port
EXPOSE 8000

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "app.wsgi:application"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15
    container_name: portalrh_db
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - portalrh_network
    restart: unless-stopped

  # Django Backend
  backend:
    build:
      context: .
      dockerfile: ./test/Dockerfile.backend
    container_name: portalrh_backend
    environment:
      - DEBUG=${DEBUG}
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
    volumes:
      - media_files:/app/media
      - static_files:/app/static
    ports:
      - "8000:8000"
    depends_on:
      - db
    networks:
      - portalrh_network
    restart: unless-stopped
    command: >
      sh -c "python manage.py collectstatic --noinput &&
             python manage.py migrate &&
             python manage.py setup_initial_data --skip-if-exists &&
             gunicorn app.wsgi:application --bind 0.0.0.0:8000"

  # React Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: portalrh_frontend
    environment:
      - REACT_APP_API_URL=${REACT_APP_API_URL}
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - portalrh_network
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: portalrh_nginx
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - static_files:/var/www/static
      - media_files:/var/www/media
    ports:
      - "80:80"
      - "443:443"
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

### Build and Run

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Stop services
docker-compose down
```

---

## 🖥️ Traditional VPS Deployment

### Server Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **RAM** | 2 GB | 4 GB |
| **CPU** | 2 cores | 4 cores |
| **Storage** | 20 GB | 50 GB SSD |
| **OS** | Ubuntu 20.04 LTS | Ubuntu 22.04 LTS |

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.10 python3.10-venv python3-pip
sudo apt install -y postgresql postgresql-contrib nginx
sudo apt install -y git curl

# Create application user
sudo useradd -m -s /bin/bash portalrh
```

### Step 2: Database Setup

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE portalrh;
CREATE USER portalrh_user WITH PASSWORD 'secure_password';
ALTER ROLE portalrh_user SET client_encoding TO 'utf8';
ALTER ROLE portalrh_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE portalrh_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE portalrh TO portalrh_user;
\q
```

### Step 3: Application Setup

```bash
# Clone repository
sudo -u portalrh -i
git clone https://github.com/GabrielDLobo/01-PortalRH.git /home/portalrh/portalrh
cd /home/portalrh/portalrh

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn
```

### Step 4: Environment Configuration

```bash
# Create .env file
nano /home/portalrh/portalrh/.env
```

```env
SECRET_KEY=<production-secret-key>
DEBUG=False
DATABASE_URL=postgres://portalrh_user:secure_password@localhost:5432/portalrh
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,<server-ip>
CSRF_TRUSTED_ORIGINS=https://your-domain.com
```

### Step 5: Database Migrations

```bash
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### Step 6: Gunicorn Service

```bash
# Create systemd service
sudo nano /etc/systemd/system/portalrh.service
```

```ini
[Unit]
Description=PortalRH Gunicorn daemon
After=network.target

[Service]
User=portalrh
Group=www-data
WorkingDirectory=/home/portalrh/portalrh
ExecStart=/home/portalrh/portalrh/venv/bin/gunicorn \
    --access-logfile - \
    --workers 4 \
    --bind unix:/home/portalrh/portalrh/portalrh.sock \
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

### Step 7: Nginx Configuration

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/portalrh
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        alias /home/portalrh/portalrh/staticfiles/;
    }
    
    location /media/ {
        alias /home/portalrh/portalrh/media/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/portalrh/portalrh/portalrh.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/portalrh /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

---

## 📊 Production Settings

### Security Settings

```python
# app/settings.py

DEBUG = False

# Security
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_SECONDS = 31536000
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
X_FRAME_OPTIONS = 'DENY'

# Allowed hosts
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])

# CORS (update for production)
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[])
```

### Database Settings

```python
# Use PostgreSQL in production
DATABASES = {
    'default': env.db('DATABASE_URL')
}
```

### Logging

```python
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
            'filename': '/var/log/portalrh/django.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

---

## 🔄 Deployment Workflow

### Automated Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment..."

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️  Running migrations..."
python manage.py migrate

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Restart Gunicorn
echo "🔄 Restarting Gunicorn..."
sudo systemctl restart portalrh

# Clear cache (if using Redis)
# redis-cli FLUSHALL

echo "✅ Deployment complete!"
```

### Usage

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📈 Monitoring & Logging

### Application Monitoring

```bash
# Install monitoring tools
pip install sentry-sdk

# Configure Sentry
# app/settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=env('SENTRY_DSN'),
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
    send_default_pii=True
)
```

### Log Rotation

```bash
# /etc/logrotate.d/portalrh
/var/log/portalrh/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 portalrh www-data
    sharedscripts
    postrotate
        systemctl reload portalrh
    endscript
}
```

---

## 💾 Backup Strategy

### Database Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/portalrh"
DB_NAME="portalrh"
DB_USER="portalrh_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup media files
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /home/portalrh/portalrh/media/

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Cron Job

```bash
# Add to crontab (daily at 2 AM)
0 2 * * * /home/portalrh/portalrh/backup.sh
```

---

## 🔧 Rollback Procedure

### Rollback Script

```bash
#!/bin/bash
# rollback.sh

set -e

echo "🔄 Starting rollback..."

# Get previous commit
PREVIOUS_COMMIT=$(git rev-parse HEAD~1)

# Checkout previous version
git checkout $PREVIOUS_COMMIT

# Activate virtual environment
source venv/bin/activate

# Install dependencies from previous version
pip install -r requirements.txt

# Run migrations (Django handles rollback)
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Restart service
sudo systemctl restart portalrh

echo "✅ Rollback complete to commit: $PREVIOUS_COMMIT"
```

---

## 🚨 Troubleshooting

### Common Issues

**502 Bad Gateway:**
```bash
# Check if Gunicorn is running
sudo systemctl status portalrh

# Check socket permissions
ls -la /home/portalrh/portalrh/portalrh.sock

# Restart services
sudo systemctl restart portalrh
sudo systemctl restart nginx
```

**Static files not loading:**
```bash
# Verify static files location
ls -la /home/portalrh/portalrh/staticfiles/

# Check Nginx configuration
sudo nginx -t

# Clear browser cache
```

**Database connection error:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Verify DATABASE_URL
cat .env | grep DATABASE_URL

# Test connection
psql $DATABASE_URL
```

---

## 📋 Post-Deployment Checklist

After deployment:

- [ ] Verify all endpoints are accessible
- [ ] Test authentication flow
- [ ] Check error pages
- [ ] Verify SSL certificate
- [ ] Test file uploads
- [ ] Check email functionality
- [ ] Monitor error logs
- [ ] Verify backup jobs
- [ ] Test rollback procedure
- [ ] Update DNS records

---

**Next:** [Contributing](contributing.md)
