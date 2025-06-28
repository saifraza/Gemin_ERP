# Railway Setup Guide

## 1. Database Setup

### PostgreSQL
1. In your Railway project, click "New" → "Database" → "Add PostgreSQL"
2. Click on the PostgreSQL service and go to "Variables" tab
3. Copy the `DATABASE_URL` value

### Redis
1. Click "New" → "Database" → "Add Redis"
2. Click on the Redis service and go to "Variables" tab
3. Copy the `REDIS_URL` value

## 2. Environment Variables

Set these environment variables for each service:

### core-api
```
DATABASE_URL=<your-postgres-url>
REDIS_URL=<your-redis-url>
JWT_SECRET=<generate-a-random-string>
PORT=3000
```

### mcp-orchestrator
```
REDIS_URL=<your-redis-url>
GEMINI_API_KEY=<your-gemini-api-key>
ANTHROPIC_API_KEY=<your-anthropic-api-key>
OPENAI_API_KEY=<your-openai-api-key>
PORT=3001
```

### event-processor
```
REDIS_URL=<your-redis-url>
DATABASE_URL=<your-postgres-url>
KAFKA_BROKERS=optional-kafka-url
PORT=3003
```

### api-gateway
```
REDIS_URL=<your-redis-url>
JWT_SECRET=<same-as-core-api>
PORT=8080
# Internal service URLs (Railway provides internal networking)
CORE_API_URL=http://core-api.railway.internal:3000
MCP_ORCHESTRATOR_URL=http://mcp-orchestrator.railway.internal:3001
EVENT_PROCESSOR_URL=http://event-processor.railway.internal:3003
```

### web
```
NEXT_PUBLIC_API_URL=https://<your-api-gateway-domain>
NEXT_PUBLIC_WS_URL=wss://<your-api-gateway-domain>
```

## 3. Deploy Order

1. **PostgreSQL & Redis** - Deploy these first
2. **core-api** - Deploy and run migrations
3. **mcp-orchestrator** - Deploy AI service
4. **event-processor** - Deploy event handling
5. **api-gateway** - Deploy gateway
6. **web** - Deploy frontend last

## 4. Running Migrations

After core-api is deployed:

1. Go to core-api service in Railway
2. Click on "Settings" → "Deploy" → "Run command"
3. Run: `npm run db:migrate`

Or use Railway CLI:
```bash
railway run npm run db:migrate --service=core-api
```

## 5. Verify Deployment

1. Check health endpoints:
   - `https://<api-gateway-domain>/health`
   - `https://<api-gateway-domain>/api/health`

2. Test database connection:
   - Try to register a user at `/api/auth/register`

3. Check logs for each service in Railway dashboard

## 6. Custom Domains (Optional)

1. Go to each service's Settings
2. Under "Networking", add your custom domain
3. Update DNS records as instructed

## 7. Troubleshooting

- **Database connection errors**: Check DATABASE_URL format
- **Internal networking issues**: Use `<service-name>.railway.internal:<port>`
- **Build failures**: Check build logs in Railway dashboard
- **Migration failures**: Ensure database is accessible and schema is valid