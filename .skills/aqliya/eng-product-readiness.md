---
name: eng-product-readiness
description: Product readiness assessment — validates v0.1/L5/L6 DoD, completion matrix, missing capabilities
version: 1.0
date: 2026-07-13
status: active
owner: Layer 7 — Product + Layer 1 — Executive
inputs: Product to assess
outputs: Readiness score with gap analysis and completion roadmap
dependencies: aqliya-product-completion
---

# Engineering Product Readiness

## Assessment Matrix
1. **Route/Workspace**: Authenticated routes, error/loading/not-found
2. **Data Model**: Prisma models, migrations, seed data
3. **CRUD/Workflows**: Create, read, update, delete, state transitions
4. **Dashboard**: Real metrics, not static cards
5. **Governance**: RBAC, audit trail, tenant isolation
6. **Evidence**: File upload, evidence linking
7. **Review/Approval**: Workflow states, human review gates
8. **Exports**: PDF/XLSX, audit trail, permission checks
9. **Tests**: Unit, integration, critical path coverage
10. **Docs**: Product docs, runbooks, user guides

## Output
```md
## Product Readiness: <product>
| Dimension | Current | Target | Gap |
## Readiness Score: X/100
## Recommended Next Steps: 1. 2. 3.
```
