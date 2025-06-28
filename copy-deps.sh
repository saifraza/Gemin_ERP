#!/bin/bash

# Copy shared dependencies to each service for independent deployment

echo "Copying shared dependencies..."

# Copy to core-api
cp -r packages/shared-types services/core-api/
cp -r packages/database services/core-api/

# Copy to mcp-orchestrator
cp -r packages/shared-types services/mcp-orchestrator/
cp -r packages/database services/mcp-orchestrator/

# Copy to api-gateway
cp -r packages/shared-types services/api-gateway/

echo "Done! Each service now has its dependencies."