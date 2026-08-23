# SALESOS CANONICAL DOMAIN MODEL — Phase 3

> **Date:** 2026-08-17
> **Program:** SALESOS P0 — Domain & Data Unification
> **Status:** Architecture Proposal
> **Depends on:** `SALESOS_DOMAIN_DATA_INVENTORY.md` (Phase 1), `SALESOS_SOURCE_OF_TRUTH_MATRIX.md` (Phase 2)

---

## 1. Design Principles

1. **One aggregate root per bounded context.** No dual persistence.
2. **Prisma models ARE the domain.** No in-memory Map as source of truth.
3. **Metadata JSON blob is forbidden for new data.** Extract to proper columns or models.
4. **DTOs are projections, not entities.** Domain types exist only as Prisma-generated + thin DTOs.
5. **Every entity has organizationId.** Tenant isolation is non-negotiable.
6. **Every mutation writes to PlatformAuditLog.** Single audit trail.
7. **Governance rules are domain services**, not embedded in models.
8. **Stage is a FK reference**, not a string enum duplicated in 3 places.

---

## 2. Aggregates

### 2.1 Account Aggregate

**Root:** `SalesAccount`
**Entities:** `SalesContact`, `SalesInstitutionalMemory`
**Value Objects:** `AccountStatus`, `Industry`

```
SalesAccount (aggregate root)
├── SalesContact[] (owned, FK → accountId)
└── SalesInstitutionalMemory[] (owned, FK → accountId)
```

| Model | Role | Persistence |
|-------|------|-------------|
| `SalesAccount` | Aggregate root | Prisma (existing, add `industryAr`) |
| `SalesContact` | Child entity | Prisma (existing) |
| `SalesInstitutionalMemory` | Child entity | **NEW Prisma model** |

**Changes from current:**
- Extract `metadata.institutionalMemory[]` → `SalesInstitutionalMemory` table
- Remove `metadata` JSON catch-all from `SalesAccount` after extraction
- Add `industryAr` column for bilingual industry labels

### 2.2 Deal Aggregate (Central)

**Root:** `SalesDeal`
**Entities:** `SalesInteraction`, `SalesEvidenceLink`, `SalesSignal`, `SalesObjection`, `SalesCompetitorMention`, `SalesWinLossInsight`, `SalesICPInsight`, `SalesNextAction`, `SalesProofAsset`
**Value Objects:** `DealStatus`, `DealAmount`, `ReviewStatus`, `ApprovalStatus`

```
SalesDeal (aggregate root)
├── SalesInteraction[] (owned, FK → dealId)
├── SalesEvidenceLink[] (owned, FK → dealId)
├── SalesSignal[] (owned, FK → dealId)
├── SalesObjection[] (owned, FK → dealId)
├── SalesCompetitorMention[] (owned, FK → dealId)
├── SalesWinLossInsight[] (owned, FK → dealId)
├── SalesNextAction[] (owned, FK → dealId)
└── SalesProofAsset[] (owned, FK → dealId)
```

| Model | Role | Persistence |
|-------|------|-------------|
| `SalesDeal` | Aggregate root | Prisma (existing, **remove duplicates**) |
| `SalesInteraction` | Child entity | Prisma (existing) |
| `SalesEvidenceLink` | Child entity | Prisma (existing) |
| `SalesSignal` | Child entity | **NEW Prisma model** |
| `SalesObjection` | Child entity | **NEW Prisma model** |
| `SalesCompetitorMention` | Child entity | **NEW Prisma model** |
| `SalesWinLossInsight` | Child entity | **NEW Prisma model** |
| `SalesNextAction` | Child entity | **NEW Prisma model** |
| `SalesProofAsset` | Child entity | **NEW Prisma model** |

**Changes from current:**
- Remove `pipelineStage` string field (use `stageId` FK only)
- Remove `name` field (use `title` only)
- Remove `metadata` JSON catch-all (extract sub-domains to own models/columns)
- Add `SalesICPInsight` with FK → `accountId` (ICPs are account-level, not deal-level)

