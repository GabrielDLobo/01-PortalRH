# System Modeling

This document covers the data models, system architecture, and workflow diagrams for PortalRH.

---

## 📊 Data Models (ERD)

```mermaid
erDiagram
    %% Accounts Module
    USER {
        int id PK
        string email UK
        string role "admin_rh, funcionario"
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    %% Employees Module
    PRE_ADMISSION_RH {
        int id PK
        string personal_email UK
        string full_name
        string position
        string department
        text job_description
        string work_schedule
        string weekly_workload "20h, 30h, 40h, 44h"
        string contract_type "clt, temporary, internship, freelancer, pj"
        decimal salary
        text benefits
        date start_date
        text vacation_policy
        string direct_manager
        int created_by FK
        boolean employee_user_created
        string temporary_password
        boolean email_sent
        int employee_id FK
        datetime created_at
        datetime updated_at
    }

    EMPLOYEE {
        int id PK
        string employee_id UK "EMP-XXXX"
        int user_id FK
        string full_name
        string cpf UK
        string rg
        date birth_date
        string marital_status
        string phone
        string email
        string street_address
        string address_number
        string neighborhood
        string city
        string state
        string zip_code
        string pis_pasep
        string work_card_number
        string work_card_series
        string education_level
        string bank_name
        string agency_number
        string account_number
        string account_type
        string department
        string position
        date hire_date
        decimal salary
        string status "pending, under_review, approved, active, inactive"
        boolean admission_completed
        boolean requires_password_change
        datetime created_at
        datetime updated_at
    }

    EMPLOYEE_DOCUMENT {
        int id PK
        int employee_id FK
        string document_type "rg, birth_certificate, work_card, etc."
        string document_name
        string file
        int file_size
        datetime uploaded_at
        boolean is_required
        boolean is_verified
    }

    ADMISSION_PROCESS {
        int id PK
        int employee_id FK
        string status "started, documents_uploaded, under_review, approved, completed"
        datetime started_at
        datetime completed_at
        text notes
        boolean personal_info_completed
        boolean documents_uploaded
        boolean hr_review_completed
    }

    %% Evaluations Module
    EVALUATION_TEMPLATE {
        int id PK
        string nome UK
        text descricao
        boolean ativo
        datetime created_at
        datetime updated_at
    }

    EVALUATION_CRITERIA {
        int id PK
        int template_id FK
        string nome
        text descricao
        decimal peso
        int ordem
        datetime created_at
    }

    EVALUATION {
        int id PK
        int template_id FK
        int avaliado_id FK
        int avaliador_id FK
        string tipo
        date periodo_inicio
        date periodo_fim
        string status
        decimal nota_final
        text comentario_geral
        text pontos_fortes
        text pontos_melhoria
        text metas_objetivos
        datetime data_limite
        datetime data_conclusao
        datetime created_at
        datetime updated_at
    }

    EVALUATION_SCORE {
        int id PK
        int avaliacao_id FK
        int criterio_id FK
        decimal nota
        text comentario
        datetime created_at
        datetime updated_at
    }

    EVALUATION_CYCLE {
        int id PK
        string nome
        text descricao
        date data_inicio
        date data_fim
        int template_id FK
        string status
        int created_by FK
        datetime created_at
        datetime updated_at
    }

    EVALUATION_CYCLE_PARTICIPANT {
        int id PK
        int cycle_id FK
        int funcionario_id FK
        int avaliador_id FK
        datetime data_limite
        boolean concluido
        datetime created_at
    }

    %% Leave Requests Module
    LEAVE_TYPE {
        int id PK
        string nome UK
        text descricao
        int max_dias_ano
        boolean requer_aprovacao
        int antecedencia_minima
        boolean ativo
        datetime created_at
        datetime updated_at
    }

    LEAVE_REQUEST {
        int id PK
        int solicitante_id FK
        int tipo_id FK
        date data_inicio
        date data_fim
        text motivo
        text observacoes
        int dias_gozo
        boolean tem_abono_pecuniario
        int dias_abono_pecuniario
        string prioridade
        string status
        int aprovador_id FK
        datetime data_aprovacao
        text comentario_aprovacao
        string anexo
        datetime created_at
        datetime updated_at
    }

    LEAVE_BALANCE {
        int id PK
        int funcionario_id FK
        int tipo_id FK
        int ano
        int dias_disponiveis
        int dias_utilizados
        datetime created_at
        datetime updated_at
    }

    %% Reports Module
    REPORT_CATEGORY {
        int id PK
        string name UK
        text description
        string icon
        string color
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    REPORT_TEMPLATE {
        uuid id PK
        string name
        text description
        string report_type
        int category_id FK
        json query_config
        json output_formats
        string default_format
        json columns_config
        json chart_config
        boolean is_public
        json allowed_roles
        int cache_duration
        boolean enable_cache
        boolean is_active
        int version
        datetime created_at
        datetime updated_at
    }

    REPORT_EXECUTION {
        uuid id PK
        uuid template_id FK
        int executed_by FK
        json parameters
        string output_format
        string status
        json result_data
        string file_path
        float execution_time_seconds
        int rows_processed
        text error_message
        datetime started_at
        datetime completed_at
        datetime expires_at
        datetime created_at
        datetime updated_at
    }

    REPORT_SCHEDULE {
        uuid id PK
        string name
        uuid template_id FK
        string frequency
        string cron_expression
        string output_format
        json parameters
        json email_recipients
        boolean send_email_on_success
        boolean send_email_on_failure
        string status
        datetime last_execution
        datetime next_execution
        int execution_count
        int success_count
        int failure_count
        datetime created_at
        datetime updated_at
    }

    REPORT_BOOKMARK {
        int id PK
        int user_id FK
        uuid template_id FK
        string name
        json parameters
        datetime created_at
        datetime updated_at
    }

    %% Staff Module
    STAFF_EMPLOYEE {
        int id PK
        int user_id FK
        string nome
        string cargo
        string setor
        date data_admissao
        date data_demissao
        decimal salario
        string cpf UK
        string rg
        string telefone
        text endereco
        date data_nascimento
        string status
        text observacoes
        string foto
        datetime created_at
        datetime updated_at
    }

    DEPARTMENT {
        int id PK
        string nome UK
        text descricao
        datetime created_at
        datetime updated_at
    }

    STAFF_EMPLOYEE_DOCUMENT {
        int id PK
        int employee_id FK
        string tipo
        string nome
        string arquivo
        text descricao
        int uploaded_by FK
        datetime created_at
    }

    %% Termination Module
    TERMINATION_REASON {
        int id PK
        string nome UK
        string codigo UK
        text descricao
        boolean ativo
        datetime created_at
        datetime updated_at
    }

    TERMINATION_REQUEST {
        int id PK
        int funcionario_id FK
        int solicitante_id FK
        int motivo_id FK
        date data_ultimo_dia
        date data_desligamento
        text justificativa
        text observacoes_rh
        string status
        int aprovador_rh_id FK
        datetime data_aprovacao_rh
        text comentario_aprovacao_rh
        string anexo_documentos
        datetime created_at
        datetime updated_at
    }

    TERMINATION_DOCUMENT {
        int id PK
        int termination_request_id FK
        string tipo_documento
        string nome_arquivo
        string arquivo
        boolean gerado_automaticamente
        int gerado_por FK
        text observacoes
        datetime created_at
        datetime updated_at
    }

    %% Relationships
    USER ||--o| EMPLOYEE : "has profile (employee_profile)"
    USER ||--o{ EVALUATION : "evaluates/is evaluated"
    USER ||--o{ LEAVE_REQUEST : "requests/approves"
    USER ||--o{ REPORT_EXECUTION : "executes"
    USER ||--o| STAFF_EMPLOYEE : "staff profile"
    USER ||--o{ REPORT_BOOKMARK : "bookmarks"
    USER ||--o{ REPORT_TEMPLATE : "creates/allowed"
    USER ||--o{ REPORT_SCHEDULE : "creates"
    USER ||--o{ TERMINATION_REQUEST : "requests/approves"
    USER ||--o{ PRE_ADMISSION_RH : "creates"

    PRE_ADMISSION_RH }o--|| USER : "created by"
    PRE_ADMISSION_RH ||--o| EMPLOYEE : "creates (OneToOne)"
    
    EMPLOYEE ||--o{ EMPLOYEE_DOCUMENT : "has documents"
    EMPLOYEE ||--o| ADMISSION_PROCESS : "has process"
    
    EVALUATION_TEMPLATE ||--o{ EVALUATION_CRITERIA : "contains"
    EVALUATION_TEMPLATE ||--o{ EVALUATION : "used in"
    EVALUATION_TEMPLATE ||--o{ EVALUATION_CYCLE : "used in"
    
    EVALUATION ||--o{ EVALUATION_SCORE : "has scores"
    EVALUATION_CRITERIA ||--o{ EVALUATION_SCORE : "has scores"
    
    EVALUATION_CYCLE ||--o{ EVALUATION_CYCLE_PARTICIPANT : "has participants"
    USER ||--o{ EVALUATION_CYCLE_PARTICIPANT : "participates"
    
    LEAVE_TYPE ||--o{ LEAVE_REQUEST : "categorizes"
    LEAVE_TYPE ||--o{ LEAVE_BALANCE : "tracks balance"
    
    USER ||--o{ LEAVE_REQUEST : "requests"
    USER ||--o{ LEAVE_BALANCE : "has balance"
    
    REPORT_CATEGORY ||--o{ REPORT_TEMPLATE : "categorizes"
    REPORT_TEMPLATE ||--o{ REPORT_EXECUTION : "executed as"
    REPORT_TEMPLATE ||--o{ REPORT_SCHEDULE : "scheduled as"
    REPORT_TEMPLATE ||--o{ REPORT_BOOKMARK : "bookmarked as"
    
    DEPARTMENT ||--o{ STAFF_EMPLOYEE : "employs"
    STAFF_EMPLOYEE ||--o{ STAFF_EMPLOYEE_DOCUMENT : "has documents"
    
    TERMINATION_REASON ||--o{ TERMINATION_REQUEST : "categorizes"
    TERMINATION_REQUEST ||--o{ TERMINATION_DOCUMENT : "has documents"
    USER ||--o{ TERMINATION_REQUEST : "requests/approves"
<pre><code>
---

## &#127959;️ System Architecture

```mermaid
graph TB
    subgraph &quot;Client Layer&quot;
        WEB[Web Browser]
        MOBILE[Mobile Device]
    end

    subgraph &quot;Frontend&quot;
        REACT[React Application]
    end

    subgraph &quot;API Gateway&quot;
        NGINX[Nginx Reverse Proxy]
    end

    subgraph &quot;Application Layer&quot;
        DJANGO[Django Application]
        GUNICORN[Gunicorn WSGI Server]
        
        subgraph &quot;Django Apps&quot;
            ACCOUNTS[Accounts App]
            EMPLOYEES[Employees App]
            EVALUATIONS[Evaluations App]
            LEAVE[Leave Requests App]
            REPORTS[Reports App]
            STAFF[Staff App]
            TERMINATION[Termination App]
        end
    end

    subgraph &quot;Data Layer&quot;
        POSTGRES[(PostgreSQL Database)]
        CACHE[(Redis Cache)]
        MEDIA[Media Storage]
    end

    subgraph &quot;External Services&quot;
        EMAIL[Email Service]
        AUTH[Authentication Service]
    end

    WEB --&gt; NGINX
    MOBILE --&gt; NGINX
    NGINX --&gt; GUNICORN
    GUNICORN --&gt; DJANGO
    
    DJANGO --&gt; ACCOUNTS
    DJANGO --&gt; EMPLOYEES
    DJANGO --&gt; EVALUATIONS
    DJANGO --&gt; LEAVE
    DJANGO --&gt; REPORTS
    DJANGO --&gt; STAFF
    DJANGO --&gt; TERMINATION
    
    ACCOUNTS --&gt; POSTGRES
    EMPLOYEES --&gt; POSTGRES
    EVALUATIONS --&gt; POSTGRES
    LEAVE --&gt; POSTGRES
    REPORTS --&gt; POSTGRES
    STAFF --&gt; POSTGRES
    TERMINATION --&gt; POSTGRES
    
    REPORTS --&gt; CACHE
    DJANGO --&gt; MEDIA
    ACCOUNTS --&gt; EMAIL
    ACCOUNTS --&gt; AUTH</code></pre>
