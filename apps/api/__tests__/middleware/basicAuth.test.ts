import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { createBasicAuthMiddleware } from '../../src/middleware/basicAuth';

describe('basicAuth middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let setHeaderMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;
  let sendMock: ReturnType<typeof vi.fn>;

  const originalEnv = { ...process.env };

  beforeEach(() => {
    setHeaderMock = vi.fn();
    sendMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ send: sendMock });

    mockReq = {
      path: '/api/wines',
      headers: {},
    };

    mockRes = {
      setHeader: setHeaderMock,
      status: statusMock,
    };

    mockNext = vi.fn();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('when AUTH_USERNAME and AUTH_PASSWORD are set', () => {
    beforeEach(() => {
      process.env.AUTH_USERNAME = 'testuser';
      process.env.AUTH_PASSWORD = 'testpass';
    });

    it('returns 401 when no Authorization header is present', () => {
      const middleware = createBasicAuthMiddleware();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(setHeaderMock).toHaveBeenCalledWith('WWW-Authenticate', 'Basic realm="Wine Cellar"');
      expect(sendMock).toHaveBeenCalledWith('Authentication required');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('returns 401 when Authorization header is not Basic auth', () => {
      mockReq.headers = { authorization: 'Bearer sometoken' };
      const middleware = createBasicAuthMiddleware();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(setHeaderMock).toHaveBeenCalledWith('WWW-Authenticate', 'Basic realm="Wine Cellar"');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('returns 401 when credentials are incorrect', () => {
      // Base64 encode "wronguser:wrongpass"
      const credentials = Buffer.from('wronguser:wrongpass').toString('base64');
      mockReq.headers = { authorization: `Basic ${credentials}` };
      const middleware = createBasicAuthMiddleware();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(setHeaderMock).toHaveBeenCalledWith('WWW-Authenticate', 'Basic realm="Wine Cellar"');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('returns 401 when username is correct but password is wrong', () => {
      const credentials = Buffer.from('testuser:wrongpass').toString('base64');
      mockReq.headers = { authorization: `Basic ${credentials}` };
      const middleware = createBasicAuthMiddleware();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('calls next() when credentials are correct', () => {
      const credentials = Buffer.from('testuser:testpass').toString('base64');
      mockReq.headers = { authorization: `Basic ${credentials}` };
      const middleware = createBasicAuthMiddleware();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('allows /api/health without authentication', () => {
      mockReq.path = '/api/health';
      mockReq.headers = {}; // No auth header
      const middleware = createBasicAuthMiddleware();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('requires auth for /api/wines', () => {
      mockReq.path = '/api/wines';
      mockReq.headers = {}; // No auth header
      const middleware = createBasicAuthMiddleware();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('handles malformed Base64 credentials gracefully', () => {
      mockReq.headers = { authorization: 'Basic !!!invalid-base64!!!' };
      const middleware = createBasicAuthMiddleware();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('handles credentials without colon separator', () => {
      const credentials = Buffer.from('nocolon').toString('base64');
      mockReq.headers = { authorization: `Basic ${credentials}` };
      const middleware = createBasicAuthMiddleware();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('when AUTH_USERNAME or AUTH_PASSWORD is not set', () => {
    it('passes through when AUTH_USERNAME is not set', () => {
      delete process.env.AUTH_USERNAME;
      delete process.env.AUTH_PASSWORD;
      const middleware = createBasicAuthMiddleware();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('passes through when AUTH_PASSWORD is not set', () => {
      process.env.AUTH_USERNAME = 'testuser';
      delete process.env.AUTH_PASSWORD;
      const middleware = createBasicAuthMiddleware();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('passes through when both are empty strings', () => {
      process.env.AUTH_USERNAME = '';
      process.env.AUTH_PASSWORD = '';
      const middleware = createBasicAuthMiddleware();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe('protected routes', () => {
    beforeEach(() => {
      process.env.AUTH_USERNAME = 'admin';
      process.env.AUTH_PASSWORD = 'secret';
    });

    it('requires auth for POST /api/wines', () => {
      mockReq.path = '/api/wines';
      mockReq.headers = {};
      const middleware = createBasicAuthMiddleware();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('requires auth for /api/wines/123', () => {
      mockReq.path = '/api/wines/123';
      mockReq.headers = {};
      const middleware = createBasicAuthMiddleware();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('requires auth for /api/wines/123/image', () => {
      mockReq.path = '/api/wines/123/image';
      mockReq.headers = {};
      const middleware = createBasicAuthMiddleware();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('requires auth for /api/docs', () => {
      mockReq.path = '/api/docs';
      mockReq.headers = {};
      const middleware = createBasicAuthMiddleware();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });
});
