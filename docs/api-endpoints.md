# API Endpoints

Complete reference for all PortalRH API endpoints.

---

## 📡 API Information

- **Base URL:** `/api/v1/`
- **Authentication:** JWT Bearer Token
- **Content Type:** `application/json`
- **API Documentation:** `/api/docs/` (Swagger UI)
- **Alternative Docs:** `/api/redoc/` (ReDoc)
- **Schema:** `/api/schema/`

---

## 🔐 Authentication Format

Include JWT token in request headers:

```http
Authorization: Bearer <access_token>
```

---

## 📋 Endpoints Overview

| Module | Base Path | Endpoints |
|--------|-----------|-----------|
| Authentication | `/accounts/auth/` | login, refresh, verify, register |
| Users | `/accounts/users/` | CRUD, profile, password change |
| Employees | `/employees/` | CRUD, documents, admission |
| Evaluations | `/evaluations/` | templates, evaluations, cycles |
| Leave Requests | `/leave-requests/` | types, requests, balances |
| Reports | `/reports/` | templates, executions, schedules |
| Staff | `/staff/` | departments, employees |
| Termination | `/termination/` | reasons, requests, documents |

---

## 🔑 Authentication Endpoints

### Login

**POST** `/api/v1/accounts/auth/login/`

Authenticate user and receive JWT tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbG...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbG...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin_rh"
  },
  "requires_password_change": false
}
```

---

### Refresh Token

**POST** `/api/v1/accounts/auth/refresh/`

Get new access token using refresh token.

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbG..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbG..."
}
```

---

### Verify Token

**POST** `/api/v1/accounts/auth/verify/`

Verify if access token is valid.

**Request:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbG..."
}
```

**Response (200 OK):**
```json
{}
```

---

### Register User

**POST** `/api/v1/accounts/auth/register/`

Create new user (Admin RH only).

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "first_name": "Jane",
  "last_name": "Doe",
  "role": "funcionario"
}
```

**Response (201 Created):**
```json
{
  "id": 5,
  "email": "newuser@example.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "role": "funcionario",
  "is_active": true
}
```

---

### First Login Password Change

**POST** `/api/v1/accounts/auth/first-login-password-change/`

Change password on first login.

**Request:**
```json
{
  "old_password": "temporary_password",
  "new_password": "new_secure_password"
}
```

**Response (200 OK):**
```json
{
  "message": "Senha alterada com sucesso."
}
```

---

### Check Password Change Required

**GET** `/api/v1/accounts/auth/check-password-change-required/`

Check if user needs to change password.

**Response (200 OK):**
```json
{
  "requires_password_change": true
}
```

---

## 👥 User Endpoints

### List Users

**GET** `/api/v1/accounts/users/`

**Query Parameters:**
- `search` - Search by name or email
- `role` - Filter by role
- `is_active` - Filter by active status
- `page` - Page number

**Response (200 OK):**
```json
{
  "count": 50,
  "next": "http://api/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "email": "admin@portalrh.com",
      "first_name": "Admin",
      "last_name": "RH",
      "role": "admin_rh",
      "is_active": true
    }
  ]
}
```

---

### Get User Profile

**GET** `/api/v1/accounts/users/profile/`

