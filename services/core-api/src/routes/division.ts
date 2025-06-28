import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
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

// Create division schema
const createDivisionSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  type: z.enum(['SUGAR', 'ETHANOL', 'POWER', 'FEED', 'COMMON']),
  factoryId: z.string(),
  description: z.string().optional(),
});

// Get division by ID
divisionRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  
  const division = await prisma.division.findUnique({
    where: { id },
    include: {
      factory: true,
      departments: true,
      equipment: true,
    },
  });
  
  if (!division) {
    return c.json({ error: 'Division not found' }, 404);
  }
  
  return c.json(division);
});

// Create division
divisionRoutes.post('/', zValidator('json', createDivisionSchema), async (c) => {
  const data = c.req.valid('json');
  
  try {
    const division = await prisma.division.create({
      data,
      include: {
        factory: true,
      },
    });
    
    return c.json(division, 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return c.json({ error: 'Division with this code already exists' }, 400);
    }
    if (error.code === 'P2003') {
      return c.json({ error: 'Factory not found' }, 400);
    }
    throw error;
  }
});

// Update division
divisionRoutes.put('/:id', zValidator('json', createDivisionSchema.partial()), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  
  try {
    const division = await prisma.division.update({
      where: { id },
      data,
      include: {
        factory: true,
      },
    });
    
    return c.json(division);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return c.json({ error: 'Division not found' }, 404);
    }
    throw error;
  }
});

// Delete division
divisionRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    await prisma.division.delete({
      where: { id },
    });
    
    return c.json({ message: 'Division deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return c.json({ error: 'Division not found' }, 404);
    }
    throw error;
  }
});

export { divisionRoutes };