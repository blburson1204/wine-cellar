---
name: arch-decisions
description:
  Use when designing new features, evaluating technical approaches, making
  build-vs-buy decisions, planning data sync strategies, or assessing frontend
  architecture tradeoffs. Surfaces options with explicit tradeoffs for solo
  developer context.
---

# Software Architecture Skill

Pragmatic architectural guidance for a solo developer context. **The best
architecture is the simplest one you can actually maintain.**

## The Five Questions

Ask BEFORE any architectural recommendation:

1. **What problem are we actually solving?** (Not the assumed problem)
2. **What's the simplest thing that could work?**
3. **What are we trading off?** (Always a tradeoff)
4. **Can we reverse this decision later?** At what cost?
5. **Will I understand this in 6 months?**

## Consultation Modes

| Mode                    | Use When                                               |
| ----------------------- | ------------------------------------------------------ |
| **Design Review**       | Evaluating proposed approach before implementation     |
| **Problem Exploration** | Understanding problem space before proposing solutions |
| **Decision Support**    | Comparing options with explicit tradeoffs              |
| **Debt Assessment**     | Identifying and prioritizing architectural debt        |

## Quick Tradeoff Dimensions

| Dimension     | Question                                             |
| ------------- | ---------------------------------------------------- |
| Complexity    | Does this add moving parts I'll need to debug?       |
| Reversibility | Can I undo this in a sprint?                         |
| Maintenance   | Will this need attention when I'm focused elsewhere? |
| Familiarity   | Do I already know this technology?                   |
| Debuggability | Can I understand failures at 2am?                    |

## Solo Developer Principles

1. **"Boring" is a compliment** - PostgreSQL, Express, Next.js work.
2. **Monolith is fine** - Microservices solve problems you don't have.
3. **Complexity is a cost** - Every abstraction has carrying cost.
4. **Optimize for change** - Requirements will shift.
5. **Production teaches** - Ship, observe, iterate.
6. **Document decisions** - Future-you needs WHY, not just what.
7. **The best migration is the one you don't do**

## Red Flags (Stop and Reconsider)

- "We might need this later" - YAGNI
- "Enterprise best practice" - You're not enterprise scale
- Multiple AWS services chained for simple task
- Building features for problems that haven't occurred
- "Real-time processing" for data checked weekly

## Reference Files

- `DECISION-FRAMEWORK.md` - ADR template and evaluation
- `DATA-SYNC-PATTERNS.md` - Multi-source sync, rate limits
- `FRONTEND-ARCHITECTURE.md` - State management, performance
- `SCALABILITY-GUIDE.md` - When/how to scale
