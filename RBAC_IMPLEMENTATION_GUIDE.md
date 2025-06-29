# Comprehensive RBAC Implementation Guide for ERP System

## Overview

This guide provides a complete implementation plan for a Role-Based Access Control (RBAC) system with hierarchical permissions, multi-level access control, and resource-based permissions.

## Key Features

### 1. Hierarchical Role System
- Roles have inheritance through parent-child relationships
- Higher-level roles automatically inherit permissions from lower levels
- Role levels determine permission precedence

### 2. Multi-Level Access Control
- **Global**: System-wide access
- **Company**: Access to specific companies
- **Business Unit**: Access to specific business units
- **Factory**: Access to specific factories  
- **Division**: Access to specific divisions within factories

### 3. Granular Permission System
- Module-based permissions (Finance, HR, Manufacturing, etc.)
- Sub-module permissions for finer control
- Action-based permissions (CREATE, READ, UPDATE, DELETE, APPROVE, etc.)
- Resource-specific permissions

### 4. Permission Override Capability
- Direct user permissions can override role permissions
- Permissions can be granted or revoked at user level
- Scope-specific permission overrides

## Database Schema Changes

### New Models to Add:

```prisma
// Add to your existing schema.prisma file

model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  displayName String
  description String?
  level       Int      
  parentId    String?  
  isSystem    Boolean  @default(false)
  
  parent      Role?    @relation("RoleHierarchy", fields: [parentId], references: [id])
  children    Role[]   @relation("RoleHierarchy")
  permissions RolePermission[]
  users       UserRole[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([level])
}

model Module {
  id          String   @id @default(cuid())
  name        String   @unique
  displayName String
  description String?
  icon        String?
  path        String?
  isActive    Boolean  @default(true)
  order       Int      @default(0)
  
  subModules  SubModule[]
  permissions Permission[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Permission {
  id          String   @id @default(cuid())
  moduleId    String
  subModuleId String?
  action      PermissionAction
  resource    String
  description String?
  
  module      Module   @relation(fields: [moduleId], references: [id])
  subModule   SubModule? @relation(fields: [subModuleId], references: [id])
  roles       RolePermission[]
  users       UserPermission[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([moduleId, subModuleId, action, resource])
  @@index([moduleId, action])
}

// ... (include all other models from rbac-schema-enhancement.prisma)
```

### Update Existing User Model:

```prisma
model User {
  // ... existing fields ...
  
  userRoles       UserRole[]
  userPermissions UserPermission[]
  resourceAccess  ResourceAccess[]
  
  // ... rest of existing fields ...
}
```

## Implementation Steps

### 1. Database Migration

```bash
# Generate migration
npx prisma migrate dev --name add_rbac_system

# Apply migration
npx prisma migrate deploy
```

### 2. Seed Initial Data

Create a seed script to populate initial roles, modules, and permissions:

