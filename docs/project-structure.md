# Project Structure

This document provides a comprehensive overview of the project's directory structure and file organization.

## Table of Contents

1. [Root Structure](#root-structure)
2. [Application Structure](#application-structure)
3. [Core Modules](#core-modules)
4. [Configuration Files](#configuration-files)
5. [File Descriptions](#file-descriptions)

---

## Root Structure

```
02-Inventory-Management-System/
├── .dockerignore              # Docker ignore patterns
├── .flake8                    # Flake8 linting configuration
├── .gitignore                 # Git ignore patterns
├── cron/                      # Scheduled tasks/cron jobs
├── docker-compose.yml         # Docker Compose configuration
├── Dockerfile                 # Docker image configuration
├── manage.py                  # Django management script
├── pyproject.toml             # Python project configuration
├── README.md                  # Project readme
├── requirements.txt           # Python dependencies
├── requirements_dev.txt       # Development dependencies
│
├── docs/                      # Documentation (this folder)
│   ├── index.md
│   ├── overview.md
│   ├── prerequisites.md
│   ├── installation.md
│   ├── configuration.md
│   ├── guidelines.md
│   ├── project-structure.md
│   ├── api-endpoints.md
│   ├── system-modeling.md
│   ├── authentication-security.md
│   ├── development.md
│   ├── testing.md
│   ├── deploy.md
│   ├── contribution.md
│   └── release-notes.md
│
├── ai/                        # AI/ML module (OpenAI integration)
├── app/                       # Main Django app (dashboard, settings)
├── authentication/            # Authentication API module
├── brands/                    # Brands management module
├── categories/                # Categories management module
├── inflows/                   # Stock inflows module
├── outflows/                  # Stock outflows module
├── products/                  # Products management module
├── suppliers/                 # Suppliers management module
└── services/                  # External services (webhooks, notifications)
```

---

## Application Structure

### `/ai/` - AI Integration Module

```
ai/
├── __init__.py
├── agent.py           # OpenAI API integration class
├── models.py          # AIResult model
├── prompts.py         # AI prompts and templates
├── admin.py           # Admin configuration
├── apps.py            # App configuration
├── tests.py           # Tests
└── views.py           # AI-related views
```

**Key Files:**
- `agent.py` - `SGEAgent` class that interfaces with OpenAI
- `prompts.py` - System and user prompts for AI analysis
- `models.py` - `AIResult` model to store AI insights

---

### `/app/` - Main Application Module

```
app/
├── __init__.py
├── settings.py        # Django settings
├── urls.py            # Main URL routing
├── views.py           # Dashboard views
├── metrics.py         # Metrics and analytics functions
├── admin.py           # Admin configuration
├── apps.py            # App configuration
├── wsgi.py            # WSGI configuration
│
├── templates/
│   ├── base.html              # Base template
│   ├── home.html              # Dashboard home
│   ├── login.html             # Login page
│   │
│   ├── components/
│   │   ├── _header.html       # Header component
│   │   ├── _sidebar.html      # Sidebar navigation
│   │   ├── _footer.html       # Footer component
│   │   ├── _pagination.html   # Pagination component
│   │   ├── _product_metrics.html   # Product metrics cards
│   │   ├── _sales_metrics.html     # Sales metrics cards
│   │   └── _ai_result.html         # AI insights display
│   │
│   └── registration/
│       └── login.html       # Login template
│
└── static/
    ├── css/
    ├── js/
    └── images/
```

**Key Files:**
- `settings.py` - All Django configuration
- `urls.py` - Main URL router
- `metrics.py` - Dashboard metrics calculations
- `templates/base.html` - Base template with TailwindCSS

---

### `/authentication/` - Authentication Module

```
authentication/
├── __init__.py
├── serializers.py     # JWT serializers
├── urls.py            # Authentication URLs
├── views.py           # Auth views
├── admin.py
├── apps.py
├── models.py
└── tests.py
```

**Key Files:**
- `serializers.py` - Token obtain/refresh serializers
- `urls.py` - JWT token endpoints

---

### `/brands/` - Brands Module

```
brands/
├── __init__.py
├── models.py          # Brand model
├── serializers.py     # Brand serializer
├── urls.py            # Brand URLs
├── views.py           # Brand views (API + Web)
├── forms.py           # Brand forms
├── admin.py           # Admin configuration
├── apps.py
├── tests.py
│
└── templates/
    └── brands/
        ├── brand_list.html
        ├── brand_create.html
        ├── brand_detail.html
        ├── brand_update.html
        └── brand_delete.html
```

**Key Files:**
- `models.py` - `Brand` model
- `views.py` - CRUD views for brands
- `templates/brands/` - Brand templates

---

### `/categories/` - Categories Module

```
categories/
├── __init__.py
├── models.py          # Category model
├── serializers.py     # Category serializer
├── urls.py            # Category URLs
├── views.py           # Category views
├── forms.py           # Category forms
├── admin.py
├── apps.py
├── tests.py
│
└── templates/
    └── categories/
        ├── category_list.html
        ├── category_create.html
        ├── category_detail.html
        ├── category_update.html
        └── category_delete.html
```

---

### `/suppliers/` - Suppliers Module

```
suppliers/
├── __init__.py
├── models.py          # Supplier model
├── serializers.py     # Supplier serializer
├── urls.py            # Supplier URLs
├── views.py           # Supplier views
├── forms.py           # Supplier forms
├── admin.py
├── apps.py
├── tests.py
│
└── templates/
    └── suppliers/
        ├── supplier_list.html
        ├── supplier_create.html
        ├── supplier_detail.html
        ├── supplier_update.html
        └── supplier_delete.html
```

---

### `/products/` - Products Module

```
products/
├── __init__.py
├── models.py          # Product model
├── serializers.py     # Product serializer
├── urls.py            # Product URLs
├── views.py           # Product views
├── forms.py           # Product forms
├── admin.py
├── apps.py
├── tests.py
│
└── templates/
    └── products/
        ├── product_list.html
        ├── product_create.html
        ├── product_detail.html
        ├── product_update.html
        └── product_delete.html
```

**Key Files:**
- `models.py` - `Product` model with price/quantity tracking
- `views.py` - Full CRUD views
- `forms.py` - Product forms with validation

---

### `/inflows/` - Stock Inflows Module

```
inflows/
├── __init__.py
├── models.py          # Inflow model
├── serializers.py     # Inflow serializer
├── urls.py            # Inflow URLs
├── views.py           # Inflow views
├── forms.py           # Inflow forms
├── admin.py
├── apps.py
├── signals.py         # Signal handlers (auto-update quantity)
├── tests.py
│
└── templates/
    └── inflows/
        ├── inflow_list.html
        ├── inflow_create.html
        └── inflow_detail.html
```

**Key Files:**
- `models.py` - `Inflow` model
- `signals.py` - Auto-update product quantity on inflow

---

### `/outflows/` - Stock Outflows Module

```
outflows/
├── __init__.py
├── models.py          # Outflow model
├── serializers.py     # Outflow serializer
├── urls.py            # Outflow URLs
├── views.py           # Outflow views
├── forms.py           # Outflow forms
├── admin.py
├── apps.py
├── signals.py         # Signal handlers + webhook trigger
├── tests.py
│
└── templates/
    └── outflows/
        ├── outflow_list.html
        ├── outflow_create.html
        └── outflow_detail.html
```

**Key Files:**
- `models.py` - `Outflow` model
- `signals.py` - Auto-update quantity + webhook trigger

---

### `/services/` - External Services

```
services/
├── __init__.py
└── notify.py          # Webhook notification service
```

**Key Files:**
- `notify.py` - `Notify` class for sending webhooks

---

### `/cron/` - Scheduled Tasks

```
cron/
└── (scheduled task scripts)
```

---

## Core Modules

### Models Overview

| Module | Model | Description |
|--------|-------|-------------|
| `brands/` | `Brand` | Product brands |
| `categories/` | `Category` | Product categories |
| `suppliers/` | `Supplier` | Product suppliers |
| `products/` | `Product` | Inventory products |
| `inflows/` | `Inflow` | Stock entries |
| `outflows/` | `Outflow` | Stock exits |
| `ai/` | `AIResult` | AI insights |

---

## Configuration Files

### `manage.py`
Django's command-line utility for administrative tasks.

```python
#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
```

### `docker-compose.yml`
Docker Compose configuration for multi-container setup.

```yaml
version: '3.8'
services:
  sge_web:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - sge_db
  
  sge_db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### `Dockerfile`
Docker image configuration.

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

### `requirements.txt`
Python dependencies.

```
Django==5.0.1
djangorestframework==3.15.1
djangorestframework-simplejwt==5.3.1
openai==1.38.0
psycopg2-binary==2.9.10
django-widget-tweaks==1.5.0
httpx==0.28.1
pydantic==2.10.6
```

### `pyproject.toml`
Python project configuration (black, isort, etc.).

---

## File Descriptions

### Root Files

| File | Purpose |
|------|---------|
| `.dockerignore` | Files to exclude from Docker build |
| `.flake8` | Linting rules configuration |
| `.gitignore` | Files to exclude from Git |
| `docker-compose.yml` | Docker services orchestration |
| `Dockerfile` | Docker image build instructions |
| `manage.py` | Django CLI utility |
| `requirements.txt` | Production dependencies |
| `requirements_dev.txt` | Development dependencies |
| `pyproject.toml` | Python tool configuration |
| `README.md` | Project overview |

### Application Files

| File | Purpose |
|------|---------|
| `app/settings.py` | Django configuration |
| `app/urls.py` | Main URL routing |
| `app/views.py` | Dashboard views |
| `app/metrics.py` | Analytics functions |
| `*/models.py` | Database models |
| `*/views.py` | Request handlers |
| `*/serializers.py` | API data serializers |
| `*/forms.py` | Django forms |
| `*/admin.py` | Admin panel config |
| `*/signals.py` | Django signal handlers |
| `*/urls.py` | App URL patterns |

---

## Template Hierarchy

```
templates/
├── base.html              # Base template (all pages extend this)
│   ├── includes/
│   │   ├── _header.html   # Top navigation
│   │   ├── _sidebar.html  # Side navigation
│   │   └── _footer.html   # Footer
│   │
│   └── Pages:
│       ├── home.html              # Dashboard
│       ├── registration/login.html # Login page
│       │
│       ├── brands/                # Brand pages
│       ├── categories/            # Category pages
│       ├── suppliers/             # Supplier pages
│       ├── products/              # Product pages
│       ├── inflows/               # Inflow pages
│       └── outflows/              # Outflow pages
```

---

## URL Structure

```
/                              # Root (redirects to login/home)
/login/                        # Login page
/logout/                       # Logout
/home/                         # Dashboard
/admin/                        # Django admin

/api/v1/
├── authentication/
│   ├── token/                 # Get JWT token
│   ├── token/refresh/         # Refresh token
│   └── token/verify/          # Verify token
├── brands/
├── categories/
├── suppliers/
├── products/
├── inflows/
└── outflows/

/brands/list/
/brands/create/
/brands/<pk>/detail/
/brands/<pk>/update/
/brands/<pk>/delete/

# Similar patterns for categories, suppliers, products, inflows, outflows
```

---

## Database Schema

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Brand     │     │  Category   │     │  Supplier   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ name        │     │ name        │     │ name        │
│ description │     │ description │     │ description │
│ created_at  │     │ created_at  │     │ created_at  │
│ updated_at  │     │ updated_at  │     │ updated_at  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│                     Product                          │
├─────────────────────────────────────────────────────┤
│ id                                                   │
│ title                                                │
│ description                                          │
│ cost_price                                           │
│ selling_price                                        │
│ quantity                                             │
│ serie_number                                         │
│ brand_id (FK)                                        │
│ category_id (FK)                                     │
│ created_at                                           │
│ updated_at                                           │
└─────────────────────────────────────────────────────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐ ┌─────────────┐
│   Inflow    │ │   Outflow   │
├─────────────┤ ├─────────────┤
│ id          │ │ id          │
│ quantity    │ │ quantity    │
│ description │ │ description │
│ supplier_id │ │ product_id  │
│ product_id  │ │ created_at  │
│ created_at  │ │ updated_at  │
│ updated_at  │ └─────────────┘
└─────────────┘
```

---

**Next Steps**: 
- [API Endpoints](api-endpoints.md) - Complete API reference
- [System Modeling](system-modeling.md) - Architecture diagrams
