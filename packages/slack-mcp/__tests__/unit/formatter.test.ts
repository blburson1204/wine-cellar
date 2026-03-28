import { describe, it, expect } from 'vitest';

// Will import from src/formatter.ts once implemented
// import { formatPhaseTransition, formatTaskCompletion, formatMilestone } from '../../src/formatter.js';

import type {
  NotificationEvent,
  PhaseTransition,
  TaskCompletion,
  Milestone,
} from '../../src/types.js';

describe('formatter', () => {
  describe('formatPhaseTransition', () => {
    it('should return Block Kit payload with phase transition details', async () => {
      const event: NotificationEvent = {
        type: 'phase_transition',
        specId: '007-slack-integration',
        specName: 'Slack Integration',
        timestamp: '2024-01-15T10:30:00Z',
        details: {
          fromPhase: 'plan',
          toPhase: 'tasks',
        } as PhaseTransition,
      };

      const { formatPhaseTransition } = await import('../../src/formatter.js');
      const result = formatPhaseTransition(event);

      expect(result).toHaveProperty('blocks');
      expect(result.blocks).toBeInstanceOf(Array);
      expect(result.blocks.length).toBeGreaterThan(0);
    });

    it('should include spec name in the header', async () => {
      const event: NotificationEvent = {
        type: 'phase_transition',
        specId: '007-slack-integration',
        specName: 'Slack Integration',
        timestamp: '2024-01-15T10:30:00Z',
        details: {
          fromPhase: 'specify',
          toPhase: 'plan',
        } as PhaseTransition,
      };

      const { formatPhaseTransition } = await import('../../src/formatter.js');
      const result = formatPhaseTransition(event);

      const headerBlock = result.blocks.find(
        (block: { type: string }) => block.type === 'header' || block.type === 'section'
      );
      expect(headerBlock).toBeDefined();

      // The spec name should appear somewhere in the message
      const stringified = JSON.stringify(result);
      expect(stringified).toContain('Slack Integration');
    });

    it('should include from and to phase in the message', async () => {
      const event: NotificationEvent = {
        type: 'phase_transition',
        specId: '007-slack-integration',
        specName: 'Slack Integration',
        timestamp: '2024-01-15T10:30:00Z',
        details: {
          fromPhase: 'tasks',
          toPhase: 'implement',
        } as PhaseTransition,
      };

      const { formatPhaseTransition } = await import('../../src/formatter.js');
      const result = formatPhaseTransition(event);

      const stringified = JSON.stringify(result);
      expect(stringified).toContain('tasks');
      expect(stringified).toContain('implement');
    });

    it('should use appropriate emoji for phase transition', async () => {
      const event: NotificationEvent = {
        type: 'phase_transition',
        specId: '007-slack-integration',
        specName: 'Slack Integration',
        timestamp: '2024-01-15T10:30:00Z',
        details: {
          fromPhase: 'plan',
          toPhase: 'tasks',
        } as PhaseTransition,
      };

      const { formatPhaseTransition } = await import('../../src/formatter.js');
      const result = formatPhaseTransition(event);

      const stringified = JSON.stringify(result);
      // Should contain some emoji (arrow, phase-related)
      expect(stringified).toMatch(/[\u{1F680}-\u{1F6FF}]|➡️|🔄|📋|✅|🚀|:arrow|:rocket/u);
    });
  });

  describe('formatTaskCompletion', () => {
    it('should return Block Kit payload with task completion details', async () => {
      const event: NotificationEvent = {
        type: 'task_completion',
        specId: '007-slack-integration',
        specName: 'Slack Integration',
        timestamp: '2024-01-15T10:30:00Z',
        details: {
          taskId: 'T001',
          taskDescription: 'Initialize package scaffolding',
          status: 'completed',
        } as TaskCompletion,
      };

      const { formatTaskCompletion } = await import('../../src/formatter.js');
      const result = formatTaskCompletion(event);

      expect(result).toHaveProperty('blocks');
      expect(result.blocks).toBeInstanceOf(Array);
      expect(result.blocks.length).toBeGreaterThan(0);
    });

    it('should include task ID and description', async () => {
      const event: NotificationEvent = {
        type: 'task_completion',
        specId: '007-slack-integration',
        specName: 'Slack Integration',
        timestamp: '2024-01-15T10:30:00Z',
        details: {
          taskId: 'T005',
          taskDescription: 'Write unit tests for slack-client',
          status: 'completed',
        } as TaskCompletion,
      };

      const { formatTaskCompletion } = await import('../../src/formatter.js');
      const result = formatTaskCompletion(event);

      const stringified = JSON.stringify(result);
      expect(stringified).toContain('T005');
      expect(stringified).toContain('Write unit tests for slack-client');
    });

    it('should use green color/emoji for completed status', async () => {
      const event: NotificationEvent = {
        type: 'task_completion',
        specId: '007-slack-integration',
        specName: 'Slack Integration',
        timestamp: '2024-01-15T10:30:00Z',
        details: {
          taskId: 'T001',
          taskDescription: 'Initialize package',
          status: 'completed',
        } as TaskCompletion,
      };

      const { formatTaskCompletion } = await import('../../src/formatter.js');
      const result = formatTaskCompletion(event);

      const stringified = JSON.stringify(result);
      // Should contain success indicator (green color code, checkmark emoji)
      expect(stringified).toMatch(/✅|:white_check_mark:|#36a64f|good|success/i);
    });

    it('should use red color/emoji for failed status', async () => {
      const event: NotificationEvent = {
        type: 'task_completion',
        specId: '007-slack-integration',
        specName: 'Slack Integration',
        timestamp: '2024-01-15T10:30:00Z',
        details: {
          taskId: 'T003',
          taskDescription: 'Implement feature X',
          status: 'failed',
        } as TaskCompletion,
      };

      const { formatTaskCompletion } = await import('../../src/formatter.js');
      const result = formatTaskCompletion(event);

      const stringified = JSON.stringify(result);
      // Should contain failure indicator (red color code, X emoji)
      expect(stringified).toMatch(/❌|:x:|#e01e5a|danger|fail/i);
    });
  });

  describe('formatMilestone', () => {
    it('should return Block Kit payload with milestone details', async () => {
      const event: NotificationEvent = {
        type: 'milestone',
        specId: '007-slack-integration',
        specName: 'Slack Integration',
        timestamp: '2024-01-15T10:30:00Z',
        details: {
          milestone: 'spec_created',
          summary: 'New spec initialized',
        } as Milestone,
      };

      const { formatMilestone } = await import('../../src/formatter.js');
      const result = formatMilestone(event);

      expect(result).toHaveProperty('blocks');
      expect(result.blocks).toBeInstanceOf(Array);
      expect(result.blocks.length).toBeGreaterThan(0);
    });

    it('should include milestone type and summary', async () => {
      const event: NotificationEvent = {
        type: 'milestone',
        specId: '007-slack-integration',
        specName: 'Slack Integration',
        timestamp: '2024-01-15T10:30:00Z',
        details: {
          milestone: 'all_tasks_complete',
          summary: 'All 18 tasks completed successfully',
        } as Milestone,
      };

      const { formatMilestone } = await import('../../src/formatter.js');
      const result = formatMilestone(event);

      const stringified = JSON.stringify(result);
      expect(stringified).toContain('All 18 tasks completed successfully');
    });

    it('should use celebration emoji for verify_passed milestone', async () => {
      const event: NotificationEvent = {
        type: 'milestone',
        specId: '007-slack-integration',
        specName: 'Slack Integration',
        timestamp: '2024-01-15T10:30:00Z',
        details: {
          milestone: 'verify_passed',
          summary: 'Spec verification complete',
        } as Milestone,
      };

      const { formatMilestone } = await import('../../src/formatter.js');
      const result = formatMilestone(event);

      const stringified = JSON.stringify(result);
      // Should contain celebration indicator (party emoji, trophy, etc.)
      expect(stringified).toMatch(/🎉|🏆|✨|:tada:|:trophy:|:sparkles:/);
    });

    it('should use appropriate emoji for spec_created milestone', async () => {
      const event: NotificationEvent = {
        type: 'milestone',
        specId: '007-slack-integration',
        specName: 'Slack Integration',
        timestamp: '2024-01-15T10:30:00Z',
        details: {
          milestone: 'spec_created',
          summary: 'New spec initialized',
        } as Milestone,
      };

      const { formatMilestone } = await import('../../src/formatter.js');
      const result = formatMilestone(event);

      const stringified = JSON.stringify(result);
      // Should contain creation indicator (document, new, start emoji)
      expect(stringified).toMatch(/📄|📝|🆕|:page_facing_up:|:memo:|:new:/);
    });
  });

  describe('Block Kit structure', () => {
    it('should include a context block with timestamp', async () => {
      const event: NotificationEvent = {
        type: 'phase_transition',
        specId: '007-slack-integration',
        specName: 'Slack Integration',
        timestamp: '2024-01-15T10:30:00Z',
        details: {
          fromPhase: 'plan',
          toPhase: 'tasks',
        } as PhaseTransition,
      };

      const { formatPhaseTransition } = await import('../../src/formatter.js');
      const result = formatPhaseTransition(event);

      const contextBlock = result.blocks.find(
        (block: { type: string }) => block.type === 'context'
      );
      expect(contextBlock).toBeDefined();

      const stringified = JSON.stringify(result);
      expect(stringified).toContain('2024-01-15');
    });

    it('should include spec ID in the message', async () => {
      const event: NotificationEvent = {
        type: 'task_completion',
        specId: '007-slack-integration',
        specName: 'Slack Integration',
        timestamp: '2024-01-15T10:30:00Z',
        details: {
          taskId: 'T001',
          taskDescription: 'Initialize package',
          status: 'completed',
        } as TaskCompletion,
      };

      const { formatTaskCompletion } = await import('../../src/formatter.js');
      const result = formatTaskCompletion(event);

      const stringified = JSON.stringify(result);
      expect(stringified).toContain('007-slack-integration');
    });
  });
});
