# PortalRH — Human Resources Management System

A production-ready **Human Resources Management System** built with **Django REST Framework** and **React + TypeScript**. Manage employees, leave requests, evaluations, admissions, terminations, and more with advanced analytics and reporting capabilities.

## Documentation

Full project documentation is available at:

<a href="./docs/" target="_blank" rel="noopener noreferrer"><strong>Open Documentation (docs/)</strong></a>

- **Local preview:**
  ```bash
  mkdocs serve -a 127.0.0.1:8011
  ```
  Open: http://127.0.0.1:8011/

- **Docs source:**
  Edit markdown pages in `docs/` and navigation in `mkdocs.yml`.

## Key Features

- **Employee Management**
  - Complete employee profiles
  - Document management and uploads
  - Department and position tracking
  - Hire date and contract information

- **Leave Management**
  - Leave request submission and approval workflow
  - Leave balance tracking
  - Multiple leave types support
  - Streamlined time-off requests

- **Performance Reviews**
  - Structured evaluation system
  - Performance ratings and feedback
  - Goals & objectives tracking
  - Development areas identification

- **Admission Process**
  - Pre-admission RH workflows
  - Department assignment
  - New hire onboarding
  - Document verification

- **Termination Management**
  - Termination request and approval
  - Notice period tracking
  - Severance process management
  - Exit documentation

- **Reports & Analytics**
  - Employee data reports
  - Leave analytics
  - Termination reports
  - Performance summary reports
  - Export to PDF and Excel

- **Staff Management**
  - Team and department organization
  - Staff hierarchy
  - Role-based access control

## Tech Stack

- **Backend:** Python / Django 5.2
- **Frontend:** React 19 + TypeScript
- **API:** Django REST Framework
- **Database:** PostgreSQL (production) / SQLite (development)
- **Documentation:** MkDocs + Material Theme
- **Styling:** TailwindCSS

## Project Structure (high-level)

- `app/` — Django project configuration (settings/urls) and main views
- `accounts/` — User authentication and authorization
- `employees/` — Employee profiles and document management
- `leave_requests/` — Leave management module
- `evaluations/` — Performance reviews and evaluations
- `accounts/` — Admin accounts and access control
- `staff/` — Staff and team management
- `termination/` — Employee termination processes
- `reports/` — Analytics and reporting
- `frontend/` — React TypeScript frontend application
- `docs/` — Full project documentation

## Main Routes (typical)

- `GET /api/v1/auth/login/` — Login endpoint
- `POST /api/v1/auth/login/` — Login submit
- `GET /api/v1/employees/` — List employees
- `GET /api/v1/leave-requests/` — Leave requests
- `GET /api/v1/evaluations/` — Performance evaluations
- `GET /api/v1/reports/` — Generate reports

> Other routes depend on each module (departments, staff, terminations, etc.).

## Getting Started (development)

### 1) Clone and create a virtual environment

```bash
git clone https://github.com/GabrielDLobo/01-PortalRH.git
cd 01-PortalRH

python -m venv venv
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

### 2) Install dependencies

```bash
pip install -r requirements.txt
```

### 3) Configure environment variables

Create a `.env` file in the project root:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

### 4) Run migrations and create an admin user

```bash
python manage.py migrate
python manage.py createsuperuser
```

### 5) Run the backend server

```bash
python manage.py runserver
```

Open: http://127.0.0.1:8000/

### 6) Run the frontend (separate terminal)

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:3000/

## Project Images

### Login & Dashboard

![Screenshot 1](media/projecting/1.png)
![Screenshot 2](media/projecting/2.png)
![Screenshot 3](media/projecting/3.png)

### Employee Management

![Screenshot 4](media/projecting/4.png)
![Screenshot 5](media/projecting/5.png)
![Screenshot 6](media/projecting/6.png)

### Reports & Analytics

![Screenshot 7](media/projecting/7.png)
![Screenshot 8](media/projecting/8.png)
![Screenshot 9](media/projecting/9.png)

### Administration

![Screenshot 10](media/projecting/10.png)
![Screenshot 11](media/projecting/11.png)
![Screenshot 12](media/projecting/12.png)

### Additional Features

![Screenshot 13](media/projecting/13.png)
![Screenshot 14](media/projecting/14.png)
![Screenshot 15](media/projecting/15.png)

## License

Private repository for internal use.
