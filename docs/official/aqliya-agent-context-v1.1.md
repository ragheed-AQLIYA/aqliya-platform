# AQLIYA Agent Context v1.1

**Purpose:** Mandatory context for any coding or documentation agent working on the AQLIYA repository.  
**Version:** 1.1  
**Status:** Official — agent context for v0.1 operational baseline  
**Owner:** Governance Team  
**Last Reviewed:** 2026-09-06 — P0 Governance Freeze alignment  
**Note:** Updated to reflect current L5/L6 status per PRODUCT_STATUS_MATRIX.md.

---

## Read First

1. `docs/official/aqliya-vision-v1.1.md`
2. `docs/official/aqliya-product-taxonomy-v1.1.md`
3. `docs/official/aqliya-core-architecture-v1.1.md`
4. `docs/official/aqliya-roadmap-v1.1.md`
5. `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`
6. `docs/source-of-truth/ROUTE_STRATEGY.md`
7. `docs/source-of-truth/AQLIYA_ARCHITECTURE.md`
8. `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md`
9. `docs/releases/aqliya-v0.1-release-scope.md`

---

## Critical Identity Rules

1. AQLIYA is a Private Governed Institutional Intelligence Platform.
2. AuditOS is the first proof product, not the whole platform.
3. DecisionOS is a real active adjacent system.
4. Office AI Assistant is a real governed shared application, not a standalone product.
5. WorkflowOS is the canonical governed workspace at `/workflowos/*` (L5 Pilot-ready).
6. Sunbul is a legacy redirect alias to WorkflowOS only (`/sunbul/*` → `/workflowos/*`); not a separate product or workspace.

- LocalContentOS is L5 Pilot-ready (conditional) per P0 governance freeze. SalesOS is L5 Pilot-ready (conditional) with 878+ tests.

8. Private/On-Prem, Air-Gapped, Local AI, Studio, and Model Governance are not implemented. Institutional Memory is L5 Pilot-ready (conditional). SSO/SAML is L5 Pilot-ready (conditional) with 65 tests. SCIM v2 is L5 Pilot-ready (conditional).

---

## Release Classification Rules

Use these exact labels when classifying repository reality:

- Included in v0.1
- Included as pilot-ready product
- Included as active adjacent system
- Included as governed shared application
- Included as custom/internal workspace
- Included as demo only
- Prototype / internal preview
- Strategic / future
- Not implemented
- Do not claim as live

---

## Current v0.1 Scope Baseline

| Area                | Status                                         |
| ------------------- | ---------------------------------------------- |
| AuditOS             | Included as pilot-ready product — L5 (P0 freeze) |
| DecisionOS          | Included as active adjacent system — **L6**    |
| Office AI Assistant | Included as governed shared application — L5 (P0 freeze) |
| WorkflowOS          | Included as governed workspace — L5 (P0 freeze) |
| Sunbul              | Redirect alias only (not separate surface)     |
| auditos             | Included as demo only                          |
| SalesOS             | Included as pilot-ready product — L5 (P0 freeze) |
| LocalContentOS      | Included as pilot-ready product — L5 (P0 freeze) |
| RiskOS              | Included as pilot-ready product — L5 (P0 freeze) |
| LocalContactOS      | Included as pilot-ready product — L5 (P0 freeze) |
| ContentStudio       | Included as pilot-ready product — L5 (P0 freeze) |
| Knowledge Foundation| Included in v0.1 — L5 (P0 freeze)              |
| Institutional Memory| Included as pilot-ready product — L5 (P0 freeze) |
| SSO (SAML/OIDC)     | Included in v0.1 — L5 (P0 freeze)              |
| SCIM v2             | Included in v0.1 — L5 (P0 freeze)              |

---

## Non-Negotiable Claims Discipline

Do not claim these as live unless code, validation, and routes prove them:

- On-Prem production package
- Air-Gapped deployment
- Local AI runtime
- AQLIYA Studio builder
- Model Governance registry
- ComplianceOS / LegalOS / GovOS product implementations