**Metadata extraction plan (SalesDeal.metadata):**

| Sub-domain | Current location | Target |
|-----------|-----------------|--------|
| riskAssessment | `metadata.riskAssessment` | `SalesDeal.riskAssessment` (JSON column, acceptable for semi-structured) |
| outreachDrafts | `metadata.outreachDrafts` | Keep in metadata (ephemeral drafts, not queryable) |
| conversionMemo | `metadata.conversionMemo` | `SalesDeal.conversionMemo` (JSON column) |
| reviewDecisions | `metadata.reviewDecisions` | **Already in `SalesReview` + `SalesApproval`** — remove from metadata |
| commercialClaims | `metadata.commercialClaims` | `SalesDeal.commercialClaims` (JSON column) |
| aiAnalysis | `metadata.aiAnalysis` | `SalesDeal.aiAnalysis` (JSON column) |
| leadScores | `metadata.leadScores` | `SalesDeal.leadScores` (JSON column) |
| nextAction | `metadata.nextAction` | **Already `SalesNextAction` table** — remove from metadata |

**Rationale:** Some sub-domains (riskAssessment, conversionMemo, commercialClaims, aiAnalysis, leadScores) are semi-structured JSON that varies by deal. Extracting to separate tables would create N models for N sub-domains with no query benefit. Keeping them as typed JSON columns on SalesDeal is acceptable. But `reviewDecisions` and `nextAction` already have proper tables and must be removed from metadata.

### 2.3 Pipeline Aggregate

**Root:** `SalesPipeline`
**Entities:** `SalesPipelineStage`

```
SalesPipeline (aggregate root)
└── SalesPipelineStage[] (owned, FK → pipelineId)
```

| Model | Role | Persistence |
|-------|------|-------------|
| `SalesPipeline` | Aggregate root | Prisma (existing, clean) |
| `SalesPipelineStage` | Child entity | Prisma (existing, clean) |

**No changes needed.** Already unified.

### 2.4 Governance Aggregate

**Root:** `SalesProposal`
**Entities:** `SalesReview`, `SalesApproval`

```
SalesProposal (aggregate root)
├── SalesReview[] (owned, FK → proposalId)
└── SalesApproval[] (owned, FK → proposalId)
```

| Model | Role | Persistence |
|-------|------|-------------|
| `SalesProposal` | Aggregate root | Prisma (existing, clean) |
| `SalesReview` | Child entity | Prisma (existing, clean) |
| `SalesApproval` | Child entity | Prisma (existing, clean) |

**No changes needed.** Already unified.

### 2.5 Intelligence Computation Layer (Read-only Projections)

These are NOT persistence models. They are pure computation over data from Accounts, Deals, and Interactions.

| Module | Input Source | Output |
|--------|------------|--------|
| `vnext/account-intelligence` | Deals + Interactions for account | Computed intelligence summary |
| `vnext/opportunity-intelligence` | Deal + Signals + Objections | Deal-specific intelligence |
| `vnext/pipeline-analytics` | All deals + stages | Pipeline health metrics |
| `vnext/meeting-intelligence` | Interactions (type=meeting) | Meeting effectiveness |
| `vnext/revenue-intelligence` | Deals + stages + amounts | Revenue forecasting |
| `vnext/commercial-memory/*` | Historical deals + outcomes | Pattern recognition |
| `vnext/commercial-proof-network-overview` | Proof assets + evidence | Proof network graph |
| `vnext/proof-network-overview` | Proof assets + evidence | Proof network (duplicate of above) |
| `vnext/institutional-learning-links` | Historical patterns | Learning connections |

**Rule:** These modules must accept Prisma-backed DTOs as input. After migration, they read from Prisma directly via repository layer.

**Stub modules to delete or implement:**

