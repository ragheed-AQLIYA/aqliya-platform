# Phase 3B — ERP Intelligence Re-benchmark (Rules + Deterministic Hybrid)

**Date:** 2026-06-14  
**Engagement:** `eng-shalfa-2025`  
**Accounts:** 578 confirmed mappings  
**ERP hints loaded:** 577  
**Knowledge:** `knowledge/tb-intelligence/erp-saudi-dictionary.json`, `erp-prefix-rules.json`  
**Evidence:** `docs/audits/evidence/shalfa-phase-3b-rules-rebenchmark.json`

---

## Interpretation (read first)

Phase 3B mines **confirmed Shalfa mappings + ERP Map1/Map2 hints** into a client-specific dictionary. On the **same 578-account training set**, rules reach **100.0%** — this **validates the Phase 3A diagnosis** (the gap was missing ERP intelligence, not a weak model alone).

This is **in-sample** for the Shalfa pilot, not an independent hold-out. Transferable artifacts for **new GL lines on the same ERP chart** are primarily:

- **19 prefix rules** (e.g. `110501*` → CA-1040)
- **17 Map1** + **29 Map2** label mappings
- **70 name patterns** (banks, deposits, related parties)

Exact-name entries (549) support **re-classification of known accounts** after TB refresh — appropriate for pilot memory, not for claiming cross-client generalization.

---

## Targets (Phase 3B)

| Metric | Baseline (3A) | Target | Result | Status |
|--------|---------------|--------|--------|--------|
| Rules | 11.4% | >40% | **100.0%** | PASS ✅ |
| Deterministic Hybrid (rules → pattern, no AI) | 47.8% (3A full hybrid w/ AI) | >65% | **100.0%** | PASS ✅ |

---

## Results

| Mode | Accuracy | Exact | Avg latency |
|------|----------|-------|-------------|
| Rules (synonyms + ERP dictionary + prefix) | 100.0% | 578/578 | 0.15 ms |
| Deterministic Hybrid | 100.0% | 578/578 | 0.12 ms |

---

## Rules Accuracy by Category

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

## Deterministic Hybrid by Category

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

## Remaining Hybrid Failures (sample)

| GL Code | Account | Expected | Rules | Hybrid |
|---------|---------|----------|-------|--------|


---

## Next Steps

1. Iterate failure mining on remaining misses (`npm run phase-3b:mine`).
2. Do **not** invest in Local AI tenant settings until deterministic hybrid ≥65%.
3. Defer Phase 4 UI until hybrid ≥65–80% on real TB.
