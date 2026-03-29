/**
 * Integration tests for notify.ts
 *
 * Tests the full flow: jira-sync.json file I/O, event parsing,
 * task mapping lookup, and Jira transition calls.
 * JiraClient is mocked at the network boundary.
 *
 * Spec: 008-feature-004-automatic (FR-005..FR-009, FR-012, FR-013)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import type { JiraSyncState } from '../../src/types.js';

// ── Mock JiraClient ───────────────────────────────────────────

const mockGetTransitions = vi.fn();
const mockPerformTransition = vi.fn();

vi.mock('../../src/jira-client.js', () => ({
  JiraClient: vi.fn().mockImplementation(() => ({
    getTransitions: mockGetTransitions,
    performTransition: mockPerformTransition,
  })),
}));

// ── Helpers ───────────────────────────────────────────────────

function makeTempSpecDir(): string {
  const dir = join(tmpdir(), `spec-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function writeSyncState(specDir: string, state: JiraSyncState): void {
  writeFileSync(join(specDir, 'jira-sync.json'), JSON.stringify(state));
}

const baseSyncState: JiraSyncState = {
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
  ],
  lastSyncAt: '2026-01-01T00:00:00Z',
};

// ── Tests ─────────────────────────────────────────────────────

describe('notify integration - processEvent with real file I/O', () => {
  let specDir: string;

  beforeEach(() => {
    vi.clearAllMocks();
    specDir = makeTempSpecDir();
  });

  afterEach(() => {
    rmSync(specDir, { recursive: true, force: true });
    vi.resetModules();
  });

  it('reads jira-sync.json from disk and transitions the Jira issue', async () => {
    writeSyncState(specDir, baseSyncState);
    mockGetTransitions.mockResolvedValue({
      transitions: [{ id: '21', name: 'In Progress', to: { id: '2', name: 'In Progress' } }],
    });
    mockPerformTransition.mockResolvedValue(undefined);

    const { processEvent } = await import('../../src/notify.js');
    const result = await processEvent(
      { specDir, taskId: 'T001', newStatus: 'in_progress' },
      baseSyncState
    );

    expect(result.success).toBe(true);
    expect(result.jiraKey).toBe('WC-2');
    expect(mockPerformTransition).toHaveBeenCalledWith('WC-2', '21');
  });

  it('returns success=false when jira-sync.json has no mapping for the task', async () => {
    writeSyncState(specDir, { ...baseSyncState, tasks: [] });

    const { processEvent } = await import('../../src/notify.js');
    const result = await processEvent(
      { specDir, taskId: 'T-UNKNOWN', newStatus: 'completed' },
      { ...baseSyncState, tasks: [] }
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/no mapping/i);
    expect(mockPerformTransition).not.toHaveBeenCalled();
  });

  it('returns success=false and logs when Jira API throws (fail-open)', async () => {
    writeSyncState(specDir, baseSyncState);
    mockGetTransitions.mockRejectedValue(new Error('ECONNREFUSED'));

    const { processEvent } = await import('../../src/notify.js');
    const result = await processEvent(
      { specDir, taskId: 'T001', newStatus: 'in_progress' },
      baseSyncState
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('ECONNREFUSED');
    // Never throws — caller sees error in result, not exception
  });

  it('handles all four SpecKit status values', async () => {
    writeSyncState(specDir, baseSyncState);
    mockGetTransitions.mockResolvedValue({
      transitions: [
        { id: '11', name: 'To Do', to: { id: '1', name: 'To Do' } },
        { id: '21', name: 'In Progress', to: { id: '2', name: 'In Progress' } },
        { id: '31', name: 'Done', to: { id: '3', name: 'Done' } },
        { id: '41', name: 'Blocked', to: { id: '4', name: 'Blocked' } },
      ],
    });
    mockPerformTransition.mockResolvedValue(undefined);

    const { processEvent } = await import('../../src/notify.js');

    for (const [status, expectedTransitionId] of [
      ['pending', '11'],
      ['in_progress', '21'],
      ['completed', '31'],
      ['blocked', '41'],
    ] as const) {
      vi.clearAllMocks();
      mockGetTransitions.mockResolvedValue({
        transitions: [
          { id: '11', name: 'To Do', to: { id: '1', name: 'To Do' } },
          { id: '21', name: 'In Progress', to: { id: '2', name: 'In Progress' } },
          { id: '31', name: 'Done', to: { id: '3', name: 'Done' } },
          { id: '41', name: 'Blocked', to: { id: '4', name: 'Blocked' } },
        ],
      });
      mockPerformTransition.mockResolvedValue(undefined);

      const result = await processEvent(
        { specDir, taskId: 'T001', newStatus: status },
        baseSyncState
      );
      expect(result.success).toBe(true);
      expect(mockPerformTransition).toHaveBeenCalledWith('WC-2', expectedTransitionId);
    }
  });
});

describe('notify integration - CLI argument parsing (FR-008, FR-009)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('processEvent gracefully handles missing task mapping (FR-008)', async () => {
    const stateWithoutTask: JiraSyncState = { ...baseSyncState, tasks: [] };
    const { processEvent } = await import('../../src/notify.js');
    const result = await processEvent(
      { specDir: '/some/dir', taskId: 'T-NOT-MAPPED', newStatus: 'completed' },
      stateWithoutTask
    );
    expect(result.success).toBe(false);
    expect(mockPerformTransition).not.toHaveBeenCalled();
  });

  it('processEvent never throws even when Jira client errors (FR-009)', async () => {
    mockGetTransitions.mockRejectedValue(new Error('Jira is down'));
    const { processEvent } = await import('../../src/notify.js');
    await expect(
      processEvent(
        { specDir: '/some/dir', taskId: 'T001', newStatus: 'in_progress' },
        baseSyncState
      )
    ).resolves.toMatchObject({ success: false });
  });
});
