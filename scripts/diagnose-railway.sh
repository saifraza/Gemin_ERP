#!/bin/bash

echo "🔍 Railway Service Diagnostics"
echo "=============================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service URLs
CORE_API_URL="https://core-api-production-76b9.up.railway.app"
API_GATEWAY_URL="https://api-gateway-production-00e9.up.railway.app"
MCP_ORCHESTRATOR_URL="https://mcp-orchestrator-production.up.railway.app"
EVENT_PROCESSOR_URL="https://event-processor-production.up.railway.app"
WEB_URL="https://web-production-66cf.up.railway.app"

echo -e "${BLUE}1. Testing Raw Endpoints${NC}"
echo "------------------------"

# Test each service root endpoint
echo -n "Core API root: "
status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$CORE_API_URL/")
echo "HTTP $status"

echo -n "API Gateway root: "
status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$API_GATEWAY_URL/")
echo "HTTP $status"

echo -n "MCP Orchestrator root: "
status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$MCP_ORCHESTRATOR_URL/")
echo "HTTP $status"

echo -n "Event Processor root: "
status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$EVENT_PROCESSOR_URL/")
echo "HTTP $status"

echo -n "Web Frontend: "
status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$WEB_URL/")
echo "HTTP $status"

echo ""
echo -e "${BLUE}2. Checking Health Endpoints with Details${NC}"
echo "-----------------------------------------"

# Core API detailed check
echo -e "\n${YELLOW}Core API Health:${NC}"
response=$(curl -s "$CORE_API_URL/health")
echo "$response" | jq '.' 2>/dev/null || echo "$response"

# API Gateway detailed check  
echo -e "\n${YELLOW}API Gateway Health:${NC}"
response=$(curl -s "$API_GATEWAY_URL/health")
echo "$response" | jq '.' 2>/dev/null || echo "$response"

# MCP Orchestrator detailed check
echo -e "\n${YELLOW}MCP Orchestrator Health:${NC}"
response=$(curl -s "$MCP_ORCHESTRATOR_URL/health")
echo "$response" | jq '.' 2>/dev/null || echo "$response"

# Event Processor detailed check
echo -e "\n${YELLOW}Event Processor Health:${NC}"
response=$(curl -s "$EVENT_PROCESSOR_URL/health")
echo "$response" | jq '.' 2>/dev/null || echo "$response"

echo ""
echo -e "${BLUE}3. Common Issues to Check in Railway${NC}"
echo "------------------------------------"

echo -e "${YELLOW}Environment Variables:${NC}"
echo "1. JWT_SECRET - Must be the same across all services"
echo "2. DATABASE_URL - Should use \${{Postgres-O1Ol.DATABASE_URL}}"
echo "3. REDIS_URL - Should use \${{Redis.REDIS_URL}}"
echo "4. Internal service URLs should use *.railway.internal format"

echo -e "\n${YELLOW}Deployment Status:${NC}"
echo "Check in Railway dashboard that:"
echo "1. All services show 'Active' status"
echo "2. No deployment failures in recent deployments"
echo "3. PostgreSQL and Redis services are running"

echo -e "\n${YELLOW}The 503 error on Core API suggests:${NC}"
echo "- Redis connection issue (max retries reached)"
echo "- Check REDIS_URL environment variable"
echo "- Ensure Redis service is running in Railway"

echo -e "\n${BLUE}4. Next Steps${NC}"
echo "-------------"
echo "1. Go to Railway dashboard"
echo "2. Click on 'core-api' service"
echo "3. Check the 'Logs' tab for error messages"
echo "4. Verify 'Variables' tab has REDIS_URL set correctly"
echo "5. Check Redis service is running"