# AQLIYA Full Project Audit Report

## 1. Executive Summary

- Overall project status: **Internally reviewable**
- Main conclusion: The repository contains a substantial AuditOS implementation, a separate guided demo, and a broad AQLIYA company/platform narrative, but the current repo is not aligned enough for external demo, pilot, or commercial claims without cleanup. The main blockers are unguarded AuditOS read paths, product-identity drift across `/audit`, `/auditos`, `DecisionOS`, and `SalesOS`, incomplete workflow persistence at validation/publication, and operational documentation that overstates what the executable tooling actually does.

### Top 5 Risks

1. AuditOS read-side server actions do not enforce actor or tenant checks.
2. Product identity is split across `/audit`, `/auditos`, `AQLIYA Platform`, `DecisionOS`, and `SalesOS`.
3. Core audit workflow is not fully durable end-to-end: validation dispositions are client-only and publication has no publish mutation.
4. Operational backup/restore documentation does not match executable scripts.
5. Seed, mock, and UI data disagree on key mappings and balances, weakening audit-grade traceability.

### Top 5 Recommended Actions

1. Add `getAuditActor()` and `assertEngagementAccess()` enforcement to every AuditOS read action.
2. Define one authoritative route/status model for AuditOS workspace vs guided demo, then align docs, marketing, and navigation.
3. Implement persisted validation dispositions and a real publication/publish transition, or explicitly downgrade those screens to demo-only.
4. Reconcile seed, mock, and UI data for the Gulf Trading dataset before any external walkthrough.
5. Rewrite operational docs to match current scripts, or implement the promised scripts and endpoints.

## 2. Audit Scope

### What Was Reviewed

- Repository structure at the workspace root.
- `package.json`, `next.config.mjs`, `tsconfig.json`, `prisma.config.ts`, `jest.config.js`.
- `docs/`, including product, pilot, execution, archive, theoretical-reference, and AuditOS operational docs.
- `public/`, especially `public/brand/` and favicon/logo references.
- `src/app/`, `src/components/`, `src/actions/`, `src/lib/`, `src/types/audit/`.
- `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/seed-audit.ts`, and migrations.
- Validation commands and repo-provided health scripts.

### What Was Not Reviewed

- Browser-rendered behavior, visual regressions, or runtime network traces.
- External services such as Resend delivery, cloud deployment, or real malware scanning.
- Actual production backup creation and actual restore execution.
- Destructive seed/reset operations.

### Commands Run

- `npm run lint`
- `npx tsc --noEmit`
- `npx prisma generate`
- `npm test`
- `npm run build`
- `npx tsc --noEmit` after build
- `npm run audit:health`
- `npm run backup:verify`
- `npm run db:backup`
- `npm run db:restore`

### Evidence Limitations

- `npm install` was not run because `node_modules/` already exists at the repo root.
- `npm run seed:audit` was not run because `prisma/seed-audit.ts:16-38` deletes existing AuditOS data before reseeding.
- `npx prisma db seed` was not run because `prisma.config.ts:4-11` points Prisma seeding to `prisma/seed.ts`, which seeds DecisionOS/demo organization data, not the AuditOS dataset.
- Absence findings are based on direct directory/file inspection.

## 3. Repository Map

### Top-Level Folders

- `src/`
- `docs/`
- `prisma/`
- `public/`
- `scripts/`
- `node_modules/`
- `.git/`
- `.next/`
- `.opencode/`

### Product Areas

- Company/marketing: `src/app/(marketing)/`
- AuditOS governed workspace: `src/app/audit/`
- AuditOS guided demo: `src/app/auditos/`
- DecisionOS/dashboard: `src/app/(dashboard)/`
- SalesOS: `src/app/sales/`
- Custom product inquiry: `src/app/(marketing)/custom-product/` and `src/app/api/custom-product-submit/route.ts`

### Technical Stack

- Framework: Next.js 16.2.4 (`package.json:42`, `src/app/`)
- React: React 19.2.4 (`package.json:45-46`)
- Package manager: npm (`package-lock.json`, scripts in `package.json:5-20`)
- ORM: Prisma 7.8.0 (`package.json:25-26,63`, `prisma/schema.prisma`)
- Database target: PostgreSQL (`prisma/schema.prisma:5-7`, `prisma/migrations/migration_lock.toml:3`)
- Styling: Tailwind CSS 4, shadcn, Radix (`package.json:27-35,64-65`, `src/app/globals.css:1-68`, `components.json:6-12`)
- Testing: Jest (`package.json:11`, `jest.config.js:5-26`)
- Build/lint/type check: Next build, ESLint, TypeScript (`package.json:7,10`, `tsconfig.json:1-34`, `eslint.config.mjs`)

### Important Files

- `package.json`
- `docs/README.md`
- `docs/product/auditos-product-packaging.md`
- `docs/aqliya-auditos-boundaries.md`
- `src/app/layout.tsx`
- `src/app/(marketing)/page.tsx`
- `src/app/audit/page.tsx`
- `src/app/auditos/page.tsx`
- `src/components/platform/platform-sidebar.tsx`
- `src/actions/audit-actions.ts`
- `src/actions/audit-read-actions.ts`
- `src/lib/audit/services.ts`
- `src/lib/audit/db/index.ts`
- `prisma/schema.prisma`

## 4. Product & Strategy Review

### Current Product Narrative

- Confirmed company/platform framing exists in docs and metadata.
- Confirmed AuditOS is documented as the current primary product line and first commercial focus.
- Confirmed live codebase also contains active DecisionOS and SalesOS surfaces.
- Confirmed current repo does **not** present those boundaries consistently across docs, marketing, app shell, and route naming.

