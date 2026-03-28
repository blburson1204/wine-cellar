import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Will import from src/slack-client.ts once implemented
// import { SlackClient, SlackClientError } from '../../src/slack-client.js';

describe('SlackClient', () => {
  const mockFetch = vi.fn();
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
    globalThis.fetch = mockFetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('postWebhook', () => {
    it('should POST payload to webhook URL and return true on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve('ok'),
      });

      const { SlackClient } = await import('../../src/slack-client.js');
      const client = new SlackClient({
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
        timeoutMs: 5000,
      });

      const result = await client.postWebhook({ text: 'Hello' });

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/services/T00/B00/xxx',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'Hello' }),
        })
      );
    });

    it('should return false and not throw on HTTP 4xx error (fire-and-forget)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('invalid_payload'),
      });

      const { SlackClient } = await import('../../src/slack-client.js');
      const client = new SlackClient({
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
        timeoutMs: 5000,
      });

      const result = await client.postWebhook({ text: 'Hello' });

      expect(result).toBe(false);
    });

    it('should return false and not throw on HTTP 5xx error (fire-and-forget)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('internal_error'),
      });

      const { SlackClient } = await import('../../src/slack-client.js');
      const client = new SlackClient({
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
        timeoutMs: 5000,
      });

      const result = await client.postWebhook({ text: 'Hello' });

      expect(result).toBe(false);
    });

    it('should return false and not throw on HTTP 429 rate limit (fire-and-forget)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: () => Promise.resolve('rate_limited'),
      });

      const { SlackClient } = await import('../../src/slack-client.js');
      const client = new SlackClient({
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
        timeoutMs: 5000,
      });

      const result = await client.postWebhook({ text: 'Hello' });

      expect(result).toBe(false);
    });

    it('should return false and not throw on network failure (fire-and-forget)', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { SlackClient } = await import('../../src/slack-client.js');
      const client = new SlackClient({
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
        timeoutMs: 5000,
      });

      const result = await client.postWebhook({ text: 'Hello' });

      expect(result).toBe(false);
    });

    it('should abort request on timeout using AbortController', async () => {
      const abortError = new DOMException('Aborted', 'AbortError');
      mockFetch.mockRejectedValueOnce(abortError);

      const { SlackClient } = await import('../../src/slack-client.js');
      const client = new SlackClient({
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
        timeoutMs: 100, // Very short timeout
      });

      const result = await client.postWebhook({ text: 'Hello' });

      expect(result).toBe(false);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });
  });

  describe('postMessage', () => {
    it('should POST to Slack API with bot token and return true on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ok: true }),
      });

      const { SlackClient } = await import('../../src/slack-client.js');
      const client = new SlackClient({
        botToken: 'xoxb-test-token',
        channel: '#general',
        timeoutMs: 5000,
      });

      const result = await client.postMessage({ text: 'Hello' });

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://slack.com/api/chat.postMessage',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer xoxb-test-token',
          },
          body: expect.stringContaining('"channel":"#general"'),
        })
      );
    });

    it('should return false when Slack API response has ok:false (fire-and-forget)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ok: false, error: 'channel_not_found' }),
      });

      const { SlackClient } = await import('../../src/slack-client.js');
      const client = new SlackClient({
        botToken: 'xoxb-test-token',
        channel: '#invalid',
        timeoutMs: 5000,
      });

      const result = await client.postMessage({ text: 'Hello' });

      expect(result).toBe(false);
    });
  });

  describe('SlackClientError', () => {
    it('should be exported and usable for error typing', async () => {
      const { SlackClientError } = await import('../../src/slack-client.js');

      const error = new SlackClientError('Test error', 400, 'invalid_payload');

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.slackError).toBe('invalid_payload');
    });
  });
});
