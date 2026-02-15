---
name: feature-ship
description:
  Use when feature branch is complete and ready to merge - runs full test suite,
  merges to main with no-ff, cleans up branch, updates session context (FEATURE
  BRANCH WORKFLOW ONLY - mainline commits just push to origin)
model: claude-haiku-4-5-20251001
---

# Ship Feature

## Overview

Automates the **feature branch workflow** completion with mandatory testing,
safe merging, and clean context management. Ensures no feature ships without
passing tests.

**For mainline development:** If you committed directly to `main`, skip this
skill and just push to origin.

**Core principle:** Test, merge, clean up, celebrate.

## When to Use

**Use this skill ONLY when using the feature branch workflow:**

- ✅ You're on a feature branch (e.g., `091-feature-name`)
- ✅ Feature implementation is complete
- ✅ All manual testing done
- ✅ Ready to merge to main
- ✅ Confident tests will pass

**Don't use this skill when:**

- ❌ You committed directly to main (see Mainline Workflow below)
- ❌ Feature is incomplete
- ❌ Known test failures exist
- ❌ Haven't tested manually
- ❌ Just exploring or experimenting

## When NOT to Use

**Skip this skill if you're using mainline development:**

- You committed directly to `main` branch
- No feature branch exists to merge
- Just need to push to `origin/main`

For mainline commits, see the **Mainline Workflow** section below instead.

## Mainline Workflow

**If you committed directly to `main` branch, you don't need this skill.**

For mainline development (direct commits to main):

1. **Ensure all tests pass** - Run `npm test`
2. **Push to origin** - `git push origin main`
3. **That's it** - No branch to merge, no cleanup needed

This skill is designed for the **feature branch workflow only**. Mainline
development is simpler: test, push, done.

## Prerequisites (Feature Branch Workflow Only)

1. **Feature branch active** (e.g., `091-feature-name`) with work committed
2. **Implementation complete** per plan.md and tasks.md
3. **Manual testing done** - feature works as expected
4. **current-work.md exists** with feature info
5. **Working tree clean** or ready to commit final changes

## What This Skill Does (Feature Branch Workflow)

**Note:** This entire process applies to feature branch workflow only. For
mainline development, see the Mainline Workflow section above.

### Step 1: Validation

- Read current-work.md to identify feature
- Confirm feature branch matches (or confirm ready to merge)
- Check working tree status with `git status`
- If uncommitted changes exist, commit them: `git commit -m "message"`
- Prompt user: "Ready to ship Feature NNN - Name? This will run full test suite
  (~10-15 min). (Y/n)"

### Step 1.5: Database Migration Check (CRITICAL)

- Run: `npm run db:check-drift`
- If schema has unmigrated changes:
  - ⚠️ WARN user: "Schema has changes not captured in migrations"
  - Prompt: "Create migration before shipping? (Y/n)"
  - If Y: Run `npm run db:migrate -- --name "feature_NNN_changes"`
  - If N: STOP - "Cannot ship without migrations for production"
- This prevents the common bug where db:push changes work locally but break
  production

### Step 1.7: Tech Debt Review

- Read `documents/tech-debt.md` for open P3/P4 items
- If open items exist:
  - Display count and summary to user
  - Ask: "There are N open tech debt items. Review them now before shipping?
    (Y/n)"
  - If Y: Display items, let user decide which to fix or defer
  - If N: Continue — items remain tracked for next review
- This ensures accumulated debt is surfaced at shipping boundaries

### Step 2: Full Test Suite

- Run: `npm test`
- Monitor output in real-time
- Report test progress to user
- If ANY test fails:
  - ❌ STOP immediately
  - Report failures in detail
  - Show failing tests
  - Advise: "Fix failures, then run ship-feature again"
  - EXIT without merging

### Step 3: Commit & Push

