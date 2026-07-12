# Code Health Report

**Agent:** code-health  
**Generated:** 2026-07-11T02:08:04.505Z  
**Score:** 32/100  
**Findings:** 290 (critical 0, high 116, medium 49, low 120, info 5)

> Engineering Excellence — findings only. OpenCode remains implementation authority. No automatic code changes.

## Summary

| Severity | Count |
| -------- | ----- |
| critical | 0 |
| high | 116 |
| medium | 49 |
| low | 120 |
| info | 5 |

## Scope

Analyzed 2848 source files under `src/`.

Companion reports: `duplication.md`, `complexity.md`.

## Signals Covered

- Duplicate code blocks
- Unused export / unused import heuristics
- Long functions
- God Objects (LOC / export count)
- Circular dependency heuristics
- Complexity & maintainability index
- SOLID SRP boundary smells (client/server)

## HIGH Findings

### F-0001 — Client module references server-only concerns

- **Category:** solid-srp
- **Files:** `src/components/sales/deal-conversion-memo-panel.tsx`
- **Evidence:** use client + prisma/fs/crypto server APIs
- **Suggestion:** Move data access to Server Actions / lib services.

### F-0002 — Client module references server-only concerns

- **Category:** solid-srp
- **Files:** `src/components/audit/trial-balance/trial-balance-upload.tsx`
- **Evidence:** use client + prisma/fs/crypto server APIs
- **Suggestion:** Move data access to Server Actions / lib services.

### F-0003 — Client module references server-only concerns

- **Category:** solid-srp
- **Files:** `src/components/audit/pilot/pilot-page.tsx`
- **Evidence:** use client + prisma/fs/crypto server APIs
- **Suggestion:** Move data access to Server Actions / lib services.

### F-0004 — Client module references server-only concerns

- **Category:** solid-srp
- **Files:** `src/components/audit/governance/GovernanceContextPanel.tsx`
- **Evidence:** use client + prisma/fs/crypto server APIs
- **Suggestion:** Move data access to Server Actions / lib services.

### F-0005 — Client module references server-only concerns

- **Category:** solid-srp
- **Files:** `src/components/audit/engagement/engagement-tabs.tsx`
- **Evidence:** use client + prisma/fs/crypto server APIs
- **Suggestion:** Move data access to Server Actions / lib services.

### F-0006 — Client module references server-only concerns

- **Category:** solid-srp
- **Files:** `src/app/sales/sales-dashboard-client.tsx`
- **Evidence:** use client + prisma/fs/crypto server APIs
- **Suggestion:** Move data access to Server Actions / lib services.

### F-0007 — Client module references server-only concerns

- **Category:** solid-srp
- **Files:** `src/app/local-content/settings/integrations/page.tsx`
- **Evidence:** use client + prisma/fs/crypto server APIs
- **Suggestion:** Move data access to Server Actions / lib services.

### F-0008 — Client module references server-only concerns

- **Category:** solid-srp
- **Files:** `src/app/(dashboard)/decisions/[id]/tender/page.tsx`
- **Evidence:** use client + prisma/fs/crypto server APIs
- **Suggestion:** Move data access to Server Actions / lib services.

### F-0009 — Client module references server-only concerns

- **Category:** solid-srp
- **Files:** `src/app/(dashboard)/decisions/[id]/outcome/page.tsx`
- **Evidence:** use client + prisma/fs/crypto server APIs
- **Suggestion:** Move data access to Server Actions / lib services.

### F-0010 — Large module / God Object signal: index.ts

- **Category:** god-object
- **Files:** `src/lib/audit/db/index.ts`
- **Evidence:** 3657 lines, 77 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0011 — Large module / God Object signal: mock-data.ts

- **Category:** god-object
- **Files:** `src/lib/audit/mock-data.ts`
- **Evidence:** 2456 lines, 25 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0012 — Large module / God Object signal: services.ts

- **Category:** god-object
- **Files:** `src/lib/audit/services.ts`
- **Evidence:** 1931 lines, 81 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0013 — Large module / God Object signal: audit-actions.ts

- **Category:** god-object
- **Files:** `src/actions/audit-actions.ts`
- **Evidence:** 1775 lines, 50 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0014 — Large module / God Object signal: decisions.ts

- **Category:** god-object
- **Files:** `src/actions/decisions.ts`
- **Evidence:** 1696 lines, 21 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0015 — Large module / God Object signal: seed-data.ts

- **Category:** god-object
- **Files:** `src/lib/sales/seed-data.ts`
- **Evidence:** 1695 lines, 2 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0016 — Large module / God Object signal: localcontent-actions.ts

- **Category:** god-object
- **Files:** `src/actions/localcontent-actions.ts`
- **Evidence:** 1449 lines, 38 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0017 — Large module / God Object signal: page.tsx

- **Category:** god-object
- **Files:** `src/app/(dashboard)/decisions/[id]/governance/page.tsx`
- **Evidence:** 1304 lines, 2 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0018 — Large module / God Object signal: page.tsx

- **Category:** god-object
- **Files:** `src/app/local-content/settings/integrations/page.tsx`
- **Evidence:** 1237 lines, 2 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0019 — Large module / God Object signal: evidence-page.tsx

- **Category:** god-object
- **Files:** `src/components/audit/evidence/evidence-page.tsx`
- **Evidence:** 1216 lines, 2 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0020 — Large module / God Object signal: store.ts

- **Category:** god-object
- **Files:** `src/lib/sales/store.ts`
- **Evidence:** 1162 lines, 71 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0021 — Large module / God Object signal: ai-advisor.ts

- **Category:** god-object
- **Files:** `src/lib/local-content/workbook/ai-advisor.ts`
- **Evidence:** 1162 lines, 15 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0022 — Large module / God Object signal: demo-data.ts

- **Category:** god-object
- **Files:** `src/app/auditos/demo-data.ts`
- **Evidence:** 1153 lines, 11 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0023 — Large module / God Object signal: findings-page.tsx

- **Category:** god-object
- **Files:** `src/components/audit/findings/findings-page.tsx`
- **Evidence:** 1148 lines, 2 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0024 — Large module / God Object signal: page.tsx

- **Category:** god-object
- **Files:** `src/app/sales/settings/crm/page.tsx`
- **Evidence:** 1138 lines, 2 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0038 — Long function buildSalesSeedData (1651 lines)

