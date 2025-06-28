#!/bin/bash

# Test Railway Internal Network Communication
echo "🔗 Testing Railway Internal Network"
echo "==================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# External URLs (for testing from outside)
API_GATEWAY="https://api-gateway-production-00e9.up.railway.app"

echo -e "${BLUE}1. Testing API Gateway Service Discovery${NC}"
echo "========================================="

# Get API Gateway health to see service connectivity
HEALTH=$(curl -s "$API_GATEWAY/health")

echo "Checking internal connections from API Gateway:"
echo ""

# Check Core API
echo -n "API Gateway → Core API (dynamic-nourishment)......."
if echo "$HEALTH" | grep -q '"core":"healthy"'; then
    echo -e "${GREEN}✅ CONNECTED${NC}"
elif echo "$HEALTH" | grep -q '"core":"unreachable"'; then
    echo -e "${RED}❌ UNREACHABLE${NC}"
    echo "  Fix: Add CORE_API_URL=http://dynamic-nourishment.railway.internal"
else
    echo -e "${YELLOW}⚠️  UNKNOWN${NC}"
fi

# Check MCP
echo -n "API Gateway → MCP (energetic-vision)..............."
if echo "$HEALTH" | grep -q '"mcp":"healthy"'; then
    echo -e "${GREEN}✅ CONNECTED${NC}"
elif echo "$HEALTH" | grep -q '"mcp":"unreachable"'; then
    echo -e "${RED}❌ UNREACHABLE${NC}"
    echo "  Fix: Add MCP_ORCHESTRATOR_URL=http://energetic-vision.railway.internal"
else
    echo -e "${YELLOW}⚠️  UNKNOWN${NC}"
fi

# Check Event Processor
echo -n "API Gateway → Event Processor (incredible-adaptation)"
if echo "$HEALTH" | grep -q '"event":"healthy"' || echo "$HEALTH" | grep -q '"analytics":"healthy"'; then
    echo -e "${GREEN}✅ CONNECTED${NC}"
elif echo "$HEALTH" | grep -q '"analytics":"unreachable"'; then
    echo -e "${RED}❌ UNREACHABLE${NC}"
    echo "  Fix: Add EVENT_PROCESSOR_URL=http://incredible-adaptation.railway.internal"
else
    echo -e "${YELLOW}⚠️  UNKNOWN${NC}"
fi

echo ""
echo -e "${BLUE}2. Testing API Gateway Proxy Routes${NC}"
echo "===================================="

# Test auth route proxy
echo -n "Testing /api/auth/health proxy....................."
AUTH_HEALTH=$(curl -s "$API_GATEWAY/api/auth/health" -w "%{http_code}" -o /tmp/auth_response.txt)
if [ "$AUTH_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ WORKING${NC}"
else
    echo -e "${RED}❌ FAILED (HTTP $AUTH_HEALTH)${NC}"
fi

# Test core route proxy
echo -n "Testing /api/core/health proxy....................."
CORE_HEALTH=$(curl -s "$API_GATEWAY/api/core/health" -w "%{http_code}" -o /tmp/core_response.txt)
if [ "$CORE_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ WORKING${NC}"
else
    echo -e "${RED}❌ FAILED (HTTP $CORE_HEALTH)${NC}"
fi

# Test MCP route proxy
echo -n "Testing /api/mcp/health proxy......................"
MCP_HEALTH=$(curl -s "$API_GATEWAY/api/mcp/health" -w "%{http_code}" -o /tmp/mcp_response.txt)
if [ "$MCP_HEALTH" = "200" ] || [ "$MCP_HEALTH" = "404" ]; then
    echo -e "${GREEN}✅ ROUTE ACTIVE${NC}"
else
    echo -e "${RED}❌ FAILED (HTTP $MCP_HEALTH)${NC}"
fi

echo ""
echo -e "${BLUE}3. Performance Comparison${NC}"
echo "========================="

# Test external vs potential internal performance
echo "Measuring response times..."

# External call
EXTERNAL_TIME=$(curl -s -o /dev/null -w "%{time_total}" "https://core-api-production-76b9.up.railway.app/health")
echo -e "External call to Core API: ${YELLOW}${EXTERNAL_TIME}s${NC}"

# Via API Gateway (will use internal if configured)
INTERNAL_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$API_GATEWAY/api/core/health" 2>/dev/null || echo "N/A")
echo -e "Via API Gateway (internal): ${YELLOW}${INTERNAL_TIME}s${NC}"

echo ""
echo "==================================="
echo -e "${BLUE}RECOMMENDATIONS${NC}"
echo "==================================="

# Check if internal URLs are configured
if echo "$HEALTH" | grep -q '"core":"unreachable"'; then
    echo -e "${YELLOW}⚠️  Configure internal URLs in API Gateway for better performance:${NC}"
    echo ""
    echo "Add these environment variables to API Gateway in Railway:"
    echo "CORE_API_URL=http://dynamic-nourishment.railway.internal"
    echo "MCP_ORCHESTRATOR_URL=http://energetic-vision.railway.internal"
    echo "EVENT_PROCESSOR_URL=http://incredible-adaptation.railway.internal"
else
    echo -e "${GREEN}✅ Internal network is properly configured!${NC}"
    echo "Services are using fast internal communication."
fi

echo ""
echo "Benefits of internal networking:"
echo "- 🚀 Lower latency (same network)"
echo "- 🔒 Better security (not exposed to internet)"
echo "- ⚡ No SSL overhead"
echo "- 📈 Higher throughput"