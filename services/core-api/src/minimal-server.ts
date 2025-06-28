// Minimal test server for Railway debugging
import http from 'http';

const PORT = process.env.PORT || 3000;

console.log(`[STARTUP] Environment PORT: ${process.env.PORT}`);
console.log(`[STARTUP] Will listen on port: ${PORT}`);

const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} from ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`);
  
  // Log all headers for debugging
  console.log('[HEADERS]', JSON.stringify(req.headers, null, 2));
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'core-api-minimal',
      port: PORT,
      timestamp: timestamp
    }));
  } else if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Core API Minimal - Running on port ${PORT}`);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(parseInt(PORT as string), '0.0.0.0', () => {
  console.log(`[SUCCESS] Server is listening on 0.0.0.0:${PORT}`);
  console.log(`[SUCCESS] Health check available at http://0.0.0.0:${PORT}/health`);
});

// Handle errors
server.on('error', (err) => {
  console.error('[ERROR] Server error:', err);
});

process.on('SIGTERM', () => {
  console.log('[SHUTDOWN] SIGTERM received, closing server...');
  server.close(() => {
    console.log('[SHUTDOWN] Server closed');
    process.exit(0);
  });
});