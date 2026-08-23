# SALESOS DOMAIN DATA INVENTORY — Phase 1 Forensic Report

> **Date:** 2026-08-17
> **Program:** SALESOS P0 — Domain & Data Unification
> **Status:** Forensic Inventory Complete
> **Baseline commit:** `737eec9` (2026-07-16) + subsequent local changes
> **Principle:** Every claim has a code reference. Do not trust documentation.

---

## Executive Summary

SalesOS contains **18 named entity types** across three persistence tiers:

| Tier | Entity Count | Prisma Model? | Source of Truth |
|------|-------------|---------------|-----------------|
| Core CRM | 6 | YES (real schema) | **In-memory Map** (Prisma is fire-and-forget shadow) |
| Tier A Intelligence | 7 | NO (dynamic `getPrismaAny()` ghost delegates) | **In-memory Map** |
| Core Non-Prisma | 4 | NO | **In-memory Map** (2 dead, 1 never-written, 1 dual) |
| Standalone Stores | 2 | NO | **In-memory Map** + optional file |
| Institutional Memory | 1 | Embedded in `SalesAccount.metadata` JSON | **Prisma JSON blob** |
| Computed v02/vNext | 7 modules | NONE | **Computed on-the-fly** from in-memory store |

**Critical finding:** The in-memory `OrgStore` is the universal runtime source of truth for ALL reads. Prisma writes via `persistPrismaWrite()` are fire-and-forget with `.catch()` — if they fail, the system continues unaffected. This means **PostgreSQL is a shadow copy, not an authority** for the majority of SalesOS data.

---

## 1. SALESDEAL (Canonical Deal Aggregate)

### 1.1 Prisma Definition

| Field | Type | Notes |
|-------|------|-------|
| `id` | String | `@id @default(cuid())` |
| `organizationId` | String | Tenant isolation |
| `platformOrganizationId` | String? | Platform bridge |
| `accountId` | String | FK → SalesAccount (`onDelete: Restrict`) |
| `stageId` | String? | FK → SalesPipelineStage (`onDelete: SetNull`) |
| `name` | String? | Legacy name field |
| `title` | String | Primary deal title |
| `pipelineStage` | String | Default "new" — **redundant with stageId** |
| `status` | String | Default "open" — open/won/lost/archived |
| `amount` | Float? | Deal value |
| `currency` | String | Default "SAR" |
| `probability` | Float? | Win probability 0-100 |
| `qualificationScore` | Float? | ICP score |
| `expectedCloseDate` | DateTime? | Forecasting |
| `reviewStatus` | String? | Governance state |
| `approvalStatus` | String? | Governance state |
| `ownerId` | String? | Deal owner |
| `isDemo` | Boolean | Default false |
| `metadata` | Json? | **Catch-all: risk, outreach, memo, reviews, AI, scores** |
| `createdById` | String? | Audit |
| `updatedById` | String? | Audit |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |

**Relations:** evidenceLinks, interactions, proposals, reviews, approvals
**Indexes:** 8 (org+status+time, org+updateTime, account, stage, platform, demo, pipelineStage, owner)

**File:** `prisma/schema.prisma:2447-2488`

### 1.2 In-Memory Representation

| Aspect | Detail |
|--------|--------|
| **Type** | `SalesOpportunity` (`src/lib/sales/types.ts:203-225`) |
| **Store** | `Map<string, SalesOpportunity>` in `src/lib/sales/store/opportunities.ts` |
| **Key fields** | id, organizationId, accountId, name, stage, valueEstimate, currency, qualificationScore, probability, expectedCloseDate, risks, winLossReason, ownerId, reviewStatus, approvalStatus, source, confidence, evidenceLinkage |
| **Stage normalization** | `canonicalizeOpportunityStage()` and `normalizeOpportunityStage()` in `types.ts:119-141` |

### 1.3 File Persistence

| Aspect | Detail |
|--------|--------|
| **File** | `src/lib/sales/persistence.ts:26-175` |
| **Path** | `.data/sales/{orgId}.json` |
| **Enabled by** | `SALESOS_FILE_PERSISTENCE=1` env var |
| **Format** | `SalesOrgSnapshot` JSON — includes opportunities array |
| **Load order** | Prisma core → Tier A file overlay → file snapshot overlay |

### 1.4 Writers (Complete List)

