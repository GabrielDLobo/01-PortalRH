# API Endpoints

Complete API reference documentation for PortalRH REST API.

---

## 📋 Overview

- **Base URL:** `/api/v1/`
- **Authentication:** JWT Bearer Token
- **Content Type:** `application/json`
- **API Documentation:** `/api/docs/` (Swagger UI) or `/api/redoc/` (ReDoc)

---

## 🔐 Authentication

### Obtain Token

**POST** `/api/v1/accounts/login/`

Authenticate user and obtain access/refresh tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "role": "admin_rh"
  }
}
```

---

### Refresh Token

**POST** `/api/v1/accounts/token/refresh/`

Refresh access token using refresh token.

**Request:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Register User

**POST** `/api/v1/accounts/register/`

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword",
  "role": "funcionario"
}
```

---

### Get Profile

**GET** `/api/v1/accounts/profile/`

Get current user profile information.

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "role": "admin_rh",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### Update Profile

**PUT** `/api/v1/accounts/profile/`

Update current user profile.

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "newemail@example.com"
}
```

---

## 👥 Employees API

### List Employees

**GET** `/api/v1/employees/`

Get all employees with pagination and filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number |
| `page_size` | int | Items per page |
| `search` | string | Search by name or email |
| `department` | string | Filter by department |
| `status` | string | Filter by status |
| `ordering` | string | Ordering field |

**Response:**
```json
{
  "count": 100,
  "next": "/api/v1/employees/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "employee_id": "EMP-0001",
      "user": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "cpf": "123.456.789-00",
      "position": "Developer",
      "department": "Engineering",
      "hire_date": "2024-01-01",
      "salary": "5000.00",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Get Employee

**GET** `/api/v1/employees/{id}/`

Get detailed employee information.

**Response:**
```json
{
  "id": 1,
  "employee_id": "EMP-0001",
  "user": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "cpf": "123.456.789-00",
  "rg": "12.345.678-9",
  "birth_date": "1990-01-01",
  "marital_status": "married",
  "phone": "+55 11 99999-9999",
  "street_address": "Rua Principal",
  "address_number": "123",
  "neighborhood": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "zip_code": "01000-000",
  "pis_pasep": "12345678901",
  "education_level": "undergraduate",
  "bank_name": "Banco do Brasil",
  "agency_number": "1234-5",
  "account_number": "12345-6",
  "department": "Engineering",
  "position": "Developer",
  "hire_date": "2024-01-01",
  "salary": "5000.00",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### Create Employee

**POST** `/api/v1/employees/`

Create a new employee.

**Request:**
```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "cpf": "987.654.321-00",
  "position": "Designer",
  "department": "Marketing",
  "hire_date": "2024-02-01",
  "salary": "4500.00",
  "status": "pending"
}
```

---

### Update Employee

**PUT** `/api/v1/employees/{id}/`

Update employee information.

**Request:**
```json
{
  "position": "Senior Developer",
  "salary": "6000.00",
  "status": "active"
}
```

---

### Delete Employee

**DELETE** `/api/v1/employees/{id}/`

Delete an employee.

**Response:** `204 No Content`

---

### List Employee Documents

**GET** `/api/v1/employees/{id}/documents/`

Get all documents for an employee.

**Response:**
```json
[
  {
    "id": 1,
    "employee": 1,
    "document_type": "rg",
    "document_name": "RG Document",
    "file": "/media/employee_documents/1/rg.pdf",
    "file_size": 1024000,
    "uploaded_at": "2024-01-01T00:00:00Z",
    "is_required": true,
    "is_verified": false
  }
]
```

---

### Upload Employee Document

**POST** `/api/v1/employees/{id}/documents/`

Upload a new document for an employee.

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `document_type` | string | Document type code |
| `file` | file | Document file |
| `is_required` | boolean | Is required document |

---

## 🏖️ Leave Requests API

### List Leave Types

**GET** `/api/v1/leave-requests/types/`

Get all leave types.

**Response:**
```json
[
  {
    "id": 1,
    "nome": "Férias",
    "descricao": "Annual vacation leave",
    "max_dias_ano": 30,
    "requer_aprovacao": true,
    "antecedencia_minima": 15,
    "ativo": true
  }
]
```

---

### List Leave Requests

**GET** `/api/v1/leave-requests/`

Get all leave requests with filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `tipo` | int | Filter by leave type ID |
| `solicitante` | int | Filter by requester ID |
| `data_inicio` | date | Filter by start date |

**Response:**
```json
{
  "count": 50,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "solicitante": 1,
      "solicitante_nome": "John Doe",
      "tipo": 1,
      "tipo_nome": "Férias",
      "data_inicio": "2024-06-01",
      "data_fim": "2024-06-30",
      "motivo": "Annual vacation",
      "dias_solicitados": 30,
      "dias_gozo": 20,
      "tem_abono_pecuniario": true,
      "dias_abono_pecuniario": 10,
      "prioridade": "media",
      "status": "pendente",
      "created_at": "2024-01-15T00:00:00Z"
    }
  ]
}
```

---

### Get Leave Request

**GET** `/api/v1/leave-requests/{id}/`

Get detailed leave request information.

---

### Create Leave Request

**POST** `/api/v1/leave-requests/`

Submit a new leave request.

**Request:**
```json
{
  "tipo": 1,
  "data_inicio": "2024-06-01",
  "data_fim": "2024-06-30",
  "motivo": "Annual vacation",
  "prioridade": "media",
  "dias_gozo": 20,
  "tem_abono_pecuniario": true,
  "dias_abono_pecuniario": 10
}
```

---

### Approve Leave Request

**POST** `/api/v1/leave-requests/{id}/approve/`

Approve a leave request.

**Request:**
```json
{
  "comentario": "Approved - Enjoy your vacation!"
}
```

---

### Reject Leave Request

**POST** `/api/v1/leave-requests/{id}/reject/`

Reject a leave request.

**Request:**
```json
{
  "comentario": "Rejected - Insufficient staffing for this period"
}
```

---

### Cancel Leave Request

**POST** `/api/v1/leave-requests/{id}/cancel/`

Cancel a leave request.

---

### Get Leave Balances

**GET** `/api/v1/leave-requests/balances/`

Get current user's leave balances.

**Response:**
```json
[
  {
    "id": 1,
    "funcionario": 1,
    "tipo": 1,
    "tipo_nome": "Férias",
    "ano": 2024,
    "dias_disponiveis": 30,
    "dias_utilizados": 0,
    "dias_restantes": 30
  }
]
```

---

## 📊 Evaluations API

### List Evaluation Templates

**GET** `/api/v1/evaluations/templates/`

Get all evaluation templates.

**Response:**
```json
[
  {
    "id": 1,
    "nome": "Performance Review 2024",
    "descricao": "Annual performance evaluation",
    "ativo": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### List Evaluations

**GET** `/api/v1/evaluations/`

Get all evaluations with filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `avaliado` | int | Filter by evaluatee ID |
| `avaliador` | int | Filter by evaluator ID |
| `tipo` | string | Filter by evaluation type |

**Response:**
```json
{
  "count": 25,
  "results": [
    {
      "id": 1,
      "template": 1,
      "template_nome": "Performance Review 2024",
      "avaliado": 2,
      "avaliado_nome": "Jane Smith",
      "avaliador": 1,
      "avaliador_nome": "John Doe",
      "tipo": "avaliacao_superior",
      "periodo_inicio": "2024-01-01",
      "periodo_fim": "2024-12-31",
      "status": "pendente",
      "nota_final": null,
      "data_limite": "2024-12-15T23:59:59Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Create Evaluation

**POST** `/api/v1/evaluations/`

Create a new evaluation.

**Request:**
```json
{
  "template": 1,
  "avaliado": 2,
  "tipo": "avaliacao_superior",
  "periodo_inicio": "2024-01-01",
  "periodo_fim": "2024-12-31",
  "data_limite": "2024-12-15T23:59:59Z"
}
```

---

### Submit Evaluation Score

**POST** `/api/v1/evaluations/{id}/scores/`

Submit scores for evaluation criteria.

**Request:**
```json
{
  "criterio": 1,
  "nota": 8.5,
  "comentario": "Excellent performance in technical skills"
}
```

---

### Finalize Evaluation

**POST** `/api/v1/evaluations/{id}/finalize/`

Finalize an evaluation and calculate final score.

---

## 📄 Termination API

### List Termination Reasons

**GET** `/api/v1/termination/reasons/`

Get all termination reasons.

**Response:**
```json
[
  {
    "id": 1,
    "nome": "Resignation",
    "codigo": "RES",
    "descricao": "Employee initiated resignation",
    "ativo": true
  }
]
```

---

### List Termination Requests

**GET** `/api/v1/termination/`

Get all termination requests.

**Response:**
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "funcionario": 3,
      "funcionario_nome": "Bob Johnson",
      "solicitante": 1,
      "solicitante_nome": "John Doe",
      "motivo": 1,
      "motivo_nome": "Resignation",
      "data_ultimo_dia": "2024-03-31",
      "data_desligamento": "2024-04-01",
      "justificativa": "Employee requested resignation for personal reasons",
      "status": "pendente_rh",
      "created_at": "2024-02-15T00:00:00Z"
    }
  ]
}
```

---

### Create Termination Request

**POST** `/api/v1/termination/`

Create a new termination request.

**Request:**
```json
{
  "funcionario": 3,
  "motivo": 1,
  "data_ultimo_dia": "2024-03-31",
  "data_desligamento": "2024-04-01",
  "justificativa": "Employee requested resignation"
}
```

---

### Approve Termination (HR)

**POST** `/api/v1/termination/{id}/approve/`

Approve termination request by HR.

**Request:**
```json
{
  "comentario": "Approved - All documentation complete"
}
```

---

### Reject Termination (HR)

**POST** `/api/v1/termination/{id}/reject/`

Reject termination request by HR.

---

### Complete Termination

**POST** `/api/v1/termination/{id}/complete/`

Mark termination as completed.

---

## 👔 Staff API

### List Staff Employees

**GET** `/api/v1/staff/`

Get all staff employees.

---

### Get Staff Employee

**GET** `/api/v1/staff/{id}/`

Get detailed staff employee information.

---

### Create Staff Employee

**POST** `/api/v1/staff/`

Create a new staff employee.

**Request:**
```json
{
  "user": 1,
  "nome": "Alice Williams",
  "cargo": "Manager",
  "setor": "Human Resources",
  "data_admissao": "2024-01-01",
  "salario": "7000.00",
  "cpf": "111.222.333-44",
  "rg": "11.222.333-4",
  "telefone": "+55 11 98888-8888",
  "endereco": "Rua das Flores, 456",
  "data_nascimento": "1985-05-15",
  "status": "ativo"
}
```

---

### List Departments

**GET** `/api/v1/staff/departments/`

Get all departments.

**Response:**
```json
[
  {
    "id": 1,
    "nome": "Human Resources",
    "descricao": "HR department",
    "employee_count": 5
  }
]
```

---

## 📈 Reports API

### List Report Templates

**GET** `/api/v1/reports/templates/`

Get all available report templates.

**Response:**
```json
[
  {
    "id": "uuid-1234-5678",
    "name": "Employee Summary Report",
    "description": "Summary of all employees",
    "report_type": "employees",
    "category": 1,
    "category_nome": "HR Reports",
    "output_formats": ["json", "pdf", "excel"],
    "default_format": "pdf",
    "is_public": true,
    "created_by": 1
  }
]
```

---

### Execute Report

**POST** `/api/v1/reports/templates/{id}/execute/`

Execute a report template.

**Request:**
```json
{
  "output_format": "pdf",
  "parameters": {
    "department": "Engineering",
    "status": "active",
    "date_range": {
      "start": "2024-01-01",
      "end": "2024-12-31"
    }
  }
}
```

**Response:**
```json
{
  "id": "execution-uuid",
  "template": "uuid-1234-5678",
  "status": "completed",
  "result_data": {...},
  "file_path": "/media/reports/report_20240101.pdf",
  "execution_time_seconds": 2.5,
  "rows_processed": 100
}
```

---

### Get Report Execution

**GET** `/api/v1/reports/executions/{id}/`

Get report execution result.

---

### List Report Schedules

**GET** `/api/v1/reports/schedules/`

Get all scheduled reports.

---

### Create Report Schedule

**POST** `/api/v1/reports/schedules/`

Create a new report schedule.

**Request:**
```json
{
  "name": "Monthly Employee Report",
  "template": "uuid-1234-5678",
  "frequency": "monthly",
  "output_format": "pdf",
  "email_recipients": ["hr@example.com"],
  "send_email_on_success": true
}
```

---

### Bookmark Report

**POST** `/api/v1/reports/bookmarks/`

Bookmark a report for quick access.

**Request:**
```json
{
  "template": "uuid-1234-5678",
  "name": "My Favorite Report",
  "parameters": {"department": "Engineering"}
}
```

---

## 📝 Admission API

### Get Pre-Admission

**GET** `/api/v1/employees/pre-admission/{id}/`

Get pre-admission RH information.

---

### Create Pre-Admission

**POST** `/api/v1/employees/pre-admission/`

Create pre-admission RH record.

**Request:**
```json
{
  "personal_email": "newemployee@example.com",
  "full_name": "New Employee",
  "position": "Developer",
  "department": "Engineering",
  "job_description": "Software development",
  "work_schedule": "9:00-18:00",
  "weekly_workload": "40h",
  "contract_type": "clt",
  "salary": "5000.00",
  "benefits": "VT, VR, Plano de Saúde",
  "start_date": "2024-03-01",
  "direct_manager": "John Doe"
}
```

---

### Create Employee User

**POST** `/api/v1/employees/pre-admission/{id}/create-user/`

Create user account for pre-admitted employee.

---

### Send Admission Email

**POST** `/api/v1/employees/pre-admission/{id}/send-email/`

Send admission email to employee.

---

### Get Admission Process

**GET** `/api/v1/employees/admission/{id}/`

Get admission process status.

---

### Update Admission Process

**PATCH** `/api/v1/employees/admission/{id}/`

Update admission process progress.

---

## 🔍 Filter & Search Parameters

### Common Filters

Most list endpoints support these query parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `search` | Full-text search | `?search=john` |
| `page` | Page number | `?page=2` |
| `page_size` | Items per page | `?page_size=50` |
| `ordering` | Sort field | `?ordering=-created_at` |

### Ordering

Prefix with `-` for descending order:

- `?ordering=name` - Ascending by name
- `?ordering=-created_at` - Descending by date
- `?ordering=status,name` - Multiple fields

---

## ⚠️ Error Responses

### Standard Error Format

```json
{
  "detail": "Error message here"
}
```

### Validation Errors

```json
{
  "field_name": [
    "Error message for this field"
  ],
  "another_field": [
    "Another error message"
  ]
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `204` | No Content |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `422` | Validation Error |
| `500` | Server Error |

---

## 🔒 Permissions

| Endpoint | Permission Required |
|----------|---------------------|
| `/accounts/login/` | None |
| `/accounts/register/` | None |
| `/accounts/*` | Authenticated |
| `/employees/` | Admin RH |
| `/leave-requests/` | Authenticated |
| `/evaluations/` | Authenticated |
| `/termination/` | Admin RH |
| `/staff/` | Admin RH |
| `/reports/` | Authenticated |

---

## 📚 Related Documentation

- [System Modeling](system-modeling.md) - Data models
- [Authentication](authentication.md) - Security details
- [Development Guide](development.md) - API development

---

## 🆘 API Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:8000/api/v1/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get employees
curl http://localhost:8000/api/v1/employees/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Create a new request
2. Set method and URL
3. Add `Authorization: Bearer <token>` header
4. Send request

---

## 🌐 Interactive Documentation

Visit the following URLs for interactive API documentation:

- **Swagger UI:** http://localhost:8000/api/docs/
- **ReDoc:** http://localhost:8000/api/redoc/
- **OpenAPI Schema:** http://localhost:8000/api/schema/
