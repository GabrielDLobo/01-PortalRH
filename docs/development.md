# Development

This guide covers the development workflow, tools, and best practices for contributing to PortalRH.

---

## 🛠️ Development Environment Setup

### 1. Clone and Setup

```bash
# Clone repository
git clone https://github.com/GabrielDLobo/01-PortalRH.git
cd 01-PortalRH

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

```bash
# Copy environment template
copy .env.example .env  # Windows
cp .env.example .env    # Linux/macOS

# Edit .env with development settings
# Minimum required:
SECRET_KEY=dev-secret-key-change-in-production
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 3. Database Setup

```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# (Optional) Load sample data
python manage.py loaddata fixtures/sample_data.json
```

### 4. Start Development Server

```bash
# Run server
python manage.py runserver

# Run on specific port
python manage.py runserver 8001

# Run with live reload
python manage.py runserver --noreload
```

---

## 📁 Project Structure

```
PortalRH/
├── accounts/              # Authentication module
├── app/                   # Core settings
├── employees/             # Employee management
├── evaluations/           # Performance evaluations
├── leave_requests/        # Leave management
├── reports/               # Reporting system
├── staff/                 # Staff management
├── termination/           # Termination workflows
├── frontend/              # React frontend
├── docs/                  # Documentation
├── media/                 # User uploads
├── static/                # Static files
└── logs/                  # Log files
```

---

## 💻 Development Tools

### Recommended IDE

**VS Code** with extensions:
- Python (Microsoft)
- Django Template
- Pylance
- GitLens
- REST Client

**PyCharm Professional** (alternative):
- Built-in Django support
- Database tools
- Template debugging

### Useful Extensions

```json
{
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "files.exclude": {
    "**/__pycache__": true,
    "**/*.pyc": true,
    "**/.env": true
  }
}
```

### Browser Extensions

- React Developer Tools
- Redux DevTools
- JSON Viewer

---

## 🔧 Django Management Commands

### Common Commands

```bash
# Database operations
python manage.py migrate
python manage.py makemigrations
python manage.py makemigrations <app_name>

# Server
python manage.py runserver
python manage.py runserver 0.0.0.0:8000

# Static files
python manage.py collectstatic
python manage.py collectstatic --noinput

# Admin
python manage.py createsuperuser
python manage.py changepassword <username>

# Shell
python manage.py shell
python manage.py shell_plus  # With django-extensions

# Testing
python manage.py test
python manage.py test <app_name>
python manage.py test --coverage

# Data
python manage.py loaddata <fixture>
python manage.py dumpdata <app_name> > fixture.json
```

### Custom Commands

Create custom management commands in:
```
<app_name>/management/commands/<command_name>.py
```

Example:
```python
# employees/management/commands/generate_employee_id.py
from django.core.management.base import BaseCommand
from employees.models import Employee

class Command(BaseCommand):
    help = 'Generate employee IDs for all employees'
    
    def handle(self, *args, **options):
        for employee in Employee.objects.all():
            if not employee.employee_id:
                employee.generate_employee_id()
                employee.save()
        self.stdout.write(self.style.SUCCESS('Employee IDs generated'))
```

---

## 📝 Coding Standards

### Python Style Guide

Follow **PEP 8** with these specifics:

```python
# Imports - grouped and sorted
from django.db import models
from rest_framework import serializers

# Constants - UPPER_CASE
MAX_FILE_SIZE = 10 * 1024 * 1024

# Classes - PascalCase
class EmployeeSerializer(serializers.ModelSerializer):
    """Docstring for class."""
    
    # Methods - snake_case
    def validate_email(self, value):
        """Docstring for method."""
        return value

# Private attributes - _prefix
_internal_cache = {}

# Line length - max 100 characters
```

### Docstring Format

Use Google-style docstrings:

```python
def calculate_leave_balance(employee, year):
    """
    Calculate available leave days for an employee.
    
    Args:
        employee (Employee): The employee instance
        year (int): The year to calculate for
    
    Returns:
        int: Number of available leave days
    
    Raises:
        ValueError: If year is invalid
    """
    if year > datetime.now().year:
        raise ValueError("Cannot calculate for future years")
    return balance
```

---

## 🏗️ Architecture Patterns

### Model-View-Serializer Pattern

```python
# models.py
class Employee(models.Model):
    """Employee model."""
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    
    def __str__(self):
        return self.full_name
    
    @property
    def is_active(self):
        return self.status == 'active'

# serializers.py
class EmployeeSerializer(serializers.ModelSerializer):
    """Employee serializer."""
    
    class Meta:
        model = Employee
        fields = ['id', 'full_name', 'email', 'is_active']
        read_only_fields = ['id']

# views.py
class EmployeeViewSet(viewsets.ModelViewSet):
    """Employee viewset."""
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated, CanManageEmployee]
```

### Service Layer Pattern

For complex business logic:

