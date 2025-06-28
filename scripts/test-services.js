#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuration for Railway services
const SERVICES = {
  'web': {
    url: process.env.WEB_URL || 'https://web-production-66cf.up.railway.app',
    isExternal: true
  },
  'core-api': {
    url: process.env.CORE_API_URL || 'http://core-api.railway.internal:3000',
    isInternal: true,
    externalUrl: 'https://core-api-production-xxxx.up.railway.app' // Update with actual URL
  },
  'api-gateway': {
    url: process.env.API_GATEWAY_URL || 'http://api-gateway.railway.internal:3000',
    isInternal: true,
    externalUrl: 'https://api-gateway-production-xxxx.up.railway.app' // Update with actual URL
  },
  'mcp-orchestrator': {
    url: process.env.MCP_ORCHESTRATOR_URL || 'http://mcp-orchestrator.railway.internal:3001',
    isInternal: true,
    externalUrl: 'https://mcp-orchestrator-production-xxxx.up.railway.app' // Update with actual URL
  },
  'event-processor': {
    url: process.env.EVENT_PROCESSOR_URL || 'http://event-processor.railway.internal:3003',
    isInternal: true,
    externalUrl: 'https://event-processor-production-xxxx.up.railway.app' // Update with actual URL
  }
};

// Test configurations
const TESTS = {
  'Database Connection': {
    services: ['core-api', 'event-processor'],
    endpoint: '/health',
    check: (data) => data.database === 'connected'
  },
  'Redis Connection': {
    services: ['core-api', 'event-processor'],
    endpoint: '/health',
    check: (data) => data.cache === 'connected' || data.redis === 'connected'
  },
  'Inter-Service Communication': {
    services: ['api-gateway'],
    endpoint: '/api/health/all',
    check: (data) => data.services && Object.keys(data.services).length > 0
  },
  'JWT Authentication': {
    services: ['core-api'],
    endpoint: '/api/auth/verify',
    method: 'POST',
    requiresAuth: true,
    check: (data, response) => response.statusCode === 401 || data.valid === true
  }
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ data: jsonData, response: res });
        } catch (e) {
          resolve({ data: data, response: res });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test individual service health
async function testServiceHealth(serviceName, serviceConfig) {
  console.log(`\n🔍 Testing ${serviceName}...`);
  
  try {
    const healthUrl = serviceConfig.url + '/health';
    const { data, response } = await makeRequest(healthUrl);
    
    if (response.statusCode === 200 && data.status === 'healthy') {
      console.log(`✅ ${serviceName} is healthy`);
      return { service: serviceName, status: 'healthy', data };
    } else {
      console.log(`❌ ${serviceName} health check failed:`, data);
      return { service: serviceName, status: 'unhealthy', data };
    }
  } catch (error) {
    console.log(`❌ ${serviceName} is unreachable:`, error.message);
    return { service: serviceName, status: 'unreachable', error: error.message };
  }
}

// Run specific tests
async function runTest(testName, testConfig) {
  console.log(`\n🧪 Running test: ${testName}`);
  
  const results = [];
  
  for (const serviceName of testConfig.services) {
    const serviceConfig = SERVICES[serviceName];
    if (!serviceConfig) {
      console.log(`⚠️  Service ${serviceName} not configured`);
      continue;
    }
    
    try {
      const url = serviceConfig.url + testConfig.endpoint;
      const options = {
        method: testConfig.method || 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (testConfig.requiresAuth) {
        options.headers['Authorization'] = 'Bearer dummy-token';
      }
      
      const { data, response } = await makeRequest(url, options);
      
      if (testConfig.check(data, response)) {
        console.log(`  ✅ ${serviceName}: Test passed`);
        results.push({ service: serviceName, passed: true });
      } else {
        console.log(`  ❌ ${serviceName}: Test failed`, data);
        results.push({ service: serviceName, passed: false, data });
      }
    } catch (error) {
      console.log(`  ❌ ${serviceName}: Error -`, error.message);
      results.push({ service: serviceName, passed: false, error: error.message });
    }
  }
  
  return results;
}

// Create test authentication token
async function getTestToken() {
  try {
    const loginUrl = SERVICES['core-api'].url + '/api/auth/login';
    const { data } = await makeRequest(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });
    
    return data.token;
  } catch (error) {
    console.log('⚠️  Could not get test token:', error.message);
    return null;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 ERP Service Integration Test Suite');
  console.log('=====================================');
  
  // Test 1: Service Health Checks
  console.log('\n📋 Test 1: Service Health Checks');
  const healthResults = [];
  
  for (const [name, config] of Object.entries(SERVICES)) {
    const result = await testServiceHealth(name, config);
    healthResults.push(result);
  }
  
  // Test 2: Specific Integration Tests
  console.log('\n📋 Test 2: Integration Tests');
  const testResults = [];
  
  for (const [testName, testConfig] of Object.entries(TESTS)) {
    const results = await runTest(testName, testConfig);
    testResults.push({ test: testName, results });
  }
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('===============');
  
  const healthyServices = healthResults.filter(r => r.status === 'healthy').length;
  console.log(`\nService Health: ${healthyServices}/${healthResults.length} services healthy`);
  
  healthResults.forEach(result => {
    const icon = result.status === 'healthy' ? '✅' : '❌';
    console.log(`  ${icon} ${result.service}: ${result.status}`);
  });
  
  console.log('\nIntegration Tests:');
  testResults.forEach(({ test, results }) => {
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const icon = passed === total ? '✅' : passed > 0 ? '⚠️' : '❌';
    console.log(`  ${icon} ${test}: ${passed}/${total} passed`);
  });
  
  // Environment Variables Check
  console.log('\n🔐 Environment Variables Check');
  const requiredEnvVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
    'CORE_API_URL',
    'MCP_ORCHESTRATOR_URL',
    'EVENT_PROCESSOR_URL'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingEnvVars.length > 0) {
    console.log('❌ Missing environment variables:');
    missingEnvVars.forEach(varName => console.log(`  - ${varName}`));
  } else {
    console.log('✅ All required environment variables are set');
  }
  
  // Final verdict
  const allHealthy = healthyServices === healthResults.length;
  const allTestsPassed = testResults.every(({ results }) => 
    results.every(r => r.passed)
  );
  
  console.log('\n🎯 Final Verdict:');
  if (allHealthy && allTestsPassed) {
    console.log('✅ All systems operational! Your ERP is ready to go! 🚀');
  } else if (healthyServices > 0) {
    console.log('⚠️  Some services need attention. Check the logs above.');
  } else {
    console.log('❌ Critical issues detected. Please check your configuration.');
  }
}

// Run from Railway
if (process.env.RAILWAY_ENVIRONMENT) {
  console.log('🚂 Running in Railway environment');
  console.log('Note: Internal service URLs will be used for testing');
}

// Execute tests
runAllTests().catch(console.error);