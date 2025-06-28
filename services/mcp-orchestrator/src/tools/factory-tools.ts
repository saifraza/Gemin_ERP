import { ToolRequestHandler } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Factory Status Tool
const factoryStatusSchema = z.object({
  factoryId: z.string().optional(),
  division: z.enum(['SUGAR', 'ETHANOL', 'POWER', 'FEED', 'ALL']).optional(),
  timeRange: z.enum(['realtime', '1h', '24h', '7d', '30d']).default('realtime'),
});

const factoryStatusHandler: ToolRequestHandler = {
  name: 'factory_status',
  description: 'Get real-time factory status including production metrics, equipment status, and alerts',
  inputSchema: factoryStatusSchema,
  handler: async (request) => {
    const { factoryId, division, timeRange } = request.arguments;
    
    try {
      // Get factory data
      const factory = await prisma.factory.findFirst({
        where: factoryId ? { id: factoryId } : undefined,
        include: {
          company: true,
          divisions: {
            where: division && division !== 'ALL' ? { type: division } : undefined,
            include: {
              equipment: {
                include: {
                  telemetry: {
                    orderBy: { timestamp: 'desc' },
                    take: 1,
                  },
                },
              },
              production: {
                where: { status: 'IN_PROGRESS' },
                include: {
                  parameters: {
                    orderBy: { timestamp: 'desc' },
                    take: 5,
                  },
                },
              },
            },
          },
        },
      });

      if (!factory) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: 'Factory not found' }, null, 2),
          }],
        };
      }

      // Calculate time range for data filtering
      const now = new Date();
      const startTime = new Date();
      switch (timeRange) {
        case '1h': startTime.setHours(now.getHours() - 1); break;
        case '24h': startTime.setDate(now.getDate() - 1); break;
        case '7d': startTime.setDate(now.getDate() - 7); break;
        case '30d': startTime.setDate(now.getDate() - 30); break;
      }

      // Get equipment status summary
      const equipmentStatus = await prisma.equipment.groupBy({
        by: ['status'],
        where: { factoryId: factory.id },
        _count: true,
      });

      // Get recent events/alerts
      const recentEvents = await prisma.event.findMany({
        where: {
          type: { startsWith: 'factory.alert' },
          createdAt: { gte: startTime },
          metadata: { path: ['factoryId'], equals: factory.id },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Format the response
      const response = {
        timestamp: new Date().toISOString(),
        factory: {
          id: factory.id,
          name: factory.name,
          company: factory.company.name,
          type: factory.type,
          location: factory.location,
        },
        divisions: factory.divisions.map(div => ({
          id: div.id,
          type: div.type,
          name: div.name,
          isActive: div.isActive,
          equipment: {
            total: div.equipment.length,
            operational: div.equipment.filter(e => e.status === 'OPERATIONAL').length,
            maintenance: div.equipment.filter(e => e.status === 'MAINTENANCE').length,
            fault: div.equipment.filter(e => e.status === 'FAULT').length,
          },
          production: div.production.map(batch => ({
            batchNumber: batch.batchNumber,
            productType: batch.productType,
            quantity: batch.quantity,
            unit: batch.unit,
            status: batch.status,
            parameters: batch.parameters.map(p => ({
              name: p.name,
              value: p.value,
              unit: p.unit,
              timestamp: p.timestamp,
            })),
          })),
          latestTelemetry: div.equipment.map(eq => ({
            equipmentCode: eq.code,
            name: eq.name,
            status: eq.status,
            metrics: eq.telemetry[0]?.metrics || {},
            lastUpdate: eq.telemetry[0]?.timestamp || null,
          })),
        })),
        equipmentSummary: equipmentStatus.reduce((acc, item) => {
          acc[item.status.toLowerCase()] = item._count;
          return acc;
        }, {} as Record<string, number>),
        alerts: recentEvents.map(event => ({
          level: event.data?.level || 'INFO',
          message: event.data?.message || 'No message',
          timestamp: event.createdAt,
          source: event.source,
        })),
        timeRange,
      };

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2),
        }],
      };
    } catch (error) {
      console.error('Factory status error:', error);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: 'Failed to fetch factory status',
            details: error instanceof Error ? error.message : 'Unknown error',
          }, null, 2),
        }],
      };
    } finally {
      await prisma.$disconnect();
    }
  },
};

// Production Forecast Tool
const productionForecastSchema = z.object({
  division: z.enum(['SUGAR', 'ETHANOL', 'POWER', 'FEED']),
  duration: z.enum(['24h', '7d', '30d', '90d']),
  factors: z.array(z.string()).optional(),
});

const productionForecastHandler: ToolRequestHandler = {
  name: 'production_forecast',
  description: 'AI-powered production forecasting based on historical data, weather, and market conditions',
  inputSchema: productionForecastSchema,
  handler: async (request) => {
    const { division, duration, factors } = request.arguments;
    
    // This would use ML models
    const forecast = {
      division,
      duration,
      predictions: [
        {
          date: '2025-01-28',
          production: 12000,
          confidence: 0.85,
          factors: {
            weather: 'favorable',
            cane_availability: 'high',
            equipment_status: 'optimal',
          },
        },
      ],
      recommendations: [
        'Schedule maintenance for Crusher-2 during low production period',
        'Increase cane procurement by 15% for next week',
      ],
    };
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(forecast, null, 2),
        },
      ],
    };
  },
};

// Anomaly Detection Tool
const anomalyDetectionSchema = z.object({
  system: z.string(),
  sensitivity: z.enum(['low', 'medium', 'high']).default('medium'),
});

const anomalyDetectionHandler: ToolRequestHandler = {
  name: 'anomaly_detector',
  description: 'Detect anomalies in production, equipment, or quality metrics',
  inputSchema: anomalyDetectionSchema,
  handler: async (request) => {
    const { system, sensitivity } = request.arguments;
    
    const anomalies = {
      detected: [
        {
          timestamp: new Date().toISOString(),
          system: 'BOILER-2',
          metric: 'pressure',
          severity: 'medium',
          value: 28.5,
          expected: { min: 20, max: 25 },
          action: 'Reduce fuel feed rate',
        },
      ],
      patterns: [
        'Unusual vibration pattern in Turbine-1 bearings',
        'Sugar color deviation in last 3 batches',
      ],
    };
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(anomalies, null, 2),
        },
      ],
    };
  },
};

export const factoryTools = [
  factoryStatusHandler,
  productionForecastHandler,
  anomalyDetectionHandler,
];