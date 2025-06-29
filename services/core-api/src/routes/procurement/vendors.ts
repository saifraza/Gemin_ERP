import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware } from '../../middleware/auth';
import { requireModulePermission, requireCompanyAccess } from '../../middleware/rbac';
import { prisma } from '../../index';
const { VendorStatus } = require('@prisma/client');

const vendors = new Hono();

// Apply auth middleware to all routes
vendors.use('*', authMiddleware());

// Schema validation
const createVendorSchema = z.object({
  name: z.string(),
  category: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    country: z.string().default('India'),
  }),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  bankDetails: z.object({
    accountName: z.string(),
    accountNumber: z.string(),
    bankName: z.string(),
    ifscCode: z.string(),
    branch: z.string(),
  }).optional(),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  certifications: z.array(z.string()).default([]),
});

const updateVendorSchema = createVendorSchema.partial();

// Generate vendor code
async function generateVendorCode(companyId: string, category: string): Promise<string> {
  const prefix = category.substring(0, 3).toUpperCase();
  
  const lastVendor = await prisma.vendor.findFirst({
    where: {
      companyId,
      code: {
        startsWith: `V-${prefix}-`,
      },
    },
    orderBy: {
      code: 'desc',
    },
  });
  
  let sequence = 1;
  if (lastVendor) {
    const lastSequence = parseInt(lastVendor.code.split('-').pop() || '0');
    sequence = lastSequence + 1;
  }
  
  return `V-${prefix}-${String(sequence).padStart(4, '0')}`;
}

// List vendors
vendors.get(
  '/',
  requireModulePermission('supply-chain', 'READ'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const { status, category, search, page = '1', limit = '10' } = c.req.query();
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    
    const where: any = {
      companyId: user.companyId,
    };
    
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          _count: {
            select: {
              quotations: true,
              purchaseOrders: true,
            },
          },
        },
        skip,
        take: limitNumber,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.vendor.count({ where }),
    ]);
    
    return c.json({
      data: vendors,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  }
);

// Get single vendor
vendors.get(
  '/:id',
  requireModulePermission('supply-chain', 'READ'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    
    const vendor = await prisma.vendor.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
      include: {
        quotations: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            rfq: true,
          },
        },
        purchaseOrders: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            quotations: true,
            purchaseOrders: true,
          },
        },
      },
    });
    
    if (!vendor) {
      return c.json({ error: 'Vendor not found' }, 404);
    }
    
    return c.json(vendor);
  }
);

// Create vendor
vendors.post(
  '/',
  requireModulePermission('supply-chain', 'CREATE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const body = await c.req.json();
    
    const validated = createVendorSchema.parse(body);
    const code = await generateVendorCode(user.companyId, validated.category);
    
    // Check if vendor with same email exists
    const existingVendor = await prisma.vendor.findFirst({
      where: {
        companyId: user.companyId,
        email: validated.email,
      },
    });
    
    if (existingVendor) {
      return c.json({ error: 'Vendor with this email already exists' }, 400);
    }
    
    const vendor = await prisma.vendor.create({
      data: {
        ...validated,
        code,
        companyId: user.companyId,
      },
    });
    
    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        entity: 'Vendor',
        entityId: vendor.id,
        data: { code, name: vendor.name },
      },
    });
    
    return c.json(vendor, 201);
  }
);

// Update vendor
vendors.patch(
  '/:id',
  requireModulePermission('supply-chain', 'UPDATE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const validated = updateVendorSchema.parse(body);
    
    const existingVendor = await prisma.vendor.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    });
    
    if (!existingVendor) {
      return c.json({ error: 'Vendor not found' }, 404);
    }
    
    const vendor = await prisma.vendor.update({
      where: { id },
      data: validated,
    });
    
    return c.json(vendor);
  }
);

// Update vendor status
vendors.patch(
  '/:id/status',
  requireModulePermission('supply-chain', 'UPDATE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    if (!Object.values(VendorStatus).includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }
    
    const vendor = await prisma.vendor.update({
      where: {
        id,
        companyId: user.companyId,
      },
      data: { status },
    });
    
    return c.json(vendor);
  }
);

// Get vendor statistics
vendors.get(
  '/stats/overview',
  requireModulePermission('supply-chain', 'READ'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    
    const [total, active, inactive, topVendors] = await Promise.all([
      prisma.vendor.count({
        where: { companyId: user.companyId },
      }),
      prisma.vendor.count({
        where: { companyId: user.companyId, status: 'ACTIVE' },
      }),
      prisma.vendor.count({
        where: { companyId: user.companyId, status: 'INACTIVE' },
      }),
      prisma.vendor.findMany({
        where: { companyId: user.companyId },
        orderBy: { totalSpend: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          category: true,
          totalSpend: true,
          totalOrders: true,
          rating: true,
        },
      }),
    ]);
    
    return c.json({
      total,
      active,
      inactive,
      topVendors,
    });
  }
);

// Get vendor categories
vendors.get(
  '/categories',
  requireModulePermission('supply-chain', 'READ'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    
    const categories = await prisma.vendor.findMany({
      where: { companyId: user.companyId },
      select: { category: true },
      distinct: ['category'],
    });
    
    return c.json(categories.map(v => v.category));
  }
);

export default vendors;