- **Category:** long-function
- **Files:** `src/lib/sales/seed-data.ts`
- **Evidence:** Lines 44–1694
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0039 — Long function buildStatementLinesFromMappings (718 lines)

- **Category:** long-function
- **Files:** `src/lib/audit/db/statement-builder.ts`
- **Evidence:** Lines 121–838
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0040 — Long function WorkbookDetailClient (708 lines)

- **Category:** long-function
- **Files:** `src/app/local-content/workbook/[workbookId]/workbook-detail-client.tsx`
- **Evidence:** Lines 89–796
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0041 — Long function ClientAcceptanceDashboard (662 lines)

- **Category:** long-function
- **Files:** `src/components/audit/acceptance/client-acceptance-dashboard.tsx`
- **Evidence:** Lines 78–739
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0042 — Long function PilotPageContent (654 lines)

- **Category:** long-function
- **Files:** `src/components/audit/pilot/pilot-page.tsx`
- **Evidence:** Lines 120–773
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0043 — Long function main (645 lines)

- **Category:** long-function
- **Files:** `src/__tests__/uat-run.ts`
- **Evidence:** Lines 47–691
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0044 — Long function ReviewNotesBoard (598 lines)

- **Category:** long-function
- **Files:** `src/components/audit/review-notes/review-notes-board.tsx`
- **Evidence:** Lines 57–654
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0045 — Long function ReviewCenter (561 lines)

- **Category:** long-function
- **Files:** `src/app/local-content/review-center/review-center-client.tsx`
- **Evidence:** Lines 68–628
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0046 — Long function QualityDashboardClient (519 lines)

- **Category:** long-function
- **Files:** `src/app/local-content/quality-dashboard/quality-dashboard-client.tsx`
- **Evidence:** Lines 110–628
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0047 — Long function IndependenceDashboard (491 lines)

- **Category:** long-function
- **Files:** `src/components/audit/independence/independence-dashboard.tsx`
- **Evidence:** Lines 56–546
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0048 — Long function MaterialityEnginePage (489 lines)

- **Category:** long-function
- **Files:** `src/components/audit/materiality/materiality-engine-page.tsx`
- **Evidence:** Lines 74–562
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0049 — Long function QualityDashboard (459 lines)

- **Category:** long-function
- **Files:** `src/components/audit/quality/quality-dashboard.tsx`
- **Evidence:** Lines 40–498
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0050 — Long function TrialBalanceUpload (434 lines)

- **Category:** long-function
- **Files:** `src/components/audit/trial-balance/trial-balance-upload.tsx`
- **Evidence:** Lines 391–824
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0051 — Long function buildKnowledgeGraphFromSnapshot (430 lines)

- **Category:** long-function
- **Files:** `src/lib/sales/v02/knowledge-graph/builder.ts`
- **Evidence:** Lines 99–528
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0052 — Long function CustomProductForm (419 lines)

- **Category:** long-function
- **Files:** `src/components/forms/custom-product-form.tsx`
- **Evidence:** Lines 344–762
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0053 — Long function DecisionDashboard (399 lines)

- **Category:** long-function
- **Files:** `src/components/decisions/decision-dashboard.tsx`
- **Evidence:** Lines 83–481
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0054 — Long function ExecutiveCommercialDashboard (380 lines)

- **Category:** long-function
- **Files:** `src/components/sales/executive-commercial-dashboard.tsx`
- **Evidence:** Lines 41–420
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0055 — Long function AiGovernanceClient (374 lines)

- **Category:** long-function
- **Files:** `src/app/settings/ai-governance/ai-governance-client.tsx`
- **Evidence:** Lines 95–468
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0056 — Long function OverviewTab (372 lines)

- **Category:** long-function
- **Files:** `src/components/audit/engagement/overview-tab.tsx`
- **Evidence:** Lines 71–442
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0057 — Long function AiInsightsPanel (369 lines)

- **Category:** long-function
- **Files:** `src/app/local-content/workbook/[workbookId]/ai-insights-panel.tsx`
- **Evidence:** Lines 82–450
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0058 — Long function WorkbookAiAdvisorClient (367 lines)

- **Category:** long-function
- **Files:** `src/app/local-content/projects/[projectId]/workbook/[workbookId]/ai-advisor/workbook-ai-advisor-client.tsx`
- **Evidence:** Lines 193–559
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0059 — Long function buildKnowledgeGraphFromSnapshot (359 lines)

- **Category:** long-function
- **Files:** `src/lib/sales/v02/knowledge-graph/build.ts`
- **Evidence:** Lines 148–506
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0060 — Long function runLocalContentPipeline (358 lines)

- **Category:** long-function
- **Files:** `src/lib/local-content/pipeline-orchestrator.ts`
- **Evidence:** Lines 82–439
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0061 — Long function ModelGovernanceClient (346 lines)

- **Category:** long-function
- **Files:** `src/app/settings/models/model-governance-client.tsx`
- **Evidence:** Lines 52–397
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0062 — Long function TbImportDialog (341 lines)

- **Category:** long-function
- **Files:** `src/app/local-content/workbook/[workbookId]/tb-import-dialog.tsx`
- **Evidence:** Lines 30–370
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0063 — Long function ConnectionDetailPanel (330 lines)

- **Category:** long-function
- **Files:** `src/app/local-content/settings/integrations/page.tsx`
- **Evidence:** Lines 571–900
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0064 — Long function CandidateDetailClient (325 lines)

- **Category:** long-function
- **Files:** `src/components/knowledge-review/candidate-detail.tsx`
- **Evidence:** Lines 83–407
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0065 — Long function VersionDetailClient (313 lines)

- **Category:** long-function
- **Files:** `src/components/knowledge-foundation/version-detail-client.tsx`
- **Evidence:** Lines 68–380
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0066 — Long function ContactForm (309 lines)

- **Category:** long-function
- **Files:** `src/app/(marketing)/contact/contact-form.tsx`
- **Evidence:** Lines 28–336
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0067 — Long function runValidation (308 lines)

- **Category:** long-function
- **Files:** `src/lib/audit/db/index.ts`
- **Evidence:** Lines 1230–1537
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0068 — Long function ContentEvidenceSection (297 lines)

