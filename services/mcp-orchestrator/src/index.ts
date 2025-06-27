import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { setupMCPTools } from './tools/index.js';
import { EventBus } from './events/event-bus.js';
import { LLMRouter } from './llm/router.js';
import { createMCPRoutes } from './routes/mcp.js';
import { createEventRoutes } from './routes/events.js';
import { KafkaConsumer } from './events/kafka-consumer.js';
import pino from 'pino';

const log = pino({ name: 'mcp-orchestrator' });

// Initialize MCP Server for direct MCP protocol connections
const mcpServer = new Server(
  {
    name: 'modern-erp-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// Initialize HTTP/WebSocket server for web clients
const app = new Hono();
const httpServer = createServer(app.fetch);
const wss = new WebSocketServer({ server: httpServer });

// Initialize event bus and LLM router
const eventBus = new EventBus();
const llmRouter = new LLMRouter();
const kafkaConsumer = new KafkaConsumer(eventBus);

// Middleware
app.use('*', cors());
app.use('*', logger());

// Health check
app.get('/health', (c) => c.json({ status: 'healthy', service: 'mcp-orchestrator' }));

// Setup routes
app.route('/api/mcp', createMCPRoutes(mcpServer, llmRouter, eventBus));
app.route('/api/events', createEventRoutes(eventBus));

// WebSocket handling for real-time AI interactions
wss.on('connection', (ws) => {
  log.info('New WebSocket connection');
  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      // Handle different message types
      switch (message.type) {
        case 'chat':
          const response = await llmRouter.chat(message.payload);
          ws.send(JSON.stringify({ type: 'response', data: response }));
          break;
          
        case 'tool':
          const toolResult = await mcpServer.handleToolCall(message.payload);
          ws.send(JSON.stringify({ type: 'tool_result', data: toolResult }));
          break;
          
        case 'subscribe':
          eventBus.subscribe(message.channel, (event) => {
            ws.send(JSON.stringify({ type: 'event', data: event }));
          });
          break;
      }
    } catch (error) {
      log.error(error, 'WebSocket message handling error');
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });
});

// Setup MCP tools
setupMCPTools(mcpServer);

// Start services
async function start() {
  // Start MCP server (for direct MCP protocol connections)
  if (process.env.MCP_TRANSPORT === 'stdio') {
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    log.info('MCP Server started with stdio transport');
  }
  
  // Start Kafka consumer
  await kafkaConsumer.start();
  
  // Start HTTP/WebSocket server
  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    log.info(`MCP Orchestrator running on http://localhost:${port}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  log.info('Shutting down gracefully...');
  await kafkaConsumer.stop();
  httpServer.close();
  process.exit(0);
});

start().catch((error) => {
  log.error(error, 'Failed to start MCP Orchestrator');
  process.exit(1);
});