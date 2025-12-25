# Error Handling & Logging Skill - Wine Cellar

This skill provides error handling strategies, logging patterns, and monitoring best practices for the Wine Cellar application.

## Error Handling Philosophy

**Why Robust Error Handling Matters:**
1. **User Experience** - Clear, helpful error messages instead of crashes
2. **Debugging** - Quickly identify and fix issues in production
3. **Reliability** - Graceful degradation when things go wrong
4. **Monitoring** - Track system health and catch problems early
5. **Security** - Prevent sensitive data leaks through error messages

## Error Handling Stack

### Backend (API)
- **Logger**: Winston or Pino (structured logging)
- **Error Tracking**: Sentry (production monitoring)
- **Validation**: Zod (schema validation with detailed errors)
- **HTTP Errors**: Custom error classes extending Error

### Frontend (Web)
- **Error Boundaries**: React Error Boundaries for component crashes
- **Toast Notifications**: User-friendly error messages
- **Error Tracking**: Sentry browser integration
- **Form Validation**: Zod with react-hook-form

## Logging Levels

```typescript
enum LogLevel {
  ERROR = 'error',   // System errors, exceptions
  WARN = 'warn',     // Potential issues, deprecations
  INFO = 'info',     // Important events (user actions, API calls)
  DEBUG = 'debug',   // Detailed diagnostic information
  TRACE = 'trace'    // Very detailed, rarely used
}
```

**When to Use Each Level:**

| Level | Usage | Examples |
|-------|-------|----------|
| **ERROR** | Unhandled exceptions, critical failures | Database connection lost, API timeout |
| **WARN** | Recoverable issues, degraded performance | Retry attempt, fallback used |
| **INFO** | Normal operations, business events | User login, wine created, API request |
| **DEBUG** | Diagnostic information for development | Query parameters, function entry/exit |
| **TRACE** | Extremely detailed debugging | Variable values, loop iterations |

## Logger Configuration

### Winston Setup (Recommended)

```typescript
// packages/logger/src/index.ts
import winston from 'winston';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
};

export const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'wine-cellar-api',
    environment: process.env.NODE_ENV
  },
  transports: [
    // Console output (development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // File output (production)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Stream for Morgan HTTP logging
export const httpLogStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};
```

### Request ID Tracking

```typescript
// middleware/requestId.ts
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.id = req.headers['x-request-id'] as string || randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
};
```

### Contextual Logging

```typescript
// utils/logger.ts
import { logger as baseLogger } from '@wine-cellar/logger';
import { Request } from 'express';

export const createLogger = (req?: Request) => {
  const meta = req ? {
    requestId: req.id,
    method: req.method,
    path: req.path,
    userId: req.user?.id
  } : {};

  return {
    error: (message: string, error?: Error, extra?: object) => {
      baseLogger.error(message, { ...meta, ...extra, error: error?.stack });
    },
    warn: (message: string, extra?: object) => {
      baseLogger.warn(message, { ...meta, ...extra });
    },
    info: (message: string, extra?: object) => {
      baseLogger.info(message, { ...meta, ...extra });
    },
    debug: (message: string, extra?: object) => {
      baseLogger.debug(message, { ...meta, ...extra });
    }
  };
};

// Usage in route handlers:
app.get('/api/wines/:id', async (req, res, next) => {
  const log = createLogger(req);

  try {
    log.info('Fetching wine', { wineId: req.params.id });
    const wine = await getWineById(req.params.id);

    if (!wine) {
      log.warn('Wine not found', { wineId: req.params.id });
      return res.status(404).json({ error: 'Wine not found' });
    }

    log.info('Wine retrieved successfully');
    res.json(wine);
  } catch (error) {
    log.error('Error fetching wine', error as Error, { wineId: req.params.id });
    next(error);
  }
});
```

## Custom Error Classes

```typescript
// errors/AppError.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true,
    public errorCode?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string[]>) {
    super(400, message, true, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with ID '${id}' not found`
      : `${resource} not found`;
    super(404, message, true, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, true, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, message, true, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, true, 'CONFLICT');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, public originalError?: Error) {
    super(500, message, true, 'DATABASE_ERROR');
  }
}

