console.log('API Gateway starting up...');

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
let prisma: PrismaClient | null = null;
let cache: PostgreSQLCache | null = null;
let rateLimiter: PostgreSQLRateLimiter | null = null;

// Initialize database connection lazily
let dbConnected = false;
async function ensureDbConnection() {
  if (!dbConnected && process.env.DATABASE_URL) {
    try {
      prisma = new PrismaClient();
      await prisma.$connect();
      cache = new PostgreSQLCache(prisma);
      rateLimiter = new PostgreSQLRateLimiter(cache);
      dbConnected = true;
      log.info('Database connected');
    } catch (error) {
      log.error('Database connection failed:', error);
      // Don't throw - allow gateway to work without database
    }
  }
}

// Service URLs - Use environment variables (configured in Railway)
const services = {
  core: process.env.CORE_API_URL || 'http://localhost:3001',
  mcp: process.env.MCP_ORCHESTRATOR_URL || 'http://localhost:3000',
  factory: process.env.FACTORY_API_URL || 'http://localhost:3002',
  analytics: process.env.ANALYTICS_API_URL || 'http://localhost:3003',
  eventProcessor: process.env.EVENT_PROCESSOR_URL || 'http://localhost:3006',
};

// Log configuration for debugging
log.info({
  environment: process.env.RAILWAY_ENVIRONMENT || 'local',
  databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
  services,
}, 'API Gateway configuration');

const app = new Hono();
let server: any; // Will be set when server starts
let wss: WebSocketServer;

// Global error handler
app.onError((err, c) => {
  log.error({ error: err.message, stack: err.stack }, 'Unhandled error');
  return c.json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  }, 500);
});

// JWT secret
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// CORS configuration
const corsOptions = {
  origin: (origin: string) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return true;
    
    // Allow localhost for development
    if (origin.startsWith('http://localhost:')) return true;
    
    // Allow configured origins
    if (process.env.ALLOWED_ORIGINS) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
      if (allowedOrigins.includes(origin)) return true;
    }
    
    // Allow all Railway domains in production
    if (process.env.RAILWAY_ENVIRONMENT) {
      if (origin.includes('.railway.app')) return true;
    }
    
    // Log unmatched origins for debugging
    log.info({ origin }, 'Origin check');
    
    // Allow all origins for now to prevent blocking
    return true;
  },
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 24 hours
};

// Middleware
app.use('*', cors(corsOptions));
app.use('*', logger());