Get current authenticated user's profile.

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "funcionario",
  "date_joined": "2024-01-15T10:30:00Z"
}
```

---

### Change Password

**POST** `/api/v1/accounts/users/change_password/`

**Request:**
```json
{
  "old_password": "current_password",
  "new_password": "new_password"
}
```

**Response (200 OK):**
```json
{
  "message": "Senha alterada com sucesso."
}
```

---

### Get User Statistics

**GET** `/api/v1/accounts/users/stats/`

Get user statistics (Admin RH only).

**Response (200 OK):**
```json
{
  "total_users": 150,
  "active_users": 142,
  "admin_rh_count": 5,
  "funcionario_count": 145
}
```

---

## 👨‍💼 Employee Endpoints

### List Employees

**GET** `/api/v1/employees/employees/`

**Query Parameters:**
- `search` - Search by name
- `status` - Filter by status
- `department` - Filter by department
- `page` - Page number

**Response (200 OK):**
```json
{
  "count": 100,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "employee_id": "EMP-0001",
      "full_name": "John Doe",
      "email": "john@company.com",
      "department": "Engineering",
      "position": "Developer",
      "status": "active",
      "hire_date": "2024-01-15"
    }
  ]
}
```

---

### Get Employee Detail

**GET** `/api/v1/employees/employees/{id}/`

**Response (200 OK):**
```json
{
  "id": 1,
  "employee_id": "EMP-0001",
  "user": 1,
  "full_name": "John Doe",
  "cpf": "123.456.789-00",
  "rg": "12.345.678-9",
  "birth_date": "1990-05-15",
  "phone": "(11) 99999-9999",
  "email": "john@company.com",
  "street_address": "Rua Principal",
  "address_number": "123",
  "neighborhood": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "zip_code": "01000-000",
  "department": "Engineering",
  "position": "Developer",
  "hire_date": "2024-01-15",
  "salary": "5000.00",
  "status": "active",
  "admission_completed": true
}
```

---

### Create Employee

**POST** `/api/v1/employees/employees/`

**Request:**
```json
{
  "user": 1,
  "full_name": "Jane Doe",
  "cpf": "987.654.321-00",
  "rg": "98.765.432-1",
  "birth_date": "1992-08-20",
  "phone": "(11) 98888-8888",
  "email": "jane@company.com",
  "street_address": "Rua Secundária",
  "address_number": "456",
  "neighborhood": "Jardins",
  "city": "São Paulo",
  "state": "SP",
  "zip_code": "01001-000",
  "department": "Marketing",
  "position": "Designer",
  "hire_date": "2024-02-01",
  "salary": "4500.00"
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "employee_id": "EMP-0002",
  "full_name": "Jane Doe",
  ...
}
```

---

### Get My Profile

**GET** `/api/v1/employees/employees/my_profile/`

Get current user's employee profile.

**Response (200 OK):**
```json
{
  "id": 1,
  "employee_id": "EMP-0001",
  "full_name": "John Doe",
  ...
}
```

---

### Update Personal Information

**PATCH** `/api/v1/employees/employees/{id}/update_personal_info/`

**Request:**
```json
{
  "phone": "(11) 97777-7777",
  "street_address": "Nova Rua",
  "address_number": "789"
}
```

**Response (200 OK):**
```json
{
  "message": "Informações atualizadas com sucesso."
}
```

---

### Get Admission Status

**GET** `/api/v1/employees/employees/{id}/admission_status/`

**Response (200 OK):**
```json
{
  "employee_id": "EMP-0001",
  "status": "documents_uploaded",
  "completion_percentage": 75,
  "personal_info_completed": true,
  "documents_uploaded": true,
  "hr_review_completed": false
}
```

---

## 📄 Employee Document Endpoints

### List Documents

**GET** `/api/v1/employees/employees/{employee_pk}/documents/`

**Response (200 OK):**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "employee": 1,
      "document_type": "rg",
      "document_name": "RG Front",
      "file": "/media/employees/documents/rg_001.pdf",
      "file_size": 102400,
      "uploaded_at": "2024-01-15T10:00:00Z",
      "is_required": true,
      "is_verified": false
    }
  ]
}
```

---

### Upload Document

**POST** `/api/v1/employees/employees/{employee_pk}/documents/`

**Content-Type:** `multipart/form-data`

**Request:**
```
document_type: rg
document_name: RG Front
file: <file>
is_required: true
```

**Response (201 Created):**
```json
{
  "id": 1,
  "document_type": "rg",
  "file": "/media/employees/documents/rg_001.pdf",
  ...
}
```

---

### Verify Document

**PATCH** `/api/v1/employees/employees/{employee_pk}/documents/{id}/verify/`

**Request:**
```json
{
  "is_verified": true
}
```

**Response (200 OK):**
```json
{
  "message": "Documento verificado com sucesso."
}
```

---

### Get Required Documents

**GET** `/api/v1/employees/employees/{employee_pk}/documents/required_documents/`

**Response (200 OK):**
```json
{
  "required_documents": [
    {"type": "rg", "name": "RG", "uploaded": true},
    {"type": "cpf", "name": "CPF", "uploaded": true},
    {"type": "birth_certificate", "name": "Birth Certificate", "uploaded": false},
    {"type": "residence_proof", "name": "Residence Proof", "uploaded": false},
    {"type": "photo", "name": "Photo", "uploaded": true}
  ]
}
```

