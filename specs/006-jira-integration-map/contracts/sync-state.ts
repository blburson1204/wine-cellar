/**
 * Sync State Contract — jira-sync.json schema
 *
 * Stored at: specs/{NNN-feature}/jira-sync.json
 * Created on first sync, updated on each subsequent sync.
 */

export interface JiraSyncState {
  /** Schema version for forward compatibility */
  version: '1.0';
  /** Jira instance this spec is synced to */
  jiraUrl: string;
  /** Jira project key */
  projectKey: string;
  /** Spec metadata (copied from tasks.json) */
  spec: {
    specId: string;
    specName: string;
  };
  /** Epic mapping (null before first sync) */
  epic: EpicMapping | null;
  /** Task-to-issue mappings */
  tasks: TaskMapping[];
  /** ISO timestamp of last full sync */
  lastSyncAt: string;
}

export interface EpicMapping {
  /** Jira Epic issue key (e.g., "WC-42") */
  jiraKey: string;
  /** Epic summary at time of last sync */
  summary: string;
  /** ISO timestamp of last sync */
  lastSyncedAt: string;
}

export interface TaskMapping {
  /** SpecKit task ID (e.g., "T001", "T-VERIFY-LINT") */
  taskId: string;
  /** Jira issue key (e.g., "WC-43") */
  jiraKey: string;
  /** Jira issue type used */
  issueType: 'Story' | 'Sub-task';
  /** SpecKit status at time of last sync */
  lastSyncedStatus: 'pending' | 'in_progress' | 'completed' | 'blocked';
  /** SHA-256 hash of task description + status (for conflict detection) */
  contentHash: string;
  /** ISO timestamp of last sync for this task */
  lastSyncedAt: string;
  /** Whether this task was removed from tasks.json since last sync */
  removed: boolean;
}