| Writer | File | Line | Mechanism | Awaits? |
|--------|------|------|-----------|---------|
| `createSalesDeal` | `src/lib/sales/services.ts` | 137-195 | `prisma.salesDeal.create` | YES |
| `updateSalesDeal` | `src/lib/sales/services.ts` | 197-325 | `prisma.salesDeal.update` | YES |
| `updateDealNextAction` | `src/lib/sales/services.ts` | 591-630 | `prisma.salesDeal.update` | YES |
| `createOpportunity` | `src/lib/sales/store/opportunities.ts` | 37-53 | In-memory Map + `persistPrismaWrite` (fire-and-forget) | NO |
| `updateOpportunity` | `src/lib/sales/store/opportunities.ts` | 55-71 | In-memory Map + `persistPrismaWrite` (fire-and-forget) | NO |
| `opportunityRepository.create` | `src/lib/sales/repositories/opportunity-repository.ts` | 43-46 | `prisma.salesDeal.create` | YES |
| `opportunityRepository.update` | `src/lib/sales/repositories/opportunity-repository.ts` | 48-83 | `prisma.salesDeal.updateMany` | YES |
| `recordReviewDecision` | `src/lib/sales/governance.ts` | 143-211 | `prisma.salesDeal.update` (writes to metadata) | YES |
| `submitSalesOpportunityForReview` | `src/lib/sales/l5-governance.ts` | 33-130 | Creates review + writes deal metadata | YES |
| `approveSalesOpportunity` | `src/lib/sales/l5-governance.ts` | 132-212 | Creates approval + writes deal metadata | YES |
| `rejectSalesOpportunity` | `src/lib/sales/l5-governance.ts` | 214-276 | Creates approval + writes deal metadata | YES |
| `reviewCommercialClaimOnDeal` | `src/lib/sales/commercial-claims.ts` | 353-382 | `prisma.salesDeal.update` (metadata) | YES |
| `persistOutreachDrafts` | `src/lib/sales/outreach.ts` | 198-217 | `prisma.salesDeal.update` (metadata) | YES |
| `approveOutreachDraft` | `src/lib/sales/outreach.ts` | 260-283 | `prisma.salesDeal.update` (metadata) | YES |
| `persistConversionMemo` | `src/lib/sales/conversion-memo.ts` | 198-227 | `prisma.salesDeal.update` (metadata) | YES |
| `analyzeDealWithAI` | `src/actions/sales-intel-actions/ai-analysis.ts` | 83-98 | `prisma.salesDeal.update` (metadata) | YES |
| `scoreDealLeadsAction` | `src/actions/sales-intel-actions/index.ts` | 528-538 | `prisma.salesDeal.update` (metadata) | YES |

### 1.5 Readers (Complete List)

| Reader | File | Line | Mechanism |
|--------|------|------|-----------|
| `listSalesDeals` | `src/lib/sales/services.ts` | 49-55 | `prisma.salesDeal.findMany` |
| `getSalesDeal` | `src/lib/sales/services.ts` | 57-62 | `prisma.salesDeal.findFirst` |
| `getSalesAccount` | `src/lib/sales/services.ts` | 80-102 | Nested `deals` relation |
| `listSalesDealAuditEvents` | `src/lib/sales/services.ts` | 555-589 | `platformAuditLog` queries |
| `getSalesDashboardStats` | `src/lib/sales/services.ts` | 347-441 | `prisma.salesDeal.count/groupBy/findMany` |
| `opportunityRepository.findById` | `src/lib/sales/repositories/opportunity-repository.ts` | 11-19 | `prisma.salesDeal.findFirst` → `prismaDealToOpportunity` |
| `opportunityRepository.findByOrganization` | `src/lib/sales/repositories/opportunity-repository.ts` | 21-30 | `prisma.salesDeal.findMany` → mapper |
| `opportunityRepository.findByAccount` | `src/lib/sales/repositories/opportunity-repository.ts` | 32-41 | `prisma.salesDeal.findMany` → mapper |
| `opportunityRepository.count` | `src/lib/sales/repositories/opportunity-repository.ts` | 92-96 | `prisma.salesDeal.count` |
| `assertDealInOrg` | `src/lib/sales/repositories/org-scope.ts` | 8-23 | `prisma.salesDeal.findFirst` |
| `assertSalesDealAccess` | `src/lib/sales/guards.ts` | 92-142 | `prisma.salesDeal.findUnique` |
| `listOpportunities` | `src/lib/sales/store/opportunities.ts` | 16-18 | In-memory Map |
| `getOpportunity` | `src/lib/sales/store/opportunities.ts` | 29-35 | In-memory Map |
| `getSalesDashboard` | `src/lib/sales/service.ts` | 96-171 | In-memory store reads |
| `getSalesOpportunityDetail` | `src/lib/sales/service.ts` | 149-171 | In-memory store reads |

### 1.6 Server Actions

