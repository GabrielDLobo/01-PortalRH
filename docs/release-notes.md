# Release Notes

This document contains the release history and changelog for PortalRH.

---

## 📋 Versioning

PortalRH follows [Semantic Versioning](https://semver.org/):

- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

**Current Version:** 1.0.0

---

## [Unreleased]

### Planned Features
- Employee onboarding workflow improvements
- Advanced analytics dashboard
- Mobile application support
- Multi-language support (i18n)
- Real-time notifications with WebSocket
- Celery integration for background tasks

### Under Development
- Performance optimization for large datasets
- Enhanced reporting with custom queries
- Integration with external HR systems
- Redis cache implementation

---

## [1.0.0] - 2024-04-01

### 🎉 Initial Stable Release

The first stable release of PortalRH with complete HR management functionality.

### ✨ Features

#### Authentication & Users
- JWT-based authentication with SimpleJWT 5.5.1
- Custom user model with roles (Admin RH, Funcionário)
- Password change enforcement on first login
- User profile management
- Role-based access control
- Token refresh mechanism

#### Employee Management
- Complete employee profiles with 40+ fields
- Document management with verification workflow
- Admission process tracking with completion percentage
- Pre-admission workflows with automatic account creation
- Automatic employee ID generation (EMP-XXXX format)
- CEP lookup for addresses
- Banking information management
- Work document tracking (CTPS, PIS/PASEP)

#### Performance Evaluations
- Customizable evaluation templates
- Multiple evaluation types (self, manager, 360°, peers)
- Evaluation cycles and campaigns
- Weighted scoring system
- Real-time statistics and dashboards
- Participant management

#### Leave Management
- Multiple leave types (vacation, sick, personal)
- Leave balance tracking per year
- Approval workflows with manager notifications
- Calendar visualization
- Pecuniary bonus support (abono pecuniário)
- Priority levels (low, medium, high, urgent)

#### Reporting System
- Dynamic report templates with JSON configuration
- Multiple output formats (PDF, Excel, CSV, JSON)
- Scheduled reports with cron expressions
- Report bookmarks for frequently used configurations
- Dashboard with summary metrics
- Report categories and organization
- Execution history tracking

#### Termination Management
- Termination request workflows
- Reason categorization and tracking
- Document generation and management
- HR approval processes
- Automatic status updates
- Exit interview scheduling

#### Staff Management
- Department management
- Staff employee profiles
- Document handling
- Salary and status updates

### 🔧 Technical

#### Backend
- Django 5.2.6
- Django REST Framework 3.16.1
- SimpleJWT 5.5.1
- django-filter 25.1
- drf-nested-routers 0.95.0
- PostgreSQL 15 support
- SQLite for development
- CORS configuration
- Security headers

#### Frontend
- React 19.1.1
- TypeScript 4.9.5
- React Router 7.8.2
- TailwindCSS 3.4.17
- Axios 1.11.0
- Chart.js 4.5.0
- React Hook Form 7.62.0
- Yup validation 1.7.0

#### Data Processing
- Pandas 2.3.3
- NumPy 2.3.3
- Pillow 11.3.0

#### API
- RESTful API design
- OpenAPI/Swagger documentation
- ReDoc alternative documentation
- Pagination support (20 items per page)
- Filtering and search
- Proper HTTP status codes

#### Security
- Password validators (4 validators)
- CSRF protection
- XSS prevention
- SQL injection prevention
- Input validation
- File upload security (10MB limit)
- CORS headers configuration

#### Docker
- PostgreSQL 15 container
- Django backend container
- React frontend container
- Nginx reverse proxy
- Volume management for persistence
- Network isolation

#### Testing
- Unit tests for models
- Serializer tests
- View tests
- Permission tests
- Integration tests

### 📦 Dependencies

```
# Core Django
Django==5.2.6
djangorestframework==3.16.1
djangorestframework_simplejwt==5.5.1

# Security & CORS
django-cors-headers==4.8.0
PyJWT==2.10.1

# API & Filters
django-filter==25.1
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

### 📝 Documentation

- Complete API documentation (Swagger UI + ReDoc)
- Installation guide
- Configuration guide
- Development guidelines
- Deployment instructions (Vercel, Docker, VPS)
- Contributing guide
- Testing guide
- System modeling with Mermaid diagrams

### 🐛 Bug Fixes

- Fixed JWT token refresh mechanism
- Corrected employee ID generation
- Fixed document upload paths
- Resolved CORS issues with frontend

### ⚠️ Breaking Changes

None - Initial release

### 📊 Database Schema

**Total Tables:** 25+

| App | Tables |
|-----|--------|
| accounts | 1 |
| employees | 4 |
| evaluations | 6 |
| leave_requests | 3 |
| reports | 5 |
| staff | 3 |
| termination | 3 |

---

## Release Schedule

| Version | Planned Date | Focus |
|---------|--------------|-------|
| 1.1.0 | Q3 2024 | Performance & UX improvements |
| 1.2.0 | Q4 2024 | Advanced reporting features |
| 2.0.0 | Q1 2025 | Multi-tenant support |

---

## 🐛 Known Issues

### Current Version (1.0.0)

| Issue | Severity | Workaround | Status |
|-------|----------|------------|--------|
| Large file uploads may timeout | Medium | Use files < 10MB | In Progress |
| Report scheduling timezone | Low | Use UTC for scheduling | Planned |
| Redis cache not enabled by default | Low | Configure manually | Planned |

---

## 🔄 Upgrade Guide

### From Previous Versions

This is the initial release. No upgrade path needed.

### Future Upgrades

```bash
# Standard upgrade process
git pull origin main
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart portalrh
```

---

## 📊 Version Comparison

| Feature | 1.0.0 |
|---------|-------|
| User Management | ✅ |
| Employee Profiles | ✅ |
| Document Management | ✅ |
| Admission Process | ✅ |
| Pre-Admission | ✅ |
| Performance Evaluations | ✅ |
| Evaluation Cycles | ✅ |
| Leave Management | ✅ |
| Leave Balance | ✅ |
| Pecuniary Bonus | ✅ |
| Reporting | ✅ |
| Report Scheduling | ✅ |
| Report Bookmarks | ✅ |
| Termination | ✅ |
| JWT Authentication | ✅ |
| API Documentation | ✅ |
| Docker Support | ✅ |
| React Frontend | ✅ |
| TypeScript | ✅ |
| CI/CD Pipeline | ✅ |

---

## 🙏 Contributors

### Core Team
- Development Team

### Special Thanks
- All beta testers
- Early adopters
- Community contributors

---

## 📞 Support

### Getting Help

- **Documentation:** [docs/index.md](index.md)
- **API Docs:** `/api/docs/` (Swagger UI)
- **API Docs:** `/api/redoc/` (ReDoc)
- **Issues:** GitHub Issues
- **Security:** Contact maintainers directly

### Reporting Issues

When reporting issues, include:

1. Version number (1.0.0)
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Environment details
6. Screenshots (if applicable)

---

## 🔒 Security Advisories

### No Known Vulnerabilities

No security vulnerabilities have been identified in version 1.0.0.

### Reporting Security Issues

Please report security issues privately to the project maintainers. Do not disclose publicly until fixed.

---

## 📜 License

PortalRH is proprietary software. All rights reserved.

---

## 🎯 Roadmap

### Short-term (Q2-Q3 2024)
- [ ] Performance optimization
- [ ] UI/UX improvements
- [ ] Additional report templates
- [ ] Email notification system
- [ ] Redis cache implementation

### Mid-term (Q4 2024 - Q1 2025)
- [ ] Mobile responsiveness
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced analytics
- [ ] Multi-language support (i18n)
- [ ] Celery background tasks

### Long-term (2025+)
- [ ] Mobile applications (iOS/Android)
- [ ] Multi-tenant architecture
- [ ] AI-powered insights
- [ ] External integrations (accounting systems)
- [ ] Advanced workflow engine

---

**Last Updated:** April 2024

**Current Version:** 1.0.0

**Next Release:** 1.1.0 (Q3 2024)

**Total Endpoints:** 100+

**Total Models:** 29
