#!/usr/bin/env bash
#
# Usage Tracking Wrapper for Custom Commands
#
# Tracks command execution by updating lastUsed timestamp and logging to usage log.
#
# Usage:
#   bash .specify/scripts/bash/track-command-usage.sh <command-file> <actual-command>
#
# Example:
#   bash .specify/scripts/bash/track-command-usage.sh .claude/commands/test-full.md "npm run test:full-clean"
#
# Performance Target: <50ms overhead
#

set -euo pipefail

COMMAND_FILE="${1:-}"
ACTUAL_COMMAND="${2:-}"
USAGE_LOG=".claude/usage-log.json"

# Validate arguments
if [ -z "$COMMAND_FILE" ] || [ -z "$ACTUAL_COMMAND" ]; then
  echo "Usage: track-command-usage.sh <command-file> <actual-command>" >&2
  exit 1
fi

if [ ! -f "$COMMAND_FILE" ]; then
  echo "Error: Command file not found: $COMMAND_FILE" >&2
  exit 1
fi

# Extract commandId from frontmatter
extract_command_id() {
  local file="$1"

  # Extract frontmatter between --- markers
  local frontmatter=$(awk '/^---$/{flag=!flag;next}flag' "$file" | head -20)

  # Extract commandId value
  local command_id=$(echo "$frontmatter" | grep -E "^commandId:" | sed 's/commandId:[[:space:]]*//' | tr -d '"' | tr -d "'" | xargs)

  if [ -z "$command_id" ]; then
    echo "Warning: Could not extract commandId from $file" >&2
    return 1
  fi

  echo "$command_id"
}

# Update lastUsed timestamp in frontmatter
update_timestamp() {
  local file="$1"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

  # Check if frontmatter exists
  if ! grep -q "^---$" "$file"; then
    echo "Warning: No frontmatter found in $file, skipping timestamp update" >&2
    return 1
  fi

  # Use sed to update or add lastUsed field
  if grep -q "^lastUsed:" "$file"; then
    # Update existing lastUsed
    sed -i '' "s/^lastUsed:.*/lastUsed: $timestamp/" "$file"
  else
    # Add lastUsed after created field
    sed -i '' "/^created:/a\\
lastUsed: $timestamp
" "$file"
  fi
}

# Append to usage log
log_usage() {
  local command_id="$1"
  local duration="$2"
  local exit_code="$3"
  local timestamp=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
  local user=$(whoami)

  # Create usage log if it doesn't exist
  if [ ! -f "$USAGE_LOG" ]; then
    echo '{"entries":[]}' > "$USAGE_LOG"
  fi

  # Create log entry
  local entry=$(cat <<EOF
{
  "commandId": "$command_id",
  "executedAt": "$timestamp",
  "duration": $duration,
  "exitCode": $exit_code,
  "user": "$user",
  "mode": "interactive"
}
EOF
)

  # Append to log using jq if available, otherwise simple append
  if command -v jq &> /dev/null; then
    local temp_file=$(mktemp)
    jq ".entries += [$entry]" "$USAGE_LOG" > "$temp_file" && mv "$temp_file" "$USAGE_LOG"
  else
    # Fallback: simple JSON manipulation (less safe but works)
    local temp_file=$(mktemp)
    sed 's/"entries":\[\]/"entries":[/' "$USAGE_LOG" | sed 's/\]}/}/' > "$temp_file"
    if [ -s "$temp_file" ]; then
      # Check if this is the first entry
      if grep -q '"entries":\[\]' "$USAGE_LOG"; then
        echo "{\"entries\":[$entry]}" > "$USAGE_LOG"
      else
        # Add comma and new entry before closing
        sed "s/\]}/,$entry]}/" "$USAGE_LOG" > "$temp_file" && mv "$temp_file" "$USAGE_LOG"
      fi
    fi
    rm -f "$temp_file"
  fi
}

# Main execution
main() {
  # Extract command ID
  local command_id
  command_id=$(extract_command_id "$COMMAND_FILE") || {
    echo "Warning: Proceeding without usage tracking" >&2
    # Still execute the command even if tracking fails
    eval "$ACTUAL_COMMAND"
    exit $?
  }

  # Record start time
  local start_time=$(date +%s%3N)  # milliseconds

  # Execute the actual command
  set +e
  eval "$ACTUAL_COMMAND"
  local exit_code=$?
  set -e

  # Record end time and calculate duration
  local end_time=$(date +%s%3N)
  local duration=$((end_time - start_time))

  # Update timestamp in command file (async, don't block on errors)
  update_timestamp "$COMMAND_FILE" 2>/dev/null &

  # Log usage (async, don't block on errors)
  log_usage "$command_id" "$duration" "$exit_code" 2>/dev/null &

  # Return original exit code
  exit $exit_code
}

main
