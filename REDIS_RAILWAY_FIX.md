# Redis Connection Fix for Railway

## Current Issue
The Redis URL is using `redis.railway.internal` which appears to be the internal hostname, but it's showing in "Public Networking" which suggests it might need external access.

## Solution Options

### Option 1: Use Redis Public URL (Recommended)
In Railway, if Redis is showing in "Public Networking":

1. Go to your Redis service in Railway
2. Look for the public URL (it should look like):
   ```
   redis://default:password@roundhouse.proxy.rlwy.net:12345
   ```
3. Update the REDIS_URL in all services to use this public URL

### Option 2: Check if Redis is in Same Project
If Redis is in a different Railway project, internal networking won't work. Ensure:
- Redis service is in the same Railway project as your other services
- All services are in the same environment (production)

### Option 3: Use Redis Internal URL Correctly
If Redis is in the same project, the internal URL might be different:
1. Check the Redis service name in Railway
2. The internal URL format should be: `redis://default:password@<service-name>.railway.internal:6379`

## How to Update Redis URL in Railway

1. Go to each service that needs Redis:
   - Core API
   - API Gateway  
   - Event Processor

2. In Variables tab, update REDIS_URL to:
   ```
   REDIS_URL=redis://default:password@roundhouse.proxy.rlwy.net:12345
   ```
   (Use your actual Redis public URL)

## Alternative: Direct Redis URL
Instead of using `${{Redis.REDIS_URL}}`, you can directly paste the Redis URL:

```
REDIS_URL=redis://default:AUajrBfdAnIfJmLbSbVrtUVyvbHdwlDP@roundhouse.proxy.rlwy.net:12345
```

## Testing the Connection
After updating, the services will automatically reconnect to Redis. You can verify by checking:
```bash
curl https://core-api-production-76b9.up.railway.app/api/test/redis-debug
```

The connection status should show "ready" and ping should return "PONG".