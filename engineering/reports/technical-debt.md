# Technical Debt Report

**Agent:** technical-debt  
**Generated:** 2026-07-11T02:08:06.592Z  
**Score:** 58/100  
**Findings:** 106 (critical 0, high 40, medium 0, low 65, info 1)

> Engineering Excellence — findings only. OpenCode remains implementation authority. No automatic code changes.

## Summary

| Severity | Count |
| -------- | ----- |
| critical | 0 |
| high | 40 |
| medium | 0 |
| low | 65 |
| info | 1 |

## Debt Index

Approximate debt index: **100/100** (higher = more debt).

Health contribution: 50/100.

## Top Refactor Opportunities

| Priority | File | MI | LOC | TODOs |
| -------- | ---- | -- | --- | ----- |
| 238 | `src/lib/audit/db/index.ts` | 0 | 3657 | 0 |
| 160 | `src/actions/decisions.ts` | 0 | 1696 | 0 |
| 143 | `src/lib/local-content/workbook/ai-advisor.ts` | 0 | 1162 | 0 |
| 143 | `src/lib/audit/services.ts` | 0 | 1931 | 0 |
| 137 | `src/lib/audit/client-acceptance-engine.ts` | 15 | 466 | 0 |
| 131 | `src/__mocks__/prisma-client-mock.js` | 0 | 501 | 0 |
| 126 | `src/app/(dashboard)/decisions/[id]/page.tsx` | 15 | 477 | 0 |
| 119 | `src/lib/skill-runtime/runtime.ts` | 0 | 857 | 0 |
| 119 | `src/app/(dashboard)/decisions/[id]/governance/page.tsx` | 0 | 1304 | 0 |
| 118 | `src/components/audit/trial-balance/trial-balance-upload.tsx` | 0 | 825 | 0 |
| 117 | `src/lib/skill-runtime/__tests__/skill-registry.integration.test.ts` | 0 | 498 | 0 |
| 114 | `src/actions/audit-actions.ts` | 0 | 1775 | 0 |
| 113 | `src/lib/skill-runtime/evaluator.ts` | 0 | 720 | 0 |
| 110 | `src/lib/local-content/workbook/population.ts` | 0 | 768 | 0 |
| 109 | `src/lib/platform/org-advanced/org-adv-service.ts` | 8 | 504 | 0 |
| 109 | `src/lib/audit/mock-data.ts` | 0 | 2456 | 0 |
| 106 | `src/lib/platform/audit-bridge/audit-bridge-service.ts` | 1 | 748 | 0 |
| 106 | `src/actions/localcontent-actions.ts` | 0 | 1449 | 0 |
| 106 | `src/actions/workflowos-actions.ts` | 0 | 824 | 0 |
| 104 | `src/__tests__/i18n/no-english-strings.test.ts` | 9 | 496 | 1 |

## Boundary

Suggestions only. OpenCode decides whether and how to refactor. No automatic code changes.

## HIGH Findings

### F-0778 — Debt hotspot (priority 238): index.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/audit/db/index.ts`
- **Evidence:** LOC=3657, MI=0, complexity=214, TODO=0, suppressions=1, any=10
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0779 — Debt hotspot (priority 160): decisions.ts

- **Category:** risk-hotspot
- **Files:** `src/actions/decisions.ts`
- **Evidence:** LOC=1696, MI=0, complexity=120, TODO=0, suppressions=2, any=2
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0780 — Debt hotspot (priority 143): ai-advisor.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/local-content/workbook/ai-advisor.ts`
- **Evidence:** LOC=1162, MI=0, complexity=139, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0781 — Debt hotspot (priority 143): services.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/audit/services.ts`
- **Evidence:** LOC=1931, MI=0, complexity=109, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0782 — Debt hotspot (priority 137): client-acceptance-engine.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/audit/client-acceptance-engine.ts`
- **Evidence:** LOC=466, MI=15, complexity=11, TODO=0, suppressions=9, any=9
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0783 — Debt hotspot (priority 131): prisma-client-mock.js

- **Category:** risk-hotspot
- **Files:** `src/__mocks__/prisma-client-mock.js`
- **Evidence:** LOC=501, MI=0, complexity=126, TODO=0, suppressions=1, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0784 — Debt hotspot (priority 126): page.tsx

- **Category:** risk-hotspot
- **Files:** `src/app/(dashboard)/decisions/[id]/page.tsx`
- **Evidence:** LOC=477, MI=15, complexity=5, TODO=0, suppressions=8, any=8
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0785 — Debt hotspot (priority 119): runtime.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/skill-runtime/runtime.ts`
- **Evidence:** LOC=857, MI=0, complexity=104, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0786 — Debt hotspot (priority 119): page.tsx

