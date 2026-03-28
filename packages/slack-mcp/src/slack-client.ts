/**
 * Slack Client module for Slack MCP Server
 *
 * Provides SlackClient class for posting messages via webhook or bot API.
 * Implements fire-and-forget pattern: never throws, returns boolean success.
 * Uses AbortController for configurable request timeouts.
 *
 * Spec: 007-slack-integration-progress
 */

// ============================================================================
// SlackClientError
// ============================================================================

/**
 * Custom error class for Slack client errors.
 * Used for error typing and debugging, not thrown by fire-and-forget methods.
 */
export class SlackClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly slackError?: string
  ) {
    super(message);
    this.name = 'SlackClientError';
  }
}

// ============================================================================
// Types
// ============================================================================

export interface SlackClientOptions {
  webhookUrl?: string;
  botToken?: string;
  channel?: string;
  timeoutMs: number;
}

interface SlackApiResponse {
  ok: boolean;
  error?: string;
}

// ============================================================================
// SlackClient
// ============================================================================

/**
 * Client for posting messages to Slack via webhook or bot API.
 *
 * Implements fire-and-forget pattern:
 * - Never throws exceptions
 * - Returns true on success, false on any failure
 * - Logs errors internally but does not propagate them
 *
 * Uses AbortController for request timeouts.
 */
export class SlackClient {
  private readonly webhookUrl?: string;
  private readonly botToken?: string;
  private readonly channel?: string;
  private readonly timeoutMs: number;

  constructor(options: SlackClientOptions) {
    this.webhookUrl = options.webhookUrl;
    this.botToken = options.botToken;
    this.channel = options.channel;
    this.timeoutMs = options.timeoutMs;
  }

  /**
   * Post a message payload to the configured webhook URL.
   *
   * @param payload - Message payload (Block Kit or simple text)
   * @returns true on success, false on any failure
   */
  async postWebhook(payload: Record<string, unknown>): Promise<boolean> {
    if (!this.webhookUrl) {
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Fire-and-forget: log but don't throw
        return false;
      }

      return true;
    } catch {
      // Fire-and-forget: swallow all errors (network, timeout, etc.)
      clearTimeout(timeoutId);
      return false;
    }
  }

  /**
   * Post a message to Slack using the bot token and chat.postMessage API.
   *
   * @param payload - Message payload (Block Kit or simple text)
   * @returns true on success, false on any failure
   */
  async postMessage(payload: Record<string, unknown>): Promise<boolean> {
    if (!this.botToken || !this.channel) {
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.botToken}`,
        },
        body: JSON.stringify({
          channel: this.channel,
          ...payload,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // HTTP error
        return false;
      }

      // Check Slack API response
      const data = (await response.json()) as SlackApiResponse;
      if (!data.ok) {
        // Slack API error (e.g., channel_not_found)
        return false;
      }

      return true;
    } catch {
      // Fire-and-forget: swallow all errors
      clearTimeout(timeoutId);
      return false;
    }
  }
}
