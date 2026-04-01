# Guidelines and Standards

This document outlines the coding standards, best practices, and guidelines for developing PortalRH.

---

## 📋 Table of Contents

- [Python Code Style](#python-code-style)
- [JavaScript/TypeScript Code Style](#javascripttypescript-code-style)
- [Git Workflow](#git-workflow)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Code Review Process](#code-review-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Standards](#documentation-standards)
- [Security Best Practices](#security-best-practices)
- [Performance Guidelines](#performance-guidelines)

---

## 🐍 Python Code Style

### General Guidelines

Follow [PEP 8](https://pep8.org/) style guide for Python code.

### Code Formatting

Use **Ruff** for linting and formatting:

```bash
# Lint code
ruff check .

# Format code
ruff format .

# Fix and format
ruff check --fix && ruff format .
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Variables** | snake_case | `user_name`, `total_count` |
| **Functions** | snake_case | `get_user_by_id()`, `calculate_salary()` |
| **Classes** | PascalCase | `Employee`, `LeaveRequest` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_LEAVE_DAYS`, `API_VERSION` |
| **Private** | Leading underscore | `_internal_method()`, `_private_var` |

### Type Hints

Use type hints for all function parameters and return values:

```python
from typing import Optional, List, Dict
from decimal import Decimal

def calculate_salary(
    base_salary: Decimal,
    bonus: Optional[Decimal] = None,
    deductions: List[Decimal] = None
) -> Decimal:
    """Calculate final salary after bonuses and deductions."""
    if deductions is None:
        deductions = []
    
    total = base_salary
    if bonus:
        total += bonus
    for deduction in deductions:
        total -= deduction
    return total
```

### Docstrings

Use Google-style docstrings:

```python
def approve_leave_request(
    request_id: int,
    approver: User,
    comments: str = ''
) -> LeaveRequest:
    """
    Approve a leave request.
    
    Args:
        request_id: ID of the leave request to approve
        approver: User approving the request
        comments: Optional approval comments
    
    Returns:
        Updated LeaveRequest instance
    
    Raises:
        ValidationError: If request cannot be approved
        PermissionDenied: If user lacks permission
    """
    pass
```

### Import Organization

Organize imports in this order:

1. Standard library imports
2. Third-party imports
3. Local application imports

```python
# Standard library
import os
from datetime import date, timedelta
from typing import Optional

# Third-party
from rest_framework import serializers
from django.db import models

# Local
from accounts.models import User
from employees.services import get_employee_profile
```

---

## 📜 JavaScript/TypeScript Code Style

### General Guidelines

Follow consistent TypeScript and React best practices.

### Code Formatting

Use **Prettier** and **ESLint**:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix issues
npm run lint:fix
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Variables** | camelCase | `userName`, `totalCount` |
| **Functions** | camelCase | `getUserById()`, `calculateSalary()` |
| **Components** | PascalCase | `EmployeeList`, `LeaveRequestForm` |
| **Constants** | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_FILE_SIZE` |
| **Types/Interfaces** | PascalCase | `Employee`, `LeaveRequest` |
| **Files** | kebab-case | `employee-list.tsx`, `leave-form.tsx` |

### TypeScript Best Practices

**Define interfaces for API responses:**

```typescript
interface Employee {
  id: number;
  fullName: string;
  email: string;
  position: string;
  department: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'pending';
}

interface ApiResponse<T> {
  data: T;
  count: number;
  next: string | null;
  previous: string | null;
}
```

**Use proper type annotations:**

```typescript
// Good
const calculateDays = (start: Date, end: Date): number => {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

// Avoid 'any'
const processData = (data: any) => {}; // Bad
const processData = (data: unknown) => {}; // Better
```

### React Component Structure

```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Types
interface EmployeeListProps {
  department?: string;
  status?: string;
}

// Component
export const EmployeeList: React.FC<EmployeeListProps> = ({
  department,
  status,
}) => {
  // State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Effects
  useEffect(() => {
    fetchEmployees();
  }, [department, status]);

  // Handlers
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Fetch logic
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/employees/${id}/edit`);
  };

  // Render
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="employee-list">
      {/* Component JSX */}
    </div>
  );
};
```

---

## 🌿 Git Workflow

### Branch Naming

| Branch Type | Pattern | Example |
|-------------|---------|---------|
| **Feature** | `feature/description` | `feature/employee-crud` |
| **Bug Fix** | `fix/description` | `fix/leave-balance-calculation` |
| **Hotfix** | `hotfix/description` | `hotfix/security-patch` |
| **Release** | `release/version` | `release/1.0.0` |
| **Documentation** | `docs/description` | `docs/api-documentation` |

### Workflow

```bash
# Create and checkout feature branch
git checkout -b feature/employee-crud

# Make changes and commit
git add .
git commit -m "feat: implement employee CRUD operations"

# Push to remote
git push origin feature/employee-crud

# Create Pull Request
# Wait for code review and approval
# Merge to main branch
```

### Protected Branches

- `main` - Production-ready code
- `develop` - Integration branch for features

---

## 📝 Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting) |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Build/config changes |
| `perf` | Performance improvements |
| `ci` | CI/CD changes |

### Examples

```bash
# Feature
feat(employees): add employee document upload functionality

# Bug fix
fix(leave-requests): correct leave balance calculation for weekends

# Documentation
docs(api): update authentication endpoint documentation

# Refactor
refactor(auth): simplify JWT token refresh logic

# Breaking change
feat(api)!: migrate to v2 API endpoints

BREAKING CHANGE: API v1 endpoints are deprecated
```

---

## 🔍 Code Review Process

### Review Checklist

**Code Quality:**
- [ ] Follows style guidelines
- [ ] No code duplication
- [ ] Proper error handling
- [ ] Type hints included

**Functionality:**
- [ ] Meets requirements
- [ ] Edge cases handled
- [ ] No breaking changes
- [ ] Backwards compatible

**Testing:**
- [ ] Tests included
- [ ] Tests passing
- [ ] Coverage maintained

**Documentation:**
- [ ] Code documented
- [ ] README updated if needed
- [ ] API docs updated

**Security:**
- [ ] No sensitive data exposed
- [ ] Input validation present
- [ ] Authentication checks included

### Review Process

1. Create Pull Request
2. Assign reviewers
3. Address review comments
4. Pass CI checks
5. Get approval
6. Merge to target branch

---

## 🧪 Testing Guidelines

### Python Testing

Use pytest for backend testing:

```python
# tests/test_employee_model.py
import pytest
from employees.models import Employee

@pytest.mark.django_db
class TestEmployeeModel:
    
    def test_employee_creation(self, user):
        employee = Employee.objects.create(
            user=user,
            full_name="Test User",
            position="Developer"
        )
        assert employee.employee_id is not None
        assert employee.employee_id.startswith("EMP-")
    
    def test_employee_str_representation(self, employee):
        expected = f"{employee.full_name} - {employee.employee_id}"
        assert str(employee) == expected
```

Run tests:

```bash
pytest
pytest --cov=app
pytest -v
```

### Frontend Testing

Use Jest and React Testing Library:

```typescript
// EmployeeList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { EmployeeList } from './EmployeeList';

describe('EmployeeList', () => {
  it('renders loading state initially', () => {
    render(<EmployeeList />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays employees after fetch', async () => {
    render(<EmployeeList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

Run tests:

```bash
npm test
npm test -- --coverage
```

---

## 📚 Documentation Standards

### Code Comments

**When to comment:**
- Complex business logic
- Non-obvious decisions
- API documentation
- Public interfaces

**When NOT to comment:**
- Obvious code
- What the code does (let code speak)

```python
# Good - explains why
# Using select_related to avoid N+1 query problem
employees = Employee.objects.select_related('user', 'department').all()

# Bad - states the obvious
# Get all employees
employees = Employee.objects.all()
```

### README Files

Every module should have a README.md:

```markdown
# Module Name

Brief description of the module's purpose.

## Features

- Feature 1
- Feature 2

## Usage

```python
from module import ClassName
```

## API Reference

### ClassName

Description...
```

---

## 🔒 Security Best Practices

### Authentication

- Always use JWT for API authentication
- Implement token refresh mechanism
- Set appropriate token expiration
- Validate tokens on every request

### Authorization

- Check permissions in every view
- Use decorators for role-based access
- Never trust client-side authorization

```python
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

@permission_classes([IsAuthenticated])
def protected_view(request):
    # Check additional permissions
    if not request.user.is_admin_rh:
        raise PermissionDenied()
```

### Data Validation

- Validate all input data
- Use serializers for validation
- Sanitize user input
- Never expose sensitive fields

```python
class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'full_name', 'email', 'position']
        # Exclude sensitive fields
        read_only_fields = ['user', 'created_at']
```

### Password Handling

- Use Django's password validators
- Hash passwords with PBKDF2
- Never log passwords
- Implement password strength requirements

---

## ⚡ Performance Guidelines

### Database Queries

**Use select_related for foreign keys:**

```python
# Bad - N+1 queries
employees = Employee.objects.all()
for emp in employees:
    print(emp.user.email)

# Good - 2 queries
employees = Employee.objects.select_related('user').all()
```

**Use prefetch_related for many-to-many:**

```python
# Good for M2M
employees = Employee.objects.prefetch_related('documents').all()
```

**Use only() and defer():**

```python
# Only fetch needed fields
employees = Employee.objects.only('id', 'full_name', 'email').all()
```

### Pagination

Always paginate large datasets:

```python
from rest_framework.pagination import PageNumberPagination

class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
```

### Caching

Use Django's cache framework:

```python
from django.core.cache import cache

def get_employee_data(employee_id):
    cache_key = f'employee_{employee_id}'
    data = cache.get(cache_key)
    
    if not data:
        data = fetch_from_db(employee_id)
        cache.set(cache_key, data, timeout=300)
    
    return data
```

### Frontend Performance

- Lazy load components
- Implement virtual scrolling for large lists
- Debounce API calls
- Use React.memo for expensive renders
- Optimize bundle size

---

## 📁 File Organization

### Backend

```
app_name/
├── __init__.py
├── models.py
├── serializers.py
├── views.py
├── urls.py
├── permissions.py
├── services.py
├── utils.py
└── tests/
    ├── __init__.py
    ├── test_models.py
    ├── test_views.py
    └── test_serializers.py
```

### Frontend

```
src/
├── components/
│   ├── common/
│   └── features/
├── pages/
├── hooks/
├── services/
├── types/
├── utils/
└── styles/
```

---

## 🎯 Best Practices Summary

### DO ✅

- Write tests for new features
- Use type hints
- Follow naming conventions
- Keep functions small and focused
- Use environment variables
- Log errors appropriately
- Handle errors gracefully
- Document complex logic
- Review your own code first
- Keep PRs small and focused

### DON'T ❌

- Commit .env files
- Hardcode credentials
- Write large functions
- Ignore type hints
- Skip tests
- Commit console.log in production
- Write commented-out code
- Use print() for debugging in production
- Ignore security warnings
- Merge without review

---

## 📚 Resources

- [PEP 8 Style Guide](https://pep8.org/)
- [Django Style Guide](https://docs.djangoproject.com/en/stable/internals/contributing/writing-code/coding-style/)
- [DRF Best Practices](https://www.django-rest-framework.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)

---

## 🆘 Getting Help

For questions about guidelines:

1. Review this document
2. Check existing code for patterns
3. Ask in code review
4. Consult team leads
