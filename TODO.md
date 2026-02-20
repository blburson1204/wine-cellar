# Wine Cellar - Project Roadmap

## Recently Completed

- [x] Mobile Responsive Design - All 5 Phases (January 2026)
- [x] Wine Favorites feature (January 2026)
- [x] Wine Label Images - Phase 1 (December 2025 - January 2026)
- [x] Claude Code Framework adoption - SpecKit (January 2026)
- [x] Test coverage to 80%+ (604 tests passing)
- [x] CLAUDE.md project context file

## Current Status

**Test Suite**: 604 tests (191 API + 413 Web) - all passing **Coverage**: API
90%+ / Web 80%+ (exceeding all targets) **Framework**: SpecKit installed with
skills, agents, commands, and ATOM hooks (see CLAUDE.md)

---

## Up Next

### AWS Deployment (see `documents/aws-deployment-plan.md`)

**Phase 1: Preparation**

- [ ] Environment configuration (database URL, API URL, S3, CORS)
- [ ] Containerize API and web (Dockerfiles)
- [ ] Update storage service for AWS S3 (includes wine label image migration)
- [ ] Database migration strategy (export/import scripts)

**Phase 2: Infrastructure Setup**

- [ ] AWS account and IAM setup
- [ ] Networking (VPC, subnets, security groups)
- [ ] RDS PostgreSQL with Secrets Manager
- [ ] S3 bucket for wine label images + CloudFront CDN

**Phase 3: Application Deployment**

- [ ] Deploy API (App Runner, ECS Fargate, or EC2)
- [ ] Deploy frontend (Amplify, S3+CloudFront, or ECS)
- [ ] DNS and SSL certificates

**Phase 4: CI/CD & Operations**

- [ ] Extend GitHub Actions with deployment jobs
- [ ] CloudWatch logging and monitoring
- [ ] Backup strategy and disaster recovery

**Low-Cost Alternative: Vercel + Railway**

- [ ] Evaluate Vercel + Railway/Supabase ($0-5/month vs full AWS $50-110/month)

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

- [x] API tests (191) - Vitest + Supertest
- [x] Web tests (413) - React Testing Library
- [x] Coverage thresholds enforced
- [x] Sequential execution for DB tests

### Mobile Responsive Design (All 5 Phases)

- [x] Tailwind CSS integration with design tokens
- [x] useMediaQuery hook with useSyncExternalStore
- [x] Responsive layout (1024px breakpoint)
- [x] Mobile filter drawer with backdrop overlay
- [x] WineCard component for mobile card view
- [x] MobileSortSelector for mobile sort controls
- [x] Combobox components replacing datalist fields
- [x] Full-screen modal on mobile with single-column layout
- [x] 44px+ touch targets on all interactive elements
- [x] Touch gestures (swipe-to-close filter drawer)
- [x] Loading spinners and skeleton placeholders
- [x] Accessibility tests (vitest-axe) across all components
- [x] Focus management (focus trap, focus restoration)
- [x] Cross-viewport integration tests (375px, 393px, 768px, 1024px)
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

### Wine Intelligence

- [ ] Drinking window recommendations
- [ ] Food pairing suggestions
- [ ] Similar wine suggestions
- [ ] Integration with wine databases (Vivino, CellarTracker)

### Authentication & Authorization

- [ ] User registration and login
- [ ] JWT-based authentication
- [ ] User-specific wine collections
- [ ] Role-based access control

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

### Wine Label Images - Phase 2 (Thumbnails)

- [ ] Generate 200x200px thumbnails on upload
- [ ] Display thumbnails in wine table
- [ ] Lazy loading for thumbnails

### Cellar Management

- [ ] Track physical location (rack, shelf, bin)
- [ ] Cellar capacity tracking
- [ ] Visual cellar map/grid
- [ ] Inventory alerts (low stock, drink-by reminders)

### Analytics & Reporting

- [ ] Collection value tracking
- [ ] Consumption statistics
- [ ] Spending analysis
- [ ] Export reports to CSV/PDF

---

## Nice-to-Have Ideas

### SpecKit / Development Tooling

- [ ] Jira integration - Map `/tasks` output to Jira tickets (Spec → Epic, Tasks
      → Stories)
- [ ] Custom MCP server for Jira (tailored to SpecKit Epic→Task hierarchy)
- [ ] Lovable integration - Import generated components into codebase; explore
      bidirectional sync for prototyping workflow
- [ ] Slack integration - Progress notifications for SpecKit phases/tasks
      (webhook for personal, MCP server for team use)
- [ ] Hook audit log - Append-only NDJSON log
      (`.claude/session-context/audit-log.ndjson`) recording hook invocations
      with timestamp, event type, hook name, and allow/deny decision. Low
      effort, covers the most invisible activity.
- [ ] Command execution log - Extend skill-log pattern to SpecKit commands; each
      command appends an entry to `command-log.md` in the spec directory with
      timestamp and phase, giving a full pipeline timeline.
- [ ] Full observability layer - PostToolUse hook logging agent spawns, command
      invocations, and hook decisions to a central audit file. More
      comprehensive but noisier; build on top of hook audit log and command log.

### Wine Cellar Features

- [ ] Wine recommendation engine (ML)
- [ ] Barcode/QR scanning
- [ ] OCR for wine labels
- [ ] Dark mode
- [ ] PWA (offline support, install prompt)
- [ ] Wine journal with markdown
- [ ] Multiple images per wine
- [ ] Image crop/rotate

---

**Last Updated**: February 14, 2026
