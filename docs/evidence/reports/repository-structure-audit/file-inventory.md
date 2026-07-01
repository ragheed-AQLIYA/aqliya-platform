# File Inventory — Important Files

## Legend

- **Type**: source / route / component / action / domain / db / config / docs / asset / test / script / generated / archive
- **Product**: AQLIYA Core / AuditOS / DecisionOS / SalesOS / LocalContentOS / Shared / Unknown
- **Status**: active / supporting / legacy / duplicate / generated / obsolete / needs-review
- **Version**: v1.1 / v1.0 / old / N/A
- **Runtime Impact**: direct / indirect / none
- **Build Impact**: direct / indirect / none
- **Risk if Deleted**: critical / high / medium / low / safe
- **Action**: keep / move / archive / merge / rename / review / ignore

## Root Configuration Files

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `package.json` | config | AQLIYA Core | active | N/A | direct | direct | critical | keep | Defines all dependencies and scripts |
| `tsconfig.json` | config | AQLIYA Core | active | N/A | direct | direct | critical | keep | TypeScript strict mode config |
| `next.config.mjs` | config | AQLIYA Core | active | N/A | direct | direct | critical | keep | Next.js 16 config |
| `eslint.config.mjs` | config | AQLIYA Core | active | N/A | none | direct | high | keep | ESLint 9 flat config |
| `jest.config.js` | config | AQLIYA Core | active | N/A | none | direct | high | keep | Jest test runner config |
| `middleware.ts` | source | AQLIYA Core | active | N/A | direct | direct | critical | keep | i18n routing via next-intl |
| `prisma.config.ts` | config | AQLIYA Core | active | N/A | direct | direct | critical | keep | Prisma configuration |
| `.env.example` | config | AQLIYA Core | active | N/A | indirect | indirect | medium | keep | Template only (untracked) |
| `Dockerfile` | config | AQLIYA Core | active | N/A | none | indirect | medium | keep | Build container (untracked) |
| `docker-compose.yml` | config | AQLIYA Core | active | N/A | none | indirect | medium | keep | Test/CI environment (untracked) |
| `sentry.client.config.ts` | config | AQLIYA Core | active | N/A | direct | direct | medium | keep | Sentry monitoring (untracked) |
| `vercel.json` | config | AQLIYA Core | active | N/A | direct | direct | medium | keep | Vercel deployment config |
| `AGENTS.md` | docs | AQLIYA Core | active | v1.1 | none | none | low | keep | Agent context — highest reference |
| `README.md` | docs | AQLIYA Core | active | v1.1 | none | none | low | keep | Root readme |

## Prisma (Database)

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `prisma/schema.prisma` | db | AQLIYA Core | active | N/A | direct | direct | critical | keep | All models: User, Org, AuditOS, DecisionOS |
| `prisma/migrations/` | db | AQLIYA Core | active | N/A | direct | direct | critical | keep | 7 migration folders; do not delete |
| `prisma/seed.ts` | db | AQLIYA Core | active | N/A | none | indirect | high | keep | Main seed data |
| `prisma/seed-audit.ts` | db | AuditOS | active | N/A | none | indirect | high | keep | AuditOS-specific seed |

## Source — App Routes

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `src/app/layout.tsx` | route | AQLIYA Core | active | N/A | direct | direct | critical | keep | Root layout with HTML, fonts, dir |
| `src/app/globals.css` | asset | AQLIYA Core | active | N/A | direct | direct | critical | keep | Global Tailwind styles |
| `src/app/(marketing)/` | route | AQLIYA Core | active | N/A | direct | direct | critical | keep | Public marketing pages |
| `src/app/(dashboard)/` | route | DecisionOS | active | N/A | direct | direct | critical | keep | Authenticated dashboard workspace |
| `src/app/audit/` | route | AuditOS | active | N/A | direct | direct | critical | keep | AuditOS workspace (core product) |
| `src/app/auditos/` | route | AuditOS | active | N/A | direct | direct | critical | keep | Guided demo (public, mock data) |
| `src/app/sales/` | route | SalesOS | prototype | N/A | direct | direct | high | review | Shell workspace; no backend actions |
| `src/app/api/` | route | AQLIYA Core | active | N/A | direct | direct | critical | keep | API routes (auth, health, etc.) |
| `src/app/login/` | route | AQLIYA Core | active | N/A | direct | direct | critical | keep | Login page |
| `src/app/published/` | route | AQLIYA Core | active | N/A | direct | direct | high | keep | Public recommendation pages |
| `src/app/(dashboard)/monitoring/` | route | AQLIYA Core | active | N/A | direct | direct | high | keep | Monitoring dashboard (untracked) |
| `src/app/api/metrics/` | route | AQLIYA Core | active | N/A | direct | direct | high | keep | Metrics API (untracked) |

