#!/bin/bash

echo "🚂 Railway Services Checker"
echo "=========================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run:"
    echo "   railway login"
    exit 1
fi

echo "✅ Railway CLI is ready"
echo ""

# List all services in the current project
echo "📦 Services in your Railway project:"
echo "-----------------------------------"
railway status

echo ""
echo "🔍 Detailed service information:"
echo "--------------------------------"

# Get more details about each service
railway list

echo ""
echo "🌐 Environment Variables Status:"
echo "--------------------------------"
# Check if key env vars are set
railway variables

echo ""
echo "📊 Expected Services for Modern ERP:"
echo "-----------------------------------"
echo "✓ PostgreSQL Database"
echo "✓ Redis Cache"
echo "✓ API Gateway (Port 8080)"
echo "✓ Core API (Port 3001)"
echo "✓ MCP Orchestrator (Port 3000)"
echo "✓ Web Frontend (Port 3000)"
echo ""
echo "Optional/Future Services:"
echo "- Kafka/Redpanda"
echo "- TimescaleDB"
echo "- ClickHouse"
echo "- Factory Ops Service"
echo "- Analytics Engine"
echo ""

echo "💡 To create missing services:"
echo "------------------------------"
echo "1. PostgreSQL:    railway add --plugin postgresql"
echo "2. Redis:         railway add --plugin redis"
echo "3. For each app:  railway up (from service directory)"

echo ""
echo "🔗 Useful Railway commands:"
echo "--------------------------"
echo "railway logs --service <service-name>  # View logs"
echo "railway run <command>                  # Run command in Railway env"
echo "railway open                           # Open project in browser"
echo "railway domain                         # Manage custom domains"