# SALESOS SOURCE OF TRUTH MATRIX — Phase 2

> **Date:** 2026-08-17
> **Program:** SALESOS P0 — Domain & Data Unification
> **Status:** Source of Truth Analysis Complete
> **Depends on:** `SALESOS_DOMAIN_DATA_INVENTORY.md` (Phase 1)

---

## Classification Legend

| Label | Meaning |
|-------|---------|
| **CANONICAL** | The single authoritative source. All writes must go here. All reads should come from here. |
| **DUPLICATE** | A second representation of the same data. Must be eliminated or converted to projection. |
| **PROJECTION** | A derived/read-only view of canonical data. Acceptable if clearly one-directional. |
| **LEGACY** | Previously canonical, now superseded. Must be migrated and removed. |
| **STUB** | Defined but never meaningfully implemented or populated. |
| **UNUSED** | Dead code / dead entity. No consumers. Candidate for deletion. |
| **MISSING** | Required by business logic but does not exist in any persistence layer. |

---

## 1. CORE CRM ENTITIES

### 1.1 SalesDeal

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `prisma/schema.prisma:SalesDeal` | **CANONICAL** | Prisma model with full field set, indexes, relations. Server actions write here with await. This is the target single source. |
| `store/opportunities.ts` (in-memory Map) | **LEGACY** | In-memory runtime source of truth for reads. Fire-and-forget dual-write to Prisma. Must be eliminated. |
| `persistence.ts` (file snapshot) | **LEGACY** | JSON file overlay. Must be eliminated. |
| `types.ts:SalesOpportunity` (domain type) | **DUPLICATE** | Competing domain type with different field names (valueEstimate vs amount, name vs title). Must become PROJECTION/DTO. |
| `entity-mappers.ts:prismaDealToOpportunity` | **DUPLICATE BRIDGE** | Maps Prisma→domain, stores stage in metadata JSON. Must be eliminated when Opportunity becomes DTO. |
| `service.ts` (in-memory service) | **LEGACY** | Reads from in-memory store. Competes with `services.ts` (Prisma). Must be eliminated. |
| `services.ts` (Prisma service) | **CANONICAL** | Direct Prisma reads/writes with await. This is the target. |
| `SalesDeal.metadata` JSON (8 sub-domains) | **DUPLICATE** | riskAssessment, outreachDrafts, conversionMemo, reviewDecisions, commercialClaims, aiAnalysis, leadScores, nextAction — all crammed into one JSON blob. Each should be its own Prisma model or extracted field. |
| `SalesDeal.pipelineStage` (string field) | **DUPLICATE** | Redundant with `stageId` FK. Must be removed after full migration to FK-based stages. |
| `SalesDeal.name` (string field) | **DUPLICATE** | Redundant with `title`. Legacy holdover. |

**Competition:** 3 write paths compete (services.ts, store/opportunities.ts, 10+ service modules writing metadata). The Prisma service path is canonical but not the only active writer.

**Resolution:** Make `services.ts` + Prisma the sole write path. Convert `SalesOpportunity` to DTO. Extract metadata sub-domains. Remove `pipelineStage` and `name` fields.

### 1.2 SalesAccount

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `prisma/schema.prisma:SalesAccount` | **CANONICAL** | Target. |
| `store/accounts.ts` (in-memory Map) | **LEGACY** | Runtime source. Must be eliminated. |
| `types.ts:SalesAccount` (domain type) | **DUPLICATE** | Competing type. Must become DTO. |
| `service.ts` (in-memory service) | **LEGACY** | Competes with `services/accounts.ts`. Must be eliminated. |
| `services/accounts.ts` (Prisma) | **CANONICAL** | Target. |
| `SalesAccount.metadata.institutionalMemory[]` | **DUPLICATE** | Embedded JSON blob. Must be extracted to own table. |

