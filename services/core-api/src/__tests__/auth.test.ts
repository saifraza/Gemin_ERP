import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Hono } from 'hono';
import { authRoutes } from '../routes/auth';

describe('Auth Routes', () => {
  let app: Hono;

  beforeAll(() => {
    app = new Hono();
    app.route('/api/auth', authRoutes);
  });

  describe('POST /api/auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      const response = await app.request('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'invalid',
          password: 'invalid',
        }),
      });

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Invalid credentials');
    });

    it('should validate required fields', async () => {
      const response = await app.request('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/health', () => {
    it('should return health status', async () => {
      const response = await app.request('/api/auth/health');
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.status).toBe('ok');
      expect(body.endpoints).toContain('/login');
    });
  });
});