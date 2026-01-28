---
parent: arch
name: TECH-DEBT-TRACKER
---

# Tech Debt Tracker

Template for tracking architectural debt in Retryvr.

## How to Use This File

1. **When you incur debt:** Add entry to "Active Debt"
2. **When you address debt:** Move to "Paid Off" with lessons learned
3. **Periodically review:** During planning, scan for debt that should be
   addressed

## Debt Categories

| Category                 | Description                                      | Example                             |
| ------------------------ | ------------------------------------------------ | ----------------------------------- |
| **Deliberate/Prudent**   | "We know this isn't ideal, shipping now matters" | Hardcoded config to ship feature    |
| **Deliberate/Reckless**  | "We don't have time" without plan                | Skipping tests for speed            |
| **Inadvertent/Prudent**  | "Now we know better"                             | Found better pattern after shipping |
| **Inadvertent/Reckless** | "What's separation of concerns?"                 | Discovered architectural flaw       |

---

## Active Debt

<!-- Template for new entries:

### DEBT-XXX: [Title]

**Incurred:** YYYY-MM-DD
**Category:** Deliberate/Prudent | Deliberate/Reckless | Inadvertent/Prudent | Inadvertent/Reckless
**Reason:** [Why we took on this debt]
**Location:** [Files/modules affected]
**Impact:** [What problems it causes]
**Interest:** [Ongoing cost—maintenance burden, slowdown, risk]
**Payoff Effort:** S/M/L/XL
**Trigger to Address:** [When this becomes urgent]
**Related Spec:** [If applicable]

---

-->

### DEBT-001: Job Dispatcher PM2 Process Management

**Incurred:** 2024-XX-XX (pre-existing) **Category:** Deliberate/Prudent
**Reason:** Quick path to background job processing without queue infrastructure
**Location:** `packages/job-dispatcher/`, EC2 instance **Impact:** Manual
deployment, no job queue visibility, restart required for config changes
**Interest:** Medium—manual deployment steps, debugging requires SSH **Payoff
Effort:** L **Trigger to Address:** When need multiple workers, job visibility
dashboard, or container deployment

---

### DEBT-002: Multi-Source Data Sync Sequential Processing

**Incurred:** 2024-XX-XX (current state) **Category:** Deliberate/Prudent
**Reason:** Simpler to build and debug than parallel processing **Location:**
`packages/job-dispatcher/src/jobs/` **Impact:** Total sync time is sum of all
sources **Interest:** Low—currently acceptable sync times **Payoff Effort:** M
**Trigger to Address:** When sync takes > 1 hour OR near-real-time freshness
required

---

### DEBT-003: Feature Toggle Database-Only (No Admin UI)

**Incurred:** 2024-XX-XX **Category:** Deliberate/Prudent **Reason:** Database
toggle works, UI is polish not necessity **Location:** Feature toggle
configuration **Impact:** Changing toggles requires database access
**Interest:** Low—infrequent changes **Payoff Effort:** M **Trigger to
Address:** When non-technical users need to manage feature flags

---

### DEBT-004: [Add your own]

---

## Paid Off

<!-- Template for resolved entries:

### DEBT-XXX: [Title]

**Resolved:** YYYY-MM-DD
**Original Impact:** [What problem it caused]
**Resolution:** [How it was addressed]
**Spec:** [If part of a specification]
**Lessons:** [What we learned]

---

-->

### DEBT-000: Example - Hardcoded Database URL

**Resolved:** 2024-01-15 **Original Impact:** Couldn't deploy to multiple
environments **Resolution:** Moved to SSM Parameter Store, docker-entrypoint.sh
fetches at runtime **Spec:** 063-docker-ecs-migration **Lessons:** Environment
config should be external from day one

---

## Debt Review Checklist

Use during planning sessions:

- [ ] Are any "trigger to address" conditions now true?
- [ ] Is any debt blocking current work?
- [ ] Has "interest" on any debt increased? (More complaints, more workarounds)
- [ ] Should any debt be accepted long-term? (Move to "Accepted Debt" section)
- [ ] Are we adding new debt faster than paying it off?

## Accepted Debt

Debt we've consciously decided to live with:

### Long-term manual deployment

**Why accept:** Solo developer, automation adds more maintenance than value
**Review when:** Team grows OR deployment frequency increases significantly

---

## Debt Metrics

Track these quarterly:

| Metric                      | Current | Target   |
| --------------------------- | ------- | -------- |
| Active debt items           | X       | <10      |
| High-interest items         | X       | 0        |
| Avg age of debt             | X days  | <90 days |
| Debt addressed this quarter | X       | 2+       |