### 1.3 SalesContact

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `prisma/schema.prisma:SalesContact` | **CANONICAL** | Target. |
| `store.contacts.ts` (in-memory Map) | **LEGACY** | Runtime source. |
| `types.ts:SalesContact` (domain type) | **DUPLICATE** | Must become DTO. |
| `services/contacts.ts` (Prisma) | **CANONICAL** | Target. |
| `SalesInteraction.contactId` (orphaned FK) | **MISSING** | FK exists but no Prisma relation. Referential integrity gap. |

### 1.4 SalesInteraction

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `prisma/schema.prisma:SalesInteraction` | **CANONICAL** | Target. |
| `store.interactions.ts` (in-memory Map) | **LEGACY** | Runtime source. |
| `types.ts:SalesInteractionLog` (domain type) | **DUPLICATE** | Must become DTO. |
| `types.ts:SalesActivity` (domain type) | **DUPLICATE** | Activities dual-write as Interactions in Prisma. Must be unified. |

### 1.5 SalesEvidenceLink

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `prisma/schema.prisma:SalesEvidenceLink` | **CANONICAL** | Target. |
| `store.evidence.ts` (in-memory Map) | **LEGACY** | Runtime source. |
| `store/common.ts:SalesEvidenceRef` (type) | **DUPLICATE** | Must be eliminated. |

### 1.6 SalesPipeline / SalesPipelineStage

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `prisma/schema.prisma:SalesPipeline` | **CANONICAL** | Already Prisma-only. No in-memory competitor. |
| `prisma/schema.prisma:SalesPipelineStage` | **CANONICAL** | Already Prisma-only. |

**No action needed.** These are already unified.

### 1.7 SalesProposal / SalesReview / SalesApproval

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `prisma/schema.prisma:SalesProposal` | **CANONICAL** | Already Prisma-only. |
| `prisma/schema.prisma:SalesReview` | **CANONICAL** | Already Prisma-only. |
| `prisma/schema.prisma:SalesApproval` | **CANONICAL** | Already Prisma-only. |

**No action needed.** These are already unified.

---

## 2. TIER A INTELLIGENCE ENTITIES

### 2.1 SalesSignal

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `getPrismaAny().salesSignal` (ghost delegate) | **MISSING** | Dynamic Prisma delegate — NOT in schema.prisma. May silently fail. Must be created as real Prisma model. |
| `store.signals.ts` (in-memory Map) | **CANONICAL (current)** | Effective runtime source of truth. Must be replaced by Prisma. |
| `types.ts:SalesSignal` (domain type) | **PROJECTION** | In-memory representation. After migration, becomes DTO. |
| File snapshot (`.data/sales/`) | **LEGACY** | Must be eliminated. |

### 2.2 SalesObjection

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `getPrismaAny().salesObjection` (ghost delegate) | **MISSING** | Must be created as real Prisma model. |
| `store.objections.ts` (in-memory Map) | **CANONICAL (current)** | Must be replaced by Prisma. |
| `types.ts:SalesObjection` | **PROJECTION** | Must become DTO. |

### 2.3 SalesCompetitorMention

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `getPrismaAny().salesCompetitorMention` (ghost) | **MISSING** | Must be created as real Prisma model. |
| `store.competitors.ts` (in-memory Map) | **CANONICAL (current)** | Must be replaced. |
| `types.ts:SalesCompetitorMention` | **PROJECTION** | Must become DTO. |

### 2.4 SalesWinLossInsight

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `getPrismaAny().salesWinLossInsight` (ghost) | **MISSING** | Must be created as real Prisma model. |
| `store.insights.ts:winLossInsights` (in-memory) | **CANONICAL (current)** | Must be replaced. |
| `types.ts:SalesWinLossInsight` | **PROJECTION** | Must become DTO. |

### 2.5 SalesICPInsight

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `getPrismaAny().salesICPInsight` (ghost) | **MISSING** | Must be created as real Prisma model. |
| `store.insights.ts:icpInsights` (in-memory) | **CANONICAL (current)** | Must be replaced. |
| `types.ts:SalesICPInsight` | **PROJECTION** | Must become DTO. |