| Action | File | Permission | Mechanism |
|--------|------|-----------|-----------|
| `listSalesDealsAction` | `src/actions/sales-actions/deals.ts:24` | `salesos:read` | → `listSalesDeals` (Prisma) |
| `getSalesDealAction` | `src/actions/sales-actions/deals.ts:31` | `assertSalesDealAccess` | → `getSalesDeal` (Prisma) |
| `createSalesDealAction` | `src/actions/sales-actions/deals.ts:42` | `salesos:create` | → `createSalesDeal` (Prisma) + auto lead scoring |
| `updateSalesDealAction` | `src/actions/sales-actions/deals.ts:70` | `salesos:update` | → `updateSalesDeal` (Prisma) + cache invalidation |
| `updateDealNextActionAction` | `src/actions/sales-actions/deals.ts:89` | `salesos:update` | → `updateDealNextAction` (Prisma) |
| `listSalesDealAuditEventsAction` | `src/actions/sales-actions/deals.ts:111` | assertSalesDealAccess | → `listSalesDealAuditEvents` |
| `createOpportunityFromAccountAction` | `src/actions/sales-actions/deals.ts:118` | `salesos:create` | → `createSalesDealAction` |
| `recordSalesReviewDecisionAction` | `src/actions/sales-actions/governance.ts:22` | assertSalesDealAccess | → `recordReviewDecision` |
| `submitOpportunityReviewActionPrisma` | `src/actions/sales-actions/governance.ts:115` | assertSalesDealAccess | → L5 governance submit |
| `linkDealEvidenceAction` | `src/actions/sales-actions/governance.ts:130` | assertSalesDealAccess | → `linkEvidenceToDeal` |
| `unlinkDealEvidenceAction` | `src/actions/sales-actions/governance.ts:158` | assertSalesDealAccess | → `unlinkEvidenceFromDeal` |
| `listDealEvidenceLinksAction` | `src/actions/sales-actions/governance.ts:174` | assertSalesDealAccess | → `listEvidenceLinksForDeal` |
| `getDealHealthAction` | `src/actions/sales-deal-health.ts:18` | assertSalesDealAccess | → `getDealHealth` |
| `listDealHealthAction` | `src/actions/sales-deal-health.ts:50` | permission check | Bulk health validation |
| `getRevenueReportAction` | `src/actions/sales-report-actions.ts:67` | permission check | `prisma.salesDeal.findMany` |
| `getPipelineReportAction` | `src/actions/sales-report-actions.ts:126` | permission check | `prisma.salesDeal.findMany` |
| `getSalesDashboardDataAction` | `src/actions/sales-read-actions.ts:53` | `salesos:read` | Direct Prisma reads |
| `globalSearchAction` | `src/actions/global-search-actions.ts:96` | platform | `prisma.salesDeal.findMany` with title contains |
| `getPlatformNotificationsAction` | `src/actions/platform-overview-actions/notifications.ts:64` | platform | Stale deal detection |
| `getPlatformProductCounts` | `src/actions/dashboard-read-actions.ts:12` | platform | `prisma.salesDeal.count` |

### 1.7 Metadata Catch-All Pattern

The `SalesDeal.metadata` JSON field stores **8+ distinct data domains**:

| Domain | Key | Written by | Read by |
|--------|-----|-----------|---------|
| Risk assessment | `metadata.riskAssessment` | `recalculateDealRiskAction` | `deal-risk-panel.tsx`, `getDealHealth` |
| Outreach drafts | `metadata.outreachDrafts` | `persistOutreachDrafts` | `listDraftsForDeal`, `deal-outreach-panel.tsx` |
| Conversion memo | `metadata.conversionMemo` | `persistConversionMemo` | `useDealConversionMemo` hook |
| Review decisions | `metadata.reviewDecisions` | `recordReviewDecision` | `dealNeedsGovernanceAttention` |
| Commercial claims | `metadata.commercialClaims` | `reviewCommercialClaimOnDeal` | `flagCommercialClaimIfNeeded` |
| AI analysis | `metadata.aiAnalysis` | `analyzeDealWithAI` | Intelligence panels |
| Lead scores | `metadata.leadScores` | `scoreDealLeadsAction` | Scoring panels |
| Next action | `metadata.nextAction` | `updateDealNextAction` | `deal-next-action-form.tsx` |

### 1.8 Tests

| Test File | Lines | Coverage |
|-----------|-------|---------|
| `src/lib/sales/__tests__/sales-services.test.ts` | 60-185 | CRUD operations |
| `src/lib/sales/__tests__/sales-governance.test.ts` | 144-235 | Stage transitions |
| `src/lib/sales/__tests__/sales-l5-governance.test.ts` | 40-88 | Submit/approve/reject |
| `src/lib/sales/__tests__/pipeline-service.test.ts` | 8-518 | Comprehensive pipeline |
| `src/lib/sales/__tests__/sales-deal-risk-agent.test.ts` | — | Risk assessment |
| `src/lib/sales/__tests__/sales-commercial-claims.test.ts` | 37-260 | Claims review |
| `src/lib/sales/__tests__/sales-outreach.test.ts` | 38-315 | Outreach drafts |
| `src/lib/sales/__tests__/sales-objection-analysis.test.ts` | 39-187 | Objection analysis |
| `src/lib/sales/__tests__/sales-follow-up.test.ts` | 45-136 | Follow-up actions |
| `src/__tests__/integration/sales-pipeline.test.ts` | 14-731 | Full integration CRUD |

