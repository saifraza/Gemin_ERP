# Railway PORT Configuration Fix

## The Issue
Your services are running perfectly internally but Railway's proxy returns 502. This is typically because:

1. **PORT is manually set** - Railway needs to assign PORT dynamically
2. **Service discovery mismatch** - Railway can't find your service on the expected port

## Solution

### Step 1: Remove PORT from Environment Variables

In Railway, for EACH service:
1. Go to the service
2. Click "Variables" tab
3. If you see `PORT` in the list, DELETE it
4. Railway will automatically assign PORT

### Step 2: Verify PORT Usage in Code

Your code correctly uses `process.env.PORT`. The issue is that Railway needs to control what port that is.

### Step 3: Check Railway Service Settings

For each service:
1. Go to Settings tab
2. Under "Service", check if there's a "Port" setting
3. If there is, remove it or set to "Auto"

### Common PORT Values Railway Assigns:
- Usually between 3000-8000
- Different for each deployment
- Changes between deployments

### Why This Matters:

Railway's proxy routes traffic like this:
```
Internet → Railway Proxy → Your Service
         ↓
   Looks for service 
   on Railway's assigned PORT
```

If your service listens on a different port than Railway expects, you get 502.

## Quick Test

After removing PORT from environment variables:

1. Redeploy the service
2. Check logs for the PORT value
3. It should be different from what you had before

## If Still Getting 502:

1. **Check Railway's Networking Settings**
   - Some services might need "Private Networking" enabled
   - Check if "Public Domain" is properly configured

2. **Try Railway's Default Settings**
   - Remove custom railway.json temporarily
   - Let Railway auto-detect your app

3. **Check for Multiple Listeners**
   - Ensure only one server is binding to the PORT

## The Nuclear Option

If nothing else works, create a new service in Railway:
1. Create new service
2. Connect to same repo
3. Don't set ANY environment variables except:
   - DATABASE_URL
   - REDIS_URL
   - JWT_SECRET
4. Let Railway handle everything else