// Usage:
throw new NotFoundError('Wine', wineId);
throw new ValidationError('Invalid wine data', {
  vintage: ['Must be between 1900 and current year']
});
```

## Error Handling Middleware

```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { createLogger } from '../utils/logger';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      requestId: req.id
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
        requestId: req.id
      });
    }

    // Record not found
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Record not found',
        errorCode: 'NOT_FOUND',
        requestId: req.id
      });
    }

    // Generic database error (don't leak details)
    return res.status(500).json({
      error: 'Database operation failed',
      errorCode: 'DATABASE_ERROR',
      requestId: req.id
    });
  }

  // Handle custom AppErrors
  if (error instanceof AppError) {
    log.warn('Application error', {
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      message: error.message
    });

    return res.status(error.statusCode).json({
      error: error.message,
      errorCode: error.errorCode,
      ...(error instanceof ValidationError && { fields: error.fields }),
      requestId: req.id
    });
  }

  // Handle unexpected errors (don't leak details in production)
  log.error('Unhandled error', error);

  const isProduction = process.env.NODE_ENV === 'production';

  res.status(500).json({
    error: isProduction
      ? 'An unexpected error occurred'
      : error.message,
    errorCode: 'INTERNAL_SERVER_ERROR',
    requestId: req.id,
    ...(isProduction ? {} : { stack: error.stack })
  });
};

// 404 handler (must be registered before errorHandler)
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const log = createLogger(req);
  log.warn('Route not found', { method: req.method, path: req.path });

  res.status(404).json({
    error: `Cannot ${req.method} ${req.path}`,
    errorCode: 'ROUTE_NOT_FOUND',
    requestId: req.id
  });
};
```

## Input Validation with Zod

```typescript
// schemas/wine.schema.ts
import { z } from 'zod';
import { WineColor } from '@prisma/client';

export const createWineSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters'),

  vintage: z.number()
    .int('Vintage must be a whole number')
    .min(1900, 'Vintage must be 1900 or later')
    .max(new Date().getFullYear(), 'Vintage cannot be in the future'),

  producer: z.string()
    .min(1, 'Producer is required')
    .max(200, 'Producer must be less than 200 characters'),

  country: z.string()
    .min(1, 'Country is required')
    .max(100, 'Country must be less than 100 characters'),

  region: z.string()
    .max(200, 'Region must be less than 200 characters')
    .optional(),

  color: z.nativeEnum(WineColor, {
    errorMap: () => ({ message: 'Invalid wine color' })
  }),

  quantity: z.number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .default(1),

  notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional()
});

export const updateWineSchema = createWineSchema.partial();

// Validation middleware
export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error); // Pass to error handler
    }
  };
};

// Usage:
app.post('/api/wines', validate(createWineSchema), async (req, res, next) => {
  // req.body is now validated and typed
});
```

## Frontend Error Handling

### React Error Boundary

```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logger.error('React error boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          color: '#C73E3A'
        }}>
          <h2>Something went wrong</h2>
          <p>We've been notified and are looking into it.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              backgroundColor: '#7C2D3C',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage in layout:
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### API Error Handling

```typescript
// utils/api.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errorCode?: string,
    public requestId?: string,
    public fields?: Record<string, string[]>
  ) {
    super(message);
  }
}

export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.error || 'An error occurred',
        data.errorCode,
        data.requestId,
        data.fields
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network errors
    throw new ApiError(
      0,
      error instanceof Error ? error.message : 'Network error'
    );
  }
}

// Usage with error handling:
try {
  const wine = await fetchApi<Wine>(`/api/wines/${id}`);
  setWine(wine);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.statusCode === 404) {
      toast.error('Wine not found');
    } else if (error.statusCode === 400 && error.fields) {
      // Show field-specific errors
      Object.entries(error.fields).forEach(([field, errors]) => {
        toast.error(`${field}: ${errors.join(', ')}`);
      });
    } else {
      toast.error(error.message);
    }
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

## Sentry Integration

### Backend Setup

```typescript
// apps/api/src/server.ts
import * as Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1, // 10% of requests
    beforeSend(event, hint) {
      // Filter out operational errors from alerts
      const error = hint.originalException;
      if (error instanceof AppError && error.isOperational) {
        return null;
      }
      return event;
    }
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// ... routes ...

if (process.env.NODE_ENV === 'production') {
  app.use(Sentry.Handlers.errorHandler());
}

app.use(errorHandler);
```

### Frontend Setup

```typescript
// apps/web/src/app/layout.tsx
import * as Sentry from '@sentry/nextjs';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
  });
}
```

## HTTP Request Logging

```typescript
// middleware/httpLogger.ts
import morgan from 'morgan';
import { httpLogStream } from '@wine-cellar/logger';

// Custom format including request ID
morgan.token('request-id', (req: Request) => req.id);

export const httpLogger = morgan(
  ':request-id :method :url :status :response-time ms - :res[content-length]',
  { stream: httpLogStream }
);

// Usage:
app.use(requestIdMiddleware);
app.use(httpLogger);
```

## Production Monitoring

### Health Check Endpoint

```typescript
// routes/health.ts
import { Router } from 'express';
import { prisma } from '@wine-cellar/database';

const router = Router();

router.get('/health', async (req, res) => {
  const checks = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    database: 'unknown',
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'connected';
  } catch (error) {
    checks.database = 'disconnected';
  }

  const isHealthy = checks.database === 'connected';

  res.status(isHealthy ? 200 : 503).json(checks);
});

export default router;
```

### Log Aggregation

**For Production:**
- Use log aggregation service (Datadog, LogDNA, CloudWatch)
- Set up alerts for error rate spikes
- Create dashboards for key metrics
- Configure log retention policies

## Error Response Standards

### Consistent Format

```typescript
interface ErrorResponse {
  error: string;              // Human-readable message
  errorCode: string;          // Machine-readable code
  requestId: string;          // For support tracking
  fields?: Record<string, string[]>; // Validation errors
  timestamp?: string;         // When error occurred
}

// Example responses:

// 400 Validation Error
{
  "error": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "requestId": "abc-123",
  "fields": {
    "vintage": ["Must be between 1900 and 2024"],
    "name": ["Name is required"]
  }
}

// 404 Not Found
{
  "error": "Wine with ID 'abc' not found",
  "errorCode": "NOT_FOUND",
  "requestId": "abc-123"
}

// 500 Internal Server Error
{
  "error": "An unexpected error occurred",
  "errorCode": "INTERNAL_SERVER_ERROR",
  "requestId": "abc-123"
}
```

## Testing Error Scenarios

```typescript
// __tests__/errorHandling.test.ts
describe('Error Handling', () => {
  it('returns 404 for non-existent wine', async () => {
    const response = await request(app)
      .get('/api/wines/invalid-id');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: expect.stringContaining('not found'),
      errorCode: 'NOT_FOUND',
      requestId: expect.any(String)
    });
  });

  it('returns 400 for invalid vintage', async () => {
    const response = await request(app)
      .post('/api/wines')
      .send({ name: 'Test', vintage: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    expect(response.body.fields?.vintage).toBeDefined();
  });

  it('handles database errors gracefully', async () => {
    // Mock database failure
    jest.spyOn(prisma.wine, 'create').mockRejectedValue(
      new Error('Database connection lost')
    );

    const response = await request(app)
      .post('/api/wines')
      .send(validWineData);

    expect(response.status).toBe(500);
    expect(response.body.errorCode).toBe('INTERNAL_SERVER_ERROR');
    expect(response.body.error).not.toContain('Database connection'); // Don't leak details
  });
});
```

## Best Practices Checklist

- [ ] Use structured logging (JSON format)
- [ ] Include request IDs in all logs and errors
- [ ] Log at appropriate levels (error, warn, info, debug)
- [ ] Never log sensitive data (passwords, tokens, PII)
- [ ] Use custom error classes for different scenarios
- [ ] Return consistent error response format
- [ ] Don't leak internal details in production errors
- [ ] Implement error boundaries in React
- [ ] Track errors with Sentry or similar
- [ ] Set up alerts for critical errors
- [ ] Log rotation and retention policies
- [ ] Test error scenarios in unit tests
- [ ] Monitor error rates in production
- [ ] Document error codes for API consumers

## Common Mistakes to Avoid

### ❌ Don't:

1. **Swallow errors silently**
   ```typescript
   try {
     await doSomething();
   } catch (error) {
     // Nothing - error is lost!
   }
   ```

2. **Log sensitive data**
   ```typescript
   logger.info('User login', { password: user.password }); // BAD!
   ```

3. **Use console.log in production**
   ```typescript
   console.log('Debug info'); // Use logger instead
   ```

4. **Return stack traces to users**
   ```typescript
   res.status(500).json({ error: error.stack }); // Security risk!
   ```

### ✅ Do:

1. **Always handle errors**
   ```typescript
   try {
     await doSomething();
   } catch (error) {
     logger.error('Operation failed', error);
     throw new AppError(500, 'Operation failed');
   }
   ```

2. **Use contextual logging**
   ```typescript
   logger.info('User login', { userId: user.id, email: user.email });
   ```

3. **Use proper logger**
   ```typescript
   logger.debug('Debug info', { context });
   ```

4. **Sanitize error messages**
   ```typescript
   const message = isProduction
     ? 'An error occurred'
     : error.message;
   ```

## When to Update This Skill

- After discovering new error patterns in production
- When adding new error types or scenarios
- If logging strategy changes
- When integrating new monitoring tools
- After security audits reveal error handling issues