- **Category:** long-function
- **Files:** `src/app/content-studio/[workspaceId]/[contentId]/content-evidence-section.tsx`
- **Evidence:** Lines 60–356
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0069 — Long function getDecisionExportData (296 lines)

- **Category:** long-function
- **Files:** `src/actions/decision-export.ts`
- **Evidence:** Lines 93–388
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0070 — Long function CommandCenterView (294 lines)

- **Category:** long-function
- **Files:** `src/components/sales/command-center-view.tsx`
- **Evidence:** Lines 89–382
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0071 — Long function WorkflowAdminDashboard (293 lines)

- **Category:** long-function
- **Files:** `src/components/workflowos/workflow-admin-dashboard.tsx`
- **Evidence:** Lines 126–418
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0072 — Long function ExportApprovalDialog (289 lines)

- **Category:** long-function
- **Files:** `src/components/contacts/export-approval-dialog.tsx`
- **Evidence:** Lines 35–323
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0073 — Long function runSimulationAndRecommendation (279 lines)

- **Category:** long-function
- **Files:** `src/actions/simulation.ts`
- **Evidence:** Lines 12–290
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0074 — Long function evaluateIfrsRule (278 lines)

- **Category:** long-function
- **Files:** `src/lib/audit/rules/ifrs-rule-checks.ts`
- **Evidence:** Lines 77–354
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0075 — Long function getDashboardMetrics (274 lines)

- **Category:** long-function
- **Files:** `src/actions/decisions.ts`
- **Evidence:** Lines 1157–1430
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0076 — Long function AccountIntelligenceProfile (272 lines)

- **Category:** long-function
- **Files:** `src/components/sales/account-intelligence-profile.tsx`
- **Evidence:** Lines 42–313
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0077 — Long function buildKnowledgeFoundationPDF (271 lines)

- **Category:** long-function
- **Files:** `src/lib/knowledge-foundation/kf-export.ts`
- **Evidence:** Lines 53–323
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0079 — Elevated complexity in index.ts

- **Category:** complexity
- **Files:** `src/lib/audit/db/index.ts`
- **Evidence:** Decision density ≈ 214, MI=0
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0080 — Elevated complexity in ai-advisor.ts

- **Category:** complexity
- **Files:** `src/lib/local-content/workbook/ai-advisor.ts`
- **Evidence:** Decision density ≈ 139, MI=0
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0081 — Elevated complexity in prisma-client-mock.js

- **Category:** complexity
- **Files:** `src/__mocks__/prisma-client-mock.js`
- **Evidence:** Decision density ≈ 126, MI=0
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0082 — Elevated complexity in decisions.ts

- **Category:** complexity
- **Files:** `src/actions/decisions.ts`
- **Evidence:** Decision density ≈ 120, MI=0
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0083 — Elevated complexity in skill-registry.integration.test.ts

- **Category:** complexity
- **Files:** `src/lib/skill-runtime/__tests__/skill-registry.integration.test.ts`
- **Evidence:** Decision density ≈ 114, MI=0
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0084 — Elevated complexity in services.ts

- **Category:** complexity
- **Files:** `src/lib/audit/services.ts`
- **Evidence:** Decision density ≈ 109, MI=0
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0085 — Elevated complexity in runtime.ts

- **Category:** complexity
- **Files:** `src/lib/skill-runtime/runtime.ts`
- **Evidence:** Decision density ≈ 104, MI=0
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0086 — Elevated complexity in evaluator.ts

- **Category:** complexity
- **Files:** `src/lib/skill-runtime/evaluator.ts`
- **Evidence:** Decision density ≈ 97, MI=0
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0087 — Elevated complexity in population.ts

- **Category:** complexity
- **Files:** `src/lib/local-content/workbook/population.ts`
- **Evidence:** Decision density ≈ 90, MI=0
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0088 — Elevated complexity in trial-balance-upload.tsx

- **Category:** complexity
- **Files:** `src/components/audit/trial-balance/trial-balance-upload.tsx`
- **Evidence:** Decision density ≈ 86, MI=0
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0089 — Elevated complexity in page.tsx

- **Category:** complexity
- **Files:** `src/app/(dashboard)/decisions/[id]/governance/page.tsx`
- **Evidence:** Decision density ≈ 86, MI=0
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0090 — Elevated complexity in workflowos-actions.ts

- **Category:** complexity
- **Files:** `src/actions/workflowos-actions.ts`
- **Evidence:** Decision density ≈ 80, MI=0
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0119 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/__mocks__/prisma-client-mock.js`
- **Evidence:** MI=0 (warn < 45)

### F-0120 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/lib/skill-runtime/evaluator.ts`
- **Evidence:** MI=0 (warn < 45)

### F-0121 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/lib/skill-runtime/runtime.ts`
- **Evidence:** MI=0 (warn < 45)

### F-0122 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/lib/skill-runtime/__tests__/skill-registry.integration.test.ts`
- **Evidence:** MI=0 (warn < 45)

### F-0123 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/lib/sales/seed-data.ts`
- **Evidence:** MI=0 (warn < 45)

### F-0124 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/lib/sales/store.ts`
- **Evidence:** MI=0 (warn < 45)

### F-0125 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/lib/platform/content-studio/__tests__/content-studio.test.ts`
- **Evidence:** MI=0 (warn < 45)

### F-0126 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/lib/local-content/workbook/ai-advisor.ts`
- **Evidence:** MI=0 (warn < 45)

### F-0127 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/lib/local-content/workbook/population.ts`
- **Evidence:** MI=0 (warn < 45)

### F-0128 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/lib/audit/mock-data.ts`
- **Evidence:** MI=0 (warn < 45)

### F-0129 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/lib/audit/services.ts`
- **Evidence:** MI=0 (warn < 45)

### F-0130 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/lib/audit/db/index.ts`
- **Evidence:** MI=0 (warn < 45)

### F-0131 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/components/audit/trial-balance/trial-balance-upload.tsx`
- **Evidence:** MI=0 (warn < 45)

### F-0132 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/components/audit/findings/findings-page.tsx`
- **Evidence:** MI=0 (warn < 45)

### F-0133 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/components/audit/evidence/evidence-page.tsx`
- **Evidence:** MI=0 (warn < 45)

