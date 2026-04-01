# Quick Start Guide

Get PortalRH up and running quickly with this quick start guide.

---

## ⚡ Quick Installation

### 1. Clone and Setup

```bash
# Clone repository
git clone https://github.com/GabrielDLobo/01-PortalRH.git
cd 01-PortalRH

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate  # Windows
```

### 2. Install Dependencies

```bash
# Backend dependencies
pip install -r requirements.txt

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Generate secret key (Python)
python -c "from django.core.management.utils import get_random_secret_key; print(f'SECRET_KEY={get_random_secret_key()}')"
```

Edit `.env` and add the generated secret key.

### 4. Initialize Database

```bash
# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser
```

### 5. Start Development Servers

**Terminal 1 - Backend:**

```bash
python manage.py runserver
```

Backend running at: http://127.0.0.1:8000/

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Frontend running at: http://localhost:3000/

---

## 🎯 First Steps

### 1. Access Django Admin

Visit: http://127.0.0.1:8000/admin/

Login with the superuser credentials you created.

### 2. Access API Documentation

- **Swagger UI:** http://127.0.0.1:8000/api/docs/
- **ReDoc:** http://127.0.0.1:8000/api/redoc/

### 3. Access the Application

Visit: http://localhost:3000/

Login with your admin credentials.

### 4. Create Initial Data

**Via Admin Panel:**

1. Go to `/admin/`
2. Create leave types (Férias, Licença Médica, etc.)
3. Create evaluation templates
4. Create termination reasons

**Via API:**

```bash
# Create leave type
curl -X POST http://127.0.0.1:8000/api/v1/leave-requests/types/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Férias",
    "descricao": "Annual vacation",
    "max_dias_ano": 30,
    "requer_aprovacao": true,
    "antecedencia_minima": 15
  }'
```

---

## 📁 Project Structure

```
01-PortalRH/
├── app/              # Django settings
├── accounts/         # Authentication
├── employees/        # Employee management
├── leave_requests/   # Leave management
├── evaluations/      # Performance reviews
├── termination/      # Termination process
├── staff/            # Staff management
├── reports/          # Reports & analytics
├── frontend/         # React application
└── docs/             # Documentation
```

---

## 🔑 Key Features to Explore

### Employee Management

- Create employee profiles
- Upload documents
- Track admission process
- Manage employee data

### Leave Requests

- Submit leave requests
- Approve/reject requests
- Track leave balances
- Manage leave types

### Performance Evaluations

- Create evaluation templates
- Conduct evaluations
- Track evaluation cycles
- View evaluation scores

### Reports

- Generate employee reports
- Export to PDF/Excel
- Schedule reports
- Bookmark favorites

---

## 🛠️ Common Tasks

### Create Employee

```bash
curl -X POST http://127.0.0.1:8000/api/v1/employees/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "position": "Developer",
    "department": "Engineering",
    "hire_date": "2024-01-01",
    "salary": "5000.00"
  }'
```

### Submit Leave Request

```bash
curl -X POST http://127.0.0.1:8000/api/v1/leave-requests/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": 1,
    "data_inicio": "2024-06-01",
    "data_fim": "2024-06-30",
    "motivo": "Annual vacation",
    "prioridade": "media"
  }'
```

---

## 📚 Next Steps

- Read the [Installation Guide](installation.md) for detailed setup
- Check [Configuration Guide](configuration.md) for environment settings
- Explore [API Endpoints](api-endpoints.md) for integration
- Review [Development Guide](development.md) for contributing

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Use different port for backend
python manage.py runserver 8001

# Use different port for frontend
cd frontend
npm run dev -- --port 3001
```

### Migration Errors

```bash
# Reset migrations
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

### Frontend Build Issues

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Getting Help

- **Documentation:** Browse the [docs](index.md)
- **Issues:** Report on [GitHub Issues](https://github.com/GabrielDLobo/01-PortalRH/issues)
- **API Docs:** Visit `/api/docs/` or `/api/redoc/`

---

**Happy coding! 🚀**
