<!-- markdownlint-disable MD010 MD012 -->

# Frontend

This page documents the frontend implementation in `frontend/`, with special focus on `src/pages` and route organization.

## Overview

PortalRH frontend is a React + TypeScript SPA focused on HR workflows:

- Authentication and first-login password change
- Dashboards and analytics
- Employee lifecycle operations (admission, profile, leaves, evaluations, terminations)
- Reports and exports

## Stack

- React 19
- TypeScript
- React Router
- Tailwind CSS
- Axios
- React Hook Form + Yup
- Chart.js

## Local Setup

```bash
cd frontend
npm install
npm run dev
```

Default local URL: `http://localhost:3000`

## Main Scripts

```bash
npm run dev
npm run build
npm run test
npm run lint
npm run lint:fix
npm run type-check
```

## Source Structure (src)

Current high-level structure:

```text
src/
  App.tsx
  App.css
  App.test.tsx
  index.tsx
  index.css
  react-app-env.d.ts
  reportWebVitals.ts
  setupTests.ts
  logo.svg
  components/
    auth/
    charts/
    common/
    dashboard/
    employees/
    evaluations/
    hr/
    layout/
    leaves/
    profile/
    index.ts
  contexts/
    AuthContext.tsx
    LanguageContext.tsx
  hooks/
  locales/
    en.json
    pt.json
  pages/
    Dashboard.tsx
    EmployeeAdmission.tsx
    EmployeeDetail.tsx
    Employees.tsx
    Evaluations.tsx
    LeaveRequests.tsx
    LeaveRequestsSimple.tsx
    LeaveRequestsTest.tsx
    Profile.tsx
    Reports.tsx
    Terminations.tsx
  services/
    admissionService.ts
    api.ts
    authService.ts
    employeeService.ts
    evaluationService.ts
    leaveService.ts
    preAdmissionService.ts
    terminationService.ts
  types/
    auth.ts
    employee.ts
    evaluation.ts
    leave.ts
    termination.ts
  utils/
    constants.ts
    formatters.ts
    validation.ts
```

## Route Map (App.tsx)

Main routes and access rules:

- `/login`: public login route
- `/`: role-based home (`admin_rh` -> dashboard, `funcionario` -> admission)
- `/employees`: protected, `admin_rh`
- `/employees/:id`: protected, `admin_rh` and `funcionario`
- `/leaves`: protected, `admin_rh`
- `/evaluations`: protected, `admin_rh`
- `/terminations`: protected, `admin_rh`
- `/reports`: protected, `admin_rh`
- `/admission`: authenticated route
- `/profile`: authenticated route

Fallback route currently redirects to `/admission`.

## Detailed Pages Folder (src/pages)

### 1) Dashboard.tsx

Responsibilities:

- Executive metrics and cards
- Visual analytics with Chart.js (`Bar`, `Doughnut`)
- Aggregates data from employees and terminations

Main dependencies:

- `employeeService`
- `terminationService`
- `AuthContext`, `LanguageContext`
- Shared UI components (`LoadingSpinner`, `StatCard`, `ResponsiveGrid`)

### 2) EmployeeAdmission.tsx

Responsibilities:

- Admission and pre-admission flow
- Large form for personal, contract, and related HR data
- Upload flow and validation feedback

Main dependencies:

- `employeeService`
- Form components (`Input`, `Select`, `CEPInput`, `TextArea`, `Button`)
- `AuthContext`, `LanguageContext`

### 3) EmployeeDetail.tsx

Responsibilities:

- Full employee profile visualization
- Edit mode and update operations
- Document management and verification states

Main dependencies:

- `employeeService`
- `UpdateEmployeeRequest` type
- Detail-oriented components (`Modal`, `Badge`, `LoadingSpinner`)

### 4) Employees.tsx

Responsibilities:

- Employee list page
- Search, filters, sorting, pagination
- Navigation to employee details

Main dependencies:

- `employeeService`
- `Table`, `Pagination`, `Modal`, filters UI
- `formatters` helpers

### 5) Evaluations.tsx

Responsibilities:

- Performance evaluation lifecycle
- List, creation flow, status handling
- Evaluation dashboard with charts

Main dependencies:

- `evaluationService`
- `employeeService`
- `EVALUATION_RATINGS` constants
- `Table`, `Pagination`, `Modal`

### 6) LeaveRequests.tsx

Responsibilities:

- Leave requests management
- Approval and rejection actions
- Stats cards and filtering/search interactions

Main dependencies:

- `employeeService` (employee references)
- Shared components (`StatCard`, `Modal`, `Input`, `Select`)
- i18n and auth contexts

### 7) LeaveRequestsSimple.tsx

Responsibilities:

- Minimal debug page used to validate layout/CSS behavior

Status:

- Support/testing artifact, not part of main route flow in `App.tsx`

### 8) LeaveRequestsTest.tsx

Responsibilities:

- Alternative debug page with inline styles for render-position checks

Status:

- Support/testing artifact, not part of main route flow in `App.tsx`

### 9) Profile.tsx

Responsibilities:

- User profile update
- Password change flow
- Form validation with `react-hook-form` + `yup`

Main dependencies:

- `authService`
- `AuthContext`, `LanguageContext`
- Form components (`Input`, `Button`)

### 10) Reports.tsx

Responsibilities:

- Report generation and download
- Export strategies for PDF and Excel
- Date-based filter controls and report type handling

Main dependencies:

- `jspdf`, `jspdf-autotable`, `xlsx`
- Domain types for employees, terminations, evaluations

### 11) Terminations.tsx

Responsibilities:

- Termination request lifecycle
- Creation, tracking, status transitions
- Charts and tabular analytics for termination indicators

Main dependencies:

- `terminationService`
- `employeeService`
- `Table`, `Pagination`, `Modal`, chart components

## Environment

Create `.env` based on your environment and backend URL.

Example:

```env
REACT_APP_API_URL=http://localhost:8000/api
NODE_ENV=development
REACT_APP_APP_NAME=PortalRH
REACT_APP_VERSION=1.0.0
```

## Notes

- Keep API base URL aligned with backend settings.
- Prefer typed service calls and centralized API helpers.
- Keep labels in sync with `locales/en.json` and `locales/pt.json`.
- Revisit `LeaveRequestsSimple.tsx` and `LeaveRequestsTest.tsx` before production release if they are no longer needed.

