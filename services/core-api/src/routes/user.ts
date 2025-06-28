import { Hono } from 'hono';
import { prisma } from '../index.js';

const userRoutes = new Hono();

// Get all users
userRoutes.get('/', async (c) => {
  const users = await prisma.user.findMany({
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

export { userRoutes };