- **Category:** risk-hotspot
- **Files:** `src/app/(dashboard)/decisions/[id]/governance/page.tsx`
- **Evidence:** LOC=1304, MI=0, complexity=86, TODO=0, suppressions=0, any=2
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0787 — Debt hotspot (priority 118): trial-balance-upload.tsx

- **Category:** risk-hotspot
- **Files:** `src/components/audit/trial-balance/trial-balance-upload.tsx`
- **Evidence:** LOC=825, MI=0, complexity=86, TODO=0, suppressions=1, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0788 — Debt hotspot (priority 117): skill-registry.integration.test.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/skill-runtime/__tests__/skill-registry.integration.test.ts`
- **Evidence:** LOC=498, MI=0, complexity=114, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0789 — Debt hotspot (priority 114): audit-actions.ts

- **Category:** risk-hotspot
- **Files:** `src/actions/audit-actions.ts`
- **Evidence:** LOC=1775, MI=0, complexity=56, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0790 — Debt hotspot (priority 113): evaluator.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/skill-runtime/evaluator.ts`
- **Evidence:** LOC=720, MI=0, complexity=97, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0791 — Debt hotspot (priority 110): population.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/local-content/workbook/population.ts`
- **Evidence:** LOC=768, MI=0, complexity=90, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0792 — Debt hotspot (priority 109): org-adv-service.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/platform/org-advanced/org-adv-service.ts`
- **Evidence:** LOC=504, MI=8, complexity=49, TODO=0, suppressions=3, any=8
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0793 — Debt hotspot (priority 109): mock-data.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/audit/mock-data.ts`
- **Evidence:** LOC=2456, MI=0, complexity=20, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0794 — Debt hotspot (priority 106): audit-bridge-service.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/platform/audit-bridge/audit-bridge-service.ts`
- **Evidence:** LOC=748, MI=1, complexity=67, TODO=0, suppressions=1, any=1
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0795 — Debt hotspot (priority 106): localcontent-actions.ts

- **Category:** risk-hotspot
- **Files:** `src/actions/localcontent-actions.ts`
- **Evidence:** LOC=1449, MI=0, complexity=54, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0796 — Debt hotspot (priority 106): workflowos-actions.ts

- **Category:** risk-hotspot
- **Files:** `src/actions/workflowos-actions.ts`
- **Evidence:** LOC=824, MI=0, complexity=80, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0797 — Debt hotspot (priority 104): no-english-strings.test.ts

- **Category:** risk-hotspot
- **Files:** `src/__tests__/i18n/no-english-strings.test.ts`
- **Evidence:** LOC=496, MI=9, complexity=50, TODO=1, suppressions=2, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0798 — Debt hotspot (priority 103): approval.ts

