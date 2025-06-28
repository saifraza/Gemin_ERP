import { GoogleGenerativeAI } from '@google/generative-ai';
import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { ToolCaller } from './tool-caller.js';
import { TokenOptimizer } from './token-optimizer.js';
import pino from 'pino';

const log = pino({ name: 'llm-router' });

export interface LLMRequest {
  prompt: string;
  context?: any;
  model?: 'gemini' | 'claude' | 'gpt4' | 'deepseek' | 'auto';
  temperature?: number;
  maxTokens?: number;
  tools?: any[];
}

export class LLMRouter {
  private gemini: GoogleGenerativeAI;
  private anthropic: Anthropic;
  private openai: OpenAI;
  private deepseek: OpenAI; // DeepSeek uses OpenAI-compatible API
  private toolCaller: ToolCaller;
  private tokenOptimizer: TokenOptimizer;
  private modelCapabilities = {
    gemini: {
      strengths: ['vision', 'multimodal', 'long-context', 'indian-context'],
      costPerToken: 0.00001,
      maxTokens: 1000000,
    },
    claude: {
      strengths: ['reasoning', 'coding', 'analysis', 'safety'],
      costPerToken: 0.00002,
      maxTokens: 200000,
    },
    gpt4: {
      strengths: ['general', 'tools', 'function-calling'],
      costPerToken: 0.00003,
      maxTokens: 128000,
    },
    deepseek: {
      strengths: ['coding', 'reasoning', 'cost-effective', 'long-context'],
      costPerToken: 0.000002, // Much cheaper than others
      maxTokens: 128000,
    },
  };

  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
    
