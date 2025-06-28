import { Hono } from 'hono';

const testRoutes = new Hono();

// Simple test endpoint to verify deployment
testRoutes.get('/version', (c) => {
  return c.json({ 
    version: '1.0.1',
    message: 'Core API with fixed address field',
    timestamp: new Date().toISOString(),
    features: {
      addressField: 'JSON format',
      redisHandling: 'Graceful fallback',
      authEndpoints: ['login', 'register', 'test-register', 'verify', 'logout']
    }
  });
});

export { testRoutes };