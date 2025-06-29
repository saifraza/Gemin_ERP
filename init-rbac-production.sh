#!/bin/bash

# Initialize RBAC tables in production

echo "🔧 Initializing RBAC tables in production..."

# Your API Gateway URL
API_URL="https://api-gateway-production-00e9.up.railway.app"

# Step 1: Check current status
echo -e "\n📊 Checking RBAC status..."
curl -X GET "$API_URL/api/rbac-init/status" | jq .

# Step 2: Initialize RBAC tables
echo -e "\n🏗️  Creating RBAC tables..."
curl -X POST "$API_URL/api/rbac-init/init" \
  -H "Content-Type: application/json" | jq .

# Step 3: Seed RBAC data
echo -e "\n🌱 Seeding RBAC data..."
curl -X POST "$API_URL/api/rbac-init/seed" \
  -H "Content-Type: application/json" | jq .

# Step 4: Check final status
echo -e "\n✅ Checking final status..."
curl -X GET "$API_URL/api/rbac-init/status" | jq .

echo -e "\n🎉 RBAC initialization completed!"