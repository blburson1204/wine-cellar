# Wine Cellar - Test Summary

## ✅ All Tests Passing (752/752)

### Test Suite Results

**API Tests:**

```
✓ apps/api/__tests__/wines.test.ts (18 tests) - Integration
✓ apps/api/__tests__/errorHandling.test.ts (31 tests) - Integration
✓ apps/api/__tests__/utils/image-validation.test.ts (26 tests) - Unit
✓ apps/api/__tests__/utils/image-processing.test.ts (14 tests) - Unit
✓ apps/api/__tests__/utils/logger.test.ts (22 tests) - Unit
✓ apps/api/__tests__/services/storage/local-storage.service.test.ts (14 tests) - Unit
✓ apps/api/__tests__/routes/wine-image.integration.test.ts (19 tests) - Integration
✓ apps/api/__tests__/errors/AppError.test.ts (34 tests) - Unit
✓ apps/api/__tests__/server.test.ts (4 tests) - Unit
✓ apps/api/__tests__/middleware/errorHandler.test.ts (10 tests) - Unit

Test Files  10 passed (10)
Tests       209 passed (209)
Duration    ~2.5s
```

**Web Tests:**

```
✓ apps/web/__tests__/api.test.ts (23 tests) - Unit
✓ apps/web/__tests__/ErrorBoundary.test.tsx (14 tests) - Component
✓ apps/web/__tests__/WineTable.test.tsx (69 tests) - Component
✓ apps/web/__tests__/WineFilters.test.tsx (29 tests) - Component
✓ apps/web/__tests__/page.test.tsx (23 tests) - Component
✓ apps/web/__tests__/page.additional.test.tsx (13 tests) - Component
✓ apps/web/__tests__/WineDetailModal.test.tsx (22 tests) - Component
✓ apps/web/__tests__/WineDetailModal.additional.test.tsx (37 tests) - Component
✓ apps/web/src/__tests__/components/WineDetailModal.image.test.tsx (28 tests) - Component
✓ apps/web/__tests__/WineTable.additional.test.tsx (32 tests) - Component

Test Files  10 passed (10)
Tests       270 passed (270)
Duration    ~5.6s
```

**Phase 5 Tests (added Jan 2026):**

```
✓ apps/web/src/__tests__/accessibility/Combobox.a11y.test.tsx (5 tests) - Accessibility
✓ apps/web/src/__tests__/accessibility/FilterDrawer.a11y.test.tsx (2 tests) - Accessibility
✓ apps/web/src/__tests__/accessibility/SmallComponents.a11y.test.tsx (10 tests) - Accessibility
✓ apps/web/src/__tests__/accessibility/WineCard.a11y.test.tsx (4 tests) - Accessibility
✓ apps/web/src/__tests__/accessibility/WineDetailModal.a11y.test.tsx (5 tests) - Accessibility
✓ apps/web/src/__tests__/accessibility/WineFilters.a11y.test.tsx (5 tests) - Accessibility
✓ apps/web/src/__tests__/accessibility/WineTable.a11y.test.tsx (6 tests) - Accessibility
✓ apps/web/src/__tests__/focus/Combobox.focus.test.tsx (8 tests) - Focus Management
✓ apps/web/src/__tests__/focus/FilterDrawer.focus.test.tsx (6 tests) - Focus Management
✓ apps/web/src/__tests__/focus/WineDetailModal.focus.test.tsx (6 tests) - Focus Management
✓ apps/web/src/__tests__/integration/viewport-devices.test.tsx (21 tests) - Integration
✓ + other existing tests with additional Phase 4-5 coverage

Test Files  38 passed (38)
Tests       543 passed (543)
Duration    ~7.8s
```

### Quick Stats

- **Test Runner**: Vitest 4.0.16
- **Total Tests**: 752 (209 API + 543 web)
- **Pass Rate**: 100%
- **Execution Time**: ~8s
- **Test Files**: 48 (10 API + 38 web)
- **Test Types**: Unit (100), Integration (89), Component (270), Accessibility
  (37), Focus Management (20)

---

## Test Breakdown

