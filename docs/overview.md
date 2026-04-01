# Project Overview

## Introduction

**PortalRH** is a comprehensive Human Resources Management System built with **Django REST Framework** and **React + TypeScript**. It provides a complete suite of tools for managing employees, leave requests, performance evaluations, admissions, terminations, and more with advanced analytics and reporting capabilities.

---

## 🎯 Purpose

PortalRH streamlines HR processes by providing:

- Centralized employee data management
- Automated leave request workflows
- Structured performance evaluation system
- Complete admission and termination processes
- Comprehensive reporting and analytics
- Role-based access control for security

---

## ✨ Key Features

### Employee Management

- **Complete Profiles** - Comprehensive employee information including personal data, work documents, education, and banking information
- **Document Management** - Upload and manage employee documents with verification workflow
- **Department Tracking** - Organize employees by department and position
- **Contract Information** - Track hire dates, contract types, and employment status

### Leave Management

- **Request Submission** - Employees can submit leave requests with type selection
- **Approval Workflow** - Multi-level approval process with manager and HR involvement
- **Leave Balance Tracking** - Track available and used leave days by type
- **Multiple Leave Types** - Support for vacation, sick leave, personal leave, and more
- **Vacation-Specific Features** - Abono pecuniário (vacation bonus) support

### Performance Reviews

- **Structured Evaluations** - Customizable evaluation templates and criteria
- **Multiple Evaluation Types** - Self-evaluation, manager evaluation, 360° feedback
- **Scoring System** - Weighted criteria with final score calculation
- **Goal Tracking** - Set and track development objectives
- **Evaluation Cycles** - Organize periodic evaluation campaigns

### Admission Process

- **Pre-Admission RH** - HR pre-admission workflows with contract details
- **User Creation** - Automatic user account creation with temporary password
- **Onboarding** - Guided new hire onboarding process
- **Document Verification** - Required document upload and verification
- **Email Notifications** - Automated welcome emails with credentials

### Termination Management

- **Termination Requests** - Formal termination request workflow
- **Approval Process** - HR review and approval process
- **Notice Period** - Track notice period and last working day
- **Document Generation** - Generate termination documents
- **Exit Documentation** - Manage exit interview and final paperwork

### Reports & Analytics

- **Employee Reports** - Generate reports on employee data
- **Leave Analytics** - Analyze leave patterns and balances
- **Termination Reports** - Track termination statistics
- **Performance Summary** - Evaluation results and trends
- **Export Options** - PDF, Excel, and CSV export capabilities

### Staff Management

- **Team Organization** - Organize staff into teams and departments
- **Hierarchy Management** - Define reporting relationships
- **Role-Based Access** - Granular permissions based on user roles

---

## 🏗️ Architecture

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

## 👥 User Roles

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

## 📊 System Capabilities

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

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- CORS protection
- CSRF protection
- Input validation and sanitization
- Secure password hashing
- HTTPS support in production

---

## 📈 Performance Considerations

- Database query optimization
- Selective field loading
- Pagination for large datasets
- Caching strategies
- Async operations where applicable
- Static file serving via CDN

---

## 🌐 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Latest 2 versions |
| Firefox | Latest 2 versions |
| Safari | Latest 2 versions |
| Edge | Latest 2 versions |

---

## 📝 API Versioning

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

## 📚 Related Documentation

- [Installation Guide](installation.md) - Get started with installation
- [API Endpoints](api-endpoints.md) - Complete API reference
- [System Modeling](system-modeling.md) - Data models and architecture
- [Development Guide](development.md) - Development workflow
