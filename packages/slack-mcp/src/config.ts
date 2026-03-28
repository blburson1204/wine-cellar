/**
 * Configuration module for Slack MCP Server
 *
 * Handles environment variable validation and mode detection for Slack integration.
 * Supports webhook mode, MCP bot mode, both, or noop (unconfigured).
 *
 * Spec: 007-slack-integration-progress
 */

import { z } from 'zod';
import type { SlackConfig, SlackMode } from './types.js';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TIMEOUT_MS = 10000;
const MAX_TIMEOUT_MS = 30000;

// ============================================================================
// Zod Schemas
// ============================================================================

const webhookUrlSchema = z
  .string()
  .url('SLACK_WEBHOOK_URL must be a valid URL')
  .startsWith('https://', 'SLACK_WEBHOOK_URL must use HTTPS');

const botTokenSchema = z.string().refine((val) => val.startsWith('xoxb-'), {
  message: 'SLACK_BOT_TOKEN must start with xoxb-',
});

const channelSchema = z.string().min(1, 'SLACK_CHANNEL must not be empty');

const timeoutSchema = z
  .string()
  .optional()
  .transform((val) => {
    if (val === undefined || val === '') {
      return DEFAULT_TIMEOUT_MS;
    }
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      throw new Error('SLACK_TIMEOUT_MS must be a valid number');
    }
    return parsed;
  })
  .refine((val) => val >= 0, {
    message: 'SLACK_TIMEOUT_MS timeout must be non-negative',
  })
  .refine((val) => val <= MAX_TIMEOUT_MS, {
    message: `SLACK_TIMEOUT_MS timeout must not exceed ${MAX_TIMEOUT_MS}ms`,
  });

// ============================================================================
// Mode Detection
// ============================================================================

function detectMode(hasWebhook: boolean, hasBotToken: boolean, hasChannel: boolean): SlackMode {
  const webhookConfigured = hasWebhook;
  const mcpConfigured = hasBotToken && hasChannel;

  if (webhookConfigured && mcpConfigured) {
    return 'both';
  }
  if (webhookConfigured) {
    return 'webhook';
  }
  if (mcpConfigured) {
    return 'mcp';
  }
  return 'noop';
}

// ============================================================================
// Config Loader
// ============================================================================

/**
 * Load and validate Slack configuration from environment variables.
 *
 * Environment Variables:
 * - SLACK_WEBHOOK_URL: Webhook URL for posting messages (must be valid HTTPS URL)
 * - SLACK_BOT_TOKEN: Bot token for Slack API (must start with xoxb-)
 * - SLACK_CHANNEL: Channel to post messages to (required if bot token is set)
 * - SLACK_TIMEOUT_MS: Request timeout in milliseconds (default: 10000, max: 30000)
 *
 * @returns SlackConfig with validated configuration and detected mode
 * @throws Error if validation fails
 */
export function loadConfig(): SlackConfig {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const botToken = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_CHANNEL;
  const timeoutStr = process.env.SLACK_TIMEOUT_MS;

  // Validate webhook URL if provided
  let validatedWebhookUrl: string | undefined;
  if (webhookUrl) {
    const result = webhookUrlSchema.safeParse(webhookUrl);
    if (!result.success) {
      throw new Error(result.error.errors[0].message);
    }
    validatedWebhookUrl = result.data;
  }

  // Validate bot token if provided
  let validatedBotToken: string | undefined;
  if (botToken) {
    const result = botTokenSchema.safeParse(botToken);
    if (!result.success) {
      throw new Error(result.error.errors[0].message);
    }
    validatedBotToken = result.data;

    // Channel is required when bot token is set
    if (!channel) {
      throw new Error('SLACK_CHANNEL is required when SLACK_BOT_TOKEN is set');
    }
  }

  // Validate channel if provided
  let validatedChannel: string | undefined;
  if (channel) {
    const result = channelSchema.safeParse(channel);
    if (!result.success) {
      throw new Error(result.error.errors[0].message);
    }
    validatedChannel = result.data;
  }

  // Parse and validate timeout
  const timeoutResult = timeoutSchema.safeParse(timeoutStr);
  if (!timeoutResult.success) {
    throw new Error(timeoutResult.error.errors[0].message);
  }
  const timeoutMs = timeoutResult.data;

  // Detect mode
  const mode = detectMode(!!validatedWebhookUrl, !!validatedBotToken, !!validatedChannel);

  return {
    mode,
    webhookUrl: validatedWebhookUrl,
    botToken: validatedBotToken,
    channel: validatedChannel,
    timeoutMs,
  };
}
