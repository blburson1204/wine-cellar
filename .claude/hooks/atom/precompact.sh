#!/bin/bash
# Minimal PreCompact - Save essential context before compaction
# Writes a one-liner that SessionStart can inject if needed

SNAPSHOT=".claude/session-context/compaction-snapshot.txt"
mkdir -p "$(dirname "$SNAPSHOT")"

# Get current spec from session context
SPEC_ID=$(grep -o 'spec_id:[[:space:]]*[0-9]*' .claude/session-context/current-work.md 2>/dev/null | grep -o '[0-9]*' | head -1)

# Get current task from tasks.json if spec exists
CURRENT_TASK=""
if [ -n "$SPEC_ID" ]; then
  TASKS_FILE=$(ls specs/${SPEC_ID}-*/tasks.json 2>/dev/null | head -1)
  if [ -f "$TASKS_FILE" ]; then
    CURRENT_TASK=$(jq -r '.tasks[] | select(.status == "in_progress") | .id' "$TASKS_FILE" 2>/dev/null | head -1)
  fi
fi

# Write minimal snapshot
echo "spec:${SPEC_ID:-none}|task:${CURRENT_TASK:-none}|time:$(date +%H:%M)" > "$SNAPSHOT"

# Output minimal JSON
echo '{"continue":true}'
exit 0
