# Quickstart: Automatic Jira Status Sync

## Prerequisites

- Jira MCP server configured (JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN,
  JIRA_PROJECT_KEY env vars set)
- `packages/jira-mcp` built (`npm run build` from package dir)

## Usage

### 1. Run /tasks — get prompted for Jira sync

```
/tasks 008
```

After tasks.json is generated, you'll see:

```
Jira integration available. Sync tasks to Jira? [Y/n]
- Y: Creates Epic + Stories in Jira, enables automatic status sync during /implement
- n: Skip (you can manually run sync_spec_to_jira later)
```

Answer **Y** to create the Jira Epic and Stories. This also creates
`jira-sync.json` which arms the auto-sync hook.

### 2. Run /implement — status syncs automatically

```
/implement
```

As tasks change status (pending → in_progress → completed), the PostToolUse hook
automatically transitions the corresponding Jira issues. No manual intervention
needed.

### 3. Check Jira status anytime

Use the existing MCP tool:

```
get_jira_status specDir="specs/008-feature-004-automatic"
```

## What Happens Under the Hood

1. `/tasks` writes tasks.json → prompts for Jira sync → calls
   `sync_spec_to_jira`
2. During `/implement`, each tasks.json write triggers the `jira-notify.sh`
   PostToolUse hook
3. Hook diffs old vs new tasks.json, finds status changes
4. For each changed task, hook calls
   `node packages/jira-mcp/build/notify.js '<event>'`
5. notify.js reads jira-sync.json, looks up the Jira key, transitions the issue

## Troubleshooting

| Issue                        | Cause                          | Fix                                                                     |
| ---------------------------- | ------------------------------ | ----------------------------------------------------------------------- |
| No Jira prompt after /tasks  | Jira MCP server not configured | Set JIRA\_\* env vars                                                   |
| Prompt says "already synced" | jira-sync.json already exists  | Expected behavior on re-run                                             |
| Status not syncing           | notify.js not built            | Run `cd packages/jira-mcp && npm run build`                             |
| Hook errors in stderr        | Jira API issue                 | Check env vars, Jira connectivity. Hook is fail-open — won't block work |
