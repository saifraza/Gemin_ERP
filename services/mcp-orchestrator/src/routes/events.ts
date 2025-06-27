import { Hono } from 'hono';

export function createEventRoutes(eventBus: any) {
  const routes = new Hono();
  
  routes.post('/publish', async (c) => {
    const event = await c.req.json();
    await eventBus.publish(event);
    return c.json({ success: true });
  });
  
  return routes;
}