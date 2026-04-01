# Testing Guide

This guide covers testing strategies, frameworks, and best practices for PortalRH.

---

## 📋 Table of Contents

- [Testing Overview](#testing-overview)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Test Coverage](#test-coverage)
- [Continuous Integration](#continuous-integration)
- [Best Practices](#best-practices)

---

## 🎯 Testing Overview

### Testing Pyramid

```
        /\
       /  \
      / E2E \     End-to-End Tests (Few)
     /--------\
    /          \
   / Integration\  Integration Tests (Some)
  /--------------\
 /                \
/    Unit Tests    \  Unit Tests (Many)
--------------------
```

### Test Types

| Type | Purpose | Tools | Speed |
|------|---------|-------|-------|
| **Unit** | Test individual components | pytest, Jest | Fast |
| **Integration** | Test component interaction | pytest, RTL | Medium |
| **E2E** | Test complete user flows | Playwright, Cypress | Slow |

---

## 🐍 Backend Testing

### Pytest Configuration

**pyproject.toml:**

```toml
[tool.pytest.ini_options]
DJANGO_SETTINGS_MODULE = "app.settings"
python_files = ["tests.py", "test_*.py", "*_tests.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = [
    "-v",
    "--strict-markers",
    "--tb=short",
    "--cov=app",
    "--cov-report=term-missing",
]
markers = [
    "slow: marks tests as slow",
    "integration: marks tests as integration tests",
    "e2e: marks tests as end-to-end",
]
```

### Fixtures

**conftest.py:**

```python
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.fixture
def api_client():
    """API client for testing"""
    return APIClient()

@pytest.fixture
def user():
    """Create a test user"""
    return User.objects.create_user(
        email='test@example.com',
        password='testpass123',
        username='testuser'
    )

@pytest.fixture
def admin_rh_user():
    """Create an admin RH user"""
    return User.objects.create_user(
        email='admin@example.com',
        password='adminpass123',
        username='admin',
        role='admin_rh'
    )

@pytest.fixture
def authenticated_client(api_client, user):
    """Authenticated API client"""
    api_client.force_authenticate(user=user)
    return api_client

@pytest.fixture
def employee(user):
    """Create a test employee"""
    from employees.models import Employee
    return Employee.objects.create(
        user=user,
        full_name='Test User',
        position='Developer',
        department='Engineering'
    )
```

### Model Tests

**test_employee_model.py:**

```python
import pytest
from django.db.utils import IntegrityError
from employees.models import Employee

@pytest.mark.django_db
class TestEmployeeModel:
    
    def test_employee_creation(self, user):
        """Test creating an employee"""
        employee = Employee.objects.create(
            user=user,
            full_name='John Doe',
            position='Developer'
        )
        
        assert employee.id is not None
        assert employee.employee_id is not None
        assert employee.employee_id.startswith('EMP-')
        assert str(employee) == f'{employee.full_name} - {employee.employee_id}'
    
    def test_employee_id_auto_generation(self, user):
        """Test employee ID is auto-generated"""
        employee1 = Employee.objects.create(
            user=user,
            full_name='John Doe'
        )
        
        user2 = User.objects.create_user(
            email='test2@example.com',
            password='testpass'
        )
        employee2 = Employee.objects.create(
            user=user2,
            full_name='Jane Doe'
        )
        
        assert employee1.employee_id != employee2.employee_id
    
    def test_unique_cpf(self, user):
        """Test CPF uniqueness"""
        Employee.objects.create(
            user=user,
            full_name='John Doe',
            cpf='123.456.789-00'
        )
        
        user2 = User.objects.create_user(
            email='test2@example.com',
            password='testpass'
        )
        
        with pytest.raises(IntegrityError):
            Employee.objects.create(
                user=user2,
                full_name='Jane Doe',
                cpf='123.456.789-00'
            )
    
    def test_employee_status_default(self, user):
        """Test default status"""
        employee = Employee.objects.create(
            user=user,
            full_name='John Doe'
        )
        
        assert employee.status == 'pending'
    
    def test_employee_str_representation(self, employee):
        """Test string representation"""
        expected = f'{employee.full_name} - {employee.employee_id}'
        assert str(employee) == expected
```

### Serializer Tests

**test_employee_serializer.py:**

```python
import pytest
from employees.serializers import EmployeeSerializer

@pytest.mark.django_db
class TestEmployeeSerializer:
    
    def test_serializer_fields(self, employee):
        """Test serializer includes correct fields"""
        serializer = EmployeeSerializer(employee)
        
        assert 'id' in serializer.data
        assert 'employee_id' in serializer.data
        assert 'full_name' in serializer.data
        assert 'position' in serializer.data
        assert 'email' not in serializer.data  # Nested
    
    def test_serializer_validation(self, user):
        """Test serializer validation"""
        data = {
            'full_name': 'Test User',
            'position': 'Developer',
            'department': 'Engineering',
        }
        
        serializer = EmployeeSerializer(data=data)
        
        # Should fail - missing required fields
        assert not serializer.is_valid()
        assert 'user' in serializer.errors
    
    def test_serializer_create(self, user):
        """Test serializer create"""
        data = {
            'user': user.id,
            'full_name': 'Test User',
            'position': 'Developer',
            'department': 'Engineering',
            'salary': '5000.00',
        }
        
        serializer = EmployeeSerializer(data=data)
        assert serializer.is_valid()
        
        employee = serializer.save()
        assert employee.full_name == data['full_name']
```

### View/API Tests

**test_employee_api.py:**

```python
import pytest
from rest_framework import status
from employees.models import Employee

@pytest.mark.django_db
class TestEmployeeAPI:
    
    def test_list_employees_authenticated(self, authenticated_client, employee):
        """Test listing employees requires authentication"""
        url = '/api/v1/employees/'
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] >= 1
    
    def test_list_employees_unauthenticated(self, api_client):
        """Test listing employees requires authentication"""
        url = '/api/v1/employees/'
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_create_employee_admin_rh(self, api_client, admin_rh_user):
        """Test creating employee - admin RH only"""
        api_client.force_authenticate(user=admin_rh_user)
        
        url = '/api/v1/employees/'
        data = {
            'full_name': 'New Employee',
            'position': 'Developer',
            'department': 'Engineering',
        }
        
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Employee.objects.filter(full_name='New Employee').exists()
    
    def test_create_employee_funcionario(self, api_client, user):
        """Test funcionario cannot create employee"""
        api_client.force_authenticate(user=user)
        
        url = '/api/v1/employees/'
        data = {
            'full_name': 'New Employee',
            'position': 'Developer',
        }
        
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_retrieve_employee(self, authenticated_client, employee):
        """Test retrieving single employee"""
        url = f'/api/v1/employees/{employee.id}/'
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == employee.id
    
    def test_update_employee(self, authenticated_client, employee):
        """Test updating employee"""
        url = f'/api/v1/employees/{employee.id}/'
        data = {
            'position': 'Senior Developer',
            'salary': '6000.00',
        }
        
        response = authenticated_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        
        employee.refresh_from_db()
        assert employee.position == 'Senior Developer'
    
    def test_delete_employee(self, api_client, admin_rh_user, employee):
        """Test deleting employee"""
        api_client.force_authenticate(user=admin_rh_user)
        
        url = f'/api/v1/employees/{employee.id}/'
        response = api_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Employee.objects.filter(id=employee.id).exists()
```

### Service Tests

**test_leave_services.py:**

```python
import pytest
from datetime import date, timedelta
from leave_requests.services import calculate_leave_balance

@pytest.mark.django_db
class TestLeaveServices:
    
    def test_calculate_leave_balance(self, user):
        """Test leave balance calculation"""
        balance = calculate_leave_balance(user, year=2024)
        
        assert balance['available_days'] == 30
        assert balance['used_days'] == 0
        assert balance['remaining_days'] == 30
    
    def test_calculate_leave_balance_with_used_days(self, user, leave_request):
        """Test balance with used days"""
        balance = calculate_leave_balance(user, year=2024)
        
        assert balance['used_days'] == leave_request.dias_solicitados
        assert balance['remaining_days'] == 30 - leave_request.dias_solicitados
```

---

## ⚛️ Frontend Testing

### Jest Configuration

**frontend/jest.config.js:**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
  ],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
  ],
};
```

### Component Tests

**EmployeeList.test.tsx:**

```typescript
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmployeeList } from './EmployeeList';
import * as api from '../services/api';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('EmployeeList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    jest.spyOn(api, 'getEmployees').mockImplementation(() => new Promise(() => {}));
    
    render(<EmployeeList />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays employees after successful fetch', async () => {
    const mockEmployees = [
      { id: 1, full_name: 'John Doe', position: 'Developer' },
      { id: 2, full_name: 'Jane Smith', position: 'Designer' },
    ];
    
    jest.spyOn(api, 'getEmployees').mockResolvedValue({ data: mockEmployees });
    
    render(<EmployeeList />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('displays error message on fetch failure', async () => {
    jest.spyOn(api, 'getEmployees').mockRejectedValue(new Error('API Error'));
    
    render(<EmployeeList />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('handles search input', async () => {
    const mockEmployees = [
      { id: 1, full_name: 'John Doe', position: 'Developer' },
    ];
    
    jest.spyOn(api, 'getEmployees').mockResolvedValue({ data: mockEmployees });
    
    render(<EmployeeList />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    // Verify search is triggered
    await waitFor(() => {
      expect(api.getEmployees).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'John' })
      );
    });
  });
});
```

### Hook Tests

**useAuth.test.ts:**

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import * as authAPI from '../services/auth';

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('returns initial auth state', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('logs in successfully', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    const mockTokens = { access: 'token', refresh: 'refresh' };
    
    jest.spyOn(authAPI, 'login').mockResolvedValue({
      user: mockUser,
      ...mockTokens,
    });
    
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('access_token')).toBeTruthy();
  });

  it('handles login error', async () => {
    jest.spyOn(authAPI, 'login').mockRejectedValue(new Error('Invalid credentials'));
    
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrong');
      } catch (error) {
        // Expected
      }
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');
  });

  it('logs out successfully', async () => {
    localStorage.setItem('access_token', 'token');
    
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.logout();
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('access_token')).toBeNull();
  });
});
```

### Page Tests

**LoginPage.test.tsx:**

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import * as authAPI from '../services/auth';

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  it('renders login form', () => {
    renderLoginPage();
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderLoginPage();
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getAllByText(/required/i)).toHaveLength(2);
    });
  });

  it('submits form with valid data', async () => {
    jest.spyOn(authAPI, 'login').mockResolvedValue({
      user: { id: 1, email: 'test@example.com' },
      access: 'token',
      refresh: 'refresh',
    });
    
    renderLoginPage();
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });
  });
});
```

---

## 🔗 Integration Testing

### API Integration Tests

**test_leave_request_workflow.py:**

```python
import pytest
from rest_framework import status
from datetime import date, timedelta

