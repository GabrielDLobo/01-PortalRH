# Project Overview

## Introduction

**PortalRH** is a Human Resources Management System built with **Django REST Framework** and **React + TypeScript**, covering employee records, leave requests, performance evaluations, admissions, terminations, and reporting.

---

## Purpose

PortalRH streamlines HR processes by providing:

- Centralized employee data management
- Automated leave request workflows
- Structured performance evaluation system
- Complete admission and termination processes
- Comprehensive reporting and analytics
- Role-based access control for security

---

## Key Features

- **Employee Management** - profiles, documents, department and contract tracking
- **Leave Management** - request submission, multi-level approval, balance tracking, abono pecuniário
- **Performance Reviews** - templated evaluations, self/manager/360° types, weighted scoring, cycles
- **Admission Process** - HR pre-admission, automatic account creation, document verification, welcome emails
- **Termination Management** - request/approval workflow, notice period tracking, document generation
- **Reports & Analytics** - employee, leave, termination and evaluation reports; PDF/Excel/CSV export
- **Staff Management** - team organization, reporting hierarchy, role-based access

---

## Architecture

PortalRH follows a **client-server architecture** with:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React SPA     │────▶│  Django REST    │────▶│   PostgreSQL    │
│   (Frontend)    │◀────│     API         │◀────│    (Database)   │
│   Port 3000     │     │   Port 8000     │     │   Port 5432     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │   File Storage  │
                        │   (Media/Docs)  │
                        └─────────────────┘
```

### Backend Components

| Component | Description |
|-----------|-------------|
| **Django** | Web framework handling business logic |
| **Django REST Framework** | API layer for data serialization and endpoints |
| **SimpleJWT** | JWT-based authentication |
| **Django Filters** | Advanced filtering capabilities |
| **DRF Spectacular** | OpenAPI schema generation |

### Frontend Components

| Component | Description |
|-----------|-------------|
| **React 19** | UI framework |
| **TypeScript** | Type-safe JavaScript |
| **TailwindCSS** | Utility-first CSS framework |
| **React Router** | Client-side routing |
| **Axios** | HTTP client for API calls |

---

## User Roles

### Administrador RH (HR Admin)

- Full system access
- Manage all employees and documents
- Approve/reject leave requests
- Conduct performance evaluations
- Process admissions and terminations
- Generate all reports

### Funcionário (Employee)

- View own profile and documents
- Submit leave requests
- Participate in evaluations
- Upload personal documents
- View reports related to own data

---

## System Capabilities

| Feature | Description |
|---------|-------------|
| **Multi-tenant Ready** | Designed for multiple organizations |
| **Responsive Design** | Works on desktop, tablet, and mobile |
| **Document Upload** | Secure file upload with validation |
| **Email Notifications** | Automated email for key events |
| **Audit Trail** | Track changes and actions |
| **Data Export** | Export data in multiple formats |
| **API Documentation** | Auto-generated Swagger/ReDoc docs |

---

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- CORS protection
- CSRF protection
- Input validation and sanitization
- Secure password hashing
- HTTPS support in production

---

## Performance Considerations

- Database query optimization
- Selective field loading
- Pagination for large datasets
- Caching strategies
- Async operations where applicable
- Static file serving via CDN

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Latest 2 versions |
| Firefox | Latest 2 versions |
| Safari | Latest 2 versions |
| Edge | Latest 2 versions |

---

## API Versioning

All API endpoints follow the v1 versioning pattern:

```
/api/v1/accounts/
/api/v1/employees/
/api/v1/leave-requests/
/api/v1/evaluations/
/api/v1/reports/
/api/v1/termination/
/api/v1/staff/
```

---

## Related Documentation

- [Installation Guide](installation.md) - Get started with installation
- [API Endpoints](api-endpoints.md) - Complete API reference
- [System Modeling](system-modeling.md) - Data models and architecture
- [Development Guide](development.md) - Development workflow
