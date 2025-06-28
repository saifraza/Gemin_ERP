import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import cron from 'node-cron';
import pino from 'pino';
import { PrismaClient } from '@prisma/client';

const log = pino({ name: 'event-processor' });

// Initialize services
const app = new Hono();
const prisma = new PrismaClient();

// Redis connection with error handling
let redis: Redis | null = null;
let eventQueue: Queue | null = null;

async function initializeRedis() {
  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      log.warn('No Redis URL provided, running without queue processing');
      return;
    }

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    redis.on('error', (err) => {
      log.error({ error: err }, 'Redis connection error');
    });

    redis.on('connect', () => {
      log.info('Connected to Redis');
    });

    // Initialize BullMQ queue
    eventQueue = new Queue('events', { connection: redis });
    
    // Initialize worker
    const worker = new Worker(
      'events',
      async (job) => {
        log.info({ job: job.data }, 'Processing event');
        await processEvent(job.data);
      },
      { connection: redis }
    );

    worker.on('completed', (job) => {
      log.info({ jobId: job.id }, 'Job completed');
    });

    worker.on('failed', (job, err) => {
      log.error({ jobId: job?.id, error: err }, 'Job failed');
    });

  } catch (error) {
    log.error({ error }, 'Failed to initialize Redis');
  }
}

// Event processing logic
async function processEvent(event: any) {
  try {
    // Store event in database
    await prisma.event.create({
      data: {
        type: event.type,
        source: event.source,
        data: event.data,
        metadata: event.metadata || {},
      },
    });

    // Process based on event type
    switch (event.type) {
      case 'user.registered':
        await handleUserRegistered(event);
        break;
      case 'production.completed':
        await handleProductionCompleted(event);
        break;
      case 'inventory.low':
        await handleLowInventory(event);
        break;
      case 'maintenance.due':
        await handleMaintenanceDue(event);
        break;
      default:
        log.info({ event }, 'Unhandled event type');
    }
  } catch (error) {
    log.error({ error, event }, 'Failed to process event');
    throw error;
  }
}

// Event handlers
async function handleUserRegistered(event: any) {
  log.info({ userId: event.data.userId }, 'Processing user registration');
  // Send welcome email, setup default permissions, etc.
}

async function handleProductionCompleted(event: any) {
  log.info({ batchId: event.data.batchId }, 'Processing production completion');
  // Update inventory, generate reports, etc.
}

async function handleLowInventory(event: any) {
  log.warn({ item: event.data.item }, 'Processing low inventory alert');
  // Create procurement request, notify managers, etc.
}

async function handleMaintenanceDue(event: any) {
  log.info({ equipment: event.data.equipment }, 'Processing maintenance due');
  // Schedule maintenance, notify technicians, etc.
}

// Scheduled jobs
function initializeScheduledJobs() {
  // Daily production report at 6 AM
  cron.schedule('0 6 * * *', async () => {
    log.info('Running daily production report');
    try {
      // Generate and send daily reports
    } catch (error) {
      log.error({ error }, 'Failed to generate daily report');
    }
  });

  // Hourly inventory check
  cron.schedule('0 * * * *', async () => {
    log.info('Running hourly inventory check');
    try {
      // Check inventory levels and create alerts
    } catch (error) {
      log.error({ error }, 'Failed to check inventory');
    }
  });

  // Equipment maintenance check every 4 hours
  cron.schedule('0 */4 * * *', async () => {
    log.info('Running equipment maintenance check');
    try {
      // Check equipment status and maintenance schedules
    } catch (error) {
      log.error({ error }, 'Failed to check equipment maintenance');
    }
  });
}

// Middleware
app.use('*', cors());
app.use('*', logger());

// Routes
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    service: 'event-processor',
    redis: redis?.status || 'disconnected',
    queue: eventQueue ? 'active' : 'inactive',
  });
});

// Queue event endpoint
app.post('/events', async (c) => {
  try {
    const event = await c.req.json();
    
    if (eventQueue) {
      await eventQueue.add('process-event', event);
      return c.json({ success: true, message: 'Event queued' });
    } else {
      // Process immediately if no queue
      await processEvent(event);
      return c.json({ success: true, message: 'Event processed' });
    }
  } catch (error) {
    log.error({ error }, 'Failed to queue event');
    return c.json({ error: 'Failed to process event' }, 500);
  }
});

// Get event stats
app.get('/stats', async (c) => {
  try {
    const stats = await prisma.event.groupBy({
      by: ['type'],
      _count: true,
      orderBy: {
        _count: {
          type: 'desc',
        },
      },
    });
    
    return c.json({ stats });
  } catch (error) {
    return c.json({ error: 'Failed to get stats' }, 500);
  }
});

// Start server
const PORT = process.env.PORT || 3003;

serve({
  fetch: app.fetch,
  port: Number(PORT),
  hostname: '0.0.0.0', // Important for Railway!
}, () => {
  log.info(`Event Processor running on http://0.0.0.0:${PORT}`);
  
  // Initialize services
  initializeRedis();
  initializeScheduledJobs();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  log.info('SIGTERM received, shutting down gracefully');
  
  if (eventQueue) {
    await eventQueue.close();
  }
  
  if (redis) {
    redis.disconnect();
  }
  
  await prisma.$disconnect();
  
  process.exit(0);
});