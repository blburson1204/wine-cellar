# Quickstart: Jira Integration for SpecKit

**Spec**: 006-jira-integration-map | **Date**: 2026-02-12

## Prerequisites

1. Jira Cloud instance with API access
2. API token generated at
   https://id.atlassian.com/manage-profile/security/api-tokens
3. A Jira project with Epic, Story, and Sub-task issue types enabled

## Setup

### 1. Environment Variables

```bash
export JIRA_URL="https://yourcompany.atlassian.net"
export JIRA_EMAIL="your.email@company.com"
export JIRA_API_TOKEN="your-api-token"
export JIRA_PROJECT_KEY="WC"
```

### 2. Build the MCP Server

```bash
cd packages/jira-mcp
npm install
npm run build
```

### 3. Configure Claude Code

Add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "jira-speckit": {
      "command": "node",
      "args": ["packages/jira-mcp/build/index.js"],
      "env": {
        "JIRA_URL": "${JIRA_URL}",
        "JIRA_EMAIL": "${JIRA_EMAIL}",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}",
        "JIRA_PROJECT_KEY": "${JIRA_PROJECT_KEY}"
      }
    }
  }
}
```

## Verification Scenarios

These map to acceptance scenarios from the spec. Each should be verifiable once
the MCP server is built.

### Scenario 1: First Sync (Creates Epic + Stories)

```
Precondition: specs/005-phase-5-testing/tasks.json exists (completed spec)
Action: Use MCP tool sync_spec_to_jira with specDir="specs/005-phase-5-testing"
Verify:
  - Jira Epic created with summary "phase-5-testing"
  - All implementation tasks created as Stories linked to Epic
  - All T-VERIFY tasks created as Sub-tasks under Epic
  - jira-sync.json created in specs/005-phase-5-testing/
  - Response shows created count matching task count
```

### Scenario 2: Re-sync After Task Completion

```
Precondition: Scenario 1 complete, some tasks.json statuses updated
Action: Use MCP tool sync_spec_to_jira with same specDir
Verify:
  - No new issues created (idempotent)
  - Updated tasks have Jira status transitioned
  - jira-sync.json updated with new timestamps
  - Response shows updated count > 0, created = 0
```

### Scenario 3: Status Read-back

```
Precondition: Scenario 1 complete
Action: Use MCP tool get_jira_status with specDir
Verify:
  - Returns Epic details with key, status, URL
  - Returns all SpecKit stories with sync status
  - inSync=true for stories not manually modified
```

### Scenario 4: Single Task Update

```
Precondition: Scenario 1 complete
Action: Use MCP tool update_task_status with taskId="T001", status="completed"
Verify:
  - Jira story transitions to "Done"
  - Returns previous and new status
  - jira-sync.json updated for that task only
```

### Scenario 5: Conflict Detection

```
Precondition: Scenario 1 complete, manually edit a story in Jira
Action: Use MCP tool sync_spec_to_jira
Verify:
  - Conflicting story skipped
  - Warning message includes the Jira key
  - All other stories sync normally
  - Response shows conflicts count = 1
```

### Scenario 6: No Credentials

```
Precondition: JIRA_URL / JIRA_EMAIL / JIRA_API_TOKEN not set
Action: Use any MCP tool
Verify:
  - Clear error message listing which env vars are missing
  - No partial state created
```

## Running Tests

```bash
# Unit tests (config, mapping, hashing)
npm run test:unit -w packages/jira-mcp

# Integration tests (mocked Jira API)
npm run test -w packages/jira-mcp

# All project tests (ensure no regressions)
npm test
```
