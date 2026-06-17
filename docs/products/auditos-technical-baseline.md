# AuditOS Technical Baseline (Phase 1)

Baseline captured at Phase 1 completion for reference during Phase 2 implementation.

## Current App Routes

### AuditOS Routes (all under `/audit`)

| Route | File | Type |
|-------|------|------|
| `/` (index) | `src/app/audit/page.tsx` | Server component |
| `/layout.tsx` | `src/app/audit/layout.tsx` | Server component |
| `/engagements/[id]` | `src/app/audit/engagements/[id]/page.tsx` | Server component |
| `/engagements/[id]/layout.tsx` | `src/app/audit/engagements/[id]/layout.tsx` | Server component (tabs) |
| `/engagements/[id]/trial-balance` | .../trial-balance/page.tsx | Client component |
| `/engagements/[id]/mapping` | .../mapping/page.tsx | Client component |
| `/engagements/[id]/validation` | .../validation/page.tsx | Client component |
| `/engagements/[id]/statements` | .../statements/page.tsx | Client component |
| `/engagements/[id]/notes` | .../notes/page.tsx | Client component |
| `/engagements/[id]/evidence` | .../evidence/page.tsx | Client component |
| `/engagements/[id]/findings` | .../findings/page.tsx | Client component |
| `/engagements/[id]/recommendations` | .../recommendations/page.tsx | Client component |
| `/engagements/[id]/review` | .../review/page.tsx | Client component |
| `/engagements/[id]/approval` | .../approval/page.tsx | Client component |
| `/engagements/[id]/publication` | .../publication/page.tsx | Client component |
| `/engagements/[id]/audit-trail` | .../audit-trail/page.tsx | Client component |

## Mock Data Location

| File | Size | Contents |
|------|------|----------|
| `src/lib/audit/mock-data.ts` | ~500 lines | All seed data for Gulf Trading Co. engagement |
| `src/lib/audit/services.ts` | ~240 lines | Async wrapper functions around mock data |
| `src/lib/audit/ai-service.ts` | ~120 lines | Deterministic mock AI suggestions |
| `src/lib/audit/audit-events.ts` | ~55 lines | In-memory append-only event store |

## Domain Services

All services are in `src/lib/audit/services.ts`:

| Function | Returns | Used By |
|----------|---------|---------|
| `getDashboardSummary()` | DashboardSummary | Dashboard page |
| `getEngagements()` | Engagement[] | Dashboard page |
| `getEngagement(id)` | Engagement \| null | All engagement pages |
| `getEngagementWorkflowStatus(id)` | WorkflowStatus | Engagement overview |
| `getTrialBalance(id)` | TrialBalance \| null | Trial balance page, overview tab |
| `getMappings(id)` | AccountMapping[] | Mapping page, overview tab |
| `confirmMapping(id, mappingId)` | AccountMapping \| null | Mapping page |
| `getUnmappedAccounts(id)` | AccountMapping[] | Approval page |
| `getValidationRun(id)` | ValidationRun \| null | Validation page, overview tab |
| `runValidation(id)` | ValidationRun | Validation page |
| `getFinancialStatements(id)` | FinancialStatement[] | Statements page |
| `getDisclosureNotes(id)` | DisclosureNote[] | Notes page |
| `getEvidence(id)` | EvidenceObject[] | Evidence page, overview tab |
| `getMissingEvidence(id)` | EvidenceObject[] | Approval page, overview tab |
| `getFindings(id)` | Finding[] | Findings page, overview tab |
| `getRecommendations(id)` | Recommendation[] | Recommendations page |
| `getReviewComments(id)` | ReviewComment[] | Review page |
| `getOpenReviewCount(id)` | number | Overview tab, approval page |
| `getApprovalRecords(id)` | ApprovalRecord[] | Approval page |
| `getApprovalStatus(id)` | ApprovalStatus | Approval page, overview tab |
| `getPublicationPackage(id)` | PublicationPackage \| null | Publication page |
| `getAuditEvents(id)` | AuditEvent[] | Audit trail page, overview tab |
| `getAISuggestions(id, type?)` | AIAssistanceOutput[] | AI components |
| `getTraceability(id, type, targetId)` | TraceabilityResult | Traceability components |

## UI Components

| Directory | Components |
|-----------|-----------|
| `src/components/audit/shared/` | StatusBadge, AiBadge, TraceabilityDrawer |
| `src/components/audit/layout/` | AuditSidebar, AuditHeader, WorkflowProgress |
| `src/components/audit/dashboard/` | StatsOverview, RecentActivity |
| `src/components/audit/engagement/` | EngagementHeader, AlertsBar, EngagementTabs, OverviewTab |
| `src/components/audit/trial-balance/` | TrialBalancePage |
| `src/components/audit/mapping/` | MappingPage |
| `src/components/audit/validation/` | ValidationPage |
| `src/components/audit/statements/` | StatementsPage |
| `src/components/audit/notes/` | NotesPage |
| `src/components/audit/evidence/` | EvidencePage |
| `src/components/audit/findings/` | FindingsPage |
| `src/components/audit/recommendations/` | RecommendationsPage |
| `src/components/audit/review/` | ReviewPage |
| `src/components/audit/approval/` | ApprovalPage |
| `src/components/audit/publication/` | PublicationPage |
| `src/components/audit/audit-trail/` | AuditTrailPage |
| `src/components/audit/ai/` | AiSuggestionPanel |

## TypeScript Types

| File | Contents |
|------|----------|
| `src/types/audit/index.ts` | All AuditOS type definitions (40+ types) |

## Known Constraints

1. **No Prisma schema for AuditOS** — All data is in-memory mock
2. **No real file handling** — Evidence filenames exist but no file operations
3. **No real AI** — All AI suggestions are predetermined
4. **No authentication for AuditOS** — Uses the existing DecisionOS authentication layer
5. **Single user** — All operations appear as "Current User"
6. **In-memory audit events** — Events lost on server restart
7. **Hardcoded engagement ID** — Only `eng-gulf-2025` has full data
8. **No form validation beyond required fields** — Basic UX only
9. **Statement of Cash Flows** — Not implemented
10. **Statement of Changes in Equity** — Not implemented

## What Must Not Be Broken in Phase 2

1. Dashboard → engagement list → engagement detail navigation
2. All 14 sub-pages (trial-balance through audit-trail) must render
3. EngagementTabs on all sub-pages
4. WorkflowProgress stepper
5. AI governance labels (Sparkles, "AI Suggested", etc.)
6. Audit event display
7. Existing DecisionOS routes (under `/(dashboard)/`)
8. All existing tests (`src/__tests__/`)
9. ESLint compliance
10. TypeScript compilation (0 errors)
