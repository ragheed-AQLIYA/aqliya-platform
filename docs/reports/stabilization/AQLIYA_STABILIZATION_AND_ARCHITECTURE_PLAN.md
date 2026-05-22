# AQLIYA Stabilization & Architecture Consolidation Plan

## 1. Executive Summary

- Current status: **Internally reviewable** (unchanged from prior audit)
- Main conclusion: The repo has a working build, a real AuditOS implementation, and a separate guided demo, but advancing to demo-ready requires resolving route identity, tenant enforcement, workflow persistence, and operational truthfulness gaps documented below. This report provides the exact action plan required.
- Target from this plan: **Demo-ready with governance** after P0 items are completed

### Top 10 Issues

1. AuditOS read-side server actions do not enforce actor or tenant checks
2. `/audit` workspace vs `/auditos` demo split is undocumented and internally confused
3. Platform shell collapses AQLIYA Platform and DecisionOS onto the same route
4. Validation results and human dispositions are not persisted in the database
5. Publication UI exposes a publish button with no publish action
6. Admin user-management actions emit audit events with empty `engagementId`
7. Seed, mock, and UI data disagree on key mappings and balances
8. `public/brand/aqliya-mark.svg` is referenced by multiple runtime components but does not exist
9. Operational backup/restore documentation does not match executable scripts
10. Brand docs, implementation reports, and config files live inside `public/brand/`

### Top 10 Actions

1. Apply `getAuditActor()` and `assertEngagementAccess()` to every AuditOS read action
2. Codify `/audit` = workspace and `/auditos` = guided demo in one source-of-truth doc, then align UI, docs, and links
3. Separate company/platform navigation from DecisionOS navigation in the shell
4. Add Prisma models, server actions, and audit events for validation persistence
5. Implement a real publish mutation that updates `AuditPublicationPackage` and engagement status
6. Create a separate org-level audit event model or allow non-engagement events
7. Rebuild the Gulf Trading seed/mock/UI dataset from one canonical source
8. Add `aqliya-mark.svg` at the referenced path or replace all broken references
9. Rewrite backup/restore docs to current tooling or implement real scripts
10. Move docs and config artifacts out of `public/brand/` and add root `README.md`

## 2. Current Architecture Snapshot

### Company Layer

- AQLIYA is presented as the company/organization identity in metadata (`src/app/layout.tsx:11-37, 44-63`) and company docs (`docs/aqliya-official-website-file.md:11-17`).
- Marketing site lives at `src/app/(marketing)/` with company pages: homepage, about, contact, how-we-work, products, custom-product.
- Marketing shell uses `site-header.tsx` and `site-footer.tsx`.

### System Layer

- AuditOS: Active product with dedicated workspace, DB models, components, actions, services.
- DecisionOS: Active application with routes under `/(dashboard)/`, DB models, components, actions, services.
- SalesOS: Active static dashboard page under `/sales` with no dedicated services, DB models, or deeper routes.
- SimulationOS: Marketing-only via `/products/simulation`; no top-level app route exists.
- Local Content OS: Marketing-only via `/products/local-content`; no top-level app route exists.

### Workspace Layer

- Dashboard/DecisionOS workspace: `src/app/(dashboard)/layout.tsx` uses `PlatformSidebar` + `PlatformHeader`.
- AuditOS workspace: `src/app/audit/layout.tsx` uses `PlatformSidebar` + `PlatformHeader` (same shell, no AuditOS-specific shell despite `audit-sidebar.tsx` existing).
- SalesOS workspace: `src/app/sales/layout.tsx` uses `PlatformSidebar` + `PlatformHeader`.

### Demo Layer

- AuditOS guided demo: `src/app/auditos/layout.tsx` uses `DemoSidebar`, six-step navigation, mock-backed data, marketed in UI as "Live Demo."
- `src/lib/audit/demo-data.ts:1-3` states demo data never touches DB, auth, or write actions.

### Governance Layer

- Tenant guard exists at `src/lib/audit/tenant-guard.ts:19-65`.
- Actor context exists at `src/lib/audit/actor-context.ts:28-78`.
- Rate limiting exists at `src/lib/audit/rate-limit.ts`.
- File scanning abstraction at `src/lib/audit/file-scanner.ts` (fail-closed in production).
- Audit trail model exists at `AuditEvent` with 28 events in the current DB.
- Governance docs exist under `docs/archive/legacy-numbered/07-ai-governance/` (archived pre-v1.1) and `docs/theoretical-reference/`.

### Marketing Layer

- Product catalog at `/products` lists six solution lines as peers.
- Each product page (decision, simulation, sales, audit, local-content) has a secondary CTA pointing to `/auditos`.
- Custom product inquiry at `/custom-product` redirects success page to `/auditos`.

## 3. Official Proposed Architecture

```
AQLIYA Company
├── Systems (products)
│   ├── AuditOS                 (active, workspace + demo)
│   ├── DecisionOS              (active, workspace)
│   ├── SalesOS                 (prototype, static dashboard)
│   ├── SimulationOS            (marketing-only)
│   └── Local Content OS        (marketing-only)
├── Workspaces (execution environments)
│   ├── AuditOS Workspace       (/audit)  — governed operational environment
│   ├── DecisionOS Workspace    (/decisions, /organizations, /intelligence/sectors)
│   └── SalesOS Workspace       (/sales)  — prototype/dashboard only
├── Governance (cross-cutting)
│   ├── Validation
│   ├── Traceability
│   ├── Publication
│   ├── Audit Trail
│   └── Admin
├── Demos
│   └── AuditOS Guided Demo     (/auditos)  — public, mock-backed, unauthenticated
└── Marketing Pages
    ├── Homepage                (/)
    ├── Products Catalog        (/products)
    ├── Product Detail Pages    (/products/*)
    ├── About / How We Work / Contact
    └── Custom Product Inquiry  (/custom-product)
```

## 4. Product/System Taxonomy

