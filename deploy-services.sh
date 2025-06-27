#!/bin/bash

echo "🚂 Deploying Modern ERP Services to Railway"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if railway is linked
if ! railway status &>/dev/null; then
    echo -e "${RED}❌ No Railway project linked!${NC}"
    echo "Please run: railway link"
    exit 1
fi

echo -e "${GREEN}✅ Railway project linked${NC}"
echo ""

# Function to deploy a service
deploy_service() {
    local service_name=$1
    local service_path=$2
    
    echo -e "${BLUE}📦 Deploying $service_name...${NC}"
    cd "$service_path" || exit 1
    
    if railway up --service "$service_name"; then
        echo -e "${GREEN}✅ $service_name deployed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to deploy $service_name${NC}"
        exit 1
    fi
    
    cd - > /dev/null || exit 1
    echo ""
}

# Deploy services in order
echo "📋 Deployment Order:"
echo "1. Core API (Database setup)"
echo "2. MCP Orchestrator (AI Brain)"
echo "3. API Gateway (Public endpoint)"
echo "4. Web Frontend"
echo ""
echo "Press Enter to start deployment..."
read

# Deploy Core API first
deploy_service "core-api" "services/core-api"

# Run migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
if railway run --service core-api pnpm --filter @modern-erp/database db:migrate:prod; then
    echo -e "${GREEN}✅ Database migrations completed${NC}"
else
    echo -e "${RED}❌ Migration failed - you may need to run manually${NC}"
fi
echo ""

# Deploy other services
deploy_service "mcp-orchestrator" "services/mcp-orchestrator"
deploy_service "api-gateway" "services/api-gateway"
deploy_service "web" "apps/web"

echo -e "${GREEN}🎉 All services deployed!${NC}"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Railway dashboard"
echo "2. Generate domains for api-gateway and web"
echo "3. Update NEXT_PUBLIC_API_URL in web service"
echo "4. Create admin user with seed script"
echo ""
echo "Run: railway open"