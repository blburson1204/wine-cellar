import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// Extend Express Request type to include id
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Use existing request ID from header or generate new one
  req.id = (req.headers['x-request-id'] as string) || randomUUID();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.id);

  next();
};
