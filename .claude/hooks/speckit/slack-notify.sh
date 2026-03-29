#!/usr/bin/env bash
# slack-notify.sh — PostToolUse:Write hook for Slack notifications
# Detects phase transitions (spec.md writes) and task completions (tasks.json writes)
# and dispatches notifications via packages/slack-mcp/build/notify.js
#
# Fail-open: errors allow through. Always exits 0.
#
# Event types:
#   - phase_transition: when spec.md frontmatter phase changes
#   - task_completion: when a task in tasks.json/prd.json changes to done/completed
#
# Spec: 007-slack-integration-progress

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

# ── Pattern matching: spec.md or tasks.json/prd.json ─────────────────

# Extract spec directory from file path
# Expected patterns:
#   specs/{spec-id}/spec.md
#   specs/{spec-id}/tasks.json
#   specs/{spec-id}/prd.json
SPEC_DIR=""
SPEC_ID=""
FILE_NAME=$(basename "$FILE_PATH")

case "$FILE_PATH" in
  *specs/*/spec.md|*specs/*/tasks.json|*specs/*/prd.json)
    # Extract spec directory
    SPEC_DIR=$(dirname "$FILE_PATH")
    SPEC_ID=$(basename "$SPEC_DIR")
    ;;
  *)
    # Not a spec file we care about
    exit 0
    ;;
esac

# ── Build notify.js path ─────────────────────────────────────────────

NOTIFY_SCRIPT="$REPO_ROOT/packages/slack-mcp/build/notify.js"

if [[ ! -f "$NOTIFY_SCRIPT" ]]; then
  # Script not built yet — skip silently
  exit 0
fi

# ── Load env vars from .mcp.json ────────────────────────────────────
# Hook scripts don't inherit MCP server env vars, so read them from .mcp.json
# (single source of truth) and export for notify.js

MCP_CONFIG="$REPO_ROOT/.mcp.json"
if [[ -f "$MCP_CONFIG" ]]; then
  # Use ${VAR-default} (not :-) so tests can disable with VAR=''
  export SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL-$(jq -r '.mcpServers["slack-speckit"].env.SLACK_WEBHOOK_URL // empty' "$MCP_CONFIG" 2>/dev/null)}"
  export SLACK_BOT_TOKEN="${SLACK_BOT_TOKEN-$(jq -r '.mcpServers["slack-speckit"].env.SLACK_BOT_TOKEN // empty' "$MCP_CONFIG" 2>/dev/null)}"
  export SLACK_CHANNEL="${SLACK_CHANNEL-$(jq -r '.mcpServers["slack-speckit"].env.SLACK_CHANNEL // empty' "$MCP_CONFIG" 2>/dev/null)}"
  export SLACK_TIMEOUT_MS="${SLACK_TIMEOUT_MS-$(jq -r '.mcpServers["slack-speckit"].env.SLACK_TIMEOUT_MS // empty' "$MCP_CONFIG" 2>/dev/null)}"
fi

# If still no webhook URL, nothing to do
if [[ -z "${SLACK_WEBHOOK_URL:-}" ]]; then
  exit 0
fi

# ── Detect event type and build notification ─────────────────────────

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Try to extract spec name from spec.md frontmatter
SPEC_NAME="$SPEC_ID"
SPEC_FILE="$SPEC_DIR/spec.md"
if [[ -f "$SPEC_FILE" ]]; then
  SPEC_NAME=$(head -30 "$SPEC_FILE" 2>/dev/null | grep -E '^\s*spec_name:' | head -1 | sed 's/.*spec_name:[[:space:]]*//' | tr -d '"') || true
  if [[ -z "$SPEC_NAME" ]]; then
    SPEC_NAME="$SPEC_ID"
  fi
fi

