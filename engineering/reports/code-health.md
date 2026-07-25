# Code Health Report

**Agent:** code-health  
**Generated:** 2026-07-21T16:59:04.357Z  
**Score:** 50/100  
**Findings:** 212 (critical 0, high 58, medium 29, low 120, info 5)

> Engineering Excellence — findings only. OpenCode remains implementation authority. No automatic code changes.

## Summary

| Severity | Count |
| -------- | ----- |
| critical | 0 |
| high | 58 |
| medium | 29 |
| low | 120 |
| info | 5 |

## Scope

Analyzed 4160 source files under `src/`.

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

### F-0004 — Long function useFindingsPage (359 lines)

- **Category:** long-function
- **Files:** `src/components/audit/findings/components/use-findings-page.ts`
- **Evidence:** Lines 108–466
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0005 — Long function useEvidencePage (344 lines)

- **Category:** long-function
- **Files:** `src/components/audit/evidence/components/use-evidence-page.ts`
- **Evidence:** Lines 31–374
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0006 — Long function ConnectionDetailPanel (329 lines)

- **Category:** long-function
- **Files:** `src/app/local-content/settings/integrations/components/connection-detail-panel.tsx`
- **Evidence:** Lines 76–404
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0007 — Long function useGovernancePage (313 lines)

- **Category:** long-function
- **Files:** `src/app/(dashboard)/decisions/[id]/governance/components/use-governance-page.ts`
- **Evidence:** Lines 83–395
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0008 — Long function ConnectionFormDialogContent (294 lines)

- **Category:** long-function
- **Files:** `src/app/sales/settings/crm/components/connection-form-dialog.tsx`
- **Evidence:** Lines 36–329
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0009 — Long function buildKnowledgeFoundationPDF (271 lines)

- **Category:** long-function
- **Files:** `src/lib/knowledge-foundation/kf-export.ts`
- **Evidence:** Lines 53–323
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0010 — Long function buildKnowledgeFoundationPDF (262 lines)

- **Category:** long-function
- **Files:** `src/lib/knowledge-foundation/kf-export/pdf-export.ts`
- **Evidence:** Lines 12–273
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0011 — Long function ConnectionFormDialog (250 lines)

- **Category:** long-function
- **Files:** `src/app/local-content/settings/integrations/components/connection-form-dialog.tsx`
- **Evidence:** Lines 39–288
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0012 — Long function generateMockResponse (243 lines)

- **Category:** long-function
- **Files:** `src/lib/core/ai/providers/mock-provider/templates.ts`
- **Evidence:** Lines 4–246
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0013 — Long function useRecommendationsPage (238 lines)

- **Category:** long-function
- **Files:** `src/components/audit/recommendations/use-recommendations-page.ts`
- **Evidence:** Lines 49–286
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0014 — Long function buildFindingsPhase (232 lines)

- **Category:** long-function
- **Files:** `src/lib/sales/v02/knowledge-graph/builder/findings.ts`
- **Evidence:** Lines 5–236
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0015 — Long function useRetentionSettings (219 lines)

- **Category:** long-function
- **Files:** `src/app/settings/retention/components/use-retention-settings.ts`
- **Evidence:** Lines 6–224
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0016 — Long function useRecommendationPage (216 lines)

- **Category:** long-function
- **Files:** `src/app/(dashboard)/decisions/[id]/recommendation/components/use-recommendation-page.ts`
- **Evidence:** Lines 92–307
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0017 — Long function runErpImport (211 lines)

- **Category:** long-function
- **Files:** `src/lib/local-content/erp/import-pipeline/run-erp-import.ts`
- **Evidence:** Lines 18–228
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0018 — Long function exportContactAsPdf (207 lines)

- **Category:** long-function
- **Files:** `src/actions/contact-export-actions/pdf.ts`
- **Evidence:** Lines 13–219
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0019 — Long function getDecisionExportData (206 lines)

- **Category:** long-function
- **Files:** `src/actions/decision-export/index.ts`
- **Evidence:** Lines 16–221
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0020 — Long function useSsoSettings (205 lines)

- **Category:** long-function
- **Files:** `src/app/(dashboard)/settings/sso/components/use-sso-settings.ts`
- **Evidence:** Lines 86–290
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0021 — Long function useStatementsPage (201 lines)

- **Category:** long-function
- **Files:** `src/components/audit/statements/hooks/use-statements-page.tsx`
- **Evidence:** Lines 86–286
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0049 — Low maintainability index (4)

- **Category:** maintainability
- **Files:** `src/actions/contact-actions.ts`
- **Evidence:** MI=4 (warn < 45)

### F-0050 — Low maintainability index (7)

- **Category:** maintainability
- **Files:** `src/lib/local-content/workbook/recommendation-engine.ts`
- **Evidence:** MI=7 (warn < 45)

### F-0051 — Low maintainability index (7)

- **Category:** maintainability
- **Files:** `src/actions/audit-engagement-actions.ts`
- **Evidence:** MI=7 (warn < 45)

### F-0052 — Low maintainability index (8)

