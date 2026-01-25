#!/usr/bin/env bash
#
# start-feature.sh - Start working on an existing spec
#
# This script is called by `Skill: start-feature` to:
# 1. Validate the spec exists
# 2. Create a git branch
# 3. Update session context
# 4. Optionally start Docker
#
# Usage: ./start-feature.sh <spec-number> [--no-docker] [--no-branch] [--json]
#
# Example: ./start-feature.sh 091
#          ./start-feature.sh 091 --no-docker
#          ./start-feature.sh 091 --no-branch  # Mainline workflow

set -e

# Parse arguments
SPEC_NUM=""
NO_DOCKER=false
NO_BRANCH=false
JSON_MODE=false

for arg in "$@"; do
    case "$arg" in
        --no-docker) NO_DOCKER=true ;;
        --no-branch) NO_BRANCH=true ;;
        --json) JSON_MODE=true ;;
        --help|-h)
            echo "Usage: $0 <spec-number> [--no-docker] [--no-branch] [--json]"
            echo ""
            echo "Options:"
            echo "  --no-docker  Skip Docker startup"
            echo "  --no-branch  Skip branch creation (mainline mode)"
            echo "  --json       Output results as JSON"
            echo ""
            echo "Example: $0 091                  # Feature branch workflow"
            echo "         $0 091 --no-branch      # Mainline workflow"
            exit 0
            ;;
        *)
            if [ -z "$SPEC_NUM" ]; then
                # Strip leading zeros and non-numeric prefix
                SPEC_NUM=$(echo "$arg" | sed 's/^0*//' | grep -o '^[0-9]*' || echo "")
            fi
            ;;
    esac
done

if [ -z "$SPEC_NUM" ]; then
    >&2 echo "❌ Error: Spec number required"
    >&2 echo "Usage: $0 <spec-number> [--no-docker] [--no-branch] [--json]"
    exit 1
fi

# Pad spec number to 3 digits
# Use 10# to force decimal interpretation (avoids octal issues with leading zeros)
SPEC_NUM_PADDED=$(printf "%03d" "$((10#$SPEC_NUM))")

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
# STEP 1: Find the spec directory
# ============================================================================
SPECS_DIR="$REPO_ROOT/specs"
SPEC_MATCH=$(find "$SPECS_DIR" -maxdepth 1 -type d -name "${SPEC_NUM_PADDED}-*" 2>/dev/null | head -1)

if [ -z "$SPEC_MATCH" ]; then
    # Try without padding
    SPEC_MATCH=$(find "$SPECS_DIR" -maxdepth 1 -type d -name "${SPEC_NUM}-*" 2>/dev/null | head -1)
fi

