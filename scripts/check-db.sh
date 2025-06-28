#!/bin/bash

# Script to check PostgreSQL database for companies and users

echo "🔍 Database Check Script"
echo "======================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
echo "Checking prerequisites..."

if ! command_exists node; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites satisfied${NC}"
echo ""

# Check if DATABASE_URL is set
if [ -f "services/core-api/.env" ]; then
    echo -e "${GREEN}✓ Found .env file in core-api service${NC}"
    # Source the env file to check DATABASE_URL
    export $(cat services/core-api/.env | grep -v '^#' | xargs)
    
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${YELLOW}⚠️  DATABASE_URL is not set in .env file${NC}"
        echo "Please ensure DATABASE_URL is configured properly"
    else
        echo -e "${GREEN}✓ DATABASE_URL is configured${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No .env file found in services/core-api/${NC}"
    echo "Make sure to configure your database connection"
fi

echo ""
echo "Running database check..."
echo "========================"

# Change to core-api directory to ensure proper module resolution
cd services/core-api

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Check if Prisma client is generated
if [ ! -d "node_modules/.prisma/client" ]; then
    echo -e "${YELLOW}Generating Prisma client...${NC}"
    npx prisma generate
fi

# Run the database check script
echo ""
echo "Executing database query..."
echo ""

# Create a temporary check script
cat > temp-check-db.js << 'EOF'
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error'],
});

async function checkDatabase() {
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');
    
    // Count records
    const companyCount = await prisma.company.count();
    const userCount = await prisma.user.count();
    const factoryCount = await prisma.factory.count();
    
    console.log('📊 Database Statistics:');
    console.log(`   Companies: ${companyCount}`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Factories: ${factoryCount}\n`);
    
    // Get company details
    if (companyCount > 0) {
      console.log('🏢 Companies in database:');
      const companies = await prisma.company.findMany({
        include: {
          users: true,
          factories: true,
        },
      });
      
      companies.forEach((company, index) => {
        console.log(`\n${index + 1}. ${company.name} (${company.code})`);
        console.log(`   Email: ${company.email}`);
        console.log(`   Phone: ${company.phone}`);
        console.log(`   Users: ${company.users.length}`);
        console.log(`   Factories: ${company.factories.length}`);
        
        if (company.users.length > 0) {
          console.log('   User list:');
          company.users.forEach(user => {
            console.log(`     - ${user.name} (${user.email}) - ${user.role}`);
          });
        }
      });
    } else {
      console.log('❌ No companies found in the database');
    }
    
    // Get user details
    if (userCount > 0) {
      console.log('\n👥 Users in database:');
      const users = await prisma.user.findMany({
        include: {
          company: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });
      
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Company: ${user.company.name}`);
        console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'P1001') {
      console.error('\n⚠️  Cannot reach database server');
      console.error('Make sure PostgreSQL is running and accessible');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase().catch(console.error);
EOF

# Run the temporary script
node temp-check-db.js

# Clean up
rm -f temp-check-db.js

# Return to original directory
cd ../..

echo ""
echo -e "${GREEN}Database check completed!${NC}"