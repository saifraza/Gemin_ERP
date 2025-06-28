#!/bin/bash

# Test LLM Integration Script
# This script tests the multi-LLM integration in the MCP Orchestrator

API_URL="${API_GATEWAY_URL:-https://api-gateway-production-00e9.up.railway.app}"
MCP_URL="${API_URL}"

echo "🤖 Testing Multi-LLM Integration"
echo "================================"
echo "API Gateway URL: $API_URL"
echo ""

# Function to test a specific model
test_model() {
    local model=$1
    local prompt=$2
    
    echo "📝 Testing $model with prompt: \"$prompt\""
    
    response=$(curl -s -X POST "$MCP_URL/api/mcp/test-llm" \
        -H "Content-Type: application/json" \
        -d "{\"model\": \"$model\", \"prompt\": \"$prompt\"}")
    
    if [ $? -eq 0 ]; then
        success=$(echo "$response" | grep -o '"success":[^,}]*' | sed 's/"success"://g')
        if [ "$success" = "true" ]; then
            echo "✅ Success!"
            echo "$response" | jq '.'
        else
            echo "❌ Failed!"
            echo "$response" | jq '.'
        fi
    else
        echo "❌ Request failed!"
    fi
    echo ""
}

# Test 1: List available models
echo "📋 Getting available models..."
curl -s "$MCP_URL/api/mcp/models" | jq '.'
echo ""

# Test 2: Test Gemini
test_model "gemini" "What is the sugar production capacity for a typical 5000 TCD sugar factory?"

# Test 3: Test Claude
test_model "claude" "Analyze the efficiency of a sugar factory with 90% recovery rate"

# Test 4: Test GPT-4
test_model "gpt4" "List the main components of a sugar factory ERP system"

# Test 5: Test auto-selection with Indian context
test_model "auto" "Calculate GST on ₹50,000 worth of sugar at 5% rate"

# Test 6: Test auto-selection with code request
test_model "auto" "Write a function to calculate ethanol yield from sugarcane"

# Test 7: Test factory status tool
echo "🏭 Testing factory status tool..."
curl -s -X POST "$MCP_URL/api/mcp/tools/execute" \
    -H "Content-Type: application/json" \
    -d '{"tool": "factory_status", "input": {"division": "ALL", "timeRange": "24h"}}' | jq '.'

echo ""
echo "✅ LLM Integration tests complete!"
echo ""
echo "📝 Next steps:"
echo "1. If any tests failed, check that API keys are set in Railway"
echo "2. Visit your dashboard and try the AI Chat component"
echo "3. Ask questions like:"
echo "   - 'What is the current factory status?'"
echo "   - 'Show me production data for sugar division'"
echo "   - 'Analyze equipment efficiency'"