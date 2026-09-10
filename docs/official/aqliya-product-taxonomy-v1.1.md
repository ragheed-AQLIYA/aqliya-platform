# Taxonomy Layers

﻿# AQLIYA Product Taxonomy v1.1

**Version:** 1.1  
**Status:** Official — aligned to v0.1 operational baseline  
**Owner:** Governance Team  
**Last Reviewed:** 2026-09-06 — P0 Governance Freeze alignment  
**Aligned with:** `AQLIYA_MASTER_REFERENCE.md`, `aqliya-vision-v1.1.md`, `aqliya-roadmap-v1.1.md`  
**Note:** Per ADR-109 (2026-07-19), L6 claims suspended to L5 Pilot-ready (conditional) for all products except DecisionOS.

> **⚠️ P0 GOVERNANCE FREEZE (ADR-109 — 2026-07-19):**
> All maturity levels below reflect L5 Pilot-ready (conditional) status. DecisionOS remains L6.

---

## Taxonomy Layers

```
AQLIYA Platform Company
├── AQLIYA Intelligence Core (shared platform layer)
│   ├── AI Orchestration Engine
│   ├── Governance Engine
│   ├── Workflow Engine
│   ├── Evidence Graph
│   ├── RBAC / Permissions
│   ├── Audit Logs
│   ├── Document Intelligence
│   ├── Reporting Engine
│   ├── Knowledge Foundation (governance capability — L5 pilot-ready conditional)
│   └── Deployment Layer
├── Shared Applications (built on Core)
│   └── Office AI Assistant (L5 pilot-ready conditional)
├── Specialized Operating Systems (capabilities — built on Core)
│   ├── AuditOS                 (audit workflow — L5 pilot-ready conditional)
│   │   └── Sampling            (internal workspace — L3 Prototype)
│   ├── DecisionOS              (decision governance — **L6**)
│   ├── LocalContentOS          (local content & supply chain — L5 pilot-ready conditional)
│   ├── LocalContactOS          (relationship workspace — L5 pilot-ready conditional)
│   ├── RiskOS                  (risk workspace — L5 pilot-ready conditional, not standalone)
│   ├── SalesOS                 (commercial intelligence — L5 pilot-ready conditional)
│   └── SimulationOS            (capability label only)
├── Custom / Client-Specific Workspaces
│   ├── WorkflowOS (canonical governed workspace — L5 pilot-ready conditional)
│   └── Sunbul (legacy redirect alias to WorkflowOS)
├── Operational Content Workspace
│   └── ContentStudio (content workspace — L5 pilot-ready conditional)
├── Internal Prototype Surfaces (code reality)
│   └── Organizations, /settings main page (L2–L5)
├── Future Systems (not yet implemented)
│   ├── ComplianceOS
│   ├── LegalOS
│   └── GovOS
└── Strategic Platform Layer
    └── AQLIYA Studio
```

> **Language note (2026-06-09):** What were previously called "Products / Systems" are now referred to as "Specialized Operating Systems" in public-facing materials. This reflects the repositioning of AQLIYA as a platform first, with capabilities surfaced inside the platform rather than as standalone products. The internal codebase may still use "product" terminology in places; the public-facing language shift is the priority.

---

## Release Classification Model

### Release Inclusion Status

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

### Product/System Maturity

- L0 Concept
- L1 Marketing
- L2 Shell
- L3 Prototype
- L4 Usable v0.1
- L5 Pilot-ready
- L6 Production-hardened

### Customer Demo Status

- Safe to show
- Safe to show with explanation
- Internal only
- Demo only
- Do not show as implemented

---

## Current Classification Matrix