- **Category:** maintainability
- **Files:** `src/lib/workflowos/services.ts`
- **Evidence:** MI=8 (warn < 45)

### F-0053 — Low maintainability index (8)

- **Category:** maintainability
- **Files:** `src/lib/sales/agents/objection-analysis.ts`
- **Evidence:** MI=8 (warn < 45)

### F-0054 — Low maintainability index (8)

- **Category:** maintainability
- **Files:** `src/lib/local-content/content/file-repository.ts`
- **Evidence:** MI=8 (warn < 45)

### F-0055 — Low maintainability index (8)

- **Category:** maintainability
- **Files:** `src/lib/governance-engine/graph/pipeline/graph-readiness-pipeline.ts`
- **Evidence:** MI=8 (warn < 45)

### F-0056 — Low maintainability index (8)

- **Category:** maintainability
- **Files:** `src/lib/content-studio/file-repository.ts`
- **Evidence:** MI=8 (warn < 45)

### F-0057 — Low maintainability index (9)

- **Category:** maintainability
- **Files:** `src/lib/sales/services.ts`
- **Evidence:** MI=9 (warn < 45)

### F-0058 — Low maintainability index (9)

- **Category:** maintainability
- **Files:** `src/lib/auth/scim-service.ts`
- **Evidence:** MI=9 (warn < 45)

### F-0059 — Low maintainability index (10)

- **Category:** maintainability
- **Files:** `src/lib/sales/icp-learning-snapshot.ts`
- **Evidence:** MI=10 (warn < 45)

### F-0060 — Low maintainability index (10)

- **Category:** maintainability
- **Files:** `src/lib/sales/v02/proof-effectiveness/index.ts`
- **Evidence:** MI=10 (warn < 45)

### F-0061 — Low maintainability index (10)

- **Category:** maintainability
- **Files:** `src/components/audit/trial-balance/components/utils.ts`
- **Evidence:** MI=10 (warn < 45)

### F-0062 — Low maintainability index (11)

- **Category:** maintainability
- **Files:** `src/lib/sales/store/common.ts`
- **Evidence:** MI=11 (warn < 45)

### F-0063 — Low maintainability index (11)

- **Category:** maintainability
- **Files:** `src/lib/platform/sampling/sampling-engine.ts`
- **Evidence:** MI=11 (warn < 45)

### F-0064 — Low maintainability index (11)

- **Category:** maintainability
- **Files:** `src/lib/office-ai/file-extraction-service.ts`
- **Evidence:** MI=11 (warn < 45)

### F-0065 — Low maintainability index (11)

- **Category:** maintainability
- **Files:** `src/actions/local-content-workspace-actions.ts`
- **Evidence:** MI=11 (warn < 45)

### F-0066 — Low maintainability index (12)

- **Category:** maintainability
- **Files:** `src/lib/tb-intelligence/firm-memory-engine.ts`
- **Evidence:** MI=12 (warn < 45)

### F-0067 — Low maintainability index (12)

- **Category:** maintainability
- **Files:** `src/lib/sales/outreach.ts`
- **Evidence:** MI=12 (warn < 45)

### F-0068 — Low maintainability index (12)

- **Category:** maintainability
- **Files:** `src/lib/sales/v02/executive-commercial.ts`
- **Evidence:** MI=12 (warn < 45)

### F-0069 — Low maintainability index (12)

- **Category:** maintainability
- **Files:** `src/lib/sales/v02/institutional-learning/synthesize.ts`
- **Evidence:** MI=12 (warn < 45)

### F-0070 — Low maintainability index (12)

- **Category:** maintainability
- **Files:** `src/lib/sales/crm/sync-orchestrator.ts`
- **Evidence:** MI=12 (warn < 45)

### F-0071 — Low maintainability index (12)

- **Category:** maintainability
- **Files:** `src/lib/sales/agents/follow-up.ts`
- **Evidence:** MI=12 (warn < 45)

### F-0072 — Low maintainability index (12)

- **Category:** maintainability
- **Files:** `src/lib/local-content/erp/services.ts`
- **Evidence:** MI=12 (warn < 45)

### F-0073 — Low maintainability index (12)

- **Category:** maintainability
- **Files:** `src/lib/integration/failover-engine.ts`
- **Evidence:** MI=12 (warn < 45)

### F-0074 — Low maintainability index (12)

- **Category:** maintainability
- **Files:** `src/lib/integration/secret-resolver/implementation.ts`
- **Evidence:** MI=12 (warn < 45)

### F-0075 — Low maintainability index (12)

- **Category:** maintainability
- **Files:** `src/lib/governance/retrieval-router.ts`
- **Evidence:** MI=12 (warn < 45)

### F-0076 — Low maintainability index (12)

- **Category:** maintainability
- **Files:** `src/lib/audit/isqm1-engine.ts`
- **Evidence:** MI=12 (warn < 45)

### F-0077 — Low maintainability index (12)

- **Category:** maintainability
- **Files:** `src/app/(dashboard)/decisions/[id]/outcome/page.tsx`
- **Evidence:** MI=12 (warn < 45)

