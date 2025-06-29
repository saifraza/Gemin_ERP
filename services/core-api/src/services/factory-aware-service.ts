import { PrismaClient } from '@prisma/client';
import { FactoryContext } from '../middleware/factory-access';

export abstract class FactoryAwareService {
  protected prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Filter any query by factory access
  protected applyFactoryFilter(query: any, context: FactoryContext, factoryField = 'factoryId') {
    if (context.accessLevel === 'HQ' && context.currentFactory === 'all') {
      // HQ viewing all - filter by company
      return {
        ...query,
        where: {
          ...query.where,
          factory: {
            companyId: context.companyId
          }
        }
      };
    }

    // Filter by specific factory or allowed factories
    const factories = context.currentFactory === 'all' 
      ? context.allowedFactories 
      : [context.currentFactory];

    return {
      ...query,
      where: {
        ...query.where,
        [factoryField]: { in: factories }
      }
    };
  }

  // Check if user can access a specific factory
  protected canAccessFactory(factoryId: string, context: FactoryContext): boolean {
    if (context.accessLevel === 'HQ') {
      return true; // HQ can access all factories in their company
    }
    return context.allowedFactories.includes(factoryId);
  }

  // Get factory list for user
  protected async getUserFactories(context: FactoryContext) {
    if (context.accessLevel === 'HQ') {
      // Return all factories in company
      return this.prisma.factory.findMany({
        where: { companyId: context.companyId },
        orderBy: { name: 'asc' }
      });
    }

    // Return only assigned factories
    return this.prisma.factory.findMany({
      where: {
        id: { in: context.allowedFactories }
      },
      orderBy: { name: 'asc' }
    });
  }

  // Consolidated data helper for HQ view
  protected async getConsolidatedData<T>(
    context: FactoryContext,
    fetchFunction: (factoryId: string) => Promise<T[]>
  ): Promise<{ factoryId: string; factoryName: string; data: T[] }[]> {
    const factories = await this.getUserFactories(context);
    
    const results = await Promise.all(
      factories.map(async (factory) => ({
        factoryId: factory.id,
        factoryName: factory.name,
        data: await fetchFunction(factory.id)
      }))
    );

    return results;
  }
}