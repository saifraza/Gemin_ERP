#!/bin/bash

echo "🌱 Seeding RBAC data..."

API_URL="https://api-gateway-production-00e9.up.railway.app"

# Seed RBAC data
response=$(curl -s -X POST "$API_URL/api/rbac-init/seed" -H "Content-Type: application/json")
echo "$response" | jq .

# Check status
echo -e "\n📊 RBAC Status:"
curl -s "$API_URL/api/rbac-init/status" | jq .

echo -e "\n✅ Done!"