| Term | Definition | Examples | Rule |
|---|---|---|---|
| **Company** | The legal and brand entity that owns all systems | AQLIYA | Must not be confused with any one product |
| **System** | A named product or product line with its own route, data model, and purpose | AuditOS, DecisionOS, SalesOS | Marketing pages alone do not make a system |
| **Workspace** | A governed operational execution environment with auth, access control, and durable data | AuditOS Workspace (/audit), DecisionOS (/decisions) | Must have server actions, tenant guard, schema, and audit trail |
| **Product (marketing)** | A marketing page describing a capability | SimulationOS, Local Content OS | OK to exist without a workspace; must not be presented as operational |
| **Demo** | A guided, read-only, mock-backed walkthrough | /auditos | Must be explicitly labeled as a demo in UI and docs |
| **Governance layer** | Cross-cutting controls shared by all workspaces | audit trail, validation, publication | Must be durable, not mock-only |
| **Marketing page** | Public-facing content explaining a product or capability | /products/simulation, /products/local-content | Must link to real CTAs matched to current state |

Key answer: AuditOS is both a system (product) and has a governed workspace. The workspace is the `/audit` execution environment. The `/auditos` route is a guided demo, not the workspace.

## 5. Product Status Matrix

| System | Type | Route | Current Status | Intended Status | Required Action |
|---|---|---|---|---|---|
| AQLIYA Company | Company | `/` | Active | Active | Fix brand assets, add root README |
| AuditOS | System + Workspace | `/audit` (workspace), `/auditos` (demo) | Implemented with gaps | Active primary product | Close P0 tenant, validation, publication gaps |
| DecisionOS | System + Workspace | `/decisions`, `/organizations`, `/intelligence/sectors` | Implemented | Active adjacent system | Separate from platform shell navigation |
| SalesOS | Prototype | `/sales` | Static dashboard only | Prototype | Either build real module boundary or demote to marketing-only |
| SimulationOS | Marketing-only | `/products/simulation` | No system implementation | Future | Keep as marketing page; do not create premature routes |
| Local Content OS | Marketing-only | `/products/local-content` | No system implementation | Future | Keep as marketing page; do not create premature routes |
| Custom Product Inquiry | Company funnel | `/custom-product`, `/api/custom-product-submit` | Implemented | Active | Fix success CTA to not funnel all users to `/auditos` |

## 6. Route Strategy

| Route | Current Purpose | Layer | Conflict | Required Action |
|---|---|---|---|---|
| `/` | Company homepage | Company/Marketing | None | None |
| `/about`, `/contact`, `/how-we-work` | Company pages | Company | None | None |
| `/custom-product` | Custom product inquiry | Company | Success CTA funnels to `/auditos` for all inquiries | Expand success page to show relevant next steps per inquiry category |
| `/products` | Product catalog | Marketing | CTA labels say "اطلب تخصيص هذا النظام" but link to product detail pages, not `/custom-product` | Fix CTA label or destination |
| `/products/audit` | AuditOS product page | Marketing | Links to `/auditos` (demo) | Keep; add secondary link to `/audit` for authenticated users |
| `/products/decision`, `/products/simulation`, `/products/sales`, `/products/local-content` | Non-audit product pages | Marketing | Secondary CTA is "استعرض AuditOS" linking to `/auditos` | Replace with relevant CTAs per product line |
| `/auditos` | AuditOS guided demo | Demo | Labeled "Live Demo" but is mock-backed | Keep as demo; clarify labeling; do not call it "Live" |
| `/audit` | AuditOS governed workspace | Workspace | Docs still describe `/auditos` as future rename | Keep as workspace; update docs to define the split |
| `/decisions` | DecisionOS workspace | Workspace | Active but not separated from platform shell | Keep; separate navigation from platform pseudo-module |
| `/sales` | SalesOS prototype dashboard | Workspace/Prototype | Navigation implies routes that do not exist (`/sales/deals/*`) | Remove dead links; either build or demote |
| `/simulation` (top-level) | Not implemented | N/A | No route exists | Do not create until SimulationOS has a real system boundary |
| `/local-content` (top-level) | Not implemented | N/A | No route exists | Do not create until Local Content OS has a real system boundary |
| `/published/recommendation/[decisionId]` | Legacy published decision view | Legacy | Archive DecisionOS route | Mark as legacy or move under `/decisions` |
| `/login`, `/access-denied` | Auth | Internal | None | None |
| `/api/auth/[...nextauth]`, `/api/custom-product-submit` | API | Internal | None | None |

## 7. Navigation Refactor Plan

### Current Problems

- `AQLIYA Platform` and `DecisionOS` both route to `/decisions` in sidebar and module switcher (`src/components/platform/platform-sidebar.tsx:21-31,53-61`, `src/components/platform/module-switcher.tsx:8-18,40-48,51-57`).
- `getModuleNav("sales")` returns `platformNav` instead of sales-specific navigation (`src/components/platform/platform-sidebar.tsx:90-100`).
- Sales navigation items definition promises `/sales/deals`, `/sales/pipeline`, `/sales/accounts` routes that do not exist (`src/lib/platform/navigation.ts:151-184`).
- Command palette links to nonexistent routes: `/sales/deals/global-finance`, `/sales/deals/dataflow`, `/decisions/q3-investment`, etc. (`src/components/platform/command-palette.tsx:84-101`).
- Audit cross-module recent entities panel links to `/sales/deals/3` and `/audit/engagements/1` which may not exist (`src/app/audit/page.tsx:208-214`).
- Audit workspace shell uses `PlatformSidebar` instead of the dedicated `AuditSidebar` (`src/app/audit/layout.tsx:1-21` vs `src/components/audit/layout/audit-sidebar.tsx`).

### Proposed Navigation

AQLIYA Shell (workspace):
- Modules: AuditOS Workspace, DecisionOS, SalesOS
- Cross-cutting: Settings
- Remove "Platform" pseudo-module; make `/decisions` the default landing for DecisionOS only