---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant DB
    participant JWT

    User->>Frontend: Enter credentials
    Frontend->>API: POST /auth/login/
    API->>DB: Validate credentials
    DB-->>API: User data
    API->>JWT: Generate tokens
    JWT-->>API: access + refresh tokens
    API-->>Frontend: Return tokens + user data
    Frontend->>Frontend: Store tokens
    
    Note over Frontend,JWT: Subsequent Requests
    
    Frontend->>Frontend: Add Authorization header
    Frontend->>API: Request with Bearer token
    API->>JWT: Validate access token
    JWT-->>API: Token valid/invalid
    
    alt Token Valid
        API->>DB: Query data
        DB-->>API: Return data
        API-->>Frontend: Return response
    else Token Expired
        Frontend->>API: POST /auth/refresh/
        API->>JWT: Validate refresh token
        JWT-->>API: Generate new access token
        API-->>Frontend: New access token
        Frontend->>Frontend: Update stored token
    end
    
    Note over User,DB: First Login Password Change
    
    alt Requires Password Change
        API-->>Frontend: requires_password_change: true
        Frontend->>User: Prompt password change
        User->>Frontend: Enter new password
        Frontend->>API: POST /first-login-password-change/
        API->>DB: Update password hash
        DB-->>API: Success
        API-->>Frontend: Password changed
    end
