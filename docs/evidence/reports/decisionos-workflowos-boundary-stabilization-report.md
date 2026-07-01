# DecisionOS / WorkflowOS Boundary Stabilization Report

**Date:** 2026-05-29  
**Agent:** 4 — DecisionOS & WorkflowOS Adjacent Systems (Eid Expansion v0.2)  
**Branch:** `eid-sprint-stabilization-2026-05-29`  
**Scope:** Naming consistency, product boundary clarity, one B8 gate slice, remaining gap documentation  
**Authority:** `docs/reports/aqliya-eid-expansion-program-plan.md` (P1-6, P2-4 partial)

---

## Executive Summary

Active surfaces were re-inspected after the prior sprint cleanup (`decisionos-workflowos-cleanup-report.md`). **WorkflowOS remains canonical**; **Sunbul is redirect alias + seed tenant identifier only**. Residual naming on the demo org page was neutralized. **DecisionOS vs WorkflowOS** boundary copy was added to both workspace headers. **One B8 slice delivered:** server-enforced **export gate** — `getDecisionExportData` now blocks unless decision status is `APPROVED`, with audit log on block.

No shared nav structure changes (sidebar/command-palette untouched this pass). No `/audit/*` or `/local-content/*` changes.

---

## Product Boundary Reference

| System | Role | Routes | Maturity |
| ------ | ---- | ------ | -------- |
| **DecisionOS** | Adjacent governed **executive decision** workspace | `/decisions/*`, `/intelligence/sectors/*` | L4 — export gate slice added; review/approval hardening partial |
| **WorkflowOS** | Canonical governed **operational case/document** workspace | `/workflowos/*` | L4 |
| **Sunbul** | **Not a product** — legacy redirect + Prisma prefix + demo org route slug | `/sunbul/*` → `/workflowos/*`, `/organizations/sunbul` | Redirect alias (N/A) |

**Boundary rule:** DecisionOS = decision lifecycle (intake → scenarios → recommendation → governance/approval). WorkflowOS = multi-client records, documents, operational review queue. Shared platform shell only.

---

## Inspection Findings

### Naming — Active UI (post prior cleanup)

| Location | Status | This pass |
| -------- | ------ | --------- |
| `platform-header.tsx`, `platform-sidebar.tsx`, `organization-workspace.tsx`, `(marketing)/page.tsx`, `command-palette.tsx`, `navigation.ts` | Already WorkflowOS-canonical per prior Agent 4 cleanup | **No change** (avoid Agent 2/5 nav conflict) |
| `organizations/sunbul/page.tsx` | Display name still "Sunbul" / "شركة سنبل" | **Patched** → Demo Organization / منظمة تجريبية |
| `platform-sidebar.tsx` org chip | "WorkflowOS" + "(Sunbul seed)" subtitle | **Kept** — truthful seed identifier |
| Prisma `Sunbul*` models, redirect route files | Internal only | **Unchanged** (migration out of scope) |

### DecisionOS vs WorkflowOS — Active UI

| Check | Result |
| ----- | ------ |
| Separate route trees | ✅ |
| Module switcher entries | ✅ (prior pass) |
| Workspace header boundary copy | ✅ Added this pass on `/decisions` and `/workflowos` dashboards |
| Cross-product confusion in org workspace cards | ✅ Distinct cards with correct hrefs (prior pass) |
| SimulationOS | Marketing label; simulation tab under DecisionOS — matrix-accurate, no change |

### Source-of-truth docs

| Document | Issue | Action |
| -------- | ----- | ------ |
| `AQLIYA_SYSTEM_TAXONOMY.md` | Inverted Sunbul/workflowos vs matrix | **Patched** this pass |
| `PRODUCT_STATUS_MATRIX.md`, `ROUTE_STRATEGY.md`, `AQLIYA_ARCHITECTURE.md` | Already WorkflowOS-canonical | No change |
| `AQLIYA_ARCHITECTURE.md` | Minor legacy custom-workspace framing | Deferred — low impact |

---

## B8 Gate Slice — Export Gate (P1-6)

### Implemented

