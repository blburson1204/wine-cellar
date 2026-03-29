# Tech Debt Register

Accumulated P3/P4 findings from security reviews and code reviews. Items are
appended automatically during reviews and should be addressed periodically.

**Review cadence:** Review before each deployment or at project completion.

---

## Open Items

<!-- Items are appended here by security-review and code-review processes -->
<!-- Format: -->
<!-- ### [P3|P4] Title -->
<!-- - **Found:** YYYY-MM-DD -->
<!-- - **Source:** security-review / code-review / manual -->
<!-- - **Spec:** NNN (if applicable) -->
<!-- - **Location:** file:line -->
<!-- - **Issue:** Description -->
<!-- - **Suggested fix:** How to address -->

### [P3] Dead variables in jira-notify.sh (FILE_NAME, TIMESTAMP)

- **Found:** 2026-03-28
- **Source:** code-review
- **Spec:** 008
- **Location:** .claude/hooks/speckit/jira-notify.sh:46, :120
- **Issue:** `FILE_NAME` is assigned via `basename` but never referenced.
  `TIMESTAMP` is computed via `date -u` but never used. Both are dead code from
  the hook's development.
- **Suggested fix:** Remove both assignments.

### [P4] prd.json in hook path filter is a no-op

- **Found:** 2026-03-28
- **Source:** code-review
- **Spec:** 008
- **Location:** .claude/hooks/speckit/jira-notify.sh:49, :102-105
- **Issue:** The case pattern matches `*specs/*/prd.json` to mirror
  slack-notify.sh (FR-010), but prd.json has no `.tasks` key, so `NEW_TASKS`
  always evaluates to `[]` and the loop body never executes. The branch is a
  harmless no-op but adds reader confusion.
- **Suggested fix:** Either remove the prd.json arm from the case statement, or
  add a comment explaining it is intentionally inert.

### [P3] notify.ts CLI entry point (main()) has no test coverage

- **Found:** 2026-03-28
- **Source:** code-review
- **Spec:** 008
- **Location:** packages/jira-mcp/src/notify.ts:96-150
- **Issue:** Integration tests call `processEvent` directly. The `main()` CLI
  entry point — which handles argv parsing, missing-field validation,
  jira-sync.json file I/O, and all FR-009 error paths — has zero test coverage.
  A regression could cause the hook to exit non-zero and block writes.
- **Suggested fix:** Add CLI integration tests using
  `spawnSync('node', ['build/notify.js', ...])` that cover: no args, malformed
  JSON, missing fields, unreadable sync file. Mirror the pattern in
  packages/slack-mcp/**tests**/integration/hook-integration.test.ts.

### [P4] notify.ts uses process.stderr.write instead of Winston

- **Found:** 2026-03-28
- **Source:** code-review
- **Spec:** 008
- **Location:** packages/jira-mcp/src/notify.ts:101, 108, 116, 133
- **Issue:** notify.ts runs as a CLI subprocess rather than inside the MCP
  server, so using Winston is inconvenient, but error output is unstructured and
  not CloudWatch-queryable. Low impact in practice.
- **Suggested fix:** If structured logging becomes important for the hook,
  extract a minimal structured-stderr helper, or accept the tradeoff as
  documented.

---

## Resolved Items

<!-- Move items here when fixed, with resolution date and commit -->
