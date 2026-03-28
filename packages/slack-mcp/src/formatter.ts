/**
 * Formatter module for Slack MCP Server
 *
 * Provides functions to format notification events as Slack Block Kit payloads.
 * Includes emoji mapping, color coding, and structured field layouts.
 *
 * Spec: 007-slack-integration-progress
 */

import type {
  NotificationEvent,
  PhaseTransition,
  TaskCompletion,
  Milestone,
  SpecKitPhase,
} from './types.js';

// ============================================================================
// Types
// ============================================================================

interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  elements?: Array<{
    type: string;
    text: string;
    emoji?: boolean;
  }>;
  fields?: Array<{
    type: string;
    text: string;
  }>;
}

interface SlackBlockKitPayload {
  blocks: SlackBlock[];
}

// ============================================================================
// Emoji and Color Constants
// ============================================================================

const PHASE_EMOJI: Record<SpecKitPhase, string> = {
  specify: '📝',
  plan: '📋',
  tasks: '📊',
  implement: '🔨',
  verify: '✅',
};

const MILESTONE_EMOJI: Record<string, string> = {
  spec_created: '📄',
  all_tasks_complete: '🏆',
  verify_passed: '🎉',
};

const STATUS_EMOJI: Record<string, string> = {
  completed: '✅',
  failed: '❌',
};

const STATUS_COLOR: Record<string, string> = {
  completed: '#36a64f',
  failed: '#e01e5a',
};

// ============================================================================
// Helper Functions
// ============================================================================

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
}

// ============================================================================
// Formatter Functions
// ============================================================================

/**
 * Format a phase transition event as a Slack Block Kit payload.
 *
 * @param event - Notification event with phase transition details
 * @returns Slack Block Kit payload
 */
export function formatPhaseTransition(event: NotificationEvent): SlackBlockKitPayload {
  const details = event.details as PhaseTransition;
  const toPhaseEmoji = PHASE_EMOJI[details.toPhase] || '🔄';

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${toPhaseEmoji} ${event.specName}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Phase transition: *${details.fromPhase}* ➡️ *${details.toPhase}*`,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Spec: \`${event.specId}\` | ${formatTimestamp(event.timestamp)}`,
          },
        ],
      },
    ],
  };
}

/**
 * Format a task completion event as a Slack Block Kit payload.
 *
 * @param event - Notification event with task completion details
 * @returns Slack Block Kit payload
 */
export function formatTaskCompletion(event: NotificationEvent): SlackBlockKitPayload {
  const details = event.details as TaskCompletion;
  const statusEmoji = STATUS_EMOJI[details.status] || '❓';
  const statusColor = STATUS_COLOR[details.status] || '#808080';
  const statusText = details.status === 'completed' ? 'success' : 'failed';

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${statusEmoji} Task ${details.taskId} ${statusText}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: details.taskDescription,
        },
        fields: [
          {
            type: 'mrkdwn',
            text: `*Status:*\n${statusEmoji} ${details.status} (${statusColor})`,
          },
          {
            type: 'mrkdwn',
            text: `*Spec:*\n${event.specName}`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Spec: \`${event.specId}\` | ${formatTimestamp(event.timestamp)}`,
          },
        ],
      },
    ],
  };
}

/**
 * Format a milestone event as a Slack Block Kit payload.
 *
 * @param event - Notification event with milestone details
 * @returns Slack Block Kit payload
 */
export function formatMilestone(event: NotificationEvent): SlackBlockKitPayload {
  const details = event.details as Milestone;
  const milestoneEmoji = MILESTONE_EMOJI[details.milestone] || '🎯';

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${milestoneEmoji} ${event.specName} - Milestone`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: details.summary,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Spec: \`${event.specId}\` | Milestone: \`${details.milestone}\` | ${formatTimestamp(event.timestamp)}`,
          },
        ],
      },
    ],
  };
}
