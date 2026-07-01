# ERP Integration Tests — Decision Record

**Status:** Deferred  
**Date:** 2026-07-01  
**Author:** Platform Engineering  
**Context:** P1-B8 — ERP integration test infrastructure

## Current Status

ERP integration code exists at `src/lib/local-content/erp/` with:

| File | Purpose |
|------|---------|
| `connector.ts` | Abstract ERP connector interface |
| `connector-factory.ts` | Factory to create connector instances |
| `sap-connector.ts` | SAP connector implementation |
| `oracle-connector.ts` | Oracle EBS connector implementation |
| `dynamics-connector.ts` | Microsoft Dynamics connector implementation |
| `odoo-connector.ts` | Odoo connector implementation |
| `import-pipeline.ts` | Import pipeline orchestration |
| `field-mapping.ts` | Field mapping logic |
| `file-importer.ts` | File-based import support |
| `services.ts` | Higher-level service layer |
| `types.ts` | Shared types |
| `index.ts` | Public exports |

**Test files** exist at `src/lib/local-content/erp/__tests__/`:

- `import-pipeline.test.ts` — Unit tests with mocked Prisma + connector factory
- `file-importer.test.ts` — Unit tests for file import logic
- `field-mapping.test.ts` — Unit tests for field mapping
- `connector-factory.test.ts` — Unit tests for tenant isolation and credential resolution

**All existing tests are unit-level with mocks.** There are no integration tests that connect to a real or simulated ERP instance.

## ERP Test Instance Availability

| System | Status | Notes |
|--------|--------|-------|
| SAP S/4HANA | Not provisioned | Requires SAP Cloud Appliance Library or dedicated sandbox |
| Oracle EBS | Not provisioned | Requires Oracle test environment |
| Microsoft Dynamics 365 | Not provisioned | Requires Dynamics 365 trial or sandbox tenant |
| Odoo | Not provisioned | Odoo CE can be self-hosted; Odoo.sh requires subscription |
| CSV/File import | Partial | No test fixtures for large or edge-case datasets |

## Recommendation

**Defer ERP integration tests until at least one ERP test instance is provisioned.**

Rationale:

1. ERP connectors are adapter patterns wrapping HTTP API calls. The unit tests with mocked connector interfaces validate the pipeline logic correctly without a live system.
2. Provisioning any ERP test instance requires:
   - Vendor relationship or trial account (SAP, Oracle, Microsoft)
   - Network/security configuration for API access
   - Test data seeding in the ERP system
   - Credential management for CI/CD
3. The cost of maintaining fake ERP test doubles (simulated API responses) outweighs the benefit until a real instance is available.
4. When the first ERP test instance is provisioned, the connector interface (`ErpConnector` in `connector.ts`) is designed to be testable via dependency injection, making integration test addition straightforward.

## Required Before Integration Tests Can Proceed

- [ ] Provision at least one ERP test instance (SAP CAL, Dynamics 365 trial, or self-hosted Odoo)
- [ ] Configure network access and API credentials
- [ ] Create seed data in the ERP system (suppliers, purchase orders, spend records)
- [ ] Add ERP credentials to CI/CD secrets
- [ ] Write integration tests using the provisioned instance
- [ ] Document the test ERP instance setup in `CONTRIBUTING.md` or a runbook

## Next Step

Revisit this decision when the first ERP integration partner is onboarded or when a test instance is provisioned for development purposes.
