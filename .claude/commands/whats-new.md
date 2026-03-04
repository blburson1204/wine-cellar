---
model: sonnet
description:
  Discover latest Claude Code features with dates, links, and relevancy ratings
argument-hint: (--days N) (--detailed)
allowed-tools: Read, WebSearch, WebFetch
---

# Purpose

Discover and rate the latest Claude Code features, updates, and breaking changes
from official sources. Spawns parallel research agents to gather updates from
changelogs, GitHub releases, and Anthropic blog posts, then synthesizes results
with relevancy ratings specific to the Wine Cellar platform workflow.

**Category**: Research **Estimated Duration**: 30-60 seconds **Prerequisites**:
None (uses web search and fetch)

## Variables

- `--days N` - Look back N days (default: 30)
- `--detailed` - Include more technical details per feature

## Sources

This command researches external sources only:

| Source          | Purpose                                                          |
| --------------- | ---------------------------------------------------------------- |
| GitHub Releases | https://github.com/anthropics/claude-code/releases               |
| Changelog       | https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md |
| Official Docs   | https://code.claude.com/docs/en/                                 |
| Anthropic Blog  | https://anthropic.com, https://claude.com/blog                   |

## Instructions

### Relevancy Rating System

Each update receives a rating based on two factors:

**Impact Score (1-5)**

- **5 - Critical**: Breaking change or major new capability
- **4 - High**: Significant productivity improvement
- **3 - Medium**: Useful enhancement
- **2 - Low**: Minor improvement
- **1 - Minimal**: Bug fix or cosmetic change

**Project Relevance (1-5)** Based on Wine Cellar's stack and workflow:

- **5 - Direct Hit**: Affects custom skills, agents, hooks, SpecKit, or TDD
  workflow
- **4 - High**: Affects TypeScript, Next.js/Express development
- **3 - Medium**: General developer experience improvement
- **2 - Low**: Feature we don't currently use
- **1 - N/A**: Unrelated to our workflow

**Combined Rating** `[Impact + Relevance] / 2` displayed as:

- **MUST READ** (4.5-5.0): Stop what you're doing and review
- **IMPORTANT** (3.5-4.4): Review before next major task
- **NOTABLE** (2.5-3.4): Good to know, review when convenient
- **FYI** (1.5-2.4): Skim if interested
- **SKIP** (1.0-1.4): Not relevant to us

### Step 1: Announce and Spawn Parallel Research Agents

Announce: "Researching latest Claude Code updates from multiple sources..."

Spawn **3 parallel agents** using the Agent tool (all in a single message):

**Agent 1: Official Changelog Deep Dive**

```
subagent_type: claude-code-guide
prompt: |
  Search for the most recent Claude Code changelog entries and release notes.

  CRITICAL REQUIREMENTS:
  1. Extract EXACT dates (e.g., "March 1, 2026" not "March 2026")
  2. Include direct links to each changelog entry or release
  3. For GitHub releases, link to the specific release tag

  Focus on:
  - New tools or tool improvements
  - New agent types or agent capabilities
  - SDK updates (TypeScript and Python)
  - CLI improvements
  - Hook system changes
  - Skills system changes

  Return findings as structured data:
  - Version number (e.g., v2.0.74)
  - Exact release date (YYYY-MM-DD format)
  - Feature name
  - One-sentence description
  - Direct URL to source
  - Impact level (critical/high/medium/low/minimal)
```

**Agent 2: GitHub Releases with Exact Dates**

```
subagent_type: general-purpose
prompt: |
  Research Claude Code releases on GitHub.

  Use WebFetch on these URLs:
  1. https://github.com/anthropics/claude-code/releases
  2. https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md

  CRITICAL: Extract the EXACT release date for each version.

  For each release, provide:
  - Version: v2.0.XX
  - Date: YYYY-MM-DD
  - Link: https://github.com/anthropics/claude-code/releases/tag/v2.0.XX
  - Key changes (bullet points)
  - Breaking changes (if any)

  Return chronologically sorted (newest first).
```

