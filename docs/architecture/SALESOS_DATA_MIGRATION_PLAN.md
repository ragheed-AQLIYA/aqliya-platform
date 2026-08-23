# SALESOS DATA MIGRATION PLAN — Phase 4

> **Date:** 2026-08-17
> **Program:** SALESOS P0 — Domain & Data Unification
> **Status:** Migration Design Complete
> **Depends on:** `SALESOS_CANONICAL_DOMAIN_MODEL.md` (Phase 3)

---

## 0. Migration Principles

1. **Zero downtime.** Every wave is backward-compatible during transition.
2. **Dual-write → verify → cutover → cleanup.** Never skip steps.
3. **Rollback at every step.** If a wave fails, previous wave still works.
4. **No destructive operations until verification passes.**
5. **Each wave is independently deployable.** Waves don't block each other.
6. **Seed data must survive migration.** No data loss.

---

## 1. Wave A — Tier A Intelligence Entities

**Goal:** Create 7 new Prisma models for Tier A intelligence, migrate from in-memory to Prisma.

**Duration estimate:** 2-3 implementation sessions
**Risk level:** Medium (new models, no existing data in Prisma)
**Rollback:** Delete new Prisma models, revert to in-memory stores

### A.1 — Create Prisma Models

**Files changed:**
- `prisma/schema.prisma` — add 7 new models
- `prisma/migrations/` — new migration

**Models to create:**
1. `SalesSignal`
2. `SalesObjection`
3. `SalesCompetitorMention`
4. `SalesWinLossInsight`
5. `SalesNextAction`
6. `SalesProofAsset`
7. `SalesICPInsight`

**Verification:**
```bash
npx prisma validate
npx prisma generate
npx prisma migrate dev --name add-tier-a-intelligence
```

**Rollback:**
```bash
npx prisma migrate reset  # destructive — only if needed before data exists
# or: remove migration files, revert schema.prisma
```

### A.2 — Create Repository Layer

**Files created:**
- `src/lib/sales/repositories/signal-repository.ts`
- `src/lib/sales/repositories/objection-repository.ts`
- `src/lib/sales/repositories/competitor-mention-repository.ts`
- `src/lib/sales/repositories/win-loss-repository.ts`
- `src/lib/sales/repositories/next-action-repository.ts`
- `src/lib/sales/repositories/proof-asset-repository.ts`
- `src/lib/sales/repositories/icp-insight-repository.ts`

**Pattern per repository:**
```typescript
import "server-only";
import { prisma } from "@/lib/prisma";

export const signalRepository = {
  async findById(id: string, organizationId: string) {
    return prisma.salesSignal.findFirst({
      where: { id, organizationId },
    });
  },
  async findByDeal(dealId: string, organizationId: string) {
    return prisma.salesSignal.findMany({
      where: { dealId, organizationId },
      orderBy: { createdAt: "desc" },
    });
  },
  async findByAccount(accountId: string, organizationId: string) {
    return prisma.salesSignal.findMany({
      where: { accountId, organizationId },
      orderBy: { createdAt: "desc" },
    });
  },
  async create(data: Prisma.SalesSignalCreateInput) {
    return prisma.salesSignal.create({ data });
  },
  async update(id: string, organizationId: string, data: Prisma.SalesSignalUpdateInput) {
    return prisma.salesSignal.updateMany({
      where: { id, organizationId },
      data,
    });
  },
  async delete(id: string, organizationId: string) {
    return prisma.salesSignal.deleteMany({
      where: { id, organizationId },
    });
  },
};
```

**Verification:**
- TypeScript compiles: `npx tsc --noEmit`
- Repository tests pass (new tests in `repositories/__tests__/`)

**Rollback:** Delete repository files. No data affected.

### A.3 — Add Dual-Write (Prisma Write)

**Files changed:**
- `src/lib/sales/store/signals.ts` — add `persistPrismaWrite` for create/update/delete
- `src/lib/sales/store/objections.ts` — same pattern
- `src/lib/sales/store/competitors.ts` — same pattern
- `src/lib/sales/store/insights.ts` — same pattern (WinLoss + ICP)
- `src/lib/sales/store/next-actions.ts` — same pattern
- `src/lib/sales/store/proof-assets.ts` — same pattern

