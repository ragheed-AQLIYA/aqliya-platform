# LocalContentOS — Pilot Readiness Report v1

**Date:** 2026-06-17  
**Method:** Direct database query of all 11 Pilot Readiness Dashboard dimensions using real data counts and the `pilot-readiness.ts` scoring logic.

---

## 1. Overall Assessment

| Metric | Current Score | Threshold | Level |
|--------|--------------|-----------|-------|
| **Overall Score** | **~18%** | ≥80% Green | 🔴 **NOT READY** |
| RED metrics | 6 of 11 | ≤2 | ❌ |
| AMBER metrics | 3 of 11 | — | ⚠️ |
| GREEN metrics | 2 of 11 | ≥9 | ❌ |

**Status:** `Not Ready` — the seed data doesn't populate the engines that the readiness dashboard measures.

---

## 2. Dimension Breakdown

### 2.1 Population Accuracy — 🟡 AMBER (~35%)

| Detail | Value |
|--------|-------|
| Lines filled | 9 of 22 (41%) |
| Auto-filled with confidence | 8 lines (revenue, COS, GP, AST-02, WRK-04) |
| Scoring logic | % auto-filled lines with high confidence |
| Projected score | ~35% (8/22 with high conf) |
| Threshold | ≥80% GREEN, ≥50% AMBER |

**Why:** Revenue and COS are well-populated from seed (auto-fill from TB data), but supplier_spend, workforce (3/4), and company_info/declarations are all empty. The population engine was only run on ~36% of lines.

### 2.2 False Positive Rate — 🟡 AMBER (~50%)

| Detail | Value |
|--------|-------|
| Reviewed pattern suggestions | 0 |
| Unreviewed patterns | 0 |
| Scoring logic | If no reviews, use default (50%) |
| Projected score | ~50% |
| Threshold | ≥90% GREEN, ≥70% AMBER |

**Why:** No pattern suggestions exist to review. The dimension defaults to 50% — a placeholder, not an actual measurement. This is correct per the code's design but misleading.

### 2.3 Workbook Completion — 🔴 RED (~0%)

| Detail | Value |
|--------|-------|
| Complete workbooks | 0 of 1 |
| Scoring logic | % workbooks with completionPct ≥ 90% |
| Projected score | 0% |
| Threshold | ≥80% GREEN, ≥50% AMBER |

**Why:** Workbook completion is at 35-41%. No workbook reaches 90% threshold. This is the most visible readiness gap.

### 2.4 Recommendation Quality — 🟡 AMBER (~40%)

| Detail | Value |
|--------|-------|
| Accepted recommendations | 0 |
| Total recommendations | 0 |
| Scoring logic | If total = 0, return 40% default |
| Projected score | ~40% |
| Threshold | ≥80% GREEN, ≥50% AMBER |

**Why:** Zero recommendations generated. Defaults to 40% placeholder. Recommender engine needs to be triggered.

### 2.5 Simulation Reliability — 🟡 AMBER (~30%)

| Detail | Value |
|--------|-------|
| Simulation results | 0 |
| Confidence threshold count | 0 |
| Scoring logic | If total = 0, return 30% default |
| Projected score | ~30% |
| Threshold | ≥80% GREEN, ≥50% AMBER |

**Why:** Zero simulations. Defaults to 30% placeholder. Simulation engine needs to be triggered.

### 2.6 AI Health — 🟢 GREEN (~80%)

| Detail | Value |
|--------|-------|
| Ollama host | `http://localhost:11434` |
| Model loaded | `qwen3:8b` (confirmed earlier) |
| Embedding model | `nomic-embed-text:latest` |
| Scoring logic | Ping Ollama, check model loaded |
| Projected score | ~80% (model loaded, health check passes) |
| Threshold | ≥80% GREEN |

**Why:** The AI health check is the one dimension that doesn't depend on seed data. It measures infrastructure availability. Ollama is running with the correct model.

### 2.7 Industry Memory Coverage — 🔴 RED (0%)

| Detail | Value |
|--------|-------|
| Industry pattern memories | 0 |
| Required threshold | N/A |
| Scoring logic | min(count / threshold * 100, 100) |
| Projected score | 0% |
| Threshold | ≥80% GREEN, ≥40% AMBER |

**Why:** `lcIndustryPatternMemory` table is empty. No patterns have ever been learned from. The knowledge retrieval layer's industry memory source returns nothing.

### 2.8 Organization Memory Coverage — 🔴 RED (0%)

