// Debug script to test the companies API endpoint
const fetch = require('node-fetch');

const API_URL = 'http://localhost:4000';
const CORE_API_URL = 'http://localhost:3001';

// Replace with your actual auth token
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE';

async function debugCompaniesEndpoint() {
  console.log('=== Companies API Debug ===\n');

  // Test 1: Direct Core API call
  try {
    console.log('1. Testing direct Core API call...');
    const res1 = await fetch(`${CORE_API_URL}/api/companies`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`   Status: ${res1.status}`);
    const data1 = await res1.json();
    console.log(`   Response:`, JSON.stringify(data1, null, 2));
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n');

  // Test 2: API Gateway call
  try {
    console.log('2. Testing API Gateway call...');
    const res2 = await fetch(`${API_URL}/api/companies`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`   Status: ${res2.status}`);
    const data2 = await res2.json();
    console.log(`   Response:`, JSON.stringify(data2, null, 2));
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n');

  // Test 3: Test Companies endpoint
  try {
    console.log('3. Testing test-companies endpoint...');
    const res3 = await fetch(`${CORE_API_URL}/api/test-companies/count`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(`   Status: ${res3.status}`);
    const data3 = await res3.json();
    console.log(`   Response:`, JSON.stringify(data3, null, 2));
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n');

  // Test 4: Test user context
  try {
    console.log('4. Testing user context...');
    const res4 = await fetch(`${CORE_API_URL}/api/test-companies/context`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`   Status: ${res4.status}`);
    const data4 = await res4.json();
    console.log(`   Response:`, JSON.stringify(data4, null, 2));
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n');

  // Test 5: System database check
  try {
    console.log('5. Testing system database...');
    const res5 = await fetch(`${CORE_API_URL}/api/system/database`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(`   Status: ${res5.status}`);
    const data5 = await res5.json();
    console.log(`   Response:`, JSON.stringify(data5, null, 2));
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
}

console.log('Instructions:');
console.log('1. Replace YOUR_AUTH_TOKEN_HERE with your actual auth token');
console.log('2. Make sure both Core API (port 3001) and API Gateway (port 4000) are running');
console.log('3. Run: node debug-companies.js\n');

// Uncomment to run the debug
// debugCompaniesEndpoint();