# UI Design Skill - Wine Cellar

This skill provides design guidelines and patterns for the Wine Cellar
application UI.

## Design Principles

1. **Clean & Minimal** - Focus on wine data, not UI clutter
2. **Wine-Themed** - Use colors and aesthetics that evoke wine culture
3. **Mobile-Friendly** - Responsive design for browsing collections on the go
4. **Accessible** - WCAG 2.1 AA compliance for color contrast and navigation
5. **Keyboard-First** - Full keyboard navigation with visual focus indicators
6. **Consistent Interactions** - Unified hover/focus states across all
   components

## Color Palette

### Primary Colors (Wine-Inspired)

- **Burgundy**: `#7C2D3C` - Primary actions, headers
- **Dark Red**: `#4A1C26` - Text, important elements
- **Rose**: `#D4A5A5` - Accents, highlights
- **Cream**: `#F5F1E8` - Backgrounds, cards
- **White**: `#FFFFFF` - Main background

### Functional Colors

- **Success**: `#2D7C4A` - Success messages, confirmations
- **Warning**: `#D4A052` - Warnings, alerts
- **Error**: `#C73E3A` - Errors, delete actions
- **Info**: `#5A7C9E` - Information, notes

## Typography

### Font Stack

```css
font-family:
  'Inter',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  'Roboto',
  sans-serif;
```

### Scale

- **Heading 1**: 32px / 2rem - Page titles
- **Heading 2**: 24px / 1.5rem - Section headers
- **Heading 3**: 20px / 1.25rem - Card titles
- **Body**: 16px / 1rem - Regular text
- **Small**: 14px / 0.875rem - Metadata, labels
- **Tiny**: 12px / 0.75rem - Captions

## Component Patterns

### Buttons

**Primary Button** (Add Wine, Save):

```jsx
<button
  style={{
    padding: '10px 20px',
    backgroundColor: '#7C2D3C',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '500',
  }}
>
  Add Wine
</button>
```

**Secondary Button** (Cancel):

```jsx
<button
  style={{
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: '#7C2D3C',
    border: '1px solid #7C2D3C',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
  }}
>
  Cancel
</button>
```

**Danger Button** (Delete):

```jsx
<button
  style={{
    padding: '8px 16px',
    backgroundColor: '#C73E3A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  }}
>
  Delete
</button>
```

### Cards

**Wine Card**:

```jsx
<div
  style={{
    backgroundColor: '#F5F1E8',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #E5DFD0',
  }}
>
  {/* Content */}
</div>
```

### Forms

**Input Fields**:

```jsx
<input
  style={{
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #D4A5A5',
    borderRadius: '4px',
    width: '100%',
    backgroundColor: 'rgba(245, 241, 232, 0.8)', // Unified cream background
  }}
/>
```

**Filter Input Background**: All filter inputs (search, dropdowns, number
fields) use `rgba(245, 241, 232, 0.8)` for visual consistency with table row
highlights.

**Select Dropdowns**:

```jsx
<select
  style={{
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #D4A5A5',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
  }}
>
  <option>Red</option>
</select>
```

### Tables

**Wine List Table**:

- Header: Burgundy background (`#7C2D3C`), white text, sticky positioning
- Rows: Transparent background by default
- Hover: Cream highlight (`rgba(245, 241, 232, 0.8)`)
- Keyboard Focus: Same cream background with burgundy inset border
  (`inset 0 0 0 2px #7C2D3C`)
- Borders: Subtle cream borders (`#E5DFD0`)
- Cursor: Pointer to indicate clickability

**Keyboard Navigation**:

- Arrow Up/Down: Navigate between table rows
- Enter: Open wine details modal for focused row
- Focus indicator: Burgundy inset border with cream background
- Consistent styling: Hover and focus use same background color for unified UX

## Layout Guidelines

### Spacing Scale

- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

### Page Structure

```
┌─────────────────────────────────────┐
│ Header (fixed, 60px height)         │
├─────────────────────────────────────┤
│ Main Content (max-width: 1200px)    │
│ - 24px padding on mobile            │
│ - 48px padding on desktop           │
│                                     │
│ [Wine Grid/Table/Details]           │
└─────────────────────────────────────┘
```

### Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## Feature-Specific Patterns

### Search & Filter Bar

- Sticky to top below header
- White background with subtle shadow
- Search icon on left of input
- Filter chips/tags for active filters
- Clear all filters button when filters active

### Wine Color Indicators

- Small colored dot/badge next to wine name
- Colors map to `WineColor` enum:
  - RED: `#7C2D3C`
  - WHITE: `#F5F1E8` (with border)
  - ROSE: `#D4A5A5`
  - SPARKLING: `#FFD700` (gold)
  - DESSERT: `#8B4513` (saddle brown)
  - FORTIFIED: `#4A1C26` (dark)

### Empty States

```jsx
<div
  style={{
    textAlign: 'center',
    padding: '48px 24px',
    color: '#7C2D3C',
  }}
>
  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍷</div>
  <h3>No wines in your cellar yet</h3>
  <p>Add your first bottle to get started!</p>
</div>
```

### Modals & Focus Management

**Wine Details Modal**:

- Auto-focus behavior depends on mode:
  - **View Mode**: Focus moves to Close button on open
  - **Add/Edit Mode**: Focus moves to first input field (Name) on open
- Allows quick dismissal via Enter (when Close button focused) or Escape key
- Background overlay with `rgba(0, 0, 0, 0.5)` for visual separation

**Focus Management Principles**:

1. Move focus to most relevant element when UI changes
2. Predictable focus flow for keyboard users
3. Visual indicators for all focused elements
4. Consistent focus styling across components

## Layout Structure

**Page Header**:

- Left-aligned (not centered with content)
- Sticky positioning at top
- Burgundy background with wine bottle emoji
- Full width of viewport

**Filter Sidebar & Table Layout**:

- Two-column grid (25% sidebar, 75% table)
- Both columns align with each other
- Header spans full width above columns

## Accessibility Requirements

1. **Color Contrast**: All text must have 4.5:1 contrast ratio
2. **Focus States**: Visible focus outline/border on all interactive elements
3. **Labels**: All form inputs must have associated labels
4. **Alt Text**: Wine images need descriptive alt text
5. **Keyboard Navigation**: Full keyboard support for all features
   - Table navigation with arrow keys
   - Modal auto-focus on appropriate element
   - Enter key to activate focused elements
6. **Focus Indicators**: Burgundy borders (`#7C2D3C`) with sufficient contrast

## Animation Guidelines

- **Transitions**: 200ms ease-in-out for hover states
- **Page Transitions**: 300ms for route changes
- **Loading States**: Subtle pulse/shimmer, not spinners
- **Avoid**: Excessive animations that distract from content

## Icons

Use consistent icon library (suggest Heroicons or Lucide):

- **Add**: Plus icon
- **Delete**: Trash icon
- **Edit**: Pencil icon
- **Search**: Magnifying glass
- **Filter**: Funnel icon
- **Sort**: Arrows up/down

## When to Update This Skill

- After user testing reveals UX issues
- When adding new features that need design patterns
- If brand/theme direction changes
- When accessibility issues are identified
