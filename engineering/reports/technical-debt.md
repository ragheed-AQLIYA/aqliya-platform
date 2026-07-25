# Technical Debt Report

**Agent:** technical-debt  
**Generated:** 2026-07-17T23:24:13.764Z  
**Score:** 59/100  
**Findings:** 49 (critical 0, high 40, medium 0, low 8, info 1)

> Engineering Excellence — findings only. OpenCode remains implementation authority. No automatic code changes.

## Summary

| Severity | Count |
| -------- | ----- |
| critical | 0 |
| high | 40 |
| medium | 0 |
| low | 8 |
| info | 1 |

## Debt Index

Approximate debt index: **100/100** (higher = more debt).

Health contribution: 50/100.

## Top Refactor Opportunities

| Priority | File | MI | LOC | TODOs |
| -------- | ---- | -- | --- | ----- |
| 145 | `src/lib/local-content/workbook/ai-advisor.ts` | 0 | 1206 | 0 |
| 143 | `src/lib/audit/services.ts` | 0 | 1931 | 0 |
| 124 | `src/lib/local-content/workbook/population.ts` | 0 | 819 | 0 |
| 119 | `src/lib/skill-runtime/runtime.ts` | 0 | 857 | 0 |
| 119 | `src/app/(dashboard)/decisions/[id]/governance/page.tsx` | 0 | 1304 | 0 |
| 118 | `src/components/audit/trial-balance/trial-balance-upload.tsx` | 0 | 825 | 0 |
| 113 | `src/lib/skill-runtime/evaluator.ts` | 0 | 720 | 0 |
| 107 | `src/actions/workflowos-actions.ts` | 0 | 873 | 0 |
| 106 | `src/lib/platform/audit-bridge/audit-bridge-service.ts` | 1 | 749 | 0 |
| 103 | `src/actions/approval.ts` | 0 | 850 | 0 |
| 98 | `src/lib/platform/sales-intelligence/sales-intel-service.ts` | 1 | 731 | 0 |
| 97 | `src/lib/sales/prisma-repository.ts` | 2 | 905 | 0 |
| 96 | `src/lib/sales/store.ts` | 0 | 1162 | 0 |
| 96 | `src/actions/office-ai-actions.ts` | 4 | 573 | 0 |
| 95 | `src/lib/governance-engine/generators/dossier-generator.ts` | 3 | 667 | 0 |
| 95 | `src/lib/audit/db/income-statement-presentation.ts` | 3 | 670 | 0 |
| 95 | `src/lib/audit/db/statement-builder.ts` | 1 | 839 | 0 |
| 94 | `src/components/audit/evidence/evidence-page.tsx` | 0 | 1216 | 0 |
| 94 | `src/actions/decisions-workflow.ts` | 2 | 759 | 0 |
| 93 | `src/lib/platform/org-advanced/org-adv-service.ts` | 8 | 506 | 0 |

## Boundary

Suggestions only. OpenCode decides whether and how to refactor. No automatic code changes.

## HIGH Findings

### F-0009 — Debt hotspot (priority 145): ai-advisor.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/local-content/workbook/ai-advisor.ts`
- **Evidence:** LOC=1206, MI=0, complexity=142, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0010 — Debt hotspot (priority 143): services.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/audit/services.ts`
- **Evidence:** LOC=1931, MI=0, complexity=109, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0011 — Debt hotspot (priority 124): population.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/local-content/workbook/population.ts`
- **Evidence:** LOC=819, MI=0, complexity=116, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0012 — Debt hotspot (priority 119): runtime.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/skill-runtime/runtime.ts`
- **Evidence:** LOC=857, MI=0, complexity=104, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0013 — Debt hotspot (priority 119): page.tsx

- **Category:** risk-hotspot
- **Files:** `src/app/(dashboard)/decisions/[id]/governance/page.tsx`
- **Evidence:** LOC=1304, MI=0, complexity=86, TODO=0, suppressions=0, any=2
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0014 — Debt hotspot (priority 118): trial-balance-upload.tsx

- **Category:** risk-hotspot
- **Files:** `src/components/audit/trial-balance/trial-balance-upload.tsx`
- **Evidence:** LOC=825, MI=0, complexity=86, TODO=0, suppressions=1, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0015 — Debt hotspot (priority 113): evaluator.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/skill-runtime/evaluator.ts`
- **Evidence:** LOC=720, MI=0, complexity=97, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0016 — Debt hotspot (priority 107): workflowos-actions.ts