## Source — Server Actions (src/actions/)

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `src/actions/audit-actions.ts` | action | AuditOS | active | N/A | direct | direct | critical | keep | Core AuditOS CRUD + workflow |
| `src/actions/audit-read-actions.ts` | action | AuditOS | active | N/A | direct | direct | critical | keep | Read-only audit queries |
| `src/actions/audit-export-actions.ts` | action | AuditOS | active | N/A | direct | direct | high | keep | Export (PDF, XLSX) |
| `src/actions/audit-admin-actions.ts` | action | AuditOS | active | N/A | direct | direct | high | keep | Admin user management |
| `src/actions/approval.ts` | action | Shared | active | N/A | direct | direct | critical | keep | Shared approval workflow |
| `src/actions/decisions.ts` | action | DecisionOS | active | N/A | direct | direct | critical | keep | Decision CRUD |
| `src/actions/decision-*.ts` | action | DecisionOS | active | N/A | direct | direct | high | keep | Decision sub-features |
| `src/actions/simulation.ts` | action | Simulation | active | N/A | direct | direct | medium | keep | Scenario simulation |
| `src/actions/tender.ts` | action | LocalContentOS | needs-review | N/A | indirect | direct | medium | review | Tender-related actions (placeholder for LCO?) |

## Source — Domain Logic (src/lib/)

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `src/lib/prisma.ts` | domain | AQLIYA Core | active | N/A | direct | direct | critical | keep | Prisma client singleton |
| `src/lib/auth.ts` | domain | AQLIYA Core | active | N/A | direct | direct | critical | keep | Auth configuration |
| `src/lib/auth-config.ts` | domain | AQLIYA Core | active | N/A | direct | direct | critical | keep | Auth config (NextAuth) |
| `src/lib/auth-next.ts` | domain | AQLIYA Core | active | N/A | direct | direct | critical | keep | NextAuth v5 integration |
| `src/lib/utils.ts` | domain | Shared | active | N/A | direct | direct | high | keep | Shared utility functions |
| `src/lib/platform-audit.ts` | domain | Shared | active | N/A | direct | direct | medium | keep | Platform audit helpers |
| `src/lib/decision-type-config.ts` | domain | DecisionOS | active | N/A | direct | direct | high | keep | Decision type configuration |

### src/lib/ai/ (AI Orchestration Engine)

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `src/lib/ai/orchestrator.ts` | domain | AQLIYA Core | active | N/A | direct | direct | critical | keep | AI orchestration — deterministic wiring complete |
| `src/lib/ai/types.ts` | domain | AQLIYA Core | active | N/A | direct | direct | high | keep | AI type definitions |
| `src/lib/ai/prompt-registry.ts` | domain | AQLIYA Core | active | N/A | direct | direct | high | keep | Prompt version registry |
| `src/lib/ai/handlers/` | domain | AQLIYA Core | active | N/A | direct | direct | high | keep | 5 deterministic AI handlers |
| `src/lib/ai/providers/deterministic-provider.ts` | domain | AQLIYA Core | active | N/A | direct | direct | high | keep | Active AI provider |
| `src/lib/ai/providers/cloud-provider.ts` | domain | AQLIYA Core | stub | N/A | indirect | direct | low | keep | Stub — throws on call |
| `src/lib/ai/providers/local-provider.ts` | domain | AQLIYA Core | stub | N/A | indirect | direct | low | keep | Stub — throws on call |

