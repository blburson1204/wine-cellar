#!/usr/bin/env bash
# slack-milestone.sh — Stop hook for Slack milestone notifications
# Detects verify_passed milestone when T-VERIFY evidence is fresh and passing
# and dispatches notifications via packages/slack-mcp/build/notify.js
#
# Fail-open: errors allow through. Always exits 0.
#
# Event types:
#   - milestone: when all T-VERIFY tasks have fresh passing evidence
#
# Spec: 007-slack-integration-progress

set -euo pipefail

# ── Helpers ──────────────────────────────────────────────────────────

# Fail-open: any error should not block the user
trap 'exit 0' ERR

# Get repository root
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0

# ── Read stdin (consume but don't require) ───────────────────────────

cat >/dev/null 2>&1 || true

# ── Step 1: Find active spec from current-work.md ───────────────────

CURRENT_WORK="$REPO_ROOT/.claude/session-context/current-work.md"

if [[ ! -f "$CURRENT_WORK" ]]; then
  exit 0
fi

# Extract spec reference: **Spec**: {id}-{name}
SPEC_REF=$(grep -oE '\*\*Spec\*\*:\s*[0-9]+-[a-zA-Z0-9_-]+' "$CURRENT_WORK" 2>/dev/null | head -1) || exit 0

if [[ -z "$SPEC_REF" ]]; then
  exit 0
fi

# Parse spec ID from the reference
SPEC_DIR_NAME=$(echo "$SPEC_REF" | sed 's/.*:\s*//' | xargs)

if [[ -z "$SPEC_DIR_NAME" ]]; then
  exit 0
fi

SPEC_DIR="$REPO_ROOT/specs/${SPEC_DIR_NAME}"
SPEC_ID="$SPEC_DIR_NAME"

# ── Step 2: Read tasks.json for T-VERIFY tasks ──────────────────────

# Check both tasks.json and prd.json
TASKS_FILE=""
if [[ -f "${SPEC_DIR}/tasks.json" ]]; then
  TASKS_FILE="${SPEC_DIR}/tasks.json"
elif [[ -f "${SPEC_DIR}/prd.json" ]]; then
  TASKS_FILE="${SPEC_DIR}/prd.json"
else
  exit 0
fi

# Parse T-VERIFY task IDs from tasks.json (fail-open on parse error)
TVERIFY_TASKS=$(jq -r '.tasks[]? | select(.id | startswith("T-VERIFY")) | .id' "$TASKS_FILE" 2>/dev/null) || exit 0

if [[ -z "$TVERIFY_TASKS" ]]; then
  exit 0
fi

# ── Step 3: Check per-step evidence files ────────────────────────────

EVIDENCE_DIR="${SPEC_DIR}/evidence"

# Current time in epoch seconds
NOW=$(date -u '+%s')
FRESHNESS_WINDOW=1800  # 30 minutes in seconds

# Track if all evidence is good
ALL_PASSING=true
TOTAL_TVERIFY=0
PASSED_COUNT=0

while IFS= read -r TASK_ID; do
  TOTAL_TVERIFY=$((TOTAL_TVERIFY + 1))
  STEP_FILE="${EVIDENCE_DIR}/${TASK_ID}.ndjson"

  # Check if per-step file exists
  if [[ ! -f "$STEP_FILE" ]]; then
    ALL_PASSING=false
    continue
  fi

  # Get latest verdict (last non-empty line)
  LAST_LINE=$(tail -1 "$STEP_FILE" 2>/dev/null) || {
    ALL_PASSING=false
    continue
  }

  if [[ -z "$LAST_LINE" ]]; then
    ALL_PASSING=false
    continue
  fi

  # Parse the last line as JSON
  LATEST_ENTRY=$(echo "$LAST_LINE" | jq -c '.' 2>/dev/null) || {
    ALL_PASSING=false
    continue
  }

  if [[ -z "$LATEST_ENTRY" ]] || [[ "$LATEST_ENTRY" == "null" ]]; then
    ALL_PASSING=false
    continue
  fi

  # Check status
  ENTRY_STATUS=$(echo "$LATEST_ENTRY" | jq -r '.status // empty' 2>/dev/null) || ""
  if [[ "$ENTRY_STATUS" != "pass" ]]; then
    ALL_PASSING=false
    continue
  fi

  # Check freshness
  ENTRY_TS=$(echo "$LATEST_ENTRY" | jq -r '.timestamp // empty' 2>/dev/null) || ""
  if [[ -z "$ENTRY_TS" ]]; then
    ALL_PASSING=false
    continue
  fi

  # Convert ISO 8601 timestamp to epoch (UTC)
  CLEAN_TS=$(echo "$ENTRY_TS" | sed 's/Z$//')
  if [[ "$(uname)" == "Darwin" ]]; then
    # macOS: use TZ=UTC to interpret timestamp as UTC
    ENTRY_EPOCH=$(TZ=UTC date -jf '%Y-%m-%dT%H:%M:%S' "$CLEAN_TS" '+%s' 2>/dev/null) || {
      ALL_PASSING=false
      continue
    }
  else
    # Linux: date -d handles ISO 8601
    ENTRY_EPOCH=$(date -ud "$ENTRY_TS" '+%s' 2>/dev/null) || {
      ALL_PASSING=false
      continue
    }
  fi

  AGE=$((NOW - ENTRY_EPOCH))
  if [[ $AGE -gt $FRESHNESS_WINDOW ]]; then
    ALL_PASSING=false
    continue
  fi

  # This evidence is fresh and passing
  PASSED_COUNT=$((PASSED_COUNT + 1))

done <<< "$TVERIFY_TASKS"

# ── Step 4: Send milestone notification if all passing ───────────────

if [[ "$ALL_PASSING" == "true" ]] && [[ $PASSED_COUNT -gt 0 ]]; then
  # Build notify.js path
  NOTIFY_SCRIPT="$REPO_ROOT/packages/slack-mcp/build/notify.js"

  if [[ ! -f "$NOTIFY_SCRIPT" ]]; then
    # Script not built yet — skip silently
    exit 0
  fi

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

  # Build milestone event
  EVENT_JSON=$(jq -n \
    --arg type "milestone" \
    --arg specId "$SPEC_ID" \
    --arg specName "$SPEC_NAME" \
    --arg timestamp "$TIMESTAMP" \
    --arg milestone "verify_passed" \
    --arg summary "All ${PASSED_COUNT} verification tasks passed" \
    '{
      type: $type,
      specId: $specId,
      specName: $specName,
      timestamp: $timestamp,
      details: {
        milestone: $milestone,
        summary: $summary
      }
    }' 2>/dev/null) || exit 0

  # Fire-and-forget: call notify.js
  node "$NOTIFY_SCRIPT" "$EVENT_JSON" 2>/dev/null &
fi

# Always exit 0 (fail-open)
exit 0
