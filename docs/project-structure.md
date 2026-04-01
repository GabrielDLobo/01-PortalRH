# Project Structure

This document describes the directory structure and file organization of the PortalRH project.

---

## 📁 Root Directory Structure

```
PortalRH/
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── manage.py                 # Django management script
├── nginx.conf                # Nginx configuration
├── README.md                 # Project readme
├── requirements.txt          # Python dependencies
├── docs/                     # Documentation (this folder)
├── accounts/                 # User authentication & authorization
├── app/                      # Core Django settings & configuration
├── employees/                # Employee management module
├── evaluations/              # Performance evaluations module
├── frontend/                 # React frontend application
├── leave_requests/           # Leave management module
├── logs/                     # Application logs
├── media/                    # User-uploaded files
├── reports/                  # Reporting module
├── staff/                    # Internal staff management
└── termination/              # Employee termination module
```

---

## 📂 Core Directories

### `/app` - Core Configuration

Main Django application configuration directory.

```
app/
├── __init__.py
├── asgi.py                   # ASGI configuration
├── permissions.py            # Custom permission classes
├── serializers.py            # Global serializers
├── settings.py               # Django settings
├── urls.py                   # Root URL configuration
└── wsgi.py                   # WSGI configuration
```

**Key Files:**
- `settings.py` - All Django settings (database, middleware, installed apps, etc.)
- `urls.py` - Main URL router, includes all app URLs
- `permissions.py` - Custom DRF permission classes

---

### `/accounts` - Authentication Module

User management, authentication, and authorization.

```
accounts/
├── __init__.py
├── admin.py                  # Django admin configuration
├── apps.py                   # App configuration
├── models.py                 # User model
├── serializers.py            # User serializers
├── urls.py                   # Account URLs
├── views.py                  # Authentication views
└── tests/
    ├── __init__.py
    ├── test_models.py
    ├── test_serializers.py
    └── test_views.py
```

**Models:**
- `User` - Custom user model extending AbstractUser

---

### `/employees` - Employee Management

Employee profiles, documents, and admission processes.

```
employees/
├── __init__.py
├── admin.py
├── apps.py
├── models.py                 # Employee, EmployeeDocument, AdmissionProcess, PreAdmissionRH
├── serializers.py
├── urls.py
├── views.py
└── tests/
```

**Models:**
- `Employee` - Employee profile with personal and professional data
- `EmployeeDocument` - Employee documents (RG, CPF, etc.)
- `AdmissionProcess` - Admission workflow tracking
- `PreAdmissionRH` - Pre-admission data entry

---

### `/evaluations` - Performance Evaluations

Performance review templates, cycles, and scoring.

```
evaluations/
├── __init__.py
├── admin.py
├── apps.py
├── models.py                 # EvaluationTemplate, Evaluation, EvaluationScore, etc.
├── serializers.py
├── urls.py
├── views.py
└── tests/
```

**Models:**
- `EvaluationTemplate` - Template for evaluations
- `EvaluationCriteria` - Criteria within templates
- `Evaluation` - Individual evaluation instance
- `EvaluationScore` - Scores for each criterion
- `EvaluationCycle` - Evaluation campaign cycles
- `EvaluationCycleParticipant` - Cycle participants

---

### `/leave_requests` - Leave Management

Leave types, requests, and balance tracking.

```
leave_requests/
├── __init__.py
├── admin.py
├── apps.py
├── models.py                 # LeaveType, LeaveRequest, LeaveBalance
├── serializers.py
├── urls.py
├── views.py
└── tests/
```

**Models:**
- `LeaveType` - Types of leave (vacation, sick, personal)
- `LeaveRequest` - Leave request instances
- `LeaveBalance` - Annual leave balance per employee

---

### `/reports` - Reporting System

Dynamic report generation and dashboards.

```
reports/
├── __init__.py
├── admin.py
├── apps.py
├── models.py                 # ReportTemplate, ReportExecution, ReportSchedule, etc.
├── serializers.py
├── urls.py
├── views.py
├── services.py               # Report generation logic
└── tests/
```

**Models:**
- `ReportCategory` - Report categories
- `ReportTemplate` - Report templates with JSON configuration
- `ReportExecution` - Report execution history
- `ReportSchedule` - Scheduled reports
- `ReportBookmark` - User-saved report configurations

---

### `/staff` - Internal Staff Management

Department and staff member management.

