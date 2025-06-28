import { PrismaClient } from '@prisma/client';
import { FactoryAwareService } from './factory-aware-service.js';
import { FactoryContext } from '../middleware/factory-access.js';

export class FinancialService extends FactoryAwareService {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  // Get profit & loss report
  async getProfitLossReport(context: FactoryContext, period: { from: Date; to: Date }) {
    if (context.currentFactory === 'all' && context.accessLevel === 'HQ') {
      // HQ consolidated view
      return this.getConsolidatedPL(context, period);
    } else {
      // Single factory view
      return this.getFactoryPL(context.currentFactory, period);
    }
  }

  // Consolidated P&L for HQ
  private async getConsolidatedPL(context: FactoryContext, period: { from: Date; to: Date }) {
    const factories = await this.getUserFactories(context);
    
    const consolidatedData = await Promise.all(
      factories.map(async (factory) => {
        const plData = await this.getFactoryPL(factory.id, period);
        return {
          factoryId: factory.id,
          factoryName: factory.name,
          factoryCode: factory.code,
          ...plData,
        };
      })
    );

    // Calculate totals
    const totals = consolidatedData.reduce(
      (acc, factory) => ({
        revenue: acc.revenue + factory.revenue,
        directCosts: acc.directCosts + factory.directCosts,
        operatingExpenses: acc.operatingExpenses + factory.operatingExpenses,
        grossProfit: acc.grossProfit + factory.grossProfit,
        netProfit: acc.netProfit + factory.netProfit,
      }),
      { revenue: 0, directCosts: 0, operatingExpenses: 0, grossProfit: 0, netProfit: 0 }
    );

    return {
      type: 'consolidated',
      period,
      factories: consolidatedData,
      totals,
      margins: {
        grossMargin: (totals.grossProfit / totals.revenue) * 100,
        netMargin: (totals.netProfit / totals.revenue) * 100,
      },
    };
  }

  // Single factory P&L
  private async getFactoryPL(factoryId: string, period: { from: Date; to: Date }) {
    // This is a placeholder - in real implementation, this would query actual financial data
    // For now, returning mock data structure
    const revenue = Math.random() * 10000000; // Mock revenue
    const directCosts = revenue * 0.6; // 60% of revenue
    const operatingExpenses = revenue * 0.25; // 25% of revenue
    const grossProfit = revenue - directCosts;
    const netProfit = grossProfit - operatingExpenses;

    return {
      revenue,
      directCosts,
      operatingExpenses,
      grossProfit,
      netProfit,
      breakdown: {
        revenue: {
          sugar: revenue * 0.6,
          ethanol: revenue * 0.25,
          power: revenue * 0.1,
          byProducts: revenue * 0.05,
        },
        costs: {
          rawMaterial: directCosts * 0.7,
          labor: directCosts * 0.2,
          utilities: directCosts * 0.1,
        },
      },
    };
  }

  // Get accounts receivable
  async getAccountsReceivable(context: FactoryContext) {
    // In a real implementation, this would query invoice/payment tables
    // Filtering by factory access
    const query = {
      where: {
        status: 'PENDING',
        // factoryId would be on the invoice/sales order
      },
    };

    const filteredQuery = this.applyFactoryFilter(query, context);
    
    // Mock implementation
    return {
      total: 2500000,
      aging: {
        current: 1000000,
        days30: 800000,
        days60: 500000,
        days90Plus: 200000,
      },
      topDebtors: [
        { name: 'ABC Industries', amount: 500000, daysOutstanding: 45 },
        { name: 'XYZ Trading', amount: 350000, daysOutstanding: 30 },
      ],
    };
  }

  // Get cash flow statement
  async getCashFlow(context: FactoryContext, period: { from: Date; to: Date }) {
    if (context.currentFactory === 'all' && context.accessLevel === 'HQ') {
      // Consolidated cash flow
      const data = await this.getConsolidatedData(
        context,
        (factoryId) => this.getFactoryCashFlow(factoryId, period)
      );
      
      return {
        type: 'consolidated',
        period,
        factories: data,
      };
    }

    return this.getFactoryCashFlow(context.currentFactory, period);
  }

  private async getFactoryCashFlow(factoryId: string, period: { from: Date; to: Date }) {
    // Mock cash flow data
    return {
      operating: {
        netIncome: 1500000,
        depreciation: 200000,
        workingCapitalChange: -300000,
        total: 1400000,
      },
      investing: {
        capex: -500000,
        assetSales: 50000,
        total: -450000,
      },
      financing: {
        debtProceeds: 1000000,
        debtRepayment: -800000,
        dividends: -300000,
        total: -100000,
      },
      netCashFlow: 850000,
      openingBalance: 2000000,
      closingBalance: 2850000,
    };
  }
}