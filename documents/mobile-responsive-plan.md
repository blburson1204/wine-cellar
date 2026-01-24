# Mobile Responsive Design Plan for Wine Cellar Application

## Overview

This document outlines the steps required to make the Wine Cellar application
responsive for mobile and tablet devices. Currently, the application uses:

- **100% inline CSS styles** (no external stylesheets)
- **Fixed-width layouts** (25%/75% sidebar/content split)
- **No media queries or breakpoints**
- **Desktop-first design** (minimum ~1400px assumed)

---

## Current State Analysis

### Layout Issues on Mobile

- Sidebar filters are 25% width (too narrow on mobile, should stack)
- Wine table has many columns (unusable on small screens)
- Modal dialogs assume large viewport
- Touch targets may be too small
- No hamburger menu or mobile navigation

### Components Requiring Updates

1. **App Layout** (`app/page.tsx`) - Main flex container
2. **WineFilters** - Sidebar filter panel
3. **WineTable** - Data table with many columns
4. **WineDetailModal** - View/Edit modal
5. **AddWineModal** - New wine form modal
6. **Header** - Application header

---

## Recommended Approach

### Option A: CSS Modules with Media Queries

- Create `.module.css` files alongside components
- Move inline styles to CSS modules
- Add responsive breakpoints
- **Pros**: Native CSS, good performance, clear separation
- **Cons**: Significant refactoring of existing inline styles

### Option B: Tailwind CSS Integration

- Install and configure Tailwind
- Replace inline styles with utility classes
- Use responsive prefixes (`sm:`, `md:`, `lg:`)
- **Pros**: Rapid development, consistent spacing/colors, built-in responsive
- **Cons**: Learning curve, class-heavy JSX, build configuration

### Option C: Styled-Components / Emotion

- CSS-in-JS with media query support
- Keep styles co-located with components
- **Pros**: Component-scoped, JS variables in styles
- **Cons**: Runtime overhead, already have styled-jsx unused

### Option D: Hybrid - Keep Inline + Add Global Responsive CSS

- Add global CSS file with responsive overrides
- Use CSS custom properties for theming
- Minimal changes to existing components
- **Pros**: Least disruptive, incremental approach
- **Cons**: Less maintainable long-term, style conflicts possible

**Recommendation**: **Option B (Tailwind CSS)** for best developer experience
and comprehensive responsive utilities, OR **Option A (CSS Modules)** for a more
traditional approach with no additional dependencies.

---

## Responsive Breakpoints

```css
/* Mobile First Approach */
/* Base: 0-639px (Mobile) */
/* sm: 640px+ (Large phones, small tablets) */
/* md: 768px+ (Tablets) */
/* lg: 1024px+ (Small laptops) */
/* xl: 1280px+ (Desktops) */
/* 2xl: 1536px+ (Large screens) */
```

---

## Phase 1: Foundation Setup

### Step 1.1: Choose Styling Approach

- Evaluate team preference (Tailwind vs CSS Modules)
- If Tailwind: Install and configure
- If CSS Modules: Set up file structure

### Step 1.2: Add Viewport Meta Tag

- Ensure proper viewport configuration in layout
- Currently may be missing or incorrect

```tsx
// app/layout.tsx
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

### Step 1.3: Create Design Tokens

- Define consistent spacing scale
- Create color variables
- Set typography scale
- Establish component sizing standards

### Step 1.4: Create Responsive Utilities

- Breakpoint hooks (useMediaQuery or similar)
- Visibility helpers (show/hide at breakpoints)
- Container component with responsive padding

---

## Phase 2: Layout Restructuring

### Step 2.1: Main App Layout

**Current**: Fixed 25%/75% flex split **Target**:

- Mobile: Full width, stacked vertically
- Tablet: Collapsible sidebar overlay
- Desktop: Current side-by-side layout

```
Mobile (< 768px):
┌─────────────────┐
│     Header      │
├─────────────────┤
│  [Filter Icon]  │ ← Opens filter drawer
├─────────────────┤
│                 │
│   Wine List     │
│   (Cards)       │
│                 │
└─────────────────┘

