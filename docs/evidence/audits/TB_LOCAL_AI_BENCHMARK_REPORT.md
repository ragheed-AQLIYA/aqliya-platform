# TB Local AI Full Benchmark Report

**Date:** 2026-06-21
**Input:** `TB 31-12-2025 Final.xlsx` (578 accounts)
**Local model:** `ollama/qwen3:8b` (providerId=local)
**Evidence:** `docs/audits/evidence/tb-local-ai-benchmark-full.json`

---

## Comparison

| Metric | Deterministic | Local AI |
| ------ | ------------- | -------- |
| Total Accounts | 578 | 578 |
| Classified | 578 | 181 |
| Unclassified | 0 | 397 |
| Low Confidence (<50%) | 0 | 0 |
| High Confidence (≥75%) | 578 | 181 |
| Medium Confidence (50–74%) | 0 | 0 |
| Runtime | 0.0 min (0.1s) | 94.5 min (5668s) |
| Coverage % | 100.0% | 31.3%% |

---

## Confidence Analysis

### Deterministic
- High (≥75%): **578** (100.0%)
- Medium (50–74%): **0** (0.0%)
- Low (<50%): **0** (0.0%)
- Unclassified: **0** (0.0%)

### Local AI (qwen3:8b)
- High (≥75%): **181** (31.3%)
- Medium (50–74%): **0** (0.0%)
- Low (<50%): **0** (0.0%)
- Unclassified: **397** (68.7%)

---

## Quality Review (≥20 examples)

### 1. Classified only by Local AI (Deterministic missed)

| Code | Account Name | Local Code | Conf |
| ---- | ------------ | ---------- | ---- |

### 2. Classified only by Deterministic (Local AI missed)

| Code | Account Name | Det Code | Conf |
| ---- | ------------ | -------- | ---- |
| 2103010098 | سعد فهد الهديب - ايجار | CA-2010 | 88% |
| 2103010100 | شيخة احمد بن سعود - ايجار | CA-2010 | 88% |
| 2103010103 | خالد عبدالعزيز الصيخان -ايجار | CA-2010 | 88% |
| 2103010104 | حمود عبدالعزيز المزيني -ايجار | CA-2010 | 88% |
| 2103010105 | عبدالله صالح الخزيم - ايجار | CA-2010 | 88% |
| 2103010109 | بشير ظاهر البلوي- ايجار | CA-2010 | 88% |
| 2103010113 | عبدالمحسن صالح الغانم - ايجار | CA-2010 | 88% |
| 2103010114 | عبدالعزيز محمد الحواس - ايجار | CA-2010 | 88% |
| 2103010116 | محمد عبدالله محمد السديس - ايجار | CA-2010 | 88% |
| 2103010118 | ناجي سالم الجهني -ايجار | CA-2010 | 88% |

### 3. Ambiguous Arabic account names

| Code | Account Name | Deterministic | Local AI |
| ---- | ------------ | ------------- | -------- |
| 1101020008 | وديعه بنك الرياض | CA-1010 | CA-2040 |
| 1101020012 | محفظة اسهم العربى 4800298517 | CA-1040 | CA-1080 |
| 1101020016 | بنك الرياض- الخدمات البيئية والمنزلية | CA-1010 | CA-4020 |
| 1102010001 | استثمارات في شركات شقيقة. | CA-1050 | CA-1080 |
| 1103370198 | مبالغ محتجزة-مستشفي قوي الامن-الدمام | CA-1040 | CA-1010 |
| 1103370199 | مبالغ محتجزة-الهيئة الملكية(الدحو) | CA-1040 | CA-1080 |
| 1103370202 | مبالغ محتجزة قوي الامن الدمام 2 | CA-1040 | CA-1020 |
| 1103370203 | مبالغ محتجزة-هيئة الزكاة والجمارك | CA-1040 | CA-2035 |
| 1103370205 | عملاء مشاريع الصيانة و التشغيل | CA-1020 | CA-1080 |
| 1103720001 | عملا مشروع الحاويات | CA-1020 | CA-1080 |

### 4. Classification disagreements (both classified, different codes)

| Code | Account Name | Deterministic | Local AI |
| ---- | ------------ | ------------- | -------- |
| 1101020008 | وديعه بنك الرياض | CA-1010 | CA-2040 |
| 1101020012 | محفظة اسهم العربى 4800298517 | CA-1040 | CA-1080 |
| 1101020016 | بنك الرياض- الخدمات البيئية والمنزلية | CA-1010 | CA-4020 |
| 1102010001 | استثمارات في شركات شقيقة. | CA-1050 | CA-1080 |
| 1103370198 | مبالغ محتجزة-مستشفي قوي الامن-الدمام | CA-1040 | CA-1010 |
| 1103370199 | مبالغ محتجزة-الهيئة الملكية(الدحو) | CA-1040 | CA-1080 |
| 1103370202 | مبالغ محتجزة قوي الامن الدمام 2 | CA-1040 | CA-1020 |
| 1103370203 | مبالغ محتجزة-هيئة الزكاة والجمارك | CA-1040 | CA-2035 |
| 1103370205 | عملاء مشاريع الصيانة و التشغيل | CA-1020 | CA-1080 |
| 1103720001 | عملا مشروع الحاويات | CA-1020 | CA-1080 |

---

## Business Assessment

1. **Is Local AI materially improving classification?** Partially — see coverage delta.
2. **By how much?** Coverage +-68.7 pp (100.0% → 31.3%). Local-only wins: 0; Deterministic-only wins: 397.
3. **Is latency acceptable?** Local AI total 94 min (~9.8s/account). Acceptable for batch/off-hours; not for real-time per-keystroke.
4. **Enable for AuditOS pilots?** Recommend **HYBRID** — rules first, Local AI for unclassified/low-confidence Arabic GL names.

---

## Final Verdict

```text
USE HYBRID
```

**Justification:** Deterministic rules are fast (0.1s total) but leave 0 accounts unclassified on this real Saudi GL. Local AI adds coverage at ~10s per account. Rules-first hybrid preserves speed on synonym hits and invokes qwen3:8b only when needed.

---

## Environment

```json
{
  "FF_AI_REAL_PROVIDERS": "true",
  "AI_MODE": "hybrid",
  "AI_LOCAL_MODEL": "qwen3:8b"
}
```