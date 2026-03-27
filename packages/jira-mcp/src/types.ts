/**
 * Shared TypeScript types for Jira-SpecKit MCP integration.
 * Derived from contract definitions in specs/006-jira-integration-map/contracts/
 */

// ============================================================
// Sync State (jira-sync.json)
// ============================================================

export interface JiraSyncState {
  version: '1.0';
  jiraUrl: string;
  projectKey: string;
  spec: {
    specId: string;
    specName: string;
  };
  epic: EpicMapping | null;
  tasks: TaskMapping[];
  lastSyncAt: string;
}

export interface EpicMapping {
  jiraKey: string;
  summary: string;
  lastSyncedAt: string;
}

export interface TaskMapping {
  taskId: string;
  jiraKey: string;
  issueType: 'Story' | 'Sub-task';
  lastSyncedStatus: SpecKitStatus;
  contentHash: string;
  lastSyncedAt: string;
  removed: boolean;
}

// ============================================================
// Configuration
// ============================================================

export interface JiraSyncConfig {
  jiraUrl: string;
  projectKey: string;
  auth: JiraAuthConfig;
  mappings: JiraMappings;
}

export interface JiraAuthConfig {
  email: string;
  apiToken: string;
}

export interface JiraMappings {
  statusTransitions: Record<string, string>;
  phaseLabels: Record<string, string>;
  storyIssueType: string;
  verifyIssueType: string;
  epicIssueType: string;
}

// ============================================================
// Jira REST API v3 Types
// ============================================================

export interface JiraCreateIssueRequest {
  fields: {
    project: { key: string };
    summary: string;
    description?: JiraADFDocument;
    issuetype: { name: string };
    parent?: { key: string };
    labels?: string[];
    [customField: string]: unknown;
  };
}

export interface JiraCreateIssueResponse {
  id: string;
  key: string;
  self: string;
}

export interface JiraUpdateIssueRequest {
  fields: Partial<JiraCreateIssueRequest['fields']>;
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    status: { name: string; id: string };
    issuetype: { name: string };
    description?: JiraADFDocument;
    parent?: { key: string };
    labels?: string[];
    updated: string;
    [customField: string]: unknown;
  };
}

export interface JiraTransitionsResponse {
  transitions: JiraTransition[];
}

export interface JiraTransition {
  id: string;
  name: string;
  to: {
    id: string;
    name: string;
  };
}

export interface JiraPerformTransitionRequest {
  transition: { id: string };
}

export interface JiraCreateIssueLinkRequest {
  type: { name: string };
  inwardIssue: { key: string };
  outwardIssue: { key: string };
}

export interface JiraSearchRequest {
  jql: string;
  maxResults?: number;
  fields?: string[];
}

export interface JiraSearchResponse {
  total: number;
  issues: JiraIssue[];
}

export interface JiraADFDocument {
  version: 1;
  type: 'doc';
  content: JiraADFNode[];
}

export interface JiraADFNode {
  type: string;
  content?: JiraADFNode[];
  text?: string;
  attrs?: Record<string, unknown>;
}

// ============================================================
// MCP Tool Input/Output Types
// ============================================================

export interface SyncSpecToJiraInput {
  specDir: string;
  force?: boolean;
}

export interface SyncSpecToJiraOutput {
  success: boolean;
  epicKey: string;
  summary: {
    created: number;
    updated: number;
    skipped: number;
    removed: number;
    conflicts: number;
  };
  stories: Array<{
    taskId: string;
    jiraKey: string;
    action: 'created' | 'updated' | 'skipped' | 'removed';
    reason?: string;
  }>;
  warnings: string[];
}

export interface GetJiraStatusInput {
  specDir: string;
}

export interface GetJiraStatusOutput {
  synced: boolean;
  epic: {
    key: string;
    summary: string;
    status: string;
    url: string;
  } | null;
  specKitStories: Array<{
    taskId: string;
    jiraKey: string;
    jiraStatus: string;
    specKitStatus: string;
    inSync: boolean;
  }>;
  jiraOnlyStories: Array<{
    jiraKey: string;
    summary: string;
    status: string;
  }>;
  lastSyncAt: string | null;
}

export interface UpdateTaskStatusInput {
  specDir: string;
  taskId: string;
  status: SpecKitStatus;
}

export interface UpdateTaskStatusOutput {
  success: boolean;
  jiraKey: string;
  previousStatus: string;
  newStatus: string;
  error?: string;
}

// ============================================================
// SpecKit Task Types (from tasks.json)
// ============================================================

export type SpecKitStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface SpecKitTask {
  id: string;
  phase: string;
  description: string;
  status: SpecKitStatus;
  parallel: boolean;
  target_file: string | null;
  gate: string | null;
}

export interface SpecKitTasksFile {
  spec_id: string;
  spec_name: string;
  tasks: SpecKitTask[];
}
