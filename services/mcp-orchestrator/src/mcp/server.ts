import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { setupMCPTools } from '../tools/index.js';
import pino from 'pino';

const log = pino({ name: 'mcp-server' });

export class MCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'modern-erp-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
          resources: {
            read: true,
            list: true,
          },
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // Setup tools
    setupMCPTools(this.server);

    // Handle prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: 'factory_analysis',
            description: 'Analyze factory performance and provide insights',
            arguments: [
              {
                name: 'timeframe',
                description: 'Time period for analysis (e.g., "last 24 hours", "this week")',
                required: false,
              },
            ],
          },
          {
            name: 'production_optimization',
            description: 'Suggest optimizations for production efficiency',
            arguments: [
              {
                name: 'division',
                description: 'Which division to optimize (SUGAR, ETHANOL, POWER, FEED)',
                required: true,
              },
            ],
          },
        ],
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'factory_analysis') {
        const timeframe = args?.timeframe || 'last 24 hours';
        return {
          prompt: `Analyze the factory performance for ${timeframe}. 
          Use the factory_status tool to get current data, then provide insights on:
          1. Production efficiency across divisions
          2. Equipment health and maintenance needs
          3. Key performance indicators
          4. Recommendations for improvement`,
        };
      }

      if (name === 'production_optimization') {
        const division = args?.division;
        return {
          prompt: `Analyze the ${division} division and suggest optimizations.
          Use the factory_status and production_forecast tools to:
          1. Identify bottlenecks
          2. Suggest process improvements
          3. Recommend maintenance schedules
          4. Optimize resource allocation`,
        };
      }

      throw new Error(`Unknown prompt: ${name}`);
    });

    // Handle resources (factory data access)
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'factory://current/status',
            mimeType: 'application/json',
            name: 'Current Factory Status',
            description: 'Real-time factory operational data',
          },
          {
            uri: 'factory://current/production',
            mimeType: 'application/json',
            name: 'Production Metrics',
            description: 'Current production metrics across all divisions',
          },
        ],
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === 'factory://current/status') {
        // This would fetch real data - simplified for now
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                timestamp: new Date().toISOString(),
                operational: true,
                divisions: ['SUGAR', 'ETHANOL', 'POWER', 'FEED'],
                alerts: [],
              }),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    log.info('MCP Server started');
  }
}

// For standalone MCP server mode
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new MCPServer();
  server.start().catch((error) => {
    log.error('Failed to start MCP server:', error);
    process.exit(1);
  });
}