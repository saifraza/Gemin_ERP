# Railway Environment Variables Configuration

## API Gateway Service

Add these environment variables to the API Gateway service in Railway:

```
CORE_API_URL=http://core-api.railway.internal
MCP_ORCHESTRATOR_URL=http://mcp-orchestrator.railway.internal
EVENT_PROCESSOR_URL=http://event-processor.railway.internal
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
NODE_ENV=production
```

## Core API Service

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
NODE_ENV=production
```

## MCP Orchestrator Service

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
NODE_ENV=production
# Add when ready:
# OPENAI_API_KEY=your-key
# ANTHROPIC_API_KEY=your-key
```

## Event Processor Service

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=f1606f654e8061ae20923dbc459c171718ca368f84ce697a82b6926e5dabd07f
NODE_ENV=production
```

## How to Apply in Railway

1. Go to your Railway project
2. Click on the API Gateway service
3. Go to the "Variables" tab
4. Add each variable listed above
5. Railway will automatically redeploy

## Important Notes

- Use `${{ServiceName.VARIABLE}}` syntax to reference other services
- Internal URLs use `.railway.internal` domain
- No port needed for internal communication
- JWT_SECRET must be the same across all services