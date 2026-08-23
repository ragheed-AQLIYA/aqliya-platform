# LCGPA Open Items — Human-Required Actions

**Date:** 2026-08-23
**Status:** ACTIVE
**Author:** OpenCode Agent

---

## Executive Summary

The LCGPA Regulatory Intelligence Engine is complete and tested (724/724 tests pass). Three items require human input before activation. This document tracks each item, its impact, and the recommended resolution.

---

## 1. Effective Date [BLOCKING]

### Description

The official LCGPA workbooks (July 2026) do not contain a dataset-level effective date. Each product has a per-product `تاريخ التطبيق` (commencement date), but no overall date exists.

The activation sweep refuses datasets without an effective date (`EFFECTIVE_DATE_UNKNOWN`).

### Impact

- Datasets remain in `PUBLISHED` status (inactive)
- No regulatory calculations can be bound to a version
- The activation sweep cannot run

### Evidence

```
Product commence dates from minimum-LC schedule:
- 2026-08-01: 2 products (ceramic + porcelain tiles, 23%)
- 2027-08-01: 231 products
- 2028-06-01: 965 products
```

### Recommended Resolution

**Option A (Conservative):** Use `2026-08-01` as the effective date. This is the earliest commencement date and matches SPA N2514218 announcement timing. Datasets will be active from this date.

**Option B (Official):** Contact LCGPA to request the official effective date for the July 2026 dataset publication.

**Option C (Deferred):** Leave datasets as `PUBLISHED` (not active) until an official date is available. The engine will continue to function for calculations with `PENDING_REVIEW` status.

### Decision Required

- [ ] Select Option A, B, or C
- [ ] If Option A: Confirm `2026-08-01` is acceptable
- [ ] If Option B: Draft inquiry to LCGPA

---

## 2. Regulatory Conflict — 6 Product Codes [BLOCKING]

### Description

Six product codes appear in the Minimum-LC schedule (with published minimum local content percentages) but are ABSENT from the July 2026 Mandatory List:

| Code | Product (Arabic) | Min-LC% | Mandatory List |
|------|-----------------|---------|----------------|
| 2802 | هيدروكربونات مائية (أساسية) | Published | ABSENT |
| 2804 | هيدروكربونات أسية (أخرى) | Published | ABSENT |
| 2805 | هيدروكربونات أليفة | Published | ABSENT |
| 2808 | حمض النتريك | Published | ABSENT |
| 2809 | ثاني فوسفور / أرباع فوسفور | Published | ABSENT |
| 2814 | أمونيا | Published | ABSENT |

These are two TIER 1 official artifacts from the same month (July 2026) that disagree.

### Impact

- Engine records these as `PENDING_HUMAN_REVIEW` conflicts
- Affected products cannot be classified in mandatory-list-dependent calculations
- Six products with known minimum-LC% values cannot be enforced

### Evidence

```json
{
  "conflictType": "ARTIFACT_MISMATCH",
  "artifacts": [
    "LCGPA_MANDATORY_LIST_GOV_sha-93f3e1f4533d",
    "LCGPA_MINIMUM_LC_SCHEDULE_sha-acec645190334"
  ],
  "affectedProducts": ["2802", "2804", "2805", "2808", "2809", "2814"],
  "status": "PENDING_HUMAN_REVIEW"
}
```

### Recommended Resolution

**Option A (Ask LCGPA):** Contact LCGPA to clarify which artifact governs. These are hydrocarbon/petrochemical products — the discrepancy may be intentional (different regulatory phases).

**Option B (Mandatory List Governs):** If the Mandatory List is authoritative, these products are not mandatory. The minimum-LC schedule entries may be forward-looking or erroneously included.

**Option C (Leave as Conflict):** Maintain `PENDING_HUMAN_REVIEW` status indefinitely. The engine correctly handles this — it simply does not classify these six products in mandatory-list-dependent calculations.

### Decision Required

- [ ] Select Option A, B, or C
- [ ] If Option A: Draft inquiry to LCGPA
- [ ] If Option B: Run `resolveConflict` with `resolution: MANDATORY_LIST_GOVERNS`
- [ ] Document the decision in the regulatory log

---

## 3. First Activation [AFTER #1 AND #2]

### Description

The `lc:regulatory:ingest --commit` script is ready to run. It will:

1. Parse official artifacts (verified SHA-256)
2. Ingest 1,727 mandatory products + 1,198 minimum-LC products
3. Persist to `LcRegulatory*` tables
4. Record provenance chain
5. Detect conflicts
6. Set status to `PENDING_REVIEW`

### Prerequisites

- [ ] Effective date decided (Item #1)
- [ ] Conflict resolution decided (Item #2)
- [ ] User approval to run `--commit`

### Command

```bash
npm run lc:regulatory:ingest --commit
```

### Rollback

```sql
DELETE FROM "LcRegulatoryChangeEvent";
DELETE FROM "LcRegulatoryChange";
DELETE FROM "LcRegulatoryConflict";
DELETE FROM "LcRegulatoryAlert";
DELETE FROM "LcRegulatoryCase";
DELETE FROM "LcRegulatoryProduct";
DELETE FROM "LcRegulatoryDataset";
DELETE FROM "LcRegulatoryArtifact";
DELETE FROM "LcRegulatoryCheck";
DELETE FROM "LcRegulatorySource";
```

---

## 4. Activation Sweep [AFTER #3]

### Description

The `lc:regulatory:activate` script activates datasets that have been human-approved and have reached their effective date.

### Prerequisites

- [ ] Datasets ingested (Item #3)
- [ ] Effective date set (Item #1)
- [ ] Human approval recorded in governance case

### Command

```bash
npm run lc:regulatory:activate --commit
```

---

## 5. Non-Blocking Items

| # | Item | Priority | Impact |
|---|------|----------|--------|
| 5.1 | GitHub Actions workflow activation | P2 | Automated daily checks — not blocking |
| 5.2 | Discovery fetcher (headless browser) | P3 | Detects new documents — not blocking |
| 5.3 | Gradual Plan UI | P2 | Workflow UI — engine logic works without UI |
| 5.4 | Browser smoke test | P2 | Validation — scripts can validate without browser |

---

## Timeline

| Phase | Depends On | Estimated Time |
|-------|-----------|---------------|
| 1. Effective Date | Human decision | 5 minutes |
| 2. Conflict Resolution | Human decision | 5 minutes |
| 3. First Activation | Items 1 + 2 | 10 minutes |
| 4. Activation Sweep | Item 3 | 5 minutes |
| 5. Non-blocking items | Items 3 + 4 | 1-2 hours |

**Total time to full activation: ~30 minutes (after human decisions)**

---

## Contact Template

If Option A (Ask LCGPA) is selected for either item, here is a draft inquiry:

```
Subject: LCGPA July 2026 Dataset — Clarification Request

Dear LCGPA Team,

We are implementing the LCGPA regulatory framework in our institutional
intelligence platform (AQLIYA). We have ingested the July 2026 published
datasets and require clarification on two points:

1. Effective Date: The July 2026 workbooks do not contain a dataset-level
   effective date. What is the official effective date for regulatory
   calculations based on these datasets?

2. Product Code Discrepancy: Six product codes (2802, 2804, 2805, 2808,
   2809, 2814) appear in the Minimum-LC schedule but are absent from the
   Mandatory List. Which artifact governs for these products?

Thank you for your guidance.

Best regards,
[Your Name]
[Organization]
```

---

*This document is auto-generated by the LCGPA implementation. Update as decisions are made.*
