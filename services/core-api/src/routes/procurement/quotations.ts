import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware } from '../../middleware/auth';
import { requireModulePermission, requireCompanyAccess } from '../../middleware/rbac';
import { prisma } from '../../index.js';
import { QuotationStatus } from '@prisma/client';

const quotations = new Hono();

// Apply auth middleware to all routes
quotations.use('*', authMiddleware());

// Schema validation
const createQuotationSchema = z.object({
  rfqId: z.string(),
  vendorId: z.string(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number().positive(),
    unit: z.string(),
    unitPrice: z.number().positive(),
    totalPrice: z.number().positive(),
    deliveryDays: z.number().positive(),
  })),
  totalAmount: z.number().positive(),
  validUntil: z.string().datetime(),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  warranty: z.string().optional(),
  notes: z.string().optional(),
});

const updateQuotationSchema = createQuotationSchema.partial();

// Generate quotation number
async function generateQuotationNumber(vendorCode: string): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  const lastQuotation = await prisma.quotation.findFirst({
    where: {
      quotationNumber: {
        startsWith: `QT-${vendorCode}-${year}${month}-`,
      },
    },
    orderBy: {
      quotationNumber: 'desc',
    },
  });
  
  let sequence = 1;
  if (lastQuotation) {
    const parts = lastQuotation.quotationNumber.split('-');
    const lastSequence = parseInt(parts[parts.length - 1] || '0');
    sequence = lastSequence + 1;
  }
  
  return `QT-${vendorCode}-${year}${month}-${String(sequence).padStart(3, '0')}`;
}

// List quotations
quotations.get(
  '/',
  requireModulePermission('supply-chain', 'READ'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const { rfqId, vendorId, status, page = '1', limit = '10' } = c.req.query();
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    
    const where: any = {
      rfq: {
        companyId: user.companyId,
      },
    };
    
    if (rfqId) where.rfqId = rfqId;
    if (vendorId) where.vendorId = vendorId;
    if (status) where.status = status;
    
    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        include: {
          rfq: {
            include: {
              indent: true,
            },
          },
          vendor: true,
          comparison: true,
        },
        skip,
        take: limitNumber,
        orderBy: {
          receivedDate: 'desc',
        },
      }),
      prisma.quotation.count({ where }),
    ]);
    
    return c.json({
      data: quotations,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  }
);

// Get single quotation
quotations.get(
  '/:id',
  requireModulePermission('supply-chain', 'READ'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    
    const quotation = await prisma.quotation.findFirst({
      where: {
        id,
        rfq: {
          companyId: user.companyId,
        },
      },
      include: {
        rfq: {
          include: {
            indent: true,
            createdBy: true,
          },
        },
        vendor: true,
        comparison: {
          include: {
            comparedBy: true,
          },
        },
        purchaseOrder: true,
      },
    });
    
    if (!quotation) {
      return c.json({ error: 'Quotation not found' }, 404);
    }
    
    return c.json(quotation);
  }
);

// Create quotation (usually created by vendor through portal or manual entry)
quotations.post(
  '/',
  requireModulePermission('supply-chain', 'CREATE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const body = await c.req.json();
    
    const validated = createQuotationSchema.parse(body);
    
    // Verify RFQ exists and is active
    const rfq = await prisma.rFQ.findFirst({
      where: {
        id: validated.rfqId,
        companyId: user.companyId,
        status: 'ACTIVE',
      },
    });
    
    if (!rfq) {
      return c.json({ error: 'RFQ not found or not active' }, 404);
    }
    
    // Verify vendor is part of RFQ
    const rfqVendor = await prisma.rFQVendor.findFirst({
      where: {
        rfqId: validated.rfqId,
        vendorId: validated.vendorId,
      },
      include: {
        vendor: true,
      },
    });
    
    if (!rfqVendor) {
      return c.json({ error: 'Vendor not part of this RFQ' }, 400);
    }
    
    const quotationNumber = await generateQuotationNumber(rfqVendor.vendor.code);
    
    const quotation = await prisma.$transaction(async (tx) => {
      // Create quotation
      const newQuotation = await tx.quotation.create({
        data: {
          ...validated,
          quotationNumber,
          validUntil: new Date(validated.validUntil),
        },
      });
      
      // Update RFQVendor response status
      await tx.rFQVendor.update({
        where: {
          rfqId_vendorId: {
            rfqId: validated.rfqId,
            vendorId: validated.vendorId,
          },
        },
        data: {
          responded: true,
        },
      });
      
      return newQuotation;
    });
    
    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        entity: 'Quotation',
        entityId: quotation.id,
        data: { quotationNumber, vendorName: rfqVendor.vendor.name },
      },
    });
    
    return c.json(quotation, 201);
  }
);

// Update quotation status
quotations.patch(
  '/:id/status',
  requireModulePermission('supply-chain', 'UPDATE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const { status, remarks } = await c.req.json();
    
    if (!Object.values(QuotationStatus).includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }
    
    const existingQuotation = await prisma.quotation.findFirst({
      where: {
        id,
        rfq: {
          companyId: user.companyId,
        },
      },
    });
    
    if (!existingQuotation) {
      return c.json({ error: 'Quotation not found' }, 404);
    }
    
    const quotation = await prisma.quotation.update({
      where: { id },
      data: { 
        status,
        notes: remarks ? `${existingQuotation.notes || ''}\n\nStatus Update: ${remarks}` : undefined,
      },
    });
    
    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_STATUS',
        entity: 'Quotation',
        entityId: quotation.id,
        data: { status, remarks },
      },
    });
    
    return c.json(quotation);
  }
);

