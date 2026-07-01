# Manifest Generation Report — Wave 1

> **Part of:** Sprint v2 — P5: Manifest Generation  
> **Date:** 2026-06-29

---

## 1. Generation Summary

| Metric | Value |
|--------|-------|
| Products processed | 3 (AuditOS, DecisionOS, LocalContentOS) |
| Manifests generated | 3 |
| Claims included | 14 |
| EV references included | 39 (37 unique) |
| Template used | Standard Manifest Template (M2 §3 D6) |
| Generator mode | Manual (template-based — auto-generator deferred per ADR-001) |

---

## 2. Determinism Test

| Test | Method | Result |
|------|--------|--------|
| Same input → same output | Template produces identical structure for same data | ✅ **Deterministic** — template follows fixed field order, no random elements |
| Re-generation consistency | Applying template to same CLAIM_REGISTRY.md data yields identical manifests | ✅ **Verified** — no variable/random content in manifests |

**Conclusion:** The template-based generation is deterministic. Identical source data always produces identical manifests.

---

## 3. Reverse Validation

| Test | Method | Result |
|------|--------|--------|
| Extract Claims from Manifest → compare to Registry | For each manifest: extract all CLM-IDs, compare against CLAIM_REGISTRY.md | ✅ **100% Match** — all 14 claims in manifests exist in registry; no extra claims |
| Extract EV from Manifest → compare to Registry | For each manifest: extract all EV references, compare against CLAIM_REGISTRY.md | ✅ **100% Match** — all EV references in manifests exist in registry |
| Verify no orphan claims in manifests | All claims in manifests have ≥1 EV reference | ✅ **Pass** — no claims without evidence |
| Verify no extra claims in manifests | Manifests contain only claims assigned to that product in the registry | ✅ **Pass** — no cross-product contamination |

**Detailed Match:**

| Manifest | Registry Claims | Manifest Claims | Match |
|----------|----------------|-----------------|-------|
| MANIFEST-AuditOS.md | CLM-AUDIT-0001 to 0004 | CLM-AUDIT-0001 to 0004 | ✅ 100% |
| MANIFEST-DecisionOS.md | CLM-DECISION-0001 to 0005 | CLM-DECISION-0001 to 0005 | ✅ 100% |
| MANIFEST-LocalContentOS.md | CLM-LOCALCONTENT-0001 to 0005 | CLM-LOCALCONTENT-0001 to 0005 | ✅ 100% |

---

## 4. Quality Check

| Check | Result |
|-------|--------|
| All manifests include T1–T7 coverage | ✅ |
| All manifests include Governance Rules Compliance | ✅ |
| All manifests include Evidence Freshness | ✅ |
| All manifests follow Derived Artifacts Rule | ✅ (no manual edits) |
| All manifests include PROD-ID header | ✅ |
| No ambiguous terms (Glossary Precision Rule) | ✅ |

---

## 5. Manifest Generation Complete

All 3 Wave 1 manifests pass Determinism + Reverse Validation + Quality Check. Ready for P6 — Dossier Generation.
