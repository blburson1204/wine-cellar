#!/bin/bash
# Safety Hook: Forbidden Command Blocker
# Event: PreToolUse:Bash
# Timeout: 3 seconds
#
# Blocks dangerous commands:
#   FR-001: db:push without safe wrapper (use npm run db:push which has backup + confirm)
#   FR-003: force push to main/master
#   FR-004: git reset --hard (destroys work)
#
# Adapted from Bryan's v3 framework for Wine Cellar:
#   - Removed FR-002 (docker build) — not relevant to our stack
#   - FR-001 adapted: our npm run db:push IS the safe path (has backup + confirm),
#     so we block raw prisma db push but allow npm run db:push
#
# Fail-open: any error in this script allows the command through.
# All output is JSON on stdout. Exit code is always 0.

set -euo pipefail

# ── Helpers ──────────────────────────────────────────────────────────

allow() {
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
  exit 0
}

deny() {
  local reason="$1"
  # Use jq to safely escape the reason string into JSON
  jq -n --arg reason "$reason" \
    '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":$reason}}'
  exit 0
}

# ── Read stdin ───────────────────────────────────────────────────────

INPUT=$(cat 2>/dev/null) || allow

# Empty input → fail-open
if [[ -z "$INPUT" ]]; then
  allow
fi

# Parse command from JSON input → fail-open on parse error
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null) || allow

# Missing or empty command → fail-open
if [[ -z "$COMMAND" ]]; then
  allow
fi

# ── Pattern matching ─────────────────────────────────────────────────
# Match against the full command string (catches pipes, chains, etc.)

# FR-001: Block raw prisma db push (but allow npm run db:push which is our safe wrapper)
if echo "$COMMAND" | grep -qE 'npx\s+prisma\s+db\s+push'; then
  deny "Forbidden: raw 'prisma db push' bypasses our safety wrapper. Use 'npm run db:push' instead (includes backup + confirmation)."
fi

# FR-003: Block force push to main/master
# Match: git push with --force or -f targeting main or master
if echo "$COMMAND" | grep -qE 'git\s+push\s+.*(-f|--force).*\s+(main|master)\b'; then
  deny "Forbidden: force push to main/master blocked."
fi

# FR-004: Block git reset --hard (unconditional)
if echo "$COMMAND" | grep -qE 'git\s+reset\s+--hard'; then
  deny "Forbidden: git reset --hard can destroy work. This command is unconditionally blocked."
fi

# ── No match → allow ────────────────────────────────────────────────

allow