### F-0078 — Low maintainability index (12)

- **Category:** maintainability
- **Files:** `src/actions/institutional-memory-actions.ts`
- **Evidence:** MI=12 (warn < 45)

### F-0079 — Low maintainability index (12)

- **Category:** maintainability
- **Files:** `src/actions/registration-actions.ts`
- **Evidence:** MI=12 (warn < 45)

### F-0080 — Low maintainability index (13)

- **Category:** maintainability
- **Files:** `src/lib/sales/v02/proof-effectiveness/analytics.ts`
- **Evidence:** MI=13 (warn < 45)

### F-0081 — Low maintainability index (13)

- **Category:** maintainability
- **Files:** `src/lib/platform/feature-flags/registry.ts`
- **Evidence:** MI=13 (warn < 45)

### F-0082 — Low maintainability index (13)

- **Category:** maintainability
- **Files:** `src/lib/platform/decision-gov/decision-gov-service.ts`
- **Evidence:** MI=13 (warn < 45)

### F-0083 — Low maintainability index (13)

- **Category:** maintainability
- **Files:** `src/lib/governance-engine/graph/decision-framework/decision-aggregator.ts`
- **Evidence:** MI=13 (warn < 45)

### F-0084 — Low maintainability index (13)

- **Category:** maintainability
- **Files:** `src/lib/core/ai/orchestrator.ts`
- **Evidence:** MI=13 (warn < 45)

### F-0085 — Low maintainability index (13)

- **Category:** maintainability
- **Files:** `src/lib/audit/materiality-engine.ts`
- **Evidence:** MI=13 (warn < 45)

### F-0086 — Low maintainability index (13)

- **Category:** maintainability
- **Files:** `src/lib/audit/reconciliation/reconciliation-checks.ts`
- **Evidence:** MI=13 (warn < 45)

### F-0087 — Low maintainability index (13)

- **Category:** maintainability
- **Files:** `src/components/audit/findings/components/use-findings-page.ts`
- **Evidence:** MI=13 (warn < 45)

### F-0088 — Low maintainability index (13)

- **Category:** maintainability
- **Files:** `src/app/risk/assessments/[id]/page.tsx`
- **Evidence:** MI=13 (warn < 45)

## MEDIUM Findings

### F-0001 — Large module / God Object signal: primitives.ts

- **Category:** god-object
- **Files:** `src/lib/local-content/schemas/common/primitives.ts`
- **Evidence:** 83 lines, 37 named exports
- **Suggestion:** Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.

### F-0002 — React God Component: RCS 38 — use-approval-page.tsx

- **Category:** react-complexity
- **Files:** `src/components/audit/approval/components/use-approval-page.tsx`
- **Evidence:** 202 LOC, 17 useState, 6 components, density=9.9/100L, inline=0
- **Suggestion:** Extract sub-components, convert useState chains to useReducer, or split into container/presentational.

### F-0003 — React God Component: RCS 18 — connection-form-dialog.tsx

- **Category:** react-complexity
- **Files:** `src/app/local-content/settings/integrations/components/connection-form-dialog.tsx`
- **Evidence:** 289 LOC, 15 useState, 10 components, density=5.2/100L, inline=11
- **Suggestion:** Extract sub-components, convert useState chains to useReducer, or split into container/presentational.

### F-0022 — Long function deriveWinLossPatterns (199 lines)

- **Category:** long-function
- **Files:** `src/lib/sales/v02/institutional-learning/engine/patterns.ts`
- **Evidence:** Lines 16–214
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0023 — Long function getTraceability (199 lines)

- **Category:** long-function
- **Files:** `src/lib/audit/db/publication-db/traceability.ts`
- **Evidence:** Lines 3–201
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0024 — Long function getFullTraceability (198 lines)

- **Category:** long-function
- **Files:** `src/lib/audit/db/publication-db/full-traceability.ts`
- **Evidence:** Lines 4–201
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0025 — Long function verifyReleaseIntegrity (191 lines)

- **Category:** long-function
- **Files:** `src/lib/knowledge-foundation/release-integrity/integrity-verifier.ts`
- **Evidence:** Lines 20–210
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0026 — Long function useReviewPage (189 lines)

- **Category:** long-function
- **Files:** `src/components/audit/review/components/use-review-page.ts`
- **Evidence:** Lines 31–219
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0027 — Long function useWorkbookDetail (189 lines)

- **Category:** long-function
- **Files:** `src/app/local-content/workbook/[workbookId]/use-workbook-detail.ts`
- **Evidence:** Lines 58–246
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0028 — Long function useCrmSettings (184 lines)

- **Category:** long-function
- **Files:** `src/app/sales/settings/crm/components/use-crm-settings.ts`
- **Evidence:** Lines 53–236
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0029 — Long function useTbImport (183 lines)

- **Category:** long-function
- **Files:** `src/app/local-content/workbook/[workbookId]/components/use-tb-import.ts`
- **Evidence:** Lines 14–196
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0030 — Long function generateReviewPdf (182 lines)

