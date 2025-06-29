import { Context, Next } from 'hono';
import pino from 'pino';

const log = pino({ name: 'performance' });

interface PerformanceMetrics {
  path: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

/**
 * Performance monitoring middleware
 * Tracks request duration and logs slow requests
 */
export const performanceMonitoring = (options = { slowRequestThreshold: 1000 }) => {
  return async (c: Context, next: Next) => {
    const start = Date.now();
    const path = c.req.path;
    const method = c.req.method;
    
    try {
      await next();
    } finally {
      const duration = Date.now() - start;
      const statusCode = c.res.status;
      
      const metrics: PerformanceMetrics = {
        path,
        method,
        statusCode,
        duration,
        timestamp: new Date(),
        userAgent: c.req.header('user-agent'),
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      };
      
      // Add performance headers
      c.header('X-Response-Time', `${duration}ms`);
      c.header('X-Request-ID', c.req.header('x-request-id') || crypto.randomUUID());
      
      // Log slow requests
      if (duration > options.slowRequestThreshold) {
        log.warn({
          ...metrics,
          message: 'Slow request detected',
        });
      }
      
      // Log all requests in development
      if (process.env.NODE_ENV === 'development') {
        log.info(metrics);
      }
      
      // Store metrics in database for analysis (async, non-blocking)
      storeMetrics(metrics).catch(err => {
        log.error('Failed to store metrics:', err);
      });
    }
  };
};

/**
 * Store performance metrics in database
 * This runs asynchronously to avoid blocking the response
 */
async function storeMetrics(metrics: PerformanceMetrics): Promise<void> {
  // In a real implementation, you would store this in a time-series database
  // For now, we'll just log metrics that exceed certain thresholds
  
  if (metrics.duration > 500) {
    // Log to a metrics service or database
    // Example: await prisma.performanceMetric.create({ data: metrics });
  }
}

/**
 * Database query performance logger
 * Logs slow database queries
 */
export function logSlowQuery(queryName: string, duration: number, threshold = 100) {
  if (duration > threshold) {
    log.warn({
      type: 'slow_query',
      query: queryName,
      duration,
      threshold,
      message: `Slow database query: ${queryName} took ${duration}ms`,
    });
  }
}

/**
 * Memory usage monitor
 * Logs memory usage periodically
 */
export function startMemoryMonitoring(intervalMs = 60000) {
  setInterval(() => {
    const usage = process.memoryUsage();
    const metrics = {
      type: 'memory_usage',
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      timestamp: new Date(),
    };
    
    // Warn if heap usage is over 90%
    const heapUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;
    if (heapUsagePercent > 90) {
      log.warn({
        ...metrics,
        heapUsagePercent,
        message: 'High memory usage detected',
      });
    }
    
    if (process.env.NODE_ENV === 'development') {
      log.info(metrics);
    }
  }, intervalMs);
}