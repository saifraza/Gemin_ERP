#!/bin/bash

# Script to run Prisma migrations
echo "Running Prisma migrations..."

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

echo "Migrations completed!"