- Ensure all changes are committed: `git status` (must be clean)
- Commit any final changes: `git commit -m "message"`
- Push to remote: `git push` (or `git push -u origin <branch-name>` if first
  push)
- Ensure feature branch is pushed to remote for PR creation

### Step 4: Merge to Main (Feature Branch Only)

- Create GitHub Pull Request from feature branch
- Or merge locally:
  - `git checkout main`
  - `git merge --no-ff <branch-name>`
  - `git push origin main`
- Use `--no-ff` to preserve feature history
- **Note:** If you're on main already (mainline workflow), this step is skipped

### Step 5: Cleanup (Feature Branch Only)

- Reset current-work.md to "No Active Feature" state
- Delete feature branch after merge:
  - Local: `git branch -d <branch-name>`
  - Remote: `git push origin --delete <branch-name>` (optional)
- **Note:** If using mainline workflow, only current-work.md needs reset

### Step 6: Celebration & Next Steps

- Report success with celebration
- Summarize what was shipped
- Prompt user for next action:

  ```
  🎉 Feature NNN shipped successfully!

  What's next?
  1. Start new feature from backlog (Skill: feature-start)
  2. Deploy to staging (/deploy-staging)
  3. Review future-work.md for next feature
  4. Take a well-deserved break
  ```

## Test Suite Execution

### Zero-Tolerance Policy

**ANY test failure = build failure - NO EXCEPTIONS**

```
❌ NEVER say: "98% passed", "mostly successful"
✅ ALWAYS say: "❌ BUILD FAILED - X tests failing"
```

### Test Progress Reporting

Show user:

- Current test suite running
- Pass/fail counts
- Time elapsed
- Estimated time remaining

### Test Failure Handling

If tests fail:

```
❌ Feature NNN cannot be shipped - test failures detected

Failed tests (3/198):
1. apps/api/src/services/report.test.ts
   - ReportService.generate() should handle empty data
   - Expected: [], Received: undefined

2. apps/web/src/app/(app)/reports/page.test.tsx
   - Reports page should render loading state
   - Component threw: Cannot read property 'data' of undefined

3. apps/api/src/routes/reports.test.ts
   - GET /api/v2/reports should return 200
   - Expected status: 200, Received: 500

Next steps:
1. Fix the failing tests
2. Run tests locally: npm test
3. Once all pass, run: Skill: feature-ship
```

## Error Handling

| Error              | Action                               |
| ------------------ | ------------------------------------ |
| Tests fail         | STOP - Report failures, do not merge |
| No current-work.md | FAIL - "No active feature found"     |
| Dirty working tree | Commit changes first, then continue  |
| Merge conflicts    | FAIL - "Resolve conflicts manually"  |
| Push fails         | FAIL - "Pull and retry"              |

## Example Usage

### Happy Path

```
You: "Skill: feature-ship"
AI: "Ready to ship Feature 088 - Enhanced Reporting?
     This will run full test suite (~10-15 min). (Y/n)"
You: "Y"

AI: "Running test suite..."
AI: [Progress updates as tests run]
AI: "✅ Unit tests passed (42/42)"
AI: "✅ Contract tests passed (18/18)"
AI: "✅ Smoke tests passed (12/12)"
AI: "✅ Lint passed"
AI: "✅ Type check passed"

AI: "All tests passed (198/198)"
AI: [Commits final changes if needed]
AI: [Pushes to remote]
AI: [Merges to main]
AI: [Pushes main to origin]
AI: [Deletes feature branch]
AI: [Clears current-work.md]

AI: "🎉 Feature 088 - Enhanced Reporting shipped!

     Commits merged to main
     Feature branch deleted
     Ready for next feature

     What's next?
     1. Start Feature 089 (Skill: feature-start)
     2. Deploy to staging
     3. Take a break"
```

### With Test Failures