### Confirmed Positioning

- `src/app/layout.tsx:11-37,44-63` presents AQLIYA as the organization/site identity.
- `docs/AQLIYA-company-product-architecture-official.md:3-26` defines AQLIYA as the company architecture with multiple official product lines.
- `docs/product/auditos-product-packaging.md:5-10,21-33,174-214` defines AuditOS as the current primary product line and first commercial focus.

### Detailed Findings

- Finding: AuditOS-first positioning is documented, but the public site and platform shell do not currently reflect an AuditOS-first operating focus.
- Severity: High
- Evidence:
  - Path: `docs/product/auditos-product-packaging.md:9,174,207-214`
  - File/section/function: Product Identity / Sales Narrative / Packaging Priorities
  - Observed fact: AuditOS is explicitly described as the current primary product line and first commercial focus, and external presentation order is prescribed.
  - Path: `src/app/(marketing)/page.tsx:5-55,173-193`
  - File/section/function: `products` array / Product Lines section
  - Observed fact: homepage presents six peer solution lines and mentions AuditOS only as a note under the audit solution line.
  - Path: `src/components/platform/platform-sidebar.tsx:21-62`
  - File/section/function: `modules`
  - Observed fact: `AuditOS`, `SalesOS`, and `DecisionOS` are presented as co-equal live modules.
- Why it matters: The repo's external and internal surfaces do not reinforce the declared wedge strategy, which creates confusion about what is current, adjacent, or future.
- Recommended action: Publish one authoritative status model for each product line and align marketing, dashboard shell, and docs to that model.
- Priority: P0

- Finding: AuditOS route naming is internally split between a governed `/audit` workspace and a public `/auditos` guided demo, while docs still describe `/auditos` as a future rename candidate.
- Severity: High
- Evidence:
  - Path: `docs/README.md:34-38`
  - File/section/function: Route
  - Observed fact: docs say the current route is `/audit` and `/auditos` is a future rename candidate that is not happening now.
  - Path: `docs/aqliya-auditos-boundaries.md:73-95`
  - File/section/function: `src/app/audit/` — AuditOS Routes
  - Observed fact: the boundaries doc says all AuditOS routes are under `/audit` and repeats that `/auditos` is a later rename.
  - Path: `src/app/auditos/page.tsx:17-27,106`
  - File/section/function: Intro Header / StepNav
  - Observed fact: a public guided demo route exists under `/auditos` and is actively rendered.
  - Path: `src/app/(marketing)/products/page.tsx:154-160`, `src/app/(marketing)/products/audit/page.tsx:41-43`, `src/app/(marketing)/contact/page.tsx:57-65`
  - File/section/function: AuditOS note / CTA buttons
  - Observed fact: marketing CTAs send users to `/auditos` now.
- Why it matters: The product has two route identities with different purposes but no single source-of-truth explaining that split.
- Recommended action: Decide whether `/auditos` is demo-only, the real public product route, or a future rename, then update docs and links consistently.
- Priority: P0

- Finding: The internal shell collapses `AQLIYA Platform` and `DecisionOS` onto the same route and treats non-Audit modules as live peers.
- Severity: High
- Evidence:
  - Path: `src/components/platform/platform-sidebar.tsx:21-31,53-61,82-101`
  - File/section/function: `modules` / `getActiveModule()` / `getModuleNav()`
  - Observed fact: `AQLIYA Platform` and `DecisionOS` both route to `/decisions`, and `sales` reuses `platformNav` rather than dedicated sales navigation.
  - Path: `src/components/platform/module-switcher.tsx:8-18,40-48,51-57`
  - File/section/function: `modules` / `getActiveModule()`
  - Observed fact: `Platform` and `DecisionOS` again both route to `/decisions`.
  - Path: `src/components/platform/command-palette.tsx:95-131,188-203`
  - File/section/function: module switch entries / `hrefMap`
  - Observed fact: `module-platform` and `module-decision` both navigate to `/decisions`.
- Why it matters: The company/platform layer is not structurally distinct from one product, which undermines the repo's own product hierarchy.
- Recommended action: Separate company/platform navigation from DecisionOS navigation, and explicitly mark module maturity in the shell.
- Priority: P0

### Missing Strategic Docs

- Root `README.md`: **Not verified — evidence not found** in the repository root listing.
- One authoritative route-status document for `/audit` workspace vs `/auditos` demo: **Not verified — evidence not found**.
- A single maturity/status document covering AuditOS, DecisionOS, SalesOS, SimulationOS, and Local Content OS together: **Not verified — evidence not found**.

### Required Fixes

- Create a root onboarding README.
- Create one source-of-truth route/product-status document.
- Align homepage, dashboard shell, and marketing CTAs with the declared product strategy.

## 5. Brand & Identity Review

### Logo/Assets Status

- Runtime metadata uses `icons.icon = "/brand/Favicons/symbol (1).svg"` in `src/app/layout.tsx:15-17`.
- `public/brand/Favicons/symbol (1).svg` exists.
- `public/favicon.svg`: **Not verified — evidence not found**.
- Multiple UI components reference `/brand/aqliya-mark.svg`, but `public/brand/` contains no `aqliya-mark.svg` file and `glob("public/brand/**/*.svg")` returned only the two favicon SVGs.

### UI Consistency

