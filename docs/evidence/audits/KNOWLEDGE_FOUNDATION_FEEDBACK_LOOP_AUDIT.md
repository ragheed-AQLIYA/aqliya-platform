# Knowledge Foundation Feedback Loop — Phase 8 Completion Audit

**Date:** 2026-06-22  
**Scope:** Knowledge Foundation mining pipeline — Firm Memory → candidate knowledge artifacts  
**Context:** Phase 8 — closes gaps #3 (automated synonym promotion from feedback), #4 (KPI operationalization) from previous feedback loop audit  
**Authority:** Code + schema + routes + validation (additive implementation — no production rule modifications)

---

## Executive Summary

**Status: L5 — Pilot-Ready**  
**Pipeline Maturity: 8 / 10** (was 6/10 before Phase 8)

Phase 8 implements the missing **mining pipeline** that connects Firm Memory feedback patterns → governance-reviewed candidate knowledge artifacts. The pipeline is:

- **Full governance lifecycle:** CANDIDATE → UNDER_REVIEW → APPROVED → REJECTED → PROMOTED
- **Evidence-backed:** Every candidate links to source TBMappingFeedback, TBMappingPattern, or TBClassificationHistory records
- **Safe by design:** Artifacts are generated as JSON files in `knowledge/tb-intelligence/candidates/` — never writes to production `synonyms.ts` or `coa-loader.ts`
- **Measurable:** 7 API routes, 10 server actions, real-time KPIs

### Before Phase 8 (previous audit — 2026-06-21)

| Gap | Status |
|-----|--------|
| Manual mapping → firm memory | ❌ Open |
| Override rejection logging | ❌ Open |
| Automated synonym promotion from feedback | ❌ Open — **GAP #3** |
| KPI operationalization | ⚠️ Partial — **GAP #4** |
| TRUSTED elevation workflow | ❌ Open |

### After Phase 8 (2026-06-22)

| Gap | Status | Phase 8 Solution |
|-----|--------|------------------|
| Manual mapping → firm memory | ❌ Still open (not in scope) | Separate UX fix needed |
| Override rejection logging | ❌ Still open (not in scope) | Separate UX fix needed |
| **Automated synonym promotion from feedback** | ✅ **CLOSED — GAP #3** | Pattern aggregator → candidate rules → review → promotion → JSON artifacts |
| **KPI operationalization** | ✅ **CLOSED — GAP #4** | `/api/knowledge-mining/kpis` endpoint + server actions |
| TRUSTED elevation workflow | ❌ Still open (not in scope) | Separate workflow needed |

---

## Architecture

```text
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ TBMappingFeedback │     │  TBMappingPattern  │     │ TBClassificationHistory│
│ (accept/reject)   │     │  (confirmed memory)│     │ (classification logs)  │
└────────┬─────────┘     └────────┬─────────┘     └───────────┬─────────┘
         │                        │                           │
         └────────────────────────┼───────────────────────────┘
                                  │
                          ┌───────▼────────┐
                          │ Pattern        │
                          │ Aggregator     │ ← merges + deduplicates by confidence
                          └───────┬────────┘
                                  │
                          ┌───────▼────────┐
                          │ Candidate Rule │
                          │ Generator      │ ← filters (≥3 support, ≥2 orgs, ≥0.7 conf)
                          └───────┬────────┘    creates KnowledgeCandidate + Evidence
                                  │
                          ┌───────▼────────┐
                          │ Review Workflow │
                          │ CANDIDATE→UNDER │
                          │ _REVIEW→APPROVED│
                          │ /REJECTED       │
                          └───────┬────────┘
                                  │
                          ┌───────▼────────┐
                          │ Promotion      │
                          │ Service        │ ← generates candidate-synonyms.json
                          └───────┬────────┘    or candidate-rule-pack.json
                                  │
                          ┌───────▼────────┐
                          │ Human Merge    │ ← reviewer manually merges into
                          │ (NOT automated)│    production synonyms.ts
                          └────────────────┘
```

### Key Design Decision

**No auto-write to production rules.** Promotion generates candidate artifacts only. Human review is required for production adoption. This is consistent with:
- AQLIYA Trust Principle: "AI assists. Humans decide. Evidence governs."
- Knowledge Foundation governance: `no-direct-llm-rule-creation`, `"suggest-candidate-rules"` permitted
- `knowledge-governance-model.json` candidateRuleFlow: `maxConfidence=69`

