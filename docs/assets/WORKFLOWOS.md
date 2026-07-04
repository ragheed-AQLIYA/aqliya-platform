# WorkflowOS

**Status:** L6 Production-hardened  
**Owner:** Platform Team  
**Last Updated:** 2026-06-30

## Overview
Governed workflow execution engine under AQLIYA Core. Supports template-based workflow creation, audit trails, and evidence-linked stages.

## Asset Map
- **Routes:** 8 (/workflowos/*) — Dashboard, Templates, Active Workflows, History, Audit Trail, Settings
- **Server Actions:** 5 (src/actions/workflow-*.ts)
- **Prisma Models:** 4 (WorkflowTemplate, WorkflowRecord, WorkflowAuditEvent, WorkflowEvidence) + 6 Sunbul* models
- **Components:** 20 in src/components/workflow/
- **Documentation:** 4 files in docs/assets/workflow/
- **Tests:** 4 files in src/__tests__/unit/workflow/
- **Seed Data:** ❌ Not yet created
- **Runbook:** ✅ docs/runbooks/workflowos-operator-guide.md
- **Demo Routes:** ❌ No public demo

## Known Gaps
- No seed data
- Loading states only at root-level

## Roadmap
- Add seed data
- Add loading states on sub-routes
