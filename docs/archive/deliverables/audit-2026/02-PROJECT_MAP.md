# PROJECT MAP — AQLIYA
**Date:** 2026-06-20  
**Scope:** Complete repository structure visualization

---

## 1. Root Directory Map

```
AQLIYA/
├── src/                           # Application source code (1,975 files)
│   ├── app/                       # Next.js App Router
│   │   ├── (marketing)/           # Public marketing site
│   │   ├── (dashboard)/           # Authenticated workspace
│   │   ├── api/                   # API route handlers (19 groups)
│   │   ├── audit/                 # AuditOS workspace
│   │   ├── auditos/               # Public demo (AuditOS guided)
│   │   ├── local-content/         # LocalContentOS workspace
│   │   ├── sales/                 # SalesOS workspace
│   │   ├── contacts/              # LocalContactOS workspace
│   │   ├── decisions/             # DecisionOS workspace
│   │   ├── workflowos/            # WorkflowOS workspace
│   │   ├── office-ai/             # Office AI Assistant
│   │   ├── content-studio/        # Content Studio
│   │   ├── risk/                  # RiskOS
│   │   ├── en/                    # English marketing pages
│   │   ├── settings/              # Platform settings
│   │   ├── login/                 # Authentication
│   │   ├── signup/                # Registration
│   │   └── ...                    # Other routes
│   ├── actions/                   # Server Actions (77 files)
│   ├── components/                # UI components (329 files)
│   │   ├── audit/                 # AuditOS components (82)
│   │   ├── sales/                 # SalesOS components (82)
│   │   ├── local-content/         # LC components (24)
│   │   ├── enterprise/            # Enterprise components (32)
│   │   ├── ui/                    # shadcn/ui (20)
│   │   ├── workflowos/            # WorkflowOS components (19)
│   │   ├── platform/              # Platform components (13)
│   │   └── ...                    # Other domains
│   ├── lib/                       # Business logic (973 files)
│   │   ├── sales/                 # SalesOS (270) — LARGEST
│   │   ├── platform/              # Platform shared (195)
│   │   ├── audit/                 # AuditOS (140)
│   │   ├── local-content/         # LocalContentOS (89)
│   │   ├── ai/                    # AI engine (71)
│   │   ├── decision/              # DecisionOS (36)
│   │   ├── governance/            # Governance engine (25)
│   │   ├── auth/                  # Auth/security (17)
│   │   └── ...                    # Other domains
│   ├── core/                      # Core abstractions (12 files)
│   ├── __tests__/                 # Tests (44 files)
│   ├── __mocks__/                 # Test mocks (9 files)
│   ├── middleware.ts              # Auth middleware
│   ├── instrumentation.ts         # OpenTelemetry
│   └── types/                     # Type declarations
├── prisma/                        # Database (97 files)
│   ├── schema.prisma              # 220 models, 24 enums
│   ├── seed.ts                    # Main seed (64KB)
│   ├── seed-audit.ts              # AuditOS seed (76KB)
│   ├── seed-local-content.ts      # LC seed (32KB)
│   ├── seed-office-ai.ts          # Office AI seed (15KB)
│   ├── seed-sales.ts              # SalesOS seed (11KB)
│   └── migrations/                # 42 migrations
├── docs/                          # Documentation (2,284 files)
│   ├── official/                  # Doctrine (14 files)
│   ├── source-of-truth/           # Current state (26 files)
│   ├── theoretical-reference/     # Theory library (352 files)
│   ├── products/                  # Product docs (226 files)
│   ├── archive/                   # Historical (307 files)
│   ├── audits/                    # Audit evidence (131 files)
│   ├── reports/                   # Reports (286 files)
│   ├── releases/                  # Release programs (94 files)
│   ├── operations/                # Operations (89 files)
│   ├── pilot/                     # Pilot docs (62 files)
│   ├── review/                    # Review artifacts (55 files)
│   ├── systems/                   # System defs (38 files)
│   ├── validation/                # Validation (36 files)
│   ├── auditos/                   # AuditOS workspace (36 files)
│   └── ...                        # Other directories
├── knowledge-foundation/          # Knowledge base (364 files)
├── knowledge/                     # Knowledge references (11 files)
├── scripts/                       # Utility scripts (188 files)
├── uploads/                       # Uploaded files (432 files)
├── public/                        # Static assets (24 files)
├── infra/                         # Infrastructure configs (32 files)
├── .github/workflows/             # CI/CD pipelines (8 files)
├── .skills/                       # Agent skill system (~100 files)
│   ├── aqliya/                    # Operating skills (8)
│   ├── manifests/                 # Skill manifests (25)
│   ├── registry/                  # Skill registry
│   ├── governance/                # Access & lifecycle
│   └── workflows/                 # Composed workflows
├── .cursor/                       # Cursor IDE config
├── .husky/                        # Git hooks
├── .claude/                       # Claude worktree snapshots
├── AGENTS.md                      # Primary agent contract (1,767 lines)
├── CLAUDE.md                      # Secondary agent instructions
├── DOCUMENTATION_AUTHORITY.md     # Conflict resolution
├── README.md                      # Project README
├── Dockerfile                     # Container build
├── docker-compose.yml             # Local services
├── next.config.mjs                # Next.js configuration
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript configuration
└── ...
```

