# Data Model: Phase 3 Mobile Responsive Components

**Date**: 2026-01-28 **Spec**: [spec.md](./spec.md)

## Component Specifications

### WineCard

**Location**: `apps/web/src/components/WineCard.tsx`

```typescript
interface WineCardProps {
  wine: Wine;
  onCardClick: (wine: Wine) => void;
  onToggleFavorite: (wine: Wine) => void;
}

// Wine interface (existing, from WineTable.tsx)
interface Wine {
  id: string;
  name: string;
  vintage: number;
  producer: string;
  region: string | null;
  country: string;
  grapeVariety: string | null;
  color: string;
  quantity: number;
  favorite: boolean;
  // ... other fields not displayed on card
}
```

**Layout** (4-line card):

```
┌─────────────────────────────┐
│ ★  {name}                   │  Line 1: favorite + name
│    {vintage} · {producer}   │  Line 2: vintage + producer
│    {color} · {grapeVariety} │  Line 3: type + grape
│    {region}, {country}      │  Line 4: region + country
└─────────────────────────────┘
```

**Behavior**:

- Tap card → calls `onCardClick(wine)`
- Tap favorite star → calls `onToggleFavorite(wine)` without triggering card
  click
- Long names truncate with ellipsis
- Null values show as "—" or omitted

---

### Combobox

**Location**: `apps/web/src/components/Combobox.tsx`

```typescript
interface ComboboxProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
  required?: boolean;
}
```

**Behavior**:

- On focus: Show all options immediately (FR-018)
- On typing: Filter options to match input
- Keyboard: Arrow keys navigate, Enter selects, Escape closes
- Touch targets: Minimum 44px height for options
- Free text: Allow values not in options list (FR-015)
- No results: Show "No matching options" message

**Internal State**:

- `query`: Current input text for filtering
- `isOpen`: Whether dropdown is visible

---

### MobileSortSelector

**Location**: `apps/web/src/components/MobileSortSelector.tsx`

```typescript
type SortColumn =
  | 'name'
  | 'vintage'
  | 'producer'
  | 'price'
  | 'rating'
  | 'color'
  | 'region'
  | 'grapeVariety'
  | 'country'
  | 'quantity';

interface MobileSortSelectorProps {
  sortBy: SortColumn;
  sortDirection: 'asc' | 'desc';
  onSort: (column: SortColumn) => void;
  onToggleDirection: () => void;
}

const SORT_OPTIONS: { value: SortColumn; label: string }[] = [
  { value: 'name', label: 'Wine Name' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'producer', label: 'Producer' },
  { value: 'color', label: 'Type' },
  { value: 'region', label: 'Region' },
  { value: 'grapeVariety', label: 'Grape' },
  { value: 'country', label: 'Country' },
  { value: 'rating', label: 'Rating' },
  { value: 'quantity', label: 'In Cellar' },
  { value: 'price', label: 'Price' },
];
```

**Layout**:

```
┌──────────────────────────────────┐
│  Sort by: [Vintage ▼]   [↑↓]    │
└──────────────────────────────────┘
```

---

## Modified Components

### WineTable (modified)

**Changes**:

- Add `useMediaQuery('(max-width: 767px)')` check
- Conditionally render `<WineCard>[]` or `<table>`
- Pass existing sort props to MobileSortSelector on mobile

```typescript
// Existing props unchanged
interface WineTableProps {
  wines: Wine[];
  onRowClick: (wine: Wine) => void;
  onToggleFavorite: (wine: Wine) => void;
  sortBy: SortColumn;
  sortDirection: 'asc' | 'desc';
  onSort: (column: SortColumn) => void;
  maxHeight?: string;
}
```

**Rendering Logic**:

```typescript
const isMobile = useMediaQuery('(max-width: 767px)');

if (isMobile) {
  return (
    <>
      <MobileSortSelector ... />
      <div className="card-grid">
        {wines.map(wine => <WineCard key={wine.id} wine={wine} ... />)}
      </div>
    </>
  );
}

return <table>...</table>;  // existing implementation
```

---

### WineDetailModal (modified)

**Changes**:

1. Add `useMediaQuery('(max-width: 767px)')` check
2. Full-screen layout on mobile (100vw x 100vh)
3. Single-column form layout on mobile
4. Replace 5 datalist fields with Combobox components
5. Fixed bottom action buttons on mobile

**Mobile Layout Structure**:

```
┌────────────────────────────┐
│ [X]  Wine Details          │  Fixed header
├────────────────────────────┤
│                            │
│  [Single column form]      │  Scrollable content
│  - All fields stacked      │
│  - 44px min input height   │
│                            │
├────────────────────────────┤
│  [Cancel]        [Save]    │  Fixed footer
└────────────────────────────┘
```

**Desktop Layout**: Unchanged (two-column with image)

---

## Validation Rules

### WineCard

| Field        | Rule              | Display                              |
| ------------ | ----------------- | ------------------------------------ |
| name         | Required, string  | Truncate with ellipsis if > 25 chars |
| vintage      | Required, number  | Display as-is                        |
| producer     | Required, string  | Truncate with ellipsis               |
| color        | Required, enum    | Use COLOR_LABELS mapping             |
| grapeVariety | Optional          | Show "—" if null                     |
| region       | Optional          | Show "—" if null                     |
| country      | Required, string  | Display as-is                        |
| favorite     | Required, boolean | ★ if true, ☆ if false                |

### Combobox

| Validation | Rule                             |
| ---------- | -------------------------------- |
| Free text  | Always allowed                   |
| Empty      | Allowed unless `required` prop   |
| Filtering  | Case-insensitive substring match |

---

## State Management

No new global state. All state is component-local or lifted to existing parent
components:

| State                | Location                   | Notes                      |
| -------------------- | -------------------------- | -------------------------- |
| isMobile             | WineTable, WineDetailModal | Derived from useMediaQuery |
| sortBy/sortDirection | page.tsx (existing)        | Passed down to WineTable   |
| combobox query       | Combobox (internal)        | Reset on value change      |
| modal form data      | WineDetailModal (existing) | No changes                 |