### F-0134 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/app/sales/settings/crm/page.tsx`
- **Evidence:** MI=0 (warn < 45)

### F-0135 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/app/local-content/settings/integrations/page.tsx`
- **Evidence:** MI=0 (warn < 45)

### F-0136 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/app/(dashboard)/decisions/[id]/governance/page.tsx`
- **Evidence:** MI=0 (warn < 45)

### F-0137 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/actions/approval.ts`
- **Evidence:** MI=0 (warn < 45)

### F-0138 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/actions/audit-actions.ts`
- **Evidence:** MI=0 (warn < 45)

### F-0139 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/actions/decisions.ts`
- **Evidence:** MI=0 (warn < 45)

### F-0140 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/actions/localcontent-actions.ts`
- **Evidence:** MI=0 (warn < 45)

### F-0141 — Low maintainability index (0)

- **Category:** maintainability
- **Files:** `src/actions/workflowos-actions.ts`
- **Evidence:** MI=0 (warn < 45)

### F-0142 — Low maintainability index (1)

- **Category:** maintainability
- **Files:** `src/lib/platform/sales-intelligence/sales-intel-service.ts`
- **Evidence:** MI=1 (warn < 45)

### F-0143 — Low maintainability index (1)

- **Category:** maintainability
- **Files:** `src/lib/platform/audit-bridge/audit-bridge-service.ts`
- **Evidence:** MI=1 (warn < 45)

### F-0144 — Low maintainability index (1)

- **Category:** maintainability
- **Files:** `src/lib/audit/db/statement-builder.ts`
- **Evidence:** MI=1 (warn < 45)

### F-0145 — Low maintainability index (2)

- **Category:** maintainability
- **Files:** `src/lib/sales/prisma-repository.ts`
- **Evidence:** MI=2 (warn < 45)

### F-0146 — Low maintainability index (2)

- **Category:** maintainability
- **Files:** `src/lib/local-content/services.ts`
- **Evidence:** MI=2 (warn < 45)

### F-0147 — Low maintainability index (2)

- **Category:** maintainability
- **Files:** `src/lib/local-content/content/prisma-repository.ts`
- **Evidence:** MI=2 (warn < 45)

### F-0148 — Low maintainability index (2)

- **Category:** maintainability
- **Files:** `src/lib/core/memory/institutional-memory-service.ts`
- **Evidence:** MI=2 (warn < 45)

### F-0149 — Low maintainability index (3)

- **Category:** maintainability
- **Files:** `src/lib/platform/org-advanced/__tests__/org-adv.test.ts`
- **Evidence:** MI=3 (warn < 45)

### F-0150 — Low maintainability index (3)

- **Category:** maintainability
- **Files:** `src/lib/platform/audit-bridge/__tests__/audit-bridge.test.ts`
- **Evidence:** MI=3 (warn < 45)

### F-0151 — Low maintainability index (3)

- **Category:** maintainability
- **Files:** `src/lib/governance-engine/generators/dossier-generator.ts`
- **Evidence:** MI=3 (warn < 45)

### F-0152 — Low maintainability index (3)

- **Category:** maintainability
- **Files:** `src/lib/audit/db/income-statement-presentation.ts`
- **Evidence:** MI=3 (warn < 45)

### F-0153 — Low maintainability index (4)

- **Category:** maintainability
- **Files:** `src/lib/platform/audit-risk/__tests__/audit-risk.test.ts`
- **Evidence:** MI=4 (warn < 45)

### F-0154 — Low maintainability index (4)

- **Category:** maintainability
- **Files:** `src/lib/platform/abac/__tests__/abac.test.ts`
- **Evidence:** MI=4 (warn < 45)

### F-0155 — Low maintainability index (4)

- **Category:** maintainability
- **Files:** `src/lib/integration/secret-resolver.ts`
- **Evidence:** MI=4 (warn < 45)

### F-0156 — Low maintainability index (4)

- **Category:** maintainability
- **Files:** `src/app/auditos/demo-data.ts`
- **Evidence:** MI=4 (warn < 45)

### F-0157 — Low maintainability index (4)

- **Category:** maintainability
- **Files:** `src/actions/__tests__/workflow-actions.test.ts`
- **Evidence:** MI=4 (warn < 45)

### F-0158 — Low maintainability index (5)

- **Category:** maintainability
- **Files:** `src/lib/sales/services/executive-commercial-dashboard-service.ts`
- **Evidence:** MI=5 (warn < 45)

## MEDIUM Findings

### F-0025 — Large module / God Object signal: services.ts

- **Category:** god-object
- **Files:** `src/lib/local-content/services.ts`
- **Evidence:** 961 lines, 32 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0026 — Large module / God Object signal: sales-actions.ts

- **Category:** god-object
- **Files:** `src/actions/sales-actions.ts`
- **Evidence:** 917 lines, 51 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0027 — Large module / God Object signal: prisma-repository.ts

- **Category:** god-object
- **Files:** `src/lib/sales/prisma-repository.ts`
- **Evidence:** 897 lines, 39 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0028 — Large module / God Object signal: workflowos-actions.ts

- **Category:** god-object
- **Files:** `src/actions/workflowos-actions.ts`
- **Evidence:** 824 lines, 36 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0029 — Large module / God Object signal: content-studio-service.ts

- **Category:** god-object
- **Files:** `src/lib/platform/content-studio/content-studio-service.ts`
- **Evidence:** 763 lines, 33 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0030 — Large module / God Object signal: income-statement-presentation.ts

- **Category:** god-object
- **Files:** `src/lib/audit/db/income-statement-presentation.ts`
- **Evidence:** 670 lines, 39 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0031 — Large module / God Object signal: evidence-adapter.ts

- **Category:** god-object
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** 581 lines, 38 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0032 — Large module / God Object signal: types.ts

- **Category:** god-object
- **Files:** `src/lib/sales/types.ts`
- **Evidence:** 573 lines, 55 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0033 — Large module / God Object signal: index.ts

- **Category:** god-object
- **Files:** `src/types/audit/index.ts`
- **Evidence:** 473 lines, 49 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0034 — Large module / God Object signal: audit-read-actions.ts

- **Category:** god-object
- **Files:** `src/actions/audit-read-actions.ts`
- **Evidence:** 426 lines, 30 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0035 — Large module / God Object signal: index.ts

