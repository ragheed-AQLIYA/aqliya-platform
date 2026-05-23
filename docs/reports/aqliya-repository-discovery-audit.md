# AQLIYA Repository Discovery Audit

> **Partial supersession (2026-05-23):** LocalContentOS is now implemented (L5 pilot-ready with conditions / usable v0.1 at `/local-content/*`). Rows in this audit that describe LocalContentOS as marketing-only are historical snapshots. Current authority: `docs/reports/localcontentos-v0.1-documentation-truth-sync-2026-05-23.md`.

## 1. Executive Summary

- What has actually been built: a real Next.js monolith with working backend-heavy implementations for `AuditOS`, `DecisionOS`, a governed `Office AI Assistant`, and a custom/client-specific workspace under `Sunbul` / `workflowos`, plus platform/org/audit-log plumbing.
- What is production-like: core `AuditOS` write flows, `DecisionOS` CRUD and recommendation/approval flows, Office AI task/file/output persistence, Sunbul record workflow, Prisma schema, auth, and audit logging.
- What is pilot-ready: most `AuditOS` engagement workflow routes under `src/app/audit/engagements/[engagementId]/*`, core `DecisionOS` routes under `src/app/(dashboard)/decisions/*`, and the governed Office AI task workflow under `src/app/(dashboard)/assistant/*`.
- What is only demo: the public `auditos` route family under `src/app/auditos/*`, which reads explicit demo/mock data from `src/lib/audit/demo-data.ts` and `src/lib/audit/mock-data.ts`.
- What is only documentation: large parts of AQLIYA platform doctrine, future products like `RiskOS`, `ComplianceOS`, `LegalOS`, `GovOS`, and deployment claims around private/air-gapped setups (`docs/source-of-truth/AQLIYA_ARCHITECTURE.md`, `docs/theoretical-reference/**`).
- What is misleading or overstated: repo docs understate the existence of `Sunbul`, `workflowos`, and `assistant`; some protected-looking pages are still mock/prototype (`src/app/(dashboard)/organizations/*`, `src/app/(dashboard)/settings/page.tsx`, `src/app/sales/page.tsx`); some API routes appear to expose downloads or metrics without visible route-level auth checks.
- What should be considered the real current version: a mixed-state governed application with two substantial implemented product/workflow areas (`AuditOS`, `DecisionOS`), one real governed assistant (`Office AI`), one real custom/client workflow app (`Sunbul`/`workflowos`), and several shells/marketing surfaces around them.

## 2. Repository Reality Statement

This repository is currently a real but uneven modular monolith: it contains substantial working code for audit workflows, decision workflows, a governed assistant, and a custom record-processing workspace, but it also contains mock pages, demo routes, incomplete test infrastructure, undocumented route families, and documentation that does not fully match the codebase reality.

## 3. Discovered Systems / Products / Modules

