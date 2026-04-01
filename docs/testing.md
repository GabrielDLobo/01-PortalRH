# Testing

This document covers testing strategies, frameworks, and best practices for PortalRH.

---

## 🧪 Testing Framework

PortalRH uses Django's built-in testing framework with pytest support.

### Installed Testing Tools

```txt
# Testing dependencies
pytest>=7.0.0
pytest-django>=4.5.0
pytest-cov>=4.0.0
factory-boy>=3.2.0
model-bakery>=1.11.0
```

---

## 📁 Test Structure

```
<app_name>/
├── __init__.py
├── models.py
├── serializers.py
├── views.py
└── tests/
    ├── __init__.py
    ├── conftest.py          # Pytest fixtures
    ├── factories.py         # Factory Boy factories
    ├── test_models.py       # Model tests
    ├── test_serializers.py  # Serializer tests
    ├── test_views.py        # View/endpoint tests
    ├── test_permissions.py  # Permission tests
    └── test_integration.py  # Integration tests
```

---

## 🏃 Running Tests

### Basic Commands

```bash
# Run all tests
python manage.py test

# Run with pytest
pytest

# Run specific app
pytest employees/

# Run specific test file
pytest employees/tests/test_models.py

# Run specific test
pytest employees/tests/test_models.py::test_employee_creation

# Run with coverage
pytest --cov=.

# Run with verbose output
pytest -v

# Run tests matching pattern
pytest -k "employee"
```

### Coverage Report

```bash
# Generate coverage report
pytest --cov=. --cov-report=html

# Open coverage report
open htmlcov/index.html  # macOS/Linux
start htmlcov\index.html  # Windows

# Terminal report
pytest --cov=. --cov-report=term-missing
```

---

## 📝 Writing Tests

### Model Tests

```python
# tests/test_models.py
import pytest
from django.test import TestCase
from employees.models import Employee, EmployeeDocument

class EmployeeModelTest(TestCase):
    """Test Employee model."""
    
    def setUp(self):
        """Set up test data."""
        self.employee = Employee.objects.create(
            full_name='Test User',
            email='test@example.com',
            cpf='123.456.789-00',
            department='Engineering',
            position='Developer',
            salary=5000.00
        )
    
    def test_employee_creation(self):
        """Test employee is created with all fields."""
        self.assertEqual(self.employee.full_name, 'Test User')
        self.assertEqual(self.employee.email, 'test@example.com')
        self.assertIsNotNone(self.employee.employee_id)
        self.assertTrue(self.employee.employee_id.startswith('EMP-'))
    
    def test_employee_str_method(self):
        """Test string representation."""
        self.assertEqual(str(self.employee), 'Test User')
    
    def test_employee_is_active_property(self):
        """Test is_active property."""
        self.employee.status = 'active'
        self.assertTrue(self.employee.is_active)
        
        self.employee.status = 'inactive'
        self.assertFalse(self.employee.is_active)
    
    def test_employee_id_auto_generation(self):
        """Test employee_id is auto-generated."""
        employee2 = Employee.objects.create(
            full_name='Test User 2',
            email='test2@example.com',
            cpf='987.654.321-00'
        )
        self.assertTrue(employee2.employee_id.startswith('EMP-'))
    
    def test_cpf_must_be_unique(self):
        """Test CPF uniqueness."""
        with self.assertRaises(Exception):
            Employee.objects.create(
                full_name='Another User',
                email='another@example.com',
                cpf='123.456.789-00'  # Same as setUp
            )
```

### Serializer Tests