Marketing Shell (no change needed to structure):
- Add AuditOS workspace sign-in link for authenticated users

### Files Likely Affected

- `src/components/platform/platform-sidebar.tsx` (module list, nav routing)
- `src/components/platform/module-switcher.tsx` (module list)
- `src/components/platform/command-palette.tsx` (dead links, module mapping)
- `src/lib/platform/navigation.ts` (sales nav definition)
- `src/lib/platform/workspace.ts` (module config)
- `src/app/audit/layout.tsx` (potentially adopt AuditSidebar)
- `src/app/audit/page.tsx` (cross-module recent entities with dead sales links)
- `src/app/sales/page.tsx` (dead recent-entity links to `/sales/deals/2`, `/sales/deals/5`)

## 8. Documentation Consolidation Plan

### Missing Docs (Must Create)

| Document | Purpose | Priority |
|---|---|---|
| Root `README.md` | Repo purpose, active modules, setup, and validation commands | P0 |
| `docs/AQLIYA_ARCHITECTURE.md` | Official architecture as proposed in this plan (Section 3) | P1 |
| `docs/AQLIYA_SYSTEM_TAXONOMY.md` | Product/system taxonomy from this plan (Section 4) | P1 |
| `docs/ROUTE_STRATEGY.md` | Route strategy table from this plan (Section 6) | P1 |
| `docs/PRODUCT_STATUS_MATRIX.md` | Product status matrix from this plan (Section 5) | P1 |
| `docs/READINESS_GATES.md` | Readiness gate definitions from this plan (Section 17) | P1 |

### Outdated Docs (Must Update)

| Document | Problem | Action | Priority |
|---|---|---|---|
| `docs/README.md` | Route docs stale (`/auditos` as future rename) | Update to reflect actual `/audit` workspace and `/auditos` demo model | P0 |
| `docs/aqliya-auditos-boundaries.md` | Same stale route docs | Update | P0 |
| `docs/execution/architecture-guards.md` | Says AuditOS is only active product, but SalesOS and DecisionOS exist as live routes | Update or archive | P1 |
| `docs/auditos/backup-and-monitoring.md` | Documents `db:restore` and `tsx scripts/db-backup.ts` which do not exist | Rewrite to current tooling | P1 |
| `docs/product/auditos-technical-baseline.md` | Historical baseline presented without archival framing | Mark as dated baseline or move to archive | P2 |
| `docs/decisionos-architecture-report.md` | Claims decisions page title changed to "Decision Intelligence" but code still renders `DecisionOS` | Update or archive | P2 |
| `docs/aqliya-official-website-file.md` | Copy outdated vs live pages | Update or mark as historical draft | P2 |

### Docs to Archive

| Document | Reason | Priority |
|---|---|---|
| `docs/archive/README.md` | Reads like current project intro, not archival | P2 |
| `docs/AUDIT_REPORT.md` | Audits files that no longer exist in docs root | P2 |
| `docs/auditos/pilot-weekly-review-week1.md` | Internally contradictory (line 7 says 0 open blockers, lines 140-148 list 5) | P2 |
| `public/brand/IMPLEMENTATION-REPORT.md` | `Status: Complete` contradicted by `IMPLEMENTATION-CHECKLIST.md` unchecked items | P1 |
| `public/brand/ENTERPRISE-INTERACTION-IMPLEMENTATION-REPORT.md` | `Status: Complete — Build Passed, TypeScript Passed` contradicted by current validation | P1 |

### Docs Overclaiming Implementation (Critical to Fix in Docs or Code)

| Document | Claim | Actual | Action | Priority |
|---|---|---|---|---|
| `docs/auditos/production-review-pack.md:51-57` | "Tenant isolation — assertEngagementAccess() on 29 actions" | True for writes, but reads are unguarded | Clarify scope or fix reads | P0 |
| `docs/auditos/production-review-pack.md:104-106` | "Backup verification — ✅", "Restore verification — ✅" | Restore log says "Not yet performed" | Fix docs honesty | P1 |
| `docs/auditos/final-production-decision-package.md:5` | "All development, hardening, pilot preparation... completed" | Evidence register shows 0% production evidence | Fix or archive | P1 |
| `docs/auditos/backup-schedule-evidence.md:7` | "Manual backup command — ✅ Available" | `db:backup` is an echo placeholder | Fix script or doc | P1 |

## 9. Tenant & Security Hardening Plan

### Current Risks

| Area | Risk | Evidence | Required Fix | Priority |
|---|---|---|---|---|
| AuditOS read actions | No actor resolution; no tenant check | `src/actions/audit-read-actions.ts:29-100` — all 15 read actions bypass `getAuditActor()` and `assertEngagementAccess()` | Apply actor/tenant enforcement to every read action | P0 |
| `getAuditUsers` | Returns all users with no org filter | `src/lib/audit/db/index.ts:1976-1988` — `prisma.auditUser.findMany({ orderBy: { name: 'asc' } })` | Add `organizationId` parameter and filter | P0 |
| `getDashboardSummary` | Events, findings, evidence, mappings queried without org filter | `src/lib/audit/db/index.ts:391-422` — only engagements filtered by org | Scope all queries by organization | P0 |
| Admin audit events | Events recorded with `engagementId: ""` | `src/actions/audit-admin-actions.ts:57-67,80-91,107-118` | Create separate org-level event model or allow nullable engagement | P0 |
| `confirmMappingAction` | Mutation exposed in read-actions file with no actor/tenant checks | `src/actions/audit-read-actions.ts:41-43` | Move to write actions with full enforcement | P1 |
| `updateEvidenceStateAction` | No `assertEngagementAccess` — mutates by evidence `id` only | `src/actions/audit-actions.ts:134-139` | Add engagement access check or verify evidence belongs to actor's org | P1 |
| `updateReviewCommentStatusAction` | No `assertEngagementAccess` — mutates by comment `id` only | `src/actions/audit-actions.ts:195-199` | Add engagement access check | P1 |
| Demo actor fallback | Returns hardcoded demo identity in dev | `src/lib/audit/actor-context.ts:64-78` | Acceptable for development; ensure prod gate works; document for dev-only | P2 |
| Hardcoded canonical accounts in mapping UI | Duplicates DB data | `src/components/audit/mapping/mapping-page.tsx:69-92` | Fetch from DB or use shared constants | P2 |
| `updateEvidenceState` vs `updateEvidenceStateWithEvent` | Two code paths; Verify/Mark Reviewed buttons use path without audit event | `src/components/audit/evidence/evidence-page.tsx:368-377` calls `updateEvidenceStateAction` which uses `updateEvidenceState` (no event) | Route all state changes through event-recording path | P1 |

