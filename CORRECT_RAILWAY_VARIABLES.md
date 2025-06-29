# Correct Railway Environment Variables Setup

## ⚠️ IMPORTANT: Use Railway's Variable References!

When setting environment variables in Railway, you must use the **reference picker** (the `${}` button) to select variables from other services. Do NOT copy-paste the literal values.

## For Each Service:

### 1. Core API Service

Go to core-api → Variables → RAW Editor and add:

```
DATABASE_URL=${{Postgres-O1Ol.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
NODE_ENV=production
ALLOWED_ORIGINS=https://web-production-66cf.up.railway.app,https://api-gateway-production-00e9.up.railway.app
```

**Important**: 
- For `DATABASE_URL`, click the `${}` button and select `Postgres-O1Ol` → `DATABASE_URL`
- For `REDIS_URL`, click the `${}` button and select `Redis` → `REDIS_URL`

### 2. API Gateway Service

```
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
CORE_API_URL=http://core-api.railway.internal:3000
MCP_ORCHESTRATOR_URL=http://mcp-orchestrator.railway.internal:3001
EVENT_PROCESSOR_URL=http://event-processor.railway.internal:3003
REDIS_URL=${{Redis.REDIS_URL}}
NODE_ENV=production
ALLOWED_ORIGINS=https://web-production-66cf.up.railway.app
```

### 3. MCP Orchestrator Service

```
DATABASE_URL=${{Postgres-O1Ol.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
CORE_API_URL=http://core-api.railway.internal:3000
NODE_ENV=production
```

### 4. Event Processor Service

```
DATABASE_URL=${{Postgres-O1Ol.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
CORE_API_URL=http://core-api.railway.internal:3000
MCP_ORCHESTRATOR_URL=http://mcp-orchestrator.railway.internal:3001
NODE_ENV=production
```

## How to Set Variables Correctly:

### Method 1: Using the UI (Recommended)
1. Go to your service (e.g., core-api)
2. Click "Variables" tab
3. Click "New Variable"
4. For Redis URL:
   - Name: `REDIS_URL`
   - Value: Click the `${}` button
   - Select: Redis → REDIS_URL
   - It should show as `${{Redis.REDIS_URL}}`

### Method 2: Using RAW Editor
1. Go to Variables tab
2. Click "RAW Editor"
3. Paste the variables above
4. Make sure the references show as `${{ServiceName.VARIABLE}}`

## Common Mistakes to Avoid:

❌ **Wrong**: `REDIS_URL=redis://default:AUajrBfdAnIfJmLbSbVrtUVyvbHdwlDP@...`
✅ **Correct**: `REDIS_URL=${{Redis.REDIS_URL}}`

❌ **Wrong**: `DATABASE_URL=postgresql://postgres:RgnfOBTspYXhkAMkZmiQZiMoFALDBWEO@...`
✅ **Correct**: `DATABASE_URL=${{Postgres-O1Ol.DATABASE_URL}}`

## Verify Variables Are Set Correctly:

After setting variables, they should appear in the UI like:
- `REDIS_URL` → `${{Redis.REDIS_URL}}` (as a reference, not the actual value)
- `DATABASE_URL` → `${{Postgres-O1Ol.DATABASE_URL}}` (as a reference, not the actual value)

## After Setting Variables:

1. Each service will automatically redeploy
2. Check the Logs tab to ensure:
   - "Redis connected"
   - "Database connected successfully"
   - No connection errors

## Note About Ports:

Railway automatically assigns ports. Your services are already configured to use `process.env.PORT`. You should NOT set a PORT variable manually unless you have a specific reason.