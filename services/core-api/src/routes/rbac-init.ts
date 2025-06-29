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

    // Create basic roles using raw SQL
    await prisma.$executeRawUnsafe(`
      INSERT INTO "RoleDefinition" (id, name, code, description, level, "isSystem", "createdAt", "updatedAt")
      VALUES 
        ('cuid_super_admin', 'Super Admin', 'SUPER_ADMIN', 'Full system access', 100, true, NOW(), NOW()),
        ('cuid_admin', 'Admin', 'ADMIN', 'Administrative access', 90, true, NOW(), NOW()),
        ('cuid_manager', 'Manager', 'MANAGER', 'Manager level access', 70, true, NOW(), NOW()),
        ('cuid_user', 'User', 'USER', 'Basic user access', 30, true, NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `);

    // Create basic modules
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Module" (id, name, code, description, icon, path, "isActive", "createdAt", "updatedAt")
      VALUES 
        ('cuid_master_data', 'Master Data', 'MASTER_DATA', 'Master data management', 'Database', '/master-data', true, NOW(), NOW()),
        ('cuid_supply_chain', 'Supply Chain', 'SUPPLY_CHAIN', 'Supply chain management', 'Package', '/supply-chain', true, NOW(), NOW()),
        ('cuid_finance', 'Finance', 'FINANCE', 'Financial management', 'DollarSign', '/finance', true, NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `);

    // Create permissions
    const permissionActions = ['CREATE', 'READ', 'UPDATE', 'DELETE'];
    const modules = [
      { id: 'cuid_master_data', code: 'MASTER_DATA', name: 'Master Data' },
      { id: 'cuid_supply_chain', code: 'SUPPLY_CHAIN', name: 'Supply Chain' },
      { id: 'cuid_finance', code: 'FINANCE', name: 'Finance' }
    ];

    for (const module of modules) {
      for (const action of permissionActions) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO "Permission" (id, "moduleId", name, code, action, description, "createdAt", "updatedAt")
          VALUES (
            '${module.id}_perm_${action.toLowerCase()}',
            '${module.id}',
            '${action} ${module.name}',
            '${module.code}_${action}',
            '${action}',
            'Can ${action.toLowerCase()} ${module.name.toLowerCase()} records',
            NOW(),
            NOW()
          )
          ON CONFLICT (code) DO NOTHING;
        `);
      }
    }

    // Add APPROVE permission for Supply Chain
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Permission" (id, "moduleId", name, code, action, description, "createdAt", "updatedAt")
      VALUES (
        'cuid_supply_chain_perm_approve',
        'cuid_supply_chain',
        'APPROVE Supply Chain',
        'SUPPLY_CHAIN_APPROVE',
        'APPROVE',
        'Can approve supply chain records',
        NOW(),
        NOW()
      )
      ON CONFLICT (code) DO NOTHING;
    `);

    // Assign all permissions to Super Admin
    await prisma.$executeRawUnsafe(`
      INSERT INTO "RolePermission" (id, "roleId", "permissionId", granted, "createdAt")
      SELECT 
        CONCAT('rp_', p.id),
        'cuid_super_admin',
        p.id,
        true,
        NOW()
      FROM "Permission" p
      WHERE NOT EXISTS (
        SELECT 1 FROM "RolePermission" rp 
        WHERE rp."roleId" = 'cuid_super_admin' AND rp."permissionId" = p.id
      );
    `);

    // Assign read permissions to User role
    await prisma.$executeRawUnsafe(`
      INSERT INTO "RolePermission" (id, "roleId", "permissionId", granted, "createdAt")
      SELECT 
        CONCAT('rp_user_', p.id),
        'cuid_user',
        p.id,
        true,
        NOW()
      FROM "Permission" p
      WHERE p.action = 'READ'
      AND NOT EXISTS (
        SELECT 1 FROM "RolePermission" rp 
        WHERE rp."roleId" = 'cuid_user' AND rp."permissionId" = p.id
      );
    `);

    const roleCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "RoleDefinition"`;
    const moduleCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Module"`;
    const permissionCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Permission"`;

    console.log('RBAC seed completed successfully');

    return c.json({ 
      message: 'RBAC data seeded successfully',
      roles: roleCount[0]?.count || 0,
      modules: moduleCount[0]?.count || 0,
      permissions: permissionCount[0]?.count || 0
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
      prisma.$queryRaw`SELECT COUNT(*) as count FROM "RoleDefinition"`.catch(() => [{ count: 0 }]),
      prisma.$queryRaw`SELECT COUNT(*) as count FROM "Module"`.catch(() => [{ count: 0 }]),
      prisma.$queryRaw`SELECT COUNT(*) as count FROM "Permission"`.catch(() => [{ count: 0 }])
    ]);

    return c.json({
      status: 'ok',
      tables: {
        roles: Number(roleCount[0]?.count) || 0,
        modules: Number(moduleCount[0]?.count) || 0,
        permissions: Number(permissionCount[0]?.count) || 0
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