import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
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

// Create factory schema
const createFactorySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  type: z.enum(['INTEGRATED', 'SUGAR_ONLY', 'DISTILLERY', 'COGEN']),
  companyId: z.string(),
  location: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
  }),
  crushingCapacity: z.number().positive(),
  isActive: z.boolean().optional(),
});

// Get factory by ID
factoryRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  
  const factory = await prisma.factory.findUnique({
    where: { id },
    include: {
      company: true,
      divisions: true,
      equipment: true,
    },
  });
  
  if (!factory) {
    return c.json({ error: 'Factory not found' }, 404);
  }
  
  return c.json(factory);
});

// Create factory
factoryRoutes.post('/', zValidator('json', createFactorySchema), async (c) => {
  const data = c.req.valid('json');
  
  try {
    const factory = await prisma.factory.create({
      data,
      include: {
        company: true,
      },
    });
    
    return c.json(factory, 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return c.json({ error: 'Factory with this code already exists' }, 400);
    }
    if (error.code === 'P2003') {
      return c.json({ error: 'Company not found' }, 400);
    }
    throw error;
  }
});

// Update factory
factoryRoutes.put('/:id', zValidator('json', createFactorySchema.partial()), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  
  try {
    const factory = await prisma.factory.update({
      where: { id },
      data,
      include: {
        company: true,
      },
    });
    
    return c.json(factory);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return c.json({ error: 'Factory not found' }, 404);
    }
    throw error;
  }
});

// Delete factory
factoryRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    await prisma.factory.delete({
      where: { id },
    });
    
    return c.json({ message: 'Factory deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return c.json({ error: 'Factory not found' }, 404);
    }
    throw error;
  }
});

export { factoryRoutes };