| Discovered Area               | Evidence Paths                                                                                                                                                                                                    | Grade A-F | What Exists                                                                                                     | What Is Missing                                                                                                | Customer-Safe?                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------: | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| AuditOS                       | `src/app/audit/**`, `src/actions/audit-actions.ts`, `src/lib/audit/services.ts`, `prisma/schema.prisma` (`Audit*` models)                                                                                         |         A | Real engagement workflow, evidence, findings, review, approval, publication, exports, validation, audit trail   | Some pages are thin wrappers; test coverage incomplete; some read flows can fall back to mock in service layer | Safe with explanation                 |
| DecisionOS                    | `src/app/(dashboard)/decisions/**`, `src/actions/decisions.ts`, `src/actions/approval.ts`, `src/actions/simulation.ts`, `src/lib/decision/**`, `prisma/schema.prisma` (`Decision*`, `Recommendation`, `Approval`) |         A | Real CRUD, recommendation, approvals, publication snapshots, outcomes, sectors, monitoring signals, simulations | Some dashboard content mixed with mock panels; tests weaker than implementation                                | Safe with explanation                 |
| Office AI Assistant           | `src/app/(dashboard)/assistant/**`, `src/actions/office-ai-actions.ts`, `src/lib/office-ai/**`, `prisma/schema.prisma` (`OfficeAi*`)                                                                              |         B | Real task/file/output persistence, file extraction, governed draft/finalize flow, platform audit log writes     | AI is deterministic/template-driven; download API route appears under-protected                                | Internal only / safe with explanation |
| Sunbul workspace              | `src/app/sunbul/**`, `src/actions/sunbul-actions.ts`, `src/lib/sunbul/**`, `prisma/schema.prisma` (`Sunbul*`)                                                                                                     |         A | Real client, membership, record, document, review, workflow, PDF export, audit events                           | Undocumented in core docs; duplicated route family under `workflowos`                                          | Safe with explanation                 |
| workflowos                    | `src/app/workflowos/**`                                                                                                                                                                                           |         B | Real route family reusing Sunbul-style workflow screens                                                         | No separate documented domain model; appears to duplicate `sunbul`                                             | Internal only                         |
| Platform org/workspace bridge | `src/lib/platform/**`, `prisma/schema.prisma` (`PlatformOrganization`, `ClientWorkspace`, `Project`, `PlatformAuditLog`), `src/app/(dashboard)/settings/workspaces/page.tsx`                                      |         B | Real schema and diagnostics, audit log, linkage scripts                                                         | Mostly diagnostics, not yet a full operator-facing product surface                                             | Internal only                         |
| auditos demo                  | `src/app/auditos/**`, `src/lib/audit/demo-data.ts`, `src/lib/audit/mock-data.ts`                                                                                                                                  |         C | Public demo routes and mock workflow visuals                                                                    | No real backend/persistence on those routes                                                                    | Safe to show only as demo             |
| SalesOS                       | `src/app/sales/page.tsx`, `src/app/(marketing)/products/sales/page.tsx`                                                                                                                                           |         C | Static/prototype workspace page and marketing page                                                              | No schema, no actions, no real backend flow                                                                    | Do not show as product reality        |
| LocalContentOS                | `src/app/(marketing)/products/local-content/page.tsx`, `docs/systems/local-content-os/README.md`                                                                                                                  |         D | Marketing/docs presence                                                                                         | No distinct app routes, schema, actions, or working workflow under this name                                   | Do not show as implemented            |
| SimulationOS                  | `src/app/(marketing)/products/simulation/page.tsx`, docs only                                                                                                                                                     |         D | Marketing/docs presence                                                                                         | No standalone app product; simulation exists only as a DecisionOS capability                                   | Do not show as standalone product     |
| AQLIYA Intelligence Core      | `src/lib/ai/**`, `src/lib/governance/**`, docs claims                                                                                                                                                             |         B | Real orchestration abstractions, deterministic provider, governance runtime logic                               | No dedicated surfaced product; cloud/local providers are stubs                                                 | Internal architecture only            |
| Custom Product Inquiry        | `src/app/(marketing)/custom-product/page.tsx`, `src/app/api/custom-product-submit/route.ts`                                                                                                                       |         B | Real inquiry form and API route                                                                                 | Not a product system, only a funnel                                                                            | Safe to show                          |

## 4. Route Inventory

