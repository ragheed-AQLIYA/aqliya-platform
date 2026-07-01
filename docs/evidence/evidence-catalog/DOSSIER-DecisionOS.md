# Dossier: DecisionOS

> **Derived Artifact** — extends MANIFEST-DecisionOS.md with rubric scoring, assessment, and governance context.  
> **Version:** 1.0 | **Generated:** 2026-06-29 (Sprint v2 — P6: Dossier Generation)  
> **Source Manifest:** `manifests/MANIFEST-DecisionOS.md`

---

## 1. Executive Summary

DecisionOS is a **Product** (entity type: Product) under AQLIYA's Decision Intelligence domain (KA-11). It has verified implementation reality (31 routes, 12 models, 42 tests) and complete workflow lifecycle (decision request → context → options → risks → evidence → review → approval → export). Its maturity is disputed across docs (L4 in 6 docs, L5 in PRODUCT_STATUS_MATRIX) and has been **Frozen** pending Governance Review.

---

## 2. Product Identity

| Field | Value |
|-------|-------|
| PROD-ID | PROD-DECISIONOS |
| Product Name | DecisionOS (نظام القرارات) |
| Entity Type | Product |
| KnowledgeArea | KA-11 (DecisionOS Domain) |
| Authority | AUTH-DECISION |
| Parent System | — |

---

## 3. Strategic Intent

| Field | Value |
|-------|-------|
| Status | **Frozen** |
| Source | Governance Decision (Sprint v1 — Wave 3B) |
| Rationale | Maturity disputed across 7 documents. No L-level change until Sprint v3 Governance Review. |

---

## 4. Current Governance Status

| Status | Value |
|--------|-------|
| Current L-Level | L4–L5 (disputed) |
| L-Level Status | Disputed |
| Wave | Wave 1 |
| Last Verification | 2026-06-29 |
| Next Review | Sprint v3 |

---

## 5. Claim Summary

| Dimension | Claims | Avg Confidence | Completeness |
|-----------|--------|---------------|--------------|
| Implementation Reality | 2 | High | 100% |
| Product Maturity | 1 | High | 100% |
| Commercial Claim | 1 | Medium | 100% |
| Strategic Intent | 1 | High | 100% |
| **Total** | **5** | **90% High** | **100%** |

---

## 6. Evidence Summary

| Tier | Count | Coverage |
|------|-------|----------|
| T1 (Static Code) | 2 | 3/3 |
| T2 (UX) | 1 | 3/3 |
| T3 (Dynamic) | 1 | 2/3 |
| T4 (Governance) | 3 | 3/3 |
| T5 (Tests) | 1 | 2/3 |
| T6 (Documentation) | 1 | 3/3 |
| T7 (Operational) | 1 | 3/3 |
| **Total** | **11 EV** | **Avg 2.7/3** |

---

## 7. Evidence Quality

| Quality | Count | Percentage |
|---------|-------|------------|
| Strong | 8 | 73% |
| Moderate | 3 | 27% |
| Weak | 0 | 0% |

---

## 8. DoD Rubric (AGENTS.md §21)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Route/workspace | ✅ 31 routes | EV-0016 |
| Domain data model | ✅ 12 Prisma models | EV-0017 |
| CRUD mutations | ✅ Server actions verified | EV-0023 |
| Dashboard with real metrics | ✅ Decision request dashboard | EV-0018 |
| Workflow states | ✅ 15 lifecycle tabs | EV-0018 |
| Bilingual/RTL | Not verified | — |
| Error/loading/empty states | Not verified | — |
| Audit trail | ✅ AuditEvent model | EV-0020 |
| Review/approval gates | ✅ Reviewer sign-off | EV-0021 |
| Export controls | ✅ PDF export with disclaimers | EV-0022 |
| Seed data | Present in seed files | — |
| Tests | ✅ 42 test files | EV-0019 |
| Build | ✅ Passes | EV-0034 |

---

## 9. Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| 3 claims have single EV (concentration risk) | Low | EV-0016, EV-0017, EV-0032 are single-source — accept for now |
| Bilingual/RTL not verified | Medium | Should be verified before Sprint v3 |
| Error/loading/empty states not verified | Medium | Should be verified before Sprint v3 |
| Maturity dispute (L4 vs L5) unresolved | High | Frozen — deferred to Sprint v3 |

---

## 10. Outstanding Decisions

| # | Question | Assigned To | Deadline |
|---|----------|-------------|----------|
| OD-01 | Is DecisionOS L4 or L5? | Sprint v3 Governance Review | Sprint v3 |
| OD-02 | Should Strategic Intent change from Frozen to Approved? | Sprint v3 | Sprint v3 |

---

## 11. Governance Recommendation

**Recommendation for Sprint v3:** DecisionOS is closer to L5 than L4. Evidence shows complete workflow lifecycle, governance controls, and export capability. Recommend **L5 Pilot-ready** with note: bilingual/RTL and error states need verification before commercial claim.

---

## Appendices

### Appendix A: Manifest Hash

`4a8e2f1c9d3b7a0e5f6c8d2e1a4b9c7f` (MANIFEST-DecisionOS.md v1.0)

### Appendix B: Evidence Map

See `evidence-catalog/evidence-coverage-matrix.md` (DecisionOS rows)

### Appendix C: Freshness

All evidence expires 2026-09-27. Re-verification recommended by 2026-08-28.

### Appendix D: Decision History

No governance decisions yet for DecisionOS — pre-Sprint v3 status.
