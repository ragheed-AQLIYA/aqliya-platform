# AQLIYA Pilot Seed Data Verification Report

**Generated:** 2026-07-25T07:07:06.631Z
**Seed File:** C:\Users\PC\Documents\Aqliya\prisma\seed-pilot.ts
**File Stats:** 54716 bytes, 652 lines

## Record Counts

| Product Area | Records | Details |
|-------------|---------|---------|
| Users | 8 | 2 ADMIN, 5 OPERATOR, 1 VIEWER |
| AuditOS | 26 | 3 clients, 2 engagements, 5 findings, 12 TB lines |
| DecisionOS | 14 | 3 decisions, 7 risks, 3 scenarios |
| LocalContentOS | 27 | 2 projects, 5 suppliers, 13 spend records |
| SalesOS | 30 | 4 accounts, 3 deals, 1 pipeline(s) |
| RiskOS | 5 | 1 model, 1 assessment, 3 procedures |
| Content Studio | 11 | 3 workspaces, 8 items |
| LocalContactOS | 12 | 5 contacts, 3 relations, 4 interactions |
| PlatformAuditLog | 20 | 6 AuditOS, 3 DecisionOS, 4 LC, 3 Sales, 2 Risk, 2 Platform |
| **TOTAL** | **163** | **All product areas** |

## Validation Results

| Check | Status | Details |
|-------|--------|---------|  
| TypeScript Compilation | PASS | TypeScript compilation passed |
| Prisma Schema | PASS | Prisma schema is valid |
| FK Consistency | PASS | All references valid |
| No Legacy Models | PASS | No removed models referenced |

## Bilingual Data Presence

| Section | Total | Arabic | Bilingual |
|---------|-------|--------|-----------|
| users | 8 | 8 | 8 |
| auditFindings | 5 | 5 | 5 |
| decisionTitles | 3 | 3 | 3 |
| lcProjects | 2 | 2 | 2 |

## Notes

- All audit trails use the unified **PlatformAuditLog** model (no legacy AuditEvent/AuditLog models)
- All entities include **organizationId** for tenant isolation
- All mutations include **createdById** for audit traceability
- Data is bilingual (Arabic-first with English metadata)