### 1.9 DUAL-WRITE FINDING

**Three competing write paths exist simultaneously:**

```
Path A: Server Action → services.ts → prisma.salesDeal.create/update (AWAITS Prisma)
Path B: store/opportunities.ts → in-memory Map → persistPrismaWrite (fire-and-forget)
Path C: 10+ service modules → prisma.salesDeal.update directly (AWAITS Prisma)
```

Paths A and C write directly to Prisma and are authoritative.
Path B writes to in-memory first, then asynchronously to Prisma.

**The entity mapper stores `stage` in metadata JSON, not as a Prisma field:**
```typescript
// entity-mappers.ts:152-156
metadata: {
  ...existingMetadata,
  stage: opportunity.stage,  // SHADOW FIELD in JSON
}
```

### 1.10 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | BOTH (in-memory + Prisma) |
| **Canonical layer** | PRISMA (for server actions) / IN-MEMORY (for store-based reads) |
| **Dual representations** | YES: `SalesDeal` (Prisma) ↔ `SalesOpportunity` (domain type) |
| **Metadata shadow fields** | stage, riskAssessment, outreachDrafts, conversionMemo, reviewDecisions, aiAnalysis, leadScores, nextAction |
| **Deprecated status** | In-memory store reads are legacy but still active |
| **Migration risk** | MEDIUM — Prisma writes exist but in-memory store is also active |

---

## 2. SALESACCOUNT

### 2.1 Prisma Model

13 fields. Relations: deals, evidenceLinks, interactions, contacts. 5 indexes.
**File:** `prisma/schema.prisma:2419-2445`

### 2.2 In-Memory

`SalesAccount` type at `types.ts:158-173`. Stored in `store.accounts` Map.

### 2.3 Writers

| Writer | File | Mechanism |
|--------|------|-----------|
| `store/accounts.ts:createAccount` | In-memory + `persistPrismaWrite` | Fire-and-forget |
| `services/accounts.ts:salesCreateAccount` | Prisma direct | Awaits |
| `service.ts:createSalesAccount` | In-memory | No Prisma |

### 2.4 Readers

All services, v02 modules, and UI routes read from in-memory store.

### 2.5 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | BOTH |
| **Canonical layer** | IN-MEMORY (server actions use Prisma directly, store uses in-memory) |
| **Migration risk** | LOW — Prisma model exists, mappers exist |

---

## 3. SALESCONTACT

### 3.1 Prisma Model

14 fields. Relations: account. 4 indexes.
**File:** `prisma/schema.prisma:2544-2565`

### 3.2 In-Memory

`SalesContact` type at `types.ts:175-190`. Stored in `store.contacts` Map.

### 3.3 Schema Gap

`SalesInteraction.contactId` exists but has **NO Prisma relation** to `SalesContact`. FK is orphaned at ORM level.

### 3.4 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | BOTH (but Prisma write only on seed, no `persistPrismaWrite` on createContact) |
| **Migration risk** | LOW — but missing relation is a gap |

---

## 4. SALESINTERACTION

### 4.1 Prisma Model

15 fields. Relations: account, deal. 6 indexes.
**File:** `prisma/schema.prisma:2517-2542`

### 4.2 In-Memory

`SalesInteractionLog` type at `types.ts:450-463`. Stored in `store.interactions` Map.

### 4.3 Writers

| Writer | Mechanism |
|--------|-----------|
| `store/opportunities.ts:createInteraction` | In-memory + `persistPrismaWrite` |
| `store/opportunities.ts:createActivity` | Creates interaction + activity, dual-write |
| `services/interactions.ts:createSalesInteraction` | Prisma direct |

### 4.4 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | BOTH |
| **Migration risk** | LOW |

---

## 5. SALESEVIDENCELINK

### 5.1 Prisma Model

16 fields. Polymorphic (targetType + targetId). Unique constraint. Relations: deal, account. 7 indexes.
**File:** `prisma/schema.prisma:2490-2515`

### 5.2 In-Memory

`SalesEvidenceRef` type at `store/common.ts:34-42`. Stored in `store.evidence` Map.

### 5.3 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | BOTH |
| **Migration risk** | LOW |

---

## 6. SALESPIPELINE & SALESPIPELINESTAGE