- **Category:** risk-hotspot
- **Files:** `src/actions/approval.ts`
- **Evidence:** LOC=850, MI=0, complexity=72, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0799 — Debt hotspot (priority 98): sales-intel-service.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/platform/sales-intelligence/sales-intel-service.ts`
- **Evidence:** LOC=731, MI=1, complexity=67, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0800 — Debt hotspot (priority 97): prisma-repository.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/sales/prisma-repository.ts`
- **Evidence:** LOC=897, MI=2, complexity=42, TODO=0, suppressions=1, any=33
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0801 — Debt hotspot (priority 96): store.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/sales/store.ts`
- **Evidence:** LOC=1162, MI=0, complexity=46, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0802 — Debt hotspot (priority 95): dossier-generator.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/governance-engine/generators/dossier-generator.ts`
- **Evidence:** LOC=667, MI=3, complexity=64, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0803 — Debt hotspot (priority 95): income-statement-presentation.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/audit/db/income-statement-presentation.ts`
- **Evidence:** LOC=670, MI=3, complexity=63, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0804 — Debt hotspot (priority 95): statement-builder.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/audit/db/statement-builder.ts`
- **Evidence:** LOC=839, MI=1, complexity=57, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0805 — Debt hotspot (priority 94): content-studio.test.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/platform/content-studio/__tests__/content-studio.test.ts`
- **Evidence:** LOC=937, MI=0, complexity=51, TODO=0, suppressions=0, any=35
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0806 — Debt hotspot (priority 94): evidence-page.tsx

- **Category:** risk-hotspot
- **Files:** `src/components/audit/evidence/evidence-page.tsx`
- **Evidence:** LOC=1216, MI=0, complexity=39, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0807 — Debt hotspot (priority 93): page.tsx

- **Category:** risk-hotspot
- **Files:** `src/app/sales/settings/crm/page.tsx`
- **Evidence:** LOC=1138, MI=0, complexity=41, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0808 — Debt hotspot (priority 92): graph-readiness-pipeline.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/governance-engine/graph/pipeline/graph-readiness-pipeline.ts`
- **Evidence:** LOC=648, MI=8, complexity=27, TODO=0, suppressions=2, any=2
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0809 — Debt hotspot (priority 91): secret-resolver.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/integration/secret-resolver.ts`
- **Evidence:** LOC=687, MI=4, complexity=55, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0810 — Debt hotspot (priority 91): institutional-memory-service.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/core/memory/institutional-memory-service.ts`
- **Evidence:** LOC=853, MI=2, complexity=48, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0811 — Debt hotspot (priority 91): findings-page.tsx

- **Category:** risk-hotspot
- **Files:** `src/components/audit/findings/findings-page.tsx`
- **Evidence:** LOC=1148, MI=0, complexity=37, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0812 — Debt hotspot (priority 91): page.tsx

- **Category:** risk-hotspot
- **Files:** `src/app/login/page.tsx`
- **Evidence:** LOC=438, MI=15, complexity=16, TODO=0, suppressions=3, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0813 — Debt hotspot (priority 90): prisma-repository.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/local-content/content/prisma-repository.ts`
- **Evidence:** LOC=912, MI=2, complexity=43, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0814 — Debt hotspot (priority 89): recommendation-engine.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/recommendation/recommendation-engine.ts`
- **Evidence:** LOC=326, MI=12, complexity=64, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0815 — Debt hotspot (priority 89): page.tsx

