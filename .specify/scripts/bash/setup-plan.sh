#!/usr/bin/env bash

set -e

# Parse command line arguments
JSON_MODE=false
SPEC_NAME=""

for arg in "$@"; do
    case "$arg" in
        --json)
            JSON_MODE=true
            ;;
        --help|-h)
            echo "Usage: $0 [SPEC_NAME] [--json]"
            echo "  SPEC_NAME  Spec directory name (required for mainline, optional for feature branches)"
            echo "  --json     Output results in JSON format"
            echo "  --help     Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 095-usaspending-v2 --json   # Mainline: specify which spec"
            echo "  $0 --json                       # Feature branch: uses branch name"
            exit 0
            ;;
        *)
            # First non-flag argument is the spec name
            if [[ -z "$SPEC_NAME" ]]; then
                SPEC_NAME="$arg"
            fi
            ;;
    esac
done

# Get script directory and load common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Get repo root and branch info
REPO_ROOT=$(get_repo_root)
CURRENT_BRANCH=$(get_current_branch)
HAS_GIT="false"
if has_git; then
    HAS_GIT="true"
fi

# Determine spec directory name:
# - If SPEC_NAME argument provided, use it
# - If on feature branch (NNN-name), use branch name
# - Otherwise, error (mainline requires explicit spec name)
if [[ -n "$SPEC_NAME" ]]; then
    FEATURE_NAME="$SPEC_NAME"
elif [[ "$CURRENT_BRANCH" =~ ^[0-9]{3}- ]]; then
    FEATURE_NAME="$CURRENT_BRANCH"
else
    echo "ERROR: On mainline branch '$CURRENT_BRANCH' - spec name argument required" >&2
    echo "Usage: $0 SPEC_NAME [--json]" >&2
    echo "Example: $0 095-usaspending-v2 --json" >&2
    exit 1
fi

# Build paths
FEATURE_DIR="$REPO_ROOT/specs/$FEATURE_NAME"
FEATURE_SPEC="$FEATURE_DIR/spec.md"
IMPL_PLAN="$FEATURE_DIR/plan.md"

# Log branch info
check_feature_branch "$CURRENT_BRANCH" "$HAS_GIT"

# Ensure the feature directory exists
mkdir -p "$FEATURE_DIR"

# Copy plan template if it exists
TEMPLATE="$REPO_ROOT/.specify/templates/plan-template.md"
if [[ -f "$TEMPLATE" ]]; then
    cp "$TEMPLATE" "$IMPL_PLAN"
    echo "Copied plan template to $IMPL_PLAN"
else
    echo "Warning: Plan template not found at $TEMPLATE"
    # Create a basic plan file if template doesn't exist
    touch "$IMPL_PLAN"
fi

# Output results
if $JSON_MODE; then
    printf '{"FEATURE_SPEC":"%s","IMPL_PLAN":"%s","SPECS_DIR":"%s","BRANCH":"%s","HAS_GIT":"%s"}\n' \
        "$FEATURE_SPEC" "$IMPL_PLAN" "$FEATURE_DIR" "$CURRENT_BRANCH" "$HAS_GIT"
else
    echo "FEATURE_SPEC: $FEATURE_SPEC"
    echo "IMPL_PLAN: $IMPL_PLAN" 
    echo "SPECS_DIR: $FEATURE_DIR"
    echo "BRANCH: $CURRENT_BRANCH"
    echo "HAS_GIT: $HAS_GIT"
fi
