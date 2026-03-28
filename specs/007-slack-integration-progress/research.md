# Research: Slack Integration — SpecKit Progress Notifications

**Date**: 2026-03-27 | **Spec**: 007-slack-integration-progress

---

## 1. Existing Pattern Reuse: jira-mcp

The `packages/jira-mcp/` package provides a proven MCP server pattern to follow:

### Package Structure (REUSE)

```
packages/jira-mcp/
├── src/
│   ├── index.ts        # MCP server + tool registration
│   ├── config.ts       # Zod-validated env vars
│   ├── types.ts        # Shared TypeScript types
│   ├── jira-client.ts  # HTTP client wrapper
│   ├── mapper.ts       # Data transformation
│   ├── sync-engine.ts  # Core logic orchestrator
│   └── hash.ts         # Content hashing
├── __tests__/
│   ├── unit/           # Config, mapper, hash tests
│   └── integration/    # MCP tools, client, engine tests
├── package.json        # @modelcontextprotocol/sdk + zod
├── tsconfig.json       # ES2022, Node16, strict
└── vitest.config.ts    # 80% coverage thresholds
```

**Decision**: REUSE this structure for `packages/slack-mcp/`. Adapt file names
to Slack domain (slack-client.ts, formatter.ts instead of jira-client.ts,
mapper.ts).

### MCP Tool Registration Pattern (REUSE)

```typescript
server.tool('tool_name', 'description', { param: z.string() }, async (args) => {
  return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
});
```

### Config Validation Pattern (REUSE)

Zod schema validates env vars at startup. Explicit error messages per field.
Missing required vars throw immediately.

### .mcp.json Registration (REUSE)

```json
"slack-speckit": {
  "command": "node",
  "args": ["packages/slack-mcp/build/index.js"],
  "env": { "SLACK_BOT_TOKEN": "...", "SLACK_CHANNEL": "..." }
}
```

---

## 2. Hook System Analysis

### Current Hook Architecture

Hooks are shell scripts registered in `.claude/settings.json` under event types:
PreToolUse, PostToolUse, PreCompact, SessionStart, Stop.

**I/O Protocol**: JSON on stdin, JSON on stdout. PreToolUse hooks return
allow/deny decisions. PostToolUse hooks are informational.

### Relevant Hooks for Modification

| Hook                                   | Event             | Modification Needed                                    |
| -------------------------------------- | ----------------- | ------------------------------------------------------ |
| `speckit/post-tasks-reconciliation.sh` | PostToolUse:Write | Add Slack notify on tasks.json write (task completion) |
| New: `speckit/slack-notify.sh`         | PostToolUse:Write | Detect phase transitions from spec frontmatter updates |
| New: Stop hook variant                 | Stop              | Send milestone notification (verify passed)            |

### Hook Integration Strategy

**Decision**: Create a shared notification script (`slack-notify.sh`) that hooks
call. The script:

1. Checks `SLACK_WEBHOOK_URL` env var — exits 0 if unset (graceful no-op)
2. Reads event context from stdin JSON
3. Formats Block Kit message
4. POSTs to webhook with configurable timeout (`SLACK_TIMEOUT_MS`)
5. Exits 0 regardless of HTTP result (fire-and-forget, fail-open)

Existing hooks are modified minimally — they source or call the notify script as
a side effect after their primary logic.

---

## 3. Slack API Research

### Webhook Mode (Personal)

- **API**: Incoming Webhooks — single POST to a URL, no auth headers needed
- **Payload**: JSON with `text` (fallback) and `blocks` (Block Kit)
- **Rate Limits**: 1 message per second per webhook
- **Channel**: Baked into the webhook URL (no override needed)
- **Setup**: Slack App → Incoming Webhooks → Add to channel

### Bot Token Mode (MCP Server / Team)

- **API**: `chat.postMessage` via Slack Web API
- **Auth**: `Authorization: Bearer xoxb-...` header
- **Channel**: Specified per request (`SLACK_CHANNEL` env var)
- **Rate Limits**: Tier 2 — ~20 requests per minute
- **Setup**: Slack App → OAuth → Bot Token Scopes: `chat:write`

