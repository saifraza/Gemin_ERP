import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { WebSocketServer } from 'ws';
import Redis from 'ioredis';
import pino from 'pino';
import { jwtVerify } from 'jose';

const log = pino({ name: 'api-gateway' });

// Initialize Redis with lazy connection
let redis: Redis | null = null;

async function getRedis(): Promise<Redis> {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL is required');
    }
    
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 10) return null;
        return Math.min(times * 50, 2000);
      }
    });
    
    redis.on('error', (err) => log.error('Redis error:', err.message));
    redis.on('connect', () => log.info('Redis connected'));
  }
  return redis;
}

// Service URLs
const services = {
  core: process.env.CORE_API_URL || 'http://localhost:3001',
  mcp: process.env.MCP_ORCHESTRATOR_URL || 'http://localhost:3000',
  factory: process.env.FACTORY_API_URL || 'http://localhost:3002',
  analytics: process.env.ANALYTICS_API_URL || 'http://localhost:3003',
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
const rateLimiter = async (c: any, next: any) => {
  try {
    const redisClient = await getRedis();
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const key = `rate:${ip}`;
    
    const count = await redisClient.incr(key);
    if (count === 1) {
      await redisClient.expire(key, 60); // 1 minute window
    }
    
    if (count > 100) { // 100 requests per minute
      return c.json({ error: 'Rate limit exceeded' }, 429);
    }
  } catch (error) {
    log.warn('Rate limiting unavailable:', error.message);
    // Continue without rate limiting if Redis is down
  }
  
  await next();
};

app.use('/api/*', rateLimiter);

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
      const redisClient = await getRedis();
      const cached = await redisClient.get(`session:${token}`);
      if (cached) {
        c.set('user', JSON.parse(cached));
        return next();
      }
    } catch (error) {
      log.warn('Redis cache unavailable:', error.message);
    }
    
    // Verify JWT
    const { payload } = await jwtVerify(token, secret);
    c.set('user', payload);
    
    // Try to cache for future requests
    try {
      const redisClient = await getRedis();
      await redisClient.setex(`session:${token}`, 3600, JSON.stringify(payload));
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
    redis: 'unknown',
    services: {},
  };
  
  // Check Redis
  try {
    const redisClient = await getRedis();
    await redisClient.ping();
    health.redis = 'connected';
  } catch (error) {
    health.redis = 'disconnected';
    // Don't fail health check if Redis is down
  }
  
  // Check each service (don't wait too long)
  const serviceChecks = Object.entries(services).map(async ([name, url]) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      
      const res = await fetch(`${url}/health`, { 
        signal: controller.signal,
        headers: { 'User-Agent': 'api-gateway-health-check' }
      });
      
      clearTimeout(timeout);
      health.services[name] = res.ok ? 'healthy' : 'unhealthy';
    } catch {
      health.services[name] = 'unreachable';
    }
  });
  
  await Promise.all(serviceChecks);
  
  return c.json(health);
});

// WebSocket endpoint
app.get('/ws', (c) => {
  return c.text('WebSocket endpoint. Connect using ws:// protocol.', 426);
});

// Proxy routes
app.all('/api/auth/*', async (c) => {
  const path = c.req.path.replace('/api/auth', '');
  const res = await fetch(`${services.core}/api/auth${path}`, {
    method: c.req.method,
    headers: c.req.header(),
    body: c.req.method !== 'GET' ? await c.req.text() : undefined,
  });
  
  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  });
});

app.all('/api/core/*', async (c) => {
  const path = c.req.path.replace('/api/core', '');
  const res = await fetch(`${services.core}${path}`, {
    method: c.req.method,
    headers: c.req.header(),
    body: c.req.method !== 'GET' ? await c.req.text() : undefined,
  });
  
  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  });
});

app.all('/api/mcp/*', async (c) => {
  const path = c.req.path.replace('/api/mcp', '');
  const res = await fetch(`${services.mcp}/api/mcp${path}`, {
    method: c.req.method,
    headers: c.req.header(),
    body: c.req.method !== 'GET' ? await c.req.text() : undefined,
  });
  
  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  });
});

app.all('/api/factory/*', async (c) => {
  const path = c.req.path.replace('/api/factory', '');
  const res = await fetch(`${services.factory}/api${path}`, {
    method: c.req.method,
    headers: c.req.header(),
    body: c.req.method !== 'GET' ? await c.req.text() : undefined,
  });
  
  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  });
});

// WebSocket handling for real-time connections
function setupWebSocketServer() {
  if (!server) return;
  
  wss = new WebSocketServer({ server });
  
  wss.on('connection', async (ws, req) => {
  log.info('New WebSocket connection');
  
  // Authenticate WebSocket
  const token = new URL(req.url!, `http://${req.headers.host}`).searchParams.get('token');
  if (!token) {
    ws.close(1008, 'Unauthorized');
    return;
  }
  
  try {
    const { payload } = await jwtVerify(token, secret);
    
    let sub: Redis | null = null;
    
    // Try to subscribe to user-specific channels
    try {
      const redisClient = await getRedis();
      sub = redisClient.duplicate();
      await sub.subscribe(`user:${payload.userId}`, `company:${payload.companyId}`);
      
      sub.on('message', (channel, message) => {
        ws.send(JSON.stringify({ channel, data: JSON.parse(message) }));
      });
    } catch (error) {
      log.warn('WebSocket Redis subscription failed:', error.message);
      // Continue without Redis pub/sub
    }
    
    ws.on('close', () => {
      if (sub) {
        sub.disconnect();
      }
    });
    
    // Handle incoming messages
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Route to appropriate service
        switch (message.type) {
          case 'mcp':
            // Forward to MCP service
            try {
              const redisClient = await getRedis();
              await redisClient.publish('mcp:requests', JSON.stringify({
                ...message,
                userId: payload.userId,
              }));
            } catch (error) {
              log.warn('Failed to publish to Redis:', error.message);
              // Could forward directly to MCP service via HTTP as fallback
            }
            break;
            
          case 'subscribe':
            // Subscribe to additional channels
            if (message.channels && sub) {
              await sub.subscribe(...message.channels);
            }
            break;
        }
      } catch (error) {
        log.error(error, 'WebSocket message error');
      }
    });
  } catch {
    ws.close(1008, 'Invalid token');
  }
  });
}

// Start server
const port = parseInt(process.env.PORT || '8080');
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
  if (redis) {
    redis.disconnect();
  }
  if (wss) {
    wss.close();
  }
  process.exit(0);
});