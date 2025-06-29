import express from 'express';
import cors from 'cors';
import compression from 'compression';
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
console.log('Environment:', {
  RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
  PORT: process.env.PORT,
  CORE_API_URL: process.env.CORE_API_URL,
  NODE_ENV: process.env.NODE_ENV
});

// Enable compression for all responses
app.use(compression());

// Enable CORS for all origins
app.use(cors({
  origin: true,
  credentials: true
}));

// Performance monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[PERFORMANCE] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    
    if (duration > 1000) {
      console.warn(`[PERFORMANCE WARNING] Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
});

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

// Test direct connection to core-api
app.get('/test-core-direct', async (req, res) => {
  const tests = [];
  
  // Test different URL formats
  const urlsToTest = [
    'http://core-api.railway.internal/health',
    'http://core-api.railway.internal:80/health',
    'http://core-api.railway.internal:8080/health',
    'http://core-api:8080/health',
    'http://[::1]:8080/health', // IPv6 localhost
  ];
  
  for (const url of urlsToTest) {
    try {
      console.log(`Testing: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        timeout: 3000,
        signal: AbortSignal.timeout(3000)
      });
      tests.push({
        url,
        success: true,
        status: response.status,
        data: await response.text()
      });
    } catch (error: any) {
      tests.push({
        url,
        success: false,
        error: error.message,
        code: error.code,
        errno: error.errno
      });
    }
  }
  
  res.json({ tests });
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
  let forwardPath = path;
  
  // Special handling for service health checks
  if (path === '/api/core/health') {
    serviceUrl = services.core;
    forwardPath = '/health';
  } else if (path === '/api/mcp/health') {
    serviceUrl = services.mcp;
    forwardPath = '/health';
  } else if (path === '/api/event-processor/health') {
    serviceUrl = services.eventProcessor;
    forwardPath = '/health';
  } else if (path.startsWith('/api/mcp')) {
    serviceUrl = services.mcp;
  }
  
  if (!serviceUrl) {
    return res.status(503).json({ 
      error: 'Service not configured',
      message: 'Service URL not provided in environment variables'
    });
  }
  
  const targetUrl = `${serviceUrl}${forwardPath}`;
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