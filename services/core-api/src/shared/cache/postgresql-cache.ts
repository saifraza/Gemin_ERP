import pkg from '@prisma/client';
const { PrismaClient } = pkg;

export interface CacheOptions {
  ttl?: number; // seconds
  prefix?: string;
}

export class PostgreSQLCache {
  private prisma: PrismaClient;
  private prefix: string;

  constructor(prisma: PrismaClient, prefix = 'cache') {
    this.prisma = prisma;
    this.prefix = prefix;
  }

  async set(key: string, value: any, ttl = 3600): Promise<void> {
    const expiresAt = new Date(Date.now() + ttl * 1000);
    
    await this.prisma.event.create({
      data: {
        type: `${this.prefix}.${key}`,
        source: 'cache',
        data: { key, value },
        metadata: { expiresAt: expiresAt.toISOString(), ttl },
      },
    });
  }

  async get(key: string): Promise<any | null> {
    const entry = await this.prisma.event.findFirst({
      where: {
        type: `${this.prefix}.${key}`,
        createdAt: { gte: new Date(Date.now() - 86400000) }, // Last 24h
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!entry) return null;

    const expiresAt = entry.metadata?.expiresAt 
      ? new Date(entry.metadata.expiresAt as string) 
      : null;
      
    if (expiresAt && expiresAt < new Date()) {
      // Expired - delete it
      await this.del(key);
      return null;
    }

    return (entry.data as any).value;
  }

  async del(key: string): Promise<number> {
    const result = await this.prisma.event.deleteMany({
      where: { type: `${this.prefix}.${key}` },
    });
    return result.count;
  }

  async exists(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const entry = await this.prisma.event.findFirst({
      where: { type: `${this.prefix}.${key}` },
      orderBy: { createdAt: 'desc' },
    });

    if (!entry) return false;

    await this.prisma.event.update({
      where: { id: entry.id },
      data: {
        metadata: {
          ...entry.metadata,
          expiresAt: new Date(Date.now() + seconds * 1000).toISOString(),
        },
      },
    });

    return true;
  }

  async keys(pattern = '*'): Promise<string[]> {
    const entries = await this.prisma.event.findMany({
      where: {
        type: { startsWith: `${this.prefix}.` },
        createdAt: { gte: new Date(Date.now() - 86400000) },
      },
      select: { type: true },
      distinct: ['type'],
    });

    return entries
      .map(e => e.type.replace(`${this.prefix}.`, ''))
      .filter(key => {
        if (pattern === '*') return true;
        // Simple pattern matching
        const regex = pattern.replace(/\*/g, '.*');
        return new RegExp(`^${regex}$`).test(key);
      });
  }

  // Cleanup expired entries (run periodically)
  async cleanup(): Promise<number> {
    const result = await this.prisma.event.deleteMany({
      where: {
        type: { startsWith: `${this.prefix}.` },
        OR: [
          { createdAt: { lt: new Date(Date.now() - 86400000) } }, // Older than 24h
          {
            metadata: {
              path: ['expiresAt'],
              lt: new Date().toISOString(),
            },
          },
        ],
      },
    });
    return result.count;
  }
}

// Rate limiter using PostgreSQL
export class PostgreSQLRateLimiter {
  private cache: PostgreSQLCache;

  constructor(cache: PostgreSQLCache) {
    this.cache = cache;
  }

  async isAllowed(key: string, limit: number, window: number): Promise<boolean> {
    const current = await this.cache.get(`rate:${key}`) || 0;
    
    if (current >= limit) {
      return false;
    }

    await this.cache.set(`rate:${key}`, current + 1, window);
    return true;
  }
}

// Session store using PostgreSQL
export class PostgreSQLSessionStore {
  private cache: PostgreSQLCache;

  constructor(cache: PostgreSQLCache) {
    this.cache = cache;
  }

  async set(sessionId: string, data: any, ttl = 86400): Promise<void> {
    await this.cache.set(`session:${sessionId}`, data, ttl);
  }

  async get(sessionId: string): Promise<any | null> {
    return await this.cache.get(`session:${sessionId}`);
  }

  async destroy(sessionId: string): Promise<void> {
    await this.cache.del(`session:${sessionId}`);
  }

  async touch(sessionId: string, ttl = 86400): Promise<void> {
    await this.cache.expire(`session:${sessionId}`, ttl);
  }
}