- **Category:** long-function
- **Files:** `src/actions/localcontent-review-export/pdf-builder.ts`
- **Evidence:** Lines 40–221
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0031 — Long function useTrialBalanceUpload (181 lines)

- **Category:** long-function
- **Files:** `src/components/audit/trial-balance/components/use-trial-balance-upload.ts`
- **Evidence:** Lines 19–199
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0032 — Long function WorkflowWorkflowActions (180 lines)

- **Category:** long-function
- **Files:** `src/components/workflowos/workflow-workflow-actions.tsx`
- **Evidence:** Lines 23–202
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0033 — Long function useMateriality (180 lines)

- **Category:** long-function
- **Files:** `src/components/audit/materiality/use-materiality.ts`
- **Evidence:** Lines 40–219
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0034 — Long function GraphCanvas (180 lines)

- **Category:** long-function
- **Files:** `src/app/institutional-memory/graph/components/graph-canvas.tsx`
- **Evidence:** Lines 7–186
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0035 — Long function ApprovalActions (180 lines)

- **Category:** long-function
- **Files:** `src/app/(dashboard)/decisions/[id]/governance/components/approval-actions.tsx`
- **Evidence:** Lines 44–223
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0036 — Long function rebuildFinancialStatementsForEngagement (179 lines)

- **Category:** long-function
- **Files:** `src/lib/audit/db/financial-db/rebuild.ts`
- **Evidence:** Lines 7–185
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0037 — Long function getPlatformNotificationsAction (177 lines)

- **Category:** long-function
- **Files:** `src/actions/platform-overview-actions/notifications.ts`
- **Evidence:** Lines 7–183
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0038 — Long function useIndependence (176 lines)

- **Category:** long-function
- **Files:** `src/components/audit/independence/components/use-independence.ts`
- **Evidence:** Lines 70–245
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0039 — Long function ContentEditForm (173 lines)

- **Category:** long-function
- **Files:** `src/app/content-studio/[workspaceId]/[contentId]/edit/content-edit-form.tsx`
- **Evidence:** Lines 34–206
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0040 — Long function publishRecommendationAction (173 lines)

- **Category:** long-function
- **Files:** `src/actions/decisions-workflow/publishing.ts`
- **Evidence:** Lines 14–186
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0041 — Long function IcpTerritoryAdminPanel (172 lines)

- **Category:** long-function
- **Files:** `src/components/sales/icp-territory-admin-panel.tsx`
- **Evidence:** Lines 18–189
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0042 — Long function ProductPageTemplate (172 lines)

- **Category:** long-function
- **Files:** `src/components/marketing/v2/product-page-template.tsx`
- **Evidence:** Lines 54–225
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0043 — Long function VerificationChecklistView (172 lines)

- **Category:** long-function
- **Files:** `src/components/local-content/verification-checklist-view.tsx`
- **Evidence:** Lines 30–201
- **Suggestion:** Extract helpers; keep orchestration thin.

### F-0045 — Elevated complexity in utils.ts

- **Category:** complexity
- **Files:** `src/components/audit/trial-balance/components/utils.ts`
- **Evidence:** Decision density ≈ 69, MI=10
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0046 — Elevated complexity in common.ts

- **Category:** complexity
- **Files:** `src/lib/local-content/workbook/population/common.ts`
- **Evidence:** Decision density ≈ 57, MI=14
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0047 — Elevated complexity in scoring.ts

- **Category:** complexity
- **Files:** `src/lib/skill-runtime/evaluator/scoring.ts`
- **Evidence:** Decision density ≈ 49, MI=22
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

### F-0048 — Elevated complexity in common.ts

- **Category:** complexity
- **Files:** `src/lib/sales/store/common.ts`
- **Evidence:** Decision density ≈ 41, MI=11
- **Suggestion:** Reduce branching; extract strategy/table-driven logic.

## LOW Findings

### F-0090 — Possibly unused export: onRequestError

- **Category:** unused-export
- **Files:** `src/instrumentation.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0091 — Possibly unused export: analyzeMap2Errors

- **Category:** unused-export
- **Files:** `src/lib/tb-intelligence/map2-refinement.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0092 — Possibly unused export: COA_SYNONYM_RULES

- **Category:** unused-export
- **Files:** `src/lib/tb-intelligence/synonyms.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0093 — Possibly unused export: getPendingReviewCandidates

- **Category:** unused-export
- **Files:** `src/lib/tb-intelligence/knowledge-mining/review-workflow.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0094 — Possibly unused export: countSkippedSteps

- **Category:** unused-export
- **Files:** `src/lib/skill-runtime/runtime/engine/output-collector.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0095 — Possibly unused export: scoreObjectAccuracy

- **Category:** unused-export
- **Files:** `src/lib/skill-runtime/evaluator/scoring.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0096 — Possibly unused export: getSimulationSummary

- **Category:** unused-export
- **Files:** `src/lib/simulation/simulation-engine.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0097 — Possibly unused export: toDealDetailViewModel

- **Category:** unused-export
- **Files:** `src/lib/salesos/viewmodel/deal-viewmodel.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0098 — Possibly unused export: PrismaDealRepository

