import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { WebSocketServer } from 'ws';
import pino from 'pino';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';
import { PostgreSQLCache, PostgreSQLRateLimiter } from './shared/cache/index.js';

const log = pino({ name: 'api-gateway' });

// Initialize Prisma and PostgreSQL cache
const prisma = new PrismaClient();
const cache = new PostgreSQLCache(prisma);
const rateLimiter = new PostgreSQLRateLimiter(cache);

// Initialize database connection lazily
let dbConnected = false;
async function ensureDbConnection() {
  if (!dbConnected) {
    try {
      await prisma.$connect();
      dbConnected = true;
      log.info('Database connected');
    } catch (error) {
      log.error('Database connection failed:', error);
      throw error;
    }
  }
}

// Service URLs - Use Railway internal URLs when available
const services = {
  core: process.env.CORE_API_URL || (process.env.RAILWAY_ENVIRONMENT ? 'http://core-api.railway.internal:3001' : 'http://localhost:3001'),
  mcp: process.env.MCP_ORCHESTRATOR_URL || (process.env.RAILWAY_ENVIRONMENT ? 'http://mcp-orchestrator.railway.internal:3000' : 'http://localhost:3000'),
  factory: process.env.FACTORY_API_URL || (process.env.RAILWAY_ENVIRONMENT ? 'http://factory-api.railway.internal:3002' : 'http://localhost:3002'),
  analytics: process.env.ANALYTICS_API_URL || (process.env.RAILWAY_ENVIRONMENT ? 'http://analytics-api.railway.internal:3003' : 'http://localhost:3003'),
};

const app = new Hono();
let server: any; // Will be set when server starts
let wss: WebSocketServer;

// JWT secret
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// Middleware
app.use('*', cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use('*', logger());

// Rate limiting middleware
const rateLimiterMiddleware = async (c: any, next: any) => {
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  
  try {
    const allowed = await rateLimiter.isAllowed(ip, 100, 60); // 100 requests per minute
    
    if (!allowed) {
      return c.json({ error: 'Rate limit exceeded' }, 429);
    }
  } catch (error) {
    log.warn('Rate limiting unavailable:', error.message);
    // Continue without rate limiting if cache is down
  }
  
  await next();
};

app.use('/api/*', rateLimiterMiddleware);

// Authentication middleware
const authMiddleware = async (c: any, next: any) => {
  // Skip auth for public endpoints
  const publicPaths = ['/api/auth/login', '/api/auth/register', '/health'];
  if (publicPaths.some(path => c.req.path.startsWith(path))) {
    return next();
  }
  
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    // Try to check cache first
    try {
      const cached = await cache.get(`session:${token}`);
      if (cached) {
        c.set('user', cached);
        return next();
      }
    } catch (error) {
      log.warn('Cache unavailable:', error.message);
    }
    
    // Verify JWT
    const { payload } = await jwtVerify(token, secret);
    c.set('user', payload);
    
    // Try to cache for future requests
    try {
      await cache.set(`session:${token}`, payload, 3600);
    } catch (error) {
      log.warn('Failed to cache session:', error.message);
    }
    
    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// Apply auth middleware only to protected routes
app.use('/api/*', async (c, next) => {
  // Skip auth for health checks and auth endpoints
  const path = c.req.path;
  if (path.includes('/health') || path.startsWith('/api/auth/')) {
    return next();
  }
  return authMiddleware(c, next);
});

// Health check
app.get('/health', async (c) => {
  const health = {
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    cache: 'unknown',
    database: 'unknown',
    services: {},
  };
  
  // Check database
  try {
    await ensureDbConnection();
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'connected';
  } catch (error) {
    health.database = 'error';
    health.status = 'degraded';
  }
  
  // Check cache
  try {
    await cache.set('health:check', Date.now(), 60);
    const testValue = await cache.get('health:check');
    health.cache = testValue ? 'connected' : 'error';
  } catch (error) {
    health.cache = 'disconnected';
    // Don't fail health check if cache is down
  }
  
  // Check downstream services
  for (const [name, url] of Object.entries(services)) {
    try {
      const response = await fetch(`${url}/health`);
      health.services[name] = response.ok ? 'healthy' : 'unhealthy';
    } catch {
      health.services[name] = 'unreachable';
    }
  }
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  return c.json(health, statusCode);
});

// Root endpoint
app.get('/', (c) => {
  return c.json({ 
    message: 'API Gateway is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: Object.keys(services)
  });
});

// Forward auth routes
app.all('/api/auth/*', async (c) => {
  const path = c.req.path.replace('/api/auth', '');
  const url = `${services.core}/api/auth${path}`;
  
  try {
    const response = await fetch(url, {
      method: c.req.method,
      headers: Object.fromEntries(c.req.raw.headers),
      body: c.req.method !== 'GET' ? await c.req.text() : undefined,
    });
    
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: Object.fromEntries(response.headers),
    });
  } catch (error) {
    log.error('Auth forward failed:', error);
    return c.json({ error: 'Service unavailable' }, 503);
  }
});

