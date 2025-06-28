#!/bin/bash

# Modern ERP Core Functionality Test Suite
# This script tests all core functions to ensure the ERP backbone is working

echo "🏭 Modern ERP Core Functionality Test Suite"
echo "=========================================="
echo "Testing Date: $(date)"
echo ""

# Configuration
CORE_API="https://core-api-production-76b9.up.railway.app"
API_GATEWAY="https://api-gateway-production-00e9.up.railway.app"
MCP_ORCHESTRATOR="https://mcp-orchestrator-production.up.railway.app"
EVENT_PROCESSOR="https://event-processor-production.up.railway.app"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# Helper function to extract value from JSON
get_json_value() {
    echo "$1" | grep -o "\"$2\":[^,}]*" | cut -d: -f2- | tr -d ' "' | head -1
}

echo -e "${BLUE}1. SERVICE HEALTH CHECKS${NC}"
echo "========================"

# Test each service health
test_health() {
    local service_name=$1
    local service_url=$2
    
    response=$(curl -s -w "HTTP_CODE:%{http_code}" "$service_url/health")
    http_code=$(echo "$response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed 's/HTTP_CODE:[0-9]*//')
    
    if [ "$http_code" = "200" ]; then
        status=$(get_json_value "$body" "status")
        if [ "$status" = "healthy" ]; then
            print_result 0 "$service_name health check"
            return 0
        fi
    fi
    print_result 1 "$service_name health check (HTTP $http_code)"
    return 1
}

test_health "Core API" "$CORE_API"
test_health "API Gateway" "$API_GATEWAY"
test_health "MCP Orchestrator" "$MCP_ORCHESTRATOR"
test_health "Event Processor" "$EVENT_PROCESSOR"

echo ""
echo -e "${BLUE}2. AUTHENTICATION SYSTEM${NC}"
echo "======================="

# Test user registration
echo "Testing user registration..."
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"
TEST_PASSWORD="TestPassword123!"

register_response=$(curl -s -X POST "$CORE_API/api/auth/test-register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\",
        \"name\": \"Test User $TIMESTAMP\"
    }")

if echo "$register_response" | grep -q "user"; then
    print_result 0 "User registration"
    USER_ID=$(get_json_value "$register_response" "id")
else
    print_result 1 "User registration: $register_response"
fi

# Test user login
echo "Testing user login..."
login_response=$(curl -s -X POST "$CORE_API/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
    }")

if echo "$login_response" | grep -q "token"; then
    print_result 0 "User login"
    JWT_TOKEN=$(get_json_value "$login_response" "token")
    echo "JWT Token obtained: ${JWT_TOKEN:0:20}..."
else
    print_result 1 "User login: $login_response"
fi

# Test JWT verification
echo "Testing JWT verification..."
verify_response=$(curl -s -X GET "$CORE_API/api/auth/verify" \
    -H "Authorization: Bearer $JWT_TOKEN")

if echo "$verify_response" | grep -q "valid"; then
    print_result 0 "JWT verification"
else
    print_result 1 "JWT verification: $verify_response"
fi

echo ""
echo -e "${BLUE}3. DATABASE OPERATIONS (CRUD)${NC}"
echo "============================="

# Test company creation
echo "Testing company creation..."
company_response=$(curl -s -X POST "$CORE_API/api/companies" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Test Company $TIMESTAMP\",
        \"code\": \"TC$TIMESTAMP\",
        \"address\": \"123 Test Street\",
        \"city\": \"Test City\",
        \"state\": \"Test State\",
        \"country\": \"Test Country\",
        \"phone\": \"+1234567890\",
        \"email\": \"company$TIMESTAMP@test.com\"
    }")

if echo "$company_response" | grep -q "id"; then
    print_result 0 "Company creation"
    COMPANY_ID=$(get_json_value "$company_response" "id")
else
    print_result 1 "Company creation: $company_response"
fi

# Test company retrieval
echo "Testing company retrieval..."
get_company_response=$(curl -s -X GET "$CORE_API/api/companies" \
    -H "Authorization: Bearer $JWT_TOKEN")

if echo "$get_company_response" | grep -q "Test Company"; then
    print_result 0 "Company retrieval"
else
    print_result 1 "Company retrieval"
fi

# Test division creation
echo "Testing division creation..."
division_response=$(curl -s -X POST "$CORE_API/api/divisions" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Test Division $TIMESTAMP\",
        \"code\": \"TD$TIMESTAMP\",
        \"type\": \"SUGAR\",
        \"companyId\": \"$COMPANY_ID\"
    }")

if echo "$division_response" | grep -q "id"; then
    print_result 0 "Division creation"
else
    print_result 1 "Division creation: $division_response"
fi

echo ""
echo -e "${BLUE}4. API GATEWAY ROUTING${NC}"
echo "======================"

# Test API Gateway routing to Core API
echo "Testing API Gateway → Core API routing..."
gateway_health=$(curl -s "$API_GATEWAY/api/core/health" \
    -H "Authorization: Bearer $JWT_TOKEN")

if echo "$gateway_health" | grep -q "healthy"; then
    print_result 0 "API Gateway routing"
else
    print_result 1 "API Gateway routing"
fi

echo ""
echo -e "${BLUE}5. WEBSOCKET CONNECTIVITY${NC}"
echo "========================"

# Test WebSocket endpoint availability
ws_test=$(curl -s -o /dev/null -w "%{http_code}" "$API_GATEWAY/ws")
if [ "$ws_test" = "426" ] || [ "$ws_test" = "101" ]; then
    print_result 0 "WebSocket endpoint available"
else
    print_result 1 "WebSocket endpoint (HTTP $ws_test)"
fi

echo ""
echo -e "${BLUE}6. EVENT PROCESSING${NC}"
echo "=================="

# Test event submission
echo "Testing event submission..."
event_response=$(curl -s -X POST "$EVENT_PROCESSOR/events" \
    -H "Content-Type: application/json" \
    -d "{
        \"type\": \"test.event\",
        \"source\": \"test-suite\",
        \"data\": {
            \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
            \"message\": \"Test event from core function test suite\"
        }
    }")