### 2.6 SalesNextAction

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `getPrismaAny().salesNextAction` (ghost) | **MISSING** | Must be created as real Prisma model. |
| `store.nextActions.ts` (in-memory Map) | **CANONICAL (current)** | Must be replaced. |
| `types.ts:SalesNextAction` | **PROJECTION** | Must become DTO. |

### 2.7 SalesProofAsset

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `getPrismaAny().salesProofAsset` (ghost) | **MISSING** | Must be created as real Prisma model. |
| `store.proofAssets.ts` (in-memory Map) | **CANONICAL (current)** | Must be replaced. |
| `types.ts:SalesProofAsset` | **PROJECTION** | Must become DTO. |

---

## 3. DEAD / UNUSED ENTITIES

### 3.1 SalesLead

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `types.ts:SalesLead` | **UNUSED** | Defined in types, allocated in OrgStore, never populated by any writer. Zero consumers. |
| `store.leads.ts` (in-memory Map) | **UNUSED** | Dead store. |

**Action:** Delete type definition and store allocation. No migration needed.

### 3.2 SalesOutreach (entity, not the outreach drafts system)

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `types.ts:SalesOutreach` | **UNUSED** | Defined, never populated. |
| `store.outreach.ts` | **UNUSED** | Dead store. `listOutreach` returns empty array. |

**Action:** Delete type definition and store allocation. The outreach *drafts* system (which stores in SalesDeal.metadata) is separate and active.

### 3.3 SalesMeeting

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `types.ts:SalesMeeting` | **UNUSED** | Defined, `createMeeting` exists but is never called. |
| `store.meetings.ts:createMeeting` | **STUB** | Function exists but has zero callers. |

**Action:** Decision needed — either integrate into interactions or delete. Since `vnext/meeting-intelligence.ts` computes from interactions, meetings should probably be absorbed into interactions.

---

## 4. AUDIT TRAIL

### 4.1 SalesAuditEntry (in-memory)

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `store.auditLog` (in-memory array) | **CANONICAL (current)** | Runtime source for SalesOS audit reads. |
| `service.ts:recordSalesMutation()` | **STUB** | Writes to PlatformAuditLog are **no-ops** (`service.ts:73-85`). |
| `PlatformAuditLog` (Prisma) | **CANONICAL (platform)** | Server actions write here directly via `logPlatformAudit()`. But SalesOS in-memory reads don't use it. |

**Competition:** Two audit trails exist. SalesOS reads from in-memory `auditLog`. Platform reads from `PlatformAuditLog`. Server actions write to both (PlatformAuditLog directly, in-memory via store).

**Resolution:** Eliminate in-memory `auditLog`. All audit reads should come from `PlatformAuditLog`. Ensure all SalesOS mutations write to `PlatformAuditLog` with `productKey: "salesos"`.

---

## 5. STANDALONE STORES

### 5.1 NbaSuppressionRecord

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `nba-suppression-store.ts` (in-memory + file) | **CANONICAL (current)** | No Prisma model. Should be migrated to Prisma. |

### 5.2 SalesTerritory

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `sales-territory-store.ts` (in-memory only) | **CANONICAL (current)** | Zero persistence. Should be migrated to Prisma. |

---

## 6. INSTITUTIONAL MEMORY

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `SalesAccount.metadata.institutionalMemory[]` (JSON blob) | **CANONICAL (current)** | Embedded in another model's metadata. Should be extracted to own Prisma model. |
| `institutional-memory-shared.ts` (read functions) | **CANONICAL reader** | Reads from Prisma JSON blob. |
| `institutional-memory-sync.ts` (write functions) | **CANONICAL writer** | Writes to Prisma JSON blob. |

---

## 7. COMPUTED v02 MODULES

