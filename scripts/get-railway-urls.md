# Getting Your Railway Service URLs

## Step 1: Open Railway Dashboard
Go to https://railway.app and open your project

## Step 2: For Each Service, Get the Public URL

### Core API Service:
1. Click on "core-api" service
2. Go to "Settings" tab
3. Under "Domains", click "Generate Domain" if none exists
4. Copy the URL (e.g., `https://core-api-production-abcd.up.railway.app`)

### API Gateway Service:
1. Click on "api-gateway" service
2. Go to "Settings" tab
3. Under "Domains", click "Generate Domain" if none exists
4. Copy the URL

### MCP Orchestrator Service:
1. Click on "mcp-orchestrator" service
2. Go to "Settings" tab
3. Under "Domains", click "Generate Domain" if none exists
4. Copy the URL

### Event Processor Service:
1. Click on "event-processor" service
2. Go to "Settings" tab
3. Under "Domains", click "Generate Domain" if none exists
4. Copy the URL

### Web Frontend Service:
1. Click on "web" service
2. The URL should already exist (you mentioned it's `https://web-production-66cf.up.railway.app`)

## Step 3: Update the Health Check Script

Once you have all the URLs, update the script at lines 17-21:

```bash
# Replace these with your actual URLs
WEB_URL="https://web-production-66cf.up.railway.app"
CORE_API_URL="https://your-actual-core-api-url.railway.app"
API_GATEWAY_URL="https://your-actual-api-gateway-url.railway.app"
MCP_ORCHESTRATOR_URL="https://your-actual-mcp-orchestrator-url.railway.app"
EVENT_PROCESSOR_URL="https://your-actual-event-processor-url.railway.app"
```

## Alternative: Use Railway CLI

If you have Railway CLI installed:

```bash
# Login to Railway
railway login

# Link to your project
railway link

# List all services
railway status

# Get service details
railway service
```

## Important Notes:

1. **Services need public domains** - If a service doesn't have a domain, it won't be accessible from outside Railway
2. **Internal URLs** - Services communicate internally using `service-name.railway.internal` URLs
3. **Health endpoints** - Make sure each service has a `/health` endpoint implemented

## Quick Test After Getting URLs:

Test each service individually:

```bash
# Test core-api
curl https://your-core-api-url.railway.app/health

# Test api-gateway  
curl https://your-api-gateway-url.railway.app/health

# Test mcp-orchestrator
curl https://your-mcp-orchestrator-url.railway.app/health

# Test event-processor
curl https://your-event-processor-url.railway.app/health
```