#!/usr/bin/env node

// Script to check PostgreSQL database for companies and users
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from core-api
dotenv.config({ path: join(__dirname, '../services/core-api/.env') });

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('\n🔍 Checking PostgreSQL Database...\n');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Successfully connected to database\n');
    
    // Check for companies
    console.log('📊 Checking Companies:');
    console.log('=' * 50);
    const companies = await prisma.company.findMany({
      include: {
        factories: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
    
    if (companies.length === 0) {
      console.log('❌ No companies found in the database');
    } else {
      console.log(`✅ Found ${companies.length} company(ies):\n`);
      
      companies.forEach((company, index) => {
        console.log(`${index + 1}. Company: ${company.name}`);
        console.log(`   - ID: ${company.id}`);
        console.log(`   - Code: ${company.code}`);
        console.log(`   - Email: ${company.email}`);
        console.log(`   - Phone: ${company.phone}`);
        console.log(`   - GST Number: ${company.gstNumber || 'Not provided'}`);
        console.log(`   - PAN Number: ${company.panNumber || 'Not provided'}`);
        console.log(`   - Website: ${company.website || 'Not provided'}`);
        console.log(`   - Created: ${company.createdAt.toLocaleString()}`);
        console.log(`   - Factories: ${company.factories.length}`);
        console.log(`   - Users: ${company.users.length}`);
        
        if (company.address) {
          console.log('   - Address:', JSON.stringify(company.address, null, 2));
        }
        
        if (company.users.length > 0) {
          console.log('\n   Associated Users:');
          company.users.forEach((user, userIndex) => {
            console.log(`   ${userIndex + 1}. ${user.name} (${user.email}) - ${user.role}`);
          });
        }
        
        console.log('\n' + '-'.repeat(50) + '\n');
      });
    }
    
    // Check for all users
    console.log('\n📊 All Users in Database:');
    console.log('=' * 50);
    const allUsers = await prisma.user.findMany({
      include: {
        company: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in the database');
    } else {
      console.log(`✅ Found ${allUsers.length} user(s):\n`);
      
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. User: ${user.name}`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Username: ${user.username}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Company: ${user.company.name} (${user.company.code})`);
        console.log(`   - Phone: ${user.phone || 'Not provided'}`);
        console.log(`   - Active: ${user.isActive ? 'Yes' : 'No'}`);
        console.log(`   - Created: ${user.createdAt.toLocaleString()}`);
        console.log('\n' + '-'.repeat(50) + '\n');
      });
    }
    
    // Check for factories
    console.log('\n📊 Checking Factories:');
    console.log('=' * 50);
    const factories = await prisma.factory.findMany({
      include: {
        company: {
          select: {
            name: true
          }
        },
        divisions: true
      }
    });
    
    if (factories.length === 0) {
      console.log('❌ No factories found in the database');
    } else {
      console.log(`✅ Found ${factories.length} factory(ies):\n`);
      
      factories.forEach((factory, index) => {
        console.log(`${index + 1}. Factory: ${factory.name}`);
        console.log(`   - Code: ${factory.code}`);
        console.log(`   - Type: ${factory.type}`);
        console.log(`   - Company: ${factory.company.name}`);
        console.log(`   - Divisions: ${factory.divisions.length}`);
        console.log(`   - Location: ${JSON.stringify(factory.location)}`);
        console.log(`   - Capacity: ${JSON.stringify(factory.capacity)}`);
        console.log('\n' + '-'.repeat(50) + '\n');
      });
    }
    
    // Summary statistics
    console.log('\n📈 Database Summary:');
    console.log('=' * 50);
    console.log(`Total Companies: ${companies.length}`);
    console.log(`Total Users: ${allUsers.length}`);
    console.log(`Total Factories: ${factories.length}`);
    
    // Check for admin users
    const adminUsers = allUsers.filter(user => user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');
    console.log(`Admin Users: ${adminUsers.length}`);
    
    if (adminUsers.length > 0) {
      console.log('\nAdmin User Details:');
      adminUsers.forEach(admin => {
        console.log(`- ${admin.name} (${admin.email}) - ${admin.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database Error:', error.message);
    console.error('\nMake sure:');
    console.error('1. PostgreSQL is running');
    console.error('2. DATABASE_URL is correctly configured');
    console.error('3. Database migrations have been run');
    console.error('\nFull error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ Database connection closed');
  }
}

// Run the check
checkDatabase().catch(console.error);