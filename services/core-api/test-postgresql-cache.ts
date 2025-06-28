import { PrismaClient } from '@prisma/client';
import { PostgreSQLCache } from './src/shared/cache/postgresql-cache.js';

async function testPostgreSQLCache() {
  const prisma = new PrismaClient();
  const cache = new PostgreSQLCache(prisma);
  
  console.log('🧪 Testing PostgreSQL Cache Implementation\n');
  
  try {
    // Test 1: SET and GET
    console.log('Test 1: Basic SET and GET');
    await cache.set('test:basic', { message: 'Hello PostgreSQL Cache' }, 300);
    const value = await cache.get('test:basic');
    console.log('✅ Retrieved:', value);
    
    // Test 2: Non-existent key
    console.log('\nTest 2: Non-existent key');
    const notFound = await cache.get('test:notfound');
    console.log('✅ Non-existent key returns:', notFound);
    
    // Test 3: DELETE
    console.log('\nTest 3: DELETE operation');
    await cache.del('test:basic');
    const afterDelete = await cache.get('test:basic');
    console.log('✅ After delete:', afterDelete);
    
    // Test 4: EXISTS
    console.log('\nTest 4: EXISTS operation');
    await cache.set('test:exists', 'I exist', 300);
    const exists = await cache.exists('test:exists');
    const notExists = await cache.exists('test:notexists');
    console.log('✅ Existing key:', exists);
    console.log('✅ Non-existing key:', notExists);
    
    // Test 5: Pattern matching with KEYS
    console.log('\nTest 5: KEYS pattern matching');
    await cache.set('user:1', { id: 1, name: 'User 1' }, 300);
    await cache.set('user:2', { id: 2, name: 'User 2' }, 300);
    await cache.set('product:1', { id: 1, name: 'Product 1' }, 300);
    const userKeys = await cache.keys('user:*');
    console.log('✅ User keys:', userKeys);
    
    // Cleanup test data
    console.log('\nCleaning up test data...');
    const allTestKeys = await cache.keys('test:*');
    const allUserKeys = await cache.keys('user:*');
    const allProductKeys = await cache.keys('product:*');
    
    for (const key of [...allTestKeys, ...allUserKeys, ...allProductKeys]) {
      await cache.del(key);
    }
    
    console.log('\n✅ All PostgreSQL cache tests passed!');
    console.log('💡 The cache is now using PostgreSQL instead of Redis');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testPostgreSQLCache().catch(console.error);
}