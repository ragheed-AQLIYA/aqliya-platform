# Source Code Impact Map

## Routes

| Route Group | What It Does | Product | Active? | Runtime Impact | Safe to Move? | Dependencies |
|-------------|-------------|---------|---------|---------------|---------------|-------------|
| `(marketing)/` | Public company/product pages, SEO | AQLIYA Core | Yes | Direct | Only if all imports updated | Components: enterprise, visuals, forms, layout; Lib: navigation |
| `(dashboard)/` | Authenticated dashboard for DecisionOS | DecisionOS | Yes | Direct | Only if all imports updated | Components: decisions, enterprise, workspace; Actions: decisions, decision-*; Lib: decision/ |
| `audit/` | Full AuditOS workspace (engagements, TB, mapping, statements, notes, evidence, findings, review, approval, export) | AuditOS | Yes | Direct | Only if all imports updated | Components: audit/*; Actions: audit-*, approval; Lib: audit/, governance/ |
| `auditos/` | Guided AuditOS demo (public, mock data) | AuditOS | Yes | Direct | Only if all imports updated | Components: audit/*; Lib: audit/demo-data |
| `sales/` | SalesOS shell page | SalesOS | Prototype | Direct | Low risk — single page | Components: enterprise; No server actions |
| `api/` | API routes (auth, health, metrics, custom-product, export) | AQLIYA Core | Yes | Direct | Only if all imports updated | Lib: auth, prisma |
| `login/` | Login page | AQLIYA Core | Yes | Direct | Low risk | Components: ui/* |
| `published/` | Public recommendation page | AQLIYA Core | Yes | Direct | Low risk | Lib: decision/ |
| `access-denied/` | Access denied page | AQLIYA Core | Yes | Direct | Low risk | Static |

## Layouts

| Layout File | What It Does | Product | Active? | Runtime Impact | Safe to Move? |
|-------------|-------------|---------|---------|---------------|---------------|
| `src/app/layout.tsx` | Root HTML, fonts, direction | Core | Yes | Direct | No |
| `src/app/(marketing)/layout.tsx` | Marketing layout with header/footer | Core | Yes | Direct | Only if imports updated |
| `src/app/(dashboard)/layout.tsx` | Dashboard layout with sidebar | Core | Yes | Direct | Only if imports updated |
| `src/app/audit/layout.tsx` | Audit workspace layout | AuditOS | Yes | Direct | Only if imports updated |
| `src/app/auditos/layout.tsx` | Demo layout | AuditOS | Yes | Direct | Only if imports updated |
| `src/app/sales/layout.tsx` | Sales shell layout | SalesOS | Prototype | Direct | Low risk |

## Server Actions

| Action Group | What It Does | Product | Active? | Runtime Impact | Safe to Move? |
|-------------|-------------|---------|---------|---------------|---------------|
| `audit-actions.ts` | Core AuditOS CRUD + workflow transitions | AuditOS | Yes | Direct | Only if all imports updated |
| `audit-read-actions.ts` | Read-only queries | AuditOS | Yes | Direct | Only if all imports updated |
| `audit-export-actions.ts` | PDF/XLSX export | AuditOS | Yes | Direct | Only if all imports updated |
| `audit-admin-actions.ts` | User admin | AuditOS | Yes | Direct | Only if all imports updated |
| `approval.ts` | Shared approval workflow | Shared | Yes | Direct | Only if all imports updated |
| `decisions.ts` | Decision CRUD | DecisionOS | Yes | Direct | Only if all imports updated |
| `decision-*.ts` (7 files) | Decision sub-features | DecisionOS | Yes | Direct | Only if all imports updated |
| `simulation.ts` | Scenario simulation | Simulation | Yes | Direct | Only if all imports updated |
| `tender.ts` | Tender actions | LocalContentOS? | Needs-review | Indirect | Needs assessment |

## Domain Services (src/lib/)

| Service | What It Does | Product | Active? | Runtime Impact | Notes |
|---------|-------------|---------|---------|---------------|-------|
| `lib/prisma.ts` | Prisma client singleton | Core | Yes | Critical | Single source of truth for DB |
| `lib/auth.ts`, `auth-config.ts`, `auth-next.ts` | NextAuth v5 config | Core | Yes | Critical | Authentication |
| `lib/ai/` | AI Orchestration Engine | Core | Yes | Direct | Deterministic; Cloud+Local stubs |
| `lib/audit/` | AuditOS domain (~30 files) | AuditOS | Yes | Direct | Core product logic |
| `lib/decision/` | DecisionOS domain (~20 files) | DecisionOS | Yes | Direct | Adjacent product logic |
| `lib/governance/` | Shared Governance Engine | Shared | Yes | Direct | Used by both AuditOS and DecisionOS |
| `lib/platform/` | Platform services | Core | Yes | Direct | Navigation, workspace |
| `lib/recommendation/` | Recommendation Engine | AuditOS | Yes | Direct | Used in audit workflow |
| `lib/simulation/` | Simulation Engine | Simulation | Yes | Direct | Scenario analysis |
| `lib/validation/` | Zod schemas | Shared | Yes | Indirect | Input validation |
| `lib/utils.ts` | Shared utilities | Shared | Yes | Direct | Used everywhere |

## Database Schema

| Area | What It Does | Product | Active? | Runtime Impact |
|------|-------------|---------|---------|---------------|
| `schema.prisma` | All 20+ models (User, Org, Workspace, Engagement, TB, Mapping, Statement, Notes, Evidence, Findings, Approval, AI output, Decisions, etc.) | Core | Yes | Critical |
| `migrations/` | 7 migration files | Core | Yes | Critical |
| `seed.ts` | Main seed data | Core | Yes | Indirect |
| `seed-audit.ts` | AuditOS seed data | AuditOS | Yes | Indirect |

## Tests

| Test Area | What It Tests | Product | Active? | Notes |
|-----------|--------------|---------|---------|-------|
| `__tests__/unit/` | Export generators, file scanner, pagination, workflow gating, storage | Shared | Yes | Low risk to move |
| `__tests__/integration/` | API health, governance bridge, critical paths, org scoping | Shared | Yes | Requires PostgreSQL Docker |
| `__tests__/components/` | Engagement tabs, status badge, empty state, loading state | Shared | Yes | Low risk to move |
| `__tests__/i18n/` | No-English-strings enforcement | Core | Yes | Low risk to move |
| `lib/governance/__tests__/` | Approval state, escalation, prompt, provenance, retrieval | Shared | Yes | Low risk to move |
| `cypress/e2e/` | E2E marketing pages, audit pages | Core | Yes | Low risk to move |

## Scripts

| Script | What It Does | Active? | Notes |
|--------|-------------|---------|-------|
| `audit-health-check.ts` | AuditOS health verification | Yes | Low risk |
| `backup-verify.ts` | Data integrity check | Yes | Low risk |
| `pilot-daily-monitor.ts` | Daily pilot monitoring | Yes | Low risk |
| `pilot-workflow-execution.ts` | Pilot workflow execution | Yes | Low risk |
| `phase20-*.ts` | Scoring phases | Yes | Low risk |
| `validate-env.mjs` | Environment validation | Yes | Low risk |
| `rtl-audit.ts` | RTL direction audit | Yes | Low risk |
| `backup.mjs`, `db-backup.ts`, `db-restore.ts` | Backup/restore | Yes | Low risk (untracked) |
| `bundle-analyzer.js` | Bundle size analysis | Yes | Low risk (untracked) |

## Public Assets

| Asset | What It Does | Active? | Notes |
|-------|-------------|---------|-------|
| `public/brand/` | Logo kit (6 formats × 4 logos) | Yes | Used in UI, export PDFs |
| `public/sw.js` | Service worker | Needs-review | Untracked |
