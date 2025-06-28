import { z } from 'zod';

// Division types
export const DivisionEnum = z.enum(['SUGAR', 'ETHANOL', 'POWER', 'FEED', 'COMMON']);
export type Division = z.infer<typeof DivisionEnum>;

// Equipment status
export const EquipmentStatusEnum = z.enum(['RUNNING', 'STOPPED', 'MAINTENANCE', 'FAULT']);
export type EquipmentStatus = z.infer<typeof EquipmentStatusEnum>;

// Factory metrics
export const FactoryMetricsSchema = z.object({
  division: DivisionEnum,
  timestamp: z.string().datetime(),
  production: z.object({
    current: z.number(),
    target: z.number(),
    efficiency: z.number(),
    unit: z.string(),
  }),
  equipment: z.array(z.object({
    id: z.string(),
    name: z.string(),
    status: EquipmentStatusEnum,
    metrics: z.record(z.any()),
  })),
  alerts: z.array(z.object({
    id: z.string(),
    level: z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']),
    message: z.string(),
    timestamp: z.string().datetime(),
  })),
});

export type FactoryMetrics = z.infer<typeof FactoryMetricsSchema>;

// Production forecast
export const ProductionForecastSchema = z.object({
  division: DivisionEnum,
  period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  predictions: z.array(z.object({
    timestamp: z.string().datetime(),
    value: z.number(),
    confidence: z.number(),
    factors: z.record(z.string()),
  })),
  recommendations: z.array(z.string()),
});

export type ProductionForecast = z.infer<typeof ProductionForecastSchema>;

// Digital twin state
export const DigitalTwinStateSchema = z.object({
  factory: z.object({
    id: z.string(),
    name: z.string(),
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  divisions: z.array(z.object({
    division: DivisionEnum,
    status: z.enum(['OPERATIONAL', 'PARTIAL', 'SHUTDOWN']),
    equipment: z.array(z.object({
      id: z.string(),
      type: z.string(),
      position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
      status: EquipmentStatusEnum,
      telemetry: z.record(z.any()),
    })),
  })),
  timestamp: z.string().datetime(),
});

export type DigitalTwinState = z.infer<typeof DigitalTwinStateSchema>;