# AuditOS

**Status:** L5 Pilot-ready  
**Owner:** Audit Team  
**Last Updated:** 2026-06-30

## Overview
First proof product under AQLIYA. Financial/audit intelligence platform with full engagement lifecycle management.

## Asset Map
- **Routes:** 27 (/audit/*) — Dashboard, Engagements (trial-balance, statements, mapping, evidence, findings, review, approval, exports, audit-trail, notes, materiality, lead-schedules, sampling, validation, recommendations, publication, pilot, factory-map), quality, portfolio, knowledge, independence, archived, admin/users, acceptance
- **Server Actions:** 22 (src/actions/audit-*.ts)
- **Prisma Models:** ~40 (AuditOrganization, AuditUser, AuditClient, AuditEngagement, AuditTrialBalance, AuditCanonicalAccount, AuditAccountMapping, AuditFinancialStatement, AuditDisclosureNote, AuditEvidence, AuditFinding, AuditRecommendation, AuditReviewComment, AuditApprovalRecord, AuditPublicationPackage, AuditEvent, AuditAiOutput, PilotFeedback, AuditValidationRun, AuditRiskModel, etc.)
- **Components:** 37 folders in src/components/audit/
- **Documentation:** docs/assets/auditos/ (18 files), docs/assets/auditos-commercial-assets/ (5), docs/assets/auditos-customer-conversion-reference/ (7), docs/assets/auditos-first-customer-loop/ (7), docs/assets/auditos-live-pilot-management/ (10), docs/assets/auditos-market-proof-system/ (7), docs/assets/auditos-outbound-kit/ (7), docs/assets/auditos-sales-ops/ (10), docs/assets/auditos-vnext/ (8)
- **Tests:** 5 files in src/__tests__/unit/audit/
- **Seed Data:** ✅ prisma/seed-audit.ts
- **Runbook:** ✅ docs/systems/AUDITOS_OPERATOR_MANUAL.md
- **Demo Routes:** ✅ 6 pages in src/app/auditos/

## Known Gaps
- No L6 production-hardening (load tests, pen test)
- Some engagement sub-routes missing loading states

## Roadmap
- L6: Load/stress tests, security pen test, full monitoring
