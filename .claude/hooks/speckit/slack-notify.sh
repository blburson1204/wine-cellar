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

# ── Detect event type and build notification ─────────────────────────

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Try to extract spec name from spec.md frontmatter
SPEC_NAME="$SPEC_ID"
SPEC_FILE="$SPEC_DIR/spec.md"
if [[ -f "$SPEC_FILE" ]]; then
  # Extract title from YAML frontmatter (between --- markers)
  SPEC_NAME=$(awk '/^---$/,/^---$/' "$SPEC_FILE" 2>/dev/null | grep -E '^title:' | sed 's/^title:[[:space:]]*//' | tr -d '"' | head -1) || true
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

    # Extract phase from frontmatter
    NEW_PHASE=$(echo "$NEW_CONTENT" | awk '/^---$/,/^---$/' 2>/dev/null | grep -E '^phase:' | sed 's/^phase:[[:space:]]*//' | tr -d '"' | head -1) || true

    if [[ -z "$NEW_PHASE" ]]; then
      exit 0
    fi

    # Try to get previous phase from existing file (if exists)
    OLD_PHASE=""
    if [[ -f "$FILE_PATH" ]]; then
      OLD_PHASE=$(awk '/^---$/,/^---$/' "$FILE_PATH" 2>/dev/null | grep -E '^phase:' | sed 's/^phase:[[:space:]]*//' | tr -d '"' | head -1) || true
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

    # Try to read old tasks file for comparison
    OLD_TASKS="[]"
    if [[ -f "$FILE_PATH" ]]; then
      OLD_TASKS=$(jq -r '.tasks // []' "$FILE_PATH" 2>/dev/null) || OLD_TASKS="[]"
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
    ;;
esac

# Always exit 0 (fail-open)
exit 0
