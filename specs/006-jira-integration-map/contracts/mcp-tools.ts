/**
 * MCP Tool Contracts for Jira-SpecKit Integration
 *
 * These define the tool input/output shapes that the MCP server exposes.
 * During implementation, these will be converted to Zod schemas for the MCP SDK.
 */

// ============================================================
// Tool: sync_spec_to_jira
// ============================================================

/** Input for sync_spec_to_jira tool */
export interface SyncSpecToJiraInput {
  /** Absolute or relative path to the spec directory (e.g., "specs/006-jira-integration-map") */
  specDir: string;
  /** Force overwrite conflicting Jira stories (default: false) */
  force?: boolean;
}

/** Output for sync_spec_to_jira tool */
export interface SyncSpecToJiraOutput {
  /** Whether the sync completed successfully (may be partial) */
  success: boolean;
  /** Jira Epic key */
  epicKey: string;
  /** Summary of sync results */
  summary: {
    created: number;
    updated: number;
    skipped: number;
    removed: number;
    conflicts: number;
  };
  /** Details of created/updated stories */
  stories: Array<{
    taskId: string;
    jiraKey: string;
    action: 'created' | 'updated' | 'skipped' | 'removed';
    reason?: string;
  }>;
  /** Warning messages (e.g., conflicts) */
  warnings: string[];
}

// ============================================================
// Tool: get_jira_status
// ============================================================

/** Input for get_jira_status tool */
export interface GetJiraStatusInput {
  /** Absolute or relative path to the spec directory */
  specDir: string;
}

/** Output for get_jira_status tool */
export interface GetJiraStatusOutput {
  /** Whether the spec has been synced to Jira */
  synced: boolean;
  /** Jira Epic details (null if not synced) */
  epic: {
    key: string;
    summary: string;
    status: string;
    url: string;
  } | null;
  /** Stories from SpecKit tasks */
  specKitStories: Array<{
    taskId: string;
    jiraKey: string;
    jiraStatus: string;
    specKitStatus: string;
    inSync: boolean;
  }>;
  /** Stories that exist in Jira but not in SpecKit (added directly in Jira) */
  jiraOnlyStories: Array<{
    jiraKey: string;
    summary: string;
    status: string;
  }>;
  /** Last sync timestamp */
  lastSyncAt: string | null;
}

// ============================================================
// Tool: update_task_status
// ============================================================

/** Input for update_task_status tool */
export interface UpdateTaskStatusInput {
  /** Absolute or relative path to the spec directory */
  specDir: string;
  /** SpecKit task ID (e.g., "T001") */
  taskId: string;
  /** New status to sync to Jira */
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
}

/** Output for update_task_status tool */
export interface UpdateTaskStatusOutput {
  /** Whether the update succeeded */
  success: boolean;
  /** Jira issue key that was updated */
  jiraKey: string;
  /** Previous Jira status */
  previousStatus: string;
  /** New Jira status after transition */
  newStatus: string;
  /** Error message if failed */
  error?: string;
}
