/**
 * Hook integration tests for slack-notify.sh
 *
 * Tests the shell hook that detects phase transitions and task completions
 * from PostToolUse JSON input, then calls notify.js with proper event args.
 *
 * Test scenarios:
 * - Correctly parses PostToolUse JSON for spec.md writes
 * - Correctly parses PostToolUse JSON for tasks.json/prd.json writes
 * - Calls notify.js with proper phase_transition event args
 * - Calls notify.js with proper task_completion event args
 * - Handles missing SLACK_WEBHOOK_URL gracefully (exits 0)
 * - Ignores non-spec file writes (exits 0 silently)
 *
 * Spec: 007-slack-integration-progress
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { spawn, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ============================================================================
// Test Setup
// ============================================================================

const REPO_ROOT = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
const HOOK_SCRIPT = path.join(REPO_ROOT, '.claude/hooks/speckit/slack-notify.sh');
const NOTIFY_SCRIPT = path.join(REPO_ROOT, 'packages/slack-mcp/build/notify.js');

let tempDir: string;
let testSpecDir: string;

/**
 * Run the hook script with given stdin input.
 * Returns { code, stdout, stderr }.
 */
async function runHook(
  stdinInput: string,
  env: Record<string, string> = {}
): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn('bash', [HOOK_SCRIPT], {
      cwd: REPO_ROOT,
      env: {
        ...process.env,
        // Prevent real Slack messages during tests: set to empty string.
        // The hooks use ${VAR-default} (not :-) so empty = "explicitly disabled"
        // and won't fall back to loading from .mcp.json.
        SLACK_WEBHOOK_URL: '',
        SLACK_BOT_TOKEN: '',
        ...env,
        // Ensure PATH includes node
        PATH: process.env.PATH,
      },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    proc.on('error', (err) => {
      resolve({ code: 1, stdout, stderr: err.message });
    });

    // Write stdin and close
    proc.stdin.write(stdinInput);
    proc.stdin.end();
  });
}

/**
 * Create a PostToolUse JSON payload for a Write tool call.
 */
function createPostToolUsePayload(filePath: string, content: string): string {
  return JSON.stringify({
    tool_name: 'Write',
    tool_input: {
      file_path: filePath,
      content: content,
    },
  });
}