**Pattern:**
```typescript
// In store/signals.ts — createSignal function
export function createSignal(input: Omit<SalesSignal, "id">): SalesSignal {
  const store = getOrgStore(input.organizationId);
  const signal: SalesSignal = {
    ...input,
    id: `sales-sig-${crypto.randomUUID().slice(0, 8)}`,
  };
  store.signals.set(signal.id, signal);
  schedulePersist(input.organizationId);

  // NEW: Dual-write to Prisma
  persistPrismaWrite(input.organizationId, "createSignal", async () => {
    const { signalRepository } = await import("../repositories");
    await signalRepository.create({
      id: signal.id,
      organizationId: signal.organizationId,
      signalType: signal.signalType,
      description: signal.description,
      strength: signal.strength,
      status: signal.status,
      source: signal.source,
      // ... map all fields
    });
  });

  return signal;
}
```

**Env flag:** Use existing `SALESOS_PRISMA_PERSISTENCE` flag to gate dual-write.

**Verification:**
- In-memory store still works (reads from memory)
- Prisma writes are fire-and-forget (no blocking)
- If Prisma write fails, in-memory store still has data

**Rollback:** Remove dual-write code. In-memory store continues working.

### A.4 — Seed Prisma from In-Memory

**Files created:**
- `scripts/db/seed-tier-a-intelligence.ts`

**Logic:**
1. For each org in `orgStores`, iterate all Tier A entities
2. Write each entity to corresponding Prisma model
3. Verify count matches

**Verification:**
```bash
npx tsx scripts/db/seed-tier-a-intelligence.ts
# Check: prisma.salesSignal.count() === store.signals.size for each org
```

**Rollback:** `npx prisma migrate reset` (only if no other data)

### A.5 — Switch Reads to Prisma

**Files changed:**
- All v02 modules that read Tier A data from in-memory stores
- `src/lib/sales/store/signals.ts` — readers now call Prisma
- `src/lib/sales/store/objections.ts` — same
- `src/lib/sales/store/competitors.ts` — same
- `src/lib/sales/store/insights.ts` — same
- `src/lib/sales/store/next-actions.ts` — same
- `src/lib/sales/store/proof-assets.ts` — same

**Pattern:**
```typescript
// Before: reads from in-memory
export function listSignals(organizationId: string): SalesSignal[] {
  return [...getOrgStore(organizationId).signals.values()];
}

// After: reads from Prisma
export async function listSignals(organizationId: string): Promise<SalesSignal[]> {
  const { signalRepository } = await import("../repositories");
  return signalRepository.findByOrganization(organizationId);
}
```

**Critical:** This changes function signatures from sync to async. All callers must be updated.

**Caller audit (must update):**
- `src/lib/sales/intelligence.ts` — calls listSignals, listObjections, etc.
- `src/lib/sales/v02/knowledge-graph.ts` — reads from store
- `src/lib/sales/v02/proof-effectiveness.ts` — reads from store
- `src/lib/sales/v02/strategic-recommendations.ts` — reads from store
- `src/lib/sales/vnext/revenue-intelligence.ts` — reads from store
- `src/components/sales/` — UI components that call store functions

**Verification:**
- All reads return Prisma data
- In-memory stores are no longer read
- No data loss: Prisma counts match expected

**Rollback:** Revert read functions to in-memory. Dual-write still populates Prisma.

### A.6 — Remove In-Memory Stores

**Files deleted/modified:**
- `src/lib/sales/store/signals.ts` — remove in-memory Map, keep only Prisma reads
- `src/lib/sales/store/objections.ts` — same
- `src/lib/sales/store/competitors.ts` — same
- `src/lib/sales/store/insights.ts` — same (WinLoss + ICP)
- `src/lib/sales/store/next-actions.ts` — same
- `src/lib/sales/store/proof-assets.ts` — same

**Files deleted:**
- `src/lib/sales/persistence.ts` — file-based persistence (no longer needed)
- `.data/sales/` — file snapshots (delete after verification)

**Verification:**
- No references to `getOrgStore(organizationId).signals` remain
- No references to file persistence for Tier A entities
- TypeScript compiles
- Tests pass

**Rollback:** Restore in-memory stores from git history.

### A.7 — Wave A Completion Checklist

- [ ] 7 Prisma models created and migrated
- [ ] 7 repository modules created with tests
- [ ] Dual-write implemented for all Tier A entities
- [ ] Seed script migrated existing data to Prisma
- [ ] Reads switched to Prisma (async)
- [ ] All callers updated (async)
- [ ] In-memory stores removed
- [ ] File persistence removed
- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes (existing + new)
- [ ] `npm run build` passes
- [ ] No references to deleted code remain

---

## 2. Wave B — Account & Deal Cleanup

**Goal:** Extract metadata sub-domains, add new models, clean up SalesDeal schema.

