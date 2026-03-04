---
model: sonnet
description: Archive a completed, deprecated, or not-viable spec
argument-hint: <spec-id> <status> [reason]
allowed-tools: Read, Bash, Grep, Glob
---

# Archive Spec

Archive a SpecKit specification to `specs/archive/`.

## Usage

```
/archive-spec <spec-id> <status> [reason]
```

**Statuses:**

- `completed` — Spec fully implemented and verified
- `deprecated` — Spec superseded by another
- `not-viable` — Abandoned due to constraints

## Instructions

### Step 1: Parse Arguments

Extract from `$ARGUMENTS`:

- `spec-id` (required) — The spec number (e.g., `101`)
- `status` (required) — One of: completed, deprecated, not-viable
- `reason` (optional) — Free-text reason for archival

If missing required arguments, show usage and stop.

### Step 2: Validate

1. Verify spec directory exists at `specs/<spec-id>-*/` or `specs/<spec-id>/`
2. If status is `completed`, verify T-FINAL or T-VERIFY tasks show passing
   evidence
3. If status is `deprecated` or `not-viable`, reason is recommended but not
   required

### Step 3: Create Archive Directory

```bash
mkdir -p specs/archive
```

### Step 4: Move Spec

```bash
# Find the spec directory
SPEC_DIR=$(ls -d specs/<spec-id>-* 2>/dev/null || ls -d specs/<spec-id> 2>/dev/null)
mv "$SPEC_DIR" specs/archive/
```

### Step 5: Create Archive Summary

Append to `specs/archive/ARCHIVE-LOG.md`:

```markdown
## <spec-id> — <spec-title>

- **Status**: <status>
- **Archived**: <YYYY-MM-DD>
- **Reason**: <reason or "Completed successfully">
- **Location**: specs/archive/<dirname>/
```

### Step 6: Commit

```bash
git add specs/archive/
git commit -m "chore: archive spec <spec-id> (<status>)"
```

### Step 7: Report

Output a single-line confirmation:

```
Archived spec <spec-id> as <status> → specs/archive/<dirname>/
```

## Error Handling

- If spec directory not found: "Spec <spec-id> not found in specs/"
- If status is invalid: "Invalid status. Use: completed, deprecated, not-viable"
- If T-FINAL not passing for completed: "Warning: T-FINAL not verified. Archive
  anyway? (proceeding)"
