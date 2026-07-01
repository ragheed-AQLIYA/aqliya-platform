# 04 — SalesOS Workflow & Governance

**Date:** 2026-06-01  
**Principle:** AI assists. Humans decide. Evidence governs.

---

## SalesOS Workflow Stages (Target v0.3)

### Opportunity lifecycle

| Stage | Code | AI role | Human gate | Evidence |
|-------|------|---------|------------|----------|
| Qualification | `qualification` | Suggest ICP fit score | Owner confirms | Optional notes |
| Discovery | `discovery` | Summarize interactions | Owner updates stage | Interaction logs |
| Proposal | `proposal` | Draft proposal text | **Review required** | Proposal doc + sources |
| Negotiation | `negotiation` | Risk flags | Owner + optional approver | Updated terms |
| Closed Won | `won` | Learning extraction | Manager acknowledge | Contract ref |
| Closed Lost | `lost` | Loss reason draft | Owner confirms reason | Post-mortem note |

**Not CRM-default:** Stages include governance checkpoints, not just pipeline velocity.

### Proposal / commercial claim workflow

```
draft → submitted_for_review → approved | rejected → sent → archived
```

Maps to existing patterns in:

- `src/lib/governance/approval-state.ts`
- `src/lib/local-content/content/review.ts` (LocalContentOS review/approval)
- `src/lib/governance/retrieval-router.ts` → `commercial_claim_review` task type

---

## AI-Assisted vs Human Approval Matrix

| Action | AI allowed | Auto-execute | Human required | Audit event |
|--------|-----------|--------------|----------------|-------------|
| ICP fit suggestion | Yes | No | Confirm to save | `ai.suggestion.created` |
| Next action recommendation | Yes | No | Accept/dismiss | `ai.next_action.suggested` |
| Pipeline forecast text | Yes | No | Display as draft | `ai.forecast.drafted` |
| Proposal draft | Yes | No | Reviewer approval | `proposal.submitted_for_review` |
| Commercial claim on account | No auto | No | **Commercial reviewer** | `commercial_claim.reviewed` |
| Stage change to Won | No | No | Owner + optional approver | `opportunity.stage_changed` |
| Export account brief | No | No | If contains AI text: approved only | `export.generated` |
| Delete account/opportunity | No | No | Owner or admin | `entity.deleted` |

---

## Audit Events (SalesAuditEvent)

Mirror `LocalContentAuditEvent` structure in `src/lib/local-content/audit-events.ts`:

| Event | Payload |
|-------|---------|
| `sales.account.created` | accountId, name |
| `sales.opportunity.stage_changed` | from, to, actorId |
| `sales.interaction.logged` | type, summary |
| `sales.proposal.submitted` | proposalId, version |
| `sales.proposal.approved` | approverId |
| `sales.ai.output.created` | taskType, confidence, outputRef |
| `sales.export.generated` | format, entityId, approvalStatus |
| `sales.commercial_claim.flagged` | claimText, reviewStatus |

Also log critical events to `PlatformAuditLog` with `productKey: "salesos"`.

---

## Evidence Requirements

| Output | Minimum evidence |
|--------|------------------|
| Proposal PDF/export | Source interactions + attachments |
| AI forecast on dashboard | Input opportunity IDs + timestamp |
| Commercial claim badge | Link to product capability doc or feature flag |
| Won deal record | Signed doc or explicit "evidence pending" flag |
| Sales memory entry | Source interaction IDs; `humanVerified` boolean |

Reuse file storage pattern from LocalContentOS evidence (`/api/local-content/.../download` → `/api/sales/.../download`).

---

## Risk Controls

| Risk | Control | Implementation path |
|------|---------|---------------------|
| Commercial overclaim | `commercial_claim_review` router + UI flag | `retrieval-router.ts` + review queue |
| Cross-tenant leak | `platformOrganizationId` on all queries | `src/lib/sales/permissions.ts` |
| AI autonomous close | No auto stage→won | Server action guards |
| Unlogged mutations | SalesAuditEvent on every write | Service layer middleware |
| Export without approval | Gate in export action | Like AuditOS export controls |
| Sensitive contact exposure | `sensitivityLevel` on SalesContact | RBAC filter in list/detail |
| Stale prototype shown to customers | Amber banner until L4 | Keep current banner pattern |

---

## RBAC (v0.3 minimal)

| Role | Permissions |
|------|-------------|
| `sales_viewer` | Read accounts, opps, interactions |
| `sales_rep` | CRUD own accounts/opps, log interactions |
| `sales_manager` | All rep perms + approve proposals |
| `commercial_reviewer` | Review commercial claims |
| `platform_admin` | Full org access + audit trail |

Start with platform role checks in `requireUserContext()` + product permission helper (copy LocalContentOS `assertLocalContentPermission` pattern).

---

## Integration with AQLIYA Core Governance

| Core module | SalesOS use |
|-------------|---------------|
| `src/lib/governance/actor-lineage.ts` | `canMutateByLineage()` on updates |
| `src/lib/governance/escalation.ts` | Escalate blocked deals / overclaims |
| `src/lib/governance/provenance.ts` | AI output provenance display |
| `src/lib/governance/ui/governance-display.ts` | Review badges in UI |

---

## Current State vs Target

| Capability | Current | Target v0.3 |
|------------|---------|-------------|
| Workflow states | Mock badges only | Prisma `status` + `stage` fields |
| Review/approval | None | SalesReview + proposal gate |
| Audit trail | None | SalesAuditEvent |
| Commercial claim gate | Router config only | UI + server enforcement |
| Evidence links | None | Interaction + proposal attachments |

**Validation:** Governance design only — not implemented.