### API Tests (209 tests)

#### NEW: Phase 1B Image Upload Tests (95 tests)

**logger.test.ts (22 tests) - Unit**

- ✓ Create logger without/with request context
- ✓ Log messages at all levels (info, warn, error, debug)
- ✓ Include request metadata (requestId, method, path, userId)
- ✓ Merge extra metadata with request context
- ✓ Handle Error objects with stack traces
- ✓ HTTP log stream integration

**image-validation.test.ts (26 tests) - Unit**

- ✓ File size validation (within limit, at limit, exceeding limit)
- ✓ MIME type validation (JPEG, PNG, WebP supported; GIF, BMP rejected)
- ✓ Image buffer validation using file-type magic numbers
- ✓ File type spoofing detection (executables pretending to be images)
- ✓ Empty file and null buffer handling
- ✓ Comprehensive error messages

**image-processing.test.ts (14 tests) - Unit**

- ✓ Extract image metadata (width, height, format)
- ✓ Optimize images (resize if > max width, preserve aspect ratio)
- ✓ Convert all formats to JPEG
- ✓ Compress with configurable quality
- ✓ Preserve orientation metadata
- ✓ Generate thumbnails with cover fit

**local-storage.service.test.ts (14 tests) - Unit**

- ✓ Initialize upload directory
- ✓ Upload and optimize images
- ✓ Delete images (handle non-existent gracefully)
- ✓ Get image URLs
- ✓ Check image existence
- ✓ Error propagation from validation/optimization

**wine-image.integration.test.ts (19 tests) - Integration**

POST /api/wines/:id/image:

- ✓ Upload JPEG, PNG, WebP (all convert to JPEG)
- ✓ Replace existing images
- ✓ Return 404 for non-existent wines
- ✓ Return 400 for missing files, unsupported types
- ✓ Reject oversized files (> 5MB)
- ✓ Reject invalid image data
- ✓ Detect file type spoofing
- ✓ Handle concurrent uploads

DELETE /api/wines/:id/image:

- ✓ Delete existing images
- ✓ Return 404 for non-existent wines
- ✓ Return 404 when wine has no image
- ✓ Handle already-deleted images gracefully
- ✓ Handle concurrent deletes

Full lifecycle:

- ✓ Upload → Replace → Delete → Re-upload workflow

---

### Server & Middleware Tests (14 tests) - NEW January 2026

#### server.test.ts (4 tests) - Unit

**Server Startup**

- ✓ starts server on default port 3001 when PORT env is not set
- ✓ starts server on custom port from PORT env
- ✓ uses NODE_ENV from environment
- ✓ defaults to development when NODE_ENV is not set

#### errorHandler.test.ts (10 tests) - Unit

**Prisma Error Handling**

- ✓ handles P2002 unique constraint violation (409)
- ✓ handles P2025 record not found (404)
- ✓ handles P2003 foreign key constraint failed (400)
- ✓ handles generic Prisma error with unknown code (500)

**AppError Handling**

- ✓ handles AppError with correct status code
- ✓ handles ValidationError with fields

**Unexpected Error Handling**

- ✓ hides error details in production
- ✓ shows error details in development

**notFoundHandler**

- ✓ returns 404 for undefined routes
- ✓ includes correct method and path in error message

---

### CRUD & Error Handling Tests (49 tests)

#### wines.test.ts (18 tests)

**GET /api/health**

- ✓ returns healthy status

**POST /api/wines**

- ✓ creates a new wine with valid data
- ✓ creates wine with all optional fields
- ✓ creates wine with different colors (RED, WHITE, ROSE, SPARKLING, DESSERT,
  FORTIFIED)

**GET /api/wines**

- ✓ returns empty array when no wines exist
- ✓ returns all wines
- ✓ returns wines in descending order by creation date

**GET /api/wines/:id**

- ✓ returns a wine by ID
- ✓ returns 404 when wine not found

**PUT /api/wines/:id**

- ✓ updates a wine
- ✓ updates multiple fields
- ✓ returns error when wine not found

**DELETE /api/wines/:id**

