import { describe, it, expect } from '@jest/globals';
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
  handlePrismaError,
  isAppError,
  createErrorResponse,
} from '../shared/errors';

describe('Error Handling', () => {
  describe('AppError', () => {
    it('should create an error with correct properties', () => {
      const error = new AppError(500, 'Test error', true, 'TEST_ERROR');
      
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Test error');
      expect(error.isOperational).toBe(true);
      expect(error.code).toBe('TEST_ERROR');
    });
  });

  describe('HTTP Error Classes', () => {
    it('should create BadRequestError with 400 status', () => {
      const error = new BadRequestError('Bad request');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad request');
    });

    it('should create UnauthorizedError with 401 status', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });

    it('should create NotFoundError with 404 status', () => {
      const error = new NotFoundError('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });

    it('should create ValidationError with errors object', () => {
      const errors = { email: ['Invalid email format'] };
      const error = new ValidationError('Validation failed', errors);
      
      expect(error.statusCode).toBe(422);
      expect(error.errors).toEqual(errors);
    });
  });

  describe('Prisma Error Handler', () => {
    it('should handle unique constraint violation', () => {
      const prismaError = { code: 'P2002' };
      const error = handlePrismaError(prismaError);
      
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('UNIQUE_CONSTRAINT_VIOLATION');
    });

    it('should handle record not found', () => {
      const prismaError = { code: 'P2025' };
      const error = handlePrismaError(prismaError);
      
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('RECORD_NOT_FOUND');
    });

    it('should handle unknown errors', () => {
      const prismaError = { code: 'UNKNOWN' };
      const error = handlePrismaError(prismaError);
      
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
    });
  });

  describe('Error Response', () => {
    it('should create error response format', () => {
      const error = new BadRequestError('Test error', 'TEST_CODE');
      const response = createErrorResponse(error);
      
      expect(response).toEqual({
        error: {
          message: 'Test error',
          code: 'TEST_CODE',
          statusCode: 400,
          details: undefined,
        },
      });
    });

    it('should include validation errors in details', () => {
      const errors = { field: ['Error message'] };
      const error = new ValidationError('Validation failed', errors);
      const response = createErrorResponse(error);
      
      expect(response.error.details).toEqual(errors);
    });
  });

  describe('Type Guards', () => {
    it('should identify AppError instances', () => {
      const appError = new AppError(500, 'Test');
      const regularError = new Error('Test');
      
      expect(isAppError(appError)).toBe(true);
      expect(isAppError(regularError)).toBe(false);
    });
  });
});