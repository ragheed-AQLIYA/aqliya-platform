---
name: eng-rbac-review
description: RBAC/authorization audit — role coverage, enforce() calls, permission gaps, least privilege
version: 1.0
date: 2026-07-13
status: active
owner: Layer 4 — Security
inputs: Module or product routes + actions
outputs: RBAC coverage report with missing authorization findings
dependencies: aqliya-security-gate, eng-security-audit
---

# Engineering RBAC Review

## Checklist
1. **Role Coverage**: ADMIN, OPERATOR, VIEWER — all routes mapped
2. **enforce() Calls**: Every mutating action calls enforce()
3. **Permission Granularity**: Actions use specific permissions, not just "admin"
4. **Least Privilege**: VIEWER cannot write, OPERATOR cannot admin
5. **ABAC**: Attribute-based checks where applicable
6. **Middleware**: Routes in matcher, public routes intentional

## Output
```md
## RBAC Review: <product>
| Action | Has enforce()? | Role Required | Gap |
```
