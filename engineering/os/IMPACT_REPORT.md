# Change Impact Report

**Generated:** 2026-07-11T11:27:35.033Z  
**Target:** `enforce`  

**Risk:** **HIGH** (100/100)

## What will be affected?

| Dimension | Count |
| --------- | ----- |
| Products | 12 — Platform, DecisionOS, LocalContactOS, WorkflowOS, Core, SalesOS, LocalContentOS, AuditOS, OfficeAI, RiskOS, ContentStudio, InstitutionalMemory |
| Files | 59 |
| Importers (1-hop) | 100 |
| Actions | 25 |
| Tests | 16 |
| ADRs | 1 |
| Related open findings | 20 |

## Products

- Platform
- DecisionOS
- LocalContactOS
- WorkflowOS
- Core
- SalesOS
- LocalContentOS
- AuditOS
- OfficeAI
- RiskOS
- ContentStudio
- InstitutionalMemory

## ADRs in scope

- **ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT**: ADR-DEPLOY-001: CloudFront WAF Attachment via `web_acl_id`


## Tests to run / extend

- `src/__tests__/api-smoke.test.ts`
- `src/__tests__/cross-tenant-isolation.test.ts`
- `src/__tests__/unit/knowledge-mining-security.test.ts`
- `src/__tests__/integration/decision-evidence-download-route.test.ts`
- `src/__tests__/integration/decision-evidence.test.ts`
- `src/__tests__/integration/localcontactos-crud.test.ts`
- `src/__tests__/integration/org-scoping.test.ts`
- `src/__tests__/integration/workflowos-export.test.ts`
- `src/__tests__/integration/workflowos-record-download-route.test.ts`
- `src/lib/salesos/viewmodel/__tests__/deal-viewmodel.test.ts`
- `src/lib/sales/__tests__/workflowos-expansion.test.ts`
- `src/lib/core/policy/access/__tests__/abac-enforce.test.ts`
- `src/lib/core/policy/access/__tests__/abac-shadow-report.test.ts`
- `src/actions/__tests__/decision-actions.test.ts`
- `src/actions/__tests__/localcontent-ai-pipeline.integration.test.ts`
- `src/actions/__tests__/workflow-actions.test.ts`


## Related open findings

- [high] `bc412283b638` Large module / God Object signal: decisions.ts
- [medium] `c81160534de1` Large module / God Object signal: sales-actions.ts
- [medium] `b12886eb933f` Large module / God Object signal: workflowos-actions.ts
- [high] `7e7bd653dcf0` Long function getDecisionExportData (296 lines)
- [high] `58ad17391796` Long function runSimulationAndRecommendation (279 lines)
- [high] `0e8c35a4b5e7` Long function getDashboardMetrics (274 lines)
- [high] `eeab839a93e9` Elevated complexity in decisions.ts
- [high] `8dbed2bf3a18` Elevated complexity in workflowos-actions.ts
- [medium] `b39789c1fd78` Elevated complexity in approval.ts
- [high] `347aa9fc1fc6` Low maintainability index (0)
- [high] `cc1f85747968` Low maintainability index (0)
- [high] `da2a0e0a12a7` Low maintainability index (0)
- [high] `9c4c3bb67b2e` Low maintainability index (4)
- [low] `3ba4634b2ad2` Possibly unused import: getWorkflowExportStatus
- [low] `a848119c97a4` Possibly unused import: notifyExportRequested
- [low] `3321b2c59825` Possibly unused import: toDealDetailViewModel
- [low] `d0cc3717d9c1` Duplicated code block across modules
- [medium] `96a22fe3aa8e` Possible circular dependency
- [medium] `851f8275a816` Possible circular dependency
- [medium] `9a702f46b9a4` Possible circular dependency

## Risks

- High blast radius — require OpenCode wave plan + Engineering verify before merge.

> This is an Impact Report for planning — OpenCode implements; Engineering verifies.
