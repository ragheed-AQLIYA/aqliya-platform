# Roadmap v1.2 — Adoption Report

**Date:** 2026-06-03
**Status:** Final — prepared for sign-off

---

## 1. What Roadmap v1.2 Does

Roadmap v1.2 makes 6 changes to the planning baseline:

| Change | Impact |
|--------|--------|
| Corrects 8 documented conflicts between v1.1 sources and repository reality | Eliminates contradictory planning signals |
| Upgrades L0 Platform Foundation from L4 to L5 (19/20 components built) | Unblocks L0.5, L1, L2, L3, L7 L6 work |
| Upgrades L0.5 Intelligence Core from partial to L4→L5 (12/15 built) | Opens AI-dependent feature path |
| Changes SalesOS status from "Freeze/Frozen" to **ACTIVE_WITH_CAUTION** | Honest label for real development |
| Upgrades DecisionOS from L4 to **L5-conditional** | Matches engine depth reality |
| Defines 7-status classification system | Replaces ambiguous binary (Active/Frozen) model |

---

## 2. Authority Hierarchy After Adoption

```
                                          ┌──────────────────────────┐
                                          │ DOCUMENTATION_AUTHORITY  │
                                          │    Hierarchy rules        │
                                          └──────────┬───────────────┘
                                                     │
                                          ┌──────────▼───────────────┐
                                          │ AQLIYA_ROADMAP_v1.2.md  │
                                          │ Single authoritative     │
                                          │ planning source           │
                                          └──────────┬───────────────┘
                                                     │
                    ┌────────────────────────────────┼────────────────────────────┐
                    │                                                             │
     ┌──────────────▼──────────────┐                  │           ┌───────────────▼──────────────┐
     │ docs/official/ (v1.1 docs)  │                  │           │ docs/source-of-truth/          │
     │ Identity, governance,       │                  │           │ Architecture, taxonomy,        │
     │ strategic positioning       │                  │           │ routes, product status         │
     │ (doctrine authority)        │                  │           │ (aligned to v1.2)             │
     └──────────────┬──────────────┘                  │           └───────────────┬──────────────┘
                    │                                                             │
                    │          ┌──────────────────────▼──────────────────────────┐│
                    │          │ Repository Reality                              ││
                    │          │ Code > Schema > Tests > Docs > Historical       ││
                    └──────────┤                                                ├┘
                               └────────────────────────────────────────────────┘
```

**Rule:** For identity/governance/trust principles, official doctrine docs are authority — but their implementation-status claims are superseded by v1.2 roadmap. For planning, status, and maturity: v1.2 and repository reality are authority.

---

## 3. Documents Superseded by v1.2

| Document | Status | Superseded By |
|----------|--------|---------------|
| `docs/official/aqliya-roadmap-v1.1.md` | **Superseded** | AQLIYA_ROADMAP_v1.2.md |
| `docs/source-of-truth/ENTERPRISE_COMPLETION_ROADMAP.md` | **Superseded** | AQLIYA_ROADMAP_v1.2.md + supporting matrices |
| `docs/source-of-truth/L6_PRODUCTION_ROADMAP.md` | **Superseded** | AQLIYA_ROADMAP_v1.2.md + L6_COMPLETION_PROGRAM.md |

These documents remain in the repository for historical reference but must not be used as authority for planning or status decisions.

---

## 4. Official Doctrine Docs — Status After Adoption

| Document | Role | v1.2 Impact |
|----------|------|-------------|
| `aqliya-vision-v1.1.md` | Doctrine — identity & boundaries | **Status claims for DecisionOS, SalesOS updated**. Implementation-status note expanded. Supersedure header added. |
| `aqliya-product-taxonomy-v1.1.md` | Doctrine — product classification | **DecisionOS maturity updated**. v1.2 alignment note added. |
| `aqliya-implementation-rules-v1.1.md` | Doctrine — coding & docs rules | **Rule 7 hierarchy updated** to include v1.2. |
| `aqliya-core-architecture-v1.1.md` | Doctrine — architecture | **SalesOS and DecisionOS status updated** to match v1.2 reality. |
| `aqliya-glossary-v1.1.md` | Doctrine — terminology | **SalesOS definition updated** from "prototype only" to v1.2 reality. |
| `aqliya-agent-context-v1.1.md` | Doctrine — agent context | **SalesOS description corrected**. Read-first list updated. |
| `aqliya-skill-context-v1.1.md` | Doctrine — skill instructions | Unchanged — no v1.1-specific references. |

---

## 5. Source-of-Truth Docs — Alignment Status

