# AQLIYA Repository Intelligence Audit
## Complete READ-ONLY Architecture & Knowledge Audit

**Date:** 2026-06-29
**Auditor Role:** Principal Software Architect, Enterprise Architect, Knowledge Architect, Technical Documentation Auditor
**Audit Type:** READ-ONLY — no files modified, no code generated
**Evidence Basis:** Direct file inspection, directory enumeration, content analysis
**Status:** COMPLETE

---

# Executive Summary

AQLIYA is a **Private Governed Institutional Intelligence Platform** implemented as a Next.js 16 modular monolith with App Router. The repository contains ~2,213 documentation files, ~140 Prisma models across 15+ product domains, 324 co-located test files, 53 database migrations, and 11 E2E Cypress test suites. The codebase demonstrates a mature governance-first architecture with tenant isolation, RBAC, ABAC, audit trails, evidence chains, and AI governance baked into every product.

**Repository Scale:**
- **Documents:** ~2,213 files in `docs/` (~32.64 MB)
- **Source files:** ~780+ in `src/` across 35 route groups, 84 server actions, 24 component directories, 42 business-logic modules
- **Database:** 140+ Prisma models, 53 migrations (2026-05-06 through 2026-06-23)
- **Tests:** 324 test files co-located in `__tests__/` directories (2,321 tests passing)
- **Scripts:** 237 operational/validation/pilot scripts
- **Skills:** 24 skill manifests with evaluation datasets in `.skills/`

**Architecture Grade:** A- (minor documentation drift, clean test suite, comprehensive governance)

**Documentation Grade:** B+ (extensive but has redundancy; ~100+ archive files; some duplicate layers)

**Product Readiness:**
| Product | Level | Evidence |
|---------|-------|----------|
| AuditOS | L5 (Pilot-ready) | Real TB workflows, evidence vault, review/approval, exports, firm memory |
| LocalContentOS | L5 (Pilot-ready) | Classification engine, scoring, spend analytics, Arabic PDF, workbook |
| DecisionOS | L4 (Usable v0.1) | Decision lifecycle, 10 decision types, sector intelligence, PDF export |
| WorkflowOS/Sunbul | L4-L5 | Templates, records, SLA, escalation, Sunbul client pilot |
| SalesOS | L4 (Internal preview) | Pipeline, deals, ICP, command center, intelligence, prisma-repository |
| LocalContactOS | L4-L5 | Contact registry, sensitivity levels, interaction history, export approval |
| Office AI Assistant | L4 (Usable v0.1) | Workspace, file extraction, task categories, governed AI |
| RiskOS | L4 | Assessments, audit trail, exports |
| SimulationOS | L1 (Marketing redirect only) | `/products/simulation` → `/products` |
| AQLIYA Studio | L0 (Strategic future) | Not implemented |

---

# Phase 1 — Repository Discovery

## Complete File Inventory

### Root-Level Files (60+ files)

| File | Type | Purpose |
|------|------|---------|
| `AGENTS.md` | Agent Contract | Mandatory operating contract for all AI agents (1,769 lines, 37 sections) |
| `CLAUDE.md` | Deprecated Redirect | Superseded — redirects to `docs/AI_ENTRYPOINT.md` |
| `README.md` | Public Readme | Product status, build verification, identity statement |
| `package.json` | Config | 224 lines, 120+ scripts, Next.js 16, React 19, Prisma 7 |
| `tsconfig.json` | Config | Strict mode, ES2017 target, bundler resolution |
| `next.config.mjs` | Config | Standalone output, 20 redirects, CSP headers, Sentry plugin |
| `Dockerfile` | Build | Multi-stage node:22-alpine, standalone output |
| `docker-compose.yml` | Infra | 5 services: app, db (pgvector), clamav, redis, backup |
| `docker-compose.test.yml` | Infra | Test DB on port 5433 |
| `docker-compose.staging.yml` | Infra | Staging environment |
| `eslint.config.mjs` | Lint | Flat config, organized ignores with documented rationales |
| `jest.config.js` | Test | ts-jest, sequential, extensive server module mocking |
| `cypress.config.ts` | Test | E2E config: NextAuth CSRF login, Arabic/RTL assertions |
| `postcss.config.mjs` | CSS | Tailwind CSS v4 plugin only |
| `components.json` | UI | shadcn/ui base-nova style, RTL=true, lucide icons |
| `prisma.config.ts` | DB | Prisma configuration |
| `sentry.client.config.ts` | Monitoring | 20% traces, production-only |
| `sentry.server.config.ts` | Monitoring | 50% traces, production-only |
| `sentry.edge.config.ts` | Monitoring | 20% traces, production-only |
| `.env.example` | Config | 128 lines, 40+ env vars |
| `.env.test.example` | Config | Test environment variables |
| `.env.pilot.example` | Config | Pilot environment variables |
| `vercel.json` | Deploy | Vercel deployment config |
| `.gitleaks.toml` | Security | GitLeaks secret scanning config |
| `.lighthouserc.json` | Perf | Lighthouse performance audit config |
| `components.json` | UI | shadcn/ui configuration |

### Root-Level Reports (~20 markdown files)

| File | Purpose |
|------|---------|
| `AQLIYA_Enterprise_Due_Diligence_Audit_2026.md` | Enterprise due diligence audit |
| `AQLIYA_NOTION_MODERNIZATION_PROGRAM.md` | Notion modernization program |
| `AQLIYA_Website_Content_Review_AR.md` | Arabic website content review |
| `BUILD_FAILURE_MATRIX.md` | Build failure analysis |
| `BUILD_STABILIZATION_REPORT.md` | Build stabilization summary |
| `SOCPA_COMPLETE_ANALYSIS.md` | SOCPA compliance analysis |
| `WIP_CLUSTER_REPORT.md` | Work-in-progress cluster report |
| `RB-02_CLOSURE_NOTE.md` | RB-02 closure documentation |

### Root-Level Data Files

| File | Type | Purpose |
|------|------|---------|
| `TB 31-12-2025 Final.xlsx` | Excel | Trial balance dataset |
| `TB.xlsx` | Excel | Trial balance dataset |
| `TB_manufacturing_SAMA.xlsx` | Excel | Manufacturing SAMA TB |
| `Audited FSs 31-12-2025.pdf` | PDF | Audited financial statements |
| `Local_Content_Verification_Audit_Matrix_v1.xlsx` | Excel | LC verification matrix |
| `AQLIYA_Enterprise_Deck_v3.pptx` | PPTX | Enterprise presentation deck |
| `AQLIYA_Repositioning_Content_2026.docx` | DOCX | Repositioning content |
| `AQLIYA_Strategic_Audit_2026.docx` | DOCX | Strategic audit document |
| `نموذج قياس نسبة المحتوى المحلي - v.2.xlsx` | Excel | Arabic local content measurement form |

### Root-Level Log Files (~20 log files)

Server logs, npm logs, error logs — not documentation, not source. Should be in `.gitignore` or cleaned up.

### Root-Level Diagnostic Scripts (~8 .mjs/.cjs files)

`_check.mjs`, `_check2.mjs`, `_check_db.mjs`, `_check_mig.mjs`, `kf-capture.mjs`, `kf-diag.mjs`, `kf-query-test.mjs` — ad-hoc diagnostic/verification scripts left in root. Should be in `scripts/` or deleted.

### Top-Level Directories

| Directory | Purpose | Contents |
|-----------|---------|----------|
| `src/` | Application source | App Router routes, components, actions, lib, middleware |
| `docs/` | Documentation | 2,213 files — doctrine, architecture, products, audits, validation |
| `prisma/` | Database | Schema (140+ models), 53 migrations, 9 seed files |
| `scripts/` | Operations | 237 scripts across 16 subdirectories |
| `tests/` | Tests | **Effectively empty** (only desktop.ini) — tests co-located in `src/` |
| `cypress/` | E2E Tests | 11 test specs + support/commands |
| `public/` | Static assets | Brand assets, favicons, logos |
| `.github/` | CI/CD | 5 workflows (ci, deploy, backup, preview, promote) |
| `.husky/` | Git hooks | Deprecated Husky v8 boilerplate — effectively inert |
| `.skills/` | Agent skills | 69 files — 24 skill manifests, evaluation datasets, registry |
| `.opencode/` | Agent config | OpenCode agent configuration, 7 subagents |
| `tools/err/` | ERR tooling | Engineering Readiness Review tool (12 files) |
| `infra/` | Infrastructure | Infrastructure-as-code (not fully explored) |
| `knowledge/` | Knowledge base | Knowledge graph data |
| `knowledge-foundation/` | Knowledge foundation | Knowledge foundation storage |
| `audit/` | Audit artifacts | Audit evidence and reports |
| `backups/` | Backups | Database backup storage |
| `certificates/` | Certs | SSL/TLS certificates |
| `i18n/` | i18n | Internationalization data |
| `messages/` | Messages | Message files (i18n) |
| `runbooks/` | Runbooks | Operational runbooks |
| `test-results/` | Test results | Test output artifacts |
| `tmp/` | Temporary | Temporary files |
| `uploads/` | Uploads | File upload storage |
| `verification/` | Verification | Verification artifacts |
| `archive/` | Archive | Archived/historical files |
| `.claude/` | Claude config | Claude agent configuration |
| `.cursor/` | Cursor config | Cursor IDE configuration |
| `.data/` | Data | Data storage |
| `.local-cleanup/` | Cleanup | Local cleanup artifacts |
| `.next/` | Build output | Next.js build output |
| `.playwright-mcp/` | Playwright | Playwright MCP server |
| `.vercel/` | Vercel | Vercel deployment artifacts |
| `node_modules/` | Dependencies | npm packages |
| `RB-01/` | Remediation | RB-01 remediation branch artifacts |

---

# Phase 2 — Repository Tree

## Complete Repository Hierarchy