- **Category:** god-object
- **Files:** `src/lib/sales/v02/knowledge-graph/index.ts`
- **Evidence:** 379 lines, 33 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0036 — Large module / God Object signal: types.ts

- **Category:** god-object
- **Files:** `src/lib/integration/types.ts`
- **Evidence:** 378 lines, 47 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0037 — Large module / God Object signal: primitives.ts

- **Category:** god-object
- **Files:** `src/lib/local-content/schemas/common/primitives.ts`
- **Evidence:** 83 lines, 37 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0091 — Elevated complexity in approval.ts

- **Category:** complexity
- **Files:** `src/actions/approval.ts`
- **Evidence:** Decision density ≈ 72, MI=0
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0092 — Elevated complexity in sales-intel-service.ts

- **Category:** complexity
- **Files:** `src/lib/platform/sales-intelligence/sales-intel-service.ts`
- **Evidence:** Decision density ≈ 67, MI=1
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0093 — Elevated complexity in audit-bridge-service.ts

- **Category:** complexity
- **Files:** `src/lib/platform/audit-bridge/audit-bridge-service.ts`
- **Evidence:** Decision density ≈ 67, MI=1
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0094 — Elevated complexity in recommendation-engine.ts

- **Category:** complexity
- **Files:** `src/lib/recommendation/recommendation-engine.ts`
- **Evidence:** Decision density ≈ 64, MI=12
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0095 — Elevated complexity in dossier-generator.ts

- **Category:** complexity
- **Files:** `src/lib/governance-engine/generators/dossier-generator.ts`
- **Evidence:** Decision density ≈ 64, MI=3
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0096 — Elevated complexity in income-statement-presentation.ts

- **Category:** complexity
- **Files:** `src/lib/audit/db/income-statement-presentation.ts`
- **Evidence:** Decision density ≈ 63, MI=3
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0097 — Elevated complexity in statement-builder.ts

- **Category:** complexity
- **Files:** `src/lib/audit/db/statement-builder.ts`
- **Evidence:** Decision density ≈ 57, MI=1
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0098 — Elevated complexity in audit-actions.ts

- **Category:** complexity
- **Files:** `src/actions/audit-actions.ts`
- **Evidence:** Decision density ≈ 56, MI=0
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0099 — Elevated complexity in secret-resolver.ts

- **Category:** complexity
- **Files:** `src/lib/integration/secret-resolver.ts`
- **Evidence:** Decision density ≈ 55, MI=4
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0100 — Elevated complexity in localcontent-actions.ts

- **Category:** complexity
- **Files:** `src/actions/localcontent-actions.ts`
- **Evidence:** Decision density ≈ 54, MI=0
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0101 — Elevated complexity in builder.ts

- **Category:** complexity
- **Files:** `src/lib/sales/v02/knowledge-graph/builder.ts`
- **Evidence:** Decision density ≈ 52, MI=7
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0102 — Elevated complexity in build.ts

- **Category:** complexity
- **Files:** `src/lib/sales/v02/knowledge-graph/build.ts`
- **Evidence:** Decision density ≈ 51, MI=8
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0103 — Elevated complexity in content-studio.test.ts

- **Category:** complexity
- **Files:** `src/lib/platform/content-studio/__tests__/content-studio.test.ts`
- **Evidence:** Decision density ≈ 51, MI=0
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0104 — Elevated complexity in no-english-strings.test.ts

- **Category:** complexity
- **Files:** `src/__tests__/i18n/no-english-strings.test.ts`
- **Evidence:** Decision density ≈ 50, MI=9
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0105 — Elevated complexity in audit-risk-engine.ts

- **Category:** complexity
- **Files:** `src/lib/platform/audit-risk/audit-risk-engine.ts`
- **Evidence:** Decision density ≈ 50, MI=5
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0106 — Elevated complexity in org-adv-service.ts

- **Category:** complexity
- **Files:** `src/lib/platform/org-advanced/org-adv-service.ts`
- **Evidence:** Decision density ≈ 49, MI=8
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0107 — Elevated complexity in deterministic-generators.ts

- **Category:** complexity
- **Files:** `src/lib/office-ai/deterministic-generators.ts`
- **Evidence:** Decision density ≈ 48, MI=13
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0108 — Elevated complexity in institutional-memory-service.ts

- **Category:** complexity
- **Files:** `src/lib/core/memory/institutional-memory-service.ts`
- **Evidence:** Decision density ≈ 48, MI=2
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0109 — Elevated complexity in cross-product-ai-service.ts

- **Category:** complexity
- **Files:** `src/lib/platform/cross-product-ai/cross-product-ai-service.ts`
- **Evidence:** Decision density ≈ 47, MI=6
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0110 — Elevated complexity in store.ts

- **Category:** complexity
- **Files:** `src/lib/sales/store.ts`
- **Evidence:** Decision density ≈ 46, MI=0
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0111 — Elevated complexity in commercial-memory.ts

- **Category:** complexity
- **Files:** `src/lib/sales/vnext/commercial-memory.ts`
- **Evidence:** Decision density ≈ 46, MI=8
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0112 — Elevated complexity in executive-commercial-dashboard-service.ts

- **Category:** complexity
- **Files:** `src/lib/sales/services/executive-commercial-dashboard-service.ts`
- **Evidence:** Decision density ≈ 46, MI=5
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0113 — Elevated complexity in office-ai-task-service.ts

- **Category:** complexity
- **Files:** `src/lib/office-ai/office-ai-task-service.ts`
- **Evidence:** Decision density ≈ 46, MI=5
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0114 — Elevated complexity in factory-registry.ts

- **Category:** complexity
- **Files:** `src/lib/integration/factory-registry.ts`
- **Evidence:** Decision density ≈ 46, MI=18
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0115 — Elevated complexity in audit-adapter.ts

- **Category:** complexity
- **Files:** `src/products/sales/core-adapters/audit-adapter.ts`
- **Evidence:** Decision density ≈ 45, MI=15
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0116 — Elevated complexity in model-governance.test.ts

- **Category:** complexity
- **Files:** `src/lib/platform/model-governance/__tests__/model-governance.test.ts`
- **Evidence:** Decision density ≈ 45, MI=11
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0117 — Elevated complexity in audit-bridge.test.ts

