# Figma Make Integration — Draft Plan

**Created**: February 17, 2026 **Status**: DRAFT — for MedGeo leadership
discussion (Thursday) **Context**: MedGeo is evaluating Figma Make as the
design-to-code tool instead of Lovable. Bryan's Framework v3 already includes a
production-grade Figma sync system that we can adapt.

---

## Executive Summary

Figma Make + the official Figma MCP server provide a stronger bidirectional
integration path than Lovable. Bryan's Framework v3 already solved most of the
hard problems — an 11-phase sync pipeline, design token auditing, and layout
cleanup automation. We can adapt rather than build from scratch.

**Key advantage over Lovable**: Figma Make keeps design and code in a single
ecosystem. Lovable generates code from prompts (separate from design files);
Figma Make generates from the actual designs, maintaining a direct link between
what designers create and what developers implement.

---

## What Figma Make Gives Us

### Design → Code (strong, mature)

- Designers work in Figma as usual
- Figma Make generates interactive prototypes and working code from designs
- The official Figma MCP server (13 tools) exposes design context, tokens,
  component mappings, and screenshots to AI coding tools
- Code Connect maps Figma components to our actual codebase components

### Code → Design (emerging, more limited)

- `generate_figma_design` — pushes UI designs as layers back into Figma (Claude
  Code remote mode only)
- `add_code_connect_map` — registers code components with Figma nodes
- `create_design_system_rules` — generates rules for design-to-code consistency
- Community MCP implementations offer fuller write-back for automation scenarios

---

## What Bryan Already Built (Framework v3)

### 1. Figma Sync Orchestrator — 11-Phase Pipeline

A complete agent that syncs Figma exports into a Next.js codebase:

| Phase | Purpose                                                                 |
| ----- | ----------------------------------------------------------------------- |
| 0     | Pre-flight checks (auth, mapping file, repo access)                     |
| 1     | Mapping reconciliation (three-way comparison, auto-map high-confidence) |
| 2     | Diff detection (what changed since last sync)                           |
| 3     | Change categorization (NEW, CHANGED, DELETED)                           |
| 4     | Local divergence detection (don't clobber dev patches)                  |
| 5     | File sync (download and place files per mapping)                        |
| 6     | Capability analysis (translate file changes to product language)        |
| 7     | Post-sync validation (TypeScript, deps, route integrity)                |
| 8     | Auto-generate SpecKit spec from changes                                 |
| 9     | Update mapping metadata                                                 |
| 10    | Run SpecKit pipeline (clarify → plan → tasks)                           |
| 11    | Structured report for review                                            |

**Architecture**: Uses a GitHub repo as intermediary — Figma Make exports push
to GitHub, orchestrator pulls from there. This gives auditability, CI/CD hooks,
and decoupling.

### 2. UI Integration Skill

Handles Figma export cleanup:

- Fixes versioned/Figma-specific imports
- Adds framework directives (`'use client'`)
- Wires navigation handlers
- Responsive layout fixes (grid, scroll, overflow, viewport)
- Visual comparison workflow (Figma screenshot vs localhost)

### 3. Design Token Auditor

Scans code for design system compliance:

- P1: Raw hex colors in code (critical)
- P2: Arbitrary Tailwind values (high)
- P3: Missing component library imports (medium)
- P4: Custom layouts bypassing design shell (low)
- Produces compliance score and merge readiness verdict

---

## Adoption Approach

### Phase 1: Foundation (Low effort)

- [ ] Install and configure the official Figma MCP server
- [ ] Set up Code Connect between MedGeo's component library and Figma
- [ ] Create a `figma-mapping.json` config for MedGeo's project structure
- [ ] Replace the Lovable TODO item with Figma Make integration

### Phase 2: Sync Pipeline (Medium effort — adapt from v3)

- [ ] Adapt the `figma-sync-orchestrator` agent for MedGeo's architecture
  - Update file paths and project structure references
  - Configure GitHub intermediary repo for Figma Make exports
  - Adjust convention mappings for MedGeo's routing/component patterns
- [ ] Adapt the `ui-figma-integrate` skill
  - Update import fix patterns for MedGeo's package ecosystem
  - Update navigation handler patterns for MedGeo's router setup
  - Update layout fix patterns for MedGeo's design system

### Phase 3: Design System Compliance (Medium effort — adapt from v3)

- [ ] Adapt the `design-auditor` agent with MedGeo's design tokens
- [ ] Create the `/audit-design` command for pre-merge checks
- [ ] Integrate into CI/CD as a gate (optional)

### Phase 4: Bidirectional Sync (Higher effort — new work)

- [ ] Evaluate Figma MCP write-back tools for pushing code changes to Figma
- [ ] Evaluate community MCP implementations for fuller write-back
- [ ] Define workflows for when code-initiated changes should update designs

---

## Decision Points for Leadership

1. **GitHub intermediary vs direct MCP** — Bryan's approach (Figma → GitHub repo
   → sync) adds a review step and CI/CD integration point. Direct MCP is faster
   but less auditable. Recommendation: start with GitHub intermediary.

2. **Scope of bidirectional sync** — Design → code is mature and ready. Code →
   design is useful but more limited. Focus on design → code first?

3. **Design system enforcement** — The token auditor can be a soft gate
   (advisory) or hard gate (blocks merge). Which fits MedGeo's workflow?

4. **SpecKit integration** — The orchestrator auto-generates specs from design
   changes. This means design updates flow into the same task management
   pipeline as feature work. Worth adopting?

---

## Comparison: Figma Make vs Lovable

| Dimension        | Figma Make                                           | Lovable                                       |
| ---------------- | ---------------------------------------------------- | --------------------------------------------- |
| Design source    | Works FROM Figma designs directly                    | Generates from prompts (separate from design) |
| Bidirectional    | Emerging write-back via MCP                          | No design sync — code generation only         |
| Design system    | Code Connect + MCP preserves tokens                  | No formal token/component mapping             |
| Existing tooling | Bryan's v3 framework (11-phase pipeline)             | Nothing built yet                             |
| AI integration   | Official MCP server (13 tools)                       | Standalone tool                               |
| Auditability     | GitHub intermediary + mapping file                   | Generated code, no sync history               |
| Team workflow    | Designers stay in Figma, devs get structured exports | Devs use Lovable separately from design team  |

---

## Risk & Effort Estimate

| Phase                | Effort | Risk   | Notes                                         |
| -------------------- | ------ | ------ | --------------------------------------------- |
| 1: Foundation        | Low    | Low    | Standard Figma MCP setup, well-documented     |
| 2: Sync Pipeline     | Medium | Low    | Adapting existing code, not building new      |
| 3: Design Compliance | Medium | Low    | Token substitution + config changes           |
| 4: Bidirectional     | Higher | Medium | Write-back APIs are newer, less battle-tested |

---

## Next Steps

- [ ] Discuss at Thursday leadership meeting
- [ ] If approved, add to TODO.md backlog (replace Lovable line item)
- [ ] Decide on phasing (all 4 phases or start with 1-2)
- [ ] Coordinate with Bryan on accessing v3 framework source for adaptation
