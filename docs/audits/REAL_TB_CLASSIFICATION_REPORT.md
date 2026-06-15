# Real TB Classification Report — Shalfa Phase 3A

**Date:** 2026-06-14  
**Engagement:** `eng-shalfa-2025`  
**Accounts evaluated:** 578 (confirmed mappings = ground truth)  
**Model:** Ollama `qwen3:8b`  
**Evidence:** `docs/audits/evidence/shalfa-real-tb-classification.json`

---

## Success Criterion

**Hybrid accuracy > Rules accuracy on real Shalfa TB:** **PASS ✅**

| Mode | Exact accuracy |
|------|----------------|
| Rules only | **11.4%** (66/578) |
| Local AI only | **20.4%** (118/578) |
| Hybrid (rules → pattern → local) | **47.8%** (276/578) |

---

## Overall Metrics

| Mode | Accuracy | Avg confidence | Avg latency | p95 latency | Total wall time |
|------|----------|----------------|-------------|-------------|-----------------|
| Rules | 11.4% | 0.88 | 0.14 ms | 0 ms | 0.1 s |
| Local AI | 20.4% | 0.85 | 10623 ms | 18325 ms | 102.3 min |
| Hybrid | 47.8% | 0.87 | 3083 ms | 14108 ms | 29.7 min |

---

## Accuracy by Category — Rules

| Category | Total | Correct | Accuracy |
|----------|-------|---------|----------|
| Assets | 160 | 9 | 5.6% |
| Cash | 16 | 1 | 6.3% |
| Equity | 6 | 4 | 66.7% |
| Expenses | 94 | 27 | 28.7% |
| Lease | 5 | 5 | 100.0% |
| Liabilities | 170 | 11 | 6.5% |
| Revenue | 121 | 3 | 2.5% |
| Zakat | 6 | 6 | 100.0% |

---

## Accuracy by Category — Local AI

| Category | Total | Correct | Accuracy |
|----------|-------|---------|----------|
| Assets | 160 | 40 | 25.0% |
| Cash | 16 | 13 | 81.3% |
| Equity | 6 | 3 | 50.0% |
| Expenses | 94 | 25 | 26.6% |
| Lease | 5 | 2 | 40.0% |
| Liabilities | 170 | 24 | 14.1% |
| Revenue | 121 | 6 | 5.0% |
| Zakat | 6 | 5 | 83.3% |

---

## Accuracy by Category — Hybrid

| Category | Total | Correct | Accuracy |
|----------|-------|---------|----------|
| Assets | 160 | 32 | 20.0% |
| Cash | 16 | 7 | 43.8% |
| Equity | 6 | 5 | 83.3% |
| Expenses | 94 | 83 | 88.3% |
| Lease | 5 | 5 | 100.0% |
| Liabilities | 170 | 17 | 10.0% |
| Revenue | 121 | 121 | 100.0% |
| Zakat | 6 | 6 | 100.0% |

---

## Top Failures (Hybrid incorrect — up to 25)

