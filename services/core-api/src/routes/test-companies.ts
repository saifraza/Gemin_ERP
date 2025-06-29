import { Hono } from 'hono';
import { prisma } from '../index';

const testCompaniesRoutes = new Hono();

// Simple test route to check companies without any middleware
testCompaniesRoutes.get('/count', async (c) => {
  try {
    const count = await prisma.company.count();
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        email: true,
      }
    });
    
    return c.json({
      count,
      companies,
      message: `Found ${count} companies in the database`
    });
  } catch (error) {
    console.error('Error checking companies:', error);
    return c.json({ 
      error: 'Failed to check companies',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Test route to check the user context
testCompaniesRoutes.get('/context', async (c) => {
  try {
    // Get token from header
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return c.json({ error: 'No token provided' }, 401);
    }

    // Import verifyToken
    const { verifyToken } = await import('./auth.js');
    const payload = await verifyToken(token);
    
    if (!payload) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: {
        company: true,
        factoryAccess: true
      }
    });

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        accessLevel: user.accessLevel,
        companyId: user.companyId,
        companyName: user.company.name,
        factoryAccessCount: user.factoryAccess.length
      },
      message: `User ${user.email} has role ${user.role} and access level ${user.accessLevel}`
    });
  } catch (error) {
    console.error('Error checking user context:', error);
    return c.json({ 
      error: 'Failed to check user context',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { testCompaniesRoutes };