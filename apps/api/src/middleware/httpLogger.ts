import morgan from 'morgan';
import { Request } from 'express';
import { httpLogStream } from '../utils/logger';

// Add custom token for request ID
morgan.token('request-id', (req: Request) => req.id);

// Create HTTP logger with custom format
export const httpLogger = morgan(
  ':request-id :method :url :status :response-time ms - :res[content-length]',
  { stream: httpLogStream }
);
