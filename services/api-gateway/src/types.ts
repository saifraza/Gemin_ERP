import { Context, Next } from 'hono';
import { JWTPayload } from 'jose';

// Extended JWT payload with our custom fields
export interface AuthPayload extends JWTPayload {
  id: string;
  username: string;
  email: string;
  role: string;
  factoryId?: string;
  companyId?: string;
}

// Service health status
export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'error';
  responseTime?: number;
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'error';
  service: string;
  timestamp: string;
  cache: string;
  database: string;
  services: Record<string, ServiceHealth>;
}

// Service configuration
export interface ServiceConfig {
  core: string;
  mcp: string;
  factory: string;
  analytics: string;
  eventProcessor: string;
}

// Rate limit info
export interface RateLimitInfo {
  allowed: boolean;
  remaining?: number;
  resetAt?: Date;
}

// Hono context with custom values
export interface AppContext extends Context {
  get(key: 'user'): AuthPayload | undefined;
  set(key: 'user', value: AuthPayload): void;
}

// Middleware type
export type AppMiddleware = (c: AppContext, next: Next) => Promise<Response | void>;