| Module | Status | Action |
|--------|--------|--------|
| `deal-review` (4 stubs) | Throws "PLANNED" | Delete — governance is handled by Governance Aggregate |
| `proposal-workflow` (2 stubs) | Throws "PLANNED" | Delete — workflow is handled by Governance Aggregate |
| `commercial-review-runtime` (2 stubs) | Throws "PLANNED" | Delete — review is handled by Governance Aggregate |
| `workspace-metadata` (1 stub) | Throws "PLANNED" | Delete — metadata is handled by Account/Deal |
| `commercial-evidence` (1 always-false) | No-op | Delete — evidence is handled by SalesEvidenceLink |
| `learning-loop` (1 facade) | Documentation only | Delete — learning is handled by v02 modules |

### 2.6 Platform Services (Shared)

| Model | Role | Persistence |
|-------|------|-------------|
| `PlatformAuditLog` | Unified audit trail | Prisma (existing) |
| `SalesTerritory` | Territory definitions | **NEW Prisma model** |
| `SalesNbaSuppression` | NBA suppression rules | **NEW Prisma model** |

---

## 3. Entity Relationship Diagram (Textual)

```
┌─────────────────────────────────────────────────────────┐
│                    Pipeline Aggregate                     │
│                                                          │
│  SalesPipeline ──1:N──► SalesPipelineStage               │
└─────────────────────────────────────────────────────────┘
          │
          │ stageId (FK)
          ▼
┌─────────────────────────────────────────────────────────┐
│                    Deal Aggregate (Central)               │
│                                                          │
│  SalesDeal ──1:N──► SalesInteraction                     │
│            ──1:N──► SalesEvidenceLink                    │
│            ──1:N──► SalesSignal                          │
│            ──1:N──► SalesObjection                       │
│            ──1:N──► SalesCompetitorMention               │
│            ──1:N──► SalesWinLossInsight                  │
│            ──1:N──► SalesNextAction                      │
│            ──1:N──► SalesProofAsset                      │
│            ──1:N──► SalesProposal                        │
│            ──1:N──► SalesReview (via proposalId)         │
│            ──1:N──► SalesApproval (via proposalId)       │
│                                                          │
│  Fields: id, organizationId, accountId, stageId (FK),    │
│          title, status, amount, currency, probability,   │
│          qualificationScore, expectedCloseDate,          │
│          reviewStatus, approvalStatus, ownerId,          │
│          isDemo, metadata (typed JSON columns),          │
│          riskAssessment (JSON), conversionMemo (JSON),   │
│          commercialClaims (JSON), aiAnalysis (JSON),     │
│          leadScores (JSON),                              │
│          createdById, updatedById, createdAt, updatedAt  │
│                                                          │
│  REMOVED: pipelineStage (string), name,                  │
│           reviewDecisions (in metadata),                 │
│           nextAction (in metadata)                       │
└─────────────────────────────────────────────────────────┘
          │
          │ accountId (FK)
          ▼
┌─────────────────────────────────────────────────────────┐
│                   Account Aggregate                      │
│                                                          │
│  SalesAccount ──1:N──► SalesContact                      │
│              ──1:N──► SalesInstitutionalMemory           │
│              ──1:N──► SalesICPInsight (via accountId)    │
│                                                          │
│  Fields: id, organizationId, name, nameAr, industry,     │
│          industryAr, status, ownerId, isDemo,            │
│          createdById, updatedById, createdAt, updatedAt │
│                                                          │
│  REMOVED: metadata.institutionalMemory (extracted)       │
└─────────────────────────────────────────────────────────┘
          │
          │ organizationId (shared)
          ▼
┌─────────────────────────────────────────────────────────┐
│                  Governance Aggregate                    │
│                                                          │
│  SalesProposal ──1:N──► SalesReview                      │
│                ──1:N──► SalesApproval                     │
│                                                          │
│  (No changes — already clean)                            │
└─────────────────────────────────────────────────────────┘
          │
          │ organizationId (shared)
          ▼
┌─────────────────────────────────────────────────────────┐
│                 Platform Services                        │
│                                                          │
│  PlatformAuditLog (unified audit trail)                  │
│  SalesTerritory (NEW)                                    │
│  SalesNbaSuppression (NEW)                               │
└─────────────────────────────────────────────────────────┘
```

