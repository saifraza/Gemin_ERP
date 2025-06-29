# 🚀 Railway + GitHub Setup for Modern ERP

## Step 1: Deploy from GitHub (Recommended)

1. **Go to Railway**: https://railway.app/new

2. **Click "Deploy from GitHub repo"**

3. **Select your repository**: 
   - Look for `saifraza/NEW_ERP`
   - Click on it

4. **Configure the deployment**:
   - Railway will detect it's a monorepo
   - It will ask which service to deploy
   - **Important**: We'll deploy each service separately

## Step 2: Deploy Services One by One

### First: Add Databases

1. After creating project from GitHub
2. Click **"New"** → **"Database"** → **"PostgreSQL"**
3. Click **"New"** → **"Database"** → **"Redis"**

### Second: Deploy Core API

1. Click **"New"** → **"GitHub Repo"**
2. Select `saifraza/NEW_ERP` again
3. **Service Settings**:
   - **Root Directory**: `/services/core-api`
   - **Service Name**: `core-api`
   
4. **Environment Variables** (Add these):
```env
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=your-generated-secret-here
NODE_ENV=production
```

### Third: Deploy MCP Orchestrator

1. Click **"New"** → **"GitHub Repo"**
2. Select `saifraza/NEW_ERP` again
3. **Service Settings**:
   - **Root Directory**: `/services/mcp-orchestrator`
   - **Service Name**: `mcp-orchestrator`

4. **Environment Variables**:
```env
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=${{core-api.JWT_SECRET}}
GEMINI_API_KEY=your-gemini-api-key
NODE_ENV=production
```

### Fourth: Deploy API Gateway

1. Click **"New"** → **"GitHub Repo"**
2. Select `saifraza/NEW_ERP` again
3. **Service Settings**:
   - **Root Directory**: `/services/api-gateway`
   - **Service Name**: `api-gateway`
   - **Generate Domain**: Yes (check this box)

4. **Environment Variables**:
```env
PORT=8080
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=${{core-api.JWT_SECRET}}
CORE_API_URL=http://core-api.railway.internal:3001
MCP_URL=http://mcp-orchestrator.railway.internal:3000
NODE_ENV=production
```

### Fifth: Deploy Web Frontend

1. Click **"New"** → **"GitHub Repo"**
2. Select `saifraza/NEW_ERP` again
3. **Service Settings**:
   - **Root Directory**: `/apps/web`
   - **Service Name**: `web`
   - **Generate Domain**: Yes (check this box)

4. **Environment Variables**:
```env
NEXT_PUBLIC_API_URL=https://api-gateway-production-xxxx.up.railway.app
NEXT_PUBLIC_WS_URL=wss://api-gateway-production-xxxx.up.railway.app
```
(Replace xxxx with your actual API Gateway domain)

## Step 3: Set Build Commands

For each service, go to Settings → Build Command:

**Core API**:
```bash
cd ../.. && npm install && npm run build --workspace=@modern-erp/core-api
```

**MCP Orchestrator**:
```bash
cd ../.. && npm install && npm run build --workspace=@modern-erp/mcp-orchestrator
```

**API Gateway**:
```bash
cd ../.. && npm install && npm run build --workspace=@modern-erp/api-gateway
```

**Web**:
```bash
cd ../.. && npm install && npm run build --workspace=@modern-erp/web
```

## Step 4: Run Database Migrations

After Core API is deployed:

1. Go to Core API service
2. Click on "Settings" tab
3. Under "Deploy" section, find "Railway CLI"
4. Run:
```bash
railway run --service core-api npm run db:migrate:prod
```

## Alternative: Use Railway CLI with GitHub

If you prefer CLI:

```bash
# Link to your project
cd /path/to/modern-erp
railway link

# Deploy each service
railway up --service core-api -d services/core-api
railway up --service mcp-orchestrator -d services/mcp-orchestrator
railway up --service api-gateway -d services/api-gateway
railway up --service web -d apps/web
```

## 🎯 Quick Checklist

- [ ] Created project from GitHub repo
- [ ] Added PostgreSQL database
- [ ] Added Redis database
- [ ] Deployed core-api with env vars
- [ ] Deployed mcp-orchestrator with env vars
- [ ] Deployed api-gateway with public domain
- [ ] Deployed web with public domain
- [ ] Updated web's API URL to point to api-gateway
- [ ] Ran database migrations
- [ ] Created admin user

## 🚨 Common Issues

### Build Failing?
- Check if `package-lock.json` exists (delete it, we use pnpm)
- Make sure all dependencies are listed in package.json
- Check build logs for specific errors

### Services Can't Connect?
- Use `.railway.internal` domains for internal communication
- Make sure all services are in the same project
- Check environment variables are referencing correctly

### Monorepo Issues?
- Make sure root directory is set correctly for each service
- Build commands should cd to root first
- Check that workspaces are defined in root package.json

Need help? The build logs will show exactly what's failing!