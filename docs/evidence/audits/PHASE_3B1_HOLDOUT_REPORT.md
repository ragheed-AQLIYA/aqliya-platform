# Phase 3B.1 — Hold-Out Validation (ERP Intelligence Generalization)

**Date:** 2026-06-14  
**Engagement:** `eng-shalfa-2025`  
**Split:** 450 train / 128 hold-out  
**Method:** Sorted by GL account code ascending; first 450 = train, next 128 = hold-out  
**Exact-name memory:** **disabled** on hold-out  
**Evidence:** `docs/audits/evidence/phase-3b1-holdout-validation.json`

---

## Question

Does **ERP Intelligence** (prefix + Map1 + Map2 + name patterns) generalize without **549 exact-name Firm Memory entries**?

---

## Success Criterion

| Metric | Target | Result | Status |
|--------|--------|--------|--------|
| Hold-out accuracy (no exact name) | ≥70% | **46.1%** (59/128) | PARTIAL ⚠️ — real ERP signal (~46%), but below 70% moat threshold; exact-name memory still required for production refresh |

**Split note:** Hold-out accounts start at `3202010023` (sorted GL codes). This slice is **86% Revenue** lines — Map2 granularity is the main failure mode here.

Interpretation bands:

- **65–80%** → ERP intelligence generalizes (proceed to Phase 3C Firm Learning Engine)
- **20–30%** → exact-name memory was the primary driver of in-sample 100%

---

## Train Set Artifacts (450 accounts, no exact names)

| Artifact | Count |
|----------|------:|
| Prefix rules (≥95% support) | 15 |
| Map1 → canonical | 14 |
| Map2 → canonical | 25 |
| Name patterns | 63 |
| Exact names mined | 0 (excluded) |

---

## Hold-Out Accuracy by Category

| Category | Total | Correct | Accuracy |
|----------|-------|---------|----------|
| Assets | 1 | 0 | 0.0% |
| Expenses | 13 | 7 | 53.8% |
| Lease | 2 | 0 | 0.0% |
| Liabilities | 2 | 0 | 0.0% |
| Revenue | 110 | 52 | 47.3% |

---

## Match Layer Precision (hold-out)

| Layer | Hits | Correct | Precision |
|-------|-----:|--------:|----------:|
| map2 | 72 | 54 | 75.0% |
| name_pattern | 11 | 0 | 0.0% |
| map1 | 6 | 5 | 83.3% |

---

## Sample Hold-Out Failures (up to 20)

| GL Code | Account | Expected | Predicted | Layer |
|---------|---------|----------|-----------|-------|
| 3203010001 | رواتب | CA-2020 | CA-4010 | map2 |
| 3204010001 | رواتب | CA-2020 | CA-4010 | map2 |
| 3204010002 | اضافى | CA-5020 | CA-4010 | map2 |
| 3204010005 | بدل اجازة | CA-5020 | CA-4010 | map2 |
| 3204010011 | هاتف | CA-4010 | CA-5040 | map2 |
| 3204010014 | جوال | CA-4010 | CA-5040 | map2 |
| 3204010016 | مواد نظافة | CA-4010 | — | none |
| 3204010017 | اعمال صيانة | CA-4010 | CA-5070 | name_pattern |
| 3204010018 | مصروفات سكن | CA-4010 | — | none |
| 3204010019 | ايجارات | CA-4010 | CA-2010 | name_pattern |
| 3204010023 | قطع غيار ومستهلكات | CA-4010 | — | none |
| 3204010024 | قطع غيار مستعاضة | CA-4010 | — | none |
| 3204010025 | مواد اخرى متنوعه | CA-4010 | CA-5070 | name_pattern |
| 3204010028 | مصروفات حكومية - اقامات ورخص | CA-4010 | CA-5070 | name_pattern |
| 3204010031 | مصروفات تأشيرات | CA-4010 | — | none |
| 3204010034 | ادوات ومعدات نظافة | CA-4010 | — | none |
| 3204010035 | ملابس للعاملين | CA-4010 | — | none |
| 3204010037 | قطع واجزاء كهربائية | CA-4010 | — | none |
| 3204010042 | مواد نظافة مستعاضة | CA-4010 | — | none |
| 3204010045 | مصروفات المستودع-مشاريع الصي | CA-4010 | CA-1030 | name_pattern |

---

## Decision

**Do not proceed to Phase 3C yet** — strengthen prefix/Map1/Map2 mining or accept Firm Memory as primary path for known ERP charts.

**Still deferred:** Fine-tuning, RAG, embeddings, Knowledge Graph, larger models.

---

## Related

- `docs/audits/PHASE_3B_ERP_INTELLIGENCE_REPORT.md` — in-sample 100% (with exact names)
- `knowledge/tb-intelligence/` — full Shalfa dictionary (production)