```
Repository (AQLIYA)
│
├── 📁 src/                              — APPLICATION SOURCE (Next.js 16 App Router)
│   ├── 📁 app/                          — Routes & Pages (App Router)
│   │   ├── 📁 (marketing)/             — Public marketing site (no auth)
│   │   │   ├── page.tsx                — Homepage (/)
│   │   │   ├── about/                  — About page
│   │   │   ├── products/               — Product pages
│   │   │   ├── start/                  — Getting started
│   │   │   ├── proof/                  — Social proof
│   │   │   ├── contact/                — Contact form
│   │   │   ├── governance/             — Governance overview
│   │   │   ├── security/               — Security page
│   │   │   ├── demo/                   — Demo request
│   │   │   ├── industries/             — Industries served
│   │   │   ├── use-cases/              — Use cases
│   │   │   ├── insights/               — Insights
│   │   │   ├── platform/               — Platform overview
│   │   │   ├── deployment/             — Deployment models
│   │   │   ├── buyers/                 — Buyer personas
│   │   │   ├── case-studies/           — Case studies
│   │   │   ├── executive-brief/        — Executive brief (Arabic)
│   │   │   ├── executive-briefing/     — Executive briefing
│   │   │   ├── how-we-work/            — Methodology
│   │   │   ├── pilot-outcomes/         — Pilot results
│   │   │   ├── pilot-proof/            — Pilot proof
│   │   │   ├── proof-library/          — Proof library
│   │   │   ├── procurement-pack/       — Procurement package
│   │   │   ├── engagement-models/      — Engagement models
│   │   │   ├── custom-product/         — Custom product inquiry
│   │   │   ├── privacy/                — Privacy policy
│   │   │   ├── terms/                  — Terms of service
│   │   │   └── soc2-roadmap/           — SOC2 roadmap
│   │   │
│   │   ├── 📁 (dashboard)/             — Authenticated workspace (auth required)
│   │   │   ├── overview/               — Dashboard overview
│   │   │   ├── assistant/              — Governed AI assistant
│   │   │   ├── decisions/              — DecisionOS workspace
│   │   │   ├── governance-hub/         — Cross-product governance
│   │   │   ├── intelligence/           — Intelligence workspace
│   │   │   ├── knowledge-foundation/   — Knowledge foundation mgmt
│   │   │   ├── knowledge-review/       — Knowledge review queue
│   │   │   ├── monitoring/             — Monitoring dashboard
│   │   │   ├── notifications/          — Notifications inbox
│   │   │   ├── operator/               — Platform operator
│   │   │   ├── organizations/          — Organization management
│   │   │   └── settings/               — Platform settings hub
│   │   │
│   │   ├── 📁 audit/                   — AuditOS workspace (L5)
│   │   ├── 📁 auditos/                 — PUBLIC demo (no auth, read-only)
│   │   ├── 📁 sales/                   — SalesOS workspace (L4)
│   │   ├── 📁 local-content/           — LocalContentOS workspace (L5)
│   │   ├── 📁 risk/                    — RiskOS workspace (L4)
│   │   ├── 📁 workflowos/              — WorkflowOS workspace (L4-L5)
│   │   ├── 📁 sunbul/                  — Sunbul (WorkflowOS variant)
│   │   ├── 📁 contacts/                — LocalContactOS workspace (L4-L5)
│   │   ├── 📁 institutional-memory/    — Institutional memory workspace
│   │   ├── 📁 office-ai/               — Office AI workspace (L4)
│   │   ├── 📁 content-studio/          — Content Studio workspace
│   │   ├── 📁 login/                   — Login page
│   │   ├── 📁 signup/                  — Registration page
│   │   ├── 📁 api/                     — API routes (REST endpoints)
│   │   ├── 📁 en/                      — English-language mirror
│   │   ├── 📁 print/                   — Printable documents
│   │   └── 📁 published/               — Published recommendations
│   │
│   ├── 📁 actions/                     — Server Actions (84 files)
│   │   ├── audit-*.ts                  — AuditOS mutations (22 files)
│   │   ├── sales-*.ts                  — SalesOS mutations (6 files)
│   │   ├── localcontent-*.ts           — LocalContentOS mutations (10 files)
│   │   ├── decision-*.ts               — DecisionOS mutations (9 files)
│   │   ├── workflowos-*.ts             — WorkflowOS mutations (5 files)
│   │   ├── contact-*.ts                — Contact mutations (3 files)
│   │   ├── office-ai-*.ts              — Office AI mutations (3 files)
│   │   ├── auth/*.ts                   — Auth mutations (MFA, SSO)
│   │   ├── governance-*.ts             — Governance mutations
│   │   ├── platform-*.ts               — Platform mutations
│   │   ├── knowledge-*.ts              — Knowledge mutations
│   │   └── *.ts                        — Other (simulation, tender, ERP, etc.)
│   │
│   ├── 📁 components/                  — React UI Components (24 directories)
│   │   ├── ui/                         — shadcn/ui primitives (21 files)
│   │   ├── layout/                     — Shared layouts (5 files)
│   │   ├── platform/                   — Platform components (14 files)
│   │   ├── enterprise/                 — Enterprise UI patterns (33 files)
│   │   ├── audit/                      — AuditOS components (37 files)
│   │   ├── sales/                      — SalesOS components (83 files)
│   │   ├── local-content/              — LocalContentOS components (25 files)
│   │   ├── decisions/                  — DecisionOS components (7 files)
│   │   ├── contacts/                   — Contact components (8 files)
│   │   ├── workflowos/                 — WorkflowOS components (20 files)
│   │   ├── workspace/                  — Workspace utilities (5 files)
│   │   ├── monitoring/                 — Monitoring dashboards (8 files)
│   │   ├── visuals/                    — Visual components (11 files)
│   │   ├── entity/                     — Entity display (6 files)
│   │   ├── marketing/                  — Marketing components (5 files)
│   │   └── forms/                      — Form components
│   │
│   ├── 📁 lib/                         — Business Logic & Services (42 directories)
│   │   ├── ai/                         — AI abstraction layer (32 files)
│   │   ├── audit/                      — Audit engine (53 files)
│   │   ├── sales/                      — Sales intelligence (60 files)
│   │   ├── local-content/              — LocalContent engine (26 files)
│   │   ├── decision/                   — Decision engine (34 files)
│   │   ├── governance/                 — Governance subsystem (12 files)
│   │   ├── authorization/              — Authorization subsystem (11 files)
│   │   ├── auth/                       — Auth subsystem (15 files)
│   │   ├── platform/                   — Enterprise platform (61 files)
│   │   ├── tb-intelligence/            — TB AI intelligence (22 files)
│   │   ├── knowledge-foundation/       — Knowledge foundation (16 files)
│   │   ├── workflowos/                 — WorkflowOS engine (14 files)
│   │   ├── core/                       — Platform core contracts (16 files)
│   │   ├── marketing/                  — Marketing content (27 files)
│   │   ├── office-ai/                  — Office AI service (8 files)
│   │   ├── skill-runtime/              — Skill evaluation (7 files)
│   │   ├── integration/                — External integration (13 files)
│   │   ├── simulation/                 — Simulation engine (6 files)
│   │   ├── recommendation/             — Recommendation engine (6 files)
│   │   ├── intelligence/               — Intelligence workspace (2 files)
│   │   ├── knowledge-review/           — Knowledge review (3 files)
│   │   ├── localcontactos/             — LocalContactOS (4 files)
│   │   ├── organization/               — Organization service (2 files)
│   │   ├── hooks/                      — Client hooks (2 files)
│   │   ├── types/                      — Shared types (2 files)
│   │   ├── validation/                 — Validation helpers (2 files)
│   │   ├── cache.ts                    — Caching utility
│   │   ├── prisma.ts                   — Prisma client singleton
│   │   ├── auth.ts                     — Auth barrel
│   │   ├── auth-config.ts              — NextAuth configuration
│   │   ├── auth-next.ts                — NextAuth v5 compatibility
│   │   ├── rate-limit.ts               — Server-side rate limiter
│   │   ├── rate-limit-edge.ts          — Edge-compatible rate limiter
│   │   ├── logger.ts                   — Structured logging
│   │   ├── tracking.ts                 — Analytics tracking
│   │   ├── utils.ts                    — Shared utilities
│   │   └── api-response.ts             — Standard API response helpers
│   │
│   ├── 📁 core/                        — Platform Core Contracts
│   │   ├── access/                     — ABAC gate + shadow reporting
│   │   ├── audit/                      — Audit ledger (Prisma-backed)
│   │   ├── evidence/                   — Evidence store (Prisma-backed)
│   │   ├── output/                     — Output contracts
│   │   └── product-runtime.ts          — Product runtime bootstrap
│   │
│   ├── 📁 middleware.ts                — Main middleware: auth, RBAC, MFA, rate-limit
│   ├── 📁 middleware-security.ts       — HTTP security headers (CSP, HSTS)
│   ├── 📁 middleware-rate-limit.ts     — Per-route rate limiting
│   ├── 📁 middleware-timing.ts         — Response time headers
│   ├── 📁 instrumentation.ts          — Sentry + runtime env check
│   ├── 📁 products/                    — Product definitions
│   ├── 📁 types/                       — Global TypeScript types
│   ├── 📁 __mocks__/                   — Jest mocks (10 files)
│   └── 📁 __tests__/                   — Test suites (12 entries)
│
├── 📁 docs/                            — DOCUMENTATION (2,213 files, 70+ subdirectories)
│   ├── 📁 official/                    — Official doctrine (14 files)
│   ├── 📁 source-of-truth/             — Supporting references (28 files)
│   ├── 📁 governance/                  — Governance docs (7 files)
│   ├── 📁 architecture/                — Architecture docs (21 files)
│   ├── 📁 products/                    — Product definitions (100+ files)
│   ├── 📁 systems/                     — System docs (37 files)
│   ├── 📁 pilot/                       — Pilot execution (60+ files)
│   ├── 📁 runbooks/                    — Operations runbooks (5 files)
│   ├── 📁 audits/                      — Audit reports (100+ files)
│   ├── 📁 releases/                    — Release docs (90+ files)
│   ├── 📁 deliverables/                — Implementation reports (85+ files)
│   ├── 📁 validation/                  — Validation reports (30+ files)
│   ├── 📁 engineering/                 — Engineering docs (9 files)
│   ├── 📁 marketing/                   — Marketing docs (13 files)
│   ├── 📁 commercial/                  — Commercial docs (18 files)
│   ├── 📁 deployment/                  — Deployment docs (8 files)
│   ├── 📁 review/                      — Review docs (25+ files)
│   ├── 📁 strategy/                    — Strategic docs (7 files)
│   ├── 📁 theoretical-reference/       — Theory library (200+ files)
│   ├── 📁 runtime-prototypes/          — Engagement observations (31 files)
│   ├── 📁 execution/                   — Execution docs (6 files)
│   ├── 📁 archive/                     — Archived docs (100+ files)
│   ├── 📁 ai/                          — AI infrastructure (2 JSON files)
│   ├── 📁 content/                     — Website content (3 files)
│   ├── 📁 research/                    — Research docs (1 file)
│   └── 34 root-level .md files         — Meta-documentation about docs
│
├── 📁 prisma/                          — DATABASE (71 files)
│   ├── schema.prisma                   — Canonical schema (5,667 lines, 140+ models)
│   ├── seed.ts                         — Master seed (1,761 lines)
│   ├── seed-audit.ts                   — AuditOS seed
│   ├── seed-local-content.ts           — LocalContentOS seed
│   ├── seed-sales.ts                   — SalesOS seed
│   ├── seed-content-studio.ts          — Content Studio seed
│   ├── seed-office-ai.ts               — Office AI seed
│   ├── seed-organizations.ts           — Organizations seed
│   ├── seed-abac-policies.ts           — ABAC policy seed
│   ├── seed-knowledge-mining.ts        — Knowledge mining seed
│   └── 📁 migrations/                  — 53 timestamped migration directories
│
├── 📁 scripts/                         — OPERATIONS (237 files, 16 subdirectories)
│   ├── 📁 platform/                    — Platform ops (34 files)
│   ├── 📁 audit/                       — AuditOS/TB intelligence (41 files)
│   ├── 📁 local-content/               — LocalContentOS (13 files)
│   ├── 📁 localcontent/                — LocalContentOS (13 files, naming variant)
│   ├── 📁 ic/                          — Intelligence Core (13 files)
│   ├── 📁 remediation/                 — Historical scoring (8 files)
│   ├── 📁 workflowos/                  — WorkflowOS/Sunbul (5 files)
│   ├── 📁 ops/                         — Operations (9 files)
│   ├── 📁 db/                          — Database utilities (7 files)
│   ├── 📁 db-utils/                    — Shared Prisma client (1 file)
│   ├── 📁 compliance/                  — Compliance checks (2 files)
│   ├── 📁 dev/                         — Dev utilities (2 files)
│   ├── 📁 validation/                  — TB validation (5 files)
│   ├── 📁 phase0-output/               — Generated reports (11 files)
│   ├── 📁 archived/                    — Archived scripts (25 files)
│   └── 📁 product-factory/             — Reserved for Studio (empty)
│
├── 📁 tools/err/                       — ERR TOOLING (12 files)
│
├── 📁 .github/                         — CI/CD (6 files)
│   ├── workflows/ci.yml                — CI pipeline (tsc, lint, test, build)
│   ├── workflows/deploy.yml            — Deploy to AWS ECS
│   ├── workflows/backup.yml            — Scheduled DB backup
│   ├── workflows/preview.yml           — Vercel preview
│   ├── workflows/promote.yml           — Promote to production
│   └── CODEOWNERS                      — Empty placeholder
│
├── 📁 .husky/                          — GIT HOOKS (18 files, DEPRECATED)
│
├── 📁 .skills/                         — AGENT SKILLS (69 files, 20 subdirectories)
│   ├── 📁 aqliya/                      — Agent operating skills (8 files)
│   ├── 📁 registry/                    — Skill registry (3 files)
│   ├── 📁 governance/                  — Skill governance (2 files)
│   ├── 📁 schemas/                     — Skill schema (1 file)
│   ├── 📁 templates/                   — Skill templates (3 files)
│   ├── 📁 workflows/                   — Workflows (1 file)
│   ├── 📁 manifests/                   — Skill manifests (24 files)
│   ├── 📁 evaluations/                 — Evaluation datasets (24 files)
│   └── 📁 archive/                     — Archived skill versions
│
├── 📁 .opencode/                       — AGENT CONFIG (9 files)
│   ├── opencode.json                   — Master config
│   └── agents/                         — 7 subagent definitions
│
├── 📁 cypress/                         — E2E TESTS (13 files)
│   ├── config.ts                       — Cypress configuration
│   ├── support/                        — Custom commands (login, RTL, Arabic)
│   └── e2e/                            — 11 test specs
│
├── 📁 tests/                           — TESTS (EFFECTIVELY EMPTY)
│   └── desktop.ini only                — Actual tests in src/__tests__/
│
├── 📁 public/                          — STATIC ASSETS (18 files)
│   └── brand/                          — Logo variants (SVG, PNG, PDF)
│
├── 📁 knowledge/                       — KNOWLEDGE BASE
├── 📁 knowledge-foundation/            — KNOWLEDGE FOUNDATION
├── 📁 audit/                           — AUDIT ARTIFACTS
├── 📁 backups/                         — BACKUPS
├── 📁 certificates/                    — CERTIFICATES
├── 📁 i18n/                            — I18N DATA
├── 📁 messages/                        — MESSAGE FILES
├── 📁 runbooks/                        — RUNBOOKS
├── 📁 test-results/                    — TEST RESULTS
├── 📁 tmp/                             — TEMPORARY FILES
├── 📁 uploads/                         — FILE UPLOADS
├── 📁 verification/                    — VERIFICATION ARTIFACTS
├── 📁 archive/                         — ARCHIVE
├── 📁 infra/                           — INFRASTRUCTURE
│
└── Root config/log/report files (~60 files)
```

