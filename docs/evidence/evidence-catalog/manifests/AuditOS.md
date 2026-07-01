# Evidence Manifest: AuditOS

> **Derived Artifact** — auto-generated from Claims. Per Derived Artifacts Rule: do NOT manually edit.
> **Generated:** 2026-06-29 (Phase B — Population Bootstrap)

## Aggregated Claims

| CLM-ID | Dimension | Confidence | Evidence |
|--------|-----------|------------|----------|
| CLM-AUDIT-0001 | Implementation Reality | High | EV-0001, EV-0002, EV-0003, EV-0006, EV-0010, EV-0012 |
| CLM-AUDIT-0002 | Product Maturity | High | EV-0004, EV-0005, EV-0007, EV-0008, EV-0009, EV-0013, EV-0014 |
| CLM-AUDIT-0003 | Commercial Claim | High | EV-0011, EV-0015 |
| CLM-AUDIT-0004 | Strategic Intent | High | EV-0012 |

## Evidence Coverage (T1–T7)

| Tier | Evidence ID | Score |
|------|-------------|-------|
| T1 (Static Code) | EV-0001, EV-0002, EV-0003 | 3/3 |
| T2 (UX) | EV-0004, EV-0005, EV-0013 | 3/3 |
| T3 (Dynamic) | EV-0006, EV-0014 | 2/3 |
| T4 (Governance) | EV-0007, EV-0008, EV-0009 | 3/3 |
| T5 (Tests) | EV-0010 | 2/3 |
| T6 (Documentation) | EV-0011, EV-0015 | 3/3 |
| T7 (Operational) | EV-0012 | 3/3 |

## Governance Rules Compliance

| Rule | Status |
|------|--------|
| Immutable IDs | ✅ All CLM/EV/SRC/AUTH IDs follow approved patterns |
| Derived Artifacts | ✅ This manifest is auto-generated from claims |
| Evidence Manifest | ✅ Manifest exists (this document) |
| Glossary Precision | ✅ No ambiguous terms used |
| Three-tier Review | ⏳ Pending Sprint v3 |

## Dependency Graph

```text
CLM-AUDIT-0001 ──┬── EV-0001 ── SRC-CODE-0001
                 ├── EV-0002 ── SRC-SCHEMA-0001
                 ├── EV-0003 ── SRC-CODE-0002
                 ├── EV-0006 ── SRC-TEST-0001
                 ├── EV-0010 ── SRC-TEST-0002
                 └── EV-0012 ── SRC-OPERATION-0001
CLM-AUDIT-0002 ──┬── EV-0004 ── SRC-CODE-0003
                 ├── EV-0005 ── SRC-CODE-0004
                 ├── EV-0007 ── SRC-SCHEMA-0002
                 ├── EV-0008 ── SRC-CODE-0005
                 ├── EV-0009 ── SRC-CODE-0006
                 ├── EV-0013 ── SRC-CODE-0007
                 └── EV-0014 ── SRC-TEST-0003
CLM-AUDIT-0003 ──┬── EV-0011 ── SRC-DOC-0001
                 └── EV-0015 ── SRC-DOC-0002
CLM-AUDIT-0004 ── EV-0012 ── SRC-OPERATION-0001
```

## Coverage Drift

| Metric | Previous (Phase B) | Current (P5) | Delta |
|--------|-------------------|--------------|-------|
| EV Count | 15 | 15 | 0 |
| Claims | 4 | 4 | 0 |
| Sources | 12 | 12 | 0 |

**Note:** No drift — AuditOS has been stable since Phase B seed.

## Governance Stability

| Check | Status |
|-------|--------|
| Last Governance Decision | None (pre-Sprint v3) |
| Still Valid | N/A |
| Next Scheduled Review | Pending Sprint v3 |

## Integrity

| Component | Score |
|-----------|-------|
| Claim Coverage | 100% (4/4 claims in registry) |
| Evidence Coverage | 100% (15/15 EV in registry) |
| Authority Coverage | 100% (4 AUTH assigned) |
| Source Coverage | 100% (12 SRC with document refs) |
| Freshness | 100% (all EV expire 2026-09-27) |
| Provenance Completeness | 100% (all chains complete) |
| **Overall Integrity** | **100%** |

## Evidence Freshness

- Verification Date: 2026-06-29
- Reviewer: OpenCode (Sprint v2 — P5 update)
- Expires: 2026-09-27
