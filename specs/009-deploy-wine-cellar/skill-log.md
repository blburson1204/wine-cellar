# Skill Log

## /specify phase (2026-03-29)

| Skill                 | Trigger                       | Reason                                                               |
| --------------------- | ----------------------------- | -------------------------------------------------------------------- |
| meta-skill-guide      | always                        | Universal dispatcher — applies to all phases                         |
| feature-capture-idea  | always                        | Async idea capture during any work                                   |
| meta-context-optimize | always                        | Context management for long sessions                                 |
| arch-decisions        | keyword: architecture         | Deployment architecture decisions (Vercel vs AWS, storage provider)  |
| v3-adoption-advisory  | keyword: deployment, AWS      | Review Bryan Framework v3 Tier 2/3 for deployment-related components |
| security-review       | keyword: secrets, credentials | Production secrets management, env var security                      |
| spec-validate         | phase-gate: specify→plan      | MANDATORY before /plan begins                                        |
| code-reuse-analysis   | phase-gate: plan              | Check existing patterns (IStorageService already exists)             |

## /plan phase (2026-03-29)

| Skill                 | Trigger                        | Reason                                                                  |
| --------------------- | ------------------------------ | ----------------------------------------------------------------------- |
| meta-skill-guide      | always                         | Universal dispatcher                                                    |
| feature-capture-idea  | always                         | Async idea capture during any work                                      |
| meta-context-optimize | always                         | Context management for long sessions                                    |
| spec-validate         | phase-gate: specify→plan       | MANDATORY gate before planning begins                                   |
| code-reuse-analysis   | phase-gate: plan (Phase 0.7.5) | IStorageService interface, storage factory, health check — all reusable |
| security-review       | keyword: secrets, credentials  | Production env vars, Cloudinary API keys, DATABASE_URL security         |
| arch-decisions        | keyword: architecture          | Storage provider abstraction, deployment architecture portability       |

## /implement phase (2026-03-29)

| Skill                    | Trigger                       | Reason                                                                |
| ------------------------ | ----------------------------- | --------------------------------------------------------------------- |
| meta-skill-guide         | always                        | Universal dispatcher                                                  |
| workflow-verify-complete | always                        | Evidence-based completion — fires before any "done" claim             |
| feature-capture-idea     | always                        | Async idea capture during any work                                    |
| test-tdd                 | keyword: implement, TDD       | CloudinaryStorageService + auth middleware require red-green-refactor |
| error-handling           | keyword: error handling       | Cloudinary failure modes, Basic Auth rejection, env var validation    |
| security-review          | keyword: secrets, credentials | Cloudinary API keys, AUTH_PASSWORD handling in middleware             |
| db-prisma                | keyword: prisma, database     | Prisma migrations against Railway PostgreSQL                          |
