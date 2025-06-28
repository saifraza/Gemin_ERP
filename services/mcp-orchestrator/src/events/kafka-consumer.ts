import { EventBus } from './event-bus.js';
import pino from 'pino';

const log = pino({ name: 'kafka-consumer' });

export class KafkaConsumer {
  private isRunning = false;

  constructor(private eventBus: EventBus) {}
  
  async start() {
    // Kafka is optional - we can run without it
    log.info('Kafka consumer initialized (currently disabled - Kafka is optional)');
    this.isRunning = true;
  }
  
  async stop() {
    this.isRunning = false;
    log.info('Kafka consumer stopped');
  }
}