- Company-facing marketing uses `aqliya-logo-approved.png` (`src/components/layout/site-header.tsx:25-33`, `src/components/layout/site-footer.tsx:40-47`).
- Platform and AuditOS internal shells use `/brand/aqliya-mark.svg` (`src/components/platform/platform-sidebar.tsx:121-129`, `src/components/platform/platform-header.tsx:46-49`, `src/components/audit/layout/audit-sidebar.tsx:73-80`).
- Audit workspace layout still uses platform shell components instead of AuditOS-specific layout (`src/app/audit/layout.tsx:1-21`).

### Naming Consistency

- `src/app/(marketing)/products/audit/page.tsx:6,31` uses `عقلية أوديت — AuditOS`.
- `docs/product/auditos-product-packaging.md:5` uses `AuditOS / Financial Intelligence`.
- `src/components/audit/layout/audit-sidebar.tsx:78` uses `AuditOS / Fin Intelligence`.
- `docs/README.md:25` uses `AuditOS / Financial Intelligence`.

### Arabic/English Consistency

- Global site layout is RTL (`src/app/layout.tsx:67`).
- Audit workspace layout is also RTL (`src/app/audit/layout.tsx:10`), while major audit screens force LTR inside the page body (`src/components/audit/mapping/mapping-page.tsx:95`, `src/components/audit/statements/statements-page.tsx:48`, `src/components/audit/evidence/evidence-page.tsx:76`).

### Detailed Findings

- Finding: Internal brand mark references point to a file that is not present in `public/brand/`.
- Severity: High
- Evidence:
  - Path: `src/components/platform/platform-sidebar.tsx:121-129`
  - File/section/function: Brand Header
  - Observed fact: component loads `/brand/aqliya-mark.svg`.
  - Path: `src/components/platform/platform-header.tsx:46-49`
  - File/section/function: mobile logo
  - Observed fact: component loads `/brand/aqliya-mark.svg`.
  - Path: `src/components/audit/layout/audit-sidebar.tsx:73-80`
  - File/section/function: brand header
  - Observed fact: component loads `/brand/aqliya-mark.svg`.
  - Path: `public/brand/`
  - File/section/function: directory listing
  - Observed fact: no `aqliya-mark.svg` file is present.
- Why it matters: Visible platform and audit shells reference a missing asset path, which is a direct brand/runtime defect.
- Recommended action: Add the missing mark asset at the referenced path or change all references to an existing approved asset.
- Priority: P0

- Finding: Brand token and identity source files are documented but not wired as the live source of truth.
- Severity: Medium
- Evidence:
  - Path: `public/brand/aqliya-tokens.css:1-205`
  - File/section/function: token file
  - Observed fact: a full token system exists in `public/brand/`.
  - Path: `src/app/globals.css:49-181`
  - File/section/function: AQLIYA brand colors and theme vars
  - Observed fact: runtime brand tokens are duplicated in `globals.css`.
  - Path: repository grep for `aqliya-tokens.css`
  - File/section/function: code search
  - Observed fact: no runtime code import of `aqliya-tokens.css` was found.
- Why it matters: The documented brand system and the runtime theme can drift independently.
- Recommended action: Choose one runtime token source and document it explicitly.
- Priority: P2

- Finding: AuditOS naming and directionality are not consistent across Arabic/English surfaces.
- Severity: Medium
- Evidence:
  - Path: `src/app/(marketing)/products/audit/page.tsx:6,31`
  - File/section/function: metadata / hero
  - Observed fact: page uses `عقلية أوديت — AuditOS`.
  - Path: `docs/product/auditos-product-packaging.md:5,21,33`
  - File/section/function: Product Identity / Positioning / Trust Principle
  - Observed fact: docs use `AuditOS / Financial Intelligence` as the approved packaging.
  - Path: `src/app/audit/layout.tsx:10`, `src/components/audit/mapping/mapping-page.tsx:95`
  - File/section/function: layout / page container
  - Observed fact: the audit shell is RTL while core audit screens render LTR content areas.
- Why it matters: Mixed naming and directionality weaken product identity and can produce a less coherent demo.
- Recommended action: Standardize one Arabic rendering for AuditOS and define one deliberate LTR/RTL strategy for the audit workspace.
- Priority: P2

## 6. Documentation Review

| Area | Status | Evidence | Issue | Action |
|---|---|---|---|---|
| Root onboarding | Missing | Root directory listing | No root `README.md` | Create root README with repo map, product status, and setup |
| Docs index | Mixed | `docs/README.md:39-97`; `docs/` directory listing | Index omits `auditos/`, `pilot/`, `execution/`, `KNOWN-LIMITATIONS.md`, `UAT-TEST-SCRIPT.md` | Update `docs/README.md` to reflect actual docs surface |
| Product foundation | Mixed | `docs/README.md:70-82`; `docs/01-product-foundation/04-core-workflow.md:9-19` | README workflow omits `Engagement` and compresses the full workflow | Reconcile README workflow with full product workflow |
| Accounting methodology | Present | `docs/02-accounting-methodology/` | Documentation exists and matches AuditOS domain | Keep and link from index |
| Audit methodology | Present | `docs/03-audit-methodology/` | Documentation exists and matches AuditOS domain | Keep and link from index |
| Financial statements docs | Mixed | `docs/04-financial-statements/`; `docs/product/auditos-technical-baseline.md:96-107` | Docs discuss cash flow generation while technical baseline says it is not implemented | Mark current implementation status explicitly |
| Notes system | Present | `docs/05-notes-system/` | Documentation exists and is product-relevant | Keep |
| Evidence and review | Present | `docs/06-evidence-and-review/` | Documentation exists and covers evidence/review/publication concepts | Keep |
| AI governance | Strong | `docs/07-ai-governance/`; `docs/README.md:105-107` | Trust principle is consistently documented | Keep as source of truth |
| Product/commercial docs | Extensive but scattered | `docs/product/` directory listing | Large corpus exists, but repo lacks one authoritative maturity/status overview | Add one master status document |
| Operational runbooks | Outdated | `docs/auditos/backup-and-monitoring.md:17-39,104-127`; `package.json:13-20` | Docs promise scripts/endpoints that do not exist or are placeholders | Rewrite runbooks or implement missing tooling |
| Archive | Misleading | `docs/archive/README.md:1-38` | Archive README reads like current project intro instead of clearly archived material | Add clear archive banner and context |

