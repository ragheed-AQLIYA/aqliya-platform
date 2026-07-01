# LC-08 — ERP / Procurement Integration (Integration Scope)

**Status:** XL — **not implemented** in repository  
**Product:** LocalContentOS under AQLIYA  
**Date:** 2026-06-07

## Intent

Import procurement/spend lines from ERP (SAP, Oracle, Microsoft Dynamics, etc.) to feed local content scoring — with tenant isolation and evidence linkage.

## Out of scope until product approval

- Bidirectional ERP writes
- Autonomous classification without reviewer
- Production connector without staging proof

## Minimum v1 integration (when approved)

| Gate | Requirement |
| ---- | ----------- |
| Auth | Read-only ERP API or scheduled file drop |
| Mapping | Supplier + spend → `LocalContentSpendRecord` |
| Evidence | File hash + source system reference on each import |
| Review | Classification remains human-governed |
| Audit | Audit events on import batches |

## Repo today

LocalContentOS v0.1 uses manual/seed spend entry and analytics — **no** ERP connector.

**Authority:** `docs/execution-backlog/v1.2-execution-backlog.md` (LC-08 XL)
