import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { prisma, redis } from '../index.js';

const authRoutes = new Hono();

// Health check for auth routes
authRoutes.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'Auth routes are loaded',
    endpoints: ['/login', '/register', '/test-register', '/verify', '/logout']
  });
});

// Schemas
const loginSchema = z.object({
  email: z.string().email().or(z.string().min(3)), // Allow username too
  password: z.string().min(4),
});

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(8),
  name: z.string(),
  companyId: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']).optional(),
});

// JWT secret
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// Login
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  
  // Find user by email or username
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username: email },
      ],
      isActive: true,
    },
    include: {
      company: true,
    },
  });
  
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }
  
  // Create JWT
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
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
  
  // Cache session if Redis is available
  const redisClient = redis();
  if (redisClient) {
    try {
      await redisClient.setex(`session:${token}`, 86400, JSON.stringify({
        userId: user.id,
        role: user.role,
        companyId: user.companyId,
      }));
    } catch (error) {
      console.error('Failed to cache session:', error);
    }
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
  
  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      company: user.company,
    },
  });
});

// Register
authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
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
      companyId: data.companyId,
    },
    include: {
      company: true,
    },
  });
  
  return c.json({
    message: 'User created successfully',
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
    },
  });
});

// Verify token middleware
export async function verifyToken(token: string) {
  try {
    // Check cache first if Redis is available
    const redisClient = redis();
    if (redisClient) {
      try {
        const cached = await redisClient.get(`session:${token}`);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        console.error('Redis get error:', error);
      }
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
    
    // Cache for future requests if Redis is available
    if (redisClient) {
      try {
        await redisClient.setex(`session:${token}`, 3600, JSON.stringify({
          userId: payload.userId,
          role: payload.role,
          companyId: payload.companyId,
        }));
      } catch (error) {
        console.error('Failed to cache session:', error);
      }
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
    
    // Remove from cache if Redis is available
    const redisClient = redis();
    if (redisClient) {
      try {
        await redisClient.del(`session:${token}`);
      } catch (error) {
        console.error('Failed to delete session from cache:', error);
      }
    }
  }
  
  return c.json({ message: 'Logged out successfully' });
});

// Test endpoint for development
authRoutes.post('/test-register', async (c) => {
  const body = await c.req.json();
  
  try {
    // First, ensure we have a test company
    let testCompany = await prisma.company.findFirst({
      where: { code: 'TEST001' }
    });
    
    if (!testCompany) {
      testCompany = await prisma.company.create({
        data: {
          name: 'Test Company',
          code: 'TEST001',
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          country: 'Test Country',
          phone: '+1234567890',
          email: 'test@company.com',
        }
      });
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