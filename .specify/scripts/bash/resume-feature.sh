#!/usr/bin/env bash
#
# resume-feature.sh - Resume work on an existing feature or spec
#
# Use this when starting a NEW Claude Code session to:
# 1. Set the session context to an existing feature/spec
# 2. Check if a git branch exists/is active (optional)
# 3. Show current state and next steps
#
# Supports both workflows:
# - Mainline: Working directly on main branch
# - Feature branch: Working on a dedicated feature branch
#
# Usage: ./resume-feature.sh <spec-number-or-name>
#
# Examples:
#   ./resume-feature.sh 091
#   ./resume-feature.sh 091-fpds-dispatcher
#   ./resume-feature.sh 091 --json

set -e

# Parse arguments
INPUT=""
JSON_MODE=false

for arg in "$@"; do
    case "$arg" in
        --json) JSON_MODE=true ;;
        --help|-h)
            echo "Usage: $0 <spec-number-or-name> [--json]"
            echo ""
            echo "Resume work on an existing feature or spec."
            echo "Updates session context and displays current state."
            echo ""
            echo "Supports both mainline and feature branch workflows:"
            echo "  - Mainline: Working directly on main branch"
            echo "  - Feature branch: Working on a dedicated feature branch"
            echo ""
            echo "Examples:"
            echo "  $0 091                    # Resume by spec number"
            echo "  $0 091-fpds-dispatcher    # Resume by spec/branch name"
            echo ""
            exit 0
            ;;
        *)
            if [ -z "$INPUT" ]; then
                INPUT="$arg"
            fi
            ;;
    esac
done

if [ -z "$INPUT" ]; then
    >&2 echo "❌ Error: Spec number or spec name required"
    >&2 echo ""
    >&2 echo "Usage: $0 <spec-number-or-name>"
    >&2 echo ""
    >&2 echo "Examples:"
    >&2 echo "  $0 091"
    >&2 echo "  $0 091-fpds-dispatcher"
    exit 1
fi

# Find repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if git rev-parse --show-toplevel >/dev/null 2>&1; then
    REPO_ROOT=$(git rev-parse --show-toplevel)
else
    >&2 echo "❌ Error: Not in a git repository"
    exit 1
fi

cd "$REPO_ROOT"

# ============================================================================
# STEP 1: Find the spec
# ============================================================================
SPECS_DIR="$REPO_ROOT/specs"
SPEC_NAME=""
SPEC_FILE=""

# Check if input is a number (spec number) or full spec name
if [[ "$INPUT" =~ ^[0-9]+$ ]]; then
    # It's a spec number - find the matching directory
    # Use 10# to force decimal interpretation (avoids octal issues with leading zeros)
    SPEC_NUM_PADDED=$(printf "%03d" "$((10#$INPUT))")
    SPEC_MATCH=$(find "$SPECS_DIR" -maxdepth 1 -type d -name "${SPEC_NUM_PADDED}-*" 2>/dev/null | head -1)

    if [ -z "$SPEC_MATCH" ]; then
        SPEC_MATCH=$(find "$SPECS_DIR" -maxdepth 1 -type d -name "${INPUT}-*" 2>/dev/null | head -1)
    fi

    if [ -z "$SPEC_MATCH" ]; then
        >&2 echo "❌ Error: No spec found matching '${SPEC_NUM_PADDED}-*'"
        >&2 echo ""
        >&2 echo "Available specs:"
        ls -d "$SPECS_DIR"/*/ 2>/dev/null | xargs -I {} basename {} | head -15 || echo "  (none)"
        exit 1
    fi

    SPEC_NAME=$(basename "$SPEC_MATCH")
    SPEC_FILE="$SPEC_MATCH/spec.md"
else
    # It's a spec name - verify it exists
    SPEC_NAME="$INPUT"

    # Check if spec directory exists
    if [ -d "$SPECS_DIR/$SPEC_NAME" ]; then
        SPEC_FILE="$SPECS_DIR/$SPEC_NAME/spec.md"
    else
        # Try to find a matching spec
        SPEC_MATCH=$(find "$SPECS_DIR" -maxdepth 1 -type d -name "*$SPEC_NAME*" 2>/dev/null | head -1)
        if [ -n "$SPEC_MATCH" ]; then
            SPEC_NAME=$(basename "$SPEC_MATCH")
            SPEC_FILE="$SPEC_MATCH/spec.md"
        else
            >&2 echo "❌ Error: No spec directory found for '$SPEC_NAME'"
            >&2 echo ""
            >&2 echo "Available specs:"
            ls -d "$SPECS_DIR"/*/ 2>/dev/null | xargs -I {} basename {} | head -15 || echo "  (none)"
            exit 1
        fi
    fi
