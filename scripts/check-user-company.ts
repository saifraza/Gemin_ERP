import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function checkUserCompany() {
  try {
    console.log('🔍 Checking user and company associations...\n');

    // Find all users
    const users = await prisma.user.findMany({
      include: {
        company: true,
        factoryAccess: {
          include: {
            factory: true
          }
        }
      }
    });

    console.log(`Found ${users.length} users:\n`);
    
    users.forEach(user => {
      console.log(`User: ${user.name} (${user.username})`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Company: ${user.company?.name || 'No company'} (${user.company?.code || 'N/A'})`);
      console.log(`  Access Level: ${user.accessLevel || 'FACTORY'}`);
      console.log(`  Factory Access: ${user.factoryAccess.length} factories`);
      if (user.factoryAccess.length > 0) {
        user.factoryAccess.forEach(access => {
          console.log(`    - ${access.factory.name} (${access.role})`);
        });
      }
      console.log('');
    });

    // Find all companies
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            users: true,
            factories: true
          }
        }
      }
    });

    console.log('\n📊 Companies in database:');
    companies.forEach(company => {
      console.log(`\n${company.name} (${company.code})`);
      console.log(`  ID: ${company.id}`);
      console.log(`  Users: ${company._count.users}`);
      console.log(`  Factories: ${company._count.factories}`);
    });

    // Find the MSPIL company
    const mspil = companies.find(c => c.code === 'MSPIL' || c.name.includes('Mahakaushal'));
    if (mspil) {
      console.log('\n✅ Found Mahakaushal Sugar & Power Industries Ltd');
      console.log(`   ID: ${mspil.id}`);
      
      // Update saif user to MSPIL company
      const saifUser = users.find(u => u.username === 'saif');
      if (saifUser && saifUser.companyId !== mspil.id) {
        console.log(`\n🔄 Updating user 'saif' to company MSPIL...`);
        await prisma.user.update({
          where: { id: saifUser.id },
          data: { companyId: mspil.id }
        });
        console.log('✅ User updated successfully!');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkUserCompany();