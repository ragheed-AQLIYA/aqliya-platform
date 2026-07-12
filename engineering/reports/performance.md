# Performance Report

**Agent:** performance  
**Generated:** 2026-07-11T02:08:05.212Z  
**Score:** 57/100  
**Findings:** 135 (critical 0, high 32, medium 72, low 30, info 1)

> Engineering Excellence — findings only. OpenCode remains implementation authority. No automatic code changes.

## Summary

| Severity | Count |
| -------- | ----- |
| critical | 0 |
| high | 32 |
| medium | 72 |
| low | 30 |
| info | 1 |

## Scope

- Files scanned: 2860
- Models with organizationId: 124
- Missing org index suspects: 1
- N+1 suspects: 32
- Unbounded findMany files: 131
- Large client components: 44
- Heavy server-action modules: 27

## Note

Runtime profiling, Lighthouse, and bundle sizes require an approved build. This agent stays low-load (static only).

## HIGH Findings

### F-0356 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `prisma/seed-abac-policies.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0357 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `prisma/seed-audit.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0359 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `prisma/seed-local-content.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0360 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `prisma/seed-localcontent.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0361 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `prisma/seed-organizations.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0362 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `prisma/seed-sso.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0363 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `prisma/seed.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0380 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/tb-intelligence/knowledge-mining/kpis.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0394 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/platform/office-ai-adv/office-ai-adv-service.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0395 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/platform/download/__tests__/download.test.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0396 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/platform/decision-gov/decision-gov-service.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0397 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/platform/cross-product-ai/cross-product-ai-service.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0398 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/platform/audit-risk/audit-risk-engine.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0399 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/platform/access/rbac-service.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0400 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/platform/access/seed-permissions.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0401 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/platform/abac/abac-service.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0402 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/office-ai/file-extraction-service.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0403 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/local-content/workbook/ai-advisor.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0404 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/knowledge-foundation/kf-service.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0405 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/integration/resolver.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0406 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/core/policy/access/abac-service.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0407 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/core/memory/institutional-memory-service.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0408 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/core/knowledge/rag/embedding-service.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0409 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/core/events/outbox-service.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0410 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/audit/knowledge-engine.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0411 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/audit/db/index.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0412 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/audit/archival/index.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0464 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/actions/decision-templates.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0465 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/actions/decisions.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0467 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/actions/institutional-memory-actions.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0471 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/actions/localcontent-actions.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0480 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/actions/simulation.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

## MEDIUM Findings

### F-0355 — Model KnowledgeCandidateEvidence has organizationId without obvious index

- **Category:** indexes
- **Files:** `prisma/schema.prisma`
- **Evidence:** organizationId present; no @@index/@@unique on it detected
- **Suggestion:** Add @@index([organizationId]) or composite tenant indexes.