- **Category:** complexity
- **Files:** `src/lib/platform/audit-bridge/__tests__/audit-bridge.test.ts`
- **Evidence:** Decision density ≈ 45, MI=3
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0118 — Elevated complexity in claim-registry.ts

- **Category:** complexity
- **Files:** `src/lib/governance-engine/registry/claim-registry.ts`
- **Evidence:** Decision density ≈ 45, MI=12
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0283 — Possible circular dependency

- **Category:** circular-dependency
- **Files:** `src/lib/platform/audit-log.ts`, `src/lib/core/contracts/event-envelope.ts`
- **Evidence:** src/lib/platform/audit-log.ts ↔ src/lib/core/contracts/event-envelope.ts
- **Suggestion:** Introduce a lower-level shared module or invert dependency.

### F-0284 — Possible circular dependency

- **Category:** circular-dependency
- **Files:** `src/lib/authorization/action-guard.ts`, `src/lib/authorization/authorize.ts`
- **Evidence:** src/lib/authorization/action-guard.ts ↔ src/lib/authorization/authorize.ts
- **Suggestion:** Introduce a lower-level shared module or invert dependency.

### F-0285 — Possible circular dependency

- **Category:** circular-dependency
- **Files:** `src/lib/authorization/action-guard.ts`, `src/lib/authorization/index.ts`
- **Evidence:** src/lib/authorization/action-guard.ts ↔ src/lib/authorization/index.ts
- **Suggestion:** Introduce a lower-level shared module or invert dependency.

### F-0286 — Possible circular dependency

- **Category:** circular-dependency
- **Files:** `src/lib/authorization/action-guard.ts`, `src/lib/authorization/types.ts`
- **Evidence:** src/lib/authorization/action-guard.ts ↔ src/lib/authorization/types.ts
- **Suggestion:** Introduce a lower-level shared module or invert dependency.

### F-0287 — Possible circular dependency

- **Category:** circular-dependency
- **Files:** `src/lib/authorization/authorize.ts`, `src/lib/authorization/index.ts`
- **Evidence:** src/lib/authorization/authorize.ts ↔ src/lib/authorization/index.ts
- **Suggestion:** Introduce a lower-level shared module or invert dependency.

### F-0288 — Possible circular dependency

- **Category:** circular-dependency
- **Files:** `src/lib/authorization/authorize.ts`, `src/lib/authorization/types.ts`
- **Evidence:** src/lib/authorization/authorize.ts ↔ src/lib/authorization/types.ts
- **Suggestion:** Introduce a lower-level shared module or invert dependency.

### F-0289 — Possible circular dependency

- **Category:** circular-dependency
- **Files:** `src/lib/authorization/index.ts`, `src/lib/authorization/types.ts`
- **Evidence:** src/lib/authorization/index.ts ↔ src/lib/authorization/types.ts
- **Suggestion:** Introduce a lower-level shared module or invert dependency.

### F-0290 — Possible circular dependency

- **Category:** circular-dependency
- **Files:** `src/lib/audit/rules/__tests__/ifrs-rules.test.ts`, `src/lib/audit/rules/__tests__/socpa-rules.test.ts`
- **Evidence:** src/lib/audit/rules/__tests__/ifrs-rules.test.ts ↔ src/lib/audit/rules/__tests__/socpa-rules.test.ts
- **Suggestion:** Introduce a lower-level shared module or invert dependency.

## LOW Findings

### F-0160 — Possibly unused export: onRequestError

- **Category:** unused-export
- **Files:** `src/instrumentation.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0161 — Possibly unused export: timingMiddleware

- **Category:** unused-export
- **Files:** `src/middleware-timing.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0162 — Possibly unused export: RecommendationStatus

- **Category:** unused-export
- **Files:** `src/types/audit/index.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0163 — Possibly unused export: ApprovalStatus

- **Category:** unused-export
- **Files:** `src/types/audit/index.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0164 — Possibly unused export: PublicationStatus

- **Category:** unused-export
- **Files:** `src/types/audit/index.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0165 — Possibly unused export: AiOutputStatus

- **Category:** unused-export
- **Files:** `src/types/audit/index.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0166 — Possibly unused export: LinkType

- **Category:** unused-export
- **Files:** `src/types/audit/index.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0167 — Possibly unused export: EngagementType

- **Category:** unused-export
- **Files:** `src/types/audit/index.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0168 — Possibly unused export: ValidationCheckType

- **Category:** unused-export
- **Files:** `src/types/audit/index.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0169 — Possibly unused export: ValidationStatus

- **Category:** unused-export
- **Files:** `src/types/audit/index.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0170 — Possibly unused export: FinancialPeriod

- **Category:** unused-export
- **Files:** `src/types/audit/index.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0171 — Possibly unused export: SALESOS_PRODUCT_DEFINITION

- **Category:** unused-export
- **Files:** `src/products/sales/product-definition.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0172 — Possibly unused export: SALESOS_MANIFEST

- **Category:** unused-export
- **Files:** `src/products/sales/product-definition.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0173 — Possibly unused export: SALES_CORE_AUDIT_PREFIXES

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/audit-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0174 — Possibly unused export: mapSalesToContractCategory

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/audit-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0175 — Possibly unused export: getAuditLedger

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/audit-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0176 — Possibly unused export: recordSalesMutationAudit

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/audit-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0177 — Possibly unused export: EvidenceBackedRecommendationCheck

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0178 — Possibly unused export: getSalesEvidenceStore

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0179 — Possibly unused export: resetSalesEvidenceStoreForTests

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0180 — Possibly unused export: linkProofAssetToCore

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0181 — Possibly unused export: mapProofAssetToCoreRef

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0182 — Possibly unused export: buildProofEvidenceLinkageMap

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0183 — Possibly unused export: traceProofUsage

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0184 — Possibly unused export: checkEvidenceBackedRecommendation

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0185 — Possibly unused export: syncSalesEvidenceRefToCore

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0186 — Possibly unused export: linkSalesProofToCore

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0187 — Possibly unused export: syncAllSalesProofAssetsToCore

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0188 — Possibly unused export: collectSalesEvidenceAlerts

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0189 — Possibly unused export: collectSalesProofEvidenceAlertSignals

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0190 — Possibly unused export: bridgeProofAssetsToEvidenceRefs

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0191 — Possibly unused export: proofAssetToEvidenceRef

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0192 — Possibly unused export: detectMissingCommercialEvidence

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0193 — Possibly unused export: detectObjectionsWithoutProof

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0194 — Possibly unused export: detectStaleProofAssets

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0195 — Possibly unused export: evaluateSalesEvidenceCoverage

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0196 — Possibly unused export: SalesProofEvidenceBridge

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0197 — Possibly unused export: SalesProofUsageTrace

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0198 — Possibly unused export: SalesEvidenceAlert

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0199 — Possibly unused export: SalesEvidenceAlertKind

- **Category:** unused-export
- **Files:** `src/products/sales/core-adapters/evidence-adapter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0201 — Possibly unused import: getSecretCacheSize

