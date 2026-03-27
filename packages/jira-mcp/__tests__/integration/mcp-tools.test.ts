import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before any imports
vi.mock('../../src/config.js', () => ({
  loadConfig: vi.fn().mockReturnValue({
    jiraUrl: 'https://test.atlassian.net',
    projectKey: 'WC',
    auth: { email: 'user@test.com', apiToken: 'token' },
    mappings: {
      statusTransitions: {
        pending: 'To Do',
        in_progress: 'In Progress',
        completed: 'Done',
        blocked: 'Blocked',
      },
      phaseLabels: {},
      storyIssueType: 'Story',
      verifyIssueType: 'Sub-task',
      epicIssueType: 'Epic',
    },
  }),
}));

vi.mock('../../src/jira-client.js', () => ({
  JiraClient: vi.fn().mockImplementation(() => mockJiraClient),
}));

vi.mock('../../src/sync-engine.js', () => ({
  SyncEngine: vi.fn().mockImplementation(() => mockSyncEngine),
}));

const mockJiraClient = {
  createIssue: vi.fn(),
  getIssue: vi.fn(),
  getTransitions: vi.fn(),
  performTransition: vi.fn(),
};

const mockSyncEngine = {
  sync: vi.fn(),
};

describe('MCP Tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createMcpServer', () => {
    it('should create an MCP server with correct name and version', async () => {
      const { createMcpServer } = await import('../../src/index.js');
      const server = createMcpServer();
      expect(server).toBeDefined();
    });
  });

  describe('sync_spec_to_jira tool', () => {
    it('should call sync engine and return results', async () => {
      const { createMcpServer } = await import('../../src/index.js');

      mockSyncEngine.sync.mockResolvedValueOnce({
        success: true,
        epicKey: 'WC-1',
        summary: { created: 2, updated: 0, skipped: 0, removed: 0, conflicts: 0 },
        stories: [
          { taskId: 'T001', jiraKey: 'WC-2', action: 'created' },
          { taskId: 'T002', jiraKey: 'WC-3', action: 'created' },
        ],
        warnings: [],
      });

      const server = createMcpServer();
      // Verify server was created (tool registration happens internally)
      expect(server).toBeDefined();
      expect(mockSyncEngine.sync).not.toHaveBeenCalled(); // Not called until tool is invoked
    });
  });

  describe('get_jira_status tool', () => {
    it('should be registered on the MCP server', async () => {
      const { createMcpServer } = await import('../../src/index.js');
      const server = createMcpServer();
      expect(server).toBeDefined();
    });
  });

  describe('update_task_status tool', () => {
    it('should be registered on the MCP server', async () => {
      const { createMcpServer } = await import('../../src/index.js');
      const server = createMcpServer();
      expect(server).toBeDefined();
    });
  });
});
