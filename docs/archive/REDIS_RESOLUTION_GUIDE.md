# Redis Connection Resolution Guide

## Current Status
- Services are starting successfully ✅
- Health checks are working internally ✅
- Redis connection is failing due to DNS resolution ⚠️

## Understanding the Issue

### Why Redis is Failing
1. **Internal DNS Only Works in Railway** - `redis.railway.internal` can't be resolved from your local machine
2. **Services Try to Connect on Startup** - Even with lazy loading, the connection attempts happen
3. **This is Normal and Expected** - Services will connect once inside Railway's network

## Resolution Steps

### 1. Verify Services are Running in Railway

Check each service's logs in Railway dashboard:
- Look for "Running on http://0.0.0.0:PORT"
- Confirm health checks are returning 200
- Redis errors are expected and OK

### 2. Check Environment Variables

For each service in Railway, verify:

```
# Core API, Event Processor, MCP Orchestrator
REDIS_URL=${{Redis.REDIS_URL}}
DATABASE_URL=${{Postgres-O1Ol.DATABASE_URL}}

# API Gateway
REDIS_URL=${{Redis.REDIS_URL}}
```

**Important**: These should show as references, not actual values!

### 3. Test Internal Health Checks

Railway runs health checks internally. If services show as "Healthy" in Railway dashboard, they're working correctly despite external 502 errors.

### 4. Verify PORT Usage

Each service must use the PORT environment variable:
- Don't set PORT manually in Railway
- Railway assigns it automatically
- Services read it from process.env.PORT

## How to Verify Everything is Working

### From Railway Dashboard:
1. **Check Service Status** - Should show green/active
2. **Check Deployment Logs** - Look for successful startup messages
3. **Check Metrics** - CPU/Memory usage indicates service is running

### What You Should See:
- Services marked as "Healthy" in Railway
- Deployment logs showing startup messages
- Some Redis connection errors (this is OK!)

## When Redis Will Connect

Redis will successfully connect when:
1. Service is fully deployed in Railway
2. Internal DNS is available
3. Service can reach redis.railway.internal

This happens automatically - no action needed!

## Testing Service Functionality

Once services show as healthy in Railway:

1. **Test Basic Endpoints**
```bash
# Should return service info
curl https://core-api-production-76b9.up.railway.app/
curl https://api-gateway-production-00e9.up.railway.app/
```

2. **Test Health Endpoints**
```bash
# Should return health status
curl https://core-api-production-76b9.up.railway.app/health
curl https://api-gateway-production-00e9.up.railway.app/health
```

## Common Issues and Solutions

### Still Getting 502 Errors?

1. **Check Railway Logs** - Services might be restarting
2. **Verify Build Succeeded** - Check deployment status
3. **Check PORT Binding** - Must bind to 0.0.0.0, not localhost
4. **Health Check Timeout** - Might need to increase timeout in railway.json

### Services Keep Restarting?

1. **Check for Crash Loops** - Look for errors in logs
2. **Memory Issues** - Service might be running out of memory
3. **Database Connection** - Check DATABASE_URL is set correctly

## Next Steps

1. **Wait for All Services to Deploy** - Can take 2-5 minutes
2. **Check Railway Dashboard** - All should show as healthy
3. **Test External Endpoints** - Should start working once healthy
4. **Monitor Logs** - Redis will eventually connect

Remember: Redis connection errors are expected and don't prevent services from running!