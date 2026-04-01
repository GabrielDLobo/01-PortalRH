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

<pre><code>Authorization: Bearer &lt;access_token&gt;</code></pre>
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
<pre><code>{
  &quot;email&quot;: &quot;user@example.com&quot;,
  &quot;password&quot;: &quot;securepassword&quot;
}</code></pre>
**Response (200 OK):**
<pre><code>{
  &quot;access&quot;: &quot;eyJ0eXAiOiJKV1QiLCJhbG...&quot;,
  &quot;refresh&quot;: &quot;eyJ0eXAiOiJKV1QiLCJhbG...&quot;,
  &quot;user&quot;: {
    &quot;id&quot;: 1,
    &quot;email&quot;: &quot;user@example.com&quot;,
    &quot;first_name&quot;: &quot;John&quot;,
    &quot;last_name&quot;: &quot;Doe&quot;,
    &quot;role&quot;: &quot;admin_rh&quot;
  },
  &quot;requires_password_change&quot;: false
}</code></pre>
---

### Refresh Token

**POST** `/api/v1/accounts/auth/refresh/`

Get new access token using refresh token.

**Request:**
<pre><code>{
  &quot;refresh&quot;: &quot;eyJ0eXAiOiJKV1QiLCJhbG...&quot;
}</code></pre>
**Response (200 OK):**
<pre><code>{
  &quot;access&quot;: &quot;eyJ0eXAiOiJKV1QiLCJhbG...&quot;
}</code></pre>
---

### Verify Token

**POST** `/api/v1/accounts/auth/verify/`

Verify if access token is valid.

**Request:**
<pre><code>{
  &quot;token&quot;: &quot;eyJ0eXAiOiJKV1QiLCJhbG...&quot;
}</code></pre>
**Response (200 OK):**
<pre><code>{}</code></pre>
---

### Register User

**POST** `/api/v1/accounts/auth/register/`

Create new user (Admin RH only).

**Request:**
<pre><code>{
  &quot;email&quot;: &quot;newuser@example.com&quot;,
  &quot;password&quot;: &quot;securepassword&quot;,
  &quot;first_name&quot;: &quot;Jane&quot;,
  &quot;last_name&quot;: &quot;Doe&quot;,
  &quot;role&quot;: &quot;funcionario&quot;
}</code></pre>
**Response (201 Created):**
<pre><code>{
  &quot;id&quot;: 5,
  &quot;email&quot;: &quot;newuser@example.com&quot;,
  &quot;first_name&quot;: &quot;Jane&quot;,
  &quot;last_name&quot;: &quot;Doe&quot;,
  &quot;role&quot;: &quot;funcionario&quot;,
  &quot;is_active&quot;: true
}</code></pre>
---

### First Login Password Change

**POST** `/api/v1/accounts/auth/first-login-password-change/`

Change password on first login.

**Request:**
<pre><code>{
  &quot;old_password&quot;: &quot;temporary_password&quot;,
  &quot;new_password&quot;: &quot;new_secure_password&quot;
}</code></pre>
**Response (200 OK):**
<pre><code>{
  &quot;message&quot;: &quot;Senha alterada com sucesso.&quot;
}</code></pre>
---

### Check Password Change Required

**GET** `/api/v1/accounts/auth/check-password-change-required/`

Check if user needs to change password.

**Response (200 OK):**
<pre><code>{
  &quot;requires_password_change&quot;: true
}</code></pre>
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
<pre><code>{
  &quot;count&quot;: 50,
  &quot;next&quot;: &quot;http://api/users/?page=2&quot;,
  &quot;previous&quot;: null,
  &quot;results&quot;: [
    {
      &quot;id&quot;: 1,
      &quot;email&quot;: &quot;admin@portalrh.com&quot;,
      &quot;first_name&quot;: &quot;Admin&quot;,
      &quot;last_name&quot;: &quot;RH&quot;,
      &quot;role&quot;: &quot;admin_rh&quot;,
      &quot;is_active&quot;: true
    }
  ]
}</code></pre>
---

### Get User Profile

**GET** `/api/v1/accounts/users/profile/`

Get current authenticated user's profile.

**Response (200 OK):**
<pre><code>{
  &quot;id&quot;: 1,
  &quot;email&quot;: &quot;user@example.com&quot;,
  &quot;first_name&quot;: &quot;John&quot;,
  &quot;last_name&quot;: &quot;Doe&quot;,
  &quot;role&quot;: &quot;funcionario&quot;,
  &quot;date_joined&quot;: &quot;2024-01-15T10:30:00Z&quot;
}</code></pre>
---

