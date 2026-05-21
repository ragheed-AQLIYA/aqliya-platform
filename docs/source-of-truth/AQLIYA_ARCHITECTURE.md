# AQLIYA Architecture (aligned with v1.1)

## Official Hierarchy

```
AQLIYA Company
├── AQLIYA Intelligence Core (shared platform layer)
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
├── Shared Applications (built on Core)
│   └── Office AI Assistant      (/assistant) — real governed shared application, not standalone product
├── AQLIYA Studio (custom systems layer)
├── Systems (products — built on Core)
│   ├── AuditOS                 (active, workspace + demo, first proof product)
│   ├── DecisionOS              (active, workspace, adjacent system)
│   ├── SalesOS                 (prototype only)
│   ├── SimulationOS            (marketing-only label)
│   └── Local Content OS        (strategic second product, not implemented)
├── Custom / Client-Specific Workspaces
│   ├── Sunbul                  (/sunbul) — real governed custom workflow workspace
│   └── workflowos              (/workflowos) — route alias/duplicate over Sunbul implementation
├── Workspaces (execution environments)
│   ├── AuditOS Workspace       (/audit)  — governed operational environment
│   ├── DecisionOS Workspace    (/decisions, /intelligence/sectors)
│   ├── Office AI Workspace     (/assistant) — shared application workspace
│   ├── Sunbul Workspace        (/sunbul) — custom client-specific execution environment
│   ├── workflowos Workspace    (/workflowos) — duplicated alias workspace
│   ├── Organizations Surface   (/organizations) — protected prototype only
│   ├── Generic Settings        (/settings) — protected prototype only
│   └── SalesOS Workspace       (/sales)  — prototype/dashboard only
├── Governance (cross-cutting)
│   ├── Validation
│   ├── Traceability
│   ├── Publication
│   ├── Audit Trail
│   └── Admin
├── Demos
│   └── AuditOS Guided Demo     (/auditos)  — public, mock-backed, unauthenticated
└── Marketing Pages
    ├── Homepage                (/)
    ├── Products Catalog        (/products)
    ├── Product Detail Pages    (/products/*)
    └── Custom Product Inquiry  (/custom-product)

Future products (not yet implemented): LocalContactOS, RiskOS, ComplianceOS, LegalOS, GovOS.
Deployment models: Cloud (active), Private/On-Prem (strategic — not yet implemented), Air-Gapped (strategic — not yet implemented).
```

## Layer Definitions

- **Company**: The legal and brand entity. Must not be confused with any one product.
- **System**: A named product or product line with its own route, data model, and purpose.
- **Shared Application**: A governed application built on AQLIYA Core that is real in code but not a standalone product category.
- **Custom Workspace**: A real governed implementation for a client-specific or custom workflow that should not be overpromoted into a platform-wide product claim.
- **Workspace**: A governed operational execution environment with auth, access control, and durable data.
- **Demo**: A guided, read-only, mock-backed walkthrough. Must be explicitly labeled as a demo.
- **Marketing Page**: Public-facing content describing a capability. OK to exist without a workspace.

## Route Model

| Route                                    | Purpose                                     | Layer                  |
| ---------------------------------------- | ------------------------------------------- | ---------------------- |
| `/`                                      | AQLIYA Company homepage                     | Company/Marketing      |
| `/audit`                                 | AuditOS governed workspace                  | Workspace              |
| `/auditos`                               | AuditOS guided demo                         | Demo                   |
| `/decisions`                             | DecisionOS workspace                        | Workspace              |
| `/assistant`                             | Office AI Assistant shared workspace        | Shared Application     |
| `/sunbul`                                | Sunbul custom governed workspace            | Custom Workspace       |
| `/workflowos`                            | workflowos alias over Sunbul implementation | Custom Workspace Alias |
| `/organizations`                         | Protected mock organizations surface        | Workspace/Prototype    |
| `/settings`                              | Protected generic settings preview          | Workspace/Prototype    |
| `/sales`                                 | SalesOS prototype dashboard                 | Workspace/Prototype    |
| `/products/simulation`                   | SimulationOS marketing page                 | Marketing              |
| `/products/local-content`                | Local Content OS marketing page             | Marketing              |
| `/products/*`                            | Product detail pages                        | Marketing              |
| `/custom-product`                        | Custom product inquiry                      | Company                |
| `/login`, `/access-denied`               | Auth                                        | Internal               |
| `/published/recommendation/[decisionId]` | Legacy published decision view              | Legacy                 |

## Reality Alignment Notes

- `Office AI Assistant` is implemented in code today as a governed shared application, even though some official v1.1 documents still describe it as planned.
- `Sunbul` and `workflowos` are real route families and must remain visible in architecture documentation; however, they are currently best classified as custom/client-specific workspace surfaces rather than core AQLIYA product-family products.
- `workflowos` does not have a distinct domain schema. It currently reuses Sunbul components, actions, and models.
- `/organizations`, `/settings`, and `/sales` are protected surfaces but do not yet meet v0.1 workspace completeness requirements.