if [ -z "$SPEC_MATCH" ]; then
    >&2 echo "❌ Error: No spec found matching '${SPEC_NUM_PADDED}-*'"
    >&2 echo ""
    >&2 echo "Available specs:"
    ls -d "$SPECS_DIR"/*/ 2>/dev/null | xargs -I {} basename {} | head -10 || echo "  (none)"
    >&2 echo ""
    >&2 echo "Create a spec first: /specify <feature-name>"
    exit 1
fi

# Check for multiple matches
MATCH_COUNT=$(find "$SPECS_DIR" -maxdepth 1 -type d -name "${SPEC_NUM_PADDED}-*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$MATCH_COUNT" -gt 1 ]; then
    >&2 echo "❌ Error: Multiple specs found for '${SPEC_NUM_PADDED}':"
    find "$SPECS_DIR" -maxdepth 1 -type d -name "${SPEC_NUM_PADDED}-*" | xargs -I {} basename {}
    exit 1
fi

BRANCH_NAME=$(basename "$SPEC_MATCH")
SPEC_FILE="$SPEC_MATCH/spec.md"

# Verify spec.md exists
if [ ! -f "$SPEC_FILE" ]; then
    >&2 echo "❌ Error: spec.md not found at $SPEC_FILE"
    exit 1
fi

# Extract feature name (everything after the number)
FEATURE_NAME=$(echo "$BRANCH_NAME" | sed "s/^${SPEC_NUM_PADDED}-//")

>&2 echo ""
>&2 echo "📋 Found spec: $BRANCH_NAME"
>&2 echo "   Path: $SPEC_FILE"
>&2 echo ""

# ============================================================================
# STEP 2: Check for uncommitted changes
# ============================================================================
if [ -n "$(git status --porcelain)" ]; then
    >&2 echo "⚠️  Warning: Working tree has uncommitted changes"
    >&2 echo ""
    git status --short >&2
    >&2 echo ""
    >&2 echo "💡 Commit or stash changes before creating a new branch"
    >&2 echo ""
fi

# ============================================================================
# STEP 3: Create git branch (optional)
# ============================================================================
if [ "$NO_BRANCH" = true ]; then
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    >&2 echo "⏭️  Skipping branch creation (mainline mode)"
    >&2 echo "   Current branch: $CURRENT_BRANCH"
else
    >&2 echo "📋 Creating git branch: $BRANCH_NAME"
    if git checkout -b "$BRANCH_NAME" 2>/dev/null; then
        >&2 echo "✅ Git branch '$BRANCH_NAME' created successfully"
    elif git checkout "$BRANCH_NAME" 2>/dev/null; then
        >&2 echo "ℹ️  Git branch '$BRANCH_NAME' already exists - switched to existing branch"
    else
        >&2 echo "❌ Failed to create/switch to branch - please check git status"
        exit 1
    fi
fi

# ============================================================================
# STEP 4: Update session context
# ============================================================================
SESSION_CONTEXT_DIR="$REPO_ROOT/.claude/session-context"
CURRENT_WORK_FILE="$SESSION_CONTEXT_DIR/current-work.md"

mkdir -p "$SESSION_CONTEXT_DIR"

TODAY=$(date +%Y-%m-%d)

# Determine actual branch name
if [ "$NO_BRANCH" = true ]; then
    ACTUAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    WORKFLOW_MODE="mainline"
    LAST_SESSION_BRANCH="- ✅ Staying on existing branch ($ACTUAL_BRANCH)"
else
    ACTUAL_BRANCH="$BRANCH_NAME"
    WORKFLOW_MODE="feature branch"
    LAST_SESSION_BRANCH="- ✅ Created git branch"
fi

cat > "$CURRENT_WORK_FILE" << EOF
# Current Work: $BRANCH_NAME

**Feature**: $SPEC_NUM_PADDED - $FEATURE_NAME
**Branch**: $ACTUAL_BRANCH
**Workflow**: $WORKFLOW_MODE
**Spec**: specs/$BRANCH_NAME/spec.md
**Status**: Starting
**Started**: $TODAY

## Last Session
$LAST_SESSION_BRANCH
- ✅ Updated session context

## Next Session
- [ ] Review plan.md for implementation tasks
- [ ] Begin TDD implementation (write tests first)
- [ ] Follow tasks.md checklist

## Blockers
None

## Notes
- Feature started via start-feature script
- Using $WORKFLOW_MODE workflow
- Ready for TDD implementation

## Docker Status
- Web: http://localhost:3000
- API: http://localhost:3001
- Database: Local PostgreSQL (localhost:5432)

## Quick Commands
- Start Docker: \`./scripts/docker/docker-dev.sh\`
- Full test: \`npm run test:full-docker\`
- Commit: \`git commit -m "message"\`
- Ship feature: \`Skill: ship-feature\`
EOF

>&2 echo "📝 Updated session context: $CURRENT_WORK_FILE"

# ============================================================================
# STEP 5: Start Docker (optional)
# ============================================================================
if [ "$NO_DOCKER" = false ]; then
    DOCKER_SCRIPT="$REPO_ROOT/scripts/docker/docker-dev.sh"
    if [ -x "$DOCKER_SCRIPT" ]; then
        >&2 echo ""
        >&2 echo "🐳 Starting Docker development environment..."
        "$DOCKER_SCRIPT" &
        DOCKER_PID=$!

        # Wait a moment for startup
        sleep 3

        if kill -0 $DOCKER_PID 2>/dev/null; then
            >&2 echo "🐳 Docker starting in background (PID: $DOCKER_PID)"
        fi
    else
        >&2 echo "⚠️  Docker script not found at $DOCKER_SCRIPT"
    fi
fi

# ============================================================================
# STEP 6: Output results
# ============================================================================
>&2 echo ""
>&2 echo "============================================"
>&2 echo "✅ Ready to build: $BRANCH_NAME ($WORKFLOW_MODE)"
>&2 echo "============================================"
>&2 echo ""
>&2 echo "Branch:   $ACTUAL_BRANCH"
>&2 echo "Workflow: $WORKFLOW_MODE"
>&2 echo "Spec:     specs/$BRANCH_NAME/spec.md"
>&2 echo "Context:  .claude/session-context/current-work.md"
>&2 echo ""
>&2 echo "Next steps:"
>&2 echo "  1. Review plan.md for technical approach"
>&2 echo "  2. Review tasks.md for implementation checklist"
>&2 echo "  3. Begin TDD implementation (write tests first)"
>&2 echo "  4. Commit with: git commit -m \"message\""
>&2 echo ""

if $JSON_MODE; then
    printf '{"branch":"%s","actual_branch":"%s","workflow":"%s","spec":"%s","feature_num":"%s","feature_name":"%s","context":"%s"}\n' \
        "$BRANCH_NAME" "$ACTUAL_BRANCH" "$WORKFLOW_MODE" "$SPEC_FILE" "$SPEC_NUM_PADDED" "$FEATURE_NAME" "$CURRENT_WORK_FILE"
fi
