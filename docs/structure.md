# Project Structure

This document provides a comprehensive overview of the PortalRH project directory structure and file organization.

---

## Root Directory Structure

```
01-PortalRH/
├── .env.example              # Example environment variables
├── .gitignore               # Git ignore patterns
├── .qwen/                   # Qwen configuration
├── .vercel/                 # Vercel deployment config
├── .vscode/                 # VS Code settings
├── accounts/                # User authentication module
├── app/                     # Django project configuration
├── docs/                    # Project documentation
├── employees/               # Employee management module
├── evaluations/             # Performance evaluations module
├── frontend/                # React TypeScript frontend
├── leave_requests/          # Leave management module
├── media/                   # Uploaded media files
├── reports/                 # Reports and analytics module
├── staff/                   # Staff management module
├── termination/             # Termination management module
├── docker-compose.yml       # Docker Compose configuration
├── manage.py                # Django management script
├── mkdocs.yml               # MkDocs configuration
├── nginx.conf               # Nginx configuration
├── pyproject.toml           # Python project config
├── README.md                # Project readme
└── requirements.txt         # Python dependencies
```

---

## Core Directories

### `/app` - Django Project Configuration

Main Django project settings and configuration.

```
app/
├── __init__.py
├── asgi.py              # ASGI entry point
├── settings.py          # Django settings
├── urls.py              # Root URL configuration
└── wsgi.py              # WSGI entry point
```

**Key Files:**

| File | Description |
|------|-------------|
| `settings.py` | Django configuration (database, middleware, apps, etc.) |
| `urls.py` | Root URL routing, includes all app URLs |
| `wsgi.py` | WSGI application for production deployment |
| `asgi.py` | ASGI application for async support |

---

### `/accounts` - Authentication Module

User authentication, authorization, and custom user model.

```
accounts/
├── __init__.py
├── admin.py             # Django admin configuration
├── apps.py              # App configuration
├── models.py            # Custom User model
├── serializers.py       # User serializers
├── urls.py              # Authentication URLs
├── views.py             # Auth views (login, register, etc.)
└── tests/
    ├── __init__.py
    ├── test_models.py
    ├── test_views.py
    └── test_serializers.py
```

**Key Components:**

| File | Description |
|------|-------------|
| `models.py` | Custom User model with role-based access |
| `views.py` | Login, register, profile management |
| `serializers.py` | User data serialization |
| `urls.py` | `/api/v1/accounts/` endpoints |

---

### `/employees` - Employee Management Module

Employee profiles, documents, and admission processes.

```
employees/
├── __init__.py
├── admin.py
├── apps.py
├── models.py            # Employee, EmployeeDocument, PreAdmissionRH, AdmissionProcess
├── serializers.py
├── urls.py
├── views.py
└── tests/
```

**Models:**

| Model | Description |
|-------|-------------|
| `PreAdmissionRH` | HR pre-admission information |
| `Employee` | Extended employee profile |
| `EmployeeDocument` | Employee document storage |
| `AdmissionProcess` | Admission workflow tracking |

---

### `/leave_requests` - Leave Management Module

Leave requests, balances, and approval workflows.

```
leave_requests/
├── __init__.py
├── admin.py
├── apps.py
├── models.py            # LeaveType, LeaveRequest, LeaveBalance
├── serializers.py
├── urls.py
├── views.py
└── tests/
```

**Models:**

| Model | Description |
|-------|-------------|
| `LeaveType` | Types of leave (vacation, sick, etc.) |
| `LeaveRequest` | Leave request with approval workflow |
| `LeaveBalance` | Employee leave balances by type |

---

### `/evaluations` - Performance Evaluations Module

Performance review templates, criteria, and evaluations.

```
evaluations/
├── __init__.py
├── admin.py
├── apps.py
├── models.py            # EvaluationTemplate, EvaluationCriteria, Evaluation, EvaluationScore, EvaluationCycle
├── serializers.py
├── urls.py
├── views.py
└── tests/
```

**Models:**

| Model | Description |
|-------|-------------|
| `EvaluationTemplate` | Reusable evaluation templates |
| `EvaluationCriteria` | Evaluation criteria within templates |
| `Evaluation` | Individual performance evaluation |
| `EvaluationScore` | Criterion scores |
| `EvaluationCycle` | Periodic evaluation campaigns |
| `EvaluationCycleParticipant` | Cycle participants |