---

## Files Changed

### New files

#### Prisma Schema
- **`prisma/schema.prisma`** — 3 new models: `KnowledgeCandidate`, `KnowledgeCandidateEvidence`, `KnowledgePromotionHistory`; 1 relation on `AuditCanonicalAccount` (`knowledgeCandidates`)

#### Service Layer (src/lib/tb-intelligence/knowledge-mining/)
- **`types.ts`** — All types: `KnowledgeCandidateStatus`, `AggregatedPattern`, `PromotionInput`, `PromotionResult`, `KnowledgeMiningKPIs`, `KnowledgeCandidateDTO`
- **`pattern-aggregator.ts`** — Cross-source pattern aggregation from TBMappingFeedback, TBMappingPattern, TBClassificationHistory
- **`candidate-rule-generator.ts`** — Candidate generation with configurable thresholds
- **`knowledge-candidate-service.ts`** — CRUD + filtering + pagination
- **`review-workflow.ts`** — CANDIDATE→UNDER_REVIEW→APPROVED/REJECTED workflow
- **`promotion-service.ts`** — Artifact generation + promotion history (never writes production files)
- **`kpis.ts`** — Real-time operational metrics
- **`index.ts`** — Barrel exports

#### Server Actions
- **`src/actions/knowledge-mining-actions.ts`** — 10 server actions: runMiningPipeline, getCandidates, getCandidateDetail, removeCandidate, submitForReview, approve, reject, promote, batchPromote, getKPIs

#### API Routes (under /api/knowledge-mining/)
- **`candidates/route.ts`** — GET list, POST run pipeline
- **`candidates/[id]/route.ts`** — GET detail, DELETE
- **`aggregate/route.ts`** — POST dry-run aggregation
- **`review/route.ts`** — POST submit/approve/reject
- **`promote/route.ts`** — POST promote single candidate
- **`batch-promote/route.ts`** — POST promote all approved
- **`kpis/route.ts`** — GET operational metrics

#### Seed Data
- **`prisma/seed-knowledge-mining.ts`** — 5 sample candidates (3 CANDIDATE, 2 APPROVED) for Arabic account patterns
  - مصروف ايجار معدات → CA-5020
  - استهلاك حق استخدام → CA-5050
  - فوائد التزام عقد إيجار → CA-2050
  - مخصص مكافأة نهاية خدمة → CA-2020
  - عمولة بنك → CA-5060

### Modified files
- **`src/lib/tb-intelligence/index.ts`** — Added `knowledgeMining` namespace export
- **`prisma/seed.ts`** — Integrated knowledge-mining seed call

---

## Validation Results

| Command | Result | Details |
|---------|--------|---------|
| `npx tsc --noEmit` | ✅ **0 errors** | Clean compilation |
| `npm test` | ✅ **287 suites, 2747 tests pass** | (21 skipped, pre-existing) |
| `npm run build` | ✅ **Clean build** | Compiled 54s, TS 52s, 138 static pages generated including 7 new knowledge-mining routes |
| `npx prisma generate` | ✅ **Success** | Prisma Client v7.8.0 |
| `npm run lint` | ✅ **0 new warnings** | (pre-existing lint baseline preserved) |

---

## Governance Check

| Requirement | Status | Details |
|------------|--------|---------|
| **RBAC** | ✅ Per-action authorization | All API routes require `auth()`, actions use `requireRole()` |
| **Tenant isolation** | ✅ Pattern source evidence preserves `organizationId` | Candidates can be cross-org (`organizationId: null`) or org-specific |
| **Evidence** | ✅ Full evidence chain | `KnowledgeCandidateEvidence` links to source: TBMappingFeedback, TBMappingPattern, TBClassificationHistory |
| **Audit trail** | ✅ 3 audit layers | TBMappingFeedback → pattern → candidate → promotion history |
| **Review/approval** | ✅ Full lifecycle | CANDIDATE → UNDER_REVIEW → APPROVED/REJECTED → PROMOTED (requires `reviewerId` + `reviewNotes`) |
| **Export control** | ✅ Safe artifact generation | Artifacts go to `knowledge/tb-intelligence/candidates/` as JSON — never to production rules |
| **AI boundary** | ✅ No autonomous decisions | Pipeline stops at candidate generation; human review gates approval and promotion |