**Duration estimate:** 2-3 implementation sessions
**Risk level:** High (modifies existing Prisma models, data migration required)
**Rollback:** Schema migration is reversible with backup

### B.1 — Create SalesInstitutionalMemory Model

**Files changed:**
- `prisma/schema.prisma` — add `SalesInstitutionalMemory` model
- `prisma/migrations/` — new migration

**Migration logic:**
```sql
-- Create table
CREATE TABLE "SalesInstitutionalMemory" (
  -- ... columns from Phase 3
);

-- Migrate existing data from SalesAccount.metadata.institutionalMemory
INSERT INTO "SalesInstitutionalMemory" (id, "organizationId", "accountId", type, content, "confidenceScore", source, "createdAt")
SELECT
  gen_random_uuid()::text,
  sa."organizationId",
  sa.id,
  (item->>'type')::text,
  (item->>'content')::text,
  (item->>'confidence')::float,
  COALESCE((item->>'source')::text, 'seed'),
  COALESCE((item->>'createdAt')::timestamp, NOW())
FROM "SalesAccount" sa,
LATERAL jsonb_array_elements(CASE WHEN sa.metadata->'institutionalMemory' IS NOT NULL THEN sa.metadata->'institutionalMemory' ELSE '[]'::jsonb END) AS item;
```

**Verification:**
```bash
npx prisma migrate dev --name add-institutional-memory
# Check count matches: SELECT count(*) FROM "SalesInstitutionalMemory"
```

### B.2 — Create SalesTerritory Model

**Files changed:**
- `prisma/schema.prisma` — add `SalesTerritory` model
- `prisma/migrations/` — new migration

**No data migration** — territories are in-memory only, no existing data.

### B.3 — Create SalesNbaSuppression Model

**Files changed:**
- `prisma/schema.prisma` — add `SalesNbaSuppression` model
- `prisma/migrations/` — new migration

**Migration logic:**
- Read from `nba-suppression-store.ts` in-memory/file
- Write to Prisma
- Delete in-memory/file store

### B.4 — Add Typed JSON Columns to SalesDeal

**Files changed:**
- `prisma/schema.prisma` — add columns to `SalesDeal`
- `prisma/migrations/` — new migration

**Columns to add:**
```prisma
model SalesDeal {
  // ... existing fields
  riskAssessment   Json?
  conversionMemo   Json?
  commercialClaims Json?
  aiAnalysis       Json?
  leadScores       Json?
}
```

**Migration logic:**
```sql
ALTER TABLE "SalesDeal"
  ADD COLUMN "riskAssessment" JsonB,
  ADD COLUMN "conversionMemo" JsonB,
  ADD COLUMN "commercialClaims" JsonB,
  ADD COLUMN "aiAnalysis" JsonB,
  ADD COLUMN "leadScores" JsonB;

-- Migrate from metadata JSON
UPDATE "SalesDeal"
SET
  "riskAssessment" = metadata->'riskAssessment',
  "conversionMemo" = metadata->'conversionMemo',
  "commercialClaims" = metadata->'commercialClaims',
  "aiAnalysis" = metadata->'aiAnalysis',
  "leadScores" = metadata->'leadScores'
WHERE metadata IS NOT NULL;

-- Remove migrated keys from metadata
UPDATE "SalesDeal"
SET metadata = metadata - 'riskAssessment' - 'conversionMemo' - 'commercialClaims' - 'aiAnalysis' - 'leadScores' - 'reviewDecisions' - 'nextAction'
WHERE metadata IS NOT NULL;
```

### B.5 — Remove Duplicate Fields from SalesDeal

**Files changed:**
- `prisma/schema.prisma` — remove `pipelineStage` and `name`
- `prisma/migrations/` — new migration

**Migration logic:**
```sql
-- Before dropping, verify no reads depend on these fields
-- Grep codebase for: pipelineStage, deal.name

ALTER TABLE "SalesDeal" DROP COLUMN "pipelineStage";
ALTER TABLE "SalesDeal" DROP COLUMN "name";
```

**Prerequisite:** All consumers of `pipelineStage` and `name` must be migrated to use `stageId` FK and `title` respectively.

### B.6 — Extract Institutional Memory

**Files changed:**
- `src/lib/sales/institutional-memory-shared.ts` — reads from new table
- `src/lib/sales/institutional-memory-sync.ts` — writes to new table
- `src/lib/sales/services/accounts.ts` — remove metadata.institutionalMemory handling

### B.7 — Migrate Metadata Sub-Domains to Typed Columns

