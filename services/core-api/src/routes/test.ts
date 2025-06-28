import { Hono } from 'hono';
import { cache } from '../index.js';

const testRoutes = new Hono();

// Simple test endpoint to verify deployment
testRoutes.get('/version', (c) => {
  return c.json({ 
    version: '1.0.2',
    message: 'Core API with PostgreSQL cache',
    timestamp: new Date().toISOString(),
    features: {
      addressField: 'JSON format',
      cacheSystem: 'PostgreSQL-based',
      authEndpoints: ['login', 'register', 'test-register', 'verify', 'logout']
    }
  });
});

// Cache debug endpoint
testRoutes.get('/cache-debug', async (c) => {
  const cacheInfo = {
    type: 'PostgreSQL Cache',
    status: 'active',
  };
  
  // Try a simple cache operation
  let testResult = 'not attempted';
  try {
    const testKey = 'test:debug';
    const testValue = { message: 'Cache test', timestamp: Date.now() };
    
    // Set value
    await cache.set(testKey, testValue, 60);
    
    // Get value back
    const retrieved = await cache.get(testKey);
    
    // Clean up
    await cache.del(testKey);
    
    testResult = retrieved ? 'success' : 'failed';
  } catch (error: any) {
    testResult = `error: ${error.message}`;
  }
  
  return c.json({
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasDatabase: !!process.env.DATABASE_URL,
    },
    cache: cacheInfo,
    test: testResult,
    timestamp: new Date().toISOString(),
  });
});

export { testRoutes };