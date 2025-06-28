import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

console.log(`[EXPRESS] Starting with PORT: ${PORT}`);

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Core API Express Test - Working!');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'core-api-express',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[EXPRESS] Server running on http://0.0.0.0:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('[EXPRESS] SIGTERM received');
  server.close(() => {
    console.log('[EXPRESS] Server closed');
    process.exit(0);
  });
});