- ✓ deletes a wine
- ✓ returns error when wine not found

**Integration: Full Wine Lifecycle**

- ✓ completes create → read → update → delete flow

**Data Validation**

- ✓ handles special characters in wine names
- ✓ handles very old vintages
- ✓ handles large quantities

#### errorHandling.test.ts (31 tests)

**Validation Errors (400)**

- ✓ returns 400 for missing required field: name
- ✓ returns 400 for missing required field: vintage
- ✓ returns 400 for vintage too old (< 1900)
- ✓ returns 400 for vintage in the future
- ✓ returns 400 for invalid wine color
- ✓ returns 400 for negative quantity
- ✓ returns 400 for rating out of range (too low)
- ✓ returns 400 for rating out of range (too high)
- ✓ returns 400 for name too long (> 200 chars)
- ✓ returns 400 for notes too long (> 2000 chars)
- ✓ returns 400 for multiple validation errors
- ✓ rejects unknown fields in update

**Not Found Errors (404)**

- ✓ returns 404 when getting non-existent wine
- ✓ returns 404 when updating non-existent wine
- ✓ returns 404 when deleting non-existent wine
- ✓ returns 404 for undefined routes

**Request ID Tracking**

- ✓ includes request ID in successful response headers
- ✓ includes request ID in error responses
- ✓ accepts and uses custom request ID from header

**Error Response Format**

- ✓ has consistent error format with error message
- ✓ includes field-specific errors for validation failures

**Health Check Endpoint**

- ✓ returns 200 when healthy

**Data Type Validation**

- ✓ returns 400 for vintage as string
- ✓ returns 400 for quantity as string
- ✓ returns 400 for rating as decimal

**String Trimming and Sanitization**

- ✓ trims whitespace from name
- ✓ trims whitespace from producer
- ✓ trims whitespace from country

**Edge Cases**

- ✓ handles empty object in POST request
- ✓ handles null values correctly
- ✓ validates ID parameter in GET request

---

### Web Tests (270 tests)

#### api.test.ts (23 tests)

**ApiError Class**

- ✓ creates ApiError with required parameters
- ✓ creates ApiError with all parameters
- ✓ creates ApiError with optional parameters undefined

**fetchApi Function**

- ✓ makes successful GET request
- ✓ makes successful POST request with body
- ✓ handles 204 No Content response
- ✓ merges custom headers with default headers
- ✓ throws ApiError on 404 response
- ✓ throws ApiError on 400 validation error with fields
- ✓ throws ApiError on 500 server error
- ✓ uses default error message when error field is missing
- ✓ handles network errors
- ✓ handles fetch errors without message
- ✓ rethrows ApiError without wrapping
- ✓ handles JSON parsing errors

**getErrorMessage Function**

- ✓ returns message from ApiError
- ✓ returns formatted field errors from ApiError
- ✓ returns message with multiple errors per field
- ✓ returns message with multiple fields
- ✓ returns ApiError message when fields is empty object
- ✓ returns message from standard Error
- ✓ returns default message for unknown error type
- ✓ returns default message for object without message

#### ErrorBoundary.test.tsx (14 tests)

**Normal Rendering**

- ✓ renders children when no error occurs
- ✓ does not show error UI when children render successfully

**Error Handling**

- ✓ catches errors and displays error UI
- ✓ displays Try Again button when error occurs
- ✓ does not render children when error occurs
- ✓ logs error to console when error occurs

**Custom Fallback**

- ✓ renders custom fallback when provided
- ✓ does not render default error UI when custom fallback provided

**Try Again Button**

- ✓ displays Try Again button when error boundary catches error
- ✓ calls setState when Try Again button is clicked

**State Management**

- ✓ updates state to hasError: true when error occurs

**Different Error Types**

- ✓ displays error UI regardless of error message

**Nested Components**

- ✓ catches errors from deeply nested components
- ✓ does not affect sibling components outside boundary

#### WineTable.test.tsx (69 tests)

**Empty State**

- ✓ displays empty state when no wines provided
- ✓ does not render table when no wines

**Table Rendering**

