import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { prisma, redis } from '../index.js';

const authRoutes = new Hono();

// Schemas
const loginSchema = z.object({
  email: z.string().email().or(z.string().min(3)), // Allow username too
  password: z.string().min(4),
});

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  name: z.string(),
  companyId: z.string(),
  role: z.enum(['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']),
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
  
  // Cache session
  await redis.setex(`session:${token}`, 86400, JSON.stringify({
    userId: user.id,
    role: user.role,
    companyId: user.companyId,
  }));
  
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
  
  // Check if user exists
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        { username: data.username },
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
      ...data,
      passwordHash,
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
    // Check cache first
    const cached = await redis.get(`session:${token}`);
    if (cached) {
      return JSON.parse(cached);
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
    await redis.setex(`session:${token}`, 3600, JSON.stringify({
      userId: payload.userId,
      role: payload.role,
      companyId: payload.companyId,
    }));
    
    return payload;
  } catch {
    return null;
  }
}

// Logout
authRoutes.post('/logout', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    // Delete session
    await prisma.session.delete({
      where: { token },
    }).catch(() => {}); // Ignore if not found
    
    // Remove from cache
    await redis.del(`session:${token}`);
  }
  
  return c.json({ message: 'Logged out successfully' });
});

export { authRoutes };