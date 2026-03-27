import type {
  SpecKitTask,
  SpecKitStatus,
  JiraSyncConfig,
  JiraCreateIssueRequest,
  JiraADFDocument,
} from './types.js';

export function mapTaskToJiraIssue(
  task: SpecKitTask,
  config: JiraSyncConfig,
  epicKey: string
): JiraCreateIssueRequest {
  const isVerifyTask =
    task.id.startsWith('T-VERIFY') || task.id.startsWith('T-DOC') || task.id.startsWith('T-FINAL');
  const issueType = config.mappings.storyIssueType;

  const rawSummary = `[${task.id}] ${task.description}`;
  const summary = rawSummary.length > 255 ? rawSummary.slice(0, 252) + '...' : rawSummary;

  const fields: JiraCreateIssueRequest['fields'] = {
    project: { key: config.projectKey },
    summary,
    description: textToADF(task.description),
    issuetype: { name: issueType },
    parent: { key: epicKey },
    labels: ['speckit', `phase:${task.phase}`],
  };

  if (isVerifyTask) {
    fields.labels = [...(fields.labels ?? []), 'verify-task'];
  }

  return { fields };
}

export function mapSpecToEpic(
  specId: string,
  specName: string,
  config: JiraSyncConfig
): JiraCreateIssueRequest {
  return {
    fields: {
      project: { key: config.projectKey },
      summary: `[Spec ${specId}] ${specName}`,
      description: textToADF(`SpecKit specification: ${specId}-${specName}`),
      issuetype: { name: config.mappings.epicIssueType },
      labels: ['speckit'],
    },
  };
}

export function mapStatusToTransition(status: SpecKitStatus, config: JiraSyncConfig): string {
  return config.mappings.statusTransitions[status] ?? status;
}

export function textToADF(text: string): JiraADFDocument {
  return {
    version: 1,
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text }],
      },
    ],
  };
}
