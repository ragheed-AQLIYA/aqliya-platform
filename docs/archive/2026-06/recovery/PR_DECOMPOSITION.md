# PR Decomposition — Commit 58e4021

**Commit:** `58e4021` — chore(auditos): integrate factory with core platform and CI
**Date analyzed:** 2026-06-15 (Phase R1)
**Scope:** Read-only decomposition report (no code movement performed)

---

## Summary

| Category | Files | +LOC | −LOC | % insertions |
|----------|-------|------|------|--------------|
| **Auditos** | 8 | 778 | 3 | 2.3% |
| **Platform** | 172 | 32,101 | 247 | 94.3% |
| **Shared** | 0 | 0 | 0 | 0.0% |
| **Other** | 33 | 1,176 | 740 | 3.5% |

---

## AuditOS Scope (keep in factory PR)

- `src/__tests__/integration/tb-upload-mapping-fs.integration.test.ts` (+277/−0)
- `src/lib/audit/intelligence/intelligence-engine.ts` (+173/−0)
- `cypress/e2e/audit-factory.cy.ts` (+88/−0)
- `src/lib/audit/intelligence/__tests__/intelligence.test.ts` (+80/−0)
- `src/lib/audit/intelligence/enrichment-builder.ts` (+80/−0)
- `src/lib/audit/intelligence/types.ts` (+39/−0)
- `src/lib/audit/intelligence/index.ts` (+32/−0)
- `src/lib/audit/__tests__/audit-ai-bridge.test.ts` (+9/−3)

## Platform + Integration Scope (recommended follow-up PR)

- `src/lib/platform/content-studio/__tests__/content-studio.test.ts` (+936/−0)
- `src/lib/platform/org-advanced/__tests__/org-adv.test.ts` (+914/−0)
- `src/lib/platform/sales-intelligence/__tests__/sales-intel.test.ts` (+907/−0)
- `src/lib/platform/audit-risk/__tests__/audit-risk.test.ts` (+848/−0)
- `src/lib/platform/institutional-memory/institutional-memory-service.ts` (+842/−0)
- `src/lib/platform/audit-bridge/__tests__/audit-bridge.test.ts` (+788/−0)
- `src/lib/platform/abac/__tests__/abac.test.ts` (+775/−0)
- `src/lib/platform/audit-bridge/audit-bridge-service.ts` (+746/−0)
- `src/lib/platform/sales-intelligence/sales-intel-service.ts` (+730/−0)
- `src/lib/platform/content-studio/content-studio-service.ts` (+708/−0)
- `src/lib/platform/office-ai-adv/__tests__/office-ai-adv.test.ts` (+692/−0)
- `src/lib/integration/secret-resolver.ts` (+686/−0)
- `src/lib/platform/sampling/__tests__/sampling.test.ts` (+676/−0)
- `src/lib/platform/audit-risk/audit-risk-engine.ts` (+654/−0)
- `src/lib/platform/cross-product-ai/cross-product-ai-service.ts` (+619/−0)
- `src/lib/platform/institutional-memory/__tests__/institutional-memory.test.ts` (+618/−0)
- `src/lib/platform/decision-gov/__tests__/decision-gov.test.ts` (+584/−0)
- `src/lib/platform/cross-product-ai/__tests__/cross-product-ai.test.ts` (+583/−0)
- `src/lib/platform/office-ai-adv/office-ai-adv-service.ts` (+543/−0)
- `src/lib/platform/org-advanced/org-adv-service.ts` (+506/−0)
- `src/lib/platform/sampling/sampling-engine.ts` (+483/−0)
- `src/lib/local-content/erp/__tests__/connector-factory.test.ts` (+478/−0)
- `src/lib/platform/decision-gov/decision-gov-service.ts` (+476/−0)
- `src/lib/platform/access/rbac-service.ts` (+457/−0)
- `src/lib/platform/model-governance/__tests__/model-governance.test.ts` (+433/−0)
- `src/lib/integration/failover-engine.ts` (+432/−0)
- `src/lib/platform/secrets/__tests__/vault.test.ts` (+415/−0)
- `src/lib/integration/types.ts` (+377/−0)
- `src/lib/platform/audit/__tests__/hash-chain.test.ts` (+377/−0)
- `src/lib/platform/access/__tests__/sod.test.ts` (+376/−0)
- `src/lib/platform/abac/abac-service.ts` (+367/−0)
- `src/lib/platform/secrets/vault-service.ts` (+358/−0)
- `src/lib/platform/model-governance/model-governance-service.ts` (+345/−0)
- `src/lib/integration/provider-registry.ts` (+341/−0)
- `src/lib/local-content/erp/dynamics-connector.ts` (+306/−0)
- `src/lib/integration/__tests__/integration-flow.test.ts` (+297/−0)
- `src/lib/platform/download/download-gate.ts` (+279/−0)
- `src/lib/platform/access/sod-service.ts` (+269/−0)
- `src/lib/platform/storage/__tests__/s3-storage-provider.test.ts` (+267/−0)
- `src/lib/platform/encryption/__tests__/encryption.test.ts` (+260/−0)
- `src/lib/integration/resolver.ts` (+249/−0)
- `src/lib/platform/secrets/key-rotation.ts` (+247/−0)
- `src/lib/integration/factory-registry.ts` (+246/−0)
- `src/lib/platform/encryption/key-management.ts` (+241/−0)
- `src/lib/integration/__tests__/provider-registry.test.ts` (+231/−0)
- `src/lib/integration/health-runtime.ts` (+227/−0)
- `src/__tests__/unit/secret-resolver-concurrency.test.ts` (+223/−0)
- `src/lib/platform/encryption/encryption-service.ts` (+217/−0)
- `src/components/local-content/verification-checklist-view.tsx` (+210/−0)
- `src/lib/platform/download/__tests__/download.test.ts` (+210/−0)
- `src/lib/platform/audit/hash-chain.ts` (+194/−0)
- `src/lib/integration/circuit-alerts.ts` (+192/−0)
- `src/__tests__/unit/secret-resolver-rotation.test.ts` (+188/−0)
- `src/lib/platform/audit/audit-store.ts` (+186/−0)
- `src/lib/platform/storage/s3-storage-provider.ts` (+186/−0)

