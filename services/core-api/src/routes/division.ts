import { Hono } from 'hono';
import { prisma } from '../index.js';

const divisionRoutes = new Hono();

// Get all divisions
divisionRoutes.get('/', async (c) => {
  const divisions = await prisma.division.findMany({
    include: {
      factory: true,
      _count: {
        select: {
          departments: true,
          equipment: true,
        },
      },
    },
  });
  
  return c.json(divisions);
});

export { divisionRoutes };