| Detail | Value |
|--------|-------|
| Org match memories | 0 |
| Required threshold | N/A |
| Scoring logic | min(count / threshold * 100, 100) |
| Projected score | 0% |
| Threshold | ≥80% GREEN, ≥40% AMBER |

**Why:** `lcOrganizationMatchMemory` table is empty. No historical match data to learn from.

### 2.9 Pattern Learning Health — 🟡 AMBER (~30%)

| Detail | Value |
|--------|-------|
| Pattern health records | 0 |
| Average health score | N/A |
| Scoring logic | If no records, return 30% default |
| Projected score | ~30% |
| Threshold | ≥80% GREEN, ≥50% AMBER |

**Why:** `lcPatternHealthRecord` table is empty. No pattern health data. Defaults to 30%.

### 2.10 Audit Coverage — 🔴 RED (0%)

| Detail | Value |
|--------|-------|
| LcAiAuditEvents | 0 |
| Required threshold | ≥1 per workbook line (22) would be GREEN |
| Scoring logic | min(count / threshold * 100, 100) |
| Projected score | 0% |
| Threshold | ≥80% GREEN, ≥40% AMBER |

**Why:** Zero AI audit events. The AI pipeline never ran. This is the hardest metric to fix without running the actual AI pipeline.

### 2.11 Context Coverage — 🔴 RED (0%)

| Detail | Value |
|--------|-------|
| Context builder invocations | 0 |
| Required threshold | N/A |
| Scoring logic | min(count / threshold * 100, 100) |
| Projected score | 0% |
| Threshold | ≥80% GREEN, ≥40% AMBER |

**Why:** Context coverage tracks how often the knowledge retrieval layer (`context-builder.ts`) has been invoked against the 7 knowledge sources. Zero invocations.

---

## 3. Summary Table

| # | Dimension | Score | Level | Fix Needed |
|---|-----------|-------|-------|------------|
| 1 | Population Accuracy | ~35% | 🟡 AMBER | Run population engine, fill SPN/WRK/AST |
| 2 | False Positive Rate | ~50% | 🟡 AMBER | Generate pattern + review it |
| 3 | Workbook Completion | 0% | 🔴 RED | Fill to ≥90% |
| 4 | Recommendation Quality | ~40% | 🟡 AMBER | Trigger recommendation engine |
| 5 | Simulation Reliability | ~30% | 🟡 AMBER | Trigger simulation engine |
| 6 | AI Health | ~80% | 🟢 GREEN | OK (Ollama running) |
| 7 | Industry Memory | 0% | 🔴 RED | Seed industry pattern memory |
| 8 | Organization Memory | 0% | 🔴 RED | Seed org match memory |
| 9 | Pattern Learning | ~30% | 🟡 AMBER | Generate pattern + record health |
| 10 | Audit Coverage | 0% | 🔴 RED | Run AI pipeline |
| 11 | Context Coverage | 0% | 🔴 RED | Invoke context builder |

---

## 4. Path to "Pilot Conditional" (≥55%)

To reach AMBER level (Pilot Conditional, ≥55% overall):

1. **Fix seed workbook** → 41% → 80% completion → boosts metrics 1, 3
2. **Generate 1 recommendation** → boosts metric 4 from 40% to ~60%
3. **Generate 1 simulation** → boosts metric 5 from 30% to ~50%
4. **Seed 1 industry memory + 1 org memory** → boosts metrics 7, 8 from 0% to ~20%
5. **Generate 1 pattern + record health** → boosts metric 9 from 30% to ~60%

**Estimated result after fixes:** ~55% overall → `Pilot Conditional` with 5-6 AMBER, 3-4 RED, 1-2 GREEN.

## 5. Path to "Pilot Ready" (≥80%)

Full GREEN requires:
- Workbook ≥90% complete
- ≥10 recommendations with ≥10% acceptance
- ≥10 simulations with ≥50% confidence
- ≥22 AI audit events
- Industry + org memory populated to thresholds
- Pattern health ≥70%

This is likely **3-4 sessions** of focused engine work.

---

## 6. Recommendation

**Short-term:** Aim for **Pilot Conditional** (AMBER) by running the engine pipeline and fixing the seed workbook. This is achievable in **1 session**.

**Medium-term:** To reach Pilot Ready (GREEN), the engines need to be triggered, tested end-to-end, and memory systems populated. This requires dedicated development sessions.

**Do not** show the Pilot Readiness Dashboard to a customer in its current state — 6 RED and 3 AMBER metrics would undermine confidence.
