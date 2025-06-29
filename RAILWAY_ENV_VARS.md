# Railway Environment Variables Configuration

## API Gateway Service (compassionate-upliftment.railway.internal)

Add these environment variables to the API Gateway service in Railway:

```
CORE_API_URL=http://dynamic-nourishment.railway.internal
MCP_ORCHESTRATOR_URL=http://energetic-vision.railway.internal
EVENT_PROCESSOR_URL=http://incredible-adaptation.railway.internal
REDIS_URL=${{ Redis-jr2e.REDIS_URL }}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
NODE_ENV=production
ALLOWED_ORIGINS=https://new_erp.railway.internal,https://web-production-66cf.up.railway.app
```

## Core API Service

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{ Redis-jr2e.REDIS_URL }}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
NODE_ENV=production
```

## MCP Orchestrator Service

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{ Redis-jr2e.REDIS_URL }}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
NODE_ENV=production
# Add when ready:
# OPENAI_API_KEY=your-key
# ANTHROPIC_API_KEY=your-key
```

## Event Processor Service

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{ Redis-jr2e.REDIS_URL }}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
NODE_ENV=production
```

## Web Frontend Service (new_erp.railway.internal)

```
NEXT_PUBLIC_API_URL=https://api-gateway-production-00e9.up.railway.app
# For internal API calls from server components, add:
API_GATEWAY_INTERNAL_URL=http://compassionate-upliftment.railway.internal
```

## How to Apply in Railway

1. Go to your Railway project
2. Click on the service you want to configure
3. Go to the "Variables" tab
4. Add each variable listed above
5. Railway will automatically redeploy

## Important Notes

- Use `${{ServiceName.VARIABLE}}` syntax to reference other services
- Internal URLs are much faster (no SSL overhead, same network)
- No port needed for internal communication
- JWT_SECRET must be the same across all services

## Railway Internal Network Addresses

- **Core API**: dynamic-nourishment.railway.internal
- **API Gateway**: compassionate-upliftment.railway.internal
- **MCP Orchestrator**: energetic-vision.railway.internal
- **Event Processor**: incredible-adaptation.railway.internal
- **Web Frontend**: new_erp.railway.internal

Using internal addresses provides:
- ✅ Lower latency (same network)
- ✅ Better security (not exposed to internet)
- ✅ No SSL overhead
- ✅ Higher throughput