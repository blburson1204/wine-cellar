import { describe, it, expect } from 'vitest';
import type { SpecKitTask, JiraSyncConfig } from '../../src/types.js';

// Will import from src/mapper.ts once implemented
// import { mapTaskToJiraIssue, mapStatusToTransition, textToADF } from '../../src/mapper.js';

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
    storyIssueType: 'Task',
    verifyIssueType: 'Subtask',
    epicIssueType: 'Epic',
  },
};

const makeTask = (overrides: Partial<SpecKitTask> = {}): SpecKitTask => ({
  id: 'T001',
  phase: 'setup',
  description: 'Scaffold package with directory structure',
  status: 'pending',
  parallel: false,
  target_file: 'packages/jira-mcp/package.json',
  gate: null,
  ...overrides,
});

describe('mapper', () => {
  describe('mapTaskToJiraIssue', () => {
    it('should map a standard task to a Story issue', async () => {
      const { mapTaskToJiraIssue } = await import('../../src/mapper.js');
      const task = makeTask();
      const result = mapTaskToJiraIssue(task, mockConfig, 'WC-1');

      expect(result.fields.project.key).toBe('WC');
      expect(result.fields.issuetype.name).toBe('Task');
      expect(result.fields.summary).toContain('T001');
      expect(result.fields.summary).toContain('Scaffold package');
    });

    it('should use task issue type for all tasks including verify', async () => {
      const { mapTaskToJiraIssue } = await import('../../src/mapper.js');
      const task = makeTask({
        id: 'T-VERIFY-LINT',
        phase: 'verify',
        description: 'Run lint check',
      });
      const result = mapTaskToJiraIssue(task, mockConfig, 'WC-1');

      expect(result.fields.issuetype.name).toBe('Task');
    });

    it('should add verify-task label for verify tasks', async () => {
      const { mapTaskToJiraIssue } = await import('../../src/mapper.js');
      const task = makeTask({ id: 'T-VERIFY-LINT', phase: 'verify' });
      const result = mapTaskToJiraIssue(task, mockConfig, 'WC-1');

      expect(result.fields.labels).toContain('verify-task');
    });

    it('should include phase as a label', async () => {
      const { mapTaskToJiraIssue } = await import('../../src/mapper.js');
      const task = makeTask({ phase: 'tdd-unit' });
      const result = mapTaskToJiraIssue(task, mockConfig, 'WC-1');

      expect(result.fields.labels).toContain('speckit');
      expect(result.fields.labels).toContain('phase:tdd-unit');
    });

    it('should convert description to ADF format', async () => {
      const { mapTaskToJiraIssue } = await import('../../src/mapper.js');
      const task = makeTask();
      const result = mapTaskToJiraIssue(task, mockConfig, 'WC-1');

      expect(result.fields.description).toBeDefined();
      expect(result.fields.description?.type).toBe('doc');
      expect(result.fields.description?.version).toBe(1);
    });
  });

  describe('mapStatusToTransition', () => {
    it('should map pending to "To Do"', async () => {
      const { mapStatusToTransition } = await import('../../src/mapper.js');
      expect(mapStatusToTransition('pending', mockConfig)).toBe('To Do');
    });

    it('should map in_progress to "In Progress"', async () => {
      const { mapStatusToTransition } = await import('../../src/mapper.js');
      expect(mapStatusToTransition('in_progress', mockConfig)).toBe('In Progress');
    });

    it('should map completed to "Done"', async () => {
      const { mapStatusToTransition } = await import('../../src/mapper.js');
      expect(mapStatusToTransition('completed', mockConfig)).toBe('Done');
    });

    it('should map blocked to "Blocked"', async () => {
      const { mapStatusToTransition } = await import('../../src/mapper.js');
      expect(mapStatusToTransition('blocked', mockConfig)).toBe('Blocked');
    });
  });

  describe('mapSpecToEpic', () => {
    it('should create an Epic issue from spec metadata', async () => {
      const { mapSpecToEpic } = await import('../../src/mapper.js');
      const result = mapSpecToEpic('006', 'jira-integration-map', mockConfig);

      expect(result.fields.project.key).toBe('WC');
      expect(result.fields.issuetype.name).toBe('Epic');
      expect(result.fields.summary).toContain('006');
      expect(result.fields.summary).toContain('jira-integration-map');
    });
  });

  describe('textToADF', () => {
    it('should wrap plain text in a paragraph node', async () => {
      const { textToADF } = await import('../../src/mapper.js');
      const doc = textToADF('Hello world');

      expect(doc).toEqual({
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello world' }],
          },
        ],
      });
    });
  });
});