| Route                                                          | Type | Auth                        | Area                    | Real/Mock/Docs                | Grade | Notes                                                          |
| -------------------------------------------------------------- | ---- | --------------------------- | ----------------------- | ----------------------------- | ----: | -------------------------------------------------------------- |
| `/`                                                            | page | Public                      | Marketing               | Real static marketing         |     E | Home/branding only: `src/app/(marketing)/page.tsx`             |
| `/products`                                                    | page | Public                      | Marketing               | Real static marketing         |     E | Product catalog only                                           |
| `/products/audit`                                              | page | Public                      | Marketing               | Real static marketing         |     E | Markets AuditOS                                                |
| `/products/decision`                                           | page | Public                      | Marketing               | Real static marketing         |     E | Markets DecisionOS                                             |
| `/products/local-content`                                      | page | Public                      | Marketing               | Real static marketing         |     E | Product not implemented in code                                |
| `/products/sales`                                              | page | Public                      | Marketing               | Real static marketing         |     E | Product not implemented in code                                |
| `/products/simulation`                                         | page | Public                      | Marketing               | Real static marketing         |     E | Standalone product not implemented                             |
| `/custom-product`                                              | page | Public                      | Commercial              | Real UI + API                 |     B | Backed by `src/app/api/custom-product-submit/route.ts`         |
| `/login`                                                       | page | Public                      | Auth                    | Real                          |     A | Uses NextAuth credentials flow: `src/lib/auth-config.ts`       |
| `/audit`                                                       | page | Protected                   | AuditOS                 | Real                          |     A | DB-backed dashboard: `src/app/audit/page.tsx`                  |
| `/audit/engagements/[engagementId]`                            | page | Protected                   | AuditOS                 | Real                          |     A | Real workflow shell for engagement                             |
| `/audit/engagements/[engagementId]/trial-balance`              | page | Protected                   | AuditOS                 | Real                          |     A | Upload + mapping/validation data flow                          |
| `/audit/engagements/[engagementId]/mapping`                    | page | Protected                   | AuditOS                 | Real                          |     A | Real mappings and confirmations                                |
| `/audit/engagements/[engagementId]/validation`                 | page | Protected                   | AuditOS                 | Real                          |     A | Validation runs/issues/dispositions                            |
| `/audit/engagements/[engagementId]/statements`                 | page | Protected                   | AuditOS                 | Real                          |     B | Real export/governance context; route present in build output  |
| `/audit/engagements/[engagementId]/evidence`                   | page | Protected                   | AuditOS                 | Real                          |     B | Thin route wrapper around real component/actions               |
| `/audit/engagements/[engagementId]/findings`                   | page | Protected                   | AuditOS                 | Real                          |     B | Thin route wrapper around real component/actions               |
| `/audit/engagements/[engagementId]/review`                     | page | Protected                   | AuditOS                 | Real                          |     B | Thin route wrapper                                             |
| `/audit/engagements/[engagementId]/approval`                   | page | Protected                   | AuditOS                 | Real                          |     B | Thin route wrapper                                             |
| `/audit/engagements/[engagementId]/publication`                | page | Protected                   | AuditOS                 | Real                          |     B | Thin route wrapper                                             |
| `/audit/engagements/[engagementId]/audit-trail`                | page | Protected                   | AuditOS                 | Real                          |     B | Thin route wrapper                                             |
| `/audit/admin/users`                                           | page | Protected                   | AuditOS Admin           | Real                          |     B | Backed by admin actions                                        |
| `/auditos`                                                     | page | Public                      | Demo                    | Mock/demo                     |     C | Explicit demo route                                            |
| `/auditos/*`                                                   | page | Public                      | Demo                    | Mock/demo                     |     C | Demo-only subpages                                             |
| `/decisions`                                                   | page | Protected                   | DecisionOS              | Mixed real + some mock panels |     B | Real data fetch plus mixed dashboard filler                    |
| `/decisions/new`                                               | page | Protected                   | DecisionOS              | Real UI                       |     B | Build marks static; creation handled through actions/templates |
| `/decisions/[id]`                                              | page | Protected                   | DecisionOS              | Real                          |     A | DB-backed decision detail                                      |
| `/decisions/[id]/overview`                                     | page | Protected                   | DecisionOS              | Real                          |     A | Uses real actions                                              |
| `/decisions/[id]/framework`                                    | page | Protected                   | DecisionOS              | Real                          |     A | Real persistence                                               |
| `/decisions/[id]/intake`                                       | page | Protected                   | DecisionOS              | Real                          |     A | Real persistence                                               |
| `/decisions/[id]/scenarios`                                    | page | Protected                   | DecisionOS              | Real                          |     A | Real persistence                                               |
| `/decisions/[id]/risks`                                        | page | Protected                   | DecisionOS              | Real                          |     A | Real persistence                                               |
| `/decisions/[id]/recommendation`                               | page | Protected                   | DecisionOS              | Real                          |     A | Real recommendation/publish flow                               |
| `/decisions/[id]/simulation`                                   | page | Protected                   | DecisionOS              | Real                          |     A | Real simulation engine                                         |
| `/decisions/[id]/report`                                       | page | Protected                   | DecisionOS              | Real                          |     B | Real export/report assembly                                    |
| `/decisions/[id]/signals`                                      | page | Protected                   | DecisionOS              | Real                          |     B | Real monitoring signals                                        |
| `/decisions/[id]/alerts`                                       | page | Protected                   | DecisionOS              | Real                          |     B | Real alerts                                                    |
| `/decisions/[id]/sector`                                       | page | Protected                   | DecisionOS              | Real                          |     B | Real sector assignment                                         |
| `/decisions/[id]/outcome`                                      | page | Protected                   | DecisionOS              | Real                          |     B | Real outcome tracking                                          |
| `/decisions/[id]/what-to-do`                                   | page | Protected                   | DecisionOS              | Real                          |     B | Derived intelligence output                                    |
| `/decisions/[id]/insight`                                      | page | Protected                   | DecisionOS              | Real                          |     B | Derived intelligence output                                    |
| `/organizations`                                               | page | Protected                   | Dashboard               | Mock                          |     C | Uses mock organizations array                                  |
| `/organizations/[id]`                                          | page | Protected                   | Dashboard               | Mock                          |     C | Uses mock org object                                           |
| `/organizations/sunbul`                                        | page | Protected                   | Custom                  | Real                          |     B | Real Prisma summary for Sunbul                                 |
| `/intelligence/sectors`                                        | page | Protected                   | DecisionOS/Intelligence | Real                          |     A | Real sectors CRUD surface                                      |
| `/intelligence/sectors/[id]`                                   | page | Protected                   | DecisionOS/Intelligence | Real                          |     A | Benchmarks and patterns                                        |
| `/assistant`                                                   | page | Protected                   | Office AI               | Real                          |     B | Governed task workspace                                        |
| `/assistant/[taskId]`                                          | page | Protected                   | Office AI               | Real                          |     B | Real files/outputs flow                                        |
| `/settings`                                                    | page | Protected                   | Dashboard               | Mock/local state              |     C | No persistence                                                 |
| `/settings/workspaces`                                         | page | Protected                   | Platform diagnostics    | Real                          |     B | Real linkage diagnostics                                       |
| `/settings/platform-organization`                              | page | Protected                   | Platform diagnostics    | Real                          |     B | Real session/org diagnostics                                   |
| `/settings/audit-logs`                                         | page | Protected                   | Platform diagnostics    | Real                          |     B | Real platform audit logs viewer                                |
| `/monitoring`                                                  | page | Protected                   | Platform diagnostics    | Real                          |     B | Real aggregate counts                                          |
| `/sales`                                                       | page | Protected                   | SalesOS                 | Mock/prototype                |     C | Static dashboard and mock entities                             |
| `/sunbul`                                                      | page | Protected                   | Custom workspace        | Real                          |     A | Real record workflow                                           |
| `/sunbul/admin`                                                | page | Protected                   | Custom workspace        | Real                          |     B | Admin surface                                                  |
| `/sunbul/clients/[clientId]/records/[recordId]`                | page | Protected                   | Custom workspace        | Real                          |     A | Record detail                                                  |
| `/workflowos`                                                  | page | Protected                   | Custom workspace        | Real                          |     B | Duplicates Sunbul-style flow                                   |
| `/workflowos/admin`                                            | page | Protected                   | Custom workspace        | Real                          |     B | Admin surface                                                  |
| `/workflowos/clients/[clientId]/records/[recordId]`            | page | Protected                   | Custom workspace        | Real                          |     B | Record detail                                                  |
| `/api/audit/engagements/[engagementId]/exports/[format]`       | API  | Action-level auth           | AuditOS                 | Real                          |     A | Real export generation                                         |
| `/api/audit/evidence/[evidenceId]/download`                    | API  | No visible route-level auth | AuditOS                 | Real                          |     F | Security gap: file download route appears under-protected      |
| `/api/office-ai/download`                                      | API  | No visible route-level auth | Office AI               | Real                          |     F | Security gap: output download route appears under-protected    |
| `/api/sunbul/documents/[documentId]/download`                  | API  | Helper-level auth           | Custom workspace        | Real                          |     B | Access enforced in helper/service                              |
| `/api/sunbul/clients/[clientId]/records/[recordId]/export/pdf` | API  | Helper-level auth           | Custom workspace        | Real                          |     B | Real PDF export                                                |
| `/api/custom-product-submit`                                   | API  | Public                      | Commercial              | Real                          |     B | Zod validation, no product backend                             |
| `/api/health`                                                  | API  | Public                      | Ops                     | Real                          |     B | DB health endpoint                                             |
| `/api/metrics`                                                 | API  | Public                      | Ops                     | Real                          |     F | Public exposure of internal counts                             |

