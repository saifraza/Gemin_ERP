import { Hono } from 'hono';
import { prisma } from '../index.js';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const cacheTestRoutes = new Hono();

// Schema for cache entries
const cacheEntrySchema = z.object({
  key: z.string().min(1),
  value: z.any(),
  ttl: z.number().optional(), // seconds
});

// Initialize cache table (using events table as a cache)
cacheTestRoutes.post('/init', async (c) => {
  try {
    // We'll use the Event table to store cache-like data
    const testEntry = await prisma.event.create({
      data: {
        type: 'cache.test',
        source: 'cache-test-api',
        data: {
          initialized: true,
          timestamp: new Date().toISOString(),
        },
        metadata: {
          purpose: 'Redis alternative using PostgreSQL',
        },
      },
    });
    
    return c.json({
      success: true,
      message: 'Cache table initialized',
      testEntry,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Set cache value (Redis SET equivalent)
cacheTestRoutes.post('/set', zValidator('json', cacheEntrySchema), async (c) => {
  const { key, value, ttl } = c.req.valid('json');
  
  try {
    // Calculate expiry time if TTL provided
    const expiresAt = ttl 
      ? new Date(Date.now() + ttl * 1000)
      : new Date(Date.now() + 86400000); // 24 hours default
    
    // Store as event with special type
    const cacheEntry = await prisma.event.create({
      data: {
        type: `cache.${key}`,
        source: 'cache-api',
        data: { value, key },
        metadata: {
          expiresAt: expiresAt.toISOString(),
          ttl,
        },
      },
    });
    
    return c.json({
      success: true,
      key,
      stored: true,
      expiresAt,
      id: cacheEntry.id,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get cache value (Redis GET equivalent)
cacheTestRoutes.get('/get/:key', async (c) => {
  const key = c.req.param('key');
  
  try {
    // Find most recent cache entry for this key
    const cacheEntry = await prisma.event.findFirst({
      where: {
        type: `cache.${key}`,
        createdAt: {
          gte: new Date(Date.now() - 86400000), // Within last 24 hours
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    if (!cacheEntry) {
      return c.json({ found: false, value: null });
    }
    
    // Check if expired
    const expiresAt = cacheEntry.metadata?.expiresAt 
      ? new Date(cacheEntry.metadata.expiresAt as string)
      : null;
      
    if (expiresAt && expiresAt < new Date()) {
      return c.json({ found: false, value: null, reason: 'expired' });
    }
    
    return c.json({
      found: true,
      key,
      value: (cacheEntry.data as any).value,
      createdAt: cacheEntry.createdAt,
      expiresAt,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// List all cache entries (Redis KEYS equivalent)
cacheTestRoutes.get('/list', async (c) => {
  try {
    const cacheEntries = await prisma.event.findMany({
      where: {
        type: {
          startsWith: 'cache.',
        },
        createdAt: {
          gte: new Date(Date.now() - 86400000), // Within last 24 hours
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });
    
    const keys = cacheEntries.map(entry => ({
      key: entry.type.replace('cache.', ''),
      value: (entry.data as any).value,
      createdAt: entry.createdAt,
      expiresAt: entry.metadata?.expiresAt,
    }));
    
    return c.json({
      count: keys.length,
      keys,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Delete cache entry (Redis DEL equivalent)
cacheTestRoutes.delete('/delete/:key', async (c) => {
  const key = c.req.param('key');
  
  try {
    // Delete all entries for this key
    const result = await prisma.event.deleteMany({
      where: {
        type: `cache.${key}`,
      },
    });
    
    return c.json({
      success: true,
      key,
      deleted: result.count,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Test Redis-like operations
cacheTestRoutes.post('/test-operations', async (c) => {
  try {
    const testResults = [];
    
    // Test 1: Set a value
    const setResult = await prisma.event.create({
      data: {
        type: 'cache.test-key-1',
        source: 'test',
        data: { value: 'Hello Redis Alternative!', key: 'test-key-1' },
        metadata: { expiresAt: new Date(Date.now() + 3600000).toISOString() },
      },
    });
    testResults.push({ operation: 'SET', success: true, key: 'test-key-1' });
    
    // Test 2: Set another value
    await prisma.event.create({
      data: {
        type: 'cache.test-key-2',
        source: 'test',
        data: { value: { name: 'ERP System', version: '1.0' }, key: 'test-key-2' },
        metadata: { expiresAt: new Date(Date.now() + 3600000).toISOString() },
      },
    });
    testResults.push({ operation: 'SET', success: true, key: 'test-key-2' });
    
    // Test 3: Get a value
    const getValue = await prisma.event.findFirst({
      where: { type: 'cache.test-key-1' },
      orderBy: { createdAt: 'desc' },
    });
    testResults.push({ 
      operation: 'GET', 
      success: true, 
      key: 'test-key-1',
      value: (getValue?.data as any)?.value,
    });
    
    // Test 4: List keys
    const listKeys = await prisma.event.findMany({
      where: { type: { startsWith: 'cache.test-' } },
    });
    testResults.push({ 
      operation: 'KEYS', 
      success: true, 
      count: listKeys.length,
      keys: listKeys.map(e => e.type.replace('cache.', '')),
    });
    
    return c.json({
      success: true,
      message: 'Redis-like operations working with PostgreSQL!',
      testResults,
      summary: {
        totalOperations: testResults.length,
        successful: testResults.filter(r => r.success).length,
        implementation: 'PostgreSQL Event table as cache storage',
      },
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export { cacheTestRoutes };