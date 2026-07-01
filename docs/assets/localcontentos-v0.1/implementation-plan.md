# LocalContentOS v0.1 — Implementation Plan

## Phase 0 — Scope Lock (Complete)

**Status:** Implemented. LocalContentOS v0.1 workspace is L5 pilot-ready with conditions / usable v0.1 after mutation feedback loop verification (2026-05-23). See `docs/reports/localcontentos-v0.1-documentation-truth-sync-2026-05-23.md`.

| Deliverable                     | Status |
| ------------------------------- | ------ |
| Product scope document          | Done   |
| Workflow specification          | Done   |
| Route plan                      | Done   |
| Data model plan                 | Done   |
| Governance model                | Done   |
| Evidence & export model         | Done   |
| AI boundaries                   | Done   |
| Seed data plan                  | Done   |
| Implementation plan (this file) | Done   |
| Source-of-truth doc updates     | Done   |
| Scope lock report               | Done   |

## Phase 1 — Schema and Seeds

**Objective:** Prisma models, migration, seed dataset.

| Task                               | Files                                           | Output                                                    |
| ---------------------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| Add LocalContent models to schema  | `prisma/schema.prisma`                          | 10 new models                                             |
| Create migration                   | `prisma/migrations/`                            | Migration SQL                                             |
| Create seed script                 | `prisma/seed-local-content.ts`                  | Realistic Saudi-market dataset                            |
| Add seed reference to package.json | `package.json`                                  | `"seed:localcontent": "tsx prisma/seed-local-content.ts"` |
| Validate migration                 | `npx prisma migrate dev`, `npx prisma generate` | No schema errors                                          |

**Validation:** `npx prisma migrate dev`, `npx prisma generate`, `npx tsc --noEmit`

## Phase 2 — Core Services and Actions

**Objective:** Domain services, server actions, guards, audit.

| Task                          | Files                                            | Output                              |
| ----------------------------- | ------------------------------------------------ | ----------------------------------- |
| Create project service        | `src/lib/localcontent/project-service.ts`        | CRUD for LocalContentProject        |
| Create supplier service       | `src/lib/localcontent/supplier-service.ts`       | CRUD for LocalContentSupplier       |
| Create spend service          | `src/lib/localcontent/spend-service.ts`          | CRUD + CSV import for spend records |
| Create classification service | `src/lib/localcontent/classification-service.ts` | CRUD for classifications            |
| Create evidence service       | `src/lib/localcontent/evidence-service.ts`       | Upload, link, review evidence       |
| Create findings service       | `src/lib/localcontent/findings-service.ts`       | CRUD for findings                   |
| Create scoring service        | `src/lib/localcontent/scoring-service.ts`        | Calculate local content scores      |
| Create export service         | `src/lib/localcontent/export/`                   | PDF/XLSX export generation          |
| Create server actions         | `src/actions/localcontent-actions.ts`            | All mutation actions                |
| Create tenant guard           | `src/lib/localcontent/tenant-guard.ts`           | Project access checks               |
| Wire platform audit log       | All mutation services                            | Audit trail for every mutation      |
| Extend governance task types  | `src/lib/governance/retrieval-router.ts`         | LC task types                       |
| Extend governance context     | `src/lib/governance/runtime-types.ts`            | LC escalation triggers              |

**Validation:** `npx tsc --noEmit`, `npm run lint`, `npm test -- --runInBand`

## Phase 3 — Workspace Routes

**Objective:** Dashboard and workflow pages.

| Task                | Route                                                | Output                                  |
| ------------------- | ---------------------------------------------------- | --------------------------------------- |
| Dashboard           | `/local-content`                                     | Project list, KPIs, create project      |
| Project layout      | `/local-content/projects/[projectId]/layout.tsx`     | Tabs, workflow progress, breadcrumbs    |
| Suppliers page      | `/local-content/projects/[projectId]/suppliers`      | Supplier table, add/edit                |
| Spend records page  | `/local-content/projects/[projectId]/spend`          | Spend table, CSV import                 |
| Classification page | `/local-content/projects/[projectId]/classification` | Classification entries, scoring summary |

**Validation:** `npx tsc --noEmit`, `npm run build`

## Phase 4 — Evidence, Classification, Findings

**Objective:** Evidence upload/linking, classification review, findings.