<pre><code>
---

## &#128221; CRUD Operations Flow

### Employee Management

```mermaid
flowchart TD
    A[Start] --&gt; B{User Role?}
    B --&gt;|Admin RH| C[Full Access]
    B --&gt;|Employee| D[Limited Access]
    
    C --&gt; E[Create Employee]
    E --&gt; F[Pre-Admission RH]
    F --&gt; G[Generate Temporary Password]
    G --&gt; H[Send Welcome Email]
    H --&gt; I[Employee Account Created]
    
    I --&gt; J[Employee Login]
    J --&gt; K{First Login?}
    K --&gt;|Yes| L[Change Password]
    K --&gt;|No| M[Dashboard]
    L --&gt; M
    
    M --&gt; N[Complete Personal Info]
    N --&gt; O[Upload Documents]
    O --&gt; P[HR Review]
    P --&gt; Q{Documents Approved?}
    Q --&gt;|Yes| R[Admission Complete]
    Q --&gt;|No| S[Request Corrections]
    S --&gt; N
    
    R --&gt; T[Employee Active]
    
    D --&gt; U[View Own Profile]
    U --&gt; V[Update Personal Info]
    V --&gt; W[View Documents]
    W --&gt; X[Upload Missing Documents]
    X --&gt; Y[View Admission Status]</code></pre>
### Leave Request Flow

```mermaid
flowchart TD
    A[Employee] --> B[Create Leave Request]
    B --> C{Validate Balance}
    C -->|Insufficient| D[Reject Automatically]
    C -->|Sufficient| E[Submit for Approval]
    
    E --> F[Manager Notification]
    F --> G{Manager Action}
    G -->|Approve| H[Update Balance]
    G -->|Reject| I[Notify Employee]
    G -->|Pending| J[Reminder After 48h]
    
    H --> K[Update Calendar]
    K --> L[Notify Employee]
    L --> M[Leave Approved]
    
    I --> N[Request Cancelled]
    
    M --> O[Take Leave]
    O --> P[Return to Work]
    P --> Q[Close Request]
