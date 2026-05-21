# AQLIYA Product Taxonomy v1.1

**Version:** 1.1  
**Status:** Official — aligned to hardened repository reality  
**Aligned with:** `aqliya-vision-v1.1.md`, `aqliya-roadmap-v1.1.md`

---

## Taxonomy Layers

```
AQLIYA Company
├── AQLIYA Intelligence Core
│   ├── Shared Applications
│   │   └── Office AI Assistant
│   ├── AI Orchestration Engine
│   ├── Governance Engine
│   ├── Workflow Engine
│   ├── Evidence Graph
│   ├── RBAC / Permissions
│   ├── Audit Logs
│   ├── Document Intelligence
│   ├── Reporting Engine
│   └── Deployment Layer
├── Products / Systems
│   ├── AuditOS
│   ├── DecisionOS
│   ├── LocalContentOS
│   ├── SalesOS
│   ├── LocalContactOS
│   ├── RiskOS
│   ├── ComplianceOS
│   ├── LegalOS
│   └── GovOS
├── Custom / Client-Specific Workspaces
│   ├── Sunbul
│   └── workflowos
└── Strategic Platform Layer
    └── AQLIYA Studio
```

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

| Area                    | Taxonomy Layer                     | Release Inclusion Status                | Maturity       | Customer Demo Status          |
| ----------------------- | ---------------------------------- | --------------------------------------- | -------------- | ----------------------------- |
| **AuditOS**             | Product / System                   | Included as pilot-ready product         | L5 Pilot-ready | Safe to show                  |
| **DecisionOS**          | Product / System                   | Included as active adjacent system      | L4 Usable v0.1 | Safe to show with explanation |
| **Office AI Assistant** | Shared Application                 | Included as governed shared application | L4 Usable v0.1 | Safe to show with explanation |
| **Sunbul**              | Custom / Client-Specific Workspace | Included as custom/internal workspace   | L4 Usable v0.1 | Safe to show with explanation |
| **workflowos**          | Custom / Client-Specific Workspace | Included as custom/internal workspace   | L3 Prototype   | Internal only                 |
| **auditos demo**        | Demo                               | Included as demo only                   | L1 Marketing   | Demo only                     |
| **SalesOS**             | Product / System                   | Prototype / internal preview            | L3 Prototype   | Do not show as implemented    |
| **LocalContentOS**      | Product / System                   | Strategic / future                      | L1 Marketing   | Do not show as implemented    |
| **SimulationOS**        | Marketing capability label         | Do not claim as live                    | L1 Marketing   | Do not show as implemented    |
| **LocalContactOS**      | Product / System                   | Not implemented                         | L0 Concept     | Do not show as implemented    |
| **RiskOS**              | Product / System                   | Not implemented                         | L0 Concept     | Do not show as implemented    |
| **ComplianceOS**        | Product / System                   | Not implemented                         | L0 Concept     | Do not show as implemented    |
| **LegalOS**             | Product / System                   | Not implemented                         | L0 Concept     | Do not show as implemented    |
| **GovOS**               | Product / System                   | Not implemented                         | L0 Concept     | Do not show as implemented    |
| **AQLIYA Studio**       | Strategic platform layer           | Strategic / future                      | L0 Concept     | Do not show as implemented    |

---

## Shared Applications

Shared applications are governed tools built on AQLIYA Intelligence Core. They are not standalone products at the same level as AuditOS or LocalContentOS.

### Office AI Assistant

- Current status: real governed shared application
- Current route family: `/assistant`, `/assistant/[taskId]`
- Current data backing: `OfficeAiTask`, `OfficeAiOutput`, `OfficeAiFile`
- Current boundary: deterministic/governed assistant, not a broad autonomous AI runtime

---

## Custom / Client-Specific Workspaces

### Sunbul

- Real implemented workspace
- Governed multi-client workflow surface
- Should be presented as custom/client-specific, not as a default core AQLIYA product claim

### workflowos

- Real route family
- Currently reuses Sunbul components, actions, and Prisma models
- Must be treated as alias/duplicate/internal workflow surface until a distinct domain exists

---

## Boundaries

1. AQLIYA is the platform.
2. Products, shared applications, demos, and custom workspaces are not interchangeable.
3. Marketing-only pages must never be described as implemented operational systems.
4. Custom/internal workspaces must not be silently hidden if they exist in code.
5. Future systems must remain future until route, data, workflow, governance, and validation evidence exist.
