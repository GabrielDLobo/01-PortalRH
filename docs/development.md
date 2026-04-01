# Development Guide

This guide covers the development workflow, tools, and best practices for contributing to PortalRH.

---

## 📋 Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Running the Application](#running-the-application)
- [Code Style and Linting](#code-style-and-linting)
- [Database Management](#database-management)
- [Working with Git](#working-with-git)
- [Creating New Features](#creating-new-features)
- [Debugging](#debugging)
- [Common Development Tasks](#common-development-tasks)

---

## 🖥️ Development Environment Setup

### Prerequisites

Ensure you have completed the [Installation](installation.md) and [Configuration](configuration.md) steps.

### IDE Setup

**Recommended:** Visual Studio Code

**Required Extensions:**
```
Python (ms-python.python)
Pylance (ms-python.vscode-pylance)
ESLint (dbaeumer.vscode-eslint)
Prettier (esbenp.prettier-vscode)
Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
Django Template (batisteo.vscode-django)
```

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/venv/Scripts/python.exe",
  "python.linting.enabled": true,
  "python.linting.ruffEnabled": true,
  "python.formatting.provider": "ruff",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.tabSize": 4
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 2
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 2
  }
}
```

---

## 🚀 Running the Application

### Backend Server

**Terminal 1:**

```bash
# Activate virtual environment
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate  # Windows

# Run development server
python manage.py runserver

# Or run on specific port
python manage.py runserver 8001
```

Backend available at: http://127.0.0.1:8000/

### Frontend Server

**Terminal 2:**

```bash
cd frontend

# Run development server
npm run dev

# Or run on specific port
npm run dev -- --port 3001
```

Frontend available at: http://localhost:3000/

### Using Taskipy

Run predefined tasks from `pyproject.toml`:

```bash
# Install taskipy if not installed
pip install taskipy

# Run linting
task lint

# Format code
task format

# Run development server
task run
```

---

## 📏 Code Style and Linting

### Python (Backend)

**Ruff Configuration** (`pyproject.toml`):

```toml
[tool.ruff]
target-version = "py310"
line-length = 88
select = [
    "E",  # pycodestyle errors
    "W",  # pycodestyle warnings
    "F",  # pyflakes
    "I",  # isort
    "B",  # flake8-bugbear
    "C4", # flake8-comprehensions
]
ignore = [
    "E501", # line too long (handled by formatter)
]

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]
```

**Commands:**

```bash
# Check code
ruff check .

# Fix issues
ruff check --fix .

# Format code
ruff format .

# Check and format
ruff check --fix && ruff format .
```

### TypeScript/React (Frontend)

**ESLint Configuration** (`frontend/.eslintrc.json`):

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "react", "react-hooks"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

**Commands:**

```bash
cd frontend

# Lint code
npm run lint

# Fix issues
npm run lint:fix

# Format code
npm run format

# Check types
npm run type-check
```

---

## 🗄️ Database Management

### Migrations

**Create migrations:**

```bash
python manage.py makemigrations
python manage.py makemigrations employees  # Specific app
```

**Apply migrations:**

```bash
python manage.py migrate
python manage.py migrate employees  # Specific app
```

**Check migration status:**

```bash
python manage.py showmigrations
python manage.py showmigrations employees
```

**Rollback migrations:**

```bash
python manage.py migrate employees 0001_initial
python manage.py migrate employees zero  # All migrations
```

### Database Shell

```bash
# Open database shell
python manage.py dbshell

# For SQLite
sqlite3 db.sqlite3

# For PostgreSQL
psql -U portalrh_user -d portalrh
```

### Django Shell

```bash
# Standard shell
python manage.py shell

# Shell Plus (with all models imported)
pip install django-extensions
python manage.py shell_plus
```

**Example usage:**

```python
from accounts.models import User
from employees.models import Employee

# Create user
user = User.objects.create_user(
    email='test@example.com',
    password='testpass123',
    username='testuser'
)

# Create employee
employee = Employee.objects.create(
    user=user,
    full_name='Test User',
    position='Developer'
)

# Query
Employee.objects.filter(status='active')
```

### Load Initial Data

```bash
# Create superuser
python manage.py createsuperuser

# Load fixtures (if available)
python manage.py loaddata initial_data.json

# Custom setup command
python manage.py setup_initial_data
```

---

## 🌿 Working with Git

### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/new-feature

# Create bugfix branch
git checkout -b fix/bug-description

# Create documentation branch
git checkout -b docs/documentation-update
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Feature
git commit -m "feat(employees): add document upload feature"

# Bug fix
git commit -m "fix(leave-requests): correct balance calculation"

# Documentation
git commit -m "docs: update API documentation"

# Refactor
git commit -m "refactor(auth): simplify token refresh logic"

# Tests
git commit -m "test: add unit tests for employee model"
```

### Common Git Operations

```bash
# Check status
git status

# View changes
git diff

# Stage files
git add path/to/file
git add .  # All files

# Commit
git commit -m "message"

# Push
git push origin branch-name

# Pull latest changes
git pull origin main

# View log
git log --oneline -10
```

### Resolving Merge Conflicts

```bash
# Pull latest changes
git pull origin main

# If conflict occurs
# 1. Open conflicted files
# 2. Resolve conflicts manually
# 3. Stage resolved files
git add path/to/resolved/file

# Continue merge
git commit
```

---

## ✨ Creating New Features

### Backend Feature Template

**1. Create Model** (`employees/models.py`):

```python
from django.db import models
from django.conf import settings

class NewFeature(models.Model):
    """Model for new feature"""
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'employees_new_feature'
        verbose_name = 'New Feature'
        verbose_name_plural = 'New Features'
    
    def __str__(self):
        return self.name
```

**2. Create Serializer** (`employees/serializers.py`):

```python
from rest_framework import serializers
from .models import NewFeature

class NewFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewFeature
        fields = ['id', 'name', 'description', 'created_by', 'created_at']
        read_only_fields = ['created_by', 'created_at']
```

**3. Create View** (`employees/views.py`):

```python
from rest_framework import viewsets, permissions
from .models import NewFeature
from .serializers import NewFeatureSerializer

class NewFeatureViewSet(viewsets.ModelViewSet):
    queryset = NewFeature.objects.all()
    serializer_class = NewFeatureSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
```

**4. Add URL** (`employees/urls.py`):

```python
from rest_framework.routers import DefaultRouter
from .views import NewFeatureViewSet

router = DefaultRouter()
router.register(r'new-features', NewFeatureViewSet)

urlpatterns = router.urls
```

**5. Create Tests** (`employees/tests/test_new_feature.py`):

```python
import pytest
from employees.models import NewFeature

@pytest.mark.django_db
class TestNewFeature:
    
    def test_create_feature(self, user):
        feature = NewFeature.objects.create(
            name='Test',
            description='Test description',
            created_by=user
        )
        assert feature.id is not None
```

---

### Frontend Feature Template

**1. Create Component** (`src/components/features/NewFeature.tsx`):

```typescript
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface NewFeature {
  id: number;
  name: string;
  description: string;
}

export const NewFeatureList: React.FC = () => {
  const [features, setFeatures] = useState<NewFeature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const response = await api.get('/employees/new-features/');
      setFeatures(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="feature-list">
      {features.map(feature => (
        <div key={feature.id} className="feature-card">
          <h3>{feature.name}</h3>
          <p>{feature.description}</p>
        </div>
      ))}
    </div>
  );
};
```

**2. Add to Page** (`src/pages/Features.tsx`):

```typescript
import React from 'react';
import { NewFeatureList } from '../components/features/NewFeatureList';

export const FeaturesPage: React.FC = () => {
  return (
    <div>
      <h1>Features</h1>
      <NewFeatureList />
    </div>
  );
};
```

**3. Add Route** (`src/App.tsx`):

```typescript
import { Routes, Route } from 'react-router-dom';
import { FeaturesPage } from './pages/Features';

function App() {
  return (
    <Routes>
      <Route path="/features" element={<FeaturesPage />} />
    </Routes>
  );
}
```

---

## 🐛 Debugging

### Backend Debugging

**Using print statements:**

```python
import logging

logger = logging.getLogger(__name__)

def my_function():
    logger.debug('Debug message')
    logger.info('Info message')
    logger.warning('Warning message')
    logger.error('Error message')
```

**Using Django Debug Toolbar:**

```bash
pip install django-debug-toolbar
```

```python
# settings.py
INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']

INTERNAL_IPS = ['127.0.0.1']
```

**Using pdb:**

```python
def problematic_function():
    import pdb; pdb.set_trace()
    # Code execution pauses here
```

### Frontend Debugging

**React DevTools:**
- Install React Developer Tools extension
- Inspect component tree
- View props and state

**Console debugging:**

```typescript
const debugFunction = () => {
  console.log('Debug:', variable);
  console.table(arrayOfObjects);
  console.trace(); // Stack trace
};
```

**Using debugger:**

```typescript
const problematicFunction = () => {
  debugger; // Execution pauses here in DevTools
  // ... code
};
```

---

## 📝 Common Development Tasks

### Adding a New API Endpoint

**1. Add view:**

```python
# employees/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def custom_endpoint(request):
    return Response({'message': 'Hello!'})
```

**2. Add URL:**

```python
# employees/urls.py
from django.urls import path
from .views import custom_endpoint

urlpatterns = [
    path('custom-endpoint/', custom_endpoint),
]
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest employees/tests/test_models.py

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test
pytest employees/tests/test_models.py::TestEmployee::test_creation

# Frontend tests
cd frontend
npm test
npm test -- --coverage
```

### Building Frontend

```bash
cd frontend

# Development build
npm run build

# Production build
npm run build -- --mode production

# Preview production build
npm run preview
```

### Collect Static Files

```bash
# Collect all static files
python manage.py collectstatic

# Clear existing files first
python manage.py collectstatic --clear
```

---

## 🔧 Troubleshooting

### Common Issues

**Migration errors:**

```bash
# Delete migrations (except __init__.py)
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete

# Recreate
python manage.py makemigrations
python manage.py migrate
```

**Port already in use:**

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

**npm install fails:**

```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Import errors:**

```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

---

## 📚 Related Documentation

- [Testing Guide](testing.md) - Testing strategies
- [API Endpoints](api-endpoints.md) - API reference
- [Guidelines](guidelines.md) - Coding standards

---

## 🆘 Getting Help

- Check existing documentation
- Review error messages carefully
- Search GitHub Issues
- Ask in team channels
- Check Django/React documentation
