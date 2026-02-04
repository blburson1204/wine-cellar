# Wine Cellar - Architecture Diagram

Render this Mermaid diagram at https://mermaid.live or in any Mermaid-compatible
tool (GitHub, Notion, Obsidian, VS Code preview, etc.)

## System Architecture

```mermaid
graph TB
    subgraph "Frontend - Next.js 15 + React 18"
        direction TB
        Browser["Browser<br/>(localhost:3000)"]
        Page["page.tsx<br/>State Management<br/>Filters, Sort, CRUD"]
        subgraph "Components"
            WT["WineTable<br/>Desktop table view"]
            WC["WineCard<br/>Mobile card view"]
            WDM["WineDetailModal<br/>View / Edit / Add"]
            WF["WineFilters<br/>Search, Color, Price,<br/>Rating, Favorites"]
            FD["FilterDrawer<br/>Mobile slide-out"]
            CB["Combobox<br/>Auto-complete fields"]
        end
        Hook["useMediaQuery<br/>Responsive breakpoint"]
        API_Utils["api.ts<br/>fetch wrapper +<br/>error handling"]
    end

    subgraph "Backend - Express + TypeScript"
        direction TB
        Server["server.ts<br/>(localhost:3001)"]
        subgraph "Middleware Stack"
            CORS["CORS"]
            JSON["JSON Parser"]
            RID["Request ID<br/>(UUID tracing)"]
            LOG["HTTP Logger<br/>(Morgan → Winston)"]
            ERR["Error Handler<br/>(Zod, Prisma, AppError)"]
        end
        subgraph "Routes (15 endpoints)"
            CRUD["Wine CRUD<br/>GET / POST / PUT / DELETE"]
            IMG["Image Routes<br/>Upload / Serve / Delete"]
            META["Metadata Routes<br/>Producers, Countries,<br/>Grapes, Regions"]
            HEALTH["Health Check<br/>DB connectivity"]
            DOCS["Swagger UI<br/>Auto-generated from Zod"]
        end
        subgraph "Services"
            ZOD["Zod Schemas<br/>Validation + OpenAPI"]
            STORAGE["Storage Service<br/>(Interface pattern)"]
            LOCAL["LocalStorageService<br/>File system"]
            SHARP["Sharp<br/>Image optimization"]
        end
    end

    subgraph "Data Layer"
        direction TB
        PRISMA["Prisma ORM<br/>(packages/database)<br/>Singleton client"]
        PG[("PostgreSQL 15<br/>(Docker, port 5433)<br/>wine_cellar")]
        PG_TEST[("Test Database<br/>wine_cellar_test")]
        DISK[("Local Disk<br/>uploads/wines/<br/>Optimized JPEGs")]
    end

    subgraph "Quality Infrastructure"
        direction LR
        TESTS["799 Tests<br/>209 API + 590 Web"]
        CI["GitHub Actions<br/>Lint | Type-check | Test | Build"]
        HOOKS["Husky Pre-commit<br/>ESLint + Prettier +<br/>commitlint"]
    end

    Browser --> Page
    Page --> WT
    Page --> WC
    Page --> WDM
    Page --> WF
    Page --> FD
    Page --> Hook
    WDM --> CB
    WF --> CB
    Page --> API_Utils
    API_Utils -- "REST / JSON" --> Server
    Server --> CORS --> JSON --> RID --> LOG
    LOG --> CRUD
    LOG --> IMG
    LOG --> META
    LOG --> HEALTH
    LOG --> DOCS
    CRUD --> ZOD
    IMG --> STORAGE
    STORAGE --> LOCAL
    LOCAL --> SHARP
    CRUD --> ERR
    IMG --> ERR
    CRUD --> PRISMA
    META --> PRISMA
    HEALTH --> PRISMA
    PRISMA --> PG
    PRISMA --> PG_TEST
    LOCAL --> DISK

    style Browser fill:#7C2D3C,color:#fff
    style PG fill:#336791,color:#fff
    style PG_TEST fill:#336791,color:#fff,stroke-dasharray: 5 5
    style DISK fill:#8B7355,color:#fff
    style CI fill:#24292e,color:#fff
    style TESTS fill:#2d8c3c,color:#fff
```

