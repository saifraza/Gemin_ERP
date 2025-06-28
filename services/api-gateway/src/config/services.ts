// Service configuration with Railway internal URLs
export const serviceUrls = {
  core: process.env.CORE_API_URL || 'http://dynamic-nourishment.railway.internal',
  mcp: process.env.MCP_ORCHESTRATOR_URL || 'http://energetic-vision.railway.internal',
  event: process.env.EVENT_PROCESSOR_URL || 'http://incredible-adaptation.railway.internal',
  factory: process.env.FACTORY_API_URL || 'http://localhost:3002',
  analytics: process.env.ANALYTICS_API_URL || 'http://localhost:3003',
};

// Health check endpoints
export const healthEndpoints = {
  core: '/health',
  mcp: '/health',
  event: '/health',
  factory: '/health',
  analytics: '/health',
};

// Service timeout configuration
export const serviceTimeouts = {
  health: 2000, // 2 seconds for health checks
  default: 30000, // 30 seconds for normal requests
  upload: 300000, // 5 minutes for file uploads
};