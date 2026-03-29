import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { JiraNotifyEvent, JiraSyncState } from '../../src/types.js';

// Will import from src/notify.ts once implemented
// import { processEvent } from '../../src/notify.js';

// ── Fixtures ──────────────────────────────────────────────────

const makeSyncState = (overrides: Partial<JiraSyncState> = {}): JiraSyncState => ({
  version: '1.0',
  jiraUrl: 'https://test.atlassian.net',
  projectKey: 'WC',
  spec: { specId: '008', specName: 'feature-004-automatic' },
  epic: { jiraKey: 'WC-1', summary: 'Epic', lastSyncedAt: '2026-01-01T00:00:00Z' },
  tasks: [
    {
      taskId: 'T001',
      jiraKey: 'WC-2',
      issueType: 'Story',
      lastSyncedStatus: 'pending',
      contentHash: 'abc',
      lastSyncedAt: '2026-01-01T00:00:00Z',
      removed: false,
    },
    {
      taskId: 'T002',
      jiraKey: 'WC-3',
      issueType: 'Story',
      lastSyncedStatus: 'pending',
      contentHash: 'def',
      lastSyncedAt: '2026-01-01T00:00:00Z',
      removed: false,
    },
  ],
  lastSyncAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

const makeEvent = (overrides: Partial<JiraNotifyEvent> = {}): JiraNotifyEvent => ({
  specDir: '/repo/specs/008-feature',
  taskId: 'T001',
  newStatus: 'in_progress',
  ...overrides,
});

// ── Mock JiraClient ───────────────────────────────────────────

const mockGetTransitions = vi.fn();
const mockPerformTransition = vi.fn();

vi.mock('../../src/jira-client.js', () => ({
  JiraClient: vi.fn().mockImplementation(() => ({
    getTransitions: mockGetTransitions,
    performTransition: mockPerformTransition,
  })),
}));

// ── Tests ─────────────────────────────────────────────────────

describe('notify - processEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('transitions Jira issue when task status changes to in_progress', async () => {
    mockGetTransitions.mockResolvedValue({
      transitions: [
        { id: '11', name: 'To Do', to: { id: '1', name: 'To Do' } },
        { id: '21', name: 'In Progress', to: { id: '2', name: 'In Progress' } },
        { id: '31', name: 'Done', to: { id: '3', name: 'Done' } },
      ],
    });
    mockPerformTransition.mockResolvedValue(undefined);

    const { processEvent } = await import('../../src/notify.js');
    const result = await processEvent(makeEvent({ newStatus: 'in_progress' }), makeSyncState());

    expect(result.success).toBe(true);
    expect(result.jiraKey).toBe('WC-2');
    expect(mockPerformTransition).toHaveBeenCalledWith('WC-2', '21');
  });

  it('transitions Jira issue when task status changes to completed', async () => {
    mockGetTransitions.mockResolvedValue({
      transitions: [{ id: '31', name: 'Done', to: { id: '3', name: 'Done' } }],
    });
    mockPerformTransition.mockResolvedValue(undefined);

    const { processEvent } = await import('../../src/notify.js');
    const result = await processEvent(makeEvent({ newStatus: 'completed' }), makeSyncState());

    expect(result.success).toBe(true);
    expect(mockPerformTransition).toHaveBeenCalledWith('WC-2', '31');
  });

  it('returns success=false when task ID has no mapping in jira-sync.json', async () => {
    const { processEvent } = await import('../../src/notify.js');
    const result = await processEvent(makeEvent({ taskId: 'T-UNMAPPED' }), makeSyncState());

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/no mapping/i);
    expect(mockPerformTransition).not.toHaveBeenCalled();
  });

  it('returns success=false when matching transition not found in Jira', async () => {
    mockGetTransitions.mockResolvedValue({
      transitions: [{ id: '11', name: 'To Do', to: { id: '1', name: 'To Do' } }],
    });

    const { processEvent } = await import('../../src/notify.js');
    // in_progress maps to "In Progress" which is not in transitions list
    const result = await processEvent(makeEvent({ newStatus: 'in_progress' }), makeSyncState());

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/transition.*not found/i);
    expect(mockPerformTransition).not.toHaveBeenCalled();
  });

  it('returns success=false when JiraClient.getTransitions throws', async () => {
    mockGetTransitions.mockRejectedValue(new Error('Network error'));

    const { processEvent } = await import('../../src/notify.js');
    const result = await processEvent(makeEvent(), makeSyncState());

    expect(result.success).toBe(false);
    expect(result.error).toContain('Network error');
  });

  it('returns success=false when JiraClient.performTransition throws', async () => {
    mockGetTransitions.mockResolvedValue({
      transitions: [{ id: '21', name: 'In Progress', to: { id: '2', name: 'In Progress' } }],
    });
    mockPerformTransition.mockRejectedValue(new Error('Transition failed'));

    const { processEvent } = await import('../../src/notify.js');
    const result = await processEvent(makeEvent(), makeSyncState());

    expect(result.success).toBe(false);
    expect(result.error).toContain('Transition failed');
  });
});

describe('notify - status mapping', () => {
  it('maps pending to "To Do"', async () => {
    const { SPECKIT_TO_JIRA_STATUS } = await import('../../src/notify.js');
    expect(SPECKIT_TO_JIRA_STATUS['pending']).toBe('To Do');
  });

  it('maps in_progress to "In Progress"', async () => {
    const { SPECKIT_TO_JIRA_STATUS } = await import('../../src/notify.js');
    expect(SPECKIT_TO_JIRA_STATUS['in_progress']).toBe('In Progress');
  });

  it('maps completed to "Done"', async () => {
    const { SPECKIT_TO_JIRA_STATUS } = await import('../../src/notify.js');
    expect(SPECKIT_TO_JIRA_STATUS['completed']).toBe('Done');
  });

  it('maps blocked to "Blocked"', async () => {
    const { SPECKIT_TO_JIRA_STATUS } = await import('../../src/notify.js');
    expect(SPECKIT_TO_JIRA_STATUS['blocked']).toBe('Blocked');
  });
});