---

### `/termination` - Termination Management Module

Employee termination requests and processes.

```
termination/
├── __init__.py
├── admin.py
├── apps.py
├── models.py            # TerminationReason, TerminationRequest, TerminationDocument
├── serializers.py
├── urls.py
├── views.py
└── tests/
```

**Models:**

| Model | Description |
|-------|-------------|
| `TerminationReason` | Reasons for termination |
| `TerminationRequest` | Termination request with workflow |
| `TerminationDocument` | Generated termination documents |

---

### `/staff` - Staff Management Module

Staff organization and department management.

```
staff/
├── __init__.py
├── admin.py
├── apps.py
├── models.py            # Employee, EmployeeDocument, Department
├── serializers.py
├── urls.py
├── views.py
└── tests/
```

**Models:**

| Model | Description |
|-------|-------------|
| `Employee` | Staff employee information |
| `EmployeeDocument` | Staff documents |
| `Department` | Department organization |

---

### `/reports` - Reports & Analytics Module

Report generation, templates, and scheduling.

```
reports/
├── __init__.py
├── admin.py
├── apps.py
├── models.py            # ReportCategory, ReportTemplate, ReportExecution, ReportSchedule, ReportBookmark
├── serializers.py
├── urls.py
├── views.py
├── services.py          # Report generation logic
├── exporters/           # Export formatters (PDF, Excel, CSV)
└── tests/
```

**Models:**

| Model | Description |
|-------|-------------|
| `ReportCategory` | Report categorization |
| `ReportTemplate` | Report templates with configuration |
| `ReportExecution` | Report execution tracking |
| `ReportSchedule` | Scheduled report generation |
| `ReportBookmark` | User bookmarked reports |

---

### `/frontend` - React TypeScript Frontend

Complete React application for the user interface.

```
frontend/
├── .env
├── .eslintrc.json
├── .gitignore
├── Dockerfile
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx              # Application entry point
    ├── App.tsx               # Root component
    ├── App.css
    ├── components/           # Reusable components
    │   ├── ui/               # UI components (buttons, inputs, etc.)
    │   ├── layout/           # Layout components (Header, Sidebar, etc.)
    │   └── features/         # Feature-specific components
    ├── pages/                # Page components
    │   ├── Login.tsx
    │   ├── Dashboard.tsx
    │   ├── Employees.tsx
    │   ├── LeaveRequests.tsx
    │   ├── Evaluations.tsx
    │   └── ...
    ├── services/             # API services
    │   ├── api.ts
    │   ├── auth.ts
    │   ├── employees.ts
    │   └── ...
    ├── hooks/                # Custom React hooks
    ├── types/                # TypeScript types
    ├── utils/                # Utility functions
    ├── context/              # React context providers
    └── styles/               # Global styles
```

**Key Directories:**

| Directory | Description |
|-----------|-------------|
| `components/ui/` | Reusable UI components |
| `components/layout/` | Layout structure components |
| `pages/` | Route page components |
| `services/` | API integration services |
| `hooks/` | Custom React hooks |
| `types/` | TypeScript type definitions |
| `context/` | Global state management |

---

### `/docs` - Documentation

Project documentation source files.

```
docs/
├── index.md               # Documentation home
├── overview.md            # Project overview
├── prerequisites.md       # Installation prerequisites
├── installation.md        # Installation guide
├── configuration.md       # Configuration guide
├── guidelines.md          # Coding guidelines
├── structure.md           # This file
├── api-endpoints.md       # API documentation
├── system-modeling.md     # System architecture and diagrams
├── authentication.md      # Authentication & security
├── development.md         # Development guide
├── testing.md             # Testing guide
├── deployment.md          # Deployment guide
├── contributing.md        # Contribution guide
└── release-notes.md       # Release notes
```

---

### `/media` - Media Files

User-uploaded files and documents.

```
media/
├── employee_documents/    # Employee uploaded documents
├── leave_requests/        # Leave request attachments
├── termination/           # Termination documents
└── employees/             # Employee photos and files
```

---

## Configuration Files

### Root Configuration

