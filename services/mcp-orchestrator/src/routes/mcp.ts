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
  
  return routes;
}