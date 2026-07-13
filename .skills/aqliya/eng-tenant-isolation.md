---
name: eng-tenant-isolation
description: Tenant isolation validation — organizationId scoping, cross-tenant leakage, download route safety
version: 1.0
date: 2026-07-13
status: active
owner: Layer 4 — Security
inputs: Product queries, download routes
outputs: Tenant isolation report with leakage findings
dependencies: eng-security-audit, aqliya-security-gate
---

# Engineering Tenant Isolation Review

## Checklist
1. **Query Scoping**: Every query includes organizationId
2. **Server Validation**: organizationId validated server-side (not from client)
3. **Download Safety**: 404 on tenant mismatch, not 403
4. **Cross-Tenant**: No queries that could leak across orgs
5. **API Routes**: Tenant check before data access
6. **Seed Data**: Seeds scoped to test/demo orgs

## Output
```md
## Tenant Isolation Review: <product>
| Query/Route | organizationId? | Server Validated? | Risk |
```