- **Category:** risk-hotspot
- **Files:** `src/app/local-content/settings/integrations/page.tsx`
- **Evidence:** LOC=1237, MI=0, complexity=28, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0816 — Debt hotspot (priority 88): seed-data.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/sales/seed-data.ts`
- **Evidence:** LOC=1695, MI=0, complexity=8, TODO=0, suppressions=0, any=0
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

### F-0817 — Debt hotspot (priority 88): audit-risk-engine.ts

- **Category:** risk-hotspot
- **Files:** `src/lib/platform/audit-risk/audit-risk-engine.ts`
- **Evidence:** LOC=656, MI=5, complexity=50, TODO=0, suppressions=0, any=5
- **Suggestion:** Candidate for OpenCode-owned refactor — see engineering/refactors/.

## LOW Findings

### F-0713 — Legacy/deprecated signal: sso-service.test.ts

- **Category:** legacy
- **Files:** `src/__tests__/unit/sso-service.test.ts`
- **Evidence:** Path or comment indicates legacy

### F-0714 — Legacy/deprecated signal: critical-paths.test.ts

- **Category:** legacy
- **Files:** `src/__tests__/integration/critical-paths.test.ts`
- **Evidence:** Path or comment indicates legacy

### F-0715 — Legacy/deprecated signal: audit-adapter.ts

- **Category:** legacy
- **Files:** `src/products/sales/core-adapters/audit-adapter.ts`
- **Evidence:** Path or comment indicates legacy

### F-0716 — Legacy/deprecated signal: auth.ts

- **Category:** legacy
- **Files:** `src/lib/auth.ts`
- **Evidence:** Path or comment indicates legacy

### F-0717 — Legacy/deprecated signal: firm-memory.ts

- **Category:** legacy
- **Files:** `src/lib/tb-intelligence/firm-memory.ts`
- **Evidence:** Path or comment indicates legacy

### F-0718 — Legacy/deprecated signal: outreach.ts

- **Category:** legacy
- **Files:** `src/lib/sales/outreach.ts`
- **Evidence:** Path or comment indicates legacy

### F-0719 — Legacy/deprecated signal: seed-data.ts

- **Category:** legacy
- **Files:** `src/lib/sales/seed-data.ts`
- **Evidence:** Path or comment indicates legacy

### F-0720 — Legacy/deprecated signal: types.ts

- **Category:** legacy
- **Files:** `src/lib/sales/types.ts`
- **Evidence:** Path or comment indicates legacy

### F-0721 — Legacy/deprecated signal: commercial-memory.test.ts

- **Category:** legacy
- **Files:** `src/lib/sales/__tests__/commercial-memory.test.ts`
- **Evidence:** Path or comment indicates legacy

### F-0722 — Legacy/deprecated signal: intelligence-hub-tabs.test.ts

- **Category:** legacy
- **Files:** `src/lib/sales/__tests__/intelligence-hub-tabs.test.ts`
- **Evidence:** Path or comment indicates legacy

### F-0723 — Legacy/deprecated signal: salesos-v01-lib.test.ts

- **Category:** legacy
- **Files:** `src/lib/sales/__tests__/salesos-v01-lib.test.ts`
- **Evidence:** Path or comment indicates legacy

### F-0724 — Legacy/deprecated signal: commercial-memory.ts

- **Category:** legacy
- **Files:** `src/lib/sales/vnext/commercial-memory.ts`
- **Evidence:** Path or comment indicates legacy

### F-0725 — Legacy/deprecated signal: platform-organization-context.ts

- **Category:** legacy
- **Files:** `src/lib/platform/platform-organization-context.ts`
- **Evidence:** Path or comment indicates legacy

### F-0726 — Legacy/deprecated signal: sales-intel.test.ts

- **Category:** legacy
- **Files:** `src/lib/platform/sales-intelligence/__tests__/sales-intel.test.ts`
- **Evidence:** Path or comment indicates legacy

### F-0727 — Legacy/deprecated signal: product-registry.ts

- **Category:** legacy
- **Files:** `src/lib/platform/registry/product-registry.ts`
- **Evidence:** Path or comment indicates legacy

### F-0728 — Legacy/deprecated signal: institutional-memory-service.ts

- **Category:** legacy
- **Files:** `src/lib/platform/institutional-memory/institutional-memory-service.ts`
- **Evidence:** Path or comment indicates legacy

### F-0729 — Legacy/deprecated signal: platform-org-guard.ts

- **Category:** legacy
- **Files:** `src/lib/platform/guards/platform-org-guard.ts`
- **Evidence:** Path or comment indicates legacy

### F-0730 — Legacy/deprecated signal: unified-query.ts

- **Category:** legacy
- **Files:** `src/lib/platform/audit/unified-query.ts`
- **Evidence:** Path or comment indicates legacy

### F-0731 — Legacy/deprecated signal: proof-hub-content-en.ts

- **Category:** legacy
- **Files:** `src/lib/marketing/proof-hub-content-en.ts`
- **Evidence:** Path or comment indicates legacy

### F-0732 — Legacy/deprecated signal: proof-hub-content.ts

- **Category:** legacy
- **Files:** `src/lib/marketing/proof-hub-content.ts`
- **Evidence:** Path or comment indicates legacy

### F-0733 — Legacy/deprecated signal: connector-factory.ts

- **Category:** legacy
- **Files:** `src/lib/local-content/erp/connector-factory.ts`
- **Evidence:** Path or comment indicates legacy

### F-0734 — Legacy/deprecated signal: connector-factory.test.ts

- **Category:** legacy
- **Files:** `src/lib/local-content/erp/__tests__/connector-factory.test.ts`
- **Evidence:** Path or comment indicates legacy

### F-0735 — Legacy/deprecated signal: release-generator.ts

- **Category:** legacy
- **Files:** `src/lib/knowledge-foundation/release-generator.ts`
- **Evidence:** Path or comment indicates legacy

### F-0736 — Legacy/deprecated signal: types.ts

- **Category:** legacy
- **Files:** `src/lib/knowledge-foundation/types.ts`
- **Evidence:** Path or comment indicates legacy

### F-0737 — Legacy/deprecated signal: resolver.ts

- **Category:** legacy
- **Files:** `src/lib/integration/resolver.ts`
- **Evidence:** Path or comment indicates legacy

### F-0738 — Legacy/deprecated signal: secret-resolver.ts

- **Category:** legacy
- **Files:** `src/lib/integration/secret-resolver.ts`
- **Evidence:** Path or comment indicates legacy

### F-0739 — Legacy/deprecated signal: base-rule.ts

- **Category:** legacy
- **Files:** `src/lib/governance-engine/rules/base-rule.ts`
- **Evidence:** Path or comment indicates legacy

### F-0740 — Legacy/deprecated signal: decision-audit.ts

- **Category:** legacy
- **Files:** `src/lib/decision/decision-audit.ts`
- **Evidence:** Path or comment indicates legacy

### F-0741 — Legacy/deprecated signal: decision-export-formats.ts

- **Category:** legacy
- **Files:** `src/lib/decision/decision-export-formats.ts`
- **Evidence:** Path or comment indicates legacy

### F-0742 — Legacy/deprecated signal: index.ts

- **Category:** legacy
- **Files:** `src/lib/core/index.ts`
- **Evidence:** Path or comment indicates legacy

### F-0743 — Legacy/deprecated signal: types.ts

- **Category:** legacy
- **Files:** `src/lib/core/policy/access/types.ts`
- **Evidence:** Path or comment indicates legacy

### F-0744 — Legacy/deprecated signal: embedding-service.ts

- **Category:** legacy
- **Files:** `src/lib/core/knowledge/rag/embedding-service.ts`
- **Evidence:** Path or comment indicates legacy

### F-0745 — Legacy/deprecated signal: rag-retriever.ts

- **Category:** legacy
- **Files:** `src/lib/core/knowledge/rag/rag-retriever.ts`
- **Evidence:** Path or comment indicates legacy

### F-0746 — Legacy/deprecated signal: model-registry.ts

- **Category:** legacy
- **Files:** `src/lib/core/ai/model-registry.ts`
- **Evidence:** Path or comment indicates legacy

### F-0747 — Legacy/deprecated signal: sso-service.ts

- **Category:** legacy
- **Files:** `src/lib/auth/sso-service.ts`
- **Evidence:** Path or comment indicates legacy

### F-0748 — Legacy/deprecated signal: services.ts

- **Category:** legacy
- **Files:** `src/lib/audit/services.ts`
- **Evidence:** Path or comment indicates legacy

### F-0749 — Legacy/deprecated signal: engagement-presentation-config.ts

- **Category:** legacy
- **Files:** `src/lib/audit/presentation/engagement-presentation-config.ts`
- **Evidence:** Path or comment indicates legacy

### F-0750 — Legacy/deprecated signal: income-statement-presentation.ts

- **Category:** legacy
- **Files:** `src/lib/audit/db/income-statement-presentation.ts`
- **Evidence:** Path or comment indicates legacy

### F-0751 — Legacy/deprecated signal: sw-unregister.tsx

- **Category:** legacy
- **Files:** `src/components/platform/sw-unregister.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0752 — Legacy/deprecated signal: custom-product-form.tsx

