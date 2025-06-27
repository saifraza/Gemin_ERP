# Modern ERP - Railway Deployment Guide

## 🚀 Overview

This guide walks you through deploying the Modern ERP system on Railway with a production-grade microservices architecture.

## 📋 Prerequisites

1. Railway account with Pro plan (for multiple services)
2. GitHub repository connected
3. Environment variables ready

## 🏗️ Architecture on Railway

```
┌─────────────────────────────────────────────────────┐
│                   Railway Project                    │
├──────────────┬──────────────┬──────────────┬───────┤
│ API Gateway  │ MCP Server   │  Core API    │  Web  │
│   (Public)   │  (Internal)  │ (Internal)   │(Public)│
├──────────────┴──────────────┴──────────────┴───────┤
│ PostgreSQL │ Redis │ Kafka │ TimescaleDB │ Storage │
└──────────────────────────────────────────────────────┘
```

## 📦 Services to Deploy

### 1. **Databases & Infrastructure** (Deploy First)

#### PostgreSQL
- Add from Railway template
- Note the `DATABASE_URL`

#### Redis
- Add from Railway template
- Note the `REDIS_URL`

#### Kafka (Optional for Phase 1)
- Use Upstash Kafka or Railway template
- Note the `KAFKA_BROKERS`

### 2. **Core Services** (Deploy Second)

#### MCP Orchestrator
```bash
railway new --service mcp-orchestrator
cd services/mcp-orchestrator
railway link
railway up
```

Environment Variables:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=${{POSTGRESQL.DATABASE_URL}}
REDIS_URL=${{REDIS.REDIS_URL}}
GEMINI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
OPENAI_API_KEY=your-key
JWT_SECRET=generate-secure-secret
```

#### Core API
```bash
railway new --service core-api
cd services/core-api
railway link
railway up
```

Environment Variables:
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=${{POSTGRESQL.DATABASE_URL}}
REDIS_URL=${{REDIS.REDIS_URL}}
JWT_SECRET=${{shared.JWT_SECRET}}
```

### 3. **API Gateway** (Deploy Third)

```bash
railway new --service api-gateway
cd services/api-gateway
railway link
railway up
```

Environment Variables:
```env
NODE_ENV=production
PORT=8080
REDIS_URL=${{REDIS.REDIS_URL}}
JWT_SECRET=${{shared.JWT_SECRET}}
CORE_API_URL=${{CORE_API.RAILWAY_PRIVATE_URL}}
MCP_URL=${{MCP_ORCHESTRATOR.RAILWAY_PRIVATE_URL}}
ALLOWED_ORIGINS=https://your-frontend.up.railway.app
```

### 4. **Frontend** (Deploy Last)

```bash
railway new --service web
cd apps/web
railway link
railway up
```

Environment Variables:
```env
NEXT_PUBLIC_API_URL=https://api-gateway-production.up.railway.app
NEXT_PUBLIC_WS_URL=wss://api-gateway-production.up.railway.app
```

## 🔧 Step-by-Step Deployment

### Step 1: Create Railway Project
```bash
railway login
railway init modern-erp
```

### Step 2: Add Databases
1. Go to Railway dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Click "New" → "Database" → "Redis"
4. Note the connection strings

### Step 3: Deploy Services
```bash
# From project root
railway up
```

This will detect all services and deploy them based on railway.toml files.

### Step 4: Configure Internal Networking
Railway automatically sets up internal networking. Services can communicate using:
- `http://service-name.railway.internal:port`

### Step 5: Run Database Migrations
```bash
railway run --service core-api pnpm db:migrate:prod
```

### Step 6: Create Initial Admin User
```bash
railway run --service core-api pnpm db:seed
```

## 🔐 Security Checklist

- [ ] Generate strong JWT_SECRET
- [ ] Set proper CORS origins
- [ ] Enable rate limiting
- [ ] Use Railway's private networking
- [ ] Set up SSL (automatic with Railway)
- [ ] Configure firewall rules
- [ ] Enable audit logging

## 📊 Monitoring

### Health Checks
- API Gateway: `https://your-gateway.up.railway.app/health`
- Each service has `/health` endpoint

### Logs
```bash
railway logs --service api-gateway
railway logs --service mcp-orchestrator
railway logs --service core-api
```

### Metrics
- Use Railway's built-in metrics
- Optional: Add Grafana service

## 🚨 Troubleshooting

### Service Won't Start
1. Check logs: `railway logs --service service-name`
2. Verify environment variables
3. Check build logs in Railway dashboard

### Database Connection Issues
1. Ensure DATABASE_URL is set correctly
2. Check if migrations ran successfully
3. Verify network connectivity

### MCP Not Working
1. Verify AI API keys are set
2. Check Redis connection
3. Look for errors in MCP logs

## 🔄 Updates & Rollbacks

### Deploy Updates
```bash
git push origin main
# Railway auto-deploys on push
```

### Rollback
1. Go to Railway dashboard
2. Select service
3. Click "Deployments"
4. Select previous deployment
5. Click "Redeploy"

## 📈 Scaling

### Horizontal Scaling
1. Go to service settings
2. Increase "Replicas" count
3. Railway handles load balancing

### Vertical Scaling
1. Go to service settings
2. Adjust CPU/Memory limits
3. Service auto-restarts

## 💰 Cost Optimization

1. **Development**: Use sleep schedules for non-production
2. **Caching**: Maximize Redis usage
3. **Database**: Use connection pooling
4. **Monitoring**: Set up alerts for resource usage

## 🎯 Production Checklist

- [ ] All services deployed and healthy
- [ ] Database migrations completed
- [ ] Admin user created
- [ ] Environment variables secured
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] SSL verified
- [ ] Rate limiting enabled
- [ ] Error tracking setup
- [ ] Documentation updated

## 🆘 Support

- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app
- GitHub Issues: https://github.com/saifraza/NEW_ERP/issues

---

Your Modern ERP is now ready for production! 🚀