### Change Password

**POST** `/api/v1/accounts/users/change_password/`

**Request:**
<pre><code>{
  &quot;old_password&quot;: &quot;current_password&quot;,
  &quot;new_password&quot;: &quot;new_password&quot;
}</code></pre>
**Response (200 OK):**
<pre><code>{
  &quot;message&quot;: &quot;Senha alterada com sucesso.&quot;
}</code></pre>
---

### Get User Statistics

**GET** `/api/v1/accounts/users/stats/`

Get user statistics (Admin RH only).

**Response (200 OK):**
<pre><code>{
  &quot;total_users&quot;: 150,
  &quot;active_users&quot;: 142,
  &quot;admin_rh_count&quot;: 5,
  &quot;funcionario_count&quot;: 145
}</code></pre>
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
<pre><code>{
  &quot;count&quot;: 100,
  &quot;next&quot;: null,
  &quot;previous&quot;: null,
  &quot;results&quot;: [
    {
      &quot;id&quot;: 1,
      &quot;employee_id&quot;: &quot;EMP-0001&quot;,
      &quot;full_name&quot;: &quot;John Doe&quot;,
      &quot;email&quot;: &quot;john@company.com&quot;,
      &quot;department&quot;: &quot;Engineering&quot;,
      &quot;position&quot;: &quot;Developer&quot;,
      &quot;status&quot;: &quot;active&quot;,
      &quot;hire_date&quot;: &quot;2024-01-15&quot;
    }
  ]
}</code></pre>
---

### Get Employee Detail

**GET** `/api/v1/employees/employees/{id}/`

**Response (200 OK):**
<pre><code>{
  &quot;id&quot;: 1,
  &quot;employee_id&quot;: &quot;EMP-0001&quot;,
  &quot;user&quot;: 1,
  &quot;full_name&quot;: &quot;John Doe&quot;,
  &quot;cpf&quot;: &quot;123.456.789-00&quot;,
  &quot;rg&quot;: &quot;12.345.678-9&quot;,
  &quot;birth_date&quot;: &quot;1990-05-15&quot;,
  &quot;phone&quot;: &quot;(11) 99999-9999&quot;,
  &quot;email&quot;: &quot;john@company.com&quot;,
  &quot;street_address&quot;: &quot;Rua Principal&quot;,
  &quot;address_number&quot;: &quot;123&quot;,
  &quot;neighborhood&quot;: &quot;Centro&quot;,
  &quot;city&quot;: &quot;S&#227;o Paulo&quot;,
  &quot;state&quot;: &quot;SP&quot;,
  &quot;zip_code&quot;: &quot;01000-000&quot;,
  &quot;department&quot;: &quot;Engineering&quot;,
  &quot;position&quot;: &quot;Developer&quot;,
  &quot;hire_date&quot;: &quot;2024-01-15&quot;,
  &quot;salary&quot;: &quot;5000.00&quot;,
  &quot;status&quot;: &quot;active&quot;,
  &quot;admission_completed&quot;: true
}</code></pre>
---

### Create Employee

**POST** `/api/v1/employees/employees/`

**Request:**
<pre><code>{
  &quot;user&quot;: 1,
  &quot;full_name&quot;: &quot;Jane Doe&quot;,
  &quot;cpf&quot;: &quot;987.654.321-00&quot;,
  &quot;rg&quot;: &quot;98.765.432-1&quot;,
  &quot;birth_date&quot;: &quot;1992-08-20&quot;,
  &quot;phone&quot;: &quot;(11) 98888-8888&quot;,
  &quot;email&quot;: &quot;jane@company.com&quot;,
  &quot;street_address&quot;: &quot;Rua Secund&#225;ria&quot;,
  &quot;address_number&quot;: &quot;456&quot;,
  &quot;neighborhood&quot;: &quot;Jardins&quot;,
  &quot;city&quot;: &quot;S&#227;o Paulo&quot;,
  &quot;state&quot;: &quot;SP&quot;,
  &quot;zip_code&quot;: &quot;01001-000&quot;,
  &quot;department&quot;: &quot;Marketing&quot;,
  &quot;position&quot;: &quot;Designer&quot;,
  &quot;hire_date&quot;: &quot;2024-02-01&quot;,
  &quot;salary&quot;: &quot;4500.00&quot;
}</code></pre>
**Response (201 Created):**
<pre><code>{
  &quot;id&quot;: 2,
  &quot;employee_id&quot;: &quot;EMP-0002&quot;,
  &quot;full_name&quot;: &quot;Jane Doe&quot;,
  ...
}</code></pre>
---