Tablet (768px - 1024px):
┌─────────────────────────────┐
│           Header            │
├─────────────────────────────┤
│ Filters │                   │
│ (slide) │    Wine List      │
│         │    (Table)        │
└─────────────────────────────┘

Desktop (> 1024px):
┌─────────────────────────────────────┐
│              Header                 │
├──────────┬──────────────────────────┤
│          │                          │
│ Filters  │       Wine Table         │
│  (25%)   │         (75%)            │
│          │                          │
└──────────┴──────────────────────────┘
```

### Step 2.2: Mobile Navigation

- Add hamburger menu icon for mobile
- Create slide-out drawer for filters
- Implement touch-friendly close gestures
- Add backdrop overlay when drawer open

### Step 2.3: Header Responsiveness

- Stack elements on mobile if needed
- Ensure action buttons remain accessible
- Consider bottom navigation bar for mobile

---

## Phase 3: Component Updates

### Step 3.1: WineFilters Component

**Changes needed**:

- Full-width on mobile (as drawer/modal)
- Collapsible sections for filter groups
- Larger touch targets for checkboxes
- Close button for mobile drawer mode

**Mobile Behavior**:

- Hidden by default
- Activated via filter icon button
- Slides in from left or bottom
- Full-screen or overlay mode

### Step 3.2: WineTable Component

**Current Issues**:

- Too many columns for mobile
- Horizontal scroll not ideal UX

**Solutions**:

1. **Card Layout on Mobile**
   - Switch from table to card grid
   - Each wine as a card with key info
   - Tap to view details

2. **Priority Columns**
   - Show only essential columns on mobile (Name, Vintage, Type)
   - Hide secondary data (Region, Price, Rating)
   - "More" button to expand

3. **Responsive Table**
   - Keep table but allow horizontal scroll
   - Sticky first column (wine name)
   - Column visibility toggles

**Recommendation**: Card layout on mobile, table on tablet+

### Step 3.3: WineDetailModal

**Changes needed**:

- Full-screen on mobile (no margin)
- Single column layout for details
- Image above content on mobile
- Scrollable content area
- Fixed bottom action buttons
- Swipe to close gesture

### Step 3.4: AddWineModal

**Changes needed**:

- Full-screen on mobile
- Single column form layout
- Large touch targets for inputs
- Keyboard-aware layout
- Progress indicator for multi-step (if applicable)

### Step 3.5: Form Elements

**Changes needed**:

- Minimum 44px touch targets (iOS guideline)
- Adequate spacing between interactive elements
- Clear focus states for accessibility
- Appropriate input types (date, number, etc.)

### Step 3.6: Combobox Component Upgrade

**Current state**: Using HTML5 `<datalist>` for Producer, Country, Region, Grape
Variety, and Where Purchased fields.

**Mobile issues with `<datalist>`**:

- iOS Safari shows picker wheel (unintuitive UX)
- Android behavior varies by version
- No control over styling or touch target sizes
- Inconsistent autocomplete behavior

**Recommended solution**:

- **If using Tailwind CSS**: Use **Headless UI Combobox** (`@headlessui/react`)
  - Same company (Tailwind Labs), designed to work with Tailwind
  - Fully accessible, keyboard navigable
  - Complete control over styling and touch targets

- **If using CSS Modules**: Use **Radix UI Combobox**
  (`@radix-ui/react-combobox`)
  - Unstyled primitives, easy to customize
  - Excellent accessibility out of the box
  - Good mobile support

**Fields to upgrade** (5 total):

1. Producer
2. Country
3. Region
4. Grape Variety
5. Where Purchased

**Benefits**:

- Consistent UX across all devices
- Proper touch targets (44px+)
- Better autocomplete/filtering experience
- Full control over dropdown styling

---

## Phase 4: Touch & Interaction Optimization

### Step 4.1: Touch Targets

- Ensure all buttons minimum 44x44px
- Add padding to interactive elements
- Increase spacing between clickable items

### Step 4.2: Gestures

- Swipe to dismiss modals
- Pull-to-refresh for wine list (optional)
- Swipe actions on wine cards (favorite, delete)

### Step 4.3: Loading States

- Skeleton loaders for better perceived performance
- Loading spinners sized appropriately
- Disabled states clearly visible

---

## Phase 5: Testing & Refinement

### Step 5.1: Device Testing

- Test on actual mobile devices (iOS Safari, Android Chrome)
- Use browser DevTools device simulation
- Test common viewport sizes:
  - iPhone SE (375x667)
  - iPhone 14 Pro (393x852)
  - iPad (768x1024)
  - iPad Pro (1024x1366)

### Step 5.2: Performance Testing

- Check bundle size impact
- Verify no layout shift (CLS)
- Test on slow network conditions

### Step 5.3: Accessibility Audit

- Verify touch target sizes
- Test with screen readers
- Check color contrast
- Ensure keyboard navigation works

---

## Implementation Checklist

### Phase 1: Foundation

- [ ] Choose styling approach (Tailwind/CSS Modules)
- [ ] Install and configure chosen solution
- [ ] Verify viewport meta tag
- [ ] Create design tokens/variables
- [ ] Set up responsive utility hooks

### Phase 2: Layout

- [ ] Create mobile navigation component
- [ ] Implement filter drawer for mobile
- [ ] Update main layout for responsive behavior
- [ ] Add responsive header

### Phase 3: Components

- [ ] Update WineFilters for mobile drawer
- [ ] Create WineCard component for mobile
- [ ] Update WineTable with responsive layout
- [ ] Update WineDetailModal for mobile
- [ ] Update AddWineModal for mobile
- [ ] Ensure all form elements have proper touch targets
- [ ] Upgrade combobox fields (Producer, Country, Region, Grape Variety, Where
      Purchased) from `<datalist>` to Headless UI or Radix UI

### Phase 4: Interactions

- [ ] Implement touch gestures
- [ ] Add loading states
- [ ] Polish transitions and animations

### Phase 5: Testing

- [ ] Test on mobile devices
- [ ] Test on tablets
- [ ] Run accessibility audit
- [ ] Performance testing
- [ ] Fix identified issues

---

## Component Priority Order

1. **Main Layout** - Foundation for everything else
2. **WineFilters** - Critical for filtering functionality
3. **WineTable/WineCard** - Primary content display
4. **WineDetailModal** - Viewing wine details
5. **AddWineModal** - Adding new wines
6. **Header** - Navigation and actions

---

## Technical Considerations

### If Using Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure `tailwind.config.js`:

```javascript
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wine: {
          dark: '#3d010b',
          burgundy: '#7C2D3C',
          background: '#221a13',
        },
      },
    },
  },
};
```

### If Using CSS Modules

Create file structure:

```
src/
  components/
    WineFilters/
      WineFilters.tsx
      WineFilters.module.css
    WineTable/
      WineTable.tsx
      WineTable.module.css
```

### useMediaQuery Hook

```typescript
// hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Usage
const isMobile = useMediaQuery('(max-width: 767px)');
const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
```

---

## Risks & Considerations

1. **Significant Refactoring**: Moving from inline styles requires touching most
   components
2. **Testing Coverage**: Need to test all components at multiple breakpoints
3. **Design Decisions**: Mobile layout requires UX decisions (cards vs table,
   drawer vs modal)
4. **Performance**: Additional CSS/JS may impact load time
5. **Browser Support**: Ensure CSS features work across target browsers

---

## Alternative: Progressive Enhancement

Instead of full responsive redesign, consider:

1. Add basic responsive CSS without major component changes
2. Make current layout scroll horizontally on mobile
3. Add "Request Desktop Site" prompt
4. Build dedicated mobile app later (React Native)

---

## Next Steps

1. Decide on styling approach (Tailwind vs CSS Modules)
2. Review and approve mobile layout wireframes
3. Begin Phase 1 foundation work
4. Implement layout changes incrementally
5. Test and iterate