## Data Flow - Wine CRUD

```mermaid
sequenceDiagram
    participant U as User / Browser
    participant F as Frontend (React)
    participant A as API (Express)
    participant Z as Zod Validation
    participant P as Prisma ORM
    participant D as PostgreSQL

    U->>F: Click "Add Wine"
    F->>F: Open WineDetailModal (add mode)
    U->>F: Fill form + Submit
    F->>A: POST /api/wines (JSON)
    A->>Z: Validate request body
    Z-->>A: Validated + transformed data
    A->>P: prisma.wine.create()
    P->>D: INSERT INTO "Wine"
    D-->>P: New wine record
    P-->>A: Wine object
    A-->>F: 201 + Wine JSON
    F->>A: GET /api/wines (refresh list)
    A->>P: prisma.wine.findMany()
    P->>D: SELECT * FROM "Wine"
    D-->>P: All wines
    P-->>A: Wine[]
    A-->>F: 200 + Wine[] JSON
    F->>F: setWines() + close modal
    F-->>U: Updated wine table
```

## Data Flow - Image Upload

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API (Express)
    participant M as Multer
    participant V as Validator
    participant S as Sharp
    participant FS as File System
    participant P as Prisma
    participant D as PostgreSQL

    U->>F: Select image file
    F->>F: Client-side size check (5MB)
    F->>A: POST /api/wines/:id/image (multipart)
    A->>M: Parse multipart form data
    M-->>A: File buffer in memory
    A->>V: Validate type + size + magic bytes
    V-->>A: Valid image
    A->>S: Optimize (resize 1200px, JPEG 85%, strip EXIF)
    S-->>A: Optimized buffer
    A->>FS: Write to uploads/wines/{id}.jpg
    A->>P: Update wine.imageUrl
    P->>D: UPDATE "Wine" SET "imageUrl"
    D-->>P: Updated
    A-->>F: 200 + updated wine
    F-->>U: Display image in modal
```

## Component Architecture

```mermaid
graph TD
    subgraph "page.tsx - Central State Manager"
        STATE["State: wines, filters, sort,<br/>selectedWine, modalMode"]
    end

    STATE --> |"Desktop ≥1024px"| DESKTOP
    STATE --> |"Mobile <1024px"| MOBILE

    subgraph DESKTOP["Desktop Layout"]
        D_FILTERS["WineFilters<br/>(sidebar, 25% width)"]
        D_TABLE["WineTable<br/>(sortable columns, 75% width)"]
    end

    subgraph MOBILE["Mobile Layout"]
        M_TOGGLE["MobileFilterToggle<br/>(filter count badge)"]
        M_SORT["MobileSortSelector"]
        M_CARDS["WineCard[]<br/>(card grid)"]
        M_DRAWER["FilterDrawer<br/>(slide-in + backdrop)"]
        M_FILTERS["WineFilters<br/>(inside drawer)"]
    end

    M_TOGGLE --> M_DRAWER
    M_DRAWER --> M_FILTERS

    STATE --> MODAL["WineDetailModal<br/>View / Edit / Add modes"]
    MODAL --> |"Dynamic fields"| COMBOBOX["Combobox<br/>(Producer, Country,<br/>Grape, Region)"]
    MODAL --> |"Image management"| IMG_SECTION["Image Upload /<br/>Preview / Delete"]

    D_TABLE --> |"Row click"| MODAL
    M_CARDS --> |"Card tap"| MODAL

    style STATE fill:#7C2D3C,color:#fff
    style MODAL fill:#5A0210,color:#fff
