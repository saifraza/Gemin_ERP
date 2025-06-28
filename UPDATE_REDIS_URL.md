# Update Redis URL in All Services

## New Redis Service Name: Redis-jr2e

Your new Redis service reference is `${{ Redis-jr2e.REDIS_URL }}`

## Update These Services

### 1. Core API Service
Go to Variables tab and update:
```
REDIS_URL=${{ Redis-jr2e.REDIS_URL }}
```

### 2. API Gateway Service  
Go to Variables tab and update:
```
REDIS_URL=${{ Redis-jr2e.REDIS_URL }}
```

### 3. MCP Orchestrator Service
Go to Variables tab and update:
```
REDIS_URL=${{ Redis-jr2e.REDIS_URL }}
```

### 4. Event Processor Service
Go to Variables tab and update:
```
REDIS_URL=${{ Redis-jr2e.REDIS_URL }}
```

## After Updating

Railway will automatically redeploy each service. After deployment:

1. Check Redis connection:
```bash
curl https://core-api-production-76b9.up.railway.app/api/test/redis-debug
```

2. Verify all services:
```bash
./scripts/test-redis.sh
```

The connection should now show as "ready" and Redis will be working!

## Benefits Once Connected

- ✅ Faster session management
- ✅ Distributed rate limiting
- ✅ Event queue persistence  
- ✅ Better caching performance