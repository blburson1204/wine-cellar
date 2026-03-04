---
name: writing-clearly
description:
  Use when writing any prose humans will read — documentation, commit messages,
  error messages, specs, plans, reviews, UI copy, reports, or explanations.
  Applies Strunk's composition rules and eliminates AI anti-patterns for clear,
  forceful writing.
---

# Writing Clearly and Concisely

## Overview

Write with clarity and force. This skill covers what to do (Strunk) and what not
to do (AI anti-patterns).

## When to Use

Use whenever you write prose for humans:

- Documentation, README files, technical explanations
- Commit messages, pull request descriptions
- Error messages, UI copy, help text, code comments
- Specs, plans, reviews, summaries, reports
- Editing or revising any human-facing text

**If you are writing sentences for a human to read, use this skill.**

## Auto-Routing to Reference Files

### Load `elements-of-style/03-elementary-principles-of-composition.md` when:

- Writing or editing any prose (most common use case)
- Need rules for active voice, concision, positive form, concrete language
- Copyediting drafts for clarity and force

### Load `elements-of-style/02-elementary-rules-of-usage.md` when:

- Grammar or punctuation questions arise
- Possessives, comma rules, sentence structure issues

### Load `elements-of-style/04-a-few-matters-of-form.md` when:

- Formatting standards for headings, quotations, references, numerals

### Load `elements-of-style/05-words-and-expressions-commonly-misused.md` when:

- Word choice questions (less vs. fewer, like vs. as, etc.)
- Detecting hackneyed or misused expressions

### Load `signs-of-ai-writing.md` when:

- Reviewing output for AI tells
- Editing text that reads as machine-generated
- Need the comprehensive anti-pattern blocklist

## Limited Context Strategy

When token budgets are tight:

1. Write your draft using judgment
2. Dispatch a subagent with the draft and the relevant section file
3. Have the subagent copyedit and return the revision

Loading a single section (~1,000-4,500 tokens) instead of the full reference
saves context.

---

## Elements of Style: Core Rules

William Strunk Jr.'s _The Elements of Style_ (1918) teaches clear writing and
ruthless cutting.

### Elementary Rules of Usage (Grammar/Punctuation)

1. Form possessive singular by adding 's
2. Use comma after each term in series except last
3. Enclose parenthetic expressions between commas
4. Comma before conjunction introducing co-ordinate clause
5. Do not join independent clauses by comma
6. Do not break sentences in two
7. Participial phrase at beginning refers to grammatical subject

### Elementary Principles of Composition

8. One paragraph per topic
9. Begin paragraph with topic sentence; end in conformity with beginning
10. **Use active voice**
11. **Put statements in positive form**
12. **Use definite, specific, concrete language**
13. **Omit needless words**
14. Avoid succession of loose sentences
15. Express co-ordinate ideas in similar form
16. **Keep related words together**
17. Keep to one tense in summaries
18. **Place emphatic words at end of sentence**

### Reference Files

For complete explanations with examples, load the relevant section:

| Section                                      | File                                                             | ~Tokens |
| -------------------------------------------- | ---------------------------------------------------------------- | ------- |
| Grammar, punctuation, comma rules            | `elements-of-style/02-elementary-rules-of-usage.md`              | 2,500   |
| Paragraph structure, active voice, concision | `elements-of-style/03-elementary-principles-of-composition.md`   | 4,500   |
| Headings, quotations, formatting             | `elements-of-style/04-a-few-matters-of-form.md`                  | 1,000   |
| Word choice, common errors                   | `elements-of-style/05-words-and-expressions-commonly-misused.md` | 4,000   |

**Most tasks need only `03-elementary-principles-of-composition.md`** — it
covers active voice, positive form, concrete language, and omitting needless
words.

---

## AI Writing Anti-Patterns

LLMs regress toward statistical means, producing generic, inflated prose.
Eliminate these patterns from all output.

### Puffery Words — Do Not Use

pivotal, crucial, vital, testament, enduring legacy, cornerstone, paramount,
indispensable, transformative

### Empty Gerund Phrases — Do Not Use

ensuring reliability, showcasing features, highlighting capabilities,
underscoring importance, fostering collaboration, driving innovation

### Promotional Adjectives — Do Not Use

groundbreaking, seamless, robust, cutting-edge, state-of-the-art, world-class,
best-in-class, holistic, synergistic

### Overused AI Vocabulary — Do Not Use

delve, leverage, multifaceted, foster, realm, tapestry, landscape, nuanced,
intricate, harness, empower, bolster, spearhead, streamline, utilize (use
"use"), facilitate, optimize (when vague), align with, underscore

### Structural Anti-Patterns — Avoid

- Excessive bullet lists where prose works better
- Bold on every other word
- Rule-of-three adjective clusters ("innovative, dynamic, and forward-thinking")
- "Despite challenges" formula sections
- Conclusions that restate the introduction
- Headers with colons followed by "1. **Bold:** text" formatting
- Em dash overuse in formulaic, punched-up patterns

### The Fix

Be specific, not grandiose. Say what it actually does. Replace abstraction with
concrete detail.

| Instead of                           | Write                                |
| ------------------------------------ | ------------------------------------ |
| "a robust solution"                  | what it does, concretely             |
| "leveraging cutting-edge technology" | name the technology and what it does |
| "ensuring seamless integration"      | describe how the parts connect       |
| "a pivotal development"              | state the actual consequence         |
| "fostering innovation"               | name the specific action taken       |

For the comprehensive research on why these patterns occur and how editors
detect them, see `signs-of-ai-writing.md`.

---

## Quick Self-Check

Before finalizing any prose:

1. **Active voice?** — Subject acts. Not "was implemented by" but "we
   implemented."
2. **Positive form?** — State what is, not what is not. Not "not uncommon" but
   "common."
3. **Concrete language?** — Specific detail, not vague generality.
4. **Needless words cut?** — Every word earns its place.
5. **No AI puffery?** — No pivotal, robust, seamless, leverage, delve, tapestry.
6. **Emphatic ending?** — The sentence ends on the word that matters most.
