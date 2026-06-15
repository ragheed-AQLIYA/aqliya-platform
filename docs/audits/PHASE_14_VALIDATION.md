# Phase 14 Validation — G&A Map1 Authority Pass

**Date:** 2026-06-14  
**Scope:** Presentation classification only — accounting net profit unchanged  
**Prior:** [`PHASE_13_2_VALIDATION.md`](./PHASE_13_2_VALIDATION.md), [`FACTORY_ACCURACY_AUDITED_FS_V4.md`](./FACTORY_ACCURACY_AUDITED_FS_V4.md)

---

## Objective

Close the Shalfa **G&A / operating expenses** gap (−5.5% vs audited) by honoring **ERP Map1 line labels** over GL prefix heuristics when they conflict.

---

## Root Cause

Eight accounts (total **~1,477,466 SAR**) had Map1 **`General and administrative expenses`** but were classified as **`cost_of_revenue`** because GL codes start with **`32`** or **`33`**.

| GL | Name | Amount (SAR) |
|----|------|-------------:|
| 3202010026-1 | مصروفات متنوعة | 707,119 |
| 3204010038 | منح ومكافأت | 433,201 |
| 3301010011-1 | اهلاك اصول حق الاستخدام | 225,860 |
| 3202010023 | رسوم حكومية | 77,925 |
| 3301010003 | أستهلاك اثاث و ديكور | 16,805 |
| 3202010026 | مصروفات متنوعة | 14,701 |
| 3201020002 | عمولات بنكية | 1,452 |
| 3201010003 | مكافأة نهاية خدمة | 403 |

**Evidence:** [`evidence/p14-ga-mapping-gap.json`](./evidence/p14-ga-mapping-gap.json)

---

## Fix

In `isPresentationCostOfRevenueMapping()`:

```text
Map1 = "General and administrative expenses" → NOT cost of revenue
(before 32xx/33xx prefix fallback)
```

Map1 **`Cost of revenue`** still wins for explicit CoR accounts.

---

## Results (Shalfa pilot policy)

| Line | Before Phase 14 | After Phase 14 | Audited | After variance |
|------|----------------:|---------------:|--------:|---------------:|
| Operating expenses | 25,160,098 | **26,637,563** | 26,627,726 | **+0.04%** ✅ |
| Cost of revenue | 384,995,489 | 383,760,688 | 384,959,315 | −0.31% ✅ |
| Gross profit | 65,309,703 | 66,544,504 | 66,453,191 | +0.14% ✅ |
| Operating profit | 40,149,605 | 39,906,940 | 39,825,465 | +0.20% ✅ |
| Net profit | 25,084,856 | 25,084,856 | 25,084,852 | ±0.000016% ✅ |
| **Factory Accuracy composite** | **83** | **87** | target >85 | **✅ PASS** |

Generic client (Gulf Trading): **87** — unchanged.

---

## Validation

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass |
| `npm test -- income-statement-presentation.test.ts` | **7 passed** |
| `node ... scripts/p14-ga-mapping-gap.mjs` | misclassified = **0** |
| `node ... scripts/p13-2-validation.mjs` | Shalfa composite **87**, `shalfaPass: true` |

---

## Files Changed

- `src/lib/audit/db/income-statement-presentation.ts` — Map1 G&A overrides 32/33 prefix
- `src/lib/audit/db/__tests__/income-statement-presentation.test.ts` — Phase 14 regression test
- `scripts/p14-ga-mapping-gap.mjs` — gap analysis script

---

## Known Limitations

- Residual G&A gap **~9,837 SAR** (0.04%) — movement vs closing basis on Map1 G&A bucket.
- CoR variance shifted from +0.009% to −0.31% (still within line tolerance; gross profit improved).
- Remaining PBT display gap reduced but not fully eliminated.

**Verdict:** Phase 14 **complete**. Factory Accuracy **87** restored on Shalfa with all major IS presentation lines aligned.

---

## Next Steps

| Priority | Item |
|----------|------|
| 1 | Policy CRUD — org-specific presentation policies |
| 2 | Shalfa pilot rollout — engagement + migrate + TB upload |
| 3 | CoR fine-tune (−0.31%) if sub-0.1% required |
| 4 | Western COA / non-Saudi GL prefix support |
