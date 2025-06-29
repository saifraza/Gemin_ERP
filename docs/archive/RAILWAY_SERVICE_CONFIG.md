# Railway Service Configuration

## IMPORTANT: Root Directory Settings

When creating services in Railway from GitHub, make sure to:

### For ALL Services:
**Root Directory**: Leave EMPTY or set to `/`

This ensures Railway builds from the monorepo root, not from individual service directories.

### Service-Specific Settings:

#### 1. core-api
- **Service Name**: core-api
- **Root Directory**: `/` (or leave empty)
- **Environment Variables**:
  ```
  PORT=3001
  DATABASE_URL=${{Postgres.DATABASE_URL}}
  REDIS_URL=${{Redis.REDIS_URL}}
  JWT_SECRET=your-secret-here
  ```

#### 2. mcp-orchestrator
- **Service Name**: mcp-orchestrator  
- **Root Directory**: `/` (or leave empty)
- **Environment Variables**:
  ```
  PORT=3000
  DATABASE_URL=${{Postgres.DATABASE_URL}}
  REDIS_URL=${{Redis.REDIS_URL}}
  JWT_SECRET=${{shared.JWT_SECRET}}
  GEMINI_API_KEY=your-key
  ```

#### 3. api-gateway
- **Service Name**: api-gateway
- **Root Directory**: `/` (or leave empty)
- **Generate Domain**: YES
- **Environment Variables**:
  ```
  PORT=8080
  REDIS_URL=${{Redis.REDIS_URL}}
  JWT_SECRET=${{shared.JWT_SECRET}}
  CORE_API_URL=http://core-api.railway.internal:3001
  MCP_URL=http://mcp-orchestrator.railway.internal:3000
  ```

#### 4. web
- **Service Name**: web
- **Root Directory**: `/` (or leave empty)
- **Generate Domain**: YES
- **Environment Variables**:
  ```
  NEXT_PUBLIC_API_URL=https://[api-gateway-domain]
  NEXT_PUBLIC_WS_URL=wss://[api-gateway-domain]
  ```

## Why This Matters

Railway's default behavior is to set the service directory as the build root. This breaks monorepo builds because:
- `cd ../..` from `/app` goes to `/` (system root)
- Workspace dependencies can't be found
- pnpm workspaces don't work correctly

By keeping the root directory empty or `/`, Railway builds from the repository root, allowing our monorepo structure to work properly.