### 6.1 Prisma Models

- `SalesPipeline`: 12 fields, 4 indexes. `prisma/schema.prisma:2374-2394`
- `SalesPipelineStage`: 11 fields, cascade delete from pipeline, 4 indexes. `prisma/schema.prisma:2396-2417`

### 6.2 In-Memory

**NO in-memory representation.** Pipeline and stages are read directly from Prisma.

### 6.3 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | Prisma ONLY |
| **Canonical layer** | PRISMA |
| **Migration risk** | NONE — already unified |

---

## 7. SALESPROPOSAL

### 7.1 Prisma Model

18 fields. Versioned (draft/submitted/approved/rejected). Relations: deal, reviews, approvals. 3 indexes.
**File:** `prisma/schema.prisma:2567-2593`

### 7.2 In-Memory

**NO in-memory representation.** Proposals exist only in Prisma.

### 7.3 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | Prisma ONLY |
| **Migration risk** | NONE |

---

## 8. SALESREVIEW

### 8.1 Prisma Model

17 fields. Polymorphic + typed linking. Relations: deal, proposal, approvals. 5 indexes.
**File:** `prisma/schema.prisma:2595-2621`

### 8.2 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | Prisma ONLY |
| **Migration risk** | NONE |

---

## 9. SALESAPPROVAL

### 9.1 Prisma Model

16 fields. Three-way linking (review + proposal + deal). Expiration support. 4 indexes.
**File:** `prisma/schema.prisma:2623-2646`

### 9.2 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | Prisma ONLY |
| **Migration risk** | NONE |

---

## 10. SALESSIGNAL (Tier A — No Prisma Schema)

### 10.1 Type Definition

`types.ts:294-309` — id, organizationId, opportunityId, accountId, type, subject, body, severity, source, metadata, createdAt

### 10.2 Persistence

| Layer | Status |
|-------|--------|
| Prisma schema | **NO** — uses `getPrismaAny().salesSignal` (dynamic, may not exist) |
| In-memory Map | YES — `store.signals` |
| File snapshot | YES — `.data/sales/{org}.json` |

### 10.3 Writers

`store/signals.ts:createSignal` (line 46), `updateSignal` (line 61), `deleteSignal` (line 74)

### 10.4 Readers

`store/signals.ts:listSignals`, `listSignalsForOpportunity`, `listSignalsForAccount`
`services/intelligence.ts`, `services/commercial-memory-service.ts`, `services/market-intelligence-service.ts`, `services/institutional-learning-service.ts`
`service.ts:getSalesIntelligenceMemory` (line 379)
`signals/platform-signal-producer.ts`

### 10.5 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | IN-MEMORY PRIMARY |
| **Prisma model** | GHOST (dynamic delegate, not in schema) |
| **Migration risk** | **HIGH** — no schema model, `as any` typed, may silently fail |

---

## 11. SALESOBJECTION (Tier A — No Prisma Schema)

### 11.1 Type Definition

`types.ts:311-328` — id, organizationId, opportunityId, accountId, category, subject, body, severity, status, metadata, createdAt

### 11.2 Persistence

Same as Signal: IN-MEMORY PRIMARY, ghost Prisma delegate.

### 11.3 Writers

`store/objections.ts:createObjection` (line 49), `updateObjection` (line 64), `deleteObjection` (line 77)

### 11.4 Readers

Store functions + `services/intelligence.ts`, `services/commercial-memory-service.ts`, `services/next-action.ts`, `services/proof-network-service.ts`, `services/commercial-proof-network-service.ts`, `services/institutional-learning-service.ts`, v02/proof-effectiveness, v02/strategic-recommendations

### 11.5 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | IN-MEMORY PRIMARY |
| **Migration risk** | **HIGH** |

---

## 12. SALESCOMPETITORMENTION (Tier A — No Prisma Schema)

### 12.1 Type Definition

`types.ts:330-345` — id, organizationId, opportunityId, accountId, competitorName, mentionContext, sentiment, source, metadata, createdAt

### 12.2 Persistence

IN-MEMORY PRIMARY, ghost Prisma delegate.

### 12.3 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | IN-MEMORY PRIMARY |
| **Migration risk** | **HIGH** |

---

## 13. SALESWINLOSSINSIGHT (Tier A — No Prisma Schema)

### 13.1 Type Definition

`types.ts:426-442` — id, organizationId, opportunityId, outcome, reason, category, confidence, source, metadata, createdAt

### 13.2 Persistence

IN-MEMORY PRIMARY, ghost Prisma delegate.

### 13.3 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | IN-MEMORY PRIMARY |
| **Migration risk** | **HIGH** |

---

## 14. SALESICPINSIGHT (Tier A — No Prisma Schema)

### 14.1 Type Definition

