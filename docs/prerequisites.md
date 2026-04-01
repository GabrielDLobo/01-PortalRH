# Prerequisites

Before installing and running PortalRH, ensure you have the following software and tools installed on your system.

---

## 🖥️ System Requirements

### Operating System

- **Windows** 10/11
- **macOS** 11.0 or later
- **Linux** Ubuntu 20.04+, Debian 10+, or equivalent

### Hardware

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 4 GB | 8+ GB |
| **Storage** | 2 GB free | 10+ GB free |
| **Network** | Broadband | Broadband |

---

## 📦 Required Software

### 1. Python

**Version:** Python 3.10 or higher

PortalRH is built with Django 5.2, which requires Python 3.10+.

#### Installation

**Windows:**
```bash
# Download from https://www.python.org/downloads/
# During installation, check "Add Python to PATH"
```

**macOS:**
```bash
# Using Homebrew
brew install python@3.11
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip
```

#### Verification
```bash
python --version
# or
python3 --version
```

---

### 2. Node.js & npm

**Version:** Node.js 18.x or later, npm 9.x or later

Required for building and running the React frontend.

#### Installation

**Windows/macOS:**
```bash
# Download from https://nodejs.org/
# Choose LTS version
```

**Linux (Ubuntu/Debian):**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Verification
```bash
node --version
npm --version
```

---

### 3. PostgreSQL (Production)

**Version:** PostgreSQL 15.x or later

Required for production deployment. SQLite is used for development by default.

#### Installation

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
```

**macOS:**
```bash
# Using Homebrew
brew install postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql-15 postgresql-contrib
```

#### Verification
```bash
psql --version
```

---

### 4. Git

**Version:** Git 2.30 or later

Required for cloning the repository and version control.

#### Installation

**Windows:**
```bash
# Download from https://git-scm.com/download/win
```

**macOS:**
```bash
# Git is pre-installed on macOS
# Update to latest version
brew install git
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install git
```

#### Verification
```bash
git --version
```

---

## 🛠️ Recommended Tools

### Code Editor / IDE

- **VS Code** (Recommended) - https://code.visualstudio.com/
- **PyCharm** - https://www.jetbrains.com/pycharm/
- **WebStorm** - https://www.jetbrains.com/webstorm/

### Recommended VS Code Extensions

```
Python (ms-python.python)
Pylance (ms-python.vscode-pylance)
ESLint (dbaeumer.vscode-eslint)
Prettier (esbenp.prettier-vscode)
Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
Docker (ms-azuretools.vscode-docker)
GitLens (eamodio.gitlens)
```

### Terminal

- **Windows:** Windows Terminal (recommended) or PowerShell
- **macOS:** Terminal or iTerm2
- **Linux:** Default terminal or GNOME Terminal

---

## 🐳 Optional: Docker & Docker Compose

**Version:** Docker 24.x, Docker Compose 2.x

For containerized deployment.

#### Installation

**Windows/macOS:**
```bash
# Download Docker Desktop from https://www.docker.com/products/docker-desktop
```

**Linux (Ubuntu/Debian):**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin
```

#### Verification
```bash
docker --version
docker compose version
```

---

## 📋 Pre-Installation Checklist

Before proceeding with installation, verify:

- [ ] Python 3.10+ is installed and accessible
- [ ] Node.js 18+ and npm are installed
- [ ] Git is installed and configured
- [ ] PostgreSQL is installed (for production)
- [ ] You have administrator/sudo access
- [ ] You have at least 2GB of free disk space
- [ ] Internet connection is available for downloading dependencies

---

## 🔧 Environment Setup Verification

Run these commands to verify your setup:

```bash
# Check Python
python --version
pip --version

# Check Node.js
node --version
npm --version

# Check Git
git --version

# Check PostgreSQL (if installed)
psql --version
```

All commands should return version numbers without errors.

---

## ⚠️ Common Issues

### Python Not Found

**Windows:** Ensure Python is added to PATH during installation.

**Linux/macOS:** You may need to use `python3` instead of `python`.

### Permission Issues

**Linux/macOS:** If you encounter permission errors, you may need to use `sudo` or fix directory permissions:

```bash
sudo chown -R $USER:$USER ~/.npm
```

### Port Already in Use

If ports 3000, 5432, or 8000 are in use:

```bash
# Windows
netstat -ano | findstr :3000

# Linux/macOS
lsof -i :3000
```

---

## 📚 Next Steps

Once all prerequisites are installed:

1. Proceed to [Installation Guide](installation.md)
2. Clone the repository
3. Set up virtual environments
4. Install dependencies

---

## 🆘 Getting Help

If you encounter issues during prerequisite installation:

- Check the official documentation for each software
- Search for error messages on Stack Overflow
- Review GitHub Issues in the project repository
