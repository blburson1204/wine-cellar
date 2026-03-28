/**
 * Shared TypeScript types for Slack MCP Server
 *
 * These types define the contracts for notification events, configuration,
 * and spec progress tracking used throughout the slack-mcp package.
 *
 * Spec: 007-slack-integration-progress
 */

// ============================================================================
// SpecKit Phase
// ============================================================================

export type SpecKitPhase = 'specify' | 'plan' | 'tasks' | 'implement' | 'verify';

// ============================================================================
// Spec Progress
// ============================================================================

export interface SpecProgress {
  specId: string;
  specName: string;
  phase: SpecKitPhase;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  pendingTasks: number;
}

// ============================================================================
// Notification Events
// ============================================================================

export type NotificationEventType = 'phase_transition' | 'task_completion' | 'milestone';

export interface PhaseTransition {
  fromPhase: SpecKitPhase;
  toPhase: SpecKitPhase;
}

export interface TaskCompletion {
  taskId: string;
  taskDescription: string;
  status: 'completed' | 'failed';
}

export interface Milestone {
  milestone: 'spec_created' | 'all_tasks_complete' | 'verify_passed';
  summary: string;
}

export interface NotificationEvent {
  type: NotificationEventType;
  specId: string;
  specName: string;
  timestamp: string;
  details: PhaseTransition | TaskCompletion | Milestone;
}

// ============================================================================
// Configuration
// ============================================================================

export type SlackMode = 'webhook' | 'mcp' | 'both' | 'noop';

export interface SlackConfig {
  mode: SlackMode;
  webhookUrl?: string;
  botToken?: string;
  channel?: string;
  timeoutMs: number;
}

// ============================================================================
// MCP Tool Types
// ============================================================================

export interface SendProgressInput {
  spec_id: string;
  event_type: NotificationEventType;
  message: string;
  from_phase?: SpecKitPhase;
  to_phase?: SpecKitPhase;
  task_id?: string;
  task_status?: 'completed' | 'failed';
}

export interface SendProgressOutput {
  success: boolean;
  channel?: string;
  error?: string;
}

export interface GetSpecStatusInput {
  spec_id: string;
  specs_dir?: string;
}

export interface GetSpecStatusOutput {
  found: boolean;
  progress?: SpecProgress;
  error?: string;
}
