# Wine Cellar - Project Roadmap

## Recently Completed

- [x] Mobile Responsive Design - Phases 1-3 (January 2026)
- [x] Wine Favorites feature (January 2026)
- [x] Wine Label Images - Phase 1 (December 2025 - January 2026)
- [x] Claude Code Framework adoption - SpecKit (January 2026)
- [x] Test coverage to 80%+ (752 tests passing)
- [x] CLAUDE.md project context file

## Current Status

**Test Suite**: 752 tests (209 API + 543 Web) - all passing **Coverage**: API
90%+ / Web 80%+ (exceeding all targets) **Framework**: SpecKit installed with
skills, agents, and commands (see CLAUDE.md)

---

## Up Next

### Mobile Responsive - Phases 4-5 (Touch & Testing)

- [ ] Touch gesture optimizations (swipe, pull-to-refresh)
- [ ] Skeleton loaders and enhanced loading states
- [ ] Cross-device testing and performance audit
- [ ] Accessibility audit for mobile interactions

### Wine Label Images - Phase 2 (Thumbnails)

- [ ] Generate 200x200px thumbnails on upload
- [ ] Display thumbnails in wine table
- [ ] Lazy loading for thumbnails

### Wine Label Images - Phase 3 (Production Storage)

- [ ] AWS S3 storage implementation
- [ ] CloudFront CDN
- [ ] Presigned URLs for security

---

## Completed

### Core Functionality

- [x] Full CRUD operations for wines
- [x] Clean UI with wine collection management
- [x] Two-column layout with filter sidebar and wine table
- [x] Background image with transparency effects
- [x] Semi-transparent components with frosted glass blur
- [x] Unified burgundy color scheme across headers
- [x] Scrollable wine table with bottle count display
- [x] RESTful API with proper error handling
- [x] Database with Prisma ORM
- [x] Docker-based PostgreSQL setup
- [x] Keyboard navigation (Arrow Up/Down, Enter)
- [x] Sortable columns (all columns)
- [x] Combo dropdowns (Producer, Country, Grape, Region)

### Wine Favorites

- [x] Star icon toggle in table and modal
- [x] Favorites filter
- [x] Optimistic updates
- [x] Ruby red theme color

### Wine Label Images (Phase 1)

- [x] Display images in detail modal
- [x] Upload during wine creation (staged pattern)
- [x] Upload/replace/delete for existing wines
- [x] Image optimization (Sharp)
- [x] File validation (type, size, magic numbers)
- [x] Local storage with caching

### Error Handling & Logging

- [x] Winston structured logging
- [x] Request ID tracking
- [x] Custom error classes (7 types)
- [x] Centralized error handler
- [x] Frontend error boundaries
- [x] Zod validation schemas
- [x] Health check endpoint

### Code Quality & Standards

- [x] ESLint with strict rules
- [x] Prettier formatting
- [x] TypeScript strict mode
- [x] Husky pre-commit hooks
- [x] Conventional commits (commitlint)
- [x] GitHub Actions CI/CD
- [x] Pull request template

### Testing

- [x] API tests (209) - Vitest + Supertest
- [x] Web tests (270) - React Testing Library
- [x] Coverage thresholds enforced
- [x] Sequential execution for DB tests

### Mobile Responsive Design (Phases 1-3)

- [x] Tailwind CSS integration with design tokens
- [x] useMediaQuery hook with useSyncExternalStore
- [x] Responsive layout (1024px breakpoint)
- [x] Mobile filter drawer with backdrop overlay
- [x] WineCard component for mobile card view
- [x] MobileSortSelector for mobile sort controls
- [x] Combobox components replacing datalist fields
- [x] Full-screen modal on mobile with single-column layout
- [x] 44px+ touch targets on all interactive elements
- [x] 140+ responsive/mobile tests added

### Accessibility

- [x] Modal ARIA attributes
- [x] Escape key support
- [x] Focus trap in modals
- [x] Visible focus indicators
- [x] Screen reader support (aria-hidden on decorative elements)

### Documentation

- [x] API docs (Swagger/OpenAPI)
- [x] Project summary
- [x] Error handling guide
- [x] Test summary
- [x] Skill documentation (.claude/skills/)

---

## Backlog

### Security (Priority for Production)

- [ ] Rate limiting on API endpoints
- [ ] Security headers (helmet.js)
- [ ] CSRF protection
- [ ] Dependency vulnerability scanning
- [ ] HTTPS enforcement

### Performance

- [ ] Database indexes
- [ ] Caching strategy (Redis)
- [ ] Frontend code splitting
- [ ] Bundle size analysis
- [ ] Load testing

### Authentication & Authorization

- [ ] User registration and login
- [ ] JWT-based authentication
- [ ] User-specific wine collections
- [ ] Role-based access control

### Cellar Management

- [ ] Track physical location (rack, shelf, bin)
- [ ] Cellar capacity tracking
- [ ] Visual cellar map/grid
- [ ] Inventory alerts (low stock, drink-by reminders)

### Wine Intelligence

- [ ] Drinking window recommendations
- [ ] Food pairing suggestions
- [ ] Similar wine suggestions
- [ ] Integration with wine databases (Vivino, CellarTracker)

### Analytics & Reporting

- [ ] Collection value tracking
- [ ] Consumption statistics
- [ ] Spending analysis
- [ ] Export reports to CSV/PDF

### Deployment

- [ ] Deploy frontend to Vercel
- [ ] Deploy API to Railway or Fly.io
- [ ] Production database (Supabase/Railway)
- [ ] Error tracking (Sentry)

---

## Nice-to-Have Ideas

- [ ] Wine recommendation engine (ML)
- [ ] Barcode/QR scanning
- [ ] OCR for wine labels
- [ ] Dark mode
- [ ] PWA (offline support, install prompt)
- [ ] Wine journal with markdown
- [ ] Multiple images per wine
- [ ] Image crop/rotate

---

**Last Updated**: January 31, 2026