```python
# tests/test_serializers.py
import pytest
from rest_framework.test import APITestCase
from employees.serializers import EmployeeSerializer

class EmployeeSerializerTest(APITestCase):
    """Test Employee serializers."""
    
    def test_serializer_valid_data(self):
        """Test serializer with valid data."""
        data = {
            'full_name': 'Test User',
            'email': 'test@example.com',
            'cpf': '123.456.789-00',
            'department': 'Engineering',
            'position': 'Developer',
            'salary': '5000.00'
        }
        serializer = EmployeeSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_serializer_invalid_email(self):
        """Test serializer rejects invalid email."""
        data = {
            'full_name': 'Test User',
            'email': 'invalid-email',
            'cpf': '123.456.789-00'
        }
        serializer = EmployeeSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)
    
    def test_serializer_invalid_cpf(self):
        """Test serializer rejects invalid CPF."""
        data = {
            'full_name': 'Test User',
            'email': 'test@example.com',
            'cpf': 'invalid-cpf'
        }
        serializer = EmployeeSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('cpf', serializer.errors)
    
    def test_serializer_required_fields(self):
        """Test required fields validation."""
        serializer = EmployeeSerializer(data={})
        self.assertFalse(serializer.is_valid())
        self.assertIn('full_name', serializer.errors)
        self.assertIn('cpf', serializer.errors)
```

### View/API Tests

```python
# tests/test_views.py
import pytest
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from accounts.models import User
from employees.models import Employee

class EmployeeViewSetTest(APITestCase):
    """Test Employee API endpoints."""
    
    def setUp(self):
        """Set up test client and users."""
        self.client = APIClient()
        
        # Create admin user
        self.admin_user = User.objects.create_user(
            email='admin@portalrh.com',
            password='admin123',
            role='admin_rh'
        )
        
        # Create regular employee
        self.employee_user = User.objects.create_user(
            email='employee@portalrh.com',
            password='employee123',
            role='funcionario'
        )
        
        # Create employee profile
        self.employee = Employee.objects.create(
            user=self.employee_user,
            full_name='Employee User',
            cpf='123.456.789-00'
        )
    
    def test_list_employees_admin(self):
        """Test admin can list all employees."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/v1/employees/employees/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
    
    def test_list_employees_employee(self):
        """Test employee can list employees."""
        self.client.force_authenticate(user=self.employee_user)
        response = self.client.get('/api/v1/employees/employees/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_create_employee_admin(self):
        """Test admin can create employee."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            'full_name': 'New Employee',
            'email': 'new@example.com',
            'cpf': '987.654.321-00',
            'department': 'Marketing',
            'position': 'Designer'
        }
        
        response = self.client.post('/api/v1/employees/employees/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Employee.objects.count(), 2)
    
    def test_create_employee_not_allowed(self):
        """Test employee cannot create employee."""
        self.client.force_authenticate(user=self.employee_user)
        
        data = {
            'full_name': 'New Employee',
            'cpf': '987.654.321-00'
        }
        
        response = self.client.post('/api/v1/employees/employees/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_retrieve_employee(self):
        """Test retrieve employee detail."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.get(f'/api/v1/employees/employees/{self.employee.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'Employee User')
    
    def test_update_employee_admin(self):
        """Test admin can update employee."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {'position': 'Senior Developer'}
        response = self.client.patch(
            f'/api/v1/employees/employees/{self.employee.id}/',
            data
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.employee.refresh_from_db()
        self.assertEqual(self.employee.position, 'Senior Developer')
    
    def test_delete_employee_admin(self):
        """Test admin can delete employee."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.delete(
            f'/api/v1/employees/employees/{self.employee.id}/'
        )
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Employee.objects.count(), 0)
```

### Permission Tests

```python
# tests/test_permissions.py
import pytest
from rest_framework.test import APITestCase
from accounts.models import User
from app.permissions import IsAdminRH, IsOwnerOrAdminRH

class IsAdminRHPermissionTest(APITestCase):
    """Test IsAdminRH permission class."""
    
    def test_admin_rh_has_permission(self):
        """Test admin_rh user has permission."""
        admin = User.objects.create_user(
            email='admin@portalrh.com',
            role='admin_rh'
        )
        
        permission = IsAdminRH()
        request = type('obj', (object,), {'user': admin})()
        
        self.assertTrue(permission.has_permission(request, None))
    
    def test_funcionario_no_permission(self):
        """Test funcionario user doesn't have permission."""
        employee = User.objects.create_user(
            email='employee@portalrh.com',
            role='funcionario'
        )
        
        permission = IsAdminRH()
        request = type('obj', (object,), {'user': employee})()
        
        self.assertFalse(permission.has_permission(request, None))
    
    def test_anonymous_no_permission(self):
        """Test anonymous user doesn't have permission."""
        permission = IsAdminRH()
        request = type('obj', (object,), {'user': None})()
        
        self.assertFalse(permission.has_permission(request, None))
```

