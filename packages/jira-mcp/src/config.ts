import { z } from 'zod';
import type { JiraSyncConfig } from './types.js';

const envSchema = z.object({
  JIRA_URL: z
    .string({ required_error: 'JIRA_URL is required' })
    .url('JIRA_URL must be a valid URL'),
  JIRA_EMAIL: z
    .string({ required_error: 'JIRA_EMAIL is required' })
    .min(1, 'JIRA_EMAIL is required'),
  JIRA_API_TOKEN: z
    .string({ required_error: 'JIRA_API_TOKEN is required' })
    .min(1, 'JIRA_API_TOKEN is required'),
  JIRA_PROJECT_KEY: z
    .string({ required_error: 'JIRA_PROJECT_KEY is required' })
    .min(1, 'JIRA_PROJECT_KEY is required'),
});

const DEFAULT_STATUS_TRANSITIONS: Record<string, string> = {
  pending: 'To Do',
  in_progress: 'In Progress',
  completed: 'Done',
  blocked: 'Blocked',
};

export function loadConfig(): JiraSyncConfig {
  const parsed = envSchema.parse({
    JIRA_URL: process.env.JIRA_URL,
    JIRA_EMAIL: process.env.JIRA_EMAIL,
    JIRA_API_TOKEN: process.env.JIRA_API_TOKEN,
    JIRA_PROJECT_KEY: process.env.JIRA_PROJECT_KEY,
  });

  return {
    jiraUrl: parsed.JIRA_URL,
    projectKey: parsed.JIRA_PROJECT_KEY,
    auth: {
      email: parsed.JIRA_EMAIL,
      apiToken: parsed.JIRA_API_TOKEN,
    },
    mappings: {
      statusTransitions: DEFAULT_STATUS_TRANSITIONS,
      phaseLabels: {} as Record<string, string>,
      storyIssueType: process.env.JIRA_STORY_TYPE ?? 'Task',
      verifyIssueType: process.env.JIRA_SUBTASK_TYPE ?? 'Subtask',
      epicIssueType: process.env.JIRA_EPIC_TYPE ?? 'Epic',
    },
  };
}
