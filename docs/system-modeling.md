# System Modeling

This document provides comprehensive system modeling diagrams including ERD, architecture, and flow diagrams.

## Table of Contents

- [System Modeling](#system-modeling)
  - [Table of Contents](#table-of-contents)
  - [Entity Relationship Diagram (ERD)](#entity-relationship-diagram-erd)
    - [Relationship Details](#relationship-details)
    - [Constraints](#constraints)
  - [System Architecture](#system-architecture)
    - [Architecture Layers](#architecture-layers)
  - [Authentication Flow](#authentication-flow)
    - [Authentication Components](#authentication-components)
  - [CRUD Operations Flow](#crud-operations-flow)
    - [CRUD Permissions Matrix](#crud-permissions-matrix)
  - [Security Flow](#security-flow)
    - [Security Layers](#security-layers)
  - [Stock Movement Flow](#stock-movement-flow)
    - [Stock Movement Rules](#stock-movement-rules)
  - [Data Flow Diagram](#data-flow-diagram)
  - [Sequence Diagram: Complete Order Flow](#sequence-diagram-complete-order-flow)

---

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    BRAND ||--o{ PRODUCT : "has"
    CATEGORY ||--o{ PRODUCT : "categorizes"
    SUPPLIER ||--o{ INFLOW : "supplies"
    PRODUCT ||--o{ INFLOW : "receives"
    PRODUCT ||--o{ OUTFLOW : "ships"
    
    BRAND {
        int id PK
        string name
        text description
        datetime created_at
        datetime updated_at
    }
    
    CATEGORY {
        int id PK
        string name
        text description
        datetime created_at
        datetime updated_at
    }
    
    SUPPLIER {
        int id PK
        string name
        text description
        datetime created_at
        datetime updated_at
    }
    
    PRODUCT {
        int id PK
        string title
        int category_id FK
        int brand_id FK
        text description
        decimal cost_price
        decimal selling_price
        int quantity
        string serie_number
        datetime created_at
        datetime updated_at
    }
    
    INFLOW {
        int id PK
        int supplier_id FK
        int product_id FK
        int quantity
        text description
        datetime created_at
        datetime updated_at
    }
    
    OUTFLOW {
        int id PK
        int product_id FK
        int quantity
        text description
        datetime created_at
        datetime updated_at
    }
    
    AIRESULT {
        int id PK
        text result
        datetime created_at
    }
```

### Relationship Details

| Relationship | Type | Description |
|--------------|------|-------------|
| Brand → Product | 1:N | One brand can have many products |
| Category → Product | 1:N | One category can have many products |
| Supplier → Inflow | 1:N | One supplier can have many inflows |
| Product → Inflow | 1:N | One product can have many inflows |
| Product → Outflow | 1:N | One product can have many outflows |

### Constraints

- **PROTECT** on all foreign keys: Prevents deletion of referenced records
- **NOT NULL** on required fields: title, name, quantity, prices
- **UNIQUE** on serie_number (when provided)

---

## System Architecture

```mermaid
graph TB
    subgraph Client Layer
        Browser[Web Browser]
        Mobile[Mobile App]
        ThirdParty[Third-Party Systems]
    end
    
    subgraph Presentation Layer
        DjangoTemplates[Django Templates<br/>HTML/CSS/JS]
        Dashboard[Dashboard UI]
        Admin[Django Admin]
    end
    
    subgraph API Layer
        APIGateway[API Gateway<br/>/api/v1/]
        Auth[Authentication<br/>JWT]
        BrandsAPI[Brands API]
        CategoriesAPI[Categories API]
        SuppliersAPI[Suppliers API]
        ProductsAPI[Products API]
        InflowsAPI[Inflows API]
        OutflowsAPI[Outflows API]
    end
    
    subgraph Application Layer
        BusinessLogic[Business Logic Layer]
        Signals[Django Signals]
        Validators[Data Validators]
        Permissions[Permission System]
    end
    
    subgraph Integration Layer
        OpenAI[OpenAI Service<br/>GPT-3.5-turbo]
        Webhooks[Webhook Service<br/>External APIs]
    end
    
    subgraph Data Layer
        PostgreSQL[(PostgreSQL<br/>Database)]
        Sessions[Session Store]
        Cache[Cache Layer]
    end
    
    Browser --> DjangoTemplates
    Mobile --> APIGateway
    ThirdParty --> APIGateway
    
    DjangoTemplates --> Dashboard
    DjangoTemplates --> Admin
    
    APIGateway --> Auth
    APIGateway --> BrandsAPI
    APIGateway --> CategoriesAPI
    APIGateway --> SuppliersAPI
    APIGateway --> ProductsAPI
    APIGateway --> InflowsAPI
    APIGateway --> OutflowsAPI
    
    BrandsAPI --> BusinessLogic
    CategoriesAPI --> BusinessLogic
    SuppliersAPI --> BusinessLogic
    ProductsAPI --> BusinessLogic
    InflowsAPI --> BusinessLogic
    OutflowsAPI --> BusinessLogic
    
    BusinessLogic --> Signals
    BusinessLogic --> Validators
    BusinessLogic --> Permissions
    
    BusinessLogic --> OpenAI
    BusinessLogic --> Webhooks
    
    BusinessLogic --> PostgreSQL
    BusinessLogic --> Sessions
    BusinessLogic --> Cache
    
    style PostgreSQL fill:#336791,color:#fff
    style OpenAI fill:#10a37f,color:#fff
    style APIGateway fill:#0073b1,color:#fff
```

### Architecture Layers

| Layer | Components | Responsibility |
|-------|------------|----------------|
| **Client** | Browser, Mobile, Third-party | User interaction |
| **Presentation** | Templates, Dashboard, Admin | UI rendering |
| **API** | REST endpoints, JWT auth | External access |
| **Application** | Business logic, Signals | Core functionality |
| **Integration** | OpenAI, Webhooks | External services |
| **Data** | PostgreSQL, Cache | Data persistence |

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant JWT
    participant Database
    
    Note over User,Database: Login Flow
    
    User->>Frontend: Enter credentials
    Frontend->>API: POST /login/ (username, password)
    API->>Database: Validate credentials
    Database-->>API: User data
    API->>JWT: Generate tokens
    JWT-->>API: access_token, refresh_token
    API-->>Frontend: Return tokens + user data
    Frontend-->>User: Redirect to dashboard
    
    Note over User,Database: API Request Flow
    
    User->>Frontend: Navigate to products
    Frontend->>API: GET /api/v1/products/
    Note right of Frontend: Authorization: Bearer {token}
    API->>JWT: Verify token
    JWT-->>API: Token valid
    API->>Database: Query products
    Database-->>API: Products data
    API-->>Frontend: Return products
    Frontend-->>User: Display products
    
    Note over User,Database: Token Refresh Flow
    
    User->>Frontend: Continue using app
    Frontend->>API: Request with expired token
    API->>JWT: Verify token
    JWT-->>API: Token expired
    API-->>Frontend: 401 Unauthorized
    Frontend->>API: POST /token/refresh/
    Note right of Frontend: refresh_token
    API->>JWT: Validate refresh token
    JWT-->>API: Generate new access token
    API-->>Frontend: New access_token
    Frontend->>API: Retry request
    API-->>Frontend: Return data
    Frontend-->>User: Display content
    
    Note over User,Database: Logout Flow
    
    User->>Frontend: Click logout
    Frontend->>API: POST /logout/
    API->>JWT: Blacklist token (optional)
    API-->>Frontend: Logout successful
    Frontend-->>User: Redirect to login
```

### Authentication Components

| Component | Purpose |
|-----------|---------|
| **JWT Access Token** | Short-lived token (1 day) for API access |
| **JWT Refresh Token** | Long-lived token (7 days) for renewal |
| **Session Auth** | Django session for web interface |
| **Permission System** | Model-level permissions |

---

## CRUD Operations Flow

```mermaid
graph TD
    subgraph Create Operations
        StartCreate[Start Create] --> ValidateCreate[Validate Data]
        ValidateCreate --> CheckPermissions[Check Create Permission]
        CheckPermissions --> SaveData[Save to Database]
        SaveData --> TriggerSignals[Trigger Signals]
        TriggerSignals --> ReturnCreate[Return Created Object]
    end
    
    subgraph Read Operations
        StartRead[Start Read] --> CheckReadPerms[Check View Permission]
        CheckReadPerms --> QueryData[Query Database]
        QueryData --> ApplyFilters[Apply Filters/Sorting]
        ApplyFilters --> Paginate[Paginate Results]
        Paginate --> ReturnRead[Return Data]
    end
    
    subgraph Update Operations
        StartUpdate[Start Update] --> ValidateUpdate[Validate Data]
        ValidateUpdate --> CheckUpdatePerms[Check Change Permission]
        CheckUpdatePerms --> GetObject[Get Object]
        GetObject --> UpdateFields[Update Fields]
        UpdateFields --> SaveUpdate[Save Changes]
        SaveUpdate --> ReturnUpdate[Return Updated Object]
    end
    
    subgraph Delete Operations
        StartDelete[Start Delete] --> CheckDeletePerms[Check Delete Permission]
        CheckDeletePerms --> CheckRelations[Check Related Objects]
        CheckRelations -->|Has Relations| BlockDelete[Block - PROTECT]
        CheckRelations -->|No Relations| DeleteObject[Delete Object]
        DeleteObject --> ReturnDelete[Return 204 No Content]
    end
    
    style StartCreate fill:#4CAF50,color:#fff
    style StartRead fill:#2196F3,color:#fff
    style StartUpdate fill:#FF9800,color:#fff
    style StartDelete fill:#f44336,color:#fff
    style BlockDelete fill:#f44336,color:#fff
```

### CRUD Permissions Matrix

| Operation | Permission Required | View |
|-----------|---------------------|------|
| **Create** | `add_<model>` | Admin, Managers |
| **Read** | `view_<model>` | All authenticated users |
| **Update** | `change_<model>` | Admin, Managers |
| **Delete** | `delete_<model>` | Admin only |

---

## Security Flow

```mermaid
sequenceDiagram
    participant User
    participant Middleware
    participant Auth
    participant Permissions
    participant View
    participant Database
    
    Note over User,Database: Request Security Flow
    
    User->>Middleware: HTTP Request
    Middleware->>Middleware: CSRF Check
    Middleware-->>User: 403 if CSRF fails
    
    Middleware->>Auth: Check Authentication
    Auth->>Auth: Validate JWT/Session
    Auth-->>User: 401 if not authenticated
    
    Auth->>Permissions: Check Permissions
    Permissions->>Database: Get user permissions
    Database-->>Permissions: User groups & permissions
    Permissions-->>User: 403 if not authorized
    
    Permissions->>View: Process Request
    View->>View: Input Validation
    View-->>User: 400 if validation fails
    
    View->>Database: Execute Query
    Database-->>View: Return Data
    
    View->>View: Sanitize Output
    View-->>Middleware: Response
    Middleware-->>User: Secure Response
    
    Note over User,Database: Security Layers
    
    Note right of Middleware: 1. CSRF Protection
    Note right of Auth: 2. Authentication
    Note right of Permissions: 3. Authorization
    Note right of View: 4. Input Validation
    Note right of Database: 5. SQL Injection Prevention
```

### Security Layers

| Layer | Protection | Implementation |
|-------|------------|----------------|
| **CSRF** | Cross-site request forgery | Django CSRF middleware |
| **Authentication** | Unauthorized access | JWT + Session auth |
| **Authorization** | Permission-based access | Django permissions |
| **Input Validation** | Malicious input | Forms + Serializers |
| **SQL Injection** | Database attacks | Django ORM |
| **XSS** | Script injection | Template auto-escaping |

---

## Stock Movement Flow

```mermaid
stateDiagram-v2
    [*] --> ProductCreated: Create Product
    ProductCreated --> LowStock: quantity < threshold
    ProductCreated --> NormalStock: quantity >= threshold
    
    state Inflow Process {
        [*] --> CreateInflow: User creates inflow
        CreateInflow --> ValidateInflow: Validate data
        ValidateInflow --> SaveInflow: Save to database
        SaveInflow --> UpdateQuantity: Signal triggers
        UpdateQuantity --> [*]: Product.quantity += inflow.quantity
    }
    
    state Outflow Process {
        [*] --> CreateOutflow: User creates outflow
        CreateOutflow --> ValidateOutflow: Validate data
        ValidateOutflow --> CheckStock: Check available quantity
        CheckStock --> InsufficientStock: quantity < required
        CheckStock --> SufficientStock: quantity >= required
        
        InsufficientStock --> ErrorReturn: Return error
        SufficientStock --> SaveOutflow: Save to database
        SaveOutflow --> DecreaseQuantity: Signal triggers
        DecreaseQuantity --> TriggerWebhook: Send webhook
        TriggerWebhook --> CheckLowStock: Check if low stock
        CheckLowStock --> LowStockAlert: Send alert if low
        CheckLowStock --> [*]: Normal
        LowStockAlert --> [*]
    }
    
    ProductCreated --> Inflow Process
    ProductCreated --> Outflow Process
    
    LowStock --> CreateInflow: Auto-suggest restock
    NormalStock --> Outflow Process
    
    style Inflow Process fill:#4CAF50,color:#fff
    style Outflow Process fill:#FF9800,color:#fff
    style InsufficientStock fill:#f44336,color:#fff
    style LowStock fill:#ffeb3b,color:#000
```

### Stock Movement Rules

| Movement | Effect | Trigger |
|----------|--------|---------|
| **Inflow Create** | quantity += inflow.quantity | post_save signal |
| **Outflow Create** | quantity -= outflow.quantity | post_save signal |
| **Outflow Check** | Validate quantity >= 0 | pre_save validation |
| **Low Stock Alert** | Notify if quantity < threshold | post_save signal |

---

## Data Flow Diagram

```mermaid
graph LR
    subgraph External Entities
        Supplier[Supplier]
        Customer[Customer]
        Admin[Administrator]
        AI[OpenAI API]
    end
    
    subgraph Input Processes
        P1[Register Products]
        P2[Record Inflows]
        P3[Record Outflows]
        P4[Generate Reports]
    end
    
    subgraph Data Stores
        D1[(Products DB)]
        D2[(Inflows DB)]
        D3[(Outflows DB)]
        D4[(Analytics DB)]
    end
    
    subgraph Output Processes
        O1[Dashboard]
        O2[Reports]
        O3[Alerts]
        O4[Webhooks]
    end
    
    Supplier --> P2
    Admin --> P1
    Admin --> P2
    Admin --> P3
    Customer --> P3
    
    P1 --> D1
    P2 --> D1
    P2 --> D2
    P3 --> D1
    P3 --> D3
    
    D1 --> P4
    D2 --> P4
    D3 --> P4
    
    P4 --> D4
    D4 --> O1
    D4 --> O2
    
    D1 --> O3
    D3 --> O4
    P4 --> AI
    AI --> O1
    
    style D1 fill:#336791,color:#fff
    style D2 fill:#336791,color:#fff
    style D3 fill:#336791,color:#fff
    style D4 fill:#336791,color:#fff
```

---

## Sequence Diagram: Complete Order Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant S as System
    participant P as Product
    participant I as Inflow
    participant O as Outflow
    participant W as Webhook
    participant AI as AI Service
    
    Note over A,AI: Product Lifecycle
    
    A->>S: Create Brand/Category/Supplier
    S-->>A: Confirm creation
    
    A->>S: Create Product
    S->>P: Save product (qty=0)
    S-->>A: Product created
    
    A->>S: Create Inflow (qty=100)
    S->>I: Save inflow record
    I->>P: Update quantity (0+100=100)
    S-->>A: Inflow recorded
    
    Note over A,AI: Sales Process
    
    A->>S: Create Outflow (qty=20)
    S->>O: Validate stock (100 >= 20)
    O->>P: Update quantity (100-20=80)
    O->>W: Send webhook event
    W-->>O: Webhook acknowledged
    
    S->>P: Check stock level
    P-->>S: Stock OK (80 > threshold)
    S-->>A: Outflow recorded
    
    Note over A,AI: Low Stock Scenario
    
    A->>S: Create Outflow (qty=70)
    S->>O: Validate stock (80 >= 70)
    O->>P: Update quantity (80-70=10)
    O->>W: Send webhook event
    
    S->>P: Check stock level
    P-->>S: LOW STOCK (10 < threshold)
    S->>AI: Request analysis
    AI-->>S: Generate insights
    S->>A: Send low stock alert
    S-->>A: Suggest restock
    
    style P fill:#4CAF50,color:#fff
    style I fill:#2196F3,color:#fff
    style O fill:#FF9800,color:#fff
    style W fill:#9C27B0,color:#fff
    style AI fill:#10a37f,color:#fff
```

---

**Next Steps**: 
- [Authentication & Security](authentication-security.md) - Detailed security documentation
- [Development](development.md) - Development workflow
