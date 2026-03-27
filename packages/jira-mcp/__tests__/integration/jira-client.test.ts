import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { JiraAuthConfig } from '../../src/types.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const authConfig: JiraAuthConfig = {
  email: 'user@test.com',
  apiToken: 'test-token-123',
};
const baseUrl = 'https://test.atlassian.net';

describe('JiraClient', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('createIssue', () => {
    it('should POST to /rest/api/3/issue with correct auth header', async () => {
      const { JiraClient } = await import('../../src/jira-client.js');
      const client = new JiraClient(baseUrl, authConfig);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: '10001',
          key: 'WC-1',
          self: 'https://test.atlassian.net/rest/api/3/issue/10001',
        }),
      });

      const result = await client.createIssue({
        fields: {
          project: { key: 'WC' },
          summary: 'Test issue',
          issuetype: { name: 'Story' },
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.atlassian.net/rest/api/3/issue',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Basic /),
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result.key).toBe('WC-1');
    });

    it('should encode credentials as base64 Basic auth', async () => {
      const { JiraClient } = await import('../../src/jira-client.js');
      const client = new JiraClient(baseUrl, authConfig);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '10001', key: 'WC-1', self: '' }),
      });

      await client.createIssue({
        fields: { project: { key: 'WC' }, summary: 'Test', issuetype: { name: 'Story' } },
      });

      const expectedAuth = `Basic ${Buffer.from('user@test.com:test-token-123').toString('base64')}`;
      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders['Authorization']).toBe(expectedAuth);
    });
  });

  describe('updateIssue', () => {
    it('should PUT to /rest/api/3/issue/{key}', async () => {
      const { JiraClient } = await import('../../src/jira-client.js');
      const client = new JiraClient(baseUrl, authConfig);

      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      await client.updateIssue('WC-1', {
        fields: { summary: 'Updated summary' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.atlassian.net/rest/api/3/issue/WC-1',
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  describe('getIssue', () => {
    it('should GET /rest/api/3/issue/{key}', async () => {
      const { JiraClient } = await import('../../src/jira-client.js');
      const client = new JiraClient(baseUrl, authConfig);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: '10001',
          key: 'WC-1',
          self: '',
          fields: {
            summary: 'Test',
            status: { name: 'To Do', id: '1' },
            issuetype: { name: 'Story' },
            updated: '',
          },
        }),
      });

      const issue = await client.getIssue('WC-1');
      expect(issue.key).toBe('WC-1');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.atlassian.net/rest/api/3/issue/WC-1',
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('getTransitions', () => {
    it('should GET /rest/api/3/issue/{key}/transitions', async () => {
      const { JiraClient } = await import('../../src/jira-client.js');
      const client = new JiraClient(baseUrl, authConfig);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          transitions: [
            { id: '11', name: 'In Progress', to: { id: '3', name: 'In Progress' } },
            { id: '21', name: 'Done', to: { id: '4', name: 'Done' } },
          ],
        }),
      });

      const result = await client.getTransitions('WC-1');
      expect(result.transitions).toHaveLength(2);
      expect(result.transitions[0].name).toBe('In Progress');
    });
  });

  describe('performTransition', () => {
    it('should POST to /rest/api/3/issue/{key}/transitions', async () => {
      const { JiraClient } = await import('../../src/jira-client.js');
      const client = new JiraClient(baseUrl, authConfig);

      mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}) });

      await client.performTransition('WC-1', '11');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.atlassian.net/rest/api/3/issue/WC-1/transitions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ transition: { id: '11' } }),
        })
      );
    });
  });

  describe('createIssueLink', () => {
    it('should POST to /rest/api/3/issueLink', async () => {
      const { JiraClient } = await import('../../src/jira-client.js');
      const client = new JiraClient(baseUrl, authConfig);

      mockFetch.mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({}) });

      await client.createIssueLink({
        type: { name: 'Blocks' },
        inwardIssue: { key: 'WC-2' },
        outwardIssue: { key: 'WC-1' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.atlassian.net/rest/api/3/issueLink',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('search', () => {
    it('should POST to /rest/api/3/search with JQL', async () => {
      const { JiraClient } = await import('../../src/jira-client.js');
      const client = new JiraClient(baseUrl, authConfig);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total: 1, issues: [{ id: '1', key: 'WC-1', self: '', fields: {} }] }),
      });

      const result = await client.search({ jql: 'project = WC', maxResults: 50 });
      expect(result.total).toBe(1);
    });
  });

  describe('error handling', () => {
    it('should throw on 401 unauthorized', async () => {
      const { JiraClient } = await import('../../src/jira-client.js');
      const client = new JiraClient(baseUrl, authConfig);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ errorMessages: ['Unauthorized'] }),
      });

      await expect(client.getIssue('WC-1')).rejects.toThrow('401');
    });

    it('should throw on 404 not found', async () => {
      const { JiraClient } = await import('../../src/jira-client.js');
      const client = new JiraClient(baseUrl, authConfig);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ errorMessages: ['Issue does not exist'] }),
      });

      await expect(client.getIssue('WC-999')).rejects.toThrow('404');
    });

    it('should throw on 429 rate limit', async () => {
      const { JiraClient } = await import('../../src/jira-client.js');
      const client = new JiraClient(baseUrl, authConfig);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({ errorMessages: ['Rate limit exceeded'] }),
      });

      await expect(client.getIssue('WC-1')).rejects.toThrow('429');
    });
  });
});