**Agent 3: Anthropic Blog/News with Permalinks**

```
subagent_type: general-purpose
prompt: |
  Search for recent Anthropic announcements about Claude Code.

  Use WebSearch with queries like:
  - "Claude Code release announcement 2026"
  - "site:anthropic.com Claude Code"

  For each result, use WebFetch to get:
  - Exact publication date (YYYY-MM-DD)
  - Article title
  - Permanent URL
  - Key announcements

  IMPORTANT: Only include articles with verifiable dates and working URLs.
```

### Step 2: Synthesize Results

After all agents complete:

1. **Deduplicate** findings across sources
2. **Verify dates** - reject entries without specific dates
3. **Verify links** - ensure each entry has a direct URL
4. **Sort by date** (newest first)
5. **Rate each item** using the relevancy system above

### Step 3: Find Documentation Links

For each feature identified, search for corresponding documentation:

**Documentation Base URL:** `https://code.claude.com/docs/en/`

**Verified Documentation Map:**

| Feature           | Documentation URL                               |
| ----------------- | ----------------------------------------------- |
| Overview          | https://code.claude.com/docs/en/overview        |
| Sub-agents        | https://code.claude.com/docs/en/sub-agents      |
| Skills            | https://code.claude.com/docs/en/skills          |
| Hooks (Guide)     | https://code.claude.com/docs/en/hooks-guide     |
| Hooks (Reference) | https://code.claude.com/docs/en/hooks           |
| MCP               | https://code.claude.com/docs/en/mcp             |
| Memory/CLAUDE.md  | https://code.claude.com/docs/en/memory          |
| CLI Reference     | https://code.claude.com/docs/en/cli-reference   |
| Settings          | https://code.claude.com/docs/en/settings        |
| VS Code           | https://code.claude.com/docs/en/vs-code         |
| GitHub Actions    | https://code.claude.com/docs/en/github-actions  |
| Troubleshooting   | https://code.claude.com/docs/en/troubleshooting |

### Step 4: Present Summary

## Report Format

```markdown
## Claude Code: What's New

_Research completed: [YYYY-MM-DD HH:MM UTC]_

### Quick Summary

- X updates in the last N days
- Y rated MUST READ or IMPORTANT for Wine Cellar

---

### Updates (Newest First)

#### MUST READ

| Date | Version | Update | Why It Matters | Links          |
| ---- | ------- | ------ | -------------- | -------------- | ----------- |
| ...  | ...     | ...    | ...            | [Release](url) | [Docs](url) |

#### IMPORTANT

| Date | Version | Update | Why It Matters | Links |
| ---- | ------- | ------ | -------------- | ----- |

#### NOTABLE

| Date | Version | Update | Why It Matters | Links |
| ---- | ------- | ------ | -------------- | ----- |

#### FYI / SKIP

<brief list with release links only>

---

### Breaking Changes (Action Required)

| Date | Version | Change | Migration Steps | Links |
| ---- | ------- | ------ | --------------- | ----- |

---

### Relevancy Notes

Brief explanation of why certain items were rated high/low for Wine Cellar
specifically.
```

### Known Corrections

When rating hook-related updates, apply these verified facts:

| Claim                                           | Reality                                                                                                                                                     | Date Verified |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Stop hooks support `hookSpecificOutput` wrapper | **FALSE.** Stop hooks use top-level `{"decision":"approve"\|"block","reason":"..."}`.                                                                       | 2026-02-22    |
| Stop hook `decision` values are `allow`/`block` | **FALSE for Stop hooks.** Stop hooks use `"approve"` / `"block"`. PreToolUse hooks use `"allow"` / `"deny"` inside `hookSpecificOutput.permissionDecision`. | 2026-02-22    |

### Error Handling

- If any agent fails, continue with results from successful agents
- If all agents fail, fall back to direct WebSearch
- **Reject entries without specific dates**
- **Reject entries without direct links**
- Always provide partial results rather than failing completely

### Related Commands

- `/help` - General Claude Code help
- `claude-code-guide` agent - Deep dive on specific features
