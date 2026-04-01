# Guidelines and Standards

This document outlines the coding standards, best practices, and guidelines for contributing to the Inventory Management System.

## Table of Contents

1. [Python Style Guide](#python-style-guide)
2. [Django Best Practices](#django-best-practices)
3. [Code Organization](#code-organization)
4. [Naming Conventions](#naming-conventions)
5. [Documentation Standards](#documentation-standards)
6. [Git Workflow](#git-workflow)
7. [Commit Message Guidelines](#commit-message-guidelines)
8. [Testing Guidelines](#testing-guidelines)
9. [Security Guidelines](#security-guidelines)
10. [Performance Guidelines](#performance-guidelines)

---

## Python Style Guide

### Code Formatting

Follow **PEP 8** - Python Style Guide:

- **Indentation**: 4 spaces (no tabs)
- **Line Length**: Maximum 100 characters
- **Imports**: Group and sort imports
- **Blank Lines**: 2 between functions/classes, 1 between methods

### Tools

```bash
# Install formatting tools
pip install black isort flake8

# Format code
black .
isort .

# Check code quality
flake8
```

### Configuration

**pyproject.toml** or **setup.cfg**:

```toml
[tool.black]
line-length = 100
target-version = ['py311']
include = '\.pyi?$'

[tool.isort]
profile = "black"
line_length = 100
multi_line_output = 3
include_trailing_comma = true
```

### Example

```python
# ✅ Good
from django.db import models
from rest_framework import serializers

class Product(models.Model):
    title = models.CharField(max_length=500)
    price = models.DecimalField(max_digits=20, decimal_places=2)
    
    def __str__(self):
        return self.title
    
    def calculate_profit(self):
        """Calculate profit margin."""
        return self.selling_price - self.cost_price

# ❌ Bad
from django.db import models
from rest_framework import serializers

class product(models.Model):  # lowercase class name
    Title=models.CharField(max_length=500)  # no spacing
    def __str__(self):return self.Title  # one-liner
```

---

## Django Best Practices

### Model Design

```python
# ✅ Good
class Product(models.Model):
    title = models.CharField(max_length=500)
    category = models.ForeignKey(
        Category, 
        on_delete=models.PROTECT,
        related_name='products'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['title']
        verbose_name_plural = 'Products'
    
    def __str__(self):
        return self.title
    
    def clean(self):
        if self.selling_price < self.cost_price:
            raise ValidationError('Selling price cannot be less than cost price')

# ❌ Bad
class Product(models.Model):
    title = models.CharField(max_length=500)
    category = models.ForeignKey(Category)  # No on_delete
    # No __str__, no Meta, no timestamps
```

### View Design

```python
# ✅ Good - Class-based views
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.views.generic import ListView, CreateView, UpdateView

class ProductListView(LoginRequiredMixin, PermissionRequiredMixin, ListView):
    model = Product
    template_name = 'products/product_list.html'
    permission_required = 'products.view_product'
    paginate_by = 20
    
    def get_queryset(self):
        return Product.objects.select_related('category', 'brand').all()

# ✅ Good - Function-based views
from django.contrib.auth.decorators import login_required, permission_required

@login_required
@permission_required('products.view_product')
def product_detail(request, pk):
    product = get_object_or_404(Product.objects.select_related('category'), pk=pk)
    return render(request, 'products/product_detail.html', {'product': product})

# ❌ Bad
def product_view(request):
    products = Product.objects.all()  # No authentication, no pagination
    return render(request, 'products.html', {'products': products})
```

### Query Optimization

```python
# ✅ Good - Use select_related for ForeignKey
products = Product.objects.select_related('category', 'brand').all()

# ✅ Good - Use prefetch_related for ManyToMany
products = Product.objects.prefetch_related('categories').all()

# ✅ Good - Use only() to limit fields
products = Product.objects.only('title', 'price').all()

# ❌ Bad - N+1 query problem
products = Product.objects.all()
for product in products:
    print(product.category.name)  # Hits database each iteration
```

---

## Code Organization

### File Structure

```
app_name/
├── __init__.py
├── models.py          # Database models
├── views.py           # Views
├── urls.py            # URL routing
├── serializers.py     # DRF serializers
├── forms.py           # Django forms
├── admin.py           # Admin configuration
├── signals.py         # Signal handlers
├── tests/
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_views.py
│   └── test_serializers.py
├── templates/
│   └── app_name/
│       ├── list.html
│       └── detail.html
└── migrations/
```

### Imports Order

```python
# 1. Standard library imports
import os
import json
from datetime import datetime

# 2. Third-party imports
from django.db import models
from rest_framework import serializers
import httpx

# 3. Local application imports
from products.models import Product
from .serializers import ProductSerializer
```

---

## Naming Conventions

### General Rules

| Type | Convention | Example |
|------|------------|---------|
| **Variables** | snake_case | `product_price` |
| **Functions** | snake_case | `calculate_total()` |
| **Classes** | PascalCase | `ProductSerializer` |
| **Methods** | snake_case | `get_absolute_url()` |
| **Constants** | UPPER_SNAKE | `MAX_PRODUCTS` |
| **Private** | _prefix | `_internal_method()` |

### Model Naming

```python
# ✅ Good
class Product(models.Model):
    pass

class OrderItem(models.Model):
    pass

# ❌ Bad
class products(models.Model):  # lowercase
class Order_Items(models.Model):  # underscores
```

### URL Pattern Naming

```python
# ✅ Good
urlpatterns = [
    path('products/', ProductListView.as_view(), name='product_list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product_detail'),
]

# In templates
{% url 'product_list' %}
{% url 'product_detail' pk=product.id %}

# ❌ Bad
path('products/', ProductListView.as_view())  # No name
```

---

## Documentation Standards

### Docstrings

Use Google-style docstrings:

```python
def calculate_profit(cost_price, selling_price, quantity):
    """
    Calculate total profit for given product.
    
    Args:
        cost_price (Decimal): Product cost price
        selling_price (Decimal): Product selling price
        quantity (int): Number of units sold
    
    Returns:
        Decimal: Total profit amount
    
    Raises:
        ValueError: If selling_price < cost_price
    
    Example:
        >>> calculate_profit(10.00, 15.00, 100)
        500.00
    """
    if selling_price < cost_price:
        raise ValueError('Selling price cannot be less than cost price')
    
    return (selling_price - cost_price) * quantity
```

### Model Documentation

```python
class Product(models.Model):
    """
    Product model representing items in inventory.
    
    Attributes:
        title (str): Product name
        category (ForeignKey): Product category
        brand (ForeignKey): Product brand
        cost_price (Decimal): Purchase cost
        selling_price (Decimal): Sale price
        quantity (int): Current stock quantity
    
    Methods:
        calculate_profit(): Calculate profit margin
        is_low_stock(): Check if stock is below threshold
    """
    # Model fields...
```

---

## Git Workflow

### Branch Strategy

```
main (production)
  └── develop (staging)
        └── feature/feature-name
        └── bugfix/bug-description
        └── hotfix/critical-fix
```

### Workflow

```bash
# Create feature branch
git checkout develop
git checkout -b feature/add-export-functionality

# Make changes and commit
git add .
git commit -m "feat: add export to CSV functionality"

# Push and create PR
git push origin feature/add-export-functionality

# After PR approval
git checkout develop
git pull origin develop
git branch -d feature/add-export-functionality
```

---

## Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
# ✅ Good
feat(products): add bulk import functionality
fix(auth): resolve JWT token expiration issue
docs(readme): update installation instructions
refactor(inflows): optimize database queries
test(products): add unit tests for serializers

# ❌ Bad
fixed stuff
updated code
bug fix
```

---

## Testing Guidelines

### Test Organization

```
tests/
├── test_models.py
├── test_views.py
├── test_serializers.py
├── test_forms.py
└── test_integration.py
```

### Test Naming

```python
# ✅ Good
def test_product_creation():
    pass

def test_product_str_representation():
    pass

def test_product_profit_calculation():
    pass

# ❌ Bad
def test_1():
    pass

def test_product():
    pass
```

### Test Example

```python
from django.test import TestCase
from products.models import Product
from categories.models import Category

class ProductModelTest(TestCase):
    """Test Product model."""
    
    def setUp(self):
        self.category = Category.objects.create(name='Electronics')
        self.product = Product.objects.create(
            title='Laptop',
            category=self.category,
            cost_price=500.00,
            selling_price=800.00,
            quantity=10
        )
    
    def test_product_creation(self):
        """Test product is created correctly."""
        self.assertEqual(self.product.title, 'Laptop')
        self.assertEqual(self.product.quantity, 10)
    
    def test_profit_calculation(self):
        """Test profit calculation."""
        profit = self.product.selling_price - self.product.cost_price
        self.assertEqual(profit, 300.00)
```

---

## Security Guidelines

### Input Validation

```python
# ✅ Good - Use Django forms
class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ['title', 'price']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
        }

# ✅ Good - Validate in serializer
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
    
    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError('Price cannot be negative')
        return value

# ❌ Bad - No validation
def create_product(request):
    title = request.POST.get('title')  # No validation
    price = request.POST.get('price')  # No validation
```

### SQL Injection Prevention

```python
# ✅ Good - Use ORM
products = Product.objects.filter(title__icontains=search_term)

# ❌ Bad - Raw SQL (vulnerable)
products = Product.objects.raw(
    f"SELECT * FROM products WHERE title LIKE '%{search_term}%'"
)
```

### XSS Prevention

```python
# ✅ Good - Django templates auto-escape
{{ user_input }}

# ✅ Good - Explicit escaping
from django.utils.html import escape
safe_input = escape(user_input)

# ❌ Bad - Marking unsafe as safe
{{ user_input|safe }}  # Only if absolutely necessary
```

---

## Performance Guidelines

### Database Optimization

```python
# ✅ Good - Batch operations
products_to_create = [
    Product(title=f'Product {i}', price=10.00)
    for i in range(100)
]
Product.objects.bulk_create(products_to_create)

# ❌ Bad - Individual saves
for i in range(100):
    Product.objects.create(title=f'Product {i}', price=10.00)
```

### Caching

```python
from django.core.cache import cache

# ✅ Good - Cache expensive operations
def get_expensive_data():
    data = cache.get('expensive_data')
    if data is None:
        data = calculate_expensive_data()
        cache.set('expensive_data', data, 3600)  # 1 hour
    return data
```

### Lazy Loading

```python
# ✅ Good - Use iterators for large querysets
for product in Product.objects.all().iterator():
    process(product)

# ❌ Bad - Load all into memory
for product in Product.objects.all():
    process(product)
```

---

## Code Review Checklist

Before submitting code:

- [ ] Code follows PEP 8 standards
- [ ] All tests pass
- [ ] New code has tests
- [ ] Documentation is updated
- [ ] No sensitive data in code
- [ ] Database queries are optimized
- [ ] Error handling is implemented
- [ ] Commit messages follow guidelines
- [ ] No debug statements left in code
- [ ] Security considerations addressed

---

**Next Steps**: 
- [Project Structure](project-structure.md) - Understand the codebase
- [Development](development.md) - Development workflow