**Files changed:**
- `src/lib/sales/outreach.ts` — reads/writes `conversionMemo` column
- `src/lib/sales/conversion-memo.ts` — reads/writes `conversionMemo` column
- `src/lib/sales/commercial-claims.ts` — reads/writes `commercialClaims` column
- `src/lib/sales/services.ts` — reads typed columns instead of metadata JSON
- `src/lib/sales/governance.ts` — reads `reviewDecisions` from SalesReview/SalesApproval tables

### B.8 — Remove Legacy In-Memory Stores

**Files deleted:**
- `src/lib/sales/store/common.ts` — OrgStore type definition (remove Tier A maps)
- `src/lib/sales/store/accounts.ts` — in-memory account store
- `src/lib/sales/store/contacts.ts` — in-memory contact store
- `src/lib/sales/store/interactions.ts` — in-memory interaction store
- `src/lib/sales/store/evidence.ts` — in-memory evidence store
- `src/lib/sales/store/opportunities.ts` — in-memory opportunity store
- `src/lib/sales/store/leads.ts` — dead store
- `src/lib/sales/store/outreach.ts` — dead store
- `src/lib/sales/store/meetings.ts` — dead store
- `src/lib/sales/store/audit.ts` — in-memory audit log
- `src/lib/sales/service.ts` — legacy in-memory service layer
- `src/lib/sales/persistence.ts` — file persistence

**Files modified:**
- `src/lib/sales/store/index.ts` — remove re-exports of deleted modules
- `src/lib/sales/nba-suppression-store.ts` — migrate to Prisma
- `src/lib/sales/sales-territory-store.ts` — migrate to Prisma

### B.9 — Wave B Completion Checklist

- [ ] SalesInstitutionalMemory model created and migrated
- [ ] SalesTerritory model created
- [ ] SalesNbaSuppression model created
- [ ] Typed JSON columns added to SalesDeal
- [ ] Metadata sub-domains migrated to typed columns
- [ ] `pipelineStage` and `name` fields removed
- [ ] Institutional memory extracted to own table
- [ ] All in-memory stores deleted
- [ ] Legacy service.ts deleted
- [ ] File persistence deleted
- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes
- [ ] `npm run build` passes

---

## 3. Wave C — Cleanup & Unification

**Goal:** Remove dead code, unify duplicates, convert SalesOpportunity to DTO.

**Duration estimate:** 1-2 implementation sessions
**Risk level:** Low (cleanup, no data changes)
**Rollback:** Git revert

### C.1 — Delete vNext Stubs

**Files deleted:**
- `src/lib/sales/vnext/deal-review/deal-review-missing-reviews.ts`
- `src/lib/sales/vnext/deal-review/deal-review-no-evidence.ts`
- `src/lib/sales/vnext/deal-review/deal-review-stage-gate.ts`
- `src/lib/sales/vnext/deal-review/deal-review-stale-deal.ts`
- `src/lib/sales/vnext/proposal-workflow/proposal-auto-create.ts`
- `src/lib/sales/vnext/proposal-workflow/proposal-missing-evidence.ts`
- `src/lib/sales/vnext/commercial-review-runtime/commercial-review-missing-review.ts`
- `src/lib/sales/vnext/commercial-review-runtime/commercial-review-stale.ts`
- `src/lib/sales/vnext/workspace-metadata/workspace-metadata-coverage.ts`
- `src/lib/sales/vnext/commercial-evidence/commercial-evidence-unlinked.ts`
- `src/lib/sales/vnext/learning-loop/index.ts`
- `src/lib/sales/vnext/cross-product-signals.ts`

### C.2 — Merge Bridge Files

**Files deleted (merge into parent):**
- `src/lib/sales/vnext/account-intelligence-v02.ts` → merge into `account-intelligence/index.ts`
- `src/lib/sales/vnext/opportunity-intelligence-v02.ts` → merge into `opportunity-intelligence/index.ts`
- `src/lib/sales/vnext/pipeline-analytics-v02.ts` → merge into `pipeline-analytics/index.ts`
- `src/lib/sales/vnext/meeting-intelligence-v02.ts` → merge into `meeting-intelligence/index.ts`
- `src/lib/sales/vnext/revenue-intelligence-v02.ts` → merge into `revenue-intelligence/index.ts`
- `src/lib/sales/vnext/commercial-memory-v02.ts` → merge into `commercial-memory/index.ts`
- `src/lib/sales/vnext/commercial-proof-network-overview-v02.ts` → merge into `proof-network-overview/index.ts`

### C.3 — Delete Duplicate Code

