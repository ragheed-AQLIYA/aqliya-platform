# AQLIYA Documentation Lineage Graph

**Purpose:** Map authority, supersession, and conflict resolution for all doc classes.  
**Authority:** Implements `docs/DOCUMENTATION_AUTHORITY.md` + `DOCUMENTATION_GOVERNANCE_V2.md`.  
**Effective:** 2026-06-18

---

## Authority Tree (implementation status)

```
L0  DOCUMENTATION_AUTHORITY.md
 └── L1  AQLIYA_MASTER_REFERENCE.md (identity + summary)
 └── L1  AQLIYA_ROADMAP_v1.2.md (strategy)
 └── L1  AQLIYA_CURRENT_STATE.md ★ operational truth (2026-06-18)
      └── L4  PRODUCT_STATUS_MATRIX.md (detailed per-product)
      └── L4  PRODUCT_STATUS_AUTHORITY_MATRIX.md (Active/Frozen/Internal)
      └── L4  ROUTE_REGISTRY.md + ROUTE_STRATEGY.md
      └── L6  docs/reports/*.txt (validation evidence — wins on build/test claims)
      └── L6  docs/audits/evidence/*.json (benchmark/smoke evidence)
```

**Conflict rule:** Code + L6 evidence > `AQLIYA_CURRENT_STATE.md` > `PRODUCT_STATUS_MATRIX.md` > `MASTER_REFERENCE` summary.

---

## Superseded Tree

| Document | Status | Superseded by |
|----------|--------|---------------|
| `ENTERPRISE_COMPLETION_ROADMAP.md` | SUPERSEDED 2026-06-03 | `AQLIYA_ROADMAP_v1.2.md`, `L6_COMPLETION_PROGRAM.md` |
| `L6_PRODUCTION_ROADMAP.md` | SUPERSEDED 2026-06-03 | `L6_COMPLETION_PROGRAM.md` |
| `FINAL_REALITY_AUDIT.md` (2026-06-17) | PARTIALLY SUPERSEDED 2026-06-18 | `AQLIYA_CURRENT_STATE.md`, `docs/reports/2026-06-18-final-*` |
| `TB_CLASSIFICATION_BENCHMARK.md` (Phase 1A) | SUPERSEDED for AI accuracy | `TB_CLASSIFICATION_REBENCHMARK.md` |
| `PRODUCT_STATUS_AUTHORITY_MATRIX.md` rows (pre-2026-06-18) | STALE until reconciled | Reconciled 2026-06-18 in same file |
| `docs/archive/*` | HISTORICAL | Must not cite for current status |

---

## Non-authoritative (background only)

| Corpus | Path | Banner required |
|--------|------|-----------------|
| Theoretical reference | `docs/theoretical-reference/*` | Yes |
| Archive | `docs/archive/*` | Yes |
| Pilot pack copies | `docs/pilot/*` | Operational detail only |
| Marketing deliverables | `docs/deliverables/*` | Evidence, not doctrine |

---

## Maintenance

When product status, routes, or validation results change:

1. Run validation → save to `docs/reports/YYYY-MM-DD-*`
2. Update `docs/reports/README.md` index
3. Update `AQLIYA_CURRENT_STATE.md`
4. Sync `PRODUCT_STATUS_MATRIX.md` if product level changed
5. Update this file if supersession chain changes