| Module | Classification | Explanation |
|--------|---------------|-------------|
| Knowledge Graph | **PROJECTION** (computed on-the-fly from in-memory store) | Must read from Prisma after migration. |
| Proof Network | **PROJECTION** (computed from typed args) | Already decoupled. Caller must provide Prisma-backed data. |
| Proof Effectiveness | **PROJECTION** (computed from in-memory store) | Must read from Prisma after migration. |
| Market Intelligence | **PROJECTION** (computed from typed args) | Already decoupled. |
| Institutional Learning | **PROJECTION** (computed from typed args) | Already decoupled. |
| Strategic Recommendations | **PROJECTION** (computed from in-memory store) | Must read from Prisma after migration. |
| Cross-Product Signals | **STUB** (aggregator throws PLANNED) | Unreachable code. |

---

## 8. vNext MODULES

| Module | Classification | Explanation |
|--------|---------------|-------------|
| account-intelligence | **PROJECTION** (pure computation) | No persistence. Reads typed args. |
| opportunity-intelligence | **PROJECTION** (pure computation) | No persistence. |
| pipeline-analytics | **PROJECTION** (pure computation) | No persistence. |
| meeting-intelligence | **PROJECTION** (pure computation) | No persistence. |
| revenue-intelligence | **PROJECTION** (reads in-memory store) | Must migrate to Prisma reads. |
| commercial-memory/* | **PROJECTION** (pure computation) | No persistence. |
| commercial-proof-network-overview | **PROJECTION** (pure computation) | No persistence. |
| proof-network-overview | **PROJECTION** (pure computation) | No persistence. |
| institutional-learning-links | **PROJECTION** (pure computation) | No persistence. |
| deal-review | **STUB** (throws PLANNED) | 4 stubs throw at runtime. |
| proposal-workflow | **STUB** (throws PLANNED) | 2 stubs throw at runtime. |
| commercial-review-runtime | **STUB** (throws PLANNED) | 2 stubs throw at runtime. |
| workspace-metadata | **STUB** (throws PLANNED) | 1 stub throws at runtime. |
| commercial-evidence | **STUB** (always-false) | validateProductEvidenceType returns false. |
| learning-loop | **STUB** (documentation facade) | Status view, no logic. |
| 7 bridge files | **BRIDGE** (re-exports v02) | Trivially mergeable. |

---

## 9. CROSS-PRODUCT EVENT HANDLERS

| Handler | Classification | Explanation |
|---------|---------------|-------------|
| `("sales", "*")` | **STUB** | logger.info only. |
| `("audit", "review.completed")` | **STUB** | logger.info only. Comment says "checking" but does nothing. |
| `("lc", "project.classified")` | **STUB** | logger.info only. Comment says "checking" but does nothing. |

---

## 10. DUPLICATE CODE PATTERNS

### 10.1 assertDealInOrg

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `repositories/org-scope.ts:assertDealInOrg` | **CANONICAL** | Should be the single implementation. |
| `evidence-links.ts:assertDealInOrg` | **DUPLICATE** | Must be replaced with canonical import. |
| `interactions.ts:assertDealInOrg` | **DUPLICATE** | Must be replaced with canonical import. |
| `outreach.ts:assertDealInOrg` | **DUPLICATE** | Must be replaced with canonical import. |

### 10.2 Service Layers

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `src/lib/sales/services.ts` | **CANONICAL** | Prisma-based. Target. |
| `src/lib/sales/service.ts` | **LEGACY** | In-memory based. Must be eliminated. |

### 10.3 proof-network-overview

| Location | Classification | Explanation |
|----------|---------------|-------------|
| `vnext/commercial-proof-network-overview.ts` | **DUPLICATE** | Same function name as below. |
| `vnext/proof-network-overview.ts` | **CANONICAL** | More complete implementation. |

---

## 11. COMPETING SOURCE OF TRUTH SUMMARY

### Critical Competitions (must resolve)

| # | Entity | Current Truth A | Current Truth B | Resolution |
|---|--------|----------------|-----------------|------------|
| 1 | SalesDeal | Prisma (services.ts) | In-memory store (store/opportunities.ts) | Eliminate in-memory, Prisma becomes sole truth |
| 2 | SalesAccount | Prisma (services/accounts.ts) | In-memory store (store/accounts.ts) | Same |
| 3 | SalesContact | Prisma (services/contacts.ts) | In-memory store (store/contacts.ts) | Same |
| 4 | SalesInteraction | Prisma (services/interactions.ts) | In-memory store (store/interactions.ts) | Same |
| 5 | SalesEvidenceLink | Prisma (evidence-links.ts) | In-memory store (store/evidence.ts) | Same |
| 6 | SalesAuditEntry | PlatformAuditLog (server actions) | In-memory auditLog (store) | Unify to PlatformAuditLog |
| 7 | SalesDeal.stage | `stageId` FK column | `pipelineStage` string + `metadata.stage` JSON | Eliminate duplicates, keep FK only |
| 8 | SalesDeal metadata sub-domains | 8+ domains in one JSON blob | Should be separate Prisma models | Extract to proper models |

### Moderate Competitions (address in Wave B/C)

| # | Entity | Current Truth A | Current Truth B | Resolution |
|---|--------|----------------|-----------------|------------|
| 9 | Institutional Memory | SalesAccount.metadata JSON blob | Should be own table | Extract to Prisma model |
| 10 | NBA Suppressions | In-memory + file | Should be Prisma | Migrate to Prisma |
| 11 | Territories | In-memory only | Should be Prisma | Migrate to Prisma |

### Already Resolved (no action)

| Entity | Single Truth |
|--------|-------------|
| SalesPipeline | Prisma |
| SalesPipelineStage | Prisma |
| SalesProposal | Prisma |
| SalesReview | Prisma |
| SalesApproval | Prisma |

---

## 12. ENVIRONMENT FLAGS

The following env flags control persistence behavior and must be understood for migration:

| Flag | File | Effect |
|------|------|--------|
| `SALESOS_FILE_PERSISTENCE` | `store/common.ts:81-83` | Enables file snapshot persistence |
| `SALESOS_PRISMA_PERSISTENCE` | `store/common.ts:85-87` | Enables fire-and-forget Prisma writes from in-memory store |
| `TIER_A_FILE_SNAPSHOT_ENABLED` | `store/common.ts:90-91` | OR of above two flags |

**Migration implication:** After migration, these flags become irrelevant. All persistence should go through Prisma directly.

---

## 13. PRISMA SCHEMA GAPS

The following entities require NEW Prisma models (currently missing from schema.prisma):

| Entity | Required Fields | Relations |
|--------|----------------|-----------|
| `SalesSignal` | id, organizationId, opportunityId, accountId, type, subject, body, severity, source, metadata, createdAt | opportunity, account |
| `SalesObjection` | id, organizationId, opportunityId, accountId, category, subject, body, severity, status, metadata, createdAt | opportunity, account |
| `SalesCompetitorMention` | id, organizationId, opportunityId, accountId, competitorName, mentionContext, sentiment, source, metadata, createdAt | opportunity, account |
| `SalesWinLossInsight` | id, organizationId, opportunityId, outcome, reason, category, confidence, source, metadata, createdAt | opportunity |
| `SalesICPInsight` | id, organizationId, accountId, criterion, score, rationale, source, metadata, createdAt | account |
| `SalesNextAction` | id, organizationId, opportunityId, accountId, action, rationale, priority, confidence, source, metadata, createdAt | opportunity, account |
| `SalesProofAsset` | id, organizationId, opportunityId, accountId, title, category, url, metadata, createdAt | opportunity, account |
| `SalesTerritory` | id, organizationId, name, description, ownerIds, metadata, createdAt | — |
| `SalesNbaSuppression` | id, organizationId, nbaActionId, action, suppressedUntil, createdAt | — |
| `SalesInstitutionalMemory` | id, organizationId, accountId, type, content, confidence, source, metadata, createdAt | account |

**Total: 10 new Prisma models required.**

---

*End of Phase 2 — Source of Truth Matrix*
