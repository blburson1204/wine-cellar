# Skill Log

## /specify phase (2026-03-28)

| Skill                    | Trigger                            | Reason                                                |
| ------------------------ | ---------------------------------- | ----------------------------------------------------- |
| meta-skill-guide         | always                             | Universal dispatcher — checked manifest               |
| workflow-verify-complete | always                             | Will fire during implement/verify phases              |
| meta-context-optimize    | always                             | Available if session runs long                        |
| feature-capture-idea     | always                             | Available if ideas arise                              |
| test-tdd                 | frontmatter: type=feature-minor    | TDD discipline during implementation                  |
| error-handling           | keyword: error handling, fail-open | Spec heavily involves error scenarios                 |
| code-review              | frontmatter: type=feature-minor    | Mandatory before merge                                |
| code-reuse-analysis      | frontmatter: type=feature-minor    | Check existing hook patterns before creating new ones |
| doc-gate                 | frontmatter: type=feature-minor    | Post-feature documentation check                      |
| doc-update               | frontmatter: type=feature-minor    | May need to update CLAUDE.md hooks section            |

## /plan phase (2026-03-28)

| Skill                 | Trigger                        | Reason                                              |
| --------------------- | ------------------------------ | --------------------------------------------------- |
| spec-validate         | phase-gate: specify → plan     | Mandatory pre-plan completeness gate                |
| code-reuse-analysis   | phase-gate: plan (Phase 0.7.5) | Identified 6 reuse points from jira-mcp + slack-mcp |
| meta-skill-guide      | always                         | Manifest checked for plan phase                     |
| meta-context-optimize | always                         | Available if session runs long                      |

## /implement phase (2026-03-28)

| Skill                    | Trigger                            | Reason                                                 |
| ------------------------ | ---------------------------------- | ------------------------------------------------------ |
| test-tdd                 | frontmatter: type=feature-minor    | Write failing tests before implementation              |
| error-handling           | keyword: fail-open, error handling | Hook error paths throughout                            |
| workflow-verify-complete | always                             | Evidence required before claiming done                 |
| meta-context-optimize    | always                             | Multiple tasks — watch context across ralph iterations |
| code-review              | frontmatter: type=feature-minor    | Run before merge                                       |
