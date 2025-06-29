import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware } from '../../middleware/auth';
import { requireModulePermission, requireCompanyAccess } from '../../middleware/rbac';
import { prisma } from '../../index';
import * as PrismaClient from '@prisma/client';
const POStatus = PrismaClient.POStatus;

const purchaseOrders = new Hono();

// Apply auth middleware to all routes
purchaseOrders.use('*', authMiddleware());

// Schema validation
const createPOSchema = z.object({
  vendorId: z.string(),
  quotationId: z.string().optional(),
  indentId: z.string().optional(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number().positive(),
    unit: z.string(),
    unitPrice: z.number().positive(),
    totalPrice: z.number().positive(),
  })),
  totalAmount: z.number().positive(),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  deliveryDate: z.string().datetime().optional(),
  shippingAddress: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    country: z.string().default('India'),
  }).optional(),
  billingAddress: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    country: z.string().default('India'),
  }).optional(),
});

const updatePOSchema = createPOSchema.partial();

// Generate PO number
async function generatePONumber(companyId: string): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  const lastPO = await prisma.purchaseOrder.findFirst({
    where: {
      companyId,
      poNumber: {
        startsWith: `PO-${year}${month}-`,
      },
    },
    orderBy: {
      poNumber: 'desc',
    },
  });
  
  let sequence = 1;
  if (lastPO) {
    const lastSequence = parseInt(lastPO.poNumber.split('-').pop() || '0');
    sequence = lastSequence + 1;
  }
  
  return `PO-${year}${month}-${String(sequence).padStart(5, '0')}`;
}

// List purchase orders
purchaseOrders.get(
  '/',
  requireModulePermission('supply-chain', 'READ'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const { status, vendorId, search, page = '1', limit = '10' } = c.req.query();
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    
    const where: any = {
      companyId: user.companyId,
    };
    
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;
    if (search) {
      where.OR = [
        { poNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const [purchaseOrders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          vendor: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          quotation: true,
          indent: true,
        },
        skip,
        take: limitNumber,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);
    
    return c.json({
      data: purchaseOrders,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  }
);

// Get single purchase order
purchaseOrders.get(
  '/:id',
  requireModulePermission('supply-chain', 'READ'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    
    const po = await prisma.purchaseOrder.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
      include: {
        vendor: true,
        createdBy: true,
        approvedBy: true,
        quotation: {
          include: {
            rfq: true,
          },
        },
        indent: true,
      },
    });
    
    if (!po) {
      return c.json({ error: 'Purchase order not found' }, 404);
    }
    
    return c.json(po);
  }
);

// Create purchase order
purchaseOrders.post(
  '/',
  requireModulePermission('supply-chain', 'CREATE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const body = await c.req.json();
    
    const validated = createPOSchema.parse(body);
    const poNumber = await generatePONumber(user.companyId);
    
    // If creating from quotation, verify and update quotation status
    if (validated.quotationId) {
      const quotation = await prisma.quotation.findFirst({
        where: {
          id: validated.quotationId,
          status: 'ACCEPTED',
          rfq: {
            companyId: user.companyId,
          },
        },
      });
      
      if (!quotation) {
        return c.json({ error: 'Invalid or unaccepted quotation' }, 400);
      }
      
      // Check if PO already exists for this quotation
      const existingPO = await prisma.purchaseOrder.findFirst({
        where: { quotationId: validated.quotationId },
      });
      
      if (existingPO) {
        return c.json({ error: 'Purchase order already exists for this quotation' }, 400);
      }
    }
    
    const po = await prisma.$transaction(async (tx) => {
      // Create PO
      const newPO = await tx.purchaseOrder.create({
        data: {
          ...validated,
          poNumber,
          companyId: user.companyId,
          createdById: user.id,
          deliveryDate: validated.deliveryDate ? new Date(validated.deliveryDate) : undefined,
          status: 'DRAFT',
        },
      });
      
      // Update quotation status if linked
      if (validated.quotationId) {
        await tx.quotation.update({
          where: { id: validated.quotationId },
          data: { status: 'CONVERTED_TO_PO' },
        });
      }
      
      // Update indent status if linked
      if (validated.indentId) {
        await tx.materialIndent.update({
          where: { id: validated.indentId },
          data: { status: 'PO_CREATED' },
        });
      }
      
      // Update vendor statistics
      await tx.vendor.update({
        where: { id: validated.vendorId },
        data: {
          totalOrders: { increment: 1 },
          totalSpend: { increment: validated.totalAmount },
        },
      });
      
      return newPO;
    });
    
    // Fetch complete PO with relations
    const completePO = await prisma.purchaseOrder.findUnique({
      where: { id: po.id },
      include: {
        vendor: true,
        createdBy: true,
        quotation: true,
        indent: true,
      },
    });
    
    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        entity: 'PurchaseOrder',
        entityId: po.id,
        data: { poNumber, amount: validated.totalAmount },
      },
    });
    
    return c.json(completePO, 201);
  }
);