### Required Enforcement Pattern

For every AuditOS server action (read or write):
1. `const actor = await getAuditActor()` — resolve identity
2. `requireRole(actor, [...])` — check permissions
3. `await assertEngagementAccess(engagementId, actor)` — verify tenant ownership
4. Then proceed to service call

For DB read functions, add optional `organizationId?` parameter and scope queries.

## 10. AuditOS Workflow Integrity Review

Expected workflow: Engagement → Trial Balance → Mapping → Financial Statements → Notes → Evidence → Findings → Review → Validation → Publication → Approval

Actual UI tab order: Overview → Trial Balance → Mapping → Validation → Statements → Notes → Evidence → Findings → Recommendations → Review → Approval → Publication → Audit Trail → Pilot

| Stage | Current State | Gap | Required Fix | Priority |
|---|---|---|---|---|
| Engagement | ✅ DB + action + UI | None | None | — |
| Trial Balance | ✅ DB + action + UI + audit event | None | None | — |
| Mapping | ✅ DB + action + UI + audit event + downstream rebuild | `confirmMappingAction` in read-actions without actor checks | Move to write actions with full enforcement | P1 |
| Financial Statements | ✅ DB + rebuild on mapping change + UI | None | None | — |
| Notes | ✅ DB + action + UI + note.status_changed events | None | None | — |
| Evidence | ✅ DB + action + UI + creation/link events | State changes through `updateEvidenceState` (no event) vs `updateEvidenceStateWithEvent` dual path | Route all evidence state changes through event-recording path | P1 |
| Findings | ✅ DB + action + UI + creation events | Status changes (`updateFindingStatus`) do not record audit events (`src/lib/audit/services.ts:859-862`) | Add audit event for finding status changes | P1 |
| Recommendations | ✅ DB + action + UI + creation events | Status changes (`updateRecommendationStatus`) do not record audit events (`src/lib/audit/services.ts:886-889`) | Add audit event for recommendation status changes | P1 |
| Review | ✅ DB + action + UI + comment add events | `review.comment_resolved` event declared in docs but `updateReviewCommentStatus` does not emit it | Emit resolved events on status transition to `resolved` | P1 |
| **Validation** | **❌ No Prisma models; mock-only reads; dispositions are local React state only** | **No persistence, no audit trail, no attribution, no durability** | **Add AuditValidationRun, AuditValidationIssue, AuditValidationDisposition models + actions + events** | **P0** |
| **Publication** | **❌ Publish button renders with no onClick; no publish mutation exists** | **Workflow stops at export; no state transition from draft to published** | **Implement publish mutation updating AuditPublicationPackage status, engagement status, and audit event** | **P0** |
| Approval | ✅ DB + action + UI + events | Engagement is set to `approved` in `createApprovalRecord` (`src/lib/audit/services.ts:943`) | None | — |
| Audit Trail | ✅ DB + UI + event coverage for most stages | Some state-change events missing (finding, recommendation, review status changes) | Fill event gaps (see above) | P1 |
| Pilot | ✅ DB + action + UI | Full feedback/blocker/signoff lifecycle is implemented | None | — |

## 11. Validation Lifecycle Plan

### Current Gap

- Validation is defined only in TypeScript types (`src/types/audit/index.ts:181-207`).
- No Prisma models exist for validation in `prisma/schema.prisma:596-968`.
- `getValidationRun()` and `runValidation()` return mock data only (`src/lib/audit/db/index.ts:864-883`).
- `handleDispose()` in `src/components/audit/validation/validation-page.tsx:50-62` mutates only local React state via `setTimeout()` — no server action is called.
- No audit events are recorded for validation runs or dispositions.

### Proposed Models

```
model AuditValidationRun {
  id             String               @id @default(cuid())
  engagementId   String
  engagement     AuditEngagement      @relation(fields: [engagementId], references: [id])
  validationType String
  status         String               @default("running")
  summary        String?
  trustState     String               @default("pending")
  validatedAt    DateTime             @default(now())
  issues         AuditValidationIssue[]
  createdAt      DateTime             @default(now())
}

model AuditValidationIssue {
  id               String               @id @default(cuid())
  validationRunId  String
  validationRun    AuditValidationRun    @relation(fields: [validationRunId], references: [id])
  checkType        String
  severity         String
  status           String               @default("open")
  description      String
  accountCode      String?
  accountName      String?
  expectedValue    Float?
  actualValue      Float?
  message          String
  dispositions     AuditValidationDisposition[]
  createdAt        DateTime             @default(now())
}

model AuditValidationDisposition {
  id          String              @id @default(cuid())
  issueId     String
  issue       AuditValidationIssue @relation(fields: [issueId], references: [id])
  action      String              // "accepted" | "dismissed" | "investigated"
  rationale   String
  disposedBy  String
  disposedAt  DateTime            @default(now())
}
```

### Proposed Server Actions

- `runValidationAction(engagementId)` — compute checks, persist result, record audit event
- `disposeValidationIssueAction(issueId, action, rationale)` — persist disposition, record audit event
- `getValidationRunAction(engagementId)` — read persisted validation run

### Proposed UI Updates