## 7. Module Review

| Module | Route | Docs | Code | Data Model | Status | Gap |
|---|---|---|---|---|---|---|
| AQLIYA company/marketing | `/`, `/products`, `/about`, `/contact`, `/how-we-work` | `docs/aqliya-official-website-file.md`, `docs/AQLIYA-company-product-architecture-official.md` | `src/app/(marketing)/*` | N/A | Active | official website doc copy diverges from live pages |
| Custom product inquiry | `/custom-product`, `/api/custom-product-submit` | `docs/aqliya-official-website-file.md` | `src/app/(marketing)/custom-product/page.tsx`, `src/app/api/custom-product-submit/route.ts` | N/A | Implemented | no CRM/system-of-record persistence |
| AuditOS workspace | `/audit`, `/audit/engagements/[engagementId]/*` | `docs/01-*` to `07-*`, `docs/product/*`, `docs/auditos/*` | `src/app/audit/*`, `src/components/audit/*`, `src/actions/audit-*.ts`, `src/lib/audit/*` | `Audit*` models and `Pilot*` models in `prisma/schema.prisma:596-968` | Implemented with critical gaps | unguarded reads, validation persistence gap, publish gap, admin event bug |
| AuditOS guided demo | `/auditos`, `/auditos/*` | `docs/pilot/*`, product demo docs | `src/app/auditos/*`, `src/lib/audit/demo-data.ts` | Mock only | Demo-only | six-step subset, mock-backed, marketed as live, route conflict with `/audit` |
| DecisionOS | `/decisions`, `/organizations`, `/intelligence/sectors` | `docs/decisionos-*.md`, `docs/archive/decision-os/*` | `src/app/(dashboard)/*`, `src/actions/decision*.ts`, `src/lib/decision/*` | non-prefixed decision models in `prisma/schema.prisma:91-592` | Implemented | tender-specific remnants and strategic identity conflict |
| SalesOS | `/sales` | marketing page plus `public/brand/ENTERPRISE-INTERACTION-IMPLEMENTATION-REPORT.md` | `src/app/sales/page.tsx`, shared enterprise components | Not verified — evidence not found for dedicated sales schema/actions/services | Partial/static | static dashboard only; no sales module boundary below the page layer |
| SimulationOS | `/products/simulation`; decision subpage `/decisions/[id]/simulation` | marketing page, DecisionOS reports | standalone product module not found; only decision simulation exists | Not verified — evidence not found for standalone SimulationOS schema | Marketing-only / partial | no standalone SimulationOS product route, service layer, or data model |
| Local Content OS | `/products/local-content` | marketing page, official website file | standalone app module not found | Not verified — evidence not found | Marketing-only | marketed without an implemented product module |

## 8. Code Architecture Review

### App Structure

- `src/app/` separates marketing, dashboard, audit workspace, guided demo, sales page, login, API routes, and published recommendation routes.
- AuditOS has a dedicated component, action, service, type, and schema tree.
- DecisionOS and platform features remain heavily interleaved.

### Components

- Shared UI lives under `src/components/ui/`.
- Marketing uses `enterprise/` and `visuals/`.
- AuditOS has dedicated feature directories under `src/components/audit/`.
- Platform shell duplicates exist in `src/components/platform/`, `src/components/layout/`, and `src/components/audit/layout/`.

### Actions and Services

- AuditOS writes are in `src/actions/audit-actions.ts` and `src/actions/audit-admin-actions.ts`.
- AuditOS reads are in `src/actions/audit-read-actions.ts`.
- Service layer is hybrid DB/mock in `src/lib/audit/services.ts:1-32`.
- DB implementation lives in `src/lib/audit/db/index.ts`.

### DB Layer and Prisma Schema

- The schema contains two domains in one database: non-prefixed DecisionOS models and `Audit*` models.
- Authentication maps through `User`/`Organization` (`src/lib/auth-config.ts:22-35`) while AuditOS actor resolution maps to `AuditUser` (`src/lib/audit/actor-context.ts:28-78`).

### Client/Server Boundaries

- Many AuditOS route files are thin wrappers that mount client components (`src/app/audit/engagements/[engagementId]/trial-balance/page.tsx:1-5`, `.../evidence/page.tsx:1-5`, `.../review/page.tsx:1-5`).
- Those client components call server actions directly.

### Detailed Findings