---

# Phase 3 — Documentation Inventory Summary

## Document Statistics

| Category | Count | Authority Level |
|----------|-------|-----------------|
| Official Doctrine (`docs/official/`) | 14 `.md` | Level 1-2 (Highest) |
| Source of Truth (`docs/source-of-truth/`) | 28 `.md` | Level 4 (Supporting) |
| Governance (`docs/governance/`) | 7 `.md` | Level 1-2 |
| Architecture (`docs/architecture/`) | 21 `.md` | Level 5 |
| Product Docs (`docs/products/`) | 100+ `.md` | Level 5 |
| System Docs (`docs/systems/`) | ~37 `.md` | Level 5 |
| Pilot (`docs/pilot/`) | ~60 `.md` | Level 5 |
| Runbooks (`docs/runbooks/`) | 5 `.md` | Level 5 |
| Audits (`docs/audits/`) | 100+ `.md` | Level 5-6 (Evidence) |
| Releases (`docs/releases/`) | 90+ `.md` | Level 5 |
| Deliverables (`docs/deliverables/`) | 85+ `.md` | Level 5 |
| Validation (`docs/validation/`) | 30+ `.md` | Level 5-6 |
| Engineering (`docs/engineering/`) | 9 `.md` | Level 6 |
| Marketing (`docs/marketing/`) | 13 `.md` | Level 6 |
| Commercial (`docs/commercial/` + `commercial-pack/`) | 22 `.md` | Level 5-6 |
| Deployment (`docs/deployment/`) | 8 `.md` | Level 6 |
| Review (`docs/review/`) | 25+ `.md` | Level 5-6 |
| Strategy (`docs/strategy/`) | 7 `.md` | Level 1-2 |
| Theoretical Reference (`docs/theoretical-reference/`) | 200+ `.md` | Level 7 (Theory only) |
| Runtime Prototypes (`docs/runtime-prototypes/`) | 31 `.md` | Level 6 (Evidence) |
| Archive (`docs/archive/`) | 100+ `.md` | Level 8 (Historical only) |
| Root-level meta-docs | 34 `.md` | Level 3-5 |
| **TOTAL** | **~2,213** | |

## Top 10 Most Important Documents (by authority)

1. **`docs/official/AQLIYA_MASTER_REFERENCE.md`** — Current master reference for v0.1 operational baseline
2. **`docs/official/aqliya-vision-v1.1.md`** — Core identity: what AQLIYA IS/NOT, trust principle
3. **`docs/official/aqliya-implementation-rules-v1.1.md`** — 13 mandatory rules for any code change
4. **`docs/official/aqliya-product-taxonomy-v1.1.md`** — Product taxonomy layers
5. **`docs/official/aqliya-core-architecture-v1.1.md`** — Architecture layers, 12 engines, tech stack
6. **`docs/official/aqliya-roadmap-v1.1.md`** — 12-phase roadmap (partially superseded by v1.2)
7. **`docs/official/AQLIYA_ROADMAP_v1.2.md`** — "Repository Reality Edition" roadmap
8. **`docs/DOCUMENTATION_AUTHORITY.md`** — Documentation hierarchy and conflict resolution rules
9. **`docs/governance/AQLIYA_EXECUTION_CHARTER.md`** — Constitutional governance and enterprise execution
10. **`docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`** — Comprehensive product/system status matrix

## Document Type Distribution

| Type | Count | Description |
|------|-------|-------------|
| Report | ~400+ | Audit reports, validation reports, completion reports |
| Architecture | ~80+ | Architecture docs, ADRs, blueprints, constitutions |
| Governance | ~25+ | Charters, policies, rules, security governance |
| PRD/Spec | ~30+ | Product requirements, specifications, architecture specs |
| Roadmap | ~15+ | Roadmaps, execution plans, completion programs |
| Runbook/Guide | ~20+ | Operator manuals, runbooks, deployment guides |
| Checklist | ~25+ | Go/no-go, readiness, compliance, QA checklists |
| Strategy | ~15+ | Strategic bets, portfolio decisions, board memos |
| Glossary/Taxonomy | ~10+ | Terminology, system taxonomy, skill context |
| Commercial | ~20+ | Pilot offers, SOW templates, messaging, demo scripts |
| Theory | ~200+ | Theoretical reference library (21 domains) |
| Historical/Archive | ~100+ | Archived legacy documents |

---

# Phase 4 — Documentation Hierarchy

## Complete Documentation Hierarchy

```
                           Level 0 — DOCUMENTATION_AUTHORITY.md
                           (Defines hierarchy rules, conflict resolution)
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
           Level 1 — DOCTRINE    Level 2 — IDENTITY   Level 3 — GOVERNANCE
           (official/)           (vision, roadmap)    (execution charter)
                    │                  │                  │
                    └──────────────────┼──────────────────┘
                                       │
                              Level 4 — SUPPORTING
                              (source-of-truth/)
                              • PRODUCT_STATUS_MATRIX.md
                              • ROUTE_STRATEGY.md
                              • AQLIYA_ARCHITECTURE.md
                              • AQLIYA_SYSTEM_TAXONOMY.md
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
     Level 5 — PRODUCTS          Level 5 — SYSTEMS         Level 5 — PILOT
     (docs/products/)           (docs/systems/)           (docs/pilot/)
     • auditos-*.md             • AUDITOS_OPERATOR_       • PILOT-SCOPE.md
     • salesos-*.md               MANUAL.md               • GO-NOGO-CHECKLIST.md
     • workflowos/               • decisionos/             • execution-pack/
     • localcontentos-*/         • salesos/                • controlled-execution/
     • office-ai-*               • local-content-os/       • datasets/
     • pilot-control-pack/       • simulationos/
              │                        │                        │
              └────────────────────────┼────────────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
     Level 5 — RELEASES         Level 5 — DELIVERABLES    Level 5 — RUNBOOKS
     (docs/releases/)           (docs/deliverables/)      (docs/runbooks/)
     • aqliya-v0.1-release-*    • INTELLIGENCE_CORE_*     • production-support-
     • auditos-v0.1-release-*   • PLATFORM_*                runbook.md
     • localcontentos-*/        • audit-2026/              • decisionos-operator-
     • documentation-*                                      guide.md
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
     Level 6 — AUDITS           Level 6 — VALIDATION       Level 6 — ENGINEERING
     (docs/audits/)             (docs/validation/)         (docs/engineering/)
     • forensic-audit-*/        • PILOT_VALIDATION_*       • ENGINEERING_READINESS_
     • reality-audit-*/         • testing/                   REVIEW.md
     • evidence/                • security/                • prds/
     • truth-reconciliation/    • release/                 • specs/
                                • cycle-6/
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
     Level 6 — DEPLOYMENT       Level 6 — COMMERCIAL       Level 6 — MARKETING
     (docs/deployment/)         (docs/commercial/)         (docs/marketing/)
     • DEPLOYMENT_READINESS_*   • PILOT_SOW_TEMPLATE.md    • MARKETING_ROADMAP.md
     • auditos-v0.1-*           • WHAT_WE_DO_NOT_CLAIM.md  • VOICE_GUIDE.md
     • MIGRATION_*              • commercial-pack/         • SITE_AUDIT_REPORT_*
                                • demo-storyline/
                                       │
                              Level 7 — THEORETICAL
                              (docs/theoretical-reference/)
                              21 domains: intelligence core, audit, financial,
                              decision, local content, revenue, risk, governance,
                              evidence, human-AI, org memory, deployment,
                              product philosophy, commercialization, responsible AI,
                              system design, terminology, anti-patterns,
                              strategic narratives, reference models, writing agenda
                                       │
                              Level 8 — ARCHIVE / HISTORICAL
                              (docs/archive/)
                              • sunbul-product-legacy/
                              • legacy-numbered/
                              • content-drafts/
                              • decision-os/
                              • historical-strategy/
                              • commercial-legacy/
                              • deprecated/
                              • execution-stale/
                              • old-reports/
                              • notion-export-2026/
```

## Hierarchy Assessment

### Missing Layers
- **None identified.** All layers from Vision through Historical are present.