### Get My Profile

**GET** `/api/v1/employees/employees/my_profile/`

Get current user's employee profile.

**Response (200 OK):**
<pre><code>{
  &quot;id&quot;: 1,
  &quot;employee_id&quot;: &quot;EMP-0001&quot;,
  &quot;full_name&quot;: &quot;John Doe&quot;,
  ...
}</code></pre>
---

### Update Personal Information

**PATCH** `/api/v1/employees/employees/{id}/update_personal_info/`

**Request:**
<pre><code>{
  &quot;phone&quot;: &quot;(11) 97777-7777&quot;,
  &quot;street_address&quot;: &quot;Nova Rua&quot;,
  &quot;address_number&quot;: &quot;789&quot;
}</code></pre>
**Response (200 OK):**
<pre><code>{
  &quot;message&quot;: &quot;Informa&#231;&#245;es atualizadas com sucesso.&quot;
}</code></pre>
---

### Get Admission Status

**GET** `/api/v1/employees/employees/{id}/admission_status/`

**Response (200 OK):**
<pre><code>{
  &quot;employee_id&quot;: &quot;EMP-0001&quot;,
  &quot;status&quot;: &quot;documents_uploaded&quot;,
  &quot;completion_percentage&quot;: 75,
  &quot;personal_info_completed&quot;: true,
  &quot;documents_uploaded&quot;: true,
  &quot;hr_review_completed&quot;: false
}</code></pre>
---

## 📄 Employee Document Endpoints

### List Documents

**GET** `/api/v1/employees/employees/{employee_pk}/documents/`

**Response (200 OK):**
<pre><code>{
  &quot;count&quot;: 5,
  &quot;results&quot;: [
    {
      &quot;id&quot;: 1,
      &quot;employee&quot;: 1,
      &quot;document_type&quot;: &quot;rg&quot;,
      &quot;document_name&quot;: &quot;RG Front&quot;,
      &quot;file&quot;: &quot;/media/employees/documents/rg_001.pdf&quot;,
      &quot;file_size&quot;: 102400,
      &quot;uploaded_at&quot;: &quot;2024-01-15T10:00:00Z&quot;,
      &quot;is_required&quot;: true,
      &quot;is_verified&quot;: false
    }
  ]
}</code></pre>
---

### Upload Document

**POST** `/api/v1/employees/employees/{employee_pk}/documents/`

**Content-Type:** `multipart/form-data`

**Request:**
<pre><code>document_type: rg
document_name: RG Front
file: &lt;file&gt;
is_required: true</code></pre>
**Response (201 Created):**
<pre><code>{
  &quot;id&quot;: 1,
  &quot;document_type&quot;: &quot;rg&quot;,
  &quot;file&quot;: &quot;/media/employees/documents/rg_001.pdf&quot;,
  ...
}</code></pre>
---

### Verify Document

**PATCH** `/api/v1/employees/employees/{employee_pk}/documents/{id}/verify/`

**Request:**
<pre><code>{
  &quot;is_verified&quot;: true
}</code></pre>
**Response (200 OK):**
<pre><code>{
  &quot;message&quot;: &quot;Documento verificado com sucesso.&quot;
}</code></pre>
---

### Get Required Documents

**GET** `/api/v1/employees/employees/{employee_pk}/documents/required_documents/`

**Response (200 OK):**
<pre><code>{
  &quot;required_documents&quot;: [
    {&quot;type&quot;: &quot;rg&quot;, &quot;name&quot;: &quot;RG&quot;, &quot;uploaded&quot;: true},
    {&quot;type&quot;: &quot;cpf&quot;, &quot;name&quot;: &quot;CPF&quot;, &quot;uploaded&quot;: true},
    {&quot;type&quot;: &quot;birth_certificate&quot;, &quot;name&quot;: &quot;Birth Certificate&quot;, &quot;uploaded&quot;: false},
    {&quot;type&quot;: &quot;residence_proof&quot;, &quot;name&quot;: &quot;Residence Proof&quot;, &quot;uploaded&quot;: false},
    {&quot;type&quot;: &quot;photo&quot;, &quot;name&quot;: &quot;Photo&quot;, &quot;uploaded&quot;: true}
  ]
}</code></pre>
---

## 📊 Evaluation Endpoints

### List Templates

**GET** `/api/v1/evaluations/templates/`