---

## Pipeline Capability

| Capability | Status | Evidence |
|-----------|--------|----------|
| Cross-source pattern aggregation | ✅ Full | TBMappingFeedback (wasAccepted, grouped), TBMappingPattern (non-DEPRECATED grouped), TBClassificationHistory (non-none grouped) |
| Deduplication + confidence scoring | ✅ Full | Merged by canonicalCode, sorted by supportCount desc, deduplicated by confidence |
| Configurable candidate thresholds | ✅ Full | Defaults: min 3 support, 2 orgs, 0.7 confidence (overridable) |
| Governance lifecycle | ✅ Full | CANDIDATE → UNDER_REVIEW → APPROVED → REJECTED → PROMOTED with status guards |
| Evidence persistence | ✅ Full | Each candidate links to source records |
| Artifact generation | ✅ Full | `candidate-synonyms.json` or `candidate-rule-pack.json` |
| Promotion history | ✅ Full | `KnowledgePromotionHistory` tracks who, when, artifact path, version |
| Batch operations | ✅ Full | Batch promote all APPROVED candidates |
| Real-time KPIs | ✅ Full | by-status counts, approval/promotion rate, top emerging patterns, coverage |
| Seed data | ✅ Full | 5 Arabic accounting patterns pre-seeded |

---

## Operational Maturity

| Metric | Before (Jun 21) | After (Jun 22) | Improvement |
|--------|-----------------|----------------|-------------|
| **Overall maturity** | 6/10 | 8/10 | +2 |
| **Gap #3 (synonym promotion)** | ❌ Open | ✅ Closed via pipeline | Full |
| **Gap #4 (KPI dashboard)** | ⚠️ Partial | ✅ REST KPIs operational | Full |
| **Pipeline completeness** | No mining pipeline | Full CANDIDATE→PROMOTED pipeline | Full |
| **Cross-org pattern mining** | Not possible | Aggregates from all orgs | Full |
| **Evidence linkage** | Per-source only | Cross-referenced candidates | Full |

---

## Remaining Gaps (not in Phase 8 scope)

| Gap | Priority | Effort estimate | Notes |
|-----|----------|----------------|-------|
| Manual mapping → firm memory (gap #1) | High | 1-2 days | `updateManualMappingAction` should call `recordFirmMemoryFeedback` |
| Override rejection logging (gap #2) | Medium | 1 day | `wasAccepted: false` never called from UI |
| TRUSTED elevation workflow (gap #5) | Medium | 2-3 days | Second reviewer for high-volume GL codes |
| Production merge tooling | Low | 1 day | CLI helper for merging candidate artifacts into `synonyms.ts` |
| KPI dashboard UI | Low | 2-3 days | Visual dashboard for pipeline metrics instead of bare API |

---

## Next Recommended Step

**Merge candidate artifacts into production synonyms.** The pipeline now generates `candidate-synonyms.json` files with reviewed/approved patterns. The next operational step is:

1. Review the generated candidates (via `/api/knowledge-mining/candidates` or seed data)
2. Approve qualifying candidates via POST `/api/knowledge-mining/review`
3. Promote via POST `/api/knowledge-mining/promote`
4. Manually merge `knowledge/tb-intelligence/candidates/candidate-synonyms-*.json` into `src/lib/tb-intelligence/synonyms.ts`
5. Re-run `npm test && npm run build` to validate

---

## Evidence Index

| Artifact | Path |
|----------|------|
| Pipeline implementation | `src/lib/tb-intelligence/knowledge-mining/` |
| Server actions | `src/actions/knowledge-mining-actions.ts` |
| API routes | `src/app/api/knowledge-mining/` |
| Seed data | `prisma/seed-knowledge-mining.ts` |
| Prisma schema (new models) | `prisma/schema.prisma` (models: KnowledgeCandidate, KnowledgeCandidateEvidence, KnowledgePromotionHistory) |
| TB feedback loop audit (previous checkpoint) | `docs/audits/TB_KNOWLEDGE_FEEDBACK_LOOP_AUDIT.md` |
| Knowledge governance model | `knowledge-foundation/governance/knowledge-governance-model.json` |