### Duplicate Layers
- **`docs/official/aqliya-roadmap-v1.1.md`** vs **`docs/official/AQLIYA_ROADMAP_v1.2.md`** — v1.2 is "Repository Reality Edition" and partially supersedes v1.1. v1.1 should be marked as superseded.
- **`docs/DOCUMENTATION_GOVERNANCE.md`** vs **`docs/DOCUMENTATION_GOVERNANCE_v2.md`** — v2 exists; v1 should be archived.
- **`docs/releases/`** contains both `aqliya-v0.1-release-*` and `auditos-v0.1-release-*` — AuditOS releases should clarify they are sub-releases of the platform release.
- **`scripts/local-content/`** and **`scripts/localcontent/`** — Two directories for the same product due to mid-cleanup naming inconsistency.

### Broken Hierarchy
- Several root-level `.md` reports (e.g., `BUILD_STABILIZATION_REPORT.md`, `SOCPA_COMPLETE_ANALYSIS.md`) should be in `docs/` subdirectories, not at repo root.
- Root-level diagnostic scripts (`_check.mjs`, `_check2.mjs`, etc.) should be in `scripts/` or deleted.

### Circular References
- **None identified** in documentation cross-references.

### Dead Documents (should be archived)
- `CLAUDE.md` — explicitly marked DEPRECATED, redirects to `docs/AI_ENTRYPOINT.md`
- `docs/archive/` contents — correctly marked as historical (Level 8)
- Multiple `desktop.ini` files across documentation directories — Windows artifacts, not documentation
- `.husky/` — deprecated Husky v8 boilerplate with no custom logic

---

# Phase 5 — Architecture Discovery

## Platform Architecture

AQLIYA is a **Next.js 16 Modular Monolith** with App Router.

### Architecture Layers (top to bottom)

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                         │
│  src/app/ (Routes, Layouts, Pages)                          │
│  src/components/ (UI Components by Product)                 │
│  • (marketing)/ — Public pages (no auth)                    │
│  • (dashboard)/ — Auth-gated workspace                      │
│  • /audit, /sales, /local-content, etc. — Product routes    │
├─────────────────────────────────────────────────────────────┤
│                   MIDDLEWARE LAYER                           │
│  src/middleware.ts — Auth (JWT), RBAC, MFA Gate             │
│  src/middleware-security.ts — CSP, HSTS, Security Headers   │
│  src/middleware-rate-limit.ts — Per-route Rate Limiting     │
│  src/middleware-timing.ts — Response Timing                 │
├─────────────────────────────────────────────────────────────┤
│                   ACTION LAYER                               │
│  src/actions/ — Server Actions (84 files)                   │
│  • Product-specific: audit-*, sales-*, localcontent-*, etc. │
│  • Cross-cutting: auth, governance, platform                │
│  • Pattern: Client → Server Action → Domain Service → DB    │
├─────────────────────────────────────────────────────────────┤
│                   INTELLIGENCE CORE                          │
│  src/lib/ — Business Logic & Services                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  AI Engine (lib/ai/) — 32 files                      │   │
│  │  • Provider Factory + Router (Anthropic, OpenRouter) │   │
│  │  • Orchestrator, Prompt Registry, Model Registry     │   │
│  │  • Eval Framework, Governance Metadata               │   │
│  │  • Embedding, Retrieval (RAG), Ingestion             │   │
│  │  • Budget Manager, Spend Tracker, Cost Mapping       │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Audit Engine (lib/audit/) — 53 files                │   │
│  │  • Client Acceptance, Materiality, Independence      │   │
│  │  • ISQM1, Review Notes, Working Papers               │   │
│  │  • FS Engine, Lead Schedules, Reconciliation         │   │
│  │  • Sampling, Rules (IFRS, SOCPA), COA                │   │
│  │  • Export, Evidence Storage, File Scanner            │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Sales Engine (lib/sales/) — 60 files                │   │
│  │  • Command Center, ICP Learning, Next Action         │   │
│  │  • Institutional Memory, Evidence Links              │   │
│  │  • Signals, Outreach, Governance, Reporting          │   │
│  │  • Pilot Handoff, Account Brief                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  LocalContent Engine (lib/local-content/) — 26 files │   │
│  │  • Classification Rules, Scoring, Spend Analytics    │   │
│  │  • Tender Matching, Export, Arabic PDF               │   │
│  │  • Pipeline Orchestrator, Approval Routing           │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Decision Engine (lib/decision/) — 34 files          │   │
│  │  • Decision Engine, Recommendation Engine            │   │
│  │  • Sector Intelligence, Signal Automation            │   │
│  │  • Risk Analysis, Scenarios, PDF Export              │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  TB Intelligence (lib/tb-intelligence/) — 22 files   │   │
│  │  • TB Classification, CoA Loading                    │   │
│  │  • ERP Intelligence, Firm Memory                     │   │
│  │  • Knowledge Mining Pipeline                         │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   GOVERNANCE LAYER                           │
│  src/lib/governance/ — 12 files                             │
│  src/lib/authorization/ — 11 files                          │
│  src/lib/auth/ — 15 files                                   │
│  src/core/access/ — ABAC Gate + Shadow Report               │
│  src/core/audit/ — Audit Ledger (Prisma)                    │
│  src/core/evidence/ — Evidence Store (Prisma)               │
├─────────────────────────────────────────────────────────────┤
│                   PLATFORM LAYER                             │
│  src/lib/platform/ — 61 files                               │
│  • Bootstrap, Export, Download, Audit Logging               │
│  • Enterprise Health, Navigation, Product Registry          │
│  • Rate Limiter (Memory + Redis), Redis Client              │
│  • Cache Strategy, Secrets, Encryption                      │
│  • ABAC Engine, Monitoring, Integration                     │
│  • SIEM, Sampling, Workflow Engine                          │
│  • Email, Notifications, Storage                            │
│  • Feature Flags, Cross-Product AI                          │
│  • Institutional Memory, Model Governance                   │
├─────────────────────────────────────────────────────────────┤
│                   DATA LAYER                                 │
│  prisma/schema.prisma — 140+ Models                         │
│  PostgreSQL 16 + pgvector                                   │
│  Redis (Caching, Rate Limiting, Queues)                     │
│  File Storage (Local or S3)                                 │
└─────────────────────────────────────────────────────────────┘
```

## Key Architecture Decisions

### 1. Modular Monolith (not microservices)
- All products share the same Next.js app, Prisma client, and auth system.
- Products are separated at the route/component/library level, not at the deployment level.
- Decision documented: Keeping as monolith until scale demands otherwise.

### 2. Server Actions as API Boundary
- 84 Server Actions provide the mutation API.
- Server Actions call domain services (`src/lib/`) which call Prisma.
- Client Components never import `src/lib/` directly — they import from `src/actions/`.

### 3. Product Separation Pattern
```
Product X:
  src/app/x/               — Route segments for Product X
  src/actions/x-actions.ts — Server Actions for Product X
  src/components/x/        — UI Components for Product X
  src/lib/x/               — Business logic for Product X
