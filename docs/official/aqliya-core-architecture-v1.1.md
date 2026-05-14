# AQLIYA Core Architecture v1.1

**Version:** 1.1
**Status:** Official architecture baseline
**Current tech stack:** Next.js + TypeScript + PostgreSQL + Prisma

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  src/app/          (Next.js App Router — routes & layouts)   │
│  src/components/   (React components — UI & composition)     │
├─────────────────────────────────────────────────────────────┤
│                      ACTIONS LAYER                           │
│  src/actions/      (Server Actions — business operations)    │
├─────────────────────────────────────────────────────────────┤
│                     DOMAIN LAYER                             │
│  src/lib/          (Business logic, engines, services)       │
│  ├── audit/        (AuditOS domain logic)                    │
│  ├── decision/     (DecisionOS domain logic)                 │
│  ├── governance/   (Shared governance framework)             │
│  ├── recommendation/ (Recommendation engine)                 │
│  ├── simulation/   (Simulation/scenario engine)              │
│  ├── platform/     (Platform-wide services)                  │
│  └── validation/   (Validation schemas)                      │
├─────────────────────────────────────────────────────────────┤
│                      DATA LAYER                              │
│  prisma/schema.prisma  (Database models & migrations)        │
│  PostgreSQL             (Primary database)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Engine Status

| Engine | Implementation Status | Details |
|---|---|---|
| **AI Orchestration** | Phase 3B — deterministic wiring complete | `src/lib/ai/` — 5 deterministic handlers wired through AIOrchestrator: analyticalReviewHandler, evidenceSuggestionsHandler, findingDraftsHandler, recommendationDraftsHandler, draftNotesHandler. All registered on DeterministicAIProvider via `register-handlers.ts`. Services layer (`services.ts`) delegates to `aiOrchestrator.generate()` with governance context from `retrieval-router.ts`. CloudAIProvider and LocalAIProvider are stubs (throw on call). No external LLM dependency. All AI outputs remain human-reviewed, evidence-aware, permissioned, and auditable via existing `AuditAiOutput` + `AuditEvent` models. Phase 4: Cloud API wiring + Local AI prototype. |
| **Governance** | Active | Approval states, escalation, provenance, retrieval routing in `src/lib/governance/` |
| **Workflow** | Active | State machines in `workflow-gating.ts`, workflow states documented |
| **Evidence Graph** | Partial | Evidence linking active in AuditOS via `evidence-requirements.ts` and notes engine, but not yet a full cross-product shared Evidence Graph |
| **Institutional Memory** | Not started | Future capability, no implementation |
| **RBAC** | Active | Permission model via `tenant-guard.ts`, role-based auth in actions |
| **Audit Logs** | Active | `AuditEvent` model, audit trail pages, traceability drawer |
| **Model Governance** | Not started | Future capability, no implementation |
| **Document Intelligence** | Partial | File scanner in `file-scanner.ts`, OCR not integrated |
| **Reporting Engine** | Active | PDF/XLSX export in `src/lib/audit/export/` |
| **Deployment Layer** | Cloud only | Docker Compose for test env only, no On-Prem package |

---

## Route Architecture

| Route Group | Purpose | Layer |
|---|---|---|
| `(marketing)/` | Public company/product pages | Presentation |
| `(dashboard)/` | Authenticated workspace (DecisionOS) | Workspace |
| `audit/` | AuditOS governed workspace | Workspace |
| `auditos/` | AuditOS guided demo (public, mock) | Demo |
| `api/` | API routes (auth, health, form submit) | API |

---

## Shared Module Architecture

Shared across all products via `src/lib/`:

| Module | Path | Shared? |
|---|---|---|
| Governance framework | `src/lib/governance/` | Yes |
| Audit logs | Prisma `AuditEvent` + audit trail components | Yes |
| Storage abstraction | `src/lib/audit/storage/` | Yes (file storage) |
| Pagination | `src/lib/audit/pagination.ts` | Yes |
| Export (PDF/XLSX) | `src/lib/audit/export/` | AuditOS only |
| AI service | `src/lib/audit/ai-service.ts` | AuditOS only |
| File scanner | `src/lib/audit/file-scanner.ts` | AuditOS only |

---

## Design Principles

1. **Modular monolith** — product domains separated in `src/lib/`, shared engines in `src/lib/governance/`
2. **Governance-first** — approval, evidence, audit trail built into every workflow
3. **Evidence-backed** — every output links to source evidence
4. **Human-reviewed** — AI suggests, humans approve
5. **Cloud-first, Private-ready** — architecture supports dual deployment (not yet implemented for Private)

---

## Current Limitations (v1.1 alignment gaps)

| Gap | Status |
|---|---|
| No Local AI / Local AI Provider | Not implemented |
| No On-Prem deployment package | Not implemented |
| No Air-Gapped mode | Not implemented |
| No AQLIYA Studio | Not implemented |
| Institutional Memory not built | Not implemented |
| Model Governance not built | Not implemented |
| LocalContentOS: marketing page only | No workspace |
| SalesOS: static dashboard only | No backend |
