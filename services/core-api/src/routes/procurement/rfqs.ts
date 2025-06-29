import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware } from '../../middleware/auth';
import { requireModulePermission, requireCompanyAccess } from '../../middleware/rbac';
import { prisma } from '../../index';
import pkg from '@prisma/client';
const { RFQStatus } = pkg;

const rfqs = new Hono();

// Apply auth middleware to all routes
rfqs.use('*', authMiddleware());

// Schema validation
const createRFQSchema = z.object({
  title: z.string(),
  indentId: z.string().optional(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number().positive(),
    unit: z.string(),
    specifications: z.string().optional(),
  })),
  dueDate: z.string().datetime(),
  deliveryDate: z.string().datetime().optional(),
  terms: z.string().optional(),
  instructions: z.string().optional(),
  vendorIds: z.array(z.string()),
});

const updateRFQSchema = createRFQSchema.partial().omit({ vendorIds: true });

// Generate RFQ number
async function generateRFQNumber(companyId: string): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  const lastRFQ = await prisma.rFQ.findFirst({
    where: {
      companyId,
      rfqNumber: {
        startsWith: `RFQ-${year}${month}-`,
      },
    },
    orderBy: {
      rfqNumber: 'desc',
    },
  });
  
  let sequence = 1;
  if (lastRFQ) {
    const lastSequence = parseInt(lastRFQ.rfqNumber.split('-').pop() || '0');
    sequence = lastSequence + 1;
  }
  
  return `RFQ-${year}${month}-${String(sequence).padStart(4, '0')}`;
}

// List RFQs
rfqs.get(
  '/',
  requireModulePermission('supply-chain', 'READ'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const { status, search, page = '1', limit = '10' } = c.req.query();
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    
    const where: any = {
      companyId: user.companyId,
    };
    
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { rfqNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        include: {
          indent: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          vendors: {
            include: {
              vendor: true,
            },
          },
          _count: {
            select: {
              quotations: true,
            },
          },
        },
        skip,
        take: limitNumber,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.rFQ.count({ where }),
    ]);
    
    return c.json({
      data: rfqs,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  }
);

// Get single RFQ
rfqs.get(
  '/:id',
  requireModulePermission('supply-chain', 'READ'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    
    const rfq = await prisma.rFQ.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
      include: {
        indent: true,
        createdBy: true,
        vendors: {
          include: {
            vendor: true,
          },
        },
        quotations: {
          include: {
            vendor: true,
          },
        },
      },
    });
    
    if (!rfq) {
      return c.json({ error: 'RFQ not found' }, 404);
    }
    
    return c.json(rfq);
  }
);

// Create RFQ
rfqs.post(
  '/',
  requireModulePermission('supply-chain', 'CREATE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const body = await c.req.json();
    
    const validated = createRFQSchema.parse(body);
    const rfqNumber = await generateRFQNumber(user.companyId);
    
    const { vendorIds, ...rfqData } = validated;
    
    // If linked to indent, update indent status
    if (validated.indentId) {
      const indent = await prisma.materialIndent.findFirst({
        where: {
          id: validated.indentId,
          companyId: user.companyId,
          status: 'APPROVED',
        },
      });
      
      if (!indent) {
        return c.json({ error: 'Invalid or unapproved indent' }, 400);
      }
    }
    
    const rfq = await prisma.$transaction(async (tx) => {
      // Create RFQ
      const newRFQ = await tx.rFQ.create({
        data: {
          ...rfqData,
          rfqNumber,
          companyId: user.companyId,
          createdById: user.id,
          dueDate: new Date(rfqData.dueDate),
          deliveryDate: rfqData.deliveryDate ? new Date(rfqData.deliveryDate) : undefined,
          status: 'ACTIVE',
        },
      });
      
      // Create RFQVendor entries
      await tx.rFQVendor.createMany({
        data: vendorIds.map(vendorId => ({
          rfqId: newRFQ.id,
          vendorId,
          sentDate: new Date(),
        })),
      });
      
      // Update indent status if linked
      if (validated.indentId) {
        await tx.materialIndent.update({
          where: { id: validated.indentId },
          data: { status: 'RFQ_CREATED' },
        });
      }
      
      return newRFQ;
    });
    
    // Fetch complete RFQ with relations
    const completeRFQ = await prisma.rFQ.findUnique({
      where: { id: rfq.id },
      include: {
        indent: true,
        createdBy: true,
        vendors: {
          include: {
            vendor: true,
          },
        },
      },
    });
    
    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        entity: 'RFQ',
        entityId: rfq.id,
        data: { rfqNumber, vendorCount: vendorIds.length },
      },
    });
    
    return c.json(completeRFQ, 201);
  }
);

