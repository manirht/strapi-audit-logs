# 🎨 Visual Flow Diagrams (Mermaid)

Copy and paste these into any Mermaid renderer (GitHub, Mermaid Live Editor, etc.)

## 1. High-Level System Architecture

```mermaid
graph TB
    A[User/Admin] -->|CRUD Operations| B[Strapi Admin Panel]
    A -->|API Calls| C[REST API]
    
    B --> D[Strapi Core]
    C --> D
    
    D --> E[Database Layer]
    
    E -->|Lifecycle Hooks| F[Audit Logs Plugin]
    
    F --> G[(plugin_audit_logs<br/>Database Table)]
    
    H[External Client] -->|Query Logs| I[Audit Logs API]
    I -->|Fetch| G
    I -->|Return JSON| H
    
    style F fill:#4CAF50
    style G fill:#2196F3
    style D fill:#FF9800
```

## 2. Plugin Initialization Sequence

```mermaid
sequenceDiagram
    participant User
    participant CLI as yarn develop
    participant Strapi as Strapi Core
    participant Plugin as Audit Logs Plugin
    participant DB as Database
    
    User->>CLI: yarn develop
    CLI->>Strapi: Load configuration
    Strapi->>Strapi: Read config/plugins.js
    Strapi->>Plugin: Resolve plugin path
    Strapi->>Plugin: Load strapi-server.js
    Plugin->>Strapi: Register routes & services
    Plugin->>Strapi: Register lifecycle hooks
    Plugin->>DB: Create audit_logs table
    DB-->>Plugin: Table ready
    Plugin-->>Strapi: Plugin initialized ✅
    Strapi-->>CLI: Server ready
    CLI-->>User: http://localhost:1337 🚀
```

## 3. CRUD Operation with Audit Logging

```mermaid
sequenceDiagram
    participant User
    participant Admin as Admin Panel
    participant Core as Strapi Core
    participant Hook as Lifecycle Hook
    participant Service as Audit Service
    participant DB as Database
    
    User->>Admin: Create Article
    Admin->>Core: POST /api/articles
    Core->>Core: Validate & Authorize
    Core->>DB: INSERT INTO articles
    DB-->>Core: Record created
    
    Core->>Hook: Trigger afterCreate
    Hook->>Service: Create audit log
    
    Service->>Service: Extract metadata
    Service->>Service: Format log entry
    Service->>DB: INSERT INTO plugin_audit_logs
    DB-->>Service: Log saved
    
    Service-->>Hook: Done
    Hook-->>Core: Continue
    Core-->>Admin: Return article
    Admin-->>User: Success ✅
```

## 4. API Query Flow

```mermaid
sequenceDiagram
    participant Client
    participant API as Audit Logs API
    participant Policy as Access Policy
    participant Service as Audit Service
    participant DB as Database
    
    Client->>API: GET /api/audit-logs?action=create
    API->>Policy: Check authorization
    Policy->>Policy: Verify API token
    Policy->>Policy: Check permissions
    Policy-->>API: Authorized ✅
    
    API->>Service: find(filters)
    Service->>Service: Build query
    Service->>DB: SELECT with WHERE clause
    DB-->>Service: Return rows
    Service->>DB: SELECT COUNT(*)
    DB-->>Service: Total count
    
    Service->>Service: Format response
    Service-->>API: { results, pagination }
    API-->>Client: JSON response
```

## 5. Build Process Flow

```mermaid
graph LR
    A[yarn build] --> B[npm run clean]
    B --> C[rimraf dist/]
    C --> D[npm run build:code]
    D --> E[Rollup bundler]
    E --> F{Transpile TS}
    F --> G[dist/server/index.js]
    F --> H[dist/server/index.mjs]
    G --> I[npm run build:types]
    H --> I
    I --> J[TypeScript compiler]
    J --> K[Generate .d.ts files]
    K --> L[Build Complete ✅]
    
    style A fill:#4CAF50
    style L fill:#4CAF50
```

## 6. Data Flow Architecture

