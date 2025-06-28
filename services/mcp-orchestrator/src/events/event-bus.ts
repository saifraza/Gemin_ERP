import { EventEmitter } from 'events';
import Redis from 'ioredis';
import pino from 'pino';

const log = pino({ name: 'event-bus' });

export interface Event {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  data: any;
  metadata?: Record<string, any>;
}

export class EventBus extends EventEmitter {
  private redis: Redis | null = null;
  private redisSubscriber: Redis | null = null;
  private isConnected = false;

  constructor() {
    super();
    this.initialize();
  }

  private async initialize() {
    try {
      const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST || null;
      
      if (!redisUrl) {
        log.warn('No Redis URL provided, running without Redis pub/sub');
        return;
      }

      // Initialize Redis with proper error handling
      this.redis = new Redis(redisUrl, {
        retryStrategy: (times) => {
          if (times > 10) {
            log.error('Redis connection failed after 10 attempts');
            return null;
          }
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        enableOfflineQueue: false,
      });

      // Handle Redis errors gracefully
      this.redis.on('error', (err) => {
        log.error({ error: err.message }, 'Redis connection error');
      });

      this.redis.on('connect', () => {
        log.info('Connected to Redis');
      });

      this.redis.on('ready', async () => {
        log.info('Redis ready for commands');
        this.isConnected = true;
        
        // Setup subscriber after connection is ready
        try {
          this.redisSubscriber = this.redis.duplicate();
          await this.redisSubscriber.subscribe('erp:events:*');
          
          this.redisSubscriber.on('message', (channel, message) => {
            try {
              const event = JSON.parse(message);
              this.emit(channel, event);
              this.processEvent(event);
            } catch (error) {
              log.error(error, 'Failed to process Redis event');
            }
          });
          
          log.info('Redis pub/sub initialized successfully');
        } catch (error) {
          log.error({ error }, 'Failed to setup Redis subscriber');
        }
      });
    } catch (error) {
      log.error({ error }, 'Failed to initialize Redis, continuing without it');
      this.redis = null;
      this.redisSubscriber = null;
    }
  }

  async publish(event: Event) {
    // Always emit locally
    this.emit(`erp:events:${event.type}`, event);
    this.processEvent(event);

    // Try to publish to Redis if connected
    if (this.redis && this.isConnected) {
      try {
        await this.redis.publish(`erp:events:${event.type}`, JSON.stringify(event));
      } catch (error) {
        log.error({ error }, 'Failed to publish to Redis');
      }
    }
  }

  subscribe(pattern: string, handler: (event: Event) => void): () => void {
    const eventHandler = (event: Event) => handler(event);
    
    if (pattern === '*') {
      // Subscribe to all events
      this.on('erp:events:*', eventHandler);
    } else {
      // Subscribe to specific pattern
      this.on(`erp:events:${pattern}`, eventHandler);
    }

    // Return unsubscribe function
    return () => {
      if (pattern === '*') {
        this.off('erp:events:*', eventHandler);
      } else {
        this.off(`erp:events:${pattern}`, eventHandler);
      }
    };
  }

  private processEvent(event: Event) {
    // AI-driven event processing
    switch (event.type) {
      case 'production.anomaly':
        this.handleProductionAnomaly(event);
        break;
      case 'equipment.failure':
        this.handleEquipmentFailure(event);
        break;
      case 'quality.alert':
        this.handleQualityAlert(event);
        break;
      case 'procurement.request':
        this.handleProcurementRequest(event);
        break;
    }
  }

  private async handleProductionAnomaly(event: Event) {
    log.info({ event }, 'Processing production anomaly');
    
    // Trigger AI analysis
    this.emit('ai:analyze', {
      type: 'anomaly',
      context: event.data,
      actions: ['diagnose', 'recommend', 'alert'],
    });
  }

  private async handleEquipmentFailure(event: Event) {
    log.error({ event }, 'Equipment failure detected');
    
    // Emergency response
    this.emit('emergency:response', {
      equipment: event.data.equipment,
      severity: event.data.severity,
      actions: ['shutdown', 'notify', 'dispatch_maintenance'],
    });
  }

  private async handleQualityAlert(event: Event) {
    log.warn({ event }, 'Quality alert received');
    
    // Quality control workflow
    this.emit('quality:workflow', {
      batch: event.data.batch,
      parameters: event.data.parameters,
      actions: ['isolate', 'retest', 'investigate'],
    });
  }

  private async handleProcurementRequest(event: Event) {
    log.info({ event }, 'Processing procurement request');
    
    // Automated procurement
    this.emit('procurement:auto', {
      items: event.data.items,
      urgency: event.data.urgency,
      actions: ['check_inventory', 'find_vendors', 'create_rfq'],
    });
  }

  async close() {
    if (this.redis) {
      this.redis.disconnect();
    }
    if (this.redisSubscriber) {
      this.redisSubscriber.disconnect();
    }
  }
}