// Rate limiting middleware
const rateLimiterMiddleware = async (c: any, next: any) => {
  if (!rateLimiter) {
    // No rate limiting without database
    return next();
  }
  
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
    if (cache) {
      try {
        const cached = await cache.get(`session:${token}`);
        if (cached) {
          c.set('user', cached);
          return next();
        }
      } catch (error) {
        log.warn('Cache unavailable:', error.message);
      }
    }
    
    // Verify JWT
    const { payload } = await jwtVerify(token, secret);
    c.set('user', payload);
    
    // Try to cache for future requests
    if (cache) {
      try {
        await cache.set(`session:${token}`, payload, 3600);
      } catch (error) {
        log.warn('Failed to cache session:', error.message);
      }
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
  try {
    const health = {
      status: 'healthy',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      cache: 'unknown',
      database: 'unknown',
      services: {},
    };
    
    // Check database
    if (!process.env.DATABASE_URL) {
      health.database = 'not_configured';
      health.cache = 'not_configured';
      // Don't fail health check if database is not configured
    } else {
      try {
        await ensureDbConnection();
        if (prisma) {
          await prisma.$queryRaw`SELECT 1`;
          health.database = 'connected';
        } else {
          health.database = 'initialization_failed';
        }
      } catch (error) {
        health.database = 'error';
        health.status = 'degraded';
        log.error({ error: error.message }, 'Database health check failed');
      }
    }
    
    // Check cache
    if (cache) {
      try {
        await cache.set('health:check', Date.now(), 60);
        const testValue = await cache.get('health:check');
        health.cache = testValue ? 'connected' : 'error';
      } catch (error) {
        health.cache = 'disconnected';
        log.error({ error: error.message }, 'Cache health check failed');
      }
    }
    
    // Check downstream services - but don't let failures crash health check
    try {
      for (const [name, url] of Object.entries(services)) {
        try {
          // Create timeout with controller for older Node versions
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(`${url}/health`, { 
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          health.services[name] = response.ok ? 'healthy' : 'unhealthy';
        } catch (error) {
          health.services[name] = 'unreachable';
        }
      }
    } catch (error) {
      log.error({ error: error.message }, 'Service health check error');
    }
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    return c.json(health, statusCode);
  } catch (error) {
    log.error({ error: error.message, stack: error.stack }, 'Health check crashed');
    return c.json({ 
      status: 'error', 
      service: 'api-gateway',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    }, 500);
  }
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

// Service health check endpoint
app.get('/health/services', async (c) => {
  const healthChecks = await Promise.allSettled([
    fetch(`${services.core}/health`).then(r => ({ core: r.ok })).catch(() => ({ core: false })),
    fetch(`${services.mcp}/health`).then(r => ({ mcp: r.ok })).catch(() => ({ mcp: false })),
  ]);
  
  return c.json({
    services: {
      core: healthChecks[0].status === 'fulfilled' ? healthChecks[0].value.core : false,
      mcp: healthChecks[1].status === 'fulfilled' ? healthChecks[1].value.mcp : false,
    },
    urls: services,
    timestamp: new Date().toISOString()
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
  let forwardPath = `/api${path}`;
  
  // Special handling for service health checks
  if (path === '/core/health') {
    serviceUrl = services.core;
    forwardPath = '/health';
  } else if (path === '/mcp/health') {
    serviceUrl = services.mcp;
    forwardPath = '/health';
  } else if (path === '/factory/health') {
    serviceUrl = services.factory;
    forwardPath = '/health';
  } else if (path === '/analytics/health') {
    serviceUrl = services.analytics;
    forwardPath = '/health';
  } else if (path === '/event-processor/health') {
    serviceUrl = services.eventProcessor;
    forwardPath = '/health';
  } else if (path.startsWith('/mcp')) {
    serviceUrl = services.mcp;
  } else if (path.startsWith('/factory')) {
    serviceUrl = services.factory;
  } else if (path.startsWith('/analytics')) {
    serviceUrl = services.analytics;
  }
  
  const url = `${serviceUrl}${forwardPath}`;
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
    
    const contentType = response.headers.get('content-type') || '';
    const data = await response.text();
    
    // Check if response is JSON or HTML error page
    if (!response.ok && !contentType.includes('application/json')) {
      // If service returned HTML error page, convert to JSON
      log.error(`Service returned non-JSON error: ${response.status} from ${url}`);
      log.error(`Response body: ${data.substring(0, 200)}`);
      return c.json({ 
        error: 'Service error',
        message: `Service returned ${response.status} error`,
        details: serviceUrl ? `Check if ${serviceUrl} is running` : 'Service not configured',
        responsePreview: data.substring(0, 100)
      }, response.status);
    }
    
    // Forward the response with proper headers
    const responseHeaders = Object.fromEntries(response.headers);
    
    // Ensure Content-Type is set for JSON responses
    if (contentType.includes('application/json') && !responseHeaders['content-type']) {
      responseHeaders['content-type'] = 'application/json';
    }
    
    return new Response(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    log.error('Service forward failed:', error);
    log.error(`Failed to forward to ${url}`);
    
    // Check if it's a connection error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let errorDetails = 'Service connection failed';
    
    if (errorMessage.includes('ECONNREFUSED')) {
      errorDetails = 'Service is not running or not accessible';
    } else if (errorMessage.includes('ETIMEDOUT')) {
      errorDetails = 'Service request timed out';
    } else if (errorMessage.includes('ENOTFOUND')) {
      errorDetails = 'Service hostname not found';
    }
    
    return c.json({ 
      error: 'Service unavailable',
      message: errorMessage,
      service: serviceUrl || 'unknown',
      url: url,
      details: errorDetails
    }, 503);
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
      
      if (prisma) {
        try {
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
        } catch (error) {
          log.error('Failed to store WebSocket connection:', error);
        }
      }
      
      // Poll for events periodically instead of using Redis pub/sub
      let pollInterval: NodeJS.Timeout | null = null;
      
      if (prisma) {
        pollInterval = setInterval(async () => {
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
      }
      
      ws.on('close', async () => {
        if (pollInterval) {
          clearInterval(pollInterval);
        }
        
        // Record disconnection
        if (prisma) {
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
        }
      });
      
      // Handle incoming messages
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          
          // Create event for message processing
          if (prisma) {
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
          }
          
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

try {
  server = serve({
    fetch: app.fetch,
    port,
    hostname: '0.0.0.0',
  }, (info) => {
    log.info(`API Gateway running on http://0.0.0.0:${info.port}`);
    console.log(`API Gateway started successfully on port ${info.port}`);
    setupWebSocketServer();
  });
} catch (error) {
  console.error('Failed to start API Gateway:', error);
  log.error({ error }, 'Failed to start server');
  process.exit(1);
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  log.info('Shutting down gracefully...');
  if (prisma) {
    await prisma.$disconnect();
  }
  if (wss) {
    wss.close();
  }
  process.exit(0);
});