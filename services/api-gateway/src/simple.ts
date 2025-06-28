import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

console.log('Simple API Gateway starting...');

const app = new Hono();

// Simple CORS - allow everything
app.use('*', cors({
  origin: '*',
  credentials: true,
}));

app.get('/', (c) => {
  return c.json({ 
    message: 'API Gateway is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    service: 'api-gateway-simple',
    timestamp: new Date().toISOString()
  });
});

const port = parseInt(process.env.PORT || '4000');
console.log(`Attempting to start on port ${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0',
}, (info) => {
  console.log(`Simple API Gateway running on port ${info.port}`);
});