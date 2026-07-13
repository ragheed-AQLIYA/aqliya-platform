---
name: eng-docs-sync
description: Documentation drift detection — sync code reality with docs, find outdated claims, broken links
version: 1.0
date: 2026-07-13
status: active
owner: Layer 7 — Product
inputs: Code changes, documentation files
outputs: Documentation drift report with sync recommendations
dependencies: aqliya-docs-authority
---

# Engineering Documentation Sync

## Checklist
1. **Route Docs**: ROUTE_STRATEGY.md matches src/app/
2. **Product Status**: PRODUCT_STATUS_MATRIX.md matches code reality
3. **Architecture Docs**: AQLIYA_ARCHITECTURE.md matches lib structure
4. **Claims**: No unimplemented features claimed as live
5. **Links**: No broken cross-references
6. **Authority**: Changes follow DOCUMENTATION_AUTHORITY.md hierarchy

## Output
```md
## Docs Sync: <scope>
| Drift | Severity | Doc | Code Reality | Fix |
```
