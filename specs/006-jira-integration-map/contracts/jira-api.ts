/**
 * Jira Cloud REST API v3 Type Contracts
 *
 * Minimal types for the Jira endpoints used by the sync integration.
 * Not exhaustive — covers only fields we read/write.
 */

// ============================================================
// Authentication
// ============================================================

export interface JiraAuthConfig {
  /** Jira Cloud instance URL (e.g., "https://mycompany.atlassian.net") */
  baseUrl: string;
  /** User email for Basic auth */
  email: string;
  /** API token for Basic auth */
  apiToken: string;
}

// ============================================================
// Issue Creation / Update
// ============================================================

/** POST /rest/api/3/issue — Create request */
export interface JiraCreateIssueRequest {
  fields: {
    project: { key: string };
    summary: string;
    description?: JiraADFDocument;
    issuetype: { name: string };
    parent?: { key: string };
    labels?: string[];
    [customField: string]: unknown;
  };
}

/** POST /rest/api/3/issue — Create response */
export interface JiraCreateIssueResponse {
  id: string;
  key: string;
  self: string;
}

/** PUT /rest/api/3/issue/{key} — Update request */
export interface JiraUpdateIssueRequest {
  fields: Partial<JiraCreateIssueRequest['fields']>;
}

// ============================================================
// Issue Retrieval
// ============================================================

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    status: { name: string; id: string };
    issuetype: { name: string };
    description?: JiraADFDocument;
    parent?: { key: string };
    labels?: string[];
    updated: string;
    [customField: string]: unknown;
  };
}

// ============================================================
// Transitions
// ============================================================

/** GET /rest/api/3/issue/{key}/transitions */
export interface JiraTransitionsResponse {
  transitions: JiraTransition[];
}

export interface JiraTransition {
  id: string;
  name: string;
  to: {
    id: string;
    name: string;
  };
}

/** POST /rest/api/3/issue/{key}/transitions */
export interface JiraPerformTransitionRequest {
  transition: { id: string };
}

// ============================================================
// Issue Links
// ============================================================

/** POST /rest/api/3/issueLink */
export interface JiraCreateIssueLinkRequest {
  type: { name: string };
  inwardIssue: { key: string };
  outwardIssue: { key: string };
}

// ============================================================
// Search (JQL)
// ============================================================

/** POST /rest/api/3/search */
export interface JiraSearchRequest {
  jql: string;
  maxResults?: number;
  fields?: string[];
}

export interface JiraSearchResponse {
  total: number;
  issues: JiraIssue[];
}

// ============================================================
// Atlassian Document Format (minimal)
// ============================================================

export interface JiraADFDocument {
  version: 1;
  type: 'doc';
  content: JiraADFNode[];
}

export interface JiraADFNode {
  type: string;
  content?: JiraADFNode[];
  text?: string;
  attrs?: Record<string, unknown>;
}
