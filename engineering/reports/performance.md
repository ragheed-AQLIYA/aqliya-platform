# Performance Report

**Agent:** performance  
**Generated:** 2026-07-21T21:43:25.441Z  
**Score:** 73/100  
**Findings:** 65 (critical 0, high 13, medium 21, low 30, info 1)

> Engineering Excellence — findings only. OpenCode remains implementation authority. No automatic code changes.

## Summary

| Severity | Count |
| -------- | ----- |
| critical | 0 |
| high | 13 |
| medium | 21 |
| low | 30 |
| info | 1 |

## Scope

- Files scanned: 4173
- Models with organizationId: 125
- Missing org index suspects: 0
- N+1 suspects: 13
- Unbounded findMany files: 87
- Large client components: 11
- Heavy server-action modules: 10

## Note

Runtime profiling, Lighthouse, and bundle sizes require an approved build. This agent stays low-load (static only).

## HIGH Findings

### F-0001 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `prisma/seed-abac-policies.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0002 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `prisma/seed-audit.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0003 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `prisma/seed-local-content.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0004 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `prisma/seed-localcontent.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0005 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `prisma/seed-organizations.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0006 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `prisma/seed-pilot.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0007 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `prisma/seed-sso.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0008 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `prisma/seed.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0009 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/platform/cross-product-ai/cross-product-ai-service/stats.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0010 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/knowledge-foundation/kf-service.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0023 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/core/memory/institutional-memory-service/graph.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0042 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/lib/audit/archival/index.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

### F-0060 — Possible Prisma N+1 query pattern

- **Category:** n-plus-one
- **Files:** `src/actions/localcontent-spend-actions.ts`
- **Evidence:** await prisma.* inside for/map(async)
- **Suggestion:** Batch with findMany + where id in [...], or include/select.

## MEDIUM Findings

### F-0043 — Large client component

- **Category:** react-rendering
- **Files:** `src/components/audit/findings/components/use-findings-page.ts`
- **Evidence:** 467 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0044 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/settings/organization/advanced/page.tsx`
- **Evidence:** 470 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0045 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/sampling/[id]/page.tsx`
- **Evidence:** 403 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0046 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/risk/assessments/[id]/page.tsx`
- **Evidence:** 480 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0047 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/office-ai/advanced/templates/page.tsx`
- **Evidence:** 411 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0048 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/login/page.tsx`
- **Evidence:** 438 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0049 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/local-content/settings/integrations/components/connection-detail-panel.tsx`
- **Evidence:** 405 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0050 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/(dashboard)/settings/chain-verification/page.tsx`
- **Evidence:** 437 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0051 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/(dashboard)/operator/operator-dashboard-client.tsx`
- **Evidence:** 424 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0052 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/(dashboard)/decisions/[id]/risks/page.tsx`
- **Evidence:** 459 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0053 — Large client component

- **Category:** react-rendering
- **Files:** `src/app/(dashboard)/decisions/[id]/outcome/page.tsx`
- **Evidence:** 459 lines with use client
- **Suggestion:** Split presentational vs data; prefer Server Components where possible.

### F-0054 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/audit-ai-actions.ts`
- **Evidence:** 56 sequential await expressions (56 total, 0 parallelized)
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0055 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/audit-engagement-actions.ts`
- **Evidence:** 74 sequential await expressions (76 total, 2 parallelized)
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0056 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/contact-actions.ts`
- **Evidence:** 48 sequential await expressions (48 total, 0 parallelized)
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0057 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/local-content-workspace-actions.ts`
- **Evidence:** 55 sequential await expressions (55 total, 0 parallelized)
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0058 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/localcontent-ai-advisor-v3-actions.ts`
- **Evidence:** 46 sequential await expressions (46 total, 0 parallelized)
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0059 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/localcontent-evidence-actions.ts`
- **Evidence:** 40 sequential await expressions (40 total, 0 parallelized)
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0061 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/localcontent-workbook-actions.ts`
- **Evidence:** 92 sequential await expressions (92 total, 0 parallelized)
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0062 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/workflowos-template-actions.ts`
- **Evidence:** 46 sequential await expressions (46 total, 0 parallelized)
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0063 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/sales-actions/ai-intelligence.ts`
- **Evidence:** 51 sequential await expressions (51 total, 0 parallelized)
- **Suggestion:** Parallelize independent awaits; cache stable reads.

### F-0064 — Server action module with many awaits

- **Category:** server-actions
- **Files:** `src/actions/knowledge-foundation/actions.ts`
- **Evidence:** 46 sequential await expressions (46 total, 0 parallelized)
- **Suggestion:** Parallelize independent awaits; cache stable reads.

## LOW Findings

### F-0011 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/knowledge-foundation/version-candidate-snapshot.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0012 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/integration/health-runtime.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0013 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/integration/resolver.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0014 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/domains/sales/queries/pipeline.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0015 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/domains/local-content/queries/scoring.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0016 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/domains/audit/queries/dashboard.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0017 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/decision/sector-benchmark.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0018 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/decision/sector-pattern.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0019 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/decision/sector.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0020 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/decision/signals-alerts.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0021 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/core/policy/access/abac-service.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0022 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/core/memory/institutional-memory-service/collections.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0024 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/core/memory/institutional-memory-service/graph.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0025 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/core/knowledge/rag/knowledge-service.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0026 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/core/evidence/core-evidence-service.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0027 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/core/evidence/graph.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0028 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/core/evidence/health.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0029 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/core/ai/budget-manager.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0030 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/content-studio/prisma-repository/approvals.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0031 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/content-studio/prisma-repository/campaigns.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0032 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/content-studio/prisma-repository/content-items.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0033 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/content-studio/prisma-repository/outputs.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0034 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/content-studio/prisma-repository/projects.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0035 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/content-studio/prisma-repository/reviews.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0036 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/content-studio/prisma-repository/sources.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0037 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/authorization/permission-resolver.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0038 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/auth/db-oauth-providers.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0039 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/auth/sso-service.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0040 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/audit-intelligence/index.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

### F-0041 — findMany without take/limit in file

- **Category:** unbounded-query
- **Files:** `src/lib/audit/client-acceptance-engine.ts`
- **Evidence:** prisma findMany present; no take: in file
- **Suggestion:** Add pagination (take/skip) for list endpoints.

## INFO Findings

### F-0065 — Bundle tooling present — run after approved builds

- **Category:** bundle-size
- **Evidence:** bundle-analyzer / performance-budget scripts found
- **Suggestion:** Use npm run analyze after explicit build approval (low-load policy).

---

_AQLIYA Engineering Excellence · performance_