## 5. Codebase Capability Map

| Capability          | Evidence                                                                                                                                                    | Current Reality                                  | Grade | Notes                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----: | --------------------------------------------------------------------------- |
| Authentication      | `src/lib/auth-config.ts`, `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/middleware.ts`                                                 | Real credentials auth and protected UI routes    |     A | NextAuth v5 credentials flow is implemented                                 |
| Role-based access   | `src/lib/auth.ts`, `src/lib/audit/actor-context.ts`, `src/lib/sunbul/tenant-guard.ts`                                                                       | Real role checks for DecisionOS, AuditOS, Sunbul |     A | ADMIN/OPERATOR/VIEWER and custom role hierarchies exist                     |
| Tenant/org handling | `src/lib/audit/tenant-guard.ts`, `src/lib/platform/guards/*.ts`, `prisma/schema.prisma`                                                                     | Real but uneven                                  |     B | Real enforcement in audit/sunbul; platform guards partly diagnostic         |
| Audit trail         | `prisma/schema.prisma` (`AuditLog`, `AuditEvent`, `PlatformAuditLog`, `SunbulAuditEvent`), `src/lib/platform/audit-log.ts`, `src/lib/audit/audit-events.ts` | Real, multi-layer, but split across domains      |     A | Platform + domain-specific logs                                             |
| Evidence management | `AuditEvidence*` models, `src/actions/audit-actions.ts`, `src/lib/audit/storage/**`                                                                         | Real upload/link/download flow                   |     A | Route-level auth gap on download endpoint                                   |
| Workflow gating     | `src/lib/audit/workflow-gating.ts`, audit routes                                                                                                            | Real                                             |     A | Unit-tested and used in product flow                                        |
| Approval            | `src/actions/approval.ts`, `src/lib/governance/approval-state.ts`, `AuditApprovalRecord`, `Approval` models                                                 | Real                                             |     A | Snapshot-based decision approvals and audit approvals both exist            |
| Exports             | `src/actions/audit-export-actions.ts`, `src/lib/audit/export/**`, `src/lib/sunbul/export/pdf-export.ts`, `src/actions/decision-export.ts`                   | Real                                             |     A | PDF/XLSX for audit, PDF for Sunbul, structured decision export              |
| AI review           | `src/lib/ai/**`, `src/lib/audit/ai-service.ts`, `src/lib/governance/**`                                                                                     | Partly real, mostly deterministic                |     B | Governance runtime is real; cloud/local provider execution is not           |
| File storage        | `src/lib/audit/storage/**`, `src/lib/platform/storage/**`, `src/lib/sunbul/storage.ts`                                                                      | Real local/object-storage abstractions           |     B | Object provider has placeholder implementation areas                        |
| Reporting/dashboard | `src/app/audit/page.tsx`, `src/app/(dashboard)/monitoring/page.tsx`, `src/app/(dashboard)/decisions/page.tsx`                                               | Mixed                                            |     B | Some dashboards real, some mock filler                                      |
| Admin/settings      | `src/app/audit/admin/users/page.tsx`, `src/app/(dashboard)/settings/*`                                                                                      | Partial                                          |     B | Real diagnostics/admin in places; generic settings page is only local state |
| Product workspaces  | `audit`, `decisions`, `assistant`, `sunbul`, `workflowos` route families                                                                                    | Real but uneven                                  |     B | Several are undocumented or duplicated                                      |
| Demo data           | `src/lib/audit/mock-data.ts`, `src/lib/audit/demo-data.ts`, `src/app/auditos/**`                                                                            | Explicitly present                               |     C | Separate demo route family exists                                           |
| API routes          | `src/app/api/**`                                                                                                                                            | Real                                             |     B | Several real endpoints; some auth posture is weak                           |

