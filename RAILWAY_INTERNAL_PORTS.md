# Railway Internal Service Communication

## Important: Two Different PORT Concepts

### 1. Railway's Dynamic PORT (for external access)
- Assigned by Railway (e.g., 8080, 5432, etc.)
- Changes with each deployment
- Used by Railway's proxy to reach your service
- Read from `process.env.PORT`

### 2. Internal Communication Ports
- Fixed ports you choose
- Used for service-to-service communication
- Part of the internal URL (e.g., service.railway.internal:3000)

## The Problem

Your services have conflicting default ports:
- core-api: defaults to 3001
- mcp-orchestrator: defaults to 3001

This creates confusion for internal communication.

## The Solution

Since Railway assigns the external PORT dynamically, we should use the internal URLs without specifying ports, OR use Railway's PORT forwarding.

### Option 1: Use Railway's Internal Port Forwarding (Recommended)

In Railway, all services listen on their assigned PORT (8080), and you access them internally like this:

```
# For API Gateway environment variables:
CORE_API_URL=http://core-api.railway.internal
MCP_ORCHESTRATOR_URL=http://mcp-orchestrator.railway.internal  
EVENT_PROCESSOR_URL=http://event-processor.railway.internal
```

No port needed! Railway handles it.

### Option 2: Use Fixed Internal Ports (More Complex)

You would need to:
1. Set up port mapping in Railway
2. Configure each service to listen on multiple ports
3. Not recommended for your setup

## What You Should Do

Update your API Gateway environment variables in Railway to:

```
CORE_API_URL=http://core-api.railway.internal
MCP_ORCHESTRATOR_URL=http://mcp-orchestrator.railway.internal
EVENT_PROCESSOR_URL=http://event-processor.railway.internal
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
NODE_ENV=production
```

## Why This Works

Railway's internal networking automatically routes:
- `http://core-api.railway.internal` → core-api service on its assigned PORT
- No need to specify ports in internal URLs
- Railway handles the port mapping

## Testing

After updating the environment variables, your API Gateway should be able to reach other services internally.