```mermaid
graph TB
    subgraph "User Layer"
        A[Admin Panel]
        B[API Client]
    end
    
    subgraph "Application Layer"
        C[Controllers]
        D[Services]
        E[Policies]
    end
    
    subgraph "Plugin Layer"
        F[Lifecycle Hooks]
        G[Audit Service]
    end
    
    subgraph "Data Layer"
        H[(Articles Table)]
        I[(Categories Table)]
        J[(plugin_audit_logs)]
    end
    
    A --> C
    B --> C
    C --> E
    E --> D
    D --> H
    D --> I
    
    H -.Trigger.-> F
    I -.Trigger.-> F
    F --> G
    G --> J
    
    style F fill:#FF9800
    style G fill:#FF9800
    style J fill:#2196F3
```

## 7. Complete Testing Workflow

```mermaid
graph TD
    Start([Start Testing]) --> Build[yarn build]
    Build --> Dev[yarn develop]
    Dev --> Admin{Admin<br/>Account<br/>Exists?}
    Admin -->|No| Create[Create Admin]
    Admin -->|Yes| Perms[Grant Permissions]
    Create --> Perms
    Perms --> Content[Create Content Type]
    Content --> Data[Add Test Data]
    Data --> Token[Get API Token]
    Token --> Test1[Test: GET all logs]
    Test1 --> Test2[Test: Filter by action]
    Test2 --> Test3[Test: Pagination]
    Test3 --> Test4[Test: Get single log]
    Test4 --> Test5[Test: Cleanup]
    Test5 --> Verify{All Tests<br/>Pass?}
    Verify -->|Yes| Success([Success ✅])
    Verify -->|No| Debug[Debug Issues]
    Debug --> Test1
    
    style Start fill:#4CAF50
    style Success fill:#4CAF50
    style Debug fill:#F44336
```

## 8. Lifecycle Hook Execution

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> beforeCreate: Create Request
    beforeCreate --> DatabaseInsert
    DatabaseInsert --> afterCreate
    afterCreate --> CaptureData
    CaptureData --> CreateAuditLog
    CreateAuditLog --> SaveLog
    SaveLog --> [*]
    
    Idle --> beforeUpdate: Update Request
    beforeUpdate --> FetchOldData
    FetchOldData --> DatabaseUpdate
    DatabaseUpdate --> afterUpdate
    afterUpdate --> CalculateDiff
    CalculateDiff --> CreateAuditLog
    
    Idle --> beforeDelete: Delete Request
    beforeDelete --> FetchDataToDelete
    FetchDataToDelete --> DatabaseDelete
    DatabaseDelete --> afterDelete
    afterDelete --> CreateAuditLog
```

## 9. Permission Check Flow

```mermaid
flowchart TD
    A[API Request] --> B{Authenticated?}
    B -->|No| C[401 Unauthorized]
    B -->|Yes| D{Has API Token<br/>or Session?}
    D -->|No| C
    D -->|Yes| E{Check Role<br/>Permissions}
    E -->|No Permission| F[403 Forbidden]
    E -->|Has Permission| G[Process Request]
    G --> H{Valid Query?}
    H -->|No| I[400 Bad Request]
    H -->|Yes| J[Execute Query]
    J --> K[Return Data]
    K --> L[200 OK]
    
    style C fill:#F44336
    style F fill:#F44336
    style I fill:#F44336
    style L fill:#4CAF50
```

## 10. Database Schema Relationships

```mermaid
erDiagram
    ARTICLES ||--o{ AUDIT_LOGS : generates
    CATEGORIES ||--o{ AUDIT_LOGS : generates
    USERS ||--o{ AUDIT_LOGS : creates
    
    ARTICLES {
        int id PK
        string title
        text content
        int authorId FK
        datetime createdAt
        datetime updatedAt
    }
    
    USERS {
        int id PK
        string username
        string email
        string role
    }
    
    AUDIT_LOGS {
        int id PK
        string action
        string contentType
        int recordId FK
        int userId FK
        string userName
        string userEmail
        json changedFields
        json oldData
        json newData
        datetime createdAt
    }
    
    CATEGORIES {
        int id PK
        string name
        string description
    }
```

---

## How to View These Diagrams

### Option 1: GitHub (Automatic)
Just push this file to GitHub - it renders Mermaid automatically!

### Option 2: Mermaid Live Editor
1. Go to: https://mermaid.live/
2. Copy any diagram code above
3. Paste and see it rendered

### Option 3: VS Code Extension
1. Install "Markdown Preview Mermaid Support" extension
2. Open this file in VS Code
3. Press `Ctrl+Shift+V` to preview

### Option 4: Online Markdown Editors
- https://stackedit.io/
- https://dillinger.io/
- Both support Mermaid diagrams!