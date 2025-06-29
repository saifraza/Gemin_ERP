import { Hono } from 'hono';
import { prisma } from '../index';

const rbacInitRoutes = new Hono();

// Initialize RBAC tables - temporary endpoint for production setup
rbacInitRoutes.post('/init', async (c) => {
  try {
    console.log('Starting RBAC table initialization...');
    
    // Check if tables already exist by trying to query them
    try {
      await prisma.module.findFirst();
      return c.json({ message: 'RBAC tables already exist' });
    } catch (e) {
      console.log('Tables do not exist, creating...');
    }

    // First, create the enum types if they don't exist
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "PermissionAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT', 'IMPORT', 'EXECUTE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "AccessScope" AS ENUM ('GLOBAL', 'COMPANY', 'FACTORY', 'DIVISION', 'DEPARTMENT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "ResourceType" AS ENUM ('COMPANY', 'FACTORY', 'DIVISION', 'USER', 'ROLE', 'MODULE', 'REPORT', 'WORKFLOW', 'DATA');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "AccessLevel" AS ENUM ('NONE', 'VIEW', 'EDIT', 'ADMIN', 'OWNER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Execute raw SQL to create tables
    await prisma.$executeRawUnsafe(`
      -- CreateTable
      CREATE TABLE IF NOT EXISTS "RoleDefinition" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "code" TEXT NOT NULL,
          "description" TEXT,
          "level" INTEGER NOT NULL,
          "parentId" TEXT,
          "isSystem" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "RoleDefinition_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Module" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "code" TEXT NOT NULL,
          "description" TEXT,
          "icon" TEXT,
          "path" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SubModule" (
          "id" TEXT NOT NULL,
          "moduleId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "code" TEXT NOT NULL,
          "description" TEXT,
          "path" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "SubModule_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Permission" (
          "id" TEXT NOT NULL,
          "moduleId" TEXT NOT NULL,
          "subModuleId" TEXT,
          "name" TEXT NOT NULL,
          "code" TEXT NOT NULL,
          "action" "PermissionAction" NOT NULL,
          "description" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "RolePermission" (
          "id" TEXT NOT NULL,
          "roleId" TEXT NOT NULL,
          "permissionId" TEXT NOT NULL,
          "granted" BOOLEAN NOT NULL DEFAULT true,
          "conditions" JSONB,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserRole" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "roleId" TEXT NOT NULL,
          "scope" "AccessScope" NOT NULL,
          "scopeId" TEXT,
          "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "validUntil" TIMESTAMP(3),
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserPermission" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "permissionId" TEXT NOT NULL,
          "granted" BOOLEAN NOT NULL,
          "scope" "AccessScope" NOT NULL,
          "scopeId" TEXT,
          "reason" TEXT,
          "grantedBy" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "expiresAt" TIMESTAMP(3),
          CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ResourceAccess" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "resourceType" "ResourceType" NOT NULL,
          "resourceId" TEXT NOT NULL,
          "accessLevel" "AccessLevel" NOT NULL,
          "conditions" JSONB,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "expiresAt" TIMESTAMP(3),
          CONSTRAINT "ResourceAccess_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create indexes individually
    const indexes = [
      `CREATE UNIQUE INDEX IF NOT EXISTS "RoleDefinition_name_key" ON "RoleDefinition"("name")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "RoleDefinition_code_key" ON "RoleDefinition"("code")`,
      `CREATE INDEX IF NOT EXISTS "RoleDefinition_level_idx" ON "RoleDefinition"("level")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Module_name_key" ON "Module"("name")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Module_code_key" ON "Module"("code")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "SubModule_moduleId_code_key" ON "SubModule"("moduleId", "code")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Permission_code_key" ON "Permission"("code")`,
      `CREATE INDEX IF NOT EXISTS "Permission_moduleId_action_idx" ON "Permission"("moduleId", "action")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId")`,
      `CREATE INDEX IF NOT EXISTS "UserRole_userId_isActive_idx" ON "UserRole"("userId", "isActive")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "UserRole_userId_roleId_scope_scopeId_key" ON "UserRole"("userId", "roleId", "scope", "scopeId")`,
      `CREATE INDEX IF NOT EXISTS "UserPermission_userId_permissionId_idx" ON "UserPermission"("userId", "permissionId")`,
      `CREATE INDEX IF NOT EXISTS "ResourceAccess_userId_resourceType_resourceId_idx" ON "ResourceAccess"("userId", "resourceType", "resourceId")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ResourceAccess_userId_resourceType_resourceId_key" ON "ResourceAccess"("userId", "resourceType", "resourceId")`
    ];

    for (const index of indexes) {
      try {
        await prisma.$executeRawUnsafe(index);
      } catch (e) {
        console.log(`Index creation skipped: ${e.message}`);
      }
    }

    // Add foreign key constraints if tables exist
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "RoleDefinition" ADD CONSTRAINT "RoleDefinition_parentId_fkey" 
        FOREIGN KEY ("parentId") REFERENCES "RoleDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      `);
    } catch (e) {
      console.log('Foreign key RoleDefinition_parentId_fkey already exists or failed');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "SubModule" ADD CONSTRAINT "SubModule_moduleId_fkey" 
        FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e) {
      console.log('Foreign key SubModule_moduleId_fkey already exists or failed');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Permission" ADD CONSTRAINT "Permission_moduleId_fkey" 
        FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e) {
      console.log('Foreign key Permission_moduleId_fkey already exists or failed');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Permission" ADD CONSTRAINT "Permission_subModuleId_fkey" 
        FOREIGN KEY ("subModuleId") REFERENCES "SubModule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      `);
    } catch (e) {
      console.log('Foreign key Permission_subModuleId_fkey already exists or failed');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" 
        FOREIGN KEY ("roleId") REFERENCES "RoleDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e) {
      console.log('Foreign key RolePermission_roleId_fkey already exists or failed');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" 
        FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e) {
      console.log('Foreign key RolePermission_permissionId_fkey already exists or failed');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e) {
      console.log('Foreign key UserRole_userId_fkey already exists or failed');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" 
        FOREIGN KEY ("roleId") REFERENCES "RoleDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e) {
      console.log('Foreign key UserRole_roleId_fkey already exists or failed');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e) {
      console.log('Foreign key UserPermission_userId_fkey already exists or failed');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permissionId_fkey" 
        FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e) {
      console.log('Foreign key UserPermission_permissionId_fkey already exists or failed');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_grantedBy_fkey" 
        FOREIGN KEY ("grantedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      `);
    } catch (e) {
      console.log('Foreign key UserPermission_grantedBy_fkey already exists or failed');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "ResourceAccess" ADD CONSTRAINT "ResourceAccess_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e) {
      console.log('Foreign key ResourceAccess_userId_fkey already exists or failed');
    }

    console.log('RBAC tables created successfully');

    return c.json({ 
      message: 'RBAC tables created successfully',
      note: 'You can now seed the RBAC data',
      tables: ['RoleDefinition', 'Module', 'SubModule', 'Permission', 'RolePermission', 'UserRole', 'UserPermission', 'ResourceAccess']
    });
  } catch (error) {
    console.error('RBAC init error:', error);
    return c.json({ 
      error: 'Failed to create RBAC tables', 
      details: error.message 
    }, 500);
  }
});

