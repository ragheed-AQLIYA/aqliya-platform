# Phase 3C — Firm Memory Engine (Architecture Decision)

**Status:** Approved  
**Date:** 2026-06-14  
**Supersedes:** Phase 3B.4 (Prefix/Map2 refinement) — deferred as low ROI  
**Evidence:** Phase 3A–3B.2 validation series

---

## Executive Decision

TB Intelligence strategic investment shifts from **generalization research** to **audit knowledge reuse**.

| Layer | Verdict | Production role |
|-------|---------|-----------------|
| **Firm Memory** | Proven (100% same ERP) | **Primary** |
| Map1 rules | Strong (84% precision) | Fallback after memory |
| Prefix / Map2 / Patterns | Weak generalization (20–46%) | Fallback only |
| Local AI | Auxiliary (20% real TB) | Exception layer |
| Hold-out → 70% program | **Stopped** | Research backlog |

**Moat type:** Audit Knowledge Moat — not LLM Moat.

---

## Commercial Question Answered

Shalfa-style clients need:

```text
Reuse Previous Audit Knowledge
```

not:

```text
General AI Classification
```

Same firm + same ERP + same chart → same GL accounts return every year.

---

## Phase 3C — Three Versions

### V1 — Record (Human Confirm → Memory)

On mapping confirmation by reviewer:

```text
GL Code + Account Name + Map1 + Map2 → Canonical Account
```

Persisted in `TBMappingPattern` (Audit Firm Memory) with:

- `clientAccountCode`, `clientAccountName`, `nameFingerprint`
- `erpMap1Label`, `erpMap2Label`
- `canonicalAccountId`, `hitCount`, audit feedback trail

**Code:** `recordAuditFirmMemoryFromConfirmation()` in `src/lib/tb-intelligence/firm-memory-engine.ts`  
**Wiring:** `confirmMappingAction`, `bulkConfirmSuggestedMappingsAction`

### V2 — Suggest (Year 2 TB Upload)

On new TB upload, pipeline Step 1:

```text
lookupAuditFirmMemory()
  → confidence ≥ 0.85 → auto-suggest mapping (pending human confirm)
```

**Constant:** `FIRM_MEMORY_AUTO_SUGGEST_MIN_CONFIDENCE = 0.85`

Lookup tiers:

1. **gl_code** — organization + GL code (primary)
2. **gl_code_and_name** — code match with name drift tolerated
3. **erp_context** — name fingerprint + Map1/Map2 (code changed)

### V3 — Fallback Pipeline (no memory hit)

```text
Firm Memory
  ↓ miss
ERP Rules (Map1, prefix, name patterns)
  ↓ miss
Pattern matching (prior classifications)
  ↓ miss
Local AI
  ↓ miss
Cloud AI
  ↓ miss
Human Review (mandatory for confirm)
```

**Code:** `classifyTrialBalanceAccount()` in `src/lib/tb-intelligence/engine.ts`

---

## Year-over-Year Model

```text
Year 1: Human maps TB → memory builds (578 Shalfa patterns)
Year 2: 95%+ auto-suggested from memory
Year 3: 98%+ as hit counts accumulate
Year 4: Near-auto classification for stable ERP charts
```

---

## Schema (Phase 3C migration)

`prisma/migrations/20260614140000_firm_memory_erp_context/`

Added to `TBMappingPattern`:

- `nameFingerprint`, `erpMap1Label`, `erpMap2Label`
- `lastConfirmedById`, `lastEngagementId`

---

## Operations

```bash
# Apply migration (once)
npx prisma migrate deploy

# Backfill Shalfa Year 1 memory
npm run phase-3c:backfill

# Validate Year 2 simulation (memory-only)
npm run phase-3c:validate
```

---

## Explicitly Deferred

- Phase 3B.4 Prefix refinement
- Map2 refinement iteration
- Local AI tuning / tenant settings
- RAG, embeddings, fine-tuning, knowledge graph
- Phase 4 UI enhancements (until memory path stable in production)

---

## Related Evidence

- `docs/audits/PHASE_3B2_STRATIFIED_HOLDOUT_REPORT.md` — generalization weak (36.5%)
- `docs/audits/PHASE_3B1_HOLDOUT_REPORT.md` — sequential hold-out 46.1%
- `docs/audits/PHASE_3B_ERP_INTELLIGENCE_REPORT.md` — in-sample 100% = memory capture
- `docs/audits/evidence/phase-3c-firm-memory-validation.json` — Year 2 simulation

---

## Trust Principle (unchanged)

> AI assists. Humans decide. Evidence governs.

Firm memory suggestions remain **pending** until reviewer confirms. No autonomous final mapping.
