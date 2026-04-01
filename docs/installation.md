# Installation Guide

This guide provides step-by-step instructions for installing PortalRH on your local development environment.

---

## 📋 Overview

The installation process involves:

1. Cloning the repository
2. Setting up the backend (Django)
3. Setting up the frontend (React)
4. Configuring the database
5. Running initial migrations
6. Starting the development servers

---

## 🔧 Step 1: Clone the Repository

Clone the PortalRH repository to your local machine:

```bash
git clone https://github.com/GabrielDLobo/01-PortalRH.git
cd 01-PortalRH
```

---

## 🐍 Step 2: Backend Setup

### 2.1 Create Virtual Environment

Create a Python virtual environment in the project root:

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### 2.2 Install Python Dependencies

Install all required Python packages:

```bash
pip install -r requirements.txt
```

This installs:
- Django 5.2.6
- Django REST Framework 3.16.1
- SimpleJWT for authentication
- PostgreSQL adapter
- MkDocs for documentation
- And other dependencies

### 2.3 Verify Installation

```bash
python -m django --version
```

Should output: `5.2.6` or similar.

---

## 📦 Step 3: Frontend Setup

### 3.1 Navigate to Frontend Directory

```bash
cd frontend
```

### 3.2 Install Node Dependencies

```bash
npm install
```

This installs all React dependencies including:
- React 19
- TypeScript
- TailwindCSS
- React Router
- Axios
- And other frontend packages

### 3.3 Verify Installation

```bash
npm list react
```

Should show React 19.x.x.

### 3.4 Return to Project Root

```bash
cd ..
```

---

## 🗄️ Step 4: Database Setup

### Option A: SQLite (Development - Default)

No additional setup required. SQLite is configured by default in `app/settings.py`.

### Option B: PostgreSQL (Production)

#### 4.1 Create Database and User

```bash
# Access PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE portalrh;
CREATE USER portalrh_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE portalrh TO portalrh_user;
\q
```

#### 4.2 Update Environment Variables

Create a `.env` file (see [Configuration](configuration.md)):

```env
DATABASE_URL=postgres://portalrh_user:your_secure_password@localhost:5432/portalrh
```

---

## ⚙️ Step 5: Environment Configuration

### 5.1 Create .env File

Copy the example environment file:

```bash
cp .env.example .env
```

### 5.2 Edit .env File

Open `.env` and configure for development:

```env
# Django Settings
SECRET_KEY=django-insecure-your-development-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite for development)
DATABASE_URL=sqlite:///db.sqlite3

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Frontend
REACT_APP_API_URL=http://localhost:8000/api/v1
```

---

## 🔄 Step 6: Run Migrations

Apply database migrations:

```bash
python manage.py migrate
```

This creates all necessary database tables.

### Create Superuser

Create an admin user for accessing the Django admin interface:

```bash
python manage.py createsuperuser
```

Follow the prompts:
- Email address
- Username
- Password

---

## 🚀 Step 7: Start Development Servers

### 7.1 Start Backend Server

In your first terminal (with virtual environment activated):

```bash
python manage.py runserver
```

The backend will be available at: http://127.0.0.1:8000/

### 7.2 Start Frontend Server

Open a **new terminal** and navigate to the frontend directory:

```bash
cd frontend
npm run dev
```

The frontend will be available at: http://localhost:3000/

---

## ✅ Step 8: Verify Installation

### Backend Verification

Visit the following URLs:

- **API Root:** http://127.0.0.1:8000/api/v1/
- **Swagger Docs:** http://127.0.0.1:8000/api/docs/
- **ReDoc:** http://127.0.0.1:8000/api/redoc/
- **Django Admin:** http://127.0.0.1:8000/admin/

### Frontend Verification

Visit: http://localhost:3000/

You should see the PortalRH login page.

---

## 🐳 Alternative: Docker Installation

For containerized setup using Docker Compose:

### Start All Services

```bash
docker compose up -d
```

This starts:
- PostgreSQL database
- Django backend
- React frontend
- Nginx reverse proxy

### View Logs

```bash
docker compose logs -f
```

### Stop Services

```bash
docker compose down
```

---

## 📁 Project Structure After Installation

```
01-PortalRH/
├── venv/                    # Python virtual environment
├── frontend/
│   └── node_modules/        # Node dependencies
├── .env                     # Environment configuration
├── db.sqlite3              # SQLite database (if used)
├── manage.py               # Django management script
└── requirements.txt        # Python dependencies
```

---

## ⚠️ Troubleshooting

### Port Already in Use

If port 8000 or 3000 is in use:

**Backend:**
```bash
python manage.py runserver 8001
```

**Frontend:**
Edit `frontend/package.json` and change the dev script port.

### Migration Errors

If you encounter migration errors:

```bash
# Delete migration files (except __init__.py)
# Delete database
rm db.sqlite3  # or drop PostgreSQL database

# Recreate migrations
python manage.py makemigrations
python manage.py migrate
```

### npm Install Fails

Clear npm cache:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Python Package Installation Fails

Upgrade pip and setuptools:

```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

---

## 📚 Next Steps

After successful installation:

1. Review [Configuration Guide](configuration.md) for detailed settings
2. Check [Development Guide](development.md) for workflow
3. Explore [API Endpoints](api-endpoints.md) for integration

---

## 🆘 Getting Help

If installation fails:

1. Check error messages carefully
2. Verify all [prerequisites](prerequisites.md) are installed
3. Review GitHub Issues
4. Check Django and React documentation