- **Category:** unused-export
- **Files:** `src/lib/salesos/infrastructure/prisma-deal-repository.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0099 — Possibly unused export: PERMISSION_MAP

- **Category:** unused-export
- **Files:** `src/lib/salesos/api/auth-context.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0100 — Possibly unused export: parseConversionMemo

- **Category:** unused-export
- **Files:** `src/lib/sales/conversion-memo.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0101 — Possibly unused export: getProductEvidenceTypes

- **Category:** unused-export
- **Files:** `src/lib/sales/core-adoption.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0102 — Possibly unused export: getProductOutputTypes

- **Category:** unused-export
- **Files:** `src/lib/sales/core-adoption.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0103 — Possibly unused export: getProductWorkflowTemplates

- **Category:** unused-export
- **Files:** `src/lib/sales/core-adoption.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0104 — Possibly unused export: canExportOutput

- **Category:** unused-export
- **Files:** `src/lib/sales/core-adoption.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0105 — Possibly unused export: getOutputMetadata

- **Category:** unused-export
- **Files:** `src/lib/sales/core-adoption.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0106 — Possibly unused export: buildGovernedAIContract

- **Category:** unused-export
- **Files:** `src/lib/sales/core-adoption.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0107 — Possibly unused export: salesosRegistryContract

- **Category:** unused-export
- **Files:** `src/lib/sales/core-adoption.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0108 — Possibly unused export: salesosWorkflowTemplate

- **Category:** unused-export
- **Files:** `src/lib/sales/core-adoption.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0109 — Possibly unused export: salesosEvidenceCatalog

- **Category:** unused-export
- **Files:** `src/lib/sales/core-adoption.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0110 — Possibly unused export: salesosOutputCatalog

- **Category:** unused-export
- **Files:** `src/lib/sales/core-adoption.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0111 — Possibly unused export: salesosAICapabilities

- **Category:** unused-export
- **Files:** `src/lib/sales/core-adoption.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0112 — Possibly unused export: linkEvidenceToAccount

- **Category:** unused-export
- **Files:** `src/lib/sales/evidence-links.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0113 — Possibly unused export: unlinkEvidenceFromAccount

- **Category:** unused-export
- **Files:** `src/lib/sales/evidence-links.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0114 — Possibly unused export: countEvidenceLinksForAccount

- **Category:** unused-export
- **Files:** `src/lib/sales/evidence-links.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0115 — Possibly unused export: resolveEvidenceForSalesOrg

- **Category:** unused-export
- **Files:** `src/lib/sales/evidence-resolver.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0116 — Possibly unused export: latestReviewDecision

- **Category:** unused-export
- **Files:** `src/lib/sales/governance.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0117 — Possibly unused export: buildICPLearningFromOrg

- **Category:** unused-export
- **Files:** `src/lib/sales/icp-learning.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0118 — Possibly unused export: SALES_L5_CRITERIA_VERSION

- **Category:** unused-export
- **Files:** `src/lib/sales/l5-acceptance.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0119 — Possibly unused export: submitSalesOpportunityForReview

- **Category:** unused-export
- **Files:** `src/lib/sales/l5-governance.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0120 — Possibly unused export: approveSalesOpportunity

- **Category:** unused-export
- **Files:** `src/lib/sales/l5-governance.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0121 — Possibly unused export: rejectSalesOpportunity

- **Category:** unused-export
- **Files:** `src/lib/sales/l5-governance.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0122 — Possibly unused export: listNbaSuppressions

- **Category:** unused-export
- **Files:** `src/lib/sales/nba-suppression-store.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0123 — Possibly unused export: NBA_SNOOZE_HOURS

- **Category:** unused-export
- **Files:** `src/lib/sales/nba-ui-filter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0124 — Possibly unused export: isNbaUiStateActive

- **Category:** unused-export
- **Files:** `src/lib/sales/nba-ui-filter.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0125 — Possibly unused export: filterNextBestActionsByUiState

- **Category:** unused-export
- **Files:** `src/lib/sales/nba-ui-filter.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0126 — Possibly unused export: linkProofAssetToOpportunity

- **Category:** unused-export
- **Files:** `src/lib/sales/proof-linkage-service.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0127 — Possibly unused export: linkProofAssetToAccount

- **Category:** unused-export
- **Files:** `src/lib/sales/proof-linkage-service.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0128 — Possibly unused export: buildProofLinkagePlan

- **Category:** unused-export
- **Files:** `src/lib/sales/proof-linkage.ts`
- **Evidence:** Symbol appears ~2 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0129 — Possibly unused export: linkProofEvidence

- **Category:** unused-export
- **Files:** `src/lib/sales/proof-linkage.ts`
- **Evidence:** Symbol appears ~1 times in src
- **Suggestion:** Confirm with IDE unused-symbol analysis before removal.

### F-0131 — Possibly unused import: coreEvidenceIdForProofAsset

- **Category:** unused-import
- **Files:** `src/products/sales/core-adapters/alerts.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0132 — Possibly unused import: SkillManifestError

- **Category:** unused-import
- **Files:** `src/lib/skill-runtime/runtime/steps.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0133 — Possibly unused import: loadManifest

