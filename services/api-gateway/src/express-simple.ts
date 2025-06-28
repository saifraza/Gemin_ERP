import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

console.log('Express API Gateway starting...');

const app = express();
const port = parseInt(process.env.PORT || '4000');

// Helper to ensure URL has protocol
const ensureProtocol = (url: string | undefined) => {
  if (!url) return undefined;
  // Trim any whitespace
  url = url.trim();
  // Add http:// if no protocol specified
  return url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`;
};

// Service URLs - Use environment variables provided by Railway
const services = {
  core: ensureProtocol(process.env.CORE_API_URL),
  mcp: ensureProtocol(process.env.MCP_ORCHESTRATOR_URL),
  eventProcessor: ensureProtocol(process.env.EVENT_PROCESSOR_URL),
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

// Test internal connectivity
app.get('/test-services', async (req, res) => {
  const results = {};
  
  for (const [name, url] of Object.entries(services)) {
    try {
      console.log(`Testing ${name} at ${url}`);
      const response = await fetch(`${url}/health`, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      results[name] = {
        url,
        status: response.status,
        ok: response.ok,
        data: await response.text()
      };
    } catch (error: any) {
      results[name] = {
        url,
        error: error.message,
        type: error.constructor.name
      };
    }
  }
  
  res.json({
    services: results,
    environment: {
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      NODE_ENV: process.env.NODE_ENV,
      configured: {
        CORE_API_URL: process.env.CORE_API_URL,
        MCP_ORCHESTRATOR_URL: process.env.MCP_ORCHESTRATOR_URL
      }
    }
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
  
  if (!serviceUrl) {
    return res.status(503).json({ 
      error: 'Service not configured',
      message: 'Service URL not provided in environment variables'
    });
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
  } catch (error: any) {
    console.error('Proxy error:', error);
    console.error('Failed to reach:', targetUrl);
    console.error('Error details:', error.message);
    res.status(503).json({ 
      error: 'Service unavailable',
      service: serviceUrl,
      target: targetUrl,
      message: error.message
    });
  }
});

// Start server
app.listen(port, '::', () => {
  console.log(`Express API Gateway listening on port ${port} (IPv6)`);
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});