- Finding: AuditOS read actions do not enforce actor resolution or tenant authorization, while client pages call them directly from URL-derived `engagementId` values.
- Severity: Critical
- Evidence:
  - Path: `src/actions/audit-read-actions.ts:29-100`
  - File/section/function: all exported read actions
  - Observed fact: read actions return service data directly and do not call `getAuditActor()`, `requireRole()`, or `assertEngagementAccess()`.
  - Path: `src/app/audit/engagements/[engagementId]/trial-balance/page.tsx:1-5`, `src/app/audit/engagements/[engagementId]/evidence/page.tsx:1-5`, `src/app/audit/engagements/[engagementId]/review/page.tsx:1-5`
  - File/section/function: route wrappers
  - Observed fact: thin route wrappers mount client components without route-level access checks.
  - Path: `src/components/audit/evidence/evidence-page.tsx:35-64`, `src/components/audit/overview-tab.tsx:52-74`
  - File/section/function: `useParams()` + data loading effects
  - Observed fact: client components load data by passing URL-derived `engagementId` to read actions.
  - Path: `src/lib/audit/db/index.ts:441-457,521-579,965-1109`
  - File/section/function: `getEngagement()`, `getTrialBalance()`, `getMappings()`, `getEvidence()`, `getFindings()`, `getRecommendations()`, `getReviewComments()`, `getApprovalRecords()`
  - Observed fact: DB reads filter by `id` or `engagementId` only; organization ownership is not checked in these read functions.
  - Path: `src/lib/audit/tenant-guard.ts:19-65`
  - File/section/function: tenant guard
  - Observed fact: tenant guard exists, but read actions do not use it.
- Why it matters: This is a direct multi-tenant isolation defect in the core AuditOS workspace and is incompatible with the repository's own security/readiness claims.
- Recommended action: Apply actor and tenant checks to every read action before any service call, and ensure DB reads use organization-scoped predicates where possible.
- Priority: P0

- Finding: AuditOS admin user actions record `AuditEvent` rows with `engagementId: ""`, even though `AuditEvent.engagementId` is required and relational.
- Severity: High
- Evidence:
  - Path: `src/actions/audit-admin-actions.ts:57-67,80-91,107-118`
  - File/section/function: `createAuditUserAction()`, `updateAuditUserRoleAction()`, `deactivateAuditUserAction()`
  - Observed fact: each action calls `svcRecordAuditEvent()` with `engagementId: ""`.
  - Path: `prisma/schema.prisma:877-896`
  - File/section/function: `model AuditEvent`
  - Observed fact: `engagementId` is required and `AuditEvent` belongs to `AuditEngagement`.
  - Path: `src/lib/audit/db/index.ts:1659-1675`
  - File/section/function: `recordAuditEvent()`
  - Observed fact: DB insert writes `engagementId: params.engagementId` directly and does not special-case org-level events.
  - Path: `src/components/audit/admin/admin-users-page.tsx:44-76`
  - File/section/function: create/update/deactivate handlers
  - Observed fact: the admin UI is wired to those actions.
- Why it matters: Successful admin user changes are at risk of failing at audit-event write time, leaving the admin module unreliable.
- Recommended action: Create a separate organization-level audit event model or allow nullable/non-engagement audit events explicitly.
- Priority: P0

- Finding: The AuditOS service layer intentionally hides whether data is DB-backed or mock-backed, and development actor fallback uses hardcoded demo identity.
- Severity: High
- Evidence:
  - Path: `src/lib/audit/services.ts:1-32`
  - File/section/function: header / `tryDb()`
  - Observed fact: service layer is a hybrid DB/mock abstraction and states that UI components never know if data is mock or real.
  - Path: `src/lib/audit/actor-context.ts:64-78`
  - File/section/function: demo fallback
  - Observed fact: development mode falls back to `usr-ahmed` / `org-aqliya` when auth or provisioning fails.
  - Path: `src/lib/audit/demo-data.ts:1-3`
  - File/section/function: file header
  - Observed fact: guided demo data never touches DB, auth, or write actions.
- Why it matters: This ambiguity makes it easy to overstate maturity and complicates validation, traceability, and demo claims.
- Recommended action: Expose explicit environment/data-source state in the UI and docs, and keep demo-only routes clearly separate from governed workspace routes.
- Priority: P1

### Risks

- Hybrid state complicates defect diagnosis.
- Two user systems (`User` and `AuditUser`) increase provisioning and access complexity.
- Duplicate layout systems increase drift risk.

## 9. Data Flow & Traceability Review

### Engagement Flow

- Implemented.
- Evidence: `src/actions/audit-actions.ts:45-52`, `prisma/schema.prisma:648-674`.

### Trial Balance Flow

- Implemented.
- Evidence: `src/actions/audit-actions.ts:54-63`, `prisma/schema.prisma:676-702`, `src/lib/audit/db/index.ts:1640-1657`.

### Mapping Flow

- Implemented, including downstream statement rebuild on manual updates.
- Evidence: `src/actions/audit-actions.ts:65-92`, `src/lib/audit/db/index.ts:813-843`.

### Statement Rebuild Flow

- Implemented for mapping changes.
- Evidence: `src/lib/audit/db/index.ts:837` calls `rebuildFinancialStatementsForEngagement(data.engagementId)`.

### Notes Flow

- Implemented as governed draft generation.
- Evidence: `src/actions/audit-actions.ts:386-415`, `src/lib/audit/services.ts:254-260`, `prisma/schema.prisma:751-764`.

### Evidence Flow

- Implemented for creation, state updates, and linking.
- Evidence: `src/actions/audit-actions.ts:101-146,212-219`, `prisma/schema.prisma:766-793`.

### Findings Flow

- Implemented.
- Evidence: `src/actions/audit-actions.ts:148-181,316-383`, `prisma/schema.prisma:795-833`.

### Review / Approval Flow

- Implemented at the schema and UI level.
- Evidence: `src/actions/audit-actions.ts:184-210`, `prisma/schema.prisma:835-875`, `src/lib/audit/db/index.ts:1111-1159`.

### Gaps

- Validation data is not persisted in Prisma.
- Publication screen exports data but does not execute a publish transition.
- Traceability responses are broad and partially label-poor.

### Detailed Findings