| Task                        | Route                                          | Output                         |
| --------------------------- | ---------------------------------------------- | ------------------------------ |
| Evidence page               | `/local-content/projects/[projectId]/evidence` | Upload, link, review evidence  |
| Findings page               | `/local-content/projects/[projectId]/findings` | Gap/risk register              |
| Project detail enhancements | `/local-content/projects/[projectId]`          | Score display, status, summary |

**Validation:** `npx tsc --noEmit`, `npm run build`

## Phase 5 — Review, Approval, Reports

**Objective:** Review workflow, approval, PDF/XLSX export.

| Task                  | Route                                                      | Output                  |
| --------------------- | ---------------------------------------------------------- | ----------------------- |
| Review page           | `/local-content/projects/[projectId]/review`               | Submit, comment, return |
| Approval page         | `/local-content/projects/[projectId]/approval`             | Approve, reject         |
| Reports page          | `/local-content/projects/[projectId]/reports`              | Generate and download   |
| Audit trail page      | `/local-content/projects/[projectId]/audit-trail`          | Event log               |
| Export API            | `/api/local-content/projects/[projectId]/exports/[format]` | Export endpoint         |
| Evidence download API | `/api/local-content/evidence/[evidenceId]/download`        | Protected file download |

**Validation:** `npx tsc --noEmit`, `npm run build`, `npm test -- --runInBand`

## Phase 6 — QA and Release

**Objective:** Integration tests, smoke tests, docs, demo safety.

| Task                     | Output                                                  |
| ------------------------ | ------------------------------------------------------- |
| Integration tests        | `src/__tests__/integration/localcontent-*.test.ts`      |
| Route smoke tests        | All workflow routes verified                            |
| Build validation         | `npm run build`                                         |
| Demo safety update       | Update `docs/releases/aqliya-v0.1-demo-safety-guide.md` |
| Known limitations update | Update `docs/releases/aqliya-v0.1-known-limitations.md` |
| Release notes update     | Update `docs/releases/aqliya-v0.1-release-notes.md`     |
| Product status update    | Update `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`  |
| Final go/no-go           | LocalContentOS v0.1 release decision                    |

## Phase 7 — L5 Completion Patch (2026-05-21)

**Objective:** Close L5 pilot gaps — evidence file upload UI, project creation UI.

| Task                           | Files                                                                                                   | Output                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Evidence file upload UI        | `src/components/local-content/evidence-file-upload-form.tsx`                                            | File picker, type/supplier select, success/error display |
| Wire upload to evidence page   | `src/app/local-content/projects/[projectId]/evidence/page.tsx`                                          | Upload form alongside metadata form                      |
| Project creation form          | `src/components/local-content/project-create-form.tsx`                                                  | Name, period, scope fields, success/error display        |
| Wire creation to projects page | `src/app/local-content/projects/page.tsx`                                                               | Create form above project list                           |
| Full validation                | `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm test`, `npx tsx prisma/seed-local-content.ts` | All PASS                                                 |

**Validation:** Full pipeline passed. See `docs/reports/localcontentos-v0.1-l5-completion-patch-report.md`.

**Validation:** Full pipeline: `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm test -- --runInBand`

## Phase Summary

| Phase | Name                | Files/Areas                                          | Output                                 | Validation                    |
| ----- | ------------------- | ---------------------------------------------------- | -------------------------------------- | ----------------------------- |
| 0     | Scope Lock          | `docs/products/localcontentos-v0.1/`                  | 10 docs + report                       | Lint, tsc, build              |
| 1     | Schema & Seeds      | `prisma/`                                            | 10 models, migration, seed             | Prisma generate, migrate, tsc |
| 2     | Core Services       | `src/lib/localcontent/`, `src/actions/`              | Services, actions, guards, audit       | tsc, lint, test               |
| 3     | Workspace Routes    | `src/app/local-content/` (5 routes)                  | Dashboard + core pages                 | tsc, build                    |
| 4     | Evidence & Findings | `src/app/local-content/` (2 routes)                  | Evidence, findings, score display      | tsc, build                    |
| 5     | Review & Export     | `src/app/local-content/` (4 routes) + `src/app/api/` | Review, approval, reports, audit trail | tsc, build, test              |
| 6     | QA & Release        | Tests, docs                                          | Integration tests, release docs        | Full pipeline                 |