```

---

## SpecKit Framework - Pipeline Flow

```mermaid
flowchart LR
    subgraph SPECIFY["Phase 1: Specify"]
        direction TB
        S1["/specify<br/>Create spec.md"]
        S2["/clarify<br/>Socratic Q&A"]
        S3["/analyze<br/>Quality audit"]
        S1 --> S2 --> S3
    end

    subgraph PLAN["Phase 2: Plan"]
        direction TB
        P1["/plan<br/>Architecture reasoning"]
        P2["plan.md<br/>Phased implementation"]
    end

    subgraph TASKS["Phase 3: Tasks"]
        direction TB
        T1["/tasks<br/>Dependency ordering"]
        T2["tasks.md<br/>Ordered work items"]
    end

    subgraph IMPLEMENT["Phase 4: Implement"]
        direction TB
        I1["/implement<br/>Delegates to /ralph"]
        I2["Ralph Loop<br/>Fresh context per task"]
        I3["T-FINAL<br/>Verification gate"]
        I1 --> I2 --> I3
    end

    SPECIFY -- "spec-validate<br/>gate" --> PLAN
    PLAN -- "code-reuse-analysis<br/>gate" --> TASKS
    TASKS -- "feature-start<br/>(optional)" --> IMPLEMENT
    IMPLEMENT -- "feature-ship /<br/>doc-gate" --> DONE["Done"]

    style S1 fill:#6B21A8,color:#fff
    style P1 fill:#6B21A8,color:#fff
    style T1 fill:#6B21A8,color:#fff
    style I1 fill:#6B21A8,color:#fff
    style I3 fill:#2d8c3c,color:#fff
    style DONE fill:#2d8c3c,color:#fff
```

## SpecKit Framework - Component Architecture

```mermaid
graph TB
    subgraph CLAUDE_MD["CLAUDE.md - Project Entry Point"]
        ENTRY["Quick Start, Stack,<br/>Key Patterns, Skills Index"]
    end

    subgraph SKILLS["29 Skills (.claude/skills/)"]
        direction TB
        subgraph SK_CORE["Core Development"]
            TDD["test-tdd"]
            VERIFY["workflow-verify-complete"]
            DEBUG["debug-systematic"]
            RCA["debug-rca"]
        end
        subgraph SK_ARCH["Architecture"]
            ARCH["arch-decisions"]
            BRAIN["workflow-brainstorm"]
            PRISMA["db-prisma"]
        end
        subgraph SK_SEC["Security"]
            SEC["security-review"]
            DEFENSE["security-defense-depth"]
        end
        subgraph SK_DOC["Documentation"]
            DGATE["doc-gate"]
            DSEARCH["doc-search"]
            DUPDATE["doc-update"]
        end
        subgraph SK_FEAT["Feature Lifecycle"]
            FSTART["feature-start"]
            FSHIP["feature-ship"]
            IDEA["feature-capture-idea"]
        end
        subgraph SK_UI["UI & Quality"]
            A11Y["ui-accessibility"]
            UIDESIGN["ui-design"]
            ERR_H["error-handling"]
            TEST_S["testing"]
        end
        subgraph SK_META["Meta"]
            GUIDE["meta-skill-guide"]
            HEALTH["meta-health-check"]
            CTX["meta-context-optimize"]
        end
    end

    subgraph COMMANDS["13 Commands (.claude/commands/)"]
        direction LR
        subgraph CMD_SPEC["SpecKit Pipeline"]
            C_SPEC["/specify"]
            C_CLAR["/clarify"]
            C_ANAL["/analyze"]
            C_PLAN["/plan"]
            C_TASK["/tasks"]
            C_IMPL["/implement"]
            C_RALPH["/ralph"]
        end
        subgraph CMD_QUALITY["Code Quality"]
            C_REVIEW["/code-review"]
            C_CONST["/constitution"]
        end
        subgraph CMD_SESSION["Session Mgmt"]
            C_NOTE["/session-note"]
            C_CHECK["/checkpoint"]
            C_RESUME["/resume-spec"]
            C_HAND["/handoff"]
        end
    end

    subgraph AGENTS["6 Agents (.claude/agents/)"]
        direction LR
        A_CODE["code-reviewer"]
        A_TEST["test-analyzer"]
        A_FIX["auto-fixer"]
        A_IDEA["capture-idea"]
        A_SPEC["spec-validator"]
        A_DOCS["documentation-<br/>reconciliation"]
    end

    subgraph MEMORY[".specify/ - Framework State"]
        direction TB
        MANIFEST["skill-manifest.yaml<br/>Trigger conditions"]
        CONST["memory/constitution.md<br/>Core principles"]
        TEMPLATES["templates/<br/>Spec + Plan templates"]
        SPECS["specs/<br/>Feature specifications"]
        CONTEXT["Session context<br/>current-work.md"]
    end

    CLAUDE_MD --> SKILLS
    CLAUDE_MD --> COMMANDS
    CLAUDE_MD --> AGENTS
    MANIFEST -- "matches skills<br/>to specs" --> SKILLS
    COMMANDS -- "invoke during<br/>pipeline phases" --> SKILLS
    COMMANDS -- "dispatch" --> AGENTS
    CONST -- "governs" --> COMMANDS
    TEMPLATES -- "scaffold" --> SPECS

    style ENTRY fill:#7C2D3C,color:#fff
    style MANIFEST fill:#D97706,color:#fff
    style CONST fill:#D97706,color:#fff
    style C_RALPH fill:#6B21A8,color:#fff