## 2. Layer Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│  src/app/ (routes, pages, layouts)                              │
│  src/components/ (React components)                              │
│  public/ (static assets)                                        │
├──────────────────────────────────────────────────────────────────┤
│                    ACTION LAYER                                   │
│  src/actions/ (Server Actions — 77 files)                       │
│  src/app/api/ (API Routes — 47 handlers)                        │
├──────────────────────────────────────────────────────────────────┤
│                    SERVICE LAYER                                  │
│  src/lib/ (domain services, business logic)                     │
│  src/core/ (abstractions: access, audit, evidence)              │
├──────────────────────────────────────────────────────────────────┤
│                    PERSISTENCE LAYER                              │
│  prisma/schema.prisma (220 models)                              │
│  prisma/seed*.ts (seed data)                                    │
│  uploads/ (file storage)                                        │
├──────────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE                                 │
│  Dockerfile, docker-compose.yml                                 │
│  .github/workflows/                                             │
│  infra/                                                         │
└──────────────────────────────────────────────────────────────────┘
```

## 3. Product Architecture

```
                    ┌─────────────────────────┐
                    │     AQLIYA CORE          │
                    │  Platform services       │
                    │  Auth / RBAC / Tenant    │
                    │  Audit / Evidence / AI   │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
    ┌────┴─────┐          ┌─────┴─────┐          ┌──────┴──────┐
    │ AuditOS  │          │LocalCont..│          │  SalesOS    │
    │ L5       │          │ L5        │          │  L4*        │
    └────┬─────┘          └─────┬─────┘          └──────┬──────┘
         │                       │                       │
    ┌────┴─────┐          ┌─────┴─────┐          ┌──────┴──────┐
    │DecisionOS│          │WorkflowOS │          │LocalCont..  │
    │ L4       │          │ L4        │          │ L4          │
    └────┬─────┘          └─────┬─────┘          └──────┬──────┘
         │                       │                       │
    ┌────┴─────┐          ┌─────┴─────┐          ┌──────┴──────┐
    │Office AI │          │Cont.Std.. │          │  RiskOS     │
    │ L4       │          │ L3        │          │  L2*        │
    └──────────┘          └───────────┘          └─────────────┘
```

## 4. Agent Architecture

```
                    ┌─────────────────────────┐
                    │     AGENTS.md            │
                    │  Primary Operating       │
                    │  Contract (1,767 lines)  │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         │                       │                       │
    ┌────┴─────┐          ┌─────┴─────┐          ┌──────┴──────┐
    │ CLAUDE.md│          │ .skills/   │          │  .cursor/   │
    │Secondary │          │ 8 skills   │          │ Rules+Hooks │
    │Reviewer  │          │ Augment    │          │ Low-load    │
    └──────────┘          └───────────┘          └─────────────┘
```

## 5. Key Dependency Chains

### User Journey: Login → Dashboard
```
/login → middleware.ts (JWT) → auth/[...nextauth] → session → dashboard layout
```

### Audit Engagement Workflow
```
audit/engagements/[id] → actions/audit-actions
  → lib/audit/ (services)
    → prisma (AuditEngagement + related models)
    → lib/platform/audit (audit logging)
```

### File Download with Security
```
client → api/audit/evidence/[id]/download
  → middleware (JWT + RBAC)
  → server action / handler (session verify)
  → lib/audit/storage (tenant guard + 404-safe)
  → download-token.ts (HMAC verify)
  → file response
```