- **Category:** unused-import
- **Files:** `src/__tests__/unit/secret-resolver-concurrency.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0202 — Possibly unused import: secretResolver

- **Category:** unused-import
- **Files:** `src/__tests__/unit/secret-resolver-rotation.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0203 — Possibly unused import: getSecretCacheSize

- **Category:** unused-import
- **Files:** `src/__tests__/unit/secret-resolver-rotation.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0204 — Possibly unused import: renderHook

- **Category:** unused-import
- **Files:** `src/__tests__/unit/smoke.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0205 — Possibly unused import: act

- **Category:** unused-import
- **Files:** `src/__tests__/unit/smoke.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0206 — Possibly unused import: getDecisionRecommendation

- **Category:** unused-import
- **Files:** `src/__tests__/integration/recommendation-publication.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0207 — Possibly unused import: getWorkflowExportStatus

- **Category:** unused-import
- **Files:** `src/__tests__/integration/workflowos-export.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0208 — Possibly unused import: notifyExportRequested

- **Category:** unused-import
- **Files:** `src/__tests__/integration/workflowos-export.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0209 — Possibly unused import: MEMORY_TRUST_MIN_REVIEWERS

- **Category:** unused-import
- **Files:** `src/lib/tb-intelligence/__tests__/firm-memory-governance.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0210 — Possibly unused import: mkdirSync

- **Category:** unused-import
- **Files:** `src/lib/skill-runtime/__tests__/skill-evaluator.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0211 — Possibly unused import: writeFileSync

- **Category:** unused-import
- **Files:** `src/lib/skill-runtime/__tests__/skill-evaluator.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0212 — Possibly unused import: rmSync

- **Category:** unused-import
- **Files:** `src/lib/skill-runtime/__tests__/skill-evaluator.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0213 — Possibly unused import: evaluateGuardPipeline

- **Category:** unused-import
- **Files:** `src/lib/salesos/workflow/__tests__/orchestrator.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0214 — Possibly unused import: toDealDetailViewModel

- **Category:** unused-import
- **Files:** `src/lib/salesos/viewmodel/__tests__/deal-viewmodel.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0215 — Possibly unused import: getNodesByKind

- **Category:** unused-import
- **Files:** `src/lib/sales/__tests__/knowledge-graph.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0216 — Possibly unused import: getOutgoingEdges

- **Category:** unused-import
- **Files:** `src/lib/sales/__tests__/knowledge-graph.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0217 — Possibly unused import: industryRefId

- **Category:** unused-import
- **Files:** `src/lib/sales/__tests__/knowledge-graph.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0218 — Possibly unused import: beforeEach

- **Category:** unused-import
- **Files:** `src/lib/sales/__tests__/next-action-engine.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0219 — Possibly unused import: listCrossProductProofCandidates

- **Category:** unused-import
- **Files:** `src/lib/sales/vnext/proof-network-overview.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0220 — Possibly unused import: STRATEGIC_RULE_IDS

- **Category:** unused-import
- **Files:** `src/lib/sales/vnext/__tests__/commercial-recommendations.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0221 — Possibly unused import: INSTITUTIONAL_LEARNING_LABEL

- **Category:** unused-import
- **Files:** `src/lib/sales/vnext/__tests__/institutional-learning.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0222 — Possibly unused import: listObjections

- **Category:** unused-import
- **Files:** `src/lib/sales/v02/__tests__/proof-effectiveness.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0223 — Possibly unused import: //   collectCrossProductCommercialSignals

- **Category:** unused-import
- **Files:** `src/lib/sales/v02/cross-product-signals/aggregator.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0224 — Possibly unused import: //   deriveInstitutionalCommercialSignals

- **Category:** unused-import
- **Files:** `src/lib/sales/v02/cross-product-signals/aggregator.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0225 — Possibly unused import: //   collectCrossProductRuntimeInputs

- **Category:** unused-import
- **Files:** `src/lib/sales/v02/cross-product-signals/aggregator.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0226 — Possibly unused import: //

- **Category:** unused-import
- **Files:** `src/lib/sales/v02/cross-product-signals/aggregator.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0227 — Possibly unused import: CrmAuthError

- **Category:** unused-import
- **Files:** `src/lib/sales/crm/__tests__/connector.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0228 — Possibly unused import: CrmRateLimitError

- **Category:** unused-import
- **Files:** `src/lib/sales/crm/__tests__/connector.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0229 — Possibly unused import: PLATFORM_AUDIT_OUTBOX_EVENT

- **Category:** unused-import
- **Files:** `src/lib/platform/audit-log.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0230 — Possibly unused import: LocalStorageProvider

- **Category:** unused-import
- **Files:** `src/lib/platform/storage/storage-factory.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0231 — Possibly unused import: getLocalStoreBaseDir

- **Category:** unused-import
- **Files:** `src/lib/platform/storage/storage-factory.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0232 — Possibly unused import: join

- **Category:** unused-import
- **Files:** `src/lib/platform/siem/delivery.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0233 — Possibly unused import: LIFECYCLE_EVENT_TYPES

- **Category:** unused-import
- **Files:** `src/lib/platform/org-advanced/org-adv-service.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0234 — Possibly unused import: getRedisUrl

- **Category:** unused-import
- **Files:** `src/lib/platform/operations/queue-runtime.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0235 — Possibly unused import: afterAll

