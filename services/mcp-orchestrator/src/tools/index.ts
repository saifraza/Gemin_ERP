import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { factoryTools } from './factory-tools.js';
import { analyticsTools } from './analytics-tools.js';
import { workflowTools } from './workflow-tools.js';
import { documentTools } from './document-tools.js';
import { voiceTools } from './voice-tools.js';
import { erpHelpTools } from './erp-help-tools.js';

export function setupMCPTools(server: Server) {
  // Register all tool categories
  const allTools = [
    ...factoryTools,
    ...analyticsTools,
    ...workflowTools,
    ...documentTools,
    ...voiceTools,
    ...erpHelpTools,
  ];

  // Create a map of tools for easy lookup
  const toolsMap = new Map(allTools.map(tool => [tool.name, tool]));

  // Handle list tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  // Handle call tool request
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = toolsMap.get(request.params.name);
    if (!tool) {
      throw new Error(`Tool not found: ${request.params.name}`);
    }
    
    const result = await tool.handler({
      arguments: request.params.arguments || {},
    });
    
    return result;
  });

  // Log registered tools
  console.log(`Registered ${allTools.length} MCP tools`);
}