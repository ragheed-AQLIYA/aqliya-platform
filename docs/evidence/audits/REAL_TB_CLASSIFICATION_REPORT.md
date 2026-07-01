# Real TB Classification Report — Shalfa Phase 3A

**Date:** 2026-06-21  
**Engagement:** `eng-shalfa-2025`  
**Accounts evaluated:** 578 (confirmed mappings = ground truth)  
**Model:** Ollama `qwen3:8b`  
**Evidence:** `docs/audits/evidence/shalfa-real-tb-classification.json`

---

## Success Criterion

**Hybrid accuracy > Rules accuracy on real Shalfa TB:** **FAIL ❌**

| Mode | Exact accuracy |
|------|----------------|
| Rules only | **100.0%** (578/578) |
| Local AI only | **8.7%** (50/578) |
| Hybrid (rules → pattern → local) | **100.0%** (578/578) |

---

## Overall Metrics

| Mode | Accuracy | Avg confidence | Avg latency | p95 latency | Total wall time |
|------|----------|----------------|-------------|-------------|-----------------|
| Rules | 100.0% | 0.88 | 1.07 ms | 0 ms | 0.6 s |
| Local AI | 8.7% | 0.85 | 9367 ms | 43626 ms | 90.2 min |
| Hybrid | 100.0% | 0.88 | 0 ms | 1 ms | 0.0 min |

---

## Accuracy by Category — Rules

| Category | Total | Correct | Accuracy |
|----------|-------|---------|----------|
| Assets | 160 | 160 | 100.0% |
| Cash | 16 | 16 | 100.0% |
| Equity | 6 | 6 | 100.0% |
| Expenses | 94 | 94 | 100.0% |
| Lease | 5 | 5 | 100.0% |
| Liabilities | 170 | 170 | 100.0% |
| Revenue | 121 | 121 | 100.0% |
| Zakat | 6 | 6 | 100.0% |

---

## Accuracy by Category — Local AI

| Category | Total | Correct | Accuracy |
|----------|-------|---------|----------|
| Assets | 160 | 31 | 19.4% |
| Cash | 16 | 13 | 81.3% |
| Equity | 6 | 0 | 0.0% |
| Expenses | 94 | 0 | 0.0% |
| Lease | 5 | 0 | 0.0% |
| Liabilities | 170 | 5 | 2.9% |
| Revenue | 121 | 0 | 0.0% |
| Zakat | 6 | 1 | 16.7% |

---

## Accuracy by Category — Hybrid

| Category | Total | Correct | Accuracy |
|----------|-------|---------|----------|
| Assets | 160 | 160 | 100.0% |
| Cash | 16 | 16 | 100.0% |
| Equity | 6 | 6 | 100.0% |
| Expenses | 94 | 94 | 100.0% |
| Lease | 5 | 5 | 100.0% |
| Liabilities | 170 | 170 | 100.0% |
| Revenue | 121 | 121 | 100.0% |
| Zakat | 6 | 6 | 100.0% |

---

## Top Failures (Hybrid incorrect — up to 25)

| GL Code | Account Name | Expected | Rules | AI | Hybrid | Why rules failed | Why AI failed |
|---------|--------------|----------|-------|-----|--------|------------------|---------------|


---

## Recommendations

1. **Deploy hybrid in production TB assist** — rules first for speed; local AI only on miss (ADR-001 Step 4).
2. **Human review** remains mandatory for all AI-suggested mappings.
3. **Expand synonyms** for Shalfa-specific GL naming patterns surfaced in top failures.
4. **Batch queue** required for 578-line re-classification (~90 min local-only wall time).

---

## Related

- `docs/audits/TB_CLASSIFICATION_REBENCHMARK.md` — synthetic 100-account benchmark
- `docs/audits/SHALFA_PILOT_SIGNOFF.md` — Factory Accuracy 94