// Update RFQ
rfqs.patch(
  '/:id',
  requireModulePermission('supply-chain', 'UPDATE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const validated = updateRFQSchema.parse(body);
    
    const existingRFQ = await prisma.rFQ.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    });
    
    if (!existingRFQ) {
      return c.json({ error: 'RFQ not found' }, 404);
    }
    
    if (existingRFQ.status !== 'DRAFT' && existingRFQ.status !== 'ACTIVE') {
      return c.json({ error: 'Cannot update closed or cancelled RFQ' }, 400);
    }
    
    const rfq = await prisma.rFQ.update({
      where: { id },
      data: {
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
        deliveryDate: validated.deliveryDate ? new Date(validated.deliveryDate) : undefined,
      },
      include: {
        indent: true,
        createdBy: true,
        vendors: {
          include: {
            vendor: true,
          },
        },
      },
    });
    
    return c.json(rfq);
  }
);

// Update RFQ status
rfqs.patch(
  '/:id/status',
  requireModulePermission('supply-chain', 'UPDATE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    if (!Object.values(RFQStatus).includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }
    
    const rfq = await prisma.rFQ.update({
      where: {
        id,
        companyId: user.companyId,
      },
      data: { status },
    });
    
    return c.json(rfq);
  }
);

// Add vendors to RFQ
rfqs.post(
  '/:id/vendors',
  requireModulePermission('supply-chain', 'UPDATE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const { vendorIds } = await c.req.json();
    
    const rfq = await prisma.rFQ.findFirst({
      where: {
        id,
        companyId: user.companyId,
        status: { in: ['DRAFT', 'ACTIVE'] },
      },
    });
    
    if (!rfq) {
      return c.json({ error: 'RFQ not found or closed' }, 404);
    }
    
    // Get existing vendor IDs
    const existingVendors = await prisma.rFQVendor.findMany({
      where: { rfqId: id },
      select: { vendorId: true },
    });
    
    const existingVendorIds = existingVendors.map(v => v.vendorId);
    const newVendorIds = vendorIds.filter((vid: string) => !existingVendorIds.includes(vid));
    
    if (newVendorIds.length > 0) {
      await prisma.rFQVendor.createMany({
        data: newVendorIds.map((vendorId: string) => ({
          rfqId: id,
          vendorId,
          sentDate: new Date(),
        })),
      });
    }
    
    return c.json({ added: newVendorIds.length });
  }
);

// Get RFQ statistics
rfqs.get(
  '/stats/overview',
  requireModulePermission('supply-chain', 'READ'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    
    const [total, active, quotationsReceived, avgResponseRate] = await Promise.all([
      prisma.rFQ.count({
        where: { companyId: user.companyId },
      }),
      prisma.rFQ.count({
        where: { companyId: user.companyId, status: 'ACTIVE' },
      }),
      prisma.quotation.count({
        where: {
          rfq: { companyId: user.companyId },
        },
      }),
      prisma.rFQVendor.aggregate({
        where: {
          rfq: { companyId: user.companyId },
        },
        _avg: {
          responded: true,
        },
      }),
    ]);
    
    return c.json({
      total,
      active,
      quotationsReceived,
      responseRate: (avgResponseRate._avg.responded || 0) * 100,
    });
  }
);

export default rfqs;