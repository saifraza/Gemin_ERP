import { Hono } from 'hono';
import { prisma } from '../index.js';
import { verifyToken } from './auth.js';

const seedRoutes = new Hono();

// Seed companies - only accessible by SUPER_ADMIN
seedRoutes.post('/companies', async (c) => {
  try {
    // Get token and verify user is SUPER_ADMIN
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { role: true }
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return c.json({ error: 'Only SUPER_ADMIN can seed data' }, 403);
    }
    
    // Check if companies already exist
    const existingCompanies = await prisma.company.count();
    if (existingCompanies > 0) {
      return c.json({ 
        message: `Found ${existingCompanies} existing companies. Skipping seed.`,
        existingCount: existingCompanies
      });
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
    
    // Now create factories for the first company
    const mspilCompany = await prisma.company.findUnique({
      where: { code: 'MSPIL' }
    });
    
    let factoryCount = 0;
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
      factoryCount = factories.count;
    }
    
    // Get all created companies with counts
    const allCompanies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            factories: true,
            users: true
          }
        }
      }
    });
    
    return c.json({
      success: true,
      message: 'Seed completed successfully',
      created: {
        companies: companies.count,
        factories: factoryCount
      },
      companies: allCompanies
    });
  } catch (error) {
    console.error('Error seeding companies:', error);
    return c.json({ 
      error: 'Failed to seed companies',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Clear all data - only accessible by SUPER_ADMIN
seedRoutes.delete('/clear-all', async (c) => {
  try {
    // Get token and verify user is SUPER_ADMIN
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { role: true, email: true }
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return c.json({ error: 'Only SUPER_ADMIN can clear data' }, 403);
    }
    
    // Don't delete the super admin user
    const deletedCounts = {
      factoryAccess: await prisma.factoryAccess.deleteMany({}),
      factories: await prisma.factory.deleteMany({}),
      companies: await prisma.company.deleteMany({}),
      users: await prisma.user.deleteMany({
        where: {
          email: { not: user.email }
        }
      })
    };
    
    return c.json({
      success: true,
      message: 'Data cleared successfully',
      deleted: {
        factoryAccess: deletedCounts.factoryAccess.count,
        factories: deletedCounts.factories.count,
        companies: deletedCounts.companies.count,
        users: deletedCounts.users.count
      },
      preserved: {
        superAdmin: user.email
      }
    });
  } catch (error) {
    console.error('Error clearing data:', error);
    return c.json({ 
      error: 'Failed to clear data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { seedRoutes };