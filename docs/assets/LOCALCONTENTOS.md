# LocalContentOS

**Status:** L5 Pilot-ready  
**Owner:** Local Content Team  
**Last Updated:** 2026-06-30

## Overview
Strategic second product under AQLIYA for the Saudi market. Enables governed local content scoring, supplier classification, spend analysis, and gap/risk management.

## Asset Map
- **Routes:** 29 (/local-content/*) — Dashboard, Projects, Suppliers, Spend Records, Categories, Classifications, Scoring, Gap Analysis, Risk Findings, Evidence, Review, Approval, Reports, Exports, Audit Trail, Settings, Admin
- **Server Actions:** 10 files (src/actions/local-content-*.ts)
- **Prisma Models:** 10 (LocalContentProject, LocalContentSupplier, LocalContentSpendRecord, LocalContentCategory, LocalContentClassification, LocalContentScore, LocalContentGapFinding, LocalContentEvidence, LocalContentReview, LocalContentApproval)
- **Components:** 25 in src/components/local-content/
- **Documentation:** ~175 files across docs/assets/local-content/
- **Tests:** 2 files in src/__tests__/unit/local-content/
- **Seed Data:** ✅ prisma/seed-local-content.ts
- **Runbook:** ❌ Not yet created
- **Demo Routes:** ❌ No public demo

## Known Gaps
- No dedicated runbook
- Loading states missing on deep sub-routes

## Roadmap
- L6: Full ERP integration, dedicated runbook