fi

# Extract feature number and name
FEATURE_NUM=$(echo "$SPEC_NAME" | grep -o '^[0-9]*' || echo "0")
# Use 10# to force decimal interpretation (avoids octal issues with leading zeros)
FEATURE_NUM_PADDED=$(printf "%03d" "$((10#$FEATURE_NUM))")
FEATURE_NAME=$(echo "$SPEC_NAME" | sed "s/^${FEATURE_NUM}-//" | sed "s/^${FEATURE_NUM_PADDED}-//")

>&2 echo ""
>&2 echo "🔄 Resuming work: $SPEC_NAME"
if [ -n "$SPEC_FILE" ] && [ -f "$SPEC_FILE" ]; then
    >&2 echo "   Spec: $SPEC_FILE"
fi
>&2 echo ""

# ============================================================================
# STEP 2: Check git workflow
# ============================================================================
BRANCH_EXISTS=false
BRANCH_ACTIVE=false
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
WORKFLOW_TYPE=""

>&2 echo "📋 Git workflow check..."

# Check if a feature branch exists for this spec
if git show-ref --verify --quiet "refs/heads/$SPEC_NAME" 2>/dev/null; then
    BRANCH_EXISTS=true
    >&2 echo "ℹ️  Feature branch '$SPEC_NAME' exists"

    # Check if it's the current branch
    if [ "$CURRENT_BRANCH" = "$SPEC_NAME" ]; then
        BRANCH_ACTIVE=true
        WORKFLOW_TYPE="feature-branch"
        >&2 echo "✅ Using feature branch workflow (branch: $SPEC_NAME)"
    else
        >&2 echo "ℹ️  Branch exists but not currently checked out"
        >&2 echo "   Current branch: $CURRENT_BRANCH"
        >&2 echo "   Switch with: git checkout $SPEC_NAME"
    fi
else
    # No feature branch - check if on main
    if [ "$CURRENT_BRANCH" = "main" ]; then
        WORKFLOW_TYPE="mainline"
        >&2 echo "✅ Using mainline workflow (branch: main)"
    else
        >&2 echo "ℹ️  No feature branch exists for '$SPEC_NAME'"
        >&2 echo "   Current branch: $CURRENT_BRANCH"
        >&2 echo ""
        >&2 echo "   Choose your workflow:"
        >&2 echo "   • Mainline: Continue on main branch"
        >&2 echo "   • Feature branch: Create with 'git checkout -b $SPEC_NAME'"
    fi
fi

# ============================================================================
# STEP 3: Update session context
# ============================================================================
SESSION_CONTEXT_DIR="$REPO_ROOT/.claude/session-context"
CURRENT_WORK_FILE="$SESSION_CONTEXT_DIR/current-work.md"

mkdir -p "$SESSION_CONTEXT_DIR"

TODAY=$(date +%Y-%m-%d)

# Check if current-work.md exists and has content for this feature
EXISTING_NOTES=""
if [ -f "$CURRENT_WORK_FILE" ]; then
    # Preserve existing notes if resuming same feature
    if grep -q "$SPEC_NAME" "$CURRENT_WORK_FILE" 2>/dev/null; then
        # Extract existing blockers and notes sections
        EXISTING_BLOCKERS=$(sed -n '/^## Blockers/,/^## /p' "$CURRENT_WORK_FILE" | head -n -1 | tail -n +2)
        EXISTING_NOTES=$(sed -n '/^## Notes/,/^## /p' "$CURRENT_WORK_FILE" | head -n -1 | tail -n +2)
    fi
fi

# Default blockers if none exist
if [ -z "$EXISTING_BLOCKERS" ]; then
    EXISTING_BLOCKERS="None"
fi

# Default notes if none exist
if [ -z "$EXISTING_NOTES" ]; then
    if [ "$WORKFLOW_TYPE" = "mainline" ]; then
        EXISTING_NOTES="- Resumed via resume-feature script
- Using mainline workflow (committing to main)"
    elif [ "$WORKFLOW_TYPE" = "feature-branch" ]; then
        EXISTING_NOTES="- Resumed via resume-feature script
- Using feature branch workflow (branch: $SPEC_NAME)"
    else
        EXISTING_NOTES="- Resumed via resume-feature script
- Workflow not yet determined"
    fi
fi

cat > "$CURRENT_WORK_FILE" << EOF
# Current Work: $SPEC_NAME

