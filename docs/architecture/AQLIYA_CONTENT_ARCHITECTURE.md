# AQLIYA Content Architecture

**Date:** 2026-08-17
**Status:** Evidence-driven, read-only
**Scope:** Canonical content chain, source-of-truth mapping, content classification

---

## 1. Architectural Principle

> Knowledge First → Human Governed → AI Assisted
> Knowledge grounds. Governance controls. Humans decide. AI assists.

This architecture defines how authoritative knowledge flows through AQLIYA — from source ingestion to AI-assisted output.

---

## 2. Canonical Content Chain

The canonical content chain describes how knowledge flows from authoritative sources to AI-grounded outputs:

```
Source (Authority) → Document (Standard) → Version (Effective Period) → ContentUnit (Granular) → Claim (Extracted) → Evidence (Backing) → Embedding (Vector) → Retrieval (RAG) → AI (Orchestration) → Citation (Output)
```

### 2.1 Stage Definitions

| Stage | Entity | Description | Current Status |
|-------|--------|-------------|----------------|
| 1. Source | Authority | The authoritative body (IFRS Foundation, IAASB, SOCPA, LCGPA) | **VERIFIED** — 5 primary authorities defined |
| 2. Document | Standard | A specific standard (IAS 1, ISA 260, SOCPA Circular) | **VERIFIED** — 56 admitted standards |
| 3. Version | Effective Period | A specific version of a standard with effective dates | **VERIFIED** — Version metadata on all admitted assets |
| 4. ContentUnit | Granular Section | A specific section, paragraph, or requirement within a version | **PARTIALLY VERIFIED** — rules.json files contain granular rules |
| 5. Claim | Extracted Assertion | A factual claim extracted from content (e.g., "IAS 1 requires a complete set of financial statements") | **VERIFIED** — Rules contain claims |
| 6. Evidence | Backing | Source citation, line reference, or supporting evidence for a claim | **PARTIALLY VERIFIED** — Evidence types defined in types |
| 7. Embedding | Vector | Vectorized representation for semantic search | **MISSING** — `vectorIndex: false` on all assets |
| 8. Retrieval | RAG | Semantic retrieval of relevant knowledge for AI context | **MISSING** — `ai.rag` flag OFF, blocked at asset level |
| 9. AI | Orchestration | AI processing with knowledge-grounded context | **PARTIALLY VERIFIED** — Orchestrator exists but dormant |
| 10. Citation | Output | Traceable reference from AI output back to source knowledge | **PARTIALLY VERIFIED** — Citation types exist, runtime not verified |

### 2.2 Gap Analysis

The chain is complete at stages 1-5. Stages 6-10 are architecturally present but not operational.

**Critical missing link:** Stage 7 (Embedding) — without vectorization, stages 8-10 cannot function.

---

## 3. Source-of-Truth Mapping

### 3.1 Knowledge Foundation Artifacts

| Artifact | Purpose | Content |
|----------|---------|---------|
| `knowledge-authority-matrix.json` | Defines authority levels A-E | Levels, primary authorities, scoring rules |
| `knowledge-storage-matrix.json` | Defines storage patterns | File-based, database, hybrid |
| `knowledge-domain-map.json` | Maps domains to authorities | ifrs, isa, isqm, socpa, local-content |
| `knowledge-confidence-model.json` | Defines confidence scoring | Levels, ranges, calculation rules |
| `knowledge-lineage-model.json` | Defines provenance chains | A-E lineage types, parent-child relationships |
| `knowledge-version-policy.json` | Defines versioning rules | Version history, supersession, effective dates |
| `knowledge-ontology.json` | Defines domain taxonomy | Domains, subdomains, entity types |
| `knowledge-licensing-matrix.json` | Defines content licensing | Public, restricted, internal, licensed |

**VERIFIED:** All 8 canonical artifacts exist in `knowledge-foundation/artifacts/`.

### 3.2 Authority Levels

