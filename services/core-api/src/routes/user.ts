import { Hono } from 'hono';
import { prisma } from '../index.js';
import { jwtVerify } from 'jose';

const userRoutes = new Hono();

// JWT secret (same as auth routes)
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// Health check endpoint (no auth required)
userRoutes.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    service: 'user-routes',
    timestamp: new Date().toISOString()
  });
});

// Custom JWT middleware for jose
userRoutes.use('*', async (c, next) => {
  // Skip auth for health check
  if (c.req.path.endsWith('/health')) {
    return await next();
  }
  
  try {
    const authHeader = c.req.header('Authorization');
    console.log('Auth header:', authHeader ? 'present' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided', path: c.req.path }, 401);
    }
    
    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, secret);
    
    console.log('JWT verified for user:', payload.id);
    
    // Set the payload for use in routes
    c.set('jwtPayload', payload);
    
    await next();
  } catch (error: any) {
    console.error('JWT verification error:', error.message);
    return c.json({ 
      error: 'Invalid token', 
      details: error.message,
      type: error.name 
    }, 401);
  }
});

// Get all users
userRoutes.get('/', async (c) => {
  try {
    // Get user context from JWT
    const userPayload = c.get('jwtPayload');
    const currentUser = await prisma.user.findUnique({
      where: { id: userPayload.id },
      select: { id: true, role: true, companyId: true }
    });
    
    if (!currentUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Super admins can see all users
    // Regular users can see users from their company
    const whereClause = currentUser.role === 'SUPER_ADMIN' 
      ? {} 
      : { companyId: currentUser.companyId };
    
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        accessLevel: true,
        isActive: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    // If no users found but user is not SUPER_ADMIN, at least return the current user
    if (users.length === 0 && currentUser.role !== 'SUPER_ADMIN') {
      const self = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          accessLevel: true,
          isActive: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      if (self) {
        return c.json([self]);
      }
    }
    
    return c.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Delete a user
userRoutes.delete('/:id', async (c) => {
  try {
    const { id } = c.req.param();
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        factoryAccess: true,
        _count: {
          select: {
            sessions: true,
          }
        }
      }
    });
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Delete related records first to avoid foreign key constraints
    // Delete factory access
    if (user.factoryAccess.length > 0) {
      await prisma.factoryAccess.deleteMany({
        where: { userId: id }
      });
    }
    
    // Delete sessions
    if (user._count.sessions > 0) {
      await prisma.session.deleteMany({
        where: { userId: id }
      });
    }
    
    // Now delete the user
    await prisma.user.delete({
      where: { id },
    });
    
    return c.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    
    // Check for specific error types
    if (error.code === 'P2003') {
      return c.json({ 
        error: 'Cannot delete user due to existing relationships', 
        details: 'This user has related data that must be deleted first'
      }, 400);
    }
    
    return c.json({ 
      error: 'Failed to delete user', 
      details: error.message,
      code: error.code 
    }, 500);
  }
});

// Update user role (for promoting to SUPER_ADMIN)
userRoutes.put('/:id/role', async (c) => {
  try {
    const { id } = c.req.param();
    const { role } = await c.req.json();
    
    // Get current user
    const userPayload = c.get('jwtPayload');
    const currentUser = await prisma.user.findUnique({
      where: { id: userPayload.id },
      select: { id: true, role: true }
    });
    
    // Check if there are any SUPER_ADMINs in the system
    const superAdminCount = await prisma.user.count({
      where: { role: 'SUPER_ADMIN' }
    });
    
    // Allow self-promotion to SUPER_ADMIN if:
    // 1. No SUPER_ADMINs exist in the system
    // 2. User is promoting themselves
    // 3. User is already an ADMIN
    if (role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
      if (superAdminCount === 0 && id === currentUser.id && currentUser.role === 'ADMIN') {
        // Allow first SUPER_ADMIN creation
        console.log('Allowing first SUPER_ADMIN creation for user:', currentUser.id);
      } else {
        return c.json({ error: 'Only super admins can create other super admins' }, 403);
      }
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        role: true,
      }
    });
    
    return c.json({ success: true, user });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return c.json({ error: 'Failed to update user role', details: error.message }, 500);
  }
});

// Update user's company
userRoutes.put('/:id/company', async (c) => {
  try {
    const { id } = c.req.param();
    const { companyId } = await c.req.json();
    
    // Get current user
    const userPayload = c.get('jwtPayload');
    const currentUser = await prisma.user.findUnique({
      where: { id: userPayload.id },
      select: { role: true }
    });
    
    // Only SUPER_ADMIN can change companies
    if (currentUser?.role !== 'SUPER_ADMIN') {
      return c.json({ error: 'Only super admins can change user companies' }, 403);
    }
    
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });
    
    if (!company) {
      return c.json({ error: 'Company not found' }, 404);
    }
    
    // Update user's company
    const user = await prisma.user.update({
      where: { id },
      data: { companyId },
      select: {
        id: true,
        name: true,
        companyId: true,
        company: {
          select: {
            name: true
          }
        }
      }
    });
    
    return c.json({ success: true, user });
  } catch (error: any) {
    console.error('Error updating user company:', error);
    return c.json({ error: 'Failed to update user company', details: error.message }, 500);
  }
});

export { userRoutes };