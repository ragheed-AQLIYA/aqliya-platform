# Evidence Manifest: LocalContentOS

> **Derived Artifact** — auto-generated from Claims. Per Derived Artifacts Rule: do NOT manually edit.  
> **Version:** 1.0 | **Hash:** 7b9f3a2e5d1c8b6f4a0e9d7c2b5f1a3e  
> **Generated:** 2026-06-29 (Sprint v2 — P5: Manifest Generation)

---

## Product Information

| Field | Value |
|-------|-------|
| PROD-ID | PROD-LOCALCONTENT |
| Product Name | LocalContentOS (نظام المحتوى المحلي) |
| Entity Type | Product |
| KnowledgeArea | KA-12 |
| Authority | AUTH-LOCALCONTENT |
| Current L-Level | L4–L5 |
| L-Level Status | Disputed |
| Strategic Intent | Frozen |

---

## Aggregated Claims

| CLM-ID | Version | Type | Dimension | Confidence | Evidence |
|--------|---------|------|-----------|------------|----------|
| CLM-LOCALCONTENT-0001 | 1.0 | Implementation | Implementation Reality | High | EV-0024 |
| CLM-LOCALCONTENT-0002 | 1.0 | Implementation | Implementation Reality | High | EV-0025 |
| CLM-LOCALCONTENT-0003 | 1.0 | Product | Product Maturity | Medium | EV-0026, EV-0027, EV-0028, EV-0029, EV-0030, EV-0031, EV-0034, EV-0036, EV-0037 |
| CLM-LOCALCONTENT-0004 | 1.0 | Product | Product Maturity | Medium | EV-0033 |
| CLM-LOCALCONTENT-0005 | 1.0 | Strategic | Strategic Intent | High | EV-0034, EV-0035 |

**Total Claims: 5** | Avg Completeness: 100% | Avg Confidence: 80% High (4 High, 1 Medium)

---

## Evidence Coverage (T1–T7)

| Tier | Evidence ID | Score | Quality |
|------|-------------|-------|---------|
| T1 (Static Code) | EV-0024, EV-0025, EV-0026 | 3/3 | Strong |
| T2 (UX) | EV-0027, EV-0031 | 2/3 | Moderate |
| T3 (Dynamic) | EV-0036 | 2/3 | Moderate |
| T4 (Governance) | EV-0028, EV-0029, EV-0030 | 3/3 | Strong |
| T5 (Tests) | EV-0037 | 2/3 | Moderate |
| T6 (Documentation) | EV-0033 | 3/3 | Strong |
| T7 (Operational) | EV-0034 | 3/3 | Strong |

| Metric | Value |
|--------|-------|
| Avg Tier Score | 2.6/3 |
| Strong EV % | 60% |
| Quality Index | 46.8% |

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
CLM-LOCALCONTENT-0001 ── EV-0024 ── SRC-CODE-0012
CLM-LOCALCONTENT-0002 ── EV-0025 ── SRC-SCHEMA-0005
CLM-LOCALCONTENT-0003 ──┬── EV-0026 ── SRC-CODE-0013
                        ├── EV-0027 ── SRC-CODE-0014
                        ├── EV-0028 ── SRC-CODE-0015
                        ├── EV-0029 ── SRC-CODE-0016
                        ├── EV-0030 ── SRC-CODE-0017
                        ├── EV-0031 ── SRC-CODE-0018
                        ├── EV-0034 ── SRC-OPERATION-0002
                        ├── EV-0036 ── SRC-TEST-0006
                        └── EV-0037 ── SRC-TEST-0007
CLM-LOCALCONTENT-0004 ── EV-0033 ── SRC-DOC-0004
CLM-LOCALCONTENT-0005 ──┬── EV-0034 ── SRC-OPERATION-0002
                        └── EV-0035 ── SRC-DOC-0005
```

## Coverage Drift

| Metric | Previous | Current | Delta |
|--------|----------|---------|-------|
| EV Count | 11 (pre-P4) | 13 | **+2** |
| Claims | 5 | 5 | 0 |
| Sources | 8 (pre-P4) | 12 | **+4** |

**Note:** +2 EV and +4 SRC from P4 gap resolution (G01, G02). All gaps closed.

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
| Evidence Coverage | 100% (13/13 EV in registry) |
| Authority Coverage | 100% (3 AUTH assigned) |
| Source Coverage | 100% (12 SRC with document refs) |
| Freshness | 100% (all EV expire 2026-09-27) |
| Provenance Completeness | 100% (all chains complete) |
| **Overall Integrity** | **100%** |

## Evidence Freshness

- Verification Date: 2026-06-29
- Reviewer: OpenCode (Sprint v2)
- Expires: 2026-09-27
