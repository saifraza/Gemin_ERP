#!/bin/bash

# Test Redis connectivity in Railway
echo "🔴 Testing Redis Connectivity"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Service URLs
CORE_API="https://core-api-production-76b9.up.railway.app"
API_GATEWAY="https://api-gateway-production-00e9.up.railway.app"
EVENT_PROCESSOR="https://event-processor-production.up.railway.app"

echo -e "${BLUE}1. Checking Redis Status in Services${NC}"
echo "===================================="

# Check Core API
echo -n "Core API Redis Status.................."
CORE_HEALTH=$(curl -s "$CORE_API/health")
REDIS_STATUS=$(echo "$CORE_HEALTH" | grep -o '"cache":"[^"]*"' | cut -d'"' -f4)
HAS_REDIS_URL=$(echo "$CORE_HEALTH" | grep -o '"hasRedisUrl":[^,}]*' | cut -d':' -f2)

if [ "$REDIS_STATUS" = "connected" ]; then
    echo -e "${GREEN}✅ CONNECTED${NC}"
elif [ "$REDIS_STATUS" = "not_initialized" ]; then
    echo -e "${YELLOW}⚠️  NOT INITIALIZED${NC}"
    if [ "$HAS_REDIS_URL" = "true" ]; then
        echo "    → Has Redis URL configured"
    else
        echo "    → Missing Redis URL"
    fi
else
    echo -e "${RED}❌ ERROR${NC}"
fi

# Check API Gateway
echo -n "API Gateway Redis Status..............."
GATEWAY_HEALTH=$(curl -s "$API_GATEWAY/health")
GATEWAY_REDIS=$(echo "$GATEWAY_HEALTH" | grep -o '"redis":"[^"]*"' | cut -d'"' -f4)

if [ "$GATEWAY_REDIS" = "connected" ]; then
    echo -e "${GREEN}✅ CONNECTED${NC}"
elif [ "$GATEWAY_REDIS" = "disconnected" ]; then
    echo -e "${RED}❌ DISCONNECTED${NC}"
else
    echo -e "${YELLOW}⚠️  UNKNOWN${NC}"
fi

# Check Event Processor
echo -n "Event Processor Redis Status..........."
EVENT_HEALTH=$(curl -s "$EVENT_PROCESSOR/health")
EVENT_REDIS=$(echo "$EVENT_HEALTH" | grep -o '"redis":"[^"]*"' | cut -d'"' -f4)

if [ "$EVENT_REDIS" = "connected" ]; then
    echo -e "${GREEN}✅ CONNECTED${NC}"
elif [ "$EVENT_REDIS" = "disconnected" ] || [ "$EVENT_REDIS" = "reconnecting" ]; then
    echo -e "${RED}❌ $EVENT_REDIS${NC}"
else
    echo -e "${YELLOW}⚠️  UNKNOWN${NC}"
fi

echo ""
echo -e "${BLUE}2. Common Redis Connection Issues${NC}"
echo "================================="

echo "Checking for common problems..."
echo ""

# Check if services have Redis URL
if [ "$HAS_REDIS_URL" != "true" ]; then
    echo -e "${RED}❌ Missing REDIS_URL environment variable${NC}"
    echo "   Fix: Add REDIS_URL=\${{Redis.REDIS_URL}} to service"
else
    echo -e "${GREEN}✅ Redis URL is configured${NC}"
fi

echo ""
echo -e "${BLUE}3. Railway Redis Configuration${NC}"
echo "=============================="

echo "In Railway, Redis URLs typically look like:"
echo "- Internal: redis://default:password@redis.railway.internal:6379"
echo "- External: redis://default:password@host.railway.app:port"
echo ""
echo "Services should use the internal URL for better performance."

echo ""
echo -e "${BLUE}4. Troubleshooting Steps${NC}"
echo "======================="

if [ "$REDIS_STATUS" != "connected" ]; then
    echo "1. Check Railway Redis service is running"
    echo "2. Verify REDIS_URL format:"
    echo "   - Should be: redis://default:password@host:6379"
    echo "   - Not: redis.railway.internal (missing protocol)"
    echo ""
    echo "3. In Railway, ensure Redis service has:"
    echo "   - Public networking enabled (if using external URL)"
    echo "   - OR use internal URL if services are in same project"
    echo ""
    echo "4. Check if Redis requires TLS:"
    echo "   - Some Redis providers require rediss:// (with double s)"
    echo ""
    echo "5. Test Redis connection manually:"
    echo "   - Install redis-cli locally"
    echo "   - redis-cli -u \$REDIS_URL ping"
fi

echo ""
echo -e "${BLUE}5. Impact Analysis${NC}"
echo "=================="

if [ "$REDIS_STATUS" != "connected" ]; then
    echo -e "${YELLOW}Services are running without Redis:${NC}"
    echo "- ✅ Authentication still works (no session caching)"
    echo "- ✅ CRUD operations work (direct DB queries)"
    echo "- ⚠️  Rate limiting degraded (memory-based fallback)"
    echo "- ⚠️  No distributed caching"
    echo "- ⚠️  Event queue using in-memory fallback"
else
    echo -e "${GREEN}Redis is connected! Benefits:${NC}"
    echo "- ✅ Fast session caching"
    echo "- ✅ Distributed rate limiting"
    echo "- ✅ Event queue persistence"
    echo "- ✅ Better performance"
fi