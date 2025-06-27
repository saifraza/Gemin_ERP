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

export { userRoutes };