- **Category:** unused-import
- **Files:** `src/lib/platform/office-ai-adv/__tests__/office-ai-adv.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0236 — Possibly unused import: ADV_STRINGS

- **Category:** unused-import
- **Files:** `src/lib/platform/office-ai-adv/__tests__/office-ai-adv.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0237 — Possibly unused import: registerHandler

- **Category:** unused-import
- **Files:** `src/lib/platform/email/__tests__/sender.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0238 — Possibly unused import: computeHash

- **Category:** unused-import
- **Files:** `src/lib/platform/audit/audit-store.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0239 — Possibly unused import: prisma

- **Category:** unused-import
- **Files:** `src/lib/platform/audit/__tests__/unified-query.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0240 — Possibly unused import: classifySupplier

- **Category:** unused-import
- **Files:** `src/lib/local-content/__tests__/services.test.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0242 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/middleware.ts`, `src/__tests__/cross-tenant-isolation.test.ts`
- **Evidence:** Shared across 2 files: "/audit",…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0243 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/lcos-state-machine.test.ts`, `src/lib/local-content/types.ts`
- **Evidence:** Shared across 2 files: "Draft",…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0244 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/lcos-state-machine.test.ts`, `src/lib/local-content/types.ts`
- **Evidence:** Shared across 2 files: "DataCollection",…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0245 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/secret-resolver-concurrency.test.ts`, `src/__tests__/unit/secret-resolver-rotation.test.ts`
- **Evidence:** Shared across 2 files: incrementCounter("SECRET_USED", {…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0246 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/secret-resolver-concurrency.test.ts`, `src/__tests__/unit/secret-resolver-rotation.test.ts`
- **Evidence:** Shared across 2 files: organizationId: orgId,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0247 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/secret-resolver-concurrency.test.ts`, `src/__tests__/unit/secret-resolver-rotation.test.ts`
- **Evidence:** Shared across 2 files: purpose: SecretPurpose.CRM_SYNC,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0248 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/workflow-gating.test.ts`, `src/__tests__/unit/audit/workflow-next-action.test.ts`
- **Evidence:** Shared across 2 files: hasTrialBalance: false,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0249 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/workflow-gating.test.ts`, `src/__tests__/unit/audit/workflow-next-action.test.ts`
- **Evidence:** Shared across 2 files: hasMappings: false,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0250 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/workflow-gating.test.ts`, `src/__tests__/unit/audit/workflow-next-action.test.ts`
- **Evidence:** Shared across 2 files: hasConfirmedMappings: false,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0251 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/workflow-gating.test.ts`, `src/__tests__/unit/audit/workflow-next-action.test.ts`
- **Evidence:** Shared across 2 files: hasFinancialStatements: false,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0252 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-diff-engine.test.ts`, `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 3 files: jest.mock("@/lib/prisma", () => {…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0253 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/phase-27-hotfix-regression.test.ts`
- **Evidence:** Shared across 2 files: jest.mock("@/lib/auth", () => ({…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0254 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/phase-27-hotfix-regression.test.ts`
- **Evidence:** Shared across 2 files: getCurrentUser: mockGetCurrentUser,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0255 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/phase-27-hotfix-regression.test.ts`
- **Evidence:** Shared across 2 files: }));…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0256 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/phase-27-hotfix-regression.test.ts`
- **Evidence:** Shared across 2 files: jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0257 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/phase-27-hotfix-regression.test.ts`
- **Evidence:** Shared across 2 files: jest.mock("@/lib/knowledge-foundation/events", () => ({…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0258 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/phase-27-hotfix-regression.test.ts`
- **Evidence:** Shared across 2 files: emitFoundationEvent: jest.fn().mockResolvedValue(undefined),…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0259 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/phase-27-hotfix-regression.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 3 files: onFoundationEvent: jest.fn().mockReturnValue(() => {}),…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0260 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/phase-27-hotfix-regression.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 3 files: onAnyFoundationEvent: jest.fn().mockReturnValue(() => {}),…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0261 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/phase-27-hotfix-regression.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 3 files: clearFoundationHandlers: jest.fn(),…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0262 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/phase-27-hotfix-regression.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 3 files: }));…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0263 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/phase-27-hotfix-regression.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 3 files: jest.mock("@/lib/knowledge-foundation/release-integrity", () => ({…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0264 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/phase-27-hotfix-regression.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 3 files: verifyReleaseIntegrity: jest.fn().mockResolvedValue({…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0265 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/phase-27-hotfix-regression.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 3 files: valid: true,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0266 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/phase-27-hotfix-regression.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 3 files: blockers: [],…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0267 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/phase-27-hotfix-regression.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 3 files: hashMatch: true,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0268 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/phase-27-hotfix-regression.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 3 files: chainValid: true,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0269 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/phase-27-hotfix-regression.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 3 files: artifactFound: true,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0270 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 2 files: manifestFound: true,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0271 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 2 files: provenanceFound: true,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0272 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 2 files: releaseRowValid: true,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0273 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 2 files: releaseId: "kfr-mock",…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0274 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 2 files: previousReleaseId: null,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0275 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 2 files: previousReleaseHash: null,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0276 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 2 files: }),…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0277 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 2 files: }));…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0278 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 2 files: jest.mock("@/lib/knowledge-foundation/audit-handler", () => ({…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0279 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 2 files: registerFoundationAuditHandler: jest.fn(),…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0280 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 2 files: }));…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0281 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/__tests__/unit/knowledge-foundation/knowledge-foundation-release.test.ts`, `src/__tests__/unit/knowledge-foundation/release-governance.test.ts`
- **Evidence:** Shared across 2 files: const mockFindUniqueOrThrow = jest.fn();…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

## INFO Findings

### F-0078 — Additional long functions truncated (228 more)

- **Category:** long-function
- **Evidence:** Total long functions ≥100 lines: 268

### F-0159 — Additional low-MI files truncated (1696 more)

- **Category:** maintainability
- **Evidence:** Total below warn threshold: 1736

### F-0200 — Additional unused-export candidates truncated (1926 more)

- **Category:** unused-export
- **Evidence:** Total candidates: 1966

### F-0241 — Additional unused-import candidates truncated (176 more)

- **Category:** unused-import
- **Evidence:** Total candidates: 216

### F-0282 — Additional duplication groups truncated (3685 more)

- **Category:** duplication
- **Evidence:** Total groups: 3725

---

_AQLIYA Engineering Excellence · code-health_
