# Railway Build Command Overrides

## For Each Failed Service, Override the Build Commands:

### 1. core-api
**Build Command:**
```bash
npm install -g pnpm && cd /app && pnpm install --no-frozen-lockfile && pnpm --filter @modern-erp/database generate && pnpm build --filter @modern-erp/core-api
```

**Start Command:**
```bash
cd /app/services/core-api && node dist/index.js
```

### 2. mcp-orchestrator
**Build Command:**
```bash
npm install -g pnpm && cd /app && pnpm install --no-frozen-lockfile && pnpm build --filter @modern-erp/mcp-orchestrator
```

**Start Command:**
```bash
cd /app/services/mcp-orchestrator && node dist/index.js
```

### 3. api-gateway
**Build Command:**
```bash
npm install -g pnpm && cd /app && pnpm install --no-frozen-lockfile && pnpm build --filter @modern-erp/api-gateway
```

**Start Command:**
```bash
cd /app/services/api-gateway && node dist/index.js
```

### 4. web (when it fails)
**Build Command:**
```bash
npm install -g pnpm && cd /app && pnpm install --no-frozen-lockfile && pnpm build --filter @modern-erp/web
```

**Start Command:**
```bash
cd /app/apps/web && pnpm start
```

## How to Apply:
1. Click on the failed service
2. Go to "Settings" tab
3. Find "Build Command" and "Start Command"
4. Replace with the commands above
5. Click "Save"
6. The service will automatically redeploy