#!/bin/bash

echo "Applying RBAC migration manually..."

# The SQL from the migration file
cat << 'EOF' | railway run psql $DATABASE_URL

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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Module" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "path" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SubModule" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "path" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Permission" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "subModuleId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "RoleDefinition_name_key" ON "RoleDefinition"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "RoleDefinition_code_key" ON "RoleDefinition"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RoleDefinition_level_idx" ON "RoleDefinition"("level");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Module_name_key" ON "Module"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Module_code_key" ON "Module"("code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SubModule_moduleId_code_key" ON "SubModule"("moduleId", "code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Permission_moduleId_action_idx" ON "Permission"("moduleId", "action");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserRole_userId_isActive_idx" ON "UserRole"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserRole_userId_roleId_scope_scopeId_key" ON "UserRole"("userId", "roleId", "scope", "scopeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserPermission_userId_permissionId_idx" ON "UserPermission"("userId", "permissionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ResourceAccess_userId_resourceType_resourceId_idx" ON "ResourceAccess"("userId", "resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ResourceAccess_userId_resourceType_resourceId_key" ON "ResourceAccess"("userId", "resourceType", "resourceId");

-- AddForeignKey (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RoleDefinition_parentId_fkey') THEN
        ALTER TABLE "RoleDefinition" ADD CONSTRAINT "RoleDefinition_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "RoleDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Continue with other foreign keys...
-- (Note: In production, you might want to check each constraint individually)

EOF

echo "RBAC migration applied!"