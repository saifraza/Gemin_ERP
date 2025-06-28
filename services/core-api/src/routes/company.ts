import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../index.js';

const companyRoutes = new Hono();

// Health check
companyRoutes.get('/health', (c) => {
  return c.json({ status: 'ok', message: 'Company routes are loaded' });
});

// Get all companies
companyRoutes.get('/', async (c) => {
  const companies = await prisma.company.findMany({
    include: {
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
  
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      factories: true,
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
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
    await prisma.company.delete({
      where: { id },
    });
    
    return c.json({ message: 'Company deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return c.json({ error: 'Company not found' }, 404);
    }
    throw error;
  }
});

export { companyRoutes };