## 6. Database Reality

- Models found: extensive Prisma schema with real domains for platform bridge (`PlatformOrganization`, `ClientWorkspace`, `Project`, `PlatformAuditLog`), Office AI (`OfficeAiTask`, `OfficeAiOutput`, `OfficeAiFile`), DecisionOS (`Organization`, `User`, `Decision`, `DecisionFramework`, `DecisionScenario`, `DecisionRiskAnalysis`, `Recommendation`, `Approval`, `DecisionOutcome`, `DecisionMonitoringSignal`, `DecisionRiskAlert`, `Sector*`, `DecisionReport`), AuditOS (`AuditOrganization`, `AuditClient`, `AuditEngagement`, `AuditTrialBalance*`, `AuditCanonicalAccount`, `AuditAccountMapping`, `AuditFinancialStatement`, `AuditDisclosureNote`, `AuditEvidence*`, `AuditFinding`, `AuditRecommendation`, `AuditReviewComment`, `AuditApprovalRecord`, `AuditPublicationPackage`, `AuditEvent`, `AuditAiOutput`, `PilotFeedback`, `ProductionBlocker`, `PilotSignoff`, `AuditValidation*`), and Sunbul (`SunbulClient`, `SunbulUserMembership`, `SunbulRecord`, `SunbulDocument`, `SunbulReview`, `SunbulAuditEvent`).
- Domains supported by schema: AuditOS, DecisionOS, Office AI, platform org/workspace bridge, and Sunbul/custom workflow are clearly backed by schema.
- Domains not supported by schema: standalone SalesOS, LocalContentOS under that exact product identity, SimulationOS as a distinct product, Studio, RiskOS, ComplianceOS, LegalOS, GovOS, private/on-prem deployment mechanics, air-gapped/local AI runtime.
- Audit/evidence/workflow coverage: strong. AuditOS has deep workflow/evidence/validation/publication support in schema. DecisionOS has recommendation, approval, outcome, signals, and alerts. Platform-level audit log exists separately.
- Schema risks:
  - product/domain overlap is high and naming is inconsistent between platform/product/custom spaces;
  - multiple audit log models create fragmentation (`AuditLog`, `AuditEvent`, `PlatformAuditLog`, `SunbulAuditEvent`);
  - `workflowos` has no separate schema and appears to ride on `Sunbul` models, which suggests route/product duplication rather than a distinct domain.

## 7. Backend Reality

- Server actions:
  - Real AuditOS mutations and reads: `src/actions/audit-actions.ts`, `src/actions/audit-read-actions.ts`, `src/actions/audit-admin-actions.ts`, `src/actions/audit-export-actions.ts`.
  - Real DecisionOS actions: `src/actions/decisions.ts`, `src/actions/approval.ts`, `src/actions/simulation.ts`, `src/actions/tender.ts`, `src/actions/decision-export.ts`, `src/actions/decision-intelligence.ts`, `src/actions/decision-outcomes.ts`, `src/actions/decision-sector.ts`, `src/actions/decision-signals-alerts.ts`, `src/actions/decision-templates.ts`, `src/actions/decision-learning.ts`.
  - Real Office AI actions: `src/actions/office-ai-actions.ts`.
  - Real Sunbul/custom workflow actions: `src/actions/sunbul-actions.ts`.
