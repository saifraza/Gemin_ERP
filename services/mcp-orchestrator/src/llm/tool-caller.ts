import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { factoryTools } from '../tools/factory-tools.js';
import { procurementTools } from '../tools/procurement-tools.js';
import { analyticsTools } from '../tools/analytics-tools.js';
import { erpHelpTools } from '../tools/erp-help-tools.js';
import pino from 'pino';

const log = pino({ name: 'tool-caller' });

interface Tool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (request: any) => Promise<any>;
}

export class ToolCaller {
  private anthropic: Anthropic;
  private openai: OpenAI;
  private tools: Map<string, Tool>;

  constructor() {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
    
    // Register all tools
    this.tools = new Map();
    const allTools = [...factoryTools, ...procurementTools, ...analyticsTools, ...erpHelpTools];
    allTools.forEach(tool => {
      this.tools.set(tool.name, tool);
    });
  }

  // Convert our tools to Claude's format
  private getClaudeTools() {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: {
        type: 'object',
        properties: tool.inputSchema?._def?.shape || {},
        required: tool.inputSchema?._def?.required || [],
      },
    }));
  }

  // Convert our tools to OpenAI's format
  private getOpenAITools() {
    return Array.from(this.tools.values()).map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties: tool.inputSchema?._def?.shape || {},
          required: tool.inputSchema?._def?.required || [],
        },
      },
    }));
  }

  async callWithClaude(prompt: string, context?: any): Promise<any> {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      
      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4096,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        tools: this.getClaudeTools(),
      });

      // Handle tool calls
      if (response.content[0].type === 'tool_use') {
        const toolCall = response.content[0];
        const tool = this.tools.get(toolCall.name);
        
        if (tool) {
          log.info({ tool: toolCall.name, input: toolCall.input }, 'Executing tool');
          const result = await tool.handler({ arguments: toolCall.input });
          
          // Send tool result back to Claude
          const followUp = await this.anthropic.messages.create({
            model: 'claude-3-opus-20240229',
            max_tokens: 4096,
            system: systemPrompt,
            messages: [
              { role: 'user', content: prompt },
              { role: 'assistant', content: response.content },
              {
                role: 'user',
                content: [
                  {
                    type: 'tool_result',
                    tool_use_id: toolCall.id,
                    content: JSON.stringify(result.content[0].text),
                  },
                ],
              },
            ],
          });

          return {
            response: followUp.content[0].type === 'text' ? followUp.content[0].text : '',
            toolsUsed: [{ name: toolCall.name, input: toolCall.input, result }],
            usage: {
              promptTokens: response.usage.input_tokens + followUp.usage.input_tokens,
              completionTokens: response.usage.output_tokens + followUp.usage.output_tokens,
            },
          };
        }
      }

      // No tool calls, just return the response
      return {
        response: response.content[0].type === 'text' ? response.content[0].text : '',
        toolsUsed: [],
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
        },
      };
    } catch (error) {
      log.error(error, 'Claude tool calling failed');
      throw error;
    }
  }

  async callWithGPT4(prompt: string, context?: any): Promise<any> {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        tools: this.getOpenAITools(),
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 4096,
      });

      const message = response.choices[0].message;
      
      // Handle tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        const toolResults = [];
        
        for (const toolCall of message.tool_calls) {
          const tool = this.tools.get(toolCall.function.name);
          if (tool) {
            log.info({ tool: toolCall.function.name, args: toolCall.function.arguments }, 'Executing tool');
            const args = JSON.parse(toolCall.function.arguments);
            const result = await tool.handler({ arguments: args });
            toolResults.push({
              tool_call_id: toolCall.id,
              role: 'tool' as const,
              content: JSON.stringify(result.content[0].text),
            });
          }
        }

        // Send tool results back
        const followUp = await this.openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
            message,
            ...toolResults,
          ],
          temperature: 0.7,
          max_tokens: 4096,
        });

        return {
          response: followUp.choices[0].message.content,
          toolsUsed: message.tool_calls.map(tc => ({
            name: tc.function.name,
            input: JSON.parse(tc.function.arguments),
          })),
          usage: {
            promptTokens: (response.usage?.prompt_tokens || 0) + (followUp.usage?.prompt_tokens || 0),
            completionTokens: (response.usage?.completion_tokens || 0) + (followUp.usage?.completion_tokens || 0),
          },
        };
      }

      // No tool calls
      return {
        response: message.content,
        toolsUsed: [],
        usage: response.usage,
      };
    } catch (error) {
      log.error(error, 'GPT-4 tool calling failed');
      throw error;
    }
  }

  private buildSystemPrompt(context?: any): string {
    let prompt = `You are an AI assistant for a modern sugar, ethanol, power, and animal feed factory ERP system.
You have access to various tools to fetch real-time data and perform operations.

IMPORTANT: You can help users with:
1. How-to questions: Use the 'erp_help' tool to provide step-by-step guides
2. User management: Use 'user_management' tool to list, create, update users
3. Navigation: Use 'navigation_guide' tool to help users find features
4. Factory operations: Use 'factory_status' and other tools for real-time data

For questions like "How do I create a user?", always use the erp_help tool first.`;

    if (context?.company) {
      prompt += `\n\nCurrent Context:`;
      prompt += `\nCompany: ${context.company}`;
      if (context.user) {
        prompt += `\nUser: ${context.user.name} (Role: ${context.user.role})`;
      }
      if (context.currentFactory) {
        prompt += `\nFactory: ${context.currentFactory}`;
      }
    }

    prompt += `\n\nGuidelines:
1. For "how to" questions, use erp_help tool
2. For user operations, use user_management tool
3. For finding features, use navigation_guide tool
4. For factory data, use factory_status tool
5. Always provide clear, step-by-step instructions
6. Respect user permissions based on their role`;

    return prompt;
  }
}