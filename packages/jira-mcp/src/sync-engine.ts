import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type {
  JiraSyncConfig,
  JiraSyncState,
  TaskMapping,
  SpecKitTasksFile,
  SyncSpecToJiraOutput,
} from './types.js';
import type { JiraClient } from './jira-client.js';
import { mapTaskToJiraIssue, mapSpecToEpic, mapStatusToTransition } from './mapper.js';
import { computeContentHash, hasContentChanged } from './hash.js';

interface SyncStoryResult {
  taskId: string;
  jiraKey: string;
  action: 'created' | 'updated' | 'skipped' | 'removed';
  reason?: string;
}

export class SyncEngine {
  constructor(
    private readonly client: JiraClient,
    private readonly config: JiraSyncConfig
  ) {}

  async sync(specDir: string): Promise<SyncSpecToJiraOutput> {
    const tasksFile = await this.readTasksFile(specDir);
    const existingSync = await this.readSyncState(specDir);

    const stories: SyncStoryResult[] = [];
    const warnings: string[] = [];
    let epicKey: string;

    if (!existingSync) {
      // First sync — create everything
      epicKey = await this.createEpic(tasksFile);
      const taskKeyMap = new Map<string, string>();

      for (const task of tasksFile.tasks) {
        const issueReq = mapTaskToJiraIssue(task, this.config, epicKey);
        const response = await this.client.createIssue(issueReq);
        taskKeyMap.set(task.id, response.key);
        stories.push({ taskId: task.id, jiraKey: response.key, action: 'created' });
      }

      // Create issue links for gated tasks
      for (const task of tasksFile.tasks) {
        if (task.gate) {
          const blockedKey = taskKeyMap.get(task.id);
          const blockingKey = taskKeyMap.get(task.gate);
          if (blockedKey && blockingKey) {
            await this.client.createIssueLink({
              type: { name: 'Blocks' },
              inwardIssue: { key: blockedKey },
              outwardIssue: { key: blockingKey },
            });
          }
        }
      }

      // Build and write sync state
      const syncState = this.buildSyncState(tasksFile, epicKey, taskKeyMap);
      await this.writeSyncState(specDir, syncState);
    } else {
      // Re-sync — diff and update
      epicKey = existingSync.epic?.jiraKey ?? '';
      const taskIds = new Set(tasksFile.tasks.map((t) => t.id));

      // Handle existing tasks
      for (const task of tasksFile.tasks) {
        const existingMapping = existingSync.tasks.find((t) => t.taskId === task.id);

        if (!existingMapping) {
          // New task — create in Jira
          const issueReq = mapTaskToJiraIssue(task, this.config, epicKey);
          const response = await this.client.createIssue(issueReq);
          stories.push({ taskId: task.id, jiraKey: response.key, action: 'created' });
        } else if (hasContentChanged(task.description, task.status, existingMapping.contentHash)) {
          // Task changed — update in Jira
          await this.updateTask(task, existingMapping, warnings);
          stories.push({ taskId: task.id, jiraKey: existingMapping.jiraKey, action: 'updated' });
        } else {
          stories.push({ taskId: task.id, jiraKey: existingMapping.jiraKey, action: 'skipped' });
        }
      }

      // Handle removed tasks
      for (const mapping of existingSync.tasks) {
        if (!taskIds.has(mapping.taskId) && !mapping.removed) {
          await this.removeTask(mapping);
          stories.push({ taskId: mapping.taskId, jiraKey: mapping.jiraKey, action: 'removed' });
        }
      }

      // Rebuild sync state
      const taskKeyMap = new Map<string, string>();
      for (const story of stories) {
        taskKeyMap.set(story.taskId, story.jiraKey);
      }
      // Keep existing mappings for unchanged tasks
      for (const mapping of existingSync.tasks) {
        if (!taskKeyMap.has(mapping.taskId)) {
          taskKeyMap.set(mapping.taskId, mapping.jiraKey);
        }
      }

      const syncState = this.buildSyncState(tasksFile, epicKey, taskKeyMap, existingSync);
      await this.writeSyncState(specDir, syncState);
    }

    const summary = {
      created: stories.filter((s) => s.action === 'created').length,
      updated: stories.filter((s) => s.action === 'updated').length,
      skipped: stories.filter((s) => s.action === 'skipped').length,
      removed: stories.filter((s) => s.action === 'removed').length,
      conflicts: warnings.length,
    };

    return { success: true, epicKey, summary, stories, warnings };
  }

