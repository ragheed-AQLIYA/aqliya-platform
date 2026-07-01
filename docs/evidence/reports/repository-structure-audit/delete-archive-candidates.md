# Delete / Archive Candidates

## Safe to Ignore (Generated / Cache / Dependency)

| Path | Reason | Risk | Recommendation |
|------|--------|------|---------------|
| `node_modules/` | Third-party dependencies | Safe | Already gitignored; do not touch |
| `.next/` | Next.js build output | Safe | Already gitignored; do not touch |
| `coverage/` | Test coverage reports | Safe | Already gitignored if exists |
| `.git/` | Git internal database | Safe | Already gitignored; do not touch |
| `tsconfig.tsbuildinfo` | TypeScript incremental build info | Safe | Generated; can be gitignored |
| `next-env.d.ts` | Next.js TypeScript env declarations | Safe | Generated; keep in git |
| `prisma/dev.db` | SQLite development database | Safe | Already gitignored |

## Safe to Archive After Review

| Path | Reason | Risk | Recommendation |
|------|--------|------|---------------|
| ~~`docs/01-product-foundation/`~~ | Pre-v1.1 numbered docs | Low | ✅ Archived → `docs/archive/legacy-numbered/` (Phase 1 complete) |
| ~~`docs/04-financial-statements/`~~ | Pre-v1.1 numbered docs | Low | ✅ Archived → `docs/archive/legacy-numbered/` (Phase 1 complete) |
| ~~`docs/06-evidence-and-review/`~~ | Pre-v1.1 numbered docs | Low | ✅ Archived → `docs/archive/legacy-numbered/` (Phase 1 complete) |
| ~~`docs/07-ai-governance/`~~ | Pre-v1.1 numbered docs | Low | ✅ Archived → `docs/archive/legacy-numbered/` (Phase 1 complete) |
| ~~`docs/content/website-content-rewrite-v1- chatGPT.md`~~ | Old draft (v1) | Low | ✅ Archived → `docs/archive/content-drafts/` (Phase 1 complete) |
| ~~`docs/content/website-content-rewrite-v1- opencode.md`~~ | Old draft (v1) | Low | ✅ Archived → `docs/archive/content-drafts/` (Phase 1 complete) |
| ~~`docs/content/website-content-rewrite-v2.md`~~ | Old draft (v2) | Low | ✅ Archived → `docs/archive/content-drafts/` (Phase 1 complete) |
| ~~`docs/content/website-content-rewrite-v2-chatGPT.md`~~ | Old draft (v2) | Low | ✅ Archived → `docs/archive/content-drafts/` (Phase 1 complete) |
| `docs/content/website-content-rewrite-v3-hybrid.md` | Current v3 hybrid — active | Low | ✅ Kept in place (Phase 1 complete) |
| ~~`docs/content/AQLIYA_Website_Content_Rewrite.docx`~~ | Binary Word document | Low | ✅ Archived → `docs/archive/content-drafts/` (Phase 1 complete) |
| ~~`docs/content/aqliya_copy_structure.json`~~ | Old copy structure | Low | ✅ Archived → `docs/archive/content-drafts/` (Phase 1 complete) |
| `docs/content/IMPLEMENTATION_CHECKLIST.md` | Old implementation checklist | Low | Archive |
| `docs/content/website-content-extract.md` | Old content extract | Low | Archive |
| Old pilot session reports (session-1 through session-4) | Historical record of individual pilot sessions | Low | Archive to `docs/pilot/archive/` |
| `docs/commercial/` (old tracked folder) | May duplicate `docs/commercial-pack/` (untracked) | Low | Review and merge; archive old |
| `docs/pilot/dry-run/` | Dry run docs — historical | Low | Archive |
| `docs/pilot/runs/2026-05-12-first-controlled-pilot/` | Individual pilot run report | Low | Archive |

## Requires Owner Decision