// Compare quotations for an RFQ
quotations.post(
  '/compare',
  requireModulePermission('supply-chain', 'UPDATE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const { rfqId, weights = { price: 40, delivery: 20, quality: 20, vendor: 20 } } = await c.req.json();
    
    // Get all quotations for the RFQ
    const rfqQuotations = await prisma.quotation.findMany({
      where: {
        rfqId,
        status: 'PENDING',
        rfq: {
          companyId: user.companyId,
        },
      },
      include: {
        vendor: true,
      },
    });
    
    if (rfqQuotations.length === 0) {
      return c.json({ error: 'No quotations found for comparison' }, 404);
    }
    
    // Calculate scores
    const minPrice = Math.min(...rfqQuotations.map(q => q.totalAmount));
    const minDeliveryDays = Math.min(...rfqQuotations.map(q => {
      const items = q.items as any[];
      return Math.max(...items.map(i => i.deliveryDays));
    }));
    
    const comparisons = await Promise.all(
      rfqQuotations.map(async (quotation) => {
        const items = quotation.items as any[];
        const maxDeliveryDays = Math.max(...items.map(i => i.deliveryDays));
        
        // Calculate scores
        const priceScore = (minPrice / quotation.totalAmount) * 100;
        const deliveryScore = (minDeliveryDays / maxDeliveryDays) * 100;
        const qualityScore = quotation.vendor.qualityScore || 80; // Default if not set
        const vendorScore = (quotation.vendor.rating / 5) * 50 + 
                          (quotation.vendor.onTimeDelivery || 80) / 2;
        
        // Calculate weighted total
        const totalScore = (
          (priceScore * weights.price / 100) +
          (deliveryScore * weights.delivery / 100) +
          (qualityScore * weights.quality / 100) +
          (vendorScore * weights.vendor / 100)
        );
        
        // Create or update comparison
        const comparison = await prisma.quotationComparison.upsert({
          where: { quotationId: quotation.id },
          update: {
            priceScore,
            deliveryScore,
            qualityScore,
            vendorScore,
            totalScore,
            comparedById: user.id,
          },
          create: {
            rfqId,
            quotationId: quotation.id,
            priceScore,
            deliveryScore,
            qualityScore,
            vendorScore,
            totalScore,
            comparedById: user.id,
          },
        });
        
        return {
          quotation,
          comparison,
        };
      })
    );
    
    // Sort by total score
    comparisons.sort((a, b) => b.comparison.totalScore - a.comparison.totalScore);
    
    return c.json({
      comparisons,
      bestQuotation: comparisons[0],
      weights,
    });
  }
);

// Select quotation for PO
quotations.post(
  '/:id/select',
  requireModulePermission('supply-chain', 'APPROVE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const { remarks } = await c.req.json();
    
    const quotation = await prisma.quotation.findFirst({
      where: {
        id,
        status: 'PENDING',
        rfq: {
          companyId: user.companyId,
        },
      },
      include: {
        comparison: true,
      },
    });
    
    if (!quotation) {
      return c.json({ error: 'Quotation not found or already processed' }, 404);
    }
    
    await prisma.$transaction(async (tx) => {
      // Update quotation status
      await tx.quotation.update({
        where: { id },
        data: { status: 'ACCEPTED' },
      });
      
      // Update comparison if exists
      if (quotation.comparison) {
        await tx.quotationComparison.update({
          where: { id: quotation.comparison.id },
          data: {
            selected: true,
            remarks,
          },
        });
      }
      
      // Reject other quotations for the same RFQ
      await tx.quotation.updateMany({
        where: {
          rfqId: quotation.rfqId,
          id: { not: id },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });
    });
    
    return c.json({ success: true });
  }
);

// Get quotation statistics
quotations.get(
  '/stats/overview',
  requireModulePermission('supply-chain', 'READ'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    
    const [total, pending, accepted, avgSavings] = await Promise.all([
      prisma.quotation.count({
        where: {
          rfq: { companyId: user.companyId },
        },
      }),
      prisma.quotation.count({
        where: {
          rfq: { companyId: user.companyId },
          status: 'PENDING',
        },
      }),
      prisma.quotation.count({
        where: {
          rfq: { companyId: user.companyId },
          status: 'ACCEPTED',
        },
      }),
      // Calculate average savings (comparing accepted quotes with highest quotes)
      prisma.$queryRaw`
        SELECT AVG(savings_percentage) as avg_savings
        FROM (
          SELECT 
            rfq_id,
            ((MAX(total_amount) - MIN(CASE WHEN status = 'ACCEPTED' THEN total_amount END)) / MAX(total_amount)) * 100 as savings_percentage
          FROM "Quotation" q
          JOIN "RFQ" r ON q.rfq_id = r.id
          WHERE r.company_id = ${user.companyId}
          GROUP BY rfq_id
          HAVING MIN(CASE WHEN status = 'ACCEPTED' THEN total_amount END) IS NOT NULL
        ) as savings
      `,
    ]);
    
    return c.json({
      total,
      pending,
      accepted,
      avgSavings: (avgSavings as any)[0]?.avg_savings || 0,
    });
  }
);

export default quotations;