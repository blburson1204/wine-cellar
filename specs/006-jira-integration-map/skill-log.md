# Skill Log

## /specify phase (2026-02-12)

| Skill                    | Trigger                                             | Reason                                                                                          |
| ------------------------ | --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| meta-skill-guide         | always                                              | Universal dispatcher — applies to all phases                                                    |
| workflow-verify-complete | always                                              | Evidence-based completion — applies at implement/verify                                         |
| meta-context-optimize    | always                                              | Context management — relevant for long sessions                                                 |
| feature-capture-idea     | always                                              | Idea capture — available throughout                                                             |
| coding-standards         | always                                              | Code style conventions — applies at implement                                                   |
| arch-decisions           | frontmatter: type=feature-major                     | Major feature requires architectural decisions (MCP server design, sync strategy, data mapping) |
| workflow-brainstorm      | frontmatter: type=feature-major                     | New integration concept benefits from Socratic design refinement                                |
| code-reuse-analysis      | frontmatter: type=feature-major                     | Check for existing MCP patterns before creating new ones                                        |
| test-tdd                 | frontmatter: type=feature-major                     | TDD discipline for implementation phase                                                         |
| security-review          | keyword: credentials, API token, authentication     | External API auth and credential management require security review                             |
| error-handling           | keyword: error handling, error scenarios            | Comprehensive error handling for external API integration                                       |
| testing                  | keyword: test strategy, integration test, unit test | Test strategy defined at spec level                                                             |
| doc-gate                 | frontmatter: type=feature-major                     | New MCP server component needs documentation                                                    |
| doc-update               | keyword: new service, API change                    | New MCP server constitutes a new service                                                        |

### Skills NOT triggered (informational)

| Skill                  | Why not                               |
| ---------------------- | ------------------------------------- |
| ui-accessibility       | ui_changes=none, no UI keywords       |
| ui-design              | ui_changes=none, backend-only feature |
| debug-systematic       | Not a bugfix                          |
| debug-rca              | Not a bugfix                          |
| db-prisma              | No database/schema changes            |
| security-defense-depth | Not a bugfix                          |

## /plan phase (2026-02-12)

| Skill                 | Trigger                                                           | Reason                                                                |
| --------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| spec-validate         | phase-gate: specify → plan                                        | MANDATORY pre-planning spec completeness gate                         |
| code-reuse-analysis   | phase-gate: plan Phase 0.7.5 + frontmatter: type=feature-major    | Check for existing patterns before creating new MCP server components |
| arch-decisions        | frontmatter: type=feature-major + keyword: architecture, approach | MCP server placement, auth layer design, sync architecture            |
| testing               | keyword: test strategy, mocking strategy, integration test        | Test approach for mocked Jira API and MCP protocol compliance         |
| security-review       | keyword: credentials, API token, authentication                   | Credential storage, auth layer, environment variable handling         |
| meta-skill-guide      | always                                                            | Universal dispatcher                                                  |
| meta-context-optimize | always                                                            | Context management for long planning session                          |
