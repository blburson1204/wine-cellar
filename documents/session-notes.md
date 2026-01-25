# Next Session TODO

## Bryan's Framework - INSTALLED

### Status: COMPLETE

Framework installation completed January 24, 2026. All components installed and
validated via SpecKit workflow test.

**Commit**: `a9cf048` - feat: adopt claude code framework (speckit lite)

### What Was Installed

| Type         | Count | Components                                                                                                                                                 |
| ------------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skills       | 8     | using-superpowers, test-driven-development, verification-before-completion, systematic-debugging, code-review-quality, rca, accessibility, security-review |
| Agents       | 3     | code-reviewer, test-analyzer, auto-fixer                                                                                                                   |
| SpecKit Lite | 4     | /specify, /plan, /tasks, /implement commands + simplified templates                                                                                        |

**Also**:

- Renamed `code-review-standards/` → `coding-standards/`
- Simplified templates (removed enterprise sections)
- Customized constitution for wine-cellar

### Installation Checklist (All Complete)

1. [x] Rename `.claude/skills/code-review-standards` →
       `.claude/skills/coding-standards`
2. [x] Copy 8 skills from `_bg_template/claude/skills/`
3. [x] Create `.claude/agents/` directory
4. [x] Copy 3 agents from `_bg_template/claude/agents/`
5. [x] Create `.claude/commands/` directory
6. [x] Copy 4 SpecKit commands (specify, plan, tasks, implement)
7. [x] Copy SpecKit infrastructure to `.specify/`
8. [x] Create `specs/` directory for feature specifications
9. [x] Simplify `.specify/templates/spec-template.md` (remove enterprise
       sections)
10. [x] Customize `.specify/memory/constitution.md` for wine-cellar
11. [x] Verify installation structure
12. [x] Test SpecKit with `/specify "test feature"`
13. [x] Clean up test spec after validation

### Key "Iron Laws" to Remember

| Skill        | Rule                                                       |
| ------------ | ---------------------------------------------------------- |
| Superpowers  | "CHECK FOR SKILLS FIRST - EVEN 1% CHANCE MEANS USE IT"     |
| TDD          | "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST"          |
| Verification | "NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE" |
| Debugging    | "NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST"          |

### SpecKit Workflow

```
/specify "feature description"  →  Creates spec.md
/plan                           →  Creates plan.md
/tasks                          →  Creates tasks.json
/implement                      →  Executes tasks
```

### Next Steps

- Remove `_bg_template/` directory (optional - can keep for reference)
- Use `/specify "mobile responsive design"` to test with a real feature
- Or proceed with other wine-cellar development using the new skills

---

**Last Updated**: January 24, 2026
