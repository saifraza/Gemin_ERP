#!/usr/bin/env node

// Debug script to test API endpoints and check permissions

const API_URL = 'http://localhost:4000';

async function debugApi() {
  console.log('🔍 Debugging Master Data API Issue\n');
  
  // Get auth token from command line or use a test token
  const token = process.argv[2];
  
  if (!token) {
    console.error('❌ Please provide an auth token as argument:');
    console.error('   node debug-api.js YOUR_AUTH_TOKEN');
    console.error('\nYou can get the token from browser DevTools:');
    console.error('1. Open the app in browser');
    console.error('2. Login');
    console.error('3. Open DevTools > Application > Local Storage');
    console.error('4. Copy the value of auth_token');
    process.exit(1);
  }
  
  console.log(`✅ Using token: ${token.substring(0, 20)}...`);
  
  // Test endpoints
  const endpoints = [
    { name: 'Companies', url: '/api/companies' },
    { name: 'Users', url: '/api/users' },
    { name: 'Factories', url: '/api/factories' },
    { name: 'RBAC User Info', url: '/api/rbac/users/me' },
    { name: 'Health Check', url: '/health' },
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n📍 Testing ${endpoint.name}: ${endpoint.url}`);
    
    try {
      const response = await fetch(`${API_URL}${endpoint.url}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      const contentType = response.headers.get('content-type');
      console.log(`   Content-Type: ${contentType}`);
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (response.ok) {
          if (Array.isArray(data)) {
            console.log(`   ✅ Success: Received ${data.length} items`);
          } else if (data.data && Array.isArray(data.data)) {
            console.log(`   ✅ Success: Received ${data.data.length} items (paginated)`);
            if (data.pagination) {
              console.log(`   📊 Pagination: Page ${data.pagination.page}/${data.pagination.totalPages}, Total: ${data.pagination.total}`);
            }
          } else {
            console.log(`   ✅ Success:`, JSON.stringify(data, null, 2));
          }
        } else {
          console.log(`   ❌ Error Response:`, JSON.stringify(data, null, 2));
        }
      } else {
        const text = await response.text();
        console.log(`   ⚠️  Non-JSON Response:`, text.substring(0, 200));
      }
    } catch (error) {
      console.log(`   💥 Request Failed:`, error.message);
    }
  }
  
  // Check user permissions
  console.log('\n\n🔐 Checking User Permissions...');
  try {
    const response = await fetch(`${API_URL}/api/rbac/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const userData = await response.json();
      console.log('\n👤 User Info:');
      console.log(`   ID: ${userData.user.id}`);
      console.log(`   Name: ${userData.user.name}`);
      console.log(`   Email: ${userData.user.email}`);
      console.log(`   Company: ${userData.user.company?.name || 'N/A'}`);
      
      console.log('\n👥 Roles:');
      userData.roles.forEach(role => {
        console.log(`   - ${role.role.name} (${role.scope} scope${role.scopeId ? ` - ${role.scopeId}` : ''})`);
      });
      
      console.log('\n🔑 Permissions:');
      const permissionsByModule = {};
      userData.permissions.forEach(perm => {
        const moduleName = perm.permission.module.name;
        if (!permissionsByModule[moduleName]) {
          permissionsByModule[moduleName] = [];
        }
        permissionsByModule[moduleName].push(perm.permission.code);
      });
      
      Object.entries(permissionsByModule).forEach(([module, perms]) => {
        console.log(`   ${module}:`);
        perms.forEach(perm => console.log(`     - ${perm}`));
      });
      
      // Check specific permissions
      console.log('\n🎯 Checking Required Permissions:');
      const requiredPerms = ['COMPANIES_READ', 'USERS_READ', 'BUSINESS_UNITS_READ'];
      requiredPerms.forEach(perm => {
        const hasPermission = userData.permissions.some(p => p.permission.code === perm);
        console.log(`   ${perm}: ${hasPermission ? '✅' : '❌'}`);
      });
      
    } else {
      const error = await response.json();
      console.log('❌ Failed to get user info:', error);
    }
  } catch (error) {
    console.log('💥 Failed to check permissions:', error.message);
  }
}

debugApi().catch(console.error);