- API routes:
  - Real export/download/health/metrics/form endpoints under `src/app/api/**`.
  - Not all are equally safe. `src/app/api/audit/evidence/[evidenceId]/download/route.ts`, `src/app/api/office-ai/download/route.ts`, and `src/app/api/metrics/route.ts` are the largest concerns from an exposure standpoint.
- Service layers:
  - Audit service layer is substantial but some reads can fall back to mock/demo data: `src/lib/audit/services.ts`.
  - Sunbul services are real and Prisma-backed: `src/lib/sunbul/services.ts`.
  - Office AI task and extraction services are real and Prisma-backed: `src/lib/office-ai/office-ai-task-service.ts`, `src/lib/office-ai/file-extraction-service.ts`.
- Real CRUD flows:
  - Audit engagements, evidence, findings, recommendations, review comments, approval records, validation issues/dispositions.
  - Decisions, frameworks, intake data, scenarios, risk analysis, recommendation snapshots, outcomes, sectors.
  - Office AI tasks, files, outputs.
  - Sunbul clients, memberships, records, documents, reviews.
- Mock-only or mixed backend areas:
  - `src/lib/audit/ai-service.ts` is mock-based.
  - `src/lib/audit/audit-events.ts` is in-memory/mock style.
  - `src/lib/audit/services.ts` can fall back to mock reads.
  - Several marketing/product pages have no backend at all.
- Missing backend areas:
  - No real backend for SalesOS, standalone LocalContentOS, standalone SimulationOS, Studio, or future product families.

## 8. Frontend Reality

- Working pages:
  - Most `src/app/audit/**` engagement pages are real product pages.
  - Most `src/app/(dashboard)/decisions/**` pages are real product pages.
  - `src/app/(dashboard)/assistant/**` is a real governed task workspace.
  - `src/app/sunbul/**` and `src/app/workflowos/**` are real workflow pages.
- Shell pages:
  - `src/app/(dashboard)/settings/page.tsx` is a shell/local-state page.
  - `src/app/sales/page.tsx` is prototype UI.
  - `src/app/(dashboard)/organizations/page.tsx` and `src/app/(dashboard)/organizations/[id]/page.tsx` are protected but mock.
- Mock/demo pages:
  - `src/app/auditos/**` is explicitly demo/mock.
- Broken/dead or misleading pages:
  - no evidence of dead routes at build time, but there are misleading maturity signals where routes look productized while still being mock shells.
- Customer-facing readiness:
  - AuditOS and DecisionOS can be shown with explanation.
  - Office AI can be shown only if positioned as governed deterministic assistant, not broad AI platform.
  - Sunbul can be shown if it is meant as a client-specific/custom workflow.
  - SalesOS, generic organizations dashboard, and generic settings should not be represented as finished products.

## 9. AI Reality

- Real provider: no true external AI provider is wired end-to-end. `src/lib/ai/providers/cloud-provider.ts` is stubbed.
- Mock provider: AuditOS legacy mock AI exists in `src/lib/audit/ai-service.ts`.
- Prompt framework: real. `src/lib/ai/orchestrator.ts`, `src/lib/ai/prompt-registry.ts`, and `src/lib/governance/prompt-framework.ts` provide real orchestration and prompt assembly.
- Local AI: not implemented. `src/lib/ai/providers/local-provider.ts` is a stub.
- AI logs: yes, partially. Audit and platform audit logs include AI-related metadata fields and writes (`PlatformAuditLog.aiProvider`, `AuditAiOutput`, `src/lib/platform/audit-log.ts`).
- Human review: real and explicit. `src/lib/governance/approval-state.ts`, `src/lib/governance/escalation.ts`, `Recommendation.humanReviewRequired`, and audit approval/review records all encode human review controls.
- Evidence-linked outputs: partial. Governance and provenance utilities exist, but not all generated outputs are deeply evidence-linked in a production-grade way.
- Classification: actual AI capability is best described as `real integrated deterministic workflow + governance framework`, not cloud model intelligence.

## 10. Governance Reality

- Enforced:
  - role checks and auth on most server actions;
  - approval state logic;
  - escalation logic;
  - human review requirements in recommendation and alerts;
  - audit/event logging across domains.
