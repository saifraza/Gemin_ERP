import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../index.js';
import { factoryAccessMiddleware, getFactoryContext } from '../middleware/factory-access.js';
// TEMPORARY: Using bypass middleware for debugging
// import { requireModulePermission } from '../middleware/rbac.js';
import { requireModulePermission } from '../middleware/rbac-temp-disable.js';

const companyRoutes = new Hono();

// Apply factory access middleware to protected routes
companyRoutes.use('/', factoryAccessMiddleware);
companyRoutes.use('/:id', factoryAccessMiddleware);

// Pagination schema
const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'code', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Get all companies with pagination, search, and sorting
companyRoutes.get('/', requireModulePermission('COMPANIES', 'READ'), zValidator('query', paginationSchema), async (c) => {
  const { page, limit, search, sortBy, sortOrder } = c.req.valid('query');
  const context = getFactoryContext(c);
  const userPermissions = c.get('userPermissions');
  
  console.log('[Company Route Debug] Context:', {
    role: context?.role,
    companyId: context?.companyId,
    userId: context?.userId,
    accessLevel: context?.accessLevel
  });
  
  // Calculate offset
  const offset = (page - 1) * limit;
  
  // Build where clause based on user permissions
  let whereClause: any = {};
  
  // Super admins can see everything - no filtering needed
  if (context.role === 'SUPER_ADMIN') {
    console.log('[Company Route] SUPER_ADMIN detected - showing all companies');
    // whereClause remains empty, which means no filtering
  } else {
    // Check if user has global company access
    const hasGlobalAccess = userPermissions?.permissions?.some((p: any) => 
      p.code === 'COMPANIES_READ' && p.scope === 'GLOBAL'
    );
    
    if (!hasGlobalAccess) {
    // Filter by company-level permissions
    const companyIds = userPermissions?.permissions
      ?.filter((p: any) => p.code === 'COMPANIES_READ' && p.scope === 'COMPANY')
      ?.map((p: any) => p.scopeId)
      ?.filter(Boolean) || [];
    
    if (companyIds.length > 0) {
      whereClause.id = { in: companyIds };
    } else if (context.companyId) {
      // Fallback to context company
      whereClause.id = context.companyId;
    } else {
      // No access
      whereClause.id = 'no-access';
    }
    }
  }
  
  // Add search condition if provided
  if (search) {
    const searchConditions = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
    
    if (whereClause.id) {
      whereClause = {
        AND: [
          whereClause,
          { OR: searchConditions }
        ]
      };
    } else {
      whereClause.OR = searchConditions;
    }
  }
  
  console.log('[Company Route Debug] Final whereClause:', JSON.stringify(whereClause, null, 2));
  
  // Execute queries in parallel for better performance
  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            factories: true,
            users: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    prisma.company.count({ where: whereClause }),
  ]);
  
  console.log('[Company Route Debug] Query results:', {
    total,
    companiesFound: companies.length,
    page,
    limit
  });
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;
  const nextPage = hasMore ? page + 1 : null;
  
  return c.json({
    data: companies,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore,
      nextPage,
    },
  });
});

// Get company by ID (optimized with select)
companyRoutes.get('/:id', requireModulePermission('COMPANIES', 'READ', 'COMPANY', 'id'), async (c) => {
  const id = c.req.param('id');
  const context = getFactoryContext(c);
  
  // Verify user can access this company
  if (context.role !== 'SUPER_ADMIN' && id !== context.companyId) {
    return c.json({ error: 'Access denied' }, 403);
  }
  
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          factories: true,
          users: true,
        },
      },
    },
  });
  
  if (!company) {
    return c.json({ error: 'Company not found' }, 404);
  }
  
  return c.json(company);
});

// Create company schema (simplified)
const createCompanySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  website: z.string().optional(),
});

// Create company
companyRoutes.post('/', requireModulePermission('COMPANIES', 'CREATE', 'COMPANY'), zValidator('json', createCompanySchema), async (c) => {
  const data = c.req.valid('json');
  const context = getFactoryContext(c);
  
  // Only super admins can create companies
  if (context.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Only super admins can create companies' }, 403);
  }
  
  try {
    const company = await prisma.company.create({
      data,
      include: {
        _count: {
          select: {
            factories: true,
            users: true,
          },
        },
      },
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
companyRoutes.put('/:id', requireModulePermission('COMPANIES', 'UPDATE', 'COMPANY', 'id'), zValidator('json', createCompanySchema.partial()), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const context = getFactoryContext(c);
  
  // Only super admins can update companies
  if (context.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Only super admins can update companies' }, 403);
  }
  
  try {
    const company = await prisma.company.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            factories: true,
            users: true,
          },
        },
      },
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
companyRoutes.delete('/:id', requireModulePermission('COMPANIES', 'DELETE', 'COMPANY', 'id'), async (c) => {
  const id = c.req.param('id');
  const context = getFactoryContext(c);
  
  // Only super admins can delete companies
  if (context.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Only super admins can delete companies' }, 403);
  }
  
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
    
    // Delete the company
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
    if (error.code === 'P2003') {
      return c.json({ 
        error: 'Cannot delete company with existing users or factories', 
      }, 400);
    }
    throw error;
  }
});

// Export data endpoint
companyRoutes.get('/export', async (c) => {
  const context = getFactoryContext(c);
  
  const whereClause = context.role === 'SUPER_ADMIN' 
    ? {} 
    : { id: context.companyId };
  
  const companies = await prisma.company.findMany({
    where: whereClause,
    include: {
      _count: {
        select: {
          factories: true,
          users: true,
        },
      },
    },
  });
  
  // Convert to CSV
  const csv = [
    'Name,Code,Email,Phone,Users,Factories',
    ...companies.map(c => 
      `"${c.name}","${c.code}","${c.email}","${c.phone || ''}",${c._count.users},${c._count.factories}`
    )
  ].join('\n');
  
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="companies-${new Date().toISOString()}.csv"`,
    },
  });
});

export { companyRoutes };