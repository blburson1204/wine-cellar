import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiError, fetchApi, getErrorMessage } from '../src/utils/api';

describe('api utils', () => {
  describe('ApiError', () => {
    it('creates ApiError with required parameters', () => {
      const error = new ApiError(404, 'Not found');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.name).toBe('ApiError');
    });

    it('creates ApiError with all parameters', () => {
      const fields = { name: ['Required'], email: ['Invalid format'] };
      const error = new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', 'req-123', fields);

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Validation failed');
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.requestId).toBe('req-123');
      expect(error.fields).toEqual(fields);
    });

    it('creates ApiError with optional parameters undefined', () => {
      const error = new ApiError(500, 'Server error');

      expect(error.errorCode).toBeUndefined();
      expect(error.requestId).toBeUndefined();
      expect(error.fields).toBeUndefined();
    });
  });

  describe('fetchApi', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('makes successful GET request', async () => {
      const mockData = { id: '1', name: 'Test' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await fetchApi('/api/test');

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockData);
    });

    it('makes successful POST request with body', async () => {
      const mockData = { id: '1', name: 'Test' };
      const requestBody = { name: 'New Item' };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockData,
      });

      const result = await fetchApi('/api/test', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockData);
    });

    it('handles 204 No Content response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
      });

      const result = await fetchApi('/api/test');

      expect(result).toBeUndefined();
    });

    it('merges custom headers with default headers', async () => {
      const mockData = { success: true };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      await fetchApi('/api/test', {
        headers: {
          Authorization: 'Bearer token123',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token123',
        },
      });
    });

    it('throws ApiError on 404 response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Resource not found' }),
      });

      await expect(fetchApi('/api/test')).rejects.toThrow(ApiError);
      await expect(fetchApi('/api/test')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Resource not found',
      });
    });

    it('throws ApiError on 400 validation error with fields', async () => {
      const fields = { name: ['Required'], email: ['Invalid format'] };
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Validation failed',
          errorCode: 'VALIDATION_ERROR',
          requestId: 'req-123',
          fields,
        }),
      });

      await expect(fetchApi('/api/test')).rejects.toMatchObject({
        statusCode: 400,
        message: 'Validation failed',
        errorCode: 'VALIDATION_ERROR',
        requestId: 'req-123',
        fields,
      });
    });

    it('throws ApiError on 500 server error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      await expect(fetchApi('/api/test')).rejects.toMatchObject({
        statusCode: 500,
        message: 'Internal server error',
      });
    });

    it('uses default error message when error field is missing', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      await expect(fetchApi('/api/test')).rejects.toMatchObject({
        statusCode: 500,
        message: 'An error occurred',
      });
    });

    it('handles network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

      await expect(fetchApi('/api/test')).rejects.toMatchObject({
        statusCode: 0,
        message: 'Network failure',
      });
    });

    it('handles fetch errors without message', async () => {
      global.fetch = vi.fn().mockRejectedValue('Unknown error');

      await expect(fetchApi('/api/test')).rejects.toMatchObject({
        statusCode: 0,
        message: 'Network error occurred',
      });
    });

    it('rethrows ApiError without wrapping', async () => {
      const originalError = new ApiError(404, 'Not found', 'NOT_FOUND', 'req-456');

      global.fetch = vi.fn().mockRejectedValue(originalError);

      await expect(fetchApi('/api/test')).rejects.toBe(originalError);
    });

    it('handles JSON parsing errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(fetchApi('/api/test')).rejects.toMatchObject({
        statusCode: 0,
        message: 'Invalid JSON',
      });
    });
  });

  describe('getErrorMessage', () => {
    it('returns message from ApiError', () => {
      const error = new ApiError(404, 'Resource not found');

      expect(getErrorMessage(error)).toBe('Resource not found');
    });

    it('returns formatted field errors from ApiError', () => {
      const fields = { name: ['Required'], email: ['Invalid format'] };
      const error = new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', 'req-123', fields);

      const message = getErrorMessage(error);
      expect(message).toContain('name: Required');
      expect(message).toContain('email: Invalid format');
    });

    it('returns message with multiple errors per field', () => {
      const fields = { password: ['Too short', 'Missing special character'] };
      const error = new ApiError(400, 'Validation failed', undefined, undefined, fields);

      const message = getErrorMessage(error);
      expect(message).toBe('password: Too short, Missing special character');
    });

    it('returns message with multiple fields', () => {
      const fields = {
        name: ['Required'],
        email: ['Required', 'Invalid format'],
      };
      const error = new ApiError(400, 'Validation failed', undefined, undefined, fields);

      const message = getErrorMessage(error);
      expect(message).toContain('name: Required');
      expect(message).toContain('email: Required, Invalid format');
    });

    it('returns ApiError message when fields is empty object', () => {
      const error = new ApiError(400, 'Validation failed', undefined, undefined, {});

      expect(getErrorMessage(error)).toBe('Validation failed');
    });

    it('returns message from standard Error', () => {
      const error = new Error('Something went wrong');

      expect(getErrorMessage(error)).toBe('Something went wrong');
    });

    it('returns default message for unknown error type', () => {
      expect(getErrorMessage('string error')).toBe('An unexpected error occurred');
      expect(getErrorMessage(123)).toBe('An unexpected error occurred');
      expect(getErrorMessage(null)).toBe('An unexpected error occurred');
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
    });

    it('returns default message for object without message', () => {
      expect(getErrorMessage({ code: 'ERROR' })).toBe('An unexpected error occurred');
    });
  });
});
