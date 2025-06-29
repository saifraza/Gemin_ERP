# Railway Deployment Issue - Troubleshooting Guide

## Current Issue
Railway is not deploying the latest code changes. The Core API service is running an old version that has the incorrect Company model structure.

## What We Fixed
1. Changed Company address from separate fields to JSON:
   ```javascript
   // OLD (what Railway is using)
   address: '123 Test Street',
   city: 'Test City',
   state: 'Test State',
   
   // NEW (what should be deployed)
   address: {
     street: '123 Test Street',
     city: 'Test City',
     state: 'Test State',
     country: 'Test Country',
     postalCode: '12345'
   }
   ```

2. Added version endpoint at `/api/test/version` to verify deployment

## How to Fix on Railway

### Option 1: Force Redeploy from Railway Dashboard
1. Go to your Railway dashboard
2. Navigate to the `core-api` service
3. Click on "Deployments" tab
4. Click "Redeploy" on the latest deployment
5. Or trigger a manual deploy from the main branch

### Option 2: Clear Build Cache
1. In Railway dashboard for core-api service
2. Go to Settings > Build
3. Add a build argument: `FORCE_REBUILD=1`
4. Remove it after one successful deployment

### Option 3: Check Branch Settings
1. Verify Railway is deploying from `main` branch
2. Go to Settings > Source
3. Ensure "Branch" is set to `main`
4. Check if "Auto Deploy" is enabled

### Option 4: Manual Deployment Command
If you have Railway CLI installed:
```bash
cd services/core-api
railway up
```

## Verification Steps
Once deployed, test these endpoints:

1. Version check (should return 1.0.1):
   ```bash
   curl https://core-api-production-76b9.up.railway.app/api/test/version
   ```

2. Test registration:
   ```bash
   curl -X POST https://core-api-production-76b9.up.railway.app/api/auth/test-register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"TestPassword123!","name":"Test User"}'
   ```

## Current Code Status
- ✅ Code is correct in GitHub repository
- ✅ Local builds work correctly
- ❌ Railway is using old cached build
- ✅ All services are running (just with old code)

## Quick Fix Alternative
If Railway won't update, you can:
1. Create a new service in Railway
2. Connect it to the same repo
3. Set the root directory to `/services/core-api`
4. Copy environment variables from old service
5. Update the domain to point to new service