*…and 117 more platform/integration files*

## Other (docs / CI / config)

- `docs/content/aqliya-website-content-professional-CLAUDE.md` (+269/−194)
- `src/app/(dashboard)/settings/ai/page.tsx` (+231/−0)
- `docs/content/website-content-rewrite-v3-hybrid.md` (+180/−381)
- `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` (+105/−62)
- `src/app/login/page.tsx` (+81/−34)
- `CLAUDE.md` (+80/−12)
- `src/__tests__/unit/workflow-gating.test.ts` (+49/−1)
- `docs/official/AQLIYA_MASTER_REFERENCE.md` (+28/−10)
- `.env.example` (+26/−0)
- `docs/official/aqliya-vision-v1.1.md` (+19/−1)
- `docs/official/aqliya-product-taxonomy-v1.1.md` (+16/−12)
- `src/__mocks__/prisma-client-mock.js` (+16/−0)
- `docs/official/aqliya-core-architecture-v1.1.md` (+11/−2)
- `src/app/(dashboard)/monitoring/page.tsx` (+10/−0)
- `cypress/support/commands.ts` (+8/−17)
- `docs/product/auditos-commercial-operating-system.md` (+5/−1)
- `next.config.mjs` (+5/−0)
- `.github/workflows/ci.yml` (+4/−1)
- `docs/commercial/README.md` (+3/−1)
- `docs/company/README.md` (+3/−1)
- `docs/product/aqliya-product-comparison-and-recommendation.md` (+3/−2)
- `docs/product/auditos-commercial-master-index.md` (+3/−1)
- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` (+3/−1)
- `docs/source-of-truth/AQLIYA-company-product-architecture-official.md` (+2/−0)
- `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` (+2/−0)
- `docs/source-of-truth/AQLIYA_THEORETICAL_DOCUMENTATION_SYSTEM.md` (+2/−0)
- `docs/source-of-truth/ENTERPRISE_COMPLETION_ROADMAP.md` (+2/−0)
- `docs/source-of-truth/ROUTE_STRATEGY.md` (+2/−0)
- `docs/systems/README.md` (+2/−0)
- `docs/systems/decisionos/README.md` (+2/−0)
- `docs/systems/salesos/README.md` (+2/−0)
- `src/__tests__/i18n/no-english-strings.test.ts` (+2/−1)
- `src/app/(marketing)/buyers/procurement/page.tsx` (+0/−5)

---

## Recommendation

| Slice | Verdict |
|-------|---------|
| AuditOS under `src/lib/audit/*`, factory Cypress, TB integration test (~778 LOC) | **KEEP** in factory PR |
| Platform L0 + AI/integration modules (~32,101 LOC) | **SPLIT** into follow-up PR `platform/l0-integration-modules` |
| Docs/CI delta | **KEEP** with factory PR or split with platform |

### Suggested follow-up PR

**Branch:** `platform/l0-integration-modules`

**Includes:** `src/lib/platform/*`, `src/lib/ai/*`, `src/lib/integration/*`, middleware, local-content ERP, vault, ABAC, sampling, content-studio, encryption, org-advanced, institutional-memory, model-governance.

**Rationale:** ~84% of `58e4021` insertions are platform/integration surface area, not AuditOS factory memory. Splitting reduces first-push review load while preserving factory commits 1–9 intact.
