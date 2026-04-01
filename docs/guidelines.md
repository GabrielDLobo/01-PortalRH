# Guidelines & Standards

This document outlines the coding standards, conventions, and best practices for the PortalRH project.

---

## 📐 Code Style

### Python Style Guide

Follow **PEP 8** - Style Guide for Python Code:

- **Indentation:** 4 spaces (no tabs)
- **Line Length:** Maximum 100 characters
- **Imports:** Grouped and sorted
- **Naming Conventions:**
  - `snake_case` for functions, variables, and methods
  - `PascalCase` for classes
  - `UPPER_CASE` for constants
  - `_prefix` for private attributes

### Example

```python
# imports
from django.db import models
from rest_framework import serializers

# constants
MAX_EMPLOYEES_PER_PAGE = 50

# classes
class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer for Employee model."""
    
    # class attributes
    MAX_FILE_SIZE = 10 * 1024 * 1024
    
    # methods
    def validate_email(self, value):
        """Validate email format."""
        if not value.endswith('@company.com'):
            raise serializers.ValidationError("Invalid email domain")
        return value
```

---

## 🏗️ Django Conventions

### Model Guidelines

1. **Use descriptive model names** (singular, PascalCase)
2. **Define `__str__` method** for all models
3. **Use `verbose_name` and `verbose_name_plural`**
4. **Add docstrings** for models and methods
5. **Use `on_delete` explicitly** for all ForeignKey fields

```python
class Employee(models.Model):
    """Model representing an employee."""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('on_leave', 'On Leave'),
    ]
    
    full_name = models.CharField(max_length=255, verbose_name='Full Name')
    email = models.EmailField(unique=True, verbose_name='Email')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name='Status'
    )
    
    class Meta:
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'
        ordering = ['full_name']
    
    def __str__(self):
        return self.full_name
    
    @property
    def is_active(self):
        """Check if employee is active."""
        return self.status == 'active'
```

### View Guidelines

1. **Prefer ViewSets** for API endpoints
2. **Use mixins** for common behaviors
3. **Keep views thin** - business logic in models or services
4. **Use appropriate HTTP status codes**

```python
class EmployeeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing employees."""
    
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated, CanManageEmployee]
    
    def get_queryset(self):
        """Filter employees based on user role."""
        user = self.request.user
        if user.is_admin_rh:
            return Employee.objects.all()
        return Employee.objects.filter(user=user)
    
    def perform_create(self, serializer):
        """Set created_by automatically."""
        serializer.save(created_by=self.request.user)
```

### Serializer Guidelines

1. **One serializer per model** (with variants for specific cases)
2. **Use `read_only_fields`** for computed fields
3. **Validate in serializers**, not views
4. **Use nested serializers** sparingly

```python
class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer for Employee model."""
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'full_name', 'email', 'user_email',
            'department', 'department_name', 'position', 'status',
            'hire_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['employee_id', 'created_at', 'updated_at']
    
    def validate_cpf(self, value):
        """Validate CPF format."""
        if not cpf_validator.is_valid(value):
            raise serializers.ValidationError("Invalid CPF")
        return value
```

---

## 🔒 Security Guidelines

### Input Validation

- **Always validate user input** in serializers
- **Use Django forms/serializers** for validation
- **Never trust client-side validation**

### Authentication & Authorization

- **Use JWT tokens** for API authentication
- **Implement permission classes** for authorization
- **Check object-level permissions** in views

```python
class IsOwnerOrAdminRH(permissions.BasePermission):
    """Permission class for owner or admin access."""
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_rh:
            return True
        return obj.user == request.user
```

### Sensitive Data

- **Never log passwords or tokens**
- **Use Django's password hashing** (never store plain text)
- **Sanitize file uploads** (check extensions, size)

---

## 📝 Documentation Standards

### Code Comments

- **Comment WHY, not WHAT** - code should be self-explanatory
- **Use docstrings** for all public functions and classes
- **Keep comments up-to-date** with code changes

### Docstring Format

Use Google-style docstrings:

```python
def calculate_leave_balance(employee, year):
    """
    Calculate available leave days for an employee in a given year.
    
    Args:
        employee (Employee): The employee instance
        year (int): The year to calculate balance for
    
    Returns:
        int: Number of available leave days
    
    Raises:
        ValueError: If year is in the future
    """
    if year > datetime.now().year:
        raise ValueError("Cannot calculate for future years")
    
    # Implementation
    return balance
```