---

## 4. New Prisma Models

### 4.1 SalesSignal

```prisma
model SalesSignal {
  id                     String   @id @default(cuid())
  organizationId         String
  platformOrganizationId String?
  dealId                 String?
  deal                   SalesDeal? @relation(fields: [dealId], references: [id], onDelete: Cascade)
  accountId              String?
  account                SalesAccount? @relation(fields: [accountId], references: [id], onDelete: Cascade)
  signalType             String   // buying | timing | budget | authority | need | other
  description            String
  strength               String   @default("moderate") // weak | moderate | strong
  status                 String   @default("active")
  source                 String   @default("manual")
  confidenceScore        Float?
  confidenceRationale    String?
  evidenceRef            String?
  metadata               Json?
  createdById            String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@index([organizationId, createdAt])
  @@index([dealId])
  @@index([accountId])
  @@index([signalType])
}
```

### 4.2 SalesObjection

```prisma
model SalesObjection {
  id                     String   @id @default(cuid())
  organizationId         String
  platformOrganizationId String?
  dealId                 String?
  deal                   SalesDeal? @relation(fields: [dealId], references: [id], onDelete: Cascade)
  accountId              String?
  account                SalesAccount? @relation(fields: [accountId], references: [id], onDelete: Cascade)
  category               String
  description            String
  frequency              Int      @default(1)
  resolved               Boolean  @default(false)
  status                 String   @default("active")
  source                 String   @default("manual")
  labelAr                String?
  confidenceScore        Float?
  confidenceRationale    String?
  evidenceRef            String?
  metadata               Json?
  createdById            String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@index([organizationId, createdAt])
  @@index([dealId])
  @@index([accountId])
  @@index([category])
}
```

### 4.3 SalesCompetitorMention

```prisma
model SalesCompetitorMention {
  id                     String   @id @default(cuid())
  organizationId         String
  platformOrganizationId String?
  dealId                 String?
  deal                   SalesDeal? @relation(fields: [dealId], references: [id], onDelete: Cascade)
  accountId              String?
  account                SalesAccount? @relation(fields: [accountId], references: [id], onDelete: Cascade)
  competitorName         String
  context                String
  threatLevel            String   @default("medium") // low | medium | high
  status                 String   @default("active")
  source                 String   @default("manual")
  confidenceScore        Float?
  confidenceRationale    String?
  evidenceRef            String?
  metadata               Json?
  createdById            String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@index([organizationId, createdAt])
  @@index([dealId])
  @@index([accountId])
  @@index([competitorName])
}
```

### 4.4 SalesWinLossInsight

```prisma
model SalesWinLossInsight {
  id                     String   @id @default(cuid())
  organizationId         String
  platformOrganizationId String?
  dealId                 String
  deal                   SalesDeal @relation(fields: [dealId], references: [id], onDelete: Cascade)
  outcome                String   // won | lost
  primaryReason          String
  contributingFactors    String[]
  competitorInvolved     String?
  status                 String   @default("active")
  source                 String   @default("manual")
  confidenceScore        Float?
  confidenceRationale    String?
  evidenceRef            String?
  metadata               Json?
  createdById            String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@index([organizationId, createdAt])
  @@index([dealId])
  @@index([outcome])
}
```

### 4.5 SalesNextAction

```prisma
model SalesNextAction {
  id                     String   @id @default(cuid())
  organizationId         String
  platformOrganizationId String?
  dealId                 String?
  deal                   SalesDeal? @relation(fields: [dealId], references: [id], onDelete: Cascade)
  accountId              String?
  account                SalesAccount? @relation(fields: [accountId], references: [id], onDelete: Cascade)
  title                  String
  description            String?
  priority               String   @default("medium") // low | medium | high | urgent
  dueAt                  DateTime?
  assigneeId             String?
  ruleId                 String?
  recommendationOnly     Boolean  @default(false)
  status                 String   @default("active")
  source                 String   @default("manual")
  evidenceRef            String?
  metadata               Json?
  createdById            String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@index([organizationId, createdAt])
  @@index([dealId])
  @@index([accountId])
  @@index([priority])
}
```