- Finding: Seed, mock, and UI data disagree on key balances and mapping states, including a missing-link message that conflicts with both seed and mock data.
- Severity: High
- Evidence:
  - Path: `prisma/seed-audit.ts:121,212,267`
  - File/section/function: trial balance / `map-8` / statement lines
  - Observed fact: account `2020` has trial-balance credit `SAR(95000)`, while `map-8` stores `creditAmount: SAR(-20000)` and the balance sheet line for `map-8` shows `SAR(95000)`.
  - Path: `prisma/seed-audit.ts:126,216,272,278`
  - File/section/function: retained earnings / `map-12` / statement lines
  - Observed fact: account `3020` has trial-balance credit `SAR(705000)`, while `map-12` stores `creditAmount: SAR(1200000)` and downstream lines still show `SAR(705000)`.
  - Path: `prisma/seed-audit.ts:224-225`
  - File/section/function: `map-20` / `map-21`
  - Observed fact: both mappings point to `tb-line-21`, even though `5070` is `tb-line-22` in mock data.
  - Path: `src/lib/audit/mock-data.ts:196-199`
  - File/section/function: `mockMappings`
  - Observed fact: mock data maps `map-21` to `tb-line-22` and confirms `map-22` for account `5100`.
  - Path: `src/app/audit/engagements/[engagementId]/page.tsx:92-101`
  - File/section/function: Traceability Summary / Missing Links
  - Observed fact: the page says `Sundry Income (5100) has no confirmed mapping` even though both seed and mock data define confirmed `map-22` for `5100`.
- Why it matters: The repository's core trust claim depends on evidence-grade traceability, and the demo dataset currently contradicts itself across sources.
- Recommended action: Rebuild the Gulf Trading seed/mock/UI dataset from one canonical source and add regression checks for line-to-mapping consistency.
- Priority: P0

- Finding: Validation results and human dispositions are not persisted in the database.
- Severity: High
- Evidence:
  - Path: `src/types/audit/index.ts:181-207`
  - File/section/function: `ValidationRun` and `ValidationIssue`
  - Observed fact: validation is modeled in TypeScript types.
  - Path: `prisma/schema.prisma:596-968`
  - File/section/function: AuditOS schema block
  - Observed fact: no validation models exist in the Prisma schema.
  - Path: `src/lib/audit/db/index.ts:864-883`
  - File/section/function: `getValidationRun()` / `runValidation()`
  - Observed fact: validation reads/writes return mock data only.
  - Path: `src/components/audit/validation/validation-page.tsx:50-62`
  - File/section/function: `handleDispose()`
  - Observed fact: accepting or dismissing a validation issue only mutates local React state via `setTimeout()`; no server action is called.
- Why it matters: Validation is a required control stage in the workflow, but its disposition trail is not durable or attributable.
- Recommended action: Add Prisma models and server actions for validation runs/issues and persist every reviewer disposition.
- Priority: P0

- Finding: Publication is not a complete workflow state transition; the UI exposes a publish button without a publish action.
- Severity: High
- Evidence:
  - Path: `src/components/audit/publication/publication-page.tsx:140-160`
  - File/section/function: action buttons
  - Observed fact: exports are wired, but `Publish` renders only as a button when `isReady` and has no click handler.
  - Path: `src/actions/audit-actions.ts:1-621`
  - File/section/function: full file inspection
  - Observed fact: no AuditOS publish action was found.
  - Path: `docs/01-product-foundation/04-core-workflow.md:136-145`
  - File/section/function: Publication Package
  - Observed fact: docs define publication as a distinct final workflow stage.
- Why it matters: The implemented workspace stops short of a fully governed publish transition, which leaves the core workflow incomplete.
- Recommended action: Implement an explicit publish mutation that updates `AuditPublicationPackage`, engagement status, and audit trail, or mark publication as export-only.
- Priority: P0

- Finding: Traceability responses do not consistently preserve target specificity or linked labels.
- Severity: Medium
- Evidence:
  - Path: `src/lib/audit/db/index.ts:201-217`
  - File/section/function: `toEvidenceLink()`
  - Observed fact: DB-backed evidence links are converted with `targetLabel: ''`.
  - Path: `src/components/audit/evidence/evidence-page.tsx:198-201,354-360`
  - File/section/function: table / linked entities detail
  - Observed fact: the UI renders `le.targetLabel` for linked evidence.
  - Path: `src/lib/audit/db/index.ts:1345-1439`
  - File/section/function: `getTraceability()`
  - Observed fact: function returns engagement-wide publication, approvals, and recent events without meaningful branching on `targetType`.
- Why it matters: The traceability UI can degrade from record-specific lineage to broad engagement history, which weakens the "evidence governs" promise.
- Recommended action: Persist and return `targetLabel`, and scope traceability trees by target type and explicit relationships rather than broad engagement fetches.
- Priority: P1

## 10. Contradictions Register

