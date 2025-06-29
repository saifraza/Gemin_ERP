# Correct Environment Variables for Railway Services

Based on your Redis configuration, here are the exact environment variables each service needs:

## Core API Service
```
DATABASE_URL=${{Postgres-O1Ol.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://web-production-66cf.up.railway.app
```

## API Gateway Service
```
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
CORE_API_URL=http://core-api.railway.internal:3000
MCP_ORCHESTRATOR_URL=http://mcp-orchestrator.railway.internal:3001
EVENT_PROCESSOR_URL=http://event-processor.railway.internal:3003
REDIS_URL=${{Redis.REDIS_URL}}
PORT=3000
NODE_ENV=production
```

## MCP Orchestrator Service
```
DATABASE_URL=${{Postgres-O1Ol.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
CORE_API_URL=http://core-api.railway.internal:3000
PORT=3001
NODE_ENV=production
```

## Event Processor Service
```
DATABASE_URL=${{Postgres-O1Ol.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
CORE_API_URL=http://core-api.railway.internal:3000
MCP_ORCHESTRATOR_URL=http://mcp-orchestrator.railway.internal:3001
PORT=3003
NODE_ENV=production
```

## Web Frontend Service
```
VITE_API_URL=https://api-gateway-production-00e9.up.railway.app
VITE_CORE_API_URL=https://core-api-production-76b9.up.railway.app
NODE_ENV=production
```

## Important Notes:

1. **REDIS_URL Format**: The `${{Redis.REDIS_URL}}` will automatically resolve to:
   ```
   redis://default:AUajrBfdAnIfJmLbSbVrtUVyvbHdwlDP@[redis-internal-domain]:6379
   ```

2. **Don't hardcode the Redis password** - Always use `${{Redis.REDIS_URL}}` reference

3. **Internal communication** - Services communicate internally using:
   - `service-name.railway.internal:PORT`
   - This only works between services in the same Railway project

4. **After updating variables**:
   - Click "Deploy" or "Redeploy" for each service
   - Wait for deployment to complete
   - Check logs for successful connections

## Verification Steps:

1. For each service, go to Variables tab
2. Add/update the variables above
3. Click "Deploy" to apply changes
4. Check Logs tab for:
   - "Redis connected"
   - "Database connected successfully"
   - "Server running on port X"

## Test After Deployment:

```bash
# Should return healthy status with database and cache connected
curl https://core-api-production-76b9.up.railway.app/health
```