| Area                    | Taxonomy Layer                     | Release Inclusion Status                | Maturity                       | Customer Demo Status          |
| ----------------------- | ---------------------------------- | --------------------------------------- | ------------------------------ | ----------------------------- |
| **AQLIYA Platform**     | Platform layer                     | Included in v0.1                        | L5 Pilot-ready (conditional)   | Safe to show with explanation |
| **Intelligence Core**   | Platform layer                     | Included in v0.1                        | L5 Pilot-ready (conditional)   | Safe to show with explanation |
| **AuditOS**             | Product / System                   | Included as pilot-ready product         | L5 Pilot-ready (conditional)   | Safe to show                  |
| **DecisionOS**          | Product / System                   | Included as active adjacent system      | **L6 Production-hardened**     | Safe to show with explanation |
| **LocalContentOS**      | Product / System                   | Included as pilot-ready product         | L5 Pilot-ready (conditional)   | Safe to show with explanation |
| **SalesOS**             | Product / System                   | Included as pilot-ready product         | L5 Pilot-ready (conditional)   | Safe to show with explanation |
| **RiskOS**              | AuditOS-adjacent risk workspace    | Included as pilot-ready product         | L5 Pilot-ready (conditional)   | Safe with context             |
| **LocalContactOS**      | Product / System                   | Included as pilot-ready product         | L5 Pilot-ready (conditional)   | Safe to show with explanation |
| **Institutional Memory**| Governance/data capability         | Included as pilot-ready product         | L5 Pilot-ready (conditional)   | Safe to show with explanation |
| **Knowledge Foundation**| Governance capability              | Included in v0.1                        | L5 Pilot-ready (conditional)   | Safe to show with explanation |
| **ContentStudio**       | Operational Content Workspace      | Included as pilot-ready product         | L5 Pilot-ready (conditional)   | Safe to show with explanation |
| **Office AI Assistant** | Shared Application                 | Included as governed shared application | L5 Pilot-ready (conditional)   | Safe to show with explanation |
| **WorkflowOS**          | Custom / Client-Specific Workspace | Included as governed workspace          | L5 Pilot-ready (conditional)   | Safe to show with explanation |
| **Sunbul**              | Custom / Client-Specific Workspace | Legacy alias / redirect to WorkflowOS   | N/A                            | Internal only                 |
| **auditos demo**        | Demo                               | Included as demo only                   | L1 Marketing                   | Demo only                     |
| **SimulationOS**        | Marketing capability label         | Do not claim as live                    | L1 Marketing                   | Do not show as implemented    |
| **SSO (SAML/OIDC)**     | Enterprise auth capability         | Included in v0.1                        | L5 Pilot-ready (conditional)   | Safe to show with explanation |
| **SCIM v2 Provisioning**| Identity management                | Included in v0.1                        | L5 Pilot-ready (conditional)   | Safe to show with explanation |
| **ComplianceOS**        | Product / System                   | Not implemented                         | L0 Concept                     | Do not show as implemented    |
| **LegalOS**             | Product / System                   | Not implemented                         | L0 Concept                     | Do not show as implemented    |
| **GovOS**               | Product / System                   | Not implemented                         | L0 Concept                     | Do not show as implemented    |
| **AQLIYA Studio**       | Strategic platform layer           | Strategic / future                      | L0 Concept                     | Do not show as implemented    |

---

## Shared Applications

Shared applications are governed tools built on AQLIYA Intelligence Core. They are not standalone products at the same level as AuditOS or LocalContentOS.

### Office AI Assistant

- Current status: Shared application, not primary product
- Current route family: `/assistant`, `/assistant/[taskId]`
- Current data backing: `OfficeAiTask`, `OfficeAiOutput`, `OfficeAiFile`
- Current boundary: deterministic/governed assistant, not a broad autonomous AI runtime

### LocalContentOS

- Current status: **L5 Pilot-ready (conditional)** per P0 governance freeze (ADR-109). All 9 LC gaps closed.
- Current route family: `/local-content/*` (27 routes with full error/loading/not-found boundaries)
- Current data backing: `LocalContentProject`, `LocalContentSupplier`, `LocalContentSpendRecord`, `LocalContentClassification`, `LocalContentFinding`, `LocalContentEvidence`, `LocalContentApproval`, seed data, scoring engine, ERP integration
- AI quality: 100% pilot readiness (7/7 GREEN), 95% acceptance, 88% confidence gradient
- Arabic PDF font fidelity: Noto Naskh Arabic embedded via shared font registry
- Multi-reviewer approval routing with state machine (awaiting_reviews→ready_for_approval→approved/rejected)
- ERP integration: SAP/Oracle/CSV importers at /local-content/settings/integrations
- Quality Dashboard + Review Center with bilingual PDF export
- 265+ tests PASS
- Must not be claimed as regulator-certified

---

## Custom / Client-Specific Workspaces

### WorkflowOS

- Canonical governed workspace
- Real CRUD, workflow states, audit trail, PDF export
- Routes at `/workflowos/*`
- Should be presented as a custom/client-specific governed workspace, not as a default core AQLIYA product claim

### Sunbul

- Legacy redirect alias to WorkflowOS
- Every route is a `permanentRedirect(302)` to the matching `/workflowos/*` route
- No standalone components, no data, no UI, no persistence
- Pure redirect — preserved for backward compatibility

---

## Boundaries

1. AQLIYA is the platform.
2. Products, shared applications, demos, and custom workspaces are not interchangeable.
3. Marketing-only pages must never be described as implemented operational systems.
4. Custom/internal workspaces must not be silently hidden if they exist in code.
5. Future systems must remain future until route, data, workflow, governance, and validation evidence exist.
