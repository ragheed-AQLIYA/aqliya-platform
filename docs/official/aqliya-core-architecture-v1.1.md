# AQLIYA Core Architecture v1.1

**Version:** 1.1  
**Status:** Official architecture baseline aligned to v0.1 operational baseline  
**Current tech stack:** Next.js + TypeScript + PostgreSQL + Prisma  
**Note:** Implementation-status claims updated to match code reality. LocalContentOS is now included under active domain surfaces.

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER                                          │
│ src/app/(marketing)/  public marketing pages                │
│   ├── page.tsx         homepage (platform-first, no products)│
│   ├── platform/        AQLIYA Intelligence Core + systems   │
│   ├── industries/      sectors page (4 target segments)     │
│   ├── proof/           Proof Center (demo, brief, pilot...) │
│   ├── governance/      trust architecture                   │
│   ├── about/           company + team + methodology         │
│   ├── products/*       operating system reference pages     │
│   └── ...              contact, security, deployment, etc.  │
│ src/app/(dashboard)/   authenticated workspaces             │
│ src/components/        UI composition and shared components │
├─────────────────────────────────────────────────────────────┤
│ ACTIONS LAYER                                               │
│ src/actions/      server actions and product mutations      │
├─────────────────────────────────────────────────────────────┤
│ DOMAIN LAYER                                                │
│ src/lib/audit/         AuditOS domain logic                 │
│ src/lib/decision/      DecisionOS domain logic              │
│ src/lib/office-ai/     Office AI shared application logic   │
│ src/lib/sunbul/        Sunbul custom workspace logic        │
│ src/lib/governance/    Shared governance runtime            │
│ src/lib/platform/      Platform audit/org/workspace logic   │
├─────────────────────────────────────────────────────────────┤
│ DATA LAYER                                                  │
│ prisma/schema.prisma  canonical schema                      │
│ PostgreSQL            primary database                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Engine Status

| Engine                    | Implementation Status   | Reality                                                                     |
| ------------------------- | ----------------------- | --------------------------------------------------------------------------- |
| **AI Orchestration**      | Partial / deterministic | Real orchestration with deterministic handlers; no live cloud/local runtime |
| **Governance**            | Active                  | Approval, escalation, provenance, retrieval routing are implemented         |
| **Workflow**              | Active                  | Workflow gating and state transitions exist in active systems               |
| **Evidence Graph**        | Partial                 | Strong in AuditOS; not yet a unified cross-product graph                    |
| **RBAC**                  | Active                  | Real auth and role/tenant checks across major systems                       |
| **Audit Logs**            | Active                  | Domain and platform audit logs are implemented                              |
| **Document Intelligence** | Partial                 | File extraction/scanning exists; not full OCR platform                      |
| **Reporting Engine**      | Active                  | Audit and custom export paths exist                                         |
| **Model Governance**      | Not implemented         | Strategic/future                                                            |
| **Institutional Memory**  | Not implemented         | Strategic/future                                                            |
| **Deployment Layer**      | Cloud active only       | No On-Prem or Air-Gapped production package                                 |

---

## Runtime Surface Classification

| Area                             | Classification                      | Route(s)                                  | Status                                         |
| -------------------------------- | ----------------------------------- | ----------------------------------------- | ---------------------------------------------- |
| **AuditOS**                      | Product workspace                   | `/audit/*`                                | Real, pilot-ready candidate                    |
| **DecisionOS**                   | Adjacent product workspace          | `/decisions/*`, `/intelligence/sectors/*` | Real, usable v0.1                              |
| **Office AI Assistant**          | Governed shared application         | `/assistant/*`                            | Real, usable v0.1                              |
| **WorkflowOS**                   | Governed custom/client workspace    | `/workflowos/*`                           | Real, usable v0.1 (L4)                         |
| **Sunbul**                       | Legacy redirect alias to WorkflowOS | `/sunbul/*`                               | Redirect only (N/A); no standalone surface     |
| **LocalContentOS**               | Product workspace                   | `/local-content/*`                        | Real, pilot-ready with conditions (L5)         |
| **auditos**                      | Demo family                         | `/auditos/*`                              | Public mock/demo only                          |
| **organizations/settings/sales** | Prototype/internal preview surfaces | `/organizations/*`, `/settings`, `/sales` | Not v0.1-complete operational modules          |

---

## Route Architecture

| Route Group               | Purpose                                         | Classification                |
| ------------------------- | ----------------------------------------------- | ----------------------------- |
| `(marketing)/`            | Public marketing and company pages              | Marketing                     |
| `(dashboard)/decisions/*` | DecisionOS workspace                            | Product workspace             |
| `(dashboard)/assistant/*` | Office AI shared application                    | Shared application            |
| `(dashboard)/settings/*`  | Platform diagnostics + generic settings preview | Internal platform / prototype |
| `audit/*`                 | AuditOS governed workspace                      | Product workspace             |
| `auditos/*`               | AuditOS guided demo                             | Demo                          |
| `local-content/*`         | LocalContentOS workspace                        | Product workspace             |
| `workflowos/*`            | WorkflowOS governed workspace                   | Governed workspace (L4)       |
| `sunbul/*`                | Sunbul legacy redirect to WorkflowOS            | Redirect alias                |
| `api/*`                   | Route handlers and operational endpoints        | Internal/public API as scoped |

---

## Current Architectural Boundaries

1. AuditOS and DecisionOS are the main real system domains currently included in v0.1 scope.
2. Office AI Assistant is real, but belongs under shared applications, not the product family.
3. WorkflowOS is the canonical governed workspace at `/workflowos/*` (L4). Sunbul is a legacy redirect alias only (`/sunbul/*` → `/workflowos/*`); not a separate product.
4. LocalContentOS is implemented as L5 pilot-ready with conditions / usable v0.1 after mutation feedback loop verification (2026-05-23). SalesOS is not implemented as an operational system.
5. On-Prem, Air-Gapped, Local AI runtime, Model Governance, Institutional Memory, and Studio are architectural direction only.
6. **Schema v0.2** (2026-05-28): `createdById` added to 10 models (PlatformOrganization, ClientWorkspace, Project, AuditOrganization, AuditUser, AuditClient, AuditEngagement, AuditFinding, LocalContentSupplier, LocalContentSpendRecord). `DecisionEvidence` model added with file/document support linked to Decision. `platformOrganizationId` added to SunbulClient for tenant isolation. Migration `add_governance_fields_v0_2` applied. 14 AuditOS Prisma enums were attempted but reverted to `String` due to value mismatch with existing codebase — application-level types in `src/types/audit/index.ts` provide equivalent type safety.