- Replace `setTimeout`-based local state in `handleDispose()` with server action call.
- Add audit trail entries for validation runs and dispositions.

### Proposed Audit Events

- `validation.run_completed` — on run completion
- `validation.issue_disposed` — on accept/dismiss/investigate

### Migration Risk

- Low: new tables only, no changes to existing models.
- `runValidationAction` must first be implemented before UI is wired.

### Implementation Sequence

1. Add Prisma models and run migration.
2. Implement server actions (`runValidationAction`, `disposeValidationIssueAction`).
3. Update `validation-page.tsx` to call server actions instead of local state.
4. Add audit event recording.
5. Update DB layer to read/write from Prisma instead of mock.

## 12. Publication Lifecycle Plan

### Current Gap

- `AuditPublicationPackage` model exists in schema (`prisma/schema.prisma:865-875`) with `status`, `publishedAt`, `publishedBy`, `lockedAt`.
- Export actions exist and export JSON data (`src/actions/audit-actions.ts:481-519`, `src/lib/audit/export-service.ts`).
- Publication page reads the package and renders a `Publish` button when `isReady`, but the button has no `onClick` handler (`src/components/audit/publication/publication-page.tsx:140-160`).
- No server action exists to transition `AuditPublicationPackage` from `draft`/`ready` to `published`.
- `createApprovalRecord` updates engagement status to `approved` but does not touch publication package.

### Proposed Status Model

```
Draft → Ready for Publication → Published → Superseded → Archived
```

### Publish Action Requirements

| Requirement | Current State | Gap | Required Action |
|---|---|---|---|
| Transition package status | Package is read-only; no status write | No publish mutation exists | Create `publishEngagementAction(engagementId)` that updates `AuditPublicationPackage.status` to `published`, sets `publishedAt` and `publishedBy` |
| Update engagement status | Engagement updated to `approved` on approval only | No `published` transition for engagement | Transition engagement to `published` after successful publication |
| Immutable snapshot | Export reads live data each time | No frozen snapshot on publish | Optionally: freeze statement/note/finding content into the package on publish |
| Audit event | Export events exist for downloads | No publish event | Record `publication.published` event |
| Lock behavior | `lockedAt` field exists in schema but is never set | No lock implementation | Set `lockedAt` on publish; prevent edits to locked packages |

### Implementation Sequence

1. Implement `publishEngagementAction` server action with role check (`partner` or `admin`).
2. Wire `onClick` on the Publish button in `publication-page.tsx`.
3. Record `publication.published` audit event.
4. Update engagement status to `published`.
5. Set `lockedAt` on the package.
6. (Future) Build immutable snapshot logic.

## 13. Traceability & Data Consistency Plan

### Seed/Mock/Demo Conflicts

| Dataset | Issue | Evidence | Impact | Fix |
|---|---|---|---|---|
| seed-audit | `map-8` (Accrued Expenses) creditAmount is `SAR(-20000)` but TB line is `SAR(95000)` | `prisma/seed-audit.ts:121,212,267` | Balance sheet uses correct TB value but mapping carries wrong amount | Fix `map-8` creditAmount to match TB |
| seed-audit | `map-12` (Retained Earnings) creditAmount is `SAR(1200000)` but TB line is `SAR(705000)` | `prisma/seed-audit.ts:126,216,272,278` | Statement lines use correct TB value but mapping carries inflated amount | Fix `map-12` creditAmount to match TB |
| seed-audit | `map-20` and `map-21` both reference `tb-line-21` | `prisma/seed-audit.ts:224-225` | `tb-line-22` (5070) has no mapping while `tb-line-21` (5060) has two | Fix `map-21` sourceAccountId to `tb-line-22` |
| mock-data | `map-21` references `tb-line-22` correctly; `map-22` (5100) is confirmed | `src/lib/audit/mock-data.ts:196-199` | Mock and seed diverge on which mapping references which TB line | Reconcile seed with mock or vice versa |
| UI | Engagement overview says "Sundry Income (5100) has no confirmed mapping" | `src/app/audit/engagements/[engagementId]/page.tsx:92-101` | Both seed and mock define confirmed `map-22` for 5100 | Remove hardcoded missing-link message |
| UI (auditos demo) | Demo uses `accepted_by_human` status values while runtime audit actions use `'rejected'` without `_by_human` suffix | `src/app/auditos/traceability/page.tsx:124-130` vs `src/actions/audit-actions.ts:437,447` | Demo AI status language does not fully match runtime | Normalize status strings |
| DB layer | `toEvidenceLink` sets `targetLabel: ''` for all DB links | `src/lib/audit/db/index.ts:201-217` | UI renders `le.targetLabel` which is always empty for DB-backed evidence | Persist and return meaningful target labels |

### Required Canonical Dataset

- Rebuild the Gulf Trading dataset from one canonical source (the TB lines in seed-audit).
- Derive mappings, financial statements, and evidence from that source programmatically.
- Add regression checks for line-to-mapping consistency.

### Regression Checks

Create or adapt a validation script that:
1. Verifies every mapping's amounts match its referenced TB line.
2. Verifies every financial statement line total equals the sum of its linked mappings.
3. Verifies every mapped TB line has a downstream statement reference.

## 14. Brand & Identity Alignment

### Asset Issues

| Issue | Evidence | Action | Priority |
|---|---|---|---|
| `aqliya-mark.svg` referenced by 3+ runtime components but missing from `public/brand/` | `src/components/platform/platform-sidebar.tsx:123`, `src/components/platform/platform-header.tsx:47`, `src/components/audit/layout/audit-sidebar.tsx:74` vs `public/brand/` directory listing | Add the missing asset or switch all references to `aqliya-logo-approved.png` | P0 |
| `public/favicon.svg` not found | `glob("public/favicon*")` returned no files | Add favicon or verify current favicon config uses correct path | P2 |
| Brand docs and implementation reports in `public/brand/` | `public/brand/` contains 9 `.md` files, `tailwind.config.js`, and `aqliya-tokens.css` | Move docs to `docs/`, move config to project root or remove | P1 |
| `BRAND-ASSETS-ORGANIZATION.md` documents a tree (`logo/`, `social/`, `patterns/`, `fonts/`, `icons/`, `templates/`, `exports/`) that does not exist | `public/brand/BRAND-ASSETS-ORGANIZATION.md:7-146` vs actual directory listing | Trim the doc to actual assets or populate the tree | P2 |

