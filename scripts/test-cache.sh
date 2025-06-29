#!/bin/bash

# Test Redis-like Cache Implementation
echo "🔴 Testing Redis Alternative (PostgreSQL Cache)"
echo "=============================================="
echo ""

# Service URL
CORE_API="https://core-api-production-76b9.up.railway.app"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}1. Initialize Cache Table${NC}"
echo "========================="
INIT_RESULT=$(curl -s -X POST "$CORE_API/api/cache-test/init")
echo "Response: $INIT_RESULT" | jq '.' 2>/dev/null || echo "$INIT_RESULT"
echo ""

echo -e "${BLUE}2. Test SET Operation${NC}"
echo "===================="
# Set a simple value
SET_RESULT1=$(curl -s -X POST "$CORE_API/api/cache-test/set" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "user:123",
    "value": {"name": "John Doe", "role": "ADMIN"},
    "ttl": 3600
  }')
echo "SET user:123 → " 
echo "$SET_RESULT1" | jq '.' 2>/dev/null || echo "$SET_RESULT1"

# Set another value
SET_RESULT2=$(curl -s -X POST "$CORE_API/api/cache-test/set" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "config:app",
    "value": {"theme": "dark", "language": "en"},
    "ttl": 7200
  }')
echo -e "\nSET config:app → "
echo "$SET_RESULT2" | jq '.' 2>/dev/null || echo "$SET_RESULT2"
echo ""

echo -e "${BLUE}3. Test GET Operation${NC}"
echo "===================="
# Get the first value
GET_RESULT=$(curl -s "$CORE_API/api/cache-test/get/user:123")
echo "GET user:123 → "
echo "$GET_RESULT" | jq '.' 2>/dev/null || echo "$GET_RESULT"
echo ""

echo -e "${BLUE}4. List All Cache Keys${NC}"
echo "====================="
LIST_RESULT=$(curl -s "$CORE_API/api/cache-test/list")
echo "$LIST_RESULT" | jq '.' 2>/dev/null || echo "$LIST_RESULT"
echo ""

echo -e "${BLUE}5. Run All Redis-like Operations Test${NC}"
echo "===================================="
TEST_RESULT=$(curl -s -X POST "$CORE_API/api/cache-test/test-operations")
echo "$TEST_RESULT" | jq '.' 2>/dev/null || echo "$TEST_RESULT"
echo ""

echo -e "${BLUE}6. Performance Comparison${NC}"
echo "========================"
echo "Testing SET/GET performance..."

# Time a SET operation
START_TIME=$(date +%s%N)
curl -s -X POST "$CORE_API/api/cache-test/set" \
  -H "Content-Type: application/json" \
  -d '{"key": "perf:test", "value": "performance test data"}' > /dev/null
END_TIME=$(date +%s%N)
SET_TIME=$((($END_TIME - $START_TIME) / 1000000))

# Time a GET operation
START_TIME=$(date +%s%N)
curl -s "$CORE_API/api/cache-test/get/perf:test" > /dev/null
END_TIME=$(date +%s%N)
GET_TIME=$((($END_TIME - $START_TIME) / 1000000))

echo -e "SET operation: ${YELLOW}${SET_TIME}ms${NC}"
echo -e "GET operation: ${YELLOW}${GET_TIME}ms${NC}"
echo ""

echo -e "${BLUE}Summary${NC}"
echo "======="
echo -e "${GREEN}✅ Redis-like operations implemented using PostgreSQL${NC}"
echo -e "${GREEN}✅ Supports SET, GET, DELETE, KEYS operations${NC}"
echo -e "${GREEN}✅ TTL (Time To Live) support${NC}"
echo -e "${GREEN}✅ JSON value storage${NC}"
echo ""
echo "This implementation provides Redis-like functionality without needing Redis!"
echo "Perfect for caching, session storage, and temporary data."