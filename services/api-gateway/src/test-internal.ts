// Test script to verify Railway internal networking
import fetch from 'node-fetch';

async function testInternalNetworking() {
  console.log('Testing Railway internal networking...\n');
  
  // Log environment
  console.log('Environment variables:');
  console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
  console.log('RAILWAY_PRIVATE_DOMAIN:', process.env.RAILWAY_PRIVATE_DOMAIN);
  console.log('PORT:', process.env.PORT);
  console.log('CORE_API_URL:', process.env.CORE_API_URL);
  console.log('\n');
  
  // Test URLs
  const urlsToTest = [
    // Standard internal URL
    'http://core-api.railway.internal/health',
    // With explicit port 80
    'http://core-api.railway.internal:80/health',
    // Using the service's PORT
    'http://core-api.railway.internal:8080/health',
    // Without domain
    'http://core-api/health',
    // Direct to service name
    'http://core-api:8080/health',
  ];
  
  for (const url of urlsToTest) {
    console.log(`Testing: ${url}`);
    try {
      const response = await fetch(url, {
        method: 'GET',
        timeout: 5000,
        signal: AbortSignal.timeout(5000)
      });
      console.log(`✅ Success! Status: ${response.status}`);
      const data = await response.text();
      console.log(`Response: ${data.substring(0, 100)}...`);
    } catch (error: any) {
      console.log(`❌ Failed: ${error.message}`);
      if (error.cause) {
        console.log(`   Cause: ${error.cause}`);
      }
    }
    console.log('---\n');
  }
}

// Run the test
testInternalNetworking().catch(console.error);