**Feature**: $FEATURE_NUM_PADDED - $FEATURE_NAME
**Spec**: specs/$SPEC_NAME/spec.md
**Workflow**: $WORKFLOW_TYPE
**Current Branch**: $CURRENT_BRANCH
**Status**: In Progress
**Resumed**: $TODAY

## Last Session
- ✅ Resumed work on $SPEC_NAME
- ✅ Session context updated

## Next Session
- [ ] Continue implementation per tasks.md
- [ ] Follow TDD discipline (tests first)
- [ ] Update this file at session end

## Blockers
$EXISTING_BLOCKERS

## Notes
$EXISTING_NOTES

## Docker Status
- Web: http://localhost:3000
- API: http://localhost:3001
- Database: Local PostgreSQL (localhost:5432)

## Quick Commands
- Start Docker: \`./scripts/docker/docker-dev.sh\`
- Full test: \`npm run test:full-docker\`
- Commit changes: \`git commit -m "message"\`
- Ship (if feature branch): \`Skill: ship-feature\`
EOF

>&2 echo "📝 Updated session context: $CURRENT_WORK_FILE"

# ============================================================================
# STEP 4: Show current state
# ============================================================================
>&2 echo ""
>&2 echo "============================================"
>&2 echo "🔄 Resumed: $SPEC_NAME"
>&2 echo "============================================"
>&2 echo ""
>&2 echo "Spec:     specs/$SPEC_NAME/spec.md"
>&2 echo "Workflow: ${WORKFLOW_TYPE:-undetermined}"
>&2 echo "Branch:   $CURRENT_BRANCH"
>&2 echo "Context:  .claude/session-context/current-work.md"
>&2 echo ""

# Show plan.md status
PLAN_FILE="$SPECS_DIR/$SPEC_NAME/plan.md"
TASKS_FILE="$SPECS_DIR/$SPEC_NAME/tasks.md"

if [ -f "$PLAN_FILE" ]; then
    >&2 echo "📋 Plan:   specs/$SPEC_NAME/plan.md ✅"
else
    >&2 echo "📋 Plan:   Not found - run /plan $FEATURE_NUM"
fi

if [ -f "$TASKS_FILE" ]; then
    >&2 echo "✅ Tasks:  specs/$SPEC_NAME/tasks.md ✅"

    # Count completed vs total tasks
    TOTAL_TASKS=$(grep -c '^\s*- \[' "$TASKS_FILE" 2>/dev/null || echo "0")
    DONE_TASKS=$(grep -c '^\s*- \[x\]' "$TASKS_FILE" 2>/dev/null || echo "0")
    >&2 echo "   Progress: $DONE_TASKS/$TOTAL_TASKS tasks completed"
else
    >&2 echo "✅ Tasks:  Not found - run /tasks $FEATURE_NUM"
fi

>&2 echo ""
>&2 echo "Next steps:"
if [ "$WORKFLOW_TYPE" = "mainline" ]; then
    >&2 echo "  1. Review current-work.md for context"
    >&2 echo "  2. Check tasks.md for what's next"
    >&2 echo "  3. Continue TDD implementation"
    >&2 echo "  4. Commit to main: git commit -m \"message\""
elif [ "$WORKFLOW_TYPE" = "feature-branch" ]; then
    >&2 echo "  1. Review current-work.md for context"
    >&2 echo "  2. Check tasks.md for what's next"
    >&2 echo "  3. Continue TDD implementation"
    >&2 echo "  4. Commit: git commit -m \"message\""
    >&2 echo "  5. When done: Skill: ship-feature"
else
    >&2 echo "  1. Choose workflow (mainline or feature branch)"
    if [ "$BRANCH_EXISTS" = true ]; then
        >&2 echo "     • Switch to feature branch: git checkout $SPEC_NAME"
    else
        >&2 echo "     • Create feature branch: git checkout -b $SPEC_NAME"
    fi
    >&2 echo "     • Stay on main for mainline workflow"
    >&2 echo "  2. Review current-work.md for context"
    >&2 echo "  3. Check tasks.md for what's next"
    >&2 echo "  4. Continue TDD implementation"
fi
>&2 echo ""

if $JSON_MODE; then
    printf '{"spec_name":"%s","current_branch":"%s","workflow_type":"%s","spec_file":"%s","feature_num":"%s","feature_name":"%s","context":"%s","branch_exists":%s}\n' \
        "$SPEC_NAME" "$CURRENT_BRANCH" "${WORKFLOW_TYPE:-undetermined}" "${SPEC_FILE:-null}" "$FEATURE_NUM_PADDED" "$FEATURE_NAME" "$CURRENT_WORK_FILE" "$BRANCH_EXISTS"
fi