### 4.6 SalesProofAsset

```prisma
model SalesProofAsset {
  id                     String   @id @default(cuid())
  organizationId         String
  platformOrganizationId String?
  dealId                 String?
  deal                   SalesDeal? @relation(fields: [dealId], references: [id], onDelete: Cascade)
  accountId              String?
  account                SalesAccount? @relation(fields: [accountId], references: [id], onDelete: Cascade)
  assetType              String   // case_study | pilot_result | audit_evidence | demo_recording | proposal | customer_quote | benchmark | objection_response
  title                  String
  description            String?
  linkedAccountIds       String[]
  linkedDealIds          String[]
  externalRef            String?
  evidenceRef            String?
  status                 String   @default("active")
  source                 String   @default("manual")
  confidenceScore        Float?
  confidenceRationale    String?
  metadata               Json?
  createdById            String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@index([organizationId, createdAt])
  @@index([dealId])
  @@index([accountId])
  @@index([assetType])
}
```

### 4.7 SalesICPInsight

```prisma
model SalesICPInsight {
  id                     String   @id @default(cuid())
  organizationId         String
  platformOrganizationId String?
  accountId              String?
  account                SalesAccount? @relation(fields: [accountId], references: [id], onDelete: Cascade)
  dimension              String   // industry | company_size | title | pain_point | region | other
  hypothesis             String
  evidenceSummary        String
  evidenceRef            String?
  recommendation         String?
  status                 String   @default("active")
  source                 String   @default("manual")
  confidenceScore        Float?
  confidenceRationale    String?
  metadata               Json?
  createdById            String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@index([organizationId, createdAt])
  @@index([accountId])
  @@index([dimension])
}
```

### 4.8 SalesInstitutionalMemory

```prisma
model SalesInstitutionalMemory {
  id                     String   @id @default(cuid())
  organizationId         String
  platformOrganizationId String?
  accountId              String
  account                SalesAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  type                   String   // preference | pattern | risk | opportunity | relationship | other
  content                String
  confidenceScore        Float?
  confidenceRationale    String?
  source                 String   @default("manual")
  metadata               Json?
  createdById            String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@index([organizationId, createdAt])
  @@index([accountId])
  @@index([type])
}
```

### 4.9 SalesTerritory

```prisma
model SalesTerritory {
  id                     String   @id @default(cuid())
  organizationId         String
  platformOrganizationId String?
  name                   String
  description            String?
  ownerIds               String[]
  metadata               Json?
  createdById            String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@unique([organizationId, name])
  @@index([organizationId])
}
```

### 4.10 SalesNbaSuppression

```prisma
model SalesNbaSuppression {
  id                     String   @id @default(cuid())
  organizationId         String
  platformOrganizationId String?
  nbaActionId            String
  action                 String
  suppressedUntil        DateTime?
  createdById            String?
  createdAt              DateTime @default(now())

  @@unique([organizationId, nbaActionId])
  @@index([organizationId])
}
```

---

## 5. SalesDeal Schema Changes

### Remove fields

| Field | Reason |
|-------|--------|
| `pipelineStage` (String) | Redundant with `stageId` FK. All consumers migrate to FK-based lookups. |
| `name` (String?) | Redundant with `title`. Legacy holdover. |

### Add typed JSON columns

| Field | Type | Purpose |
|-------|------|---------|
| `riskAssessment` | Json? | Semi-structured risk data (varies by deal) |
| `conversionMemo` | Json? | Conversion memo content |
| `commercialClaims` | Json? | Commercial claims for review |
| `aiAnalysis` | Json? | AI-generated analysis results |
| `leadScores` | Json? | Lead scoring data |

### Remove from metadata

