# Development Guide

This guide covers the development workflow, tools, and best practices for contributing to the Inventory Management System.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Running the Project](#running-the-project)
3. [Code Style & Linting](#code-style--linting)
4. [Database Management](#database-management)
5. [Working with Models](#working-with-models)
6. [Creating Views](#creating-views)
7. [API Development](#api-development)
8. [Template Development](#template-development)
9. [Debugging](#debugging)
10. [Common Tasks](#common-tasks)

---

## Development Environment Setup

### Prerequisites

Ensure you have the following installed:
- Python 3.11+
- Git
- PostgreSQL (for production-like development)
- Docker (optional, for containerized development)

### Clone and Setup

```bash
# Clone repository
git clone <repository-url>
cd 02-Inventory-Management-System

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Linux/macOS
source venv/bin/activate
# Windows
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements_dev.txt
```

### Development Tools

```bash
# Install development tools
pip install black isort flake8 pytest pytest-django django-debug-toolbar

# Optional but recommended
pip install ipython django-extensions
```

---

## Running the Project

### Development Server

```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver

# Access at http://127.0.0.1:8000
```

### Run with Debug Toolbar

```python
# app/settings.py
INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']

INTERNAL_IPS = ['127.0.0.1']
```

### Docker Development

```bash
# Build and run
docker-compose up -d --build

# View logs
docker-compose logs -f sge_web

# Run commands in container
docker-compose exec sge_web python manage.py migrate
docker-compose exec sge_web python manage.py runserver
```

---

## Code Style & Linting

### Configuration Files

**pyproject.toml:**
```toml
[tool.black]
line-length = 100
target-version = ['py311']
include = '\.pyi?$'
exclude = '''
/(
    \.git
    | venv
  | \.eggs
  | \.tox
  | migrations
)/
'''

[tool.isort]
profile = "black"
line_length = 100
skip = ["migrations", "venv"]
multi_line_output = 3
include_trailing_comma = true
```

**setup.cfg:**
```ini
[flake8]
max-line-length = 100
exclude = .git,__pycache__,migrations,venv
ignore = E203,W503
```

### Running Linters

```bash
# Format code
black .
isort .

# Check code quality
flake8

# Check types (if using mypy)
mypy .
```

### Pre-commit Hooks

```bash
# Install pre-commit
pip install pre-commit

# Create .pre-commit-config.yaml
cat > .pre-commit-config.yaml << EOF
repos:
  - repo: https://github.com/psf/black
    rev: 24.1.0
    hooks:
      - id: black
  - repo: https://github.com/pycqa/isort
    rev: 5.13.2
    hooks:
      - id: isort
  - repo: https://github.com/pycqa/flake8
    rev: 7.0.0
    hooks:
      - id: flake8
EOF

# Install hooks
pre-commit install
```

---

## Database Management

### Migrations

```bash
# Create migrations after model changes
python manage.py makemigrations

# Show SQL that will be run
python manage.py sqlmigrate products 0001

# Apply migrations
python manage.py migrate

# Check for unapplied migrations
python manage.py showmigrations

# Reset migrations (development only!)
python manage.py migrate products zero
python manage.py migrate
```

### Database Shell

```bash
# Access database shell
python manage.py dbshell

# PostgreSQL commands
\dt           # List tables
\d products_product  # Describe table
SELECT * FROM products_product;
```

### Load Test Data

```bash
# Create fixtures
python manage.py dumpdata products --indent 2 > products_fixture.json

# Load fixtures
python manage.py loaddata products_fixture.json
```

### Database Commands

```bash
# Create database dump
pg_dump -U postgres sge > backup.sql

# Restore database
psql -U postgres sge < backup.sql
```

---

## Working with Models

### Creating Models

```python
# products/models.py

from django.db import models
from categories.models import Category
from brands.models import Brand

class Product(models.Model):
    """Product model for inventory items."""
    
    title = models.CharField(max_length=500)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products'
    )
    brand = models.ForeignKey(
        Brand,
        on_delete=models.PROTECT,
        related_name='products'
    )
    description = models.TextField(blank=True, null=True)
    cost_price = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    selling_price = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    quantity = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['title']
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['category', 'brand']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def profit_margin(self):
        """Calculate profit margin percentage."""
        if self.cost_price:
            return ((self.selling_price - self.cost_price) / self.cost_price) * 100
        return 0
    
    def clean(self):
        """Validate model data."""
        if self.selling_price < self.cost_price:
            raise ValidationError('Selling price cannot be less than cost price')
```

### Model Methods

```python
class Product(models.Model):
    # ... fields ...
    
    def is_low_stock(self, threshold=10):
        """Check if product is low on stock."""
        return self.quantity < threshold
    
    def calculate_total_value(self):
        """Calculate total inventory value."""
        return self.cost_price * self.quantity
    
    def get_absolute_url(self):
        """Return URL for product detail."""
        return reverse('products:product_detail', kwargs={'pk': self.pk})
```

### Model Queries

```python
# Basic queries
Product.objects.all()
Product.objects.filter(category__name='Electronics')
Product.objects.exclude(quantity=0)

# Select related (optimize queries)
Product.objects.select_related('category', 'brand').all()

# Prefetch related (for reverse FK)
Category.objects.prefetch_related('products').all()

# Aggregation
from django.db.models import Sum, Avg, Count

Product.objects.aggregate(
    total_value=Sum('cost_price' * 'quantity'),
    avg_price=Avg('selling_price'),
    total_products=Count('id')
)

# Annotate
from django.db.models import F, ExpressionWrapper, DecimalField

Product.objects.annotate(
    profit=F('selling_price') - F('cost_price'),
    profit_percent=ExpressionWrapper(
        (F('selling_price') - F('cost_price')) / F('cost_price') * 100,
        output_field=DecimalField()
    )
)
```

---

## Creating Views

### Class-Based Views

```python
# products/views.py

from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from .models import Product
from .forms import ProductForm

class ProductListView(LoginRequiredMixin, PermissionRequiredMixin, ListView):
    """List all products."""
    model = Product
    template_name = 'products/product_list.html'
    permission_required = 'products.view_product'
    paginate_by = 20
    ordering = ['title']
    
    def get_queryset(self):
        queryset = Product.objects.select_related('category', 'brand')
        
        # Filter by search
        search = self.request.GET.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)
        
        # Filter by category
        category = self.request.GET.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.all()
        return context

class ProductDetailView(LoginRequiredMixin, PermissionRequiredMixin, DetailView):
    """Product detail view."""
    model = Product
    template_name = 'products/product_detail.html'
    permission_required = 'products.view_product'
    context_object_name = 'product'

class ProductCreateView(LoginRequiredMixin, PermissionRequiredMixin, CreateView):
    """Create new product."""
    model = Product
    form_class = ProductForm
    template_name = 'products/product_form.html'
    permission_required = 'products.add_product'
    success_url = reverse_lazy('products:product_list')
    
    def form_valid(self, form):
        messages.success(self.request, 'Product created successfully!')
        return super().form_valid(form)

class ProductUpdateView(LoginRequiredMixin, PermissionRequiredMixin, UpdateView):
    """Update product."""
    model = Product
    form_class = ProductForm
    template_name = 'products/product_form.html'
    permission_required = 'products.change_product'
    success_url = reverse_lazy('products:product_list')
    
    def form_valid(self, form):
        messages.success(self.request, 'Product updated successfully!')
        return super().form_valid(form)

class ProductDeleteView(LoginRequiredMixin, PermissionRequiredMixin, DeleteView):
    """Delete product."""
    model = Product
    template_name = 'products/product_confirm_delete.html'
    permission_required = 'products.delete_product'
    success_url = reverse_lazy('products:product_list')
    
    def delete(self, request, *args, **kwargs):
        messages.success(request, 'Product deleted successfully!')
        return super().delete(request, *args, **kwargs)
```

### Function-Based Views

```python
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib import messages
from .models import Product
from .forms import ProductForm

@login_required
@permission_required('products.view_product')
def product_list(request):
    """List all products."""
    products = Product.objects.select_related('category', 'brand').all()
    
    # Search
    search = request.GET.get('search')
    if search:
        products = products.filter(title__icontains=search)
    
    # Pagination
    paginator = Paginator(products, 20)
    page = request.GET.get('page')
    products = paginator.get_page(page)
    
    return render(request, 'products/product_list.html', {
        'products': products,
        'categories': Category.objects.all()
    })
```

---

## API Development

### Serializers

```python
# products/serializers.py

from rest_framework import serializers
from .models import Product, Category, Brand

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'description']

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    brand_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'category', 'brand',
            'category_id', 'brand_id',
            'description', 'cost_price', 'selling_price',
            'quantity', 'serie_number', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        if data['selling_price'] < data['cost_price']:
            raise serializers.ValidationError({
                'selling_price': 'Cannot be less than cost price'
            })
        return data
```

### ViewSets

```python
# products/views.py (API)

from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint for products.
    
    list: Return all products
    create: Create a new product
    retrieve: Return a specific product
    update: Update a product
    destroy: Delete a product
    """
    queryset = Product.objects.select_related('category', 'brand').all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'cost_price', 'selling_price', 'quantity', 'created_at']
```

### URL Routing

```python
# products/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'products'

# Web URLs
urlpatterns = [
    path('list/', views.ProductListView.as_view(), name='product_list'),
    path('create/', views.ProductCreateView.as_view(), name='product_create'),
    path('<int:pk>/detail/', views.ProductDetailView.as_view(), name='product_detail'),
    path('<int:pk>/update/', views.ProductUpdateView.as_view(), name='product_update'),
    path('<int:pk>/delete/', views.ProductDeleteView.as_view(), name='product_delete'),
]

# API URLs
router = DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product-api')

urlpatterns += [
    path('api/', include(router.urls)),
]
```

---

## Template Development

### Base Template Structure

```html
<!-- templates/base.html -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}SGE{% endblock %}</title>
    
    <!-- TailwindCSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    {% block extra_head %}{% endblock %}
</head>
<body class="bg-gray-900 text-white">
    {% include 'components/_sidebar.html' %}
    
    <div class="ml-64">
        {% include 'components/_header.html' %}
        
        <main class="p-6">
            {% if messages %}
                {% for message in messages %}
                    <div class="alert alert-{{ message.tags }} mb-4">
                        {{ message }}
                    </div>
                {% endfor %}
            {% endif %}
            
            {% block content %}{% endblock %}
        </main>
        
        {% include 'components/_footer.html' %}
    </div>
    
    {% block extra_js %}{% endblock %}
</body>
</html>
```

### Component Template

```html
<!-- templates/components/_sidebar.html -->

<aside class="fixed left-0 top-0 h-screen w-64 bg-gray-800">
    <div class="p-4">
        <h1 class="text-2xl font-bold text-purple-400">SGE</h1>
    </div>
    
    <nav class="mt-4">
        <a href="{% url 'home' %}" class="block px-4 py-2 hover:bg-gray-700">
            Dashboard
        </a>
        
        {% if perms.products.view_product %}
        <a href="{% url 'products:product_list' %}" class="block px-4 py-2 hover:bg-gray-700">
            Products
        </a>
        {% endif %}
        
        {% if perms.brands.view_brand %}
        <a href="{% url 'brands:brand_list' %}" class="block px-4 py-2 hover:bg-gray-700">
            Brands
        </a>
        {% endif %}
        
        <!-- More navigation items -->
    </nav>
</aside>
```

### Form Template

```html
<!-- templates/products/product_form.html -->

{% extends 'base.html' %}

{% block content %}
<div class="bg-gray-800 rounded-lg p-6">
    <h2 class="text-2xl font-bold mb-4">
        {% if object %}Edit Product{% else %}Create Product{% endif %}
    </h2>
    
    <form method="post" class="space-y-4">
        {% csrf_token %}
        
        {% for field in form %}
        <div>
            <label class="block text-sm font-medium mb-1">
                {{ field.label }}
            </label>
            {{ field }}
            {% if field.errors %}
                <p class="text-red-500 text-sm mt-1">{{ field.errors.0 }}</p>
            {% endif %}
        </div>
        {% endfor %}
        
        <div class="flex gap-2">
            <button type="submit" class="btn btn-primary">
                Save
            </button>
            <a href="{% url 'products:product_list' %}" class="btn btn-secondary">
                Cancel
            </a>
        </div>
    </form>
</div>
{% endblock %}
```

---

## Debugging

### Django Debug Toolbar

```bash
pip install django-debug-toolbar
```

```python
# app/settings.py
INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']

INTERNAL_IPS = ['127.0.0.1']

DEBUG_TOOLBAR_CONFIG = {
    'SHOW_TOOLBAR_CALLBACK': lambda request: DEBUG,
}
```

### Python Debugger

```python
import pdb

def my_function():
    pdb.set_trace()  # Breakpoint
    # Debug commands:
    # n (next)
    # s (step)
    # c (continue)
    # q (quit)
    # p variable (print)
```

### Logging

```python
import logging

logger = logging.getLogger(__name__)

def my_view(request):
    logger.debug('Debug message')
    logger.info('Info message')
    logger.warning('Warning message')
    logger.error('Error message')
    logger.critical('Critical message')
```

---

## Common Tasks

### Create New App

```bash
python manage.py startapp new_module
```

### Create Superuser

```bash
python manage.py createsuperuser
```

### Collect Static Files

```bash
python manage.py collectstatic
```

### Run Tests

```bash
python manage.py test
python manage.py test products
python manage.py test products.test_models
```

### Shell Plus (with django-extensions)

```bash
pip install django-extensions

# Add to INSTALLED_APPS
'django_extensions',

# Run
python manage.py shell_plus
# All models are auto-imported
```

### Export/Import Data

```bash
# Export
python manage.py dumpdata products --indent 2 > products.json

# Import
python manage.py loaddata products.json
```

### Check Code Quality

```bash
# Run all checks
python manage.py check

# Run linters
flake8 .
black --check .
isort --check-only .
```

---

**Next Steps**: 
- [Testing](testing.md) - Testing strategies
- [Deploy](deploy.md) - Deployment guide
