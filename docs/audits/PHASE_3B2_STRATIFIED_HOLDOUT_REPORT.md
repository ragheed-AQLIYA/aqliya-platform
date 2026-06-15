# Phase 3B.2 + 3B.3 — Stratified Hold-Out & Map2 Refinement

**Date:** 2026-06-14  
**Engagement:** `eng-shalfa-2025`  
**Split:** 80% train / 20% test **within each category** (deterministic, sorted GL code)  
**Exact-name memory:** disabled on all test rows  
**Evidence:** `docs/audits/evidence/phase-3b2-stratified-holdout.json`

---

## Stratified Split Composition

| Category | Total | Train (80%) | Test (20%) |
|----------|------:|------------:|-----------:|
| Assets | 160 | 128 | 32 |
| Cash | 16 | 13 | 3 |
| Equity | 6 | 5 | 1 |
| Expenses | 94 | 75 | 19 |
| Lease | 5 | 4 | 1 |
| Liabilities | 170 | 136 | 34 |
| Revenue | 121 | 97 | 24 |
| Zakat | 6 | 5 | 1 |

**Test total:** 115 accounts across all categories (includes Assets, Liabilities, Cash — not Revenue-only).

---

## Phase 3B.2 — Baseline (coarse Map2)

| Metric | Target | Result | Status |
|--------|--------|--------|--------|
| Stratified hold-out | ≥65% | **36.5%** (42/115) | BELOW TARGET ⚠️ |

### By Category — Baseline

| Category | Test | Correct | Accuracy |
|----------|-----:|--------:|---------:|
| Assets | 32 | 15 | 46.9% |
| Cash | 3 | 2 | 66.7% |
| Equity | 1 | 0 | 0.0% |
| Expenses | 19 | 4 | 21.1% |
| Lease | 1 | 0 | 0.0% |
| Liabilities | 34 | 8 | 23.5% |
| Revenue | 24 | 13 | 54.2% |
| Zakat | 1 | 0 | 0.0% |

### Layer Precision — Baseline

| Layer | Hits | Correct | Precision |
|-------|-----:|--------:|----------:|
| prefix | 40 | 8 | 20.0% |
| map1 | 38 | 32 | 84.2% |
| name_pattern | 14 | 0 | 0.0% |
| map2 | 2 | 2 | 100.0% |

---

## Phase 3B.3 — Map2 Refinement

Refined Map2 assets mined from train:

| Asset | Count |
|-------|------:|
| Map2 global (unambiguous ≥95%) | 36 |
| Map2 composite (Map2+name / Map1+Map2+name) | 46 |
| Ambiguous Map2 labels (composite-only) | 5 |

| Metric | Target | Result | Delta vs baseline |
|--------|--------|--------|-------------------|
| Stratified hold-out (refined Map2) | ≥65% | **35.7%** (41/115) | -0.9 pp |

**Status:** NOT YET — Map2/generalization still below moat threshold

### By Category — After Map2 Refinement

| Category | Test | Correct | Accuracy |
|----------|-----:|--------:|---------:|
| Assets | 32 | 15 | 46.9% |
| Cash | 3 | 2 | 66.7% |
| Equity | 1 | 0 | 0.0% |
| Expenses | 19 | 4 | 21.1% |
| Lease | 1 | 0 | 0.0% |
| Liabilities | 34 | 7 | 20.6% |
| Revenue | 24 | 13 | 54.2% |
| Zakat | 1 | 0 | 0.0% |

### Layer Precision — After Map2 Refinement

| Layer | Hits | Correct | Precision |
|-------|-----:|--------:|----------:|
| prefix | 40 | 8 | 20.0% |
| map1 | 38 | 32 | 84.2% |
| name_pattern | 14 | 0 | 0.0% |
| map2_global | 1 | 1 | 100.0% |

---

## Map2 Error Analysis (baseline failures, layer=map2)

| Map2 Label | Account Name | Expected Cat | Predicted Cat | Expected | Predicted |
|------------|--------------|--------------|---------------|----------|-----------|
| — | — | — | — | — | — |

---

## Decision

**Phase 3C deferred** — measure generalization first; Firm Memory is proven separately (100% in-sample) but not the question here.

**Deferred:** Phase 4 UI, Local AI tenant settings, fine-tuning, RAG, embeddings, Knowledge Graph.