---

## 🏭 Factory Boy Fixtures

```python
# tests/factories.py
import factory
from factory.django import DjangoModelFactory
from accounts.models import User
from employees.models import Employee, EmployeeDocument

class UserFactory(DjangoModelFactory):
    """Factory for User model."""
    
    class Meta:
        model = User
    
    email = factory.Sequence(lambda n: f'user{n}@example.com')
    password = factory.PostGenerationMethodCall('set_password', 'defaultpassword')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    role = 'funcionario'
    is_active = True

class AdminUserFactory(UserFactory):
    """Factory for Admin RH user."""
    
    role = 'admin_rh'
    email = factory.Sequence(lambda n: f'admin{n}@portalrh.com')

class EmployeeFactory(DjangoModelFactory):
    """Factory for Employee model."""
    
    class Meta:
        model = Employee
    
    user = factory.SubFactory(UserFactory)
    full_name = factory.LazyAttribute(lambda obj: f"{obj.user.first_name} {obj.user.last_name}")
    cpf = factory.Sequence(lambda n: f'{n:3d}.{n:3d}.{n:3d}-{n:02d}')
    rg = factory.Sequence(lambda n: f'{n:2d}.{n:3d}.{n:3d}-{n}')
    department = factory.Iterator(['Engineering', 'Marketing', 'HR', 'Finance'])
    position = factory.Faker('job')
    salary = factory.Faker('pydecimal', left_digits=4, right_digits=2, positive=True)
    status = 'active'

class EmployeeDocumentFactory(DjangoModelFactory):
    """Factory for EmployeeDocument model."""
    
    class Meta:
        model = EmployeeDocument
    
    employee = factory.SubFactory(EmployeeFactory)
    document_type = factory.Iterator(['rg', 'cpf', 'birth_certificate'])
    document_name = factory.Faker('sentence', nb_words=3)
    is_required = True
    is_verified = False
```

### Using Factories in Tests

```python
# tests/test_models.py
import pytest
from .factories import EmployeeFactory, UserFactory

@pytest.mark.django_db
def test_employee_factory():
    """Test employee factory creates valid employee."""
    employee = EmployeeFactory.create()
    
    assert employee.full_name is not None
    assert employee.cpf is not None
    assert employee.employee_id is not None
    assert employee.status == 'active'

@pytest.mark.django_db
def test_create_multiple_employees():
    """Test creating multiple employees."""
    employees = EmployeeFactory.create_batch(5)
    
    assert len(employees) == 5
    assert Employee.objects.count() == 5
```

---

## 🔧 Pytest Fixtures

```python
# tests/conftest.py
import pytest
from accounts.models import User
from employees.models import Employee
from .factories import UserFactory, EmployeeFactory

@pytest.fixture
def api_client():
    """Return API client fixture."""
    from rest_framework.test import APIClient
    return APIClient()

@pytest.fixture
def admin_user():
    """Create admin user fixture."""
    return UserFactory.create(role='admin_rh')

@pytest.fixture
def employee_user():
    """Create employee user fixture."""
    return UserFactory.create(role='funcionario')

@pytest.fixture
def authenticated_client(api_client, admin_user):
    """Create authenticated API client."""
    api_client.force_authenticate(user=admin_user)
    return api_client

@pytest.fixture
def sample_employee():
    """Create sample employee fixture."""
    return EmployeeFactory.create()

@pytest.fixture
def leave_type():
    """Create leave type fixture."""
    from leave_requests.models import LeaveType
    return LeaveType.objects.create(
        nome='Vacation',
        max_dias_ano=30,
        requer_aprovacao=True
    )
```

### Using Fixtures

```python
def test_employee_list(authenticated_client, sample_employee):
    """Test employee list endpoint."""
    response = authenticated_client.get('/api/v1/employees/employees/')
    assert response.status_code == 200
    assert response.data['count'] == 1
```

---

## 🔄 Integration Tests

