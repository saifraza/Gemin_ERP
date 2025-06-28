import { Hono } from 'hono';
import { LLMRouter } from '../llm/router.js';
import { EventBus } from '../events/event-bus.js';

export function createMCPRoutes(llmRouter: LLMRouter, eventBus: EventBus) {
  const routes = new Hono();
  
  routes.post('/chat', async (c) => {
    try {
      const { prompt, context, model } = await c.req.json();
      const response = await llmRouter.chat({ 
        prompt, 
        context,
        model: model || 'auto'
      });
      return c.json(response);
    } catch (error) {
      return c.json({ error: 'Failed to process chat request' }, 500);
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
          name: 'Gemini 1.5 Pro',
          provider: 'Google',
          strengths: ['vision', 'multimodal', 'long-context', 'indian-context'],
        },
        {
          id: 'claude',
          name: 'Claude 3 Opus',
          provider: 'Anthropic',
          strengths: ['reasoning', 'coding', 'analysis', 'safety'],
        },
        {
          id: 'gpt4',
          name: 'GPT-4 Turbo',
          provider: 'OpenAI',
          strengths: ['general', 'tools', 'function-calling'],
        },
        {
          id: 'auto',
          name: 'Auto Select',
          provider: 'System',
          strengths: ['chooses best model based on task'],
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