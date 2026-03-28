import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Will import from src/config.ts once implemented
// import { loadConfig } from '../../src/config.js';

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // Clear all Slack-related env vars
    delete process.env.SLACK_WEBHOOK_URL;
    delete process.env.SLACK_BOT_TOKEN;
    delete process.env.SLACK_CHANNEL;
    delete process.env.SLACK_TIMEOUT_MS;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('mode detection', () => {
    it('should return mode=webhook when only SLACK_WEBHOOK_URL is set', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/T00/B00/xxx';

      const { loadConfig } = await import('../../src/config.js');
      const config = loadConfig();

      expect(config.mode).toBe('webhook');
      expect(config.webhookUrl).toBe('https://hooks.slack.com/services/T00/B00/xxx');
    });

    it('should return mode=mcp when only SLACK_BOT_TOKEN and SLACK_CHANNEL are set', async () => {
      process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
      process.env.SLACK_CHANNEL = '#general';

      const { loadConfig } = await import('../../src/config.js');
      const config = loadConfig();

      expect(config.mode).toBe('mcp');
      expect(config.botToken).toBe('xoxb-test-token');
      expect(config.channel).toBe('#general');
    });

    it('should return mode=both when all credentials are set', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/T00/B00/xxx';
      process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
      process.env.SLACK_CHANNEL = '#general';

      const { loadConfig } = await import('../../src/config.js');
      const config = loadConfig();

      expect(config.mode).toBe('both');
      expect(config.webhookUrl).toBe('https://hooks.slack.com/services/T00/B00/xxx');
      expect(config.botToken).toBe('xoxb-test-token');
      expect(config.channel).toBe('#general');
    });

    it('should return mode=noop when no credentials are set', async () => {
      const { loadConfig } = await import('../../src/config.js');
      const config = loadConfig();

      expect(config.mode).toBe('noop');
      expect(config.webhookUrl).toBeUndefined();
      expect(config.botToken).toBeUndefined();
      expect(config.channel).toBeUndefined();
    });
  });

  describe('env var validation', () => {
    it('should throw for invalid webhook URL format', async () => {
      process.env.SLACK_WEBHOOK_URL = 'not-a-valid-url';

      const { loadConfig } = await import('../../src/config.js');
      expect(() => loadConfig()).toThrow(/URL/i);
    });

    it('should throw when bot token does not start with xoxb-', async () => {
      process.env.SLACK_BOT_TOKEN = 'invalid-token';
      process.env.SLACK_CHANNEL = '#general';

      const { loadConfig } = await import('../../src/config.js');
      expect(() => loadConfig()).toThrow(/xoxb-/i);
    });

    it('should throw when SLACK_BOT_TOKEN is set without SLACK_CHANNEL', async () => {
      process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';

      const { loadConfig } = await import('../../src/config.js');
      expect(() => loadConfig()).toThrow(/SLACK_CHANNEL/i);
    });
  });

  describe('timeout parsing', () => {
    it('should parse SLACK_TIMEOUT_MS as integer', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/T00/B00/xxx';
      process.env.SLACK_TIMEOUT_MS = '5000';

      const { loadConfig } = await import('../../src/config.js');
      const config = loadConfig();

      expect(config.timeoutMs).toBe(5000);
    });

    it('should throw for negative timeout', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/T00/B00/xxx';
      process.env.SLACK_TIMEOUT_MS = '-100';

      const { loadConfig } = await import('../../src/config.js');
      expect(() => loadConfig()).toThrow(/timeout/i);
    });

    it('should throw for non-numeric timeout', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/T00/B00/xxx';
      process.env.SLACK_TIMEOUT_MS = 'not-a-number';

      const { loadConfig } = await import('../../src/config.js');
      expect(() => loadConfig()).toThrow();
    });
  });

  describe('defaults', () => {
    it('should use default timeout of 10000ms when not specified', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/T00/B00/xxx';

      const { loadConfig } = await import('../../src/config.js');
      const config = loadConfig();

      expect(config.timeoutMs).toBe(10000);
    });

    it('should respect maximum timeout of 30000ms', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/T00/B00/xxx';
      process.env.SLACK_TIMEOUT_MS = '60000';

      const { loadConfig } = await import('../../src/config.js');
      expect(() => loadConfig()).toThrow(/timeout/i);
    });
  });
});
