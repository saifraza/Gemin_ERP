import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { factoryTools } from './factory-tools.js';
import { procurementTools } from './procurement-tools.js';
import { analyticsTools } from './analytics-tools.js';
import { workflowTools } from './workflow-tools.js';
import { documentTools } from './document-tools.js';
import { voiceTools } from './voice-tools.js';

export function setupMCPTools(server: Server) {
  // Register all tool categories
  const allTools = [
    ...factoryTools,
    ...procurementTools,
    ...analyticsTools,
    ...workflowTools,
    ...documentTools,
    ...voiceTools,
  ];

  allTools.forEach((tool) => {
    server.setRequestHandler(tool.handler);
  });

  // Log registered tools
  console.log(`Registered ${allTools.length} MCP tools`);
}