# PortalRH - Documentation

Welcome to the **PortalRH** documentation. This guide centralizes setup, architecture, API, security, testing, and deployment for the project.

## Documentation Index

### Getting Started / Primeiros Passos
- [Overview / Visão Geral](overview.md)
- [Prerequisites / Pré-requisitos](prerequisites.md)
- [Installation / Instalação](installation.md)
- [Configuration / Configuração](configuration.md)

### Development / Desenvolvimento
- [Project Structure / Estrutura do Projeto](project-structure.md)
- [Guidelines / Diretrizes](guidelines.md)
- [Development / Desenvolvimento](development.md)
- [Testing / Testes](testing.md)

### Technical Documentation / Documentação Técnica
- [API Endpoints](api-endpoints.md)
- [System Modeling / Modelagem do Sistema](system-modeling.md)
- [Authentication & Security / Autenticação e Segurança](authentication-security.md)

### Delivery
- [Deploy](deploy.md)
- [Contribution / Contribuição](contributing.md)
- [Release Notes](release-notes.md)
- [Update Log](UPDATE_LOG.md)

---

## Quick Start

<pre><code>git clone https://github.com/GabrielDLobo/01-PortalRH.git
cd 01-PortalRH

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver</code></pre>

## Docker Quick Start

<pre><code>docker-compose up -d</code></pre>

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

## System Architecture

<pre><code>┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React + TypeScript)           │
│                        + TailwindCSS                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Django Application Layer                   │
│  accounts | employees | evaluations | leave_requests       │
│  staff    | termination | reports                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    REST API (DRF + JWT)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL / SQLite                     │
└─────────────────────────────────────────────────────────────┘</code></pre>

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 5.2.x + DRF |
| Frontend | React + TypeScript + TailwindCSS |
| Auth | JWT (SimpleJWT) |
| Database | PostgreSQL (prod) / SQLite (dev) |
| Documentation | MkDocs + Material |

## Support

For collaboration standards and contribution flow, see [Contribution / Contribuição](contributing.md).