```typescript
// prisma/seed-rbac.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRoles() {
  const roles = [
    { name: 'MD', displayName: 'Managing Director', level: 100, isSystem: true },
    { name: 'CTO', displayName: 'Chief Technology Officer', level: 90, isSystem: true },
    { name: 'CFO', displayName: 'Chief Financial Officer', level: 90, isSystem: true },
    { name: 'FACTORY_MANAGER', displayName: 'Factory Manager', level: 70, isSystem: true },
    { name: 'DEPT_HEAD', displayName: 'Department Head', level: 60, isSystem: true },
    { name: 'SUPERVISOR', displayName: 'Supervisor', level: 50, isSystem: true },
    { name: 'OPERATOR', displayName: 'Operator', level: 30, isSystem: true },
    { name: 'VIEWER', displayName: 'Viewer', level: 10, isSystem: true },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
}

async function seedModules() {
  const modules = [
    {
      name: 'finance',
      displayName: 'Finance',
      description: 'Financial management module',
      icon: 'currency-dollar',
      order: 1,
      subModules: [
        { name: 'gl', displayName: 'General Ledger' },
        { name: 'ar', displayName: 'Accounts Receivable' },
        { name: 'ap', displayName: 'Accounts Payable' },
        { name: 'banking', displayName: 'Banking' },
        { name: 'costing', displayName: 'Costing' },
      ],
    },
    {
      name: 'hr',
      displayName: 'Human Resources',
      description: 'HR management module',
      icon: 'users',
      order: 2,
      subModules: [
        { name: 'employee', displayName: 'Employee Management' },
        { name: 'payroll', displayName: 'Payroll' },
        { name: 'attendance', displayName: 'Attendance' },
        { name: 'leave', displayName: 'Leave Management' },
      ],
    },
    {
      name: 'manufacturing',
      displayName: 'Manufacturing',
      description: 'Production management module',
      icon: 'cog',
      order: 3,
      subModules: [
        { name: 'production', displayName: 'Production' },
        { name: 'quality', displayName: 'Quality Control' },
        { name: 'maintenance', displayName: 'Maintenance' },
      ],
    },
    // Add more modules...
  ];

  for (const moduleData of modules) {
    const { subModules, ...moduleInfo } = moduleData;
    
    const module = await prisma.module.upsert({
      where: { name: moduleInfo.name },
      update: {},
      create: moduleInfo,
    });

    for (const subModule of subModules) {
      await prisma.subModule.upsert({
        where: {
          moduleId_name: {
            moduleId: module.id,
            name: subModule.name,
          },
        },
        update: {},
        create: {
          ...subModule,
          moduleId: module.id,
        },
      });
    }
  }
}

async function seedPermissions() {
  // Create permissions for each module/submodule/resource combination
  const modules = await prisma.module.findMany({
    include: { subModules: true },
  });

  const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'EXPORT'];
  const resources = {
    finance: {
      gl: ['chart_of_accounts', 'journal_entries', 'ledgers'],
      ar: ['invoices', 'receipts', 'customers'],
      ap: ['bills', 'payments', 'vendors'],
    },
    hr: {
      employee: ['profiles', 'contracts', 'documents'],
      payroll: ['salary', 'deductions', 'reports'],
    },
    manufacturing: {
      production: ['batches', 'schedules', 'reports'],
      quality: ['inspections', 'standards', 'reports'],
    },
  };

  for (const module of modules) {
    for (const subModule of module.subModules) {
      const moduleResources = resources[module.name]?.[subModule.name] || [];
      
      for (const resource of moduleResources) {
        for (const action of actions) {
          await prisma.permission.create({
            data: {
              moduleId: module.id,
              subModuleId: subModule.id,
              action: action as any,
              resource,
              description: `${action} ${resource} in ${subModule.displayName}`,
            },
          });
        }
      }
    }
  }
}

async function assignRolePermissions() {
  // MD gets all permissions
  const mdRole = await prisma.role.findUnique({ where: { name: 'MD' } });
  const allPermissions = await prisma.permission.findMany();
  
  for (const permission of allPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: mdRole!.id,
        permissionId: permission.id,
      },
    });
  }

  // CFO gets all finance permissions
  const cfoRole = await prisma.role.findUnique({ where: { name: 'CFO' } });
  const financeModule = await prisma.module.findUnique({ where: { name: 'finance' } });
  const financePermissions = await prisma.permission.findMany({
    where: { moduleId: financeModule!.id },
  });

  for (const permission of financePermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: cfoRole!.id,
        permissionId: permission.id,
      },
    });
  }

  // Add more role-permission assignments...
}

async function main() {
  await seedRoles();
  await seedModules();
  await seedPermissions();
  await assignRolePermissions();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 3. Permission Checking Service

Create a service to check permissions:

```typescript
// services/rbac.service.ts
import { PrismaClient } from '@prisma/client';

export class RBACService {
  constructor(private prisma: PrismaClient) {}

  async checkPermission(
    userId: string,
    moduleId: string,
    action: string,
    resource: string,
    scopeType?: string,
    scopeId?: string
  ): Promise<boolean> {
    // 1. Check direct user permissions
    const userPermission = await this.prisma.userPermission.findFirst({
      where: {
        userId,
        permission: {
          moduleId,
          action,
          resource,
        },
        ...(scopeType && scopeId ? { scope: scopeType, scopeId } : {}),
      },
    });

    if (userPermission) {
      return userPermission.granted;
    }

    // 2. Check role permissions with inheritance
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId,
        ...(scopeType && scopeId ? { scope: scopeType, scopeId } : {}),
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // Sort roles by level (highest first)
    const sortedRoles = userRoles.sort((a, b) => b.role.level - a.role.level);

    for (const userRole of sortedRoles) {
      const hasPermission = userRole.role.permissions.some(
        (rp) =>
          rp.permission.moduleId === moduleId &&
          rp.permission.action === action &&
          rp.permission.resource === resource
      );

      if (hasPermission) {
        return true;
      }

      // Check parent roles recursively
      if (userRole.role.parentId) {
        const hasInheritedPermission = await this.checkInheritedPermission(
          userRole.role.parentId,
          moduleId,
          action,
          resource
        );
        if (hasInheritedPermission) {
          return true;
        }
      }
    }

    return false;
  }

