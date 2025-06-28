#!/usr/bin/env node

import { Client } from 'pg';

// Test PostgreSQL connection
async function testPostgres() {
  console.log('🔍 Testing PostgreSQL Connection...\n');

  // Public URL for testing
  const publicUrl = 'postgresql://postgres:RgnfOBTspYXhkAMkZmiQZiMoFALDBWEO@metro.proxy.rlwy.net:38625/railway';
  
  console.log('Testing public PostgreSQL URL...');
  console.log(`Host: metro.proxy.rlwy.net:38625`);
  console.log(`Database: railway\n`);

  const client = new Client({
    connectionString: publicUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('1. Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully');

    console.log('\n2. Testing query...');
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Query successful');
    console.log('   Current time:', result.rows[0].current_time);
    console.log('   PostgreSQL version:', result.rows[0].version.split(' ')[1]);

    console.log('\n3. Checking database info...');
    const dbInfo = await client.query(`
      SELECT current_database() as database,
             current_user as user,
             inet_server_addr() as server_addr,
             inet_server_port() as server_port
    `);
    console.log('✅ Database info:');
    Object.entries(dbInfo.rows[0]).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });

    console.log('\n🎉 PostgreSQL connection successful!');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await client.end();
    console.log('\nConnection closed.');
  }
}

// Run test
testPostgres();