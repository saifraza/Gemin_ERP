# Railway Internal Networking Troubleshooting

## Current Status
- Core API: Running on port 8080, bound to :: (IPv6)
- API Gateway: Running on port 8080, bound to :: (IPv6)
- Connection attempts failing with ECONNREFUSED

## Railway Internal Networking Rules

1. **Service Discovery**
   - Services are available at: `<service-name>.railway.internal`
   - This resolves to the service's IPv6 address

2. **Port Configuration**
   - Services must bind to `::` (all IPv6 addresses) not `0.0.0.0`
   - The PORT environment variable is set by Railway (typically 8080)
   - Internal connections should use port 80 (HTTP default)

3. **Common Issues**
   - ECONNREFUSED usually means:
     - Service not binding to IPv6
     - Wrong port being used
     - Service not yet ready

## Debugging Steps

1. Check service is binding to IPv6:
   ```
   Server listening on [::]:8080
   ```

2. Verify environment variables:
   - Don't include port in CORE_API_URL
   - Just use: `core-api.railway.internal`

3. Connection format:
   ```
   http://core-api.railway.internal/health
   ```
   (Railway handles port mapping internally)

## Solution Attempts

1. ✅ Bind all services to :: instead of 0.0.0.0
2. ✅ Remove hardcoded ports from URLs
3. ✅ Use environment variables for service URLs
4. ❓ Verify Railway internal DNS is working
5. ❓ Check if we need to wait for DNS propagation