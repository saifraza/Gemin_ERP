import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { prisma, cache } from '../index';
import { PostgreSQLSessionStore } from '../shared/cache/index';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../shared/errors/index';

const authRoutes = new Hono();

// Health check for auth routes
authRoutes.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'Auth routes are loaded',
    endpoints: ['/login', '/register', '/test-register', '/verify', '/logout'],
    cache: 'PostgreSQL'
  });
});

// Schemas
const loginSchema = z.object({
  username: z.string().min(3), // Use username for login
  password: z.string().min(4),
});

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(8),
  name: z.string(),
  companyId: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']).optional(),
  accessLevel: z.enum(['HQ', 'FACTORY', 'DIVISION']).optional(),
  factoryIds: z.array(z.string()).optional(), // For factory-level users
});

// JWT secret
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// Login
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { username, password } = c.req.valid('json');
  
  // Find user by username with factory access
  const user = await prisma.user.findFirst({
    where: {
      username,
      isActive: true,
    },
    include: {
      company: true,
      factoryAccess: {
        include: {
          factory: true
        }
      }
    },
  });
  
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    throw new UnauthorizedError('Invalid credentials');
  }
  
  // Create JWT with access level
  const token = await new SignJWT({
    id: user.id, // Changed from userId to id
    userId: user.id, // Keep for backward compatibility
    email: user.email,
    role: user.role,
    companyId: user.companyId,
    accessLevel: user.accessLevel,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
  
  // Create session
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });
  
  // Cache session using PostgreSQL
  const sessionStore = new PostgreSQLSessionStore(cache);
  try {
    await sessionStore.set(token, {
      userId: user.id,
      role: user.role,
      companyId: user.companyId,
    }, 86400); // 24 hours
  } catch (error) {
    console.error('Failed to cache session:', error);
  }
  
  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: 'LOGIN',
      entity: 'USER',
      entityId: user.id,
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
    },
  });
  
  // Get allowed factories
  let allowedFactories = [];
  if (user.accessLevel === 'HQ') {
    // HQ users can access all factories in their company
    const allFactories = await prisma.factory.findMany({
      where: { companyId: user.companyId },
      select: { id: true, name: true, code: true }
    });
    allowedFactories = allFactories;
  } else {
    // Factory users can only access assigned factories
    allowedFactories = user.factoryAccess.map(fa => ({
      id: fa.factory.id,
      name: fa.factory.name,
      code: fa.factory.code
    }));
  }

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      accessLevel: user.accessLevel,
      company: user.company,
      allowedFactories,
    },
  });
});

// Register
authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    
    // Generate username from email if not provided
    const username = data.username || data.email.split('@')[0];
    
    // Check if user exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username },
        ],
      },
    });
    
    if (existing) {
      return c.json({ error: 'User already exists' }, 400);
    }
    
    // If no companyId provided, check if there's a default company
    let companyId = data.companyId;
    if (!companyId) {
      // Try to find a default company or create one
      const defaultCompany = await prisma.company.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      
      if (!defaultCompany) {
        // Create a default company if none exists
        const newCompany = await prisma.company.create({
          data: {
            name: 'Default Company',
            code: 'DEFAULT',
            address: {
              street: '123 Main St',
              city: 'City',
              state: 'State',
              country: 'Country',
              postalCode: '12345',
            },
            phone: '+1234567890',
            email: 'info@company.com',
          },
        });
        companyId = newCompany.id;
      } else {
        companyId = defaultCompany.id;
      }
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username,
        name: data.name,
        passwordHash,
        role: data.role || 'VIEWER',
        accessLevel: data.accessLevel || 'FACTORY',
        companyId,
      },
      include: {
        company: true,
      },
    });
    
    // If factory IDs provided and user is not HQ, create factory access
    if (data.factoryIds && data.factoryIds.length > 0 && data.accessLevel !== 'HQ') {
      await prisma.factoryAccess.createMany({
        data: data.factoryIds.map(factoryId => ({
          userId: user.id,
          factoryId,
          role: user.role,
        })),
      });
    }
    
    return c.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        company: user.company,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return c.json({ 
      error: 'Registration failed', 
      details: error.message 
    }, 500);
  }
});

// Verify token middleware
export async function verifyToken(token: string) {
  try {
    // Check cache first
    const sessionStore = new PostgreSQLSessionStore(cache);
    try {
      const cached = await sessionStore.get(token);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.error('Cache get error:', error);
    }
    
    // Verify JWT
    const { payload } = await jwtVerify(token, secret);
    
    // Check database
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    
    if (!session || session.expiresAt < new Date()) {
      return null;
    }
    
    // Cache for future requests
    try {
      await sessionStore.set(token, {
        userId: payload.userId,
        role: payload.role,
        companyId: payload.companyId,
      }, 3600);
    } catch (error) {
      console.error('Failed to cache session:', error);
    }
    
    return payload;
  } catch {
    return null;
  }
}

// Verify token endpoint
authRoutes.get('/verify', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ valid: false, error: 'No token provided' }, 401);
  }
  
  const payload = await verifyToken(token);
  
  if (!payload) {
    return c.json({ valid: false, error: 'Invalid token' }, 401);
  }
  
  return c.json({ valid: true, payload });
});

// Logout
authRoutes.post('/logout', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    // Delete session
    await prisma.session.delete({
      where: { token },
    }).catch(() => {}); // Ignore if not found
    
    // Remove from cache
    const sessionStore = new PostgreSQLSessionStore(cache);
    try {
      await sessionStore.destroy(token);
    } catch (error) {
      console.error('Failed to delete session from cache:', error);
    }
  }
  
  return c.json({ message: 'Logged out successfully' });
});

// Test endpoint for development (v2 - fixed address field)
authRoutes.post('/test-register', async (c) => {
  const body = await c.req.json();
  
  try {
    console.log('Test register endpoint v2 - using JSON address field');
    
    // First, ensure we have a test company
    let testCompany = await prisma.company.findFirst({
      where: { code: 'TEST001' }
    });
    
    if (!testCompany) {
      console.log('Creating test company with JSON address...');
      testCompany = await prisma.company.create({
        data: {
          name: 'Test Company',
          code: 'TEST001',
          address: {
            street: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            country: 'Test Country',
            postalCode: '12345'
          },
          phone: '+1234567890',
          email: 'test@company.com',
        }
      });
      console.log('Test company created successfully');
    }
    
    const username = body.username || body.email.split('@')[0];
    const passwordHash = await bcrypt.hash(body.password, 10);
    
    // Create user with test company
    const user = await prisma.user.create({
      data: {
        email: body.email,
        username,
        name: body.name,
        passwordHash,
        role: 'VIEWER',
        companyId: testCompany.id,
      },
    });
    
    return c.json({
      message: 'Test user created successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
    });
  } catch (error: any) {
    console.error('Test register error:', error);
    return c.json({ error: error.message || 'Registration failed' }, 500);
  }
});

export { authRoutes };