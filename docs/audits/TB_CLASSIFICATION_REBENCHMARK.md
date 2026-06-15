# TB Classification Rebenchmark — Phase 1B Prompt Wiring

**Date:** 2026-06-14  
**Model:** Ollama `qwen3:8b` @ `http://localhost:11434`  
**Evidence:** `docs/audits/evidence/tb-classification-rebenchmark.json`, `docs/audits/evidence/tb-classification-rebenchmark-run.log`

---

## Executive Summary

**Success criterion met:** Local AI **outperforms deterministic rules on the hard account set**.

| Metric | Before (Phase 1A) | After (Phase 1B) | Delta |
|--------|-------------------|------------------|-------|
| **Hard-set exact accuracy** | 0/34 (0%) | **23/34 (67.6%)** | **+23** |
| Rules on hard set | 4/34 (11.8%) | 4/34 (11.8%) | — |
| **Overall exact accuracy** | 0/100 (0%) | **85/100 (85%)** | **+85** |
| Rules overall | 65/100 (65%) | 65/100 (65%) | — |
| Incremental hard hits (rules miss → AI hit) | 0 | **21** | +21 |
| Parse / no-prediction rate | 100% null | **0%** | Fixed |

---

## Root Cause (Phase 1A)

`generateClassification()` passed `accountName`, `accountCode`, and `canonicalCandidates` in `taskInput`, but `prompt-registry.ts` always called `buildMappingRecommendationPrompt()` with aggregate TB stats (`accountCount: 0`, …). The model never received per-account context.

---

## Minimal Fix Implemented

| File | Change |
|------|--------|
| `src/lib/governance/prompt-framework.ts` | Added `buildAccountClassificationPrompt()` — JSON input/output contract |
| `src/lib/governance/runtime-types.ts` | Added `AccountClassificationPromptInput` |
| `src/lib/ai/prompt-registry.ts` | Branch `mode === "classification"` → per-account prompt |
| `src/lib/ai/generate.ts` | Pass `accountBalance`, `candidateAccounts`, `chartOfAccountsContext` |
| `src/lib/tb-intelligence/classification-prompt-context.ts` | COA context + candidate label builders |
| `src/lib/tb-intelligence/classification-response-parser.ts` | Parse structured JSON `{ accountCode, confidence, reasoning }` |
| `src/lib/tb-intelligence/engine.ts` | `classifyByLocalAi()` / `classifyByCloudAi()` use new fields + parser |

**Unchanged:** ADR-001 pipeline order, hybrid/provider routing, `LocalAIProvider`, orchestrator architecture.

### Prompt payload (per account)

```json
{
  "accountName": "...",
  "accountCode": "...",
  "accountBalance": 0,
  "candidateAccounts": ["CA-1010: Cash ...", "..."],
  "chartOfAccountsContext": "..."
}
```

### Expected model output

```json
{
  "accountCode": "CA-4010",
  "confidence": 0.92,
  "reasoning": "..."
}
```

---

## Before vs After Accuracy

### Overall (100 accounts)

| Method | Exact | Category | No prediction | Avg latency |
|--------|-------|----------|---------------|-------------|
| Deterministic rules | **65.0%** | 70.0% | 25 | 0.1 ms |
| Local AI (before) | **0.0%** | 0.0% | 100 | 8,760 ms |
| Local AI (after) | **85.0%** | 95.0% | 0 | 7,655 ms |

### Hard subset (34 accounts — success criterion)

| Method | Exact accuracy |
|--------|----------------|
| Deterministic rules | **11.8%** (4/34) |
| Local AI (before) | **0%** (0/34) |
| Local AI (after) | **67.6%** (23/34) |

### Easy subset (66 synonym-covered accounts)

| Method | Before AI | After AI |
|--------|-----------|----------|
| Local AI exact | 0/66 | **62/66 (93.9%)** |

Rules still win on latency and easy synonym hits; local AI adds value where rules miss or mis-route.

---

## Latency (After)