| ID | Severity | Conflict | Evidence A | Evidence B | Recommended Resolution |
|---|---|---|---|---|---|
| CR-01 | High | `/audit` is documented as current while `/auditos` is already public and linked | `docs/README.md:36-37`; `docs/aqliya-auditos-boundaries.md:94-95` | `src/app/auditos/page.tsx:17-27`; `src/app/(marketing)/products/audit/page.tsx:41-43`; `src/app/(marketing)/contact/page.tsx:63-64` | Decide whether `/auditos` is demo-only, public product, or rename target, then update all references |
| CR-02 | High | AuditOS is documented as the only active product under development, but SalesOS and DecisionOS ship as live modules | `docs/execution/architecture-guards.md:27-37` | `src/app/sales/page.tsx:15-18`; `src/app/(dashboard)/decisions/page.tsx:62-65`; `src/components/platform/platform-sidebar.tsx:21-62` | Rewrite architecture guards or demote non-Audit modules from active navigation |
| CR-03 | High | Backup docs promise real backup/restore npm commands, but package scripts do not implement them | `docs/auditos/backup-and-monitoring.md:17-39,110-127`; `docs/auditos/backup-schedule-evidence.md:5-16` | `package.json:13-20`; `npm run db:backup` output only echoes; `npm run db:restore` is missing | Implement real scripts or rewrite docs to current reality |
| CR-04 | Medium | Operational docs refer to `/api/health`, but no such route exists | `docs/auditos/backup-and-monitoring.md:104-105` | `glob("src/app/api/health/**")` returned no files | Add the endpoint or remove the claim |
| CR-05 | Medium | `docs/AUDIT_REPORT.md` audits files that no longer exist in `docs/` root | `docs/AUDIT_REPORT.md:32-42` cites `DEMO.md`, `DEMO_SCRIPT.md`, `DEMO_PITCH.md`, `SALES_NARRATIVE.md`, `CLIENT_WALKTHROUGH.md`, `TECHNICAL_OVERVIEW.md`, `MVP_SCOPE.md` in docs root | `docs/` directory listing contains none of those root files | Archive or rewrite the audit report so it matches the current repo |
| CR-06 | Medium | Technical baseline says AuditOS had no Prisma schema and no equity statement, but current repo does | `docs/product/auditos-technical-baseline.md:96-107` | `prisma/schema.prisma:596-968`; `prisma/seed-audit.ts:295-300` | Mark the baseline as dated historical reference or update it |
| CR-07 | Medium | DecisionOS architecture report says decisions page title changed to "Decision Intelligence", but current code still renders `DecisionOS` | `docs/decisionos-architecture-report.md:208-210` | `src/app/(dashboard)/decisions/page.tsx:62-65` | Update the report or align the UI naming |
| CR-08 | Medium | Official website file no longer matches homepage copy and CTA text | `docs/aqliya-official-website-file.md:58-72` | `src/app/(marketing)/page.tsx:72-93` | Either update the official website file or clearly mark it as a historical content draft |
| CR-09 | High | Brand report calls the platform a complete enterprise operating environment while SalesOS remains mock/static | `public/brand/ENTERPRISE-INTERACTION-IMPLEMENTATION-REPORT.md:11-20,281` | `public/brand/ENTERPRISE-INTERACTION-IMPLEMENTATION-REPORT.md:70`; `src/app/sales/page.tsx:23-235`; no sales service/schema files found | Lower the claim or complete the module implementation |

## 11. Missing Files / Missing Docs / Missing Features

### Missing Documentation

- Root `README.md`: Not verified — evidence not found.
- One source-of-truth doc for route purpose and status across `/audit`, `/auditos`, `/decisions`, `/sales`, and marketing-only products: Not verified — evidence not found.
- A current module maturity/status document spanning all product lines: Not verified — evidence not found.

### Missing Implementation

- `public/brand/aqliya-mark.svg`: Not verified — evidence not found, despite multiple runtime references.
- `public/favicon.svg`: Not verified — evidence not found.
- `src/app/api/health/*`: Not verified — evidence not found.
- AuditOS publish mutation/action: Not verified — evidence not found.
- Validation persistence models/actions: Not verified — evidence not found in Prisma schema or server actions.
- Dedicated SalesOS data/service layer: Not verified — evidence not found in `src/lib/`, `src/actions/`, or `prisma/schema.prisma`.
- Standalone SimulationOS product module: Not verified — evidence not found beyond marketing pages and DecisionOS simulation.

### Missing Validation

- Clean ESLint baseline: not present.
- Clean repository-level `tsc --noEmit` baseline: not present.
- Jest execution compatible with `server-only` Prisma import: not present.
- Jest type coverage in TypeScript config: not present.
- Executable restore script: not present.

## 12. Cleanup & Restructure Recommendations

| Path | Current Issue | Recommended Action | Priority |
|---|---|---|---|
| `README.md` | Missing root onboarding file | Add root README covering repo purpose, active modules, setup, and validation | High |
| `docs/README.md` | Incomplete docs index and route-status drift | Update to reflect actual directories and current route model | High |
| `docs/AUDIT_REPORT.md` | Outdated audit report referencing missing files | Archive or rewrite against current repo state | Medium |
| `docs/product/auditos-technical-baseline.md` | Historical baseline presented without strong archival framing | Mark as dated baseline or move to archive | Medium |
| `docs/decisionos-architecture-report.md` | Current-state claims drift from code | Update or archive as dated status snapshot | Medium |
| `public/brand/ENTERPRISE-INTERACTION-IMPLEMENTATION-REPORT.md` | Internal implementation report stored under runtime asset path | Move to `docs/` or archive; keep `public/brand/` for assets only | Medium |
| `public/brand/tailwind.config.js` | Config artifact inside public assets | Move out of `public/` or remove if unused | Low |
| `public/brand/ChatGPT Image May 11, 2026, 07_43_28 PM.png` | Unstructured generated asset in approved brand directory | Move to a working/archive folder or remove if not used | Low |
| `prisma/dev.db` | SQLite-style artifact alongside PostgreSQL schema | Remove or document its purpose explicitly | Low |
| `fix-viewer-org.js`, `set-passwords.js`, `update-pw.js` | Ad hoc scripts at repo root | Move into `scripts/` with descriptive names or archive | Low |
| `src/components/layout/header.tsx` and `src/components/layout/sidebar.tsx` | Legacy layout duplicates remain while platform shell is elsewhere | Remove after usage verification or mark as deprecated clearly | Low |
| `src/components/audit/layout/audit-sidebar.tsx` | Audit-specific sidebar exists but main audit layout still uses platform sidebar | Either adopt it or remove it after verification | Medium |

