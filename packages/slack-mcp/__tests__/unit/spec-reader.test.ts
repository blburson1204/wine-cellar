import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs/promises';

// Mock fs/promises
vi.mock('node:fs/promises');

describe('spec-reader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('readSpecFrontmatter', () => {
    it('should parse YAML frontmatter from spec.md and return spec metadata', async () => {
      const mockSpecContent = `---
meta:
  spec_id: "007"
  spec_name: slack-integration-progress
  status: draft
  phase: implement
  created: 2026-03-27
  updated: 2026-03-27
---

# Feature Specification
`;

      vi.mocked(fs.readFile).mockResolvedValueOnce(mockSpecContent);

      const { readSpecFrontmatter } = await import('../../src/spec-reader.js');
      const result = await readSpecFrontmatter('/specs/007-slack-integration');

      expect(result).toEqual({
        specId: '007',
        specName: 'slack-integration-progress',
        phase: 'implement',
      });
    });

    it('should handle different phases correctly', async () => {
      const mockSpecContent = `---
meta:
  spec_id: "005"
  spec_name: feature-x
  status: active
  phase: verify
  created: 2026-01-01
  updated: 2026-01-15
---

# Content
`;

      vi.mocked(fs.readFile).mockResolvedValueOnce(mockSpecContent);

      const { readSpecFrontmatter } = await import('../../src/spec-reader.js');
      const result = await readSpecFrontmatter('/specs/005-feature-x');

      expect(result.phase).toBe('verify');
    });

    it('should throw an error when spec.md file is missing', async () => {
      vi.mocked(fs.readFile).mockRejectedValueOnce(
        Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
      );

      const { readSpecFrontmatter } = await import('../../src/spec-reader.js');

      await expect(readSpecFrontmatter('/specs/missing-spec')).rejects.toThrow(
        /not found|ENOENT|does not exist/i
      );
    });

    it('should throw an error when frontmatter is malformed', async () => {
      const mockSpecContent = `---
this is not valid yaml: [
---

# Content
`;

      vi.mocked(fs.readFile).mockResolvedValueOnce(mockSpecContent);

      const { readSpecFrontmatter } = await import('../../src/spec-reader.js');

      await expect(readSpecFrontmatter('/specs/bad-spec')).rejects.toThrow(
        /parse|invalid|frontmatter/i
      );
    });
  });

  describe('readTasksProgress', () => {
    it('should parse tasks.json and return task counts', async () => {
      const mockTasksJson = JSON.stringify({
        tasks: [
          { id: 'T001', description: 'Task 1', status: 'done' },
          { id: 'T002', description: 'Task 2', status: 'done' },
          { id: 'T003', description: 'Task 3', status: 'pending' },
          { id: 'T004', description: 'Task 4', status: 'pending' },
          { id: 'T005', description: 'Task 5', status: 'failed' },
        ],
      });

      vi.mocked(fs.readFile).mockResolvedValueOnce(mockTasksJson);

      const { readTasksProgress } = await import('../../src/spec-reader.js');
      const result = await readTasksProgress('/specs/007-slack-integration');

      expect(result).toEqual({
        totalTasks: 5,
        completedTasks: 2,
        pendingTasks: 2,
        failedTasks: 1,
      });
    });

    it('should handle tasks.json with all completed tasks', async () => {
      const mockTasksJson = JSON.stringify({
        tasks: [
          { id: 'T001', description: 'Task 1', status: 'done' },
          { id: 'T002', description: 'Task 2', status: 'done' },
          { id: 'T003', description: 'Task 3', status: 'done' },
        ],
      });

      vi.mocked(fs.readFile).mockResolvedValueOnce(mockTasksJson);

      const { readTasksProgress } = await import('../../src/spec-reader.js');
      const result = await readTasksProgress('/specs/test');

      expect(result.totalTasks).toBe(3);
      expect(result.completedTasks).toBe(3);
      expect(result.pendingTasks).toBe(0);
      expect(result.failedTasks).toBe(0);
    });

    it('should return zeros when tasks.json file is missing', async () => {
      vi.mocked(fs.readFile).mockRejectedValueOnce(
        Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
      );

      const { readTasksProgress } = await import('../../src/spec-reader.js');
      const result = await readTasksProgress('/specs/no-tasks');

      expect(result).toEqual({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        failedTasks: 0,
      });
    });

    it('should handle empty tasks array', async () => {
      const mockTasksJson = JSON.stringify({
        tasks: [],
      });

      vi.mocked(fs.readFile).mockResolvedValueOnce(mockTasksJson);

      const { readTasksProgress } = await import('../../src/spec-reader.js');
      const result = await readTasksProgress('/specs/empty');

      expect(result.totalTasks).toBe(0);
      expect(result.completedTasks).toBe(0);
    });
  });

  describe('buildSpecProgress', () => {
    it('should combine frontmatter and tasks into SpecProgress', async () => {
      // Mock spec.md
      const mockSpecContent = `---
meta:
  spec_id: "007"
  spec_name: slack-integration-progress
  status: active
  phase: implement
  created: 2026-03-27
  updated: 2026-03-27
---

# Content
`;

      // Mock tasks.json (using prd.json format)
      const mockTasksJson = JSON.stringify({
        tasks: [
          { id: 'T001', description: 'Task 1', status: 'done' },
          { id: 'T002', description: 'Task 2', status: 'done' },
          { id: 'T003', description: 'Task 3', status: 'pending' },
        ],
      });

      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(mockSpecContent)
        .mockResolvedValueOnce(mockTasksJson);

      const { buildSpecProgress } = await import('../../src/spec-reader.js');
      const result = await buildSpecProgress('/specs/007-slack-integration');

      expect(result).toEqual({
        specId: '007',
        specName: 'slack-integration-progress',
        phase: 'implement',
        totalTasks: 3,
        completedTasks: 2,
        pendingTasks: 1,
        failedTasks: 0,
      });
    });

    it('should return progress even when tasks.json is missing', async () => {
      const mockSpecContent = `---
meta:
  spec_id: "008"
  spec_name: new-feature
  status: draft
  phase: specify
  created: 2026-03-28
  updated: 2026-03-28
---

# Content
`;

      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(mockSpecContent)
        .mockRejectedValueOnce(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));

      const { buildSpecProgress } = await import('../../src/spec-reader.js');
      const result = await buildSpecProgress('/specs/008-new-feature');

      expect(result).toEqual({
        specId: '008',
        specName: 'new-feature',
        phase: 'specify',
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        failedTasks: 0,
      });
    });

    it('should throw when spec.md is missing', async () => {
      vi.mocked(fs.readFile).mockRejectedValueOnce(
        Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
      );

      const { buildSpecProgress } = await import('../../src/spec-reader.js');

      await expect(buildSpecProgress('/specs/missing')).rejects.toThrow(
        /not found|ENOENT|does not exist/i
      );
    });
  });
});
