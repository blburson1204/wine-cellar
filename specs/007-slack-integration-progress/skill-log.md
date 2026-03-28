# Skill Log

## /specify phase (2026-03-27)

| Skill                 | Trigger                         | Reason                                                                  |
| --------------------- | ------------------------------- | ----------------------------------------------------------------------- |
| meta-skill-guide      | always                          | Universal dispatcher — applies to all phases                            |
| meta-context-optimize | always                          | Context management — applies to all phases                              |
| feature-capture-idea  | always                          | Idea capture — applies to all phases                                    |
| arch-decisions        | frontmatter: type=feature-major | New MCP server package, dual-mode architecture decisions needed         |
| security-review       | keyword: credentials, secrets   | Slack tokens/webhook URLs are secrets; OWASP review needed              |
| error-handling        | keyword: error handling         | Explicit error handling requirements (FR-006, FR-008)                   |
| code-reuse-analysis   | frontmatter: type=feature-major | Must check jira-mcp patterns before creating new package                |
| test-tdd              | frontmatter: type=feature-major | TDD enforcement for all feature implementation                          |
| doc-gate              | frontmatter: type=feature-major | Post-feature documentation gate (new package, new MCP server)           |
| doc-update            | keyword: new service            | New package requires documentation updates (CLAUDE.md, project-summary) |
| code-review           | frontmatter: type=feature-major | Mandatory review before merge                                           |

## /plan phase (2026-03-27)

| Skill                 | Trigger                         | Reason                                                              |
| --------------------- | ------------------------------- | ------------------------------------------------------------------- |
| meta-skill-guide      | always                          | Universal dispatcher — applies to all phases                        |
| meta-context-optimize | always                          | Context management — applies to all phases                          |
| feature-capture-idea  | always                          | Idea capture — applies to all phases                                |
| spec-validate         | phase-gate: specify → plan      | Mandatory pre-planning completeness gate                            |
| code-reuse-analysis   | phase-gate: plan (Phase 0.7.5)  | Check jira-mcp patterns for reuse before creating slack-mcp         |
| arch-decisions        | frontmatter: type=feature-major | Dual-mode architecture (webhook + MCP), package structure decisions |
| security-review       | keyword: credentials, secrets   | Slack tokens, webhook URLs, env var handling                        |
| error-handling        | keyword: error handling         | Fire-and-forget error isolation pattern (FR-006)                    |

## /implement phase (2026-03-28)

| Skill                    | Trigger                         | Reason                                                        |
| ------------------------ | ------------------------------- | ------------------------------------------------------------- |
| meta-skill-guide         | always                          | Universal dispatcher — applies to all phases                  |
| meta-context-optimize    | always                          | Context management — sessions may run long with 18 impl tasks |
| feature-capture-idea     | always                          | Idea capture — applies to all phases                          |
| workflow-verify-complete | always                          | Evidence-based completion before any "done" claim             |
| test-tdd                 | frontmatter: type=feature-major | TDD red-green-refactor for every module                       |
| error-handling           | keyword: error handling         | SlackClientError class, fire-and-forget patterns              |
| security-review          | keyword: credentials, secrets   | Token handling in config, webhook URL validation              |
| code-review              | frontmatter: type=feature-major | Mandatory review via T-FINAL code-review check                |
