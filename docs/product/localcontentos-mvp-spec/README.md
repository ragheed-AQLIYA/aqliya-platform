# LocalContentOS MVP Specification

**Status:** MVP Specification Only — not implemented
**Version:** 1.0
**Depends on:** `docs/product/localcontentos-discovery-pack/`, `docs/product/localcontentos-data-templates/`, `docs/product/localcontentos-pilot-runbook/`, `docs/product/localcontentos-sales-pack/`

---

## Purpose

This specification converts the completed LocalContentOS Discovery, Data Templates, Pilot Runbook, and Sales Pack into a **clear MVP specification** for future technical implementation. It defines scope, data model, workflow, features, roles, routes, server actions, reporting, AI boundaries, and implementation phasing.

**This is specification only — no code, no Prisma schema, no routes, no UI.**

---

## Status

- **Product:** Discovery / Planned — not implemented
- **Current Offer:** Analyst-led pilot (service engagement)
- **MVP Spec:** Complete — ready for implementation when approved

---

## Relationship to Other Packs

| Pack                                          | Relationship                                                               |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| `docs/product/localcontentos-discovery-pack/` | Product definition, workflow, data requirements — foundation for this spec |
| `docs/product/localcontentos-data-templates/` | Field-level data specifications — translated into data model               |
| `docs/product/localcontentos-pilot-runbook/`  | Operating procedures — translated into workflow state machine              |
| `docs/product/localcontentos-sales-pack/`     | Commercial scope — translated into MVP features                            |

---

## Implementation Boundary

- **Do NOT build** until a clear signal exists (paid pilot conversion or strategic customer commitment)
- **Do NOT build** before AuditOS is stabilized in production
- **Do NOT build** without explicit implementation approval
- **Reuse** AQLIYA Core engines wherever possible (Governance, Workflow, RBAC, Audit Logs, Reporting)
- **Apply** existing architecture patterns (Next.js App Router, Server Actions, Prisma, `src/lib/` domain structure)

---

## File Index

| File                        | Purpose                                                            |
| --------------------------- | ------------------------------------------------------------------ |
| `README.md`                 | This file — spec overview and navigation                           |
| `mvp-scope.md`              | MVP objective, modules, non-goals, success criteria                |
| `user-roles-permissions.md` | Role definitions, RBAC matrix, permission boundaries               |
| `data-model-concept.md`     | Conceptual entities, fields, relationships, status lifecycles      |
| `workflow-state-machine.md` | States, transitions, entry/exit conditions, audit events           |
| `feature-specification.md`  | 13 MVP features with user stories, acceptance criteria, edge cases |
| `ui-route-spec.md`          | Proposed route structure (future, not implemented)                 |
| `server-actions-spec.md`    | Proposed server actions (future, not implemented)                  |
| `reporting-export-spec.md`  | MVP outputs, formats, reviewer requirements                        |
| `ai-assistance-spec.md`     | AI-assisted capabilities (future, governed)                        |
| `implementation-phasing.md` | 8-phase build plan with dependencies and exit criteria             |
| `risks-open-decisions.md`   | Key risks and decisions for implementation planning                |
