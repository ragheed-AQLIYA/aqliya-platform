# TB Knowledge Feedback Loop — Reality Audit

**Date:** 2026-06-21  
**Scope:** AuditOS TB classification feedback loop (read-only)  
**Context:** Deterministic 98.1% vs Local AI 20.4% on Shalfa TB; recommendation Rules First, AI Fallback  
**Authority:** Code + schema + evidence artifacts (no code changes)

---

## Executive Verdict

**Classification: Partially Operational**  
**Maturity score: 6 / 10**

The **Firm Memory loop** (human confirm → `TBMappingPattern` → future lookup) is **real, persisted, and wired into the classification pipeline**. It is **not** a full autonomous knowledge feedback loop: corrections do not auto-update synonym rules, RAG, or platform Institutional Memory, and the **manual mapping UX bypasses feedback capture**.

**Biggest gap:** `updateManualMappingAction` confirms mappings but **does not** call `recordFirmMemoryFeedback` — the primary reviewer correction path (dropdown) does not feed the loop.

**Estimated effort to complete true loop:** ~2–3 weeks (wire manual confirm → memory, correction-aware feedback with `wasAccepted: false`, optional offline synonym mining job, KPI dashboard).

---

## Step 1 — Inventory

### TB Feedback & Memory (AuditOS — operational core)

| Component | Location | Role |
|-----------|----------|------|
| **TBMappingFeedback** | `prisma/schema.prisma` (L3553) | Audit trail of accept/reject events |
| **TBMappingPattern** | `prisma/schema.prisma` (L3515) | Reusable firm memory patterns |
| **TBClassificationHistory** | `prisma/schema.prisma` (L3572) | Per-classification log + explainability |
| **Firm Memory Engine** | `src/lib/tb-intelligence/firm-memory-engine.ts` | Write/read patterns, lookup tiers |
| **Firm Memory facade** | `src/lib/tb-intelligence/firm-memory.ts` | Feedback API, history logging |
| **Memory Governance** | `src/lib/tb-intelligence/firm-memory-governance.ts` | TRUSTED / CONFIRMED / DEPRECATED policy |
| **Classification Engine** | `src/lib/tb-intelligence/engine.ts` | ADR-001 pipeline (memory → rules → pattern → AI) |
| **Pattern Matcher** | `src/lib/tb-intelligence/pattern-matcher.ts` | Similarity over `TBClassificationHistory` |
| **Synonym Rules (static)** | `src/lib/tb-intelligence/synonyms.ts` | `COA_SYNONYM_RULES` — not DB-fed |
| **ERP Intelligence** | `src/lib/tb-intelligence/erp-intelligence-matcher.ts`, `erp-intelligence-loader.ts` | Static JSON dictionaries |
| **Org resolver** | `src/lib/tb-intelligence/org-resolver.ts` | Platform org for cross-engagement memory |
| **Classification explanation** | `src/lib/tb-intelligence/classification-explanation.ts` | Trust/evidence UI metadata |
| **Public exports** | `src/lib/tb-intelligence/index.ts` | Engine + memory APIs |

### Wiring (actions & upload)

| Component | Location | Role |
|-----------|----------|------|
| **Confirm → feedback** | `src/actions/audit-actions.ts` — `confirmMappingAction`, `bulkConfirmSuggestedMappingsAction` | Calls `recordFirmMemoryFeedback` |
| **Manual override (gap)** | `src/actions/audit-actions.ts` — `updateManualMappingAction` | Updates mapping only — **no feedback** |
| **TB upload → classify** | `src/lib/audit/services.ts` — `uploadTrialBalance` | `classifyTrialBalanceRows` → suggested mappings |
| **Mapping UI** | `src/components/audit/mapping/mapping-page.tsx` | Accept button + manual Select |
| **DB mutations** | `src/lib/audit/db/index.ts` — `confirmMapping`, `updateManualMapping` | Persistence |

### Static knowledge (not auto-updated from feedback)