| Layer | Change |
| ----- | ------ |
| **Server** | `getDecisionExportData` returns error when `decision.status !== "APPROVED"` |
| **Audit** | `DECISION_EXPORT_BLOCKED` platform audit event on blocked attempts |
| **UI** | Governance export buttons disabled until approved; locked-state banner + updated copy |

### Rationale

- Lowest-risk B8 slice: single server action + governance tab UI
- Aligns with trust principle: exports after human approval, not draft leakage
- Does not expand DecisionOS scope or block review workflow itself

### Files

- `src/actions/decision-export.ts`
- `src/app/(dashboard)/decisions/[id]/governance/page.tsx`

---

## Remaining B8 Gaps (Not Implemented)

| ID | Gap | Severity | Notes |
| -- | --- | -------- | ----- |
| B8-R1 | **Review gate hardening** — `submitForReview` does not require recommendation or minimum evidence count | Medium | UI warns; server allows DRAFT → IN_REVIEW without evidence |
| B8-R2 | **Approval gate hardening** — approve without immutable snapshot edge cases; legacy snapshot path | Medium | Partial UI gates exist; server allows override with reason |
| B8-R3 | **Report tab export** — `/decisions/[id]/report` print path bypasses export gate | Low | Browser print only; not structured export API |
| B8-R4 | **Dedicated export API route** — no permissioned download route like WorkflowOS PDF | Low | JSON/MD via client blob only |
| B8-R5 | **Evidence-required approval policy** — optional org policy not enforced server-side on approve | Medium | Warning-only today |
| B8-R6 | **PlatformAuditLog dual-write** — DecisionOS audit still split (`logAudit` vs `auditLogger`) | Low | See `decisionos-platform-audit-log-integration-plan.md` |
| B8-R7 | **WorkflowOS review gate parity** — operational review exists but not aligned to DecisionOS B8 matrix row | Low | Separate product; L4 acceptable |

**Recommendation:** Next slice = B8-R1 (server-side evidence check on `submitForReview`) or B8-R5 — only after Agent 6 medium validation pass.

---

## Files Changed

| File | Change |
| ---- | ------ |
| `src/actions/decision-export.ts` | Export gate + blocked audit event |
| `src/app/(dashboard)/decisions/[id]/governance/page.tsx` | Export UI gate + copy |
| `src/app/(dashboard)/decisions/page.tsx` | DecisionOS adjacent-system + WorkflowOS boundary subtitle |
| `src/components/workflowos/workflow-dashboard.tsx` | WorkflowOS title + DecisionOS boundary subtitle |
| `src/app/organizations/sunbul/page.tsx` | Demo org display name (not Sunbul product) |
| `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` | WorkflowOS canonical / Sunbul alias sync |
| `docs/reports/decisionos-workflowos-boundary-stabilization-report.md` | **Created** — this report |

---

## Governance Check

| Control | Status |
| ------- | ------ |
| RBAC | Export still requires `requireDecisionAccess(..., "VIEWER")`; gate adds status check |
| Tenant isolation | Unchanged |
| Evidence | Warn-only on governance UI; not enforced on export gate (deferred B8-R5) |
| Audit trail | `DECISION_EXPORT_BLOCKED` + existing `DECISION_EXPORT_PREPARED` |
| Review/approval | Export blocked until `APPROVED` |
| Export control | **Slice implemented** |
| AI boundary | Unchanged — assistive only |

---

## Validation

| Command | Result |
| ------- | ------ |
| `npx tsc --noEmit` | **Run — Fail (pre-existing)** — errors in `settings/workspaces`, `api/metrics`, `admin-metrics-scope`; none in Agent 4 changed paths |
| `npm run lint` | Not run (low-load; label + gate logic only) |
| `npm run build` | Not run (delegated to Agent 6) |

---

## Sign-off

| Field | Value |
| ----- | ----- |
| **Status** | **DONE** |
| **Code changed** | Yes — minimal boundary + one B8 slice |
| **Schema changed** | No |
| **Route impact** | No new routes |
| **Classification impact** | DecisionOS remains L4; B8 export gate partial |

---

*Agent 4 — Eid Expansion v0.2. Adjacent systems clarified without AuditOS/LC distraction.*
