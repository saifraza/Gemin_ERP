import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { z } from 'zod';
import { prisma } from '../index';

const materials = new Hono();

// Material schemas
const createMaterialSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  subCategory: z.string().optional(),
  unit: z.string().min(1),
  alternateUnits: z.array(z.object({
    unit: z.string(),
    conversionFactor: z.number()
  })).optional(),
  specifications: z.record(z.any()).optional(),
  hsnCode: z.string().optional(),
  minStockLevel: z.number().default(0),
  maxStockLevel: z.number().optional(),
  reorderLevel: z.number().optional(),
  reorderQuantity: z.number().optional(),
  leadTimeDays: z.number().default(0),
  standardCost: z.number().optional(),
  type: z.enum(['RAW_MATERIAL', 'CONSUMABLE', 'SPARE_PART', 'FINISHED_GOOD', 'SEMI_FINISHED', 'PACKING_MATERIAL', 'OTHERS']),
  isCritical: z.boolean().default(false),
  isHazardous: z.boolean().default(false),
  companyId: z.string().optional(), // If not provided, material is common to all
  preferredVendors: z.array(z.string()).optional()
});

const updateMaterialSchema = createMaterialSchema.partial();

// Get all materials
materials.get('/', authMiddleware(), async (c) => {
  const user = c.get('user');
  const { page = '1', limit = '20', search, category, type, companyId, includeCommon } = c.req.query();
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {
    AND: [
      {
        OR: [
          { companyId: null }, // Common materials
          ...(user.companyId ? [{ companyId: user.companyId }] : [])
        ]
      }
    ]
  };

  // If specific companyId is provided and user has access
  if (companyId && (user.role === 'SUPER_ADMIN' || user.companyId === companyId)) {
    if (includeCommon === 'true') {
      where.AND[0].OR = [
        { companyId: null },
        { companyId }
      ];
    } else {
      where.AND[0] = { companyId };
    }
  }

  if (search) {
    where.AND.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    });
  }

  if (category) {
    where.AND.push({ category });
  }

  if (type) {
    where.AND.push({ type });
  }

  const [materials, total] = await Promise.all([
    prisma.material.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      },
      orderBy: [
        { code: 'asc' }
      ]
    }),
    prisma.material.count({ where })
  ]);

  return c.json({
    materials,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  });
});

// Get material by ID
materials.get('/:id', authMiddleware(), async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  const material = await prisma.material.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true
        }
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          username: true
        }
      }
    }
  });

  if (!material) {
    return c.json({ error: 'Material not found' }, 404);
  }

  // Check access
  if (material.companyId && material.companyId !== user.companyId && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Access denied' }, 403);
  }

  return c.json(material);
});

// Create material
materials.post('/', authMiddleware(), async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  // Validate request
  const result = createMaterialSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: 'Invalid request', details: result.error.flatten() }, 400);
  }

  // Check if code already exists
  const existing = await prisma.material.findUnique({
    where: { code: result.data.code }
  });

  if (existing) {
    return c.json({ error: 'Material code already exists' }, 400);
  }

  // If companyId is provided, verify access
  if (result.data.companyId && result.data.companyId !== user.companyId && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Cannot create material for another company' }, 403);
  }

  const material = await prisma.material.create({
    data: {
      ...result.data,
      companyId: result.data.companyId || (user.role === 'SUPER_ADMIN' ? null : user.companyId),
      createdById: user.id
    },
    include: {
      company: {
        select: {
          id: true,
          name: true
        }
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          username: true
        }
      }
    }
  });

  return c.json(material, 201);
});

// Update material
materials.put('/:id', authMiddleware(), async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const body = await c.req.json();

  // Validate request
  const result = updateMaterialSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: 'Invalid request', details: result.error.flatten() }, 400);
  }

  // Check if material exists and user has access
  const existing = await prisma.material.findUnique({
    where: { id }
  });

  if (!existing) {
    return c.json({ error: 'Material not found' }, 404);
  }

  if (existing.companyId && existing.companyId !== user.companyId && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Access denied' }, 403);
  }

  // Check if new code already exists
  if (result.data.code && result.data.code !== existing.code) {
    const codeExists = await prisma.material.findUnique({
      where: { code: result.data.code }
    });

    if (codeExists) {
      return c.json({ error: 'Material code already exists' }, 400);
    }
  }

  const material = await prisma.material.update({
    where: { id },
    data: result.data,
    include: {
      company: {
        select: {
          id: true,
          name: true
        }
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          username: true
        }
      }
    }
  });

  return c.json(material);
});

// Delete material
materials.delete('/:id', authMiddleware(), async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  // Check if material exists and user has access
  const existing = await prisma.material.findUnique({
    where: { id }
  });

  if (!existing) {
    return c.json({ error: 'Material not found' }, 404);
  }

  if (existing.companyId && existing.companyId !== user.companyId && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Access denied' }, 403);
  }

  // Soft delete by marking as inactive
  await prisma.material.update({
    where: { id },
    data: { isActive: false }
  });

  return c.json({ message: 'Material deleted successfully' });
});

// Bulk import materials
materials.post('/bulk-import', authMiddleware(), async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  if (!Array.isArray(body.materials)) {
    return c.json({ error: 'Materials array is required' }, 400);
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as any[]
  };

  for (const materialData of body.materials) {
    try {
      const result = createMaterialSchema.safeParse(materialData);
      if (!result.success) {
        results.failed++;
        results.errors.push({
          code: materialData.code,
          error: result.error.flatten()
        });
        continue;
      }

      // Check if code already exists
      const existing = await prisma.material.findUnique({
        where: { code: result.data.code }
      });

      if (existing) {
        results.failed++;
        results.errors.push({
          code: result.data.code,
          error: 'Material code already exists'
        });
        continue;
      }

      await prisma.material.create({
        data: {
          ...result.data,
          companyId: result.data.companyId || (user.role === 'SUPER_ADMIN' ? null : user.companyId),
          createdById: user.id
        }
      });

      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        code: materialData.code,
        error: 'Failed to create material'
      });
    }
  }

  return c.json(results);
});

// Get material categories
materials.get('/stats/categories', authMiddleware(), async (c) => {
  const user = c.get('user');
  
  const where: any = {
    OR: [
      { companyId: null },
      ...(user.companyId ? [{ companyId: user.companyId }] : [])
    ]
  };

  const categories = await prisma.material.groupBy({
    by: ['category'],
    where,
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    }
  });

  return c.json(categories.map(cat => ({
    category: cat.category,
    count: cat._count.id
  })));
});

export default materials;