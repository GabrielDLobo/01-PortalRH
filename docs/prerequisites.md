# Prerequisites

Before installing and running PortalRH, ensure you have the following software and tools installed on your system.

---

## 📦 Required Software

### Python
- **Version:** Python 3.10 or higher (tested with 3.10+)
- **Download:** [python.org](https://www.python.org/downloads/)
- **Verification:**
  ```bash
  python --version
  ```

### pip (Python Package Manager)
- Usually comes bundled with Python 3.4+
- **Verification:**
  ```bash
  pip --version
  ```

### Git
- **Version:** 2.30 or higher
- **Download:** [git-scm.com](https://git-scm.com/downloads)
- **Verification:**
  ```bash
  git --version
  ```

---

## 🗄️ Database

### PostgreSQL (Production)
- **Version:** 15 or higher
- **Download:** [postgresql.org](https://www.postgresql.org/download/)
- **Alternative:** Docker container (postgres:15)

```bash
# Check PostgreSQL version
psql --version
```

### SQLite (Development)
- Comes bundled with Python
- No additional installation required

---

## 🐍 Virtual Environment

It's **highly recommended** to use a virtual environment:

### Option 1: venv (Built-in)
```bash
python -m venv venv
```

### Option 2: virtualenv
```bash
pip install virtualenv
virtualenv venv
```

### Option 3: conda
```bash
conda create -n portalrh python=3.10
conda activate portalrh
```

---

## 🌐 Frontend (Optional)

If you plan to work on the frontend:

### Node.js
- **Version:** 18.x LTS or higher
- **Download:** [nodejs.org](https://nodejs.org/)
- **Verification:**
  ```bash
  node --version
  npm --version
  ```

### TypeScript
- **Version:** 4.9+
- Installed via npm with React project

---

## 🛠️ Development Tools (Recommended)

### Code Editor / IDE
- **VS Code** - [Download](https://code.visualstudio.com/)
- **PyCharm** - [Download](https://www.jetbrains.com/pycharm/)

### Python Extensions
- Pylance / Python Language Server
- Django Template support
- GitLens

### API Testing
- **Postman** - [Download](https://www.poststudio.com/)
- **Insomnia** - [Download](https://insomnia.rest/)
- Or use built-in Django REST Framework browsable API

### Database Management
- **pgAdmin** (PostgreSQL)
- **DBeaver** (Universal)
- **TablePlus** (Modern UI)

---

## 📋 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **RAM** | 4 GB | 8 GB |
| **Storage** | 2 GB | 5 GB |
| **CPU** | 2 cores | 4 cores |
| **OS** | Windows 10, macOS 11, Linux | Latest stable |

---

## ✅ Pre-Installation Checklist

Before proceeding with installation, verify:

- [ ] Python 3.10+ is installed and in PATH
- [ ] pip is working
- [ ] Git is installed
- [ ] PostgreSQL is installed (for production) or SQLite is available (for development)
- [ ] You have administrator/sudo access for package installation
- [ ] You have a code editor ready

---

## 🔧 Environment Variables

You'll need to configure the following environment variables. Prepare the values for:

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `your-secret-key-here` |
| `DEBUG` | Debug mode | `True` (dev) / `False` (prod) |
| `DATABASE_URL` | Database connection string | `postgres://user:pass@localhost:5432/db` |
| `ALLOWED_HOSTS` | Allowed host headers | `localhost,127.0.0.1` |

---

**Next:** [Installation](installation.md)