- ✓ renders table with correct headers
- ✓ renders all wine rows
- ✓ displays wine details correctly
- ✓ displays wine types correctly
- ✓ displays em dash for null price

**Row Click**

- ✓ calls onRowClick when wine row clicked
- ✓ calls onRowClick with correct wine when different rows clicked

**Sorting**

- ✓ displays ascending sort indicator for active column
- ✓ displays descending sort indicator for active column
- ✓ does not display sort indicator for inactive columns
- ✓ calls onSort when Wine header clicked
- ✓ calls onSort when Producer header clicked
- ✓ calls onSort when Vintage header clicked
- ✓ calls onSort when Price header clicked
- ✓ calls onSort when Rating header clicked
- ✓ calls onSort when Type header clicked
- ✓ calls onSort when Region header clicked
- ✓ calls onSort when Grape header clicked
- ✓ calls onSort when Country header clicked
- ✓ calls onSort when In Cellar header clicked

**Wine Colors**

- ✓ displays color indicator for RED wine
- ✓ displays color indicator for WHITE wine with border
- ✓ displays color indicator for SPARKLING wine

**Price Formatting**

- ✓ formats price with two decimal places
- ✓ displays em dash when price is null
- ✓ displays em dash when price is undefined

**Sort Direction Changes**

- ✓ updates sort indicator when direction changes from asc to desc
- ✓ updates sort indicator when active column changes

**Keyboard Navigation** (NEW - January 2026)

- ✓ navigates down with ArrowDown key
- ✓ navigates up with ArrowUp key
- ✓ does not go below the last row
- ✓ does not go above the first row
- ✓ opens wine details with Enter key
- ✓ opens correct wine after navigation with Enter
- ✓ does not navigate when wines list is empty

**Focus Management** (NEW - January 2026)

- ✓ resets focus index when wines list changes
- ✓ updates focus when row is clicked

**Favorite Toggle** (NEW - January 2026)

- ✓ calls onToggleFavorite when favorite star clicked
- ✓ calls onToggleFavorite when favorited star clicked
- ✓ does not trigger row click when favorite star clicked
- ✓ displays filled star for favorited wines
- ✓ displays empty star for non-favorited wines

**Row Hover Effects** (NEW - January 2026)

- ✓ changes row style on mouse over
- ✓ restores row style on mouse out for non-focused row
- ✓ maintains highlight style on mouse out for focused row

**Null/Undefined Value Display** (NEW - January 2026)

- ✓ displays em dash for null region
- ✓ displays em dash for null grape variety
- ✓ displays em dash for null rating
- ✓ displays No for zero quantity

**Additional Wine Colors** (NEW - January 2026)

- ✓ displays wine type label for ROSE wine
- ✓ displays wine type label for DESSERT wine
- ✓ displays wine type label for FORTIFIED wine
- ✓ displays raw color value for unknown color types

**MaxHeight Prop** (NEW - January 2026)

- ✓ applies maxHeight when provided
- ✓ does not apply maxHeight when not provided

#### WineFilters.test.tsx (29 tests)

**Rendering**

- ✓ renders all filter sections
- ✓ renders all wine type checkboxes
- ✓ renders country options
- ✓ does not show clear button when no filters active
- ✓ shows clear button when search text is active
- ✓ shows clear button when colors are selected
- ✓ shows clear button when country is selected
- ✓ shows clear button when vintage range is set
- ✓ shows clear button when price range is set

**Search Filter**

- ✓ displays current search text
- ✓ calls onSearchChange when typing

**Wine Type Filter**

- ✓ shows selected wine types as checked
- ✓ calls onColorsChange when selecting a color
- ✓ calls onColorsChange when deselecting a color
- ✓ allows multiple wine types to be selected

**Country Filter**

- ✓ displays selected country
- ✓ calls onCountryChange when selecting a country
- ✓ calls onCountryChange with null when selecting All Countries

**Vintage Range Filter**

- ✓ displays vintage range values
- ✓ displays default min/max when no range set
- ✓ calls onVintageRangeChange when changing min vintage
- ✓ calls onVintageRangeChange when changing max vintage
- ✓ disables vintage inputs when min equals max

