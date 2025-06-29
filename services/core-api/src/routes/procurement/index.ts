import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth';
import { requireModulePermission, requireCompanyAccess } from '../../middleware/rbac';
import { prisma } from '../../index';
import indents from './indents';
import vendors from './vendors';
import rfqs from './rfqs';
import quotations from './quotations';
import purchaseOrders from './purchase-orders';

const procurement = new Hono();

// Mount sub-routes
procurement.route('/indents', indents);
procurement.route('/vendors', vendors);
procurement.route('/rfqs', rfqs);
procurement.route('/quotations', quotations);
procurement.route('/purchase-orders', purchaseOrders);

// Procurement dashboard stats
procurement.get(
  '/stats/dashboard',
  authMiddleware(),
  requireModulePermission('supply-chain', 'READ'),
  requireCompanyAccess(),
  async (c) => {
    const user = c.get('user');
    
    // This would be optimized with a single aggregated query in production
    const stats = {
      indents: await prisma.materialIndent.count({
        where: { companyId: user.companyId, status: 'PENDING' },
      }),
      activeRFQs: await prisma.rFQ.count({
        where: { companyId: user.companyId, status: 'ACTIVE' },
      }),
      pendingQuotations: await prisma.quotation.count({
        where: {
          rfq: { companyId: user.companyId },
          status: 'PENDING',
        },
      }),
      pendingPOs: await prisma.purchaseOrder.count({
        where: { companyId: user.companyId, status: 'PENDING_APPROVAL' },
      }),
    };
    
    return c.json(stats);
  }
);

export default procurement;