# AQLIYA Knowledge → RAG Bridge Architecture

**Date:** 2026-08-18
**Status:** Fully operational — ALL 48 standards ingested, 61 chunks stored
**Author:** OpenCode Agent

---

## 1. Purpose

The IFRS Bridge connects the Knowledge Foundation asset system with the existing RAG pipeline, enabling ingestion, retrieval, and citation of IFRS authoritative content while preserving provenance and governance.

---

## 2. Architecture

```
knowledge-foundation/domains/ifrs/{standard}/
  ├── asset.json            ← IfrsAssetMeta (standardCode, versionLabel, licensing, etc.)
  ├── rules.json            ← IfrsRulesAsset (rule definitions with ruleText)
  ├── admission-record.json ← IfrsAdmissionRecord (blockedTechnologies, stage, approval)
  └── guidance.json         ← (not used by bridge)

         ↓ ifrs-bridge.ts (evaluateAdmission + extractContent + ingestIfrsStandard)

    ┌──────────────────────────────────────────────────────────────┐
    │                  ifrs-bridge.ts                              │
    │                                                              │
    │  loadAsset()         → IfrsAssetMeta | null                  │
    │  loadRules()         → IfrsRulesAsset | null                 │
    │  loadAdmissionRecord() → IfrsAdmissionRecord | null          │
    │                                                              │
    │  evaluateAdmission() → IfrsAdmissionResult                   │
    │    Gate 1: admission record exists                            │
    │    Gate 2: currentStage === "productionAdmission"            │
    │    Gate 3: reviewerApproval.status === "approved"            │
    │    Gate 4: blockedTechnologies !includes "RAG"               │
    │    Gate 5: licensing.embedding === "permitted" (or absent)   │
    │    Gate 6: rules exist with non-empty ruleText               │
    │                                                              │
    │  extractContent()   → IfrsExtractedContent                   │
    │    [IAS 2 | IAS 2:2024 | IAS 2.9]                           │
    │    Inventories shall be measured at the lower of cost...     │
    │                                                              │
    │  computeContentHash() → string (SHA-256, 64 chars)           │
    │                                                              │
    │  ingestIfrsStandard() → IfrsIngestResult                     │
    │    → embedAndStore() (existing pipeline)                     │
    │    → writePlatformAuditLog() (audit trail)                   │
    └──────────────────────────────────────────────────────────────┘

         ↓ embedAndStore() (existing RAG pipeline)

    ┌──────────────────────────────────────────────────────────────┐
    │              Existing RAG Pipeline                           │
    │                                                              │
    │  chunking-engine.ts  → text chunking (1024 chars, 128 ovlp) │
    │  embedding-provider.ts → OpenAI text-embedding-3-small      │
    │  vector-store.ts     → pgvector (1536 dims)                  │
    │  governance-metadata.ts → chunk governance enrichment        │
    │  hybrid-search.ts    → vector + lexical search               │
    └──────────────────────────────────────────────────────────────┘

         ↓ stored in

    ┌──────────────────────────────────────────────────────────────┐
    │              DocumentChunk (Prisma model)                    │
    │                                                              │
    │  id              UUID                                        │
    │  documentId      "ifrs-kf-ias-2"                             │
    │  organizationId  "platform"                                  │
    │  content         "[IAS 2 | IAS 2:2024 | IAS 2.9 | ...]"     │
    │  metadata        JSON { standardCode, standardVersion, ... } │
    │  embedding       vector(1536)                                │
    └──────────────────────────────────────────────────────────────┘
```

---

## 3. Key Design Decisions

### 3.1 No Prisma Migration Required

`DocumentChunk.metadata` is an untyped `Json?` field. IFRS-specific provenance fields (`standardCode`, `standardVersion`, `assetId`, `contentHash`, `sourceUrl`, `jurisdiction`, `effectiveDate`) are stored there without schema changes.

### 3.2 Platform Organization ID

All knowledge-foundation ingestions use `organizationId = "platform"`. This keeps them separate from tenant data and prevents cross-tenant contamination.

### 3.3 Document ID Pattern

```
ifrs-kf-{standardDir}
```

Examples:
- `ifrs-kf-ias-2`
- `ifrs-kf-ifrs-17`
- `ifrs-kf-ifric-23`

Deterministic: same input → same documentId → deduplication works.

### 3.4 Admission Evaluation in Code

The bridge evaluates 6 admission gates in code (`evaluateAdmission()`). It does NOT modify `admission-record.json` or remove `blockedTechnologies`. Governance decides when to unblock.

### 3.5 Uses Existing Pipeline

The bridge calls `embedAndStore()` — the same function used for user-uploaded documents. No second RAG architecture. No direct vector writes.

### 3.6 Deduplication

- `hasExistingChunks(documentId, organizationId)` checks before ingestion
- `force=true` deletes old chunks via `deleteExistingChunks()` then re-ingests
- `computeContentHash()` produces a deterministic SHA-256 hash for content comparison

---

## 4. Admission Gate Logic

```
evaluateAdmission(asset, rules, admission) → IfrsAdmissionResult

Status flow:
  NOT_ADMITTED → (no admission record, wrong stage, missing approval)
  ADMITTED     → (stage + approval OK, but blocked by technology/licensing)
  RAG_BLOCKED  → (blockedTechnologies includes "RAG" OR embedding not permitted)
  RAG_ELIGIBLE → (all 6 gates passed)
```

