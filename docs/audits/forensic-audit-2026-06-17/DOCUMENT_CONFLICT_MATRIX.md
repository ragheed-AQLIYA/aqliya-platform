# DOCUMENT CONFLICT MATRIX — AQLIYA Forensic Audit

**Generated:** 2026-06-17  
**Method:** Cross-read of authority docs + code execution evidence from `docs/audits/reality-audit-2026-06-17/`  
**Legend:** VERIFIED = both sides opened; PARTIAL = one side from prior executed audit

---

## Critical Conflicts (Commercial / Release Impact)

| ID | Topic | Document A | Document B / Code | Resolution rule | Status |
|----|-------|------------|-------------------|-------------------|--------|
| DC-01 | **Build health** | PRODUCT_STATUS_MATRIX Phase 7: 0 TS errors, build pass | `build-audit.md`: 9 errors, build FAIL | Code wins | **FALSE claim** |
| DC-02 | **SalesOS maturity** | Master ref §6: L3, no backend | Matrix L19: L5, 27 routes, Prisma | Code wins — backend exists | **Major conflict** |
| DC-03 | **SalesOS in README** | README L46: Prototype dashboard | Matrix: L5 internal | Align to code + matrix | **Conflict** |
| DC-04 | **SSO implemented** | Master ref §9: NOT implemented | Matrix L28: SSO L4; routes exist | Code wins — partial impl | **Stale master ref** |
| DC-05 | **Local AI** | Master ref §9: NOT implemented | Matrix L32: L4; ADR-001 Accepted; smoke PASS | Code wins | **Stale master ref** |
| DC-06 | **CoreAccessControl** | Architecture implies RBAC matrix | `access-control.ts`: always granted | Code wins — stub | **FALSE enforcement** |
| DC-07 | **RiskOS** | Matrix L24: L0 not implemented | `/risk/*` routes + models | Code wins — submodule exists | **Under-documented** |

---

## Maturity Label Conflicts

| ID | Product | Doc A | Doc B | Evidence |
|----|---------|-------|-------|----------|
| DC-08 | LocalContentOS | Master L5 | Matrix L4 | Both opened; feature-rich code |
| DC-09 | LocalContent routes | Master: 12 routes | Architecture: 20+ routes | Inventory: 26 pages |
| DC-10 | AuditOS | Consistent L5 | — | VERIFIED aligned |

---

## Internal Architecture Doc Contradictions

| ID | Topic | Location A | Location B |
|----|-------|------------|------------|
| DC-11 | LocalContactOS | `AQLIYA_ARCHITECTURE.md` L75: future/not implemented | Same file L129: `/contacts` active |
| DC-12 | Intelligence Core | Architecture lists Model Governance + Institutional Memory | Master ref §9: NOT implemented |
| DC-13 | SalesOS label | Architecture L44: prototype/dashboard | Matrix: L5 criteria met |

---

## Validation Metric Conflicts

| ID | Metric | Source A | Source B | Source C |
|----|--------|----------|----------|----------|
| DC-14 | Test suites | Master §16: 27 | Matrix note: 138 | test-reality: 272 |
| DC-15 | Test count | Master §16: 213 | Matrix: 1069 | test-reality: 2515 |
| DC-16 | ESLint | Matrix Phase 7: 0 warnings | build-audit: 33,662 problems | Scope differs |

---

## Hierarchy / Governance Conflicts

| ID | Topic | Claim | Reality |
|----|-------|-------|---------|
| DC-17 | `docs/reports/` authority | DOCUMENTATION_AUTHORITY Level 6 | **0 files** in directory |
| DC-18 | Theoretical docs | Background only per authority | 352 files — risk of mis-citation |
| DC-19 | Archive docs | Historical only | 227 files — must not drive status |

---

## Domain / Brand Conflicts

| ID | Topic | Doc A | Doc B | Status |
|----|-------|-------|-------|--------|
| DC-20 | Production domain | Some terraform/README: aqliya.ai | Master ref: aqliya.com | **PARTIALLY VERIFIED** migration |
| DC-21 | Local AI in AI README | `src/lib/ai/README.md`: not implemented | Smoke PASS | Doc stale (documentation-truth-matrix) |

---

## Product Claim vs Code (from documentation-truth-matrix — opened)

| Claim | Status |
|-------|--------|
| Air-gapped local AI package | MISSING |
| SAML SSO from admin UI | STUB |
| Virus scanning | STUB |
| Production L6 anything | FALSE |
| pgvector RAG | VERIFIED (gated) |
| SCIM API | VERIFIED (single-org limit) |
| MFA | PARTIAL (JWT gap) |

---

## Superseded Documents (Candidates)

| Document | Superseded by | Evidence |
|----------|---------------|----------|
| Master ref §16 validation | 2026-06-17 build/test audits | Date + execution |
| Phase 7 matrix build claims | `build-audit.md` | Execution |
| Prior EXECUTIVE_SUMMARY in `docs/audits/` | This forensic package | Date |

**NOT VERIFIED:** Line-by-line review of all 1,735 markdown files.

---

## Recommended Single Source of Truth Updates

1. **`PRODUCT_STATUS_MATRIX.md`** — Add build status row (2026-06-17 FAIL)
2. **`AQLIYA_MASTER_REFERENCE.md`** — Refresh §6, §9, §16
3. **`README.md`** — SalesOS, build badge honesty
4. **`AQLIYA_ARCHITECTURE.md`** — Fix LocalContactOS contradiction
5. **Create `docs/reports/`** or amend DOCUMENTATION_AUTHORITY Level 6
