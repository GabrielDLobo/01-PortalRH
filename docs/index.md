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

```bash
# Start all services
docker-compose up -d

# Access the backend
# http://localhost:8000

# Access the frontend
# http://localhost:3000
```

## 🔑 Default Access

- **Admin URL**: `http://localhost:8000/admin/`
- **Frontend (dev)**: `http://localhost:3000/`
- **API**: `http://localhost:8000/api/v1/`

---

## 📖 What is PortalRH?

The **PortalRH** is a complete HR solution built with Django REST Framework and React + TypeScript.
It features:

- ✅ **Employee Management / Gestão de Colaboradores** - Full employee profile lifecycle and document handling
- ✅ **Leave Management / Gestão de Férias e Afastamentos** - Requests, approvals, and balance tracking
- ✅ **Performance Reviews / Avaliações de Desempenho** - Evaluation cycles, criteria, and scoring
- ✅ **Admission & Onboarding / Admissão e Onboarding** - Structured pre-admission and admission workflows
- ✅ **Termination Management / Gestão de Desligamentos** - End-to-end offboarding process
- ✅ **Reports & Analytics / Relatórios e Analytics** - Exportable insights and dashboards
- ✅ **REST API** - JWT-authenticated API
- ✅ **Docker Ready** - Containerized deployment

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (React + TypeScript)             │
│                        + TailwindCSS                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Django Application Layer                    │
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
│                    PostgreSQL / SQLite DB                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Key Features

| Feature | Description |
|---------|-------------|
| **Employee Management** | Complete employee profiles and document lifecycle |
| **Leave Management** | Leave requests, approval workflows, and balances |
| **Performance Reviews** | Structured evaluations, cycles, and scoring |
| **Admission & Termination** | Employee lifecycle workflows from hiring to offboarding |
| **Reports & Analytics** | PDF/Excel exports and management insights |
| **Access Control** | Role-based access with JWT authentication |
| **Docker Support** | Easy deployment with docker-compose |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Django 5.2.6, Python 3.12 |
| **API** | Django REST Framework 3.16.1 |
| **Authentication** | JWT (SimpleJWT 5.5.1) |
| **Database** | PostgreSQL (prod) / SQLite (dev) |
| **Frontend** | React 19 + TypeScript + TailwindCSS |
| **Deployment** | Docker, docker-compose |
| **Documentation** | MkDocs + Material for MkDocs |

---

## 📞 Support

For issues, questions, or contributions, please refer to the [Contributing Guide](contributing.md).

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**License**: Private repository for internal use
