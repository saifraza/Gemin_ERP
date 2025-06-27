import { Hono } from 'hono';
import { prisma } from '../index.js';

const factoryRoutes = new Hono();

// Get all factories
factoryRoutes.get('/', async (c) => {
  const factories = await prisma.factory.findMany({
    include: {
      company: true,
      _count: {
        select: {
          divisions: true,
          equipment: true,
        },
      },
    },
  });
  
  return c.json(factories);
});

export { factoryRoutes };