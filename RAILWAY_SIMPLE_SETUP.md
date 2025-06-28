# Railway Simple Setup - Service Root Directories

## ✅ Simple Approach: Each Service is Independent

Instead of complex monorepo builds, set each service's root directory in Railway:

### 1. Core API Service
- **Root Directory**: `/services/core-api`
- **Build Command**: (leave empty - Railway auto-detects)
- **Start Command**: (leave empty - uses package.json start script)

### 2. MCP Orchestrator Service  
- **Root Directory**: `/services/mcp-orchestrator`
- **Build Command**: (leave empty)
- **Start Command**: (leave empty)

### 3. API Gateway Service
- **Root Directory**: `/services/api-gateway`
- **Build Command**: (leave empty)
- **Start Command**: (leave empty)

### 4. Web Frontend
- **Root Directory**: `/apps/web`
- **Build Command**: (leave empty)
- **Start Command**: (leave empty)

## How to Set This Up in Railway:

1. Go to each service in Railway
2. Click **Settings**
3. Find **Root Directory**
4. Set it to the paths above
5. Clear any **Build Command** (let Railway auto-detect)
6. Clear any **Start Command** (let Railway use package.json)
7. Save changes

## Benefits:
- ✅ No complex monorepo commands
- ✅ Railway auto-detects package manager
- ✅ Each service builds independently
- ✅ Simpler and faster builds
- ✅ No pnpm workspace issues

## What Railway Will Do:
1. Navigate to service directory
2. Detect package.json
3. Run `npm install` (or yarn/pnpm if lockfile exists)
4. Run `npm run build` (if build script exists)
5. Run `npm start` to start the service

This is MUCH simpler than trying to build the entire monorepo!