import { Context, Next } from 'hono';

/**
 * Security headers middleware
 * Adds essential security headers to all responses
 */
export const securityHeaders = () => {
  return async (c: Context, next: Next) => {
    // Execute the route handler
    await next();

    // Add security headers to the response
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Content Security Policy
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts for Next.js
      "style-src 'self' 'unsafe-inline'", // Allow inline styles
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ];
    
    c.header('Content-Security-Policy', cspDirectives.join('; '));
    
    // Remove sensitive headers
    c.header('X-Powered-By', '');
    
    // HSTS (only in production)
    if (process.env.NODE_ENV === 'production') {
      c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
  };
};

/**
 * Rate limiting headers
 * Adds rate limit information to responses
 */
export const rateLimitHeaders = (remaining: number, resetTime: Date) => {
  return (c: Context) => {
    c.header('X-RateLimit-Limit', '100');
    c.header('X-RateLimit-Remaining', remaining.toString());
    c.header('X-RateLimit-Reset', resetTime.toISOString());
  };
};