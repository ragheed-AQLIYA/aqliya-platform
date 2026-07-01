---
title: "Product Migration Order"
status: active
program: "Platform Authorization"
phase: "Pre-Migration"
version: "1.0"
date: 2026-06-28
---

# Product Migration Order

> **Purpose:** Define and justify the order in which products migrate from legacy guards to the new Authorization Engine. This order is fixed — no product should be skipped or reordered without documented rationale.

---

## Migration Sequence

```
W4B/C ─── DecisionOS
            │
            ▼
W5 ─────── LocalContentOS
            │
            ▼
W6 ─────── SalesOS
            │
            ▼
W7 ─────── AuditOS
            │
            ▼
W8 ─────── WorkflowOS
            │
            ▼
W9 ─────── Core Cleanup (~requireUserContext + role comparisons + bypasses)
```

---

## Rationale

| Order | Product | Guards | Why This Position |
|:-----:|---------|:------:|-------------------|
| **1** | **DecisionOS** | ~40 | Smallest scope. Highest observability (decisions are well-defined). Best candidate for first migration — any issues will be detected early with minimal blast radius. |
| **2** | **LocalContentOS** | ~50 | Most security-hardened product (RB-01 completed). Guard functions are well-understood from RB-01. Migration can leverage existing guard knowledge. |
| **3** | **SalesOS** | ~60 | Moderate complexity. Independent product with dedicated guard system (`src/lib/sales/guards.ts`). Well-isolated — issues won't affect other products. |
| **4** | **AuditOS** | ~33 | Highest regulatory sensitivity. Must be migrated after engine is proven stable in DecisionOS, LCOS, and SalesOS. External auditor workflows must not break. |
| **5** | **WorkflowOS** | ~26 | Depends on other products' data. Migration after core products ensures engine handles all resource types correctly. |
| **6** | **Core Cleanup** | ~224 | Last because it touches the most files (~190 `requireUserContext` calls + 70 role comparisons + 6 admin bypasses). Engine must be fully validated before this wave. |

---

## Exit Gates

| From | To | Exit Gate | Evidence |
|:----:|:--:|-----------|----------|
| W4C | W5 | ≥99.9% parity sustained for 7 days + zero critical mismatches | Operational Certification + Board sign-off |
| W5 | W6 | LCOS parity ≥99.9% + zero regressions | Wave completion report |
| W6 | W7 | SalesOS parity ≥99.9% + SoD enforcement verified | Wave completion report |
| W7 | W8 | AuditOS parity ≥99.9% + all approval gates functional | Wave completion report + approval workflow tests |
| W8 | W9 | WorkflowOS parity ≥99.9% + all integration paths verified | Wave completion report |
| W9 | Done | All 433 points migrated. No legacy bypasses remain. KPI targets met. | Final completion report |

---

## Invariant During Migration

> **No product shall be left with a mixed authorization system.**

Each product is migrated as a complete unit. Partial migration within a product is not permitted — either all guards use the new engine, or all use the legacy system. This prevents:
- Split-brain authorization (two systems making different decisions for the same product)
- Maintenance confusion (engineers guessing which system controls which action)
- Audit gaps (some actions traced, others not)

---

## Rollback Policy

If a product migration causes unexpected behavior:

1. **Immediate:** Revert the feature flag for that product (`FEATURE_AUTHZ_CUTOVER` → OFF)
2. **Short-term:** Legacy guards resume authority — no production impact
3. **Long-term:** Analyze mismatches, fix engine, re-attempt migration

No product migration is considered final until it has operated in Dual Decision mode (W4B equivalent) for at least 7 days with ≥99.9% parity.
