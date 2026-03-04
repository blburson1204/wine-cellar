#!/usr/bin/env bash
# post-tasks-reconciliation.sh — PostToolUse:Write hook
# Fires after tasks.json or acceptance-tests.yaml is written.
# Injects directive to run /reconcile-artifacts for consistency.
#
# Fail-open: errors allow through.

set -euo pipefail

# Read the tool result from stdin
INPUT=$(cat)

# Extract the file path that was written
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# Only trigger for tasks.json or acceptance-tests.yaml
case "$FILE_PATH" in
  *tasks.json|*acceptance-tests.yaml)
    echo "Tasks artifact updated: $FILE_PATH"
    echo "Consider running artifact reconciliation to ensure spec, plan, and tasks are in sync."
    echo "Use: /reconcile-artifacts or manually verify consistency."
    ;;
  *)
    # Not a tasks artifact — do nothing
    ;;
esac

exit 0
