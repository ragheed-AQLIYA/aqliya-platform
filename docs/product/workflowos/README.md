# WorkflowOS — Governed Case/Workflow Management

**Status:** MVP Complete — External Pilot Ready (built as "Sunbul")
**Parent Ecosystem:** AQLIYA
**Language:** Arabic-first, bilingual-ready

---

## What WorkflowOS Is

WorkflowOS is a **governed case/workflow management product** that enables an organization to run a repeatable governed workflow for multiple internal clients simultaneously, with strict data isolation, role-based access, audit trails, and human-in-the-loop governance.

### Core workflow: Draft → Submit → Review → Approve → Export → Archive

- **Draft** — Operator creates a case/record, uploads documents
- **UnderReview** — Submitted for review; Reviewer evaluates
- **Approved** — Reviewer approves; PDF export available
- **Archived** — PlatformAdmin archives completed records

### Key features
- Multi-client data isolation (each client's data is fully separated)
- 3 roles: PlatformAdmin, Operator, Reviewer
- File upload/download with platform storage
- PDF export for approved/archived records
- Full audit trail for every action

---

## Relationship to AQLIYA

AQLIYA is the **parent platform** — a Private Governed Institutional Intelligence Platform.

WorkflowOS is a **product** built under the AQLIYA ecosystem, alongside AuditOS, DecisionOS, and SalesOS.

- WorkflowOS inherits AQLIYA's operating philosophy: **AI assists. Humans decide. Evidence governs.**
- WorkflowOS reuses shared AQLIYA Intelligence Core engines (governance, RBAC, audit, workflow, evidence)
- WorkflowOS has its own **product boundary**, **data model**, **workspace route**, and **client purpose**

---

## Current Status

| Aspect | Status |
|--------|--------|
| Product Definition | ✅ Locked |
| Technical Architecture | ✅ Prisma + Next.js + PostgreSQL |
| Data Model | ✅ 6 models + 5 enums, migration applied |
| Multi-Client Model | ✅ Built and validated |
| Permission Model | ✅ 3 roles enforced |
| Workflow Model | ✅ 4 states |
| Route / Workspace | ✅ `/workflowos` (preferred) / `/sunbul` (legacy — preserved) |
| Database Migrations | ✅ 8 migrations applied |
| File Upload | ✅ Real upload + download |
| PDF Export | ✅ Approved/Archived record export |
| Audit Trail | ✅ Full timeline per record |
| E2E Validation | ✅ 54/54 tests passing |
| Internal Pilot | ✅ 40/40 simulation steps passed |

---

## Implementation Boundary

WorkflowOS has completed Phases 0 through 3F. The MVP is complete and ready for external pilot.

---

## Documentation Index

Legacy docs (under old "Sunbul" name) in `docs/product/sunbul/`:

| Legacy Document | Content |
|----------------|---------|
| `sunbul-product-definition-lock.md` | Locked MVP definition |
| `sunbul-phase-1-implementation-report.md` | Prisma models, tenant guard, services |
| `sunbul-operator-manual.md` | Arabic-first operator instructions |
| `sunbul-pilot-readiness-report.md` | Pilot readiness assessment |
| `workflowos-route-alias-report.md` | Route aliases from `/workflowos` to legacy components |

---

## Routes

| Route | Purpose | Status |
|-------|---------|--------|
| `/workflowos` | Product dashboard | ✅ Preferred route |
| `/workflowos/admin` | Admin — client/membership management | ✅ Preferred route |
| `/workflowos/clients/[clientId]/records/[recordId]` | Record detail | ✅ Preferred route |
| `/sunbul` | Legacy dashboard | 🔄 Preserved (technical debt) |
| `/sunbul/admin` | Legacy admin | 🔄 Preserved (technical debt) |

---

## Migration from "Sunbul" Name

This product was originally built under the name "Sunbul" (سنبل). That was a naming error — Sunbul is a client organization, not a product.

See `docs/architecture/aqliya-client-organization-model.md` for the full correction strategy.
