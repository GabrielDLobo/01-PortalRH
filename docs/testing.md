# Testing Guide

This guide covers testing strategies, frameworks, and best practices for the Inventory Management System.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Test Configuration](#test-configuration)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [API Tests](#api-tests)
6. [Frontend Tests](#frontend-tests)
7. [Running Tests](#running-tests)
8. [Test Coverage](#test-coverage)
9. [Best Practices](#best-practices)

---

## Testing Overview

### Test Pyramid

```
        /\
       /  \
      / E2E \      Few tests (slow, expensive)
     /--------\
    /          \
   / Integration \   Some tests
  /----------------\
 /                  \
/     Unit Tests     \  Many tests (fast, cheap)
----------------------
```

### Testing Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| **pytest** | Test framework | `pip install pytest` |
| **pytest-django** | Django integration | `pip install pytest-django` |
| **factory-boy** | Test data generation | `pip install factory-boy` |
| **coverage.py** | Coverage reporting | `pip install coverage` |
| **pytest-cov** | Coverage plugin | `pip install pytest-cov` |

---

## Test Configuration

### pytest Configuration

**pytest.ini** or **pyproject.toml**:

```ini
# pytest.ini

[pytest]
DJANGO_SETTINGS_MODULE = app.settings
python_files = tests.py test_*.py *_tests.py
python_classes = Test*
python_functions = test_*
addopts = 
    -v
    --tb=short
    --strict-markers
    -rf
```

```toml
# pyproject.toml

[tool.pytest.ini_options]
DJANGO_SETTINGS_MODULE = "app.settings"
python_files = ["tests.py", "test_*.py", "*_tests.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = [
    "-v",
    "--tb=short",
    "--strict-markers",
    "-rf",
]
```

### Test Settings

**tests/conftest.py**:

```python
import pytest
from django.contrib.auth.models import User, Group, Permission
from products.models import Product, Category, Brand
from suppliers.models import Supplier
from inflows.models import Inflow
from outflows.models import Outflow


@pytest.fixture
def db():
    """Use Django test database."""
    pass


@pytest.fixture
def user():
    """Create a test user."""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )


@pytest.fixture
def admin_user():
    """Create an admin user."""
    return User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='adminpass123'
    )


@pytest.fixture
def category():
    """Create a test category."""
    return Category.objects.create(
        name='Electronics',
        description='Electronic products'
    )


@pytest.fixture
def brand():
    """Create a test brand."""
    return Brand.objects.create(
        name='Samsung',
        description='Korean electronics brand'
    )


@pytest.fixture
def supplier():
    """Create a test supplier."""
    return Supplier.objects.create(
        name='Tech Distributors',
        description='Main supplier'
    )


@pytest.fixture
def product(category, brand):
    """Create a test product."""
    return Product.objects.create(
        title='Galaxy S23',
        category=category,
        brand=brand,
        cost_price=500.00,
        selling_price=799.99,
        quantity=50
    )


@pytest.fixture
def authenticated_client(client, user):
    """Create an authenticated test client."""
    client.force_login(user)
    return client


@pytest.fixture
def api_client():
    """Create an API test client."""
    from rest_framework.test import APIClient
    return APIClient()


@pytest.fixture
def authenticated_api_client(api_client, user):
    """Create an authenticated API client."""
    from rest_framework_simplejwt.tokens import RefreshToken
    
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client
```

---

## Unit Tests

### Model Tests

**products/tests/test_models.py**:

```python
import pytest
from django.core.exceptions import ValidationError
from products.models import Product


@pytest.mark.django_db
class TestProductModel:
    """Test Product model."""
    
    def test_product_creation(self, category, brand):
        """Test product is created correctly."""
        product = Product.objects.create(
            title='Test Product',
            category=category,
            brand=brand,
            cost_price=10.00,
            selling_price=20.00,
            quantity=100
        )
        
        assert product.title == 'Test Product'
        assert product.cost_price == 10.00
        assert product.selling_price == 20.00
        assert product.quantity == 100
    
    def test_product_str_representation(self, category, brand):
        """Test product string representation."""
        product = Product.objects.create(
            title='Test Product',
            category=category,
            brand=brand,
            cost_price=10.00,
            selling_price=20.00,
            quantity=100
        )
        
        assert str(product) == 'Test Product'
    
    def test_profit_margin_calculation(self, category, brand):
        """Test profit margin calculation."""
        product = Product.objects.create(
            title='Test Product',
            category=category,
            brand=brand,
            cost_price=100.00,
            selling_price=150.00,
            quantity=10
        )
        
        profit = product.selling_price - product.cost_price
        assert profit == 50.00
    
    def test_low_stock_detection(self, category, brand):
        """Test low stock detection."""
        product = Product.objects.create(
            title='Test Product',
            category=category,
            brand=brand,
            cost_price=10.00,
            selling_price=20.00,
            quantity=5
        )
        
        assert product.is_low_stock(threshold=10) is True
        assert product.is_low_stock(threshold=3) is False
    
    def test_selling_price_less_than_cost(self, category, brand):
        """Test validation when selling price < cost price."""
        product = Product(
            title='Invalid Product',
            category=category,
            brand=brand,
            cost_price=100.00,
            selling_price=50.00,  # Less than cost
            quantity=10
        )
        
        with pytest.raises(ValidationError):
            product.full_clean()
    
    def test_unique_serie_number(self, category, brand):
        """Test unique serie number constraint."""
        Product.objects.create(
            title='Product 1',
            category=category,
            brand=brand,
            cost_price=10.00,
            selling_price=20.00,
            serie_number='SN123'
        )
        
        duplicate = Product(
            title='Product 2',
            category=category,
            brand=brand,
            cost_price=10.00,
            selling_price=20.00,
            serie_number='SN123'  # Duplicate
        )
        
        with pytest.raises(Exception):  # IntegrityError
            duplicate.full_clean()
```

### Form Tests

**products/tests/test_forms.py**:

```python
import pytest
from products.forms import ProductForm


@pytest.mark.django_db
class TestProductForm:
    """Test Product form."""
    
    def test_valid_form(self, category, brand):
        """Test form with valid data."""
        form = ProductForm(data={
            'title': 'Test Product',
            'category': category.id,
            'brand': brand.id,
            'cost_price': '10.00',
            'selling_price': '20.00',
            'quantity': 100
        })
        
        assert form.is_valid()
    
    def test_invalid_form_missing_fields(self):
        """Test form with missing required fields."""
        form = ProductForm(data={})
        
        assert not form.is_valid()
        assert 'title' in form.errors
        assert 'cost_price' in form.errors
        assert 'selling_price' in form.errors
    
    def test_invalid_negative_price(self, category, brand):
        """Test form with negative price."""
        form = ProductForm(data={
            'title': 'Test Product',
            'category': category.id,
            'brand': brand.id,
            'cost_price': '-10.00',
            'selling_price': '20.00',
            'quantity': 100
        })
        
        assert not form.is_valid()
        assert 'cost_price' in form.errors
    
    def test_invalid_selling_less_than_cost(self, category, brand):
        """Test form when selling price < cost price."""
        form = ProductForm(data={
            'title': 'Test Product',
            'category': category.id,
            'brand': brand.id,
            'cost_price': '100.00',
            'selling_price': '50.00',
            'quantity': 100
        })
        
        assert not form.is_valid()
```

---

## Integration Tests

### View Tests

**products/tests/test_views.py**:

```python
import pytest
from django.urls import reverse
from products.models import Product


@pytest.mark.django_db
class TestProductViews:
    """Test Product views."""
    
    def test_product_list_view(self, authenticated_client, product):
        """Test product list view."""
        url = reverse('products:product_list')
        response = authenticated_client.get(url)
        
        assert response.status_code == 200
        assert 'products' in response.context
        assert product in response.context['products']
    
    def test_product_list_view_unauthorized(self, client):
        """Test product list view requires login."""
        url = reverse('products:product_list')
        response = client.get(url)
        
        assert response.status_code == 302  # Redirect to login
        assert '/login/' in response.url
    
    def test_product_detail_view(self, authenticated_client, product):
        """Test product detail view."""
        url = reverse('products:product_detail', kwargs={'pk': product.pk})
        response = authenticated_client.get(url)
        
        assert response.status_code == 200
        assert response.context['product'] == product
    
    def test_product_create_view(self, authenticated_client, category, brand):
        """Test product create view."""
        url = reverse('products:product_create')
        data = {
            'title': 'New Product',
            'category': category.id,
            'brand': brand.id,
            'cost_price': '10.00',
            'selling_price': '20.00',
            'quantity': 100
        }
        
        response = authenticated_client.post(url, data, follow=True)
        
        assert response.status_code == 200
        assert Product.objects.filter(title='New Product').exists()
    
    def test_product_update_view(self, authenticated_client, product):
        """Test product update view."""
        url = reverse('products:product_update', kwargs={'pk': product.pk})
        data = {
            'title': 'Updated Product',
            'category': product.category.id,
            'brand': product.brand.id,
            'cost_price': '15.00',
            'selling_price': '25.00',
            'quantity': 150
        }
        
        response = authenticated_client.post(url, data, follow=True)
        
        assert response.status_code == 200
        product.refresh_from_db()
        assert product.title == 'Updated Product'
        assert product.quantity == 150
    
    def test_product_delete_view(self, authenticated_client, product):
        """Test product delete view."""
        url = reverse('products:product_delete', kwargs={'pk': product.pk})
        
        response = authenticated_client.post(url, follow=True)
        
        assert response.status_code == 200
        assert not Product.objects.filter(pk=product.pk).exists()
```

### Signal Tests

**inflows/tests/test_signals.py**:

```python
import pytest
from inflows.models import Inflow
from outflows.models import Outflow


@pytest.mark.django_db
class TestStockSignals:
    """Test stock movement signals."""
    
    def test_inflow_increases_product_quantity(self, product, supplier):
        """Test that creating inflow increases product quantity."""
        initial_quantity = product.quantity
        
        Inflow.objects.create(
            supplier=supplier,
            product=product,
            quantity=50,
            description='Restock'
        )
        
        product.refresh_from_db()
        assert product.quantity == initial_quantity + 50
    
    def test_outflow_decreases_product_quantity(self, product):
        """Test that creating outflow decreases product quantity."""
        initial_quantity = product.quantity
        
        Outflow.objects.create(
            product=product,
            quantity=20,
            description='Sale'
        )
        
        product.refresh_from_db()
        assert product.quantity == initial_quantity - 20
    
    def test_outflow_prevented_when_insufficient_stock(self, product):
        """Test that outflow is prevented when stock is insufficient."""
        product.quantity = 10
        product.save()
        
        with pytest.raises(Exception):  # Or specific validation error
            Outflow.objects.create(
                product=product,
                quantity=50,  # More than available
                description='Invalid sale'
            )
```

---

## API Tests

**products/tests/test_api.py**:

```python
import pytest
from rest_framework import status
from django.urls import reverse


@pytest.mark.django_db
class TestProductAPI:
    """Test Product API endpoints."""
    
    def test_list_products(self, authenticated_api_client, product):
        """Test listing products."""
        url = reverse('product-api-list')
        response = authenticated_api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1
        assert len(response.data['results']) == 1
    
    def test_create_product(self, authenticated_api_client, category, brand):
        """Test creating a product via API."""
        url = reverse('product-api-list')
        data = {
            'title': 'API Product',
            'category_id': category.id,
            'brand_id': brand.id,
            'cost_price': '10.00',
            'selling_price': '20.00',
            'quantity': 100
        }
        
        response = authenticated_api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'API Product'
    
    def test_retrieve_product(self, authenticated_api_client, product):
        """Test retrieving a single product."""
        url = reverse('product-api-detail', kwargs={'pk': product.pk})
        response = authenticated_api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == product.title
    
    def test_update_product(self, authenticated_api_client, product):
        """Test updating a product via API."""
        url = reverse('product-api-detail', kwargs={'pk': product.pk})
        data = {
            'title': 'Updated via API',
            'category_id': product.category.id,
            'brand_id': product.brand.id,
            'cost_price': '15.00',
            'selling_price': '25.00',
            'quantity': 150
        }
        
        response = authenticated_api_client.put(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        product.refresh_from_db()
        assert product.title == 'Updated via API'
    
    def test_delete_product(self, authenticated_api_client, product):
        """Test deleting a product via API."""
        url = reverse('product-api-detail', kwargs={'pk': product.pk})
        
        response = authenticated_api_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Product.objects.filter(pk=product.pk).exists()
    
    def test_unauthenticated_access(self, api_client, product):
        """Test that unauthenticated access is denied."""
        url = reverse('product-api-list')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_search_products(self, authenticated_api_client, product):
        """Test searching products."""
        url = reverse('product-api-list')
        response = authenticated_api_client.get(url, {'search': 'Galaxy'})
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1
    
    def test_filter_by_category(self, authenticated_api_client, product, category):
        """Test filtering products by category."""
        url = reverse('product-api-list')
        response = authenticated_api_client.get(url, {'category': category.id})
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1


@pytest.mark.django_db
class TestAuthenticationAPI:
    """Test Authentication API endpoints."""
    
    def test_obtain_token(self, api_client, user):
        """Test obtaining JWT token."""
        url = reverse('authentication:token_obtain_pair')
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
    
    def test_refresh_token(self, authenticated_api_client):
        """Test refreshing JWT token."""
        # First, get a refresh token
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(authenticated_api_client.handler._user)
        
        url = reverse('authentication:token_refresh')
        data = {'refresh': str(refresh)}
        
        response = authenticated_api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
    
    def test_invalid_credentials(self, api_client):
        """Test authentication with invalid credentials."""
        url = reverse('authentication:token_obtain_pair')
        data = {
            'username': 'wronguser',
            'password': 'wrongpass'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest products/tests/test_models.py

# Run specific test class
pytest products/tests/test_models.py::TestProductModel

# Run specific test function
pytest products/tests/test_models.py::TestProductModel::test_product_creation

# Run tests matching keyword
pytest -k "test_product"

# Run tests by marker
pytest -m django_db

# Run with coverage
pytest --cov=.

# Run with HTML coverage report
pytest --cov=. --cov-report=html

# Open coverage report
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
start htmlcov\\index.html  # Windows
```

### Test Markers

```python
# Mark tests in conftest.py or pytest.ini

# In pytest.ini
[pytest]
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
    api: marks tests as API tests

# Usage
@pytest.mark.slow
def test_slow_operation():
    pass

@pytest.mark.integration
def test_integration():
    pass

# Run only marked tests
pytest -m slow
pytest -m integration
```

### Parallel Testing

```bash
# Install pytest-xdist
pip install pytest-xdist

# Run tests in parallel
pytest -n auto  # Auto-detect CPU count
pytest -n 4     # Use 4 workers
```

---

## Test Coverage

### Configuration

**.coveragerc**:

```ini
[run]
source = .
omit = 
    */migrations/*
    */tests/*
    */venv/*
    */__pycache__/*
    manage.py
    app/settings.py
    */admin.py

[report]
exclude_lines =
    pragma: no cover
    def __str__
    raise NotImplementedError
    if DEBUG:
    if settings.DEBUG:

[html]
directory = htmlcov
```

### Coverage Commands

```bash
# Run tests with coverage
coverage run -m pytest
coverage report

# Show missing lines
coverage report -m

# Generate HTML report
coverage html

# Generate XML report (for CI/CD)
coverage xml

# Check minimum coverage
coverage report --fail-under=80
```

### Coverage Badge

Add to README.md:

```markdown
![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)
```

---

## Best Practices

### Test Naming

```python
# ✅ Good
def test_product_creation():
    pass

def test_product_str_representation():
    pass

def test_profit_margin_calculation():
    pass

# ❌ Bad
def test_1():
    pass

def test_product():
    pass
```

### Arrange-Act-Assert Pattern

```python
def test_product_profit_calculation(self, category, brand):
    # Arrange
    product = Product.objects.create(
        title='Test Product',
        category=category,
        brand=brand,
        cost_price=100.00,
        selling_price=150.00,
        quantity=10
    )
    
    # Act
    profit = product.selling_price - product.cost_price
    
    # Assert
    assert profit == 50.00
```

### Test Isolation

```python
# ✅ Good - Each test is independent
@pytest.mark.django_db
class TestProduct:
    def test_creation(self):
        product = Product.objects.create(...)
        assert product.title == 'Test'
    
    def test_update(self):
        product = Product.objects.create(...)
        product.title = 'Updated'
        product.save()
        assert product.title == 'Updated'

# ❌ Bad - Tests depend on each other
@pytest.mark.django_db
class TestProduct:
    def test_creation(self):
        self.product = Product.objects.create(...)
    
    def test_update(self):
        self.product.title = 'Updated'  # Depends on test_creation
```

### Fixtures Over Setup

```python
# ✅ Good - Using fixtures
def test_product(product, category, brand):
    assert product.category == category

# ❌ Bad - Using setUp
class TestProduct:
    def setUp(self):
        self.category = Category.objects.create(...)
        self.product = Product.objects.create(...)
    
    def test_something(self):
        # Test code
```

### Test Data Guidelines

```python
# ✅ Good - Realistic test data
product = Product.objects.create(
    title='Samsung Galaxy S23',
    cost_price=Decimal('500.00'),
    selling_price=Decimal('799.99'),
    quantity=50
)

# ❌ Bad - Unrealistic data
product = Product.objects.create(
    title='a',
    cost_price=1,
    selling_price=2,
    quantity=1
)
```

---

## CI/CD Integration

### GitHub Actions

**.github/workflows/tests.yml**:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
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
          pip install -r requirements.txt
          pip install -r requirements_dev.txt
      
      - name: Run tests
        run: |
          pytest --cov=. --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
```

---

**Next Steps**: 
- [Deploy](deploy.md) - Deployment guide
- [Contribution](contribution.md) - How to contribute
