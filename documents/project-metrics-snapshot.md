# Wine Cellar - Project Metrics Snapshot

Last updated: January 31, 2026

## Codebase Statistics

### Lines of Code

| Category                 | Lines  |
| ------------------------ | ------ |
| **Total TypeScript/TSX** | 22,616 |
| Application source code  | 7,638  |
| Test code                | 14,978 |
| Test-to-source ratio     | 1.96:1 |
| Prisma schema            | 69     |
| Config files             | 289    |

### Breakdown by App

|           | Source | Tests  | Total  |
| --------- | ------ | ------ | ------ |
| **API**   | 2,439  | 3,074  | 5,513  |
| **Web**   | 5,199  | 11,904 | 17,103 |
| **Total** | 7,638  | 14,978 | 22,616 |

### File Counts

| Category                | Count |
| ----------------------- | ----- |
| TypeScript source files | 33    |
| Test files              | 51    |
| React components (.tsx) | 14    |

### API Surface

15 endpoints (10 GET, 2 POST, 1 PUT, 2 DELETE):

- `GET /api/health` - Health check
- `GET /api/docs.json` - OpenAPI spec
- `GET /api/wines` - List/search wines
- `GET /api/wines/:id` - Get wine by ID
- `GET /api/wines/:id/image` - Get wine image
- `GET /api/wines/meta/where-purchased` - Metadata
- `GET /api/wines/meta/producers` - Metadata
- `GET /api/wines/meta/countries` - Metadata
- `GET /api/wines/meta/regions` - Metadata
- `GET /api/wines/meta/grape-varieties` - Metadata
- `POST /api/wines` - Create wine
- `POST /api/wines/:id/image` - Upload image
- `PUT /api/wines/:id` - Update wine
- `DELETE /api/wines/:id` - Delete wine
- `DELETE /api/wines/:id/image` - Delete image

### Database Schema

2 Prisma models, 1 enum:

- **Wine** - 20 fields (name, vintage, producer, region, country, grapeVariety,
  blendDetail, color, quantity, purchasePrice, purchaseDate, drinkByDate,
  rating, notes, expertRatings, wherePurchased, wineLink, favorite, imageUrl,
  timestamps)
- **VivinoExport** - 16 fields (wine data imported from Vivino CSV exports)
- **WineColor** enum - RED, WHITE, ROSE, SPARKLING, DESSERT, FORTIFIED

### Dependencies

| Package   | Production | Dev    | Total  |
| --------- | ---------- | ------ | ------ |
| Root      | 1          | 19     | 20     |
| API       | 12         | 12     | 24     |
| Web       | 4          | 17     | 21     |
| Database  | 1          | 1      | 2      |
| **Total** | **18**     | **49** | **67** |

### Quality

| Metric          | Value                       |
| --------------- | --------------------------- |
| Total tests     | 799 (all passing)           |
| API tests       | 209                         |
| Web tests       | 590                         |
| Coverage target | 80%+ (all targets exceeded) |

### Development Framework (SpecKit)

| Category | Count |
| -------- | ----- |
| Skills   | 27    |
| Commands | 13    |
| Agents   | 6     |
| Specs    | 5     |

---

## Development Session History

**30 sessions** over 42 calendar days (Dec 21, 2025 -- Jan 31, 2026). 119
commits. 30 active days (71% of calendar days).

| #   | Date   | Est. Duration | Commits | Summary                                                        |
| --- | ------ | ------------- | ------- | -------------------------------------------------------------- |
| 1   | Dec 21 | ~3 hrs        | 3       | Project bootstrapped (Express + Next.js monorepo, first skill) |
| 2   | Dec 22 | ~5 hrs        | 4       | Testing setup (Jest + RTL), API refactored for testability     |
| 3   | Dec 23 | Short         | 1       | Migrated Jest to Vitest                                        |
| 4   | Dec 24 | Short         | 1       | Zod upgrade + test fixes                                       |
| 5   | Dec 26 | ~8 hrs        | 15      | Code review infrastructure, CI/CD debugging marathon           |
| 6   | Dec 29 | ~2 hrs        | 4       | Search, filtering, wine detail modal                           |
| 7   | Dec 30 | ~3 hrs        | 9       | Massive testing push + blend details + grape filter            |
| 8   | Dec 31 | ~2 hrs        | 5       | Background image, sticky header, wine label planning           |
| 9   | Jan 1  | ~3 hrs        | 2       | Keyboard navigation + focus management                         |
| 10  | Jan 2  | ~30 min       | 3       | Vivino integration (export, CSV import, label download)        |
| 11  | Jan 4  | ~2 hrs        | 2       | Doc reorganization, wine label image plan                      |
| 12  | Jan 5  | ~5 hrs        | 4       | Wine label image display (Phase 1a), CI fixes, image tests     |
| 13  | Jan 6  | ~2 hrs        | 3       | Wine table UI overhaul (columns, spacing, color hierarchy)     |
| 14  | Jan 7  | ~3 hrs        | 7       | Full image upload feature (storage, API, UI, creation modal)   |
| 15  | Jan 9  | ~3 hrs        | 4       | Dark wine theme, Jest cleanup, table columns + filters         |
| 16  | Jan 11 | ~4 hrs        | 5       | Modal styling, favorites feature, price filter                 |
| 17  | Jan 12 | Short         | 1       | WCAG accessibility pass                                        |
| 18  | Jan 13 | ~30 min       | 3       | OpenAPI/Swagger docs, Phase 1 consolidation                    |
| 19  | Jan 16 | Short         | 1       | Form styling polish                                            |
| 20  | Jan 19 | ~1 hr         | 3       | Filter styling, AWS deployment planning                        |
| 21  | Jan 20 | Short         | 1       | Test coverage expansion                                        |
| 22  | Jan 21 | ~1 hr         | 2       | LCOV reporter, Bryan framework plan                            |
| 23  | Jan 23 | ~3 hrs        | 6       | Expert ratings, where purchased, sortable columns              |
| 24  | Jan 24 | ~2 hrs        | 3       | 80%+ coverage milestone, SpecKit Lite adopted                  |
| 25  | Jan 25 | ~4 hrs        | 5       | AI adoption proposal, case study, presentation docs            |
| 26  | Jan 27 | ~5 hrs        | 4       | Framework v2 (27 skills, 13 commands, 6 agents)                |
| 27  | Jan 28 | ~10 hrs       | 6       | Mobile responsive Phases 1-3 via SpecKit                       |
| 28  | Jan 29 | ~10 hrs       | 8       | Mobile responsive Phases 4-5 (touch, a11y, coverage)           |
| 29  | Jan 30 | ~2 hrs        | 2       | Ralph loop script, skill manifest, project metrics             |
| 30  | Jan 31 | ~2 hrs        | 2       | Test coverage improvements (799 tests), documentation updates  |

