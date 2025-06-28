import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import pino from 'pino';

const log = pino({ name: 'core-api' });
const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Basic health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    service: 'core-api',
    timestamp: new Date().toISOString(),
    port: process.env.PORT,
    env: {
      hasRedisUrl: !!process.env.REDIS_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET
    }
  });
});

// Root endpoint
app.get('/', (c) => {
  return c.json({ 
    message: 'Core API is running',
    version: '1.0.0'
  });
});

// Start server
const port = parseInt(process.env.PORT || '3001');
log.info(`Starting server on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0',
}, (info) => {
  log.info(`Core API running on http://0.0.0.0:${info.port}`);
  log.info('Environment check:', {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    hasRedisUrl: !!process.env.REDIS_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log.info('SIGTERM received, shutting down...');
  process.exit(0);
});