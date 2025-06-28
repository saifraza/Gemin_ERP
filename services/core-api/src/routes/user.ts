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
    });
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Delete the user (this will cascade delete related records)
    await prisma.user.delete({
      where: { id },
    });
    
    return c.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return c.json({ error: 'Failed to delete user', details: error.message }, 500);
  }
});

export { userRoutes };