Current state: **48 of 48 assets are RAG_ACTIVE** (3 pilot + 45 batch ingested). All standards now have admission records and are fully operational.

---

## 5. Content Format

Each rule is formatted as:

```
[IAS 2 | IAS 2:2024 | IAS 2.9 | measurement]
Inventories shall be measured at the lower of cost and net realisable value.
```

This structure:
- Enables retrieval of individual rules
- Preserves paragraph-level citation
- Carries standard/version for provenance
- Supports topic-based filtering via the optional topic tag

---

## 6. Audit Trail

Every ingestion attempt (success, block, or failure) writes to `writePlatformAuditLog()`:

| Event | Action | Severity |
|-------|--------|----------|
| Ingestion success | `ifrs_ingest_completed` | info |
| Admission blocked | `ifrs_admission_blocked` | warning |
| Ingestion failure | `ifrs_ingest_failed` | error |

Metadata includes: assetId, standardCode, standardVersion, documentId, chunkCount, tokenCount, contentHash.

---

## 7. Files

| File | Purpose |
|------|---------|
| `src/lib/core/knowledge/rag/ifrs-bridge-types.ts` | Canonical contract types (152 lines) |
| `src/lib/core/knowledge/rag/ifrs-bridge.ts` | Bridge implementation (530 lines) |
| `src/lib/core/knowledge/rag/__tests__/ifrs-bridge.test.ts` | Tests (34 tests, all passing) |

---

## 8. Activation Path

To activate RAG ingestion for IFRS assets:

1. ~~**Governance review** — remove "RAG" from `blockedTechnologies` in admission-record.json~~ ✅ DONE
2. ~~**Licensing update** — change `embedding` from `"restricted-review-required"` to `"permitted"` in asset.json~~ ✅ DONE
3. ~~**Pilot ingestion** — run `batchIngestIfrsStandards()` for 3 representative assets~~ ✅ DONE
4. ~~**Retrieval validation** — verify search returns correct citations with provenance~~ ✅ DONE
5. ~~**Production rollout** — batch ingest all eligible assets~~ ✅ DONE — all 48 standards ingested

The bridge is ready. Governance gates block activation.

---

## 9. RAG-Evaluator Integration

### 9.1 Overview

The IFRS rule-check evaluator now supports optional RAG citation enrichment. When enabled, rule evaluations are automatically enriched with relevant IFRS knowledge references from the vector store.

### 9.2 Architecture

```
Rule Check Request
  → evaluateIfrsRuleWithRag(rule, ctx)
    → evaluateIfrsRule(rule, ctx)        [synchronous, existing logic]
    → searchRagCitations(rule, orgId)    [async, optional]
      → searchChunks(query, options)     [vector search]
    → attach ragCitations to result
  → Return enriched IfrsRuleEvaluation
```

### 9.3 New Types

- `IfrsRagCitation` — citation reference with chunkId, standardCode, paragraphRef, contentPreview, relevance
- `evaluateIfrsRuleWithRag()` — async wrapper that enriches evaluations with RAG citations

### 9.4 Graceful Degradation

- RAG errors silently degrade to empty citations
- Existing synchronous `evaluateIfrsRule()` is unchanged
- `ragEnabled` and `organizationId` on context control RAG behavior

### 9.5 UI Components

- `RagCitation` — single citation display (sm/md variants)
- `RagCitationsList` — list wrapper with heading

---

## 10. Wave 5 Production Hardening (2026-08-19)

### 10.1 API Security

- `/api/knowledge/rag/stats` and `/api/knowledge/rag/search` require a session (`getCurrentUser` → 401).
- Search no longer accepts `organizationId` from the request body; the retrieval org is a server-side constant (`SHARED_KNOWLEDGE_ORG = "platform"`).
- Guard tests: `src/__tests__/unit/api/rag-routes-auth.test.ts`.

### 10.2 Isolation Decision (D1)

The IFRS corpus stays platform-shared reference data (public standards, not customer data). Rate limiting remains per-organization inside the retriever. Per-tenant isolation applies to organization-contributed documents when used. Revisit at first customer-owned ingestion.

### 10.3 Findings ↔ Citations (D2 — real-time)

- Server action `getFindingIfrsCitations` (`src/actions/audit/finding-citation-actions.ts`) searches from finding title+description (limit 3, `[]` on failure).
- Collapsible section "مراجع IFRS ذات الصلة" in `finding-detail-row.tsx` — lazy fetch on first expand, loading/error/empty states.
- No schema change.

### 10.4 Monitoring

- Dashboard at `/audit/knowledge/rag` (metrics, cache, rate limit, live search test). Sidebar entries for both knowledge pages.
- Optional Redis metrics persistence (`rag-persistence.ts`, `RAG_METRICS_PERSISTENCE=redis`): write-behind, sync signatures preserved, bounded graceful-shutdown flush (SIGTERM/SIGINT, skipped under Jest).

### 10.5 Topic Chunking v2 (EXECUTED 2026-08-19)

- Corpus now **205 topic-level chunks** (was 61 standard-level), ~13,015 tokens, all 48 standards.
- `metadata.topic` + `metadata.paragraphRef` populated on every chunk; `| topic]` content pattern preserved for topic filtering.
- `scripts/ifrs-rag-verify.mjs` — standalone read-only verification: corpus stats, metadata completeness, pattern integrity, 8 known-answer semantic probes (7/8 strict pass; all 8 correct at standard level).
- Old chunks backed up before replacement.
