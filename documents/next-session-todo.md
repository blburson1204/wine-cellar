# Next Session TODO

## All Tests Complete! 🎉

### What Was Accomplished (January 20, 2026)

**✅ Phase 1B: Image Upload During Wine Creation** (January 8, 2026)

Successfully implemented the ability to upload images when creating a new wine,
eliminating the inefficient workflow that required users to create the wine
first, then edit it to add an image.

**✅ Component Tests for Image Upload in Add Mode** (January 20, 2026)

Added comprehensive test coverage for the image upload feature in add mode:

- ✅ Should show image upload UI in add mode
- ✅ Should stage image and show preview when file selected
- ✅ Should allow replacing staged image before saving
- ✅ Should allow deleting staged image before saving
- ✅ Should validate file size (5MB max) in add mode
- ✅ Should validate file type (JPEG, PNG, WebP) in add mode
- ✅ Should upload staged image after creating wine
- ✅ Should handle image upload failure gracefully (wine still created)
- ✅ Should clean up blob URLs when modal closes
- ✅ Should clear staged image when cancel is clicked

**✅ Comprehensive Coverage Improvement** (January 20, 2026)

Significantly improved test coverage across the web application:

- **WineTable.tsx**: 61.53% → 88.33% lines (+26.80%)
  - Added 37 new tests for keyboard navigation, focus management, favorites,
    hover effects, null value display, and additional wine colors

- **page.tsx**: 54.09% → 83.52% lines (+29.43%)
  - Added 12 new tests for sorting, favorite toggle, wine updates, delete
    confirmation, and bottle count display

- **Total Tests**: 270 → 343 (+27% increase)
- **All 343 tests passing** ✅

---

## Current Status

All planned tests have been implemented. The wine cellar application now has
comprehensive test coverage.

### Test Summary

- **API Tests**: 144 tests passing
- **Web Tests**: 199 tests passing
- **Total**: 343 tests passing

### Coverage Metrics

- **Web Overall**: 78.85% statements, 80.16% lines
- **page.tsx**: 83.52% lines
- **WineTable.tsx**: 88.33% lines
- **WineFilters.tsx**: 96.96% lines
- **WineDetailModal**: 65.34% lines (50 tests combined)

---

## Future Enhancements (Backlog)

### Phase 2: Thumbnails & Table Images

- Generate 200x200px thumbnails on upload
- Display thumbnails in wine table
- Implement lazy loading for thumbnails

### Phase 3: Production Storage (AWS)

- Implement S3StorageService
- Set up CloudFront CDN
- Configure presigned URLs

### Phase 4: Advanced Features

- Image cropping/rotation tools
- Multiple images per wine
- Drag-and-drop upload
- OCR for wine label reading

---

## Next Session: Install Bryan's Framework Components

### Status: READY FOR INSTALLATION

Framework evaluation complete (January 21, 2026). Selective adoption plan
documented.

**Full plan with all details**:
[bryan-framework-adoption-plan.md](bryan-framework-adoption-plan.md)

### Quick Summary

**Components to Install (Tier 1)**:

| Type       | Components                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Skills (7) | test-driven-development, verification-before-completion, systematic-debugging, code-review-quality, rca, accessibility, security-review |
| Agents (3) | code-reviewer, test-analyzer, auto-fixer                                                                                                |
| Hooks (1)  | pre-edit-verify (optional)                                                                                                              |

**Existing Skill Rename**:

- `code-review-standards/` → `coding-standards/` (it's a reference doc, not a
  workflow)

**Skipped (Enterprise Overhead)**:

- Full SpecKit commands (consider later for larger features)
- Data sensitivity classification, portal/permission layers
- AWS-specific skills, Ralph looping, compaction hooks

### Installation Checklist

1. [ ] Rename `.claude/skills/code-review-standards` →
       `.claude/skills/coding-standards`
2. [ ] Copy 7 skills from `_bg_template/claude/skills/`
3. [ ] Create `.claude/agents/` directory
4. [ ] Copy 3 agents from `_bg_template/claude/agents/`
5. [ ] (Optional) Set up pre-edit-verify hook
6. [ ] Verify installation structure
7. [ ] Test each component works
8. [ ] Decide whether to keep or remove `_bg_template/`

### Key "Iron Laws" to Remember

| Skill        | Rule                                                       |
| ------------ | ---------------------------------------------------------- |
| TDD          | "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST"          |
| Verification | "NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE" |
| Debugging    | "NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST"          |

### GitHub Action Compatibility

No changes needed. Framework catches issues during development; GitHub Action is
the CI safety net.

---

**Last Updated**: January 21, 2026
