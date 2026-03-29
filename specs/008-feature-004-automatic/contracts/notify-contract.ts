/**
 * Contract: jira-notify.sh → notify.js event interface
 *
 * Spec: 008-feature-004-automatic
 *
 * The bash hook constructs one JiraNotifyEvent per changed task
 * and passes it as a CLI argument to notify.js.
 */

// Re-export existing types used by the dispatcher
export type {
  SpecKitStatus,
  JiraSyncState,
  JiraSyncConfig,
} from '../../packages/jira-mcp/src/types.js';

/**
 * Event passed from jira-notify.sh (bash) to notify.js (Node.js)
 * as a JSON string in argv[2].
 */
export interface JiraNotifyEvent {
  /** Absolute path to the spec directory containing jira-sync.json */
  specDir: string;
  /** SpecKit task ID (e.g., "T001", "T-FINAL") */
  taskId: string;
  /** New SpecKit status after the change */
  newStatus: 'pending' | 'in_progress' | 'completed' | 'blocked';
}

/**
 * Result of processing a single notify event.
 * Used internally by notify.ts — not serialized.
 */
export interface JiraNotifyResult {
  success: boolean;
  jiraKey: string;
  previousStatus: string;
  newStatus: string;
  error?: string;
}
