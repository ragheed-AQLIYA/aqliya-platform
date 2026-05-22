# LocalContentOS v0.1 — Scope Lock Report

## 1. Executive Summary

LocalContentOS v0.1 scope has been defined, modeled, governed, and sequenced. The product is the second strategic product under AQLIYA, targeting Saudi-market organizations with a governed local content measurement, evidence, compliance, and reporting workflow. It comprehensively reuses AQLIYA Intelligence Core (governance, audit, platform, storage, export) and is now ready for Phase 1 implementation.

## 2. Product Definition

**LocalContentOS** is a governed local content measurement, evidence, compliance, and reporting workflow for Saudi-market organizations. It is not a static dashboard, procurement tracker, CRM, compliance claim generator, or autonomous AI system. It is a governed multi-stage operational workspace built on AQLIYA Intelligence Core.

## 3. Included in v0.1

| Capability                        | Priority | Status  |
| --------------------------------- | -------- | ------- |
| Project/assessment setup          | P0       | Defined |
| Supplier/vendor registry          | P0       | Defined |
| Procurement/spend records         | P0       | Defined |
| Local vs non-local classification | P0       | Defined |
| Local content scoring             | P0       | Defined |
| Evidence upload/linking           | P0       | Defined |
| Gap/risk findings                 | P0       | Defined |
| Review workflow                   | P0       | Defined |
| Approval workflow                 | P0       | Defined |
| Audit trail                       | P0       | Defined |
| Dashboard                         | P0       | Defined |
| Report/export (PDF/XLSX)          | P0       | Defined |
| Seed demo dataset                 | P0       | Defined |
| Bilingual Arabic-first UX         | P0       | Defined |

## 4. Excluded from v0.1

| Capability                         | Target      |
| ---------------------------------- | ----------- |
| Cloud AI-assisted classification   | v0.2        |
| Simulation/what-if modeling        | v0.2        |
| Multi-year trend analysis          | v0.3        |
| LCGPA portal integration           | v0.3        |
| Supplier self-service portal       | Future      |
| Automated certificate verification | Future      |
| Workforce localization tracking    | Future      |
| Custom report builder              | Post-Studio |
| Mobile app                         | Future      |
| On-Prem deployment                 | Future      |

## 5. Route Plan Summary

11 workspace routes under `/local-content/*`:

```
/local-content                                    Dashboard
/local-content/projects/[projectId]               Project detail
/local-content/projects/[projectId]/suppliers      Supplier registry
/local-content/projects/[projectId]/spend          Spend records
/local-content/projects/[projectId]/classification Classification
/local-content/projects/[projectId]/evidence       Evidence vault
/local-content/projects/[projectId]/findings       Gap/risk register
/local-content/projects/[projectId]/review         Review workflow
/local-content/projects/[projectId]/approval       Approval
/local-content/projects/[projectId]/reports        Reports & export
/local-content/projects/[projectId]/audit-trail    Audit trail
```

Plus API routes: export, evidence download, spend CSV import.

## 6. Data Model Summary

10 new Prisma models, plus reuse of 5 existing platform models:

**New models:**

- `LocalContentProject`
- `LocalContentSupplier`
- `LocalContentSpendRecord`
- `LocalContentClassification`
- `LocalContentEvidence`
- `LocalContentFinding`
- `LocalContentReview`
- `LocalContentApproval`
- `LocalContentReport`

**Reused models:**

- `PlatformOrganization` — tenant
- `ClientWorkspace` — workspace (`workspaceType: "content"`)
- `Project` — execution boundary (`projectType: "local_content"`)
- `PlatformAuditLog` — all audit events
- `User` / `Organization` — auth context

## 7. Governance Model Summary

