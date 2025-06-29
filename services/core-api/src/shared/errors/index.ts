/**
 * Shared error handling utilities for core-api service
 */

// Base application error class
export class AppError extends Error {
  public readonly isOperational: boolean;
  public readonly code?: string;
  
  constructor(
    public statusCode: number,
    message: string,
    isOperational = true,
    code?: string,
    stack = ''
  ) {
    super(message);
    this.isOperational = isOperational;
    this.code = code;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Common HTTP errors
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', code?: string) {
    super(400, message, true, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code?: string) {
    super(401, message, true, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code?: string) {
    super(403, message, true, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code?: string) {
    super(404, message, true, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', code?: string) {
    super(409, message, true, code);
  }
}

export class ValidationError extends AppError {
  constructor(
    message = 'Validation Error',
    public errors?: Record<string, string[]>
  ) {
    super(422, message, true, 'VALIDATION_ERROR');
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', code?: string) {
    super(500, message, false, code);
  }
}

// Prisma error handler
export function handlePrismaError(error: any): AppError {
  switch (error.code) {
    case 'P2002':
      return new ConflictError(
        'A record with this value already exists',
        'UNIQUE_CONSTRAINT_VIOLATION'
      );
    case 'P2003':
      return new BadRequestError(
        'Foreign key constraint violation',
        'FOREIGN_KEY_VIOLATION'
      );
    case 'P2025':
      return new NotFoundError(
        'Record not found',
        'RECORD_NOT_FOUND'
      );
    case 'P2021':
      return new InternalServerError(
        'Table does not exist in the database',
        'TABLE_NOT_FOUND'
      );
    default:
      return new InternalServerError(
        'Database operation failed',
        'DATABASE_ERROR'
      );
  }
}

// Error response format
export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: any;
  };
}

// Create standardized error response
export function createErrorResponse(error: AppError): ErrorResponse {
  return {
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error instanceof ValidationError ? error.errors : undefined,
    },
  };
}

// Type guard for AppError
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// Global error handler for Hono
export function errorHandler(err: Error, c: any) {
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  });

  // Handle known errors
  if (isAppError(err)) {
    return c.json(createErrorResponse(err), err.statusCode);
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const appError = handlePrismaError(err);
    return c.json(createErrorResponse(appError), appError.statusCode);
  }

  // Handle validation errors from zod
  if (err.name === 'ZodError') {
    const validationError = new ValidationError(
      'Validation failed',
      (err as any).errors
    );
    return c.json(createErrorResponse(validationError), 422);
  }

  // Handle unknown errors
  const unknownError = new InternalServerError(
    process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred'
      : err.message
  );
  
  return c.json(createErrorResponse(unknownError), 500);
}