# Data Model: Automatic Jira Status Sync

No new data entities. This feature reads two existing file formats and
introduces one new event interface.

## Existing Entities (read-only)

### jira-sync.json (JiraSyncState)

Created by `sync_spec_to_jira`. Located at `specs/{spec-id}/jira-sync.json`.

```typescript
interface JiraSyncState {
  version: '1.0';
  jiraUrl: string;
  projectKey: string;
  spec: { specId: string; specName: string };
  epic: { jiraKey: string; summary: string; lastSyncedAt: string } | null;
  tasks: Array<{
    taskId: string; // e.g., "T001"
    jiraKey: string; // e.g., "WINE-42"
    issueType: 'Story' | 'Sub-task';
    lastSyncedStatus: SpecKitStatus;
    contentHash: string;
    lastSyncedAt: string;
    removed: boolean;
  }>;
  lastSyncAt: string;
}
```

**Hook reads**: `tasks[].taskId` and `tasks[].jiraKey` to map SpecKit task IDs
to Jira issue keys.

### tasks.json (SpecKitTasksFile)

Written by `/tasks` and updated during `/implement`. Located at
`specs/{spec-id}/tasks.json`.

```typescript
interface SpecKitTasksFile {
  spec_id: string;
  spec_name: string;
  tasks: Array<{
    id: string; // e.g., "T001"
    phase: string;
    description: string;
    status: SpecKitStatus; // pending | in_progress | completed | blocked
    parallel: boolean;
    target_file: string | null;
    gate: string | null;
  }>;
}
```

**Hook reads**: `tasks[].id` and `tasks[].status` from both old (disk) and new
(stdin) versions to detect changes.

## New Interface

### JiraNotifyEvent

Passed from `jira-notify.sh` (bash) to `notify.js` (Node) as a CLI argument:

```typescript
interface JiraNotifyEvent {
  specDir: string; // Absolute path to spec directory
  taskId: string; // SpecKit task ID
  newStatus: string; // New SpecKit status
}
```

One event is generated per changed task. The bash hook constructs the JSON; the
Node dispatcher parses and acts on it.
