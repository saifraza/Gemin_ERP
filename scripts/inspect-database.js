#!/usr/bin/env node

/**
 * Comprehensive database inspection script
 * Checks companies, users, and other entities with detailed output
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../services/core-api/.env') });

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(title) {
  console.log('\n' + colorize('='.repeat(60), 'cyan'));
  console.log(colorize(title.toUpperCase(), 'bright'));
  console.log(colorize('='.repeat(60), 'cyan'));
}

function printSubHeader(title) {
  console.log('\n' + colorize(title, 'yellow'));
  console.log(colorize('-'.repeat(title.length), 'yellow'));
}

async function inspectDatabase() {
  console.log(colorize('\n🔍 MSPIL ERP Database Inspector\n', 'bright'));
  
  try {
    // Test connection
    await prisma.$connect();
    console.log(colorize('✅ Database connection established', 'green'));
    console.log(`Connection string: ${process.env.DATABASE_URL ? 'Configured' : colorize('Not configured', 'red')}`);
    
    // Get database statistics
    printHeader('Database Statistics');
    
    const stats = await Promise.all([
      prisma.company.count(),
      prisma.user.count(),
      prisma.factory.count(),
      prisma.division.count(),
      prisma.equipment.count(),
      prisma.productionBatch.count(),
      prisma.event.count(),
      prisma.mCPTool.count(),
    ]);
    
    const [companies, users, factories, divisions, equipment, batches, events, tools] = stats;
    
    console.log(`
${colorize('Core Entities:', 'cyan')}
  • Companies:        ${colorize(companies.toString(), 'bright')}
  • Users:            ${colorize(users.toString(), 'bright')}
  • Factories:        ${colorize(factories.toString(), 'bright')}
  • Divisions:        ${colorize(divisions.toString(), 'bright')}
  
${colorize('Operations:', 'cyan')}
  • Equipment:        ${colorize(equipment.toString(), 'bright')}
  • Production Batches: ${colorize(batches.toString(), 'bright')}
  
${colorize('System:', 'cyan')}
  • Events:           ${colorize(events.toString(), 'bright')}
  • MCP Tools:        ${colorize(tools.toString(), 'bright')}
    `);
    
    // Detailed company information
    if (companies > 0) {
      printHeader('Company Details');
      
      const companyList = await prisma.company.findMany({
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
          factories: {
            include: {
              divisions: true,
            },
          },
        },
      });
      
      for (const company of companyList) {
        printSubHeader(`Company: ${company.name}`);
        console.log(`
  ID:           ${company.id}
  Code:         ${colorize(company.code, 'bright')}
  Email:        ${company.email}
  Phone:        ${company.phone}
  GST Number:   ${company.gstNumber || colorize('Not provided', 'dim')}
  PAN Number:   ${company.panNumber || colorize('Not provided', 'dim')}
  Website:      ${company.website || colorize('Not provided', 'dim')}
  Created:      ${company.createdAt.toLocaleString()}
        `);
        
        if (company.address) {
          console.log('  Address:');
          Object.entries(company.address).forEach(([key, value]) => {
            console.log(`    ${key}: ${value}`);
          });
        }
        
        // Users
        if (company.users.length > 0) {
          console.log(`\n  ${colorize('Users:', 'cyan')} (${company.users.length} total)`);
          company.users.forEach(user => {
            const status = user.isActive ? colorize('Active', 'green') : colorize('Inactive', 'red');
            console.log(`    • ${user.name} - ${user.email} [${user.role}] ${status}`);
          });
        }
        
        // Factories
        if (company.factories.length > 0) {
          console.log(`\n  ${colorize('Factories:', 'cyan')} (${company.factories.length} total)`);
          company.factories.forEach(factory => {
            console.log(`    • ${factory.name} (${factory.code}) - Type: ${factory.type}`);
            if (factory.divisions.length > 0) {
              console.log(`      Divisions: ${factory.divisions.map(d => d.type).join(', ')}`);
            }
          });
        }
      }
    } else {
      console.log(colorize('\n❌ No companies found in the database', 'red'));
    }
    
    // User roles breakdown
    if (users > 0) {
      printHeader('User Analysis');
      
      const roleBreakdown = await prisma.user.groupBy({
        by: ['role'],
        _count: true,
      });
      
      console.log('\nUser distribution by role:');
      roleBreakdown.forEach(({ role, _count }) => {
        const bar = '█'.repeat(Math.max(1, Math.floor(_count * 10 / users)));
        console.log(`  ${role.padEnd(15)} ${bar} ${_count}`);
      });
      
      // Active vs Inactive users
      const activeUsers = await prisma.user.count({ where: { isActive: true } });
      const inactiveUsers = users - activeUsers;
      
      console.log('\nUser status:');
      console.log(`  Active:   ${colorize(activeUsers.toString(), 'green')} (${(activeUsers/users*100).toFixed(1)}%)`);
      console.log(`  Inactive: ${colorize(inactiveUsers.toString(), 'red')} (${(inactiveUsers/users*100).toFixed(1)}%)`);
      
      // Recent users
      const recentUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          company: {
            select: { name: true },
          },
        },
      });
      
      if (recentUsers.length > 0) {
        console.log('\nRecently created users:');
        recentUsers.forEach(user => {
          const timeAgo = getTimeAgo(user.createdAt);
          console.log(`  • ${user.name} (${user.company.name}) - ${timeAgo}`);
        });
      }
    }
    
    // Factory operations summary
    if (factories > 0) {
      printHeader('Factory Operations');
      
      const factoryTypes = await prisma.factory.groupBy({
        by: ['type'],
        _count: true,
      });
      
      console.log('\nFactory types:');
      factoryTypes.forEach(({ type, _count }) => {
        console.log(`  • ${type}: ${_count}`);
      });
      
      // Equipment status
      if (equipment > 0) {
        const equipmentStatus = await prisma.equipment.groupBy({
          by: ['status'],
          _count: true,
        });
        
        console.log('\nEquipment status:');
        equipmentStatus.forEach(({ status, _count }) => {
          const color = status === 'OPERATIONAL' ? 'green' : 
                       status === 'MAINTENANCE' ? 'yellow' : 'red';
          console.log(`  • ${status}: ${colorize(_count.toString(), color)}`);
        });
      }
    }
    
    // System health check
    printHeader('System Health');
    
    // Check for recent events
    const recentEventCount = await prisma.event.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });
    
    console.log(`\nEvents in last 24 hours: ${colorize(recentEventCount.toString(), 'bright')}`);
    
    // Check for unprocessed events
    const unprocessedEvents = await prisma.event.count({
      where: { processed: false },
    });
    
    if (unprocessedEvents > 0) {
      console.log(`Unprocessed events: ${colorize(unprocessedEvents.toString(), 'yellow')} ⚠️`);
    } else {
      console.log(`Unprocessed events: ${colorize('0', 'green')} ✓`);
    }
    
    // Database size estimate (row count)
    const totalRows = Object.values(stats).reduce((a, b) => a + b, 0);
    console.log(`\nTotal database rows: ${colorize(totalRows.toString(), 'bright')}`);
    
  } catch (error) {
    console.error(colorize('\n❌ Database Error:', 'red'), error.message);
    
    if (error.code === 'P1001') {
      console.error(colorize('\nCannot reach database server. Please check:', 'yellow'));
      console.error('1. PostgreSQL is running');
      console.error('2. DATABASE_URL is correctly configured');
      console.error('3. Network/firewall settings');
    } else if (error.code === 'P2021') {
      console.error(colorize('\nTable does not exist. Run migrations:', 'yellow'));
      console.error('cd services/core-api && npx prisma migrate deploy');
    }
    
    console.error('\nFull error:', error);
  } finally {
    await prisma.$disconnect();
    console.log(colorize('\n✅ Database inspection complete\n', 'green'));
  }
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'just now';
}

// Run the inspection
inspectDatabase().catch(console.error);