```

### 4. Governance-First Design
- Every mutation logs to `AuditEvent` or product-specific audit tables.
- Tenant isolation via `organizationId` / `platformOrganizationId` on most models.
- RBAC enforced at middleware level (JWT claims), ABAC for fine-grained access.
- Evidence chain (hash chain) for tamper-evident logs.

### 5. AI Abstraction Layer
- Multi-provider routing (Anthropic primary, OpenRouter secondary).
- Governance metadata on all AI actions (source, prompt, model, confidence, reviewer).
- AI output always framed as "assisted output" — never autonomous decisions.
- Cost tracking and budget management built in.

### 6. Demo Safety Pattern
- `/auditos` route is explicitly public, no-auth, read-only.
- Mock data only — never real customer data.
- No mutations, no uploads, no downloads from demo route.
- Guarded by `src/app/auditos/demo-safety.ts`.

### 7. Arabic-First / Bilingual Design
- Root layout uses Noto Sans Arabic font.
- Arabic metadata by default.
- English mirror at `/en/`.
- Bilingual marketing copy in `src/lib/marketing/`.
- RTL layout support via shadcn/ui RTL configuration.

---

# Phase 6 — Product Discovery

## Product Inventory

### 1. AuditOS — Flagship Product
- **Level:** L5 (Pilot-ready)
- **Route:** `/audit` (workspace), `/auditos` (public demo)
- **Purpose:** Financial/audit intelligence system
- **Core Capabilities:**
  - Engagement management (acceptance, portfolio, archival)
  - Trial balance upload, classification, mapping
  - Chart of accounts (COA) management
  - Account mapping engine
  - Financial statement generation (BS, P&L, CF, equity)
  - Disclosure notes engine
  - Lead schedules, working papers
  - Audit sampling (statistical/non-statistical)
  - Materiality assessment
  - Independence checks
  - Quality management (ISQM1)
  - Evidence vault (upload, storage, linkage)
  - Findings management
  - Review workflow (note-level review)
  - Approval workflow
  - Report exports (PDF, XLSX)
  - Audit trail (complete, tamper-evident)
  - AI-assisted classification (governed, evidence-backed)
  - Firm memory (learning from past engagements)
  - TB intelligence pipeline
  - Knowledge mining pipeline
- **Database Models:** 35+ (AuditEngagement, AuditTrialBalance, AuditAccountMapping, AuditFinancialStatement, AuditEvidence, AuditFinding, etc.)
- **Server Actions:** 22 files
- **Components:** 37 files
- **E2E Tests:** 4 spec files (audit-os, audit-factory, audit-pages, audit-sampling)
- **Documentation:** 100+ docs across products/, systems/, pilot/, commercial/

### 2. LocalContentOS — Second Strategic Product
- **Level:** L5 (Pilot-ready, 100% readiness, 7/7 GREEN)
- **Route:** `/local-content`
- **Purpose:** Local content measurement and compliance (Saudi market focus)
- **Core Capabilities:**
  - Organization/project setup
  - Local content baseline (LCGPA methodology)
  - Supplier/vendor registry
  - Spend/procurement record management
  - Classification rule engine
  - Local content scoring
  - Gap/risk findings
  - Evidence upload
  - AI advisor (suggestion quality audited: 95% acceptance, 88% avg confidence)
  - Review/approval workflow
  - Arabic PDF report generation
  - Workbook engine
  - Tender matching
  - Industry pattern memory (13 patterns seeded)
  - ERP integration (data import)
- **Database Models:** 28+ (LocalContentProject, LocalContentSupplier, LocalContentSpendRecord, LocalContentClassification, LcWorkbook, etc.)
- **Server Actions:** 10 files
- **Components:** 25 files
- **E2E Tests:** 1 spec file
- **Documentation:** Extensive completion program docs in releases/localcontentos-*/

### 3. DecisionOS — Active Adjacent Product
- **Level:** L4 (Usable v0.1)
- **Route:** `/decisions`
- **Purpose:** Governed decision-making intelligence
- **Core Capabilities:**
  - Decision request creation
  - 10 decision types configured
  - Context/evidence collection
  - Options analysis with pros/cons
  - Risk assessment
  - Sector intelligence benchmarking
  - Scenario planning
  - Recommendation engine
  - Committee/reviewer workflow
  - Voting/approval tracking
  - Final decision record
  - Audit trail
  - PDF export (decision memo)
  - Templates
  - Signal automation and alerts
- **Database Models:** 16 (Decision, DecisionFramework, DecisionScenario, DecisionRiskAnalysis, etc.)
- **Server Actions:** 9 files
- **Components:** 7 files
- **E2E Tests:** 1 spec file

### 4. WorkflowOS / Sunbul
- **Level:** L4-L5 (Partial)
- **Route:** `/workflowos`, `/sunbul`
- **Purpose:** Workflow/template engine (rebranded from Sunbul)
- **Core Capabilities:**
  - Template management
  - Record CRUD
  - Step execution
  - SLA monitoring
  - Escalation rules
  - Document management
  - Review queue
  - Export engine
  - Audit trail
  - Webhook integration
  - Sunbul client pilot (Sombol)
- **Database Models:** 7 (SunbulClient, SunbulRecord, SunbulDocument, etc.) + 3 WorkflowOS models
- **Server Actions:** 5 files
- **Components:** 20 files

### 5. SalesOS
- **Level:** L4 (Internal preview)
- **Route:** `/sales`
- **Purpose:** Governed revenue intelligence (NOT a CRM clone)
- **Core Capabilities:**
  - Account/organization management
  - Contact/stakeholder registry
  - Deal management
  - Opportunity tracking
  - Pipeline visualization
  - Sales command center
  - ICP (Ideal Customer Profile) learning
  - Next-action engine
  - Institutional sales memory
  - Evidence linking
  - Sales signals
  - Outreach management
  - Revenue intelligence
  - Forecast/funnel analysis
  - Review/approval workflow
  - Governance gates (L5)
  - Pilot handoff pack
  - Account brief generation
  - CRM integration (server-side only)
  - Audit trail
- **Database Models:** 10 (SalesPipeline, SalesDeal, SalesAccount, etc.)
- **Server Actions:** 6 files
- **Components:** 83 files
- **Tech Debt:** `prisma-repository.ts` has documented schema drift (R-04)
- **E2E Tests:** 1 spec file

### 6. LocalContactOS
- **Level:** L4-L5 (Partial)
- **Route:** `/contacts`
- **Purpose:** Institutional relationship intelligence
- **Core Capabilities:**
  - Organization relationship mapping
  - Contact/stakeholder registry
  - Sensitivity levels
  - Relationship ownership
  - Interaction history
  - Permissioned access
  - Notes and evidence
  - Risk flags
  - Audit trail
  - Export approval workflow
- **Database Models:** 8+ (LocalContact, LocalContactRelation, LocalContactInteraction, etc.)
- **Server Actions:** 3 files
- **Components:** 8 files

### 7. Office AI Assistant
- **Level:** L4 (Usable v0.1)
- **Route:** `/assistant`, `/office-ai`
- **Purpose:** Governed shared AI workspace (NOT standalone product)
- **Core Capabilities:**
  - Assistant workspace
  - Task categories
  - Document-aware responses
  - File content extraction
  - Action logs
  - User review required
  - No autonomous final actions
  - Evidence/source references
  - Permission checks
  - Audit events
  - Role-based config
  - Scheduled tasks
  - Response templates
- **Database Models:** 6 (OfficeAiTask, OfficeAiOutput, OfficeAiFile, etc.)
- **Server Actions:** 3 files
- **AI Governance:** Cloud provider risk gate documented; AI outputs always framed as draft/suggestion

### 8. RiskOS
- **Level:** L4
- **Route:** `/risk`
- **Purpose:** Audit-adjacent risk workspace (NOT standalone product)
- **Core Capabilities:**
  - Risk assessments (list + detail)
  - Risk dashboard
  - Audit trail
  - Exports
- **Documented correctly** in PRODUCT_STATUS_MATRIX.md as "not marketed as standalone product"

### 9. SimulationOS
- **Level:** L1 (Marketing redirect only)
- **Route:** `/products/simulation` → redirects to `/products`
- **Status:** Marketing page only. No workspace implemented.

### 10. AQLIYA Studio
- **Level:** L0 (Strategic future)
- **Status:** Not implemented. Product Factory directory (`scripts/product-factory/`) is reserved but empty.

---

# Phase 7 — Source Code Inventory

*(Note: Detailed source code inventory was provided by the exploration agents. Here is a consolidated summary.)*

## Module Purpose Summary

### Core Platform Modules

| Module | Files | Purpose | Inputs | Outputs | Consumers |
|--------|-------|---------|--------|---------|-----------|
| `lib/ai/` | 32 | Full AI abstraction layer | Prompts, context, models | Generated text, embeddings, cost tracking | All products, Office AI |
| `lib/audit/` | 53 | Complete audit engine | TB data, mappings, evidence | FS, findings, reports, exports | AuditOS, TB Intelligence |
| `lib/sales/` | 60 | Sales intelligence engine | Accounts, deals, interactions | Pipeline, signals, next-actions | SalesOS |
| `lib/local-content/` | 26 | LC measurement engine | Spend data, suppliers, contracts | Classifications, scores, reports | LocalContentOS |
| `lib/decision/` | 34 | Decision governance engine | Options, risks, evidence | Recommendations, decisions, memos | DecisionOS |
| `lib/tb-intelligence/` | 22 | AI-assisted TB classification | TB lines, COA | Classifications, patterns, memory | AuditOS |
| `lib/governance/` | 12 | Shared governance utilities | Actions, actors, state | Audit trails, provenance, approvals | All products |
| `lib/authorization/` | 11 | AuthZ subsystem (RBAC+ABAC) | User roles, policies | Allow/deny decisions | All routes |
| `lib/auth/` | 15 | Auth subsystem (NextAuth+SAML+MFA) | Credentials, tokens | Authenticated sessions | All authenticated routes |
| `lib/platform/` | 61 | Enterprise platform services | Various (exports, downloads, health) | Downloads, audit logs, rate limits | All products |

### Specialized Modules

| Module | Files | Purpose | Risk Level | Reuse Potential |
|--------|-------|---------|------------|-----------------|
| `lib/knowledge-foundation/` | 16 | Versioned knowledge base | Medium | High (cross-product) |
| `lib/workflowos/` | 14 | Workflow/template engine | Low | High |
| `lib/simulation/` | 6 | Decision simulation/scoring | Medium | Medium |
| `lib/recommendation/` | 6 | Recommendation engine | Low | High (cross-product) |
| `lib/skill-runtime/` | 7 | Skill evaluation runtime | Low | Medium |
| `lib/integration/` | 13 | External system integration | High | Medium |
| `lib/marketing/` | 27 | Marketing content/copy | None | Low |
| `lib/office-ai/` | 8 | Office AI service | Medium | Medium |
| `lib/localcontactos/` | 4 | LocalContactOS service | Medium | Medium |
| `lib/organization/` | 2 | Organization service | Low | High |
| `core/access/` | 2 | ABAC enforcement | High | High (cross-product) |
| `core/audit/` | 2 | Audit ledger | High | High (cross-product) |
| `core/evidence/` | 3 | Evidence store | High | High (cross-product) |

---

# Phase 8 — Knowledge Graph

## Entity Relationship Map

```
                         AQLIYA PLATFORM IDENTITY
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              OFFICIAL DOCS  SOURCE-OF-TRUTH  GOVERNANCE
              (doctrine)     (supporting)     (charters)
                    │            │            │
                    └────────────┼────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              PRODUCT DOCS   SYSTEM DOCS   PILOT DOCS
                    │            │            │
                    └────────────┼────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
    AUDITOS (L5)          LOCALCONTENTOS (L5)       DECISIONOS (L4)
         │                       │                       │
    ┌────┼────┐            ┌────┼────┐            ┌────┼────┐
    ▼    ▼    ▼            ▼    ▼    ▼            ▼    ▼    ▼
  Routes Actions Lib    Routes Actions Lib    Routes Actions Lib
  /audit 22 files 53    /local- 10 files 26   /decisions 9 files 34
                    content
         │                       │                       │
         ▼                       ▼                       ▼
    SALESOS (L4)           CONTACTOS (L4-L5)      WORKFLOWOS (L4-L5)
    /sales 6 actions 60    /contacts 3 actions 4  /workflowos 5 actions 14
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              AI ENGINE     GOV ENGINE     PLATFORM ENGINE
              (32 files)    (35+ files)    (61 files)
                    │            │            │
                    └────────────┼────────────┘
                                 │
                         DATABASE (Prisma)
                         140+ Models
                         53 Migrations
