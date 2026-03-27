import type {
  JiraAuthConfig,
  JiraCreateIssueRequest,
  JiraCreateIssueResponse,
  JiraUpdateIssueRequest,
  JiraIssue,
  JiraTransitionsResponse,
  JiraCreateIssueLinkRequest,
  JiraSearchRequest,
  JiraSearchResponse,
} from './types.js';

export class JiraClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly errorMessages: string[]
  ) {
    super(`Jira API error ${status}: ${statusText} - ${errorMessages.join(', ')}`);
    this.name = 'JiraClientError';
  }
}

export class JiraClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(baseUrl: string, auth: JiraAuthConfig) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    const credentials = Buffer.from(`${auth.email}:${auth.apiToken}`).toString('base64');
    this.headers = {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  async createIssue(request: JiraCreateIssueRequest): Promise<JiraCreateIssueResponse> {
    return this.request<JiraCreateIssueResponse>('POST', '/rest/api/3/issue', request);
  }

  async updateIssue(issueKey: string, request: JiraUpdateIssueRequest): Promise<void> {
    await this.request('PUT', `/rest/api/3/issue/${issueKey}`, request);
  }

  async getIssue(issueKey: string): Promise<JiraIssue> {
    return this.request<JiraIssue>('GET', `/rest/api/3/issue/${issueKey}`);
  }

  async getTransitions(issueKey: string): Promise<JiraTransitionsResponse> {
    return this.request<JiraTransitionsResponse>(
      'GET',
      `/rest/api/3/issue/${issueKey}/transitions`
    );
  }

  async performTransition(issueKey: string, transitionId: string): Promise<void> {
    await this.request('POST', `/rest/api/3/issue/${issueKey}/transitions`, {
      transition: { id: transitionId },
    });
  }

  async createIssueLink(request: JiraCreateIssueLinkRequest): Promise<void> {
    await this.request('POST', '/rest/api/3/issueLink', request);
  }

  async search(request: JiraSearchRequest): Promise<JiraSearchResponse> {
    return this.request<JiraSearchResponse>('POST', '/rest/api/3/search', request);
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const options: RequestInit = {
      method,
      headers: this.headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      let errorMessages: string[] = [];
      try {
        const errorBody = (await response.json()) as { errorMessages?: string[] };
        errorMessages = errorBody.errorMessages ?? [];
      } catch {
        // ignore JSON parse errors on error responses
      }
      throw new JiraClientError(response.status, response.statusText, errorMessages);
    }

    // Some endpoints return 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }
}
