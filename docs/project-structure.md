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

```text
01-PortalRH/
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
└── logs/                      # Application logs
```

---

## Application Structure

### `/app/` - Main Django Configuration

```text
app/
├── __init__.py
├── asgi.py
├── permissions.py
├── settings.py
├── urls.py
└── wsgi.py
```

Key files:
- `settings.py` - global Django settings
- `urls.py` - root router and app includes
- `permissions.py` - custom DRF permission classes

---

### `/accounts/` - Authentication Module

```text
accounts/
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── tests.py
├── urls.py
└── views.py
```

Purpose:
- JWT login/refresh/verify
- user registration/profile flows
- role-aware access boundaries

---

### `/employees/` - Employee Management

```text
employees/
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── services.py
├── tests.py
├── urls.py
└── views.py
```

Main entities:
- Employee
- EmployeeDocument
- Admission process related records

---

### `/evaluations/` - Evaluation Module

```text
evaluations/
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── tests.py
├── urls.py
└── views.py
```

Main entities:
- EvaluationTemplate
- EvaluationCriteria
- Evaluation
- EvaluationScore
- EvaluationCycle

---

### `/leave_requests/` - Leave Module

```text
leave_requests/
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── tests.py
├── urls.py
└── views.py
```

Main entities:
- LeaveType
- LeaveRequest
- LeaveBalance

---

### `/reports/` - Reports Module

```text
reports/
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── services.py
├── tests.py
├── urls.py
└── views.py
```

Main entities:
- ReportCategory
- ReportTemplate
- ReportExecution
- ReportSchedule
- ReportBookmark

---

### `/staff/` - Staff Module

```text
staff/
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── tests.py
├── urls.py
└── views.py
```

Main entities:
- Department
- Staff employee profiles

---

### `/termination/` - Offboarding Module

```text
termination/
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── tests.py
├── urls.py
└── views.py
```

Main entities:
- TerminationReason
- TerminationRequest
- TerminationDocument

---

### `/frontend/` - Frontend Application

```text
frontend/
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
└── public/
```

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

```text
/api/v1/
├── accounts/
├── employees/
├── evaluations/
├── leave-requests/
├── reports/
├── staff/
└── termination/
```

---

Next: [API Endpoints](api-endpoints.md)
