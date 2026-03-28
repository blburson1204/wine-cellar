/**
 * Contract: Slack MCP Server Tools
 *
 * Defines the tool interfaces for the slack-speckit MCP server.
 * These contracts specify input/output shapes for each MCP tool.
 *
 * Spec: 007-slack-integration-progress
 */

// ============================================================================
// Shared Types
// ============================================================================

type SpecKitPhase = 'specify' | 'plan' | 'tasks' | 'implement' | 'verify';

interface SpecProgress {
  specId: string;
  specName: string;
  phase: SpecKitPhase;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  pendingTasks: number;
}

// ============================================================================
// Tool: send_progress
// ============================================================================

/** Input schema for the send_progress MCP tool */
interface SendProgressInput {
  /** Spec ID (e.g., "007") */
  spec_id: string;
  /** Event type */
  event_type: 'phase_transition' | 'task_completion' | 'milestone';
  /** Human-readable message describing the event */
  message: string;
  /** Optional: previous phase (for phase_transition events) */
  from_phase?: SpecKitPhase;
  /** Optional: new phase (for phase_transition events) */
  to_phase?: SpecKitPhase;
  /** Optional: task ID (for task_completion events) */
  task_id?: string;
  /** Optional: task status (for task_completion events) */
  task_status?: 'completed' | 'failed';
}

/** Output from send_progress tool */
interface SendProgressOutput {
  success: boolean;
  /** Channel the message was posted to */
  channel?: string;
  /** Error message if success is false */
  error?: string;
}

// ============================================================================
// Tool: get_spec_status
// ============================================================================

/** Input schema for the get_spec_status MCP tool */
interface GetSpecStatusInput {
  /** Spec ID (e.g., "007") */
  spec_id: string;
  /** Base directory to search for specs (defaults to ./specs/) */
  specs_dir?: string;
}

/** Output from get_spec_status tool */
interface GetSpecStatusOutput {
  /** Whether the spec was found */
  found: boolean;
  /** Spec progress details (if found) */
  progress?: SpecProgress;
  /** Error message if not found */
  error?: string;
}

// ============================================================================
// Webhook Notify Function (called by hooks, not an MCP tool)
// ============================================================================

type NotificationEventType = 'phase_transition' | 'task_completion' | 'milestone';

interface NotificationEvent {
  type: NotificationEventType;
  specId: string;
  specName: string;
  timestamp: string;
  details: PhaseTransitionDetails | TaskCompletionDetails | MilestoneDetails;
}

interface PhaseTransitionDetails {
  fromPhase: SpecKitPhase;
  toPhase: SpecKitPhase;
}

interface TaskCompletionDetails {
  taskId: string;
  taskDescription: string;
  status: 'completed' | 'failed';
}

interface MilestoneDetails {
  milestone: 'spec_created' | 'all_tasks_complete' | 'verify_passed';
  summary: string;
}

// ============================================================================
// Configuration
// ============================================================================

interface SlackConfig {
  mode: 'webhook' | 'mcp' | 'both' | 'noop';
  webhookUrl?: string;
  botToken?: string;
  channel?: string;
  timeoutMs: number;
}

// Type-check: ensure interfaces are used (prevents "declared but not used")
export type {
  SendProgressInput,
  SendProgressOutput,
  GetSpecStatusInput,
  GetSpecStatusOutput,
  NotificationEvent,
  PhaseTransitionDetails,
  TaskCompletionDetails,
  MilestoneDetails,
  SlackConfig,
  SpecProgress,
  SpecKitPhase,
};