| Key | Action |
|-----|--------|
| `reviewDecisions` | Already in SalesReview + SalesApproval tables |
| `nextAction` | Already in SalesNextAction table (after migration) |
| `riskAssessment` | Move to `riskAssessment` column |
| `conversionMemo` | Move to `conversionMemo` column |
| `commercialClaims` | Move to `commercialClaims` column |
| `aiAnalysis` | Move to `aiAnalysis` column |
| `leadScores` | Move to `leadScores` column |
| `outreachDrafts` | Keep in metadata (ephemeral drafts) |

### Add relation to SalesICPInsight

ICPs are account-level intelligence, but currently stored as ghost delegates. Add `SalesICPInsight.accountId` FK → `SalesAccount`.

---

## 6. Repository Layer Pattern

After migration, the repository layer follows this pattern:

```typescript
// src/lib/sales/repositories/ — canonical read/write layer

// DEAL REPOSITORY
export const dealRepository = {
  findById(dealId: string, organizationId: string): Promise<SalesDeal | null>
  findByOrganization(organizationId: string): Promise<SalesDeal[]>
  findByAccount(accountId: string, organizationId: string): Promise<SalesDeal[]>
  create(input: CreateDealInput, actor: SalesActor): Promise<SalesDeal>
  update(dealId: string, organizationId: string, patch: UpdateDealInput, actor: SalesActor): Promise<SalesDeal>
  delete(dealId: string, organizationId: string): Promise<void>
}

// SIGNAL REPOSITORY (NEW)
export const signalRepository = {
  findById(signalId: string, organizationId: string): Promise<SalesSignal | null>
  findByDeal(dealId: string, organizationId: string): Promise<SalesSignal[]>
  findByAccount(accountId: string, organizationId: string): Promise<SalesSignal[]>
  create(input: CreateSignalInput, actor: SalesActor): Promise<SalesSignal>
  update(signalId: string, organizationId: string, patch: Partial<SalesSignal>): Promise<SalesSignal>
  delete(signalId: string, organizationId: string): Promise<void>
}

// ... similar pattern for Objection, CompetitorMention, WinLossInsight,
//     ICPInsight, NextAction, ProofAsset, InstitutionalMemory
```

**Key rules:**
- All reads are tenant-scoped (organizationId required)
- All writes validate tenant ownership before mutation
- All mutations write to PlatformAuditLog
- No fire-and-forget writes — all Prisma operations are awaited
- No in-memory Map as source of truth

---

## 7. Service Layer Pattern

After migration, the service layer follows this pattern:

```typescript
// src/lib/sales/services/ — domain services

// services/deal-service.ts
export async function createDeal(
  scope: SalesOrgScope,
  input: CreateSalesDealInput,
  actor: SalesActor,
): Promise<SalesDeal> {
  // 1. Validate input
  // 2. Validate account exists in org
  // 3. Validate stage exists in org
  // 4. Check governance rules
  // 5. Write to Prisma (await)
  // 6. Write audit event
  // 7. Return deal
}

// services/signal-service.ts
export async function createSignal(
  scope: SalesOrgScope,
  input: CreateSignalInput,
  actor: SalesActor,
): Promise<SalesSignal> {
  // 1. Validate input
  // 2. Validate deal exists in org (if dealId provided)
  // 3. Write to Prisma (await)
  // 4. Write audit event
  // 5. Return signal
}
```

---

## 8. v02 Computation Modules — Migration to Prisma Reads

After Tier A entities are in Prisma, v02 modules must accept Prisma-backed DTOs:

| Module | Current Input | Target Input |
|--------|--------------|-------------|
| Knowledge Graph | In-memory store | Prisma queries via repository |
| Proof Network | Typed args | Already decoupled (no change) |
| Proof Effectiveness | In-memory store | Prisma queries via repository |
| Market Intelligence | Typed args | Already decoupled (no change) |
| Institutional Learning | Typed args | Already decoupled (no change) |
| Strategic Recommendations | In-memory store | Prisma queries via repository |

**Bridge files** (`vnext/*-v02.ts`): Merge into their parent vnext module. Remove re-export indirection.

---

## 9. vNext Stubs — Cleanup

