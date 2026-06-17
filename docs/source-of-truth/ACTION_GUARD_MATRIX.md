# Server Action Guard Matrix

**Status:** Living document (parallel remediation 2026-06-02, continued)  
**Authority:** Implementation reality + [`src/core/access/server-action-guard.ts`](../../src/core/access/server-action-guard.ts)

## Rule

Every **write** server action must call either:

1. `requireServerActionAccess(resource, action, { organizationId })` from `@/core/access`, or  
2. A product guard documented below that enforces **session + org scope + role** equivalently.

Audit inventory: `node scripts/platform/audit-action-guards.mjs`

## Wired in remediation (explicit `requireServerActionAccess`)

| File | Mutations | Notes |
| ---- | --------- | ----- |
| [`src/actions/sales-actions.ts`](../../src/actions/sales-actions.ts) | create deal/account, review, approve, link evidence, claim review | Plus `guardSalesWrite` → `requireServerActionAccess("sales", …)` and `requireSalesPermission` |
| [`src/actions/audit-actions.ts`](../../src/actions/audit-actions.ts) | `createEngagementAction` | Plus `getAuditActor` + `assertEngagementAccess` on other paths |
| [`src/actions/workflowos-actions.ts`](../../src/actions/workflowos-actions.ts) | `workflow_createClient` | Plus workflow tenant services |
| [`src/actions/local-content-workspace-actions.ts`](../../src/actions/local-content-workspace-actions.ts) | Content Studio project create | Plus `assertLocalContentPermission` |
| [`src/actions/decisions.ts`](../../src/actions/decisions.ts) | `createDecision` | Plus `requireDecisionAccess` on record paths |
| [`src/actions/office-ai-actions.ts`](../../src/actions/office-ai-actions.ts) | create task, update status | Resource key `assistant` |
| [`src/actions/localcontent-actions.ts`](../../src/actions/localcontent-actions.ts) | All write/export mutations | `guardLocalContent` + `assertProjectAccess` |
| [`src/actions/workflowos-actions.ts`](../../src/actions/workflowos-actions.ts) | All `workflow_*` writes | `guardWorkflow` on every mutation |
| [`src/actions/audit-actions.ts`](../../src/actions/audit-actions.ts) | All mutations | `getAuditActorForMutation` + `requireRole` + engagement guards |

## Product-equivalent guards (no unified import yet)

| File | Pattern |
| ---- | ------- |
| `decision-*.ts`, `decision-evidence-actions.ts` | `requireDecisionAccess` |
| `audit-read-actions.ts`, `audit-admin-actions.ts`, `audit-export-actions.ts` | `getAuditActor`, engagement/project guards |
| `sales-read-actions.ts`, `sales-icp-actions.ts`, `sales-contact-actions.ts` | `requireSalesPermission`, `assertSalesDealAccess` |
| `approval.ts` | platform approval services + auth |
| `mfa.ts` | session-bound MFA only |
| `download-token-actions.ts` | token verification |
| `simulation.ts`, `tender.ts` | read-heavy / demo scope |

## Download & export routes (auth → tenant 404 → audit)

| Route | Product |
| ----- | ------- |
| `src/app/api/audit/evidence/[evidenceId]/download/route.ts` | AuditOS |
| `src/app/api/local-content/projects/[projectId]/evidence/[evidenceId]/download/route.ts` | LocalContentOS |
| `src/app/api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts` | LocalContentOS |
| `src/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route.ts` | DecisionOS |
| `src/app/api/workflowos/documents/[documentId]/download/route.ts` | WorkflowOS |
| `src/app/api/workflowos/clients/[clientId]/records/[recordId]/export/pdf/route.ts` | WorkflowOS |
| `src/app/api/office-ai/download/route.ts` | Office AI Assistant |
| `src/app/sales/accounts/[id]/brief/export/route.ts` | SalesOS (prototype) |
| `src/app/sales/deals/[id]/pilot/export/route.ts` | SalesOS (prototype) |

## Backlog

- Extend unified guard to `local-content-workspace-actions.ts` remaining writes (beyond Content Studio create).
- Target: periodic `node scripts/platform/audit-action-guards.mjs` in CI.
- Sales `_v02` intelligence: still re-exported via `vnext/`; physical archive blocked until vnext absorbs types (see [`docs/operations/salesos-migration-runbook.md`](../operations/salesos-migration-runbook.md)).
