# Installation

Follow this step-by-step guide to install and set up PortalRH on your local machine.

---

## 📥 Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/GabrielDLobo/01-PortalRH.git

# Navigate to project directory
cd 01-PortalRH
```

---

## 🐍 Step 2: Create Virtual Environment

### Windows
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate
```

### Linux/macOS
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

You should see `(venv)` prefix in your terminal.

---

## 📦 Step 3: Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install all dependencies
pip install -r requirements.txt
```

### Verify Installation
```bash
# Check Django installation
python -m django --version

# Check DRF installation
python -c "import rest_framework; print(rest_framework.VERSION)"
```

---

## 🗄️ Step 4: Database Setup

### Option A: SQLite (Development - Default)

No configuration needed. SQLite will be created automatically.

### Option B: PostgreSQL (Production)

```bash
# Create database
psql -U postgres
CREATE DATABASE portalrh;
CREATE USER portalrh_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE portalrh TO portalrh_user;
\q

# Update .env file with PostgreSQL connection string
DATABASE_URL=postgres://portalrh_user:your_password@localhost:5432/portalrh
```

---

## ⚙️ Step 5: Environment Configuration

```bash
# Copy example environment file
copy .env.example .env  # Windows
cp .env.example .env    # Linux/macOS

# Edit .env file with your configurations
# Use your preferred text editor
```

### Minimum Required Configuration

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
```

---

## 🔧 Step 6: Database Migrations

```bash
# Create database tables
python manage.py migrate

# Collect static files (production)
python manage.py collectstatic --noinput
```

---

## 👤 Step 7: Create Superuser

```bash
python manage.py createsuperuser
```

Follow the prompts:
- Email: admin@portalrh.com
- Password: (choose a strong password)

---

## 🚀 Step 8: Start Development Server

```bash
# Run the development server
python manage.py runserver
```

Access the application:
- **API Root:** http://localhost:8000/api/v1/
- **API Docs:** http://localhost:8000/api/docs/
- **Admin Panel:** http://localhost:8000/admin/

---

## 🧪 Step 9: Verify Installation

### Test API Endpoint
```bash
curl http://localhost:8000/api/v1/
```

### Test Authentication
```bash
# Login to get JWT tokens
curl -X POST http://localhost:8000/api/v1/accounts/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portalrh.com","password":"your-password"}'
```

---

## 🐳 Docker Installation (Alternative)

### Prerequisites
- Docker installed
- Docker Compose installed

### Run with Docker

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser
```

---

## 🔍 Troubleshooting

### Issue: `pip` not recognized
```bash
# Windows - Add Python to PATH
setx PATH "%PATH%;C:\Python310\Scripts"

# Or use py launcher
py -m pip install -r requirements.txt
```

### Issue: Database connection error
```bash
# Verify DATABASE_URL in .env
# For PostgreSQL, ensure service is running
net start postgresql  # Windows
sudo service postgresql start  # Linux
```

### Issue: Port 8000 already in use
```bash
# Use different port
python manage.py runserver 8001
```

### Issue: Missing dependencies
```bash
# Clear pip cache and reinstall
pip cache purge
pip install -r requirements.txt --force-reinstall
```

---

## 📝 Post-Installation

After successful installation:

1. **Configure email settings** (optional, for admission emails)
2. **Set up CORS origins** for frontend integration
3. **Create initial data** (leave types, departments, etc.)
4. **Review security settings** before production deployment

---

**Next:** [Configuration](configuration.md)