@pytest.mark.django_db
class TestLeaveRequestWorkflow:
    
    def test_complete_leave_request_workflow(
        self,
        api_client,
        user,
        admin_rh_user,
        leave_type
    ):
        """Test complete leave request workflow"""
        
        # 1. Employee submits leave request
        api_client.force_authenticate(user=user)
        
        url = '/api/v1/leave-requests/'
        data = {
            'tipo': leave_type.id,
            'data_inicio': (date.today() + timedelta(days=30)).isoformat(),
            'data_fim': (date.today() + timedelta(days=44)).isoformat(),
            'motivo': 'Annual vacation',
            'prioridade': 'media',
        }
        
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        leave_request_id = response.data['id']
        
        # 2. Verify status is pending
        response = api_client.get(f'/api/v1/leave-requests/{leave_request_id}/')
        assert response.data['status'] == 'pendente'
        
        # 3. Admin approves request
        api_client.force_authenticate(user=admin_rh_user)
        
        url = f'/api/v1/leave-requests/{leave_request_id}/approve/'
        data = {'comentario': 'Approved!'}
        
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_200_OK
        
        # 4. Verify status is approved
        response = api_client.get(f'/api/v1/leave-requests/{leave_request_id}/')
        assert response.data['status'] == 'aprovada'
        
        # 5. Verify leave balance updated
        response = api_client.get('/api/v1/leave-requests/balances/')
        balance = next(
            b for b in response.data if b['tipo'] == leave_type.id
        )
        assert balance['dias_utilizados'] == 14
