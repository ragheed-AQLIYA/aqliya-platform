# DecisionOS / WorkflowOS v0.2 Product Boundary Report

**Date:** 2026-05-29
**Agent:** 9 — DecisionOS / WorkflowOS Product Boundary Track
**Branch:** `eid-sprint-stabilization-2026-05-29`
**Authority:** `docs/reports/aqliya-full-platform-build-program-plan.md` (Agent 0 master plan; Agent 9 = Portfolio/Wave 5)
**Trust principle:** AI assists. Humans decide. Evidence governs.
**Baseline classification (unchanged, not upgraded):** Controlled pilot ready with conditions

> **Scope of this document.** Make two adjacent ~L4 products — **DecisionOS** and **WorkflowOS** — coherent inside the AQLIYA portfolio: clarify each product's role, confirm **Sunbul** is an internal/legacy alias only, map shared platform dependencies, and define a v0.2 backlog for each. This report is **documentation-first**. No taxonomy/matrix/AGENTS edits were made (single-owner files reserved for Agents 6/10). Code-level naming drift outside Agent 9's write surface is recorded as recommendations, not patched.

---

## 1. Scope Inspected

### 1.1 Authority & status docs read
- `docs/reports/aqliya-full-platform-build-program-plan.md` (Agent 0 master plan)
- `docs/reports/decisionos-workflowos-boundary-stabilization-report.md` (prior Agent 4 draft — context only)
- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` (read-only; Agent 6 owns)
- `docs/official/aqliya-product-taxonomy-v1.1.md` (read-only; Agents 6/9 share, edits serialized to Agent 6 this program)

### 1.2 Code reality inspected (narrow Glob/Read/Grep, no scans)
- **DecisionOS:** `src/app/(dashboard)/decisions/**` (24 route files: list, `new`, and 19 `[id]/*` tabs), `src/actions/decisions.ts` (server-action surface), `src/actions/decision-export.ts` (export gate, read in full), `src/actions/decision-evidence-actions.ts` (referenced).
- **WorkflowOS:** `src/app/workflowos/**` (page, layout, admin, record detail, API download + PDF export routes), `src/components/workflowos/*` (16 components), `src/actions/workflowos-actions.ts` (`workflow_*` action surface), `src/lib/workflowos/*` (services, tenant-guard, storage, export, audit, types).
- **Sunbul alias:** `src/app/sunbul/page.tsx`, `src/app/sunbul/admin/page.tsx`, `src/app/sunbul/clients/[clientId]/records/[recordId]/page.tsx` (read in full), `src/app/organizations/sunbul/page.tsx` (demo-org route), `src/middleware.ts` (route perimeter).
- **Shared platform:** `src/lib/platform/audit-logger.ts` (`Product` registry), `src/components/platform/platform-sidebar.tsx`, `platform-header.tsx` (shared nav — read-only this pass).

### 1.3 Not run (Low-Load Execution Protocol)
`npm run build`, `npm run lint`, `npm test`, broad repo scans, dev server, Prisma commands. `npx tsc --noEmit` not required — **no code patch applied this pass** (see §5).

---

## 2. Current Reality — Product Boundary Classification

### 2.1 One-line role of each product

| Product | One-line role | Routes | Level |
| ------- | ------------- | ------ | ----- |
| **DecisionOS** | Adjacent **governed executive-decision** workspace — runs a single decision through its lifecycle (intake → framework → scenarios → risk → recommendation → governance/approval → approved export). | `/decisions`, `/decisions/[id]/*`, `/intelligence/sectors` | L4 |
| **WorkflowOS** | Canonical **governed operational case/document** workspace — manages multi-client records & documents through an operational review queue (Draft → UnderReview → Approved) with per-client isolation. | `/workflowos`, `/workflowos/admin`, `/workflowos/clients/[clientId]/records/[recordId]`, `/api/workflowos/*` | L4 |
| **Sunbul** | **Not a product** — legacy redirect alias + Prisma model prefix + demo-org seed slug. Every page is a `permanentRedirect(302)` to the matching `/workflowos/*` route. | `/sunbul/*` → `/workflowos/*` | Redirect alias (N/A) |

**Boundary rule (unchanged, now verified in code):** DecisionOS = the *decision lifecycle* for one executive decision. WorkflowOS = *operational records/documents* across many client tenants. They share the platform shell only; they do **not** share schema, server actions, or workflow engine.

### 2.2 DecisionOS — evidence of role

- **Lifecycle surface (real):** 19 `[id]/*` tabs (`intake`, `framework`, `scenarios`, `risks`, `recommendation`, `governance`, `outcome`, `report`, plus intelligence tabs `sector/signals/insight/alerts/simulation/tender/what-to-do`). Resilience files (`loading/error/not-found`) present.
- **Server actions (real, governed):** `src/actions/decisions.ts` — every action is access-gated via `requireDecisionAccess(id, "VIEWER|OPERATOR|ADMIN")`; lifecycle mutations (`updateDecisionStatus`, `updateDecisionFramework`, `updateDecisionScenarios`, `updateDecisionRiskAnalysis`, `updateDecisionRecommendation`, `publishRecommendationAction`/`unpublishRecommendationAction`, `getWorkflowReadiness`, `getDashboardMetrics`).
- **Export gate (real, v0.2):** `getDecisionExportData` (`src/actions/decision-export.ts`) blocks unless `decision.status === "APPROVED"`, emitting `DECISION_EXPORT_BLOCKED` (warning) on block and `DECISION_EXPORT_PREPARED` (info) on success via the shared platform `auditLogger` (`Product.DECISION_OS`). Approved exports carry an immutable-snapshot source, a diff summary, and explicit human-review warnings.
- **Own data:** `Decision`, `DecisionEvidence`, `Recommendation`, `Approval`, scenarios/risks/framework relations — a distinct schema, not shared with WorkflowOS.
- **AI boundary:** dashboard `AIIndicator`/`AIInsightCard` are assistive/deterministic UI only; the dashboard activity timeline + "recent entities" are still **mock arrays** (`mockDecisionTimeline`, `mockRecentEntities`) — a quality gap, not a boundary breach (backlogged D-7).

### 2.3 WorkflowOS — evidence of role

- **Workspace surface (real):** client-scoped dashboard (`workflow-dashboard.tsx`) with stat cards (total/draft/underReview/approved), record list, create-record form, review queue, document panel, membership manager, audit trail, status badge, PDF export.
- **Server actions (real, governed, tenant-isolated):** `src/actions/workflowos-actions.ts` — `workflow_*` for client/membership/record/document/review lifecycle; record state machine `workflow_submitRecord` → `workflow_approveRecord`/`workflow_returnRecord` → `workflow_archiveRecord`; role resolution via `workflow_getUserRole`.
- **Protected I/O (real):** `/api/workflowos/documents/[documentId]/download` and `/api/workflowos/clients/.../export/pdf` (auth-gated download + PDF export after approval). Storage/export/audit in `src/lib/workflowos/*`.
- **Schema reuse (by design):** WorkflowOS reuses the **`Sunbul*` Prisma models** (`SunbulClient`, `SunbulUserMembership`, `SunbulRecord`, role enum) — it has **no distinct schema of its own**. This is the single largest naming/coherence debt for the product (see §3 G2, §8 R1).

### 2.4 Sunbul — alias status

| Check | Result |
| ----- | ------ |
| `/sunbul`, `/sunbul/admin`, `/sunbul/clients/.../records/...` are pure `permanentRedirect(302)` to `/workflowos/*` | ✅ Verified (all three files) |
| Standalone Sunbul components / UI / data | ✅ None |
| Middleware perimeter routes `/sunbul` + `/sunbul/:path*` + `/api/sunbul/:path*` | ✅ Protected (redirect still requires auth via target) |
| Sidebar/header treat `/sunbul` as WorkflowOS module | ✅ `getWorkspaceInfo` maps `/sunbul` → WorkflowOS |
| **Residual drift (out of Agent 9 write surface)** | ⚠️ Two minor items — see §3 G3 |

**Verdict:** Sunbul is an internal/legacy alias only at the **routing** level (clean). Two residual naming references remain in *non-Agent-9-owned* files and are handed off as recommendations rather than patched.

---

## 3. Gaps

**G1 — DecisionOS review/approval server hardening partial (B8 open).** `submitForReview` does not require a recommendation or a minimum evidence count; approval can override without an immutable snapshot in legacy edge cases; evidence-required-approval is warn-only. Export is gated on `APPROVED`, but the gate that *produces* `APPROVED` is softer than the export gate it feeds. (Carried from prior Agent 4 B8-R1/R2/R5.)

**G2 — WorkflowOS has no schema identity; rides `Sunbul*` models.** The canonical product persists to `SunbulClient`/`SunbulRecord`/`SunbulUserMembership`. Any reader of the schema sees "Sunbul," not "WorkflowOS." This is the deepest coherence gap between the canonical name and the data layer. Rename is a **schema migration → Agent 5 (approval-gated)**, not an Agent 9 action.

**G3 — Residual Sunbul naming drift in shared files (not Agent 9-owned).**
- `src/lib/platform/audit-logger.ts` defines `Product.SUNBUL = "sunbul"` which is **defined but never used** anywhere in `src/` (dead alias key). → Agent 2 (Core Services owns audit-logger).
- `src/components/platform/platform-header.tsx` breadcrumb segment map still renders `sunbul: "شركة سنبل"` ("Sunbul Company") for the last path segment, while `src/app/organizations/sunbul/page.tsx` now displays "Demo Organization / منظمة تجريبية." The breadcrumb label contradicts the page. → shared-nav single-editor (Agent 7/12 per §4.4) or Agent 6 naming pass.
- `platform-sidebar.tsx` org chip subtitle "منظمة تجريبية (Sunbul seed)" is a **truthful seed identifier** and is acceptable (kept by prior Agent 4); listed for completeness only.

**G4 — DecisionOS dashboard mock content.** `/decisions` list page renders a real metrics/decision grid but a **mock** activity timeline and recent-entities panel. Low risk (clearly demo content) but should be wired or labelled before any pilot framing.

**G5 — No dedicated permissioned export route for DecisionOS.** WorkflowOS has `/api/workflowos/.../export/pdf` (auth + audit). DecisionOS structured export is client-blob JSON/MD only; `/decisions/[id]/report` print path bypasses the export gate. (Prior B8-R3/R4.)

**G6 — Taxonomy tree drift (doc-level, Agent 6-owned).** `aqliya-product-taxonomy-v1.1.md` lists `Sunbul` and lowercase `workflowos` as co-equal siblings under "Custom / Client-Specific Workspaces," and lists a "Workflow Engine" under Intelligence Core that the master plan (G3) treats as deferred/MISSING. Recommendations handed to Agent 6 (see §9).

---

## 4. Proposed Boundary Architecture (target coherence)

```text
AQLIYA Platform Shell (auth, middleware, sidebar/header, command palette, nav)
├── DecisionOS  (/decisions/*)        — one executive decision, full lifecycle, own schema
│     intake → framework → scenarios → risk → recommendation → governance(approve) → approved export
├── WorkflowOS  (/workflowos/*)       — many client tenants, operational records/documents
│     record: Draft → UnderReview → Approved → Archived  (per-client isolation; PDF after approval)
│        └── Sunbul = legacy alias ONLY: /sunbul/* ⇒ 302 ⇒ /workflowos/*  (+ Sunbul* schema reuse)
└── Shared Intelligence/Governance/Core (assistive AI, actor-lineage, audit-logger, storage, export)
```

**Invariants (must hold):**
1. DecisionOS and WorkflowOS never share server actions or schema; only the platform shell + governance/audit primitives.
2. Sunbul never gains UI, data, or its own server action — it stays a 302 alias until the `Sunbul*` schema is renamed (Agent 5) and the alias can be retired.
3. Both products surface AI as **assistive only** (no autonomous-AI claim); both honor the trust principle (human approval before export/publish).

---

## 5. Files Changed

| File | Change |
| ---- | ------ |
| `docs/reports/decisionos-workflowos-v02-boundary-report.md` | **Created** — this report |
| `docs/product/decisionos-v02-backlog.md` | **Created** — DecisionOS v0.2 backlog |
| `docs/product/workflowos-v02-backlog.md` | **Created** — WorkflowOS v0.2 backlog |

**No application code, schema, route, taxonomy, or matrix changes.** The one trivially-safe naming candidate (breadcrumb label `sunbul: "شركة سنبل"`) lives in a **shared nav file outside Agent 9's write surface** (`platform-header.tsx`) and under the single-editor-per-pass rule (master plan §4.4), so it is **backlogged + handed off** rather than patched. Within Agent 9's owned surfaces (`decisions/*`, `workflowos/*`, `sunbul/*`) active naming is already canonical (boundary copy + demo-org rename landed in the prior Agent 4 pass), so no in-scope patch was warranted.

---

## 6. Commands Run

```text
(read-only) Glob/Read/Grep over src/app/{decisions,workflowos,sunbul}/**, src/components/workflowos/*,
            src/actions/{decisions,decision-export,workflowos-actions}.ts, src/lib/workflowos/*,
            src/lib/platform/audit-logger.ts, src/components/platform/platform-{sidebar,header}.tsx,
            src/middleware.ts, and the authority/status docs.
```

No heavy commands. No build/lint/test/prisma. No dev server.

---

## 7. Validation Result

| Command | Result |
| ------- | ------ |
| `npx tsc --noEmit` | **Not run / not required** — no code patch this pass (documentation-first). Prior Agent 4 recorded pre-existing tsc errors in `settings/workspaces`, `api/metrics`, `admin-metrics-scope` — **none in DecisionOS/WorkflowOS/Sunbul paths**. |
| `npm run lint` / `npm test` / `npm run build` | Not run (Low-Load; delegate to QA/Agent 13). |

**Interpretation:** Boundary coherence here is asserted from code reading, not re-validated by build. Any backlog item that touches code (D-1..D-3, W-1..W-3) must be validated with `npx tsc --noEmit` by its owning agent before classification change.

---

## 8. Risks

| ID | Risk | Severity | Mitigation |
| -- | ---- | -------- | ---------- |
| R1 | **WorkflowOS↔Sunbul schema rename** could break tenant isolation / seeds if done carelessly | High | Treat as approval-gated Agent 5 migration with seed + audit parity; do not rename in a portfolio pass |
| R2 | DecisionOS export gate is stronger than the approval gate feeding it → an under-evidenced decision can still reach `APPROVED` then export cleanly | Medium | Land D-1 (server-side review/approval evidence checks) before any DecisionOS pilot framing |
| R3 | Shared-nav edit contention (breadcrumb fix) across Agents 7/9/12 | Low | Backlogged as a single-line handoff; one editor per pass |
| R4 | Over-claiming either product as pilot-ready/L5 | High | Both remain **L4 Usable v0.1**; this pass does not upgrade classification |
| R5 | Dead `Product.SUNBUL` key re-used by mistake, re-introducing Sunbul as a "product" in audit data | Low | Recommend removal by Agent 2; until then, do not reference `Product.SUNBUL` |

---

## 9. Next Lowest-Load Step + Handoffs

**Next lowest-load step:** Agent 6 applies the taxonomy/naming recommendations below (doc-only), then a QA agent runs a single `npx tsc --noEmit` light pass if any code backlog item (D-1..D-3 / W-1..W-3) is picked up. No build is needed for the documentation deliverables.

### Recommendations handed to **Agent 6** (sole owner of `PRODUCT_STATUS_MATRIX.md` + `aqliya-product-taxonomy-v1.1.md`)

| # | Recommendation | Rationale |
| - | -------------- | --------- |
| T-1 | In the taxonomy tree, render **WorkflowOS** (canonical casing) instead of lowercase `workflowos`, and represent **Sunbul as a subordinate legacy alias *under* WorkflowOS**, not a co-equal sibling. | Matches matrix ("Redirect alias over WorkflowOS") and code reality. |
| T-2 | Add a one-line boundary statement to the taxonomy **Boundaries** section distinguishing DecisionOS (executive-decision lifecycle) vs WorkflowOS (operational case/document workspace), mirroring the in-app boundary copy. | Removes the recurring DecisionOS/WorkflowOS confusion at the doctrine level. |
| T-3 | Clarify the "Workflow Engine" node under Intelligence Core as **deferred/concept** (per master-plan G3), so WorkflowOS is not implied to ride a built shared engine. | Prevents over-claiming a shared engine that does not exist. |
| T-4 | Keep SimulationOS as "treat as DecisionOS capability" (no change) and confirm matrix/taxonomy stay in sync. | Already correct; lock it. |
| T-5 | Optional matrix note: record that WorkflowOS persists via `Sunbul*` models pending an Agent 5 schema rename (G2), so the "canonical" claim and the schema names are reconciled in the truth docs. | Surfaces the deepest naming debt honestly. |

### Recommendations handed to other agents
- **Agent 2 (Core Services / audit-logger):** remove the unused `Product.SUNBUL` key from `src/lib/platform/audit-logger.ts`.
- **Agent 5 (Data/Evidence):** plan the approval-gated `Sunbul*` → `Workflow*` schema rename (G2) with seed + tenant-isolation + audit parity.
- **Shared-nav owner (Agent 7/12 per §4.4) or Agent 6 naming pass:** change the `platform-header.tsx` breadcrumb segment label `sunbul: "شركة سنبل"` → `"منظمة تجريبية"` to match the renamed demo-org page.

---

## Agent 9 Sign-off

| Field | Value |
| ----- | ----- |
| **Status** | **DONE** (documentation-first; recommendations handed off) |
| **Code changed** | No |
| **Schema changed** | No |
| **Route impact** | No |
| **Classification impact** | None — DecisionOS L4 / WorkflowOS L4 unchanged; Sunbul redirect alias (N/A) |
| **Deliverables** | This report + `docs/product/decisionos-v02-backlog.md` + `docs/product/workflowos-v02-backlog.md` |

*Agent 9 — Full Institutional Platform Build Program. Adjacent products made coherent without touching single-owner truth files. AI assists. Humans decide. Evidence governs.*
