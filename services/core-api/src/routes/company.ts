import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../index.js';
import { factoryAccessMiddleware, getFactoryContext } from '../middleware/factory-access.js';

const companyRoutes = new Hono();

// Apply factory access middleware to protected routes
companyRoutes.use('/', factoryAccessMiddleware);
companyRoutes.use('/:id', factoryAccessMiddleware);

// Health check
companyRoutes.get('/health', (c) => {
  return c.json({ status: 'ok', message: 'Company routes are loaded' });
});

// Get all companies (filtered by access)
companyRoutes.get('/', async (c) => {
  const context = getFactoryContext(c);
  
  // Super admins can see all companies
  // Regular users can only see their own company
  const whereClause = context.role === 'SUPER_ADMIN' 
    ? {} 
    : { id: context.companyId };
  
  const companies = await prisma.company.findMany({
    where: whereClause,
    include: {
      factories: {
        where: context.accessLevel === 'HQ' || context.role === 'SUPER_ADMIN'
          ? {} 
          : { id: { in: context.allowedFactories } },
      },
      _count: {
        select: {
          factories: true,
          users: true,
        },
      },
    },
  });
  
  return c.json(companies);
});

// Get company by ID
companyRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const context = getFactoryContext(c);
  
  // Verify user can access this company
  if (id !== context.companyId) {
    return c.json({ error: 'Access denied' }, 403);
  }
  
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      factories: {
        where: context.accessLevel === 'HQ' 
          ? {} 
          : { id: { in: context.allowedFactories } },
      },
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
        where: context.accessLevel === 'HQ'
          ? {}
          : {
              OR: [
                { id: context.userId }, // User can see themselves
                {
                  factoryAccess: {
                    some: {
                      factoryId: { in: context.allowedFactories }
                    }
                  }
                }
              ]
            },
      },
    },
  });
  
  if (!company) {
    return c.json({ error: 'Company not found' }, 404);
  }
  
  return c.json(company);
});

// Create company schema
const createCompanySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string(),
  }),
  phone: z.string(),
  email: z.string().email(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  website: z.string().optional(),
});

// Create company
companyRoutes.post('/', zValidator('json', createCompanySchema), async (c) => {
  const data = c.req.valid('json');
  
  try {
    const company = await prisma.company.create({
      data,
    });
    
    return c.json(company, 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return c.json({ error: 'Company with this code already exists' }, 400);
    }
    throw error;
  }
});

// Update company
companyRoutes.put('/:id', zValidator('json', createCompanySchema.partial()), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  
  try {
    const company = await prisma.company.update({
      where: { id },
      data,
    });
    
    return c.json(company);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return c.json({ error: 'Company not found' }, 404);
    }
    throw error;
  }
});

// Delete company
companyRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    // Check if company exists and get related data count
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            factories: true,
          }
        }
      }
    });
    
    if (!company) {
      return c.json({ error: 'Company not found' }, 404);
    }
    
    // Warning if company has related data
    if (company._count.users > 0 || company._count.factories > 0) {
      console.log(`Warning: Deleting company ${company.name} with ${company._count.users} users and ${company._count.factories} factories`);
    }
    
    // Delete the company (this should cascade delete related records based on schema)
    await prisma.company.delete({
      where: { id },
    });
    
    return c.json({ 
      success: true, 
      message: 'Company deleted successfully',
      deletedCounts: {
        users: company._count.users,
        factories: company._count.factories
      }
    });
  } catch (error: any) {
    console.error('Error deleting company:', error);
    
    if (error.code === 'P2025') {
      return c.json({ error: 'Company not found' }, 404);
    }
    
    if (error.code === 'P2003') {
      return c.json({ 
        error: 'Cannot delete company due to existing relationships', 
        details: 'This company has related data that prevents deletion'
      }, 400);
    }
    
    return c.json({ 
      error: 'Failed to delete company', 
      details: error.message,
      code: error.code 
    }, 500);
  }
});

export { companyRoutes };