| File | Description |
|------|-------------|
| `.env.example` | Environment variable template |
| `.gitignore` | Git ignore patterns |
| `docker-compose.yml` | Docker services configuration |
| `manage.py` | Django management entry point |
| `mkdocs.yml` | Documentation configuration |
| `nginx.conf` | Nginx reverse proxy config |
| `pyproject.toml` | Python project configuration |
| `requirements.txt` | Python package dependencies |

### Frontend Configuration

| File | Description |
|------|-------------|
| `package.json` | Node.js dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `vite.config.ts` | Vite bundler configuration |
| `tailwind.config.js` | TailwindCSS configuration |
| `.eslintrc.json` | ESLint rules |
| `.env` | Frontend environment variables |

---

## URL Structure

### Backend API Routes

```
/api/v1/
├── accounts/              # User management
│   ├── login/
│   ├── register/
│   ├── profile/
│   └── token/refresh/
├── employees/             # Employee management
│   ├── list/
│   ├── <id>/
│   ├── documents/
│   └── admission/
├── leave-requests/        # Leave management
│   ├── list/
│   ├── <id>/
│   ├── types/
│   └── balances/
├── evaluations/           # Performance evaluations
│   ├── list/
│   ├── <id>/
│   ├── templates/
│   └── cycles/
├── termination/           # Termination management
│   ├── list/
│   ├── <id>/
│   ├── reasons/
│   └── documents/
├── staff/                 # Staff management
│   ├── list/
│   ├── <id>/
│   └── departments/
└── reports/               # Reports
    ├── list/
    ├── templates/
    ├── execute/
    └── schedules/
```

### Frontend Routes

```
/
├── login                  # Login page
├── dashboard              # Dashboard
├── employees              # Employee management
│   ├── list
│   ├── new
│   └── <id>/edit
├── leave-requests         # Leave management
│   ├── list
│   ├── new
│   └── <id>
├── evaluations            # Evaluations
│   ├── list
│   ├── new
│   └── <id>
├── termination            # Termination
│   ├── list
│   └── <id>
├── reports                # Reports
│   ├── list
│   ├── generate
│   └── templates
└── settings               # User settings
```

---

## Database Structure

### SQLite (Development)

```
db.sqlite3              # SQLite database file
```

### PostgreSQL Tables (Production)

```
accounts_user                    # User accounts
employees_employee               # Employee profiles
employees_pre_admission_rh       # Pre-admission data
employees_employee_document      # Employee documents
employees_admission_process      # Admission tracking
leave_requests_leave_type        # Leave types
leave_requests_leave_request     # Leave requests
leave_requests_leave_balance     # Leave balances
evaluations_evaluation_template  # Evaluation templates
evaluations_evaluation_criteria  # Evaluation criteria
evaluations_evaluation           # Evaluations
evaluations_evaluation_score     # Evaluation scores
evaluations_evaluation_cycle     # Evaluation cycles
evaluations_cycle_participant    # Cycle participants
termination_termination_reason   # Termination reasons
termination_termination_request  # Termination requests
termination_termination_document # Termination documents
staff_employee                   # Staff employees
staff_department                 # Departments
reports_report_category          # Report categories
reports_report_template          # Report templates
reports_report_execution         # Report executions
reports_report_schedule          # Report schedules
reports_report_bookmark          # Report bookmarks
```

---

## File Statistics

| Category | Count |
|----------|-------|
| **Django Apps** | 7 |
| **Models** | 25+ |
| **API Endpoints** | 50+ |
| **React Pages** | 15+ |
| **Documentation Files** | 14 |

---

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   React     │────▶│   Django    │
│   (User)    │◀────│   Frontend  │◀────│    Backend  │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │  PostgreSQL │
                                       │   Database  │
                                       └─────────────┘
```

---

## Related Documentation

- [API Endpoints](api-endpoints.md) - Detailed API reference
- [System Modeling](system-modeling.md) - Data models and architecture
- [Development Guide](development.md) - Development workflow

---

## 🆘 Navigation Tips

- Use your IDE's file search (Ctrl+P / Cmd+P) for quick navigation
- Check `app/urls.py` for all API route mappings
- Review `mkdocs.yml` for documentation structure
- See `docker-compose.yml` for service configurations
