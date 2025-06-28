# Troubleshooting AI Chat 500 Error

## Quick Fix

The 500 error is happening because the API Gateway can't reach the MCP Orchestrator service.

### In the API Gateway service on Railway, add these environment variables:

```bash
MCP_ORCHESTRATOR_URL="http://mcp-orchestrator.railway.internal"
```

Or if your MCP orchestrator has a different internal name (check Railway dashboard), use that:
```bash
MCP_ORCHESTRATOR_URL="http://energetic-vision.railway.internal"
```

## How to Find the Correct Internal URL

1. Go to Railway Dashboard
2. Click on your MCP Orchestrator service
3. Look for the internal hostname (usually shown as `servicename.railway.internal`)
4. Use that in the API Gateway's `MCP_ORCHESTRATOR_URL`

## Current Setup Issues

Based on your environment variables:
- ✅ All API keys are configured correctly
- ✅ Database URL is set
- ❌ API Gateway might not have the correct MCP_ORCHESTRATOR_URL
- ❌ The CORE_API_URL in MCP orchestrator is not needed (remove it)

## Debug Steps

1. **Check MCP Orchestrator Logs**
   - Go to Railway > MCP Orchestrator > Deployments
   - Look for startup logs showing API keys
   - Check for any migration errors

2. **Check API Gateway Logs**
   - Go to Railway > API Gateway > Deployments
   - Look for "Service forward failed" errors
   - Check which URL it's trying to reach

3. **Test Health Endpoints**
   - MCP Orchestrator: `https://[your-mcp-url]/health`
   - API Gateway: `https://[your-gateway-url]/health`

## Manual Test

You can test if the MCP orchestrator is working directly:

```bash
curl -X POST https://[your-mcp-orchestrator-url]/api/mcp/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello", "model": "gemini"}'
```

## Environment Variables Summary

### API Gateway needs:
```bash
DATABASE_URL="${{ Postgres.DATABASE_URL }}"
JWT_SECRET="f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f"
NODE_ENV="production"
MCP_ORCHESTRATOR_URL="http://[mcp-orchestrator-internal-name].railway.internal"
CORE_API_URL="http://[core-api-internal-name].railway.internal"
```

### MCP Orchestrator needs:
```bash
DATABASE_URL="${{Postgres-O1Ol.DATABASE_URL}}"
JWT_SECRET="f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f"
NODE_ENV="production"
ANTHROPIC_API_KEY="sk-ant-api03-..."
DEEPSEEK_API_KEY="sk-f956..."
GEMINI_API_KEY="AIzaSyB..."
OPENAI_API_KEY="sk-proj-..."
# Remove CORE_API_URL - not needed here
```