/**
 * notify.ts — Jira status sync dispatcher for jira-notify.sh hook
 *
 * Called by jira-notify.sh with a JSON event when tasks.json changes.
 * Reads jira-sync.json, finds the Jira key for the changed task,
 * and transitions the Jira issue to the new status.
 *
 * Fail-open: all errors are logged to stderr and the process exits 0.
 *
 * Spec: 008-feature-004-automatic
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { JiraClient } from './jira-client.js';
import type { JiraNotifyEvent, JiraNotifyResult, JiraSyncState, SpecKitStatus } from './types.js';

// ── Status mapping: SpecKit → Jira transition name ───────────

export const SPECKIT_TO_JIRA_STATUS: Record<SpecKitStatus, string> = {
  pending: 'To Do',
  in_progress: 'In Progress',
  completed: 'Done',
  blocked: 'Blocked',
};

// ── Core logic ────────────────────────────────────────────────

/**
 * Process a single task-changed event against an already-loaded sync state.
 * Returns a result object — never throws.
 */
export async function processEvent(
  event: JiraNotifyEvent,
  syncState: JiraSyncState
): Promise<JiraNotifyResult> {
  const { taskId, newStatus } = event;

  // Find the task mapping
  const taskMapping = syncState.tasks.find((t) => t.taskId === taskId);
  if (!taskMapping) {
    return {
      success: false,
      jiraKey: '',
      previousStatus: '',
      newStatus,
      error: `No mapping found for task ${taskId} in jira-sync.json`,
    };
  }

  const { jiraKey } = taskMapping;
  const targetTransitionName = SPECKIT_TO_JIRA_STATUS[newStatus];

  const client = new JiraClient(syncState.jiraUrl, {
    email: process.env.JIRA_EMAIL ?? '',
    apiToken: process.env.JIRA_API_TOKEN ?? '',
  });

  try {
    // Get available transitions for this issue
    const { transitions } = await client.getTransitions(jiraKey);
    const transition = transitions.find((t) => t.name === targetTransitionName);

    if (!transition) {
      return {
        success: false,
        jiraKey,
        previousStatus: taskMapping.lastSyncedStatus,
        newStatus,
        error: `Transition "${targetTransitionName}" not found for ${jiraKey}. Available: ${transitions.map((t) => t.name).join(', ')}`,
      };
    }

    await client.performTransition(jiraKey, transition.id);

    return {
      success: true,
      jiraKey,
      previousStatus: taskMapping.lastSyncedStatus,
      newStatus,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      jiraKey,
      previousStatus: taskMapping.lastSyncedStatus,
      newStatus,
      error: message,
    };
  }
}

// ── CLI entry point ───────────────────────────────────────────

async function main(): Promise<void> {
  const eventArg = process.argv[2];

  if (!eventArg) {
    process.stderr.write('jira-notify: no event argument provided\n');
    process.exit(0);
  }

  let event: JiraNotifyEvent;
  try {
    event = JSON.parse(eventArg) as JiraNotifyEvent;
  } catch {
    process.stderr.write(`jira-notify: failed to parse event JSON: ${eventArg}\n`);
    process.exit(0);
  }

  const { specDir, taskId, newStatus } = event;

  if (!specDir || !taskId || !newStatus) {
    process.stderr.write(`jira-notify: invalid event — missing required fields\n`);
    process.exit(0);
  }

  // Read jira-sync.json
  const syncPath = join(specDir, 'jira-sync.json');
  let syncState: JiraSyncState;
  try {
    const raw = readFileSync(syncPath, 'utf-8');
    syncState = JSON.parse(raw) as JiraSyncState;
  } catch {
    // No jira-sync.json or malformed — silent exit (expected case)
    process.exit(0);
  }

  const result = await processEvent(event, syncState);

  if (!result.success) {
    process.stderr.write(`jira-notify: ${result.error}\n`);
  }

  // Always exit 0 — fail-open
  process.exit(0);
}

// Run CLI if executed directly
const isMain =
  process.argv[1] !== undefined &&
  (process.argv[1].endsWith('/notify.js') || process.argv[1].endsWith('/notify.ts'));

if (isMain) {
  main().catch((err) => {
    process.stderr.write(`jira-notify: unexpected error: ${err}\n`);
    process.exit(0);
  });
}
