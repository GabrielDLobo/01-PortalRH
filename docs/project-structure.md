# Project Structure

This document provides a comprehensive overview of the PortalRH directory structure and file organization.

## Table of Contents

1. [Root Structure](#root-structure)
2. [Application Structure](#application-structure)
3. [Core Modules](#core-modules)
4. [Configuration Files](#configuration-files)
5. [File Descriptions](#file-descriptions)

---

## Root Structure

<pre><code>01-PortalRH/
├── .gitignore
├── db.sqlite3
├── docker-compose.yml
├── manage.py
├── mkdocs.yml
├── nginx.conf
├── pyproject.toml
├── README.md
├── requirements.txt
│
├── docs/                      # Documentation source
├── site/                      # Generated static docs
├── app/                       # Django project settings
├── accounts/                  # Authentication and users
├── employees/                 # Employee management
├── evaluations/               # Performance evaluations
├── leave_requests/            # Leave request workflows
├── reports/                   # Reporting and analytics
├── staff/                     # Staff/department management
├── termination/               # Offboarding workflows
├── frontend/                  # React + TypeScript frontend
├── media/                     # Uploaded files
└── logs/                      # Application logs</code></pre>

---

## Application Structure

### `/app/` - Main Django Configuration

<pre><code>app/
├── __init__.py
├── asgi.py
├── permissions.py
├── settings.py
├── urls.py
└── wsgi.py</code></pre>

Key files:
- `settings.py` - global Django settings
- `urls.py` - root router and app includes
- `permissions.py` - custom DRF permission classes

---

### `/accounts/` - Authentication Module

<pre><code>accounts/
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── tests.py
├── urls.py
└── views.py</code></pre>

Purpose:
- JWT login/refresh/verify
- user registration/profile flows
- role-aware access boundaries

---

### `/employees/` - Employee Management

<pre><code>employees/
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── services.py
├── tests.py
├── urls.py
└── views.py</code></pre>

Main entities:
- Employee
- EmployeeDocument
- Admission process related records

---

### `/evaluations/` - Evaluation Module

<pre><code>evaluations/
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── tests.py
├── urls.py
└── views.py</code></pre>

Main entities:
- EvaluationTemplate
- EvaluationCriteria
- Evaluation
- EvaluationScore
- EvaluationCycle

---

### `/leave_requests/` - Leave Module

<pre><code>leave_requests/
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── tests.py
├── urls.py
└── views.py</code></pre>

Main entities:
- LeaveType
- LeaveRequest
- LeaveBalance

---

### `/reports/` - Reports Module

<pre><code>reports/
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── services.py
├── tests.py
├── urls.py
└── views.py</code></pre>

Main entities:
- ReportCategory
- ReportTemplate
- ReportExecution
- ReportSchedule
- ReportBookmark

---

### `/staff/` - Staff Module

<pre><code>staff/
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── tests.py
├── urls.py
└── views.py</code></pre>

Main entities:
- Department
- Staff employee profiles

---

### `/termination/` - Offboarding Module

<pre><code>termination/
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── tests.py
├── urls.py
└── views.py</code></pre>

Main entities:
- TerminationReason
- TerminationRequest
- TerminationDocument

---

### `/frontend/` - Frontend Application

<pre><code>frontend/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── pages/
│   ├── components/
│   ├── services/
│   ├── contexts/
│   ├── utils/
│   └── types/
└── public/</code></pre>

---

## Core Modules

| Module | Responsibility |
|---|---|
| accounts | Authentication, users, authorization |
| employees | Employee records and admission lifecycle |
| evaluations | Evaluation templates, cycles and scoring |
| leave_requests | Leave request process and balances |
| reports | Reporting templates, execution and export |
| staff | Departments and internal staff management |
| termination | Termination flow and documentation |

---

## Configuration Files

### `manage.py`
Entry point for Django administrative commands.

### `docker-compose.yml`
Container orchestration for local/prod-like environments.

### `mkdocs.yml`
Documentation navigation, theme, markdown extensions.

### `requirements.txt`
Python dependency list.

### `pyproject.toml`
Tooling and project metadata.

---

## File Descriptions

### Root Files

| File | Purpose |
|---|---|
| README.md | Project overview and startup instructions |
| manage.py | Django command-line utility |
| docker-compose.yml | Service orchestration |
| mkdocs.yml | Documentation configuration |
| requirements.txt | Backend dependencies |

### Common App Files

| File | Purpose |
|---|---|
| models.py | Data schema definitions |
| serializers.py | API payload validation/representation |
| views.py | Request handlers |
| urls.py | Module routing |
| services.py | Business logic (where used) |
| tests.py | Automated tests |

---

## URL Structure

<pre><code>/api/v1/
├── accounts/
├── employees/
├── evaluations/
├── leave-requests/
├── reports/
├── staff/
└── termination/</code></pre>

---

Next: [API Endpoints](api-endpoints.md)
