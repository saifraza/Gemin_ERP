import { Hono } from 'hono';
import { redis } from '../index.js';

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

// Redis debug endpoint
testRoutes.get('/redis-debug', async (c) => {
  const redisUrl = process.env.REDIS_URL;
  const redisInfo = {
    hasUrl: !!redisUrl,
    urlFormat: redisUrl ? redisUrl.substring(0, 20) + '...' : 'not set',
    urlProtocol: redisUrl ? new URL(redisUrl).protocol : 'N/A',
    urlHost: redisUrl ? new URL(redisUrl).hostname : 'N/A',
    urlPort: redisUrl ? new URL(redisUrl).port : 'N/A',
  };
  
  // Try to get Redis instance status
  const redisInstance = redis();
  const connectionInfo = {
    instanceExists: !!redisInstance,
    status: redisInstance?.status || 'no instance',
    isReady: redisInstance?.status === 'ready',
  };
  
  // Try a simple ping if connected
  let pingResult = 'not attempted';
  if (redisInstance && redisInstance.status === 'ready') {
    try {
      pingResult = await redisInstance.ping();
    } catch (error: any) {
      pingResult = `error: ${error.message}`;
    }
  }
  
  return c.json({
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasRedisUrl: !!process.env.REDIS_URL,
    },
    redisUrl: redisInfo,
    connection: connectionInfo,
    ping: pingResult,
    timestamp: new Date().toISOString(),
  });
});

export { testRoutes };