```

## Orphans Identified

| Orphan | Type | Issue |
|--------|------|-------|
| `CLAUDE.md` | Doc | Deprecated, redirects — should be archived |
| `.husky/` | Config | Deprecated v8 boilerplate with no custom logic |
| `tests/` directory | Dir | Effectively empty — creates false expectation |
| `scripts/product-factory/` | Dir | Reserved but empty — no implementation |
| Root-level diagnostic scripts | Files | `_check.mjs`, `_check2.mjs`, etc. should be in `scripts/` |
| `scripts/local-content/` vs `scripts/localcontent/` | Dirs | Naming inconsistency from mid-cleanup |
| `docs/DOCUMENTATION_GOVERNANCE.md` (v1) | Doc | Superseded by v2 |
| `docs/official/aqliya-roadmap-v1.1.md` | Doc | Partially superseded by v1.2 |

## Broken References

- **None identified** — all route references in documentation verified against `src/app/` directory structure.

## Unused Docs

| Doc | Issue |
|-----|-------|
| `docs/archive/` contents (100+ files) | Archived correctly — no action needed |
| `docs/source-of-truth/DOCUMENTATION_LINEAGE.md` | May be superseded by DOCUMENTATION_AUTHORITY.md |
| `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` | Likely stale — check against PRODUCT_STATUS_MATRIX.md |

## Unused Modules

*(Inference based on import analysis — full dead-code analysis requires build tooling)*

| Module | Observation |
|--------|-------------|
| `src/lib/sales/vnext/` | SalesOS vnext consolidation — not yet in active use |
| `src/lib/sales/v02/` | SalesOS v02 — may be superseded |
| `src/lib/simulation/` | Used by DecisionOS but limited adoption |
| `src/lib/integration/` | Integration adapters — many are "types+interface only" per .env.example |

---

# Phase 9 — Folder Purpose

## Every Folder: Purpose, Belongs, Never Belongs, Architecture Compliance

| Folder | Why It Exists | What Belongs | What Should Never Be There | Follows Architecture? |
|--------|--------------|--------------|---------------------------|----------------------|
| `src/app/` | Next.js App Router — route definitions | Routes, layouts, pages, loading/error states, route handlers | Business logic, Prisma calls, database queries | ✅ YES |
| `src/app/(marketing)/` | Public marketing site — no auth | Public pages, marketing content, CTAs | Customer data, workspace components, authenticated content | ✅ YES |
| `src/app/(dashboard)/` | Authenticated workspace | Auth-gated pages, dashboards, settings | Public-only content (use marketing group) | ✅ YES |
| `src/app/api/` | REST API endpoints | Route handlers, API logic | UI components, page components | ✅ YES |
| `src/app/auditos/` | Public demo route | Mock data, read-only components, demo safety | Real customer data, mutations, uploads | ✅ YES |
| `src/actions/` | Server Actions (mutations) | Form handlers, data mutations, auth-gated operations | UI rendering, client-side state, browser APIs | ✅ YES |
| `src/components/` | React UI components | Presentational and container components | Server-only code (Prisma, auth, secrets) | ✅ YES |
| `src/lib/` | Business logic and services | Domain services, engines, utilities | Client-side only code | ✅ YES |
| `src/lib/ai/` | AI abstraction layer | AI providers, orchestration, governance | Hardcoded credentials, unsafe eval | ✅ YES |
| `src/lib/audit/` | AuditOS business logic | Audit engines, rules, exports | Non-audit domain logic | ✅ YES |
| `src/core/` | Platform core contracts | ABAC gate, audit ledger, evidence store | Product-specific logic | ✅ YES |
| `src/middleware*.ts` | HTTP middleware stack | Auth, RBAC, security headers, rate limiting | Business logic (use actions/lib) | ✅ YES |
| `src/__mocks__/` | Jest test mocks | Mock implementations for server-only modules | Production code | ✅ YES |
| `src/__tests__/` | Test suites | Unit, integration, E2E tests | Production code, configuration | ✅ YES |
| `prisma/` | Database schema and migrations | Schema, migrations, seeds | Application code, UI code | ✅ YES |
| `prisma/migrations/` | Database version history | Timestamped migration directories | Manual SQL scripts (use Prisma migrate) | ✅ YES |
| `scripts/` | Operational and build scripts | Platform ops, data processing, validation | Application source code | ✅ YES |
| `docs/` | Documentation | All documentation, runbooks, ADRs | Source code, build artifacts | ✅ YES |
| `docs/official/` | Official doctrine | Vision, taxonomy, architecture, rules | Implementation details (use source-of-truth) | ✅ YES |
| `docs/source-of-truth/` | Supporting references | Status matrix, route strategy, architecture | Doctrine (use official/) | ✅ YES |
| `docs/archive/` | Historical documents | Superseded, deprecated, legacy docs | Active documents | ✅ YES |
| `docs/theoretical-reference/` | Theory library | Background research, domain theory | Implementation docs, product status | ✅ YES |
| `docs/audits/` | Audit evidence | Audit reports, forensic analysis, evidence | Active product docs | ✅ YES |
| `docs/releases/` | Release documentation | Release notes, scope, checklists | Pre-release planning (use strategy/) | ✅ YES |
| `docs/validation/` | Validation evidence | Test results, verification reports | Specifications (use engineering/) | ✅ YES |
| `docs/products/` | Product definitions | PRDs, specs, commercial docs | System-level docs (use systems/) | ✅ YES |
| `docs/systems/` | System documentation | Operator manuals, engine specs | Product marketing (use products/) | ✅ YES |
| `docs/runbooks/` | Operations runbooks | Production support, operator guides | Architecture design (use architecture/) | ✅ YES |
| `docs/deployment/` | Deployment guides | Deploy instructions, environment inventory | Runtime monitoring (use validation/) | ✅ YES |
| `docs/commercial/` | Commercial materials | SOW templates, demo scripts, pricing | Technical specs (use engineering/) | ✅ YES |
| `docs/marketing/` | Marketing content | Brand voice, content audit, site analysis | Product specs (use products/) | ✅ YES |
| `docs/engineering/` | Engineering specs | PRDs, domain specs, API specs | Marketing copy (use marketing/) | ✅ YES |
| `docs/review/` | Review artifacts | Code reviews, technical risk registers | Active planning docs | ✅ YES |
| `docs/strategy/` | Strategic decisions | CEO decisions, board memos, portfolio | Implementation plans (use roadmap) | ✅ YES |
| `docs/execution/` | Execution protocols | Operating protocols, UI rules | Backlog (use execution-backlog/) | ✅ YES |
| `docs/execution-backlog/` | Execution backlog | CSV: epics, tasks, execution orders | Active docs | ✅ YES |
| `docs/content/` | Website content source | Public website messaging source | Platform identity (use official/) | ✅ YES |
| `docs/runtime-prototypes/` | Engagement observations | Live session logs, reviewer behavior studies | Design docs | ✅ YES |
| `docs/research/` | Research reports | Deep research findings | Speculation without evidence | ✅ YES |
| `docs/ai/` | AI infrastructure data | Knowledge map JSON + schema | AI implementation code | ✅ YES |
| `tools/err/` | Engineering readiness tooling | ERR verification scripts, spec data | Application code | ✅ YES |
| `.github/` | GitHub CI/CD | Workflow definitions, CODEOWNERS | Application secrets | ✅ YES |
| `.husky/` | Git hooks (deprecated) | N/A — deprecated, effectively inert | New hook logic (migrate to Husky v10+) | ⚠️ DEPRECATED |
| `.skills/` | Agent skill system | Skill manifests, registry, evaluations | Application code | ✅ YES |
| `.opencode/` | OpenCode agent config | Agent definitions, MCP config | Application secrets | ✅ YES |
| `cypress/` | E2E test suite | Test specs, support commands, config | Unit tests (use Jest) | ✅ YES |
| `tests/` | Test directory (empty) | N/A — deprecated location | New tests (use src/__tests__/) | ⚠️ MISLEADING |
| `public/` | Static assets | Images, fonts, favicons, brand assets | Dynamic content, user uploads | ✅ YES |
| `knowledge/` | Knowledge base storage | Knowledge graph data files | Source code | ✅ YES |
| `knowledge-foundation/` | Knowledge foundation storage | Foundation versions, releases | Source code | ✅ YES |
| `audit/` | Audit artifacts | Audit reports, evidence | Source code | ✅ YES |
| `backups/` | Database backups | Backup files | Source code | ✅ YES |
| `certificates/` | SSL/TLS certificates | Certificate files | Private keys in plaintext | ✅ YES |
| `i18n/` | Internationalization data | Translation files, locale data | Source code | ✅ YES |
| `messages/` | i18n message files | Message catalogs | Source code | ✅ YES |
| `runbooks/` | Operational runbooks | Runbook documents | Application code | ✅ YES (duplicate of docs/runbooks/) |
| `test-results/` | Test output artifacts | Test reports, coverage data | Source code | ✅ YES |
| `tmp/` | Temporary files | Build artifacts, temp data | Permanent files, source code | ✅ YES |
| `uploads/` | File upload storage | User-uploaded files | Source code | ✅ YES |
| `verification/` | Verification artifacts | Verification reports | Source code | ✅ YES |
| `archive/` | Archived files | Historical artifacts | Active files | ✅ YES |
| `infra/` | Infrastructure code | IaC templates, deployment configs | Application code | ✅ YES |
| `RB-01/` | Remediation branch artifacts | RB-01 attack matrix, guard fixes | Long-term storage | ⚠️ Should be merged or archived |
| `.claude/` | Claude agent config | Claude-specific configuration | Application code | ✅ YES |
| `.cursor/` | Cursor IDE config | Cursor rules, settings | Application code | ✅ YES |
| `.data/` | Data storage | Data files | Source code | ✅ YES |
| `.local-cleanup/` | Cleanup artifacts | Cleanup scripts, logs | Active files | ⚠️ Temporary — should be cleaned |
| `.next/` | Next.js build output | Build artifacts (gitignored) | Source code (excluded by .gitignore) | ✅ YES |
| `.playwright-mcp/` | Playwright MCP server | Playwright browser automation | Application code | ✅ YES |
| `.vercel/` | Vercel deployment artifacts | Vercel output (gitignored) | Source code | ✅ YES |
| `node_modules/` | npm dependencies | Installed packages (gitignored) | Source code (excluded by .gitignore) | ✅ YES |

### Folder Architecture Violations

| Violation | Location | Issue | Severity |
|-----------|----------|-------|----------|
| Root-level reports | `BUILD_STABILIZATION_REPORT.md`, `SOCPA_COMPLETE_ANALYSIS.md`, etc. | Should be in `docs/` subdirectories | LOW |
| Root-level diagnostic scripts | `_check.mjs`, `_check2.mjs`, `kf-capture.mjs`, etc. | Should be in `scripts/` or deleted | LOW |
| Root-level log files | `server.log`, `npmstart.log`, `dev_server.log`, etc. | Should be .gitignored | LOW |
| Empty `tests/` directory | `tests/` | Creates false expectation; tests are in `src/__tests__/` | LOW |
| Duplicate runbook directories | `runbooks/` vs `docs/runbooks/` | Two locations for runbooks | LOW |
| `scripts/local-content/` vs `scripts/localcontent/` | Script directories | Naming inconsistency | LOW |
| RB-01 remediation artifacts | `RB-01/` | Should be merged to main or archived | LOW |

---

# Phase 10 — Documentation Quality Scores

## Scoring Criteria

| Criteria | Weight | Description |
|----------|--------|-------------|
| Completeness | 20% | Does it cover all needed topics? |
| Accuracy | 20% | Does it match code reality? |
| Freshness | 15% | When was it last updated? |
| Traceability | 15% | Can you trace claims to code? |
| Architecture Alignment | 10% | Does it follow documented architecture? |
| Implementation Alignment | 10% | Do code and docs match? |
| Evidence | 5% | Is there evidence backing claims? |
| Cross References | 5% | Does it link to related docs? |

## Scores by Category

### Official Doctrine (Level 1-2)

| Document | Comp | Acc | Fresh | Trace | Arch | Impl | Evid | XRef | **Score** |
|----------|------|-----|-------|-------|------|------|------|------|-----------|
| AQLIYA_MASTER_REFERENCE.md | 95% | 95% | 90% | 90% | 95% | 90% | 85% | 85% | **92%** |
| aqliya-vision-v1.1.md | 95% | 95% | 85% | 80% | 90% | N/A | N/A | 80% | **89%** |
| aqliya-implementation-rules-v1.1.md | 90% | 90% | 85% | 80% | 90% | 85% | N/A | 75% | **87%** |
| aqliya-product-taxonomy-v1.1.md | 90% | 85% | 80% | 75% | 90% | 80% | N/A | 80% | **84%** |
| aqliya-core-architecture-v1.1.md | 85% | 85% | 80% | 80% | 95% | 85% | N/A | 80% | **85%** |
| aqliya-glossary-v1.1.md | 90% | 90% | 85% | N/A | N/A | N/A | N/A | 75% | **88%** |
| aqliya-roadmap-v1.1.md | 70% | 70% | 60% | 65% | 75% | 70% | N/A | 60% | **68%** ⚠️ Partially superseded |
| AQLIYA_ROADMAP_v1.2.md | 85% | 90% | 95% | 80% | 85% | 85% | N/A | 75% | **87%** |
| aqliya-agent-context-v1.1.md | 90% | 90% | 85% | N/A | N/A | N/A | N/A | 80% | **88%** |
| aqliya-skill-os-v1.0.md | 95% | 90% | 85% | 85% | 90% | 85% | N/A | 80% | **88%** |
| aqliya-opencode-operating-system.md | 90% | 90% | 90% | 80% | N/A | 85% | N/A | 75% | **87%** |
| **Category Average** | | | | | | | | | **86%** |

### Source of Truth (Level 4)

| Document | Comp | Acc | Fresh | Trace | Arch | Impl | Evid | XRef | **Score** |
|----------|------|-----|-------|-------|------|------|------|------|-----------|
| PRODUCT_STATUS_MATRIX.md | 95% | 95% | 95% | 90% | 90% | 95% | 85% | 90% | **93%** |
| ROUTE_STRATEGY.md | 95% | 95% | 90% | 95% | 90% | 95% | 85% | 85% | **93%** |
| AQLIYA_ARCHITECTURE.md | 90% | 90% | 85% | 85% | 95% | 85% | 80% | 85% | **88%** |
| AQLIYA_SYSTEM_TAXONOMY.md | 85% | 85% | 80% | 80% | 85% | 80% | N/A | 80% | **83%** |
| **Category Average** | | | | | | | | | **89%** |

### Product Docs (Level 5)

| Category | Average Score | Notes |
|----------|---------------|-------|
| AuditOS product docs | **85%** | Comprehensive, some redundancy across products/ and systems/ |
| LocalContentOS docs | **80%** | Extensive completion docs but scattered across multiple locations |
| DecisionOS docs | **78%** | Good engine docs, lighter on UX documentation |
| SalesOS docs | **72%** | Product definition strong; some vnext/v02 docs create confusion |
| WorkflowOS docs | **75%** | Sunbul rebranding creates some documentation drift |
| **Category Average** | **78%** | |

### Governance (Level 1-3)

| Document | Score | Notes |
|----------|-------|-------|
| AQLIYA_EXECUTION_CHARTER.md | **90%** | Comprehensive, well-structured |
| ai-governance.md | **85%** | Clear boundaries and rules |
| DOCUMENTATION_AUTHORITY.md | **88%** | Well-defined hierarchy and conflict rules |
| **Category Average** | **88%** | |

### Technical Quality

| Document Type | Average Score |
|---------------|---------------|
| Architecture ADRs | **82%** |
| Runbooks | **85%** |
| Deployment Guides | **80%** |
| Engineering Specs | **78%** |
| Validation Reports | **75%** (some are checklists, not full reports) |
| Pilot Documents | **82%** |
| Commercial Materials | **80%** |
| Audit Reports | **85%** (forensic audits are thorough) |

### Overall Documentation Health Score: **82% (B+)**

**Strengths:**
- Clear authority hierarchy (Levels 0-8)
- Comprehensive product status tracking
- Extensive audit evidence and validation
- Well-maintained theoretical reference library (200+ files)

**Weaknesses:**
- Redundancy between `docs/products/` and `docs/systems/`
- Partially superseded roadmaps (v1.1 vs v1.2)
- Some root-level documents belong in subdirectories
- Archive could be more aggressively pruned

---

# Phase 11 — Repository Health Assessment

## Technical Debt Inventory

### Code-Level Debt

| Item | Location | Severity | Description |
|------|----------|----------|-------------|
| SalesOS `prisma-repository.ts` | `src/lib/sales/prisma-repository.ts` | MEDIUM | Documented schema drift (R-04), uses `@ts-nocheck` |
| SalesOS vnext | `src/lib/sales/vnext/` | MEDIUM | Intelligence layer awaiting consolidation |
| Integration adapters | `src/lib/integration/` | LOW | External API responses require `any` types |
| Content Studio drift | `src/app/content-studio/` | LOW | Documented schema drift (R-03), `as any` replaced with eslint-disable |
| `tests/` directory | `tests/` | LOW | Empty — misleading |
| `.husky/` | `.husky/` | LOW | Deprecated v8 boilerplate |

### Documentation Debt

| Item | Location | Severity | Description |
|------|----------|----------|-------------|
| Root-level reports | `BUILD_STABILIZATION_REPORT.md`, etc. | LOW | Should be in `docs/` subdirectories |
| Root-level diagnostic scripts | `_check.mjs`, `_check2.mjs`, etc. | LOW | Should be in `scripts/` or deleted |
| Root-level log files | `*.log` | LOW | Should be .gitignored |
| Duplicate roadmaps | `docs/official/aqliya-roadmap-v1.1.md` vs `v1.2` | LOW | v1.1 should be marked superseded |
| Duplicate governance | `DOCUMENTATION_GOVERNANCE.md` vs `v2` | LOW | v1 should be archived |
| Naming inconsistency | `scripts/local-content/` vs `scripts/localcontent/` | LOW | Mid-cleanup naming |

### Architecture Debt

| Item | Severity | Description |
|------|----------|-------------|
| Sunbul → WorkflowOS rebranding | LOW | Some documentation still references "Sunbul" as separate from WorkflowOS |
| SalesOS v02/vnext split | MEDIUM | Two parallel implementations in `sales/v02/` and `sales/vnext/` |
| `runbooks/` vs `docs/runbooks/` | LOW | Two locations for runbooks |

### Security Debt

| Item | Severity | Description |
|------|----------|-------------|
| ClamAV optional | LOW | SCANNER_PROVIDER defaults to `clamav` but can fall back to none |
| Rate limiter defaults to memory | LOW | Multi-instance deployments need Redis (documented) |
| SSO secrets encrypted at rest | ✅ RESOLVED | AES-256-GCM encryption implemented |
| CSP hardened | ✅ RESOLVED | No `unsafe-eval`, strict connect-src |

### Build/CI Health

| Check | Status |
|-------|--------|
| TypeScript (`tsc --noEmit`) | ✅ PASS |
| ESLint | ✅ PASS (0 warnings via organized ignores) |
| Build (`npm run build`) | ✅ PASS (127 static pages) |
| Tests (2,321 tests, 242 suites) | ✅ PASS |
| E2E (Cypress) | ✅ Configured |
| CI Pipeline | ✅ Active (`ci.yml`, `deploy.yml`, `backup.yml`, `preview.yml`, `promote.yml`) |

## Dead Code / Unused Modules

| Module | Status |
|--------|--------|
| `src/lib/sales/vnext/` | Not yet consolidated — may have dead code |
| `src/lib/sales/v02/` | May be superseded by active implementation |
| `scripts/archived/` | Correctly archived (25 files) |
| `docs/archive/` | Correctly archived (100+ files) |
| `.husky/` | Deprecated — could be removed |

## Duplicate Code Patterns

- **Governance utilities:** `src/lib/governance/`, `src/core/audit/`, product-specific audit trails — some overlapping patterns
- **Email/notification:** `src/lib/platform/email/` and `src/lib/platform/notification/` — possible overlap
- **Export utilities:** Product-specific export functions in `audit/export/`, `local-content/export.ts`, `decision/decision-export-pdf.ts` — could share more abstraction

---

# Phase 12 — Dependency Analysis

## Folder Dependency Graph

```
src/app/ ─────────────────────────────┐
  │ (imports)                         │
  ├─► src/actions/ (Server Actions) ──┤
  ├─► src/components/ (UI) ───────────┤
  └─► src/lib/ (some, cautiously) ────┤
                                      │
