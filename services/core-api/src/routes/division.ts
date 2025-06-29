import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../index.js';
import { jwtVerify } from 'jose';
import { requireModulePermission } from '../middleware/rbac.js';

const divisionRoutes = new Hono();

// JWT secret (same as auth routes)
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// Apply JWT middleware to protected routes
divisionRoutes.use('*', async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided' }, 401);
    }
    
    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, secret);
    
    // Set the payload for use in routes
    c.set('jwtPayload', payload);
    
    await next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Get all divisions
divisionRoutes.get('/', requireModulePermission('DIVISIONS', 'READ'), async (c) => {
  const factoryId = c.req.query('factoryId');
  
  const whereClause = factoryId ? { factoryId } : {};
  
  const divisions = await prisma.division.findMany({
    where: whereClause,
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
  isActive: z.boolean().optional().default(true),
});

// Get division by ID
divisionRoutes.get('/:id', requireModulePermission('DIVISIONS', 'READ', 'DIVISION', 'id'), async (c) => {
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
divisionRoutes.post('/', requireModulePermission('DIVISIONS', 'CREATE'), zValidator('json', createDivisionSchema), async (c) => {
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
divisionRoutes.put('/:id', requireModulePermission('DIVISIONS', 'UPDATE', 'DIVISION', 'id'), zValidator('json', createDivisionSchema.partial()), async (c) => {
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
divisionRoutes.delete('/:id', requireModulePermission('DIVISIONS', 'DELETE', 'DIVISION', 'id'), async (c) => {
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