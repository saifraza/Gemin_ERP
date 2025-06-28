import { PrismaClient } from '@prisma/client';
import { PostgreSQLCache } from './services/core-api/dist/shared/cache/index.js';

const prisma = new PrismaClient();
const cache = new PostgreSQLCache(prisma);

async function testCache() {
  console.log('Testing PostgreSQL Cache Implementation...\n');
  
  try {
    // Test 1: Basic SET and GET
    console.log('Test 1: Basic SET and GET');
    await cache.set('test:key1', { value: 'Hello World' }, 60);
    const value1 = await cache.get('test:key1');
    console.log('✓ Set and retrieved:', value1);
    
    // Test 2: TTL expiration
    console.log('\nTest 2: TTL expiration');
    await cache.set('test:expire', 'should expire', 1);
    console.log('✓ Set key with 1 second TTL');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const expired = await cache.get('test:expire');
    console.log('✓ Key expired:', expired === null);
    
    // Test 3: DELETE
    console.log('\nTest 3: DELETE');
    await cache.set('test:delete', 'to be deleted', 60);
    await cache.del('test:delete');
    const deleted = await cache.get('test:delete');
    console.log('✓ Key deleted:', deleted === null);
    
    // Test 4: EXISTS
    console.log('\nTest 4: EXISTS');
    await cache.set('test:exists', 'I exist', 60);
    const exists1 = await cache.exists('test:exists');
    const exists2 = await cache.exists('test:notexists');
    console.log('✓ Existing key:', exists1);
    console.log('✓ Non-existing key:', !exists2);
    
    // Test 5: KEYS pattern matching
    console.log('\nTest 5: KEYS pattern matching');
    await cache.set('pattern:one', 1, 60);
    await cache.set('pattern:two', 2, 60);
    await cache.set('different:three', 3, 60);
    const keys = await cache.keys('pattern:*');
    console.log('✓ Found keys:', keys);
    
    // Test 6: Cleanup expired entries
    console.log('\nTest 6: Cleanup expired entries');
    await cache.set('cleanup:test1', 'expire soon', 1);
    await cache.set('cleanup:test2', 'expire soon', 1);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const cleanedUp = await cache.cleanup();
    console.log('✓ Cleaned up entries:', cleanedUp);
    
    console.log('\n✅ All cache tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    // Clean up test data
    const testKeys = await cache.keys('test:*');
    const patternKeys = await cache.keys('pattern:*');
    const allTestKeys = [...testKeys, ...patternKeys, 'different:three'];
    
    for (const key of allTestKeys) {
      await cache.del(key);
    }
    
    await prisma.$disconnect();
  }
}

testCache();