import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function cleanupTestData() {
  try {
    console.log('🧹 Starting test data cleanup...\n');

    // Delete test companies
    const testCompanies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: 'Test Company' } },
          { code: { startsWith: 'TEST' } },
          { code: 'DEFAULT' },
          { name: 'Default Company' }
        ]
      }
    });

    if (testCompanies.length > 0) {
      console.log(`Found ${testCompanies.length} test companies:`);
      testCompanies.forEach(company => {
        console.log(`  - ${company.name} (${company.code})`);
      });

      // Delete test companies (this will cascade delete related data)
      const deleteResult = await prisma.company.deleteMany({
        where: {
          id: { in: testCompanies.map(c => c.id) }
        }
      });

      console.log(`✅ Deleted ${deleteResult.count} test companies\n`);
    } else {
      console.log('No test companies found.\n');
    }

    // Delete test users (not associated with remaining companies)
    const testUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'test' } },
          { username: { contains: 'test' } },
          { name: { contains: 'Test User' } }
        ]
      }
    });

    if (testUsers.length > 0) {
      console.log(`Found ${testUsers.length} test users:`);
      testUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.email})`);
      });

      const deleteUserResult = await prisma.user.deleteMany({
        where: {
          id: { in: testUsers.map(u => u.id) }
        }
      });

      console.log(`✅ Deleted ${deleteUserResult.count} test users\n`);
    } else {
      console.log('No test users found.\n');
    }

    // Show remaining companies and users
    const remainingCompanies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            users: true,
            factories: true
          }
        }
      }
    });

    console.log('📊 Remaining data in database:');
    console.log(`\nCompanies (${remainingCompanies.length}):`);
    remainingCompanies.forEach(company => {
      console.log(`  - ${company.name} (${company.code})`);
      console.log(`    Users: ${company._count.users}, Factories: ${company._count.factories}`);
    });

    const remainingUsers = await prisma.user.count();
    console.log(`\nTotal remaining users: ${remainingUsers}`);

    console.log('\n✨ Cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupTestData();