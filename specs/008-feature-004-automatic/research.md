# Research: Automatic Jira Status Sync

## Pattern Analysis

### Hook Pattern (slack-notify.sh → jira-notify.sh)

The Slack notification hook established the definitive pattern for
PostToolUse:Write hooks in this project:

1. **Stdin parsing**: Read JSON from stdin, extract `tool_input.file_path` and
   `tool_input.content`
2. **Path matching**:
   `case "$FILE_PATH" in *specs/*/tasks.json|*specs/*/prd.json)` to filter
   relevant writes
3. **Diffing**: Compare new content (from stdin JSON) against existing file on
   disk
4. **Fail-open**: `trap 'exit 0' ERR` + always exit 0
5. **Dispatch**: Fire-and-forget call to Node.js script via
   `node "$NOTIFY_SCRIPT" "$EVENT_JSON" &`

The Jira hook follows this pattern identically but adds one gate: check for
`jira-sync.json` existence before processing.

### Notify Dispatcher Pattern (slack-mcp/notify.ts → jira-mcp/notify.ts)

The Slack notify.ts established the CLI dispatcher pattern:

1. **Entry point**: `main()` reads from argv[2] or stdin
2. **Event parsing**: `JSON.parse(eventJson) as NotificationEvent`
3. **Config loading**: `loadConfig()` from same package
4. **Client creation**: Create API client from config
5. **Dispatch**: Call client method, return success/failure
6. **Exit**: Always `process.exit(0)` — fire-and-forget

The Jira notify.ts is simpler than Slack because it has only one event type
(task status change) vs Slack's three (phase_transition, task_completion,
milestone).

### Direct API vs MCP Protocol

**Decision: Direct API call, not MCP protocol.**

The notify.js dispatcher imports `JiraClient`, `loadConfig()`, and
`mapStatusToTransition()` directly from the jira-mcp package. It does NOT go
through the MCP server protocol. Reasons:

- MCP protocol requires stdio transport setup, which adds latency and complexity
  for a fire-and-forget operation
- The slack-mcp notify.ts uses the same direct-import pattern — it calls
  `SlackClient` directly, not through the MCP server
- All the business logic (config, client, mapping) is already exported from the
  jira-mcp package

### /tasks Command Modification

The `/tasks` command (`.claude/commands/tasks.md`) is a markdown template that
Claude executes. Adding the Jira prompt is a markdown addition to the
"Post-Generation" section. The prompt logic:

1. Check if `jira-sync.json` already exists → skip if yes
2. Attempt to use `sync_spec_to_jira` MCP tool → if unavailable, skip silently
3. Ask developer "Sync tasks to Jira? [Y/n]"
4. If Y → call `sync_spec_to_jira` with specDir → display summary
5. If n → continue normally

This follows the same confirmation pattern used in `/specify` for type
selection.

## Alternatives Considered

| Approach                             | Pros                           | Cons                                          | Decision                                             |
| ------------------------------------ | ------------------------------ | --------------------------------------------- | ---------------------------------------------------- |
| MCP protocol from hook               | Clean separation               | Slow, complex stdio setup for fire-and-forget | Rejected                                             |
| Direct Jira API from bash            | No Node dependency             | No config reuse, duplicate auth logic         | Rejected                                             |
| Import from jira-mcp package         | Reuse everything, fast, simple | Tight coupling to package internals           | **Selected** — coupling is intentional, same package |
| Hook in /implement instead of /tasks | Closer to usage                | Too late, misses initial sync opportunity     | Rejected                                             |