| Component | Location | Role |
|-----------|----------|------|
| **ERP dictionary** | `knowledge/tb-intelligence/erp-saudi-dictionary.json` | Mined offline |
| **ERP prefix rules** | `knowledge/tb-intelligence/erp-prefix-rules.json` | Mined offline |
| **Failure mining output** | `knowledge/tb-intelligence/failure-mining-shalfa.json` | Research artifact |
| **ERP mining (offline)** | `src/lib/tb-intelligence/erp-intelligence-mining.ts` | Train-set mining — manual script |
| **IFRS COA mapping** | `knowledge/chart-of-accounts/ifrs-mapping.json` | Static |

### Platform Institutional Memory (separate — not TB loop)

| Component | Location | Role |
|-----------|----------|------|
| **Core memory service** | `src/lib/core/memory/institutional-memory-service.ts` | Graph-style memory (schema drift noted) |
| **Platform IM service** | `src/lib/platform/institutional-memory/institutional-memory-service.ts` | Collections, nodes, edges |
| **IM actions / UI** | `src/actions/institutional-memory-actions.ts`, `src/app/institutional-memory/` | Standalone workspace |
| **Sales IM** | `src/lib/sales/institutional-memory*.ts` | SalesOS domain — not AuditOS TB |

### RAG / Knowledge Engine (not TB feedback)

| Component | Location | Role |
|-----------|----------|------|
| **Intelligence Core RAG** | `src/lib/rag/intelligence-core-rag.ts` | AI orchestrator context — **no TB mapping consumer** |
| **Knowledge service** | `src/lib/rag/knowledge-service.ts` | Document/knowledge retrieval |
| **Embedding / vector** | `src/lib/rag/embedding-service.ts`, `vector-store.ts` | pgvector path when enabled |

### Measurement & validation scripts

| Component | Location | Role |
|-----------|----------|------|
| **Memory reuse KPI** | `scripts/audit/tb-memory-reuse-rate.mjs` | `firm_memory` hit rate from history |
| **Phase 3C validation** | `scripts/audit/phase-3c-memory-validation.ts` | Pattern lookup accuracy |
| **Phase 3D governance** | `scripts/audit/phase-3d-validate-governance.ts` | TRUSTED / auto-suggest eligibility |
| **Phase 3C backfill** | `scripts/audit/phase-3c-backfill-firm-memory.mjs` | Seed patterns from confirmed mappings |
| **ERP mining script** | `scripts/audit/phase-3b-erp-intelligence-mining.mjs` | Offline rule generation |

### Architecture docs

| Document | Path |
|----------|------|
| Phase 3C Firm Memory | `docs/architecture/PHASE_3C_FIRM_MEMORY_ENGINE.md` |
| Phase 3D Governance | `docs/architecture/PHASE_3D_MEMORY_GOVERNANCE.md` |
| ADR-001 AI runtime | `docs/architecture/ADR-001-AI-RUNTIME-STRATEGY.md` |

### Migrations

- `prisma/migrations/20260609100000_tb_intelligence_firm_memory/`
- `prisma/migrations/20260614140000_firm_memory_erp_context/`
- `prisma/migrations/20260614150000_firm_memory_governance/`
- `prisma/migrations/20260615100000_tb_classification_detail/`

---

## Step 2 — Workflow Trace

```text
Classification → Human correction → Feedback captured → Pattern generated
    → Knowledge updated → Future classifications improved
```

| Step | Status | Evidence |
|------|--------|----------|
| **Classification** | ✅ Implemented | `classifyTrialBalanceAccount()` in `engine.ts`; upload via `services.ts` |
| **Human correction** | ✅ Partial | UI: Accept (`confirmMappingAction`) or dropdown (`updateManualMappingAction`) |
| **Feedback captured** | ⚠️ Partial | Only on **Accept / bulk confirm** — not on manual dropdown override |
| **Pattern generated** | ✅ On confirm path | `recordAuditFirmMemoryFromConfirmation()` upserts `TBMappingPattern` |
| **Knowledge updated** | ⚠️ Partial | Pattern DB yes; static synonyms/ERP JSON **no** |
| **Future classifications improved** | ✅ Same GL / org | Step 1 pipeline `lookupAuditFirmMemory()`; ⚠️ not for new synonym rules |

