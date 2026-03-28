/**
 * Integration tests for notify.ts CLI
 *
 * Tests the CLI entry point for hook-triggered webhook notifications:
 * - Webhook dispatch on phase transition
 * - Webhook dispatch on task completion
 * - Webhook dispatch on milestone events
 * - Graceful no-op when unconfigured
 * - Fire-and-forget on HTTP failure
 *
 * Spec: 007-slack-integration-progress
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock config before imports
const mockLoadConfig = vi.fn();
vi.mock('../../src/config.js', () => ({
  loadConfig: mockLoadConfig,
}));

// Mock slack-client to capture calls
const mockPostWebhook = vi.fn();
vi.mock('../../src/slack-client.js', () => ({
  SlackClient: vi.fn().mockImplementation(() => ({
    postWebhook: mockPostWebhook,
    postMessage: vi.fn().mockResolvedValue(true),
  })),
  SlackClientError: class SlackClientError extends Error {
    constructor(
      message: string,
      public readonly statusCode?: number,
      public readonly slackError?: string
    ) {
      super(message);
      this.name = 'SlackClientError';
    }
  },
}));

describe('notify CLI', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('phase transition events', () => {
    it('should dispatch webhook notification for phase_transition event', async () => {
      mockLoadConfig.mockReturnValue({
        mode: 'webhook',
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
        timeoutMs: 10000,
      });
      mockPostWebhook.mockResolvedValue(true);

      const event = {
        type: 'phase_transition',
        specId: '007-slack-integration-progress',
        specName: 'Slack Integration Progress',
        timestamp: new Date().toISOString(),
        details: {
          fromPhase: 'specify',
          toPhase: 'plan',
        },
      };

      const { processEvent } = await import('../../src/notify.js');
      const result = await processEvent(event);

      expect(result).toBe(true);
      expect(mockPostWebhook).toHaveBeenCalledTimes(1);
      expect(mockPostWebhook).toHaveBeenCalledWith(
        expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({
              type: 'header',
            }),
          ]),
        })
      );
    });
  });

  describe('task completion events', () => {
    it('should dispatch webhook notification for task_completion event', async () => {
      mockLoadConfig.mockReturnValue({
        mode: 'webhook',
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
        timeoutMs: 10000,
      });
      mockPostWebhook.mockResolvedValue(true);

      const event = {
        type: 'task_completion',
        specId: '007-slack-integration-progress',
        specName: 'Slack Integration Progress',
        timestamp: new Date().toISOString(),
        details: {
          taskId: 'T001',
          taskDescription: 'Initialize packages/slack-mcp/ scaffolding',
          status: 'completed',
        },
      };

      const { processEvent } = await import('../../src/notify.js');
      const result = await processEvent(event);

      expect(result).toBe(true);
      expect(mockPostWebhook).toHaveBeenCalledTimes(1);
      expect(mockPostWebhook).toHaveBeenCalledWith(
        expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({
              type: 'header',
            }),
          ]),
        })
      );
    });
  });

  describe('milestone events', () => {
    it('should dispatch webhook notification for milestone event', async () => {
      mockLoadConfig.mockReturnValue({
        mode: 'webhook',
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
        timeoutMs: 10000,
      });
      mockPostWebhook.mockResolvedValue(true);

      const event = {
        type: 'milestone',
        specId: '007-slack-integration-progress',
        specName: 'Slack Integration Progress',
        timestamp: new Date().toISOString(),
        details: {
          milestone: 'spec_created',
          summary: 'Spec 007-slack-integration-progress has been created',
        },
      };

      const { processEvent } = await import('../../src/notify.js');
      const result = await processEvent(event);

      expect(result).toBe(true);
      expect(mockPostWebhook).toHaveBeenCalledTimes(1);
      expect(mockPostWebhook).toHaveBeenCalledWith(
        expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({
              type: 'header',
            }),
          ]),
        })
      );
    });
  });

  describe('graceful no-op when unconfigured', () => {
    it('should return true and not dispatch when mode is noop', async () => {
      mockLoadConfig.mockReturnValue({
        mode: 'noop',
        timeoutMs: 10000,
      });

      const event = {
        type: 'phase_transition',
        specId: '007-slack-integration-progress',
        specName: 'Slack Integration Progress',
        timestamp: new Date().toISOString(),
        details: {
          fromPhase: 'specify',
          toPhase: 'plan',
        },
      };

      const { processEvent } = await import('../../src/notify.js');
      const result = await processEvent(event);

      // Should return true (success) even when unconfigured - this is graceful no-op
      expect(result).toBe(true);
      expect(mockPostWebhook).not.toHaveBeenCalled();
    });

    it('should not throw when SLACK_WEBHOOK_URL is missing', async () => {
      mockLoadConfig.mockReturnValue({
        mode: 'noop',
        timeoutMs: 10000,
      });

      const event = {
        type: 'task_completion',
        specId: '007-test',
        specName: 'Test',
        timestamp: new Date().toISOString(),
        details: {
          taskId: 'T001',
          taskDescription: 'Test task',
          status: 'completed',
        },
      };

      const { processEvent } = await import('../../src/notify.js');

      // Should not throw
      await expect(processEvent(event)).resolves.toBe(true);
    });
  });

  describe('fire-and-forget on HTTP failure', () => {
    it('should return false but not throw on webhook failure', async () => {
      mockLoadConfig.mockReturnValue({
        mode: 'webhook',
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
        timeoutMs: 10000,
      });
      mockPostWebhook.mockResolvedValue(false);

      const event = {
        type: 'phase_transition',
        specId: '007-slack-integration-progress',
        specName: 'Slack Integration Progress',
        timestamp: new Date().toISOString(),
        details: {
          fromPhase: 'plan',
          toPhase: 'tasks',
        },
      };

      const { processEvent } = await import('../../src/notify.js');
      const result = await processEvent(event);

      // Fire-and-forget: returns false but doesn't throw
      expect(result).toBe(false);
      expect(mockPostWebhook).toHaveBeenCalledTimes(1);
    });

    it('should exit 0 even when webhook POST fails', async () => {
      mockLoadConfig.mockReturnValue({
        mode: 'webhook',
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
        timeoutMs: 10000,
      });
      mockPostWebhook.mockResolvedValue(false);

      const event = {
        type: 'milestone',
        specId: '007-test',
        specName: 'Test',
        timestamp: new Date().toISOString(),
        details: {
          milestone: 'all_tasks_complete',
          summary: 'All tasks completed',
        },
      };

      const { processEvent } = await import('../../src/notify.js');

      // Should not throw - fire-and-forget pattern
      await expect(processEvent(event)).resolves.not.toThrow();
    });
  });
});
