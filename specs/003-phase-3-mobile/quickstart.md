# Quickstart: Phase 3 Mobile Responsive Components

**Date**: 2026-01-28 **Spec**: [spec.md](./spec.md)

## Prerequisites

1. Complete Phase 1 & 2 of mobile responsive (already done)
2. Node.js and npm installed
3. Development server can run (`npm run dev`)

## Setup Steps

### 1. Install Dependencies

```bash
# Install Headless UI for Combobox component
npm install @headlessui/react --workspace=@wine-cellar/web
```

### 2. Verify Installation

```bash
# Check that @headlessui/react is in package.json
cat apps/web/package.json | grep headlessui
```

Expected: `"@headlessui/react": "^X.X.X"`

## Development Workflow

### Start Development Server

```bash
npm run dev
```

- Web app: http://localhost:3000
- API: http://localhost:3001

### Testing Responsive Behavior

1. **Chrome DevTools**: F12 → Toggle Device Toolbar (Ctrl+Shift+M)
2. **Breakpoint**: 768px is the mobile/desktop threshold
3. **Test devices**: iPhone SE (375px), iPhone 14 (393px), iPad (768px)

### Run Tests

```bash
# All tests
npm test

# Web tests only
npm run test:web

# Watch mode for development
npm run test:web -- --watch
```

## Verification Checklist

### Mobile View (< 768px)

- [ ] Wine cards display instead of table
- [ ] Sort selector appears above cards
- [ ] Cards show: name, vintage, producer, type, grape, region, country,
      favorite
- [ ] Tapping card opens modal
- [ ] Tapping favorite star toggles without opening modal
- [ ] Modal is full-screen
- [ ] Modal form is single-column
- [ ] All inputs have 44px+ height
- [ ] Combobox shows all options on focus
- [ ] Combobox filters as you type

### Desktop View (>= 768px)

- [ ] Table displays (not cards)
- [ ] Sort selector is hidden (use column headers)
- [ ] Modal is not full-screen (centered dialog)
- [ ] Modal form is two-column

### Combobox Behavior (all viewports)

- [ ] Focus shows all options
- [ ] Typing filters options
- [ ] Arrow keys navigate options
- [ ] Enter selects highlighted option
- [ ] Escape closes dropdown
- [ ] Can type value not in list (free text)
- [ ] "No matching options" shows when filter has no results

## File Locations

| File                                                            | Purpose                             |
| --------------------------------------------------------------- | ----------------------------------- |
| `apps/web/src/components/WineCard.tsx`                          | New - mobile wine card              |
| `apps/web/src/components/Combobox.tsx`                          | New - accessible autocomplete       |
| `apps/web/src/components/MobileSortSelector.tsx`                | New - mobile sort dropdown          |
| `apps/web/src/components/WineTable.tsx`                         | Modified - responsive switch        |
| `apps/web/src/components/WineDetailModal.tsx`                   | Modified - mobile layout + combobox |
| `apps/web/src/__tests__/components/WineCard.test.tsx`           | New tests                           |
| `apps/web/src/__tests__/components/Combobox.test.tsx`           | New tests                           |
| `apps/web/src/__tests__/components/MobileSortSelector.test.tsx` | New tests                           |

## Common Issues

### Combobox dropdown doesn't appear

- Check z-index (should be above modal content)
- Verify @headlessui/react is installed
- Check for CSS conflicts with `overflow: hidden`

### Cards not showing on mobile

- Verify useMediaQuery hook is working
- Check window.matchMedia mock in tests
- Confirm breakpoint is 767px (max-width)

### Touch targets too small

- All interactive elements need min 44x44px
- Use `min-h-[44px]` in Tailwind
- Verify with browser DevTools element inspector
