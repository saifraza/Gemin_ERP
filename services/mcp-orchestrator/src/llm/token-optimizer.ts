import pino from 'pino';

const log = pino({ name: 'token-optimizer' });

interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
  cost: number;
}

interface ConversationSummary {
  summary: string;
  keyPoints: string[];
  context: Record<string, any>;
}

export class TokenOptimizer {
  private readonly MAX_CONTEXT_TOKENS = 2000;
  private readonly MAX_HISTORY_MESSAGES = 10;
  private readonly SUMMARY_THRESHOLD = 5; // Summarize after 5 messages

  // Model pricing per 1K tokens
  private readonly pricing = {
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gemini-1.5-pro': { input: 0.001, output: 0.002 },
  };

  /**
   * Count tokens in a string
   * Using a simple approximation: ~1 token per 4 characters
   * This is reasonably accurate for English text
   */
  countTokens(text: string): number {
    // More accurate approximation based on OpenAI's guidelines:
    // - 1 token ~= 4 chars in English
    // - 1 token ~= ¾ words
    // - 100 tokens ~= 75 words
    
    // Count words and characters
    const words = text.trim().split(/\s+/).length;
    const chars = text.length;
    
    // Use the average of both methods for better accuracy
    const charBasedTokens = Math.ceil(chars / 4);
    const wordBasedTokens = Math.ceil(words * 1.33);
    
    return Math.ceil((charBasedTokens + wordBasedTokens) / 2);
  }

  /**
   * Calculate token usage and cost
   */
  calculateUsage(
    prompt: string,
    completion: string,
    model: string
  ): TokenUsage {
    const promptTokens = this.countTokens(prompt);
    const completionTokens = this.countTokens(completion);
    const totalTokens = promptTokens + completionTokens;

    // Get pricing for model
    const modelKey = Object.keys(this.pricing).find(key => 
      model.toLowerCase().includes(key.split('-')[0])
    ) || 'gpt-4-turbo';
    
    const price = this.pricing[modelKey as keyof typeof this.pricing];
    const cost = (promptTokens * price.input / 1000) + 
                 (completionTokens * price.output / 1000);

    return {
      prompt: promptTokens,
      completion: completionTokens,
      total: totalTokens,
      cost: Math.round(cost * 10000) / 10000, // Round to 4 decimal places
    };
  }

  /**
   * Optimize conversation history to fit within token limits
   */
  optimizeHistory(messages: any[], maxTokens: number = this.MAX_CONTEXT_TOKENS): any[] {
    let totalTokens = 0;
    const optimizedMessages = [];

    // Always keep the most recent messages
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const messageTokens = this.countTokens(
        `${message.role}: ${message.content}`
      );

      if (totalTokens + messageTokens > maxTokens && optimizedMessages.length > 0) {
        break;
      }

      totalTokens += messageTokens;
      optimizedMessages.unshift(message);
    }

    // If we had to trim messages, add a summary message
    if (optimizedMessages.length < messages.length) {
      const trimmedCount = messages.length - optimizedMessages.length;
      optimizedMessages.unshift({
        role: 'system',
        content: `[Previous ${trimmedCount} messages summarized for context]`,
      });
    }

    log.info({
      original: messages.length,
      optimized: optimizedMessages.length,
      tokens: totalTokens,
    }, 'Optimized conversation history');

    return optimizedMessages;
  }

  /**
   * Create a summary of a conversation
   */
  async summarizeConversation(messages: any[]): Promise<ConversationSummary> {
    // Extract key information
    const topics = new Set<string>();
    const entities = new Set<string>();
    const actions = [];

    for (const msg of messages) {
      const content = msg.content.toLowerCase();
      
      // Extract factory-related topics
      if (content.includes('sugar')) topics.add('sugar production');
      if (content.includes('ethanol')) topics.add('ethanol production');
      if (content.includes('power')) topics.add('power generation');
      if (content.includes('maintenance')) topics.add('maintenance');
      if (content.includes('efficiency')) topics.add('efficiency analysis');
      
      // Extract entities (simplified)
      const companyMatch = content.match(/company:\s*(\w+)/i);
      if (companyMatch) entities.add(companyMatch[1]);
      
      // Extract action items
      if (content.includes('todo') || content.includes('action')) {
        actions.push(msg.content.substring(0, 100));
      }
    }

    return {
      summary: `Discussion about ${Array.from(topics).join(', ')}`,
      keyPoints: [
        ...Array.from(topics).map(t => `Discussed ${t}`),
        ...actions.slice(0, 3).map(a => `Action: ${a}`),
      ],
      context: {
        topics: Array.from(topics),
        entities: Array.from(entities),
        messageCount: messages.length,
      },
    };
  }

  /**
   * Create an optimized prompt with relevant context
   */
  createOptimizedPrompt(
    userQuery: string,
    context: any,
    conversationHistory: any[]
  ): string {
    const parts = [];

    // System context (minimal)
    parts.push('You are an AI assistant for a factory ERP system.');

    // Essential context only
    if (context?.company) {
      parts.push(`Company: ${context.company}`);
    }

    // Optimized history
    if (conversationHistory.length > 0) {
      const optimized = this.optimizeHistory(conversationHistory, 500); // Use only 500 tokens for history
      if (optimized.length > 0) {
        parts.push('\nRecent context:');
        optimized.forEach(msg => {
          parts.push(`${msg.role}: ${msg.content.substring(0, 200)}`);
        });
      }
    }

    // Current query
    parts.push(`\nUser: ${userQuery}`);

    const prompt = parts.join('\n');
    const tokenCount = this.countTokens(prompt);

    log.info({ tokens: tokenCount }, 'Created optimized prompt');

    return prompt;
  }

  /**
   * Cache management for frequently accessed data
   */
  private cache = new Map<string, { data: any; expires: number }>();

  cacheResult(key: string, data: any, ttlSeconds: number = 300) {
    this.cache.set(key, {
      data,
      expires: Date.now() + (ttlSeconds * 1000),
    });
  }

  getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      log.info({ key }, 'Cache hit');
      return cached.data;
    }
    
    // Clean up expired entry
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  /**
   * Monitor and report token usage
   */
  private usageHistory: TokenUsage[] = [];

  trackUsage(usage: TokenUsage) {
    this.usageHistory.push(usage);
    
    // Keep only last 1000 entries
    if (this.usageHistory.length > 1000) {
      this.usageHistory = this.usageHistory.slice(-1000);
    }
  }

  getUsageStats() {
    const total = this.usageHistory.reduce((acc, u) => ({
      prompt: acc.prompt + u.prompt,
      completion: acc.completion + u.completion,
      total: acc.total + u.total,
      cost: acc.cost + u.cost,
    }), { prompt: 0, completion: 0, total: 0, cost: 0 });

    return {
      requests: this.usageHistory.length,
      totalTokens: total.total,
      totalCost: Math.round(total.cost * 100) / 100,
      averageTokensPerRequest: Math.round(total.total / this.usageHistory.length),
      breakdown: {
        prompt: total.prompt,
        completion: total.completion,
      },
    };
  }
}