// Update purchase order
purchaseOrders.patch(
  '/:id',
  requireModulePermission('supply-chain', 'UPDATE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const validated = updatePOSchema.parse(body);
    
    const existingPO = await prisma.purchaseOrder.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    });
    
    if (!existingPO) {
      return c.json({ error: 'Purchase order not found' }, 404);
    }
    
    // Only allow updates if status is DRAFT
    if (existingPO.status !== 'DRAFT') {
      return c.json({ error: 'Cannot update approved or sent purchase order' }, 400);
    }
    
    const po = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        ...validated,
        deliveryDate: validated.deliveryDate ? new Date(validated.deliveryDate) : undefined,
      },
      include: {
        vendor: true,
        createdBy: true,
      },
    });
    
    return c.json(po);
  }
);

// Update PO status
purchaseOrders.patch(
  '/:id/status',
  requireModulePermission('supply-chain', 'UPDATE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    if (!Object.values(POStatus).includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }
    
    const po = await prisma.purchaseOrder.update({
      where: {
        id,
        companyId: user.companyId,
      },
      data: { status },
    });
    
    return c.json(po);
  }
);

// Approve/Reject PO
purchaseOrders.post(
  '/:id/approve',
  requireModulePermission('supply-chain', 'APPROVE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const { approved, remarks } = await c.req.json();
    
    const existingPO = await prisma.purchaseOrder.findFirst({
      where: {
        id,
        companyId: user.companyId,
        status: 'PENDING_APPROVAL',
      },
    });
    
    if (!existingPO) {
      return c.json({ error: 'Purchase order not found or not pending approval' }, 404);
    }
    
    const po = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        approvedById: user.id,
        approvedDate: new Date(),
      },
      include: {
        vendor: true,
        createdBy: true,
        approvedBy: true,
      },
    });
    
    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: approved ? 'APPROVE' : 'REJECT',
        entity: 'PurchaseOrder',
        entityId: po.id,
        data: { remarks },
      },
    });
    
    return c.json(po);
  }
);

// Send PO to vendor
purchaseOrders.post(
  '/:id/send',
  requireModulePermission('supply-chain', 'UPDATE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    
    const existingPO = await prisma.purchaseOrder.findFirst({
      where: {
        id,
        companyId: user.companyId,
        status: 'APPROVED',
      },
      include: {
        vendor: true,
      },
    });
    
    if (!existingPO) {
      return c.json({ error: 'Purchase order not found or not approved' }, 404);
    }
    
    // TODO: Implement actual email/notification sending
    
    const po = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'SENT' },
    });
    
    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'SEND',
        entity: 'PurchaseOrder',
        entityId: po.id,
        data: { vendorEmail: existingPO.vendor.email },
      },
    });
    
    return c.json({ success: true, message: 'Purchase order sent to vendor' });
  }
);

// Get PO statistics
purchaseOrders.get(
  '/stats/overview',
  requireModulePermission('supply-chain', 'READ'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    
    const [total, pending, approved, monthlySpend] = await Promise.all([
      prisma.purchaseOrder.count({
        where: { companyId: user.companyId },
      }),
      prisma.purchaseOrder.count({
        where: { companyId: user.companyId, status: 'PENDING_APPROVAL' },
      }),
      prisma.purchaseOrder.count({
        where: { companyId: user.companyId, status: 'APPROVED' },
      }),
      prisma.purchaseOrder.aggregate({
        where: {
          companyId: user.companyId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);
    
    return c.json({
      total,
      pending,
      approved,
      monthlySpend: monthlySpend._sum.totalAmount || 0,
    });
  }
);

export default purchaseOrders;