// Forward other routes
app.all('/api/*', async (c) => {
  const path = c.req.path.replace('/api', '');
  
  // Determine which service to forward to
  let serviceUrl = services.core;
  if (path.startsWith('/mcp')) {
    serviceUrl = services.mcp;
  } else if (path.startsWith('/factory')) {
    serviceUrl = services.factory;
  } else if (path.startsWith('/analytics')) {
    serviceUrl = services.analytics;
  }
  
  const url = `${serviceUrl}/api${path}`;
  const user = c.get('user');
  
  try {
    const headers = Object.fromEntries(c.req.raw.headers);
    headers['x-user-id'] = user?.userId;
    headers['x-user-role'] = user?.role;
    headers['x-company-id'] = user?.companyId;
    
    const response = await fetch(url, {
      method: c.req.method,
      headers,
      body: c.req.method !== 'GET' ? await c.req.text() : undefined,
    });
    
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: Object.fromEntries(response.headers),
    });
  } catch (error) {
    log.error('Service forward failed:', error);
    return c.json({ error: 'Service unavailable' }, 503);
  }
});

// WebSocket setup
function setupWebSocketServer() {
  wss = new WebSocketServer({ server: server, path: '/ws' });
  
  wss.on('connection', async (ws, req) => {
    const token = new URL(req.url!, `http://${req.headers.host}`).searchParams.get('token');
    
    if (!token) {
      ws.close(1008, 'Unauthorized');
      return;
    }
    
    try {
      const { payload } = await jwtVerify(token, secret);
      
      // Store connection info in database for event delivery
      const connectionId = `ws:${Date.now()}:${Math.random()}`;
      await prisma.event.create({
        data: {
          type: 'websocket.connected',
          source: 'api-gateway',
          data: {
            connectionId,
            userId: payload.userId,
            companyId: payload.companyId,
          },
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
      });
      
      // Poll for events periodically instead of using Redis pub/sub
      const pollInterval = setInterval(async () => {
        try {
          // Get recent events for this user
          const events = await prisma.event.findMany({
            where: {
              createdAt: { gte: new Date(Date.now() - 5000) }, // Last 5 seconds
              OR: [
                { data: { path: ['userId'], equals: payload.userId } },
                { data: { path: ['companyId'], equals: payload.companyId } },
              ],
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          });
          
          for (const event of events) {
            ws.send(JSON.stringify({
              type: event.type,
              data: event.data,
              timestamp: event.createdAt,
            }));
          }
        } catch (error) {
          log.error('Event polling error:', error);
        }
      }, 1000); // Poll every second
      
      ws.on('close', async () => {
        clearInterval(pollInterval);
        
        // Record disconnection
        await prisma.event.create({
          data: {
            type: 'websocket.disconnected',
            source: 'api-gateway',
            data: { connectionId },
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
        }).catch(() => {}); // Ignore errors on cleanup
      });
      
      // Handle incoming messages
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          
          // Create event for message processing
          await prisma.event.create({
            data: {
              type: `websocket.message.${message.type}`,
              source: 'api-gateway',
              data: {
                ...message,
                userId: payload.userId,
                connectionId,
              },
              metadata: {
                timestamp: new Date().toISOString(),
              },
            },
          });
          
          // Acknowledge receipt
          ws.send(JSON.stringify({
            type: 'ack',
            messageId: message.id,
          }));
        } catch (error) {
          log.error('WebSocket message error:', error);
        }
      });
    } catch (error) {
      log.error('WebSocket auth failed:', error);
      ws.close(1008, 'Unauthorized');
    }
  });
  
  log.info('WebSocket server initialized');
}

// Start server
const port = parseInt(process.env.PORT || '4000');
log.info(`Starting API Gateway on port ${port}`);

server = serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0',
}, (info) => {
  log.info(`API Gateway running on http://0.0.0.0:${info.port}`);
  setupWebSocketServer();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  log.info('Shutting down gracefully...');
  await prisma.$disconnect();
  if (wss) {
    wss.close();
  }
  process.exit(0);
});