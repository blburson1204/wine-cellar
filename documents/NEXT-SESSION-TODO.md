# Next Session TODO

## Phase 1B - Image Upload Enhancement

### UX Improvement: Add Image Upload to "Add Wine" Modal

**Current Workflow (Inefficient):**

1. User clicks "Add Wine"
2. Fills in wine details
3. Saves wine
4. Clicks on wine to view details
5. Clicks "Edit"
6. NOW can upload image

**Desired Workflow:**

1. User clicks "Add Wine"
2. Fills in wine details **AND uploads image in same form**
3. Saves wine (creates wine + uploads image)

### Implementation Approach

**Option 1: Sequential** (Recommended for simplicity)

- Save wine first (to get wine ID)
- Then upload image using the new wine ID
- Return complete wine object with imageUrl

**Option 2: Staged Upload**

- Stage the image in component state
- When user saves, create wine then upload image
- More complex but single transaction feel

### Files to Modify

1. **[WineDetailModal.tsx](apps/web/src/components/WineDetailModal.tsx)**
   - Show image upload UI when `mode === 'add'`
   - Handle image in create flow
   - Update `onCreate` to handle image upload

2. **Tests to Add:**
   - Component tests for image upload in add mode
   - Integration tests for create-with-image flow

### Current Status

- ✅ Phase 1B complete (upload/replace/delete for existing wines)
- ✅ All 270 tests passing
- ⏳ Next: Enable image upload during wine creation

---

**Last Updated**: January 7, 2026
