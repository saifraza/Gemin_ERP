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
import { testRoutes } from './routes/test.js';
import { cacheTestRoutes } from './routes/cache-test.js';

const log = pino({ name: 'core-api' });

// Initialize services
export const prisma = new PrismaClient();

// Initialize Redis with proper error handling
let redisInstance: Redis | null = null;
let redisConnecting = false;

async function connectRedis(): Promise<Redis | null> {
  if (redisInstance && redisInstance.status === 'ready') {
    return redisInstance;
  }

  if (redisConnecting) {
    return null; // Already trying to connect
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    log.warn('REDIS_URL environment variable is not set - running without Redis');
    return null;
  }

  redisConnecting = true;
  
  try {
    log.info(`Attempting to connect to Redis...`);
    redisInstance = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        if (times > 10) {
          log.error('Redis connection failed after 10 attempts');
          return null;
        }
        const delay = Math.min(times * 50, 2000);
        log.warn(`Redis connection attempt ${times} - retrying in ${delay}ms`);
        return delay;
      },
      reconnectOnError: (err) => {
        log.error('Redis reconnect error:', err.message);
        return false;
      }
    });

    redisInstance.on('error', (err) => {
      log.error('Redis error:', err.message);
    });

    redisInstance.on('connect', () => {
      log.info('Redis connected successfully');
    });

    redisInstance.on('ready', () => {
      log.info('Redis is ready to accept commands');
      redisConnecting = false;
    });

    redisInstance.on('close', () => {
      log.warn('Redis connection closed');
      redisConnecting = false;
    });

    // Wait for connection with timeout
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Redis connection timeout'));
      }, 5000);
      
      redisInstance.once('ready', () => {
        clearTimeout(timeout);
        resolve(redisInstance);
      });
      
      redisInstance.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    return redisInstance;
  } catch (error) {
    log.error('Failed to connect to Redis:', error.message);
    redisConnecting = false;
    if (redisInstance) {
      redisInstance.disconnect();
      redisInstance = null;
    }
    return null;
  }
}

// Export a function that returns Redis instance
export const redis = () => redisInstance;

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
    const redisInst = redis();
    if (!redisInst) {
      health.cache = 'not_initialized';
      // Don't fail health check if Redis isn't initialized
    } else if (redisInst.status === 'ready') {
      await redisInst.ping();
      health.cache = 'connected';
    } else if (redisInst.status === 'connect' || redisInst.status === 'connecting') {
      health.cache = 'connecting';
    } else {
      health.cache = redisInst.status;
    }
  } catch (error) {
    health.cache = 'error';
    log.error('Redis health check failed:', error.message);
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
app.route('/api/test', testRoutes);
app.route('/api/cache-test', cacheTestRoutes);

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
log.info(`Starting Core API with PORT env: ${process.env.PORT}, parsed as: ${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0', // Important for Railway!
}, (info) => {
  log.info(`Core API running on http://0.0.0.0:${info.port}`);
  log.info(`Confirmed: Server is listening on port ${info.port}`);
  
  // Try to connect to Redis after server starts
  setTimeout(async () => {
    log.info('Attempting to connect to Redis...');
    const redisConnection = await connectRedis();
    if (redisConnection) {
      log.info('Redis connection established');
    } else {
      log.warn('Running without Redis - some features may be limited');
    }
  }, 1000);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  log.info('Shutting down gracefully...');
  await prisma.$disconnect();
  const redisInst = redis();
  if (redisInst) {
    redisInst.disconnect();
  }
  process.exit(0);
});