/**
 * Slack MCP Server
 *
 * Provides MCP tools for sending progress notifications to Slack and
 * querying spec status. Implements fire-and-forget pattern for Slack
 * posting to avoid blocking the MCP server.
 *
 * Tools:
 * - send_progress: Post notification events to Slack (phase transitions, task completions, milestones)
 * - get_spec_status: Read current spec progress from spec.md and tasks.json
 *
 * Spec: 007-slack-integration-progress
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { loadConfig } from './config.js';
import { SlackClient } from './slack-client.js';
import { formatPhaseTransition, formatTaskCompletion, formatMilestone } from './formatter.js';
import { buildSpecProgress } from './spec-reader.js';
import type {
  NotificationEvent,
  SpecKitPhase,
  SendProgressOutput,
  GetSpecStatusOutput,
} from './types.js';

// ============================================================================
// Zod Schemas for Tool Inputs
// ============================================================================

const specKitPhaseSchema = z.enum(['specify', 'plan', 'tasks', 'implement', 'verify']);

const sendProgressInputSchema = {
  spec_id: z.string().describe('Spec identifier (e.g., "007-slack-integration")'),
  event_type: z
    .enum(['phase_transition', 'task_completion', 'milestone'])
    .describe('Type of notification event'),
  message: z.string().describe('Human-readable message describing the event'),
  from_phase: specKitPhaseSchema
    .optional()
    .describe('Previous phase (for phase_transition events)'),
  to_phase: specKitPhaseSchema.optional().describe('New phase (for phase_transition events)'),
  task_id: z.string().optional().describe('Task ID (for task_completion events)'),
  task_status: z
    .enum(['completed', 'failed'])
    .optional()
    .describe('Task status (for task_completion events)'),
};

const getSpecStatusInputSchema = {
  spec_id: z.string().describe('Spec identifier (e.g., "007-slack-integration")'),
  specs_dir: z
    .string()
    .optional()
    .default('specs')
    .describe('Base directory for specs (default: "specs")'),
};

// ============================================================================
// createMcpServer
// ============================================================================

/**
 * Create an MCP server with send_progress and get_spec_status tools.
 *
 * Follows the extensible tool pattern: additional tools can be registered
 * using server.tool() after creation.
 *
 * @returns McpServer instance with tools registered
 */
export function createMcpServer(): McpServer {
  const server = new McpServer(
    { name: 'slack-speckit', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  // ========================================================================
  // send_progress tool
  // ========================================================================
  server.tool(
    'send_progress',
    'Send a progress notification to Slack. Supports phase transitions, task completions, and milestone events.',
    sendProgressInputSchema,
    async ({ spec_id, event_type, message, from_phase, to_phase, task_id, task_status }) => {
      const config = loadConfig();
      const output: SendProgressOutput = { success: false };

      // In noop mode, return success without posting
      if (config.mode === 'noop') {
        output.success = true;
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(output) }],
        };
      }

      // Build the notification event
      const event: NotificationEvent = {
        type: event_type,
        specId: spec_id,
        specName: spec_id, // Use spec_id as name if we don't have a better source
        timestamp: new Date().toISOString(),
        details: buildEventDetails(event_type, message, from_phase, to_phase, task_id, task_status),
      };

      // Format the message based on event type
      let payload;
      switch (event_type) {
        case 'phase_transition':
          payload = formatPhaseTransition(event);
          break;
        case 'task_completion':
          payload = formatTaskCompletion(event);
          break;
        case 'milestone':
          payload = formatMilestone(event);
          break;
        default:
          output.error = `Unknown event type: ${event_type}`;
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(output) }],
          };
      }

      // Post to Slack (fire-and-forget pattern)
      const client = new SlackClient({
        webhookUrl: config.webhookUrl,
        botToken: config.botToken,
        channel: config.channel,
        timeoutMs: config.timeoutMs,
      });

      let success = false;

      // Cast payload for SlackClient (which accepts Record<string, unknown>)
      const slackPayload = payload as unknown as Record<string, unknown>;

      // Try webhook first if configured
      if (config.mode === 'webhook' || config.mode === 'both') {
        success = await client.postWebhook(slackPayload);
        if (success) {
          output.channel = 'webhook';
        }
      }

      // Try bot API if webhook didn't work or not configured
      if (!success && (config.mode === 'mcp' || config.mode === 'both')) {
        success = await client.postMessage(slackPayload);
        if (success) {
          output.channel = config.channel;
        }
      }

      output.success = success;
      if (!success) {
        output.error = 'Failed to post to Slack';
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(output) }],
      };
    }
  );

  // ========================================================================
  // get_spec_status tool
  // ========================================================================
  server.tool(
    'get_spec_status',
    'Get the current status and progress of a SpecKit spec by reading spec.md frontmatter and tasks.json.',
    getSpecStatusInputSchema,
    async ({ spec_id, specs_dir }) => {
      const output: GetSpecStatusOutput = { found: false };

      try {
        const specDir = `${specs_dir}/${spec_id}`;
        const progress = await buildSpecProgress(specDir);

        output.found = true;
        output.progress = progress;
      } catch (error) {
        output.found = false;
        output.error = error instanceof Error ? error.message : String(error);
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(output) }],
      };
    }
  );

  return server;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build event details based on event type
 */
function buildEventDetails(
  eventType: string,
  message: string,
  fromPhase?: SpecKitPhase,
  toPhase?: SpecKitPhase,
  taskId?: string,
  taskStatus?: 'completed' | 'failed'
): NotificationEvent['details'] {
  switch (eventType) {
    case 'phase_transition':
      return {
        fromPhase: fromPhase || 'specify',
        toPhase: toPhase || 'plan',
      };
    case 'task_completion':
      return {
        taskId: taskId || 'unknown',
        taskDescription: message,
        status: taskStatus || 'completed',
      };
    case 'milestone':
      return {
        milestone: determineMilestone(message),
        summary: message,
      };
    default:
      return {
        milestone: 'spec_created',
        summary: message,
      };
  }
}

/**
 * Determine milestone type from message content
 */
function determineMilestone(
  message: string
): 'spec_created' | 'all_tasks_complete' | 'verify_passed' {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('verify') || lowerMessage.includes('passed')) {
    return 'verify_passed';
  }
  if (lowerMessage.includes('complete') || lowerMessage.includes('done')) {
    return 'all_tasks_complete';
  }
  return 'spec_created';
}

// ============================================================================
// Main Entry Point
// ============================================================================

const isMainModule =
  process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMainModule || process.argv[1]?.endsWith('index.js')) {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  server.connect(transport).catch((error) => {
    process.stderr.write(`Failed to start Slack MCP server: ${error}\n`);
    process.exit(1);
  });
}
