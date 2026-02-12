# Research: Jira Integration for SpecKit

**Spec**: 006-jira-integration-map | **Date**: 2026-02-12

## MCP SDK (TypeScript)

**Package**: `@modelcontextprotocol/sdk` + `zod@3`

### Server API

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({ name: 'jira-speckit', version: '1.0.0' });

server.registerTool(
  'tool_name',
  {
    description: 'Tool description',
    inputSchema: {
      specDir: z.string().describe('Path to spec directory'),
    },
  },
  async ({ specDir }) => {
    return { content: [{ type: 'text', text: 'result' }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

### Key Constraints

- **STDIO transport**: Never use `console.log()` — corrupts JSON-RPC. Use
  `console.error()` for debug.
- **Build**: TypeScript → JS via `tsc`. Target ES2022, module Node16.
- **Package**: Must have `"type": "module"` in package.json.
- **Zod native**: Input schemas use Zod directly — aligns with existing
  wine-cellar patterns.

### Configuration in Claude Code

```json
// .claude/settings.json → mcpServers section
{
  "mcpServers": {
    "jira-speckit": {
      "command": "node",
      "args": ["/path/to/packages/jira-mcp/build/index.js"]
    }
  }
}
```

## Jira Cloud REST API v3

**Base URL**: `https://{instance}.atlassian.net/rest/api/3/` **Auth**: HTTP
Basic with `email:apiToken` (base64 encoded)

### Key Endpoints

| Operation                          | Method | Endpoint                              |
| ---------------------------------- | ------ | ------------------------------------- |
| Create issue (Epic/Story/Sub-task) | POST   | `/rest/api/3/issue`                   |
| Update issue                       | PUT    | `/rest/api/3/issue/{key}`             |
| Get issue                          | GET    | `/rest/api/3/issue/{key}`             |
| Get transitions                    | GET    | `/rest/api/3/issue/{key}/transitions` |
| Perform transition                 | POST   | `/rest/api/3/issue/{key}/transitions` |
| Create issue link                  | POST   | `/rest/api/3/issueLink`               |
| Search (JQL)                       | POST   | `/rest/api/3/search`                  |

### Epic-Story Linking

Epic→Story association uses the **"Epic Link" custom field**, NOT standard issue
links. The field value must be the Epic's issue key (e.g., `PROJ-6`), not the
Epic name.

### Sub-task Creation

Sub-tasks use `issuetype: { name: "Sub-task" }` with a
`parent: { key: "EPIC-KEY" }` field.

### Transition Discovery

Workflow transitions vary by project. Must call `GET /transitions` first to
discover available transition IDs before performing a transition.

## Architecture Decision: Package Location

**Decision**: `packages/jira-mcp/` (new monorepo package)

**Rationale**:

- Already in workspace glob (`packages/*`) — no config changes needed
- Reuses monorepo TypeScript/Vitest infrastructure
- Named `@wine-cellar/jira-mcp` following existing convention
- Standalone — neither `api` nor `web` apps depend on it
- Can be extracted to separate repo later if needed

**Alternatives considered**:

- `tools/jira-mcp/` — requires adding `tools/*` to workspace config
- `.claude/mcp-servers/jira/` — outside workspace, no shared infra
- Standalone repo — premature separation

## Codebase Pattern Reuse

| Pattern          | Source                            | Reuse in jira-mcp                            |
| ---------------- | --------------------------------- | -------------------------------------------- |
| Zod schemas      | `apps/api/src/schemas/`           | MCP tool input schemas (native SDK support)  |
| AppError classes | `apps/api/src/errors/`            | Adapted for MCP error responses              |
| Vitest config    | `apps/api/vitest.config.ts`       | Same pattern: forked pool, 80% coverage      |
| Logger (Winston) | `apps/api/src/utils/logger.ts`    | Adapted for stderr-only (STDIO constraint)   |
| Zod-to-OpenAPI   | `apps/api/src/schemas/openapi.ts` | Not needed — MCP SDK handles schema exposure |

## Testing Strategy

| Check            | Output                                                    |
| ---------------- | --------------------------------------------------------- |
| External APIs    | Jira Cloud REST API → Risk: MEDIUM (rate limits, auth)    |
| Test types       | Unit + Integration (mocked Jira API)                      |
| E2E permitted?   | No — external API, use mocked integration tests           |
| Mocking strategy | Jira API client → mock at HTTP level (msw or manual mock) |

**Testing Summary**:

```
Feature type: Backend-heavy (MCP server + Jira client)
Quota risks: Jira API rate limits (use mocked tests)
Estimated tests: 30-40
Distribution: Unit 40%, Integration 50%, E2E 10% (manual only)
```
