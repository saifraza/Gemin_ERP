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

export { companyRoutes };