<pre><code>
### Performance Evaluation Flow

```mermaid
flowchart TD
    A[HR Admin] --&gt; B[Create Evaluation Cycle]
    B --&gt; C[Define Template]
    C --&gt; D[Add Criteria]
    D --&gt; E[Assign Participants]
    
    E --&gt; F[Start Cycle]
    F --&gt; G[Notify Evaluators]
    
    G --&gt; H{Evaluator}
    H --&gt; I[Complete Evaluation]
    I --&gt; J[Submit Scores]
    J --&gt; K{All Criteria Done?}
    K --&gt;|No| I
    K --&gt;|Yes| L[Calculate Final Score]
    
    L --&gt; M{All Evaluations Done?}
    M --&gt;|No| H
    M --&gt;|Yes| N[Complete Cycle]
    
    N --&gt; O[Generate Reports]
    O --&gt; P[Notify HR]
    P --&gt; Q[Archive Results]</code></pre>
### Termination Flow

```mermaid
flowchart TD
    A[Manager] --> B[Create Termination Request]
    B --> C[Select Reason]
    C --> D[Set Last Day]
    D --> E[Submit to HR]
    
    E --> F[HR Review]
    F --> G{HR Decision}
    G -->|Approve| H[Start Processing]
    G -->|Reject| I[Return to Manager]
    G -->|Request Info| J[Ask for Details]
    
    H --> K[Generate Documents]
    K --> L[Exit Interview]
    L --> M[Collect Equipment]
    M --> N[Calculate Rescission]
    N --> O[Schedule Payment]
    O --> P[Complete Termination]
    
    P --> Q[Deactivate Access]
    Q --> R[Update Records]
    R --> S[Archive Process]
