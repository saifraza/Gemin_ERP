# Redis Internal URL Configuration

## Current Issue
The error shows: `ENOTFOUND monorail.proxy.rlwy.net`
This is the external Redis URL, but we want to use the internal one for better performance.

## Finding the Internal Redis URL

### Option 1: Check Redis Service in Railway
1. Go to your Redis-jr2e service in Railway
2. Look for "Internal Hostname" or "Private Networking"
3. The internal URL format should be:
   ```
   redis://default:[password]@[internal-hostname].railway.internal:6379
   ```

### Option 2: Use Environment Variable Override
Instead of using `${{ Redis-jr2e.REDIS_URL }}`, you can manually set the internal URL:

1. Find the Redis password from the current URL
2. Find the internal hostname (might be something like `redis-jr2e.railway.internal`)
3. Set REDIS_URL manually:
   ```
   REDIS_URL=redis://default:[password]@redis-jr2e.railway.internal:6379
   ```

### Option 3: Check Railway Service Names
The internal hostname is usually based on the service name. If your Redis service is named:
- `Redis-jr2e` → Try `redis-jr2e.railway.internal`
- `redis` → Try `redis.railway.internal`

## Testing the Connection

After updating to the internal URL:

1. Redeploy the services
2. Check logs for successful connection
3. Verify with: `curl https://core-api-production-76b9.up.railway.app/api/test/redis-debug`

## Why Internal is Better
- No DNS resolution issues
- Lower latency (same network)
- More secure (not exposed to internet)
- No SSL overhead