### src/lib/audit/ (AuditOS Domain)

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `src/lib/audit/services.ts` | domain | AuditOS | active | N/A | direct | direct | critical | keep | Core audit service layer |
| `src/lib/audit/workflow-gating.ts` | domain | AuditOS | active | N/A | direct | direct | critical | keep | Workflow state machine |
| `src/lib/audit/tenant-guard.ts` | domain | AuditOS | active | N/A | direct | direct | critical | keep | RBAC / tenant isolation |
| `src/lib/audit/audit-events.ts` | domain | AuditOS | active | N/A | direct | direct | high | keep | Audit event logging |
| `src/lib/audit/ai-service.ts` | domain | AuditOS | active | N/A | direct | direct | high | keep | AI service for AuditOS |
| `src/lib/audit/governance-bridge.ts` | domain | AuditOS | active | N/A | direct | direct | high | keep | Governance bridge |
| `src/lib/audit/export/` | domain | AuditOS | active | N/A | direct | direct | high | keep | PDF/XLSX export |
| `src/lib/audit/storage/` | domain | AuditOS | active | N/A | direct | direct | high | keep | File storage abstraction |
| `src/lib/audit/notes/` | domain | AuditOS | active | N/A | direct | direct | high | keep | Notes engine |
| `src/lib/audit/file-scanner.ts` | domain | AuditOS | active | N/A | direct | direct | medium | keep | File scanning (OCR not integrated) |
| `src/lib/audit/pagination.ts` | domain | Shared | active | N/A | direct | direct | medium | keep | Shared pagination |
| `src/lib/audit/rate-limit.ts` | domain | AuditOS | active | N/A | direct | direct | medium | keep | Rate limiting |
| `src/lib/audit/db/index.ts` | domain | AuditOS | active | N/A | direct | direct | high | keep | DB read index |
| `src/lib/audit/mock-data.ts` | domain | AuditOS | active | N/A | indirect | indirect | low | keep | Demo data |
| `src/lib/audit/demo-data.ts` | domain | AuditOS | active | N/A | indirect | indirect | low | keep | Demo data |

### src/lib/decision/ (DecisionOS Domain)

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `src/lib/decision/decision-engine.ts` | domain | DecisionOS | active | N/A | direct | direct | critical | keep | Core decision engine |
| `src/lib/decision/index.ts` | domain | DecisionOS | active | N/A | direct | direct | high | keep | Module index |
| `src/lib/decision/*.ts` | domain | DecisionOS | active | N/A | direct | direct | high | keep | ~20 decision domain modules |

### src/lib/governance/ (Shared Governance Engine)

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `src/lib/governance/approval-state.ts` | domain | Shared | active | N/A | direct | direct | critical | keep | Approval state machine |
| `src/lib/governance/escalation.ts` | domain | Shared | active | N/A | direct | direct | high | keep | Escalation logic |
| `src/lib/governance/provenance.ts` | domain | Shared | active | N/A | direct | direct | high | keep | Provenance tracking |
| `src/lib/governance/retrieval-router.ts` | domain | Shared | active | N/A | direct | direct | high | keep | Retrieval routing |
| `src/lib/governance/prompt-framework.ts` | domain | Shared | active | N/A | direct | direct | medium | keep | Prompt governance |
| `src/lib/governance/runtime-types.ts` | domain | Shared | active | N/A | direct | direct | high | keep | Runtime types |
| `src/lib/governance/ui/` | domain | Shared | active | N/A | direct | direct | medium | keep | Governance UI components |

### src/lib/platform/

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `src/lib/platform/index.ts` | domain | AQLIYA Core | active | N/A | direct | direct | high | keep | Platform module index |
| `src/lib/platform/navigation.ts` | domain | AQLIYA Core | active | N/A | direct | direct | high | keep | Navigation config |
| `src/lib/platform/workspace.ts` | domain | AQLIYA Core | active | N/A | direct | direct | high | keep | Workspace management |
| `src/lib/platform/intelligence.ts` | domain | AQLIYA Core | active | N/A | direct | direct | medium | keep | Intelligence types |
| `src/lib/platform/types.ts` | domain | AQLIYA Core | active | N/A | indirect | direct | medium | keep | Platform types |

