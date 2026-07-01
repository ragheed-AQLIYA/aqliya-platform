# DecisionOS

**Status:** L5 Pilot-ready  
**Owner:** Governance Team  
**Last Updated:** 2026-06-30

## Overview
Governed decision intelligence system. Supports structured decision-making with context, options, risks, evidence, committee review, and audit-ready records.

## Asset Map
- **Routes:** 22 (/decisions/*) — Dashboard, Requests, Context, Options, Risks, Evidence, Recommendations, Committees, Voting, Approval, Final Records, Audit Trail, Exports, Memos, Settings
- **Server Actions:** 9 (src/actions/decision-*.ts)
- **Prisma Models:** ~24 (DecisionRecord, DecisionOption, DecisionRisk, DecisionEvidence, DecisionCommittee, DecisionVote, DecisionApproval, DecisionAuditEvent, etc.)
- **Components:** 7 in src/components/decisions/
- **Documentation:** ~18 files in docs/assets/decisions/
- **Tests:** 3 files in src/__tests__/unit/decisions/
- **Seed Data:** ❌ Not yet created
- **Runbook:** ✅ docs/runbooks/decisionos-operator-guide.md
- **Demo Routes:** ❌ No public demo

## Known Gaps
- No dedicated seed data

## Roadmap
- L6: Institutional Memory integration
