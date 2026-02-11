#!/bin/bash
# Streamlined Pre-Edit Verification
# Prevents edits based on stale file content by verifying old_string exists
# No logging, no verbose output - just the essential check

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
OLD_STRING=$(echo "$INPUT" | jq -r '.tool_input.old_string // empty')

# Allow if no file_path or empty old_string (prepend operation)
if [[ -z "$FILE_PATH" ]] || [[ -z "$OLD_STRING" ]]; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
  exit 0
fi

# Block if file doesn't exist
if [[ ! -f "$FILE_PATH" ]]; then
  echo "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"deny\",\"permissionDecisionReason\":\"File does not exist: $FILE_PATH\"}}"
  exit 0
fi

# Check if old_string exists in current file
if grep -qF -- "$OLD_STRING" "$FILE_PATH"; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
else
  FILENAME=$(basename "$FILE_PATH")
  echo "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"deny\",\"permissionDecisionReason\":\"Stale file: re-read $FILENAME before editing\"}}"
fi

exit 0