`types.ts:389-404` — id, organizationId, accountId, criterion, score, rationale, source, metadata, createdAt

### 14.2 Persistence

IN-MEMORY PRIMARY, ghost Prisma delegate.

### 14.3 Writers

`store/insights.ts:createICPInsight` + `services/icp-insight.ts:salesLearnICPForAccount`

### 14.4 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | IN-MEMORY PRIMARY |
| **Migration risk** | **HIGH** |

---

## 15. SALESNEXTACTION (Tier A — No Prisma Schema)

### 15.1 Type Definition

`types.ts:406-424` — id, organizationId, opportunityId, accountId, action, rationale, priority, confidence, source, metadata, createdAt

### 15.2 Persistence

IN-MEMORY PRIMARY, ghost Prisma delegate. Also has separate `NbaSuppressionRecord` store.

### 15.3 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | IN-MEMORY PRIMARY |
| **Migration risk** | **HIGH** |

---

## 16. SALEAROOFFASSET (Tier A — No Prisma Schema)

### 16.1 Type Definition

`types.ts:359-377` — id, organizationId, opportunityId, accountId, title, category, url, metadata, createdAt

### 16.2 Persistence

IN-MEMORY PRIMARY, ghost Prisma delegate.

### 16.3 Readers

**All v02 modules** — proof-network, proof-effectiveness, strategic-recommendations, institutional-learning, plus proof-linkage-service, commercial-proof-network-service, commercial-memory-service.

### 16.4 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | IN-MEMORY PRIMARY |
| **Migration risk** | **HIGH** — most cross-cutting intelligence entity |

---

## 17. SALESLEAD (DEAD ENTITY)

### 17.1 Type Definition

`types.ts:192-201` — id, organizationId, accountId, name, email, source, status, metadata, createdAt

### 17.2 Persistence

In-memory Map (`store.leads`) — **never populated by any writer**

### 17.3 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | IN-MEMORY ONLY (dead) |
| **Writers** | NONE |
| **Readers** | NONE outside hydration |
| **Migration risk** | **CRITICAL — dead entity, zero consumers** |

---

## 18. SALESACTIVITY

### 18.1 Type Definition

`types.ts:227-244` — id, organizationId, opportunityId, accountId, type, subject, body, outcome, metadata, createdAt

### 18.2 Persistence

In-memory Map (`store.activities`). Dual-writes to `SalesInteraction` in Prisma via `activityToInteraction()`.

### 18.3 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | IN-MEMORY PRIMARY (Prisma via Interaction) |
| **Migration risk** | MEDIUM — activities are stored as interactions in Prisma |

---

## 19. SALESMEETING

### 19.1 Type Definition

`types.ts:246-264` — id, organizationId, opportunityId, accountId, title, scheduledAt, duration, outcome, attendees, metadata, createdAt

### 19.2 Persistence

In-memory Map (`store.meetings`). `createMeeting` exists but is **never called from any service, action, or route**.

### 19.3 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | IN-MEMORY ONLY (never written) |
| **Migration risk** | **HIGH — no write path** |

---

## 20. SALESOUTREACH (DEAD ENTITY)

### 20.1 Type Definition

`types.ts:266-282` — id, organizationId, accountId, channel, subject, body, status, metadata, createdAt

### 20.2 Persistence

In-memory Map (`store.outreach`). **Never populated** — no create function found.

### 20.3 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | IN-MEMORY ONLY (dead) |
| **Migration risk** | **CRITICAL — dead entity, zero consumers** |

---

## 21. SALES AUDIT ENTRY

### 21.1 Type Definition

`store/common.ts:44-53` — id, action, targetType, targetId, actorId, details, createdAt

### 21.2 Persistence

| Layer | Status |
|-------|--------|
| In-memory array | YES — `store.auditLog` |
| PlatformAuditLog | **Stub/no-op** — `service.ts:73-85` writes are fire-and-forget |
| File snapshot | YES |

### 21.3 Critical Finding

The in-memory `auditLog` array is the effective source of truth for SalesOS audit reads. PlatformAuditLog writes via `recordSalesMutation()` are **no-ops** (`service.ts:73-85`). Meanwhile, server actions write to `PlatformAuditLog` directly (via `logPlatformAudit`). This creates **two separate audit trails**.

### 21.4 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | IN-MEMORY PRIMARY (PlatformAuditLog is separate path) |
| **Migration risk** | **HIGH** — audit trail fragmented across two systems** |

---

## 22. NBASUPPRESSIONRECORD

### 22.1 Type Definition

`src/lib/sales/nba-suppression-store.ts:15-23` — id, organizationId, nbaActionId, action, suppressedUntil, createdAt

### 22.2 Persistence

In-memory Map + separate `.data/nba-suppressions/{org}.json` file.

