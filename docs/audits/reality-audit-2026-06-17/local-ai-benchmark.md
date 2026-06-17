# Local AI Benchmark — AQLIYA Deep Reality Audit

**Audit date:** 2026-06-17  
**Status:** PARTIALLY EXECUTED — smoke only; full 20-task benchmark NOT RUN

---

## Executed: Phase-0 Smoke (4 tasks) — VERIFIED

| Task | Provider | Latency | Result | Output Preview |
|------|----------|--------:|--------|----------------|
| hybridRouter account_mapping | local | — | PASS | routed to local |
| hybridRouter notes_generation | openai | — | PASS | routed to openai |
| localProvider.execute (direct) | ollama/qwen3:8b | 31,662ms | PASS | `AQLIYA_LOCAL_OK` |
| runInference preferProvider=local | local | 11,687ms | PASS | Account mapping draft |

**Artifact:** `docs/audits/evidence/local-ai-phase0-smoke.json`

---

## Planned 20-Task Benchmark (NOT EXECUTED)

| # | Task Type | Realistic Input | Expected | Status |
|---|-----------|-----------------|----------|--------|
| 1 | trial_balance_upload | 50-line TB CSV | Classification suggestions | NOT RUN |
| 2 | account_mapping | Unmapped accounts | Mapping draft | NOT RUN |
| 3 | evidence_review | Evidence metadata | Review suggestions | NOT RUN |
| 4 | audit_findings | Finding context | Finding draft | NOT RUN |
| 5 | notes_generation | FS line items | Note draft | NOT RUN |
| 6 | disclosure_enrichment | Disclosure text | Enriched draft | NOT RUN |
| 7 | commercial_claim_review | Sales claim | Review assist | NOT RUN |
| 8 | pilot_decision | Pilot context | Decision assist | NOT RUN |
| 9 | LC workbook scoring | Workbook lines | Score + gaps | NOT RUN |
| 10 | LC AI advisor | Pattern query | Grounded recommendation | NOT RUN |
| 11 | Office AI task | Document summary | Deterministic output | NOT RUN |
| 12 | RAG retrieval | Knowledge query | Evidence chunks | NOT RUN |
| 13 | Skill evaluation | Foundation skill | JSON output | NOT RUN |
| 14 | Hybrid local task | TB classification | Local provider | NOT RUN |
| 15 | Hybrid cloud task | Report generation | Cloud provider | NOT RUN |
| 16 | Fallback chain | Provider failure | Deterministic fallback | NOT RUN |
| 17 | Budget quota | Over-limit org | Block + audit | NOT RUN |
| 18 | Eval gate | fin-analysis-v1 | Pass/fail score | NOT RUN |
| 19 | Arabic output | Arabic prompt | RTL-safe response | NOT RUN |
| 20 | Token accounting | Long context | Token count logged | NOT RUN |

**To execute:** `npm run tb:benchmark`, `npm run eval:skills:live`, custom script with `FF_AI_REAL_PROVIDERS=true`

---

## Latency Observations (Smoke Only)

| Mode | Latency | Notes |
|------|--------:|-------|
| Direct Ollama | ~32s | qwen3:8b, cold/warm unknown |
| Orchestrated local | ~12s | Includes governance overhead |
| Deterministic | <100ms | Expected from unit tests |

---

## Cost Observations

| Provider | Cost (smoke) |
|----------|-------------|
| Ollama local | $0 |
| OpenAI/Anthropic | NOT TESTED |

---

## Failure Handling — PARTIALLY VERIFIED

- Circuit breaker: code exists (`provider-circuit-breaker.ts`), not stress-tested
- Fallback to deterministic: unit tests pass (`orchestrator-hybrid.test.ts`)
- Provider switch on error: code path in orchestrator — not live-tested

---

## Recommendation

Run full benchmark after build fix with:
```bash
FF_AI_REAL_PROVIDERS=true AI_MODE=hybrid npm run local-ai:smoke
npm run tb:benchmark
npm run eval:skills:live  # requires API keys for cloud comparison
```

**Effort:** 4-8 hours to implement and run 20-task harness with reporting.
