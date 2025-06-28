# ERP System Testing Guide

## 🏗️ Architecture Overview

Your ERP system consists of the following services on Railway:

1. **Core API** - Main business logic and database operations
2. **API Gateway** - Request routing and authentication
3. **MCP Orchestrator** - AI/ML operations and tool orchestration
4. **Event Processor** - Async event handling
5. **Web Frontend** - User interface
6. **PostgreSQL** - Primary database
7. **Redis** - Caching and pub/sub

## 🔧 Required Environment Variables

Each service needs these environment variables in Railway:

### Core API
```
DATABASE_URL="${{Postgres-O1Ol.DATABASE_URL}}"
REDIS_URL="${{Redis.REDIS_URL}}"
JWT_SECRET="your-generated-jwt-secret"
PORT=3000
```

### API Gateway
```
JWT_SECRET="your-generated-jwt-secret" # Same as Core API
CORE_API_URL="http://core-api.railway.internal:3000"
MCP_ORCHESTRATOR_URL="http://mcp-orchestrator.railway.internal:3001"
EVENT_PROCESSOR_URL="http://event-processor.railway.internal:3003"
REDIS_URL="${{Redis.REDIS_URL}}"
PORT=3000
```

### MCP Orchestrator
```
DATABASE_URL="${{Postgres-O1Ol.DATABASE_URL}}"
REDIS_URL="${{Redis.REDIS_URL}}"
JWT_SECRET="your-generated-jwt-secret" # Same as Core API
CORE_API_URL="http://core-api.railway.internal:3000"
PORT=3001
```

### Event Processor
```
DATABASE_URL="${{Postgres-O1Ol.DATABASE_URL}}"
REDIS_URL="${{Redis.REDIS_URL}}"
JWT_SECRET="your-generated-jwt-secret" # Same as Core API
CORE_API_URL="http://core-api.railway.internal:3000"
MCP_ORCHESTRATOR_URL="http://mcp-orchestrator.railway.internal:3001"
PORT=3003
```

## 🧪 Testing Steps

### 1. Quick Health Check

Run this command to check all services (update URLs first):

```bash
# From your local machine
cd modern-erp/scripts
./railway-health-check.sh
```

### 2. Manual Service Tests

#### Test Core API
```bash
# Health check
curl https://your-core-api.railway.app/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "core-api",
#   "database": "connected",
#   "cache": "connected",
#   "timestamp": "2025-01-28T..."
# }
```

#### Test API Gateway
```bash
# Health check
curl https://your-api-gateway.railway.app/health

# Test routing to core-api
curl https://your-api-gateway.railway.app/api/core/health
```

#### Test MCP Orchestrator
```bash
# Health check
curl https://your-mcp-orchestrator.railway.app/health

# Test MCP tools endpoint
curl https://your-mcp-orchestrator.railway.app/api/mcp/tools
```

### 3. Integration Tests

#### Test Authentication Flow
```bash
# 1. Register a new user
curl -X POST https://your-core-api.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User"
  }'

# 2. Login
curl -X POST https://your-core-api.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'

# Save the returned token for authenticated requests
```

#### Test Inter-Service Communication
```bash
# Through API Gateway to Core API
curl https://your-api-gateway.railway.app/api/companies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Through API Gateway to MCP
curl https://your-api-gateway.railway.app/api/mcp/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, AI assistant"
  }'
```

### 4. Database Connectivity Test

Check Railway logs for each service:
```bash
# In Railway dashboard, check logs for:
# - "Database connected successfully"
# - "Redis connected"
# - No connection timeout errors
```

## 🔍 Debugging Common Issues

### Issue: Services can't connect to each other

1. Check environment variables are set correctly
2. Use internal URLs (*.railway.internal) for service-to-service communication
3. Ensure services are in the same Railway project

### Issue: Database connection fails

1. Check DATABASE_URL is using Railway's reference syntax: `${{Postgres-O1Ol.DATABASE_URL}}`
2. Ensure migrations have run (check deploy logs)
3. Verify PostgreSQL service is running

### Issue: JWT authentication fails

1. Ensure JWT_SECRET is identical across all services
2. Check token format in Authorization header: `Bearer <token>`
3. Verify token hasn't expired

### Issue: Redis connection fails

1. Check REDIS_URL is using Railway's reference syntax: `${{Redis.REDIS_URL}}`
2. Ensure Redis service is running
3. Check for connection string format issues

## 📊 Monitoring

### Railway Dashboard
- Monitor service logs in real-time
- Check deployment status
- View resource usage

### Health Endpoints
Each service exposes `/health` endpoint for monitoring:
- core-api: Database & Redis status
- api-gateway: Service routing status
- mcp-orchestrator: AI service status
- event-processor: Queue processing status

## 🚀 Next Steps

1. Set up monitoring alerts in Railway
2. Configure custom domains
3. Enable auto-scaling if needed
4. Set up backup strategies for PostgreSQL
5. Configure rate limiting in API Gateway

## 📝 Test Checklist

- [ ] All services show "healthy" status
- [ ] Database connections work
- [ ] Redis connections work
- [ ] JWT authentication works
- [ ] Inter-service communication works
- [ ] Frontend can connect to backend
- [ ] MCP AI features respond
- [ ] Event processing works
- [ ] No errors in Railway logs