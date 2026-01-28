# Quickstart: Mobile Responsive Phase 1 - Foundation Setup

**Purpose**: Validate the Tailwind CSS foundation is working correctly.

## Prerequisites

1. Dependencies installed: `npm install`
2. API server running (optional for this test)

## Validation Steps

### Step 1: Verify Build Succeeds

```bash
cd apps/web && npm run build
```

**Expected**: Build completes with no errors.

### Step 2: Verify Dev Server Starts

```bash
cd apps/web && npm run dev
```

**Expected**: Next.js dev server starts on port 3000 without errors.

### Step 3: Test Tailwind Classes Work

Temporarily add a test class to any component:

```tsx
<div className="bg-wine-dark text-white p-4">Test</div>
```

**Expected**: Element has deep burgundy background (#3d010b).

### Step 4: Verify Viewport Meta

Open browser DevTools, check `<head>` for:

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

### Step 5: Test useMediaQuery Hook

In browser console at mobile viewport (< 768px):

```javascript
// Component using the hook should reflect mobile state
// Or test in React DevTools by inspecting hook value
```

### Step 6: Run Tests

```bash
cd apps/web && npm test
```

**Expected**: All tests pass, including new useMediaQuery tests.

## Design Token Reference

| Token           | Tailwind Class               | Color   |
| --------------- | ---------------------------- | ------- |
| wine-dark       | bg-wine-dark, text-wine-dark | #3d010b |
| wine-burgundy   | bg-wine-burgundy             | #7C2D3C |
| wine-background | bg-wine-background           | #221a13 |
| wine-surface    | bg-wine-surface              | #282f20 |
| wine-header     | bg-wine-header               | #09040a |
| wine-input      | bg-wine-input                | #443326 |
| wine-hover      | bg-wine-hover                | #5a0210 |

## Breakpoint Reference

| Breakpoint | Min Width | Tailwind Prefix |
| ---------- | --------- | --------------- |
| Mobile     | 0px       | (none)          |
| sm         | 640px     | sm:             |
| md         | 768px     | md:             |
| lg         | 1024px    | lg:             |
| xl         | 1280px    | xl:             |
| 2xl        | 1536px    | 2xl:            |

## Troubleshooting

### Tailwind classes not applying

1. Check `globals.css` is imported in `layout.tsx`
2. Verify `tailwind.config.js` content paths include `./src/**/*.tsx`
3. Restart dev server

### Build errors

1. Check `postcss.config.js` exists
2. Verify tailwindcss, postcss, autoprefixer are installed

### useMediaQuery returns wrong value

1. Check for SSR hydration issues (should start as false on server)
2. Verify window.matchMedia mock in vitest.setup.ts