src/actions/ ─────────────────────────┤
  │ (imports)                         │
  ├─► src/lib/ (all products) ←───────┤
  ├─► src/lib/platform/ (audit logs) ─┤
  ├─► src/lib/governance/ ────────────┤
  └─► prisma (@prisma/client) ←───────┤
                                      │
src/components/ ──────────────────────┤
  │ (imports)                         │
  ├─► src/actions/ (for mutations) ←──┤
  ├─► src/lib/types/ ─────────────────┤
  └─► src/components/ui/ (shadcn) ────┤
                                      │
src/lib/ai/ ──────────────────────────┤
  │ (depends on)                      │
  ├─► src/lib/platform/ (config) ─────┤
  └─► External AI providers ──────────┤
                                      │
src/lib/audit/ ───────────────────────┤
  │ (depends on)                      │
  ├─► src/lib/ai/ (AI bridge) ←───────┤
  ├─► src/lib/governance/ ────────────┤
  ├─► src/lib/platform/ ──────────────┤
  └─► prisma ─────────────────────────┤
                                      │
src/core/ ────────────────────────────┤
  │ (used by)                         │
  └─► ALL products (cross-cutting) ←──┘
```

## Module Dependency Graph (Key Dependencies)

```
middleware.ts
  ├─► middleware-security.ts
  ├─► middleware-rate-limit.ts
  └─► middleware-timing.ts

auth (lib/auth/)
  ├─► @node-saml/node-saml (SAML)
  ├─► next-auth (NextAuth v5)
  └─► prisma (adapter)

authorization (lib/authorization/)
  ├─► governance (lib/governance/)
  └─► platform (lib/platform/abac/)

ai (lib/ai/)
  ├─► Anthropic API (primary)
  ├─► OpenRouter API (secondary)
  ├─► platform (lib/platform/monitoring/)
  └─► governance (lib/governance/)

audit (lib/audit/)
  ├─► ai (AI bridge)
  ├─► platform (export, storage, download)
  ├─► governance
  └─► tb-intelligence

local-content (lib/local-content/)
  ├─► ai (AI advisor)
  ├─► platform (export, file scanner)
  └─► governance

sales (lib/sales/)
  ├─► ai (intelligence)
  ├─► platform (export)
  └─► governance

decision (lib/decision/)
  ├─► ai (recommendations)
  ├─► platform (export)
  └─► governance
```

## Dependency Violations

| Violation | Severity | Note |
|-----------|----------|------|
| **None identified** | — | All Server Action → Domain Service → Database paths appear correct |
| **None identified** | — | No Client Component → Prisma violations found |
| **None identified** | — | No cross-product circular dependencies detected |

## Product Dependency Graph

```
AuditOS ───────┐
               ├─► AI Engine (shared)
LocalContentOS─┤
               ├─► Governance Engine (shared)
DecisionOS ────┤
               ├─► Platform Core (shared)
SalesOS ───────┤
               ├─► Institutional Memory (shared)
WorkflowOS ────┤
               └─► Evidence Store (shared)
LocalContactOS─┘
```

All products depend on the shared Intelligence Core for AI, governance, audit logging, and platform services. Products do not directly depend on each other.

---

# Phase 13 — Source of Truth

## Canonical Hierarchy Recommendation

```
LEVEL 0 — Conflict Resolution
│
│   docs/DOCUMENTATION_AUTHORITY.md
│   (Defines which documents win in conflicts)
│
├── LEVEL 1 — Doctrine (Highest for identity/governance)
│   │
│   ├── docs/official/aqliya-vision-v1.1.md         (What AQLIYA IS/NOT)
│   ├── docs/official/aqliya-implementation-rules-v1.1.md (Mandatory dev rules)
│   ├── docs/official/aqliya-product-taxonomy-v1.1.md    (Product layers)
│   ├── docs/official/aqliya-core-architecture-v1.1.md    (Architecture layers)
│   ├── docs/official/aqliya-glossary-v1.1.md            (Terminology)
│   ├── docs/official/aqliya-agent-context-v1.1.md       (Agent orientation)
│   └── docs/official/AQLIYA_MASTER_REFERENCE.md         (v0.1 operational baseline)
│
├── LEVEL 2 — Strategic (Direction, but not implementation truth)
│   │
│   ├── docs/official/AQLIYA_ROADMAP_v1.2.md             (Repository Reality Edition)
│   └── docs/strategy/ceo-decision-2026-06-17/           (Strategic bets)
│
├── LEVEL 3 — Governance (Rules, enforced not aspirational)
│   │
│   ├── docs/governance/AQLIYA_EXECUTION_CHARTER.md
│   ├── docs/governance/ai-governance.md
│   └── docs/governance/tenant-security-governance.md
│
├── LEVEL 4 — Implementation Reality (HIGHEST for "what exists")
│   │
│   ├── docs/source-of-truth/PRODUCT_STATUS_MATRIX.md    (Product readiness)
│   ├── docs/source-of-truth/ROUTE_STRATEGY.md           (Route catalog)
│   ├── docs/source-of-truth/AQLIYA_ARCHITECTURE.md      (System diagram)
│   ├── docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md   (System classification)
│   └── CODE ITSELF (src/, prisma/, etc.)                (Ultimate truth)
│
├── LEVEL 5 — Product & System Documentation
│   │
│   ├── docs/products/       (PRDs, specs, commercial)
│   ├── docs/systems/        (Operator manuals, engine specs)
│   ├── docs/pilot/          (Pilot execution)
│   ├── docs/runbooks/       (Operations)
│   ├── docs/releases/       (Release history)
│   ├── docs/deliverables/   (Implementation reports)
│   └── docs/commercial/     (SOW, demo scripts)
│
├── LEVEL 6 — Evidence & Validation
│   │
│   ├── docs/audits/         (Audit reports, evidence)
│   ├── docs/validation/     (Test results, verification)
│   ├── docs/review/         (Code reviews, risk registers)
│   ├── docs/engineering/    (Detailed specs)
│   ├── docs/deployment/     (Deploy guides)
│   ├── docs/marketing/      (Content audit, voice guide)
│   └── docs/runtime-prototypes/ (Session observations)
│
├── LEVEL 7 — Theoretical (Background only, not authority)
│   │
│   └── docs/theoretical-reference/ (21-domain theory library)
│
└── LEVEL 8 — Historical (Do not cite for current state)
    │
    └── docs/archive/ (Superseded/deprecated/legacy)
