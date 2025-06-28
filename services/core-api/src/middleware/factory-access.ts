import { Context, Next } from 'hono';
import { prisma } from '../index.js';
import { verifyToken } from '../routes/auth.js';

export interface FactoryContext {
  userId: string;
  companyId: string;
  accessLevel: 'HQ' | 'FACTORY' | 'DIVISION';
  currentFactory: string | 'all';
  allowedFactories: string[];
  role: string;
}

export async function factoryAccessMiddleware(c: Context, next: Next) {
  try {
    // Get token from header
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Verify token
    const payload = await verifyToken(token);
    if (!payload) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Get user with factory access
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: {
        company: true,
        factoryAccess: {
          include: { factory: true }
        }
      }
    });

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Build factory context
    const context: FactoryContext = {
      userId: user.id,
      companyId: user.companyId,
      accessLevel: user.accessLevel,
      currentFactory: 'all',
      allowedFactories: [],
      role: user.role
    };

    // Get current factory from header or query
    const requestedFactory = c.req.header('X-Factory-Id') || 
                           c.req.query('factoryId') || 
                           'all';

    if (user.accessLevel === 'HQ') {
      // HQ users can access all factories in their company
      const allFactories = await prisma.factory.findMany({
        where: { companyId: user.companyId },
        select: { id: true }
      });
      
      context.allowedFactories = allFactories.map(f => f.id);
      context.currentFactory = requestedFactory;
    } else {
      // Factory/Division users can only access assigned factories
      context.allowedFactories = user.factoryAccess.map(fa => fa.factoryId);
      
      // Validate requested factory
      if (requestedFactory !== 'all' && !context.allowedFactories.includes(requestedFactory)) {
        return c.json({ error: 'Access denied to this factory' }, 403);
      }
      
      // For factory users, if they request 'all', use their first assigned factory
      context.currentFactory = requestedFactory === 'all' && context.allowedFactories.length > 0
        ? context.allowedFactories[0]
        : requestedFactory;
    }

    // Set context on request
    c.set('factoryContext', context);
    
    await next();
  } catch (error) {
    console.error('Factory access middleware error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Helper to get factory context from request
export function getFactoryContext(c: Context): FactoryContext {
  return c.get('factoryContext');
}

// Helper to filter query by factory access
export function filterByFactoryAccess<T>(
  query: T,
  context: FactoryContext,
  factoryField: string = 'factoryId'
): T {
  if (context.accessLevel === 'HQ' && context.currentFactory === 'all') {
    // HQ viewing all factories - no filter needed
    return query;
  }
  
  // Filter by current factory or allowed factories
  const factories = context.currentFactory === 'all' 
    ? context.allowedFactories 
    : [context.currentFactory];
  
  return {
    ...query,
    where: {
      ...(query as any).where,
      [factoryField]: { in: factories }
    }
  };
}