case "$FILE_NAME" in
  spec.md)
    # Phase transition detection
    # Read the new content to extract phase from frontmatter
    NEW_CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty' 2>/dev/null) || exit 0

    if [[ -z "$NEW_CONTENT" ]]; then
      exit 0
    fi

    # Extract phase from frontmatter (may be indented under meta:)
    # Use head to limit to frontmatter region (first 30 lines)
    NEW_PHASE=$(echo "$NEW_CONTENT" | head -30 | grep -E '^\s*phase:' | head -1 | sed 's/.*phase:[[:space:]]*//' | tr -d '"') || true

    if [[ -z "$NEW_PHASE" ]]; then
      exit 0
    fi

    # Try to get previous phase from cache first, then git HEAD.
    # Cache prevents duplicate notifications when file is written multiple
    # times between commits (git HEAD only updates on commit).
    OLD_PHASE=""
    CACHE_KEY=$(get_cache_key "$FILE_PATH")
    PHASE_CACHE="$CACHE_DIR/${CACHE_KEY}.phase"
    if [[ -f "$PHASE_CACHE" ]]; then
      OLD_PHASE=$(cat "$PHASE_CACHE" 2>/dev/null) || true
    else
      REL_PATH="${FILE_PATH#$REPO_ROOT/}"
      OLD_PHASE=$(git show "HEAD:${REL_PATH}" 2>/dev/null | head -30 | grep -E '^\s*phase:' | head -1 | sed 's/.*phase:[[:space:]]*//' | tr -d '"') || true
    fi

    # Only notify if phase changed
    if [[ "$OLD_PHASE" != "$NEW_PHASE" ]]; then
      FROM_PHASE="${OLD_PHASE:-specify}"

      # Build phase_transition event
      EVENT_JSON=$(jq -n \
        --arg type "phase_transition" \
        --arg specId "$SPEC_ID" \
        --arg specName "$SPEC_NAME" \
        --arg timestamp "$TIMESTAMP" \
        --arg fromPhase "$FROM_PHASE" \
        --arg toPhase "$NEW_PHASE" \
        '{
          type: $type,
          specId: $specId,
          specName: $specName,
          timestamp: $timestamp,
          details: {
            fromPhase: $fromPhase,
            toPhase: $toPhase
          }
        }' 2>/dev/null) || exit 0

      # Fire-and-forget: call notify.js
      node "$NOTIFY_SCRIPT" "$EVENT_JSON" 2>/dev/null &
    fi

    # Update cache with current phase (prevents duplicate detection on next write)
    echo "$NEW_PHASE" > "$PHASE_CACHE" 2>/dev/null || true
    ;;

  tasks.json|prd.json)
    # Task completion detection
    # Read the new content to find completed tasks
    NEW_CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty' 2>/dev/null) || exit 0

    if [[ -z "$NEW_CONTENT" ]]; then
      exit 0
    fi

    # Parse the new tasks
    NEW_TASKS=$(echo "$NEW_CONTENT" | jq -r '.tasks // []' 2>/dev/null) || exit 0

    if [[ -z "$NEW_TASKS" || "$NEW_TASKS" == "[]" ]]; then
      exit 0
    fi

    # Read old tasks from cache first, then git HEAD.
    # Cache prevents duplicate notifications between commits.
    OLD_TASKS="[]"
    CACHE_KEY=$(get_cache_key "$FILE_PATH")
    TASKS_CACHE="$CACHE_DIR/${CACHE_KEY}.tasks"
    if [[ -f "$TASKS_CACHE" ]]; then
      OLD_TASKS=$(cat "$TASKS_CACHE" 2>/dev/null | jq -r '.tasks // []' 2>/dev/null) || OLD_TASKS="[]"
    else
      REL_PATH="${FILE_PATH#$REPO_ROOT/}"
      OLD_TASKS=$(git show "HEAD:${REL_PATH}" 2>/dev/null | jq -r '.tasks // []' 2>/dev/null) || OLD_TASKS="[]"
    fi

    # Find tasks that changed to "done" or "completed"
    # Compare each task's status
    echo "$NEW_TASKS" | jq -c '.[]' 2>/dev/null | while read -r TASK; do
      TASK_ID=$(echo "$TASK" | jq -r '.id // empty' 2>/dev/null) || continue
      NEW_STATUS=$(echo "$TASK" | jq -r '.status // empty' 2>/dev/null) || continue
      TASK_DESC=$(echo "$TASK" | jq -r '.description // empty' 2>/dev/null) || continue

      # Skip if not completed/done
      if [[ "$NEW_STATUS" != "done" && "$NEW_STATUS" != "completed" ]]; then
        continue
      fi

      # Check if this is a new completion (wasn't done/completed before)
      OLD_STATUS=$(echo "$OLD_TASKS" | jq -r --arg id "$TASK_ID" '.[] | select(.id == $id) | .status // "pending"' 2>/dev/null) || OLD_STATUS="pending"

      if [[ "$OLD_STATUS" != "done" && "$OLD_STATUS" != "completed" ]]; then
        # This task just completed — send notification
        EVENT_JSON=$(jq -n \
          --arg type "task_completion" \
          --arg specId "$SPEC_ID" \
          --arg specName "$SPEC_NAME" \
          --arg timestamp "$TIMESTAMP" \
          --arg taskId "$TASK_ID" \
          --arg taskDesc "$TASK_DESC" \
          '{
            type: $type,
            specId: $specId,
            specName: $specName,
            timestamp: $timestamp,
            details: {
              taskId: $taskId,
              taskDescription: $taskDesc,
              status: "completed"
            }
          }' 2>/dev/null) || continue

        # Fire-and-forget: call notify.js
        node "$NOTIFY_SCRIPT" "$EVENT_JSON" 2>/dev/null &
      fi
    done || true

    # Update cache with current tasks content (prevents duplicate detection)
    echo "$NEW_CONTENT" > "$TASKS_CACHE" 2>/dev/null || true
    ;;
esac

# Always exit 0 (fail-open)
exit 0