```python
# services.py
class EmployeeService:
    """Service class for employee operations."""
    
    @staticmethod
    def create_employee(data, created_by):
        """Create employee with all related data."""
        with transaction.atomic():
            employee = Employee.objects.create(**data)
            AdmissionProcess.objects.create(employee=employee)
            EmployeeService.send_welcome_email(employee)
            return employee
    
    @staticmethod
    def send_welcome_email(employee):
        """Send welcome email to new employee."""
        # Email logic
        pass

# views.py
class EmployeeViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        EmployeeService.create_employee(
            serializer.validated_data,
            self.request.user
        )
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test employees

# Run with verbosity
python manage.py test -v 2

# Run with coverage
coverage run manage.py test
coverage report
coverage html
```

### Test Structure

```python
# tests/test_models.py
from django.test import TestCase
from employees.models import Employee

class EmployeeModelTest(TestCase):
    """Test Employee model."""
    
    def setUp(self):
        self.employee = Employee.objects.create(
            full_name='Test User',
            email='test@example.com'
        )
    
    def test_employee_creation(self):
        """Test employee is created correctly."""
        self.assertEqual(self.employee.full_name, 'Test User')
        self.assertIsNotNone(self.employee.employee_id)
    
    def test_employee_str(self):
        """Test string representation."""
        self.assertEqual(str(self.employee), 'Test User')
```

### Test Coverage Goals

| Component | Coverage Goal |
|-----------|---------------|
| Models | 90% |
| Serializers | 85% |
| Views | 80% |
| Permissions | 95% |
| Services | 85% |

---

## 🐛 Debugging

### Django Debug Toolbar

```bash
# Install
pip install django-debug-toolbar

# Add to INSTALLED_APPS
INSTALLED_APPS += ['debug_toolbar']

# Add middleware
MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
```

### Python Debugger

```python
import pdb

def problematic_function():
    pdb.set_trace()  # Breakpoint
    # Use: n (next), c (continue), q (quit)
```

### Logging

```python
import logging

logger = logging.getLogger(__name__)

def my_function():
    logger.debug('Debug message')
    logger.info('Info message')
    logger.warning('Warning message')
    logger.error('Error message')
    logger.critical('Critical message')
```

---

## 📦 Dependencies

### Managing Dependencies

```bash
# List installed packages
pip list

# Check for outdated packages
pip list --outdated

# Update specific package
pip install package-name --upgrade

# Freeze dependencies
pip freeze > requirements.txt

# Install from requirements
pip install -r requirements.txt
```

### Dependency Groups

```txt
# requirements.txt - Production
Django>=5.0.4,<5.1
djangorestframework>=3.15.1

# Optional tools for local quality checks
pytest>=7.0.0
pytest-cov>=4.0.0
black>=23.0.0
pylint>=2.17.0
django-debug-toolbar>=4.0.0
```

---

## 🔄 Git Workflow

### Branch Strategy

```
main              # Production-ready
├── develop       # Integration branch
│   ├── feature/employee-crud
│   ├── feature/leave-requests
│   └── fix/login-bug
└── hotfix/       # Production fixes
```

### Commit Messages

Follow Conventional Commits:

```
feat: add employee document verification
fix: resolve leave balance calculation
docs: update API documentation
style: format code according to PEP 8
refactor: extract validation to service
test: add unit tests for serializer
chore: update dependencies
```

### Pull Request Process

1. **Create feature branch**
   ```bash
   git checkout -b feature/description
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push and create PR**
   ```bash
   git push origin feature/description
   ```

4. **Code review**
   - Address reviewer comments
   - Update PR as needed

5. **Merge after approval**
   - Squash and merge
   - Delete branch

---

## 🚀 Frontend Development

### Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utility functions
│   └── styles/         # Global styles
└── public/
```

### API Integration

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 📊 Database Development

### Migrations

```bash
# Create migrations
python manage.py makemigrations

# Create named migration
python manage.py makemigrations --name add_employee_field

# Show SQL that will run
python manage.py sqlmigrate employees 0001

# Apply migrations
python manage.py migrate

# Rollback migration
python manage.py migrate employees 0000
```

### Database Commands

```bash
# Open database shell
python manage.py dbshell

# Export data
python manage.py dumpdata employees.Employee > employees.json

# Import data
python manage.py loaddata employees.json
```

---

## 🔍 Code Quality

### Linting

```bash
# Run pylint
pylint accounts employees evaluations

# Run black (formatter)
black .

# Run isort (imports)
isort .

# Run flake8
flake8 .
```

### Pre-commit Hooks

```bash
# Install pre-commit
pip install pre-commit
pre-commit install

# Run manually
pre-commit run --all-files
```

Example `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.0.0
    hooks:
      - id: black
  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort
  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
```

---

## 📝 Development Checklist

Before submitting code:

- [ ] Code follows style guide
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] No console.log or debug statements
- [ ] No hardcoded values
- [ ] Error handling is adequate
- [ ] Security considerations addressed
- [ ] Performance impact considered
- [ ] Git commit message follows convention

---

## 🆘 Troubleshooting

### Common Issues

**Migration errors:**
```bash
# Delete migrations and recreate
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
python manage.py makemigrations
python manage.py migrate
```

**Port already in use:**
```bash
# Use different port
python manage.py runserver 8001

# Or kill process on Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Static files not loading:**
```bash
# Clear cache and collect
rm -rf staticfiles
python manage.py collectstatic --clear
```

---

**Next:** [Testing](testing.md)
