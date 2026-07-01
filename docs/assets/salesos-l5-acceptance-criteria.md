# SalesOS — L5 Acceptance Criteria (S7-04)

**Version:** 2026-06-07  
**Authority:** `docs/source-of-truth/EXECUTION_DEPENDENCY_GRAPH.md` (G4), `docs/execution-backlog/v1.2-execution-backlog.md`  
**Machine-readable:** `src/lib/sales/l5-acceptance.ts` (`evaluateSalesL5Acceptance`)

---

## Purpose

Define when AQLIYA may claim **SalesOS L5 Pilot-ready** without overstating CRM, AI autonomy, or production hardening.

Trust principle: **AI assists. Humans decide. Evidence governs.**

---

## Readiness labels

| Label | Meaning |
| ----- | ------- |
| `NOT_L5` | Multiple required criteria unmet |
| `L5_CONDITIONAL` | Most governance + intelligence met; known gaps (e.g. bilingual parity) |
| `L5_PILOT_READY` | All required criteria met; operator may run internal pilot with disclaimer |

**Current repository baseline (2026-06-07):** `L5_PILOT_READY` per `evaluateSalesL5Acceptance()` after **S7-05** — still **internal/pilot only** until operator sign-off; not L6.

---

## Required criteria (all must pass for L5_PILOT_READY)

| ID | Criterion | Evidence in repo |
| -- | --------- | ---------------- |
| G1 | Authenticated `/sales/*` workspace | Route strategy + auth middleware |
| G2 | Tenant isolation + server RBAC | `organizationId` scoping in sales services |
| G3 | Audit trail on sensitive mutations | `salesAuditEvent` / audit actions |
| G4 | Evidence linkage on deals/proposals | evidence-links, resolver tests |
| G5 | Human review/approval path | `l5-governance.ts`, review/approval routes |
| I1 | S7-01 intelligence hub wired | `/sales/intelligence` panels |
| I2 | S7-02 deterministic forecast | `/sales/forecast`, `pipeline-forecast.ts` |
| I3 | AI assistive only | No autonomous approval exports |
| U1 | Arabic/RTL parity on core routes | **Met** — S7-05 (`sales-bilingual-parity.ts`, `sales/loading.tsx`) |
| C1 | No live CRM sync claim | S7-03 not implemented; docs honest |
| C2 | Prototype/internal commercial labels | `PRODUCT_STATUS_MATRIX`, this doc |

---

## Explicitly out of scope for L5

- Live CRM sync (S7-03)
- Production On-Prem / SSO / SIEM
- L6 ops (backup automation proof, pentest sign-off)
- Customer-facing commercial release without operator runbook

---

## Verification

```bash
npm test -- src/lib/sales/__tests__/l5-acceptance.test.ts
```

Operator checklist before pilot demo:

1. Confirm `evaluateSalesL5Acceptance()` gaps list empty or accepted in writing.
2. Run sales governance tests: `npm test -- src/lib/sales/__tests__/sales-l5-governance.test.ts`
3. Do not update `PRODUCT_STATUS_MATRIX` to L5 until `allRequiredMet === true`.

---

## Related

- `docs/operations/salesos-migration-runbook.md`
- `docs/systems/salesos/README.md`
- Gate G4 in `PARALLEL_REMEDIATION_GATES.md`
