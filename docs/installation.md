# Installation Guide

This guide provides step-by-step instructions for installing the Inventory Management System using different methods.

## Table of Contents

1. [Clone Repository](#1-clone-repository)
2. [Method 1: Standard Installation](#method-1-standard-installation)
3. [Method 2: Docker Installation](#method-2-docker-installation)
4. [Post-Installation](#post-installation)
5. [Verification](#verification)

---

## 1. Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd 02-Inventory-Management-System
```

---

## Method 1: Standard Installation

### Step 1: Create Virtual Environment

**Linux/macOS:**
```bash
python -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

You should see `(venv)` prefix in your terminal.

### Step 2: Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install all requirements
pip install -r requirements.txt
```

**Dependencies include:**
- Django 5.0.1
- djangorestframework 3.15.1
- djangorestframework-simplejwt 5.3.1
- psycopg2-binary 2.9.10
- openai 1.38.0
- httpx 0.28.1
- pydantic 2.10.6
- django-widget-tweaks 1.5.0

### Step 3: Database Setup

#### Option A: SQLite (Development)

No additional setup required. SQLite is configured by default for development.

#### Option B: PostgreSQL (Production)

1. **Install PostgreSQL** (if not already installed)

2. **Create Database:**
```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE sge;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE sge TO postgres;
\q
```

3. **Update Settings:**
   
   Edit `app/settings.py` or create `.env` file:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'sge',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Step 4: Run Migrations

```bash
# Apply all migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Follow prompts to create admin account
# Username: admin
# Email: admin@example.com
# Password: (choose a strong password)
```

### Step 5: Start Development Server

```bash
# Run the server
python manage.py runserver

# Access the application
# http://127.0.0.1:8000
```

**Server should output:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

---

## Method 2: Docker Installation

### Step 1: Verify Docker Installation

```bash
docker --version
docker-compose --version
```

### Step 2: Build and Run Containers

```bash
# Build and start all services
docker-compose up -d --build

# View running containers
docker-compose ps
```

### Step 3: Run Migrations

```bash
# Execute migrations inside container
docker-compose exec sge_web python manage.py migrate

# Create superuser
docker-compose exec sge_web python manage.py createsuperuser
```

### Step 4: Access the Application

```
Web Interface: http://localhost:8000
Admin Panel: http://localhost:8000/admin
API: http://localhost:8000/api/v1/
```

### Docker Commands Reference

```bash
# View logs
docker-compose logs -f sge_web
docker-compose logs -f sge_db

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Rebuild containers
docker-compose up -d --build

# Access container shell
docker-compose exec sge_web bash

# Remove all containers and volumes
docker-compose down -v
```

---

## Post-Installation

### 1. Configure OpenAI (Optional)

Edit `ai/agent.py` or set environment variable:

```bash
export OPENAI_API_KEY='your-api-key-here'
```

Or create `.env` file in project root:

```bash
OPENAI_API_KEY=your-api-key-here
```

### 2. Configure Webhooks (Optional)

Edit `services/notify.py` to configure webhook URL:

```python
WEBHOOK_URL = 'http://localhost:8001/api/V1/webhooks/order/'
```

### 3. Create Initial Data

Access Django admin to create initial data:

```
1. Login at http://localhost:8000/admin/
2. Create Brands
3. Create Categories
4. Create Suppliers
5. Create Products
```

### 4. Configure Static Files (Production)

```bash
# Collect static files
python manage.py collectstatic
```

---

## Verification

### 1. Check Application Health

```bash
# Access home page
curl http://localhost:8000/home/

# Access API
curl http://localhost:8000/api/v1/

# Check admin
curl http://localhost:8000/admin/
```

### 2. Test Database Connection

```bash
# Django shell
python manage.py shell

# Test database
>>> from products.models import Product
>>> Product.objects.count()
0
>>> exit()
```

### 3. Verify All Services

| Service | URL | Status |
|---------|-----|--------|
| Web App | http://localhost:8000 | ✅ |
| Admin | http://localhost:8000/admin | ✅ |
| API | http://localhost:8000/api/v1 | ✅ |
| Dashboard | http://localhost:8000/home | ✅ |

---

## Troubleshooting

### Issue: Port Already in Use

```bash
# Find process using port 8000
# Linux/macOS
lsof -i :8000

# Windows
netstat -ano | findstr :8000

# Run on different port
python manage.py runserver 8001
```

### Issue: Database Connection Error

```bash
# Check PostgreSQL is running
# Linux
sudo systemctl status postgresql

# Windows
# Check Services -> PostgreSQL

# Verify credentials in settings.py
```

### Issue: Migration Errors

```bash
# Reset migrations (development only)
python manage.py migrate --run-syncdb

# Or delete database and migrate again
rm db.sqlite3
python manage.py migrate
```

### Issue: Permission Denied (Linux/macOS)

```bash
# Install with --user flag
pip install --user -r requirements.txt

# Or fix virtualenv permissions
chmod -R 755 venv/
```

### Issue: Docker Container Won't Start

```bash
# Check Docker daemon
docker ps

# View container logs
docker-compose logs sge_web

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

---

## Next Steps

After successful installation:

1. ✅ [Configuration](configuration.md) - Configure project settings
2. ✅ [Project Structure](project-structure.md) - Understand the codebase
3. ✅ [Development](development.md) - Start developing

---

**Installation Complete!** 🎉

You can now access the application at `http://localhost:8000` and login with your superuser credentials.
