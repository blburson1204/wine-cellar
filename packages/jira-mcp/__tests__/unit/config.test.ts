import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Will import from src/config.ts once implemented
// import { loadConfig, validateConfig } from '../../src/config.js';

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('loadConfig', () => {
    it('should load config from environment variables', async () => {
      process.env.JIRA_URL = 'https://test.atlassian.net';
      process.env.JIRA_EMAIL = 'user@test.com';
      process.env.JIRA_API_TOKEN = 'test-token-123';
      process.env.JIRA_PROJECT_KEY = 'WC';

      const { loadConfig } = await import('../../src/config.js');
      const config = loadConfig();

      expect(config.jiraUrl).toBe('https://test.atlassian.net');
      expect(config.auth.email).toBe('user@test.com');
      expect(config.auth.apiToken).toBe('test-token-123');
      expect(config.projectKey).toBe('WC');
    });

    it('should throw when JIRA_URL is missing', async () => {
      process.env.JIRA_EMAIL = 'user@test.com';
      process.env.JIRA_API_TOKEN = 'test-token-123';
      process.env.JIRA_PROJECT_KEY = 'WC';
      delete process.env.JIRA_URL;

      const { loadConfig } = await import('../../src/config.js');
      expect(() => loadConfig()).toThrow();
    });

    it('should throw when JIRA_EMAIL is missing', async () => {
      process.env.JIRA_URL = 'https://test.atlassian.net';
      process.env.JIRA_API_TOKEN = 'test-token-123';
      process.env.JIRA_PROJECT_KEY = 'WC';
      delete process.env.JIRA_EMAIL;

      const { loadConfig } = await import('../../src/config.js');
      expect(() => loadConfig()).toThrow();
    });

    it('should throw when JIRA_API_TOKEN is missing', async () => {
      process.env.JIRA_URL = 'https://test.atlassian.net';
      process.env.JIRA_EMAIL = 'user@test.com';
      process.env.JIRA_PROJECT_KEY = 'WC';
      delete process.env.JIRA_API_TOKEN;

      const { loadConfig } = await import('../../src/config.js');
      expect(() => loadConfig()).toThrow();
    });

    it('should throw when JIRA_PROJECT_KEY is missing', async () => {
      process.env.JIRA_URL = 'https://test.atlassian.net';
      process.env.JIRA_EMAIL = 'user@test.com';
      process.env.JIRA_API_TOKEN = 'test-token-123';
      delete process.env.JIRA_PROJECT_KEY;

      const { loadConfig } = await import('../../src/config.js');
      expect(() => loadConfig()).toThrow();
    });

    it('should throw for invalid URL format', async () => {
      process.env.JIRA_URL = 'not-a-url';
      process.env.JIRA_EMAIL = 'user@test.com';
      process.env.JIRA_API_TOKEN = 'test-token-123';
      process.env.JIRA_PROJECT_KEY = 'WC';

      const { loadConfig } = await import('../../src/config.js');
      expect(() => loadConfig()).toThrow();
    });
  });

  describe('default mappings', () => {
    it('should include default status transitions', async () => {
      process.env.JIRA_URL = 'https://test.atlassian.net';
      process.env.JIRA_EMAIL = 'user@test.com';
      process.env.JIRA_API_TOKEN = 'test-token-123';
      process.env.JIRA_PROJECT_KEY = 'WC';

      const { loadConfig } = await import('../../src/config.js');
      const config = loadConfig();

      expect(config.mappings.statusTransitions).toEqual({
        pending: 'To Do',
        in_progress: 'In Progress',
        completed: 'Done',
        blocked: 'Blocked',
      });
    });

    it('should use default issue types', async () => {
      process.env.JIRA_URL = 'https://test.atlassian.net';
      process.env.JIRA_EMAIL = 'user@test.com';
      process.env.JIRA_API_TOKEN = 'test-token-123';
      process.env.JIRA_PROJECT_KEY = 'WC';

      const { loadConfig } = await import('../../src/config.js');
      const config = loadConfig();

      expect(config.mappings.storyIssueType).toBe('Task');
      expect(config.mappings.verifyIssueType).toBe('Subtask');
      expect(config.mappings.epicIssueType).toBe('Epic');
    });
  });
});
