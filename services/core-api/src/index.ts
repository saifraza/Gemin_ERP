// Core API Service - Railway deployment fix v2
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { PrismaClient } from '@prisma/client';
import pino from 'pino';
import { PostgreSQLCache } from './shared/cache/index.js';

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

// Initialize PostgreSQL cache
export const cache = new PostgreSQLCache(prisma);

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

  // Check cache (PostgreSQL)
  try {
    // Test cache by setting and getting a health check key
    const testKey = 'health:check';
    await cache.set(testKey, Date.now(), 60);
    const testValue = await cache.get(testKey);
    if (testValue) {
      health.cache = 'connected';
    } else {
      health.cache = 'error';
    }
  } catch (error) {
    health.cache = 'error';
    log.error('Cache health check failed:', error.message);
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
  
  // Cache is ready immediately with PostgreSQL
  log.info('PostgreSQL cache initialized and ready');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  log.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});