### Naming Issues

| Issue | Evidence | Action | Priority |
|---|---|---|---|
| Arabic names inconsistent: `عقلية أوديت` in marketing vs `AuditOS / Financial Intelligence` in docs and shell | `src/app/(marketing)/products/audit/page.tsx:6,31` vs `docs/product/auditos-product-packaging.md:5` | Standardize one Arabic rendering | P2 |
| `Fin Intelligence` abbreviation in AuditSidebar | `src/components/audit/layout/audit-sidebar.tsx:78` | Use full approved name or standard abbreviation | P3 |

### Arabic/English Consistency

- Workspace shell is RTL but audit page content areas force LTR — define one deliberate strategy and apply consistently.

### Token Source Decision

- Runtime tokens live in `src/app/globals.css:49-181`.
- A documented token system exists in `public/brand/aqliya-tokens.css` but is not imported anywhere.
- Decision: keep `globals.css` as the runtime source; archive `aqliya-tokens.css` as reference-only or remove.

## 15. Engineering Validation Results

| Command | Result | Notes | Required Fix |
|---|---|---|---|
| `npm run build` | **Pass** | Production build completed. Dynamic server usage warnings when prerendering `/decisions` (non-blocking). Build was rerun solo after initial parallel run hit an EBUSY file lock. | Add `export const dynamic = "force-dynamic"` to `/decisions` page or mark route as dynamic |
| `npx prisma generate` | **Pass** | Prisma client generated successfully | None |
| `npm run audit:health` | **Pass** | 7/7 checks passed: DB connected, 2 engagements, 28 events, 5 AI outputs, 9 users, 0 open blockers | None |
| `npm run backup:verify` | **Pass** (data integrity only) | All 7 core tables have data; script itself states this is not a real backup test | Add real backup execution capability |
| `npm run lint` | **Fail** | 238 problems: 72 errors, 166 warnings. Key errors: `pilot-page.tsx:70`, `review-page.tsx:47-56`, `trial-balance-page.tsx:64-121`, `db/index.ts` `any` types, `update-pw.js` require imports | Fix errors; separate real errors from warnings; suppress acceptable `any` usage |
| `npx tsc --noEmit` | **Fail** | `tsconfig.json:25-31` includes `.next/types/**/*.ts` but the generated type tree uses a different structure. Root cause: Next.js 16.2.4 no longer produces per-route `.next/types` files in the format the config expects. Also: Jest globals missing in test files. | Remove `.next/types/**/*.ts` from `tsconfig.json:29` include pattern, or regenerate with matching build |
| `npm test` | **Fail** | All 3 test suites fail because `src/lib/prisma.ts:1` imports `"server-only"` which throws in Node.js/Jest runtime | Map `server-only` to a no-op in `jest.config.js` or add a Jest-specific Prisma mock |
| `npm run db:backup` | **Placeholder only** | Prints `'Backup: pg_dump ...'` — no real backup is executed | Implement real backup script or remove the misleading script |
| `npm run db:restore` | **Fail** | Missing script in `package.json` | Add script or remove references from docs |

## 16. Repo Cleanup Plan

| Path | Issue | Action | Priority |
|---|---|---|---|
| Root `README.md` | Missing | Create onboarding README | P0 |
| `public/brand/*.md` (9 files) | Documentation in asset directory | Move to `docs/brand/` or archive | P1 |
| `public/brand/tailwind.config.js` | Config in public assets | Move to project root or remove if unused | P1 |
| `public/brand/aqliya-tokens.css` | Token file in public assets, not imported | Archive or remove if `globals.css` is canonical | P2 |
| `public/brand/ChatGPT Image May 11, 2026, 07_43_28 PM.png` | Unstructured generated asset | Move to working folder or remove | P3 |
| `fix-viewer-org.js`, `set-passwords.js`, `update-pw.js` | Ad hoc root scripts | Move to `scripts/` with descriptive names | P2 |
| `prisma/dev.db` | SQLite artifact alongside PostgreSQL schema | Document purpose or remove | P3 |
| `src/components/layout/header.tsx`, `src/components/layout/sidebar.tsx` | Legacy layout duplicates | Remove after verifying no remaining consumers | P2 |
| `src/components/audit/layout/audit-sidebar.tsx` | Audit-specific sidebar exists but unused by audit layout | Decide: adopt in audit layout or remove | P2 |
| `src/components/audit/pilot/pilot-page.tsx` | Unused import: `createProductionBlockerAction` | Remove unused import | P3 |
| Docs root `decisionos-*.md` files (12 files) | DecisionOS reports mixed in docs root with AuditOS docs | Group into `docs/decisionos/` or archive outdated ones | P2 |
| `public/brand/ENTERPRISE-INTELLIGENCE-ARCHITECTURE-REPORT.md` | Architecture report in brand assets | Move to `docs/` or archive | P1 |

## 17. Readiness Gates