- **RBAC:** ADMIN, OPERATOR, REVIEWER, VIEWER roles with project-scoped access
- **Audit:** All mutations logged to `PlatformAuditLog` with `productKey: "localcontent"`
- **Evidence:** 6 evidence types, 6 statuses, file storage via platform storage
- **Approval:** Reuses shared `approval-state.ts`; AI cannot approve or finalize
- **Review:** Reviewer must differ from creator; comments recorded with identity
- **Export:** All exports include disclaimer, governance metadata, reviewer/approver identity
- **AI:** Deterministic rule-based in v0.1; governed, draft-only, human-reviewed

## 8. Evidence / Export Model Summary

7 defined output types:

1. Local Content Assessment Summary (PDF)
2. Supplier Locality Register (XLSX)
3. Spend Classification Report (XLSX)
4. Gap & Risk Register (PDF + XLSX)
5. Evidence Index (XLSX)
6. Review/Approval Log (embedded in reports)
7. Final Export Package (PDF)

All exports include disclaimer, generation timestamp, organization/workspace, reviewer/approver identity, evidence index reference, and approval status.

## 9. AI Boundary Summary

- v0.1 uses deterministic rule-based assistance only
- AI may: suggest classification, summarize spend, flag missing evidence, draft notes, draft report narrative
- AI must not: finalize classification, make compliance claims, approve, export without approval, claim regulator certification
- All AI outputs are draft, confidence-labeled, evidence-linked, reviewable, auditable

## 10. Implementation Phases

| Phase | Objective           | Scope                                   |
| ----- | ------------------- | --------------------------------------- |
| 0     | Scope Lock          | Docs and model/route plan (current)     |
| 1     | Schema & Seeds      | Prisma models, migration, seed dataset  |
| 2     | Core Services       | Actions, services, guards, audit wiring |
| 3     | Workspace Routes    | Dashboard and workflow pages            |
| 4     | Evidence & Findings | Evidence, classification, findings      |
| 5     | Review & Export     | Review, approval, PDF/XLSX export       |
| 6     | QA & Release        | Tests, build, smoke, docs, demo safety  |

## 11. Files Created / Updated

**Created:**

- `docs/product/localcontentos-v0.1/README.md`
- `docs/product/localcontentos-v0.1/product-scope.md`
- `docs/product/localcontentos-v0.1/workflow-spec.md`
- `docs/product/localcontentos-v0.1/route-plan.md`
- `docs/product/localcontentos-v0.1/data-model-plan.md`
- `docs/product/localcontentos-v0.1/governance-model.md`
- `docs/product/localcontentos-v0.1/evidence-and-export-model.md`
- `docs/product/localcontentos-v0.1/ai-boundaries.md`
- `docs/product/localcontentos-v0.1/seed-data-plan.md`
- `docs/product/localcontentos-v0.1/implementation-plan.md`
- `docs/reports/localcontentos-v0.1-scope-lock-report.md`

**Updated:**

- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`
- `docs/source-of-truth/ROUTE_STRATEGY.md`
- `docs/source-of-truth/AQLIYA_ARCHITECTURE.md`

## 12. Validation Results

| Command            | Result    | Notes                               |
| ------------------ | --------- | ----------------------------------- |
| `npx tsc --noEmit` | (pending) | Documentation-only; no code changes |
| `npm run lint`     | (pending) | Documentation-only; no code changes |
| `npm run build`    | (pending) | Documentation-only; no code changes |

## 13. Readiness Verdict

**Scope locked — ready for implementation**

Why:

- Complete product scope, workflow, route plan, data model, governance model, evidence/export model, AI boundaries, seed data plan, and phased implementation plan are defined.
- All reuse decisions for AQLIYA Core engines are documented.
- Source-of-truth docs reflect LocalContentOS as the strategic next product with scope locked.
- No schema changes, no migrations, no implementation code has been written — only planning docs.
- The path from scope lock to v0.1 workspace is clear and sequenced.

## 14. Next Recommended Step

Begin **Phase 1 — Schema, Seeds, Services Foundation**: create the Prisma models, migration, seed dataset, and core domain services as defined in `docs/product/localcontentos-v0.1/implementation-plan.md`.
