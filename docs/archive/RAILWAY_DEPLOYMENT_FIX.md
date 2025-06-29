# Railway Deployment Fix Guide

## Problem
Your services are returning 502 errors because they're not building/starting correctly.

## Solution

### 1. Push Configuration Files to GitHub

I've created `railway.json` files for each service that tell Railway how to build and start them. You need to:

```bash
cd /Users/saifraza/Library/Mobile\ Documents/com~apple~CloudDocs/Documents/Ethanol\ /Final\ documents\ /300/code/ERP_MSPIL/modern-erp

# Add and commit the new files
git add services/*/railway.json
git add services/*/package.json
git commit -m "Add Railway configuration for all services"
git push
```

### 2. Update Environment Variables in Railway

For each service, go to Variables tab and ensure these are set:

#### Core API
```
DATABASE_URL=${{Postgres-O1Ol.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
PORT=3000
NODE_ENV=production
```

#### API Gateway
```
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
CORE_API_URL=http://core-api.railway.internal:3000
MCP_ORCHESTRATOR_URL=http://mcp-orchestrator.railway.internal:3001
EVENT_PROCESSOR_URL=http://event-processor.railway.internal:3003
PORT=3000
NODE_ENV=production
```

#### MCP Orchestrator
```
DATABASE_URL=${{Postgres-O1Ol.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
CORE_API_URL=http://core-api.railway.internal:3000
PORT=3001
NODE_ENV=production
```

#### Event Processor
```
DATABASE_URL=${{Postgres-O1Ol.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
CORE_API_URL=http://core-api.railway.internal:3000
MCP_ORCHESTRATOR_URL=http://mcp-orchestrator.railway.internal:3001
PORT=3003
NODE_ENV=production
```

### 3. Force Redeploy Each Service

After pushing to GitHub and updating variables:

1. Go to each service in Railway
2. Click "Settings" tab
3. Scroll to "Deploy" section
4. Click "Redeploy"

### 4. Monitor Deployment

For each service:
1. Go to "Deployments" tab
2. Click on the active deployment
3. Watch the build logs
4. Look for:
   - "Build completed"
   - "Server running on port..."
   - Any error messages

### 5. Common Issues and Fixes

#### If build fails with "module not found":
- Check that all dependencies are in package.json
- Make sure NODE_ENV is set to "production"

#### If "Cannot find module 'dist/index.js'":
- The build step failed
- Check build logs for TypeScript errors

#### If "ECONNREFUSED" for Redis/Database:
- Environment variables are wrong
- Use exactly: `${{Redis.REDIS_URL}}` and `${{Postgres-O1Ol.DATABASE_URL}}`

### 6. Verify Services Are Running

After successful deployment, test each service:

```bash
# Core API
curl https://core-api-production-76b9.up.railway.app/health

# Should return:
# {
#   "status": "healthy",
#   "service": "core-api",
#   "database": "connected",
#   "cache": "connected"
# }
```

### 7. If Still Having Issues

Check the deployment logs in Railway:
1. Click on the service
2. Go to "Deployments" tab
3. Click on the latest deployment
4. Look for error messages in:
   - Build logs (during npm install/build)
   - Deploy logs (when starting the service)

Common log messages to look for:
- "Error: Cannot find module" → Missing dependency
- "ECONNREFUSED" → Can't connect to database/Redis
- "Missing required environment variable" → Check variables tab
- "Port already in use" → Change PORT variable

## Next Steps

Once all services show healthy:
1. Test the full application flow
2. Set up monitoring/alerts
3. Configure custom domains if needed