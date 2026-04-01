# Prerequisites

Before installing and running the Inventory Management System, ensure your system meets the following requirements.

## System Requirements

### Operating System
- **Linux** (Ubuntu 20.04+, Debian, CentOS)
- **macOS** (10.15+)
- **Windows** (10/11)
- **WSL2** (Windows Subsystem for Linux)

### Hardware
- **CPU**: Dual-core processor or higher
- **RAM**: Minimum 2GB (4GB+ recommended)
- **Storage**: 500MB free space (plus database storage)

## Software Requirements

### Required Software

| Software | Version | Purpose | Download Link |
|----------|---------|---------|---------------|
| **Python** | 3.11+ | Runtime environment | [python.org](https://www.python.org/downloads/) |
| **pip** | 23.0+ | Package manager | Included with Python |
| **Git** | 2.30+ | Version control | [git-scm.com](https://git-scm.com/) |
| **PostgreSQL** | 15+ | Production database | [postgresql.org](https://www.postgresql.org/download/) |
| **Docker** | 20.10+ | Containerization (optional) | [docker.com](https://www.docker.com/) |
| **Docker Compose** | 2.0+ | Multi-container orchestration | Included with Docker Desktop |

### Python Version Check

```bash
python --version
# or
python3 --version
```

**Required**: Python 3.11 or higher

### pip Version Check

```bash
pip --version
# or
pip3 --version
```

## Development Tools (Optional but Recommended)

### Code Editor / IDE
- **VS Code** - [Download](https://code.visualstudio.com/)
- **PyCharm** - [Download](https://www.jetbrains.com/pycharm/)
- **Sublime Text** - [Download](https://www.sublimetext.com/)

### Recommended VS Code Extensions
- Python (Microsoft)
- Django Template
- Pylance
- Black Formatter
- isort
- GitLens

### Database Management Tools
- **pgAdmin** - PostgreSQL administration
- **DBeaver** - Universal database tool
- **TablePlus** - Modern database client

## API Keys (Optional)

### OpenAI API Key
Required for AI insights feature.

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Store it securely

**Note**: The API key should be configured in the `ai/agent.py` file or via environment variables.

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here

# Database (Production)
POSTGRES_DB=sge
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_HOST=sge_db
POSTGRES_PORT=5432

# OpenAI (Optional)
OPENAI_API_KEY=your-openai-api-key

# Webhook Service (Optional)
WEBHOOK_URL=http://localhost:8001/api/V1/webhooks/order/
```

## Network Requirements

### Ports
| Port | Service | Description |
|------|---------|-------------|
| 8000 | Django Dev Server | Web application |
| 5432 | PostgreSQL | Database (production) |
| 8001 | Webhook Service | External integration (optional) |

### Firewall Rules
Ensure the following ports are accessible:
- **Inbound**: 8000 (HTTP), 5432 (PostgreSQL - if remote)
- **Outbound**: 443 (HTTPS - for OpenAI API)

## Browser Requirements

For the web interface, use modern browsers:
- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

JavaScript must be enabled for interactive features (charts, dynamic forms).

## Knowledge Requirements

### Recommended Skills
- Basic Python programming
- Django framework fundamentals
- REST API concepts
- SQL and database basics
- Git version control
- Docker basics (for containerized deployment)

### Helpful Documentation
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

## Pre-Installation Checklist

Before proceeding with installation, verify:

- [ ] Python 3.11+ is installed
- [ ] pip is updated to latest version
- [ ] Git is installed and configured
- [ ] PostgreSQL is installed (for production)
- [ ] Docker is installed (for containerized deployment)
- [ ] You have administrative/sudo access
- [ ] Required ports are available
- [ ] OpenAI API key is obtained (if using AI features)

## Verification Commands

Run these commands to verify your environment:

```bash
# Check Python version
python --version

# Check pip version
pip --version

# Check Git installation
git --version

# Check Docker (if using)
docker --version
docker-compose --version

# Check PostgreSQL (if installed)
psql --version
```

## Troubleshooting

### Python Version Issues

If you have multiple Python versions:

```bash
# Use specific Python version
python3.11 -m pip install -r requirements.txt
```

### Permission Issues (Linux/macOS)

```bash
# Install packages locally
pip install --user -r requirements.txt

# Or use virtual environment (recommended)
python -m venv venv
source venv/bin/activate
```

### Windows-Specific

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate
```

---

**Next Steps**: 
- [Installation Guide](installation.md) - Install the project
- [Configuration](configuration.md) - Configure settings