**Price Range Filter**

- ✓ displays price range values
- ✓ displays default min/max when no range set
- ✓ calls onPriceRangeChange when changing min price
- ✓ calls onPriceRangeChange when changing max price
- ✓ disables price inputs when min equals max

**Clear All Filters**

- ✓ calls onClearAll when clear button clicked

#### page.test.tsx (23 tests)

**Loading State**

- ✓ displays loading message initially

**Empty Collection**

- ✓ shows empty state when no wines exist

**Wine List**

- ✓ displays wine count correctly
- ✓ renders wine details

**Add Wine Modal**

- ✓ opens add wine modal when Add Wine button clicked
- ✓ submits wine with correct data from modal

**Delete Wine**

- ✓ opens detail modal when clicking wine row
- ✓ can delete wine from detail modal

**Error Handling**

- ✓ handles fetch error gracefully
- ✓ handles add wine error
- ✓ handles delete error

**Sorting** (NEW - January 2026)

- ✓ sorts by name by default
- ✓ toggles sort direction when clicking same column header
- ✓ sorts by vintage when Vintage header clicked
- ✓ sorts by producer when Producer header clicked
- ✓ sorts by price when Price header clicked
- ✓ sorts by rating when Rating header clicked

**Favorite Toggle** (NEW - January 2026)

- ✓ toggles favorite when star is clicked in table
- ✓ handles toggle favorite error gracefully
- ✓ updates selected wine favorite status when toggled from detail modal

**Update Wine** (NEW - January 2026)

- ✓ updates wine when saved from detail modal
- ✓ handles update wine error with non-ok response

**Delete Confirmation Modal** (NEW - January 2026)

- ✓ closes delete confirmation when Cancel is clicked
- ✓ closes delete confirmation when clicking overlay

**Bottle Count Display** (NEW - January 2026)

- ✓ shows singular "Bottle" for 1 wine
- ✓ shows plural "Bottles" for multiple wines
- ✓ shows filtered count when filters are applied

#### page.additional.test.tsx (13 tests) - NEW January 2026

**Filter Functionality**

- ✓ filters by grape variety
- ✓ filters by country
- ✓ filters by In Cellar checkbox
- ✓ filters by Favorites checkbox
- ✓ filters by minimum rating
- ✓ clears all filters when Clear All Filters button is clicked

**Additional Sorting**

- ✓ sorts by color when Type header clicked
- ✓ sorts by region when Region header clicked
- ✓ sorts by grape variety when Grape header clicked
- ✓ sorts by country when Country header clicked
- ✓ sorts by quantity when In Cellar header clicked

**Error Handling Edge Cases**

- ✓ handles create wine with non-ok response
- ✓ handles update when wine not found in fresh list

#### WineDetailModal.test.tsx (22 tests)

**Read-Only View Mode**

- ✓ renders wine details in view mode
- ✓ formats dates correctly
- ✓ displays rating with stars
- ✓ shows singular bottle when quantity is 1
- ✓ displays em dash for null values
- ✓ calls onClose when close button clicked
- ✓ calls onClose when backdrop clicked
- ✓ calls onDelete then onClose when delete button clicked
- ✓ does not show delete button when onDelete not provided

**Edit Mode Toggle**

- ✓ switches to edit mode when Edit Wine clicked
- ✓ returns to view mode when cancel clicked without changes
- ✓ shows confirmation when canceling with unsaved changes

**Add Mode**

- ✓ renders add form with default values
- ✓ closes modal when cancel clicked in add mode
- ✓ calls onCreate with wine data when form submitted

**Form Validation**

- ✓ validates required field - name
- ✓ validates rating range

**Save and Update**

- ✓ calls onUpdate when saving changes in edit mode
- ✓ shows saving state when submitting
- ✓ handles save errors

**Notes Character Counter**

- ✓ displays character count for notes field

**Null Handling**

- ✓ returns null when wine is null in view mode

#### WineDetailModal.image.test.tsx (28 tests) - NEW January 2026

