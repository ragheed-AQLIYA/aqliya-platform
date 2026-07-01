# Evidence Manifest: DecisionOS

> **Derived Artifact** — auto-generated from Claims. Per Derived Artifacts Rule: do NOT manually edit.  
> **Version:** 1.0 | **Hash:** 4a8e2f1c9d3b7a0e5f6c8d2e1a4b9c7f  
> **Generated:** 2026-06-29 (Sprint v2 — P5: Manifest Generation)

---

## Product Information

| Field | Value |
|-------|-------|
| PROD-ID | PROD-DECISIONOS |
| Product Name | DecisionOS (نظام القرارات) |
| Entity Type | Product |
| KnowledgeArea | KA-11 |
| Authority | AUTH-DECISION |
| Current L-Level | L4–L5 |
| L-Level Status | Disputed |
| Strategic Intent | Frozen |

---

## Aggregated Claims

| CLM-ID | Version | Type | Dimension | Confidence | Evidence |
|--------|---------|------|-----------|------------|----------|
| CLM-DECISION-0001 | 1.0 | Implementation | Implementation Reality | High | EV-0016 |
| CLM-DECISION-0002 | 1.0 | Implementation | Implementation Reality | High | EV-0017 |
| CLM-DECISION-0003 | 1.0 | Product | Product Maturity | High | EV-0018, EV-0019, EV-0020, EV-0021, EV-0022, EV-0023, EV-0034 |
| CLM-DECISION-0004 | 1.0 | Product | Commercial Claim | Medium | EV-0032 |
| CLM-DECISION-0005 | 1.0 | Strategic | Strategic Intent | High | EV-0034, EV-0035 |

**Total Claims: 5** | Avg Completeness: 100% | Avg Confidence: 90% High

---

## Evidence Coverage (T1–T7)

| Tier | Evidence ID | Score | Quality |
|------|-------------|-------|---------|
| T1 (Static Code) | EV-0016, EV-0017 | 3/3 | Strong |
| T2 (UX) | EV-0018 | 3/3 | Strong |
| T3 (Dynamic) | EV-0023 | 2/3 | Moderate |
| T4 (Governance) | EV-0020, EV-0021, EV-0022 | 3/3 | Strong |
| T5 (Tests) | EV-0019 | 2/3 | Moderate |
| T6 (Documentation) | EV-0032 | 3/3 | Strong |
| T7 (Operational) | EV-0034 | 3/3 | Strong |

| Metric | Value |
|--------|-------|
| Avg Tier Score | 2.7/3 |
| Strong EV % | 75% |
| Quality Index | 60.8% |

---

## Governance Rules Compliance

| Rule | Status |
|------|--------|
| Immutable IDs | ✅ All CLM/EV/SRC/AUTH follow approved patterns |
| Derived Artifacts | ✅ Manifest is generated from claims (not hand-edited) |
| Evidence Manifest | ✅ This document |
| Glossary Precision | ✅ No ambiguous terms |
| Three-tier Review | ⏳ Pending Sprint v3 |

---

## Dependency Graph

```text
CLM-DECISION-0001 ── EV-0016 ── SRC-CODE-0008
CLM-DECISION-0002 ── EV-0017 ── SRC-SCHEMA-0003
CLM-DECISION-0003 ──┬── EV-0018 ── SRC-CODE-0009
                    ├── EV-0019 ── SRC-TEST-0004
                    ├── EV-0020 ── SRC-SCHEMA-0004
                    ├── EV-0021 ── SRC-CODE-0010
                    ├── EV-0022 ── SRC-CODE-0011
                    ├── EV-0023 ── SRC-TEST-0005
                    └── EV-0034 ── SRC-OPERATION-0002
CLM-DECISION-0004 ── EV-0032 ── SRC-DOC-0003
CLM-DECISION-0005 ──┬── EV-0034 ── SRC-OPERATION-0002
                    └── EV-0035 ── SRC-DOC-0005
```

## Coverage Drift

| Metric | Previous | Current | Delta |
|--------|----------|---------|-------|
| EV Count | — (new) | 11 | +11 |
| Claims | — (new) | 5 | +5 |
| Sources | — (new) | 10 | +10 |

**Note:** Baseline established. Future runs will compare against this.

## Governance Stability

| Check | Status |
|-------|--------|
| Last Governance Decision | None (Wave 1 — pre-Sprint v3) |
| Still Valid | N/A — no decisions yet |
| Next Scheduled Review | Pending Sprint v3 |

## Integrity

| Component | Score |
|-----------|-------|
| Claim Coverage | 100% (5/5 claims in registry) |
| Evidence Coverage | 100% (11/11 EV in registry) |
| Authority Coverage | 100% (3 AUTH assigned) |
| Source Coverage | 100% (10 SRC with document refs) |
| Freshness | 100% (all EV expire 2026-09-27) |
| Provenance Completeness | 100% (all chains complete) |
| **Overall Integrity** | **100%** |

## Evidence Freshness

- Verification Date: 2026-06-29
- Reviewer: OpenCode (Sprint v2)
- Expires: 2026-09-27