  private async createEpic(tasksFile: SpecKitTasksFile): Promise<string> {
    const epicReq = mapSpecToEpic(tasksFile.spec_id, tasksFile.spec_name, this.config);
    const response = await this.client.createIssue(epicReq);
    return response.key;
  }

  private async updateTask(
    task: { id: string; description: string; status: string },
    mapping: TaskMapping,
    warnings: string[]
  ): Promise<void> {
    // Check for conflicts by comparing Jira's current state
    try {
      const jiraIssue = await this.client.getIssue(mapping.jiraKey);
      const jiraStatus = jiraIssue.fields.status.name;

      // Attempt status transition if needed
      const targetTransition = mapStatusToTransition(
        task.status as 'pending' | 'in_progress' | 'completed' | 'blocked',
        this.config
      );

      if (jiraStatus !== targetTransition) {
        const transitions = await this.client.getTransitions(mapping.jiraKey);
        const match = transitions.transitions.find(
          (t) => t.name === targetTransition || t.to.name === targetTransition
        );
        if (match) {
          await this.client.performTransition(mapping.jiraKey, match.id);
        } else {
          warnings.push(
            `Cannot transition ${mapping.jiraKey} to "${targetTransition}": transition not available`
          );
        }
      }
    } catch (error) {
      warnings.push(
        `Failed to update ${mapping.jiraKey}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async removeTask(mapping: TaskMapping): Promise<void> {
    try {
      const transitions = await this.client.getTransitions(mapping.jiraKey);
      const wontDo = transitions.transitions.find(
        (t) => t.name === "Won't Do" || t.to.name === "Won't Do"
      );
      if (wontDo) {
        await this.client.performTransition(mapping.jiraKey, wontDo.id);
      }
    } catch {
      // Best effort — if transition fails, just mark as removed in sync state
    }
  }

  private buildSyncState(
    tasksFile: SpecKitTasksFile,
    epicKey: string,
    taskKeyMap: Map<string, string>,
    existingSync?: JiraSyncState
  ): JiraSyncState {
    const now = new Date().toISOString();
    const taskIds = new Set(tasksFile.tasks.map((t) => t.id));

    const tasks: TaskMapping[] = tasksFile.tasks.map((task) => {
      const jiraKey = taskKeyMap.get(task.id) ?? '';
      const isVerify =
        task.id.startsWith('T-VERIFY') ||
        task.id.startsWith('T-DOC') ||
        task.id.startsWith('T-FINAL');
      return {
        taskId: task.id,
        jiraKey,
        issueType: isVerify ? ('Sub-task' as const) : ('Story' as const),
        lastSyncedStatus: task.status as TaskMapping['lastSyncedStatus'],
        contentHash: computeContentHash(task.description, task.status),
        lastSyncedAt: now,
        removed: false,
      };
    });

    // Preserve removed task mappings
    if (existingSync) {
      for (const mapping of existingSync.tasks) {
        if (!taskIds.has(mapping.taskId)) {
          tasks.push({ ...mapping, removed: true, lastSyncedAt: now });
        }
      }
    }

    return {
      version: '1.0',
      jiraUrl: this.config.jiraUrl,
      projectKey: this.config.projectKey,
      spec: { specId: tasksFile.spec_id, specName: tasksFile.spec_name },
      epic: {
        jiraKey: epicKey,
        summary: `[Spec ${tasksFile.spec_id}] ${tasksFile.spec_name}`,
        lastSyncedAt: now,
      },
      tasks,
      lastSyncAt: now,
    };
  }

  private async readTasksFile(specDir: string): Promise<SpecKitTasksFile> {
    const content = await readFile(join(specDir, 'tasks.json'), 'utf-8');
    return JSON.parse(content) as SpecKitTasksFile;
  }

  private async readSyncState(specDir: string): Promise<JiraSyncState | null> {
    try {
      const content = await readFile(join(specDir, 'jira-sync.json'), 'utf-8');
      return JSON.parse(content) as JiraSyncState;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  private async writeSyncState(specDir: string, state: JiraSyncState): Promise<void> {
    await writeFile(join(specDir, 'jira-sync.json'), JSON.stringify(state, null, 2));
  }
}
