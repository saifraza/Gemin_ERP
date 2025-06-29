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
    // Initialize with empty API keys to prevent constructor errors
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key' });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });
    
    // DeepSeek uses OpenAI-compatible API
    this.deepseek = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || 'dummy-key',
      baseURL: 'https://api.deepseek.com/v1',
    });
    
    this.toolCaller = new ToolCaller();
    this.tokenOptimizer = new TokenOptimizer();
    
    // Log which API keys are configured
    const apiKeyStatus = {
      hasGemini: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here',
      hasClaude: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-api-key-here',
      hasOpenAI: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here',
      hasDeepSeek: !!process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'your-deepseek-api-key-here',
    };
    
    log.info(apiKeyStatus, 'API keys configured');
    
    // Warn if no API keys are configured
    if (!apiKeyStatus.hasGemini && !apiKeyStatus.hasClaude && !apiKeyStatus.hasOpenAI && !apiKeyStatus.hasDeepSeek) {
      log.error('WARNING: No valid API keys configured. AI chat will not work.');
    }
  }

  async chat(request: LLMRequest): Promise<any> {
    // Check if at least one API key is configured
    const hasValidKey = (
      (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here') ||
      (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-api-key-here') ||
      (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') ||
      (process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'your-deepseek-api-key-here')
    );
    
    if (!hasValidKey) {
      throw new Error('No AI API keys configured. Please add at least one API key (GEMINI_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY, or DEEPSEEK_API_KEY) to Railway environment variables.');
    }
    
    const model = request.model === 'auto' ? this.selectBestModel(request) : request.model;
    
    // Optimize the prompt and context
    const optimizedPrompt = this.tokenOptimizer.createOptimizedPrompt(
      request.prompt,
      request.context,
      request.context?.conversationHistory || []
    );
    
    log.info({ 
      requestedModel: request.model,
      selectedModel: model,
      promptTokens: this.tokenOptimizer.countTokens(optimizedPrompt),
      hasTools: this.shouldUseTools(request.prompt),
      promptPreview: request.prompt.substring(0, 50)
    }, 'Routing LLM request');

    try {
      let result;
      
      // Check if we should use tools based on the query
      if (this.shouldUseTools(request.prompt) && model !== 'gemini' && model !== 'deepseek') {
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
      }
      
      // If no tool call was made or for non-tool models
      if (!result) {
        // Regular chat without tools
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
      if (result && result.response) {
        const usage = this.tokenOptimizer.calculateUsage(
          optimizedPrompt,
          result.response,
          result.model || model
        );
        this.tokenOptimizer.trackUsage(usage);
        result.tokenUsage = usage;
        
        // Ensure model is always set in response
        if (!result.model) {
          result.model = model;
        }
        
        log.info({ 
          actualModel: result.model,
          responseLength: result.response.length 
        }, 'LLM response generated');
      }
      
      return result;
    } catch (error) {
      log.error({ error, model, errorMessage: error instanceof Error ? error.message : 'Unknown error' }, `Failed with ${model}`);
      
      // Don't use fallback - let the error propagate so we can see what's wrong
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
      model: 'gemini-1.5-flash', // Updated to currently available model
      generationConfig: {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.maxTokens || 8192,
      },
    });

    const prompt = this.buildPrompt(request);
    const result = await model.generateContent(prompt);
    
    const responseText = result.response.text();
    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }
    
    return {
      model: 'gemini-1.5-flash',
      response: responseText,
      usage: {
        promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
        completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
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

    const responseText = response.content[0]?.type === 'text' ? response.content[0].text : '';
    if (!responseText) {
      throw new Error('Empty response from Claude');
    }
    
    return {
      model: 'claude-3-opus',
      response: responseText,
      usage: {
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
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

    const responseText = completion.choices[0]?.message?.content || '';
    if (!responseText) {
      throw new Error('Empty response from GPT-4');
    }
    
    return {
      model: 'gpt-4-turbo',
      response: responseText,
      toolCalls: completion.choices[0]?.message?.tool_calls,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
      },
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

    const responseText = completion.choices[0]?.message?.content || '';
    if (!responseText) {
      throw new Error('Empty response from DeepSeek');
    }
    
    return {
      model: 'deepseek-chat',
      response: responseText,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
      },
    };
  }

  private buildPrompt(request: LLMRequest): string {
    let prompt = request.prompt;
    
    // Build system prompt with context
    let systemPrompt = `You are an AI assistant for the Modern ERP system deployed at ${request.context?.company || 'the organization'}.

IMPORTANT: This is a comprehensive enterprise ERP system with exactly 11 major modules:

1. Financial Management (9 sub-modules) - General Ledger, Accounts Payable/Receivable, Fixed Assets, Cash Management, Financial Reporting, Budgeting, Cost Accounting, Tax Management
2. Supply Chain Management (5 sub-modules) - Inventory, Warehouse, Transportation, Demand Planning, Supply Planning
3. Manufacturing (6 sub-modules) - Production Planning, MES, MRP, Shop Floor Control, BOM, PLM, Quality Control
4. Human Resources Management (8 sub-modules) - Core HR, Payroll, Time & Attendance, Talent Management, Benefits, Compensation, ESS, HR Analytics
5. Customer Relationship Management (5 sub-modules) - Sales Force Automation, Marketing, Customer Service, Sales Analytics, Quote & Order Management
6. Project Management (5 sub-modules) - Project Planning, Resource Management, Project Budgeting, Portfolio Management, Time & Billing
7. Asset Management (5 sub-modules) - Asset Tracking, Maintenance Management, Asset Lifecycle, Spare Parts, Fleet Management
8. Quality Management (6 sub-modules) - Quality Planning, Quality Control, Non-Conformance, CAPA, Audit Management, Supplier Quality
9. Business Intelligence & Analytics (5 sub-modules) - Data Warehouse, Advanced Analytics, Reporting & Dashboards, Data Visualization, Performance Management
10. Specialized Modules (7 sub-modules) - Compliance & Risk, Document Management, EHS, Service Management, Contract Management, Real Estate, Energy Management
11. Integration & Technical Modules (5 sub-modules) - Integration Platform, Workflow Management, Security Management, System Administration, System Test

Currently Implemented: Dashboard, Master Data, System Test
Under Development: Financial Management, Supply Chain Management

When asked about modules, ALWAYS refer to this exact structure. Do NOT make up modules about sugar, ethanol, or other industry-specific modules unless they are sub-features within the main modules.`;
    
    if (request.context?.company) {
      systemPrompt += `\n\nCurrent Session Context:
- Company: ${request.context.company}
- User: ${request.context.user?.name || 'Unknown'} (${request.context.user?.role || 'User'})
- Access Level: ${request.context.currentFactory === 'all' ? 'All Factories (HQ View)' : request.context.currentFactory || 'Factory Level'}`;
    }
    
    systemPrompt += `\n\nYou can help with ERP operations, module information, navigation guidance, and system usage. Always be accurate about the module structure.`;
    
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
      'calculate', 'check', 'monitor', 'report',
      'how to', 'how do i', 'where is', 'create user',
      'add user', 'new user', 'manage', 'help',
      'guide', 'tutorial', 'steps', 'navigate'
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