import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  JiraSyncConfig,
  JiraSyncState,
  SpecKitTasksFile,
  JiraCreateIssueResponse,
  JiraIssue,
  JiraTransitionsResponse,
} from '../../src/types.js';

// Mock fs for jira-sync.json read/write
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

// Mock JiraClient
vi.mock('../../src/jira-client.js', () => ({
  JiraClient: vi.fn().mockImplementation(() => mockJiraClient),
}));

const mockJiraClient = {
  createIssue: vi.fn(),
  updateIssue: vi.fn(),
  getIssue: vi.fn(),
  getTransitions: vi.fn(),
  performTransition: vi.fn(),
  createIssueLink: vi.fn(),
  search: vi.fn(),
};

const mockConfig: JiraSyncConfig = {
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
};

const makeTasksFile = (overrides: Partial<SpecKitTasksFile> = {}): SpecKitTasksFile => ({
  spec_id: '006',
  spec_name: 'jira-integration-map',
  tasks: [
    {
      id: 'T001',
      phase: 'setup',
      description: 'Scaffold package',
      status: 'pending',
      parallel: false,
      target_file: null,
      gate: null,
    },
    {
      id: 'T002',
      phase: 'setup',
      description: 'Create types',
      status: 'pending',
      parallel: false,
      target_file: null,
      gate: 'T001',
    },
  ],
  ...overrides,
});

const makeIssueResponse = (key: string): JiraCreateIssueResponse => ({
  id: key.replace('WC-', '1000'),
  key,
  self: `https://test.atlassian.net/rest/api/3/issue/${key}`,
});

const makeJiraIssue = (key: string, summary: string, status: string): JiraIssue => ({
  id: '10001',
  key,
  self: '',
  fields: {
    summary,
    status: { name: status, id: '1' },
    issuetype: { name: 'Story' },
    updated: new Date().toISOString(),
  },
});