<pre><code>
---

## &#128274; Security Flow

```mermaid
flowchart TD
    A[Request Received] --&gt; B{HTTPS?}
    B --&gt;|No| C[Redirect to HTTPS]
    B --&gt;|Yes| D[Validate CORS Origin]
    
    D --&gt; E{Origin Allowed?}
    E --&gt;|No| F[403 Forbidden]
    E --&gt;|Yes| G[Validate JWT Token]
    
    G --&gt; H{Token Valid?}
    H --&gt;|No| I[401 Unauthorized]
    H --&gt;|Yes| J[Check Permissions]
    
    J --&gt; K{Has Permission?}
    K --&gt;|No| L[403 Forbidden]
    K --&gt;|Yes| M[Validate Input]
    
    M --&gt; N{Valid Input?}
    N --&gt;|No| O[400 Bad Request]
    N --&gt;|Yes| P[Execute Business Logic]
    
    P --&gt; Q{Operation Type?}
    Q --&gt;|Read| R[Return Data]
    Q --&gt;|Write| S[Validate CSRF]
    
    S --&gt; T{CSRF Valid?}
    T --&gt;|No| U[403 Forbidden]
    T --&gt;|Yes| V[Execute Write Operation]
    
    V --&gt; W[Log Operation]
    W --&gt; X[Return Response]
    
    R --&gt; Y[Sanitize Output]
    Y --&gt; X
    
    style F fill:#ff6b6b
    style I fill:#ff6b6b
    style L fill:#ff6b6b
    style O fill:#ff6b6b
    style U fill:#ff6b6b
    style X fill:#51cf66</code></pre>
---

## 📊 Module Interactions

```mermaid
graph LR
    subgraph "Core Modules"
        ACCOUNTS[Accounts]
        EMPLOYEES[Employees]
    end
    
    subgraph "HR Processes"
        ADMISSION[Admission]
        EVALUATIONS[Evaluations]
        LEAVE[Leave Requests]
        TERMINATION[Termination]
    end
    
    subgraph "Support Modules"
        REPORTS[Reports]
        STAFF[Staff]
    end
    
    ACCOUNTS --> EMPLOYEES
    EMPLOYEES --> ADMISSION
    EMPLOYEES --> EVALUATIONS
    EMPLOYEES --> LEAVE
    EMPLOYEES --> TERMINATION
    
    ADMISSION --> ACCOUNTS
    EVALUATIONS --> EMPLOYEES
    LEAVE --> EMPLOYEES
    TERMINATION --> EMPLOYEES
    TERMINATION --> ACCOUNTS
    
    REPORTS --> EMPLOYEES
    REPORTS --> EVALUATIONS
    REPORTS --> LEAVE
    REPORTS --> TERMINATION
    REPORTS --> ADMISSION
    
    STAFF --> EMPLOYEES
    STAFF --> ACCOUNTS
