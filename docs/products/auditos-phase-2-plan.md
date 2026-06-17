---
title: AuditOS Phase 2 Implementation Plan
document_id: PLAN.002
status: Draft
version: 0.1
last_updated: 2026-05-08
supersedes: PLAN.001
---

# AuditOS Phase 2 Implementation Plan

## Objective

Move the Phase 1 demo prototype from mock-data-only into a Prisma-backed MVP foundation while preserving the working demo flow.

## Scope

### In Scope

| # | Task | Description |
|---|------|-------------|
| 1 | Prisma schema extension | Add all AuditOS entity models alongside existing DecisionOS models |
| 2 | Seed data | Gulf Trading Co. FY2025 engagement with all pre-seeded data |
| 3 | Prisma-backed server actions | Replace mock services with real DB calls |
| 4 | Engagement create/edit flow | Dialog-based CRUD for engagements |
| 5 | Trial balance CSV/XLSX upload | Real file parsing with column mapping |
| 6 | Canonical financial model | Persist canonical accounts as reference data |
| 7 | TraceabilityDrawer wiring | Wire across statements, notes, evidence, findings, recommendations, reviews, approvals, audit trail |
| 8 | Audit event persistence | Record events in DB via Prisma |
| 9 | Migration and seed scripts | `prisma migrate` and `prisma db seed` |
| 10 | Build/typecheck validation | Ensure 0 TypeScript errors after changes |

### Out of Scope

| Feature | Reason |
|---------|--------|
| Saudi Local Content | Post-MVP |
| Zakat/Tax | Different domain |
| Internal Audit | Different product wedge |
| ERP integrations | Post-MVP |
| Real AI provider integration | Phase 3+ |
| Production file storage | Post-MVP |
| Multi-tenant billing | Post-MVP |
| Advanced permissions | Beyond MVP needs |

## Prisma Models to Add

| Model | Key Fields | Relationships |
|-------|-----------|---------------|
| `AuditOrganization` | id, name, slug, jurisdiction, regulatoryFramework, status | HasMany AuditClient, AuditUser |
| `AuditUser` | id, organizationId, email, name, role, status | BelongsTo AuditOrganization |
| `AuditClient` | id, organizationId, name, industry, reportingFramework, currencyCode, status | BelongsTo AuditOrganization, HasMany Engagement |
| `Engagement` | id, organizationId, clientId, fiscalPeriod, engagementType, status, team (JSON), alerts (JSON) | BelongsTo AuditClient, HasMany TrialBalance, Evidence, Finding, Recommendation, AuditEvent |
| `TrialBalance` | id, engagementId, sourceFile, fileHash, trustState, totalDebits, totalCredits, variance | BelongsTo Engagement, HasMany TrialBalanceLine |
| `TrialBalanceLine` | id, trialBalanceId, accountCode, accountName, debitAmount, creditAmount, balance, accountType, currency | BelongsTo TrialBalance, HasOne AccountMapping |
| `CanonicalAccount` | id, code, name, category, statementType, reportingFramework, version, displayOrder | Standalone reference data |
| `AccountMapping` | id, engagementId, sourceAccountCode, sourceAccountName, debitAmount, creditAmount, canonicalAccountId, confidence, mappingType, status, mappedBy | BelongsTo Engagement, BelongsTo CanonicalAccount |
| `FinancialStatement` | id, engagementId, statementType, title, status, lines (JSON) | BelongsTo Engagement |
| `DisclosureNote` | id, engagementId, noteNumber, title, noteType, content, missingInformation, aiDrafted, status | BelongsTo Engagement |
| `EvidenceObject` | id, engagementId, filename, fileType, fileHash, state, uploadedBy, linkedEntities (JSON) | BelongsTo Engagement |
| `EvidenceLink` | id, evidenceId, targetType, targetId, linkType, createdBy | BelongsTo EvidenceObject |
| `Finding` | id, engagementId, title, findingType, severity, materiality, description, status, aiSuggested | BelongsTo Engagement |
| `Recommendation` | id, engagementId, findingId, title, description, recommendedAction, riskLevel, status, aiContributed | BelongsTo Engagement, BelongsTo Finding |
| `ReviewComment` | id, engagementId, targetType, targetId, reviewerId, reviewerName, comment, status, requiredAction | BelongsTo Engagement |
| `ApprovalRecord` | id, engagementId, approverId, approverName, approverRole, action, rationale, targetType, targetId | BelongsTo Engagement |
| `PublicationPackage` | id, engagementId, status, publishedAt, publishedBy | BelongsTo Engagement |
| `AuditEvent` | id, engagementId, eventType, actorId, actorName, actorRole, targetType, targetId, previousState, newState, description, aiRelated, metadata (JSON) | BelongsTo Engagement |

## Implementation Sequence

### Phase 2.1: Schema + Seed (Days 1-2)

1. Add all Prisma models to `schema.prisma`
2. Create migration: `npx prisma migrate dev --name add_audit_os_models`
3. Create seed script in `prisma/seed.ts` (append to existing seed)
4. Seed: Organization, Users, Clients, CanonicalAccounts, Full Gulf Trading Co. engagement

### Phase 2.2: Server Actions (Days 3-4)

1. Create `src/lib/audit/db.ts` — Prisma client wrapper with AuditOS-specific queries
2. Create `src/lib/audit/actions/` — One file per domain:
   - `engagement-actions.ts`
   - `trial-balance-actions.ts`
   - `mapping-actions.ts`
   - `validation-actions.ts`
   - `statement-actions.ts`
   - `evidence-actions.ts`
   - `finding-actions.ts`
   - `recommendation-actions.ts`
   - `review-actions.ts`
   - `approval-actions.ts`
   - `publication-actions.ts`
   - `audit-event-actions.ts`
