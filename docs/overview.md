# Project Overview

PortalRH is a comprehensive **Human Resources Management System** designed to streamline HR processes, employee management, performance evaluations, leave requests, and reporting.

---

## 🎯 Project Objectives

- **Centralize HR Operations**: Single platform for all HR-related activities
- **Automate Workflows**: Streamline admission, evaluation, and termination processes
- **Data-Driven Decisions**: Comprehensive reporting and analytics
- **Employee Self-Service**: Allow employees to manage their information and requests
- **Compliance**: Ensure adherence to labor regulations and company policies

---

## ✨ Key Features

### 👥 Employee Management
- Complete employee profiles with personal and professional information
- Document management with verification workflows
- Admission process tracking with completion percentage
- Pre-admission workflows with automatic account creation

### 📊 Performance Evaluations
- Customizable evaluation templates and criteria
- 360-degree evaluations (self, manager, peers)
- Evaluation cycles with participant management
- Weighted scoring and final grade calculation
- Real-time statistics and dashboards

### 🏖️ Leave Management
- Multiple leave types (vacation, sick leave, personal leave, etc.)
- Leave balance tracking per year
- Approval workflows with manager notifications
- Calendar view for team leave planning
- Pecuniary bonus support for vacation

### 📈 Reporting System
- Dynamic report templates with JSON configuration
- Multiple output formats (PDF, Excel, CSV, JSON)
- Scheduled reports with cron expressions
- Report bookmarks for frequently used configurations
- Dashboard with summary metrics

### 🚪 Termination Management
- Termination request workflows
- Reason categorization and tracking
- Document generation and management
- HR approval processes
- Automatic status updates

### 🔐 User Management
- Role-based access control (Admin RH, Employee)
- JWT authentication with refresh tokens
- Password change enforcement on first login
- Profile management with audit trails

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Backend Framework** | Django 5.2.6 |
| **API Framework** | Django REST Framework 3.16.1 |
| **Authentication** | djangorestframework-simplejwt 5.5.1 |
| **Database** | PostgreSQL 15 / SQLite (dev) |
| **Frontend** | React 19 + TypeScript |
| **Web Server** | Nginx + Gunicorn |
| **Deployment** | Docker / Vercel / Render |

### Key Dependencies

```
# Core
Django==5.2.6
djangorestframework==3.16.1
djangorestframework_simplejwt==5.5.1
django-cors-headers==4.8.0
django-filter==25.1

# API Documentation
drf-nested-routers==0.95.0
drf-spectacular==0.28.0

# Data Processing
pandas==2.3.3
numpy==2.3.3
pillow==11.3.0

# Utilities
python-decouple==3.8
gunicorn==23.0.0
requests==2.32.5
PyYAML==6.0.2
```

---

## 🏗️ System Architecture

PortalRH follows a **modular monolith** architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React 19 + TS)            │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Nginx (Reverse Proxy)                   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Django Application (Gunicorn)               │
│  ┌──────────┬──────────┬──────────┬──────────┬─────────┐│
│  │ Accounts │ Employees│Evaluations│  Leave   │ Reports ││
│  │          │          │          │ Requests │         ││
│  └──────────┴──────────┴──────────┴──────────┴─────────┘│
│  ┌──────────┬──────────┬────────────────────────────────┐│
│  │  Staff   │Termination│        App (Settings)         ││
│  │          │           │                               ││
│  └──────────┴───────────┴───────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  PostgreSQL 15 / SQLite                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Application Modules

| Module | Purpose |
|--------|---------|
| `accounts` | User authentication, authorization, and profile management |
| `employees` | Employee profiles, documents, and admission processes |
| `evaluations` | Performance evaluation templates, cycles, and scoring |
| `leave_requests` | Leave type management, requests, and balance tracking |
| `reports` | Dynamic report generation, scheduling, and dashboards |
| `staff` | Internal staff management and department organization |
| `termination` | Employee termination workflows and documentation |

---

## 🔑 User Roles

| Role | Permissions |
|------|-------------|
| **Admin RH** | Full access to all modules, user management, system configuration |
| **Funcionário (Employee)** | Limited access to personal data, leave requests, evaluations |

---

## 📐 Design Principles

1. **RESTful API**: Standard HTTP methods and status codes
2. **Stateless Authentication**: JWT tokens for API authentication
3. **Modular Design**: Each app is self-contained with its own models, views, and serializers
4. **Security First**: Input validation, permission checks, and secure defaults
5. **Scalability**: Designed to handle growing data and user base

---

## 📝 License

This project is proprietary software. All rights reserved.

---

**Next:** [Prerequisites](prerequisites.md)
