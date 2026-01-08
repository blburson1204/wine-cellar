# Next Session TODO

## Phase 1B Complete! 🎉

### What Was Accomplished (January 8, 2026)

**✅ Image Upload During Wine Creation**

Successfully implemented the ability to upload images when creating a new wine,
eliminating the inefficient workflow that required users to create the wine
first, then edit it to add an image.

**Implementation Details:**

- Added staged image state (`stagedImageFile`, `stagedImagePreview`) to hold
  selected image before wine creation
- Image upload UI now appears in both `add` and `edit` modes
- Sequential flow: Create wine → Upload image → Refresh parent wine list
- Live preview of selected image using `URL.createObjectURL()`
- Proper cleanup of blob URLs to prevent memory leaks
- Graceful error handling if image upload fails after wine creation

**Files Modified:**

- [WineDetailModal.tsx](apps/web/src/components/WineDetailModal.tsx) - Added
  image staging and upload flow for add mode
- [page.tsx](apps/web/src/app/page.tsx) - Updated `handleCreateWine` to return
  created `Wine` object

**Testing Results:**

- ✅ All 270 existing tests passing
- ✅ All 7 manual test scenarios passing:
  1. Create wine with image
  2. Replace staged image before saving
  3. Remove staged image before saving
  4. Cancel with staged image
  5. Validation still works
  6. File type validation
  7. File size validation

---

## Next Session Tasks

### Priority 1: Add Component Tests for Image Upload in Add Mode

**Test Coverage Needed:**

1. **Component Tests**
   ([WineDetailModal.test.tsx](apps/web/src/__tests__/components/WineDetailModal.test.tsx))
   - Should show image upload UI in add mode
   - Should stage image and show preview when file selected
   - Should allow replacing staged image before saving
   - Should allow deleting staged image before saving
   - Should validate file size (5MB max) in add mode
   - Should validate file type (JPEG, PNG, WebP) in add mode
   - Should upload staged image after creating wine
   - Should handle image upload failure gracefully (wine still created)
   - Should clean up blob URLs when modal closes
   - Should clear staged image when cancel is clicked

2. **Integration Tests** (Consider adding to image test file)
   - Should create wine with image in single flow
   - Should refresh wine list after creating wine with image
   - Should show newly created wine with image immediately in list

**Acceptance Criteria:**

- All new tests pass
- Test coverage for add-mode image upload matches edit-mode coverage
- No regression in existing 270 tests

---

### Future Enhancements (Backlog)

- Consider adding image cropping/rotation tools
- Add support for multiple images per wine
- Implement drag-and-drop for image upload

---

**Last Updated**: January 8, 2026
