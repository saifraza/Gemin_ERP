import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from '@hono/node-server/serve-static';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pino from 'pino';
import Redis from 'ioredis';

const log = pino({ name: 'modern-erp' });

// Initialize services
const app = new Hono();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Middleware
app.use('*', cors());
app.use('*', logger());

// Health check
app.get('/health', (c) => c.json({ 
  status: 'healthy', 
  service: 'modern-erp-all-in-one',
  timestamp: new Date().toISOString()
}));

// API Routes
app.get('/api', (c) => c.json({ message: 'Modern ERP API' }));

// MCP endpoints
app.post('/api/mcp/chat', async (c) => {
  try {
    const { prompt, context } = await c.req.json();
    
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    
    return c.json({
      response: result.response.text(),
      model: 'gemini-1.5-pro',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log.error(error, 'Chat error');
    return c.json({ error: 'Failed to process chat' }, 500);
  }
});

// Factory status endpoint
app.get('/api/factory/status', async (c) => {
  // This would connect to real systems in production
  const status = {
    timestamp: new Date().toISOString(),
    divisions: {
      sugar: {
        status: 'RUNNING',
        production: { current: 450, target: 500, efficiency: 90 },
      },
      ethanol: {
        status: 'RUNNING',
        production: { current: 25000, target: 30000, efficiency: 83.3 },
      },
      power: {
        status: 'RUNNING',
        output: { current: 28, unit: 'MW' },
      },
      feed: {
        status: 'MAINTENANCE',
        nextStart: '2025-01-28T06:00:00Z',
      },
    },
  };
  
  return c.json(status);
});

// Events endpoint
app.post('/api/events', async (c) => {
  const event = await c.req.json();
  
  // Publish to Redis
  await redis.publish(`erp:events:${event.type}`, JSON.stringify(event));
  
  return c.json({ success: true, eventId: event.id });
});

// Serve static files (for Next.js in production)
app.use('/*', serveStatic({ root: './public' }));

// Start server
const port = parseInt(process.env.PORT || '3000');
serve({
  fetch: app.fetch,
  port,
}, (info) => {
  log.info(`Modern ERP running on http://localhost:${info.port}`);
});