import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRBAC() {
  console.log('🌱 Seeding RBAC data...');

  try {
    // Create Modules
    const modules = await Promise.all([
      prisma.module.upsert({
        where: { code: 'finance' },
        update: {},
        create: {
          code: 'finance',
          name: 'Financial Management',
          description: 'Financial operations and accounting',
          icon: 'DollarSign',
          path: '/finance',
          isActive: true
        }
      }),
      prisma.module.upsert({
        where: { code: 'supply-chain' },
        update: {},
        create: {
          code: 'supply-chain',
          name: 'Supply Chain Management',
          description: 'Procurement, inventory, and logistics',
          icon: 'Package',
          path: '/supply-chain',
          isActive: true
        }
      }),
      prisma.module.upsert({
        where: { code: 'manufacturing' },
        update: {},
        create: {
          code: 'manufacturing',
          name: 'Manufacturing',
          description: 'Production planning and execution',
          icon: 'Factory',
          path: '/manufacturing',
          isActive: true
        }
      }),
      prisma.module.upsert({
        where: { code: 'hr' },
        update: {},
        create: {
          code: 'hr',
          name: 'Human Resources',
          description: 'Employee management and payroll',
          icon: 'Users',
          path: '/hr',
          isActive: true
        }
      }),
      prisma.module.upsert({
        where: { code: 'master-data' },
        update: {},
        create: {
          code: 'master-data',
          name: 'Master Data',
          description: 'Central data management',
          icon: 'Database',
          path: '/master-data',
          isActive: true
        }
      })
    ]);

    console.log(`✅ Created ${modules.length} modules`);

    // Create SubModules for Supply Chain
    const supplyChainModule = modules.find(m => m.code === 'supply-chain')!;
    const subModules = await Promise.all([
      prisma.subModule.upsert({
        where: { moduleId_code: { moduleId: supplyChainModule.id, code: 'procurement' } },
        update: {},
        create: {
          moduleId: supplyChainModule.id,
          code: 'procurement',
          name: 'Procurement',
          description: 'Purchase requisitions and orders',
          path: '/supply-chain/procurement',
          isActive: true
        }
      }),
      prisma.subModule.upsert({
        where: { moduleId_code: { moduleId: supplyChainModule.id, code: 'inventory' } },
        update: {},
        create: {
          moduleId: supplyChainModule.id,
          code: 'inventory',
          name: 'Inventory',
          description: 'Stock management and tracking',
          path: '/supply-chain/inventory',
          isActive: true
        }
      })
    ]);

    console.log(`✅ Created ${subModules.length} sub-modules`);

    // Create Permissions
    const permissions = await Promise.all([
      // Supply Chain Permissions
      prisma.permission.upsert({
        where: { code: 'supply-chain.procurement.indent.create' },
        update: {},
        create: {
          code: 'supply-chain.procurement.indent.create',
          name: 'Create Material Indent',
          moduleId: supplyChainModule.id,
          subModuleId: subModules[0].id,
          action: 'CREATE',
          description: 'Create new material requisitions'
        }
      }),
      prisma.permission.upsert({
        where: { code: 'supply-chain.procurement.indent.read' },
        update: {},
        create: {
          code: 'supply-chain.procurement.indent.read',
          name: 'View Material Indents',
          moduleId: supplyChainModule.id,
          subModuleId: subModules[0].id,
          action: 'READ',
          description: 'View material requisitions'
        }
      }),
      prisma.permission.upsert({
        where: { code: 'supply-chain.procurement.indent.approve' },
        update: {},
        create: {
          code: 'supply-chain.procurement.indent.approve',
          name: 'Approve Material Indents',
          moduleId: supplyChainModule.id,
          subModuleId: subModules[0].id,
          action: 'APPROVE',
          description: 'Approve or reject material requisitions'
        }
      }),
      // Master Data Permissions
      prisma.permission.upsert({
        where: { code: 'master-data.materials.create' },
        update: {},
        create: {
          code: 'master-data.materials.create',
          name: 'Create Materials',
          moduleId: modules.find(m => m.code === 'master-data')!.id,
          action: 'CREATE',
          description: 'Create new material definitions'
        }
      }),
      prisma.permission.upsert({
        where: { code: 'master-data.materials.read' },
        update: {},
        create: {
          code: 'master-data.materials.read',
          name: 'View Materials',
          moduleId: modules.find(m => m.code === 'master-data')!.id,
          action: 'READ',
          description: 'View material master data'
        }
      })
    ]);

    console.log(`✅ Created ${permissions.length} permissions`);

    // Create Role Definitions
    const roles = await Promise.all([
      prisma.roleDefinition.upsert({
        where: { code: 'super-admin' },
        update: {},
        create: {
          code: 'super-admin',
          name: 'Super Admin',
          description: 'Full system access',
          level: 100,
          isSystem: true
        }
      }),
      prisma.roleDefinition.upsert({
        where: { code: 'admin' },
        update: {},
        create: {
          code: 'admin',
          name: 'Company Admin',
          description: 'Company-level administration',
          level: 90,
          isSystem: true
        }
      }),
      prisma.roleDefinition.upsert({
        where: { code: 'manager' },
        update: {},
        create: {
          code: 'manager',
          name: 'Manager',
          description: 'Department management',
          level: 70,
          isSystem: false
        }
      }),
      prisma.roleDefinition.upsert({
        where: { code: 'operator' },
        update: {},
        create: {
          code: 'operator',
          name: 'Operator',
          description: 'Basic operations',
          level: 30,
          isSystem: false
        }
      }),
      prisma.roleDefinition.upsert({
        where: { code: 'viewer' },
        update: {},
        create: {
          code: 'viewer',
          name: 'Viewer',
          description: 'Read-only access',
          level: 10,
          isSystem: false
        }
      })
    ]);

    console.log(`✅ Created ${roles.length} roles`);

    // Assign permissions to roles
    const adminRole = roles.find(r => r.code === 'admin')!;
    const managerRole = roles.find(r => r.code === 'manager')!;
    const operatorRole = roles.find(r => r.code === 'operator')!;
    const viewerRole = roles.find(r => r.code === 'viewer')!;

    // Admin gets all permissions
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
          granted: true
        }
      });
    }

    // Manager gets approve and read permissions
    const managerPermissions = permissions.filter(p => 
      p.action === 'READ' || p.action === 'APPROVE' || p.action === 'CREATE'
    );
    for (const permission of managerPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: managerRole.id,
          permissionId: permission.id,
          granted: true
        }
      });
    }

    // Operator gets create and read permissions
    const operatorPermissions = permissions.filter(p => 
      p.action === 'READ' || p.action === 'CREATE'
    );
    for (const permission of operatorPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: operatorRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: operatorRole.id,
          permissionId: permission.id,
          granted: true
        }
      });
    }

    // Viewer gets only read permissions
    const viewerPermissions = permissions.filter(p => p.action === 'READ');
    for (const permission of viewerPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: viewerRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: viewerRole.id,
          permissionId: permission.id,
          granted: true
        }
      });
    }

    console.log('✅ Assigned permissions to roles');

    console.log('🎉 RBAC seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding RBAC:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedRBAC().catch(console.error);