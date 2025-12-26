import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Recursively trims all string values in an object
 */
function trimStrings(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return obj.trim();
  }

  if (Array.isArray(obj)) {
    return obj.map(trimStrings);
  }

  if (typeof obj === 'object') {
    const trimmed: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        trimmed[key] = trimStrings((obj as Record<string, unknown>)[key]);
      }
    }
    return trimmed;
  }

  return obj;
}

/**
 * Middleware factory for validating request body, params, or query
 */
export const validate = (schema: z.ZodSchema, source: 'body' | 'params' | 'query' = 'body') => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Trim all strings BEFORE validation
      const trimmedData = trimStrings(req[source]);

      // Validate the trimmed data
      const validated = await schema.parseAsync(trimmedData);

      // Replace request data with validated/transformed data
      req[source] = validated;

      next();
    } catch (error) {
      // Pass validation errors to error handler
      next(error);
    }
  };
};
