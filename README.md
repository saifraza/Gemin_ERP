# Modern ERP - Next-Generation Factory Intelligence Platform

## 🚀 Overview

A cutting-edge ERP system built with AI-first architecture, event-driven microservices, and real-time capabilities for modern factories in Sugar, Ethanol, Power, and Animal Feed industries.

## 🏗️ Architecture

### Core Principles
- **Event-Driven Architecture** - Every action triggers events processed by AI
- **MCP at the Core** - Model Context Protocol orchestrates all AI interactions
- **Multi-Model AI** - Intelligent routing between Gemini, Claude, and GPT-4
- **Real-Time Everything** - WebSockets and Server-Sent Events for instant updates
- **Edge Computing** - Local processing for hardware with cloud sync
- **Digital Twin** - 3D factory simulation with predictive analytics

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS, Shadcn/ui
- **Backend**: Bun + Hono microservices, Event-driven with Kafka/Redpanda
- **AI/MCP**: Central MCP orchestrator with multi-model support
- **Databases**: PostgreSQL, TimescaleDB, Redis, ClickHouse
- **Infrastructure**: Docker, Kubernetes, Railway
- **Monitoring**: Grafana, Prometheus, OpenTelemetry

## 🛠️ Setup

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker Desktop
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/modern-erp.git
cd modern-erp

# Install dependencies
pnpm install

# Start infrastructure services
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Set up environment variables
cp .env.example .env.local

# Start development servers
pnpm dev
```

### Environment Variables

Create `.env.local` in the root:

```env
# Database
DATABASE_URL="postgresql://erp_user:secure_password@localhost:5432/modern_erp"
TIMESCALE_URL="postgresql://timescale_user:secure_password@localhost:5433/erp_timeseries"

# Redis
REDIS_URL="redis://:secure_password@localhost:6379"

# Kafka/Redpanda
KAFKA_BROKERS="localhost:9092"

# AI Models
GEMINI_API_KEY="your-gemini-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
OPENAI_API_KEY="your-openai-api-key"

# MCP Configuration
MCP_TRANSPORT="http" # or "stdio" for CLI usage
MCP_PORT=3000

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
NEXT_PUBLIC_MCP_URL="http://localhost:3000"
```

## 🏃‍♂️ Running Services

### Development Mode

```bash
# Start all services
pnpm dev

# Start specific services
pnpm dev --filter @modern-erp/web        # Frontend only
pnpm dev --filter @modern-erp/mcp-orchestrator  # MCP server only
pnpm dev --filter @modern-erp/core-erp   # Core API only

# Start infrastructure
pnpm kafka:start    # Start Kafka/Redpanda
pnpm services:up    # Start all Docker services
```

### Production Build

```bash
# Build all services
pnpm build

# Build for production
pnpm build --filter @modern-erp/web
pnpm build --filter @modern-erp/mcp-orchestrator

# Start production servers
pnpm start
```

## 🤖 MCP Integration

The MCP orchestrator is the AI brain of the system. It can be accessed in multiple ways:

### 1. HTTP API (for web clients)
```bash
POST http://localhost:3000/api/mcp/chat
{
  "prompt": "Get current factory status",
  "model": "auto",  // or "gemini", "claude", "gpt4"
  "context": {}
}
```

### 2. WebSocket (for real-time)
```javascript
const ws = new WebSocket('ws://localhost:3000');
ws.send(JSON.stringify({
  type: 'chat',
  payload: { prompt: 'Monitor sugar production' }
}));
```

### 3. Direct MCP Protocol (for Claude Desktop)
Add to Claude Desktop config:
```json
{
  "mcpServers": {
    "modern-erp": {
      "command": "node",
      "args": ["/path/to/modern-erp/services/mcp-orchestrator/dist/index.js"],
      "env": {
        "MCP_TRANSPORT": "stdio"
      }
    }
  }
}
```

## 📱 Key Features

### AI-Powered Operations
- **Voice Commands**: "Hey ERP, what's today's ethanol production?"
- **Predictive Maintenance**: AI detects anomalies before failures
- **Smart Procurement**: Automated vendor selection and RFQ generation
- **Document Intelligence**: Extract data from invoices, POs automatically

### Real-Time Monitoring
- **Digital Twin**: 3D visualization of factory operations
- **Live Dashboards**: Production metrics updated every second
- **Alert System**: Intelligent alerts with recommended actions
- **Mobile App**: Full functionality on mobile devices

### Event-Driven Workflows
- Every action publishes events
- AI subscribes to relevant events
- Automated decision making
- Human-in-the-loop when needed

## 🚀 Deployment

### Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init

# Deploy all services
railway up

# Deploy specific service
cd services/mcp-orchestrator && railway up
```

### Kubernetes Deployment

```bash
# Apply configurations
kubectl apply -f infrastructure/k8s/

# Check deployment status
kubectl get pods -n modern-erp

# View logs
kubectl logs -f deployment/mcp-orchestrator -n modern-erp
```

## 📊 Monitoring

- **Grafana**: http://localhost:3005 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686
- **ClickHouse**: http://localhost:8123

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific tests
pnpm test --filter @modern-erp/mcp-orchestrator

# E2E tests
pnpm test:e2e

# Load testing
pnpm test:load
```

## 📦 Project Structure

```
modern-erp/
├── apps/
│   ├── web/                 # Next.js frontend
│   ├── mobile/              # React Native app
│   └── api-gateway/         # Kong configuration
├── services/
│   ├── core-erp/           # Core business logic
│   ├── factory-ops/        # Factory operations
│   ├── mcp-orchestrator/   # AI orchestration
│   ├── event-processor/    # Event handling
│   └── analytics-engine/   # Real-time analytics
├── packages/
│   ├── shared-types/       # TypeScript types
│   ├── event-schemas/      # Event definitions
│   └── ui-components/      # Shared UI library
└── infrastructure/
    ├── docker/             # Docker configs
    ├── k8s/               # Kubernetes configs
    └── terraform/         # Infrastructure as Code
```

## 🔧 Advanced Configuration

### Multi-Model AI Setup
The system intelligently routes requests to the best AI model:
- **Gemini**: Vision tasks, Indian context, long documents
- **Claude**: Complex reasoning, code generation, safety
- **GPT-4**: Tool use, function calling, general tasks

### Event Topics
- `erp.production.*` - Production events
- `erp.equipment.*` - Equipment status
- `erp.quality.*` - Quality control
- `erp.procurement.*` - Procurement workflow
- `erp.ai.*` - AI decisions and insights

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is proprietary software for Mahakaushal Sugar and Power Industries Ltd.

## 🆘 Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: tech@mspil.in

---

Built with ❤️ for the future of factory operations