### src/lib/recommendation/ & src/lib/simulation/

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `src/lib/recommendation/` | domain | AuditOS | active | N/A | direct | direct | high | keep | Recommendation engine (AuditOS) |
| `src/lib/simulation/` | domain | Simulation | active | N/A | direct | direct | high | keep | Simulation Engine |

## Source — Components (src/components/)

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `src/components/ui/` | component | Shared | active | N/A | direct | direct | critical | keep | shadcn/ui primitives (~20 components) |
| `src/components/audit/` | component | AuditOS | active | N/A | direct | direct | critical | keep | All AuditOS page components |
| `src/components/decisions/` | component | DecisionOS | active | N/A | direct | direct | critical | keep | Decision dashboard components |
| `src/components/enterprise/` | component | Shared | active | N/A | direct | direct | high | keep | Shared enterprise UI components |
| `src/components/platform/` | component | AQLIYA Core | active | N/A | direct | direct | high | keep | Platform shell components |
| `src/components/layout/` | component | AQLIYA Core | active | N/A | direct | direct | high | keep | App layout components |
| `src/components/intelligence/` | component | Shared | active | N/A | direct | direct | medium | keep | Intelligence indicators |
| `src/components/entity/` | component | Shared | active | N/A | direct | direct | medium | keep | Entity components |
| `src/components/visuals/` | component | Marketing | active | N/A | direct | direct | low | move? | Visual/diagram components — mostly marketing |
| `src/components/workspace/` | component | Shared | active | N/A | direct | direct | medium | keep | Workspace components |
| `src/components/forms/` | component | AQLIYA Core | active | N/A | direct | direct | low | keep | Form components |

## Source — Types

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `src/types/audit/index.ts` | types | AuditOS | active | N/A | indirect | direct | high | keep | Audit domain types |
| `src/types/plausible.d.ts` | types | AQLIYA Core | active | N/A | indirect | direct | low | keep | Plausible analytics types |
| `src/lib/types/decision.ts` | types | DecisionOS | active | N/A | indirect | direct | high | keep | Decision types |

## Source — Tests

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `src/__tests__/unit/` | test | Shared | active | N/A | none | indirect | low | keep | Unit tests (pagination, export, etc.) |
| `src/__tests__/integration/` | test | Shared | active | N/A | none | indirect | medium | keep | Integration tests |
| `src/__tests__/components/` | test | Shared | active | N/A | none | indirect | low | keep | Component tests |
| `src/__tests__/i18n/` | test | AQLIYA Core | active | N/A | none | indirect | low | keep | i18n string tests |
| `src/lib/governance/__tests__/` | test | Shared | active | N/A | none | indirect | low | keep | Governance engine unit tests |
| `src/__mocks__/` | test | Shared | active | N/A | none | indirect | medium | keep | Jest module mocks |

