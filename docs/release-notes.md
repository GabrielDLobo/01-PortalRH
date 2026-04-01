# Release Notes

This document contains release notes and changelog for PortalRH.

---

## 📋 Table of Contents

- [Version 1.0.0](#version-100---2026-04-01)
- [Version 0.9.0](#version-090---2026-03-01)
- [Version 0.8.0](#version-080---2026-02-01)
- [Version 0.7.0](#version-070---2026-01-01)
- [Version 0.6.0](#version-060---2025-12-01)

---

## Version 1.0.0 - 2026-04-01

### 🎉 Major Release

The first stable release of PortalRH - Human Resources Management System.

### ✨ New Features

#### Employee Management
- Complete employee profile management
- Document upload and verification workflow
- Pre-admission RH process
- Automatic user creation with temporary passwords
- Employee ID auto-generation
- Admission process tracking

#### Leave Management
- Multiple leave types (vacation, sick, personal)
- Leave request submission and approval workflow
- Leave balance tracking by type and year
- Vacation-specific features (abono pecuniário)
- Priority-based request handling
- Email notifications for approvals

#### Performance Evaluations
- Customizable evaluation templates
- Multiple evaluation types (self, manager, 360°)
- Weighted criteria scoring
- Evaluation cycles management
- Goal tracking and development plans
- Final score calculation

#### Termination Management
- Termination request workflow
- HR approval process
- Multiple termination reasons
- Document generation
- Exit interview tracking
- Process completion workflow

#### Reports & Analytics
- Employee data reports
- Leave analytics
- Termination reports
- Performance summaries
- Multiple export formats (PDF, Excel, CSV)
- Scheduled report generation
- Report bookmarks

#### Authentication & Security
- JWT-based authentication
- Role-based access control (Admin RH / Funcionário)
- Token refresh mechanism
- Password hashing with PBKDF2
- CORS protection
- Input validation

### 🔧 Technical Features

#### Backend
- Django 5.2.6
- Django REST Framework 3.16.1
- SimpleJWT authentication
- PostgreSQL/SQLite support
- Django Filters for advanced queries
- OpenAPI schema generation

#### Frontend
- React 19
- TypeScript
- TailwindCSS
- React Router
- Axios for API calls
- Responsive design

#### DevOps
- Docker support
- Docker Compose configuration
- Nginx reverse proxy
- Gunicorn application server
- CI/CD ready

### 📦 Database Models

**Accounts:**
- User (custom model with roles)

**Employees:**
- Employee
- PreAdmissionRH
- EmployeeDocument
- AdmissionProcess

**Leave Requests:**
- LeaveType
- LeaveRequest
- LeaveBalance

**Evaluations:**
- EvaluationTemplate
- EvaluationCriteria
- Evaluation
- EvaluationScore
- EvaluationCycle
- EvaluationCycleParticipant

**Termination:**
- TerminationReason
- TerminationRequest
- TerminationDocument

**Staff:**
- Employee
- Department

**Reports:**
- ReportCategory
- ReportTemplate
- ReportExecution
- ReportSchedule
- ReportBookmark

### 🔗 API Endpoints

**Authentication:**
- POST `/api/v1/accounts/login/`
- POST `/api/v1/accounts/token/refresh/`
- GET/PUT `/api/v1/accounts/profile/`

**Employees:**
- CRUD `/api/v1/employees/`
- Documents `/api/v1/employees/{id}/documents/`
- Pre-admission `/api/v1/employees/pre-admission/`
- Admission `/api/v1/employees/admission/`

**Leave Requests:**
- CRUD `/api/v1/leave-requests/`
- Types `/api/v1/leave-requests/types/`
- Balances `/api/v1/leave-requests/balances/`
- Approve/Reject/Cancel actions

**Evaluations:**
- CRUD `/api/v1/evaluations/`
- Templates `/api/v1/evaluations/templates/`
- Scores `/api/v1/evaluations/{id}/scores/`
- Cycles `/api/v1/evaluations/cycles/`

**Termination:**
- CRUD `/api/v1/termination/`
- Reasons `/api/v1/termination/reasons/`
- Approve/Reject/Complete actions

**Staff:**
- CRUD `/api/v1/staff/`
- Departments `/api/v1/staff/departments/`

**Reports:**
- Templates `/api/v1/reports/templates/`
- Execute `/api/v1/reports/templates/{id}/execute/`
- Schedules `/api/v1/reports/schedules/`
- Bookmarks `/api/v1/reports/bookmarks/`

### 🐛 Bug Fixes

- Fixed leave balance calculation for edge cases
- Corrected employee ID generation sequence
- Fixed pagination in list views
- Resolved CORS issues in development
- Fixed date formatting in reports

### ⚡ Performance Improvements

- Added select_related/prefetch_related optimizations
- Implemented database indexing
- Added caching for frequently accessed data
- Optimized bundle size for frontend
- Implemented lazy loading for components

### 🔒 Security

- Implemented JWT authentication
- Added role-based permissions
- Configured CORS properly
- Added input validation on all endpoints
- Implemented CSRF protection
- Added security headers

### 📚 Documentation

- Complete API documentation
- System architecture diagrams
- ERD diagrams
- Authentication flow diagrams
- CRUD workflow diagrams
- Development guide
- Deployment guide
- Contributing guide

### 🧪 Testing

- Model unit tests
- Serializer tests
- API integration tests
- Frontend component tests
- E2E test examples

---

## Version 0.9.0 - 2026-03-01

### 🎯 Release Candidate

Final testing before stable release.

### ✨ New Features

- Complete reports module
- Scheduled report generation
- Report bookmarks
- Email notifications
- Document export (PDF, Excel)

### 🔧 Changes

- Updated to Django 5.2.6
- Updated to React 19
- Improved error handling
- Better validation messages

### 🐛 Bug Fixes

- Fixed timezone issues
- Corrected report generation errors
- Fixed file upload validation

---

## Version 0.8.0 - 2026-02-01

### 🎯 Beta Release

Core features complete, testing phase.

### ✨ New Features

- Termination management module
- Evaluation cycles
- 360° feedback support
- Advanced filtering

### 🔧 Changes

- Improved API structure
- Better error responses
- Enhanced security

### 🐛 Bug Fixes

- Fixed authentication edge cases
- Corrected permission issues
- Fixed date calculations

---

## Version 0.7.0 - 2026-01-01

### 🎯 Alpha Release

Initial feature set available.

### ✨ New Features

- Employee management
- Leave requests
- Basic evaluations
- User authentication

### 🔧 Changes

- Initial project structure
- Basic API endpoints
- Frontend foundation

---

## Version 0.6.0 - 2025-12-01

### 🎯 Pre-Alpha

Initial development.

### ✨ New Features

- Project setup
- Database models
- Basic authentication

---

## 📊 Version History Summary

| Version | Date | Status | Key Features |
|---------|------|--------|--------------|
| 1.0.0 | 2026-04-01 | Stable | Complete HRMS |
| 0.9.0 | 2026-03-01 | RC | Reports module |
| 0.8.0 | 2026-02-01 | Beta | Termination, evaluations |
| 0.7.0 | 2026-01-01 | Alpha | Core features |
| 0.6.0 | 2025-12-01 | Pre-Alpha | Initial setup |

---

## 🔄 Upgrade Guide

### From 0.9.0 to 1.0.0

```bash
# Backup database
python manage.py dumpdata > backup.json

# Update code
git pull origin main

# Install new dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Restart services
sudo systemctl restart portalrh
sudo systemctl restart nginx
```

### From 0.8.0 to 0.9.0

```bash
# Update code
git pull origin develop

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Restart services
```

---

## 📅 Release Schedule

| Version | Planned Date | Focus |
|---------|--------------|-------|
| 1.1.0 | 2026-05-01 | Performance improvements |
| 1.2.0 | 2026-06-01 | Mobile app support |
| 2.0.0 | 2026-09-01 | Multi-tenant support |

---

## 🐛 Known Issues

### Version 1.0.0

- [ ] Large file uploads may timeout (investigating)
- [ ] Some reports may be slow with large datasets (optimization planned for 1.1.0)
- [ ] Email notifications may be delayed in high-load scenarios

---

## 📞 Support

### Getting Help

- **Documentation:** https://github.com/GabrielDLobo/01-PortalRH/tree/master/docs
- **Issues:** https://github.com/GabrielDLobo/01-PortalRH/issues
- **API Docs:** `/api/docs/` or `/api/redoc/`

### Reporting Issues

When reporting issues, please include:

- Version number
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Screenshots if applicable

---

## 🙏 Acknowledgments

Thank you to all contributors who made this release possible!

---

## 📚 Related Documentation

- [Installation Guide](installation.md)
- [API Endpoints](api-endpoints.md)
- [Deployment Guide](deployment.md)
- [Contributing Guide](contributing.md)

---

**Last Updated:** April 1, 2026