### API Documentation

- **Document all endpoints** with descriptions
- **Include request/response examples**
- **Specify authentication requirements**
- **Use OpenAPI/Swagger annotations**

---

## 🧪 Testing Guidelines

### Test Organization

```
tests/
├── __init__.py
├── test_models.py
├── test_serializers.py
├── test_views.py
├── test_permissions.py
└── test_integration.py
```

### Test Naming

```python
def test_employee_creation_success(self):
    """Test successful employee creation."""
    
def test_employee_cpf_must_be_unique(self):
    """Test CPF uniqueness validation."""
    
def test_leave_request_requires_approval(self):
    """Test leave request approval workflow."""
```

### Test Coverage

- **Models:** Test all methods and properties
- **Serializers:** Test validation logic
- **Views:** Test permissions and responses
- **Integration:** Test critical workflows

---

## 🔄 Version Control

### Git Workflow

1. **Main branch:** `main` (production-ready)
2. **Feature branches:** `feature/description`
3. **Bug fixes:** `fix/description`
4. **Hotfixes:** `hotfix/description`

### Commit Messages

Follow Conventional Commits:

```
feat: add employee document verification
fix: resolve leave balance calculation error
docs: update API endpoint documentation
style: format code according to PEP 8
refactor: extract validation logic to service
test: add unit tests for employee serializer
chore: update dependencies
```

### Pull Request Guidelines

1. **Small, focused PRs** (one feature/fix per PR)
2. **Descriptive title and description**
3. **Link related issues**
4. **Include tests**
5. **Update documentation**

---

## 📦 Dependency Management

### requirements.txt

- **Pin exact versions** for reproducibility
- **Group dependencies** logically
- **Add comments** for unclear dependencies

```txt
# Core Django
Django>=5.0.4,<5.1

# Django REST Framework
djangorestframework>=3.15.1
djangorestframework-simplejwt>=5.3.1

# Database
psycopg2-binary>=2.9.9

# Image Processing
Pillow>=10.3.0
```

### Updating Dependencies

```bash
# Check for outdated packages
pip list --outdated

# Update specific package
pip install package-name --upgrade

# Update all (use caution)
pip install --upgrade -r requirements.txt
```

---

## 🚀 Performance Guidelines

### Database Queries

- **Use `select_related`** for ForeignKey relationships
- **Use `prefetch_related`** for ManyToMany relationships
- **Avoid N+1 queries**
- **Add indexes** on frequently queried fields

```python
# Good
Employee.objects.select_related('user', 'department').all()

# Bad - causes N+1 queries
for employee in Employee.objects.all():
    print(employee.user.email)
```

### Caching

- **Cache expensive queries**
- **Use appropriate cache timeout**
- **Invalidate cache on updates**

```python
from django.core.cache import cache

def get_employee_stats(employee_id):
    cache_key = f'employee_stats_{employee_id}'
    stats = cache.get(cache_key)
    
    if stats is None:
        stats = calculate_expensive_stats(employee_id)
        cache.set(cache_key, stats, 3600)  # 1 hour
    
    return stats
```

---

## 🐛 Error Handling

### Exception Handling

- **Use specific exceptions** (not generic `Exception`)
- **Log errors** with appropriate context
- **Return meaningful error messages** to users

```python
from rest_framework.exceptions import ValidationError, NotFound

def get_employee_or_404(employee_id):
    try:
        return Employee.objects.get(id=employee_id)
    except Employee.DoesNotExist:
        raise NotFound(detail="Employee not found")
    except Exception as e:
        logger.error(f"Error fetching employee: {str(e)}")
        raise
```

### API Error Responses

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input data",
        "details": {
            "email": ["This field is required"],
            "cpf": ["Invalid CPF format"]
        }
    }
}
```

---

## 📊 Code Review Checklist

- [ ] Code follows style guide
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No sensitive data in logs
- [ ] Security considerations addressed
- [ ] Performance impact considered
- [ ] Error handling is adequate
- [ ] No hardcoded values (use settings)

---

**Next:** [Project Structure](project-structure.md)