- **Category:** risk-hotspot
- **Files:** `src/actions/workflowos-actions.ts`
- **Evidence:** LOC=873, MI=0, complexity=80, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0017 — Debt hotspot (priority 106): audit-bridge-service.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/platform/audit-bridge/audit-bridge-service.ts`
- **Evidence:** LOC=749, MI=1, complexity=67, TODO=0, suppressions=1, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0018 — Debt hotspot (priority 103): approval.ts

- **Category:** risk-hotspot
- **Files:** `src/actions/approval.ts`
- **Evidence:** LOC=850, MI=0, complexity=72, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0019 — Debt hotspot (priority 98): sales-intel-service.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/platform/sales-intelligence/sales-intel-service.ts`
- **Evidence:** LOC=731, MI=1, complexity=67, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0020 — Debt hotspot (priority 97): prisma-repository.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/sales/prisma-repository.ts`
- **Evidence:** LOC=905, MI=2, complexity=42, TODO=0, suppressions=1, any=4
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0021 — Debt hotspot (priority 96): store.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/sales/store.ts`
- **Evidence:** LOC=1162, MI=0, complexity=46, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0022 — Debt hotspot (priority 96): office-ai-actions.ts

- **Category:** risk-hotspot
- **Files:** `src/actions/office-ai-actions.ts`
- **Evidence:** LOC=573, MI=4, complexity=69, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0023 — Debt hotspot (priority 95): dossier-generator.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/governance-engine/generators/dossier-generator.ts`
- **Evidence:** LOC=667, MI=3, complexity=64, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0024 — Debt hotspot (priority 95): income-statement-presentation.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/audit/db/income-statement-presentation.ts`
- **Evidence:** LOC=670, MI=3, complexity=63, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0025 — Debt hotspot (priority 95): statement-builder.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/audit/db/statement-builder.ts`
- **Evidence:** LOC=839, MI=1, complexity=57, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0026 — Debt hotspot (priority 94): evidence-page.tsx

- **Category:** risk-hotspot
- **Files:** `src/components/audit/evidence/evidence-page.tsx`
- **Evidence:** LOC=1216, MI=0, complexity=39, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0027 — Debt hotspot (priority 94): decisions-workflow.ts

- **Category:** risk-hotspot
- **Files:** `src/actions/decisions-workflow.ts`
- **Evidence:** LOC=759, MI=2, complexity=58, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0028 — Debt hotspot (priority 93): org-adv-service.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/platform/org-advanced/org-adv-service.ts`
- **Evidence:** LOC=506, MI=8, complexity=49, TODO=0, suppressions=1, any=6
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0029 — Debt hotspot (priority 93): page.tsx

- **Category:** risk-hotspot
- **Files:** `src/app/sales/settings/crm/page.tsx`
- **Evidence:** LOC=1138, MI=0, complexity=41, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0030 — Debt hotspot (priority 91): secret-resolver.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/integration/secret-resolver.ts`
- **Evidence:** LOC=687, MI=4, complexity=55, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0031 — Debt hotspot (priority 91): institutional-memory-service.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/core/memory/institutional-memory-service.ts`
- **Evidence:** LOC=853, MI=2, complexity=48, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0032 — Debt hotspot (priority 91): findings-page.tsx

- **Category:** risk-hotspot
- **Files:** `src/components/audit/findings/findings-page.tsx`
- **Evidence:** LOC=1148, MI=0, complexity=37, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0033 — Debt hotspot (priority 91): page.tsx