```python
# tests/test_integration.py
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from accounts.models import User
from employees.models import Employee, AdmissionProcess

class EmployeeAdmissionIntegrationTest(TestCase):
    """Integration tests for employee admission flow."""
    
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@portalrh.com',
            password='admin123',
            role='admin_rh'
        )
        self.client.force_authenticate(user=self.admin)
    
    def test_complete_admission_flow(self):
        """Test complete employee admission workflow."""
        # Step 1: Create pre-admission
        pre_admission_data = {
            'personal_email': 'newuser@example.com',
            'full_name': 'New Employee',
            'position': 'Developer',
            'department': 'Engineering',
            'salary': '5000.00',
            'start_date': '2024-06-01'
        }
        
        response = self.client.post(
            '/api/v1/employees/pre-admissions/',
            pre_admission_data
        )
        self.assertEqual(response.status_code, 201)
        pre_admission_id = response.data['id']
        
        # Step 2: Create employee account
        response = self.client.post(
            f'/api/v1/employees/pre-admissions/{pre_admission_id}/create_employee_account/'
        )
        self.assertEqual(response.status_code, 200)
        
        # Step 3: Login as new employee
        temporary_password = response.data['temporary_password']
        self.client.logout()
        self.client.login(
            email='newuser@example.com',
            password=temporary_password
        )
        
        # Step 4: Complete personal info
        employee = Employee.objects.get(email='newuser@example.com')
        personal_data = {
            'cpf': '123.456.789-00',
            'rg': '12.345.678-9',
            'birth_date': '1990-01-01',
            'phone': '(11) 99999-9999'
        }
        
        response = self.client.patch(
            f'/api/v1/employees/employees/{employee.id}/update_personal_info/',
            personal_data
        )
        self.assertEqual(response.status_code, 200)
        
        # Step 5: Upload documents
        # (File upload test would go here)
        
        # Step 6: HR approves
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            f'/api/v1/employees/admission-processes/{employee.id}/update_status/',
            {'status': 'approved'}
        )
        self.assertEqual(response.status_code, 200)
        
        # Verify final state
        employee.refresh_from_db()
        self.assertEqual(employee.status, 'active')
        self.assertTrue(employee.admission_completed)
```

---

## 📊 Test Coverage

### Coverage Configuration

```ini
# .coveragerc
[run]
source = .
omit = 
    */migrations/*
    */tests/*
    */__pycache__/*
    */venv/*
    manage.py
    app/settings.py
    app/urls.py

[report]
precision = 2
exclude_lines =
    pragma: no cover
    def __str__
    def __repr__
    raise NotImplementedError
    if TYPE_CHECKING:
    if DEBUG:
```

### Coverage Goals

| Component | Minimum Coverage |
|-----------|------------------|
| Models | 90% |
| Serializers | 85% |
| Views | 80% |
| Permissions | 95% |
| Services | 85% |
| Overall | 85% |

---

## 🚀 CI/CD Testing

### GitHub Actions Example

```yaml
# .github/workflows/tests.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
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
          python-version: '3.10'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      
      - name: Run migrations
        run: python manage.py migrate
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/postgres
      
      - name: Run tests
        run: pytest --cov=. --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
```

---

## 🐛 Debugging Tests

### Common Issues

**Test database not created:**
```python
@pytest.mark.django_db
def test_something():
    # This decorator is needed for database access
    pass
```

**Authentication not working:**
```python
def test_authenticated_endpoint():
    client = APIClient()
    client.force_authenticate(user=user)  # Use this for DRF
    # Don't use client.login() for JWT auth
```

**Fixture not found:**
```python
# Make sure conftest.py is in the tests directory
# Fixtures must be defined with @pytest.fixture decorator
```

---

## 📋 Test Checklist

Before merging code:

- [ ] All new features have tests
- [ ] All bug fixes have regression tests
- [ ] Model tests cover all methods
- [ ] Serializer tests cover validation
- [ ] View tests cover success and error cases
- [ ] Permission tests verify access control
- [ ] Tests pass locally
- [ ] Coverage meets minimum requirements
- [ ] No tests are skipped or marked as expected failures

---

**Next:** [Deploy](deploy.md)
