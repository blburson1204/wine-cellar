# Quickstart: Slack Integration — SpecKit Progress Notifications

**Spec**: 007-slack-integration-progress

---

## Prerequisites

- Node.js 18+
- A Slack workspace with admin access to create apps

## Setup: Webhook Mode (Personal)

1. **Create a Slack App**: Go to https://api.slack.com/apps → Create New App
2. **Enable Incoming Webhooks**: Features → Incoming Webhooks → Activate
3. **Add Webhook to Channel**: "Add New Webhook to Workspace" → Select channel
4. **Copy Webhook URL**: Starts with `https://hooks.slack.com/services/...`
5. **Configure env var**:
   ```bash
   export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/T.../B.../xxx"
   ```
6. **Optional timeout**:
   ```bash
   export SLACK_TIMEOUT_MS="3000"  # Default: 5000ms
   ```
7. Notifications will fire automatically from SpecKit hooks.

## Setup: MCP Server Mode (Team)

1. **Create a Slack App** (or reuse from webhook setup)
2. **Add Bot Token Scopes**: OAuth & Permissions → `chat:write`
3. **Install to Workspace**: Get Bot User OAuth Token (`xoxb-...`)
4. **Configure .mcp.json** (add to existing file):
   ```json
   "slack-speckit": {
     "command": "node",
     "args": ["packages/slack-mcp/build/index.js"],
     "env": {
       "SLACK_BOT_TOKEN": "xoxb-your-token",
       "SLACK_CHANNEL": "#speckit-progress"
     }
   }
   ```
5. **Build the package**:
   ```bash
   cd packages/slack-mcp && npm run build
   ```
6. MCP tools `send_progress` and `get_spec_status` are now available.

## Manual Usage

### Webhook Mode (CLI)

Send notifications directly via the `notify.js` CLI. Requires
`SLACK_WEBHOOK_URL` in your environment.

**Phase transition:**

```bash
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..." \
  node packages/slack-mcp/build/notify.js '{
    "type": "phase_transition",
    "specId": "007",
    "specName": "my-feature",
    "timestamp": "2026-03-28T14:00:00Z",
    "details": { "fromPhase": "plan", "toPhase": "tasks" }
  }'
```

**Task completion:**

```bash
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..." \
  node packages/slack-mcp/build/notify.js '{
    "type": "task_completion",
    "specId": "007",
    "specName": "my-feature",
    "timestamp": "2026-03-28T14:00:00Z",
    "details": { "taskId": "T001", "taskDescription": "Setup scaffolding", "status": "completed" }
  }'
```

**Milestone:**

```bash
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..." \
  node packages/slack-mcp/build/notify.js '{
    "type": "milestone",
    "specId": "007",
    "specName": "my-feature",
    "timestamp": "2026-03-28T14:00:00Z",
    "details": { "milestone": "all_tasks_complete", "summary": "All 20 tasks done!" }
  }'
```

### MCP Mode (via Claude Code)

When the slack-speckit MCP server is configured in `.mcp.json`, ask Claude to
use the tools directly:

- **Send a notification:** "Use `send_progress` with spec_id 007, event_type
  milestone, message 'All tasks complete'"
- **Check spec status:** "Use `get_spec_status` with spec_id
  007-slack-integration-progress"

### Automatic (Hooks)

When `SLACK_WEBHOOK_URL` is set in your shell environment, SpecKit hooks fire
automatically on:

- **Phase transitions** — when spec.md frontmatter `phase` field changes
- **Task completions** — when tasks.json is written with status changes
- **Milestones** — when spec verification completes

## Troubleshooting

| Issue                                  | Fix                                                         |
| -------------------------------------- | ----------------------------------------------------------- |
| No notifications appearing             | Verify `SLACK_WEBHOOK_URL` is set in your shell environment |
| "Invalid SLACK_WEBHOOK_URL" on startup | URL must start with `https://hooks.slack.com/`              |
| MCP tools not found                    | Run `npm run build` in `packages/slack-mcp/`                |
| Messages not reaching channel          | Check Slack App permissions; bot needs `chat:write` scope   |
| Timeout errors in logs                 | Increase `SLACK_TIMEOUT_MS` (default 5000ms)                |
