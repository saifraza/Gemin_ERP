import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { WebSocketServer } from 'ws';
import { EventBus } from './events/event-bus.js';
import { LLMRouter } from './llm/router.js';
import { createMCPRoutes } from './routes/mcp.js';
import { createEventRoutes } from './routes/events.js';
import { KafkaConsumer } from './events/kafka-consumer.js';
import pino from 'pino';

const log = pino({ name: 'mcp-orchestrator' });

// Log environment variables (without exposing keys)
log.info({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  hasDatabase: !!process.env.DATABASE_URL,
  hasJWT: !!process.env.JWT_SECRET,
  apiKeys: {
    GEMINI: process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 'NOT SET',
    ANTHROPIC: process.env.ANTHROPIC_API_KEY ? `${process.env.ANTHROPIC_API_KEY.substring(0, 10)}...` : 'NOT SET',
    OPENAI: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'NOT SET',
    DEEPSEEK: process.env.DEEPSEEK_API_KEY ? `${process.env.DEEPSEEK_API_KEY.substring(0, 10)}...` : 'NOT SET',
  }
}, 'MCP Orchestrator starting with environment');

// Initialize app
const app = new Hono();
let server: any;
let wss: WebSocketServer;

// Initialize event bus and LLM router
const eventBus = new EventBus();
const llmRouter = new LLMRouter();

// Initialize Kafka consumer with proper error handling
let kafkaConsumer: KafkaConsumer | null = null;

async function initializeKafkaConsumer() {
  try {
    kafkaConsumer = new KafkaConsumer(eventBus);
    await kafkaConsumer.start();
    log.info('Kafka consumer started successfully');
  } catch (error) {
    log.error('Failed to start Kafka consumer, continuing without it:', error);
    // Continue running without Kafka - not critical for basic operation
  }
}

// Middleware
app.use('*', cors());
app.use('*', logger());

// Health check
app.get('/health', (c) => c.json({ status: 'healthy', service: 'mcp-orchestrator' }));

// Mount routes
app.route('/api/mcp', createMCPRoutes(llmRouter, eventBus));
app.route('/api/events', createEventRoutes(eventBus));

// WebSocket handling
function setupWebSocketServer() {
  if (!server) return;
  
  wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws) => {
  log.info('WebSocket client connected');
  
  // Subscribe to events
  const unsubscribe = eventBus.subscribe('*', (event) => {
    ws.send(JSON.stringify(event));
  });
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'subscribe') {
        // Handle subscription requests
        log.info(`Client subscribed to: ${data.topic}`);
      } else if (data.type === 'tool') {
        // Handle tool execution requests
        const result = await llmRouter.executeTool(data.tool, data.arguments);
        ws.send(JSON.stringify({ type: 'tool_result', result }));
      }
    } catch (error) {
      log.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });
  
  ws.on('close', () => {
    log.info('WebSocket client disconnected');
    unsubscribe();
  });
  });
}

// Start server
const PORT = process.env.PORT || 3001;

server = serve({
  fetch: app.fetch,
  port: Number(PORT),
  hostname: '::', // Bind to IPv6 for Railway internal networking
}, () => {
  log.info(`MCP Orchestrator running on http://[::]:${PORT} (IPv6)`);
  setupWebSocketServer();
  log.info(`WebSocket server running on ws://[::]:${PORT} (IPv6)`);
  
  // Initialize Kafka consumer after server starts
  initializeKafkaConsumer().catch(error => {
    log.error('Error initializing Kafka consumer:', error);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  log.info('SIGTERM received, shutting down gracefully');
  
  if (kafkaConsumer) {
    await kafkaConsumer.stop();
  }
  
  if (wss) {
    wss.close();
  }
  
  // Cleanup event bus
  await eventBus.cleanup();
  
  log.info('Shutdown complete');
  process.exit(0);
});