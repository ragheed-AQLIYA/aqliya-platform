# Full Folder Tree (Excluding Dependency/Build Internals)

```
AQLIYA/
│
├── .env                        # Environment variables (gitignored)
├── .env.example                # Env template (untracked)
├── .env.test.example           # Test env template (untracked)
├── .gitignore
├── .lighthouserc.json          # Lighthouse CI config
├── AGENTS.md                   # Agent context (v1.1)
├── README.md                   # Project root readme
├── components.json             # shadcn/ui config
├── cypress.config.ts           # Cypress E2E config
├── docker-compose.yml          # Docker Compose (test/CI)
├── docker-compose.test.yml     # Docker Compose test variant
├── Dockerfile                  # Docker build
├── eslint.config.mjs           # ESLint 9 flat config
├── jest.config.js              # Jest config
├── middleware.ts               # Next.js middleware (i18n routing)
├── next-env.d.ts               # Next.js TS env (generated)
├── next.config.mjs             # Next.js configuration
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── prisma.config.ts            # Prisma config
├── sentry.client.config.ts     # Sentry client config
├── sentry.edge.config.ts       # Sentry edge config
├── sentry.server.config.ts     # Sentry server config
├── tsconfig.json               # TypeScript config (strict)
├── tsconfig.tsbuildinfo        # TS build info (generated)
├── vercel.json                 # Vercel deployment config
│
├── .github/                    # CI/CD workflows (GitHub Actions)
├── .husky/                     # Git hooks (lint-staged)
├── .opencode/                  # OpenCode agent config
├── backups/                    # Manual backup storage
├── cypress/                    # E2E test suite
│   ├── e2e/                    #   Test specs
│   └── support/                #   Commands/support
│
├── docs/                       # === ALL DOCUMENTATION ===
│   ├── official/               #   [HIGHEST AUTHORITY] v1.1 official docs
│   ├── source-of-truth/        #   v1.0 aligned architecture/routes/taxonomy
│   ├── systems/                #   Per-system docs (AuditOS, DecisionOS, etc.)
│   ├── theoretical-reference/  #   Full theoretical foundation (21 sections)
│   ├── pilot/                  #   Pilot execution docs (live + historical)
│   ├── product/                #   Product definition packs
│   ├── reports/                #   Prior reports (stabilization, audits)
│   ├── commercial/             #   Commercial/demo materials
│   ├── commercial-pack/        #   Commercial pack (untracked)
│   ├── api/                    #   API documentation (untracked)
│   ├── company/                #   Company docs (untracked)
│   ├── content/                #   Website content drafts
│   ├── execution/              #   Engineering execution docs
│   ├── operations/             #   Operations/backup/CI docs
│   ├── runtime-prototypes/     #   Runtime/governance prototyping docs
│   ├── technical/              #   Technical audits (a11y, dark mode)
│   ├── releases/               #   Release notes
│   ├── prototype-planning/     #   Prototype specifications
│   ├── CONTRIBUTING.md         #   Contributing guide (untracked)
│   ├── DEVELOPER.md            #   Developer guide (untracked)
│   ├── README.md               #   Docs index
│   └── (numbered folders)      #   Legacy doc numbering (pre-v1.1)
│
├── i18n/                       # Internationalization config
│   └── request.ts              #   i18n request handler
│
├── messages/                   # Translation files
│   ├── ar.json                 #   Arabic (primary)
│   ├── en.json                 #   English
│   └── tr.json                 #   Turkish
│
├── prisma/                     # === DATABASE LAYER ===
│   ├── schema.prisma           #   Main schema (all models)
│   ├── migrations/             #   7 migration folders
│   ├── seed.ts                 #   Main seed
│   ├── seed-audit.ts           #   AuditOS seed
│   ├── prisma.config.ts        #   Config
│   └── dev.db                  #   SQLite dev DB (gitignored)
│
├── public/                     # === STATIC ASSETS ===
│   ├── brand/                  #   Logo kit (PNG, PDF, SVG, Favicons)
│   ├── *.svg                   #   Generic icons
│   └── sw.js                   #   Service worker (untracked)
│
├── scripts/                    # === UTILITY SCRIPTS ===
│   ├── audit-health-check.ts   #   AuditOS health
│   ├── backup-verify.ts        #   Data integrity
│   ├── backup.mjs              #   Backup (untracked)
│   ├── bundle-analyzer.js      #   Bundle analysis (untracked)
│   ├── db-backup.ts            #   DB backup (untracked)
│   ├── db-restore.ts           #   DB restore (untracked)
│   ├── inspect-findings.ts     #   Findings inspection
│   ├── performance-budget.mjs  #   Perf budget (untracked)
│   ├── phase20-*.ts            #   Phase 20-24 scoring scripts
│   ├── pilot-*.ts              #   Pilot monitoring scripts
│   ├── rtl-audit.ts            #   RTL direction audit
│   ├── turkish-qa.mjs          #   Turkish QA (untracked)
│   └── validate-env.mjs        #   Env validation
│
├── src/                        # === SOURCE CODE ===
│   ├── app/                    #   Next.js App Router
│   │   ├── (marketing)/        #     Public marketing pages
│   │   ├── (dashboard)/        #     Authenticated dashboard (DecisionOS)
│   │   ├── audit/              #     AuditOS workspace
│   │   ├── auditos/            #     AuditOS guided demo (public)
│   │   ├── sales/              #     SalesOS shell
│   │   ├── api/                #     API routes
│   │   ├── login/              #     Login page
│   │   ├── published/          #     Published recommendations
│   │   ├── access-denied/      #     Access denied page
│   │   ├── layout.tsx          #     Root layout
│   │   ├── globals.css         #     Global styles
│   │   ├── loading.tsx         #     Root loading
│   │   ├── not-found.tsx       #     404 page
│   │   ├── robots.ts           #     SEO
│   │   ├── sitemap.ts          #     SEO
│   │   ├── manifest.ts         #     PWA manifest
│   │   └── global-error.tsx    #     Global error boundary
│   │
│   ├── components/             #   React components
│   │   ├── ui/                 #     shadcn/ui primitives
│   │   ├── audit/              #     AuditOS components
│   │   ├── decisions/          #     DecisionOS components
│   │   ├── enterprise/         #     Shared enterprise components
│   │   ├── platform/           #     Platform shell components
│   │   ├── layout/             #     App layout components
│   │   ├── intelligence/       #     Intelligence indicators
│   │   ├── entity/             #     Entity components
│   │   ├── visuals/            #     Visual/diagram components
│   │   ├── workspace/          #     Workspace components
│   │   └── forms/              #     Form components
│   │
│   ├── actions/                #   Server Actions
│   │   ├── audit-*.ts          #     AuditOS actions
│   │   ├── decision-*.ts       #     DecisionOS actions
│   │   ├── approval.ts         #     Shared approval
│   │   ├── simulation.ts       #     Simulation actions
│   │   └── tender.ts           #     Tender actions
│   │
│   ├── lib/                    #   Business logic & engines
│   │   ├── ai/                 #     AI Orchestration Engine
│   │   ├── audit/              #     AuditOS domain logic
│   │   ├── decision/           #     DecisionOS domain logic
│   │   ├── governance/         #     Shared Governance Engine
│   │   ├── platform/           #     Platform services
│   │   ├── recommendation/     #     Recommendation Engine
│   │   ├── simulation/         #     Simulation Engine
│   │   ├── validation/         #     Zod validation schemas
│   │   ├── auth.ts             #     Auth configuration
│   │   ├── auth-config.ts      #     Auth config
│   │   ├── auth-next.ts        #     NextAuth integration
│   │   ├── prisma.ts           #     Prisma client singleton
│   │   ├── utils.ts            #     Shared utilities
│   │   ├── platform-audit.ts   #     Platform audit helpers
│   │   └── decision-type-config.ts
│   │
│   ├── types/                  #   TypeScript types
│   │   ├── audit/              #     Audit domain types
│   │   └── plausible.d.ts      #     Plausible analytics types
│   │
│   ├── __mocks__/              #   Jest module mocks
│   ├── __tests__/              #   Tests
│   ├── middleware-rate-limit.ts #   Rate limiting middleware
│   ├── middleware-security.ts   #   Security middleware
│   └── instrumentation.ts      #   Next.js instrumentation
│
└── (excluded)
    ├── node_modules/           #   Dependency packages (~700MB)
    ├── .next/                  #   Next.js build output
    ├── coverage/               #   Test coverage (if exists)
    └── .git/                   #   Git internals
```

## Excluded Folders

| Folder | Reason |
|--------|--------|
| `node_modules/` | Third-party dependencies; not part of project source |
| `.next/` | Next.js build output; generated |
| `coverage/` | Test coverage reports; generated |
| `.git/` | Git internal database |
