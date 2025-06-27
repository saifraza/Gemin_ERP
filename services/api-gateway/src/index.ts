import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import Redis from 'ioredis';
import pino from 'pino';
import { jwtVerify } from 'jose';

const log = pino({ name: 'api-gateway' });
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Service URLs
const services = {
  core: process.env.CORE_API_URL || 'http://localhost:3001',
  mcp: process.env.MCP_URL || 'http://localhost:3000',
  factory: process.env.FACTORY_API_URL || 'http://localhost:3002',
  analytics: process.env.ANALYTICS_API_URL || 'http://localhost:3003',
};

const app = new Hono();
const httpServer = createServer(app.fetch);
const wss = new WebSocketServer({ server: httpServer });

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
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const key = `rate:${ip}`;
  
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 60); // 1 minute window
  }
  
  if (count > 100) { // 100 requests per minute
    return c.json({ error: 'Rate limit exceeded' }, 429);
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
    // Check cache first
    const cached = await redis.get(`session:${token}`);
    if (cached) {
      c.set('user', JSON.parse(cached));
      return next();
    }
    
    // Verify JWT
    const { payload } = await jwtVerify(token, secret);
    c.set('user', payload);
    
    // Cache for future requests
    await redis.setex(`session:${token}`, 3600, JSON.stringify(payload));
    
    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

app.use('/api/*', authMiddleware);

// Health check
app.get('/health', async (c) => {
  const health = {
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    services: {},
  };
  
  // Check each service
  for (const [name, url] of Object.entries(services)) {
    try {
      const res = await fetch(`${url}/health`);
      health.services[name] = res.ok ? 'healthy' : 'unhealthy';
    } catch {
      health.services[name] = 'unreachable';
    }
  }
  
  return c.json(health);
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
    
    // Subscribe to user-specific channels
    const sub = redis.duplicate();
    await sub.subscribe(`user:${payload.userId}`, `company:${payload.companyId}`);
    
    sub.on('message', (channel, message) => {
      ws.send(JSON.stringify({ channel, data: JSON.parse(message) }));
    });
    
    ws.on('close', () => {
      sub.disconnect();
    });
    
    // Handle incoming messages
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Route to appropriate service
        switch (message.type) {
          case 'mcp':
            // Forward to MCP service
            await redis.publish('mcp:requests', JSON.stringify({
              ...message,
              userId: payload.userId,
            }));
            break;
            
          case 'subscribe':
            // Subscribe to additional channels
            if (message.channels) {
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

// Start server
const port = parseInt(process.env.PORT || '8080');
httpServer.listen(port, () => {
  log.info(`API Gateway running on http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  log.info('Shutting down gracefully...');
  redis.disconnect();
  httpServer.close();
  process.exit(0);
});