### F-0413 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/workflowos/workflow-admin-dashboard.tsx`
- **Evidence:** 419 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0414 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/platform/platform-sidebar.tsx`
- **Evidence:** 587 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0415 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/local-content/ai-advisor/ai-advisor-overview.tsx`
- **Evidence:** 581 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0416 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/knowledge-review/candidate-detail.tsx`
- **Evidence:** 408 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0417 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/forms/custom-product-form.tsx`
- **Evidence:** 763 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0418 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/audit/trial-balance/trial-balance-upload.tsx`
- **Evidence:** 825 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0419 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/audit/statements/statements-page.tsx`
- **Evidence:** 550 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0420 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/audit/review-notes/review-notes-board.tsx`
- **Evidence:** 655 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0421 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/audit/review/review-page.tsx`
- **Evidence:** 498 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0422 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/audit/recommendations/recommendations-page.tsx`
- **Evidence:** 721 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0423 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/audit/quality/quality-dashboard.tsx`
- **Evidence:** 499 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0424 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/audit/pilot/pilot-page.tsx`
- **Evidence:** 774 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0425 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/audit/notes/notes-page.tsx`
- **Evidence:** 468 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0426 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/audit/materiality/materiality-engine-page.tsx`
- **Evidence:** 563 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0427 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/audit/independence/independence-dashboard.tsx`
- **Evidence:** 547 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0428 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/audit/findings/findings-page.tsx`
- **Evidence:** 1148 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0429 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/audit/evidence/evidence-page.tsx`
- **Evidence:** 1216 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0430 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/audit/engagement/overview-tab.tsx`
- **Evidence:** 443 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0431 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/audit/approval/approval-page.tsx`
- **Evidence:** 562 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0432 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/audit/acceptance/client-acceptance-dashboard.tsx`
- **Evidence:** 740 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0433 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/settings/retention/page.tsx`
- **Evidence:** 774 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0434 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/settings/organization/advanced/page.tsx`
- **Evidence:** 470 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0435 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/settings/models/model-governance-client.tsx`
- **Evidence:** 406 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0436 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/settings/ai-governance/ai-governance-client.tsx`
- **Evidence:** 469 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0437 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/sampling/[id]/page.tsx`
- **Evidence:** 403 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0438 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/sales/settings/crm/page.tsx`
- **Evidence:** 1138 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0439 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/risk/assessments/[id]/page.tsx`
- **Evidence:** 480 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0440 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/office-ai/advanced/templates/page.tsx`
- **Evidence:** 411 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0441 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/login/page.tsx`
- **Evidence:** 438 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0442 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/local-content/workbook/[workbookId]/ai-insights-panel.tsx`
- **Evidence:** 451 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0443 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/local-content/workbook/[workbookId]/workbook-detail-client.tsx`
- **Evidence:** 797 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0444 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/local-content/settings/integrations/page.tsx`
- **Evidence:** 1237 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0445 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/local-content/review-center/review-center-client.tsx`
- **Evidence:** 629 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0446 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/local-content/quality-dashboard/quality-dashboard-client.tsx`
- **Evidence:** 629 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0447 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/local-content/projects/[projectId]/workbook/[workbookId]/ai-advisor/workbook-ai-advisor-client.tsx`
- **Evidence:** 560 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0448 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/institutional-memory/graph/page.tsx`
- **Evidence:** 606 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0449 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/(dashboard)/settings/sso/page.tsx`
- **Evidence:** 782 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0450 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/(dashboard)/settings/skills/evaluate/page.tsx`
- **Evidence:** 648 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0451 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/(dashboard)/settings/chain-verification/page.tsx`
- **Evidence:** 437 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0452 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/(dashboard)/operator/operator-dashboard-client.tsx`
- **Evidence:** 424 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0453 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/(dashboard)/decisions/[id]/risks/page.tsx`
- **Evidence:** 459 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0454 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/(dashboard)/decisions/[id]/recommendation/page.tsx`
- **Evidence:** 625 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0455 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/(dashboard)/decisions/[id]/outcome/page.tsx`
- **Evidence:** 459 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0456 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/(dashboard)/decisions/[id]/governance/page.tsx`
- **Evidence:** 1304 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0457 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/approval.ts`
- **Evidence:** 49 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0458 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/audit-actions.ts`
- **Evidence:** 224 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0459 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/audit-read-actions.ts`
- **Evidence:** 65 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0460 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/contact-actions.ts`
- **Evidence:** 55 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0461 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/contact-export-actions.ts`
- **Evidence:** 43 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0462 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/decision-evidence-actions.ts`
- **Evidence:** 29 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0463 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/decision-signals-alerts.ts`
- **Evidence:** 38 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0466 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/decisions.ts`
- **Evidence:** 102 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0468 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/institutional-memory-actions.ts`
- **Evidence:** 27 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0469 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/knowledge-mining-actions.ts`
- **Evidence:** 27 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0470 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/local-content-workspace-actions.ts`
- **Evidence:** 55 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0472 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/localcontent-actions.ts`
- **Evidence:** 145 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0473 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/localcontent-ai-advisor-actions.ts`
- **Evidence:** 37 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0474 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/localcontent-ai-advisor-v3-actions.ts`
- **Evidence:** 46 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0475 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/localcontent-review-actions.ts`
- **Evidence:** 27 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0476 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/localcontent-workbook-actions.ts`
- **Evidence:** 55 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0477 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/office-ai-actions.ts`
- **Evidence:** 33 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0478 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/registration-actions.ts`
- **Evidence:** 34 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0479 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/sales-actions.ts`
- **Evidence:** 130 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0481 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/tenant-actions.ts`
- **Evidence:** 27 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0482 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/workflowos-actions.ts`
- **Evidence:** 60 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0483 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/workflowos-export-actions.ts`
- **Evidence:** 30 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0484 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/workflowos-template-actions.ts`
- **Evidence:** 46 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0485 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/__tests__/contact-actions.test.ts`
- **Evidence:** 28 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0486 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/__tests__/decision-actions.test.ts`
- **Evidence:** 29 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0487 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/__tests__/workflow-actions.test.ts`
- **Evidence:** 44 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0488 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/knowledge-foundation/actions.ts`
- **Evidence:** 44 await expressions
- **Suggestion:** Parallelize independent awaits; cache stable reads.

## LOW Findings

### F-0358 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `prisma/seed-knowledge-mining.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0364 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/__tests__/uat-run.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0365 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/__tests__/unit/sso-service.test.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0366 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/__tests__/integration/critical-paths.test.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0367 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/__tests__/integration/tb-upload-mapping-fs.integration.test.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0368 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/__tests__/actions/office-ai-actions.test.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0369 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/__tests__/actions/sso-admin-actions.test.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0370 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/cache.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0371 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/workflowos/analytics-service.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0372 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/workflowos/services.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0373 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/workflowos/sla-service.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0374 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/workflowos/template-service.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0375 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/workflowos/tenant-guard.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0376 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/tb-intelligence/classification-explanation.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0377 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/tb-intelligence/coa-loader.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0378 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/tb-intelligence/firm-memory.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0379 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/tb-intelligence/knowledge-mining/candidate-rule-generator.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0381 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/tb-intelligence/knowledge-mining/promotion-service.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0382 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/sales/contacts.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0383 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/sales/conversion-memo.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0384 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/sales/evidence-links.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0385 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/sales/outreach.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0386 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/sales/prisma-repository.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0387 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/sales/reporting.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0388 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/sales/signals.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0389 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/sales/repositories/account-repository.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0390 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/sales/repositories/audit-repository.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0391 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/sales/repositories/contact-repository.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0392 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/sales/repositories/evidence-repository.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0393 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/sales/repositories/interaction-repository.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

## INFO Findings

### F-0489 — Bundle tooling present — run after approved builds

- **Category:** bundle-size
- **Evidence:** bundle-analyzer / performance-budget scripts found
- **Suggestion:** Use npm run analyze after explicit build approval (low-load policy).

---

_AQLIYA Engineering Excellence · performance_