describe('SyncEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('first sync (no existing jira-sync.json)', () => {
    it('should create Epic + Stories on first sync', async () => {
      const fs = await import('node:fs/promises');
      const { SyncEngine } = await import('../../src/sync-engine.js');

      // No existing sync state
      vi.mocked(fs.readFile).mockImplementation(async (path) => {
        const pathStr = String(path);
        if (pathStr.endsWith('tasks.json')) {
          return JSON.stringify(makeTasksFile());
        }
        if (pathStr.endsWith('jira-sync.json')) {
          throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
        }
        throw new Error(`Unexpected read: ${pathStr}`);
      });
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      // Mock Jira responses
      mockJiraClient.createIssue
        .mockResolvedValueOnce(makeIssueResponse('WC-1')) // Epic
        .mockResolvedValueOnce(makeIssueResponse('WC-2')) // T001
        .mockResolvedValueOnce(makeIssueResponse('WC-3')); // T002

      const engine = new SyncEngine(mockJiraClient, mockConfig);
      const result = await engine.sync('/specs/006-jira-integration-map');

      expect(result.success).toBe(true);
      expect(result.epicKey).toBe('WC-1');
      expect(result.summary.created).toBe(2);
      expect(result.stories).toHaveLength(2);
      expect(mockJiraClient.createIssue).toHaveBeenCalledTimes(3); // 1 epic + 2 stories
    });

    it('should create issue links for gated tasks', async () => {
      const fs = await import('node:fs/promises');
      const { SyncEngine } = await import('../../src/sync-engine.js');

      vi.mocked(fs.readFile).mockImplementation(async (path) => {
        const pathStr = String(path);
        if (pathStr.endsWith('tasks.json')) return JSON.stringify(makeTasksFile());
        if (pathStr.endsWith('jira-sync.json'))
          throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
        throw new Error(`Unexpected read: ${pathStr}`);
      });
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      mockJiraClient.createIssue
        .mockResolvedValueOnce(makeIssueResponse('WC-1'))
        .mockResolvedValueOnce(makeIssueResponse('WC-2'))
        .mockResolvedValueOnce(makeIssueResponse('WC-3'));
      mockJiraClient.createIssueLink.mockResolvedValue(undefined);

      const engine = new SyncEngine(mockJiraClient, mockConfig);
      await engine.sync('/specs/006-jira-integration-map');

      // T002 gates on T001, so one link should be created
      expect(mockJiraClient.createIssueLink).toHaveBeenCalledTimes(1);
      expect(mockJiraClient.createIssueLink).toHaveBeenCalledWith(
        expect.objectContaining({
          type: { name: 'Blocks' },
        })
      );
    });

    it('should write jira-sync.json after successful sync', async () => {
      const fs = await import('node:fs/promises');
      const { SyncEngine } = await import('../../src/sync-engine.js');

      vi.mocked(fs.readFile).mockImplementation(async (path) => {
        const pathStr = String(path);
        if (pathStr.endsWith('tasks.json')) return JSON.stringify(makeTasksFile());
        if (pathStr.endsWith('jira-sync.json'))
          throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
        throw new Error(`Unexpected read: ${pathStr}`);
      });
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      mockJiraClient.createIssue
        .mockResolvedValueOnce(makeIssueResponse('WC-1'))
        .mockResolvedValueOnce(makeIssueResponse('WC-2'))
        .mockResolvedValueOnce(makeIssueResponse('WC-3'));

      const engine = new SyncEngine(mockJiraClient, mockConfig);
      await engine.sync('/specs/006-jira-integration-map');

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('jira-sync.json'),
        expect.any(String)
      );

      const writtenData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
      expect(writtenData.version).toBe('1.0');
      expect(writtenData.epic.jiraKey).toBe('WC-1');
      expect(writtenData.tasks).toHaveLength(2);
    });
  });

  describe('re-sync (existing jira-sync.json)', () => {
    it('should update changed tasks and skip unchanged', async () => {
      const fs = await import('node:fs/promises');
      const { SyncEngine } = await import('../../src/sync-engine.js');
      const { computeContentHash } = await import('../../src/hash.js');

      const existingSync: JiraSyncState = {
        version: '1.0',
        jiraUrl: 'https://test.atlassian.net',
        projectKey: 'WC',
        spec: { specId: '006', specName: 'jira-integration-map' },
        epic: {
          jiraKey: 'WC-1',
          summary: '[Spec 006] jira-integration-map',
          lastSyncedAt: new Date().toISOString(),
        },
        tasks: [
          {
            taskId: 'T001',
            jiraKey: 'WC-2',
            issueType: 'Story',
            lastSyncedStatus: 'pending',
            contentHash: computeContentHash('Scaffold package', 'pending'),
            lastSyncedAt: new Date().toISOString(),
            removed: false,
          },
          {
            taskId: 'T002',
            jiraKey: 'WC-3',
            issueType: 'Story',
            lastSyncedStatus: 'pending',
            contentHash: computeContentHash('Create types', 'pending'),
            lastSyncedAt: new Date().toISOString(),
            removed: false,
          },
        ],
        lastSyncAt: new Date().toISOString(),
      };

      // T001 changed status to completed
      const updatedTasks = makeTasksFile({
        tasks: [
          {
            id: 'T001',
            phase: 'setup',
            description: 'Scaffold package',
            status: 'completed',
            parallel: false,
            target_file: null,
            gate: null,
          },
          {
            id: 'T002',
            phase: 'setup',
            description: 'Create types',
            status: 'pending',
            parallel: false,
            target_file: null,
            gate: 'T001',
          },
        ],
      });

      vi.mocked(fs.readFile).mockImplementation(async (path) => {
        const pathStr = String(path);
        if (pathStr.endsWith('tasks.json')) return JSON.stringify(updatedTasks);
        if (pathStr.endsWith('jira-sync.json')) return JSON.stringify(existingSync);
        throw new Error(`Unexpected read: ${pathStr}`);
      });
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      // Mock getIssue for conflict check
      mockJiraClient.getIssue.mockResolvedValue(
        makeJiraIssue('WC-2', '[T001] Scaffold package', 'To Do')
      );
      // Mock transitions for status update
      mockJiraClient.getTransitions.mockResolvedValue({
        transitions: [{ id: '31', name: 'Done', to: { id: '4', name: 'Done' } }],
      } as JiraTransitionsResponse);
      mockJiraClient.performTransition.mockResolvedValue(undefined);
      mockJiraClient.updateIssue.mockResolvedValue(undefined);

      const engine = new SyncEngine(mockJiraClient, mockConfig);
      const result = await engine.sync('/specs/006-jira-integration-map');

      expect(result.success).toBe(true);
      expect(result.summary.updated).toBeGreaterThanOrEqual(1);
      expect(result.summary.skipped).toBeGreaterThanOrEqual(1);
    });
  });

  describe('removed task handling', () => {
    it('should mark removed tasks with removed flag', async () => {
      const fs = await import('node:fs/promises');
      const { SyncEngine } = await import('../../src/sync-engine.js');
      const { computeContentHash } = await import('../../src/hash.js');

      const existingSync: JiraSyncState = {
        version: '1.0',
        jiraUrl: 'https://test.atlassian.net',
        projectKey: 'WC',
        spec: { specId: '006', specName: 'jira-integration-map' },
        epic: {
          jiraKey: 'WC-1',
          summary: '[Spec 006] jira-integration-map',
          lastSyncedAt: new Date().toISOString(),
        },
        tasks: [
          {
            taskId: 'T001',
            jiraKey: 'WC-2',
            issueType: 'Story',
            lastSyncedStatus: 'pending',
            contentHash: computeContentHash('Scaffold package', 'pending'),
            lastSyncedAt: new Date().toISOString(),
            removed: false,
          },
          {
            taskId: 'T002',
            jiraKey: 'WC-3',
            issueType: 'Story',
            lastSyncedStatus: 'pending',
            contentHash: computeContentHash('Create types', 'pending'),
            lastSyncedAt: new Date().toISOString(),
            removed: false,
          },
        ],
        lastSyncAt: new Date().toISOString(),
      };

      // T002 removed from tasks.json
      const updatedTasks = makeTasksFile({
        tasks: [
          {
            id: 'T001',
            phase: 'setup',
            description: 'Scaffold package',
            status: 'pending',
            parallel: false,
            target_file: null,
            gate: null,
          },
        ],
      });

      vi.mocked(fs.readFile).mockImplementation(async (path) => {
        const pathStr = String(path);
        if (pathStr.endsWith('tasks.json')) return JSON.stringify(updatedTasks);
        if (pathStr.endsWith('jira-sync.json')) return JSON.stringify(existingSync);
        throw new Error(`Unexpected read: ${pathStr}`);
      });
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      // Mock transitions for "Won't Do"
      mockJiraClient.getTransitions.mockResolvedValue({
        transitions: [{ id: '41', name: "Won't Do", to: { id: '5', name: "Won't Do" } }],
      } as JiraTransitionsResponse);
      mockJiraClient.performTransition.mockResolvedValue(undefined);

      const engine = new SyncEngine(mockJiraClient, mockConfig);
      const result = await engine.sync('/specs/006-jira-integration-map');

      expect(result.success).toBe(true);
      expect(result.summary.removed).toBeGreaterThanOrEqual(1);

      // Check the written sync state marks T002 as removed
      const writtenData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
      const t002 = writtenData.tasks.find((t: { taskId: string }) => t.taskId === 'T002');
      expect(t002.removed).toBe(true);
    });
  });
});
