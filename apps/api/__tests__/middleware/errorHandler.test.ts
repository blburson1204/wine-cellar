import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler, notFoundHandler } from '../../src/middleware/errorHandler';
import { AppError, ValidationError } from '../../src/errors/AppError';
import { Prisma } from '@prisma/client';

// Mock the logger
vi.mock('../../src/utils/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

describe('errorHandler middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn().mockReturnThis();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    mockReq = {
      id: 'test-request-id',
      method: 'GET',
      path: '/test',
    };

    mockRes = {
      status: statusMock,
      json: jsonMock,
    };

    mockNext = vi.fn();
  });

  describe('Prisma Error Handling', () => {
    it('handles P2002 unique constraint violation', () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
      });

      errorHandler(prismaError, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'A record with this value already exists',
          errorCode: 'DUPLICATE_ENTRY',
          requestId: 'test-request-id',
        })
      );
    });

    it('handles P2025 record not found', () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '5.0.0',
      });

      errorHandler(prismaError, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Record not found',
          errorCode: 'NOT_FOUND',
          requestId: 'test-request-id',
        })
      );
    });

    it('handles P2003 foreign key constraint failed', () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
        }
      );

      errorHandler(prismaError, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid reference to related record',
          errorCode: 'FOREIGN_KEY_ERROR',
          requestId: 'test-request-id',
        })
      );
    });

    it('handles generic Prisma error with unknown code', () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Some database error', {
        code: 'P9999', // Unknown code
        clientVersion: '5.0.0',
      });

      errorHandler(prismaError, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Database operation failed',
          errorCode: 'DATABASE_ERROR',
          requestId: 'test-request-id',
        })
      );
    });
  });

  describe('AppError Handling', () => {
    it('handles AppError with correct status code', () => {
      const appError = new AppError(403, 'Forbidden', true, 'FORBIDDEN');

      errorHandler(appError, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Forbidden',
          errorCode: 'FORBIDDEN',
          requestId: 'test-request-id',
        })
      );
    });

    it('handles ValidationError with fields', () => {
      const validationError = new ValidationError('Validation failed', {
        name: ['Name is required'],
        email: ['Invalid email format'],
      });

      errorHandler(validationError, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          errorCode: 'VALIDATION_ERROR',
          fields: {
            name: ['Name is required'],
            email: ['Invalid email format'],
          },
          requestId: 'test-request-id',
        })
      );
    });
  });

  describe('Unexpected Error Handling', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('hides error details in production', () => {
      process.env.NODE_ENV = 'production';

      const unexpectedError = new Error('Sensitive database connection string');

      errorHandler(unexpectedError, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'An unexpected error occurred',
          errorCode: 'INTERNAL_SERVER_ERROR',
          requestId: 'test-request-id',
        })
      );
      // Should NOT include the stack trace in production
      expect(jsonMock).toHaveBeenCalledWith(
        expect.not.objectContaining({
          stack: expect.any(String),
        })
      );
    });

    it('shows error details in development', () => {
      process.env.NODE_ENV = 'development';

      const unexpectedError = new Error('Debug info');

      errorHandler(unexpectedError, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Debug info',
          errorCode: 'INTERNAL_SERVER_ERROR',
          requestId: 'test-request-id',
          stack: expect.any(String),
        })
      );
    });
  });
});

describe('notFoundHandler middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn().mockReturnThis();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    mockReq = {
      id: 'test-request-id',
      method: 'GET',
      path: '/unknown-route',
    };

    mockRes = {
      status: statusMock,
      json: jsonMock,
    };

    mockNext = vi.fn();
  });

  it('returns 404 for undefined routes', () => {
    notFoundHandler(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Cannot GET /unknown-route',
        errorCode: 'ROUTE_NOT_FOUND',
        requestId: 'test-request-id',
      })
    );
  });

  it('includes correct method and path in error message', () => {
    mockReq.method = 'POST';
    mockReq.path = '/api/items';

    notFoundHandler(mockReq as Request, mockRes as Response, mockNext);

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Cannot POST /api/items',
      })
    );
  });
});
