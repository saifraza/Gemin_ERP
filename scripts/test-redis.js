#!/usr/bin/env node

import Redis from 'ioredis';

// Test Redis connection
async function testRedis() {
  console.log('🔍 Testing Redis Connection...\n');

  // Internal Railway URL (what services should use)
  const internalUrl = 'redis://default:AUajrBfdAnIfJmLbSbVrtUVyvbHdwlDP@redis.railway.internal:6379';
  
  // Public URL (for testing from outside Railway)
  const publicUrl = 'redis://default:AUajrBfdAnIfJmLbSbVrtUVyvbHdwlDP@ballast.proxy.rlwy.net:35503';

  console.log('Testing public Redis URL...');
  console.log(`URL: ${publicUrl.replace(/:[^:@]*@/, ':****@')}\n`);

  try {
    const redis = new Redis(publicUrl, {
      connectTimeout: 5000,
      maxRetriesPerRequest: 1,
    });

    // Test basic operations
    console.log('1. Testing connection...');
    const pong = await redis.ping();
    console.log('✅ PING response:', pong);

    console.log('\n2. Testing SET operation...');
    await redis.set('test:key', 'Hello from test script');
    console.log('✅ SET successful');

    console.log('\n3. Testing GET operation...');
    const value = await redis.get('test:key');
    console.log('✅ GET response:', value);

    console.log('\n4. Testing key expiration...');
    await redis.setex('test:expire', 5, 'This will expire in 5 seconds');
    const ttl = await redis.ttl('test:expire');
    console.log('✅ TTL:', ttl, 'seconds');

    console.log('\n5. Cleaning up test keys...');
    await redis.del('test:key', 'test:expire');
    console.log('✅ Cleanup complete');

    console.log('\n🎉 Redis connection successful!');
    console.log('\nRedis server info:');
    const info = await redis.info('server');
    const lines = info.split('\n').slice(0, 5);
    lines.forEach(line => console.log('  ', line));

    redis.disconnect();
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.error('\nFull error:', error);
  }
}

// Run test
testRedis();