### 22.3 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | IN-MEMORY + FILE |
| **Migration risk** | MEDIUM — separate store, file-only persistence |

---

## 23. SALESTERRITORY

### 23.1 Type Definition

`src/lib/sales/sales-territory-store.ts:7-17` — id, organizationId, name, description, ownerIds, metadata, createdAt

### 23.2 Persistence

In-memory Map only. **Zero file or Prisma persistence.**

### 23.3 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | IN-MEMORY ONLY |
| **Migration risk** | **HIGH — zero persistence** |

---

## 24. INSTITUTIONAL MEMORY

### 24.1 Location

Embedded as JSON array in `SalesAccount.metadata.institutionalMemory[]`

### 24.2 Read/Write

- **Read:** `readInstitutionalMemory()` in `institutional-memory-shared.ts:41-75`
- **Write:** `syncInstitutionalMemoryForAccount()` in `institutional-memory-sync.ts:20-55`
- **Source data:** Reads from `PlatformAuditLog`, `SalesDeal.metadata.reviewDecisions`, `SalesAccount.metadata.icpScores`

### 24.3 Status

| Attribute | Value |
|-----------|-------|
| **Persistence** | PRISMA JSON BLOB (inside Account.metadata) |
| **Migration risk** | MEDIUM — needs extraction to own table |

---

## 25. COMPUTED v02 MODULES (No Persistence)

| Module | Reads From | Store Coupling | Migration Risk |
|--------|-----------|----------------|----------------|
| Knowledge Graph | In-memory store (10 maps) | **HEAVY** | HIGH |
| Proof Network | Function args + adapters | LIGHT | MEDIUM |
| Proof Effectiveness | In-memory store (5 maps) | **HEAVY** | HIGH |
| Market Intelligence | Function args | NONE | LOW |
| Institutional Learning | Function args | NONE | LOW |
| Strategic Recommendations | In-memory store (7 maps) | **HEAVY** | HIGH |
| Cross-Product Signals | NOTHING (throws PLANNED) | NONE | LOW (stub) |

---

## 26. vNext MODULES

