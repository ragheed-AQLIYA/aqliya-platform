---
name: auditos-change
description: Use when changing AuditOS workflows, routes, data, exports, evidence, findings, review, approval, audit trail, or audit landing copy.
---

# AuditOS Change Skill

## Purpose

Safely change AuditOS without breaking governance, evidence, or human-review boundaries.

## Required Checks

1. Identify affected AuditOS step:
   - Engagement
   - Trial Balance
   - Mapping
   - Financial Statements
   - Notes
   - Evidence
   - Findings
   - Review
   - Approval
   - Audit Trail

2. Confirm trust boundaries:
   - AI drafts only
   - human approval remains
   - evidence links remain
   - audit logging remains
   - no autonomous audit claims

3. Before editing:
   - inspect existing components/actions/services under `src/app/audit/`, `src/components/audit/`
   - identify persistence path
   - identify mock vs DB path
   - avoid creating duplicate workflow logic

4. Validation (with approval for heavy commands):
   - targeted TypeScript if needed
   - targeted ESLint for changed files
   - route smoke if UI affected
   - export test if PDF/XLSX affected

## Final Output

- affected workflow step
- changed files
- validation run
- known limitations

Do not destabilize AuditOS pilot-readiness while building other systems.