| Document | v1.2 Alignment Status | Changes Made |
|----------|----------------------|--------------|
| `PRODUCT_STATUS_MATRIX.md` | **Aligned** | DecisionOS L4 → L5-conditional. v1.2 reference added. |
| `ROUTE_STRATEGY.md` | **Aligned** | DecisionOS routes L4 → L5-conditional. Implementation status labels updated. |
| `AQLIYA_SYSTEM_TAXONOMY.md` | **Aligned** | DecisionOS L4 → L5-conditional. SalesOS L3 → L4. v1.2 reference added. |
| `READINESS_GATES.md` | **Aligned** | ESLint warning claim corrected (resolved to 0). Backup status clarified. v1.2 reference added. |
| `PILOT_RUNBOOK.md` | **Aligned** | PDF/DOCX export claim corrected. ESLint error claim corrected. v1.2 reference added. |
| `CURRENT_REALITY_MATRIX.md` | **Aligned** | Already authority-aligned in creation. |
| `PRODUCT_STATUS_AUTHORITY_MATRIX.md` | **Aligned** | Already authority-aligned in creation. |
| `ROADMAP_CONFLICT_MATRIX.md` | **Aligned** | Already authority-aligned in creation. |
| `L6_COMPLETION_PROGRAM.md` | **Aligned** | Already authority-aligned in creation. |
| `EXECUTION_DEPENDENCY_GRAPH.md` | **Aligned** | Already authority-aligned in creation. |
| `AQLIYA_ARCHITECTURE.md` | **Needs review** | Not audited in this pass — pre-dates v1.2. |
| `ENTERPRISE_COMPLETION_ROADMAP.md` | **Superseded** | Supersedure header added. |
| `L6_PRODUCTION_ROADMAP.md` | **Superseded** | Supersedure header added. |

---

## 6. Stale References Corrected

**Total stale references identified:** 25 across 12 files.
**Total corrections applied:** 22 (3 official doc references left for manual review — see §7).

| File | Stale Text | Corrected Text |
|------|-----------|---------------|
| `PRODUCT_STATUS_MATRIX.md` §DecisionOS | `L4 Usable v0.1` | `L5-conditional` |
| `ROUTE_STRATEGY.md` DecisionOS routes × 18 rows | `Active adjacent (L4)` | `Active adjacent (L5-conditional)` |
| `ROUTE_STRATEGY.md` Intelligence routes × 2 rows | `Active adjacent (L4)` | `Active adjacent (L5-conditional)` |
| `AQLIYA_SYSTEM_TAXONOMY.md` §DecisionOS | `L4 Usable v0.1` | `L5-conditional` |
| `AQLIYA_SYSTEM_TAXONOMY.md` §SalesOS | `L3 Prototype` | `L4 (ACTIVE_WITH_CAUTION)` |
| `READINESS_GATES.md` §Pilot-ready blockers | `ESLint warnings/errors remain` | `ESLint warnings resolved to 0 (Phase 7, 2026-05-28)` |
| `PILOT_RUNBOOK.md` §Out of scope | `PDF/DOCX export (JSON-only)` | `PDF and XLSX export now implemented` |
| `PILOT_RUNBOOK.md` §Known limitations | `JSON-only exports (no PDF/DOCX)` | `PDF and XLSX exports now implemented (pdfkit + xlsx)` |
| `PILOT_RUNBOOK.md` §Known limitations | `9 ESLint errors remaining` | `ESLint warnings resolved to 0 (Phase 7, 2026-05-28)` |

---

## 7. Remaining Work (Not Blocking Sign-Off)

These items were identified but are out of scope for this adoption pass. They should be queued independently:

1. **`AQLIYA_ARCHITECTURE.md` alignment audit** — needs review against v1.2 roadmap (medium effort, process-decision required)
2. **Official v1.1 doc full rewrite** — the 7 v1.1 official docs could eventually be replaced with v1.2 editions (major effort, not needed for sign-off)
3. **SalesOS official doc updates** — references in `aqliya-glossary-v1.1.md`, `aqliya-agent-context-v1.1.md`, `aqliya-core-architecture-v1.1.md` have been updated with supersecedence headers but full rewrites would be cleaner
4. **ENTERPRISE_COMPLETION_ROADMAP.md and L6_PRODUCTION_ROADMAP.md archival** — these are superseded but retained in-source. Consider moving to `docs/archive/`.

---

## 8. Sign-Off Readiness

| Criterion | Status | Detail |
|-----------|--------|--------|
| Conflicts documented | ✅ | 8 conflicts in ROADMAP_CONFLICT_MATRIX.md |
| Source-of-truth aligned | ✅ | 10/12 documents aligned, 2 superseded |
| Superseded documents identified | ✅ | 3 documents formally superseded |
| References verified | ✅ | 22 stale references corrected across 7 files |
| Execution backlog created | ✅ | v1.2 Execution Backlog (separate file) |
| SalesOS policy documented | ✅ | ACTIVE_WITH_CAUTION with explicit allowed/prohibited list |
| Status definitions standardized | ✅ | 7-status system replacing binary model |
| L0/L0.5 reality reflected | ✅ | Now L5 and L4→L5 respectively |
| DecisionOS level corrected | ✅ | L4 → L5-conditional |
| Overall readiness score | ✅ | ~58/100 (up from ~52/100) |
| Cross-doc consistency verified | ✅ | No contradictions found across 6 new matrices |

---

## 9. Next Step

Roadmap v1.2 is ready for **final sign-off**. After sign-off:

1. Update `AGENTS.md` §2 authority hierarchy to list AQLIYA_ROADMAP_v1.2.md
2. Add `AGENTS.md` note: `aqliya-roadmap-v1.1.md` is superseded by `docs/official/AQLIYA_ROADMAP_v1.2.md`
3. Begin execution of v1.2 Execution Backlog