| Level | Name | Rule Creation | Confidence Range | Content Status |
|-------|------|--------------|-----------------|----------------|
| A | Primary Authorities | executable | 95-100 | 56 admitted |
| B | Secondary Authorities | guidance only | 70-90 | Empty |
| C | Firm Methodology | internal | — | Empty |
| D | Template Required | — | — | Empty |
| E | Repeated Approval | — | 85-99 | Empty |

**VERIFIED:** Authority model defined. Only Level A populated.

---

## 4. Content Classification

### 4.1 By Authority Level

| Level | Count | Examples | AI Grounding |
|-------|-------|---------|-------------|
| A | 56 | IFRS, ISA, ISQM, SOCPA | Can be used for grounded AI |
| B | 0 | — | — |
| C | 0 | — | — |
| D | 0 | — | — |
| E | 0 | — | — |

### 4.2 By Domain

| Domain | Count | Production Admitted | RAG Enabled |
|--------|-------|-------------------|-------------|
| IFRS | 32 | Yes | No |
| ISA | 2 | Yes | No |
| ISQM | 1 | Yes | No |
| SOCPA | 6 | Yes | No |
| Local Content | 2 | No (staging) | No |

### 4.3 By Status

| Status | Count | Description |
|--------|-------|-------------|
| productionAdmitted | 56 | Ready for production use |
| pendingReview | 2 | Awaiting review (Local Content) |
| ingestionStaging | 2 | In ingestion pipeline |
| draft | — | Not yet submitted |

### 4.4 By RAG Readiness

| RAG Status | Count | Description |
|------------|-------|-------------|
| `ragIngest: false` | 58 | NOT vectorized |
| `vectorIndex: false` | 58 | NOT indexed |

**Critical finding:** 0 assets are RAG-ready.

---

## 5. Content Studio Architecture

### 5.1 Components

| Component | File | Purpose |
|-----------|------|---------|
| Types | `types.ts` | ContentProject, Campaign, ContentItem, Source, Review, Output |
| Contracts | `contracts.ts` | Service contracts |
| Services | `services.ts` | Business logic |
| Workflow | `workflow.ts` | Content lifecycle |
| Evidence | `evidence.ts` | Evidence management |
| Review | `review.ts` | Review/approval |
| Outputs | `outputs.ts` | Output generation |
| AI | `ai.ts` | AI assistance |
| Permissions | `permissions.ts` | RBAC |
| Repository | `repository.ts` | Data access interface |
| Prisma Repository | `prisma-repository.ts` | Prisma implementation |

### 5.2 Content Item Workflow

```
idea → draft → in_review → changes_requested → approved → ready_to_publish → published → archived
```

### 5.3 Current State

**VERIFIED:** Full infrastructure exists (28 files).
**MISSING:** No production content items, campaigns, or projects.

**VERDICT:** Content Studio is mature infrastructure with no production content.

---

## 6. Knowledge-to-AuditOS Bridge

### 6.1 Current Implementation

**File:** `src/lib/audit/rules/ifrs-rules-loader.ts`

The bridge is **filesystem-based**:
- Reads rules from `knowledge-foundation/domains/ifrs/*/rules.json`
- Filters by `EXECUTABLE_IFRS_TOPICS`
- Returns rules for engine evaluation

### 6.2 Governance Implications

| Aspect | Status | Risk |
|--------|--------|------|
| Traceability | File path only | No audit trail |
| Versioning | Depends on file content | May use outdated rules |
| Access control | Filesystem permissions | No RBAC |
| Lineage | Not tracked | Cannot prove rule source |

### 6.3 Recommended Architecture

```
Knowledge Foundation (admitted) → API/Database → AuditOS Rules Engine
```

Current: `Filesystem → AuditOS Rules Engine`

**PARTIALLY VERIFIED:** Bridge exists but is not governed.

---

## 7. AI Grounding Architecture

### 7.1 Current State

