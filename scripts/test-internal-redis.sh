#!/bin/bash

# Test Redis Internal Connection
echo "🔴 Testing Redis Internal Connection"
echo "===================================="
echo ""

# Service URL
CORE_API="https://core-api-production-76b9.up.railway.app"

# Get Redis debug info
echo "Fetching Redis connection details..."
REDIS_DEBUG=$(curl -s "$CORE_API/api/test/redis-debug")

echo "Redis Configuration:"
echo "$REDIS_DEBUG" | jq '.'

echo ""
echo "Analysis:"
echo "---------"

# Check if internal URL is being used
if echo "$REDIS_DEBUG" | grep -q "redis.railway.internal"; then
    echo "✓ Using internal Redis URL (good!)"
    echo "✗ But connection is failing"
    echo ""
    echo "This suggests DNS resolution issue with internal networking"
fi

echo ""
echo "Possible Solutions:"
echo "1. Wait a few minutes - internal DNS can take time to propagate"
echo "2. Restart the services in Railway"
echo "3. Check if Redis and services are in the same Railway environment"
echo "4. Consider MongoDB as alternative (as you suggested)"