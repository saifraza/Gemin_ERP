import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../index.js';
import { factoryAccessMiddleware, getFactoryContext } from '../middleware/factory-access.js';
import { FinancialService } from '../services/financial-service.js';

const financeRoutes = new Hono();
const financialService = new FinancialService(prisma);

// Apply factory access middleware to all routes
financeRoutes.use('*', factoryAccessMiddleware);

// Get P&L Report
const plQuerySchema = z.object({
  from: z.string().transform(s => new Date(s)),
  to: z.string().transform(s => new Date(s)),
});

financeRoutes.get('/profit-loss', zValidator('query', plQuerySchema), async (c) => {
  const context = getFactoryContext(c);
  const { from, to } = c.req.valid('query');
  
  const report = await financialService.getProfitLossReport(context, { from, to });
  
  return c.json(report);
});

// Get Accounts Receivable
financeRoutes.get('/accounts-receivable', async (c) => {
  const context = getFactoryContext(c);
  
  const arData = await financialService.getAccountsReceivable(context);
  
  return c.json(arData);
});

// Get Cash Flow Statement
financeRoutes.get('/cash-flow', zValidator('query', plQuerySchema), async (c) => {
  const context = getFactoryContext(c);
  const { from, to } = c.req.valid('query');
  
  const cashFlow = await financialService.getCashFlow(context, { from, to });
  
  return c.json(cashFlow);
});

// Get Financial Dashboard Summary
financeRoutes.get('/dashboard', async (c) => {
  const context = getFactoryContext(c);
  
  // Get current month period
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const [pl, ar, cashFlow] = await Promise.all([
    financialService.getProfitLossReport(context, { from: firstDay, to: lastDay }),
    financialService.getAccountsReceivable(context),
    financialService.getCashFlow(context, { from: firstDay, to: lastDay }),
  ]);
  
  return c.json({
    period: { from: firstDay, to: lastDay },
    profitLoss: pl,
    accountsReceivable: ar,
    cashFlow: cashFlow,
    kpis: {
      revenue: (pl as any).totals?.revenue || (pl as any).revenue || 0,
      netProfit: (pl as any).totals?.netProfit || (pl as any).netProfit || 0,
      arTotal: ar.total,
      cashBalance: (cashFlow as any).closingBalance || 0,
    },
  });
});

// Get Budget vs Actual (placeholder for future implementation)
financeRoutes.get('/budget-analysis', async (c) => {
  const context = getFactoryContext(c);
  
  // This would compare actual financial data with budget data
  return c.json({
    message: 'Budget analysis endpoint - to be implemented',
    context: {
      factory: context.currentFactory,
      accessLevel: context.accessLevel,
    },
  });
});

export { financeRoutes };