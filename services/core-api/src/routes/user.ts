import { Hono } from 'hono';
import { prisma } from '../index.js';

const userRoutes = new Hono();

// Get all users
userRoutes.get('/', async (c) => {
  // Get user context from JWT
  const userPayload = c.get('jwtPayload');
  const currentUser = await prisma.user.findUnique({
    where: { id: userPayload.id },
    select: { role: true, companyId: true }
  });
  
  // Super admins can see all users
  // Regular users can only see users from their company
  const whereClause = currentUser?.role === 'SUPER_ADMIN' 
    ? {} 
    : { companyId: currentUser?.companyId };
  
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
  
  return c.json(users);
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
      select: { role: true }
    });
    
    // Only SUPER_ADMIN can promote others to SUPER_ADMIN
    if (role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
      return c.json({ error: 'Only super admins can create other super admins' }, 403);
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

export { userRoutes };