| Stat | Local AI |
|------|----------|
| Average | 7,655 ms |
| p50 | 7,172 ms |
| p95 | 12,298 ms |
| Max | 20,183 ms |

Batch assist at ~7.7 s/account is acceptable for pilot; not suitable for synchronous 578-line TB without queueing.

---

## Error Categories (After — Local AI)

| Type | Count | Notes |
|------|-------|-------|
| `exact_match` | 85 | Correct canonical code |
| `wrong_code_same_section` | 10 | Right BS/IS area, wrong line (e.g. CA-4010 vs CA-4020) |
| `wrong_section` | 5 | Cross-statement confusion |
| `no_prediction` | 0 | Parser always extracted a code |

---

## Top Failures (After — 15 accounts)

| ID | Account name | Expected | Got | Error type |
|----|--------------|----------|-----|------------|
| A22 | Retention receivable from contractors | CA-1020 | CA-1080 | Same section |
| A24 | VAT input recoverable | CA-1040 | CA-2030 | Wrong section |
| A25 | سلف موظفين | CA-1040 | CA-2040 | Wrong section |
| L05 | Contract Liabilities | CA-2020 | CA-2010 | Same section |
| L08 | زكاة مستحقة | CA-2030 | CA-2035 | Same section |
| L17 | End of service benefits provision | CA-2020 | CA-5020 | Wrong section |
| L19 | Murabaha facility - current | CA-2040 | CA-1080 | Wrong section |
| R03 | إيرادات | CA-4010 | CA-5100 | Same section |
| R05 | Related Party Revenue | CA-4010 | CA-5100 | Same section |
| R12 | Progress billing revenue | CA-4010 | CA-4020 | Same section |
| R16 | ايرادات عقود طويلة الاجل | CA-4010 | CA-4020 | Same section |
| R17 | Intercompany management fees income | CA-4010 | CA-5100 | Same section |
| R19 | Training workshop fees | CA-4020 | CA-5060 | Same section |
| R20 | دخل تشغيلي - مشاريع | CA-4010 | CA-4020 | Same section |
| X21 | IT software subscription | CA-5070 | CA-5060 | Same section |

**Patterns:** Revenue vs other income (CA-4010 vs CA-5100), goods vs services revenue (CA-4010 vs CA-4020), Saudi-specific tax/VAT/EOS lines.

---

## Recommendations

### Ship for pilot (Phase 1B complete)

1. **Enable hybrid routing** — rules first, local AI when rules return null (existing ADR-001 Step 4).
2. **Human review gate** — all AI mappings remain draft; never auto-commit.
3. **Log reasoning** — store parser `reasoning` in classification evidence field.

### Next improvements (Phase 1C+)

| Priority | Action | Expected impact |
|----------|--------|-----------------|
| P1 | Fix deterministic alias ordering (`cost of sales` before `sales`) | +5 overall rules accuracy |
| P2 | Add synonyms for CA-4020, CA-5030, VAT, EOS | Reduce hard-set AI-only dependency |
| P3 | Few-shot examples in prompt for CA-4010 vs CA-5100 vs CA-4020 | Fix revenue confusion cluster |
| P4 | Async batch queue for full TB (578 lines) | Operational usability |
| P5 | Re-benchmark after rules hardening — measure net incremental AI value | Avoid double-counting |

### Do not claim yet

- Production L5 for autonomous TB mapping
- Replacement of human mapping review
- RAG/embeddings benefit (not tested)

---

## Validation

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass |
| `npm test -- classification-response-parser` | Pass (3/3) |
| `npm run tb:benchmark` | Pass — hard set 23/34 vs rules 4/34 |

---

## Related Documents

- `docs/audits/TB_CLASSIFICATION_BENCHMARK.md` — Phase 1A baseline
- `docs/architecture/LOCAL_AI_IMPLEMENTATION_PLAN.md` — Phase 3 marked complete
- `docs/architecture/LOCAL_AI_PHASE0_REPORT.md`