```
You: "Skill: feature-ship"
AI: "Ready to ship Feature 088? Running tests..."

AI: [Tests run]
AI: "❌ BUILD FAILED - 3 tests failing

     Failed: apps/api/src/services/report.test.ts
     - ReportService.generate() should handle empty data

     Failed: apps/web/src/app/(app)/reports/page.test.tsx
     - Reports page should render loading state

     Failed: apps/api/src/routes/reports.test.ts
     - GET /api/v2/reports should return 200

     Feature NOT shipped. Fix failures first.
     Then run: Skill: feature-ship"

[Feature remains on branch, not merged]
```

## Implementation Steps for AI

1. **Read current-work.md** to get feature info
2. **Verify branch** matches feature
3. **Check git status** - must be clean
4. **Prompt user** for confirmation
5. **Run test suite**: `npm test`
6. **Monitor tests**:
   - Stream output to user
   - Count pass/fail
   - Report progress
7. **If any fail**:
   - STOP immediately
   - Report detailed failures
   - EXIT without merge
8. **If all pass**:
   - Commit any uncommitted changes: `git commit -m "message"`
   - Push to remote: `git push`
   - Create GitHub PR or merge locally:
     - `git checkout main`
     - `git merge --no-ff <branch-name>`
     - `git push origin main`
     - `git branch -d <branch-name>` (cleanup)
   - Reset current-work.md
   - Celebrate with user

## Commit Message Format

```
feat(NNN): brief-description

Detailed description from spec.md overview.
Can be multiple lines.

Key changes:
- Feature 1
- Feature 2
- Feature 3

Resolves: Feature NNN
Spec: specs/NNN-feature-name/spec.md
```

## Quick Reference

**One-line summary:** Complete feature → ship-feature → tests pass → merged &
shipped

**Time to execute:**

- Tests: 10-15 minutes
- Merge & cleanup: 30 seconds
- Total: ~15 minutes

**Manual alternative:** 15 steps, 20+ minutes, error-prone

**Success rate:** High if tests are green

## Integration with Other Skills

**Feature Branch Workflow:**

- **Before:** Normal development on feature branch
- **After:** `Skill: feature-start` for next feature OR deploy to staging
- **Alternative:** If tests fail, fix and retry ship-feature

**Mainline Workflow:**

- **Before:** Direct commits to main
- **After:** Just push to origin (`git push origin main`)
- **No skill needed:** Mainline development doesn't require this skill

## Session Context Contract

**This skill promises to (Feature Branch Workflow):**

- Reset current-work.md to "No Active Feature"
- Delete feature branch on success
- Not merge if tests fail

**Prerequisites (Feature Branch Workflow):**

- current-work.md must exist with feature info
- Feature branch must be active (e.g., `091-feature-name`)
- Working tree must be clean (or ready to commit final changes)

**For Mainline Workflow:**

- This skill is not needed - just run tests and push to origin

## Tips for Effective Use

1. **Choose the right workflow** - Feature branch for complex work, mainline for
   simple changes
2. **Test locally first** - Don't wait for ship-feature to discover failures
3. **Commit everything** - Ensure working tree is clean or ready for final
   commit
4. **Read the failures** - If tests fail, understand why before fixing
5. **One feature at a time** - Don't start next feature until shipped
6. **Celebrate wins** - Shipping is an achievement
7. **Use GitHub PRs** - Recommended for code review and CI/CD integration
   (feature branch workflow)
8. **Keep it simple** - If you're on main already, just test and push

## Common Mistakes

| Mistake                               | Fix                                                      |
| ------------------------------------- | -------------------------------------------------------- |
| Using this skill on main branch       | NO - Just test and push to origin                        |
| "Tests mostly passed"                 | NO - Fix failures first                                  |
| Skipping test suite                   | NO - Tests are mandatory                                 |
| Shipping with known failures          | NO - Fix first, ship later                               |
| Starting next feature before shipping | NO - Ship current feature first                          |
| Manual merge instead of skill         | Use skill for feature branches, direct push for mainline |
