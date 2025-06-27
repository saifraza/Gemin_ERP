import { EventEmitter } from 'events';
import Redis from 'ioredis';
import { Kafka, Producer, Consumer } from 'kafkajs';
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
  private redis: Redis;
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();

  constructor() {
    super();
    
    // Redis for pub/sub and caching
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });

    // Kafka for persistent event streaming
    this.kafka = new Kafka({
      clientId: 'mcp-orchestrator',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });

    this.producer = this.kafka.producer();
    this.initialize();
  }

  private async initialize() {
    await this.producer.connect();
    
    // Subscribe to Redis for real-time events
    const subscriber = this.redis.duplicate();
    await subscriber.subscribe('erp:events:*');
    
    subscriber.on('message', (channel, message) => {
      try {
        const event = JSON.parse(message);
        this.emit(channel, event);
        this.processEvent(event);
      } catch (error) {
        log.error(error, 'Failed to process Redis event');
      }
    });
  }

  async publish(event: Event) {
    // Publish to Redis for real-time
    await this.redis.publish(`erp:events:${event.type}`, JSON.stringify(event));
    
    // Send to Kafka for persistence
    await this.producer.send({
      topic: `erp.${event.type}`,
      messages: [
        {
          key: event.id,
          value: JSON.stringify(event),
          headers: {
            source: event.source,
            timestamp: event.timestamp,
          },
        },
      ],
    });
    
    // Process locally
    this.processEvent(event);
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

  async subscribeToKafka(topics: string[], handler: (event: Event) => void) {
    const groupId = `mcp-${Date.now()}`;
    const consumer = this.kafka.consumer({ groupId });
    
    await consumer.connect();
    await consumer.subscribe({ topics, fromBeginning: false });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value?.toString() || '{}');
          handler(event);
        } catch (error) {
          log.error(error, 'Failed to process Kafka message');
        }
      },
    });
    
    this.consumers.set(groupId, consumer);
    return groupId;
  }

  async close() {
    await this.producer.disconnect();
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect();
    }
    this.redis.disconnect();
  }
}