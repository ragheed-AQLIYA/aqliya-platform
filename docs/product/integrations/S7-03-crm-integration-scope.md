# S7-03 — CRM Live Sync (Integration Scope)

**Status:** XL — **not implemented** in repository  
**Product:** SalesOS under AQLIYA  
**Date:** 2026-06-07

## Intent

Governed sync of accounts, contacts, and opportunities from external CRM (Apollo, HubSpot, Salesforce, etc.) into tenant-scoped SalesOS stores — **not** a full CRM replacement.

## Out of scope until product approval

- OAuth app registration per vendor
- Webhook ingress without human review gates
- Autonomous write-back to CRM

## Minimum v1 integration (when approved)

| Gate | Requirement |
| ---- | ----------- |
| Auth | Service account per org; secrets in vault |
| Mapping | Explicit field map + conflict policy |
| Governance | Human review for sensitive field updates |
| Audit | `platformAuditLog` per sync batch |
| Demo | No live CRM keys in pilot demos |

## Repo today

Internal SalesOS uses Prisma + in-memory territory admin — **no** live CRM connector.

**Authority:** `docs/execution-backlog/v1.2-execution-backlog.md` (S7-03 XL)
