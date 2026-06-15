# TB Classification Benchmark — Deterministic Rules vs Local Qwen3:8b

**Date:** 2026-06-14  
**Scope:** Evaluation only — no production code, schema, or architecture changes  
**Model:** Ollama `qwen3:8b` @ `http://localhost:11434`  
**Evidence:** `docs/audits/evidence/tb-classification-benchmark.json`, `docs/audits/evidence/tb-classification-benchmark-run.log`

---

## Executive Summary

| Method | Exact accuracy | Category accuracy | Avg latency | Verdict |
|--------|----------------|-----------------|-------------|---------|
| **Deterministic rules** (`classifyByRules`) | **65.0%** (65/100) | **70.0%** (70/100) | **0.2 ms** | Strong on synonym-covered names |
| **Local AI** (`generateClassification` → Ollama) | **0.0%** (0/100) | **0.0%** | **8,760 ms** | **Does not improve mapping today** |

**Conclusion:** Qwen3:8b is reachable and responds via the existing Local AI path, but **does not add measurable TB classification value in the current implementation**. The bottleneck is **prompt assembly**, not model availability. Deterministic rules remain the effective classifier for this benchmark.

---

## Pipeline Located

### TB classification engine

| Step | File | Function | Role |
|------|------|----------|------|
| 1 | `src/lib/tb-intelligence/engine.ts` | `lookupFirmMemory()` | Firm memory (skipped in benchmark — no org history) |
| 2 | `src/lib/tb-intelligence/engine.ts` | `classifyByRules()` | **Deterministic baseline** — synonyms + prefix |
| 3 | `src/lib/tb-intelligence/pattern-matcher.ts` | `matchByPattern()` | History similarity (skipped — no DB) |
| 4 | `src/lib/tb-intelligence/engine.ts` | `classifyByLocalAi()` | **Local AI path** → `generateClassification()` |
| 5 | `src/lib/tb-intelligence/engine.ts` | `classifyByCloudAi()` | Cloud fallback (not used) |

Public entry: `classifyTrialBalanceAccount()` in `src/lib/tb-intelligence/engine.ts`

### Deterministic mapping logic

| Component | File | Function |
|-----------|------|----------|
| Synonym rules | `src/lib/tb-intelligence/synonyms.ts` | `matchSynonym()`, `COA_SYNONYM_RULES` |
| GL prefix hints | `src/lib/tb-intelligence/coa-loader.ts` | `classifyByPrefix()` |
| Canonical COA | `src/lib/audit/coa/canonical-coa.ts` | `CANONICAL_COA_ACCOUNTS` (27 codes) |

### Local AI path (as-is)

```
classifyByLocalAi()
  → generateClassification()          [src/lib/ai/generate.ts]
    → aiOrchestrator.generate()       [taskType: account_mapping, mode: classification]
      → assemblePrompt()              [buildMappingRecommendationPrompt — aggregate TB stats]
      → LocalAIProvider.execute()     [Ollama qwen3:8b]
  → regex extract CA-XXXX from output
```

---

## Benchmark Dataset

**File:** `scripts/tb-classification-benchmark-data.json`

| Attribute | Value |
|-----------|-------|
| Accounts | **100** |
| Arabic | 25 |
| English | 75 |
| Easy (synonym-covered) | 66 |
| Hard (realistic GL variants) | 34 |

| Category | Count |
|----------|-------|
| Assets | 25 |
| Liabilities | 20 |
| Equity | 10 |
| Revenue | 20 |
| Expenses | 25 |

Ground truth = AuditOS canonical codes (`CA-1010` … `CA-5100`). Names curated from COA synonyms, `canonical-coa.ts`, and realistic Saudi audit GL patterns.

**Runner:** `npm run tb:benchmark` → `scripts/tb-classification-benchmark.ts`

---

## Results

### A. Deterministic classifier (baseline)

| Metric | Value |
|--------|-------|
| Exact match accuracy | **65.0%** (65/100) |
| Category-level accuracy | **70.0%** (70/100) |
| No prediction | 25 |
| Avg confidence (when matched) | 0.88 |
| Latency avg / p95 | 0.2 ms / 1 ms |

**By difficulty**

| Difficulty | Exact accuracy |
|------------|----------------|
| Easy (66 accounts) | **92.4%** (61/66) |
| Hard (34 accounts) | **11.8%** (4/34) |

**By category (exact match)**

| Category | Accuracy |
|----------|----------|
| Asset | 76% (19/25) |
| Liability | 80% (16/20) |
| Equity | 80% (8/10) |
| Revenue | 45% (9/20) |
| Expense | 52% (13/25) |

**Misclassification breakdown**

| Type | Count | Meaning |
|------|-------|---------|
| `exact_match` | 65 | Correct canonical code |
| `no_prediction` | 25 | Rules returned null |
| `wrong_code_same_section` | 5 | Right statement area, wrong line |
| `wrong_section` | 5 | Wrong BS/IS bucket |

**Known deterministic failure modes (observed)**