- **Category:** risk-hotspot
- **Files:** `src/app/login/page.tsx`
- **Evidence:** LOC=438, MI=15, complexity=16, TODO=0, suppressions=3, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0034 — Debt hotspot (priority 90): prisma-repository.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/local-content/content/prisma-repository.ts`
- **Evidence:** LOC=912, MI=2, complexity=43, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0035 — Debt hotspot (priority 90): prisma-repository.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/content-studio/prisma-repository.ts`
- **Evidence:** LOC=912, MI=2, complexity=43, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0036 — Debt hotspot (priority 89): recommendation-engine.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/recommendation/recommendation-engine.ts`
- **Evidence:** LOC=326, MI=12, complexity=64, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0037 — Debt hotspot (priority 89): page.tsx

- **Category:** risk-hotspot
- **Files:** `src/app/local-content/settings/integrations/page.tsx`
- **Evidence:** LOC=1237, MI=0, complexity=28, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0038 — Debt hotspot (priority 88): audit-risk-engine.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/platform/audit-risk/audit-risk-engine.ts`
- **Evidence:** LOC=655, MI=5, complexity=49, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0039 — Debt hotspot (priority 87): builder.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/sales/v02/knowledge-graph/builder.ts`
- **Evidence:** LOC=536, MI=7, complexity=52, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0040 — Debt hotspot (priority 87): executive-commercial-dashboard-service.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/sales/services/executive-commercial-dashboard-service.ts`
- **Evidence:** LOC=685, MI=5, complexity=46, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0041 — Debt hotspot (priority 87): office-ai-task-service.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/office-ai/office-ai-task-service.ts`
- **Evidence:** LOC=694, MI=5, complexity=46, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0042 — Debt hotspot (priority 87): services.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/local-content/services.ts`
- **Evidence:** LOC=962, MI=2, complexity=36, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0043 — Debt hotspot (priority 86): build.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/sales/v02/knowledge-graph/build.ts`
- **Evidence:** LOC=507, MI=8, complexity=51, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0044 — Debt hotspot (priority 86): cross-product-ai-service.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/platform/cross-product-ai/cross-product-ai-service.ts`
- **Evidence:** LOC=620, MI=6, complexity=47, TODO=0, suppressions=0, any=3
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0045 — Debt hotspot (priority 86): decisions-crud.ts

- **Category:** risk-hotspot
- **Files:** `src/actions/decisions-crud.ts`
- **Evidence:** LOC=729, MI=4, complexity=43, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0046 — Debt hotspot (priority 85): cache-strategy.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/platform/cache-strategy.ts`
- **Evidence:** LOC=348, MI=14, complexity=41, TODO=0, suppressions=1, any=1
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0047 — Debt hotspot (priority 85): financial-db.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/audit/db/financial-db.ts`
- **Evidence:** LOC=583, MI=7, complexity=47, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0048 — Debt hotspot (priority 85): decision-detail-client.tsx

- **Category:** risk-hotspot
- **Files:** `src/components/decisions/decision-detail-client.tsx`
- **Evidence:** LOC=599, MI=11, complexity=14, TODO=0, suppressions=2, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

## LOW Findings

### F-0001 — Legacy/deprecated signal: archived-engagements-panel.tsx

- **Category:** legacy
- **Files:** `src/components/audit/archived/archived-engagements-panel.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0002 — Legacy/deprecated signal: page.tsx

- **Category:** legacy
- **Files:** `src/app/sunbul/page.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0003 — Legacy/deprecated signal: page.tsx

- **Category:** legacy
- **Files:** `src/app/sunbul/clients/[clientId]/records/[recordId]/page.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0004 — Legacy/deprecated signal: page.tsx

- **Category:** legacy
- **Files:** `src/app/sunbul/admin/page.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0005 — Legacy/deprecated signal: page.tsx

- **Category:** legacy
- **Files:** `src/app/organizations/sunbul/page.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0006 — Legacy/deprecated signal: error.tsx

- **Category:** legacy
- **Files:** `src/app/audit/archived/error.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0007 — Legacy/deprecated signal: loading.tsx

- **Category:** legacy
- **Files:** `src/app/audit/archived/loading.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0008 — Legacy/deprecated signal: page.tsx

- **Category:** legacy
- **Files:** `src/app/audit/archived/page.tsx`
- **Evidence:** Path or comment indicates legacy

## INFO Findings

### F-0049 — Repository debt inventory

- **Category:** debt-summary
- **Evidence:** TODO/FIXME=33, suppressions=55, any-casts=314, legacy signals=8, hotspots=1514

---

_AQLIYA Engineering Excellence · technical-debt_
