import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedRBAC() {
  console.log('Seeding RBAC data...');

  // Create modules
  const modules = await Promise.all([
    prisma.module.create({
      data: {
        name: 'Master Data',
        code: 'MASTER_DATA',
        description: 'Central data management for companies, factories, divisions',
        icon: 'Building2',
        path: '/master-data',
        isActive: true
      }
    }),
    prisma.module.create({
      data: {
        name: 'Financial Management',
        code: 'FINANCE',
        description: 'Financial operations including GL, AP, AR',
        icon: 'DollarSign',
        path: '/finance',
        isActive: true
      }
    }),
    prisma.module.create({
      data: {
        name: 'Supply Chain Management',
        code: 'SUPPLY_CHAIN',
        description: 'Procurement, inventory, and logistics',
        icon: 'Truck',
        path: '/supply-chain',
        isActive: true
      }
    }),
    prisma.module.create({
      data: {
        name: 'Manufacturing',
        code: 'MANUFACTURING',
        description: 'Production planning and execution',
        icon: 'Factory',
        path: '/manufacturing',
        isActive: true
      }
    }),
    prisma.module.create({
      data: {
        name: 'Human Resources',
        code: 'HR',
        description: 'Employee management and payroll',
        icon: 'Users',
        path: '/hr',
        isActive: true
      }
    }),
    prisma.module.create({
      data: {
        name: 'CRM',
        code: 'CRM',
        description: 'Customer relationship management',
        icon: 'UserCheck',
        path: '/crm',
        isActive: true
      }
    })
  ]);

  // Create sub-modules for Master Data
  const masterDataSubModules = await Promise.all([
    prisma.subModule.create({
      data: {
        moduleId: modules[0].id,
        name: 'Companies',
        code: 'COMPANIES',
        path: '/master-data#companies'
      }
    }),
    prisma.subModule.create({
      data: {
        moduleId: modules[0].id,
        name: 'Business Units',
        code: 'BUSINESS_UNITS',
        path: '/master-data#business-units'
      }
    }),
    prisma.subModule.create({
      data: {
        moduleId: modules[0].id,
        name: 'Divisions',
        code: 'DIVISIONS',
        path: '/master-data#divisions'
      }
    }),
    prisma.subModule.create({
      data: {
        moduleId: modules[0].id,
        name: 'Users',
        code: 'USERS',
        path: '/master-data#users'
      }
    })
  ]);

  // Create permissions for each module
  const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'EXPORT'] as const;
  const permissions: any[] = [];

  for (const module of modules) {
    for (const action of actions) {
      permissions.push(
        prisma.permission.create({
          data: {
            moduleId: module.id,
            name: `${action} ${module.name}`,
            code: `${module.code}_${action}`,
            action: action,
            description: `Permission to ${action.toLowerCase()} in ${module.name}`
          }
        })
      );
    }
  }

  // Create permissions for sub-modules
  for (const subModule of masterDataSubModules) {
    for (const action of actions) {
      permissions.push(
        prisma.permission.create({
          data: {
            moduleId: modules[0].id,
            subModuleId: subModule.id,
            name: `${action} ${subModule.name}`,
            code: `${subModule.code}_${action}`,
            action: action,
            description: `Permission to ${action.toLowerCase()} ${subModule.name}`
          }
        })
      );
    }
  }

  const createdPermissions = await Promise.all(permissions);

  // Create role hierarchy
  const mdRole = await prisma.roleDefinition.create({
    data: {
      name: 'Managing Director',
      code: 'MD',
      description: 'Top executive with full system access',
      level: 100
    }
  });

  const ctoRole = await prisma.roleDefinition.create({
    data: {
      name: 'Chief Technical Officer',
      code: 'CTO',
      description: 'Technical leadership with system administration',
      level: 90,
      parentId: mdRole.id
    }
  });

  const cfoRole = await prisma.roleDefinition.create({
    data: {
      name: 'Chief Financial Officer',
      code: 'CFO',
      description: 'Financial operations leadership',
      level: 90,
      parentId: mdRole.id
    }
  });

  const gmRole = await prisma.roleDefinition.create({
    data: {
      name: 'General Manager',
      code: 'GM',
      description: 'Business unit management',
      level: 80,
      parentId: mdRole.id
    }
  });

  const managerRole = await prisma.roleDefinition.create({
    data: {
      name: 'Manager',
      code: 'MANAGER',
      description: 'Department or division management',
      level: 70,
      parentId: gmRole.id
    }
  });

  const supervisorRole = await prisma.roleDefinition.create({
    data: {
      name: 'Supervisor',
      code: 'SUPERVISOR',
      description: 'Team supervision and coordination',
      level: 60,
      parentId: managerRole.id
    }
  });

  const operatorRole = await prisma.roleDefinition.create({
    data: {
      name: 'Operator',
      code: 'OPERATOR',
      description: 'Operational staff with limited access',
      level: 50,
      parentId: supervisorRole.id
    }
  });

  const viewerRole = await prisma.roleDefinition.create({
    data: {
      name: 'Viewer',
      code: 'VIEWER',
      description: 'Read-only access',
      level: 10
    }
  });

  // Assign permissions to roles
  // MD gets all permissions
  const mdPermissions = createdPermissions.map(p => ({
    roleId: mdRole.id,
    permissionId: p.id,
    granted: true
  }));
  await prisma.rolePermission.createMany({ data: mdPermissions });

  // CTO gets all technical permissions
  const ctoPermissions = createdPermissions
    .filter(p => ['MASTER_DATA', 'MANUFACTURING'].includes(p.code.split('_')[0]))
    .map(p => ({
      roleId: ctoRole.id,
      permissionId: p.id,
      granted: true
    }));
  await prisma.rolePermission.createMany({ data: ctoPermissions });

  // CFO gets all financial permissions
  const cfoPermissions = createdPermissions
    .filter(p => ['FINANCE', 'SUPPLY_CHAIN'].includes(p.code.split('_')[0]))
    .map(p => ({
      roleId: cfoRole.id,
      permissionId: p.id,
      granted: true
    }));
  await prisma.rolePermission.createMany({ data: cfoPermissions });

  // GM gets all permissions except DELETE and APPROVE
  const gmPermissions = createdPermissions
    .filter(p => !['DELETE', 'APPROVE'].includes(p.action))
    .map(p => ({
      roleId: gmRole.id,
      permissionId: p.id,
      granted: true
    }));
  await prisma.rolePermission.createMany({ data: gmPermissions });

  // Manager gets CREATE, READ, UPDATE for their modules
  const managerPermissions = createdPermissions
    .filter(p => ['CREATE', 'READ', 'UPDATE', 'EXPORT'].includes(p.action))
    .map(p => ({
      roleId: managerRole.id,
      permissionId: p.id,
      granted: true
    }));
  await prisma.rolePermission.createMany({ data: managerPermissions });

  // Supervisor gets READ and UPDATE
  const supervisorPermissions = createdPermissions
    .filter(p => ['READ', 'UPDATE', 'EXPORT'].includes(p.action))
    .map(p => ({
      roleId: supervisorRole.id,
      permissionId: p.id,
      granted: true
    }));
  await prisma.rolePermission.createMany({ data: supervisorPermissions });

  // Operator gets READ and limited UPDATE
  const operatorPermissions = createdPermissions
    .filter(p => p.action === 'READ' || (p.action === 'UPDATE' && p.code.includes('MANUFACTURING')))
    .map(p => ({
      roleId: operatorRole.id,
      permissionId: p.id,
      granted: true
    }));
  await prisma.rolePermission.createMany({ data: operatorPermissions });

  // Viewer gets only READ
  const viewerPermissions = createdPermissions
    .filter(p => p.action === 'READ')
    .map(p => ({
      roleId: viewerRole.id,
      permissionId: p.id,
      granted: true
    }));
  await prisma.rolePermission.createMany({ data: viewerPermissions });

  console.log('RBAC data seeded successfully!');
}

seedRBAC()
  .catch((e) => {
    console.error('Error seeding RBAC data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });