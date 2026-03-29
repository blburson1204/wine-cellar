import { Request, Response, NextFunction } from 'express';

/**
 * Creates a Basic Auth middleware for Express.
 *
 * When AUTH_USERNAME and AUTH_PASSWORD env vars are set:
 * - Requires HTTP Basic Auth on all routes except /api/health
 * - Returns 401 with WWW-Authenticate header for invalid/missing credentials
 *
 * When env vars are not set (development mode):
 * - Passes through all requests without authentication
 */
export const createBasicAuthMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const username = process.env.AUTH_USERNAME;
    const password = process.env.AUTH_PASSWORD;

    // Skip auth if credentials aren't configured (development mode)
    if (!username || !password) {
      return next();
    }

    // Always allow health check without auth
    if (req.path === '/api/health') {
      return next();
    }

    // Check for Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Wine Cellar"');
      res.status(401).send('Authentication required');
      return;
    }

    // Decode and verify credentials
    try {
      const base64Credentials = authHeader.slice(6); // Remove 'Basic ' prefix
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
      const colonIndex = credentials.indexOf(':');

      if (colonIndex === -1) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Wine Cellar"');
        res.status(401).send('Authentication required');
        return;
      }

      const providedUsername = credentials.slice(0, colonIndex);
      const providedPassword = credentials.slice(colonIndex + 1);

      if (providedUsername === username && providedPassword === password) {
        return next();
      }

      // Invalid credentials
      res.setHeader('WWW-Authenticate', 'Basic realm="Wine Cellar"');
      res.status(401).send('Authentication required');
    } catch {
      // Malformed Base64 or other error
      res.setHeader('WWW-Authenticate', 'Basic realm="Wine Cellar"');
      res.status(401).send('Authentication required');
    }
  };
};
