import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../index';
import { jwtVerify } from 'jose';
import { isPrismaError, PrismaErrorCode } from '../types/errors';

const rbacRoutes = new Hono();

// JWT secret
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// Middleware to verify JWT and check permissions
rbacRoutes.use('*', async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided' }, 401);
    }
    
    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, secret);
    
    c.set('jwtPayload', payload);
    
    await next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Get all roles
rbacRoutes.get('/roles', async (c) => {
  try {
    const roles = await prisma.roleDefinition.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            userRoles: true,
            permissions: true
          }
        }
      },
      orderBy: {
        level: 'desc'
      }
    });
    
    return c.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    if (isPrismaError(error) && error.code === PrismaErrorCode.TableNotFound) {
      return c.json({ 
        error: 'RBAC tables not found. Please run /api/rbac-init/init first.',
        needsInit: true 
      }, 503);
    }
    return c.json({ error: 'Failed to fetch roles' }, 500);
  }
});

// Create role schema
const createRoleSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).optional(),
  description: z.string().optional(),
  level: z.number().int().min(0).max(100),
  parentId: z.string().optional(),
});

// Create role
rbacRoutes.post('/roles', zValidator('json', createRoleSchema), async (c) => {
  const data = c.req.valid('json');
  
  try {
    // Generate code from name if not provided
    const code = data.code || data.name.toUpperCase().replace(/\s+/g, '_').substring(0, 20);
    
    const role = await prisma.roleDefinition.create({
      data: {
        ...data,
        code
      },
      include: {
        parent: true
      }
    });
    
    return c.json(role, 201);
  } catch (error) {
    if (isPrismaError(error) && error.code === PrismaErrorCode.UniqueConstraintViolation) {
      return c.json({ error: 'Role name or code already exists' }, 400);
    }
    throw error;
  }
});

// Get all modules
rbacRoutes.get('/modules', async (c) => {
  try {
    const modules = await prisma.module.findMany({
      include: {
        subModules: true,
        permissions: {
          include: {
            subModule: true
          }
        }
      },
      where: {
        isActive: true
      }
    });
    
    return c.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    if (isPrismaError(error) && error.code === PrismaErrorCode.TableNotFound) {
      return c.json({ 
        error: 'RBAC tables not found. Please run /api/rbac-init/init first.',
        needsInit: true 
      }, 503);
    }
    return c.json({ error: 'Failed to fetch modules' }, 500);
  }
});

// Create module schema
const createModuleSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  path: z.string().optional(),
});

// Create module
rbacRoutes.post('/modules', zValidator('json', createModuleSchema), async (c) => {
  const data = c.req.valid('json');
  
  try {
    const module = await prisma.module.create({
      data
    });
    
    return c.json(module, 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return c.json({ error: 'Module code already exists' }, 400);
    }
    throw error;
  }
});

// Get permissions for a module
rbacRoutes.get('/modules/:moduleId/permissions', async (c) => {
  const moduleId = c.req.param('moduleId');
  
  const permissions = await prisma.permission.findMany({
    where: {
      moduleId
    },
    include: {
      subModule: true
    }
  });
  
  return c.json(permissions);
});

// Create permission schema
const createPermissionSchema = z.object({
  moduleId: z.string(),
  subModuleId: z.string().optional(),
  name: z.string().min(1),
  code: z.string().min(1),
  action: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT', 'IMPORT', 'EXECUTE']),
  description: z.string().optional(),
});

// Create permission
rbacRoutes.post('/permissions', zValidator('json', createPermissionSchema), async (c) => {
  const data = c.req.valid('json');
  
  try {
    const permission = await prisma.permission.create({
      data,
      include: {
        module: true,
        subModule: true
      }
    });
    
    return c.json(permission, 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return c.json({ error: 'Permission code already exists' }, 400);
    }
    throw error;
  }
});

// Assign permissions to role
const assignPermissionsSchema = z.object({
  roleId: z.string(),
  permissions: z.array(z.object({
    permissionId: z.string(),
    granted: z.boolean().default(true),
    conditions: z.any().optional()
  }))
});

rbacRoutes.post('/roles/permissions', zValidator('json', assignPermissionsSchema), async (c) => {
  const { roleId, permissions } = c.req.valid('json');
  
  try {
    // Remove existing permissions for this role
    await prisma.rolePermission.deleteMany({
      where: { roleId }
    });
    
    // Add new permissions
    const rolePermissions = await prisma.rolePermission.createMany({
      data: permissions.map(p => ({
        roleId,
        permissionId: p.permissionId,
        granted: p.granted,
        conditions: p.conditions
      }))
    });
    
    return c.json({ message: 'Permissions assigned successfully', count: rolePermissions.count });
  } catch (error) {
    console.error('Error assigning permissions:', error);
    return c.json({ error: 'Failed to assign permissions' }, 500);
  }
});

// Get user roles and permissions
rbacRoutes.get('/users/:userId/permissions', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    // Get user with roles
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          where: {
            isActive: true,
            OR: [
              { validUntil: null },
              { validUntil: { gt: new Date() } }
            ]
          },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: {
                      include: {
                        module: true,
                        subModule: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        userPermissions: {
          where: {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          },
          include: {
            permission: {
              include: {
                module: true,
                subModule: true
              }
            }
          }
        }
      }
    });
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Compile all permissions
    const permissions = new Map();
    
    // Add role permissions
    for (const userRole of user.userRoles) {
      for (const rolePerm of userRole.role.permissions) {
        if (rolePerm.granted) {
          const key = `${rolePerm.permission.code}_${userRole.scope}_${userRole.scopeId || 'all'}`;
          permissions.set(key, {
            ...rolePerm.permission,
            scope: userRole.scope,
            scopeId: userRole.scopeId,
            fromRole: userRole.role.name
          });
        }
      }
    }
    
    // Apply user permission overrides
    for (const userPerm of user.userPermissions) {
      const key = `${userPerm.permission.code}_${userPerm.scope}_${userPerm.scopeId || 'all'}`;
      if (userPerm.granted) {
        permissions.set(key, {
          ...userPerm.permission,
          scope: userPerm.scope,
          scopeId: userPerm.scopeId,
          isOverride: true
        });
      } else {
        permissions.delete(key);
      }
    }
    
    return c.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.userRoles.map(ur => ({
          id: ur.role.id,
          name: ur.role.name,
          level: ur.role.level,
          scope: ur.scope,
          scopeId: ur.scopeId
        }))
      },
      permissions: Array.from(permissions.values())
    });
  } catch (error: any) {
    console.error('Error fetching user permissions:', error);
    if (error.code === 'P2021') {
      return c.json({ 
        error: 'RBAC tables not found. Please run /api/rbac-init/init first.',
        needsInit: true 
      }, 503);
    }
    return c.json({ error: 'Failed to fetch user permissions' }, 500);
  }
});

// Assign role to user
const assignUserRoleSchema = z.object({
  userId: z.string(),
  roleId: z.string(),
  scope: z.enum(['GLOBAL', 'COMPANY', 'FACTORY', 'DIVISION', 'DEPARTMENT']),
  scopeId: z.string().optional(),
  validUntil: z.string().datetime().optional()
});

rbacRoutes.post('/users/roles', zValidator('json', assignUserRoleSchema), async (c) => {
  const data = c.req.valid('json');
  
  try {
    const userRole = await prisma.userRole.create({
      data: {
        ...data,
        validUntil: data.validUntil ? new Date(data.validUntil) : null
      },
      include: {
        user: true,
        role: true
      }
    });
    
    return c.json(userRole, 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return c.json({ error: 'User already has this role at the specified scope' }, 400);
    }
    throw error;
  }
});

// Grant/revoke specific permission for user
const userPermissionSchema = z.object({
  userId: z.string(),
  permissionId: z.string(),
  granted: z.boolean(),
  scope: z.enum(['GLOBAL', 'COMPANY', 'FACTORY', 'DIVISION', 'DEPARTMENT']),
  scopeId: z.string().optional(),
  reason: z.string().optional(),
  expiresAt: z.string().datetime().optional()
});

rbacRoutes.post('/users/permissions', zValidator('json', userPermissionSchema), async (c) => {
  const data = c.req.valid('json');
  const userPayload = c.get('jwtPayload');
  
  try {
    const userPermission = await prisma.userPermission.create({
      data: {
        ...data,
        grantedBy: userPayload.id,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
      },
      include: {
        user: true,
        permission: {
          include: {
            module: true
          }
        }
      }
    });
    
    return c.json(userPermission, 201);
  } catch (error) {
    console.error('Error granting permission:', error);
    return c.json({ error: 'Failed to grant permission' }, 500);
  }
});

// Check if user has permission
rbacRoutes.post('/check-permission', async (c) => {
  const { userId, permissionCode, scope, scopeId } = await c.req.json();
  
  // Get user permissions
  const response = await fetch(`${c.req.url.split('/check-permission')[0]}/users/${userId}/permissions`);
  const data = await response.json();
  
  if (!data.permissions) {
    return c.json({ hasPermission: false });
  }
  
  // Check if user has the permission at the requested scope
  const hasPermission = data.permissions.some((p: any) => {
    if (p.code !== permissionCode) return false;
    
    // Check scope hierarchy
    if (p.scope === 'GLOBAL') return true;
    if (p.scope === scope && (!scopeId || p.scopeId === scopeId)) return true;
    
    // Check if user has permission at a higher scope
    const scopeHierarchy = ['GLOBAL', 'COMPANY', 'FACTORY', 'DIVISION', 'DEPARTMENT'];
    const userScopeIndex = scopeHierarchy.indexOf(p.scope);
    const requestedScopeIndex = scopeHierarchy.indexOf(scope);
    
    return userScopeIndex < requestedScopeIndex;
  });
  
  return c.json({ hasPermission });
});

export { rbacRoutes };