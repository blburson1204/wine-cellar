/**
 * Notify CLI module for Slack MCP Server
 *
 * CLI entry point for hook-triggered webhook notifications.
 * Parses event JSON from stdin or arguments, formats message,
 * and POSTs via slack-client. Implements fire-and-forget pattern:
 * always exits 0 regardless of success/failure.
 *
 * Spec: 007-slack-integration-progress
 */

import { loadConfig } from './config.js';
import { SlackClient } from './slack-client.js';
import { formatPhaseTransition, formatTaskCompletion, formatMilestone } from './formatter.js';
import type { NotificationEvent } from './types.js';

// ============================================================================
// Event Processing
// ============================================================================

/**
 * Process a notification event and dispatch to Slack webhook.
 *
 * Implements fire-and-forget pattern:
 * - Returns true on success or when mode is noop
 * - Returns false on failure (but never throws)
 *
 * @param event - Notification event to process
 * @returns true on success/noop, false on failure
 */
export async function processEvent(event: NotificationEvent): Promise<boolean> {
  const config = loadConfig();

  // Graceful no-op when unconfigured
  if (config.mode === 'noop') {
    return true;
  }

  // Only handle webhook mode for CLI notifications
  if (config.mode !== 'webhook' && config.mode !== 'both') {
    return true;
  }

  // Create client
  const client = new SlackClient({
    webhookUrl: config.webhookUrl,
    botToken: config.botToken,
    channel: config.channel,
    timeoutMs: config.timeoutMs,
  });

  // Format payload based on event type
  let payload: Record<string, unknown>;
  switch (event.type) {
    case 'phase_transition':
      payload = formatPhaseTransition(event) as unknown as Record<string, unknown>;
      break;
    case 'task_completion':
      payload = formatTaskCompletion(event) as unknown as Record<string, unknown>;
      break;
    case 'milestone':
      payload = formatMilestone(event) as unknown as Record<string, unknown>;
      break;
    default:
      // Unknown event type - treat as success (no-op)
      return true;
  }

  // Post to webhook
  return client.postWebhook(payload);
}

// ============================================================================
// Stdin Reader
// ============================================================================

/**
 * Read all input from stdin.
 *
 * @returns Promise resolving to stdin content as string
 */
async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    process.stdin.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk));
    });

    process.stdin.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf-8'));
    });

    process.stdin.on('error', (err) => {
      reject(err);
    });

    // Handle case where stdin is empty/closed
    if (process.stdin.isTTY) {
      resolve('');
    }
  });
}

// ============================================================================
// CLI Entry Point
// ============================================================================

/**
 * CLI main function.
 *
 * Parses event JSON from:
 * 1. First CLI argument (if provided)
 * 2. stdin (if no argument)
 *
 * Always exits 0 (fire-and-forget pattern).
 */
async function main(): Promise<void> {
  try {
    let eventJson: string;

    // Check for CLI argument first
    if (process.argv[2]) {
      eventJson = process.argv[2];
    } else {
      // Read from stdin
      eventJson = await readStdin();
    }

    // Empty input - graceful exit
    if (!eventJson.trim()) {
      process.exit(0);
    }

    // Parse event
    const event = JSON.parse(eventJson) as NotificationEvent;

    // Process event (fire-and-forget)
    await processEvent(event);
  } catch {
    // Fire-and-forget: swallow all errors
  }

  // Always exit 0
  process.exit(0);
}

// Run if this is the main module
const isMainModule = process.argv[1]?.endsWith('notify.js');
if (isMainModule) {
  main();
}