**Image Display in View Mode**

- ✓ displays wine image when imageUrl is present
- ✓ displays placeholder when wine has no image
- ✓ constructs correct image URL from wine ID

**Image Upload in Edit Mode**

- ✓ shows upload button when no image exists
- ✓ shows replace/delete buttons when image exists
- ✓ uploads image successfully
- ✓ handles upload error gracefully
- ✓ validates file size (max 5MB)
- ✓ validates file type (JPEG, PNG, WebP only)
- ✓ deletes image with confirmation
- ✓ cancels delete when Cancel clicked
- ✓ displays image preview after upload
- ✓ replaces existing image

**Image Upload in Add Mode** (NEW - January 2026)

- ✓ shows image upload UI in add mode
- ✓ stages image and shows preview when file selected
- ✓ allows replacing staged image before saving
- ✓ allows deleting staged image before saving
- ✓ validates file size (5MB max) in add mode
- ✓ validates file type (JPEG, PNG, WebP) in add mode
- ✓ uploads staged image after creating wine
- ✓ handles image upload failure gracefully (wine still created)
- ✓ clears staged image when cancel is clicked
- ✓ accepts valid file types from file input accept attribute

---

## Test Coverage

### Current Coverage (Exceeding All Targets ✅)

**API Tests** (`apps/api/vitest.config.ts`):

- **Functions**: 97.50% (target: 80%) ✅ **Exceeds by 22%**
- **Branches**: 89.85% (target: 70%) ✅ **Exceeds by 28%**
- **Lines**: 92.78% (target: 80%) ✅ **Exceeds by 16%**
- **Statements**: 92.61% (target: 80%) ✅ **Exceeds by 16%**

**Web Tests** (`apps/web/vitest.config.ts`):

- **Functions**: 80.10% (target: 50%) ✅ **Exceeds by 60%**
- **Branches**: 83.17% (target: 35%) ✅ **Exceeds by 138%**
- **Lines**: 89.38% (target: 50%) ✅ **Exceeds by 79%**
- **Statements**: 88.45% (target: 50%) ✅ **Exceeds by 77%**

### Component Coverage Breakdown

**API Components:**

- server.ts: 100% lines ✅ (4 tests) - **NEW**
- errorHandler.ts: 100% lines, 95.23% branches ✅ (10 tests) - **+38% branches**
- app.ts: 86.89% statements, 82.5% branches ✅
- All error classes: 100% coverage ✅

**Web Components:**

- page.tsx: 96.66% lines, 80% branches ✅ (36 tests) - **+13% lines, +17%
  branches**
- WineTable.tsx: 84% lines ✅ (69 tests)
- WineFilters.tsx: 96.29% lines ✅ (29 tests)
- WineDetailModal.tsx: 84.84% lines ✅ (59 tests combined)
- ErrorBoundary.tsx: 100% lines ✅ (14 tests)
- api.ts utils: 100% lines ✅ (23 tests)
- layout.tsx: 100% coverage ✅

---

## Testing Patterns and Best Practices

### Component Testing Approach

1. **User-Centric Testing**: Use `@testing-library/react` and `userEvent` to
   test components as users interact with them
2. **Accessibility Queries**: Prefer `getByRole`, `getByLabelText` for better
   accessibility testing
3. **Async Handling**: Use `waitFor` for async state updates and assertions
4. **Mock Management**: Clear mocks between tests with `beforeEach` and
   `afterEach`
5. **Error Suppression**: Mock `console.error` when testing error boundaries to
   keep output clean

### Common Testing Utilities

```typescript
// User event setup
const user = userEvent.setup();
await user.click(element);
await user.type(input, 'text');

// Async assertions
await waitFor(() => {
  expect(screen.getByText('Expected')).toBeInTheDocument();
});

// Mock functions
const mockFn = vi.fn();
expect(mockFn).toHaveBeenCalledWith(expectedArgs);

// Document queries (when needed)
const element = document.getElementById('unique-id');
```

---

## Running Tests

### Run all tests:

