# Change Impact Report

**Generated:** 2026-07-18T18:34:58.753Z  
**Target:** `enforce`  

**Risk:** **HIGH** (100/100)

## What will be affected?

| Dimension | Count |
| --------- | ----- |
| Products | 12 — Platform, DecisionOS, LocalContactOS, WorkflowOS, SalesOS, Core, LocalContentOS, AuditOS, InstitutionalMemory, OfficeAI, ContentStudio, RiskOS |
| Files | 90 |
| Importers (1-hop) | 100 |
| Actions | 48 |
| Tests | 21 |
| ADRs | 1 |
| Related open findings | 20 |

## Products

- Platform
- DecisionOS
- LocalContactOS
- WorkflowOS
- SalesOS
- Core
- LocalContentOS
- AuditOS
- InstitutionalMemory
- OfficeAI
- ContentStudio
- RiskOS

## ADRs in scope

- **ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT**: ADR-DEPLOY-001: CloudFront WAF Attachment via `web_acl_id`


## Tests to run / extend

- `src/__tests__/api-smoke.test.ts`
- `src/__tests__/cross-tenant-isolation.test.ts`
- `src/__tests__/unit/knowledge-mining-security.test.ts`
- `src/__tests__/unit/api/decision-evidence-download-tenant.test.ts`
- `src/__tests__/unit/api/evidence-download-error-sanitization.test.ts`
- `src/__tests__/integration/decision-evidence-download-route.test.ts`
- `src/__tests__/integration/decision-evidence.test.ts`
- `src/__tests__/integration/localcontactos-crud.test.ts`
- `src/__tests__/integration/org-scoping.test.ts`
- `src/__tests__/integration/workflowos-export.test.ts`
- `src/__tests__/integration/workflowos-record-download-route.test.ts`
- `src/__tests__/e2e/critical-flows.test.ts`
- `src/lib/salesos/viewmodel/__tests__/deal-viewmodel.test.ts`
- `src/lib/sales/__tests__/workflowos-expansion.test.ts`
- `src/lib/kernel/__tests__/abac-enforcement.test.ts`
- `src/lib/core/policy/access/__tests__/abac-enforce.test.ts`
- `src/lib/core/policy/access/__tests__/abac-shadow-report.test.ts`
- `src/actions/__tests__/decision-actions.test.ts`
- `src/actions/__tests__/localcontent-ai-pipeline.integration.test.ts`
- `src/actions/__tests__/sales-actions.test.ts`
- `src/actions/__tests__/workflow-actions.test.ts`


## Related open findings

- [medium] `c81160534de1` Large module / God Object signal: sales-actions.ts
- [medium] `b12886eb933f` Large module / God Object signal: workflowos-actions.ts
- [high] `7e7bd653dcf0` Long function getDecisionExportData (296 lines)
- [high] `58ad17391796` Long function runSimulationAndRecommendation (313 lines)
- [high] `8dbed2bf3a18` Elevated complexity in workflowos-actions.ts
- [medium] `b39789c1fd78` Elevated complexity in approval.ts
- [high] `347aa9fc1fc6` Low maintainability index (0)
- [high] `da2a0e0a12a7` Low maintainability index (0)
- [medium] `96a22fe3aa8e` Possible circular dependency
- [medium] `851f8275a816` Possible circular dependency
- [medium] `3b5f7d5d17f2` Possible circular dependency
- [medium] `21febd506572` Server action module with many awaits
- [medium] `7e7ad8d07992` Server action module with many awaits
- [medium] `999c211ef0fa` Server action module with many awaits
- [medium] `b25401d41e77` Server action module with many awaits
- [medium] `b1ec118e8f11` Server action module with many awaits
- [medium] `43ea4dee1fce` Server action module with many awaits
- [medium] `360771cdcc00` Server action module with many awaits
- [medium] `6177bce4056d` Server action module with many awaits
- [info] `906d767e8a80` Many arbitrary px Tailwind values

## Risks

- High blast radius — require OpenCode wave plan + Engineering verify before merge.

> This is an Impact Report for planning — OpenCode implements; Engineering verifies.