```
staff/
├── __init__.py
├── admin.py
├── apps.py
├── models.py                 # Employee (staff), Department, EmployeeDocument
├── serializers.py
├── urls.py
├── views.py
└── tests/
```

**Models:**
- `Employee` - Staff employee profile
- `Department` - Company departments
- `EmployeeDocument` - Staff documents

---

### `/termination` - Termination Management

Employee termination workflows.

```
termination/
├── __init__.py
├── admin.py
├── apps.py
├── models.py                 # TerminationRequest, TerminationReason, TerminationDocument
├── serializers.py
├── urls.py
├── views.py
└── tests/
```

**Models:**
- `TerminationReason` - Reasons for termination
- `TerminationRequest` - Termination request instances
- `TerminationDocument` - Termination-related documents

---

### `/frontend` - React Application

Frontend user interface.

```
frontend/
├── package.json
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── utils/
└── public/
```

---

## 📄 Key Configuration Files

### `manage.py`
Django's command-line utility for administrative tasks.

### `requirements.txt`
All Python dependencies with pinned versions.

### `.env.example`
Template for environment variables (copy to `.env`).

### `.gitignore`
Files and directories to ignore in Git.

### `nginx.conf`
Nginx reverse proxy configuration for production.

---

## 🗂️ File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Models | `snake_case.py` | `employee_profile.py` |
| Views | `snake_case.py` | `employee_views.py` |
| Serializers | `snake_case.py` | `employee_serializers.py` |
| Tests | `test_snake_case.py` | `test_employee.py` |
| Templates | `snake_case.html` | `employee_list.html` |
| Static files | `kebab-case.css/js` | `employee-list.css` |

---

## 📊 Module Dependencies

```
┌──────────────────────────────────────────────────────────┐
│                      accounts                             │
│                   (User Model)                            │
└──────────────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  employees  │ │ evaluations │ │leave_requests│
└─────────────┘ └─────────────┘ └─────────────┘
         │              │              │
         └──────────────┼──────────────┘
                        ▼
                 ┌─────────────┐
                 │   reports   │
                 └─────────────┘
```

---

## 🔍 Important Directories

### `/media/`
User-uploaded files (documents, photos).

Structure:
```
media/
├── employees/
│   ├── documents/
│   └── photos/
├── terminations/
│   └── documents/
└── evaluations/
    └── attachments/
```

### `/logs/`
Application logs.

```
logs/
├── django.log
├── requests.log
└── errors.log
```

### `/static/`
Static assets (CSS, JS, images).

```
static/
├── css/
├── js/
├── images/
└── admin/
```

---

## 📦 Database Structure

Each app has its own models that map to database tables:

| App | Tables |
|-----|--------|
| `accounts` | `accounts_user` |
| `employees` | `employees_employee`, `employees_employeedocument`, `employees_admissionprocess`, `employees_preadmissionrh` |
| `evaluations` | `evaluations_evaluationtemplate`, `evaluations_evaluationcriteria`, `evaluations_evaluation`, `evaluations_evaluationscore`, `evaluations_evaluationcycle`, `evaluations_evaluationcycleparticipant` |
| `leave_requests` | `leave_requests_leavetype`, `leave_requests_leaverequest`, `leave_requests_leavebalance` |
| `reports` | `reports_reportcategory`, `reports_reporttemplate`, `reports_reportexecution`, `reports_reportschedule`, `reports_reportbookmark` |
| `staff` | `staff_employee`, `staff_department`, `staff_employeedocument` |
| `termination` | `termination_terminationreason`, `termination_terminationrequest`, `termination_terminationdocument` |

---

## 🔗 URL Structure

```
/api/v1/
├── accounts/
│   ├── auth/login/
│   ├── auth/refresh/
│   ├── users/
│   └── users/profile/
├── employees/
│   ├── employees/
│   ├── documents/
│   ├── admission-processes/
│   └── pre-admissions/
├── evaluations/
│   ├── templates/
│   ├── evaluations/
│   ├── scores/
│   └── cycles/
├── leave-requests/
│   ├── types/
│   ├── requests/
│   └── balances/
├── reports/
│   ├── categories/
│   ├── templates/
│   ├── executions/
│   ├── schedules/
│   └── bookmarks/
├── staff/
│   ├── departments/
│   ├── employees/
│   └── documents/
└── termination/
    ├── reasons/
    ├── requests/
    └── documents/
```

---

**Next:** [API Endpoints](api-endpoints.md)
