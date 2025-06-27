import { GoogleGenerativeAI } from '@google/generative-ai';
import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import pino from 'pino';

const log = pino({ name: 'llm-router' });

export interface LLMRequest {
  prompt: string;
  context?: any;
  model?: 'gemini' | 'claude' | 'gpt4' | 'auto';
  temperature?: number;
  maxTokens?: number;
  tools?: any[];
}

export class LLMRouter {
  private gemini: GoogleGenerativeAI;
  private anthropic: Anthropic;
  private openai: OpenAI;
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
  };

  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
  }

  async chat(request: LLMRequest): Promise<any> {
    const model = request.model === 'auto' ? this.selectBestModel(request) : request.model;
    
    log.info({ model, prompt: request.prompt.substring(0, 100) }, 'Routing LLM request');

    try {
      switch (model) {
        case 'gemini':
          return await this.chatWithGemini(request);
        case 'claude':
          return await this.chatWithClaude(request);
        case 'gpt4':
          return await this.chatWithGPT(request);
        default:
          return await this.chatWithGemini(request); // Default fallback
      }
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
    
    // Complex reasoning -> Claude
    if (prompt.includes('analyze') || prompt.includes('explain') || prompt.includes('compare')) {
      return 'claude';
    }
    
    // Code generation -> Claude
    if (prompt.includes('code') || prompt.includes('function') || prompt.includes('implement')) {
      return 'claude';
    }
    
    // Tool use -> GPT-4
    if (request.tools && request.tools.length > 0) {
      return 'gpt4';
    }
    
    // Default to Gemini for cost efficiency
    return 'gemini';
  }

  private async chatWithGemini(request: LLMRequest) {
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

  private buildPrompt(request: LLMRequest): string {
    let prompt = request.prompt;
    
    if (request.context) {
      prompt = `Context:\n${JSON.stringify(request.context, null, 2)}\n\nRequest:\n${prompt}`;
    }
    
    // Add system context for factory operations
    prompt = `You are an AI assistant for a modern sugar, ethanol, power, and animal feed factory ERP system. 
    You have access to real-time data and can help with operations, analysis, and decision-making.
    
    ${prompt}`;
    
    return prompt;
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
}