| GL Code | Account Name | Expected | Rules | AI | Hybrid | Why rules failed | Why AI failed |
|---------|--------------|----------|-------|-----|--------|------------------|---------------|
| 1101020001 | بنك الرياض | CA-1010 | — | CA-1010 | CA-2050 | No synonym/prefix match in COA rules eng | n/a |
| 1101020002 | البنك العربي | CA-1010 | — | CA-1010 | CA-2050 | No synonym/prefix match in COA rules eng | n/a |
| 1101020008 | وديعه بنك الرياض | CA-1010 | — | CA-2040 | CA-2040 | No synonym/prefix match in COA rules eng | Mapped to CA-2040 instead of CA-1010 (Ca |
| 1101020012 | محفظة اسهم العربى 4800298517 | CA-1040 | — | CA-1080 | CA-1080 | No synonym/prefix match in COA rules eng | Mapped to CA-1080 instead of CA-1040 (As |
| 1101020016 | بنك الرياض- الخدمات البيئية والمنزل | CA-1010 | — | CA-1020 | CA-4020 | No synonym/prefix match in COA rules eng | Mapped to CA-1020 instead of CA-1010 (Ca |
| 1101020017 | بنك الجزيرة | CA-1010 | — | CA-1010 | CA-2050 | No synonym/prefix match in COA rules eng | n/a |
| 1101020020 | بنك الراجحي-الحاويات | CA-1010 | — | CA-1010 | CA-1080 | No synonym/prefix match in COA rules eng | n/a |
| 1101020022 | البنك السعودي للاستثمار | CA-1010 | — | CA-1010 | CA-2130 | No synonym/prefix match in COA rules eng | n/a |
| 1101020213 | البنك الاهلي السعودي | CA-1010 | — | CA-1010 | CA-5070 | No synonym/prefix match in COA rules eng | n/a |
| 1103370198 | مبالغ محتجزة-مستشفي قوي الامن-الدما | CA-1040 | — | CA-1080 | CA-1080 | No synonym/prefix match in COA rules eng | Mapped to CA-1080 instead of CA-1040 (As |
| 1103370199 | مبالغ محتجزة-الهيئة الملكية(الدحو) | CA-1040 | — | CA-2035 | CA-2035 | No synonym/prefix match in COA rules eng | Mapped to CA-2035 instead of CA-1040 (As |
| 1103370202 | مبالغ محتجزة قوي الامن الدمام 2 | CA-1040 | — | CA-1080 | CA-1020 | No synonym/prefix match in COA rules eng | Mapped to CA-1080 instead of CA-1040 (As |
| 1103370203 | مبالغ محتجزة-هيئة الزكاة والجمارك | CA-1040 | — | CA-2035 | CA-2035 | No synonym/prefix match in COA rules eng | Mapped to CA-2035 instead of CA-1040 (As |
| 1103720001 | عملا مشروع الحاويات | CA-1020 | — | CA-1030 | CA-1030 | No synonym/prefix match in COA rules eng | Mapped to CA-1030 instead of CA-1020 (As |
| 1104020109 | محمد السيد سالم الغرباوي | CA-1040 | — | CA-3010 | CA-3010 | No synonym/prefix match in COA rules eng | Mapped to CA-3010 instead of CA-1040 (As |
| 1104040124 | سلف للعاملين | CA-1040 | — | CA-5020 | CA-4010 | No synonym/prefix match in COA rules eng | Mapped to CA-5020 instead of CA-1040 (As |
| 1104050367 | حساب سلف العاملين (1) | CA-1040 | — | CA-2020 | CA-1020 | No synonym/prefix match in COA rules eng | Mapped to CA-2020 instead of CA-1040 (As |
| 1104050368 | سلفه/عبد الرحمن السيد-12064 | CA-1040 | — | CA-1020 | CA-3010 | No synonym/prefix match in COA rules eng | Mapped to CA-1020 instead of CA-1040 (As |
| 1104050369 | سلفه/احمد محمد عبد الجواد-10681 | CA-1040 | — | CA-2040 | CA-2040 | No synonym/prefix match in COA rules eng | Mapped to CA-2040 instead of CA-1040 (As |
| 1104050370 | سلفه/نازار محمد-10131 | CA-1040 | — | CA-1020 | CA-2040 | No synonym/prefix match in COA rules eng | Mapped to CA-1020 instead of CA-1040 (As |
| 1104050371 | سلفه/نادر السيد-12667 | CA-1040 | — | CA-1020 | CA-1020 | No synonym/prefix match in COA rules eng | Mapped to CA-1020 instead of CA-1040 (As |
| 110500003 | عهدة عبدالله مرضي فهيد ال ظافر الجم | CA-1040 | — | CA-3030 | CA-3030 | No synonym/prefix match in COA rules eng | Mapped to CA-3030 instead of CA-1040 (As |
| 1105010003 | عهدة/ تاتا عمر سوقى | CA-1040 | — | CA-2020 | CA-1080 | No synonym/prefix match in COA rules eng | Mapped to CA-2020 instead of CA-1040 (As |
| 1105010015 | عهدة / جيفرى منجلوس | CA-1040 | — | CA-1080 | CA-1020 | No synonym/prefix match in COA rules eng | Mapped to CA-1080 instead of CA-1040 (As |
| 1105010020 | عهدة / سداد الرسوم | CA-1040 | — | CA-5070 | CA-2020 | No synonym/prefix match in COA rules eng | Mapped to CA-5070 instead of CA-1040 (As |

---

## Interpretation

| Finding | Detail |
|---------|--------|
| **Success criterion** | Hybrid **47.8%** > Rules **11.4%** ✅ |
| **Real GL naming** | Shalfa uses bank-specific Arabic names (`بنك الرياض`, `وديعه`, `عهدة`) — rules cover only **11.4%** |
| **Local AI alone** | **20.4%** on real TB — better than rules but far below synthetic benchmark (85%) |
| **Hybrid revenue 100%** | Likely driven by **Map1 / TBClassificationHistory pattern** (918 Map1 rows in pilot), not Qwen3 alone |
| **Hybrid expenses 88.3%** | Strong — rules + pattern + local combine well for expense GL codes |
| **Cash failures** | Bank names map to wrong codes in hybrid when rules miss (e.g. `CA-2050` finance cost) |
| **Wall time** | Local-only **102 min**; Hybrid **30 min** (rules short-circuit ~52% of accounts) |

**Honest pilot read:** Hybrid pipeline adds measurable value over rules-only on real Shalfa TB, but **confirmed Map1 history materially boosts hybrid accuracy** — especially revenue. Next step: expand Arabic bank/cash synonyms and measure hybrid **without** pattern history to isolate net AI lift.

---

## Recommendations

1. **Deploy hybrid in production TB assist** — rules first; pattern (Map1) second; local AI on remaining miss (ADR-001 order).
2. **Human review** remains mandatory — 52% of accounts still misclassified in hybrid on real TB.
3. **Expand synonyms** for Saudi bank names, deposits (`وديعه`), petty cash (`عهدة`), retentions (`مبالغ محتجزة`).
4. **Batch queue** — local-only re-classification ~102 min for 578 lines; hybrid ~30 min.
5. **Re-run with `--exclude-pattern`** (future) to isolate pure AI lift vs Map1 history.

---

## Related

- `docs/audits/TB_CLASSIFICATION_REBENCHMARK.md` — synthetic 100-account benchmark
- `docs/audits/SHALFA_PILOT_SIGNOFF.md` — Factory Accuracy 94
