import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

console.log('Express API Gateway starting...');

const app = express();
const port = parseInt(process.env.PORT || '4000');

// Helper to ensure URL has protocol
const ensureProtocol = (url: string) => {
  if (!url) return url;
  return url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`;
};

// Service URLs - Use Railway internal URLs when available
const services = {
  core: ensureProtocol(process.env.CORE_API_URL) || (process.env.RAILWAY_ENVIRONMENT ? 'http://dynamic-nourishment.railway.internal' : 'http://localhost:3001'),
  mcp: ensureProtocol(process.env.MCP_ORCHESTRATOR_URL) || (process.env.RAILWAY_ENVIRONMENT ? 'http://energetic-vision.railway.internal' : 'http://localhost:3000'),
  eventProcessor: ensureProtocol(process.env.EVENT_PROCESSOR_URL) || (process.env.RAILWAY_ENVIRONMENT ? 'http://incredible-adaptation.railway.internal' : 'http://localhost:3003'),
};

console.log('Service URLs:', services);

// Enable CORS for all origins
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.text());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway-express',
    timestamp: new Date().toISOString(),
    port: port
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'API Gateway is running (Express)',
    timestamp: new Date().toISOString()
  });
});

// Proxy all /api/* requests
app.all('/api/*', async (req, res) => {
  const path = req.path;
  console.log(`Proxying ${req.method} ${path}`);
  
  // Determine which service to forward to
  let serviceUrl = services.core;
  if (path.startsWith('/api/mcp')) {
    serviceUrl = services.mcp;
  }
  
  const targetUrl = `${serviceUrl}${path}`;
  console.log(`Forwarding to: ${targetUrl}`);
  
  try {
    const headers = { ...req.headers };
    delete headers.host; // Remove host header
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers as any,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    });
    
    const data = await response.text();
    
    // Forward response
    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, value);
      }
    });
    
    res.send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(503).json({ error: 'Service unavailable' });
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Express API Gateway listening on port ${port}`);
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});