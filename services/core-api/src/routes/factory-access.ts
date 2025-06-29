import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../index';
import { factoryAccessMiddleware, getFactoryContext } from '../middleware/factory-access';

const factoryAccessRoutes = new Hono();

// Apply factory access middleware to all routes
factoryAccessRoutes.use('*', factoryAccessMiddleware);

// Get user's factory access
factoryAccessRoutes.get('/my-access', async (c) => {
  const context = getFactoryContext(c);
  
  const factories = await prisma.factory.findMany({
    where: context.accessLevel === 'HQ' 
      ? { companyId: context.companyId }
      : { id: { in: context.allowedFactories } },
    include: {
      divisions: {
        select: {
          id: true,
          name: true,
          type: true,
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  return c.json({
    accessLevel: context.accessLevel,
    currentFactory: context.currentFactory,
    factories,
  });
});

// Grant factory access (HQ only)
const grantAccessSchema = z.object({
  userId: z.string(),
  factoryId: z.string(),
  role: z.enum(['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']),
});

factoryAccessRoutes.post('/grant', zValidator('json', grantAccessSchema), async (c) => {
  const context = getFactoryContext(c);
  const data = c.req.valid('json');

  // Only HQ admins can grant access
  if (context.accessLevel !== 'HQ' || context.role !== 'ADMIN') {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  // Verify factory belongs to company
  const factory = await prisma.factory.findFirst({
    where: {
      id: data.factoryId,
      companyId: context.companyId,
    },
  });

  if (!factory) {
    return c.json({ error: 'Factory not found' }, 404);
  }

  // Check if access already exists
  const existing = await prisma.factoryAccess.findUnique({
    where: {
      userId_factoryId: {
        userId: data.userId,
        factoryId: data.factoryId,
      },
    },
  });

  if (existing) {
    // Update existing access
    const updated = await prisma.factoryAccess.update({
      where: { id: existing.id },
      data: { role: data.role },
      include: {
        user: true,
        factory: true,
      },
    });
    return c.json({ message: 'Access updated', access: updated });
  }

  // Create new access
  const access = await prisma.factoryAccess.create({
    data: {
      userId: data.userId,
      factoryId: data.factoryId,
      role: data.role,
    },
    include: {
      user: true,
      factory: true,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: context.userId,
      action: 'GRANT_FACTORY_ACCESS',
      entity: 'FACTORY_ACCESS',
      entityId: access.id,
      data: { userId: data.userId, factoryId: data.factoryId, role: data.role },
      factoryId: data.factoryId,
    },
  });

  return c.json({ message: 'Access granted', access });
});

// Revoke factory access (HQ only)
factoryAccessRoutes.delete('/:userId/:factoryId', async (c) => {
  const context = getFactoryContext(c);
  const { userId, factoryId } = c.req.param();

  // Only HQ admins can revoke access
  if (context.accessLevel !== 'HQ' || context.role !== 'ADMIN') {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  // Verify factory belongs to company
  const factory = await prisma.factory.findFirst({
    where: {
      id: factoryId,
      companyId: context.companyId,
    },
  });

  if (!factory) {
    return c.json({ error: 'Factory not found' }, 404);
  }

  // Delete access
  await prisma.factoryAccess.delete({
    where: {
      userId_factoryId: {
        userId,
        factoryId,
      },
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: context.userId,
      action: 'REVOKE_FACTORY_ACCESS',
      entity: 'FACTORY_ACCESS',
      data: { userId, factoryId },
      factoryId,
    },
  });

  return c.json({ message: 'Access revoked' });
});

// List users with factory access
factoryAccessRoutes.get('/factory/:factoryId/users', async (c) => {
  const context = getFactoryContext(c);
  const { factoryId } = c.req.param();

  // Check if user can access this factory
  if (context.accessLevel !== 'HQ' && !context.allowedFactories.includes(factoryId)) {
    return c.json({ error: 'Access denied' }, 403);
  }

  const users = await prisma.factoryAccess.findMany({
    where: { factoryId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
        },
      },
    },
    orderBy: { user: { name: 'asc' } },
  });

  return c.json(users);
});

export { factoryAccessRoutes };