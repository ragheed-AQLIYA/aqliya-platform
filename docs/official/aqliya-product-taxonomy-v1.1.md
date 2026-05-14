# AQLIYA Product Taxonomy v1.1

**Version:** 1.1
**Status:** Official — supersedes previous product definitions
**Aligned with:** `aqliya-vision-v1.1.md`, `aqliya-roadmap-v1.1.md`

---

## Taxonomy Layers

```
AQLIYA Company
├── AQLIYA Intelligence Core (platform layer)
│   ├── AI Orchestration Engine
│   ├── Governance Engine
│   ├── Workflow Engine
│   ├── Evidence Graph
│   ├── Institutional Memory
│   ├── RBAC / Permissions
│   ├── Audit Logs
│   ├── Model Governance
│   ├── Document Intelligence
│   ├── Reporting Engine
│   └── Deployment Layer
├── Products (built on Core)
│   ├── AuditOS (Phase 2 — primary, pilot-ready)
│   ├── LocalContentOS (Phase 5 — strategic second product)
│   ├── SalesOS (Phase 9 — future)
│   ├── LocalContactOS (Phase 9 — future)
│   ├── DecisionOS (adjacent system, active)
│   ├── RiskOS (Phase 10 — future)
│   ├── ComplianceOS (Phase 10 — future)
│   ├── LegalOS (Phase 11 — future)
│   └── GovOS (Phase 11 — future)
├── AQLIYA Studio (custom systems layer)
│   ├── Workflow builder
│   ├── Form builder
│   ├── Approval configuration
│   ├── Evidence model configuration
│   ├── AI prompt/action configuration
│   ├── Custom reports
│   ├── Custom roles
│   └── Custom policies
└── Deployment Models
    ├── Cloud Pilot
    ├── Cloud Enterprise
    ├── Private Cloud
    ├── On-Prem
    └── Air-Gapped Private AI
```

---

## Current Implementation Status

| Product | Has Workspace | Has DB Models | Has Server Actions | Has Audit Trail | Status |
|---|---|---|---|---|---|
| **AuditOS** | Yes (`/audit`) | Yes | Yes | Yes | Pilot-ready |
| **DecisionOS** | Yes (`/decisions`) | Yes | Yes | Yes | Active adjacent |
| **SalesOS** | Shell only (`/sales`) | No | No | No | Prototype |
| **SimulationOS** | No | No | No | No | Marketing only |
| **LocalContentOS** | No | No | No | No | Marketing only (strategic) |
| **Other products** | No | No | No | No | Future |

---

## Product Boundaries

- Each product has its own workspace route, data model, and purpose
- Products share the AQLIYA Intelligence Core engines (governance, workflow, evidence, AI, RBAC, audit logs)
- No product is AQLIYA itself — AQLIYA is the platform
- AuditOS is the first proof product, not the whole company
- LocalContentOS is the second strategic product, targeted at Saudi market

---

## Module Maturity Mapping

| Module | AuditOS | DecisionOS | Core Shared |
|---|---|---|---|
| User Management | Yes | Yes | Yes |
| Organization Management | Yes | Yes | Yes |
| Workspace Management | Yes | Yes | No |
| Evidence Linking | Yes | Partial | Partial |
| AI Assistant | Yes | No | Partial |
| Review Workflow | Yes | Partial | Partial |
| Approval Workflow | Yes | Yes | Partial |
| Audit Logs | Yes | Yes | Yes |
| Reporting/Export | Yes | No | Partial |
| Institutional Memory | No | No | No |
| Model Governance | No | No | No |