| Module | Action | Reason |
|--------|--------|--------|
| `deal-review` (4 stubs) | Delete | Governance handled by Governance Aggregate |
| `proposal-workflow` (2 stubs) | Delete | Workflow handled by Governance Aggregate |
| `commercial-review-runtime` (2 stubs) | Delete | Review handled by Governance Aggregate |
| `workspace-metadata` (1 stub) | Delete | Metadata handled by Account/Deal models |
| `commercial-evidence` (1 always-false) | Delete | Evidence handled by SalesEvidenceLink |
| `learning-loop` (1 facade) | Delete | Learning handled by v02 modules |
| `cross-product-signals` (1 stub) | Delete | Unreachable, no callers |

**Total: 12 stub modules deleted.**

---

## 10. Cross-Product Event Handlers — Cleanup

| Handler | Current | Target |
|---------|---------|--------|
| `("sales", "*")` | logger.info only | Delete — no business logic |
| `("audit", "review.completed")` | logger.info only | Implement real handler or delete with TODO |
| `("lc", "project.classified")` | logger.info only | Implement real handler or delete with TODO |

**Recommendation:** Delete all 3 logging-only handlers. If cross-product integration is needed later, implement with real business logic.

---

## 11. Duplicate Code Cleanup

### 11.1 assertDealInOrg

| Location | Action |
|----------|--------|
| `repositories/org-scope.ts` | **Keep** (canonical) |
| `evidence-links.ts` | Replace with import from `repositories/org-scope` |
| `interactions.ts` | Replace with import from `repositories/org-scope` |
| `outreach.ts` | Replace with import from `repositories/org-scope` |

### 11.2 Service Layer

| Location | Action |
|----------|--------|
| `services.ts` (Prisma) | **Keep** (canonical, rename to `services/deal-service.ts`) |
| `service.ts` (in-memory) | **Delete** after migration |

### 11.3 proof-network-overview

| Location | Action |
|----------|--------|
| `vnext/commercial-proof-network-overview.ts` | **Delete** (duplicate) |
| `vnext/proof-network-overview.ts` | **Keep** (canonical) |

---

## 12. Environment Flags — Post-Migration

| Flag | Action |
|------|--------|
| `SALESOS_FILE_PERSISTENCE` | Remove after migration complete |
| `SALESOS_PRISMA_PERSISTENCE` | Remove after migration complete |
| `TIER_A_FILE_SNAPSHOT_ENABLED` | Remove after migration complete |

---

## 13. Migration Order (Phase 4 Preview)

### Wave A — Tier A Intelligence (7 new Prisma models)
1. Create Prisma models (SalesSignal, SalesObjection, SalesCompetitorMention, SalesWinLossInsight, SalesNextAction, SalesProofAsset, SalesICPInsight)
2. Create repository layer for each
3. Create service layer for each
4. Add dual-write from in-memory → Prisma (with env flag)
5. Migrate reads from in-memory → Prisma
6. Remove in-memory stores
7. Delete env flags

### Wave B — Account & Deal Cleanup (3 new Prisma models + schema changes)
1. Create SalesInstitutionalMemory model
2. Create SalesTerritory model
3. Create SalesNbaSuppression model
4. Add typed JSON columns to SalesDeal (riskAssessment, conversionMemo, commercialClaims, aiAnalysis, leadScores)
5. Migrate SalesDeal.metadata sub-domains to typed columns
6. Remove `pipelineStage` and `name` fields from SalesDeal
7. Extract SalesAccount.metadata.institutionalMemory → SalesInstitutionalMemory
8. Remove in-memory stores
9. Delete legacy service.ts

### Wave C — Cleanup & Unification
1. Delete 12 vNext stubs
2. Merge 7 bridge files
3. Delete duplicate proof-network-overview
4. Delete 3 logging-only event handlers
5. Replace 3 duplicate assertDealInOrg implementations
6. Remove env flags
7. Convert SalesOpportunity to DTO only
8. Final validation pass

---

*End of Phase 3 — Canonical Domain Model*