3. Each action file exports async functions that match existing mock service signatures
4. Update `src/lib/audit/services.ts` to delegate to Prisma actions (keep mock as fallback)

### Phase 2.3: Engagement CRUD + TB Upload (Days 5-6)

1. Create `EngagementForm` component (dialog-based create/edit)
2. Create `ClientForm` component (dialog-based create/edit)
3. Add engagement create button to dashboard
4. Create trial balance upload page with CSV/XLSX parsing
5. Add column mapping dialog for import
6. Wire upload to Prisma service

### Phase 2.4: TraceabilityDrawer Wiring (Days 7-8)

1. Update `statements-page.tsx` to use `TraceabilityDrawer` instead of inline panel
2. Populate drawer with real data from Prisma queries:
   - Financial statement line → trial balance lines → evidence → findings → recommendations → review comments → approval → audit events
3. Wire drawer into notes, evidence, findings, recommendations, review, approval, audit trail
4. Update `getTraceability()` service to perform real DB joins

### Phase 2.5: Polish + Validate (Day 9-10)

1. Fix any TypeScript errors from migration
2. Verify all 14 demo screens still work
3. Test engagement create/edit flow
4. Test TB upload flow
5. Run `npx tsc --noEmit` — 0 errors
6. Run `npx eslint src/` — no new errors
7. Update Phase 1 completion document with Phase 2 status

## Migration Strategy

To avoid breaking the existing demo:

1. Keep `src/lib/audit/services.ts` as the public API
2. Add a `useDatabase` boolean flag (environment variable or import-time constant)
3. When `useDatabase = true`, services delegate to Prisma actions
4. When `useDatabase = false`, services return mock data (current behavior)
5. All UI components import from `services.ts` — they don't know if data is mock or real

```typescript
// services.ts — hybrid approach
const USE_DATABASE = process.env.NEXT_PUBLIC_USE_DATABASE === 'true'

export async function getEngagement(id: string) {
  if (USE_DATABASE) {
    return prismaActions.getEngagement(id)
  }
  return mockServices.getEngagement(id)
}
```

## Files to Create

| File | Purpose |
|------|---------|
| `prisma/migrations/...` | Schema migration |
| `prisma/seed-audit.ts` | AuditOS seed data |
| `src/lib/audit/db.ts` | Prisma client wrapper |
| `src/lib/audit/actions/engagement-actions.ts` | Engagement CRUD |
| `src/lib/audit/actions/trial-balance-actions.ts` | TB import + query |
| `src/lib/audit/actions/mapping-actions.ts` | Account mapping CRUD |
| `src/lib/audit/actions/validation-actions.ts` | Validation logic |
| `src/lib/audit/actions/statement-actions.ts` | Statement queries |
| `src/lib/audit/actions/evidence-actions.ts` | Evidence CRUD |
| `src/lib/audit/actions/finding-actions.ts` | Finding CRUD |
| `src/lib/audit/actions/recommendation-actions.ts` | Recommendation CRUD |
| `src/lib/audit/actions/review-actions.ts` | Review queue |
| `src/lib/audit/actions/approval-actions.ts` | Approval logic |
| `src/lib/audit/actions/publication-actions.ts` | Publication logic |
| `src/lib/audit/actions/audit-event-actions.ts` | Event recording + query |
| `src/components/audit/engagement/engagement-form.tsx` | Engagement create/edit dialog |
| `src/components/audit/engagement/client-form.tsx` | Client create/edit dialog |
| `src/lib/audit/upload-parser.ts` | CSV/XLSX parsing + validation |

## Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add all AuditOS models |
| `src/lib/audit/services.ts` | Add database delegation |
| `src/components/audit/statements/statements-page.tsx` | Replace inline traceability with TraceabilityDrawer |
| `src/components/audit/notes/notes-page.tsx` | Add TraceabilityDrawer |
| `src/components/audit/evidence/evidence-page.tsx` | Add TraceabilityDrawer |
| `src/components/audit/findings/findings-page.tsx` | Add TraceabilityDrawer |
| `src/components/audit/recommendations/recommendations-page.tsx` | Add TraceabilityDrawer |
| `src/components/audit/review/review-page.tsx` | Add TraceabilityDrawer |
| `src/components/audit/approval/approval-page.tsx` | Add TraceabilityDrawer |
| `src/components/audit/audit-trail/audit-trail-page.tsx` | Add TraceabilityDrawer |
| `src/components/audit/engagement/overview-tab.tsx` | Add engagement form button |

## Design Constraints

- All new models use `cuid()` for IDs (matching existing convention)
- All models include `createdAt` and `updatedAt` timestamps
- JSON fields for flexible data (team, alerts, linkedEntities)
- Tenant isolation via `organizationId` on all tenant-scoped models
- Soft delete via `deletedAt` where appropriate
- Enums as string fields with validation (not Prisma enums) for migration flexibility

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Schema migration breaks existing DecisionOS data | AuditOS models are entirely new — no existing table changes |
| UI breaks during migration | Mock fallback keeps UI working while DB is being built |
| Seed data diverges from mock data | Both use same constants file for canonical data |
| TypeScript errors from new Prisma types | Generate Prisma types before fixing service signatures |

## Acceptance Criteria

1. `npx prisma migrate dev` succeeds with all AuditOS models
2. `npx prisma db seed` creates Gulf Trading Co. engagement with full data
3. Dashboard loads from database (not mock) when `USE_DATABASE=true`
4. All 14 screens render correctly with DB data
5. Engagement create dialog creates a new engagement in DB
6. TB upload creates trial balance records in DB
7. TraceabilityDrawer shows real linked data from DB
8. Audit events are recorded in DB and displayed
9. `npx tsc --noEmit` reports 0 errors
10. Existing DecisionOS screens still work