```

## SpecKit Framework - Skill Matching

```mermaid
flowchart TD
    SPEC["Spec enters pipeline<br/>(frontmatter + content)"] --> ALWAYS

    ALWAYS{"Always-active?<br/>5 skills"} -- "Yes" --> INCLUDE["Include in<br/>active skill set"]
    ALWAYS -- "Also check" --> PHASE

    PHASE{"Phase gate?<br/>specify→plan→tasks→<br/>implement→verify"} -- "Transition match" --> INCLUDE
    PHASE -- "Also check" --> FM

    FM{"Frontmatter match?<br/>type, ui_changes"} -- "Field matches" --> INCLUDE
    FM -- "Also check" --> KW

    KW{"Keyword scan?<br/>Content + description"} -- "Keyword found" --> INCLUDE
    KW -- "No match" --> SKIP["Skip skill"]

    INCLUDE --> ACTIVE["Active Skills<br/>for this phase"]
    ACTIVE --> EXEC["Claude consults skills<br/>during execution"]

    subgraph ALWAYS_LIST["Always-Active (5)"]
        direction LR
        MA1["meta-skill-guide"]
        MA2["verify-complete"]
        MA3["context-optimize"]
        MA4["capture-idea"]
        MA5["coding-standards"]
    end

    subgraph GATE_LIST["Phase-Gate (4)"]
        direction LR
        PG1["spec-validate"]
        PG2["code-reuse-analysis"]
        PG3["feature-start"]
        PG4["feature-ship"]
    end

    style SPEC fill:#7C2D3C,color:#fff
    style INCLUDE fill:#2d8c3c,color:#fff
    style SKIP fill:#6B7280,color:#fff
    style ACTIVE fill:#6B21A8,color:#fff
```

## SpecKit Framework - Ralph Loop (Task Execution)

```mermaid
sequenceDiagram
    participant U as Developer
    participant IMP as /implement
    participant RL as /ralph (Fresh Context)
    participant SK as Skill Registry
    participant CB as Codebase
    participant VER as T-FINAL Verification

    U->>IMP: /implement
    IMP->>IMP: Load tasks.md<br/>(ordered task list)

    loop For each task (max 3 iterations per task)
        IMP->>RL: Spawn fresh context<br/>(task description + plan excerpt)
        RL->>SK: Check skill manifest<br/>(match triggers to task)
        SK-->>RL: Active skills for this task
        RL->>CB: Read relevant files
        RL->>RL: Apply TDD cycle<br/>(Red → Green → Refactor)
        RL->>CB: Write implementation + tests
        RL->>VER: Run verification<br/>(lint + type-check + test)

        alt All checks pass
            VER-->>RL: PASS
            RL-->>IMP: Task complete
        else Checks fail (iteration < 3)
            VER-->>RL: FAIL (details)
            RL->>RL: Diagnose + fix
        else Checks fail (iteration = 3)
            VER-->>RL: FAIL
            RL-->>IMP: Task blocked<br/>(needs human review)
        end
    end

    IMP->>VER: T-FINAL composite gate<br/>(all tests + lint + types + build)
    VER-->>IMP: Final status
    IMP-->>U: Implementation complete<br/>+ evidence output
```
