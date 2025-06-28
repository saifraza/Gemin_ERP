#!/bin/bash

echo "🔍 Detailed Railway Service Test"
echo "================================"
echo ""

# Test with increased timeout and verbose output
test_service() {
    local name=$1
    local url=$2
    
    echo "Testing $name..."
    echo "URL: $url"
    
    # Test root endpoint first
    echo -n "  Root endpoint: "
    root_status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 15 "$url/")
    echo "HTTP $root_status"
    
    # Test health endpoint
    echo -n "  Health endpoint: "
    health_response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" --connect-timeout 10 --max-time 15 "$url/health")
    
    # Extract status code
    http_status=$(echo "$health_response" | grep "HTTP_STATUS:" | cut -d: -f2)
    body=$(echo "$health_response" | sed '/HTTP_STATUS:/d')
    
    echo "HTTP $http_status"
    
    if [ "$http_status" == "200" ]; then
        echo "  Response:"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo "  Error: $body"
    fi
    
    echo ""
}

# Test each service
test_service "Core API" "https://core-api-production-76b9.up.railway.app"
test_service "API Gateway" "https://api-gateway-production-00e9.up.railway.app"
test_service "MCP Orchestrator" "https://mcp-orchestrator-production.up.railway.app"
test_service "Event Processor" "https://event-processor-production.up.railway.app"
test_service "Web Frontend" "https://web-production-66cf.up.railway.app"

echo "📊 Summary"
echo "========="
echo ""
echo "If you're seeing 502 errors:"
echo "1. Check Railway dashboard - services might still be building"
echo "2. Check deployment logs for startup errors"
echo "3. Verify environment variables are set"
echo "4. Wait 2-3 minutes for services to fully start"
echo ""
echo "Redis errors in logs are NORMAL and expected!"