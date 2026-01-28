# Quickstart: Mobile Layout Restructuring (Phase 2)

**Feature**: 002-phase-2-layout **Purpose**: Manual testing checklist for
responsive layout validation

## Prerequisites

1. Development server running: `npm run dev`
2. Browser DevTools available for viewport simulation
3. Wine data exists in database (at least 2-3 wines for filter testing)

## Test Viewports

| Device        | Width   | Mode              |
| ------------- | ------- | ----------------- |
| iPhone SE     | 375px   | Mobile            |
| iPhone 14 Pro | 393px   | Mobile            |
| iPad Mini     | 768px   | Mobile (drawer)   |
| iPad          | 820px   | Mobile (drawer)   |
| iPad Pro      | 1024px  | Desktop (sidebar) |
| Desktop       | 1280px+ | Desktop           |

## Manual Test Checklist

### Mobile/Tablet (< 1024px)

#### Layout

- [ ] Wine list takes full width (no sidebar visible)
- [ ] Filter toggle button visible in header area
- [ ] Filter toggle button has filter/funnel icon
- [ ] Filter toggle button is at least 44x44px (touch target)
- [ ] "Add Wine" button visible and appropriately sized
- [ ] Bottle count displayed correctly

#### Filter Drawer - Opening

- [ ] Tap filter icon → drawer slides in from left
- [ ] Animation duration feels natural (~300ms)
- [ ] Drawer is approximately 80% of screen width
- [ ] Semi-transparent backdrop visible (20% of screen on right)
- [ ] WineFilters content visible inside drawer
- [ ] Close button (X) visible at top of drawer

#### Filter Drawer - Closing

- [ ] Tap backdrop → drawer closes
- [ ] Tap close button (X) → drawer closes
- [ ] Animation slides drawer back out to left
- [ ] Background content scrollable after close

#### Filter Functionality

- [ ] Apply a filter (e.g., select "Red" wine type)
- [ ] Close drawer
- [ ] Wine list shows filtered results
- [ ] Re-open drawer → filter selection preserved
- [ ] Clear filters works correctly

#### Edge Cases

- [ ] Rotate device while drawer open → drawer closes
- [ ] Resize browser from mobile to desktop → drawer closes
- [ ] Scroll inside drawer when content overflows
- [ ] Rapid tap open/close doesn't break animation

### Desktop (>= 1024px)

#### Layout Preservation

- [ ] Filter sidebar visible on left (~25% width)
- [ ] Wine table on right (~75% width)
- [ ] No filter toggle button visible
- [ ] Layout matches original desktop design exactly

#### Filter Functionality

- [ ] All existing filter functionality works
- [ ] Filters apply immediately (no drawer)
- [ ] Clear filters works

### Cross-Breakpoint

- [ ] Resize from 1200px → 800px → filters move to drawer
- [ ] Resize from 800px → 1200px → filters move to sidebar
- [ ] Filter state preserved during resize
- [ ] No layout "jump" or flash during transition

## Accessibility Checks

- [ ] Filter toggle button has aria-label
- [ ] Drawer has role="dialog" or similar
- [ ] Close button is keyboard accessible
- [ ] Tab order makes sense inside drawer
- [ ] Escape key closes drawer (optional)
- [ ] Screen reader announces drawer open/close

## Performance Checks

- [ ] Animations run at 60fps (no jank)
- [ ] No layout shift when drawer opens
- [ ] Page doesn't re-render excessively on resize

## Browser Testing

Test in at least:

- [ ] Chrome (desktop + mobile emulation)
- [ ] Safari (if on Mac)
- [ ] Firefox
- [ ] Actual mobile device (if available)

## Sign-off

| Tester | Date | Result | Notes |
| ------ | ---- | ------ | ----- |
|        |      |        |       |