```

---

## 🎭 End-to-End Testing

### Playwright Setup

**frontend/tests/e2e/login.spec.ts:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should log in successfully', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Fill credentials
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'admin123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('http://localhost:3000/dashboard');
    
    // Verify logged in
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    await page.fill('[name="email"]', 'invalid@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});

test.describe('Employee Management', () => {
  test('should create new employee', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/dashboard');
    
    // Navigate to employees
    await page.click('text=Employees');
    await page.waitForURL('http://localhost:3000/employees');
    
    // Click create button
    await page.click('text=New Employee');
    
    // Fill form
    await page.fill('[name="full_name"]', 'Test Employee');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="position"]', 'Developer');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify creation
    await expect(page.locator('text=Test Employee')).toBeVisible();
  });
});
```

---

## 📊 Test Coverage

### Running Coverage Reports

**Backend:**

```bash
# Terminal coverage
pytest --cov=app --cov-report=term-missing

# HTML report
pytest --cov=app --cov-report=html

# Open report
open htmlcov/index.html  # macOS
start htmlcov/index.html  # Windows
```

**Frontend:**

```bash
cd frontend

# Run tests with coverage
npm test -- --coverage

# Open report
open coverage/index.html  # macOS
start coverage/index.html  # Windows
```

### Coverage Goals

