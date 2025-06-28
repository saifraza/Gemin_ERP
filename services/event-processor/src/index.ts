import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import cron from 'node-cron';
import pino from 'pino';
import { PrismaClient } from '@prisma/client';
import { PostgreSQLCache } from './shared/cache/index.js';

const log = pino({ name: 'event-processor' });

// Initialize services
const app = new Hono();
const prisma = new PrismaClient();
const cache = new PostgreSQLCache(prisma);

// Event processing queue (in-memory)
const eventQueue: any[] = [];
let processing = false;

// Process events from database instead of Redis
async function processEventQueue() {
  if (processing) return;
  processing = true;

  try {
    // Get unprocessed events from database
    const events = await prisma.event.findMany({
      where: {
        metadata: {
          path: ['processed'],
          equals: false,
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    for (const event of events) {
      try {
        await processEvent(event);
        
        // Mark as processed
        await prisma.event.update({
          where: { id: event.id },
          data: {
            metadata: {
              ...event.metadata,
              processed: true,
              processedAt: new Date().toISOString(),
            },
          },
        });
      } catch (error) {
        log.error({ error, eventId: event.id }, 'Failed to process event');
      }
    }
  } catch (error) {
    log.error({ error }, 'Event queue processing error');
  } finally {
    processing = false;
  }
}

// Process individual event
async function processEvent(event: any) {
  log.info({ eventType: event.type, eventId: event.id }, 'Processing event');

  switch (event.type) {
    case 'user.created':
      await handleUserCreated(event);
      break;
    case 'order.placed':
      await handleOrderPlaced(event);
      break;
    case 'inventory.low':
      await handleLowInventory(event);
      break;
    default:
      log.warn({ eventType: event.type }, 'Unknown event type');
  }
}

// Event handlers
async function handleUserCreated(event: any) {
  const { userId, email, name } = event.data;
  log.info({ userId }, 'Handling user created event');
  
  // Send welcome email, create default settings, etc.
  // This is where you'd integrate with email service, etc.
}

async function handleOrderPlaced(event: any) {
  const { orderId, userId, items } = event.data;
  log.info({ orderId }, 'Handling order placed event');
  
  // Update inventory, send confirmation, etc.
}

async function handleLowInventory(event: any) {
  const { productId, currentStock, threshold } = event.data;
  log.info({ productId }, 'Handling low inventory event');
  
  // Send alerts, create purchase orders, etc.
}

// Middleware
app.use('*', cors());
app.use('*', logger());

// Health check
app.get('/health', async (c) => {
  const health = {
    status: 'healthy',
    service: 'event-processor',
    timestamp: new Date().toISOString(),
    database: 'unknown',
    cache: 'unknown',
    jobs: {
      eventProcessing: processing ? 'running' : 'idle',
      cacheCleanup: 'scheduled',
    },
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'connected';
  } catch {
    health.database = 'error';
    health.status = 'degraded';
  }

  // Check cache
  try {
    await cache.set('health:check', Date.now(), 60);
    const value = await cache.get('health:check');
    health.cache = value ? 'connected' : 'error';
  } catch {
    health.cache = 'error';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  return c.json(health, statusCode);
});

// API endpoints
app.post('/api/events', async (c) => {
  try {
    const event = await c.req.json();
    
    // Store event in database
    const created = await prisma.event.create({
      data: {
        type: event.type,
        source: event.source || 'api',
        data: event.data,
        metadata: {
          ...event.metadata,
          processed: false,
        },
      },
    });

    // Trigger processing
    setImmediate(() => processEventQueue());

    return c.json({ id: created.id, status: 'queued' });
  } catch (error) {
    log.error({ error }, 'Failed to queue event');
    return c.json({ error: 'Failed to queue event' }, 500);
  }
});

app.get('/api/events', async (c) => {
  const limit = parseInt(c.req.query('limit') || '100');
  const type = c.req.query('type');

  const where: any = {};
  if (type) {
    where.type = type;
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return c.json(events);
});

// Scheduled jobs
function setupScheduledJobs() {
  // Process event queue every 5 seconds
  cron.schedule('*/5 * * * * *', () => {
    processEventQueue().catch(error => {
      log.error({ error }, 'Scheduled event processing failed');
    });
  });

  // Cleanup old events daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      const result = await prisma.event.deleteMany({
        where: {
          createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // 30 days old
          metadata: { path: ['processed'], equals: true },
        },
      });
      log.info({ deleted: result.count }, 'Cleaned up old events');
    } catch (error) {
      log.error({ error }, 'Event cleanup failed');
    }
  });

  // Cache cleanup every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const deleted = await cache.cleanup();
      log.info({ deleted }, 'Cleaned up expired cache entries');
    } catch (error) {
      log.error({ error }, 'Cache cleanup failed');
    }
  });

  // Generate analytics reports daily at 3 AM
  cron.schedule('0 3 * * *', async () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const eventCounts = await prisma.event.groupBy({
        by: ['type'],
        where: {
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
        _count: true,
      });

      await prisma.event.create({
        data: {
          type: 'analytics.daily_report',
          source: 'event-processor',
          data: {
            date: yesterday.toISOString().split('T')[0],
            eventCounts: eventCounts.map(ec => ({
              type: ec.type,
              count: ec._count,
            })),
          },
          metadata: { processed: true },
        },
      });

      log.info('Daily analytics report generated');
    } catch (error) {
      log.error({ error }, 'Analytics report generation failed');
    }
  });

  log.info('Scheduled jobs initialized');
}

// Start server
const port = parseInt(process.env.PORT || '3006');

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0',
}, (info) => {
  log.info(`Event Processor running on http://0.0.0.0:${info.port}`);
  
  // Setup scheduled jobs after server starts
  setupScheduledJobs();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  log.info('Shutting down gracefully...');
  
  // Stop cron jobs
  cron.getTasks().forEach(task => task.stop());
  
  // Disconnect from database
  await prisma.$disconnect();
  
  process.exit(0);
});