- **Category:** legacy
- **Files:** `src/components/forms/custom-product-form.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0753 — Legacy/deprecated signal: archived-engagements-panel.tsx

- **Category:** legacy
- **Files:** `src/components/audit/archived/archived-engagements-panel.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0754 — Legacy/deprecated signal: page.tsx

- **Category:** legacy
- **Files:** `src/app/sunbul/page.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0755 — Legacy/deprecated signal: page.tsx

- **Category:** legacy
- **Files:** `src/app/sunbul/clients/[clientId]/records/[recordId]/page.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0756 — Legacy/deprecated signal: page.tsx

- **Category:** legacy
- **Files:** `src/app/sunbul/admin/page.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0757 — Legacy/deprecated signal: page.tsx

- **Category:** legacy
- **Files:** `src/app/published/recommendation/[decisionId]/page.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0758 — Legacy/deprecated signal: page.tsx

- **Category:** legacy
- **Files:** `src/app/organizations/sunbul/page.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0759 — Legacy/deprecated signal: error.tsx

- **Category:** legacy
- **Files:** `src/app/audit/archived/error.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0760 — Legacy/deprecated signal: loading.tsx

- **Category:** legacy
- **Files:** `src/app/audit/archived/loading.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0761 — Legacy/deprecated signal: page.tsx

- **Category:** legacy
- **Files:** `src/app/audit/archived/page.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0762 — Legacy/deprecated signal: route.ts

