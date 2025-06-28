#!/bin/bash

echo "🚀 Quick Railway Service Test"
echo "============================"
echo ""

# Test each health endpoint
echo "1. Core API Health:"
curl -s https://core-api-production-76b9.up.railway.app/health | jq '.' 2>/dev/null || curl -s https://core-api-production-76b9.up.railway.app/health
echo ""

echo "2. API Gateway Health:"
curl -s https://api-gateway-production-00e9.up.railway.app/health | jq '.' 2>/dev/null || curl -s https://api-gateway-production-00e9.up.railway.app/health
echo ""

echo "3. MCP Orchestrator Health:"
curl -s https://mcp-orchestrator-production.up.railway.app/health | jq '.' 2>/dev/null || curl -s https://mcp-orchestrator-production.up.railway.app/health
echo ""

echo "4. Event Processor Health:"
curl -s https://event-processor-production.up.railway.app/health | jq '.' 2>/dev/null || curl -s https://event-processor-production.up.railway.app/health
echo ""

echo "5. Web Frontend Status:"
status=$(curl -s -o /dev/null -w "%{http_code}" https://web-production-66cf.up.railway.app/)
echo "HTTP Status: $status"