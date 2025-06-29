#!/usr/bin/env node

/**
 * Initialize RBAC tables and seed data
 * This script calls the RBAC init endpoints to set up the database
 */

const API_URL = process.env.CORE_API_URL || 'http://localhost:3001';

async function initRBAC() {
  console.log('🔧 Initializing RBAC tables...');
  console.log(`Using API URL: ${API_URL}`);

  try {
    // First check status
    console.log('\n📊 Checking RBAC status...');
    const statusResponse = await fetch(`${API_URL}/api/rbac-init/status`);
    const status = await statusResponse.json();
    console.log('Current status:', status);

    // Initialize tables
    console.log('\n🏗️  Creating RBAC tables...');
    const initResponse = await fetch(`${API_URL}/api/rbac-init/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const initResult = await initResponse.json();
    console.log('Init result:', initResult);

    if (initResponse.ok) {
      // Seed data
      console.log('\n🌱 Seeding RBAC data...');
      const seedResponse = await fetch(`${API_URL}/api/rbac-init/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const seedResult = await seedResponse.json();
      console.log('Seed result:', seedResult);

      // Check final status
      console.log('\n✅ Checking final status...');
      const finalStatusResponse = await fetch(`${API_URL}/api/rbac-init/status`);
      const finalStatus = await finalStatusResponse.json();
      console.log('Final status:', finalStatus);

      console.log('\n🎉 RBAC initialization completed successfully!');
    } else {
      console.error('\n❌ Failed to initialize RBAC tables:', initResult);
    }
  } catch (error) {
    console.error('\n❌ Error initializing RBAC:', error.message);
    console.error('Make sure the core-api service is running on', API_URL);
  }
}

// Run the initialization
initRBAC();