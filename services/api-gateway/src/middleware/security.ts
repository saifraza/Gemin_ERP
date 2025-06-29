import { Context, Next } from 'hono';

/**
 * Security headers middleware for API Gateway
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
    
    // API Gateway specific headers
    c.header('X-API-Version', '1.0');
    c.header('X-Request-ID', crypto.randomUUID());
    
    // Remove sensitive headers
    c.header('X-Powered-By', '');
    c.header('Server', '');
    
    // HSTS (only in production)
    if (process.env.NODE_ENV === 'production') {
      c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    // CORS headers are handled by cors middleware
  };
};