<pre><code>
---

## &#128200; Data Flow Diagram

```mermaid
flowchart LR
    subgraph &quot;Data Sources&quot;
        USER[User Input]
        FILE[File Upload]
        EXTERNAL[External APIs]
    end
    
    subgraph &quot;Processing&quot;
        VALIDATE[Validation]
        PROCESS[Business Logic]
        TRANSFORM[Data Transformation]
    end
    
    subgraph &quot;Storage&quot;
        DB[(PostgreSQL)]
        CACHE[(Redis)]
        MEDIA[File Storage]
    end
    
    subgraph &quot;Output&quot;
        API[API Response]
        REPORT[Generated Report]
        EMAIL[Email Notification]
    end
    
    USER --&gt; VALIDATE
    FILE --&gt; VALIDATE
    EXTERNAL --&gt; VALIDATE
    
    VALIDATE --&gt; PROCESS
    PROCESS --&gt; TRANSFORM
    
    TRANSFORM --&gt; DB
    TRANSFORM --&gt; CACHE
    TRANSFORM --&gt; MEDIA
    
    DB --&gt; API
    CACHE --&gt; API
    MEDIA --&gt; API
    
    DB --&gt; REPORT
    TRANSFORM --&gt; REPORT
    
    PROCESS --&gt; EMAIL</code></pre>
---

## 🔄 State Machines

### Employee Status

```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> UnderReview: Submit Documents
    UnderReview --> Approved: HR Approval
    UnderReview --> Pending: Request Corrections
    Approved --> Active: Start Date Reached
    Active --> Inactive: Termination
    Active --> OnLeave: Leave Approved
    OnLeave --> Active: Leave Ended
    Inactive --> [*]
<pre><code>
### Leave Request Status

```mermaid
stateDiagram-v2
    [*] --&gt; Draft
    Draft --&gt; Pending: Submit
    Pending --&gt; Approved: Manager Approval
    Pending --&gt; Rejected: Manager Rejection
    Approved --&gt; Cancelled: Employee Cancels
    Approved --&gt; OnLeave: Start Date
    OnLeave --&gt; Completed: End Date
    Rejected --&gt; [*]
    Cancelled --&gt; [*]
    Completed --&gt; [*]</code></pre>
### Evaluation Status

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Pending: Submit
    Pending --> InProgress: Start Evaluation
    InProgress --> Completed: Submit Scores
    Completed --> Approved: HR Approval
    Completed --> Rejected: HR Rejection
    Approved --> [*]
    Rejected --> InProgress: Request Changes
<pre><code>
### Termination Status

```mermaid
stateDiagram-v2
    [*] --&gt; Draft
    Draft --&gt; PendingHR: Submit
    PendingHR --&gt; ApprovedHR: HR Approval
    PendingHR --&gt; RejectedHR: HR Rejection
    ApprovedHR --&gt; Processing: Start Processing
    Processing --&gt; Completed: Complete All Steps
    Completed --&gt; [*]
    RejectedHR --&gt; [*]</code></pre>
---

**Next:** [Authentication & Security](authentication-security.md)