- Partial:
  - platform org/workspace guards are partly diagnostic/reporting rather than fully blocking: `src/lib/platform/guards/*.ts`.
  - some API route exposure looks weaker than the surrounding governance story.
  - AI governance is real in architecture/runtime helpers but not backed by a live cloud/local model runtime.
- Documentation-only or overclaimed:
  - deployment sovereignty/private/air-gapped claims remain strategic/doc-level.
  - some broader “core intelligence” positioning exceeds what is visibly runnable today.
- Missing:
  - consistent route-level protection on all download/ops endpoints;
  - a single unified governance surface across all products.

## 11. Documentation vs Code Gap

| Claim in Docs/UI                                                   | Evidence                                                                                        | Code Reality                                                           | Risk                                   | Required Correction                                                    |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------- |
| Product map centers documented systems only                        | `docs/source-of-truth/AQLIYA_ARCHITECTURE.md`, `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` | Real route families also include `sunbul`, `workflowos`, `assistant`   | Documentation mismatch                 | Add these implemented areas or explicitly mark them as custom/internal |
| LocalContentOS is a strategic product                              | `src/app/(marketing)/products/local-content/page.tsx`, docs                                     | No implemented product route or schema under this identity             | Overstated if shown as current product | Mark as docs/strategy only                                             |
| SimulationOS exists as product category                            | marketing/docs                                                                                  | No standalone app product; only DecisionOS simulation capability       | Product confusion                      | Reframe as DecisionOS capability unless standalone app is built        |
| SalesOS appears in product pages                                   | marketing + `src/app/sales/page.tsx`                                                            | Route is prototype/static, no backend                                  | Misleading product maturity            | Label as prototype/demo everywhere                                     |
| Generic organizations/settings surfaces imply product completeness | `src/app/(dashboard)/organizations/*`, `src/app/(dashboard)/settings/page.tsx`                  | Mostly mock or local-state only                                        | User trust risk                        | Either wire to backend or label internal/prototype                     |
| Governance/AI platform breadth is extensive                        | docs + marketing + theoretical reference                                                        | Governance helpers are real, but cloud/local provider execution is not | Overclaim risk                         | Clarify deterministic/governed stage vs full AI runtime                |
| Ops endpoints are just operational utilities                       | `src/app/api/metrics/route.ts`, download routes                                                 | Public or weakly guarded endpoints expose internal/system artifacts    | Security risk                          | Add strict auth/tenant protection                                      |

## 12. Build/Test Results

### `npx tsc --noEmit`

- Result: passed.
- Evidence: command completed with no output and no failure status.

### `npm run lint`

- Result: passed with warnings.
- Summary: `135` warnings, `0` errors.
- Nature of issues: mostly unused imports/variables and one React hook dependency warning.
- Evidence examples:
  - `src/actions/audit-actions.ts`
  - `src/app/sales/page.tsx`
  - `src/components/sunbul/sunbul-client-selector.tsx`
  - `src/lib/audit/ai-service.ts`

### `npm run build`

- Result: succeeded.
- Important warnings:
  - Next.js inferred the wrong workspace root because of multiple lockfiles.
  - `middleware` file convention is deprecated in favor of `proxy`.
  - Sentry auth token missing, so release and sourcemap upload are skipped.
  - Dynamic server usage warnings appeared for `/decisions` because it used `headers` during static generation, but the build still completed.

### `npm test -- --runInBand`

- Result: failed.
- Summary: `10` failed suites, `8` passed suites, `127` tests total with `125` passed assertions and `2` failed assertions, but many suite failures are structural.
- Failure categories:
  - Governance “tests” are not real Jest tests and fail with `Your test suite must contain at least one test`:
    - `src/lib/governance/__tests__/retrieval-validation.test.ts`
    - `src/lib/governance/__tests__/approval-state-validation.test.ts`
    - `src/lib/governance/__tests__/escalation-validation.test.ts`
    - `src/lib/governance/__tests__/provenance-validation.test.ts`
    - `src/lib/governance/__tests__/prompt-validation.test.ts`
  - Integration tests fail because `src/__mocks__/prisma-client-mock.js` contains TypeScript syntax inside a `.js` file:
    - `src/__tests__/integration/critical-paths.test.ts`
    - `src/__tests__/integration/recommendation-publication.test.ts`
    - `src/__tests__/integration/org-scoping.test.ts`
    - `src/__tests__/integration/api-health.test.ts`
  - i18n test fails because English strings are still present in UI files:
    - `src/__tests__/i18n/no-english-strings.test.ts`
    - examples surfaced include `src/components/audit/engagement/platform-context-card.tsx`, `src/components/audit/mapping/mapping-page.tsx`, `src/components/audit/pilot/pilot-page.tsx`.

## 13. What Has Been Produced So Far

### Working Application Code