**Response (200 OK):**
<pre><code>{
  &quot;count&quot;: 3,
  &quot;results&quot;: [
    {
      &quot;id&quot;: 1,
      &quot;nome&quot;: &quot;Annual Performance Review&quot;,
      &quot;descricao&quot;: &quot;Annual evaluation template&quot;,
      &quot;ativo&quot;: true,
      &quot;created_at&quot;: &quot;2024-01-01T00:00:00Z&quot;
    }
  ]
}</code></pre>
---

### Create Evaluation

**POST** `/api/v1/evaluations/evaluations/`

**Request:**
<pre><code>{
  &quot;template&quot;: 1,
  &quot;avaliado&quot;: 5,
  &quot;avaliador&quot;: 1,
  &quot;tipo&quot;: &quot;avaliacao_superior&quot;,
  &quot;periodo_inicio&quot;: &quot;2024-01-01&quot;,
  &quot;periodo_fim&quot;: &quot;2024-12-31&quot;,
  &quot;status&quot;: &quot;pendente&quot;
}</code></pre>
**Response (201 Created):**
<pre><code>{
  &quot;id&quot;: 10,
  &quot;template&quot;: 1,
  &quot;avaliado&quot;: 5,
  &quot;avaliador&quot;: 1,
  &quot;tipo&quot;: &quot;avaliacao_superior&quot;,
  &quot;status&quot;: &quot;pendente&quot;,
  ...
}</code></pre>
---

### Submit Evaluation Score

**POST** `/api/v1/evaluations/scores/`

**Request:**
<pre><code>{
  &quot;avaliacao&quot;: 10,
  &quot;criterio&quot;: 1,
  &quot;nota&quot;: &quot;8.5&quot;,
  &quot;comentario&quot;: &quot;Great performance&quot;
}</code></pre>
**Response (201 Created):**
<pre><code>{
  &quot;id&quot;: 50,
  &quot;avaliacao&quot;: 10,
  &quot;criterio&quot;: 1,
  &quot;nota&quot;: &quot;8.50&quot;,
  &quot;comentario&quot;: &quot;Great performance&quot;
}</code></pre>
---

### Get My Evaluations

**GET** `/api/v1/evaluations/evaluations/my_evaluations/`

**Response (200 OK):**
<pre><code>{
  &quot;count&quot;: 5,
  &quot;results&quot;: [
    {
      &quot;id&quot;: 10,
      &quot;template_name&quot;: &quot;Annual Performance Review&quot;,
      &quot;tipo&quot;: &quot;avaliacao_superior&quot;,
      &quot;status&quot;: &quot;concluida&quot;,
      &quot;nota_final&quot;: &quot;8.75&quot;,
      &quot;data_conclusao&quot;: &quot;2024-12-15T10:00:00Z&quot;
    }
  ]
}</code></pre>
---

### Start Evaluation Cycle

**POST** `/api/v1/evaluations/cycles/{id}/start/`

**Response (200 OK):**
<pre><code>{
  &quot;message&quot;: &quot;Ciclo iniciado com sucesso.&quot;,
  &quot;status&quot;: &quot;ativo&quot;
}</code></pre>
---

## 🏖️ Leave Request Endpoints

### List Leave Types

**GET** `/api/v1/leave-requests/types/`

**Response (200 OK):**
<pre><code>{
  &quot;count&quot;: 4,
  &quot;results&quot;: [
    {
      &quot;id&quot;: 1,
      &quot;nome&quot;: &quot;Vacation&quot;,
      &quot;descricao&quot;: &quot;Annual vacation leave&quot;,
      &quot;max_dias_ano&quot;: 30,
      &quot;requer_aprovacao&quot;: true,
      &quot;ativo&quot;: true
    }
  ]
}</code></pre>
---

### Create Leave Request

**POST** `/api/v1/leave-requests/requests/`

**Request:**
<pre><code>{
  &quot;tipo&quot;: 1,
  &quot;data_inicio&quot;: &quot;2024-06-01&quot;,
  &quot;data_fim&quot;: &quot;2024-06-30&quot;,
  &quot;motivo&quot;: &quot;Annual vacation&quot;,
  &quot;observacoes&quot;: &quot;Will be traveling&quot;,
  &quot;dias_gozo&quot;: 30,
  &quot;tem_abono_pecuniario&quot;: true,
  &quot;dias_abono_pecuniario&quot;: 10
}</code></pre>
**Response (201 Created):**
<pre><code>{
  &quot;id&quot;: 15,
  &quot;solicitante&quot;: 1,
  &quot;tipo&quot;: 1,
  &quot;data_inicio&quot;: &quot;2024-06-01&quot;,
  &quot;data_fim&quot;: &quot;2024-06-30&quot;,
  &quot;status&quot;: &quot;pendente&quot;,
  &quot;dias_solicitados&quot;: 30
}</code></pre>
---