```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes):

```bash
npm run test:watch
```

### Run tests with coverage report:

```bash
npm run test:coverage
```

### View HTML coverage report:

```bash
npm run test:coverage
open apps/api/coverage/lcov-report/index.html
open apps/web/coverage/lcov-report/index.html
```

### Run specific test file:

```bash
npm test -- WineTable
```

---

## Test Configuration

### Vitest Configuration (`apps/api/vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.test.ts'],
    pool: 'forks',
    fileParallelism: false, // Sequential execution to prevent race conditions
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
      thresholds: {
        branches: 55,
        functions: 75,
        lines: 75,
        statements: 75,
      },
    },
  },
});
```

**Key Settings:**

- `fileParallelism: false` - Tests run sequentially to avoid database race
  conditions
- Test database:
  `postgresql://postgres:postgres@localhost:5433/wine_cellar_test`
- Test upload directory: `uploads-test/wines` (set via `UPLOAD_DIR` env var)
  - Prevents test cleanup from deleting real uploaded images in `uploads/wines`
- Environment: Node.js (not jsdom)
- Setup script: `scripts/setup-test-db.ts` (runs before tests)

---

## Dependencies

### Testing Stack

- **Vitest**: 4.0.16 (test runner)
- **Supertest**: 7.1.4 (HTTP assertion library for API tests)
- **@testing-library/react**: 16.1.0 (React component testing)
- **@testing-library/user-event**: 14.6.1 (User interaction simulation)
- **vitest-axe**: 0.1.0 (automated accessibility testing with axe-core)
- **Zod**: 3.25.76 (validation library - stable version)
- **Prisma**: Database ORM with test database isolation

### Recent Changes

- **January 29, 2026**: Phase 5 Testing & Refinement
  - Added 273 new web tests (270 → 543 total web tests)
  - **New test directories:**
    - `__tests__/accessibility/` (7 files, 37 tests) - axe-core validation
    - `__tests__/focus/` (3 files, 20 tests) - focus management
    - `__tests__/integration/viewport-devices.test.tsx` (21 tests)
  - **Source improvements:**
    - FilterDrawer.tsx: Added focus trap, auto-focus, focus restoration
    - WineDetailModal.tsx: Added focus restoration on close
  - **New dependency:** vitest-axe for automated accessibility testing
  - Total tests: 479 → 752 (+273 tests, +57% increase)
  - All 752 tests passing

- **January 24, 2026**: Coverage Improvement Sprint
  - Added 131 new tests to improve coverage above 80% thresholds
  - **New API test files:**
    - `server.test.ts` (4 tests) - Server startup, PORT/NODE_ENV handling
    - `middleware/errorHandler.test.ts` (10 tests) - Prisma errors, AppError,
      production mode
  - **New web test file:**
    - `page.additional.test.tsx` (13 tests) - Filters, sorting, error edge cases
  - **Coverage improvements:**
    - API: 89.85% branches (was 77%), 97.5% functions (was 90%)
    - Web: 83.17% branches (was 69%), 80.1% functions (was 79%)
    - page.tsx: 80% branches (was 62.6%), 96.66% lines (was 79%)
    - server.ts: 0% → 100% coverage
    - errorHandler.ts: 57% → 95% branches
  - Total tests: 348 → 479 (+131 tests, +38% increase)
  - All 479 tests passing ✅

- **January 23, 2026**: All Columns Sortable
  - Added 5 new WineTable sorting tests (64 → 69 tests)
  - All table columns now sortable: Type, Region, Grape, Country, In Cellar
  - Updated sorting tests to verify all column headers call onSort
  - Total tests: 343 → 348 (+5 tests)
  - All 348 tests passing ✅

