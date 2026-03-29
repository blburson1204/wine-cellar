#!/usr/bin/env bash
# jira-notify.sh — PostToolUse:Write hook for Jira status sync
# Detects task status changes in tasks.json and dispatches updates
# to the Jira API via packages/jira-mcp/build/notify.js
#
# Fail-open: errors allow through. Always exits 0.
#
# Activation: only fires when jira-sync.json is present in the spec directory.
# Presence of jira-sync.json is the only activation signal — no other toggle.
#
# Spec: 008-feature-004-automatic

set -euo pipefail

# ── Helpers ──────────────────────────────────────────────────────────

# Fail-open: any error should not block the user
trap 'exit 0' ERR

# Get repository root
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0

# ── Cache helpers ────────────────────────────────────────────────────
# Cache the last-seen file content so that multiple writes between commits
# don't re-detect the same changes. Fall back to git HEAD if no cache.

CACHE_DIR="/tmp/speckit-hook-cache"
mkdir -p "$CACHE_DIR" 2>/dev/null || true

get_cache_key() {
  if command -v md5 >/dev/null 2>&1; then
    echo -n "$1" | md5
  else
    echo -n "$1" | md5sum | cut -d' ' -f1
  fi
}

# ── Read stdin ───────────────────────────────────────────────────────

INPUT=$(cat 2>/dev/null) || exit 0

if [[ -z "$INPUT" ]]; then
  exit 0
fi

# Extract file path from PostToolUse JSON
# Format: {"tool_name":"Write","tool_input":{"file_path":"..."}}
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null) || exit 0

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# ── Pattern matching: tasks.json/prd.json only (FR-010) ─────────────

# Expected patterns:
#   specs/{spec-id}/tasks.json
#   specs/{spec-id}/prd.json
SPEC_DIR=""
SPEC_ID=""
FILE_NAME=$(basename "$FILE_PATH")

case "$FILE_PATH" in
  *specs/*/tasks.json|*specs/*/prd.json)
    SPEC_DIR=$(dirname "$FILE_PATH")
    SPEC_ID=$(basename "$SPEC_DIR")
    ;;
  *)
    # Not a tasks file — skip silently
    exit 0
    ;;
esac

# ── Activation check: jira-sync.json must exist (FR-008 / C3) ───────

JIRA_SYNC_FILE="${SPEC_DIR}/jira-sync.json"

if [[ ! -f "$JIRA_SYNC_FILE" ]]; then
  # No jira-sync.json → Jira not armed for this spec
  exit 0
fi

# ── Build notify.js path ─────────────────────────────────────────────

NOTIFY_SCRIPT="$REPO_ROOT/packages/jira-mcp/build/notify.js"

if [[ ! -f "$NOTIFY_SCRIPT" ]]; then
  # Package not built yet — skip silently
  exit 0
fi

# ── Load env vars from .mcp.json ────────────────────────────────────
# Hook scripts don't inherit MCP server env vars, so read them from .mcp.json

MCP_CONFIG="$REPO_ROOT/.mcp.json"
if [[ -f "$MCP_CONFIG" ]]; then
  # Use ${VAR-default} (not :-) so tests can disable with VAR=''
  export JIRA_URL="${JIRA_URL-$(jq -r '.mcpServers["jira-speckit"].env.JIRA_URL // empty' "$MCP_CONFIG" 2>/dev/null)}"
  export JIRA_EMAIL="${JIRA_EMAIL-$(jq -r '.mcpServers["jira-speckit"].env.JIRA_EMAIL // empty' "$MCP_CONFIG" 2>/dev/null)}"
  export JIRA_API_TOKEN="${JIRA_API_TOKEN-$(jq -r '.mcpServers["jira-speckit"].env.JIRA_API_TOKEN // empty' "$MCP_CONFIG" 2>/dev/null)}"
  export JIRA_PROJECT_KEY="${JIRA_PROJECT_KEY-$(jq -r '.mcpServers["jira-speckit"].env.JIRA_PROJECT_KEY // empty' "$MCP_CONFIG" 2>/dev/null)}"
fi

# If Jira credentials are missing, nothing to do
if [[ -z "${JIRA_URL:-}" ]] || [[ -z "${JIRA_EMAIL:-}" ]] || [[ -z "${JIRA_API_TOKEN:-}" ]]; then
  exit 0
fi

# ── Extract task content from the Write event ────────────────────────

NEW_CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty' 2>/dev/null) || exit 0

if [[ -z "$NEW_CONTENT" ]]; then
  exit 0
fi

# Parse the new tasks array
NEW_TASKS=$(echo "$NEW_CONTENT" | jq -r '.tasks // []' 2>/dev/null) || exit 0

if [[ -z "$NEW_TASKS" || "$NEW_TASKS" == "[]" ]]; then
  exit 0
fi

# ── Read previous tasks state (FR-005, FR-013) ───────────────────────
# Read old tasks from cache first, then git HEAD.
# Cache prevents duplicate Jira transitions between commits.

OLD_TASKS="[]"
CACHE_KEY=$(get_cache_key "$FILE_PATH")
TASKS_CACHE="$CACHE_DIR/${CACHE_KEY}.jira-tasks"
if [[ -f "$TASKS_CACHE" ]]; then
  OLD_TASKS=$(cat "$TASKS_CACHE" 2>/dev/null | jq -r '.tasks // []' 2>/dev/null) || OLD_TASKS="[]"
else
  REL_PATH="${FILE_PATH#$REPO_ROOT/}"
  OLD_TASKS=$(git show "HEAD:${REL_PATH}" 2>/dev/null | jq -r '.tasks // []' 2>/dev/null) || OLD_TASKS="[]"
fi

# ── Detect status changes and dispatch to notify.js ─────────────────

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "$NEW_TASKS" | jq -c '.[]' 2>/dev/null | while read -r TASK; do
  TASK_ID=$(echo "$TASK" | jq -r '.id // empty' 2>/dev/null) || continue
  NEW_STATUS=$(echo "$TASK" | jq -r '.status // empty' 2>/dev/null) || continue

  if [[ -z "$TASK_ID" || -z "$NEW_STATUS" ]]; then
    continue
  fi

  # Get old status (default: pending for first write / unmapped tasks)
  OLD_STATUS=$(echo "$OLD_TASKS" | jq -r --arg id "$TASK_ID" '.[] | select(.id == $id) | .status // "pending"' 2>/dev/null) || OLD_STATUS="pending"

  # Skip if status unchanged (FR-010 equivalent — no redundant Jira calls)
  if [[ "$OLD_STATUS" == "$NEW_STATUS" ]]; then
    continue
  fi

  # Build notify event and dispatch fire-and-forget
  EVENT_JSON=$(jq -n \
    --arg specDir "$SPEC_DIR" \
    --arg taskId "$TASK_ID" \
    --arg newStatus "$NEW_STATUS" \
    '{specDir: $specDir, taskId: $taskId, newStatus: $newStatus}' 2>/dev/null) || continue

  # Fire-and-forget: call notify.js (FR-007)
  node "$NOTIFY_SCRIPT" "$EVENT_JSON" 2>/dev/null &

done || true

# Update cache with current tasks content (prevents duplicate detection)
echo "$NEW_CONTENT" > "$TASKS_CACHE" 2>/dev/null || true

# Always exit 0 (fail-open)
exit 0
