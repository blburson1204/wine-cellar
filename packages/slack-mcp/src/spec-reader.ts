/**
 * Spec Reader Module
 *
 * Reads and parses SpecKit spec.md frontmatter and tasks.json/prd.json
 * to extract spec progress information.
 *
 * Spec: 007-slack-integration-progress
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { SpecKitPhase, SpecProgress } from './types.js';

// ============================================================================
// Types
// ============================================================================

interface SpecFrontmatter {
  specId: string;
  specName: string;
  phase: SpecKitPhase;
}

interface TasksProgress {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  failedTasks: number;
}

interface FrontmatterMeta {
  spec_id: string;
  spec_name: string;
  phase: SpecKitPhase;
  status?: string;
  created?: string;
  updated?: string;
}

interface ParsedFrontmatter {
  meta: FrontmatterMeta;
}

interface Task {
  id: string;
  description: string;
  status: string;
}

interface TasksFile {
  tasks: Task[];
}

// ============================================================================
// readSpecFrontmatter
// ============================================================================

/**
 * Reads and parses the YAML frontmatter from a spec.md file
 *
 * @param specDir - Path to the spec directory (e.g., /specs/007-slack-integration)
 * @returns Parsed spec metadata
 * @throws Error if spec.md is missing or frontmatter is invalid
 */
export async function readSpecFrontmatter(specDir: string): Promise<SpecFrontmatter> {
  const specPath = path.join(specDir, 'spec.md');

  let content: string;
  try {
    content = await fs.readFile(specPath, 'utf-8');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error(`Spec file not found: ${specPath}`);
    }
    throw error;
  }

  // Extract frontmatter between --- delimiters
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    throw new Error(`Invalid frontmatter: No frontmatter found in ${specPath}`);
  }

  let parsed: ParsedFrontmatter;
  try {
    parsed = parseYaml(frontmatterMatch[1]) as ParsedFrontmatter;
  } catch (error) {
    throw new Error(
      `Failed to parse frontmatter in ${specPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (!parsed?.meta) {
    throw new Error(`Invalid frontmatter: Missing 'meta' section in ${specPath}`);
  }

  return {
    specId: parsed.meta.spec_id,
    specName: parsed.meta.spec_name,
    phase: parsed.meta.phase,
  };
}

// ============================================================================
// readTasksProgress
// ============================================================================

/**
 * Reads and parses tasks.json or prd.json to extract task progress counts
 *
 * @param specDir - Path to the spec directory (e.g., /specs/007-slack-integration)
 * @returns Task progress counts (zeros if file is missing)
 */
export async function readTasksProgress(specDir: string): Promise<TasksProgress> {
  const tasksPath = path.join(specDir, 'tasks.json');

  let content: string;

  try {
    content = await fs.readFile(tasksPath, 'utf-8');
  } catch {
    // tasks.json not found - return zeros
    return {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      failedTasks: 0,
    };
  }

  const tasksFile = JSON.parse(content) as TasksFile;
  const tasks = tasksFile.tasks || [];

  return {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === 'done').length,
    pendingTasks: tasks.filter((t) => t.status === 'pending').length,
    failedTasks: tasks.filter((t) => t.status === 'failed').length,
  };
}

// ============================================================================
// buildSpecProgress
// ============================================================================

/**
 * Combines spec frontmatter and tasks progress into a complete SpecProgress object
 *
 * @param specDir - Path to the spec directory
 * @returns Complete spec progress information
 * @throws Error if spec.md is missing
 */
export async function buildSpecProgress(specDir: string): Promise<SpecProgress> {
  const frontmatter = await readSpecFrontmatter(specDir);
  const tasksProgress = await readTasksProgress(specDir);

  return {
    specId: frontmatter.specId,
    specName: frontmatter.specName,
    phase: frontmatter.phase,
    totalTasks: tasksProgress.totalTasks,
    completedTasks: tasksProgress.completedTasks,
    pendingTasks: tasksProgress.pendingTasks,
    failedTasks: tasksProgress.failedTasks,
  };
}
