// Core API Service - Railway deployment fix v2
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { PrismaClient } from '@prisma/client';
import pino from 'pino';
import { PostgreSQLCache } from './shared/cache/index';
import { errorHandler } from '../../../packages/shared/src/errors/index';

// Routes
import { authRoutes } from './routes/auth';
import { companyRoutes } from './routes/company-paginated';
import { userRoutes } from './routes/user';
import { factoryRoutes } from './routes/factory';
import { divisionRoutes } from './routes/division';
import { factoryAccessRoutes } from './routes/factory-access';
import { rbacRoutes } from './routes/rbac';
import { testCompaniesRoutes } from './routes/test-companies';
import { seedRoutes } from './routes/seed';
import procurement from './routes/procurement/index';
import materials from './routes/materials';
import rbacInitRoutes from './routes/rbac-init';

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

// System database check endpoint
app.get('/api/system/database', async (c) => {
  try {
    const dbInfo = {
      status: 'checking',
      tables: {},
      stats: {}
    };

    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    dbInfo.status = 'connected';

    // Get table counts
    const [userCount, companyCount, factoryCount] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.factory.count()
    ]);

    dbInfo.tables = {
      users: userCount,
      companies: companyCount,
      factories: factoryCount
    };

    dbInfo.stats = {
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
      environment: process.env.NODE_ENV || 'development'
    };

    return c.json(dbInfo);
  } catch (error) {
    log.error('Database system check failed:', error);
    return c.json({
      status: 'error',
      error: error.message,
      message: 'Database connection failed'
    }, 500);
  }
});

// Mount routes
app.route('/api/auth', authRoutes);
app.route('/api/companies', companyRoutes);
app.route('/api/users', userRoutes);
app.route('/api/factories', factoryRoutes);
app.route('/api/divisions', divisionRoutes);
app.route('/api/factory-access', factoryAccessRoutes);
app.route('/api/rbac', rbacRoutes);
app.route('/api/test-companies', testCompaniesRoutes);
app.route('/api/seed', seedRoutes);
app.route('/api/procurement', procurement);
app.route('/api/materials', materials);
app.route('/api/rbac-init', rbacInitRoutes);

// Error handling
app.onError(errorHandler);

// Start server
const port = parseInt(process.env.PORT || '3001');
log.info(`Starting Core API with PORT env: ${process.env.PORT}, parsed as: ${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: '::', // Bind to IPv6 for Railway internal networking
}, (info) => {
  log.info(`Core API running on http://[::]:${info.port}`);
  log.info(`Confirmed: Server is listening on port ${info.port} (IPv6)`);
  
  // Cache is ready immediately with PostgreSQL
  log.info('PostgreSQL cache initialized and ready');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  log.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});