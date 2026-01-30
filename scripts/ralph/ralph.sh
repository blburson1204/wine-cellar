#!/bin/bash
# Ralph Loop - Fresh context per task execution
# Adapted from snarktank/ralph for SpecKit integration
#
# Spawns a fresh Claude Code session for each task iteration,
# preventing context accumulation from degrading quality.
#
# Usage: ./scripts/ralph/ralph.sh --prd <path> [--tool claude|amp] [--max-iterations N]

set -e

# Defaults
TOOL="claude"
MAX_ITERATIONS=3
PRD_FILE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --prd)
      PRD_FILE="$2"
      shift 2
      ;;
    --prd=*)
      PRD_FILE="${1#*=}"
      shift
      ;;
    --tool)
      TOOL="$2"
      shift 2
      ;;
    --tool=*)
      TOOL="${1#*=}"
      shift
      ;;
    --max-iterations)
      MAX_ITERATIONS="$2"
      shift 2
      ;;
    --max-iterations=*)
      MAX_ITERATIONS="${1#*=}"
      shift
      ;;
    *)
      # Accept bare integer as max-iterations
      if [[ "$1" =~ ^[0-9]+$ ]]; then
        MAX_ITERATIONS="$1"
      else
        echo "Warning: Unknown argument '$1'"
      fi
      shift
      ;;
  esac
done

# Validate dependencies
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required but not installed."
  echo "Install with: brew install jq"
  exit 1
fi

if ! command -v claude &> /dev/null; then
  echo "Error: Claude Code CLI is required but not installed."
  echo "Install with: npm install -g @anthropic-ai/claude-code"
  exit 1
fi

# Validate arguments
if [[ -z "$PRD_FILE" ]]; then
  echo "Error: --prd <path> is required"
  echo "Usage: ./scripts/ralph/ralph.sh --prd <path> [--tool claude|amp] [--max-iterations N]"
  exit 1
fi

if [[ ! -f "$PRD_FILE" ]]; then
  echo "Error: PRD file not found: $PRD_FILE"
  exit 1
fi

if [[ "$TOOL" != "claude" && "$TOOL" != "amp" ]]; then
  echo "Error: Invalid tool '$TOOL'. Must be 'claude' or 'amp'."
  exit 1
fi

# Resolve paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PROMPT_FILE="$SCRIPT_DIR/prompt.md"
PROGRESS_FILE="$(dirname "$PRD_FILE")/progress.txt"

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "Error: Prompt template not found: $PROMPT_FILE"
  exit 1
fi

# Initialize progress file
if [[ ! -f "$PROGRESS_FILE" ]]; then
  cat > "$PROGRESS_FILE" <<EOF
# Ralph Progress Log
Started: $(date)
PRD: $PRD_FILE
Tool: $TOOL
---
EOF
fi

# Helper functions
total_tasks() {
  jq '.tasks | length' "$PRD_FILE"
}

pending_tasks() {
  jq '[.tasks[] | select(.status == "pending")] | length' "$PRD_FILE"
}

done_tasks() {
  jq '[.tasks[] | select(.status == "done")] | length' "$PRD_FILE"
}

next_task_id() {
  # Find first pending task whose gate is null or whose gate task is "done"
  jq -r '
    .tasks as $all |
    [.tasks[] |
      .gate as $gate |
      select(
        .status == "pending" and
        (
          $gate == null or
          ($all[] | select(.id == $gate) | .status) == "done"
        )
      )
    ][0].id // empty
  ' "$PRD_FILE"
}

next_task_description() {
  local task_id="$1"
  jq -r --arg id "$task_id" '.tasks[] | select(.id == $id) | .description' "$PRD_FILE"
}

# Print banner
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Ralph Loop Starting"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PRD: $PRD_FILE"
echo "Tool: $TOOL"
echo "Max iterations: $MAX_ITERATIONS"
echo "Total tasks: $(total_tasks)"
echo "Pending: $(pending_tasks)"
echo "Done: $(done_tasks)"
echo ""

for i in $(seq 1 $MAX_ITERATIONS); do
  NEXT=$(next_task_id)

  # Check if all tasks are done
  if [[ -z "$NEXT" ]]; then
    REMAINING=$(pending_tasks)
    if [[ "$REMAINING" -eq 0 ]]; then
      echo ""
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "  All tasks complete!"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
      echo "<promise>COMPLETE</promise>"

      echo "" >> "$PROGRESS_FILE"
      echo "## Completed - $(date)" >> "$PROGRESS_FILE"
      echo "All tasks done after $((i - 1)) iterations." >> "$PROGRESS_FILE"
      exit 0
    else
      echo ""
      echo "Warning: $REMAINING tasks still pending but none are eligible (blocked by gates)."
      echo "This may indicate a gate dependency issue in the PRD."
      exit 1
    fi
  fi

  TASK_DESC=$(next_task_description "$NEXT")

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Ralph Loop - Iteration $i of $MAX_ITERATIONS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Task: $NEXT"
  echo "  Description: $TASK_DESC"
  echo "  Pending: $(pending_tasks) | Done: $(done_tasks) | Total: $(total_tasks)"
  echo ""

  # Generate prompt with PRD path injected
  PROMPT=$(sed "s|{{PRD_FILE}}|$PRD_FILE|g; s|{{REPO_ROOT}}|$REPO_ROOT|g" "$PROMPT_FILE")

  # Spawn fresh session
  if [[ "$TOOL" == "claude" ]]; then
    OUTPUT=$(echo "$PROMPT" | claude --dangerously-skip-permissions --print 2>&1 | tee /dev/stderr) || true
  else
    OUTPUT=$(echo "$PROMPT" | amp --dangerously-allow-all 2>&1 | tee /dev/stderr) || true
  fi

  # Log progress
  echo "" >> "$PROGRESS_FILE"
  echo "## Iteration $i - Task $NEXT - $(date)" >> "$PROGRESS_FILE"
  echo "Description: $TASK_DESC" >> "$PROGRESS_FILE"
  if echo "$OUTPUT" | grep -q "done"; then
    echo "Result: Task completed" >> "$PROGRESS_FILE"
  else
    echo "Result: Session ended (check task status)" >> "$PROGRESS_FILE"
  fi
  echo "---" >> "$PROGRESS_FILE"

  # Check for completion signal from the Claude session
  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  All tasks complete!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "<promise>COMPLETE</promise>"

    echo "" >> "$PROGRESS_FILE"
    echo "## Completed - $(date)" >> "$PROGRESS_FILE"
    echo "All tasks done after $i iterations." >> "$PROGRESS_FILE"
    exit 0
  fi

  echo ""
  echo "Iteration $i complete. Continuing..."
  sleep 2
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Ralph reached max iterations ($MAX_ITERATIONS)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Pending: $(pending_tasks) | Done: $(done_tasks) | Total: $(total_tasks)"
echo "Check progress: $PROGRESS_FILE"
exit 1