**Files deleted:**
- `src/lib/sales/vnext/commercial-proof-network-overview.ts` (duplicate of proof-network-overview)

### C.4 — Replace Duplicate assertDealInOrg

**Files modified:**
- `src/lib/sales/evidence-links.ts` — import from `repositories/org-scope`
- `src/lib/sales/interactions.ts` — import from `repositories/org-scope`
- `src/lib/sales/outreach.ts` — import from `repositories/org-scope`

### C.5 — Delete Logging-Only Event Handlers

**Files modified:**
- `src/products/sales-os/sales-os-plugin.ts` — remove 3 stub handlers

### C.6 — Convert SalesOpportunity to DTO

**Files modified:**
- `src/lib/sales/types.ts` — SalesOpportunity becomes a DTO (read-only interface)
- `src/lib/sales/repositories/entity-mappers.ts` — `prismaDealToOpportunity` becomes `dealToOpportunityDTO`
- `src/lib/sales/repositories/opportunity-repository.ts` — becomes thin wrapper around deal repository

**Rule:** `SalesOpportunity` is never written to. It's always constructed from `SalesDeal` via mapper.

### C.7 — Remove Environment Flags

**Files modified:**
- `src/lib/sales/store/common.ts` — remove `FILE_PERSISTENCE_ENABLED`, `PRISMA_PERSISTENCE_ENABLED`, `TIER_A_FILE_SNAPSHOT_ENABLED`
- `.env.example` — remove `SALESOS_FILE_PERSISTENCE`, `SALESOS_PRISMA_PERSISTENCE`

### C.8 — Wave C Completion Checklist

- [ ] 12 vNext stubs deleted
- [ ] 7 bridge files merged
- [ ] Duplicate proof-network-overview deleted
- [ ] 3 duplicate assertDealInOrg replaced
- [ ] 3 logging-only event handlers deleted
- [ ] SalesOpportunity converted to DTO
- [ ] Environment flags removed
- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes
- [ ] `npm run build` passes

---

## 4. Golden Path Verification (Phase 7 Preview)

After all waves, verify this end-to-end flow:

```
1. Create Account → SalesAccount in Prisma
2. Create Contact → SalesContact in Prisma (FK → Account)
3. Create Deal → SalesDeal in Prisma (FK → Account, FK → Stage)
4. Add Interaction → SalesInteraction in Prisma (FK → Deal)
5. Add Signal → SalesSignal in Prisma (FK → Deal)
6. Add Objection → SalesObjection in Prisma (FK → Deal)
7. Add CompetitorMention → SalesCompetitorMention in Prisma (FK → Deal)
8. Add ProofAsset → SalesProofAsset in Prisma (FK → Deal)
9. Add NextAction → SalesNextAction in Prisma (FK → Deal)
10. Add EvidenceLink → SalesEvidenceLink in Prisma (FK → Deal)
11. Submit for Review → SalesProposal + SalesReview in Prisma
12. Approve → SalesApproval in Prisma
13. Change Stage → SalesDeal.stageId updated, governance checked
14. Close Won → SalesDeal.status = "won", SalesWinLossInsight created
15. Check Audit Trail → PlatformAuditLog entries for all mutations
16. Check Intelligence → v02 modules compute from Prisma data
17. Check Export → Account brief generates from Prisma data
```

**Every step must:**
- Write to Prisma (awaited, not fire-and-forget)
- Write to PlatformAuditLog
- Pass tenant isolation check (organizationId)
- Return expected data

---

## 5. Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| In-memory → Prisma read migration breaks async callers | High | High | Audit all callers before switching. Use TypeScript compiler to find sync→async breakage. |
| Metadata JSON migration loses data | High | Low | Backup before migration. Verify JSON extraction SQL. |
| PipelineStage removal breaks UI | Medium | Medium | Grep codebase for `pipelineStage` references before removing. |
| Tier A seed data doesn't match in-memory data | Medium | Low | Compare counts and sample records before/after. |
| v02 modules fail with async reads | Medium | Medium | Update v02 modules to accept async inputs. |
| Governance rules break during metadata extraction | High | Low | Test governance flow after each sub-domain extraction. |
| Tests fail after store deletion | Low | High | Update mocks and test helpers after each wave. |

---

## 6. Verification Commands (Per Wave)

After each wave, run:

```bash
# Type safety
npx tsc --noEmit

# Lint
npm run lint -- --quiet

# Tests
npm test

# Build
npm run build

# Prisma validation
npx prisma validate
npx prisma generate

# Schema drift check
npx prisma db diff
```

---

*End of Phase 4 — Migration Design*
