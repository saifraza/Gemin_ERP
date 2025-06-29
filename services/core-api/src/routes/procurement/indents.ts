import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware } from '../../middleware/auth';
import { requireModulePermission, requireCompanyAccess } from '../../middleware/rbac';
import { prisma } from '../../index';
import * as PrismaClient from '@prisma/client';
const IndentPriority = PrismaClient.IndentPriority;
const IndentStatus = PrismaClient.IndentStatus;

const indents = new Hono();

// Apply auth middleware to all routes
indents.use('*', authMiddleware());

// Schema validation
const createIndentSchema = z.object({
  factoryId: z.string(),
  departmentId: z.string().optional(),
  itemName: z.string(),
  itemCode: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string(),
  requiredDate: z.string().datetime(),
  priority: z.nativeEnum(IndentPriority).default(IndentPriority.MEDIUM),
  description: z.string().optional(),
  specifications: z.string().optional(),
});

const updateIndentSchema = createIndentSchema.partial();

// Generate indent number
async function generateIndentNumber(companyId: string): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  const lastIndent = await prisma.materialIndent.findFirst({
    where: {
      companyId,
      indentNumber: {
        startsWith: `IND-${year}${month}-`,
      },
    },
    orderBy: {
      indentNumber: 'desc',
    },
  });
  
  let sequence = 1;
  if (lastIndent) {
    const lastSequence = parseInt(lastIndent.indentNumber.split('-').pop() || '0');
    sequence = lastSequence + 1;
  }
  
  return `IND-${year}${month}-${String(sequence).padStart(4, '0')}`;
}

// List indents
indents.get(
  '/',
  requireModulePermission('supply-chain', 'READ'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const { status, priority, factoryId, page = '1', limit = '10' } = c.req.query();
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    
    const where: any = {
      companyId: user.companyId,
    };
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (factoryId) where.factoryId = factoryId;
    
    const [indents, total] = await Promise.all([
      prisma.materialIndent.findMany({
        where,
        include: {
          factory: true,
          requestedBy: {
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
          rfqs: {
            select: {
              id: true,
              rfqNumber: true,
              status: true,
            },
          },
        },
        skip,
        take: limitNumber,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.materialIndent.count({ where }),
    ]);
    
    return c.json({
      data: indents,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  }
);

// Get single indent
indents.get(
  '/:id',
  requireModulePermission('supply-chain', 'READ'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    
    const indent = await prisma.materialIndent.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
      include: {
        factory: true,
        requestedBy: true,
        approvedBy: true,
        rfqs: {
          include: {
            quotations: {
              include: {
                vendor: true,
              },
            },
          },
        },
      },
    });
    
    if (!indent) {
      return c.json({ error: 'Indent not found' }, 404);
    }
    
    return c.json(indent);
  }
);

// Create indent
indents.post(
  '/',
  requireModulePermission('supply-chain', 'CREATE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const body = await c.req.json();
    
    const validated = createIndentSchema.parse(body);
    const indentNumber = await generateIndentNumber(user.companyId);
    
    const indent = await prisma.materialIndent.create({
      data: {
        ...validated,
        indentNumber,
        companyId: user.companyId,
        requestedById: user.id,
        requiredDate: new Date(validated.requiredDate),
      },
      include: {
        factory: true,
        requestedBy: true,
      },
    });
    
    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        entity: 'MaterialIndent',
        entityId: indent.id,
        data: { indentNumber },
      },
    });
    
    return c.json(indent, 201);
  }
);

// Update indent
indents.patch(
  '/:id',
  requireModulePermission('supply-chain', 'UPDATE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const validated = updateIndentSchema.parse(body);
    
    const existingIndent = await prisma.materialIndent.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    });
    
    if (!existingIndent) {
      return c.json({ error: 'Indent not found' }, 404);
    }
    
    // Only allow updates if status is PENDING
    if (existingIndent.status !== 'PENDING') {
      return c.json({ error: 'Cannot update approved or processed indent' }, 400);
    }
    
    const indent = await prisma.materialIndent.update({
      where: { id },
      data: {
        ...validated,
        requiredDate: validated.requiredDate ? new Date(validated.requiredDate) : undefined,
      },
      include: {
        factory: true,
        requestedBy: true,
      },
    });
    
    return c.json(indent);
  }
);

// Approve/Reject indent
indents.post(
  '/:id/approve',
  requireModulePermission('supply-chain', 'APPROVE'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const { approved, rejectionReason } = await c.req.json();
    
    const existingIndent = await prisma.materialIndent.findFirst({
      where: {
        id,
        companyId: user.companyId,
        status: 'PENDING',
      },
    });
    
    if (!existingIndent) {
      return c.json({ error: 'Indent not found or already processed' }, 404);
    }
    
    const indent = await prisma.materialIndent.update({
      where: { id },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        approvedById: user.id,
        approvedDate: new Date(),
        rejectionReason: approved ? null : rejectionReason,
      },
      include: {
        factory: true,
        requestedBy: true,
        approvedBy: true,
      },
    });
    
    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: approved ? 'APPROVE' : 'REJECT',
        entity: 'MaterialIndent',
        entityId: indent.id,
        data: { rejectionReason },
      },
    });
    
    return c.json(indent);
  }
);

// Get indent statistics
indents.get(
  '/stats/overview',
  requireModulePermission('supply-chain', 'READ'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    const { factoryId } = c.req.query();
    
    const where: any = {
      companyId: user.companyId,
    };
    
    if (factoryId) where.factoryId = factoryId;
    
    const [total, pending, approved, rejected, rfqCreated] = await Promise.all([
      prisma.materialIndent.count({ where }),
      prisma.materialIndent.count({ where: { ...where, status: 'PENDING' } }),
      prisma.materialIndent.count({ where: { ...where, status: 'APPROVED' } }),
      prisma.materialIndent.count({ where: { ...where, status: 'REJECTED' } }),
      prisma.materialIndent.count({ where: { ...where, status: 'RFQ_CREATED' } }),
    ]);
    
    return c.json({
      total,
      pending,
      approved,
      rejected,
      rfqCreated,
      byStatus: { pending, approved, rejected, rfqCreated },
    });
  }
);

export default indents;