| Component | Status | Feature Flag |
|-----------|--------|-------------|
| AIOrchestrator | Exists | — |
| Providers (6) | Registered | `ai.real-providers` (ON) |
| RAG Pipeline | Exists | `ai.rag` (ON) — blocked at asset level |
| Embeddings | Exists | `ai.rag` (ON) — blocked at asset level |
| Similarity Search | Exists | `ai.rag` (ON) — blocked at asset level |
| Context Builder | Exists | `ai.rag` (ON) — blocked at asset level |
| Prompt Sanitization | Exists | — |
| Budget Quotas | Exists | `ai.budget-quotas` (OFF) |

### 7.2 Grounding Flow (When Asset-Level Block is Resolved)

```
User Query → Prompt Sanitization → Embedding → Similarity Search → Context Builder → AI Provider → Citation → Output
```

### 7.3 Current Reality

```
User Query → Prompt Sanitization → AI Provider (flag ON) → Output without RAG context (ragIngest: false blocks retrieval)
```

**VERIFIED:** AI grounding infrastructure exists. Feature flags are ON. RAG is blocked at asset admission level (`ragIngest: false` on all 56 assets), not at the flag level.

---

## 8. Content Quality Dimensions

### 8.1 Completeness

| Dimension | Status | Assessment |
|-----------|--------|-----------|
| Authority coverage | 5 of 5 Level A | Good |
| Standard coverage | 61 of 100+ | Partial |
| Topic coverage | 38 executable topics | Partial |
| Domain coverage | 5 domains | Good |
| Language coverage | English only | Poor |

### 8.2 Accuracy

| Dimension | Status | Assessment |
|-----------|--------|-----------|
| Source fidelity | Rules match standards | Good |
| Version accuracy | Current versions admitted | Good |
| Effective date alignment | Not enforced | Risk |
| Supersession handling | Not tracked | Risk |

### 8.3 Traceability

| Dimension | Status | Assessment |
|-----------|--------|-----------|
| Source citation | Rules reference standards | Good |
| Lineage chains | Defined but not linked | Partial |
| Confidence scores | Hardcoded to 95 | Not differentiated |
| Audit trail | Governance events logged | Good |

### 8.4 Operational Readiness

| Dimension | Status | Assessment |
|-----------|--------|-----------|
| Vectorization | Blocked | Not ready |
| RAG retrieval | Blocked | Not ready |
| API access | Not implemented | Not ready |
| Caching | Not implemented | Not ready |

---

## 9. Architectural Recommendations

### 9.1 Immediate (P0)

1. **Enable RAG** — Vectorize the 56 admitted assets
2. **Activate feature flags** — `ai.rag`, `ai.real-providers`
3. **Add Arabic knowledge** — Arabic rules for Arabic-first UX

### 9.2 Short-term (P1)

1. **Governed knowledge bridge** — Replace filesystem-based loading with API/database access
2. **Effective-date activation** — Time-based rule filtering
3. **Supersession tracking** — Track version chains
4. **ISA corpus expansion** — Ingest remaining 28+ ISA standards

### 9.3 Medium-term (P2)

1. **Content Studio activation** — Create production content items
2. **Level B-E content** — Populate firm methodology and templates
3. **Confidence gradient** — Differentiate scores by authority level
4. **Runtime licensing enforcement** — License-aware content delivery

### 9.4 Long-term (P3)

1. **Knowledge marketplace** — Allow third-party knowledge contributions
2. **Real-time updates** — Subscribe to standard updates
3. **Cross-jurisdiction mapping** — Map IFRS to local standards
4. **Knowledge analytics** — Track usage and relevance

---

## 10. Final Assessment

**Content Architecture Maturity:** L4 (Architecture is sound, implementation is partial)
**Content Pipeline Maturity:** L2 (Ingestion works, output is blocked)
**AI Grounding Maturity:** L1 (Infrastructure exists, nothing operational)

The content architecture is well-designed with clear separation of concerns. The canonical chain (Source → Citation) is complete at stages 1-5 but blocked at stage 7 (Embedding). The primary architectural weakness is the filesystem-based knowledge bridge, which bypasses governance controls.

**The architecture is not the problem. The problem is activation.**

---

*This document was produced as part of the AQLIYA Content + AuditOS Reality Audit on 2026-08-17. No source code was modified.*
