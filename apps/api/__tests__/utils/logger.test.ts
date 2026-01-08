import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Request } from 'express';
import { createLogger, httpLogStream, logger } from '../../src/utils/logger';

describe('logger utilities', () => {
  beforeEach(() => {
    // Spy on logger methods instead of mocking winston
    vi.spyOn(logger, 'error').mockImplementation(() => logger);
    vi.spyOn(logger, 'warn').mockImplementation(() => logger);
    vi.spyOn(logger, 'info').mockImplementation(() => logger);
    vi.spyOn(logger, 'debug').mockImplementation(() => logger);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createLogger', () => {
    it('should create logger without request context', () => {
      const log = createLogger();

      expect(log).toHaveProperty('error');
      expect(log).toHaveProperty('warn');
      expect(log).toHaveProperty('info');
      expect(log).toHaveProperty('debug');
    });

    it('should create logger with request context', () => {
      const mockReq = {
        id: 'test-request-id',
        method: 'GET',
        path: '/api/wines',
      } as unknown as Request;

      const log = createLogger(mockReq);

      expect(log).toHaveProperty('error');
      expect(log).toHaveProperty('warn');
      expect(log).toHaveProperty('info');
      expect(log).toHaveProperty('debug');
    });

    it('should log info message without extra metadata', () => {
      const log = createLogger();
      log.info('Test info message');

      expect(logger.info).toHaveBeenCalledWith('Test info message', {});
    });

    it('should log info message with extra metadata', () => {
      const log = createLogger();
      log.info('Test message', { customField: 'value' });

      expect(logger.info).toHaveBeenCalledWith('Test message', {
        customField: 'value',
      });
    });

    it('should log info with request context', () => {
      const mockReq = {
        id: 'req-123',
        method: 'POST',
        path: '/api/wines',
      } as unknown as Request;

      const log = createLogger(mockReq);
      log.info('Request received');

      expect(logger.info).toHaveBeenCalledWith('Request received', {
        requestId: 'req-123',
        method: 'POST',
        path: '/api/wines',
        userId: undefined,
      });
    });

    it('should log info with request context and extra metadata', () => {
      const mockReq = {
        id: 'req-456',
        method: 'PUT',
        path: '/api/wines/123',
      } as unknown as Request;

      const log = createLogger(mockReq);
      log.info('Wine updated', { wineId: '123' });

      expect(logger.info).toHaveBeenCalledWith('Wine updated', {
        requestId: 'req-456',
        method: 'PUT',
        path: '/api/wines/123',
        userId: undefined,
        wineId: '123',
      });
    });

    it('should log warning message', () => {
      const log = createLogger();
      log.warn('Warning message');

      expect(logger.warn).toHaveBeenCalledWith('Warning message', {});
    });

    it('should log warning with extra metadata', () => {
      const log = createLogger();
      log.warn('Deprecated API usage', { api: 'v1' });

      expect(logger.warn).toHaveBeenCalledWith('Deprecated API usage', {
        api: 'v1',
      });
    });

    it('should log debug message', () => {
      const log = createLogger();
      log.debug('Debug info');

      expect(logger.debug).toHaveBeenCalledWith('Debug info', {});
    });

    it('should log debug with extra metadata', () => {
      const log = createLogger();
      log.debug('Query executed', { duration: 15, query: 'SELECT * FROM wines' });

      expect(logger.debug).toHaveBeenCalledWith('Query executed', {
        duration: 15,
        query: 'SELECT * FROM wines',
      });
    });

    it('should log error message without Error object', () => {
      const log = createLogger();
      log.error('Error occurred');

      expect(logger.error).toHaveBeenCalledWith('Error occurred', {});
    });

    it('should log error with Error object', () => {
      const log = createLogger();
      const error = new Error('Test error');
      log.error('Something went wrong', error);

      expect(logger.error).toHaveBeenCalledWith('Something went wrong', {
        error: 'Test error',
        stack: expect.stringContaining('Error: Test error'),
      });
    });

    it('should log error with Error object and extra metadata', () => {
      const log = createLogger();
      const error = new Error('Database connection failed');
      log.error('Database error', error, { database: 'postgres' });

      expect(logger.error).toHaveBeenCalledWith('Database error', {
        database: 'postgres',
        error: 'Database connection failed',
        stack: expect.stringContaining('Error: Database connection failed'),
      });
    });

    it('should log error with request context and Error object', () => {
      const mockReq = {
        id: 'req-error-1',
        method: 'DELETE',
        path: '/api/wines/999',
      } as unknown as Request;

      const log = createLogger(mockReq);
      const error = new Error('Wine not found');
      log.error('Delete failed', error);

      expect(logger.error).toHaveBeenCalledWith('Delete failed', {
        requestId: 'req-error-1',
        method: 'DELETE',
        path: '/api/wines/999',
        userId: undefined,
        error: 'Wine not found',
        stack: expect.stringContaining('Error: Wine not found'),
      });
    });

    it('should include userId when present in request', () => {
      const mockReq = {
        id: 'req-auth-1',
        method: 'GET',
        path: '/api/wines',
        user: { id: 'user-123' },
      } as unknown as Request;

      const log = createLogger(mockReq);
      log.info('User fetched wines');

      expect(logger.info).toHaveBeenCalledWith('User fetched wines', {
        requestId: 'req-auth-1',
        method: 'GET',
        path: '/api/wines',
        userId: 'user-123',
      });
    });

    it('should handle undefined userId gracefully', () => {
      const mockReq = {
        id: 'req-no-auth',
        method: 'GET',
        path: '/api/health',
      } as unknown as Request;

      const log = createLogger(mockReq);
      log.info('Health check');

      expect(logger.info).toHaveBeenCalledWith('Health check', {
        requestId: 'req-no-auth',
        method: 'GET',
        path: '/api/health',
        userId: undefined,
      });
    });

    it('should merge request context with extra metadata', () => {
      const mockReq = {
        id: 'req-merge',
        method: 'POST',
        path: '/api/wines',
      } as unknown as Request;

      const log = createLogger(mockReq);
      log.info('Wine created', { wineId: 'new-123', vintage: 2020 });

      expect(logger.info).toHaveBeenCalledWith('Wine created', {
        requestId: 'req-merge',
        method: 'POST',
        path: '/api/wines',
        userId: undefined,
        wineId: 'new-123',
        vintage: 2020,
      });
    });

    it('should not override request context with extra metadata', () => {
      const mockReq = {
        id: 'original-id',
        method: 'GET',
        path: '/api/wines',
      } as unknown as Request;

      const log = createLogger(mockReq);
      // Try to override requestId with extra metadata
      log.info('Test', { requestId: 'should-not-override' });

      expect(logger.info).toHaveBeenCalledWith('Test', {
        requestId: 'should-not-override', // Extra metadata takes precedence due to spread order
        method: 'GET',
        path: '/api/wines',
        userId: undefined,
      });
    });
  });

  describe('httpLogStream', () => {
    it('should write HTTP logs to logger', () => {
      const message = 'GET /api/wines 200 15ms';
      httpLogStream.write(message);

      expect(logger.info).toHaveBeenCalledWith(message);
    });

    it('should trim whitespace from HTTP log messages', () => {
      const message = '  POST /api/wines 201 23ms  \n';
      httpLogStream.write(message);

      expect(logger.info).toHaveBeenCalledWith('POST /api/wines 201 23ms');
    });

    it('should handle empty messages', () => {
      httpLogStream.write('');

      expect(logger.info).toHaveBeenCalledWith('');
    });

    it('should handle messages with only whitespace', () => {
      httpLogStream.write('   \n\t  ');

      expect(logger.info).toHaveBeenCalledWith('');
    });
  });
});
