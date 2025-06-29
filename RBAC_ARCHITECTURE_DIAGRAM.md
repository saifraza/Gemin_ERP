# RBAC Architecture Diagram

## System Overview

```mermaid
graph TB
    subgraph "Users"
        U1[User 1 - MD]
        U2[User 2 - Factory Manager]
        U3[User 3 - Operator]
    end

    subgraph "Role Hierarchy"
        R1[MD - Level 100]
        R2[CTO - Level 90]
        R3[CFO - Level 90]
        R4[Factory Manager - Level 70]
        R5[Department Head - Level 60]
        R6[Supervisor - Level 50]
        R7[Operator - Level 30]
        R8[Viewer - Level 10]
        
        R1 --> R2
        R1 --> R3
        R2 --> R4
        R3 --> R4
        R4 --> R5
        R5 --> R6
        R6 --> R7
        R7 --> R8
    end

    subgraph "Modules"
        M1[Finance Module]
        M2[HR Module]
        M3[Manufacturing Module]
        M4[Procurement Module]
        M5[Sales Module]
    end

    subgraph "Sub-Modules"
        SM1[General Ledger]
        SM2[Accounts Payable]
        SM3[Payroll]
        SM4[Production]
        SM5[Quality Control]
    end

    subgraph "Permissions"
        P1[finance.gl.chart_of_accounts.CREATE]
        P2[finance.gl.journal_entries.APPROVE]
        P3[manufacturing.production.batch.UPDATE]
        P4[hr.payroll.salary.READ]
    end

    subgraph "Scopes"
        S1[Global Scope]
        S2[Company A]
        S3[Factory 1]
        S4[Sugar Division]
    end

    U1 --> R1
    U2 --> R4
    U3 --> R7

    R1 --> P1
    R1 --> P2
    R1 --> P3
    R1 --> P4

    R4 --> P3
    R7 --> P3

    M1 --> SM1
    M1 --> SM2
    M2 --> SM3
    M3 --> SM4
    M3 --> SM5

    SM1 --> P1
    SM1 --> P2
    SM3 --> P4
    SM4 --> P3
```

## Permission Flow

```mermaid
sequenceDiagram
    participant User
    participant API
    participant RBACService
    participant Database
    participant Cache

    User->>API: Request (with auth token)
    API->>API: Extract user ID & scope
    API->>RBACService: checkPermission(userId, module, action, resource, scope)
    
    RBACService->>Cache: Check cached permission
    alt Permission in cache
        Cache-->>RBACService: Return cached result
    else Permission not cached
        RBACService->>Database: Query user permissions
        Database-->>RBACService: Direct permissions
        
        RBACService->>Database: Query user roles
        Database-->>RBACService: User roles with scope
        
        RBACService->>Database: Query role permissions
        Database-->>RBACService: Role permissions
        
        RBACService->>RBACService: Check role hierarchy
        RBACService->>RBACService: Evaluate final permission
        
        RBACService->>Cache: Store result
    end
    
    RBACService-->>API: Permission result
    alt Has permission
        API->>API: Process request
        API-->>User: Success response
    else No permission
        API-->>User: 403 Forbidden
    end
```

## Data Model Relationships

```mermaid
erDiagram
    User ||--o{ UserRole : has
    User ||--o{ UserPermission : has
    User ||--o{ ResourceAccess : has
    
    Role ||--o{ RolePermission : has
    Role ||--o{ UserRole : assigned_to
    Role ||--o| Role : inherits_from
    
    Module ||--o{ SubModule : contains
    Module ||--o{ Permission : defines
    
    SubModule ||--o{ Permission : defines
    
    Permission ||--o{ RolePermission : assigned_to
    Permission ||--o{ UserPermission : overridden_by
    
    Company ||--o{ BusinessUnit : has
    Company ||--o{ Factory : has
    
    Factory ||--o{ Division : has
    
    UserRole {
        string userId
        string roleId
        enum scope
        string scopeId
    }
    
    RolePermission {
        string roleId
        string permissionId
    }
    
    UserPermission {
        string userId
        string permissionId
        boolean granted
        enum scope
        string scopeId
    }
    
    Permission {
        string moduleId
        string subModuleId
        enum action
        string resource
    }
```

## Scope Hierarchy

```mermaid
graph TD
    G[Global Scope] --> C1[Company 1]
    G --> C2[Company 2]
    
    C1 --> BU1[Business Unit A]
    C1 --> BU2[Business Unit B]
    
    BU1 --> F1[Factory 1]
    BU1 --> F2[Factory 2]
    
    F1 --> D1[Sugar Division]
    F1 --> D2[Ethanol Division]
    F1 --> D3[Power Division]
    
    style G fill:#f9f,stroke:#333,stroke-width:4px
    style C1 fill:#bbf,stroke:#333,stroke-width:2px
    style F1 fill:#bfb,stroke:#333,stroke-width:2px
    style D1 fill:#fbf,stroke:#333,stroke-width:2px
```

## Permission Check Algorithm

```mermaid
flowchart TD
    Start([User Makes Request]) --> Extract[Extract User ID & Scope]
    Extract --> CheckDirect{Check Direct<br/>User Permissions}
    
    CheckDirect -->|Found| Granted{Granted?}
    Granted -->|Yes| Allow[Allow Access]
    Granted -->|No| Deny[Deny Access]
    
    CheckDirect -->|Not Found| GetRoles[Get User Roles<br/>for Scope]
    GetRoles --> SortRoles[Sort Roles by Level<br/>Highest First]
    
    SortRoles --> LoopRoles{For Each Role}
    LoopRoles --> CheckRolePerm{Has Permission?}
    
    CheckRolePerm -->|Yes| Allow
    CheckRolePerm -->|No| CheckParent{Has Parent Role?}
    
    CheckParent -->|Yes| CheckInherited[Check Parent<br/>Permissions]
    CheckInherited --> Found{Permission Found?}
    Found -->|Yes| Allow
    Found -->|No| NextRole[Next Role]
    
    CheckParent -->|No| NextRole
    NextRole --> MoreRoles{More Roles?}
    MoreRoles -->|Yes| LoopRoles
    MoreRoles -->|No| Deny
    
    Allow --> Cache[Cache Result]
    Deny --> Cache
    Cache --> Return[Return Result]
```

## Example Permission Scenarios

### Scenario 1: MD Accessing Finance Module
```
User: MD (Managing Director)
Module: Finance
Action: APPROVE
Resource: journal_entries
Scope: Global

Result: ✅ Allowed (MD has all permissions globally)
```

### Scenario 2: Factory Manager Accessing Different Factory
```
User: Factory Manager
Module: Manufacturing  
Action: UPDATE
Resource: production_batch
Scope: Factory 2 (User assigned to Factory 1)

Result: ❌ Denied (No permission for Factory 2)
```

### Scenario 3: User with Override Permission
```
User: Operator
Module: Finance
Action: READ
Resource: reports
Normal Role Permission: ❌ No
User Override: ✅ Granted for specific factory

Result: ✅ Allowed (Override takes precedence)
```

## Implementation Priority

1. **Phase 1: Core RBAC**
   - Role model with hierarchy
   - Basic permissions
   - User-role assignments

2. **Phase 2: Scoped Access**
   - Company-level access
   - Factory-level access
   - Division-level access

3. **Phase 3: Advanced Features**
   - Permission overrides
   - Resource-based access
   - Business unit support

4. **Phase 4: Performance & Admin**
   - Permission caching
   - Admin UI
   - Audit logging