### Approve Leave Request

**POST** `/api/v1/leave-requests/requests/{id}/approve/`

**Request:**
<pre><code>{
  &quot;status&quot;: &quot;aprovada&quot;,
  &quot;comentario_aprovacao&quot;: &quot;Approved. Enjoy your vacation!&quot;
}</code></pre>
**Response (200 OK):**
<pre><code>{
  &quot;message&quot;: &quot;Solicita&#231;&#227;o aprovada com sucesso.&quot;,
  &quot;status&quot;: &quot;aprovada&quot;
}</code></pre>
---

### Get My Leave Balances

**GET** `/api/v1/leave-requests/balances/my_balances/`

**Response (200 OK):**
<pre><code>{
  &quot;count&quot;: 3,
  &quot;results&quot;: [
    {
      &quot;id&quot;: 1,
      &quot;tipo&quot;: &quot;Vacation&quot;,
      &quot;ano&quot;: 2024,
      &quot;dias_disponiveis&quot;: 30,
      &quot;dias_utilizados&quot;: 15,
      &quot;dias_restantes&quot;: 15
    }
  ]
}</code></pre>
---

### Get Leave Calendar

**GET** `/api/v1/leave-requests/requests/calendar/`

**Query Parameters:**
- `year` - Year to display
- `department` - Filter by department

**Response (200 OK):**
<pre><code>{
  &quot;events&quot;: [
    {
      &quot;employee_name&quot;: &quot;John Doe&quot;,
      &quot;start&quot;: &quot;2024-06-01&quot;,
      &quot;end&quot;: &quot;2024-06-30&quot;,
      &quot;type&quot;: &quot;Vacation&quot;
    }
  ]
}</code></pre>
---

## 📈 Report Endpoints

### List Report Templates

**GET** `/api/v1/reports/templates/`

**Query Parameters:**
- `category` - Filter by category
- `report_type` - Filter by type
- `is_public` - Filter by visibility

**Response (200 OK):**
<pre><code>{
  &quot;count&quot;: 10,
  &quot;results&quot;: [
    {
      &quot;id&quot;: &quot;550e8400-e29b-41d4-a716-446655440000&quot;,
      &quot;name&quot;: &quot;Employee Headcount Report&quot;,
      &quot;description&quot;: &quot;Current employee count by department&quot;,
      &quot;report_type&quot;: &quot;employees&quot;,
      &quot;category&quot;: 1,
      &quot;output_formats&quot;: [&quot;pdf&quot;, &quot;excel&quot;, &quot;csv&quot;],
      &quot;default_format&quot;: &quot;excel&quot;,
      &quot;is_public&quot;: true
    }
  ]
}</code></pre>
---

### Execute Report

**POST** `/api/v1/reports/templates/{id}/execute/`

**Request:**
<pre><code>{
  &quot;output_format&quot;: &quot;excel&quot;,
  &quot;parameters&quot;: {
    &quot;department&quot;: &quot;Engineering&quot;,
    &quot;start_date&quot;: &quot;2024-01-01&quot;,
    &quot;end_date&quot;: &quot;2024-12-31&quot;
  }
}</code></pre>
**Response (202 Accepted):**
<pre><code>{
  &quot;execution_id&quot;: &quot;550e8400-e29b-41d4-a716-446655440001&quot;,
  &quot;status&quot;: &quot;pending&quot;,
  &quot;message&quot;: &quot;Report execution started&quot;
}</code></pre>
---

### Download Report

**GET** `/api/v1/reports/executions/{id}/download/`

**Response:** File download (binary)

---

### Create Report Schedule

**POST** `/api/v1/reports/schedules/`

**Request:**
<pre><code>{
  &quot;name&quot;: &quot;Monthly Headcount Report&quot;,
  &quot;template&quot;: &quot;550e8400-e29b-41d4-a716-446655440000&quot;,
  &quot;frequency&quot;: &quot;monthly&quot;,
  &quot;cron_expression&quot;: &quot;0 9 1 * *&quot;,
  &quot;output_format&quot;: &quot;excel&quot;,
  &quot;email_recipients&quot;: [&quot;hr@company.com&quot;],
  &quot;send_email_on_success&quot;: true
}</code></pre>
**Response (201 Created):**
<pre><code>{
  &quot;id&quot;: &quot;550e8400-e29b-41d4-a716-446655440002&quot;,
  &quot;name&quot;: &quot;Monthly Headcount Report&quot;,
  &quot;status&quot;: &quot;active&quot;,
  &quot;next_execution&quot;: &quot;2024-05-01T09:00:00Z&quot;
}</code></pre>
---