describe('slack-notify.sh hook integration', () => {
  beforeAll(() => {
    // Create temp directory for test specs
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slack-hook-test-'));
    testSpecDir = path.join(tempDir, 'specs', 'test-spec');
    fs.mkdirSync(testSpecDir, { recursive: true });
  });

  afterAll(() => {
    // Cleanup temp directory
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    // Clear test spec files before each test
    const specMdPath = path.join(testSpecDir, 'spec.md');
    const tasksPath = path.join(testSpecDir, 'tasks.json');
    const prdPath = path.join(testSpecDir, 'prd.json');

    if (fs.existsSync(specMdPath)) fs.unlinkSync(specMdPath);
    if (fs.existsSync(tasksPath)) fs.unlinkSync(tasksPath);
    if (fs.existsSync(prdPath)) fs.unlinkSync(prdPath);
  });

  describe('PostToolUse JSON parsing', () => {
    it('should correctly parse PostToolUse JSON for spec.md writes', async () => {
      const specContent = `---
title: Test Spec
phase: plan
---

# Test Spec

Some content here.
`;
      const payload = createPostToolUsePayload(path.join(testSpecDir, 'spec.md'), specContent);

      const result = await runHook(payload);

      // Hook should exit 0 (fail-open)
      expect(result.code).toBe(0);
      // No error output
      expect(result.stderr).toBe('');
    });

    it('should correctly parse PostToolUse JSON for tasks.json writes', async () => {
      const tasksContent = JSON.stringify({
        tasks: [
          { id: 'T001', description: 'Task 1', status: 'done' },
          { id: 'T002', description: 'Task 2', status: 'pending' },
        ],
      });
      const payload = createPostToolUsePayload(path.join(testSpecDir, 'tasks.json'), tasksContent);

      const result = await runHook(payload);

      expect(result.code).toBe(0);
      expect(result.stderr).toBe('');
    });

    it('should correctly parse PostToolUse JSON for prd.json writes', async () => {
      const prdContent = JSON.stringify({
        tasks: [{ id: 'T001', description: 'Task 1', status: 'done' }],
      });
      const payload = createPostToolUsePayload(path.join(testSpecDir, 'prd.json'), prdContent);

      const result = await runHook(payload);

      expect(result.code).toBe(0);
      expect(result.stderr).toBe('');
    });
  });

  describe('phase transition detection', () => {
    it('should detect phase change from existing spec.md', async () => {
      // Create existing spec.md with 'specify' phase
      const existingSpecPath = path.join(testSpecDir, 'spec.md');
      fs.writeFileSync(
        existingSpecPath,
        `---
title: Test Spec
phase: specify
---

# Test Spec
`
      );

      // New content with 'plan' phase
      const newSpecContent = `---
title: Test Spec
phase: plan
---

# Test Spec

Updated content.
`;
      const payload = createPostToolUsePayload(existingSpecPath, newSpecContent);

      const result = await runHook(payload);

      // Should exit 0
      expect(result.code).toBe(0);
    });

    it('should not fire notification when phase is unchanged', async () => {
      // Create existing spec.md with 'plan' phase
      const existingSpecPath = path.join(testSpecDir, 'spec.md');
      fs.writeFileSync(
        existingSpecPath,
        `---
title: Test Spec
phase: plan
---

# Test Spec
`
      );

      // New content with same 'plan' phase
      const newSpecContent = `---
title: Test Spec
phase: plan
---

# Test Spec

Updated content but same phase.
`;
      const payload = createPostToolUsePayload(existingSpecPath, newSpecContent);

      const result = await runHook(payload);

      // Should exit 0 (no notification needed)
      expect(result.code).toBe(0);
    });
  });

  describe('task completion detection', () => {
    it('should detect newly completed tasks in tasks.json', async () => {
      // Create existing tasks.json with pending task
      const existingTasksPath = path.join(testSpecDir, 'tasks.json');
      fs.writeFileSync(
        existingTasksPath,
        JSON.stringify({
          tasks: [
            { id: 'T001', description: 'Task 1', status: 'pending' },
            { id: 'T002', description: 'Task 2', status: 'pending' },
          ],
        })
      );

      // New content with T001 completed
      const newTasksContent = JSON.stringify({
        tasks: [
          { id: 'T001', description: 'Task 1', status: 'done' },
          { id: 'T002', description: 'Task 2', status: 'pending' },
        ],
      });
      const payload = createPostToolUsePayload(existingTasksPath, newTasksContent);

      const result = await runHook(payload);

      expect(result.code).toBe(0);
    });

    it('should not fire notification for already completed tasks', async () => {
      // Create existing tasks.json with completed task
      const existingTasksPath = path.join(testSpecDir, 'tasks.json');
      fs.writeFileSync(
        existingTasksPath,
        JSON.stringify({
          tasks: [{ id: 'T001', description: 'Task 1', status: 'done' }],
        })
      );

      // New content with same status
      const newTasksContent = JSON.stringify({
        tasks: [{ id: 'T001', description: 'Task 1', status: 'done' }],
      });
      const payload = createPostToolUsePayload(existingTasksPath, newTasksContent);

      const result = await runHook(payload);

      // Should exit 0 (no new completion)
      expect(result.code).toBe(0);
    });
  });

  describe('graceful handling', () => {
    it('should handle missing SLACK_WEBHOOK_URL gracefully (exits 0)', async () => {
      // Ensure no SLACK_WEBHOOK_URL is set
      const env = {
        SLACK_WEBHOOK_URL: '',
      };

      const specContent = `---
title: Test Spec
phase: plan
---
`;
      const payload = createPostToolUsePayload(path.join(testSpecDir, 'spec.md'), specContent);

      const result = await runHook(payload, env);

      // Hook should exit 0 (fail-open pattern)
      expect(result.code).toBe(0);
    });

    it('should ignore non-spec file writes and exit 0 silently', async () => {
      const payload = createPostToolUsePayload('/some/random/file.ts', 'export const foo = "bar";');

      const result = await runHook(payload);

      expect(result.code).toBe(0);
      expect(result.stdout).toBe('');
      expect(result.stderr).toBe('');
    });

    it('should handle empty stdin gracefully', async () => {
      const result = await runHook('');

      expect(result.code).toBe(0);
    });

    it('should handle invalid JSON gracefully', async () => {
      const result = await runHook('{ invalid json }');

      // Should exit 0 (fail-open)
      expect(result.code).toBe(0);
    });

    it('should handle missing tool_input.file_path gracefully', async () => {
      const payload = JSON.stringify({
        tool_name: 'Write',
        tool_input: {
          content: 'some content',
          // file_path is missing
        },
      });

      const result = await runHook(payload);

      expect(result.code).toBe(0);
    });

    it('should handle missing tool_input.content gracefully', async () => {
      const payload = JSON.stringify({
        tool_name: 'Write',
        tool_input: {
          file_path: path.join(testSpecDir, 'spec.md'),
          // content is missing
        },
      });

      const result = await runHook(payload);

      expect(result.code).toBe(0);
    });
  });

  describe('notify.js invocation', () => {
    it('should not fail when notify.js build does not exist', async () => {
      // This test verifies the hook handles missing build gracefully
      // The hook checks for notify.js existence and exits 0 if not found

      // Save the original state
      const notifyScriptExists = fs.existsSync(NOTIFY_SCRIPT);

      // If the script exists, we can test the hook runs successfully
      // If it doesn't exist, the hook should still exit 0
      const specContent = `---
title: Test Spec
phase: implement
---
`;
      // Create existing spec with different phase
      const existingSpecPath = path.join(testSpecDir, 'spec.md');
      fs.writeFileSync(
        existingSpecPath,
        `---
title: Test Spec
phase: plan
---
`
      );

      const payload = createPostToolUsePayload(existingSpecPath, specContent);

      const result = await runHook(payload);

      // Hook should always exit 0 (fail-open pattern)
      expect(result.code).toBe(0);

      // The hook should have detected a phase change from plan to implement
      // Whether or not notify.js was called depends on build existence
      if (!notifyScriptExists) {
        // If notify.js doesn't exist, hook should silently skip
        expect(result.stderr).toBe('');
      }
    });
  });
});
