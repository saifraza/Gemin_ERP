# 🚀 Modern ERP - Complete Railway Setup Guide

## Step 1: Create New Railway Project

```bash
# Navigate to your project
cd /Users/saifraza/Library/Mobile\ Documents/com~apple~CloudDocs/Documents/Ethanol\ /Final\ documents\ /300/code/ERP_MSPIL/modern-erp

# Create new Railway project
railway login  # If not already logged in
railway init modern-erp-2025

# Link the project
railway link
# Select "modern-erp-2025" from the list
```

## Step 2: Add Database Services (Via Dashboard)

1. **Open Railway Dashboard**
   ```bash
   railway open
   ```

2. **Add PostgreSQL**
   - Click "New" → "Database" → "PostgreSQL"
   - Wait for it to provision
   - Note: It will create a `DATABASE_URL` automatically

3. **Add Redis**
   - Click "New" → "Database" → "Redis"
   - Wait for it to provision
   - Note: It will create a `REDIS_URL` automatically

## Step 3: Set Up Shared Environment Variables

In Railway Dashboard:
1. Click on your project
2. Go to "Variables" tab
3. Add these shared variables:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
```

Generate a secure JWT_SECRET:
```bash
openssl rand -base64 32
```

## Step 4: Deploy Core API Service (First)

```bash
# From project root
cd services/core-api

# Deploy the service
railway up --service core-api

# It will create a new service in Railway
```

**Add Environment Variables for Core API:**
1. Go to Railway Dashboard
2. Click on "core-api" service
3. Go to "Variables" tab
4. Add:
```env
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=${{shared.JWT_SECRET}}
```

## Step 5: Run Database Migrations

```bash
# After core-api is deployed
railway run --service core-api npm run db:migrate:prod

# Or if using pnpm
railway run --service core-api pnpm --filter @modern-erp/database db:migrate:prod
```

## Step 6: Deploy MCP Orchestrator

```bash
cd ../mcp-orchestrator

# Deploy the service
railway up --service mcp-orchestrator
```

**Add Environment Variables for MCP:**
1. In Railway Dashboard → "mcp-orchestrator" service
2. Add these variables:
```env
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=${{shared.JWT_SECRET}}
GEMINI_API_KEY=your-gemini-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key  # Optional
OPENAI_API_KEY=your-openai-api-key       # Optional
```

To get Gemini API key:
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy and paste it

## Step 7: Deploy API Gateway

```bash
cd ../api-gateway

# Deploy the service
railway up --service api-gateway
```

**Add Environment Variables for API Gateway:**
```env
PORT=8080
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=${{shared.JWT_SECRET}}
CORE_API_URL=http://core-api.railway.internal:3001
MCP_URL=http://mcp-orchestrator.railway.internal:3000
ALLOWED_ORIGINS=https://web-production.up.railway.app
```

**Generate Domain for API Gateway:**
1. In Railway Dashboard → "api-gateway" service
2. Go to "Settings" tab
3. Under "Networking", click "Generate Domain"
4. Copy the URL (you'll need it for frontend)

## Step 8: Deploy Web Frontend

```bash
cd ../../apps/web

# Deploy the service
railway up --service web
```

**Add Environment Variables for Web:**
```env
NEXT_PUBLIC_API_URL=https://api-gateway-production-xxx.up.railway.app
NEXT_PUBLIC_WS_URL=wss://api-gateway-production-xxx.up.railway.app
```
(Replace xxx with your actual API Gateway domain)

**Generate Domain for Web:**
1. In Railway Dashboard → "web" service
2. Go to "Settings" tab
3. Under "Networking", click "Generate Domain"

## Step 9: Create Initial Admin User

```bash
# Create a seed script first
cd ../..
```

Create `packages/database/src/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default company
  const company = await prisma.company.create({
    data: {
      name: 'MSPIL - Mahakaushal Sugar & Power Industries Ltd',
      code: 'MSPIL',
      email: 'info@mspil.in',
      phone: '+91-1234567890',
      address: {
        line1: 'Factory Road',
        city: 'Narsinghpur',
        state: 'Madhya Pradesh',
        country: 'India',
        pincode: '487001'
      }
    }
  });

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'admin@mspil.in',
      username: 'admin',
      passwordHash,
      role: 'ADMIN',
      name: 'System Administrator',
      isActive: true
    }
  });

  console.log('✅ Seed data created!');
  console.log('Admin login: admin / admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run the seed:
```bash
railway run --service core-api npx tsx packages/database/src/seed.ts
```

## Step 10: Verify Everything is Working

1. **Check Service Health:**
   ```bash
   # API Gateway Health
   curl https://your-api-gateway-url.railway.app/health

   # You should see all services as "healthy"
   ```

2. **Test Login:**
   ```bash
   curl -X POST https://your-api-gateway-url.railway.app/api/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"email": "admin", "password": "admin123"}'
   ```

3. **Open Your App:**
   - Go to your web URL from Railway
   - Login with admin / admin123

## 🎉 You're Done!

Your Modern ERP is now live with:
- ✅ PostgreSQL Database
- ✅ Redis Cache
- ✅ Core API with Auth
- ✅ MCP Orchestrator (AI Brain)
- ✅ API Gateway
- ✅ Web Frontend

## 📊 Monitoring Your Services

```bash
# View logs for any service
railway logs --service api-gateway
railway logs --service core-api
railway logs --service mcp-orchestrator

# Check all services status
railway status
```

## 🚨 Troubleshooting

### If Build Fails:
1. Check logs: `railway logs --service [service-name]`
2. Verify all dependencies in package.json
3. Make sure tsconfig.json is correct

### If Services Can't Connect:
1. Use internal URLs: `http://service-name.railway.internal:PORT`
2. Check environment variables are set
3. Verify services are in the same project

### If Database Migration Fails:
1. Check DATABASE_URL is correct
2. Try running locally first
3. Check Prisma schema syntax

## 🎯 Next Steps

1. **Add Custom Domain** (optional)
2. **Set Up Monitoring** (Grafana/Sentry)
3. **Configure Backups** 
4. **Add More AI Features**
5. **Scale Services** as needed

Need help with any step? Let me know!