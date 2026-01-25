#!/usr/bin/env bash
# Common functions and variables for all scripts

# Get repository root, with fallback for non-git repositories
get_repo_root() {
    if git rev-parse --show-toplevel >/dev/null 2>&1; then
        git rev-parse --show-toplevel
    else
        # Fall back to script location for non-git repos
        local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        (cd "$script_dir/../../.." && pwd)
    fi
}

# Helper function to find latest numbered spec directory
# Used by get_current_branch for mainline development support
_find_latest_spec() {
    local specs_dir="$1"
    local latest_feature=""
    local highest=0

    for dir in "$specs_dir"/*; do
        if [[ -d "$dir" ]]; then
            local dirname=$(basename "$dir")
            if [[ "$dirname" =~ ^([0-9]{3})- ]]; then
                local number=${BASH_REMATCH[1]}
                number=$((10#$number))
                if [[ "$number" -gt "$highest" ]]; then
                    highest=$number
                    latest_feature=$dirname
                fi
            fi
        fi
    done

    echo "$latest_feature"
}

# Get current branch, with fallback for non-git repositories
# Supports mainline development by auto-detecting latest spec when on main/master/develop
get_current_branch() {
    # First check if SPECIFY_FEATURE environment variable is set
    if [[ -n "${SPECIFY_FEATURE:-}" ]]; then
        echo "$SPECIFY_FEATURE"
        return
    fi

    # Check git if available
    if git rev-parse --abbrev-ref HEAD >/dev/null 2>&1; then
        local git_branch=$(git rev-parse --abbrev-ref HEAD)

        # On mainline branches, auto-detect latest spec instead of using branch name
        if [[ "$git_branch" =~ ^(main|master|develop)$ ]]; then
            local repo_root=$(get_repo_root)
            local specs_dir="$repo_root/specs"

            # If specs/<branch> exists (explicit mainline spec), use it
            if [[ -d "$specs_dir/$git_branch" ]]; then
                echo "$git_branch"
                return
            fi

            # Otherwise, find the latest numbered spec
            if [[ -d "$specs_dir" ]]; then
                local latest=$(_find_latest_spec "$specs_dir")
                if [[ -n "$latest" ]]; then
                    echo "$latest"
                    return
                fi
            fi
        fi

        # For feature branches or when no specs found, return git branch
        echo "$git_branch"
        return
    fi

    # For non-git repos, try to find the latest feature directory
    local repo_root=$(get_repo_root)
    local specs_dir="$repo_root/specs"

    if [[ -d "$specs_dir" ]]; then
        local latest=$(_find_latest_spec "$specs_dir")
        if [[ -n "$latest" ]]; then
            echo "$latest"
            return
        fi
    fi

    echo "main"  # Final fallback
}

# Check if we have git available
has_git() {
    git rev-parse --show-toplevel >/dev/null 2>&1
}

check_feature_branch() {
    local branch="$1"
    local has_git_repo="$2"

    # For non-git repos, just note it
    if [[ "$has_git_repo" != "true" ]]; then
        echo "[specify] Note: Git repository not detected" >&2
        return 0
    fi

    # Informational only - mainline development is fully supported
    # Feature branches (NNN-name) and main/other branches are both valid
    if [[ "$branch" =~ ^[0-9]{3}- ]]; then
        echo "[specify] Feature branch: $branch" >&2
    else
        echo "[specify] Branch: $branch (mainline development)" >&2
    fi

    return 0
}

get_feature_dir() { echo "$1/specs/$2"; }

get_feature_paths() {
    local repo_root=$(get_repo_root)
    local current_branch=$(get_current_branch)
    local has_git_repo="false"
    
    if has_git; then
        has_git_repo="true"
    fi
    
    local feature_dir=$(get_feature_dir "$repo_root" "$current_branch")
    
    cat <<EOF
REPO_ROOT='$repo_root'
CURRENT_BRANCH='$current_branch'
HAS_GIT='$has_git_repo'
FEATURE_DIR='$feature_dir'
FEATURE_SPEC='$feature_dir/spec.md'
IMPL_PLAN='$feature_dir/plan.md'
TASKS='$feature_dir/tasks.md'
RESEARCH='$feature_dir/research.md'
DATA_MODEL='$feature_dir/data-model.md'
QUICKSTART='$feature_dir/quickstart.md'
CONTRACTS_DIR='$feature_dir/contracts'
EOF
}

check_file() { [[ -f "$1" ]] && echo "  ✓ $2" || echo "  ✗ $2"; }
check_dir() { [[ -d "$1" && -n $(ls -A "$1" 2>/dev/null) ]] && echo "  ✓ $2" || echo "  ✗ $2"; }