### Development Phases

1. **Bootstrapping** (Dec 21-24): Project creation, testing setup, Vitest
   migration, Zod upgrade — Sessions 1-4, 9 commits
2. **CI/CD & Infrastructure** (Dec 26): Code review standards, GitHub Actions
   debugging — Session 5, 15 commits
3. **Core Features** (Dec 29 - Jan 2): Search/filtering, wine detail modal,
   testing blitz, blend details, Vivino integration — Sessions 6-10, 23 commits
4. **Wine Label Images** (Jan 4-7): Image display, upload, storage service —
   Sessions 11-14, 16 commits
5. **UI Polish & Features** (Jan 9-16): Dark theme, table columns, favorites,
   accessibility, OpenAPI docs — Sessions 15-19, 14 commits
6. **Planning & Coverage** (Jan 19-22): Deployment planning, test coverage push,
   framework adoption — Sessions 20-22, 6 commits
7. **New Fields & Framework** (Jan 23-25): Expert ratings, sortable columns,
   SpecKit Lite adoption — Sessions 23-25, 14 commits
8. **Framework v2 & Mobile Responsive** (Jan 27-31): Framework v2 upgrade, full
   mobile responsive via SpecKit (5 specs), Ralph script, test coverage push —
   Sessions 26-30, 22 commits

---

## How to Recreate These Metrics

### Session history (from git log)

```bash
# All commits with dates and messages, chronological
git log --all --format="%ad|%s" --date=format:"%Y-%m-%d %H:%M" | sort

# Commits per day
git log --format="%ad" --date=short | sort | uniq -c | sort -rn
```

Session boundaries: commits clustered within a few hours = one session. Gaps of
6+ hours or different days = separate sessions.

### Lines of code

```bash
# Source (non-test) in apps/
find apps -name "*.ts" -o -name "*.tsx" \
  | grep -v node_modules | grep -v .next \
  | grep -v __tests__ | grep -v ".test." | grep -v ".spec." \
  | xargs wc -l | tail -1

# Test code
find apps \( -name "*.test.ts" -o -name "*.test.tsx" \) \
  | grep -v node_modules | xargs wc -l | tail -1

# By app (API source)
find apps/api/src -name "*.ts" | grep -v __tests__ | grep -v ".test." \
  | xargs wc -l | tail -1

# By app (Web source)
find apps/web/src \( -name "*.ts" -o -name "*.tsx" \) \
  | grep -v __tests__ | grep -v ".test." | xargs wc -l | tail -1
```

### File and component counts

```bash
# Source files
find apps \( -name "*.ts" -o -name "*.tsx" \) \
  | grep -v node_modules | grep -v .next \
  | grep -v __tests__ | grep -v ".test." | grep -v ".spec." | wc -l

# Test files
find apps \( -name "*.test.ts" -o -name "*.test.tsx" \) \
  | grep -v node_modules | wc -l

# React components
find apps/web/src -name "*.tsx" \
  | grep -v __tests__ | grep -v ".test." | wc -l
```

### API endpoints

```bash
grep -rn "router\.\(get\|post\|put\|delete\|patch\)" apps/api/src --include="*.ts"
```

### Database schema

```bash
grep "^model " packages/database/prisma/schema.prisma
```

### Dependencies

```bash
for pkg in package.json apps/api/package.json apps/web/package.json packages/database/package.json; do
  echo "=== $pkg ==="
  python3 -c "
import json
d = json.load(open('$pkg'))
print('prod:', len(d.get('dependencies',{})), 'dev:', len(d.get('devDependencies',{})))
"
done
```

### Test count

```bash
npm test 2>&1 | tail -10
```

### Framework stats

```bash
echo "Skills: $(ls .claude/skills/ | wc -l)"
echo "Commands: $(ls .claude/commands/ | wc -l)"
echo "Agents: $(ls .claude/agents/ | wc -l)"
echo "Specs: $(ls specs/ | wc -l)"
```
