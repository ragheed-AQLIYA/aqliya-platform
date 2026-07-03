# SalesOS

**Status:** L6 Production-hardened  
**Owner:** Sales Team  
**Last Updated:** 2026-06-30

## Overview
Governed sales intelligence system under AQLIYA. Manages accounts, contacts, opportunities, sales memory, interaction logs, and evidence-backed proposals.

## Asset Map
- **Routes:** 30 (/sales/*) — Dashboard, Accounts, Contacts, Opportunities, Pipeline, Interactions, Proposals, Evidence, Approvals, Reports, Exports, Audit Trail, Settings, Admin
- **Server Actions:** 6 (src/actions/sales-*.ts)
- **Prisma Models:** 11 (SalesAccount, SalesContact, SalesOpportunity, SalesInteraction, SalesProposal, SalesEvidence, SalesApproval, SalesAuditEvent, etc.)
- **Components:** 83 in src/components/sales/
- **Documentation:** 4 files in docs/assets/sales/
- **Tests:** 1 file in src/__tests__/unit/sales/
- **Seed Data:** ✅ prisma/seed-sales.ts
- **Runbook:** ❌ Not yet created
- **Demo Routes:** ❌ No public demo

## Known Gaps
- Architecture debt: 3 parallel code layers (v02/vnext/main)
- In-memory dashboard fallback
- No dedicated runbook

## Roadmap
- Unify v02/vnext layers
- Remove in-memory fallback
- Create dedicated runbook