## Documentation

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `docs/official/` | docs | AQLIYA Core | active | v1.1 | none | none | low | keep | HIGHEST AUTHORITY — 8 official docs |
| `docs/source-of-truth/` | docs | AQLIYA Core | active | v1.0 | none | none | low | keep | Supporting reference — aligned with v1.1 |
| `docs/systems/` | docs | All | active | v1.0 | none | none | low | keep | Per-system details |
| `docs/theoretical-reference/` | docs | AQLIYA Core | supporting | v1.0 | none | none | low | keep | Full theoretical foundation (~400 files) |
| `docs/pilot/` | docs | AuditOS | active | old | none | none | low | archive | Pilot execution docs — useful but can archive old sessions |
| `docs/product/` | docs | All | supporting | old | none | none | low | review | Product definition packs — may duplicate v1.1 |
| `docs/commercial/` | docs | AuditOS | supporting | old | none | none | low | review | Commercial/demo materials |
| `docs/reports/` | docs | AQLIYA Core | supporting | old | none | none | low | keep | Prior reports (stabilization phases, audits) |
| `docs/execution/` | docs | AQLIYA Core | supporting | old | none | none | low | review | Engineering execution docs |
| `docs/operations/` | docs | AQLIYA Core | supporting | old | none | none | low | review | Operations docs |
| `docs/runtime-prototypes/` | docs | AQLIYA Core | supporting | old | none | none | low | review | Runtime prototyping docs |
| `docs/content/` | docs | Marketing | needs-review | old | none | none | low | archive | Website content drafts (may be outdated) |
| `docs/releases/` | docs | AQLIYA Core | supporting | old | none | none | low | keep | Release notes |
| `docs/prototype-planning/` | docs | AQLIYA Core | supporting | old | none | none | low | review | Prototype specs |
| `docs/technical/` | docs | AQLIYA Core | supporting | old | none | none | low | keep | Technical audits |
| `docs/api/` | docs | AQLIYA Core | needs-review | old | none | none | low | review | API docs (untracked) |
| `docs/company/` | docs | AQLIYA Core | needs-review | old | none | none | low | review | Company docs (untracked) |
| `docs/CONTRIBUTING.md` | docs | AQLIYA Core | needs-review | old | none | none | low | review | Contributing guide (untracked) |
| `docs/DEVELOPER.md` | docs | AQLIYA Core | needs-review | old | none | none | low | review | Developer guide (untracked) |
| `numbered doc folders` | docs | AuditOS | legacy | pre-v1.1 | none | none | low | archive | Pre-v1.1 numbered docs — may conflict with v1.1 |

## Public Assets

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `public/brand/` | asset | AQLIYA Core | active | N/A | direct | direct | medium | keep | Brand kit (logos) |
| `public/sw.js` | asset | AQLIYA Core | needs-review | N/A | direct | direct | low | review | Service worker (untracked) |

## Scripts

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `scripts/audit-health-check.ts` | script | AuditOS | active | N/A | none | indirect | medium | keep | AuditOS health check |
| `scripts/backup-verify.ts` | script | AQLIYA Core | active | N/A | none | indirect | medium | keep | Data integrity verification |
| `scripts/pilot-*.ts` | script | AuditOS | active | N/A | none | indirect | low | keep | Pilot monitoring scripts |
| `scripts/phase20-*.ts` | script | AuditOS | active | N/A | none | indirect | low | keep | Phase scoring scripts |
| `scripts/validate-env.mjs` | script | AQLIYA Core | active | N/A | none | indirect | low | keep | Env validation |
| `scripts/rtl-audit.ts` | script | AQLIYA Core | active | N/A | none | indirect | low | keep | RTL audit |
| `scripts/backup.mjs` | script | AQLIYA Core | active | N/A | none | indirect | low | keep | Backup script (untracked) |
| `scripts/db-backup.ts` | script | AQLIYA Core | active | N/A | none | indirect | low | keep | DB backup (untracked) |
| `scripts/db-restore.ts` | script | AQLIYA Core | active | N/A | none | indirect | low | keep | DB restore (untracked) |
| `scripts/bundle-analyzer.js` | script | AQLIYA Core | active | N/A | none | indirect | low | keep | Bundle analysis (untracked) |
| `scripts/turkish-qa.mjs` | script | AQLIYA Core | active | N/A | none | indirect | low | keep | Turkish QA (untracked) |
| `scripts/performance-budget.mjs` | script | AQLIYA Core | active | N/A | none | indirect | low | keep | Perf budget (untracked) |

## HTML/Asset Files in docs/

| Path | Type | Product | Status | Version | Runtime | Build | Risk | Action | Notes |
|------|------|---------|--------|---------|---------|-------|------|--------|-------|
| `docs/content/AQLIYA_Website_Content_Rewrite.docx` | asset | Marketing | needs-review | old | none | none | low | review | Word doc — binary, not version-friendly |
