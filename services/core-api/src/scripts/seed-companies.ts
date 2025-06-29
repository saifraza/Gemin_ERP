import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function seedCompanies() {
  try {
    console.log('Starting company seed...');
    
    // Check if companies already exist
    const existingCompanies = await prisma.company.count();
    if (existingCompanies > 0) {
      console.log(`Found ${existingCompanies} existing companies. Skipping seed.`);
      return;
    }
    
    // Create test companies
    const companies = await prisma.company.createMany({
      data: [
        {
          name: 'MSPIL Corporation',
          code: 'MSPIL',
          email: 'info@mspil.com',
          phone: '+91-1234567890',
          address: {
            street: '123 Sugar Mill Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            pincode: '400001'
          },
          gstNumber: '27AAACM0000A1Z5',
          panNumber: 'AAACM0000A',
          website: 'https://www.mspil.com'
        },
        {
          name: 'Sugar Industries Ltd',
          code: 'SUGAR',
          email: 'contact@sugarindustries.com',
          phone: '+91-9876543210',
          address: {
            street: '456 Industrial Area',
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
            pincode: '411001'
          },
          gstNumber: '27AAACS0000B1Z5',
          panNumber: 'AAACS0000B',
          website: 'https://www.sugarindustries.com'
        },
        {
          name: 'Ethanol Processors Pvt Ltd',
          code: 'ETHANOL',
          email: 'info@ethanolprocessors.com',
          phone: '+91-8765432109',
          address: {
            street: '789 Distillery Lane',
            city: 'Nashik',
            state: 'Maharashtra',
            country: 'India',
            pincode: '422001'
          },
          gstNumber: '27AAACE0000C1Z5',
          panNumber: 'AAACE0000C',
          website: 'https://www.ethanolprocessors.com'
        }
      ]
    });
    
    console.log(`Successfully created ${companies.count} companies`);
    
    // Now create factories for the first company
    const mspilCompany = await prisma.company.findUnique({
      where: { code: 'MSPIL' }
    });
    
    if (mspilCompany) {
      const factories = await prisma.factory.createMany({
        data: [
          {
            companyId: mspilCompany.id,
            name: 'MSPIL Sugar Factory - Unit 1',
            code: 'MSPIL-SF1',
            type: 'INTEGRATED',
            location: {
              address: '123 Sugar Mill Road, Mumbai',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001'
            },
            coordinates: {
              lat: 19.0760,
              lng: 72.8777
            },
            capacity: {
              sugar: 5000,
              ethanol: 100000,
              power: 30,
              feed: 200
            }
          },
          {
            companyId: mspilCompany.id,
            name: 'MSPIL Distillery - Unit 2',
            code: 'MSPIL-DIS2',
            type: 'DISTILLERY',
            location: {
              address: '456 Distillery Road, Pune',
              city: 'Pune',
              state: 'Maharashtra',
              pincode: '411001'
            },
            coordinates: {
              lat: 18.5204,
              lng: 73.8567
            },
            capacity: {
              sugar: 0,
              ethanol: 150000,
              power: 15,
              feed: 100
            }
          }
        ]
      });
      
      console.log(`Successfully created ${factories.count} factories for MSPIL`);
    }
    
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error seeding companies:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedCompanies().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});