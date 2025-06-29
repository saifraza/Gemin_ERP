import { Context, Next } from 'hono';
import { prisma } from '../index.js';

interface PermissionCheckOptions {
  permission: string;
  scope?: 'GLOBAL' | 'COMPANY' | 'FACTORY' | 'DIVISION' | 'DEPARTMENT';
  scopeIdParam?: string; // Request param name containing scope ID
}

export const requirePermission = (options: PermissionCheckOptions) => {
  return async (c: Context, next: Next) => {
    try {
      const payload = c.get('jwtPayload');
      if (!payload || !payload.id) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const userId = payload.id;
      const scopeId = options.scopeIdParam ? c.req.param(options.scopeIdParam) : undefined;

      // Get user with all active roles and permissions
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: true,
          userRoles: true,
          userPermissions: true
        }
      });

      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }

      // SUPER_ADMIN bypasses all permission checks
      if (user.role === 'SUPER_ADMIN') {
        await next();
        return;
      }

      // For non-SUPER_ADMIN users, check permissions
      const userWithPermissions = await prisma.user.findUnique({
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
                    where: {
                      granted: true
                    },
                    include: {
                      permission: true
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
              permission: true
            }
          }
        }
      });

      // Check if user has required permission
      let hasPermission = false;

      // Check role permissions
      for (const userRole of userWithPermissions.userRoles) {
        // Check scope hierarchy
        if (options.scope && scopeId) {
          // Skip if role scope doesn't match
          if (userRole.scope !== 'GLOBAL' && 
              userRole.scope !== options.scope && 
              userRole.scopeId !== scopeId) {
            continue;
          }
        }

        // Check if role has the permission
        const rolePermission = userRole.role.permissions.find(
          rp => rp.permission.code === options.permission && rp.granted
        );

        if (rolePermission) {
          hasPermission = true;
          break;
        }
      }

      // Check user permission overrides
      const userPermission = userWithPermissions.userPermissions.find(up => {
        if (up.permission.code !== options.permission) return false;
        
        // Check scope
        if (options.scope && scopeId) {
          if (up.scope !== 'GLOBAL' && 
              up.scope !== options.scope && 
              up.scopeId !== scopeId) {
            return false;
          }
        }
        
        return true;
      });

      if (userPermission) {
        hasPermission = userPermission.granted;
      }

      if (!hasPermission) {
        return c.json({ 
          error: 'Insufficient permissions',
          required: options.permission,
          scope: options.scope
        }, 403);
      }

      // Store user permissions in context for use in route handlers
      c.set('userPermissions', {
        userId,
        permissions: [...userWithPermissions.userRoles.flatMap(ur => 
          ur.role.permissions.map(rp => ({
            code: rp.permission.code,
            scope: ur.scope,
            scopeId: ur.scopeId
          }))
        ), ...userWithPermissions.userPermissions.map(up => ({
          code: up.permission.code,
          scope: up.scope,
          scopeId: up.scopeId,
          granted: up.granted
        }))]
      });

      await next();
    } catch (error) {
      console.error('Permission check error:', error);
      return c.json({ error: 'Permission check failed' }, 500);
    }
  };
};

// Convenience middleware for common permissions
export const requireRead = (scope?: PermissionCheckOptions['scope'], scopeIdParam?: string) => 
  requirePermission({ permission: 'COMPANIES_READ', scope, scopeIdParam });

export const requireCreate = (scope?: PermissionCheckOptions['scope'], scopeIdParam?: string) => 
  requirePermission({ permission: 'COMPANIES_CREATE', scope, scopeIdParam });

export const requireUpdate = (scope?: PermissionCheckOptions['scope'], scopeIdParam?: string) => 
  requirePermission({ permission: 'COMPANIES_UPDATE', scope, scopeIdParam });

export const requireDelete = (scope?: PermissionCheckOptions['scope'], scopeIdParam?: string) => 
  requirePermission({ permission: 'COMPANIES_DELETE', scope, scopeIdParam });

export const requireApprove = (scope?: PermissionCheckOptions['scope'], scopeIdParam?: string) => 
  requirePermission({ permission: 'COMPANIES_APPROVE', scope, scopeIdParam });

// Generic permission middleware for any module
export const requireModulePermission = (module: string, action: string, scope?: PermissionCheckOptions['scope'], scopeIdParam?: string) => 
  requirePermission({ permission: `${module}_${action}`, scope, scopeIdParam });