### Block Kit Message Format

```json
{
  "blocks": [
    {
      "type": "header",
      "text": { "type": "plain_text", "text": "🚀 Phase Transition" }
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*Spec:*\n007-slack-integration" },
        { "type": "mrkdwn", "text": "*Phase:*\nspecify → plan" }
      ]
    },
    {
      "type": "context",
      "elements": [{ "type": "mrkdwn", "text": "📅 2026-03-27 14:30 UTC" }]
    }
  ]
}
```

---

## 4. Architecture Decision: Dual-Mode Design

### Option A: Single Package, Both Modes

One `packages/slack-mcp/` package containing:

- Shared: config, types, formatter, slack-client
- Webhook-specific: notify function (used by hooks)
- MCP-specific: server + tools (used by MCP runtime)

**Pros**: Single source of truth, shared formatter, one test suite **Cons**:
Webhook callers import from an MCP package (naming mismatch)

### Option B: Separate Webhook Library + MCP Server

- `packages/slack-notify/` — lightweight webhook client for hooks
- `packages/slack-mcp/` — MCP server importing from slack-notify

**Pros**: Clean separation, hooks don't need MCP SDK **Cons**: Two packages to
maintain, more boilerplate

### Decision: **Option A** (Single Package)

Rationale: The jira-mcp package already bundles client + sync logic + MCP tools.
Following the same pattern keeps the monorepo consistent. The webhook notify
function is a thin wrapper around the slack-client — splitting it into a
separate package adds overhead for minimal benefit. Hooks call the built JS
directly via `node packages/slack-mcp/build/notify.js`.

---

## 5. Testing Strategy

### Test Distribution

| Category                  | Count   | Focus                                              |
| ------------------------- | ------- | -------------------------------------------------- |
| Unit: Config              | 8       | Env var validation, defaults, timeout parsing      |
| Unit: Formatter           | 10      | Block Kit message construction for each event type |
| Unit: Slack Client        | 8       | HTTP posting, timeout, error handling              |
| Integration: MCP Tools    | 8       | Tool registration, handler dispatch                |
| Integration: Notify       | 6       | End-to-end webhook flow (mocked HTTP)              |
| Integration: Hook scripts | 6       | Hook integration with notify function              |
| Unit: Types/Helpers       | 4       | Spec progress parsing, type guards                 |
| **Total**                 | **~50** |                                                    |

### Mocking Strategy

| Dependency                 | Mock Approach                                                      |
| -------------------------- | ------------------------------------------------------------------ |
| Slack Webhook API          | `vi.stubGlobal('fetch', ...)` — mock HTTP responses                |
| Slack Web API              | Same fetch mock, different response shapes                         |
| File system (spec reading) | `vi.mock('fs/promises')`                                           |
| Environment variables      | `process.env` manipulation in beforeEach                           |
| MCP SDK                    | `vi.mock('@modelcontextprotocol/sdk')` for tool registration tests |

### Risk Assessment

| Risk                      | Level  | Mitigation                                       |
| ------------------------- | ------ | ------------------------------------------------ |
| Slack API rate limits     | LOW    | Fire-and-forget, no retries                      |
| Network failures          | LOW    | Fail-open, logged warnings only                  |
| Token exposure in logs    | MEDIUM | Never log token values; redact in error messages |
| Hook timeout (5s default) | LOW    | Configurable via SLACK_TIMEOUT_MS                |

---

## 6. Alternatives Considered

### Notification Queuing

Rejected: Adds complexity (queue, retry logic, state management) for a
notification system where dropped messages are acceptable.

### Slack SDK Package (`@slack/web-api`)

Rejected for webhook mode: Adds ~2MB dependency for a single HTTP POST. Use
native `fetch()` instead. Could reconsider for MCP bot token mode if Block Kit
builder is needed, but manual JSON construction is simpler for our 3-4 message
templates.

### Event Bus / Pub-Sub

Rejected: Over-engineered for a solo developer tool. Direct function calls from
hooks are simpler and debuggable.
