#!/bin/bash

echo "⏳ Please wait for Railway to deploy the latest changes..."
echo "   You can check the deployment status at: https://railway.app"
echo ""
echo "Once the deployment is complete (usually 1-2 minutes), press Enter to continue..."
read

echo "🔧 Initializing RBAC tables in production..."

# Your API Gateway URL
API_URL="https://api-gateway-production-00e9.up.railway.app"

# Step 1: Initialize RBAC tables
echo -e "\n🏗️  Creating RBAC tables..."
response=$(curl -s -X POST "$API_URL/api/rbac-init/init" -H "Content-Type: application/json")
echo "$response" | jq .

if echo "$response" | grep -q "successfully"; then
    echo -e "\n✅ Tables created successfully!"
    
    # Step 2: Seed RBAC data
    echo -e "\n🌱 Seeding RBAC data..."
    seed_response=$(curl -s -X POST "$API_URL/api/rbac-init/seed" -H "Content-Type: application/json")
    echo "$seed_response" | jq .
    
    if echo "$seed_response" | grep -q "successfully"; then
        echo -e "\n✅ RBAC data seeded successfully!"
    fi
else
    echo -e "\n❌ Failed to create tables. The response was:"
    echo "$response"
fi

# Step 3: Check final status
echo -e "\n📊 Final RBAC status:"
curl -s "$API_URL/api/rbac-init/status" | jq .

echo -e "\n🎉 RBAC initialization process completed!"