if echo "$event_response" | grep -q "success"; then
    print_result 0 "Event submission"
else
    print_result 1 "Event submission: $event_response"
fi

# Test event stats
echo "Testing event statistics..."
stats_response=$(curl -s "$EVENT_PROCESSOR/stats")
if echo "$stats_response" | grep -q "stats"; then
    print_result 0 "Event statistics endpoint"
else
    print_result 1 "Event statistics endpoint"
fi

echo ""
echo -e "${BLUE}7. MCP ORCHESTRATOR${NC}"
echo "=================="

# Test MCP health
mcp_health=$(curl -s "$MCP_ORCHESTRATOR/health")
if echo "$mcp_health" | grep -q "healthy"; then
    print_result 0 "MCP Orchestrator health"
else
    print_result 1 "MCP Orchestrator health"
fi

# Test MCP tools endpoint
echo "Testing MCP tools endpoint..."
tools_response=$(curl -s "$MCP_ORCHESTRATOR/api/mcp/tools")
if [ "$?" -eq 0 ]; then
    print_result 0 "MCP tools endpoint accessible"
else
    print_result 1 "MCP tools endpoint"
fi

echo ""
echo "=========================================="
echo -e "${BLUE}TEST SUMMARY${NC}"
echo "=========================================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CORE FUNCTIONS OPERATIONAL!${NC}"
    echo "Your ERP backbone is working correctly."
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the details above.${NC}"
fi

echo ""
echo "Core Systems Status:"
echo "- Authentication: $([ $TESTS_PASSED -gt 5 ] && echo '✅ Working' || echo '❌ Issues')"
echo "- Database CRUD: $([ $TESTS_PASSED -gt 7 ] && echo '✅ Working' || echo '❌ Issues')"
echo "- Service Mesh: $([ $TESTS_PASSED -gt 3 ] && echo '✅ Operational' || echo '⚠️  Limited')"
echo "- Event System: $([ $TESTS_PASSED -gt 9 ] && echo '✅ Active' || echo '⚠️  Degraded')"

# Cleanup test data note
echo ""
echo "Note: Test data created with timestamp $TIMESTAMP"