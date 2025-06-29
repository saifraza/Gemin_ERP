# Railway Environment Variables (Without Redis)

## Required Environment Variables for Each Service

### 1. Core API Service (dynamic-nourishment.railway.internal)
```bash
DATABASE_URL="${{ Postgres.DATABASE_URL }}"
JWT_SECRET="your-secret-key-here"
NODE_ENV="production"
```

### 2. API Gateway Service (compassionate-upliftment.railway.internal)
```bash
DATABASE_URL="${{ Postgres.DATABASE_URL }}"
JWT_SECRET="your-secret-key-here"
NODE_ENV="production"

# Internal service URLs for better performance
CORE_API_URL="http://dynamic-nourishment.railway.internal"
MCP_ORCHESTRATOR_URL="http://energetic-vision.railway.internal"
EVENT_PROCESSOR_URL="http://incredible-adaptation.railway.internal"
```

### 3. MCP Orchestrator Service (energetic-vision.railway.internal)
```bash
DATABASE_URL="${{ Postgres.DATABASE_URL }}"
NODE_ENV="production"

# Optional - for LLM integration
OPENAI_API_KEY="your-openai-key" # Optional
ANTHROPIC_API_KEY="your-anthropic-key" # Optional
```

### 4. Event Processor Service (incredible-adaptation.railway.internal)
```bash
DATABASE_URL="${{ Postgres.DATABASE_URL }}"
NODE_ENV="production"
```

### 5. Web Service (new_erp.railway.internal)
```bash
VITE_API_URL="https://api-gateway-production-00e9.up.railway.app"
VITE_CORE_API_URL="https://core-api-production-76b9.up.railway.app"
NODE_ENV="production"
```

## Notes

1. **Redis Removed**: All Redis-related environment variables have been removed. The system now uses PostgreSQL for caching, session storage, and rate limiting.

2. **Internal URLs**: Services communicate using Railway's internal network (*.railway.internal) for better performance and security.

3. **Database URL**: All services use the same PostgreSQL database referenced by `${{ Postgres.DATABASE_URL }}`.

4. **JWT Secret**: Must be the same across all services that handle authentication.

## Migration from Redis

If you're migrating from a Redis-based setup:

1. Remove these environment variables from all services:
   - `REDIS_URL`
   - `REDIS_HOST`
   - `DISABLE_REDIS`

2. Run the cache index migration to optimize PostgreSQL performance:
   ```bash
   npm run db:migrate
   ```

3. The PostgreSQL cache will handle:
   - Session storage
   - Rate limiting
   - Temporary data caching
   - Event processing

## Performance Considerations

- PostgreSQL cache has ~500ms latency vs Redis ~1ms
- This is acceptable for ERP systems with < 1000 requests/second
- If you need microsecond latency in the future, you can add Redis back

## Deployment Steps

1. Update all services with the new environment variables
2. Remove the Redis service from Railway
3. Deploy all services
4. Verify health checks at each service's `/health` endpoint