- **Category:** legacy
- **Files:** `src/app/api/knowledge-mining/review/route.ts`
- **Evidence:** Path or comment indicates legacy

### F-0763 — Legacy/deprecated signal: route.ts

- **Category:** legacy
- **Files:** `src/app/api/knowledge-mining/promote/route.ts`
- **Evidence:** Path or comment indicates legacy

### F-0764 — Legacy/deprecated signal: route.ts

- **Category:** legacy
- **Files:** `src/app/api/knowledge-mining/kpis/route.ts`
- **Evidence:** Path or comment indicates legacy

### F-0765 — Legacy/deprecated signal: route.ts

- **Category:** legacy
- **Files:** `src/app/api/knowledge-mining/candidates/route.ts`
- **Evidence:** Path or comment indicates legacy

### F-0766 — Legacy/deprecated signal: route.ts

- **Category:** legacy
- **Files:** `src/app/api/knowledge-mining/candidates/[id]/route.ts`
- **Evidence:** Path or comment indicates legacy

### F-0767 — Legacy/deprecated signal: route.ts

- **Category:** legacy
- **Files:** `src/app/api/knowledge-mining/batch-promote/route.ts`
- **Evidence:** Path or comment indicates legacy

### F-0768 — Legacy/deprecated signal: route.ts

- **Category:** legacy
- **Files:** `src/app/api/knowledge-mining/aggregate/route.ts`
- **Evidence:** Path or comment indicates legacy

### F-0769 — Legacy/deprecated signal: page.tsx

- **Category:** legacy
- **Files:** `src/app/(dashboard)/settings/workspaces/page.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0770 — Legacy/deprecated signal: page.tsx

- **Category:** legacy
- **Files:** `src/app/(dashboard)/settings/platform-organization/page.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0771 — Legacy/deprecated signal: page.tsx

- **Category:** legacy
- **Files:** `src/app/(dashboard)/decisions/[id]/governance/page.tsx`
- **Evidence:** Path or comment indicates legacy

### F-0772 — Legacy/deprecated signal: approval.ts

- **Category:** legacy
- **Files:** `src/actions/approval.ts`
- **Evidence:** Path or comment indicates legacy

### F-0773 — Legacy/deprecated signal: audit-actions.ts

- **Category:** legacy
- **Files:** `src/actions/audit-actions.ts`
- **Evidence:** Path or comment indicates legacy

### F-0774 — Legacy/deprecated signal: decision-export.ts

- **Category:** legacy
- **Files:** `src/actions/decision-export.ts`
- **Evidence:** Path or comment indicates legacy

### F-0775 — Legacy/deprecated signal: decisions.ts

- **Category:** legacy
- **Files:** `src/actions/decisions.ts`
- **Evidence:** Path or comment indicates legacy

### F-0776 — Legacy/deprecated signal: localcontent-actions.ts

- **Category:** legacy
- **Files:** `src/actions/localcontent-actions.ts`
- **Evidence:** Path or comment indicates legacy

### F-0777 — Legacy/deprecated signal: sales-actions.ts

- **Category:** legacy
- **Files:** `src/actions/sales-actions.ts`
- **Evidence:** Path or comment indicates legacy

## INFO Findings

### F-0818 — Repository debt inventory

- **Category:** debt-summary
- **Evidence:** TODO/FIXME=31, suppressions=85, any-casts=393, legacy signals=65, hotspots=1736

---

_AQLIYA Engineering Excellence · technical-debt_