- **Category:** unused-import
- **Files:** `src/lib/skill-runtime/evaluator/dataset-loader.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0134 — Possibly unused import: listCrossProductProofCandidates

- **Category:** unused-import
- **Files:** `src/lib/sales/vnext/proof-network-overview.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0135 — Possibly unused import: //   collectCrossProductCommercialSignals

- **Category:** unused-import
- **Files:** `src/lib/sales/v02/cross-product-signals/aggregator.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0136 — Possibly unused import: //   deriveInstitutionalCommercialSignals

- **Category:** unused-import
- **Files:** `src/lib/sales/v02/cross-product-signals/aggregator.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0137 — Possibly unused import: //   collectCrossProductRuntimeInputs

- **Category:** unused-import
- **Files:** `src/lib/sales/v02/cross-product-signals/aggregator.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0138 — Possibly unused import: //

- **Category:** unused-import
- **Files:** `src/lib/sales/v02/cross-product-signals/aggregator.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0139 — Possibly unused import: PLATFORM_AUDIT_OUTBOX_EVENT

- **Category:** unused-import
- **Files:** `src/lib/platform/audit-log.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0140 — Possibly unused import: join

- **Category:** unused-import
- **Files:** `src/lib/platform/siem/delivery.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0141 — Possibly unused import: getRedisUrl

- **Category:** unused-import
- **Files:** `src/lib/platform/operations/queue-runtime.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0142 — Possibly unused import: START_TIME

- **Category:** unused-import
- **Files:** `src/lib/platform/monitoring/system-monitor/alerts.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0143 — Possibly unused import: computeHash

- **Category:** unused-import
- **Files:** `src/lib/platform/audit/audit-store.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0144 — Possibly unused import: prisma

- **Category:** unused-import
- **Files:** `src/lib/local-content/workbook/ai-health.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0145 — Possibly unused import: runGovernedProductAI

- **Category:** unused-import
- **Files:** `src/lib/local-content/workbook/ai-health.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0146 — Possibly unused import: WORKBOOK_TEMPLATE

- **Category:** unused-import
- **Files:** `src/lib/local-content/workbook/missing-data.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0147 — Possibly unused import: recalculateWorkbookStats

- **Category:** unused-import
- **Files:** `src/lib/local-content/workbook/services.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0148 — Possibly unused import: getLineValue

- **Category:** unused-import
- **Files:** `src/lib/local-content/workbook/simulation-engine.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0149 — Possibly unused import: requireTransition

- **Category:** unused-import
- **Files:** `src/lib/local-content/workbook/population/from-project.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0150 — Possibly unused import: prisma

- **Category:** unused-import
- **Files:** `src/lib/local-content/pipeline-orchestrator/index.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0151 — Possibly unused import: recordGovernanceEvent

- **Category:** unused-import
- **Files:** `src/lib/integration/secret-resolver/implementation.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0152 — Possibly unused import: SecretResolverImpl

- **Category:** unused-import
- **Files:** `src/lib/integration/secret-resolver/index.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0153 — Possibly unused import: ExecutionContext

- **Category:** unused-import
- **Files:** `src/lib/governance-engine/rules/gr-002-derived-artifacts.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0154 — Possibly unused import: ExecutionContext

- **Category:** unused-import
- **Files:** `src/lib/governance-engine/rules/gr-003-evidence-manifest.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0155 — Possibly unused import: ExecutionContext

- **Category:** unused-import
- **Files:** `src/lib/governance-engine/rules/gr-004-glossary-precision.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0156 — Possibly unused import: ExecutionContext

- **Category:** unused-import
- **Files:** `src/lib/governance-engine/rules/gr-005-three-tier-review.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0157 — Possibly unused import: ID_PATTERNS

- **Category:** unused-import
- **Files:** `src/lib/governance-engine/registry/loader.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0158 — Possibly unused import: fmtDate

- **Category:** unused-import
- **Files:** `src/lib/decision/decision-export-formats/markdown.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0159 — Possibly unused import: prisma

- **Category:** unused-import
- **Files:** `src/lib/audit/services/trial-balance.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0160 — Possibly unused import: classifyRevenuePresentationSegment

- **Category:** unused-import
- **Files:** `src/lib/audit/db/income-statement-presentation-amounts.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0161 — Possibly unused import: GENERIC_PRESENTATION_POLICY_V1

- **Category:** unused-import
- **Files:** `src/lib/audit/db/income-statement-presentation-policy.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0162 — Possibly unused import: makeLine

- **Category:** unused-import
- **Files:** `src/lib/audit/db/statement-builder/equity-statement.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0163 — Possibly unused import: policyUsesAuditedHeadlineRules

- **Category:** unused-import
- **Files:** `src/lib/audit/db/statement-builder/income-statement.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0164 — Possibly unused import: getPresentationAmountForKind

- **Category:** unused-import
- **Files:** `src/lib/audit/db/statement-builder/income-statement.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0165 — Possibly unused import: SHALFA_POLICY_FALLBACK

