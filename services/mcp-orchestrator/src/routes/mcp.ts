import { Hono } from 'hono';
import { LLMRouter } from '../llm/router.js';
import { EventBus } from '../events/event-bus.js';

export function createMCPRoutes(llmRouter: LLMRouter, eventBus: EventBus) {
  const routes = new Hono();
  
  routes.post('/chat', async (c) => {
    let requestedModel = 'unknown';
    try {
      const { prompt, context, model } = await c.req.json();
      requestedModel = model || 'auto';
      
      console.log('Chat request:', { model: requestedModel, promptLength: prompt?.length });
      
      const response = await llmRouter.chat({ 
        prompt, 
        context,
        model: requestedModel
      });
      
      // Ensure response has required structure
      if (!response || typeof response.response !== 'string') {
        console.error('Invalid response structure:', response);
        return c.json({ 
          error: 'Invalid response from LLM',
          details: 'Response missing or invalid format'
        }, 500);
      }
      
      return c.json(response);
    } catch (error) {
      console.error('Chat error details:', error);
      
      // Provide more detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isApiKeyError = errorMessage.includes('API key') || errorMessage.includes('configured');
      
      // Check for specific API errors
      let errorType = 'processing';
      let errorDetails = errorMessage;
      
      if (isApiKeyError) {
        errorType = 'configuration';
        errorDetails = 'Please check your API keys in Railway environment';
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        errorType = 'authentication';
        errorDetails = 'API key is invalid or expired. Please check your API keys.';
      } else if (errorMessage.includes('429') || errorMessage.includes('quota')) {
        errorType = 'rate_limit';
        errorDetails = 'API rate limit exceeded or quota reached.';
      } else if (errorMessage.includes('402') || errorMessage.includes('Insufficient Balance')) {
        errorType = 'insufficient_credits';
        errorDetails = 'API account has insufficient credits. Please add credits to your account.';
      }
      
      return c.json({ 
        error: 'Failed to process chat request',
        message: errorMessage,
        type: errorType,
        details: errorDetails,
        model: requestedModel
      }, 500);
    }
  });
  
  routes.post('/tools/execute', async (c) => {
    try {
      const { tool, input } = await c.req.json();
      const result = await llmRouter.executeTool(tool, input);
      return c.json(result);
    } catch (error) {
      return c.json({ error: 'Failed to execute tool' }, 500);
    }
  });
  
  routes.get('/health', (c) => {
    return c.json({ 
      status: 'healthy',
      service: 'mcp-routes',
      timestamp: new Date().toISOString()
    });
  });
  
  // Test endpoint to verify LLM integration
  routes.post('/test-llm', async (c) => {
    try {
      const { model = 'auto', prompt = 'What is 2+2?' } = await c.req.json();
      
      // Test specific model or auto-selection
      const response = await llmRouter.chat({
        prompt,
        model: model as any,
        temperature: 0.1, // Low temperature for consistent testing
      });
      
      return c.json({
        success: true,
        model: response.model,
        response: response.response,
        usage: response.usage,
      });
    } catch (error) {
      console.error('LLM test error:', error);
      return c.json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Make sure API keys are set in environment variables'
      }, 500);
    }
  });
  
  // List available models
  routes.get('/models', (c) => {
    return c.json({
      models: [
        {
          id: 'gemini',
          name: 'Gemini 1.5 Flash',
          provider: 'Google',
          strengths: ['vision', 'multimodal', 'long-context', 'indian-context'],
          costLevel: '$$',
        },
        {
          id: 'claude',
          name: 'Claude 3 Opus',
          provider: 'Anthropic',
          strengths: ['reasoning', 'coding', 'analysis', 'safety'],
          costLevel: '$$$',
        },
        {
          id: 'gpt4',
          name: 'GPT-4 Turbo',
          provider: 'OpenAI',
          strengths: ['general', 'tools', 'function-calling'],
          costLevel: '$$$',
        },
        {
          id: 'deepseek',
          name: 'DeepSeek Chat',
          provider: 'DeepSeek',
          strengths: ['coding', 'reasoning', 'cost-effective', 'long-context'],
          costLevel: '$', // Very cheap!
        },
        {
          id: 'auto',
          name: 'Auto Select',
          provider: 'System',
          strengths: ['chooses best model based on task'],
          costLevel: 'Varies',
        },
      ],
    });
  });
  
  // Get token usage statistics
  routes.get('/usage', (c) => {
    const stats = llmRouter.getTokenUsageStats();
    return c.json({
      usage: stats,
      timestamp: new Date().toISOString(),
    });
  });
  
  return routes;
}