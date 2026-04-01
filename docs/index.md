# Inventory Management System - Documentation

Welcome to the **Inventory Management System (SGE)** documentation. This guide provides comprehensive information about the project, from installation to deployment.

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
- [**Contribution**](contribution.md) - How to contribute
- [**Release Notes**](release-notes.md) - Version history and changelog

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd 02-Inventory-Management-System

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
# http://localhost:8000
```

## 🔑 Default Access

- **Admin URL**: `http://localhost:8000/admin/`
- **Dashboard**: `http://localhost:8000/home/`
- **API**: `http://localhost:8000/api/v1/`

---

## 📖 What is SGE?

The **Inventory Management System (SGE)** is a complete Django-based solution for managing inventory, products, suppliers, brands, and categories. It features:

- ✅ **Product Management** - Full CRUD operations
- ✅ **Stock Control** - Inflows and outflows tracking
- ✅ **Supplier Management** - Manage your suppliers
- ✅ **Brand & Category** - Organize products
- ✅ **REST API** - JWT-authenticated API
- ✅ **Dashboard** - Real-time metrics and analytics
- ✅ **AI Insights** - OpenAI integration for stock recommendations
- ✅ **Webhooks** - External integration support
- ✅ **Docker Ready** - Containerized deployment

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Django Templates)            │
│                    + TailwindCSS + Chart.js                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Django Application Layer                 │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │   Brands    │ Categories  │  Suppliers  │  Products   │ │
│  ├─────────────┼─────────────┼─────────────┼─────────────┤ │
│  │   Inflows   │  Outflows   │     AI      │    Auth     │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    REST API (DRF + JWT)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Key Features

| Feature | Description |
|---------|-------------|
| **Product Management** | Complete CRUD with cost/selling price tracking |
| **Stock Control** | Automatic quantity updates on inflows/outflows |
| **Dashboard** | Real-time metrics, charts, and KPIs |
| **AI Insights** | OpenAI integration for stock recommendations |
| **REST API** | Full API with JWT authentication |
| **Webhooks** | External system integration |
| **Multi-user** | Role-based access control |
| **Docker Support** | Easy deployment with docker-compose |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Django 5.0.1, Python 3.11 |
| **API** | Django REST Framework 3.15.1 |
| **Authentication** | JWT (SimpleJWT) |
| **Database** | PostgreSQL 15 / SQLite |
| **Frontend** | Django Templates, TailwindCSS, Chart.js |
| **AI** | OpenAI API (GPT-3.5-turbo) |
| **Deployment** | Docker, docker-compose |

---

## 📞 Support

For issues, questions, or contributions, please refer to the [Contribution Guide](contribution.md).

---

**Version**: 1.0.0  
**Last Updated**: March 2026  
**License**: MIT
