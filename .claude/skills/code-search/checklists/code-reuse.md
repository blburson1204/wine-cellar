# Code Reuse & Integration Checklist

## Reuse Analysis (LSP-First)

- [ ] Use `mcp__cclsp__workspaceSymbol` to find existing implementations
- [ ] Check CLAUDE.md for documented patterns
- [ ] Evaluate REUSE vs EXTEND vs DUPLICATE
- [ ] Justify DUPLICATE decisions

## Integration Verification

- [ ] Use `mcp__cclsp__find_definition` for implementation location
- [ ] Use `mcp__cclsp__find_references` for caller analysis
- [ ] Cross-validate with subagent search
- [ ] Document caller count matches

## Pattern Discovery

- [ ] Search for similar functionality
- [ ] Check existing service modules
- [ ] Review utility functions
- [ ] Identify sharable code

## Evidence Requirements

- [ ] Paste LSP output (no summaries)
- [ ] Document search queries used
- [ ] List alternatives evaluated
- [ ] Justify final decision

## Code Quality

- [ ] No duplicated logic
- [ ] Shared code in appropriate location
- [ ] Dependencies injected (not hardcoded)
- [ ] Types exported for reuse

## Documentation

- [ ] Reusable patterns documented in CLAUDE.md
- [ ] API contracts defined
- [ ] Usage examples provided
- [ ] Breaking changes noted