| Module | Classification | Reads | Writes | Stubs |
|--------|---------------|-------|--------|-------|
| account-intelligence | REAL (91 lines) | Function args | None | 0 |
| opportunity-intelligence | REAL (55 lines) | Function args | None | 0 |
| pipeline-analytics | REAL (54 lines) | Function args | None | 0 |
| meeting-intelligence | REAL (78 lines) | Function args | None | 0 |
| revenue-intelligence | REAL (434 lines) | **In-memory store** | None | 0 |
| commercial-memory/* | REAL (607 lines total) | Function args | None | 0 |
| commercial-proof-network-overview | REAL (281 lines) | Function args | None | 0 |
| proof-network-overview | REAL (209 lines) | Function args | None | 0 |
| institutional-learning-links | REAL (70 lines) | Function args | None | 0 |
| workspace-metadata | PARTIAL | env | None | 1 (throws PLANNED) |
| proposal-workflow | PARTIAL | None | InMemory | 2 (throws PLANNED) |
| commercial-evidence | PARTIAL | None | None | 1 (always-false) |
| deal-review | PARTIAL | None | InMemory | 4 (throws PLANNED) |
| commercial-review-runtime | PARTIAL | Platform | None | 2 (throws PLANNED) |
| learning-loop | STUB | None | None | N/A |
| commercial-memory/types | STUB | None | None | N/A |
| index | BRIDGE | — | — | — |
| commercial-knowledge-graph | BRIDGE (1 line) | → v02 | — | — |
| commercial-proof-network | BRIDGE (1 line) | → v02 | — | — |
| commercial-recommendations | BRIDGE (1 line) | → v02 | — | — |
| cross-product-signals | BRIDGE (1 line) | → v02 | — | — |
| next-action-engine | BRIDGE (1 line) | → parent | — | — |
| proof-effectiveness | BRIDGE (1 line) | → v02 | — | — |
| proof-effectiveness-wave-b | BRIDGE (1 line) | → v02 (duplicate) | — | — |
| icp-learning | BRIDGE (11 lines) | → icp-learning-snapshot | — | — |
| market-intelligence | BRIDGE/PARTIAL (154 lines) | → v02 | None | 0 |
| institutional-learning | BRIDGE/PARTIAL (283 lines) | → v02 | None | 0 |
| commercial-memory/index | BRIDGE | → subdirs | — | — |

---

## 27. CROSS-PRODUCT EVENT HANDLERS

| Event | Handler | Actual Behavior | Real Processing? |
|-------|---------|-----------------|------------------|
| `("sales", "*")` | `sales-os-plugin.ts:22-25` | `logger.info()` | **NO** |
| `("audit", "review.completed")` | `sales-os-plugin.ts:27-30` | `logger.info()` | **NO** |
| `("lc", "project.classified")` | `sales-os-plugin.ts:33-36` | `logger.info()` | **NO** |

---

## 28. DUPLICATE PATTERNS

### 28.1 assertDealInOrg (4 copies)

| Location | File |
|----------|------|
| `repositories/org-scope.ts:8-23` | Canonical |
| `evidence-links.ts:120-129` | Duplicate |
| `interactions.ts:84-93` | Duplicate |
| `outreach.ts:187-195` | Duplicate |

### 28.2 Dual Service Layers

| Layer | File | Uses |
|-------|------|------|
| Prisma services | `src/lib/sales/services.ts` | Direct Prisma |
| In-memory services | `src/lib/sales/service.ts` | OrgStore |

### 28.3 Duplicate proof-network-overview

| File | Function |
|------|----------|
| `vnext/commercial-proof-network-overview.ts` | `buildCommercialProofNetworkOverview` |
| `vnext/proof-network-overview.ts` | `buildCommercialProofNetworkOverview` |

Same function name, different implementations, different type shapes.

---

## 29. INVENTORY SUMMARY

| Entity | Prisma? | In-Memory? | File? | Source of Truth | Dead? | Migration Risk |
|--------|---------|------------|-------|-----------------|-------|----------------|
| SalesDeal | YES | YES | YES | Dual | NO | MEDIUM |
| SalesAccount | YES | YES | YES | Dual | NO | LOW |
| SalesContact | YES | YES | YES | Dual | NO | LOW |
| SalesInteraction | YES | YES | YES | Dual | NO | LOW |
| SalesEvidenceLink | YES | YES | YES | Dual | NO | LOW |
| SalesPipeline | YES | NO | NO | Prisma | NO | NONE |
| SalesPipelineStage | YES | NO | NO | Prisma | NO | NONE |
| SalesProposal | YES | NO | NO | Prisma | NO | NONE |
| SalesReview | YES | NO | NO | Prisma | NO | NONE |
| SalesApproval | YES | NO | NO | Prisma | NO | NONE |
| SalesSignal | GHOST | YES | YES | In-Memory | NO | HIGH |
| SalesObjection | GHOST | YES | YES | In-Memory | NO | HIGH |
| SalesCompetitorMention | GHOST | YES | YES | In-Memory | NO | HIGH |
| SalesWinLossInsight | GHOST | YES | YES | In-Memory | NO | HIGH |
| SalesICPInsight | GHOST | YES | YES | In-Memory | NO | HIGH |
| SalesNextAction | GHOST | YES | YES | In-Memory | NO | HIGH |
| SalesProofAsset | GHOST | YES | YES | In-Memory | NO | HIGH |
| SalesLead | NO | YES | YES | In-Memory | **YES** | CRITICAL |
| SalesActivity | NO | YES | YES | In-Memory | NO | MEDIUM |
| SalesMeeting | NO | YES | NO | In-Memory | **YES** | HIGH |
| SalesOutreach | NO | YES | YES | In-Memory | **YES** | CRITICAL |
| SalesAuditEntry | PARTIAL | YES | YES | In-Memory | NO | HIGH |
| NbaSuppression | NO | YES | YES | In-Memory+File | NO | MEDIUM |
| SalesTerritory | NO | YES | NO | In-Memory | NO | HIGH |
| Institutional Memory | JSON blob | NO | NO | Prisma JSON | NO | MEDIUM |

**GHOST** = dynamic `getPrismaAny()` delegate, not in schema.prisma, may silently fail

---

## 30. STOP CONDITIONS TRIGGERED

The following conditions were identified during inventory:

1. **Dual source of truth**: In-memory OrgStore vs Prisma for 5 core entities
2. **Fire-and-forget writes**: `persistPrismaWrite()` never awaited, failures silent
3. **Ghost Prisma delegates**: 7 entities use `getPrismaAny()` — no schema backing
4. **Metadata catch-all**: 8+ domains stored as JSON blob in SalesDeal.metadata
5. **Duplicate assertDealInOrg**: 4 copies of same tenant check
6. **Dead entities**: 3 entity types never populated (Lead, Outreach, Meeting)
7. **Dual audit trails**: In-memory auditLog vs PlatformAuditLog
8. **Dual service layers**: `services.ts` (Prisma) vs `service.ts` (in-memory)
9. **Dual opportunity models**: `SalesDeal` (Prisma) vs `SalesOpportunity` (domain)
10. **10 vNext stubs** that throw "PLANNED" at runtime

**No STOP conditions require halting the program.** All conditions are addressable through the planned migration waves.

---

*End of Phase 1 — Forensic Inventory*