- AuditOS engagement workflow, validation, publication, exports, audit trail.
- DecisionOS CRUD, recommendation engine, approval snapshots, outcomes, sector and monitoring capabilities.
- Office AI governed task/file/output workflow.
- Sunbul/custom workflow with records, documents, reviews, exports.
- Platform audit log and workspace/platform bridge schema.

### Partial Application Code

- Platform org/workspace guard diagnostics.
- Deterministic AI orchestration framework without real cloud/local provider execution.
- Generic settings/dashboard areas that mix real diagnostics with shells.

### UI Shells

- `src/app/(dashboard)/settings/page.tsx`
- `src/app/(dashboard)/organizations/page.tsx`
- `src/app/(dashboard)/organizations/[id]/page.tsx`
- `src/app/sales/page.tsx`

### Demo Experiences

- `src/app/auditos/**`
- `src/lib/audit/mock-data.ts`
- `src/lib/audit/demo-data.ts`

### Database Models

- Extensive Prisma schema for platform, audit, decision, office-ai, and sunbul domains in `prisma/schema.prisma`.

### Server Actions / APIs

- Large set of real server actions under `src/actions/**`.
- API routes for exports, downloads, health, metrics, auth, and commercial intake under `src/app/api/**`.

### Shared Engines

- Governance approval/escalation/provenance engines under `src/lib/governance/**`.
- Decision and recommendation engines under `src/lib/decision/**` and `src/lib/recommendation/**`.
- Simulation engine under `src/lib/simulation/**`.
- File extraction and deterministic generation under `src/lib/office-ai/**`.

### Documentation Assets

- Very large documentation corpus under `docs/**`, including source-of-truth, official, system, reports, and theoretical-reference directories.

### Commercial Assets

- Public marketing site and product pages under `src/app/(marketing)/**`.
- Custom product inquiry flow.

### Test Assets

- Jest config, unit/integration/i18n tests, Cypress config, and some E2E specs.
- Test quality is uneven and part of it is structurally broken.

### Branding Assets

- Marketing site, structured enterprise components, messages/i18n files, brand content docs.

### Infrastructure / Config

- Next.js 16 app router setup, Prisma config, Docker files, Sentry config, Cypress config, Husky, backup scripts, seed scripts, pilot scripts.

## 14. What Has Not Been Produced Yet

- Standalone working SalesOS backend or schema.
- Standalone working LocalContentOS product under that identity.
- Standalone working SimulationOS product.
- RiskOS, ComplianceOS, LegalOS, GovOS implementation.
- Live cloud AI provider integration.
- Live local/on-prem AI provider integration.
- Consistent fully automated passing test suite.
- Fully real generic organizations/settings dashboards.
- Clearly documented and consolidated custom workspace taxonomy around `Sunbul` and `workflowos`.
- Strong route-level protection for all sensitive download/ops endpoints.

## 15. Customer Demo Safety

| Area                                  | Classification                                                    |
| ------------------------------------- | ----------------------------------------------------------------- |
| AuditOS                               | safe with explanation                                             |
| DecisionOS                            | safe with explanation                                             |
| Office AI Assistant                   | internal only / safe with explanation if positioned narrowly      |
| Sunbul                                | safe with explanation if it is intended as custom-client workflow |
| workflowos                            | internal only                                                     |
| auditos demo                          | safe to show as demo only                                         |
| SalesOS                               | do not show as implemented product                                |
| LocalContentOS                        | do not show as implemented product                                |
| SimulationOS standalone               | do not show as implemented product                                |
| Generic organizations/settings shells | internal only                                                     |

## 16. v0.1 Readiness Assessment

Verdict: **Can become v0.1 with focused implementation.**

Why:

- There is already enough real backend and schema depth for a serious v0.1 centered on AuditOS, DecisionOS, and possibly the governed Office AI assistant.
- The repository is not “major implementation missing” overall; a lot is already built.
- It is also not “minor fixes only,” because there are still concrete gaps:
  - inconsistent documentation vs code reality;
  - mock/prototype pages mixed into product surfaces;
  - public or weakly guarded API endpoints;
  - broken/structurally invalid test suite;
  - duplicated custom workspace taxonomy (`sunbul` vs `workflowos`).

## 17. Recommended Next Action

Do a focused reality-hardening pass before any new feature expansion:

1. Lock down sensitive API routes (`audit evidence download`, `office-ai download`, `metrics`) with explicit auth and tenant checks.
2. Decide the canonical status of `Sunbul`, `workflowos`, and `assistant`, then update product/system documentation to match the codebase.
3. Separate real product surfaces from prototypes by either wiring or hiding `organizations`, `settings`, and `sales` shells.
4. Repair the test stack by converting governance validation scripts into real Jest tests and fixing `src/__mocks__/prisma-client-mock.js`.
