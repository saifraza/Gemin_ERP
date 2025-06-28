import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import pino from 'pino';

// Routes
import { authRoutes } from './routes/auth.js';
import { companyRoutes } from './routes/company.js';
import { userRoutes } from './routes/user.js';
import { factoryRoutes } from './routes/factory.js';
import { divisionRoutes } from './routes/division.js';

const log = pino({ name: 'core-api' });

// Initialize services
export const prisma = new PrismaClient();
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use('*', logger());

// Health check
app.get('/health', async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    
    return c.json({ 
      status: 'healthy',
      service: 'core-api',
      database: 'connected',
      cache: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ 
      status: 'unhealthy',
      error: error.message 
    }, 503);
  }
});

// Mount routes
app.route('/api/auth', authRoutes);
app.route('/api/companies', companyRoutes);
app.route('/api/users', userRoutes);
app.route('/api/factories', factoryRoutes);
app.route('/api/divisions', divisionRoutes);

// Error handling
app.onError((err, c) => {
  log.error(err);
  return c.json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  }, 500);
});

// Start server
const port = parseInt(process.env.PORT || '3001');
serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0', // Important for Railway!
}, (info) => {
  log.info(`Core API running on http://0.0.0.0:${info.port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  log.info('Shutting down gracefully...');
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});