- **Category:** unused-import
- **Files:** `src/lib/audit/db/income-statement-presentation-classify/predicates.ts`
- **Evidence:** Imported symbol not referenced after import statement

### F-0166 — Possibly unused import: Badge

- **Category:** unused-import
- **Files:** `src/components/workflowos/export-button.tsx`
- **Evidence:** Imported symbol not referenced after import statement

### F-0167 — Possibly unused import: Activity

- **Category:** unused-import
- **Files:** `src/components/workflowos/workflow-audit-trail.tsx`
- **Evidence:** Imported symbol not referenced after import statement

### F-0168 — Possibly unused import: TabsContent

- **Category:** unused-import
- **Files:** `src/components/sales/opportunity-pipeline.tsx`
- **Evidence:** Imported symbol not referenced after import statement

### F-0169 — Possibly unused import: RefreshCw

- **Category:** unused-import
- **Files:** `src/components/sales/review-decision-panel.tsx`
- **Evidence:** Imported symbol not referenced after import statement

### F-0170 — Possibly unused import: Scale

- **Category:** unused-import
- **Files:** `src/components/contacts/components/export-pending-approval.tsx`
- **Evidence:** Imported symbol not referenced after import statement

### F-0172 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/products/sales-os/sales-os-plugin.ts`, `src/products/local-content-os/plugin.ts`, `src/products/audit-os/audit-os-plugin.ts`
- **Evidence:** Shared across 3 files: );…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0173 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/products/sales-os/sales-os-plugin.ts`, `src/products/local-content-os/plugin.ts`, `src/products/audit-os/audit-os-plugin.ts`
- **Evidence:** Shared across 3 files: }…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0174 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/auth-config.ts`, `src/app/api/auth/saml/[providerId]/callback/route.ts`
- **Evidence:** Shared across 2 files: select: {…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0175 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/workflowos/services.ts`, `src/lib/workflowos/storage.ts`
- **Evidence:** Shared across 2 files: clientId: string,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0176 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/tb-intelligence/coa-loader.ts`, `src/lib/audit/services/trial-balance.ts`
- **Evidence:** Shared across 2 files: if (["10", "11", "12"].includes(prefix)) return "asset";…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0177 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/tb-intelligence/coa-loader.ts`, `src/lib/audit/services/trial-balance.ts`
- **Evidence:** Shared across 2 files: if (["13", "14"].includes(prefix)) return "non-current-asset";…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0178 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/skill-runtime/evaluator/batch-evaluator.ts`, `src/lib/skill-runtime/evaluator/evaluate-skill.ts`
- **Evidence:** Shared across 2 files: skillId,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0179 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/skill-runtime/evaluator/batch-evaluator.ts`, `src/lib/skill-runtime/evaluator/evaluate-skill.ts`
- **Evidence:** Shared across 2 files: skillName: skillId,…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0180 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/simulation/simulation-adapters.ts`, `src/lib/simulation/simulation-engine.ts`
- **Evidence:** Shared across 2 files: function scenarioLabel(type: ScenarioType): string {…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0181 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/simulation/simulation-adapters.ts`, `src/lib/simulation/simulation-engine.ts`
- **Evidence:** Shared across 2 files: return type.replace("_", " ")…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0182 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/simulation/simulation-adapters.ts`, `src/lib/simulation/simulation-engine.ts`
- **Evidence:** Shared across 2 files: }…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0183 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/simulation/simulation-adapters.ts`, `src/lib/simulation/simulation-engine.ts`
- **Evidence:** Shared across 2 files: function scenarioUpside(type: ScenarioType, score: number): string {…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0184 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/simulation/simulation-adapters.ts`, `src/lib/simulation/simulation-engine.ts`
- **Evidence:** Shared across 2 files: if (type === "BEST_CASE") return `Best case achieves ${score}/100 — all favorabl…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0185 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/simulation/simulation-adapters.ts`, `src/lib/simulation/simulation-engine.ts`
- **Evidence:** Shared across 2 files: if (type === "EXPECTED_CASE") return `Expected case at ${score}/100 — most likel…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0186 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/simulation/simulation-adapters.ts`, `src/lib/simulation/simulation-engine.ts`
- **Evidence:** Shared across 2 files: return `Worst case at ${score}/100 — adverse conditions but still within managea…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0187 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/account-brief-pack.ts`, `src/lib/sales/pilot-handoff-pack.ts`, `src/components/sales/pilot-handoff-pack-view.tsx`
- **Evidence:** Shared across 3 files: if (Number.isNaN(d.getTime())) return "—";…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0188 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/account-brief-pack.ts`, `src/lib/sales/pilot-handoff-pack.ts`, `src/components/sales/pilot-handoff-pack-view.tsx`
- **Evidence:** Shared across 3 files: return new Intl.DateTimeFormat("ar-SA", {…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0189 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/account-brief-pack.ts`, `src/lib/sales/pilot-handoff-pack.ts`, `src/components/sales/pilot-handoff-pack-view.tsx`
- **Evidence:** Shared across 3 files: dateStyle: "medium",…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0190 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/conversion-memo.ts`, `src/lib/sales/agents/follow-up.ts`
- **Evidence:** Shared across 2 files: }…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0191 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/conversion-memo.ts`, `src/lib/sales/agents/follow-up.ts`
- **Evidence:** Shared across 2 files: async function loadDealWithMetadata(dealId: string, organizationId: string) {…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0192 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/conversion-memo.ts`, `src/lib/sales/agents/follow-up.ts`
- **Evidence:** Shared across 2 files: const deal = await prisma.salesDeal.findFirst({…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0193 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/conversion-memo.ts`, `src/lib/sales/agents/follow-up.ts`
- **Evidence:** Shared across 2 files: where: { id: dealId, organizationId },…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0194 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/conversion-memo.ts`, `src/lib/sales/agents/follow-up.ts`
- **Evidence:** Shared across 2 files: select: {…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0195 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/institutional-memory-shared.ts`, `src/lib/sales/institutional-memory.ts`
- **Evidence:** Shared across 2 files: export const MAX_INSTITUTIONAL_MEMORY_PER_ACCOUNT = 100;…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0196 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/institutional-memory-shared.ts`, `src/lib/sales/institutional-memory.ts`
- **Evidence:** Shared across 2 files: export const INSTITUTIONAL_MEMORY_TYPES = […
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0197 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/institutional-memory-shared.ts`, `src/lib/sales/institutional-memory.ts`
- **Evidence:** Shared across 2 files: "audit",…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0198 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/institutional-memory-shared.ts`, `src/lib/sales/institutional-memory.ts`
- **Evidence:** Shared across 2 files: "review_decision",…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0199 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/institutional-memory-shared.ts`, `src/lib/sales/institutional-memory.ts`
- **Evidence:** Shared across 2 files: function parseMetadata(value: unknown): Record<string, unknown> {…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0200 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/institutional-memory-shared.ts`, `src/lib/sales/institutional-memory.ts`
- **Evidence:** Shared across 2 files: if (value && typeof value === "object" && !Array.isArray(value)) {…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0201 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/institutional-memory-shared.ts`, `src/lib/sales/institutional-memory.ts`
- **Evidence:** Shared across 2 files: return value as Record<string, unknown>;…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0202 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/institutional-memory-shared.ts`, `src/lib/sales/institutional-memory.ts`
- **Evidence:** Shared across 2 files: }…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0203 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/institutional-memory-shared.ts`, `src/lib/sales/institutional-memory.ts`
- **Evidence:** Shared across 2 files: const raw = parseMetadata(metadata).institutionalMemory;…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0204 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/institutional-memory-shared.ts`, `src/lib/sales/institutional-memory.ts`
- **Evidence:** Shared across 2 files: if (!Array.isArray(raw)) return [];…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0205 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/institutional-memory-shared.ts`, `src/lib/sales/institutional-memory.ts`
- **Evidence:** Shared across 2 files: const entries: InstitutionalMemoryEntry[] = [];…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0206 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/institutional-memory-shared.ts`, `src/lib/sales/institutional-memory.ts`
- **Evidence:** Shared across 2 files: for (const item of raw) {…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0207 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/institutional-memory-shared.ts`, `src/lib/sales/institutional-memory.ts`
- **Evidence:** Shared across 2 files: if (!item || typeof item !== "object" || Array.isArray(item)) continue;…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0208 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/institutional-memory-shared.ts`, `src/lib/sales/institutional-memory.ts`
- **Evidence:** Shared across 2 files: const row = item as Record<string, unknown>;…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0209 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/institutional-memory-shared.ts`, `src/lib/sales/institutional-memory.ts`
- **Evidence:** Shared across 2 files: const type = parseMemoryType(row.type);…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0210 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/institutional-memory-shared.ts`, `src/lib/sales/institutional-memory.ts`
- **Evidence:** Shared across 2 files: const summary =…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

### F-0211 — Duplicated code block across modules

- **Category:** duplication
- **Files:** `src/lib/sales/institutional-memory-shared.ts`, `src/lib/sales/institutional-memory.ts`
- **Evidence:** Shared across 2 files: typeof row.summary === "string" && row.summary.trim()…
- **Suggestion:** Extract shared helper into src/lib/ or product shared module.

## INFO Findings

### F-0044 — Additional long functions truncated (240 more)

- **Category:** long-function
- **Evidence:** Total long functions ≥100 lines: 280

### F-0089 — Additional low-MI files truncated (2056 more)

- **Category:** maintainability
- **Evidence:** Total below warn threshold: 2096

### F-0130 — Additional unused-export candidates truncated (1366 more)

- **Category:** unused-export
- **Evidence:** Total candidates: 1406

### F-0171 — Additional unused-import candidates truncated (85 more)

- **Category:** unused-import
- **Evidence:** Total candidates: 125

### F-0212 — Additional duplication groups truncated (6280 more)

- **Category:** duplication
- **Evidence:** Total groups: 6320

---

_AQLIYA Engineering Excellence · code-health_
