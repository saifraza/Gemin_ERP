import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';
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
  private prisma: PrismaClient;
  private pollInterval: NodeJS.Timeout | null = null;
  private lastEventId: string | null = null;

  constructor() {
    super();
    this.prisma = new PrismaClient();
    // Start polling for events
    this.startEventPolling();
  }

  private startEventPolling() {
    // Poll for new events every 500ms
    this.pollInterval = setInterval(async () => {
      try {
        const query: any = {
          where: {
            type: { startsWith: 'mcp.' }, // Only poll for MCP-related events
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        };

        // Only get events newer than the last one we processed
        if (this.lastEventId) {
          const lastEvent = await this.prisma.event.findUnique({
            where: { id: this.lastEventId },
          });
          if (lastEvent) {
            query.where.createdAt = { gt: lastEvent.createdAt };
          }
        }

        const events = await this.prisma.event.findMany(query);

        // Process events in chronological order
        for (const event of events.reverse()) {
          this.emit('event', {
            id: event.id,
            type: event.type,
            source: event.source,
            timestamp: event.createdAt.toISOString(),
            data: event.data,
            metadata: event.metadata as Record<string, any>,
          });
          this.lastEventId = event.id;
        }
      } catch (error) {
        log.error('Event polling error:', error);
      }
    }, 500);
  }

  async publish(event: Omit<Event, 'id' | 'timestamp'>) {
    try {
      const createdEvent = await this.prisma.event.create({
        data: {
          type: event.type,
          source: event.source,
          data: event.data,
          metadata: event.metadata || {},
        },
      });

      const fullEvent: Event = {
        id: createdEvent.id,
        type: event.type,
        source: event.source,
        timestamp: createdEvent.createdAt.toISOString(),
        data: event.data,
        metadata: event.metadata,
      };

      // Emit locally immediately
      this.emit('event', fullEvent);
      this.emit(event.type, fullEvent);

      log.info(`Event published: ${event.type}`);
      return fullEvent;
    } catch (error) {
      log.error('Failed to publish event:', error);
      throw error;
    }
  }

  subscribe(pattern: string, handler: (event: Event) => void) {
    if (pattern === '*') {
      this.on('event', handler);
    } else {
      this.on(pattern, handler);
    }

    log.info(`Subscribed to pattern: ${pattern}`);
    
    return () => {
      if (pattern === '*') {
        this.off('event', handler);
      } else {
        this.off(pattern, handler);
      }
    };
  }

  async getEvents(filter?: { type?: string; source?: string; limit?: number }) {
    try {
      const where: any = {};
      if (filter?.type) {
        where.type = filter.type;
      }
      if (filter?.source) {
        where.source = filter.source;
      }

      const events = await this.prisma.event.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filter?.limit || 100,
      });

      return events.map(event => ({
        id: event.id,
        type: event.type,
        source: event.source,
        timestamp: event.createdAt.toISOString(),
        data: event.data,
        metadata: event.metadata as Record<string, any>,
      }));
    } catch (error) {
      log.error('Failed to get events:', error);
      return [];
    }
  }

  async cleanup() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    await this.prisma.$disconnect();
    log.info('Event bus cleaned up');
  }
}