#!/bin/bash
# SessionStart Hook:
# 1. Inject recovery context if compaction occurred
# 2. Clean up old task output files (>7 days)

SNAPSHOT=".claude/session-context/compaction-snapshot.txt"
TASKS_DIR="/tmp/claude/-Users-brian-Documents-blb-coding-wine-cellar/tasks"

# Cleanup old background task output files (>7 days) to prevent disk bloat
if [ -d "$TASKS_DIR" ]; then
  find "$TASKS_DIR" -name "*.output" -type f -mtime +7 -delete 2>/dev/null || true
fi

# Compaction recovery logic
if [ -f "$SNAPSHOT" ]; then
  # Read and parse snapshot
  DATA=$(cat "$SNAPSHOT")
  SPEC=$(echo "$DATA" | cut -d'|' -f1 | cut -d':' -f2)
  TASK=$(echo "$DATA" | cut -d'|' -f2 | cut -d':' -f2)

  # Delete snapshot (one-time use)
  rm -f "$SNAPSHOT"

  # Output recovery context
  if [ "$SPEC" != "none" ]; then
    MSG="Recovered from compaction: Spec ${SPEC}"
    [ "$TASK" != "none" ] && MSG="${MSG}, Task ${TASK} was in progress"
    echo "{\"systemMessage\":\"${MSG}\",\"continue\":true}"
  else
    echo '{"continue":true}'
  fi
else
  echo '{"continue":true}'
fi

exit 0
