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
│ src/app/          routes, layouts, route handlers           │
│ src/components/   UI composition and product components     │
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
| **Sunbul**                       | Custom/client-specific workspace    | `/sunbul/*`                               | Real, usable v0.1                              |
| **workflowos**                   | Alias / duplicate custom workspace  | `/workflowos/*`                           | Real route family, internal/custom duplication |
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
| `sunbul/*`                | Sunbul custom workspace                         | Custom workspace              |
| `workflowos/*`            | workflowos alias route family                   | Custom workspace alias        |
| `api/*`                   | Route handlers and operational endpoints        | Internal/public API as scoped |

---

## Current Architectural Boundaries

1. AuditOS and DecisionOS are the main real system domains currently included in v0.1 scope.
2. Office AI Assistant is real, but belongs under shared applications, not the product family.
3. Sunbul and workflowos are real, but belong under custom/internal workspace classification.
4. LocalContentOS is implemented as L5 pilot-ready with conditions / usable v0.1 after mutation feedback loop verification (2026-05-23). SalesOS is not implemented as an operational system.
5. On-Prem, Air-Gapped, Local AI runtime, Model Governance, Institutional Memory, and Studio are architectural direction only.