---

## 📊 Evaluation Endpoints

### List Templates

**GET** `/api/v1/evaluations/templates/`

**Response (200 OK):**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "nome": "Annual Performance Review",
      "descricao": "Annual evaluation template",
      "ativo": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Create Evaluation

**POST** `/api/v1/evaluations/evaluations/`

**Request:**
```json
{
  "template": 1,
  "avaliado": 5,
  "avaliador": 1,
  "tipo": "avaliacao_superior",
  "periodo_inicio": "2024-01-01",
  "periodo_fim": "2024-12-31",
  "status": "pendente"
}
```

**Response (201 Created):**
```json
{
  "id": 10,
  "template": 1,
  "avaliado": 5,
  "avaliador": 1,
  "tipo": "avaliacao_superior",
  "status": "pendente",
  ...
}
```

---

### Submit Evaluation Score

**POST** `/api/v1/evaluations/scores/`

**Request:**
```json
{
  "avaliacao": 10,
  "criterio": 1,
  "nota": "8.5",
  "comentario": "Great performance"
}
```

**Response (201 Created):**
```json
{
  "id": 50,
  "avaliacao": 10,
  "criterio": 1,
  "nota": "8.50",
  "comentario": "Great performance"
}
```

---

### Get My Evaluations

**GET** `/api/v1/evaluations/evaluations/my_evaluations/`

**Response (200 OK):**
```json
{
  "count": 5,
  "results": [
    {
      "id": 10,
      "template_name": "Annual Performance Review",
      "tipo": "avaliacao_superior",
      "status": "concluida",
      "nota_final": "8.75",
      "data_conclusao": "2024-12-15T10:00:00Z"
    }
  ]
}
```

---

### Start Evaluation Cycle

**POST** `/api/v1/evaluations/cycles/{id}/start/`

**Response (200 OK):**
```json
{
  "message": "Ciclo iniciado com sucesso.",
  "status": "ativo"
}
```

---

## 🏖️ Leave Request Endpoints

### List Leave Types

**GET** `/api/v1/leave-requests/types/`

**Response (200 OK):**
```json
{
  "count": 4,
  "results": [
    {
      "id": 1,
      "nome": "Vacation",
      "descricao": "Annual vacation leave",
      "max_dias_ano": 30,
      "requer_aprovacao": true,
      "ativo": true
    }
  ]
}
```

---

### Create Leave Request

**POST** `/api/v1/leave-requests/requests/`

**Request:**
```json
{
  "tipo": 1,
  "data_inicio": "2024-06-01",
  "data_fim": "2024-06-30",
  "motivo": "Annual vacation",
  "observacoes": "Will be traveling",
  "dias_gozo": 30,
  "tem_abono_pecuniario": true,
  "dias_abono_pecuniario": 10
}
```

**Response (201 Created):**
```json
{
  "id": 15,
  "solicitante": 1,
  "tipo": 1,
  "data_inicio": "2024-06-01",
  "data_fim": "2024-06-30",
  "status": "pendente",
  "dias_solicitados": 30
}
```

---

### Approve Leave Request

**POST** `/api/v1/leave-requests/requests/{id}/approve/`

**Request:**
```json
{
  "status": "aprovada",
  "comentario_aprovacao": "Approved. Enjoy your vacation!"
}
```

**Response (200 OK):**
```json
{
  "message": "Solicitação aprovada com sucesso.",
  "status": "aprovada"
}
```

---

### Get My Leave Balances

**GET** `/api/v1/leave-requests/balances/my_balances/`