1. **Substring synonym collision** — e.g. `"Cost of Sales"` matches revenue alias `"sales"` → `CA-4010` instead of `CA-5010`
2. **Missing synonyms** — `CA-4020` (services revenue), `CA-5030` (occupancy) have no synonym rules
3. **Arabic orthography** — e.g. `اصول` vs `أصول` (hamza) breaks exact alias match
4. **Hard GL descriptions** — bank names, VAT, warehouse rent, audit fees — no rule coverage

### B. Local qwen3:8b classifier (existing path)

| Metric | Value |
|--------|-------|
| Exact match accuracy | **0.0%** (0/100) |
| Category-level accuracy | **0.0%** |
| Parseable `CA-XXXX` in output | **0%** |
| No prediction (parse miss) | 100 |
| Avg confidence | n/a (no successful parse) |
| Latency avg / p50 / p95 / max | 8,760 ms / 8,580 ms / 11,722 ms / 14,949 ms |
| Provider selected | `local` (Ollama responded) |

**Hard subset (34 accounts rules missed)**

| Metric | Rules | Local AI |
|--------|-------|----------|
| Exact match | 4/34 (11.8%) | **0/34 (0%)** |
| Incremental hits (rules miss → AI hit) | — | **0** |

### Sample local AI output (Petty Cash — expected `CA-1010`)

The model receives `buildMappingRecommendationPrompt` with default zeros (`accountCount: 0`, `mappedCount: 0`, …) and **does not see** `accountName`, `accountCode`, or `canonicalCandidates` in the task-specific prompt layer. Typical response:

```
Draft Output: Account Mapping Task Status
Parameters: accountCount: 0, mappedCount: 0, ...
No accounts have been processed or mapped.
```

No `CA-XXXX` code appears → `classifyByLocalAi()` returns null (matches production behavior in `engine.ts` line 141-142).

---

## Does Local AI Add Value Today?

**No — not for TB account classification.**

| Question | Answer |
|----------|--------|
| Is Ollama reachable? | Yes |
| Does hybrid router select `local`? | Yes (Phase 0 proved) |
| Does `generateClassification` call Qwen3? | Yes (~8–15 s per account) |
| Does output contain mappable canonical codes? | **No (0/100)** |
| Does it beat deterministic rules? | **No** |
| Would it help hard cases rules miss? | **No (0 incremental hits)** |

The **model may be capable**, but the **existing Local AI path is not wired for per-account classification**. This matches the gap identified in `LOCAL_AI_IMPLEMENTATION_PLAN.md` Phase 3.

---

## Recommendations

### Priority 1 — Prompt wiring (required before re-benchmark)

**Not implemented in this evaluation** (per scope). When approved:

- Add per-account classification prompt branch in `prompt-registry.ts` / `prompt-framework.ts` when `taskInput.mode === "classification"`
- Pass `accountCode`, `accountName`, and `canonicalCandidates` explicitly
- Instruct model to return a single `CA-XXXX` code

Re-run `npm run tb:benchmark` after prompt fix to measure true model value.

### Priority 2 — Deterministic rule hardening (high ROI, no LLM)

| Fix | Impact |
|-----|--------|
| Order specific aliases before broad ones (`cost of sales` before `sales`) | Fixes wrong-section COGS errors |
| Add synonyms for `CA-4020`, `CA-5030` | Covers services revenue + occupancy |
| Arabic normalization (أ/ا/إ unification) | Fixes ROU and similar Arabic misses |
| Expand hard-case aliases (VAT, GOSI, audit fees, rent) | Raises baseline above 65% |

### Priority 3 — Re-benchmark after prompt fix

Target acceptance criteria for local AI pilot:

| Metric | Target |
|--------|--------|
| Exact accuracy on hard subset | > deterministic baseline on same subset |
| Incremental hits | > 10 on 34 hard accounts |
| Latency p95 | < 15 s acceptable for batch assist |
| Parse rate | 100% `CA-XXXX` when model responds |

### Do not do yet

- RAG / embeddings / knowledge graph (explicitly out of scope)
- Production code changes without prompt fix validation
- Claim local AI improves TB mapping based on this benchmark

---

## How to Reproduce

```bash
# Deterministic only (~1 s)
npm run tb:benchmark -- --rules-only

# Full benchmark including Ollama (~15 min for 100 accounts)
npm run tb:benchmark
```

**Required env** (from Phase 0):

```env
FF_AI_REAL_PROVIDERS=true
AI_MODE=hybrid
AI_LOCAL_MODEL=qwen3:8b
AI_LOCAL_BASE_URL=http://localhost:11434
```

---

## Files Produced (benchmark tooling only)

| File | Purpose |
|------|---------|
| `scripts/tb-classification-benchmark-data.json` | 100-account ground truth dataset |
| `scripts/tb-classification-benchmark.ts` | Benchmark runner |
| `docs/audits/evidence/tb-classification-benchmark.json` | Machine-readable results |
| `docs/audits/TB_CLASSIFICATION_BENCHMARK.md` | This report |

---

## Related Documents

- `docs/architecture/LOCAL_AI_READINESS_AUDIT.md`
- `docs/architecture/LOCAL_AI_IMPLEMENTATION_PLAN.md` (Phase 3 — TB prompts)
- `docs/architecture/LOCAL_AI_PHASE0_REPORT.md`
