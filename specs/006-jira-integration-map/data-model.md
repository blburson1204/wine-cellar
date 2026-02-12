# Data Model: Jira Integration for SpecKit

**Spec**: 006-jira-integration-map | **Date**: 2026-02-12

## Entities

### 1. Sync State (`jira-sync.json`)

Stored per spec directory at `specs/{NNN-feature}/jira-sync.json`. This is the
primary state file — maps SpecKit IDs to Jira issue keys.

```typescript
interface JiraSyncState {
  /** Jira instance base URL */
  jiraUrl: string;
  /** Jira project key (e.g., "WC") */
  projectKey: string;
  /** Spec metadata */
  spec: {
    specId: string; // e.g., "006"
    specName: string; // e.g., "jira-integration-map"
  };
  /** Epic mapping */
  epic: {
    jiraKey: string; // e.g., "WC-42"
    lastSyncedAt: string; // ISO timestamp
  } | null;
  /** Task-to-Story mappings */
  tasks: TaskMapping[];
  /** Last full sync timestamp */
  lastSyncAt: string; // ISO timestamp
}

interface TaskMapping {
  /** SpecKit task ID (e.g., "T001", "T-VERIFY-LINT") */
  taskId: string;
  /** Jira issue key (e.g., "WC-43") */
  jiraKey: string;
  /** Issue type used: "Story" for implementation, "Sub-task" for T-VERIFY */
  issueType: 'Story' | 'Sub-task';
  /** Last synced status from SpecKit */
  lastSyncedStatus: 'pending' | 'in_progress' | 'completed' | 'blocked';
  /** Hash of last synced content (for conflict detection) */
  contentHash: string;
  /** ISO timestamp of last sync */
  lastSyncedAt: string;
  /** Whether the task has been removed from tasks.json */
  removed: boolean;
}
```

### 2. Sync Configuration

Configuration loaded from environment variables and optional config file.

```typescript
interface JiraSyncConfig {
  /** Jira Cloud instance URL (e.g., "https://mycompany.atlassian.net") */
  jiraUrl: string;
  /** Jira project key (e.g., "WC") */
  projectKey: string;
  /** Auth credentials */
  auth: {
    email: string;
    apiToken: string;
  };
  /** Configurable mappings */
  mappings: {
    /** SpecKit status → Jira transition name */
    statusTransitions: Record<string, string>;
    /** SpecKit phase → Jira component or label */
    phaseLabels: Record<string, string>;
    /** Issue type for implementation tasks */
    storyIssueType: string; // default: "Story"
    /** Issue type for T-VERIFY tasks */
    verifyIssueType: string; // default: "Sub-task"
    /** Issue type for Epic */
    epicIssueType: string; // default: "Epic"
  };
}
```

**Default status transitions**:

| SpecKit Status | Jira Transition          |
| -------------- | ------------------------ |
| `pending`      | "To Do"                  |
| `in_progress`  | "In Progress"            |
| `completed`    | "Done"                   |
| `blocked`      | "Blocked" (if available) |

### 3. Jira Issue (API Shape)

The Jira REST API v3 issue creation/update payloads:

```typescript
/** POST /rest/api/3/issue */
interface JiraCreateIssue {
  fields: {
    project: { key: string };
    summary: string;
    description: JiraADFDocument; // Atlassian Document Format
    issuetype: { name: string }; // "Epic", "Story", "Sub-task"
    parent?: { key: string }; // For Sub-tasks
    labels?: string[];
    /** Epic Link custom field — for linking Stories to Epics */
    [epicLinkFieldId: string]: string | undefined;
  };
}

/** POST /rest/api/3/issueLink */
interface JiraCreateIssueLink {
  type: { name: string }; // e.g., "Blocks"
  inwardIssue: { key: string }; // blocked issue
  outwardIssue: { key: string }; // blocking issue
}
```

## State Transitions

```
                    ┌─────────────┐
   /tasks creates   │ tasks.json  │
   tasks.json       │ (SpecKit)   │
                    └──────┬──────┘
                           │ sync_spec_to_jira
                           ▼
              ┌────────────────────────┐
              │   Read tasks.json      │
              │   Read jira-sync.json  │
              │   (if exists)          │
              └────────────┬───────────┘
                           │
              ┌────────────┴───────────┐
              │                        │
         First sync?              Re-sync?
              │                        │
              ▼                        ▼
    ┌─────────────────┐    ┌──────────────────────┐
    │ Create Epic     │    │ For each task:        │
    │ Create Stories  │    │ - New? → Create       │
    │ Create Sub-tasks│    │ - Changed? → Update   │
    │ Create Links    │    │ - Removed? → Won't Do │
    │ Write sync file │    │ - Conflict? → Skip+Warn│
    └─────────────────┘    │ Update sync file      │
                           └──────────────────────┘
```

## Conflict Detection

A task's `contentHash` is computed from its description + status at sync time.
On re-sync, the system:

1. Fetches the current Jira issue
2. Compares Jira's current summary/status against the stored `contentHash`
3. If Jira differs from stored hash AND SpecKit also differs → **conflict**
4. Conflict → skip that issue, log warning, sync all others
