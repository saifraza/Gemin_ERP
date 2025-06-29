# Guide: Remove Redis and Use PostgreSQL Cache

## Step 1: Remove Redis Environment Variables

Remove these from all services in Railway:
- `REDIS_URL`
- `DISABLE_REDIS`
- Any Redis references

## Step 2: Update Service Code

### Core API
```typescript
// Before
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// After
import { PostgreSQLCache } from '@modern-erp/shared/cache';
const cache = new PostgreSQLCache(prisma);
```

### API Gateway (Rate Limiting)
```typescript
// Before
const count = await redis.incr(key);

// After  
const limiter = new PostgreSQLRateLimiter(cache);
const allowed = await limiter.isAllowed(ip, 100, 60);
```

### Session Management
```typescript
// Before
await redis.setex(`session:${token}`, 3600, data);

// After
const sessions = new PostgreSQLSessionStore(cache);
await sessions.set(token, data, 3600);
```

## Step 3: Add Cleanup Job

Add to Event Processor:
```typescript
// Run every hour
cron.schedule('0 * * * *', async () => {
  const deleted = await cache.cleanup();
  log.info(`Cleaned up ${deleted} expired cache entries`);
});
```

## Step 4: Optimize Database

Add index for better cache performance:
```sql
CREATE INDEX idx_event_cache ON "Event" (type, "createdAt" DESC) 
WHERE type LIKE 'cache.%';
```

## Benefits After Removal

1. **Simpler Architecture**
   - One less service to monitor
   - No Redis connection issues
   - Easier local development

2. **Cost Savings**
   - No Redis hosting costs
   - Less memory usage
   - Fewer resources needed

3. **Better Reliability**
   - No Redis downtime
   - Data persists through restarts
   - Automatic backups with PostgreSQL

4. **Good Enough Performance**
   - 500ms latency is fine for ERP
   - Can handle 100+ requests/second
   - Scales with PostgreSQL

## When to Reconsider Redis

Only add Redis back if you have:
- ✅ 10,000+ requests per second
- ✅ Need <10ms latency
- ✅ Real-time features (chat, gaming)
- ✅ Pub/Sub with millions of messages

For ERP systems, PostgreSQL cache is the perfect solution!