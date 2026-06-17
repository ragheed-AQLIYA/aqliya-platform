# LocalContentOS — Content Studio Scope (LC-09)

**Version:** 2026-06-07  
**Status:** Defined (v0.1)

## In scope (implemented routes)

| Route | Purpose |
| ----- | ------- |
| `/local-content` | Command dashboard |
| `/local-content/projects` | Compliance projects |
| `/local-content/analytics` | LC-06 org spend analytics |
| `/local-content/classification-rules` | LC-04 rule admin (read) |
| `/local-content/campaigns` | Campaign shell |
| `/local-content/review` | Cross-project review queue |
| `/local-content/outputs` | Outputs shell |
| `/local-content/projects/[id]/*` | Project workflow (suppliers, spend, classification, evidence, findings, review, approval, reports, audit, tender-match) |

## Out of scope (v0.1)

- ERP/procurement live sync (LC-08)
- Autonomous classification without human review
- Regulator-certified LC certificates

## Governance

- Tenant-scoped projects and RBAC on all actions
- Audit events on mutations
- AI assistive only where wired; scoring and matching are deterministic