// Seed basic RBAC data
rbacInitRoutes.post('/seed', async (c) => {
  try {
    console.log('Starting RBAC seed...');

    // Create basic roles
    const roles = await prisma.$transaction(async (tx) => {
      const superAdmin = await tx.roleDefinition.upsert({
        where: { code: 'SUPER_ADMIN' },
        update: {},
        create: {
          name: 'Super Admin',
          code: 'SUPER_ADMIN',
          description: 'Full system access',
          level: 100,
          isSystem: true
        }
      });

      const admin = await tx.roleDefinition.upsert({
        where: { code: 'ADMIN' },
        update: {},
        create: {
          name: 'Admin',
          code: 'ADMIN',
          description: 'Administrative access',
          level: 90,
          isSystem: true
        }
      });

      const manager = await tx.roleDefinition.upsert({
        where: { code: 'MANAGER' },
        update: {},
        create: {
          name: 'Manager',
          code: 'MANAGER',
          description: 'Manager level access',
          level: 70,
          isSystem: true
        }
      });

      const user = await tx.roleDefinition.upsert({
        where: { code: 'USER' },
        update: {},
        create: {
          name: 'User',
          code: 'USER',
          description: 'Basic user access',
          level: 30,
          isSystem: true
        }
      });

      return { superAdmin, admin, manager, user };
    });

    // Create basic modules
    const modules = await prisma.$transaction(async (tx) => {
      const masterData = await tx.module.upsert({
        where: { code: 'MASTER_DATA' },
        update: {},
        create: {
          name: 'Master Data',
          code: 'MASTER_DATA',
          description: 'Master data management',
          icon: 'Database',
          path: '/master-data'
        }
      });

      const supplyChain = await tx.module.upsert({
        where: { code: 'SUPPLY_CHAIN' },
        update: {},
        create: {
          name: 'Supply Chain',
          code: 'SUPPLY_CHAIN',
          description: 'Supply chain management',
          icon: 'Package',
          path: '/supply-chain'
        }
      });

      const finance = await tx.module.upsert({
        where: { code: 'FINANCE' },
        update: {},
        create: {
          name: 'Finance',
          code: 'FINANCE',
          description: 'Financial management',
          icon: 'DollarSign',
          path: '/finance'
        }
      });

      return { masterData, supplyChain, finance };
    });

    // Create permissions for Master Data
    const permissions = await prisma.$transaction(async (tx) => {
      const perms = [];

      // Master Data permissions
      for (const action of ['CREATE', 'READ', 'UPDATE', 'DELETE']) {
        const perm = await tx.permission.upsert({
          where: { code: `MASTER_DATA_COMPANY_${action}` },
          update: {},
          create: {
            moduleId: modules.masterData.id,
            name: `${action} Companies`,
            code: `MASTER_DATA_COMPANY_${action}`,
            action: action as any,
            description: `Can ${action.toLowerCase()} company records`
          }
        });
        perms.push(perm);
      }

      // Supply Chain permissions
      for (const action of ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE']) {
        const perm = await tx.permission.upsert({
          where: { code: `SUPPLY_CHAIN_PROCUREMENT_${action}` },
          update: {},
          create: {
            moduleId: modules.supplyChain.id,
            name: `${action} Procurement`,
            code: `SUPPLY_CHAIN_PROCUREMENT_${action}`,
            action: action as any,
            description: `Can ${action.toLowerCase()} procurement records`
          }
        });
        perms.push(perm);
      }

      return perms;
    });

    // Assign all permissions to Super Admin
    await prisma.rolePermission.deleteMany({
      where: { roleId: roles.superAdmin.id }
    });

    await prisma.rolePermission.createMany({
      data: permissions.map(perm => ({
        roleId: roles.superAdmin.id,
        permissionId: perm.id,
        granted: true
      }))
    });

    // Assign read permissions to User role
    const readPermissions = permissions.filter(p => p.action === 'READ');
    await prisma.rolePermission.deleteMany({
      where: { roleId: roles.user.id }
    });

    await prisma.rolePermission.createMany({
      data: readPermissions.map(perm => ({
        roleId: roles.user.id,
        permissionId: perm.id,
        granted: true
      }))
    });

    console.log('RBAC seed completed successfully');

    return c.json({ 
      message: 'RBAC data seeded successfully',
      roles: Object.keys(roles).length,
      modules: Object.keys(modules).length,
      permissions: permissions.length
    });
  } catch (error) {
    console.error('RBAC seed error:', error);
    return c.json({ 
      error: 'Failed to seed RBAC data', 
      details: error.message 
    }, 500);
  }
});

// Get RBAC status
rbacInitRoutes.get('/status', async (c) => {
  try {
    const [roleCount, moduleCount, permissionCount] = await Promise.all([
      prisma.roleDefinition.count().catch(() => 0),
      prisma.module.count().catch(() => 0),
      prisma.permission.count().catch(() => 0)
    ]);

    return c.json({
      status: 'ok',
      tables: {
        roles: roleCount,
        modules: moduleCount,
        permissions: permissionCount
      }
    });
  } catch (error) {
    return c.json({
      status: 'error',
      error: error.message
    }, 500);
  }
});

export default rbacInitRoutes;