# Railway Setup for Modern ERP

## Current Railway Projects
Based on your account, you have these projects:
- MSPIL_ERP (likely your main project)
- cloud-api
- Other auto-generated names

## 🚀 Quick Setup Guide

### Option 1: Use Existing MSPIL_ERP Project

```bash
# Link to existing project
cd /path/to/modern-erp
railway link
# Select "MSPIL_ERP" from the list
```

### Option 2: Create New Project for Modern ERP

```bash
# Create fresh project
railway init modern-erp-2025
```

## 📦 Required Services Setup

### 1. Database Services (Add via Railway Dashboard)

```bash
# After linking to project
railway add

# Select:
# - PostgreSQL (Primary database)
# - Redis (Caching & sessions)
# - Upstash Kafka (Optional for events)
```

### 2. Deploy Each Service

#### Deploy API Gateway
```bash
cd services/api-gateway
railway up --service api-gateway
```

#### Deploy Core API
```bash
cd services/core-api
railway up --service core-api
```

#### Deploy MCP Orchestrator
```bash
cd services/mcp-orchestrator
railway up --service mcp-orchestrator
```

#### Deploy Web Frontend
```bash
cd apps/web
railway up --service web
```

## 🔧 Environment Variables

### For API Gateway
```env
NODE_ENV=production
PORT=8080
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=your-secret-here
ALLOWED_ORIGINS=https://web-production.up.railway.app
```

### For Core API
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=your-secret-here
```

### For MCP Orchestrator
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
GEMINI_API_KEY=your-gemini-key
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
```

### For Web Frontend
```env
NEXT_PUBLIC_API_URL=https://api-gateway-production.up.railway.app
NEXT_PUBLIC_WS_URL=wss://api-gateway-production.up.railway.app
```

## 🏗️ Service Architecture

```
Your Railway Project
├── PostgreSQL (Database)
├── Redis (Cache)
├── api-gateway (Public facing)
├── core-api (Internal)
├── mcp-orchestrator (Internal)
└── web (Public facing)
```

## 📝 Deployment Order

1. **PostgreSQL** - Add via Railway dashboard
2. **Redis** - Add via Railway dashboard
3. **core-api** - Deploy first (creates database schema)
4. **mcp-orchestrator** - Deploy second
5. **api-gateway** - Deploy third
6. **web** - Deploy last

## 🔍 Verify Deployment

```bash
# Check all services
railway status

# View logs for a service
railway logs --service api-gateway

# Open Railway dashboard
railway open
```

## 🚨 Common Issues

### Build Failing
- Check if `pnpm` is being used (Railway should auto-detect)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### Service Can't Connect
- Verify internal URLs use `.railway.internal`
- Check environment variables are set
- Ensure services are in same project

### Database Issues
- Run migrations: `railway run --service core-api pnpm db:migrate:prod`
- Check DATABASE_URL is correct
- Verify PostgreSQL addon is provisioned

## 🎯 Next Steps

1. Link project: `railway link` (choose MSPIL_ERP)
2. Add databases via dashboard
3. Deploy services one by one
4. Set environment variables
5. Run database migrations
6. Test each service health endpoint

## 📊 Monitor Services

- API Gateway: `https://[your-gateway].railway.app/health`
- Each service has `/health` endpoint
- Use Railway metrics dashboard
- Set up alerts for downtime

Ready to deploy! 🚀