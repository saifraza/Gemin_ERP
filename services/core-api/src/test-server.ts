// Ultra-simple test server to verify Railway can start a basic Node service
import http from 'http';

const port = parseInt(process.env.PORT || '3000');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'core-api-test',
      port: port,
      timestamp: new Date().toISOString(),
      env: {
        PORT: process.env.PORT,
        NODE_ENV: process.env.NODE_ENV,
        hasRedis: !!process.env.REDIS_URL,
        hasDB: !!process.env.DATABASE_URL
      }
    }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Core API Test Server Running');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Test server listening on 0.0.0.0:${port}`);
  console.log('Environment:', {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    REDIS_URL: process.env.REDIS_URL ? 'Set' : 'Not set',
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set'
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => {
    process.exit(0);
  });
});