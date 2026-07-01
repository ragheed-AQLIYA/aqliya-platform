# 1. Executive truth table

﻿# SalesOS L5 Upgrade - Phase 1 Schema Proposal (v0.1)

**Status:** Proposal only - no migration created, no schema patched
**Date:** 2026-06-01
**Repo:** C:\Users\PC\Documents\Aqliya
**Validation:** npx prisma validate - pass (read-only, this session)
**Trust principle:** AI assists. Humans decide. Evidence governs.

## 1. Executive truth table

Conversation history describing mock-only SalesOS with no Prisma is **stale**. Repo reality as of 2026-06-01:

| Claim (older brief) | Repo reality | Verdict |
|---------------------|--------------|---------|
| No Sales* models | 8 Prisma models in prisma/schema.prisma (lines 1933-2124) | Exists |
| No /sales/* routes | 21 route files under src/app/sales/ | Exists |
| No server actions | src/actions/sales-actions.ts (~1500 lines) | Exists |
| No seed | scripts/seed-sales-demo.ts + SEED_SALES_DEMO hook | Exists |
| ~153 Jest tests | 18 suites, 153 tests in src/lib/sales/__tests__/ | Exists |
| Metadata signals/outreach/governance | src/lib/sales/* (metadata-first) | Partial tables |
| Migrations applied | 4 SalesOS migration folders in repo; deploy unsigned | Repo yes / DB unknown |

Naming drift (L5 spec vs shipped v0.3):

| L5 term | Shipped model / pattern | Gap |
|---------|-------------------------|-----|
| SalesAccount | SalesAccount | None |
| SalesContact | SalesContact | Minor: no createdById, sensitivity |
| SalesOpportunity | SalesDeal | Alias only - no DB rename |
| SalesActivity | SalesInteraction | Alias only - no DB rename |
| SalesEvidence | SalesEvidenceLink | Core evidence join, not blob store |
| SalesReview | deal.metadata.reviewDecisions[] | No relational table |
| SalesApproval | outreach/claim/governance metadata | No relational table |

## 2. Current models (what exists)

| Model | Tenant fields | Purpose |
|-------|---------------|---------|
| SalesPipeline | org + platformOrg | Pipeline config |
| SalesPipelineStage | org + platformOrg | Stages |
| SalesAccount | org + platformOrg | Accounts |
| SalesDeal | org + platformOrg | Opportunities (named Deal) |
| SalesInteraction | org + platformOrg | Activities |
| SalesContact | org + platformOrg | Stakeholders |
| SalesEvidenceLink | org + platformOrg | Core evidence refs |
| SalesAuditEvent | org + platformOrg | Domain audit log |

Repo migrations: 20260601140000_salesos_p0_core, 150000_interactions, 160000_evidence, 170000_contacts.

Metadata-only (no table): signals, outreach drafts, review decisions, conversion memo, commercial claims, agent runs, institutional memory, next action.

Surface: 21 routes, 47 lib modules, 28 components, 153 unit tests, sales-actions.ts.

## 3. Gap vs L5 + maturity label

| L5 need | Gap severity |
|---------|--------------|
| CRM core | Low (naming) |
| Evidence on outputs | Low |
| SalesProposal + SalesReview tables | Medium |
| SalesApproval unified record | Medium |
| salesos:review permission | Medium (app layer) |
| Operator migrate/smoke proof | Ops blocker |

Honest labels:
- Code shape: L5-shaped (governance UI, outreach queue, audit trail, agents, tests)
- Schema governance: L4+ / L5- (review/approval still JSON)
- Operational: not validated (Phase 0 unsigned)
- Matrix: L5 code-complete; L6 not achieved

SalesOS is past L4 in repo. Not institutionally closed L6.

## 4. Recommendation - extend, do not rename

| Keep | Alias in docs/UI |
|------|------------------|
| SalesDeal | Opportunity |
| SalesInteraction | Activity |
| SalesEvidenceLink | Evidence attachment |

Add (minimal L5): SalesProposal, SalesReview, SalesApproval
Defer tables: signals, outreach drafts, memory (stay metadata unless pilot requires SQL)

Dual-write metadata, backfill, cutover in Phases 5-6.

## 5. Proposed schema ADD/CHANGE (markdown only)

Use String @default(...) not Prisma enums (Phase 7 lesson).

### NEW SalesProposal

```prisma
model SalesProposal {
  id                     String   @id @default(cuid())
  organizationId         String
  platformOrganizationId String?
  dealId                 String
  deal                   SalesDeal @relation(fields: [dealId], references: [id], onDelete: Cascade)
  version                Int      @default(1)
  status                 String   @default("draft")
  title                  String?
  draft                  String   @default("")
  pilotCriteria          String   @default("")
  evidenceRefs           Json?
  exportReady            Boolean  @default(false)
  metadata               Json?
  createdById            String?
  updatedById            String?
  submittedAt            DateTime?
  decidedAt              DateTime?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
  reviews   SalesReview[]
  approvals SalesApproval[]
  @@index([organizationId, dealId])
  @@index([organizationId, status])
  @@index([platformOrganizationId, updatedAt])
}
```

### NEW SalesReview

```prisma
model SalesReview {
  id                     String   @id @default(cuid())
  organizationId         String
  platformOrganizationId String?
  reviewType             String
  targetType             String
  targetId               String
  dealId                 String?
  deal                   SalesDeal? @relation(fields: [dealId], references: [id], onDelete: SetNull)
  proposalId             String?
  proposal               SalesProposal? @relation(fields: [proposalId], references: [id], onDelete: SetNull)
  status                 String   @default("pending")
  reason                 String
  stageSlug              String?
  reviewerId             String
  reviewerName           String?
  metadata               Json?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
  approvals SalesApproval[]
  @@index([organizationId, createdAt])
  @@index([targetType, targetId])
}
```

### NEW SalesApproval

```prisma
model SalesApproval {
  id                     String   @id @default(cuid())
  organizationId         String
  platformOrganizationId String?
  reviewId               String
  review                 SalesReview @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  proposalId             String?
  proposal               SalesProposal? @relation(fields: [proposalId], references: [id], onDelete: SetNull)
  dealId                 String?
  deal                   SalesDeal? @relation(fields: [dealId], references: [id], onDelete: SetNull)
  kind                   String
  status                 String   @default("approved")
  approverId             String
  approverName           String?
  note                   String?
  expiresAt              DateTime?
  metadata               Json?
  createdAt              DateTime @default(now())
  @@index([organizationId, createdAt])
  @@index([reviewId])
}
```

### CHANGE SalesDeal - add relations only

```prisma
  proposals SalesProposal[]
  reviews   SalesReview[]
  approvals SalesApproval[]
```

### CHANGE SalesContact - optional hardening

Add createdById, updatedById, sensitivityLevel, status, metadata.

## 6. Tenant isolation

All new models: required organizationId, optional platformOrganizationId - same as existing Sales* models.

## 7. Audit compatibility

- Keep SalesAuditEvent as append-only mutation bus.
- SalesReview / SalesApproval = evidence of human decision, not audit replacement.
- New actions: sales.governance.approval_granted, sales.proposal.submitted, sales.proposal.approved.
- Backfill legacy reviewDecisions[] and conversionMemo in Phase 5.

## 8. Migration file name (Phase 2 - DO NOT CREATE NOW)

prisma/migrations/20260601180000_salesos_l5_governance_proposal_review/migration.sql

Optional: 20260601181000_salesos_l5_contact_governance_fields

Reconcile B1 drift first (docs/operations/salesos-migration-runbook.md section 7).

## 9. Affected files - Phases 3-8

| Phase | Files |
|-------|-------|
| 2 | prisma/schema.prisma, migration folder, prisma/seed.ts |
| 3 | governance.ts, conversion-memo.ts, commercial-claims.ts, outreach.ts, new proposals.ts, reviews.ts, approvals.ts, l5-types.ts |
| 4 | sales-actions.ts, permissions.ts, guards.ts, audit-logger.ts |
| 5 | review-decision-panel.tsx, deal-conversion-memo-panel.tsx, deal-outreach-panel.tsx, governance-approval-banner.tsx, /sales/review, /sales/deals/[id] |
| 6 | seed-sales-demo.ts, new backfill-sales-l5-reviews.ts |
| 7 | sales-governance.test.ts, conversion-memo, outreach, commercial-claims + new proposal/review tests |
| 8 | PRODUCT_STATUS_MATRIX.md, salesos-maturity-l3-l6.md, registry.ts, migration runbook |

## 10. Risks

| Risk | Mitigation |
|------|------------|
| Hybrid DB / B1 drift | Drift reconciliation before L5 DDL |
| Duplicate JSON + SQL | Dual-write, backfill, single path |
| Rename churn | Reject renames; glossary aliases |
| Enum reintroduction | String + TS unions |
| False L5 claim | pilot-ready with conditions until Phase 0 + smoke |
| RAM / low-load | No heavy commands without approval |

## 11. RAM / low-load note

Light only: git status -sb, targeted reads, npx prisma validate (pass). Not run: migrate, generate, build, full test.

## 12. Authority consulted

AGENTS.md, PRODUCT_STATUS_MATRIX.md, salesos-maturity-l3-l6.md, prisma/schema.prisma, src/lib/sales/*, src/app/sales/*, sales-actions.ts, seed-sales-demo.ts. No .cursor/rules directory (only hooks).

## 13. Phase 2 approval question

Approve Phase 2 migration salesos_l5_governance_proposal_review adding SalesProposal, SalesReview, and SalesApproval without renaming SalesDeal/SalesInteraction/SalesEvidenceLink, with dual-write backfill and B1 drift reconciliation first?

## 14. Arabic one-liner

??????? 1: SalesOS ????? ????? (8 ????? Prisma ?153 ??????) - L5 ????? ????? ??????/??????/????? ???? ????? ????? ?????? ??? Opportunity.

Phase 1 status: COMPLETE (proposal only; no schema change)
Next: Phase 2 - human-approved migration + drift preflight
