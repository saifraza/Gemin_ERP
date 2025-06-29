import { describe, it, expect, beforeEach } from '@jest/globals';
import { Hono } from 'hono';
import { securityHeaders } from '../middleware/security';

describe('Security Middleware', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.use('*', securityHeaders());
    app.get('/test', (c) => c.json({ message: 'ok' }));
  });

  it('should add security headers to response', async () => {
    const response = await app.request('/test');
    
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(response.headers.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
  });

  it('should include Content-Security-Policy header', async () => {
    const response = await app.request('/test');
    const csp = response.headers.get('Content-Security-Policy');
    
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it('should remove X-Powered-By header', async () => {
    const response = await app.request('/test');
    
    expect(response.headers.get('X-Powered-By')).toBe('');
  });

  it('should not add HSTS header in test environment', async () => {
    const response = await app.request('/test');
    
    expect(response.headers.get('Strict-Transport-Security')).toBeNull();
  });

  it('should add HSTS header in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const prodApp = new Hono();
    prodApp.use('*', securityHeaders());
    prodApp.get('/test', (c) => c.json({ message: 'ok' }));
    
    const response = await prodApp.request('/test');
    
    expect(response.headers.get('Strict-Transport-Security')).toBe(
      'max-age=31536000; includeSubDomains; preload'
    );
    
    process.env.NODE_ENV = originalEnv;
  });
});