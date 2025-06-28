// Core API Service - Railway deployment fix v2
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

// Initialize Redis with lazy connection
let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      log.error('REDIS_URL environment variable is not set');
      throw new Error('REDIS_URL is required');
    }
    log.info(`Connecting to Redis at: ${redisUrl.replace(/:[^:@]*@/, ':****@')}`);
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        log.warn(`Redis connection attempt ${times}`);
        return Math.min(times * 50, 2000);
      },
      lazyConnect: true
    });
    redis.on('error', (err) => log.error('Redis error:', err));
    redis.on('connect', () => log.info('Redis connected successfully'));
  }
  return redis;
}

export { getRedis as redis };

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use('*', logger());

// Root endpoint
app.get('/', (c) => {
  return c.json({ 
    message: 'Core API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', async (c) => {
  const health = {
    status: 'healthy',
    service: 'core-api',
    timestamp: new Date().toISOString(),
    database: 'unknown',
    cache: 'unknown',
    environment: {
      hasRedisUrl: !!process.env.REDIS_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      port: process.env.PORT,
      nodeEnv: process.env.NODE_ENV
    }
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'connected';
  } catch (error) {
    health.database = 'error';
    health.status = 'degraded';
    log.error('Database health check failed:', error);
  }

  // Check Redis
  try {
    const redisInstance = redis();
    if (redisInstance.status === 'ready') {
      await redisInstance.ping();
      health.cache = 'connected';
    } else if (redisInstance.status === 'connect' || redisInstance.status === 'connecting') {
      health.cache = 'connecting';
      // Don't mark as degraded while connecting
    } else {
      health.cache = redisInstance.status;
      health.status = 'degraded';
    }
  } catch (error) {
    health.cache = 'error';
    health.status = 'degraded';
    log.error('Redis health check failed:', error);
  }

  // Return appropriate status code
  const statusCode = health.status === 'healthy' ? 200 : 503;
  return c.json(health, statusCode);
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
  if (redis) {
    const redisInstance = redis();
    redisInstance.disconnect();
  }
  process.exit(0);
});