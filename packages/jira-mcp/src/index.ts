import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { loadConfig } from './config.js';
import { JiraClient } from './jira-client.js';
import { SyncEngine } from './sync-engine.js';
import { mapStatusToTransition } from './mapper.js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { JiraSyncState } from './types.js';

export function createMcpServer(): McpServer {
  const server = new McpServer(
    { name: 'jira-speckit', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  // sync_spec_to_jira
  server.tool(
    'sync_spec_to_jira',
    'Push SpecKit tasks to Jira as Epic + Stories. Creates on first sync, updates on subsequent.',
    {
      specDir: z
        .string()
        .describe('Path to the spec directory (e.g., "specs/006-jira-integration-map")'),
      force: z
        .boolean()
        .optional()
        .default(false)
        .describe('Force overwrite conflicting Jira stories'),
    },
    async ({ specDir }) => {
      const config = loadConfig();
      const client = new JiraClient(config.jiraUrl, config.auth);
      const engine = new SyncEngine(client, config);
      const result = await engine.sync(specDir);

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // get_jira_status
  server.tool(
    'get_jira_status',
    'Read back current Jira status for a synced spec, comparing with SpecKit state.',
    {
      specDir: z.string().describe('Path to the spec directory'),
    },
    async ({ specDir }) => {
      const config = loadConfig();
      const client = new JiraClient(config.jiraUrl, config.auth);

      let syncState: JiraSyncState;
      try {
        const content = await readFile(join(specDir, 'jira-sync.json'), 'utf-8');
        syncState = JSON.parse(content) as JiraSyncState;
      } catch {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                synced: false,
                epic: null,
                specKitStories: [],
                jiraOnlyStories: [],
                lastSyncAt: null,
              }),
            },
          ],
        };
      }

      const specKitStories = [];
      for (const mapping of syncState.tasks) {
        if (mapping.removed) continue;
        try {
          const issue = await client.getIssue(mapping.jiraKey);
          specKitStories.push({
            taskId: mapping.taskId,
            jiraKey: mapping.jiraKey,
            jiraStatus: issue.fields.status.name,
            specKitStatus: mapping.lastSyncedStatus,
            inSync:
              issue.fields.status.name ===
              config.mappings.statusTransitions[mapping.lastSyncedStatus],
          });
        } catch {
          specKitStories.push({
            taskId: mapping.taskId,
            jiraKey: mapping.jiraKey,
            jiraStatus: 'unknown',
            specKitStatus: mapping.lastSyncedStatus,
            inSync: false,
          });
        }
      }

      const result = {
        synced: true,
        epic: syncState.epic
          ? {
              key: syncState.epic.jiraKey,
              summary: syncState.epic.summary,
              status: 'unknown',
              url: `${config.jiraUrl}/browse/${syncState.epic.jiraKey}`,
            }
          : null,
        specKitStories,
        jiraOnlyStories: [],
        lastSyncAt: syncState.lastSyncAt,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // update_task_status
  server.tool(
    'update_task_status',
    'Transition a single Jira issue to match a SpecKit task status change.',
    {
      specDir: z.string().describe('Path to the spec directory'),
      taskId: z.string().describe('SpecKit task ID (e.g., "T001")'),
      status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).describe('New status'),
    },
    async ({ specDir, taskId, status }) => {
      const config = loadConfig();
      const client = new JiraClient(config.jiraUrl, config.auth);

      let syncState: JiraSyncState;
      try {
        const content = await readFile(join(specDir, 'jira-sync.json'), 'utf-8');
        syncState = JSON.parse(content) as JiraSyncState;
      } catch {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                success: false,
                jiraKey: '',
                previousStatus: '',
                newStatus: '',
                error: 'No jira-sync.json found. Run sync_spec_to_jira first.',
              }),
            },
          ],
        };
      }

      const mapping = syncState.tasks.find((t) => t.taskId === taskId);
      if (!mapping) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                success: false,
                jiraKey: '',
                previousStatus: '',
                newStatus: '',
                error: `Task ${taskId} not found in sync state`,
              }),
            },
          ],
        };
      }

      try {
        const issue = await client.getIssue(mapping.jiraKey);
        const previousStatus = issue.fields.status.name;
        const targetTransition = mapStatusToTransition(status, config);

        if (previousStatus === targetTransition) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  success: true,
                  jiraKey: mapping.jiraKey,
                  previousStatus,
                  newStatus: previousStatus,
                }),
              },
            ],
          };
        }

        const transitions = await client.getTransitions(mapping.jiraKey);
        const match = transitions.transitions.find(
          (t) => t.name === targetTransition || t.to.name === targetTransition
        );

        if (!match) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  success: false,
                  jiraKey: mapping.jiraKey,
                  previousStatus,
                  newStatus: previousStatus,
                  error: `No transition to "${targetTransition}" available`,
                }),
              },
            ],
          };
        }

        await client.performTransition(mapping.jiraKey, match.id);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                success: true,
                jiraKey: mapping.jiraKey,
                previousStatus,
                newStatus: targetTransition,
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                success: false,
                jiraKey: mapping.jiraKey,
                previousStatus: '',
                newStatus: '',
                error: error instanceof Error ? error.message : String(error),
              }),
            },
          ],
        };
      }
    }
  );

  return server;
}

// Main entry point — run when executed directly
const isMainModule =
  process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMainModule || process.argv[1]?.endsWith('index.js')) {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  server.connect(transport).catch((error) => {
    process.stderr.write(`Failed to start Jira MCP server: ${error}\n`);
    process.exit(1);
  });
}