| Path | Reason | Risk | Recommendation |
|------|--------|------|---------------|
| `docs/product/aqliya-product-comparison-and-recommendation.md` | May duplicate v1.1 product taxonomy | Low | Review content; merge with official taxonomy |
| `docs/product/decisionos-product-definition-pack.md` | May duplicate v1.1 DecisionOS definition | Low | Review content; keep if adds detail not in v1.1 |
| `docs/product/salesos-product-definition-pack.md` | SalesOS is prototype/future; doc may overclaim | Medium | Review for v1.1 alignment |
| `docs/product/simulationos-product-definition-pack.md` | SimulationOS is marketing-only | Low | Review for v1.1 alignment |
| `docs/source-of-truth/AQLIYA-company-product-architecture-official.md` | May duplicate v1.1 official architecture | Low | Review; archive if fully superseded |
| `docs/source-of-truth/aqlia-auditos-boundaries.md` | Typo in filename; content may be outdated | Low | Fix typo; review content |
| `docs/source-of-truth/AI_CONTEXT.md` | May duplicate AGENTS.md | Low | Review; merge or archive |
| `docs/runtime-prototypes/` (entire folder) | ~30 files; valuable human-review observations | Low | Keep; may archive completed phases 6-7 |
| `docs/auditos/` (entire folder) | Operational pilot docs — valuable but AuditOS-focused | Low | Move to `docs/systems/auditos/operations/` |
| `public/sw.js` | Service worker — untracked; is it intentional? | Medium | Verify if SW is needed; commit or gitignore |
| `sentry.client.config.ts` / `.edge` / `.server` | Sentry config — untracked; intended for production? | Medium | Decide if Sentry should be active |
| `src/app/(dashboard)/monitoring/` | Monitoring dashboard — untracked | Low | Review and commit |
| `src/app/api/metrics/` | Metrics API — untracked | Low | Review and commit |
| `src/instrumentation.ts` | Next.js instrumentation — untracked | Low | Review and commit |
| `src/middleware-rate-limit.ts` | Rate limit middleware — untracked | Low | Review and commit |
| `src/middleware-security.ts` | Security middleware — untracked | Low | Review and commit |
| `src/lib/logger.ts` | Logger — untracked | Low | Review and commit |
| `src/lib/cache.ts` | Cache utility — untracked | Low | Review and commit |
| `src/lib/api-response.ts` | API response utility — untracked | Low | Review and commit |
| `src/lib/rate-limit.ts` | Rate limit utility — untracked | Low | Review and commit |
| `src/components/enterprise/loading-state.tsx` | Loading state component — untracked | Low | Review and commit |
| `src/__mocks__/prisma-adapter-mock.js` | Prisma mock — untracked | Low | Review and commit |
| `src/__mocks__/prisma-client-mock.js` | Prisma client mock — untracked | Low | Review and commit |
| `src/__mocks__/prisma-mock.js` | Prisma mock — untracked | Low | Review and commit |
| `src/__mocks__/server-only.js` | server-only mock — untracked | Low | Review and commit |
| `cypress/` | Cypress E2E tests — untracked | Low | Review and commit |
| `Dockerfile`, `docker-compose.yml`, `docker-compose.test.yml` | Docker config — untracked | Low | Review and commit |
| `scripts/backup.mjs`, `db-backup.ts`, `db-restore.ts` | Backup/restore scripts — untracked | Low | Review and commit |

## Do NOT Delete

| Path | Reason | Risk if Deleted |
|------|--------|----------------|
| `package.json` | Defines all dependencies and scripts | Critical — project won't install/run |
| `next.config.mjs` | Next.js configuration | Critical — build and runtime break |
| `tsconfig.json` | TypeScript strict mode config | Critical — type checking breaks |
| `middleware.ts` | i18n routing middleware | Critical — routing breaks |
| `prisma/schema.prisma` | All database models | Critical — no database access |
| `prisma/migrations/` | Database migration history | Critical — cannot recreate DB |
| `src/app/layout.tsx` | Root layout | Critical — no page rendering |
| `src/app/globals.css` | Global Tailwind styles | High — styling breaks |
| `src/lib/prisma.ts` | Prisma client singleton | Critical — no DB access |
| `src/lib/auth.ts`, `auth-config.ts`, `auth-next.ts` | Auth configuration | Critical — no authentication |
| `src/actions/audit-actions.ts` | Core AuditOS operations | Critical — AuditOS breaks |
| `src/actions/approval.ts` | Shared approval workflow | Critical — approval breaks in AuditOS + DecisionOS |
| `src/actions/decisions.ts` | DecisionOS CRUD | Critical — DecisionOS breaks |
| `src/lib/governance/approval-state.ts` | Approval state machine | Critical — both products depend on it |
| `src/lib/audit/workflow-gating.ts` | Workflow state machine | Critical — AuditOS workflow breaks |
| `src/lib/audit/tenant-guard.ts` | RBAC / tenant isolation | Critical — security hole |
| `src/lib/decision/decision-engine.ts` | Core decision engine | Critical — DecisionOS breaks |
| `src/lib/ai/orchestrator.ts` | AI orchestration | High — AI features break |
| `src/components/ui/` (any) | shadcn/ui primitives | High — many components depend on these |
| All route pages in `src/app/` | All Next.js pages | Critical — routes break |
| `eslint.config.mjs` | ESLint 9 config | High — linting breaks |
| `jest.config.js` | Jest config | Medium — tests break |
| `prisma/seed.ts` | Seed data | Medium — cannot seed DB |
| `AGENTS.md` | Agent context | Low — but important reference |
| `README.md` | Project README | Low — but important reference |
| `docs/official/` (all 8 files) | Highest authority docs | Low — but critical reference loss |
| `docs/source-of-truth/` (all files) | Supporting architecture docs | Low — but historical loss |