  private async checkInheritedPermission(
    roleId: string,
    moduleId: string,
    action: string,
    resource: string
  ): Promise<boolean> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) return false;

    const hasPermission = role.permissions.some(
      (rp) =>
        rp.permission.moduleId === moduleId &&
        rp.permission.action === action &&
        rp.permission.resource === resource
    );

    if (hasPermission) return true;

    // Check parent recursively
    if (role.parentId) {
      return this.checkInheritedPermission(role.parentId, moduleId, action, resource);
    }

    return false;
  }

  async getUserAccessibleResources(
    userId: string,
    resourceType: string
  ): Promise<string[]> {
    const resources = await this.prisma.resourceAccess.findMany({
      where: {
        userId,
        resourceType,
        accessLevel: {
          not: 'NONE',
        },
      },
    });

    return resources.map((r) => r.resourceId);
  }

  async getUserScopes(userId: string): Promise<any[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      select: {
        scope: true,
        scopeId: true,
      },
    });

    const uniqueScopes = Array.from(
      new Set(userRoles.map((ur) => JSON.stringify({ scope: ur.scope, scopeId: ur.scopeId })))
    ).map((s) => JSON.parse(s));

    return uniqueScopes;
  }
}
```

### 4. Middleware for Permission Checking

Create Express middleware:

```typescript
// middleware/rbac.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { RBACService } from '../services/rbac.service';

export function requirePermission(
  module: string,
  action: string,
  resource: string
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const rbacService = new RBACService(req.prisma);
      
      // Get scope from request context (e.g., from headers or query params)
      const scopeType = req.headers['x-scope-type'] as string;
      const scopeId = req.headers['x-scope-id'] as string;

      const hasPermission = await rbacService.checkPermission(
        userId,
        module,
        action,
        resource,
        scopeType,
        scopeId
      );

      if (!hasPermission) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
```

### 5. API Routes with RBAC

Example implementation:

```typescript
// routes/finance.routes.ts
import { Router } from 'express';
import { requirePermission } from '../middleware/rbac.middleware';

const router = Router();

// View chart of accounts
router.get(
  '/chart-of-accounts',
  requirePermission('finance', 'READ', 'chart_of_accounts'),
  async (req, res) => {
    // Implementation
  }
);

// Create new account
router.post(
  '/chart-of-accounts',
  requirePermission('finance', 'CREATE', 'chart_of_accounts'),
  async (req, res) => {
    // Implementation
  }
);

// Approve journal entry
router.post(
  '/journal-entries/:id/approve',
  requirePermission('finance', 'APPROVE', 'journal_entries'),
  async (req, res) => {
    // Implementation
  }
);

export default router;
```

### 6. Frontend Permission Checking

React hook for permission checking:

```typescript
// hooks/usePermission.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function usePermission(
  module: string,
  action: string,
  resource: string,
  scopeType?: string,
  scopeId?: string
) {
  const { data: hasPermission = false } = useQuery({
    queryKey: ['permission', module, action, resource, scopeType, scopeId],
    queryFn: async () => {
      const response = await api.post('/permissions/check', {
        module,
        action,
        resource,
        scopeType,
        scopeId,
      });
      return response.data.hasPermission;
    },
  });

  return hasPermission;
}

// Component usage
function FinanceModule() {
  const canViewChartOfAccounts = usePermission('finance', 'READ', 'chart_of_accounts');
  const canCreateAccount = usePermission('finance', 'CREATE', 'chart_of_accounts');

  return (
    <div>
      {canViewChartOfAccounts && (
        <ChartOfAccountsList />
      )}
      {canCreateAccount && (
        <Button onClick={handleCreate}>Create Account</Button>
      )}
    </div>
  );
}
```

## Admin Panel Features

### 1. Role Management
- Create/edit/delete custom roles
- Set role hierarchy
- Assign permissions to roles
- Bulk permission assignment

### 2. User Permission Management
- Assign roles to users with scope
- Override specific permissions
- View effective permissions
- Audit permission changes

### 3. Resource Access Control
- Define resource-level access
- Set access levels (VIEW, EDIT, FULL)
- Manage resource groups

## Best Practices

1. **Permission Naming Convention**
   - Format: `module.submodule.resource.action`
   - Example: `finance.gl.chart_of_accounts.CREATE`

2. **Role Hierarchy**
   - Keep role levels with gaps (10, 20, 30) for future roles
   - System roles should not be deletable
   - Document role responsibilities

3. **Performance Optimization**
   - Cache permission checks in Redis
   - Use database indexes on frequently queried fields
   - Implement permission prefetching

4. **Security Considerations**
   - Log all permission changes
   - Implement permission change approval workflow
   - Regular permission audits
   - Principle of least privilege

## Migration from Existing System

1. Map existing roles to new role structure
2. Create permission sets based on current access patterns
3. Run parallel with existing system initially
4. Gradually migrate users to new RBAC
5. Deprecate old permission system

This comprehensive RBAC system provides the flexibility and control needed for a complex ERP system while maintaining security and performance.