- **January 20, 2026**: Comprehensive Coverage Improvement & Image Add Mode
  Tests
  - Added 73 new web tests (126 → 199 total web tests)
  - **WineTable.test.tsx**: 27 → 64 tests (+37 new tests)
    - Keyboard navigation (ArrowUp, ArrowDown, Enter)
    - Focus management and row click handling
    - Favorite toggle functionality
    - Row hover effects
    - Null/undefined value display
    - Additional wine colors (Rosé, Dessert, Fortified)
    - MaxHeight prop support
  - **page.test.tsx**: 11 → 23 tests (+12 new tests)
    - Sorting by all 5 columns (name, vintage, producer, price, rating)
    - Sort direction toggle
    - Favorite toggle from table and modal
    - Wine update save flow and error handling
    - Delete confirmation modal interactions
    - Bottle count singular/plural display
  - **WineDetailModal.image.test.tsx**: 18 → 28 tests (+10 new tests)
    - Image upload UI in add mode
    - Staged image preview and replacement
    - File validation (size and type) in add mode
    - Image upload after wine creation
    - Graceful error handling for upload failures
    - Blob URL cleanup
  - **Coverage improvements**:
    - Overall web: 68.36% → 78.85% statements (+10.49%)
    - page.tsx: 54.09% → 83.52% lines (+29.43%)
    - WineTable.tsx: 61.53% → 88.33% lines (+26.80%)
  - Total tests: 270 → 343 (+27% increase)
  - All 343 tests passing ✅

- **January 7, 2026**: Phase 1B Image Upload Feature - Complete Test Suite
  - Added 95 new tests for image upload/delete functionality
  - **Unit tests** (76 tests total):
    - image-validation.ts (26 tests) - File validation, MIME types, spoofing
      detection
    - image-processing.ts (14 tests) - Optimization, resizing, thumbnail
      generation
    - local-storage.service.ts (14 tests) - Upload, delete, existence checks
    - logger.ts (22 tests) - Contextual logging, request metadata
  - **Integration tests** (19 tests):
    - POST /DELETE /api/wines/:id/image endpoints
    - Full upload → replace → delete → re-upload lifecycle
    - Error handling, concurrent operations, security
  - Total tests increased from 175 to 270 (+54% increase)
  - Introduced **explicit test type classification**: Unit, Integration,
    Component
  - All 270 tests passing ✅
- **December 30, 2025**: Comprehensive Test Coverage Improvement
  - Added 64 new web tests across 3 components (WineTable, ErrorBoundary,
    api.ts)
  - Web coverage improved from 56.39% to 69.17% functions (+12.78%)
  - All coverage targets now exceeded
  - Total test count increased from 60 to 175 tests
  - Created TestSummary.md with comprehensive testing documentation
- **December 29, 2025**: Enhanced Web Testing
  - Added WineDetailModal tests (22 tests, 0% → 65% coverage)
  - Added WineFilters tests (29 tests, 33% → 97% coverage)
  - Updated page.tsx tests for modal-based UI workflow
  - Total web tests increased from 11 to 62
- **December 26, 2025**: GitHub Action CI/CD Fixes
  - Converted to ESM module system (`"type": "module"`) for Vitest compatibility
  - Changed TypeScript module from CommonJS to ES2020
  - Updated database configuration to respect `DATABASE_URL` environment
    variable
  - Upgraded CI/CD workflow to Node.js 20
  - Adjusted coverage thresholds to current levels with improvement plan in
    TODO.md
  - Resolved 19 TypeScript errors and 9 warnings across API and web
  - Fixed 2 failing web tests related to delete confirmation modal
  - All tests now passing with 100% success rate in both CI and local
    environments
- **December 24, 2025**: Upgraded Zod from 4.2.1 (experimental) to 3.25.76
  (stable)
  - Fixed validation errors returning 500 instead of 400
  - Reduced test failures from 22 to 0
- **December 24, 2025**: Configured sequential test execution
  - Added `fileParallelism: false` to prevent database race conditions
  - Fixed 4 failing tests related to parallel execution

---

## Notes

- Console errors in test output from ErrorBoundary tests are **expected** -
  React logs errors caught by error boundaries
- The test suite uses an isolated test database (`wine_cellar_test`) and cleans
  up before each test
- All tests use the AAA pattern (Arrange, Act, Assert) for clarity
- Database cleanup happens in `beforeEach` hooks to ensure test isolation
- Web tests use jsdom environment for DOM simulation

---

**Last Updated**: January 24, 2026 (Coverage Improvement Sprint)
