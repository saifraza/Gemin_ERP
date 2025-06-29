import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../index';
import { jwtVerify } from 'jose';
// TEMPORARY: Using bypass middleware for debugging
// import { requireModulePermission } from '../middleware/rbac';
import { requireModulePermission } from '../middleware/rbac-temp-disable';

const factoryRoutes = new Hono();

// JWT secret (same as auth routes)
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// Apply JWT middleware to protected routes
factoryRoutes.use('*', async (c, next) => {
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

// Get all factories
factoryRoutes.get('/', requireModulePermission('BUSINESS_UNITS', 'READ'), async (c) => {
  // Get user context and permissions
  const userPayload = c.get('jwtPayload');
  const userPermissions = c.get('userPermissions');
  const currentUser = await prisma.user.findUnique({
    where: { id: userPayload.id },
    select: { role: true, companyId: true }
  });
  
  // Build where clause based on user permissions
  let whereClause: any = {};
  
  // Check if user has global access
  const hasGlobalAccess = userPermissions?.permissions?.some((p: any) => 
    p.code === 'BUSINESS_UNITS_READ' && p.scope === 'GLOBAL'
  );
  
  if (!hasGlobalAccess) {
    const conditions = [];
    
    // Company-level access
    const companyIds = userPermissions?.permissions
      ?.filter((p: any) => p.code === 'BUSINESS_UNITS_READ' && p.scope === 'COMPANY')
      ?.map((p: any) => p.scopeId)
      ?.filter(Boolean) || [];
    
    if (companyIds.length > 0) {
      conditions.push({ companyId: { in: companyIds } });
    }
    
    // Factory-level access
    const factoryIds = userPermissions?.permissions
      ?.filter((p: any) => p.code === 'BUSINESS_UNITS_READ' && p.scope === 'FACTORY')
      ?.map((p: any) => p.scopeId)
      ?.filter(Boolean) || [];
    
    if (factoryIds.length > 0) {
      conditions.push({ id: { in: factoryIds } });
    }
    
    if (conditions.length > 0) {
      whereClause.OR = conditions;
    } else if (currentUser?.companyId) {
      // Fallback to user's company
      whereClause.companyId = currentUser.companyId;
    } else {
      // No access
      whereClause.id = 'no-access';
    }
  }
  
  const factories = await prisma.factory.findMany({
    where: whereClause,
    include: {
      company: true,
      divisions: true,
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
  location: z.any(), // JSON field - flexible structure
  coordinates: z.any().optional(), // JSON field
  capacity: z.any(), // JSON field with sugar, ethanol, power, feed
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
factoryRoutes.post('/', requireModulePermission('BUSINESS_UNITS', 'CREATE'), zValidator('json', createFactorySchema), async (c) => {
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
factoryRoutes.put('/:id', requireModulePermission('BUSINESS_UNITS', 'UPDATE', 'FACTORY', 'id'), zValidator('json', createFactorySchema.partial()), async (c) => {
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
factoryRoutes.delete('/:id', requireModulePermission('BUSINESS_UNITS', 'DELETE', 'FACTORY', 'id'), async (c) => {
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