#!/bin/bash
# Safety Hook: File Placement Guard
# Event: PreToolUse:Write
# Timeout: 3 seconds
#
# Blocks creation of scripts and data files (.sh, .sql, .py) in the
# repo root directory. These belong in scripts/ subdirectories.
#
# Rules:
#   FP-001: .sh files → scripts/ (or scripts/{category}/)
#   FP-002: .sql files → scripts/data/
#   FP-003: .py files → scripts/ (or scripts/{category}/)
#
# Only blocks NEW file creation. Editing existing root files is allowed.
# Fail-open: any error in this script allows the write through.
# All output is JSON on stdout. Exit code is always 0.

set -euo pipefail

# ── Helpers ──────────────────────────────────────────────────────────

allow() {
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
  exit 0
}

deny() {
  local reason="$1"
  jq -n --arg reason "$reason" \
    '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":$reason}}'
  exit 0
}

# ── Read stdin ───────────────────────────────────────────────────────

INPUT=$(cat 2>/dev/null) || allow

if [[ -z "$INPUT" ]]; then
  allow
fi

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null) || allow

if [[ -z "$FILE_PATH" ]]; then
  allow
fi

# ── Resolve repo root ───────────────────────────────────────────────

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || allow

# ── Check: is the file in the repo root? ─────────────────────────────

FILE_DIR=$(dirname "$FILE_PATH")
FILE_NAME=$(basename "$FILE_PATH")
FILE_EXT="${FILE_NAME##*.}"

# Normalize paths for comparison
REAL_FILE_DIR=$(cd "$FILE_DIR" 2>/dev/null && pwd -P) || REAL_FILE_DIR="$FILE_DIR"
REAL_REPO_ROOT=$(cd "$REPO_ROOT" 2>/dev/null && pwd -P) || REAL_REPO_ROOT="$REPO_ROOT"

# Only care about files directly in repo root
if [[ "$REAL_FILE_DIR" != "$REAL_REPO_ROOT" ]]; then
  allow
fi

# Allow editing existing files (only block new file creation)
if [[ -f "$FILE_PATH" ]]; then
  allow
fi

# ── Pattern matching ─────────────────────────────────────────────────

# FP-001: Shell scripts
if [[ "$FILE_EXT" == "sh" ]]; then
  deny "File placement: .sh scripts must not be created in the repo root. Place in scripts/ or scripts/{category}/. Example: scripts/${FILE_NAME}"
fi

# FP-002: SQL files
if [[ "$FILE_EXT" == "sql" ]]; then
  deny "File placement: .sql files must not be created in the repo root. Place in scripts/data/. Example: scripts/data/${FILE_NAME}"
fi

# FP-003: Python scripts
if [[ "$FILE_EXT" == "py" ]]; then
  deny "File placement: .py scripts must not be created in the repo root. Place in scripts/ or scripts/{category}/. Example: scripts/${FILE_NAME}"
fi

# ── No match → allow ────────────────────────────────────────────────

allow