---

## Step 3 — Persistence

### Where data lives

| Data | Store | Writer | Reader |
|------|-------|--------|--------|
| Feedback events | `TBMappingFeedback` | `firm-memory-engine.ts` → `recordAuditFirmMemoryFromConfirmation` | Governance audits, future analytics |
| Reusable patterns | `TBMappingPattern` | Same + `backfillFirmMemoryFromConfirmedMappings` | `lookupAuditFirmMemory` (Step 1) |
| Classification runs | `TBClassificationHistory` | `logClassificationHistory` on each pipeline result | `matchByPattern`, UI explanations, KPI scripts |
| Static rules | `synonyms.ts`, `knowledge/tb-intelligence/*.json` | Manual / offline scripts | `classifyByRules`, `matchErpIntelligence` |

### Pattern reuse — proven

Phase 3C evidence (`docs/audits/evidence/phase-3c-firm-memory-validation.json`):

- 578 patterns backfilled → **100% lookup accuracy** on same engagement (same GL codes)
- `trustedCount: 0` — none yet meet TRUSTED policy (≥5 hits, ≥2 reviewers)

First-upload reuse KPI (`docs/audits/evidence/tb-memory-reuse-rate.json`):

- **0% firm_memory hits** on initial Shalfa upload (expected — patterns created after confirm, not before first classify)

---

## Step 4 — Runtime Usage (Critical)

### Question: Does a user correction affect future classifications?

**Answer: Conditionally yes — with evidence.**

#### Path A — Reviewer clicks **Accept** (pending AI suggestion)

```text
mapping-page.tsx → confirmMappingAction()
  → confirmMapping() [DB status=confirmed]
  → recordFirmMemoryFeedback()
    → TBMappingFeedback.create
    → TBMappingPattern.upsert (hitCount++, canonicalAccountId)
```

**Future effect:** Next TB upload for same org + same `clientAccountCode` → `lookupAuditFirmMemory()` returns stored canonical **before** rules/AI run.

#### Path B — Reviewer changes **dropdown** (manual override)

```text
mapping-page.tsx → updateManualMappingAction()
  → updateManualMapping() [DB status=confirmed, mappingType=human_mapped]
  → (stops — no recordFirmMemoryFeedback)
```

**Future effect:** **None on firm memory.** Correction is persisted in `auditAccountMapping` only for that engagement.

#### Path C — Classification history → pattern matcher

Every automated classification logs to `TBClassificationHistory`. `matchByPattern()` scans last 200 org rows for name/code similarity — **secondary** fallback (Step 3), weaker than firm memory.

#### Path D — Synonym / ERP rules

**Not updated** by any runtime feedback. Improving the 11 benchmark misses requires **manual** edits to `synonyms.ts` or running `npm run phase-3b:mine` offline.

---

## Step 5 — Effectiveness

| Capability | Status | Notes |
|------------|--------|-------|
| **1. Learning from user corrections** | **Partially implemented** | Firm memory on confirm; manual override gap |
| **2. Rule generation from feedback** | **Not implemented** (runtime) | Offline mining only; synonyms are static TypeScript |
| **3. Pattern recommendation** | **Fully implemented** | `TBMappingPattern` + governance tiers; Step 1 pipeline |
| **4. Organization-specific learning** | **Fully implemented** | Patterns scoped by `organizationId` |
| **5. Cross-engagement learning** | **Fully implemented** | Same org, new engagement reuses patterns (`org-resolver.ts`) |

### Not in scope of TB loop (despite naming)

| System | TB loop connection |
|--------|-------------------|
| Platform Institutional Memory | **Not wired** to TB classification |
| RAG / Knowledge Engine | **Not wired** to TB mapping |
| Local AI model tuning | **Not implemented** (explicitly deferred Phase 3D) |

---

## Step 6 — Gap Analysis

### Current state vs true knowledge feedback loop

