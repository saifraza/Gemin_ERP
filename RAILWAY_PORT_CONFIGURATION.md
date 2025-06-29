# Railway Port Configuration - IMPORTANT

## Key Points About Railway Ports

### 1. **Railway Sets PORT=8080 for ALL Services**
Railway automatically sets the `PORT` environment variable to `8080` for every service. This is what we see in the logs:

```
Core API running on http://[::]:8080
MCP Orchestrator running on http://[::]:8080 (IPv6)
Express API Gateway listening on port 8080 (IPv6)
Event Processor running on http://[::]:8080 (IPv6)
```

### 2. **Internal Communication Uses Port 8080**
When services communicate internally, they must use port 8080:

```javascript
// CORRECT - What Railway expects
http://core-api:8080
http://mcp-orchestrator:8080
http://event-processor:8080

// WRONG - Don't use these ports internally
http://core-api:3001  // ❌
http://mcp-orchestrator:3000  // ❌
```

### 3. **Local Development Uses Different Ports**
For local development, we use different ports to avoid conflicts:

```javascript
// Local development ports
const port = parseInt(process.env.PORT || '3001'); // Core API
const port = parseInt(process.env.PORT || '3000'); // MCP Orchestrator
const port = parseInt(process.env.PORT || '4000'); // API Gateway
```

### 4. **How Our Code Handles This**

```javascript
// Smart port configuration
const services = {
  core: process.env.CORE_API_URL || (
    process.env.RAILWAY_ENVIRONMENT 
      ? 'http://core-api.railway.internal:8080'  // Railway
      : 'http://localhost:3001'                  // Local
  ),
  // ... similar for other services
};
```

### 5. **Railway Environment Variables**
Railway provides these environment variables:

```bash
# Set by Railway automatically
PORT=8080
RAILWAY_ENVIRONMENT=production

# Set by us in Railway dashboard
CORE_API_URL=http://core-api:8080
MCP_ORCHESTRATOR_URL=http://mcp-orchestrator:8080
EVENT_PROCESSOR_URL=http://event-processor:8080
```

## Summary

- **All Railway services listen on port 8080**
- **Internal URLs must use port 8080**
- **Don't hardcode ports - use PORT env var**
- **Railway handles port mapping to public URLs**
- **Local development can use any ports**

This is why we see all services reporting port 8080 in production logs!