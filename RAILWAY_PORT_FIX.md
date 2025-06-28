# Railway Port Binding Fix

## Issue
Services were returning 502 errors because they were binding to `localhost` instead of `0.0.0.0`. Railway requires services to bind to all interfaces (`0.0.0.0`) to properly route traffic.

## Changes Made

### 1. Core API (`services/core-api/src/index.ts`)
```typescript
serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0', // Added this line
}, (info) => {
  log.info(`Core API running on http://0.0.0.0:${info.port}`);
});
```

### 2. API Gateway (`services/api-gateway/src/index.ts`)
```typescript
httpServer.listen(port, '0.0.0.0', () => { // Added '0.0.0.0'
  log.info(`API Gateway running on http://0.0.0.0:${port}`);
});
```

### 3. MCP Orchestrator (`services/mcp-orchestrator/src/index.ts`)
```typescript
httpServer.listen(PORT, '0.0.0.0', () => { // Added '0.0.0.0'
  log.info(`MCP Orchestrator running on http://0.0.0.0:${PORT}`);
  log.info(`WebSocket server running on ws://0.0.0.0:${PORT}`);
```

### 4. Event Processor (`services/event-processor/src/index.ts`)
```typescript
serve({
  fetch: app.fetch,
  port: Number(PORT),
  hostname: '0.0.0.0', // Added this line
}, () => {
  log.info(`Event Processor running on http://0.0.0.0:${PORT}`);
```

## Key Points

1. **Railway assigns dynamic ports** - Services must use `process.env.PORT`
2. **Services must bind to `0.0.0.0`** - Not `localhost` or `127.0.0.1`
3. **Environment variables are crucial** - Ensure PORT is not hardcoded

## Deployment Steps

1. **Commit and push these changes:**
```bash
cd /path/to/modern-erp
git add -A
git commit -m "Fix Railway port binding - bind to 0.0.0.0"
git push
```

2. **Railway will automatically redeploy** when it detects the push

3. **Verify services are healthy:**
```bash
curl https://core-api-production-76b9.up.railway.app/health
curl https://api-gateway-production-00e9.up.railway.app/health
curl https://mcp-orchestrator-production.up.railway.app/health
curl https://event-processor-production.up.railway.app/health
```

## Expected Response
```json
{
  "status": "healthy",
  "service": "service-name",
  "database": "connected",
  "cache": "connected",
  "timestamp": "2025-01-28T..."
}
```