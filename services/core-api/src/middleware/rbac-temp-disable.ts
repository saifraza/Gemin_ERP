import { Context, Next } from 'hono';

// Temporary middleware that bypasses RBAC for debugging
export const temporaryBypassRBAC = () => {
  return async (c: Context, next: Next) => {
    console.log('[RBAC] Temporarily bypassed for debugging');
    await next();
  };
};

// Export convenience methods that match the RBAC middleware interface
export const requireRead = temporaryBypassRBAC;
export const requireCreate = temporaryBypassRBAC;
export const requireUpdate = temporaryBypassRBAC;
export const requireDelete = temporaryBypassRBAC;
export const requireApprove = temporaryBypassRBAC;
export const requireModulePermission = () => temporaryBypassRBAC();