## 13. Validation Results

| Command | Result | Notes |
|---|---|---|
| `npm run lint` | Fail | 225 problems reported: 72 errors, 153 warnings. Examples include `src/components/audit/pilot/pilot-page.tsx:70`, `src/components/audit/review/review-page.tsx:47-56`, `src/lib/audit/db/index.ts:143,1345+`, `src/components/audit/trial-balance/trial-balance-page.tsx:64-121`, and `update-pw.js:1-2`. |
| `npx tsc --noEmit` (before build) | Fail | Failed on missing files under `.next/types/**` because `tsconfig.json:25-31` includes generated type paths and the generated tree was stale. |
| `npx prisma generate` | Pass | Prisma client generated successfully from `prisma/schema.prisma`. |
| `npm test` | Fail | All 3 test suites failed before running tests because Jest imports `src/lib/prisma.ts`, which starts with `import "server-only"`. |
| `npm run build` | Pass with warnings | Production build completed. Warnings included workspace root lockfile inference and dynamic server usage warnings when prerendering `/decisions`. |
| `npx tsc --noEmit` (after build) | Fail | Stale `.next` errors cleared, but TypeScript still fails on missing Jest globals in `src/__tests__/*.test.ts` and a variant type mismatch in `src/components/workspace/contextual-actions.tsx:65,92`. |
| `npm run audit:health` | Pass | Database connected; 2 engagements, 28 audit events, 5 AI outputs, 9 audit users, 0 open blockers. |
| `npm run backup:verify` | Pass | Data-integrity check passed, but script itself states it is not an actual backup test. |
| `npm run db:backup` | Placeholder only | Script prints `'Backup: pg_dump ...'`; it does not execute a real backup. |
| `npm run db:restore` | Fail | Missing script in `package.json`. |
| `npm run seed:audit` | Not run | Skipped because `prisma/seed-audit.ts:16-38` deletes existing AuditOS data before reseeding. |
| `npx prisma db seed` | Not run | Skipped because configured Prisma seed is `prisma/seed.ts`, which targets DecisionOS/demo organization data rather than AuditOS. |

## 14. Risk Assessment

### Critical

- AuditOS read-side server actions expose engagement-scoped data without actor or tenant enforcement.
- Demo/seed/mock/UI data contradictions weaken the integrity of the repo's flagship evidence-and-traceability story.

### High

- Product identity and route model are inconsistent across docs, marketing, and application shell.
- Admin user-management actions are structurally at risk because audit events require a valid engagement relation.
- Validation and publication are not fully durable workflow stages.
- Backup/restore operational claims exceed actual scripts and endpoints.
- Missing internal brand mark asset affects visible platform shells.

### Medium

- Documentation source-of-truth is fragmented and includes outdated status reports.
- SalesOS is positioned as a product module without a dedicated service/data boundary.
- TypeScript and Jest configuration drift prevents a clean validation baseline.
- Audit workspace directionality and naming are inconsistent.

### Low

- Unused/legacy shell components remain in the repo.
- Public brand folder contains config/docs and generated artifacts that are not runtime assets.
- `prisma/dev.db` and root ad hoc scripts add avoidable clutter.

## 15. Prioritized Action Plan

### P0: Must Fix Before Demo/Pilot

1. Add auth and tenant enforcement to all AuditOS read actions and service entry points.
2. Decide the authoritative AuditOS route model: governed workspace, guided demo, or rename path, then align docs and links.
3. Reconcile seed/mock/UI data for the Gulf Trading dataset and remove contradictory missing-link messaging.
4. Persist validation dispositions and implement a real publish transition, or remove/downgrade those claims in UI/docs.
5. Fix AuditOS admin event recording so user-management actions do not depend on invalid engagement IDs.
6. Add the missing brand mark asset or replace all broken references.

### P1: Should Fix Before Commercial Use

1. Replace `db:backup` placeholder and add a real `db:restore`, or rewrite operational docs to match current tooling.
2. Add or remove the promised `/api/health` endpoint.
3. Establish a clean validation baseline for lint, TypeScript, and Jest.
4. Create a single source-of-truth status doc for all product lines and module maturity.
5. Rewrite or archive outdated reports in `docs/` and `public/brand/`.

### P2: Improve Before Scaling

1. Decide whether SalesOS, SimulationOS, and Local Content OS remain marketing-only or receive real module boundaries and data models.
2. Separate company/platform navigation from DecisionOS navigation.
3. Consolidate the live brand token source and normalize AuditOS Arabic/English naming.

### P3: Cleanup/Refinement

1. Move root scripts into `scripts/` and rename them descriptively.
2. Remove or archive unused legacy shell components after verification.
3. Clean `public/brand/` so it contains only runtime assets.
4. Remove or document `prisma/dev.db`.

## 16. Final Readiness Verdict

**Internally reviewable**

The repo is beyond a raw prototype: `npm run build` passes, `npx prisma generate` passes, and the repo ships a substantial AuditOS workspace plus a guided demo route. However, the current state does not support a stronger verdict because the audit found a critical read-side tenant/security gap, non-durable validation/publication stages, major route/product-identity drift, operational docs that overclaim actual backup/restore tooling, and failing lint/test/type-check baselines. Those are not cosmetic issues; they directly affect product trust, workflow defensibility, and pilot/commercial readiness.