**Response (200 OK):**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "tipo": "Vacation",
      "ano": 2024,
      "dias_disponiveis": 30,
      "dias_utilizados": 15,
      "dias_restantes": 15
    }
  ]
}
```

---

### Get Leave Calendar

**GET** `/api/v1/leave-requests/requests/calendar/`

**Query Parameters:**
- `year` - Year to display
- `department` - Filter by department

**Response (200 OK):**
```json
{
  "events": [
    {
      "employee_name": "John Doe",
      "start": "2024-06-01",
      "end": "2024-06-30",
      "type": "Vacation"
    }
  ]
}
```

---

## 📈 Report Endpoints

### List Report Templates

**GET** `/api/v1/reports/templates/`

**Query Parameters:**
- `category` - Filter by category
- `report_type` - Filter by type
- `is_public` - Filter by visibility

**Response (200 OK):**
```json
{
  "count": 10,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Employee Headcount Report",
      "description": "Current employee count by department",
      "report_type": "employees",
      "category": 1,
      "output_formats": ["pdf", "excel", "csv"],
      "default_format": "excel",
      "is_public": true
    }
  ]
}
```

---

### Execute Report

**POST** `/api/v1/reports/templates/{id}/execute/`

**Request:**
```json
{
  "output_format": "excel",
  "parameters": {
    "department": "Engineering",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  }
}
```

**Response (202 Accepted):**
```json
{
  "execution_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "pending",
  "message": "Report execution started"
}
```

---

### Download Report

**GET** `/api/v1/reports/executions/{id}/download/`

**Response:** File download (binary)

---

### Create Report Schedule

**POST** `/api/v1/reports/schedules/`

**Request:**
```json
{
  "name": "Monthly Headcount Report",
  "template": "550e8400-e29b-41d4-a716-446655440000",
  "frequency": "monthly",
  "cron_expression": "0 9 1 * *",
  "output_format": "excel",
  "email_recipients": ["hr@company.com"],
  "send_email_on_success": true
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "Monthly Headcount Report",
  "status": "active",
  "next_execution": "2024-05-01T09:00:00Z"
}
```

---

### Get Dashboard Summary

**GET** `/api/v1/reports/dashboard/summary/`

**Response (200 OK):**
```json
{
  "total_employees": 150,
  "active_leave_requests": 12,
  "pending_evaluations": 25,
  "pending_terminations": 3,
  "recent_hires": 5,
  "upcoming_birthdays": 8
}
```

---

## 🚪 Termination Endpoints

### List Termination Reasons

**GET** `/api/v1/termination/reasons/`

**Response (200 OK):**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "nome": "Voluntary Resignation",
      "codigo": "VR",
      "descricao": "Employee voluntarily resigns",
      "ativo": true
    }
  ]
}
```

---

### Create Termination Request

**POST** `/api/v1/termination/requests/`

**Request:**
```json
{
  "funcionario": 5,
  "motivo": 1,
  "data_ultimo_dia": "2024-06-30",
  "justificativa": "Personal reasons"
}
```

**Response (201 Created):**
```json
{
  "id": 10,
  "funcionario": 5,
  "motivo": 1,
  "status": "pendente_rh",
  "data_ultimo_dia": "2024-06-30"
}
```

---

### Approve Termination

**POST** `/api/v1/termination/requests/{id}/approve/`

**Request:**
```json
{
  "comentario_aprovacao_rh": "Approved. Exit interview scheduled."
}
```

**Response (200 OK):**
```json
{
  "message": "Terminação aprovada com sucesso.",
  "status": "aprovada_rh"
}
```

---

### Start Termination Processing

**POST** `/api/v1/termination/requests/{id}/start_processing/`

**Response (200 OK):**
```json
{
  "message": "Processamento de desligamento iniciado.",
  "status": "processando"
}
```

---

### Complete Termination

**POST** `/api/v1/termination/requests/{id}/complete/`

**Response (200 OK):**
```json
{
  "message": "Desligamento concluído com sucesso.",
  "status": "concluida"
}
```

---

## 📊 Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {
      "field_name": ["Error message for field"]
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `AUTHENTICATION_FAILED` | 401 | Invalid credentials |
| `PERMISSION_DENIED` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `SERVER_ERROR` | 500 | Internal server error |

### Example Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["This field is required"],
      "cpf": ["Invalid CPF format"]
    }
  }
}
```

---

## 🔍 Query Parameters

### Common Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `search` | Full-text search | `?search=john` |
| `page` | Page number | `?page=2` |
| `page_size` | Items per page | `?page_size=20` |
| `ordering` | Sort field | `?ordering=-created_at` |
| `status` | Filter by status | `?status=active` |

### Ordering Syntax

- Ascending: `?ordering=name`
- Descending: `?ordering=-name`
- Multiple: `?ordering=department,-created_at`

---

## 📝 Pagination

All list endpoints support pagination:

```json
{
  "count": 100,
  "next": "http://api/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

---

**Next:** [System Modeling](system-modeling.md)