| Requirement | Internal Review | Demo Ready | Pilot Ready | Commercial Ready |
|---|---|---|---|---|
| Build passes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Architecture documented | ⚠️ Partial | ✅ Clean architecture doc | ✅ | ✅ |
| Routes clarified | ❌ `/audit` vs `/auditos` unresolved | ✅ One route/status doc exists | ✅ | ✅ |
| No broken brand assets | ❌ `aqliya-mark.svg` missing | ✅ All assets present | ✅ | ✅ |
| No misleading CTAs | ❌ AuditOS CTAs on non-audit product pages | ✅ CTAs match current product state | ✅ | ✅ |
| Demo data consistent | ❌ Seed/mock/UI conflicts | ✅ Canonical dataset reconciled | ✅ | ✅ |
| Known limitations visible | ⚠️ Some overclaims in docs | ✅ Limitations documented | ✅ | ✅ |
| Tenant enforcement on reads | ❌ No checks on reads | ❌ Not required for demo | ✅ All reads guarded | ✅ |
| Validation persistence | ❌ Mock-only, local state | ❌ Not required for demo | ✅ DB-backed | ✅ |
| Publish lifecycle | ❌ No publish mutation | ❌ Not required for demo | ✅ Full lifecycle | ✅ |
| Audit trail coverage | ⚠️ Missing state-change events | ⚠️ Acceptable with caveats | ✅ Full coverage | ✅ |
| Traceability integrity | ⚠️ Label/scope gaps | ⚠️ Acceptable with caveats | ✅ Target-specific traces | ✅ |
| Backup truthfulness | ❌ `db:backup` is echo placeholder | ⚠️ Documented as manual | ✅ Real backup with restore tested | ✅ Automated + tested |
| Clean lint baseline | ❌ 72 errors, 166 warnings | ⚠️ 0 errors | ✅ 0 errors, 0 warnings | ✅ |
| Clean typecheck baseline | ❌ Config issue + Jest missing | ⚠️ TypeScript passes (minus `.next` pattern) | ✅ 0 errors | ✅ |
| Jest suite passes | ❌ `server-only` import failure | ⚠️ Tests pass or excluded from demo scope | ✅ All tests pass | ✅ |
| Controlled user access | ❌ Reads unauthenticated | ✅ Demo routes bypass auth by design | ✅ All actions enforce actor | ✅ Role-based + SSO |
| Monitoring | ⚠️ Health check only | ⚠️ Acceptable | ✅ Health + backup verify | ✅ Full monitoring |
| Backup/restore verified | ⚠️ Data integrity only | ⚠️ Acceptable | ✅ Restore tested | ✅ Automated + tested |
| Security review | ❌ Not executed | ❌ Not required for demo | ⚠️ Internal review done | ✅ External pen test |
| Deployment runbooks | ❌ Not present | ❌ Not required for demo | ⚠️ Limited pilot runbook | ✅ Full runbooks |

## 18. Prioritized Roadmap

### P0 — Must Fix Before External Demo

| # | Task | Why | Evidence | Files | Complexity |
|---|---|---|---|---|---|
| 1 | Add actor/tenant enforcement to all AuditOS read actions | Reads currently leak engagement data across tenants | `src/actions/audit-read-actions.ts:29-100` | `src/actions/audit-read-actions.ts`, `src/lib/audit/services.ts`, `src/lib/audit/db/index.ts` | Medium |
| 2 | Codify `/audit` = workspace, `/auditos` = guided demo | Route identity confusion is the root of navigation and marketing issues | `docs/README.md:34-38`, `src/app/auditos/page.tsx:17-27`, `src/app/(marketing)/products/audit/page.tsx:41-43` | `docs/README.md`, `docs/aqliya-auditos-boundaries.md`, marketing pages | Low |
| 3 | Add missing `aqliya-mark.svg` or replace all broken references | Visible shells reference a missing asset path | `src/components/platform/platform-sidebar.tsx:123`, `public/brand/` directory listing | `public/brand/` or all components referencing the path | Low |
| 4 | Reconcile seed/mock/UI data for Gulf Trading dataset | Trust/traceability claims depend on consistent data | `prisma/seed-audit.ts:212,216,225`, `src/lib/audit/mock-data.ts:196-199`, `src/app/audit/engagements/[engagementId]/page.tsx:92-101` | `prisma/seed-audit.ts`, `src/lib/audit/mock-data.ts`, UI pages with hardcoded summaries | Medium |
| 5 | Fix admin audit events using empty `engagementId` | Admin user management actions may fail at event write time | `src/actions/audit-admin-actions.ts:57-67,80-91,107-118` | `src/actions/audit-admin-actions.ts`, `prisma/schema.prisma`, `src/lib/audit/db/index.ts` | Low |
| 6 | Add Prisma models and actions for validation persistence | Validation is a required control stage with no durability | `src/types/audit/index.ts:181-207`, `prisma/schema.prisma:596-968`, `src/components/audit/validation/validation-page.tsx:50-62` | `prisma/schema.prisma`, new server actions, `validation-page.tsx` | Medium |
| 7 | Implement real publish mutation | Core workflow stops at export; publish is a cosmetic button | `src/components/audit/publication/publication-page.tsx:140-160`, `src/actions/audit-actions.ts:1-621` | `src/actions/audit-actions.ts`, `publication-page.tsx`, `src/lib/audit/db/index.ts` | Medium |
| 8 | Remove or re-label AuditOS CTAs on non-audit product pages | Unrelated product pages funnel users to AuditOS demo incorrectly | `src/app/(marketing)/products/decision/page.tsx:36-37`, same pattern in simulation, sales, local-content pages | `src/app/(marketing)/products/{decision,simulation,sales,local-content}/page.tsx` | Low |
| 9 | Create root `README.md` and one route/status source-of-truth doc | No onboarding for new contributors or reviewers | Root directory listing, `docs/` listing | New files: `README.md`, `docs/ROUTE_STRATEGY.md`, `docs/PRODUCT_STATUS_MATRIX.md` | Low |
| 10 | Fix custom-product success CTA funneling all inquiries to `/auditos` | Inappropriate default CTA for non-audit inquiries | `src/components/forms/custom-product-form.tsx:306-339` | `src/components/forms/custom-product-form.tsx` | Low |

### P1 — Must Fix Before Pilot