| True loop requirement | Current state | Gap |
|----------------------|---------------|-----|
| Capture all human corrections | Confirm path only | Manual dropdown bypass |
| Reject / override tracking | `wasAccepted: false` supported in schema | Never called from UI actions |
| Auto-update classification rules | Static synonyms + JSON | No closed loop to `synonyms.ts` |
| Measurable improvement over time | KPI script exists | No automated trend / before-after on rule changes |
| TRUSTED auto-suggest | Governance coded | 0 TRUSTED patterns on Shalfa (need multi-reviewer re-confirms) |
| Cross-product memory | Audit firm memory only | IM/RAG siloed |
| Feedback → AI prompt | None | Local AI does not ingest firm memory corrections |

### Missing links (priority)

1. **Manual mapping → firm memory** (`updateManualMappingAction` should call `recordFirmMemoryFeedback` with suggested vs accepted)
2. **Override rejection logging** when reviewer changes AI suggestion (`wasAccepted: false` + new canonical)
3. **Automated synonym promotion** from repeated `TBMappingFeedback` patterns (batch job, not runtime)
4. **KPI operationalization** — reuse rate dashboard, not just JSON artifact
5. **TRUSTED elevation** — second reviewer workflow for high-volume GL codes

---

## Step 7 — Final Verdict

### Verdict: **Partially Operational**

| Metric | Value |
|--------|-------|
| **Maturity** | **6 / 10** |
| **Biggest gap** | Manual correction UX does not write firm memory |
| **Effort to complete** | **~2–3 weeks** engineering + validation |

**Not Architectural Stub** — Prisma models, engine integration, confirm wiring, Phase 3C/D validation, and 578-pattern backfill prove real infrastructure.

**Not Fully Operational** — feedback loop is incomplete for primary correction UX; no automatic rule learning; RAG/IM disconnected; measurability exists but not closed-loop improvement.

---

## Critical Question — The 11 Benchmark Misclassifications

**Can feedback from the 11 misclassified accounts automatically improve future classifications?**

| Scenario | Automatic improvement? |
|----------|------------------------|
| Reviewer **Accepts** wrong suggestion without editing | ❌ Reinforces wrong pattern |
| Reviewer **confirms** after fixing via Accept on pending row | ✅ If they use Accept on corrected pending mapping |
| Reviewer fixes via **dropdown only** | ❌ **No** — firm memory not updated (gap) |
| Same GL code, **next year TB upload**, after **confirm path** fix | ✅ Firm memory Step 1 returns corrected canonical |
| Similar Arabic name, **different GL code** | ⚠️ Weak — `matchByPattern` may help; no synonym auto-update |
| **Deterministic rules** for other accounts with same Arabic pattern | ❌ Requires manual `synonyms.ts` or offline mine |

**Practical answer:** Corrections can improve **exact GL reuse** on confirm path only. They do **not** automatically fix the **deterministic rules engine** that caused 98.1% → 100% gap for the 11 accounts. For those, either:

1. Add synonyms manually (what improved rules from 11.4% → 98.1% historically), or  
2. Confirm corrected mappings so firm memory wins on Step 1 next upload, or  
3. Run offline ERP mining from confirmed mappings (`phase-3b:mine`)

**With current UX (dropdown fix), the 11 accounts do not automatically improve anything until confirm-path wiring is fixed.**

---

## Evidence Index

| Artifact | Path |
|----------|------|
| TB benchmark report | `docs/audits/TB_LOCAL_AI_BENCHMARK_REPORT.md` |
| Firm memory validation | `docs/audits/evidence/phase-3c-firm-memory-validation.json` |
| Memory reuse KPI | `docs/audits/evidence/tb-memory-reuse-rate.json` |
| Real TB classification | `docs/audits/evidence/shalfa-real-tb-classification.json` |
| Integration test (feedback) | `src/__tests__/integration/tb-upload-mapping-fs.integration.test.ts` |

---

## Alignment with Benchmark Recommendation

**Rules First, AI Fallback** aligns with architecture:

- Firm Memory is Step 1 (before rules)
- Static rules + ERP hints deliver 98.1% without learning loop
- Local AI is Step 4 fallback
- **Investment priority:** close manual-mapping feedback gap + synonym maintenance, not Local AI default