### Get Dashboard Summary

**GET** `/api/v1/reports/dashboard/summary/`

**Response (200 OK):**
<pre><code>{
  &quot;total_employees&quot;: 150,
  &quot;active_leave_requests&quot;: 12,
  &quot;pending_evaluations&quot;: 25,
  &quot;pending_terminations&quot;: 3,
  &quot;recent_hires&quot;: 5,
  &quot;upcoming_birthdays&quot;: 8
}</code></pre>
---

## 🚪 Termination Endpoints

### List Termination Reasons

**GET** `/api/v1/termination/reasons/`

**Response (200 OK):**
<pre><code>{
  &quot;count&quot;: 5,
  &quot;results&quot;: [
    {
      &quot;id&quot;: 1,
      &quot;nome&quot;: &quot;Voluntary Resignation&quot;,
      &quot;codigo&quot;: &quot;VR&quot;,
      &quot;descricao&quot;: &quot;Employee voluntarily resigns&quot;,
      &quot;ativo&quot;: true
    }
  ]
}</code></pre>
---

### Create Termination Request

**POST** `/api/v1/termination/requests/`

**Request:**
<pre><code>{
  &quot;funcionario&quot;: 5,
  &quot;motivo&quot;: 1,
  &quot;data_ultimo_dia&quot;: &quot;2024-06-30&quot;,
  &quot;justificativa&quot;: &quot;Personal reasons&quot;
}</code></pre>
**Response (201 Created):**
<pre><code>{
  &quot;id&quot;: 10,
  &quot;funcionario&quot;: 5,
  &quot;motivo&quot;: 1,
  &quot;status&quot;: &quot;pendente_rh&quot;,
  &quot;data_ultimo_dia&quot;: &quot;2024-06-30&quot;
}</code></pre>
---

### Approve Termination

**POST** `/api/v1/termination/requests/{id}/approve/`

**Request:**
<pre><code>{
  &quot;comentario_aprovacao_rh&quot;: &quot;Approved. Exit interview scheduled.&quot;
}</code></pre>
**Response (200 OK):**
<pre><code>{
  &quot;message&quot;: &quot;Termina&#231;&#227;o aprovada com sucesso.&quot;,
  &quot;status&quot;: &quot;aprovada_rh&quot;
}</code></pre>
---

### Start Termination Processing

**POST** `/api/v1/termination/requests/{id}/start_processing/`

**Response (200 OK):**
<pre><code>{
  &quot;message&quot;: &quot;Processamento de desligamento iniciado.&quot;,
  &quot;status&quot;: &quot;processando&quot;
}</code></pre>
---

### Complete Termination

**POST** `/api/v1/termination/requests/{id}/complete/`

**Response (200 OK):**
<pre><code>{
  &quot;message&quot;: &quot;Desligamento conclu&#237;do com sucesso.&quot;,
  &quot;status&quot;: &quot;concluida&quot;
}</code></pre>
---

## 📊 Error Responses

### Standard Error Format

<pre><code>{
  &quot;error&quot;: {
    &quot;code&quot;: &quot;ERROR_CODE&quot;,
    &quot;message&quot;: &quot;Human-readable message&quot;,
    &quot;details&quot;: {
      &quot;field_name&quot;: [&quot;Error message for field&quot;]
    }
  }
}</code></pre>
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

<pre><code>{
  &quot;error&quot;: {
    &quot;code&quot;: &quot;VALIDATION_ERROR&quot;,
    &quot;message&quot;: &quot;Invalid input data&quot;,
    &quot;details&quot;: {
      &quot;email&quot;: [&quot;This field is required&quot;],
      &quot;cpf&quot;: [&quot;Invalid CPF format&quot;]
    }
  }
}</code></pre>
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

<pre><code>{
  &quot;count&quot;: 100,
  &quot;next&quot;: &quot;http://api/endpoint/?page=2&quot;,
  &quot;previous&quot;: null,
  &quot;results&quot;: [...]
}</code></pre>
---

**Next:** [System Modeling](system-modeling.md)