| Component | Goal |
|-----------|------|
| **Models** | 90%+ |
| **Serializers** | 85%+ |
| **Views/APIs** | 80%+ |
| **Services** | 85%+ |
| **Components** | 70%+ |
| **Overall** | 80%+ |

---

## 🔄 Continuous Integration

### GitHub Actions Example

**.github/workflows/tests.yml:**

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      
      - name: Run tests
        run: |
          pytest --cov=app --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml

  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run tests
        run: |
          cd frontend
          npm test -- --coverage --ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./frontend/coverage/coverage-final.json
```

---

## ✅ Best Practices

### DO ✅

- Write tests before fixing bugs (TDD)
- Use descriptive test names
- Test edge cases
- Mock external dependencies
- Keep tests independent
- Use fixtures for common data
- Test both success and failure cases
- Run tests before committing
- Keep tests fast
- Document complex tests

### DON'T ❌

- Test implementation details
- Write tests that depend on each other
- Skip tests for "simple" code
- Hardcode sensitive data
- Write flaky tests
- Test only happy paths
- Ignore failing tests
- Write tests that are too large

---

## 📚 Related Documentation

- [Development Guide](development.md) - Development workflow
- [API Endpoints](api-endpoints.md) - API reference
- [Guidelines](guidelines.md) - Coding standards

---

## 🆘 Troubleshooting

### Common Issues

**Tests not discovered:**

```bash
# Ensure test files are named correctly
# test_*.py or *_tests.py

# Check pytest configuration
pytest --collect-only
```

**Database errors:**

```bash
# Ensure test database is created
pytest --create-db

# Use @pytest.mark.django_db decorator
```

**Import errors:**

```bash
# Ensure virtual environment is activated
# Install test dependencies
pip install pytest pytest-django pytest-cov
```

---

## 📖 Resources

- [pytest Documentation](https://docs.pytest.org/)
- [Django Testing](https://docs.djangoproject.com/en/stable/topics/testing/)
- [React Testing Library](https://testing-library.com/react/)
- [Jest Documentation](https://jestjs.io/)
- [Playwright](https://playwright.dev/)
