# Complete Railway Environment Variable Setup

Copy and paste these EXACTLY as shown for each service in Railway:

## 🔴 IMPORTANT: Use these exact values with the dollar signs and double curly braces!

---

## 1. Core API Service

Go to core-api → Variables tab → Add these:

```
DATABASE_URL=${{Postgres-O1Ol.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://web-production-66cf.up.railway.app,https://api-gateway-production-00e9.up.railway.app
```

---

## 2. API Gateway Service

Go to api-gateway → Variables tab → Add these:

```
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
CORE_API_URL=http://core-api.railway.internal:3000
MCP_ORCHESTRATOR_URL=http://mcp-orchestrator.railway.internal:3001
EVENT_PROCESSOR_URL=http://event-processor.railway.internal:3003
REDIS_URL=${{Redis.REDIS_URL}}
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://web-production-66cf.up.railway.app
```

---

## 3. MCP Orchestrator Service

Go to mcp-orchestrator → Variables tab → Add these:

```
DATABASE_URL=${{Postgres-O1Ol.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
CORE_API_URL=http://core-api.railway.internal:3000
PORT=3001
NODE_ENV=production
```

---

## 4. Event Processor Service

Go to event-processor → Variables tab → Add these:

```
DATABASE_URL=${{Postgres-O1Ol.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
CORE_API_URL=http://core-api.railway.internal:3000
MCP_ORCHESTRATOR_URL=http://mcp-orchestrator.railway.internal:3001
PORT=3003
NODE_ENV=production
```

---

## 5. Web Frontend Service (if using Vite)

Go to web → Variables tab → Add these:

```
VITE_API_URL=https://api-gateway-production-00e9.up.railway.app
VITE_CORE_API_URL=https://core-api-production-76b9.up.railway.app
NODE_ENV=production
```

---

## 📋 Step-by-Step Instructions:

1. **Open Railway Dashboard**
2. **For EACH service above:**
   - Click on the service
   - Go to "Variables" tab
   - Click "RAW Editor" button
   - Copy the entire block of variables for that service
   - Paste it in
   - Click "Update Variables"
   - The service will automatically redeploy

3. **Wait for all services to redeploy** (usually takes 1-2 minutes each)

4. **Check deployment status:**
   - Each service should show a green checkmark
   - Click on "Logs" tab to see if there are any errors

---

## ✅ Verification Commands:

After all services have redeployed, run these commands:

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

You should see responses like:
```json
{
  "status": "healthy",
  "service": "core-api",
  "database": "connected",
  "cache": "connected",
  "timestamp": "2025-01-28T..."
}
```

---

## 🚨 Common Mistakes to Avoid:

1. **DON'T remove the `${{}}` syntax** - Railway needs this to reference other services
2. **DON'T change the service names** in the internal URLs (e.g., `core-api.railway.internal`)
3. **Make sure JWT_SECRET is EXACTLY the same** in all services
4. **Use the RAW editor** in Railway to avoid formatting issues

---

## 📝 If Services Still Fail:

1. Check the Logs tab for each service
2. Look for errors like:
   - "ECONNREFUSED" → Service URL is wrong
   - "Authentication failed" → JWT_SECRET mismatch
   - "getaddrinfo ENOTFOUND" → Internal domain name is wrong

3. Make sure Redis and PostgreSQL services show as "Active" in Railway