# PortalRH - Documentation

Welcome to the **PortalRH** documentation. This guide provides comprehensive information about the project,
from installation to deployment.

## 📚 Documentation Index

### Getting Started / Primeiros Passos
- [**Overview / Visão Geral**](overview.md) - Project overview and key features
- [**Prerequisites / Pré-requisitos**](prerequisites.md) - Requirements before installation
- [**Installation / Instalação**](installation.md) - Step-by-step installation guide
- [**Configuration / Configuração**](configuration.md) - Project configuration and settings

### Development / Desenvolvimento
- [**Project Structure / Estrutura do Projeto**](project-structure.md) - Directory and file organization
- [**Guidelines / Diretrizes**](guidelines.md) - Coding standards and best practices
- [**Development / Desenvolvimento**](development.md) - Development workflow and tools
- [**Testing / Testes**](testing.md) - Testing strategies and commands

### Technical Documentation / Documentação Técnica
- [**API Endpoints**](api-endpoints.md) - Complete API reference
- [**System Modeling / Modelagem do Sistema**](system-modeling.md) - Data models and architecture diagrams
- [**Authentication & Security / Autenticação e Segurança**](authentication-security.md) - Security implementation

### Deployment & Contribution / Deploy e Contribuição
- [**Deploy**](deploy.md) - Deployment guide
- [**Contributing / Contribuição**](contributing.md) - How to contribute
- [**Release Notes**](release-notes.md) - Version history and changelog
- [**Update Log**](UPDATE_LOG.md) - Incremental update history

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/GabrielDLobo/01-PortalRH.git
cd 01-PortalRH

# Install dependencies
venv\Scripts\python -m pip install -r requirements.txt

# Run migrations
venv\Scripts\python manage.py migrate

# Create superuser
venv\Scripts\python manage.py createsuperuser

# Start development server
venv\Scripts\python manage.py runserver
```

## 📦 Docker Quick Start

# PortalRH - Documentation

Welcome to the **PortalRH** documentation. This guide provides comprehensive information about the project, from installation to deployment.

## 📚 Documentation Index

### Getting Started
- [**Overview**](overview.md) - Project overview and key features
- [**Prerequisites**](prerequisites.md) - Requirements before installation
- [**Installation**](installation.md) - Step-by-step installation guide
- [**Configuration**](configuration.md) - Project configuration and settings

### Development
- [**Project Structure**](project-structure.md) - Directory and file organization
- [**Guidelines**](guidelines.md) - Coding standards and best practices
- [**Development**](development.md) - Development workflow and tools
- [**Testing**](testing.md) - Testing strategies and commands

### Technical Documentation
- [**API Endpoints**](api-endpoints.md) - Complete API reference
- [**System Modeling**](system-modeling.md) - Data models and architecture diagrams
- [**Authentication & Security**](authentication-security.md) - Security implementation

### Deployment & Contribution
- [**Deploy**](deploy.md) - Deployment guide
- [**Contribution**](contributing.md) - How to contribute
- [**Release Notes**](release-notes.md) - Version history and changelog
- [**Update Log**](UPDATE_LOG.md) - Documentation update history

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/GabrielDLobo/01-PortalRH.git
cd 01-PortalRH

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

## 📦 Docker Quick Start

```bash
# Start all services
docker-compose up -d

# Access the application
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

## 🔑 Default Access

- **Admin URL**: `http://localhost:8000/admin/`
- **API**: `http://localhost:8000/api/v1/`
- **Frontend**: `http://localhost:3000/`

---

## 📖 What is PortalRH?

The **PortalRH** is a complete Django-based Human Resources platform to manage employees, leave requests, evaluations, staff, reports, and termination workflows. It features:

- ✅ **Employee Management** - Full employee lifecycle and document control
- ✅ **Leave Control** - Requests, approvals, balances, and history
- ✅ **Performance Evaluation** - Templates, cycles, and feedback tracking
- ✅ **Admission & Offboarding** - Structured onboarding and termination flows
- ✅ **REST API** - JWT-authenticated API with DRF
- ✅ **Dashboard & Reports** - Metrics and exports (PDF/Excel)
- ✅ **Role-based Access** - Permission model for HR and staff roles
- ✅ **Docker Ready** - Containerized deployment

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React + TS)                 │
│                         + TailwindCSS                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Django Application Layer                │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ Employees   │ Leave Req.  │ Evaluations │ Accounts    │ │
│  ├─────────────┼─────────────┼─────────────┼─────────────┤ │
│  │ Staff       │ Termination │ Reports     │ Auth (JWT)  │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     REST API (DRF + JWT)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL / SQLite                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Key Features

| Feature | Description |
|---------|-------------|
| **Employee Management** | Complete employee records and document tracking |
| **Leave Management** | Request/approval workflow with leave balances |
| **Evaluation Cycles** | Structured performance evaluations and scoring |
| **Reports** | Dynamic reports with export support |
| **Termination Flow** | End-to-end offboarding workflow |
| **REST API** | Full API with JWT authentication |
| **Access Control** | Role-based permissions and secure endpoints |
| **Docker Support** | Easy deployment with docker-compose |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Django 5.2.6, Python 3.12 |
| **API** | Django REST Framework 3.16.1 |
| **Authentication** | JWT (SimpleJWT 5.5.1) |
| **Database** | PostgreSQL 15 / SQLite |
| **Frontend** | React 19 + TypeScript + TailwindCSS |
| **Documentation** | MkDocs + Material Theme |
| **Deployment** | Docker, docker-compose |

---

## 📞 Support

For issues, questions, or contributions, please refer to the [Contribution Guide](contributing.md).

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**License**: Private repository for internal use
