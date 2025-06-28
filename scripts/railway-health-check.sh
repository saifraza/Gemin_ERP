#!/bin/bash

# Railway Service Health Check Script
# This script tests all services in your Railway deployment

echo "🚂 Railway ERP Health Check"
echo "=========================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Update these with your actual Railway public URLs
WEB_URL="https://web-production-66cf.up.railway.app"
CORE_API_URL="https://core-api-production-76b9.up.railway.app"
API_GATEWAY_URL="https://api-gateway-production-00e9.up.railway.app"
MCP_ORCHESTRATOR_URL="https://mcp-orchestrator-production.up.railway.app"
EVENT_PROCESSOR_URL="https://event-processor-production.up.railway.app"

# Function to check service health
check_service() {
    local service_name=$1
    local service_url=$2
    
    echo -n "Checking $service_name... "
    
    # Try to hit the health endpoint
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$service_url/health")
    
    if [ "$response" == "200" ]; then
        echo -e "${GREEN}✅ Healthy${NC}"
        # Get detailed health info
        health_data=$(curl -s "$service_url/health")
        echo "  Response: $health_data"
        return 0
    else
        echo -e "${RED}❌ Unhealthy (HTTP $response)${NC}"
        return 1
    fi
}

# Function to test database connectivity through core-api
test_database() {
    echo -n "Testing Database Connection... "
    
    response=$(curl -s "$CORE_API_URL/health" | grep -o '"database":"connected"')
    
    if [ ! -z "$response" ]; then
        echo -e "${GREEN}✅ Connected${NC}"
    else
        echo -e "${RED}❌ Not Connected${NC}"
    fi
}

# Function to test Redis connectivity
test_redis() {
    echo -n "Testing Redis Connection... "
    
    response=$(curl -s "$CORE_API_URL/health" | grep -o '"cache":"connected"')
    
    if [ ! -z "$response" ]; then
        echo -e "${GREEN}✅ Connected${NC}"
    else
        echo -e "${RED}❌ Not Connected${NC}"
    fi
}

# Function to test inter-service communication
test_inter_service() {
    echo -n "Testing Inter-Service Communication... "
    
    # Test if api-gateway can reach core-api
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$API_GATEWAY_URL/api/health/services")
    
    if [ "$response" == "200" ]; then
        echo -e "${GREEN}✅ Working${NC}"
    else
        echo -e "${YELLOW}⚠️  Cannot verify (endpoint may not exist)${NC}"
    fi
}

# Main execution
echo "📡 Service Health Checks:"
echo "------------------------"

# Check each service
healthy_count=0
total_count=5

check_service "Web Frontend" "$WEB_URL" && ((healthy_count++))
check_service "Core API" "$CORE_API_URL" && ((healthy_count++))
check_service "API Gateway" "$API_GATEWAY_URL" && ((healthy_count++))
check_service "MCP Orchestrator" "$MCP_ORCHESTRATOR_URL" && ((healthy_count++))
check_service "Event Processor" "$EVENT_PROCESSOR_URL" && ((healthy_count++))

echo ""
echo "🔌 Infrastructure Checks:"
echo "------------------------"

test_database
test_redis
test_inter_service

echo ""
echo "📊 Summary:"
echo "----------"
echo "Services: $healthy_count/$total_count healthy"

if [ $healthy_count -eq $total_count ]; then
    echo -e "${GREEN}✅ All services are healthy!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some services need attention${NC}"
    exit 1
fi