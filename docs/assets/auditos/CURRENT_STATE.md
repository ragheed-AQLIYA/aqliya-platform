# AuditOS 2.0 Factory — Current State

**As of:** 2026-06-13  
**Branch reality:** Factory program Phases **2–8** and **9–11** on branch.

## Program Intent

Build a governed **Financial Statement Factory** pipeline:

```
TB → Classification → Mapping → Lead Schedules → Reconciliation → FS → Disclosure Notes → Review → Approved FS
```

All factory extensions are **feature-flagged** with **default off** (pilot-safe).

## Implementation Matrix (This Branch)

| Phase | Capability | Code on branch | Flag | Route / hook |
| ----- | ---------- | -------------- | ---- | ------------- |
| 0 | Baseline doc | ✅ this file | — | — |
| 1 | Local AI / inference bridge | ⚠️ Partial | — | `runInference()` via [`LOCAL_AI_BRIDGE.md`](./LOCAL_AI_BRIDGE.md) |
| 2 | Reporting graph (Prisma) | ✅ | `audit.reporting-graph` | Dual-write on TB + FS rebuild |
| 3 | Lead schedules | ✅ | `audit.lead-schedule-auto` | `/lead-schedules`; hook on mapping confirm |
| 4 | Reconciliation engine | ✅ | `audit.reconciliation` (+ gates) | Validation panel; hook on FS rebuild |
| 5 | FS Engine v2 | ✅ | `audit.fs-v2` | 4 statements + cash flow; status lifecycle |
| 6 | IFRS rules | ✅ | `audit.ifrs-rules` | Post-FS hook; validation panel |
| 7 | SOCPA rules | ✅ | `audit.socpa-rules` | Post-IFRS hook; validation panel |
| 8 | Disclosure auto | ✅ | `audit.disclosure-auto` | Post-SOCPA hook; notes tab panel |
| 9 | Audit intelligence | ✅ | `audit.intelligence` | Notes tab; post-FS-rebuild hook |
| 10 | Factory approval gates | ✅ | `audit.approval-gates` | Approval + export block |
| 11 | Mind map + GraphSnapshot | ✅ | `audit.mind-map` | `/factory-map`; snapshot on approval |
| 12 | Pilot readiness package | ✅ | — | [`FACTORY_PILOT_READINESS.md`](./FACTORY_PILOT_READINESS.md) |
| **8.1** | **Canonical COA expansion (33 lines)** | ✅ | — | [`PHASE_8_1_CANONICAL_COA.md`](./PHASE_8_1_CANONICAL_COA.md) |

## Core AuditOS (Unchanged Baseline)

These remain the **operational pilot path** without factory flags:

| Step | Route | Persistence |
| ---- | ----- | ----------- |
| Trial balance | `/audit/engagements/[id]/trial-balance` | `AuditTrialBalance` |
| Mapping | `…/mapping` | `AuditAccountMapping` |
| Validation | `…/validation` | `AuditValidationRun` |
| Financial statements | `…/statements` | `AuditFinancialStatement` |
| Notes | `…/notes` | `AuditDisclosureNote` |
| Approval / export | `…/approval`, `…/exports` | `AuditApprovalRecord` |

Public demo remains **`/auditos/*`** — mock-only, no factory flags.

## Feature Flags (`.env.example`)

```env
FF_AUDIT_INTELLIGENCE=false
FF_AUDIT_REPORTING_GRAPH=false
FF_AUDIT_LEAD_SCHEDULE_AUTO=false
FF_AUDIT_RECONCILIATION=false
FF_AUDIT_RECONCILIATION_GATES=false
FF_AUDIT_FS_V2=false
FF_AUDIT_IFRS_RULES=false
FF_AUDIT_SOCPA_RULES=false
FF_AUDIT_DISCLOSURE_AUTO=false
FF_AUDIT_APPROVAL_GATES=false
FF_AUDIT_MIND_MAP=false
```

Phase 8 (`FF_AUDIT_DISCLOSURE_AUTO`) materializes rule triggers into draft notes — see [`DISCLOSURE_AUTO_ENGINE.md`](./DISCLOSURE_AUTO_ENGINE.md).

## Pilot Recommendation

| Profile | Flags | Use when |
| ------- | ----- | -------- |
| **Baseline pilot** | All factory flags **off** | First customer TB; minimize variables |
| **Factory pilot (partial)** | `INTELLIGENCE` + `MIND_MAP` on | Traceability + enrichment after notes exist |
| **Factory pilot (graph)** | `REPORTING_GRAPH` + `LEAD_SCHEDULE_AUTO` + `RECONCILIATION` on | Full TB→LS→FS tie-out on validation |
| **Factory pilot (governed)** | All factory flags **on** | Full factory gates + graph snapshot at approval |

Do **not** enable factory flags for `/auditos` demo routes.

## Factory Readiness (2026-06-13)

Eight-step pipeline review: [`FACTORY_READINESS_REVIEW.md`](./FACTORY_READINESS_REVIEW.md)  
Verdict: **Profile A** pilot-ready; **Profile D** conditional after factory smoke on staging.

## Known Gaps Before Full Factory

1. ~~Reconciliation RC-002~~ — **resolved 2026-06-13:** FS v2 now emits per-mapping Cost of Sales detail lines; all **6 RC checks pass** on `eng-gulf-2025` (`failedCount: 0`).
2. Factory gates assume FS/note/validation artifacts exist; enable `RECONCILIATION_GATES` only after tie-out passes in pilot.
3. Cash flow v2 is simplified indirect — no prior-period WC movements.
4. Factory module tests pass (fs-engine, reconciliation, rules, graph, governance, intelligence); `npm run build` pass (2026-06-13).
5. Static factory smoke: 33/33 pass. Live smoke on `eng-gulf-2025`: **12/12 PASS** (2026-06-13, pgvector :5434).
6. Validation issue IDs scoped per run (`${runId}-i-N`) — repeatable smoke without duplicate key errors.
7. Phase 1 (Local AI bridge): partial — see [`LOCAL_AI_BRIDGE.md`](./LOCAL_AI_BRIDGE.md); Cypress factory routes in `cypress/e2e/audit-factory.cy.ts`.
8. Full `prisma db seed` may fail FK on `organization.deleteMany` — use `npm run seed:audit` for factory pilot (now also upserts platform login users and clears validation/lead-schedule FKs before re-seed).
9. Cypress factory spec: `cypress/e2e/audit-factory.cy.ts` — 7/7 pass with `cy:local` after `seed:audit`.

## Authority

- Product status: `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`
- Routes: `docs/source-of-truth/ROUTE_REGISTRY.md`
- Factory phase docs: `docs/systems/auditos/*.md`