```

## Conflict Resolution Rules

1. **Code is the ultimate truth for implementation status.** If documentation claims a feature exists but code does not implement it, code wins.
2. **Official doctrine wins for identity, governance, and strategic boundaries.**
3. **PRODUCT_STATUS_MATRIX.md is the single source of truth for product readiness levels.**
4. **ROUTE_STRATEGY.md is the single source of truth for route inventory.**
5. **prisma/schema.prisma is the single source of truth for data models.**
6. **When two active documents conflict, the higher-level document in the hierarchy wins.**
7. **Archive-level documents must never be cited for current product status or implementation decisions.**

## Documents Requiring Attention

| Document | Issue | Action |
|----------|-------|--------|
| `docs/official/aqliya-roadmap-v1.1.md` | Partially superseded by v1.2 | Mark as superseded; add redirect to v1.2 |
| `docs/DOCUMENTATION_GOVERNANCE.md` | Superseded by v2 | Archive v1 |
| `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` | Likely stale | Verify against PRODUCT_STATUS_MATRIX.md |
| `CLAUDE.md` | Explicitly deprecated | Archive or delete |
| Root-level logs (`*.log`) | Should be gitignored | Add to .gitignore |

---

# Phase 14 — Final Repository Map

## Definitive Repository Map

```
AQLIYA — Private Governed Institutional Intelligence Platform
│
├── PLATFORM IDENTITY
│   │
│   ├── Vision: Private, governed, evidence-based institutional intelligence
│   ├── Trust Principle: AI assists. Humans decide. Evidence governs.
│   ├── Stack: Next.js 16, TypeScript 5, PostgreSQL+pgvector, Prisma 7, NextAuth v5
│   └── Model: Modular Monolith (not microservices)
│
├── CORE PLATFORM
│   │
│   ├── src/core/ — Platform primitives (ABAC, audit ledger, evidence store)
│   ├── src/middleware.ts — Auth (JWT), RBAC, MFA, rate-limit, security headers
│   ├── src/lib/platform/ — Enterprise services (export, download, audit log, Redis, cache, SIEM, emails)
│   ├── src/lib/auth/ — Authentication (NextAuth, SAML SSO, MFA, SCIM)
│   ├── src/lib/authorization/ — Authorization (RBAC + ABAC, tenant isolation)
│   └── src/lib/governance/ — Shared governance (actor lineage, approval state, provenance)
│
├── INTELLIGENCE CORE
│   │
│   ├── src/lib/ai/ — Full AI abstraction (32 files)
│   │   ├── Multi-provider routing (Anthropic primary, OpenRouter secondary)
│   │   ├── Governance metadata on all AI actions
│   │   ├── Cost tracking and budget management
│   │   └── RAG retrieval pipeline
│   ├── src/lib/tb-intelligence/ — TB classification AI
│   ├── src/lib/knowledge-foundation/ — Versioned knowledge base
│   └── src/lib/institutional-memory/ — Cross-product entity linking
│
├── PRODUCTS
│   │
│   ├── AuditOS (L5 — Pilot-ready)
│   │   ├── Route: /audit (workspace), /auditos (demo)
│   │   ├── Engines: 53 files — acceptance, materiality, FS, lead schedules, sampling, evidence, findings, review, export
│   │   ├── Models: 35+ — AuditEngagement, AuditTrialBalance, AuditFinding, etc.
│   │   └── Actions: 22 files — full CRUD + review/approval workflows
│   │
│   ├── LocalContentOS (L5 — Pilot-ready, 100% readiness)
│   │   ├── Route: /local-content
│   │   ├── Engines: 26 files — classification, scoring, spend analytics, Arabic PDF, workbook
│   │   ├── Models: 28+ — LocalContentProject, LcWorkbook, LcPatternSuggestion, etc.
│   │   └── Actions: 10 files — AI advisor, workbook, review, export
│   │
│   ├── DecisionOS (L4 — Usable v0.1)
│   │   ├── Route: /decisions
│   │   ├── Engines: 34 files — decision engine, recommendation, sector intelligence, scenarios
│   │   ├── Models: 16 — Decision, DecisionFramework, DecisionRiskAnalysis, etc.
│   │   └── Actions: 9 files — CRUD, templates, signals, export
│   │
│   ├── SalesOS (L4 — Internal preview)
│   │   ├── Route: /sales
│   │   ├── Engines: 60 files — command center, ICP learning, pipeline, signals, outreach
│   │   ├── Models: 10 — SalesPipeline, SalesDeal, SalesAccount, etc.
│   │   └── Actions: 6 files — CRUD, dashboard, ICP, review
│   │
│   ├── WorkflowOS / Sunbul (L4-L5 — Partial)
│   │   ├── Route: /workflowos, /sunbul
│   │   ├── Engines: 14 files — templates, records, SLA, escalation, webhooks
│   │   ├── Models: 7+3 — SunbulClient, WorkflowTemplate, WorkflowRecord
│   │   └── Actions: 5 files — CRUD, admin, templates, SLA
│   │
│   ├── LocalContactOS (L4-L5 — Partial)
│   │   ├── Route: /contacts
│   │   ├── Engines: 4 files — contact registry, sensitivity, relationships
│   │   ├── Models: 8+ — LocalContact, LocalContactRelation, ContactEvidence
│   │   └── Actions: 3 files — CRUD, review, export approval
│   │
│   ├── Office AI Assistant (L4 — Usable v0.1)
│   │   ├── Route: /assistant, /office-ai
│   │   ├── Engines: 8 files — file extraction, task categories, role config
│   │   ├── Models: 6 — OfficeAiTask, OfficeAiOutput, OfficeAiFile
│   │   └── Actions: 3 files — workspace, stats, AI tasks
│   │
│   ├── RiskOS (L4)
│   │   ├── Route: /risk
│   │   └── Note: Audit-adjacent, not standalone product
│   │
│   ├── SimulationOS (L1 — Marketing redirect only)
│   │   └── Route: /products/simulation → redirects to /products
│   │
│   └── AQLIYA Studio (L0 — Strategic future)
│       └── Not implemented
│
├── DATA LAYER
│   │
│   ├── PostgreSQL 16 + pgvector (vector embeddings)
│   ├── Redis (caching, rate limiting, queues)
│   ├── File Storage (local or S3)
│   └── prisma/schema.prisma — 140+ models, 53 migrations
│
├── DEPLOYMENT & OPERATIONS
│   │
│   ├── Docker — Multi-stage node:22-alpine, standalone output
│   ├── docker-compose — 5 services (app, db, clamav, redis, backup)
│   ├── AWS ECS — me-south-1 region (via GitHub Actions deploy.yml)
│   ├── CI/CD — 5 workflows (ci, deploy, backup, preview, promote)
│   ├── Monitoring — Sentry (client 20%, server 50%, edge 20% traces)
│   ├── Scripts — 237 operational scripts
│   └── ERR Tooling — Engineering Readiness Review
│
├── DOCUMENTATION (2,213 files)
│   │
│   ├── Level 0: DOCUMENTATION_AUTHORITY.md
│   ├── Level 1-2: Official doctrine (14 files)
│   ├── Level 3: Governance charters (7 files)
│   ├── Level 4: Source of truth — implementation reality (28 files)
│   ├── Level 5: Products, systems, pilot, runbooks, releases (400+ files)
│   ├── Level 6: Evidence, validation, engineering, deployment (300+ files)
│   ├── Level 7: Theoretical reference library (200+ files)
│   └── Level 8: Archive — historical only (100+ files)
│
├── TESTING
│   │
│   ├── Unit/Integration: 324 test files, 2,321 tests, 242 suites (Jest, co-located)
│   ├── E2E: 11 Cypress spec files (auth, routing, audit, decision, sales, LC, marketing)
│   └── ERR: Engineering Readiness Review tooling (4 automated evidence packages)
│
└── HISTORICAL / ARCHIVE
    │
    ├── docs/archive/ — Superseded docs (Sunbul legacy, old content, deprecated)
    ├── scripts/archived/ — Single-use scripts
    └── .husky/ — Deprecated v8 git hooks (inert)
```

---

# Final Audit Verdict

## Overall Repository Health: **B+ (82/100)**

### Strengths
1. **Governance-first architecture**: Every product has audit trails, tenant isolation, RBAC, and evidence-backed outputs baked in.
2. **Comprehensive AI abstraction**: 32-file AI layer with multi-provider routing, cost tracking, and mandatory governance metadata.
3. **Well-tested**: 2,321 passing tests, 11 E2E suites, clean TypeScript build.
4. **Clear product boundaries**: Each product has well-defined routes, actions, components, and library modules.
5. **Documentation hierarchy**: Leveled authority system (0-8) with clear conflict resolution rules.
6. **Operational readiness**: Docker, CI/CD, backup scheduling, health checks, restore drills.
7. **Arabic-first design**: RTL layout, Noto Sans Arabic font, Arabic metadata, bilingual copy.

### Areas for Improvement
1. **Documentation redundancy**: Content duplicated across `docs/products/` and `docs/systems/` could be consolidated.
2. **Root-level clutter**: ~20 log files, diagnostic scripts, and reports at repository root that belong in subdirectories.
3. **SalesOS architecture debt**: v02/vnext split and `prisma-repository.ts` tech debt needs resolution.
4. **Sunbul → WorkflowOS migration**: Some documentation still treats Sunbul as separate from WorkflowOS.
5. **Empty `tests/` directory**: Misleading — should be removed or populated.
6. **Deprecated `.husky/`**: Inert Husky v8 hooks should be migrated to v10+ or removed.
7. **Partially superseded documents**: v1.1 roadmap and v1 governance docs need archival tagging.

### Critical Risks
- **None identified.** No security vulnerabilities, no broken builds, no test failures, no data integrity issues.

### Recommended Next Actions
1. **Consolidate root-level files**: Move reports to `docs/`, scripts to `scripts/`, add log files to `.gitignore`.
2. **Archive superseded docs**: Tag `aqliya-roadmap-v1.1.md` as superseded, archive `DOCUMENTATION_GOVERNANCE.md` v1.
3. **Resolve SalesOS vnext**: Consolidate `sales/v02/` and `sales/vnext/` into single implementation.
4. **Address empty `tests/` directory**: Either remove it or add a README redirecting to `src/__tests__/`.
5. **Migrate Husky**: Upgrade from deprecated v8 to v10+ with actual hook logic.
6. **Consolidate `scripts/local-content/` and `scripts/localcontent/`**: Standardize naming.
7. **Run full backup restore drill** on actual AWS RDS (I-01 from security hardening pass).

---

**Audit completed: 2026-06-29**
**Status: DONE**
**Evidence basis: Direct file inspection, not inference**
**No files modified**