| # | Task | Why | Files | Complexity |
|---|---|---|---|---|
| 1 | Scope `getAuditUsers` and `getDashboardSummary` sub-queries by organization | Tenant data from other orgs visible in dashboard aggregates | `src/lib/audit/db/index.ts:391-422,1976-1988` | Medium |
| 2 | Route all evidence state changes through event-recording path | Current dual path means Verify/Mark Reviewed actions produce no audit trail | `src/components/audit/evidence/evidence-page.tsx:368-377`, `src/actions/audit-actions.ts:134-146`, `src/lib/audit/services.ts:817-835` | Medium |
| 3 | Add audit events for finding, recommendation, and review status changes | Production review pack claims coverage for these events but code does not emit them | `src/lib/audit/services.ts:859-862,886-889,914-917` | Medium |
| 4 | Replace `db:backup` placeholder with real script; add `db:restore` or rewrite docs | Operational docs overclaim production readiness | `package.json:13`, `docs/auditos/backup-and-monitoring.md:17-39,110-127` | Medium |
| 5 | Move `confirmMappingAction` from read actions to write actions with full enforcement | Mutation exposed on an unguarded read path | `src/actions/audit-read-actions.ts:41-43` | Low |
| 6 | Move docs and config out of `public/brand/` | Misplaced artifacts create maintenance confusion | `public/brand/*.md`, `public/brand/tailwind.config.js`, `public/brand/aqliya-tokens.css` | Low |
| 7 | Separate platform navigation from DecisionOS in the shell | Platform and product identity collapsed onto same route | `src/components/platform/platform-sidebar.tsx`, `src/components/platform/module-switcher.tsx`, `src/lib/platform/workspace.ts` | Medium |
| 8 | Remove or fix dead links to nonexistent routes | Command palette and cross-module panels link to routes that 404 | `src/components/platform/command-palette.tsx:84-101`, `src/app/audit/page.tsx:208-214`, `src/app/sales/page.tsx:17-23` | Low |
| 9 | Add `/api/health` endpoint or remove the claim from docs | Backup-and-monitoring docs reference a nonexistent route | `docs/auditos/backup-and-monitoring.md:104-105` | Low |
| 10 | Fix tsconfig `.next/types` include pattern causing `tsc --noEmit` failure | Configuration drift prevents clean typecheck baseline | `tsconfig.json:25-31` | Low |
| 11 | Fix Jest `server-only` import failure | All 3 test suites fail before any test runs | `jest.config.js:9-16`, `src/lib/prisma.ts:1` | Low |

### P2 — Must Fix Before Commercial Use

| # | Task | Why | Files | Complexity |
|---|---|---|---|---|
| 1 | Decide SalesOS, SimulationOS, Local Content OS status: real modules or marketing-only | Current ambiguity creates confusion in platform shell, nav, and docs | All platform/module files, marketing pages, docs | Low (decision) |
| 2 | Add optimistic concurrency or versioning for concurrent edits | Last-write-wins behavior risks data loss in multi-user scenarios | `src/lib/audit/db/index.ts` | High |
| 3 | Add real file scanner integration for production evidence uploads | `fail-closed` mode blocks all evidence uploads in production | `src/lib/audit/file-scanner.ts:31-61` | High |
| 4 | Add PDF/DOCX export formats | JSON-only exports are documented as a known limitation | `src/lib/audit/export-service.ts` | High |
| 5 | Standardize Arabic AuditOS naming and define LTR/RTL strategy | Mixed naming and directionality weaken product identity | Multiple marketing and workspace files | Low |
| 6 | Create regression checks for seed/mock/UI data consistency | Current data contradictions can re-emerge without automated checks | `prisma/seed-audit.ts`, `src/lib/audit/mock-data.ts` | Medium |
| 7 | Remove or archive unused legacy layout components | `src/components/layout/header.tsx`, `src/components/layout/sidebar.tsx` | Medium |
| 8 | Update `docs/execution/architecture-guards.md` to reflect actual code state | Docs forbid routes that already exist | `docs/execution/architecture-guards.md:27-37` | Low |

### P3 — Cleanup / Refinement

| # | Task | Complexity |
|---|---|---|
| 1 | Move root ad hoc scripts (`fix-viewer-org.js`, `set-passwords.js`, `update-pw.js`) into `scripts/` | Low |
| 2 | Remove or document `prisma/dev.db` | Low |
| 3 | Remove unused icons and dead imports across audit components | Low |
| 4 | Clean `public/brand/` to contain only runtime assets | Low |
| 5 | Normalize AI output status strings (`accepted_by_human` vs `rejected` vs `rejected_by_human`) | Low |
| 6 | Fix `mapping-page.tsx` hardcoded canonical accounts (fetch from DB or use shared constants) | Low |
| 7 | Fix `Hardcoded approver name in approval page` | Low |
| 8 | Remove `docs/archive/ARCHITECTURE.md` reference to missing root `ARCHITECTURE.md` in `docs/archive/README.md:30` | Low |

## 19. Final Verdict

**Internally reviewable**

The repo is not yet demo-ready with governance. The following blockers prevent moving to a demo-ready verdict:

1. **Tenant security on reads** — AuditOS read actions serve engagement data without actor or organization checks. This is a critical integrity gap in the governed workspace.
2. **Route/product identity drift** — `/audit` workspace and `/auditos` demo are not distinguished in docs, marketing, or the platform shell. The repo's own architecture guards contradict the current code.
3. **Non-durable workflow stages** — Validation is entirely mock/local-state, and publication has no publish transition. The governance promise of a complete, traceable workflow is not yet met.
4. **Broken brand assets** — Multiple runtime components reference a file path that does not exist.
5. **Operational overclaims** — Backup and readiness docs describe capabilities that either do not exist or have never been tested.
6. **Failing validation baselines** — Lint, typecheck, and Jest all fail at the repo level.

Once the 10 P0 items are completed, the repo moves to **Demo-ready with governance**. These items are not architectural rewrites — they are targeted, specific fixes with clear file and line evidence. All are documented in this plan with exact paths, observed facts, and suggested implementation sequences.
