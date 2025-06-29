import { Context, Next } from 'hono';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export const authMiddleware = () => {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const token = authHeader.substring(7);
      
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      // Set the JWT payload in context for use in other middlewares
      c.set('jwtPayload', payload);
      c.set('user', payload);
      
      await next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return c.json({ error: 'Invalid token' }, 401);
    }
  };
};