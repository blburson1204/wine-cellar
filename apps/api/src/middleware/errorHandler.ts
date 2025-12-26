import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors/AppError';
import { createLogger } from '../utils/logger';
import { ZodError } from 'zod';
import { Prisma } from '@wine-cellar/database';

/**
 * Centralized error handling middleware
 * Should be registered after all routes
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  const log = createLogger(req);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const field = err.path.join('.');
      if (!fields[field]) fields[field] = [];
      fields[field].push(err.message);
    });

    log.warn('Validation error', { fields });

    return res.status(400).json({
      error: 'Validation failed',
      errorCode: 'VALIDATION_ERROR',
      fields,
      requestId: req.id,
    });
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    log.error('Database error', error, { code: error.code });

    // Unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'A record with this value already exists',
        errorCode: 'DUPLICATE_ENTRY',
        requestId: req.id,
      });
    }

    // Record not found
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Record not found',
        errorCode: 'NOT_FOUND',
        requestId: req.id,
      });
    }

    // Foreign key constraint failed
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'Invalid reference to related record',
        errorCode: 'FOREIGN_KEY_ERROR',
        requestId: req.id,
      });
    }

    // Generic database error (don't leak details)
    return res.status(500).json({
      error: 'Database operation failed',
      errorCode: 'DATABASE_ERROR',
      requestId: req.id,
    });
  }

  // Handle custom AppErrors
  if (error instanceof AppError) {
    log.warn('Application error', {
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      message: error.message,
    });

    return res.status(error.statusCode).json({
      error: error.message,
      errorCode: error.errorCode,
      ...(error instanceof ValidationError && error.fields && { fields: error.fields }),
      requestId: req.id,
    });
  }

  // Handle unexpected errors (don't leak details in production)
  log.error('Unhandled error', error);

  const isProduction = process.env.NODE_ENV === 'production';

  return res.status(500).json({
    error: isProduction ? 'An unexpected error occurred' : error.message,
    errorCode: 'INTERNAL_SERVER_ERROR',
    requestId: req.id,
    ...(isProduction ? {} : { stack: error.stack }),
  });
};

/**
 * 404 handler for undefined routes
 * Should be registered before errorHandler but after all defined routes
 */
export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): Response => {
  const log = createLogger(req);
  log.warn('Route not found', { method: req.method, path: req.path });

  return res.status(404).json({
    error: `Cannot ${req.method} ${req.path}`,
    errorCode: 'ROUTE_NOT_FOUND',
    requestId: req.id,
  });
};
