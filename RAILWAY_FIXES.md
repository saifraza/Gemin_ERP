# Railway Deployment Fixes

## Current Issues

1. **Core API (503 Error)** - Redis connection failing
2. **Other services** - May have similar issues

## Fix Steps

### 1. Check Redis Service
- Go to Railway dashboard
- Click on "Redis" service
- Ensure it shows as "Active"
- If not active, redeploy it

### 2. Fix Environment Variables

For **core-api** service:
```
DATABASE_URL=${{Postgres-O1Ol.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
PORT=3000
NODE_ENV=production
```

For **api-gateway** service:
```
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
CORE_API_URL=http://core-api.railway.internal:3000
MCP_ORCHESTRATOR_URL=http://mcp-orchestrator.railway.internal:3001
EVENT_PROCESSOR_URL=http://event-processor.railway.internal:3003
REDIS_URL=${{Redis.REDIS_URL}}
PORT=3000
NODE_ENV=production
```

For **mcp-orchestrator** service:
```
DATABASE_URL=${{Postgres-O1Ol.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
CORE_API_URL=http://core-api.railway.internal:3000
PORT=3001
NODE_ENV=production
```

For **event-processor** service:
```
DATABASE_URL=${{Postgres-O1Ol.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
CORE_API_URL=http://core-api.railway.internal:3000
MCP_ORCHESTRATOR_URL=http://mcp-orchestrator.railway.internal:3001
PORT=3003
NODE_ENV=production
```

### 3. Verify Variable References

Make sure you're using Railway's variable reference syntax:
- ✅ Correct: `${{Redis.REDIS_URL}}`
- ❌ Wrong: `${Redis.REDIS_URL}` or just `Redis.REDIS_URL`

### 4. Redeploy Services

After updating environment variables:
1. Click on each service
2. Go to "Deployments" tab
3. Click "Redeploy" 

### 5. Check Logs

After redeployment, check logs for each service:
1. Click on the service
2. Go to "Logs" tab
3. Look for:
   - "Database connected successfully"
   - "Redis connected"
   - "Server running on port..."

## Quick Test Commands

Once services are redeployed:

```bash
# Test Core API
curl https://core-api-production-76b9.up.railway.app/health

# Test API Gateway
curl https://api-gateway-production-00e9.up.railway.app/health

# Test MCP Orchestrator
curl https://mcp-orchestrator-production.up.railway.app/health

# Test Event Processor
curl https://event-processor-production.up.railway.app/health
```

## Common Railway Issues

1. **Variable not found** - Check syntax is `${{ServiceName.VARIABLE}}`
2. **Connection refused** - Service might not be running on correct port
3. **Timeout errors** - Check internal URLs use `.railway.internal`
4. **Build failures** - Check nixpacks.toml or package.json scripts