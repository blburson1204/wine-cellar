#!/bin/bash
# ATOM Hook: Record Verification (Stop Hook)
# Event: Stop
# Timeout: 5 seconds
#
# Verifies T-VERIFY task evidence exists before allowing session end.
# Reads current-work.md for active spec, checks tasks.json for T-VERIFY
# tasks, and validates evidence freshness in per-step NDJSON files
# (evidence/{task-id}.ndjson).
#
# Decision flow:
#   No current-work.md / no active spec → ALLOW (fail-open)
#   No tasks.json / parse error         → ALLOW (fail-open)
#   No T-VERIFY tasks                   → ALLOW
#   T-VERIFY with fresh passing verdict → ALLOW
#   T-VERIFY missing/stale/failed       → BLOCK
#
# Fail-open: any error in this script allows through.
# All output is JSON on stdout. Exit code is always 0.

set -euo pipefail

# ── Helpers ──────────────────────────────────────────────────────────

allow() {
  local reason="${1:-}"
  if [[ -n "$reason" ]]; then
    jq -n --arg reason "$reason" \
      '{"decision":"approve","reason":$reason}'
  else
    echo '{"decision":"approve"}'
  fi
  exit 0
}

block() {
  local reason="$1"
  jq -n --arg reason "$reason" \
    '{"decision":"block","reason":$reason}'
  exit 0
}

# ── Read stdin (consume but don't require) ───────────────────────────

cat >/dev/null 2>&1 || true

# ── Step 1: Find active spec from current-work.md ───────────────────

CURRENT_WORK=".claude/session-context/current-work.md"

if [[ ! -f "$CURRENT_WORK" ]]; then
  allow "No current-work.md found"
fi

# Extract spec reference: **Spec**: {id}-{name}
SPEC_REF=$(grep -oE '\*\*Spec\*\*:\s*[0-9]+-[a-zA-Z0-9_-]+' "$CURRENT_WORK" 2>/dev/null | head -1) || true

if [[ -z "$SPEC_REF" ]]; then
  allow "No active spec in current-work.md"
fi

# Parse spec ID and name from the reference
SPEC_DIR_NAME=$(echo "$SPEC_REF" | sed 's/.*:\s*//' | xargs)

if [[ -z "$SPEC_DIR_NAME" ]]; then
  allow "Could not parse spec reference"
fi

SPEC_DIR="specs/${SPEC_DIR_NAME}"

# ── Step 2: Read tasks.json for T-VERIFY tasks ──────────────────────

TASKS_FILE="${SPEC_DIR}/tasks.json"

if [[ ! -f "$TASKS_FILE" ]]; then
  allow "No tasks.json found"
fi

# Parse T-VERIFY task IDs from tasks.json (fail-open on parse error)
TVERIFY_TASKS=$(jq -r '.tasks[]? | select(.id | startswith("T-VERIFY")) | .id' "$TASKS_FILE" 2>/dev/null) || allow "Failed to parse tasks.json"

if [[ -z "$TVERIFY_TASKS" ]]; then
  allow "No T-VERIFY tasks in tasks.json"
fi

# ── Step 3: Check per-step evidence files ────────────────────────────

EVIDENCE_DIR="${SPEC_DIR}/evidence"

# Current time in epoch seconds
NOW=$(date -u '+%s')
FRESHNESS_WINDOW=1800  # 30 minutes in seconds

# Track problems per task
PROBLEMS=""

while IFS= read -r TASK_ID; do
  STEP_FILE="${EVIDENCE_DIR}/${TASK_ID}.ndjson"

  # Check if per-step file exists
  if [[ ! -f "$STEP_FILE" ]]; then
    PROBLEMS="${PROBLEMS}${TASK_ID}: no evidence file found\n"
    continue
  fi

  # Get latest verdict (last non-empty line)
  LAST_LINE=$(tail -1 "$STEP_FILE" 2>/dev/null) || true

  if [[ -z "$LAST_LINE" ]]; then
    PROBLEMS="${PROBLEMS}${TASK_ID}: evidence file is empty\n"
    continue
  fi

  # Parse the last line as JSON (fail-open on parse error)
  LATEST_ENTRY=$(echo "$LAST_LINE" | jq -c '.' 2>/dev/null) || {
    PROBLEMS="${PROBLEMS}${TASK_ID}: could not parse evidence\n"
    continue
  }

  if [[ -z "$LATEST_ENTRY" ]] || [[ "$LATEST_ENTRY" == "null" ]]; then
    PROBLEMS="${PROBLEMS}${TASK_ID}: no valid evidence found\n"
    continue
  fi

  # Check status
  ENTRY_STATUS=$(echo "$LATEST_ENTRY" | jq -r '.status // empty' 2>/dev/null) || true
  if [[ "$ENTRY_STATUS" == "fail" ]]; then
    ENTRY_SUMMARY=$(echo "$LATEST_ENTRY" | jq -r '.summary // "unknown"' 2>/dev/null) || true
    PROBLEMS="${PROBLEMS}${TASK_ID}: failed (${ENTRY_SUMMARY})\n"
    continue
  fi

  # Check freshness
  ENTRY_TS=$(echo "$LATEST_ENTRY" | jq -r '.timestamp // empty' 2>/dev/null) || true
  if [[ -z "$ENTRY_TS" ]]; then
    PROBLEMS="${PROBLEMS}${TASK_ID}: no timestamp in evidence\n"
    continue
  fi

  # Convert ISO 8601 timestamp to epoch (UTC)
  CLEAN_TS=$(echo "$ENTRY_TS" | sed 's/Z$//')
  if [[ "$(uname)" == "Darwin" ]]; then
    # macOS: use TZ=UTC to interpret timestamp as UTC
    ENTRY_EPOCH=$(TZ=UTC date -jf '%Y-%m-%dT%H:%M:%S' "$CLEAN_TS" '+%s' 2>/dev/null) || {
      PROBLEMS="${PROBLEMS}${TASK_ID}: could not parse timestamp\n"
      continue
    }
  else
    # Linux: date -d handles ISO 8601
    ENTRY_EPOCH=$(date -ud "$ENTRY_TS" '+%s' 2>/dev/null) || {
      PROBLEMS="${PROBLEMS}${TASK_ID}: could not parse timestamp\n"
      continue
    }
  fi

  AGE=$((NOW - ENTRY_EPOCH))
  if [[ $AGE -gt $FRESHNESS_WINDOW ]]; then
    AGE_MIN=$((AGE / 60))
    PROBLEMS="${PROBLEMS}${TASK_ID}: evidence is stale (${AGE_MIN} minutes old, max 30)\n"
    continue
  fi

done <<< "$TVERIFY_TASKS"

# ── Step 4: Decide ──────────────────────────────────────────────────

if [[ -n "$PROBLEMS" ]]; then
  # Build block reason from accumulated problems
  REASON=$(echo -e "T-VERIFY evidence check failed:\n${PROBLEMS}" | sed '/^$/d')
  block "$REASON"
fi

allow