    // DeepSeek uses OpenAI-compatible API
    this.deepseek = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseURL: 'https://api.deepseek.com/v1',
    });
    
    this.toolCaller = new ToolCaller();
    this.tokenOptimizer = new TokenOptimizer();
    
    // Log which API keys are configured
    log.info({
      hasGemini: !!process.env.GEMINI_API_KEY,
      hasClaude: !!process.env.ANTHROPIC_API_KEY,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasDeepSeek: !!process.env.DEEPSEEK_API_KEY,
    }, 'API keys configured');
  }

  async chat(request: LLMRequest): Promise<any> {
    const model = request.model === 'auto' ? this.selectBestModel(request) : request.model;
    
    // Optimize the prompt and context
    const optimizedPrompt = this.tokenOptimizer.createOptimizedPrompt(
      request.prompt,
      request.context,
      request.context?.conversationHistory || []
    );
    
    log.info({ 
      model, 
      promptTokens: this.tokenOptimizer.countTokens(optimizedPrompt),
      hasTools: this.shouldUseTools(request.prompt)
    }, 'Routing LLM request');

    try {
      let result;
      
      // Check if we should use tools based on the query
      if (this.shouldUseTools(request.prompt) && model !== 'gemini') {
        // Use tool-enabled models (Claude or GPT-4)
        // Respect user's model choice if they specifically selected one
        if (model === 'claude') {
          result = await this.toolCaller.callWithClaude(request.prompt, request.context);
        } else if (model === 'gpt4') {
          result = await this.toolCaller.callWithGPT4(request.prompt, request.context);
        } else if (model === 'auto') {
          // Only in auto mode, decide which tool-enabled model to use
          if (this.preferClaudeForTools(request)) {
            result = await this.toolCaller.callWithClaude(request.prompt, request.context);
          } else {
            result = await this.toolCaller.callWithGPT4(request.prompt, request.context);
          }
        }
      } else {
        // Regular chat without tools (or Gemini with tools disabled)
        switch (model) {
          case 'gemini':
            result = await this.chatWithGemini(request);
            break;
          case 'claude':
            result = await this.chatWithClaude(request);
            break;
          case 'gpt4':
            result = await this.chatWithGPT(request);
            break;
          case 'deepseek':
            result = await this.chatWithDeepSeek(request);
            break;
          default:
            result = await this.chatWithGemini(request); // Default fallback
        }
      }
      
      // Track token usage
      if (result.response && result.usage) {
        const usage = this.tokenOptimizer.calculateUsage(
          optimizedPrompt,
          result.response,
          result.model || model
        );
        this.tokenOptimizer.trackUsage(usage);
        result.tokenUsage = usage;
      }
      
      return result;
    } catch (error) {
      log.error(error, `Failed with ${model}, trying fallback`);
      // Fallback logic
      if (model === 'gemini') return await this.chatWithClaude(request);
      if (model === 'claude') return await this.chatWithGPT(request);
      throw error;
    }
  }

  private selectBestModel(request: LLMRequest): string {
    // Intelligent model selection based on task
    const prompt = request.prompt.toLowerCase();
    
    // Vision/Image tasks -> Gemini
    if (request.context?.images || prompt.includes('image') || prompt.includes('photo')) {
      return 'gemini';
    }
    
    // Indian business context -> Gemini (better with Indian names, formats)
    if (prompt.includes('gst') || prompt.includes('pan') || prompt.includes('₹')) {
      return 'gemini';
    }
    
    // Code generation -> DeepSeek (best for code and very cost-effective)
    if (prompt.includes('code') || prompt.includes('function') || prompt.includes('implement')) {
      return 'deepseek';
    }
    
    // Complex reasoning -> Claude
    if (prompt.includes('analyze') || prompt.includes('explain') || prompt.includes('compare')) {
      return 'claude';
    }
    
    // Tool use -> GPT-4
    if (request.tools && request.tools.length > 0) {
      return 'gpt4';
    }
    
    // Cost optimization -> DeepSeek for general queries
    if (prompt.length > 500) {
      return 'deepseek'; // Very cost-effective for long prompts
    }
    
    // Default to Gemini for cost efficiency
    return 'gemini';
  }

  private async chatWithGemini(request: LLMRequest) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to environment variables.');
    }
    
    const model = this.gemini.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.maxTokens || 8192,
      },
    });

    const prompt = this.buildPrompt(request);
    const result = await model.generateContent(prompt);
    
    return {
      model: 'gemini-1.5-pro',
      response: result.response.text(),
      usage: {
        promptTokens: result.response.usageMetadata?.promptTokenCount,
        completionTokens: result.response.usageMetadata?.candidatesTokenCount,
      },
    };
  }

  private async chatWithClaude(request: LLMRequest) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Claude API key not configured. Please add ANTHROPIC_API_KEY to environment variables.');
    }
    
    const response = await this.anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature || 0.7,
      messages: [
        {
          role: 'user',
          content: this.buildPrompt(request),
        },
      ],
    });

    return {
      model: 'claude-3-opus',
      response: response.content[0].type === 'text' ? response.content[0].text : '',
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
      },
    };
  }

  private async chatWithGPT(request: LLMRequest) {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to Railway environment variables.');
    }
    
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'user',
          content: this.buildPrompt(request),
        },
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 4096,
      tools: request.tools,
    });

    return {
      model: 'gpt-4-turbo',
      response: completion.choices[0].message.content,
      toolCalls: completion.choices[0].message.tool_calls,
      usage: completion.usage,
    };
  }

  private async chatWithDeepSeek(request: LLMRequest) {
    if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === 'your-deepseek-api-key-here') {
      throw new Error('DeepSeek API key not configured. Please add DEEPSEEK_API_KEY to Railway environment variables.');
    }
    
    const completion = await this.deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: this.buildPrompt(request),
        },
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 4096,
    });

    return {
      model: 'deepseek-chat',
      response: completion.choices[0].message.content,
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
      },
    };
  }

  private buildPrompt(request: LLMRequest): string {
    let prompt = request.prompt;
    
    // Build system prompt with context
    let systemPrompt = `You are an AI assistant for a modern sugar, ethanol, power, and animal feed factory ERP system.`;
    
    if (request.context?.company) {
      systemPrompt += `\n\nCompany Information:
- Company Name: ${request.context.company}
- Current User: ${request.context.user?.name || 'Unknown'} (${request.context.user?.role || 'User'})
- Current Factory: ${request.context.currentFactory === 'all' ? 'All Factories (HQ View)' : request.context.currentFactory || 'Unknown'}`;
    }
    
    systemPrompt += `\n\nYou have access to real-time data and can help with operations, analysis, and decision-making.`;
    
    if (request.context?.conversationHistory?.length > 0) {
      systemPrompt += `\n\nPrevious conversation:`;
      request.context.conversationHistory.forEach((msg: any) => {
        systemPrompt += `\n${msg.role}: ${msg.content}`;
      });
    }
    
    return `${systemPrompt}\n\nUser Query: ${prompt}`;
  }

  async analyzeDocument(document: Buffer, documentType: string): Promise<any> {
    // Use Gemini for document analysis (best for vision)
    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `Analyze this ${documentType} document and extract all relevant information.
    For Indian business documents, pay attention to:
    - GST numbers
    - PAN numbers
    - Invoice numbers and dates
    - Amounts in INR (₹)
    - HSN codes
    - Tax calculations
    
    Return the data in structured JSON format.`;
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: document.toString('base64'),
        },
      },
    ]);
    
    return JSON.parse(result.response.text());
  }

  async executeTool(toolName: string, args: any): Promise<any> {
    // Simple tool execution - in production this would call actual tool implementations
    log.info({ toolName, args }, 'Executing tool');
    
    // Mock implementation for now
    return {
      toolName,
      result: {
        status: 'success',
        data: {
          message: `Executed ${toolName} with args: ${JSON.stringify(args)}`,
          timestamp: new Date().toISOString(),
        },
      },
    };
  }

  private shouldUseTools(prompt: string): boolean {
    const toolKeywords = [
      'status', 'production', 'efficiency', 'forecast',
      'analyze', 'show me', 'what is', 'how much',
      'calculate', 'check', 'monitor', 'report'
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    return toolKeywords.some(keyword => lowerPrompt.includes(keyword));
  }

  private preferClaudeForTools(request: LLMRequest): boolean {
    // Prefer Claude for complex analysis with tools
    const prompt = request.prompt.toLowerCase();
    return prompt.includes('analyze') || 
           prompt.includes('explain') || 
           prompt.includes('optimize');
  }

  // New method to get token usage stats
  getTokenUsageStats() {
    return this.tokenOptimizer.getUsageStats();
  }
}