# System Modeling

This document provides comprehensive system modeling including data models, architecture diagrams, and workflow visualizations.

---

## 📊 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    ACCOUNTS_USER ||--o| EMPLOYEES_EMPLOYEE : has_profile
    ACCOUNTS_USER ||--o| LEAVE_REQUESTS_LEAVE_REQUEST : submits
    ACCOUNTS_USER ||--o| EVALUATIONS_EVALUATION : evaluates
    ACCOUNTS_USER ||--o| TERMINATION_TERMINATION_REQUEST : requests
    ACCOUNTS_USER ||--o| REPORTS_REPORT_EXECUTION : executes
    
    EMPLOYEES_EMPLOYEE ||--o| EMPLOYEES_EMPLOYEE_DOCUMENT : has_documents
    EMPLOYEES_EMPLOYEE ||--o| EMPLOYEES_ADMISSION_PROCESS : has_process
    EMPLOYEES_EMPLOYEE ||--o| STAFF_EMPLOYEE : works_as
    
    LEAVE_REQUESTS_LEAVE_TYPE ||--o| LEAVE_REQUESTS_LEAVE_REQUEST : defines
    LEAVE_REQUESTS_LEAVE_REQUEST ||--o| LEAVE_REQUESTS_LEAVE_BALANCE : affects
    
    EVALUATIONS_EVALUATION_TEMPLATE ||--o| EVALUATIONS_EVALUATION_CRITERIA : contains
    EVALUATIONS_EVALUATION_TEMPLATE ||--o| EVALUATIONS_EVALUATION : used_in
    EVALUATIONS_EVALUATION ||--o| EVALUATIONS_EVALUATION_SCORE : contains
    EVALUATIONS_EVALUATION_CYCLE ||--o| EVALUATIONS_CYCLE_PARTICIPANT : includes
    
    TERMINATION_TERMINATION_REASON ||--o| TERMINATION_TERMINATION_REQUEST : defines
    TERMINATION_TERMINATION_REQUEST ||--o| TERMINATION_TERMINATION_DOCUMENT : generates
    
    REPORTS_REPORT_TEMPLATE ||--o| REPORTS_REPORT_EXECUTION : executed_as
    REPORTS_REPORT_TEMPLATE ||--o| REPORTS_REPORT_SCHEDULE : scheduled_as
    REPORTS_REPORT_CATEGORY ||--o| REPORTS_REPORT_TEMPLATE : categorizes
    
    STAFF_DEPARTMENT ||--o{ STAFF_EMPLOYEE : contains
```

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Client Layer
        Browser[Web Browser]
        Mobile[Mobile Device]
    end
    
    subgraph Frontend Layer
        React[React 19 + TypeScript]
        Tailwind[TailwindCSS]
        Router[React Router]
    end
    
    subgraph API Gateway
        Nginx[Nginx Reverse Proxy]
    end
    
    subgraph Backend Layer
        Django[Django 5.2]
        DRF[Django REST Framework]
        JWT[SimpleJWT Auth]
        Filters[Django Filters]
    end
    
    subgraph Data Layer
        PostgreSQL[(PostgreSQL Database)]
        SQLite[(SQLite Dev)]
        Media[File Storage]
    end
    
    Browser --> React
    Mobile --> React
    React --> Nginx
    Nginx --> Django
    Django --> DRF
    DRF --> JWT
    DRF --> Filters
    DRF --> PostgreSQL
    DRF --> SQLite
    DRF --> Media
```

---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /api/v1/accounts/login/
    Backend->>Database: Validate credentials
    Database-->>Backend: User data
    Backend->>Backend: Generate JWT tokens
    Backend-->>Frontend: Access + Refresh tokens
    Frontend->>Frontend: Store tokens
    Frontend-->>User: Redirect to dashboard
    
    User->>Frontend: Request protected resource
    Frontend->>Backend: GET /api/v1/employees/
    Backend->>Backend: Validate JWT token
    Backend->>Database: Query data
    Database-->>Backend: Results
    Backend-->>Frontend: Data response
    Frontend-->>User: Display data
    
    Note over Frontend,Backend: Token expires after 15 minutes
    Frontend->>Backend: POST /api/v1/accounts/token/refresh/
    Backend->>Backend: Validate refresh token
    Backend-->>Frontend: New access token
```

---

## 📝 CRUD Operations Flow

### Employee Management CRUD

```mermaid
graph LR
    subgraph Create
        A1[HR Admin] --> A2[Fill Employee Form]
        A2 --> A3[POST /api/v1/employees/]
        A3 --> A4[Validate Data]
        A4 --> A5[Save to Database]
        A5 --> A6[Return Employee]
    end
    
    subgraph Read
        B1[User] --> B2[GET /api/v1/employees/]
        B2 --> B3[Apply Filters]
        B3 --> B4[Query Database]
        B4 --> B5[Serialize Data]
        B5 --> B6[Return List]
    end
    
    subgraph Update
        C1[HR Admin] --> C2[Edit Employee Data]
        C2 --> C3[PUT /api/v1/employees/{id}/]
        C3 --> C4[Validate Changes]
        C4 --> C5[Update Database]
        C5 --> C6[Return Updated]
    end
    
    subgraph Delete
        D1[HR Admin] --> D2[Confirm Delete]
        D2 --> D3[DELETE /api/v1/employees/{id}/]
        D3 --> D4[Soft Delete]
        D4 --> D5[Return 204]
    end
```

### Leave Request Workflow

```mermaid
stateDiagram-v2
    [*] --> Draft: Employee creates
    Draft --> Pending: Submit request
    Pending --> Approved: Manager approves
    Pending --> Rejected: Manager rejects
    Approved --> Cancelled: Employee cancels
    Rejected --> Draft: Employee edits
    Approved --> Taken: Leave period starts
    Taken --> Completed: Leave ends
    Completed --> [*]
    Cancelled --> [*]
    Rejected --> [*]
    
    note right of Pending
        Requires approval
        if days > limit
    end note
    
    note right of Approved
        Balance deducted
        Email notification
    end note
```

### Evaluation Process Flow

```mermaid
flowchart TD
    A[Create Evaluation Cycle] --> B[Assign Participants]
    B --> C[Send Notifications]
    C --> D[Self-Evaluation]
    D --> E[Manager Evaluation]
    E --> F[360° Feedback]
    F --> G[Calculate Scores]
    G --> H[Generate Report]
    H --> I[Review Meeting]
    I --> J[Set Goals]
    J --> K[Complete Cycle]
    
    style A fill:#e1f5fe
    style K fill:#c8e6c9
```

### Termination Process Flow

```mermaid
flowchart LR
    A[Manager Request] --> B[HR Review]
    B --> C{Decision}
    C -->|Approve| D[Process Documentation]
    C -->|Reject| E[Return to Manager]
    D --> F[Generate Documents]
    F --> G[Final Calculations]
    G --> H[Exit Interview]
    H --> I[Complete Termination]
    I --> J[Update Records]
    
    style C fill:#fff3e0
    style I fill:#ffcdd2
```

---

## 🔒 Security Architecture

```mermaid
flowchart TB
    subgraph Security Layers
        A[Request] --> B[CORS Check]
        B --> C[CSRF Protection]
        C --> D[JWT Validation]
        D --> E[Permission Check]
        E --> F[Data Validation]
        F --> G[Execute Action]
    end
    
    subgraph Data Protection
        H[Sensitive Data] --> I[Encryption at Rest]
        J[Data in Transit] --> K[HTTPS/TLS]
        L[Passwords] --> M[PBKDF2 Hashing]
    end
    
    subgraph Audit
        N[All Actions] --> O[Activity Logs]
        O --> P[Security Events]
        P --> Q[Alert System]
    end
    
    G --> H
    G --> J
    G --> L
    G --> N
```

---

## 📦 Component Architecture

### Backend Component Diagram

```mermaid
graph TB
    subgraph Core
        Settings[Django Settings]
        URLs[URL Routing]
        Middleware[Middleware Layer]
    end
    
    subgraph Apps
        Accounts[Accounts App]
        Employees[Employees App]
        Leave[Leave Requests App]
        Evaluations[Evaluations App]
        Termination[Termination App]
        Staff[Staff App]
        Reports[Reports App]
    end
    
    subgraph Shared
        Models[Shared Models]
        Serializers[API Serializers]
        Permissions[Permission Classes]
        Utils[Utilities]
    end
    
    Settings --> URLs
    URLs --> Middleware
    Middleware --> Accounts
    Middleware --> Employees
    Middleware --> Leave
    Middleware --> Evaluations
    Middleware --> Termination
    Middleware --> Staff
    Middleware --> Reports
    
    Accounts --> Shared
    Employees --> Shared
    Leave --> Shared
    Evaluations --> Shared
    Termination --> Shared
    Staff --> Shared
    Reports --> Shared
```

### Frontend Component Hierarchy

```mermaid
graph TD
    A[App] --> B[AuthProvider]
    A --> C[Layout]
    
    B --> D[Login Page]
    B --> E[Dashboard Page]
    
    C --> F[Header]
    C --> G[Sidebar]
    C --> H[Main Content]
    
    H --> I[Employee List]
    H --> J[Leave Request Form]
    H --> K[Evaluation Cards]
    H --> L[Reports Dashboard]
    
    I --> M[Employee Card]
    I --> N[Pagination]
    I --> O[Search Filter]
    
    J --> P[Date Picker]
    J --> Q[Leave Type Select]
    J --> R[Submit Button]
    
    style A fill:#e3f2fd
    style C fill:#f3e5f5
```

---

## 🔄 State Management

### Frontend State Flow

```mermaid
stateDiagram-v2
    [*] --> Loading: App starts
    Loading --> Unauthenticated: No token
    Loading --> Authenticated: Valid token
    Unauthenticated --> Authenticated: Login success
    Authenticated --> Unauthenticated: Logout
    Authenticated --> TokenExpired: Token expires
    TokenExpired --> Authenticated: Refresh success
    TokenExpired --> Unauthenticated: Refresh failed
    
    state Authenticated {
        [*] --> Idle
        Idle --> Fetching: API call
        Fetching --> Idle: Response received
        Idle --> Error: API error
        Error --> Idle: Retry
    }
```

---

## 📊 Database Schema Details

### User & Authentication

```mermaid
classDiagram
    class User {
        +int id
        +string email
        +string username
        +string role
        +boolean is_active
        +datetime created_at
        +datetime updated_at
        +has_perm_for_employee()
        +is_admin_rh
        +is_funcionario
    }
    
    class Employee {
        +int id
        +string employee_id
        +User user
        +string full_name
        +string cpf
        +string position
        +string department
        +date hire_date
        +decimal salary
        +string status
        +get_employee_id()
        +get_full_name()
    }
    
    User "1" -- "1" Employee : has_profile
```

### Leave Management

```mermaid
classDiagram
    class LeaveType {
        +int id
        +string nome
        +string descricao
        +int max_dias_ano
        +boolean requer_aprovacao
        +int antecedencia_minima
    }
    
    class LeaveRequest {
        +int id
        +User solicitante
        +LeaveType tipo
        +date data_inicio
        +date data_fim
        +string motivo
        +string status
        +int dias_gozo
        +boolean tem_abono_pecuniario
        +approve()
        +reject()
        +cancel()
        +dias_solicitados
    }
    
    class LeaveBalance {
        +int id
        +User funcionario
        +LeaveType tipo
        +int ano
        +int dias_disponiveis
        +int dias_utilizados
        +dias_restantes
        +can_request_days()
        +use_days()
    }
    
    LeaveType "1" -- "*" LeaveRequest : defines
    LeaveType "1" -- "*" LeaveBalance : tracks
    LeaveRequest "*" -- "1" LeaveBalance : affects
```

### Evaluations

```mermaid
classDiagram
    class EvaluationTemplate {
        +int id
        +string nome
        +string descricao
        +boolean ativo
    }
    
    class EvaluationCriteria {
        +int id
        +EvaluationTemplate template
        +string nome
        +string descricao
        +decimal peso
        +int ordem
    }
    
    class Evaluation {
        +int id
        +EvaluationTemplate template
        +User avaliado
        +User avaliador
        +string tipo
        +date periodo_inicio
        +date periodo_fim
        +string status
        +decimal nota_final
        +calculate_final_score()
        +finalize_evaluation()
    }
    
    class EvaluationScore {
        +int id
        +Evaluation avaliacao
        +EvaluationCriteria criterio
        +decimal nota
        +string comentario
        +weighted_score
    }
    
    EvaluationTemplate "1" -- "*" EvaluationCriteria : contains
    EvaluationTemplate "1" -- "*" Evaluation : used_in
    Evaluation "1" -- "*" EvaluationScore : contains
    EvaluationCriteria "1" -- "*" EvaluationScore : scored_in
```

---

## 🌐 Deployment Architecture

```mermaid
graph TB
    subgraph Production
        LB[Load Balancer]
        
        subgraph App Servers
            App1[Django + Gunicorn]
            App2[Django + Gunicorn]
        end
        
        subgraph Frontend Servers
            FE1[Nginx + React]
            FE2[Nginx + React]
        end
        
        subgraph Database
            Primary[(PostgreSQL Primary)]
            Replica[(PostgreSQL Replica)]
        end
        
        subgraph Storage
            S3[Object Storage]
            CDN[CDN]
        end
    end
    
    Users[Users] --> LB
    LB --> App1
    LB --> App2
    LB --> FE1
    LB --> FE2
    
    App1 --> Primary
    App2 --> Primary
    Primary --> Replica
    
    App1 --> S3
    App2 --> S3
    S3 --> CDN
    CDN --> FE1
    CDN --> FE2
```

---

## 📈 Performance Architecture

```mermaid
flowchart LR
    subgraph Caching Layer
        A[Redis Cache]
    end
    
    subgraph Query Optimization
        B[select_related]
        C[prefetch_related]
        D[only/defer]
    end
    
    subgraph Database
        E[(PostgreSQL)]
        F[Indexing]
        G[Query Cache]
    end
    
    subgraph Frontend
        H[Lazy Loading]
        I[Code Splitting]
        J[Virtual Scrolling]
    end
    
    Request --> A
    A --> B
    A --> C
    A --> D
    B --> E
    C --> E
    D --> E
    E --> F
    E --> G
    Response --> H
    Response --> I
    Response --> J
```

---

## 🔄 Integration Points

```mermaid
flowchart TB
    subgraph PortalRH
        Core[Core System]
    end
    
    subgraph External Services
        Email[Email Service]
        Storage[File Storage]
        Auth[Authentication]
    end
    
    subgraph Future Integrations
        Payroll[Payroll System]
        ATS[ATS System]
        SSO[SSO Provider]
    end
    
    Core --> Email
    Core --> Storage
    Core --> Auth
    
    Core -.-> Payroll
    Core -.-> ATS
    Core -.-> SSO
```

---

## 📱 User Interface Flow

```mermaid
flowchart LR
    A[Login] --> B[Dashboard]
    B --> C[Employees]
    B --> D[Leave Requests]
    B --> E[Evaluations]
    B --> F[Reports]
    B --> G[Settings]
    
    C --> C1[List]
    C --> C2[Detail]
    C --> C3[Create/Edit]
    
    D --> D1[My Requests]
    D --> D2[Pending Approval]
    D --> D3[History]
    
    E --> E1[My Evaluations]
    E --> E2[Given Evaluations]
    E --> E3[Cycles]
    
    F --> F1[Generate]
    F --> F2[Templates]
    F --> F3[Scheduled]
```

---

## 📚 Related Documentation

- [API Endpoints](api-endpoints.md) - API reference
- [Authentication](authentication.md) - Security details
- [Development Guide](development.md) - Implementation guide

---

## 🎯 Key Design Decisions

### Database Design

- **Custom User Model:** Extended AbstractUser for role-based access
- **One-to-One Relationships:** Employee profiles linked to users
- **Soft Deletes:** Preserve historical data
- **Audit Fields:** created_at, updated_at on all models

### API Design

- **RESTful:** Resource-based endpoints
- **Versioning:** URL-based versioning (/api/v1/)
- **Pagination:** Standard pagination for lists
- **Filtering:** Django Filters for complex queries

### Security Design

- **JWT Authentication:** Stateless token-based auth
- **Role-Based Access:** Two-tier role system
- **Input Validation:** Serializer validation
- **CORS:** Strict origin policy

---

## 🆘 Diagram Legend

| Symbol | Meaning |
|--------|---------|
| `||--o{` | One-to-many relationship |
| `||--||` | One-to-one relationship |
| `o{--o{` | Many-to-many relationship |
| `-->` | Data flow direction |
| `-.->` | Optional/future integration |
| `[]` | Component/Service |
| `[()]` | Database |
