# RiskOS

**Status:** L6 Production-hardened (AuditOS-adjacent)  
**Owner:** Audit Team  
**Last Updated:** 2026-06-30

## Overview
Risk workspace adjacent to AuditOS. Provides risk model management, risk assessments, and risk procedures. Built as an audit-adjacent workspace, not a standalone product.

## Asset Map
- **Routes:** 4 (/risk/*) — Dashboard, Models, Assessments, Procedures
- **Server Actions:** 1 (embedded in route handler)
- **Prisma Models:** 3 shared with AuditOS (AuditRiskModel, AuditRiskAssessment, AuditRiskProcedure)
- **Components:** 0 (uses audit components directly)
- **Documentation:** 0 files — none yet
- **Tests:** 0 files — none yet
- **Seed Data:** ❌ Not yet created
- **Runbook:** ❌ Not yet created
- **Demo Routes:** ❌ No public demo

## Known Gaps
- No dedicated RiskEvidence model
- No dedicated components (relies on audit components)
- No test coverage
- No documentation

## Roadmap
- Add RiskEvidence model
- Add loading/error states
- Add dedicated test suite
