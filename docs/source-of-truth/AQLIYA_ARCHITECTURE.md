# AQLIYA Architecture

## Official Hierarchy

```
AQLIYA Company
├── Systems (products)
│   ├── AuditOS                 (active, workspace + demo)
│   ├── DecisionOS              (active, workspace)
│   ├── SalesOS                 (prototype, static dashboard)
│   ├── SimulationOS            (marketing-only)
│   └── Local Content OS        (marketing-only)
├── Workspaces (execution environments)
│   ├── AuditOS Workspace       (/audit)  — governed operational environment
│   ├── DecisionOS Workspace    (/decisions, /organizations, /intelligence/sectors)
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
    ├── About / How We Work / Contact
    └── Custom Product Inquiry  (/custom-product)
```

## Layer Definitions

- **Company**: The legal and brand entity. Must not be confused with any one product.
- **System**: A named product or product line with its own route, data model, and purpose.
- **Workspace**: A governed operational execution environment with auth, access control, and durable data.
- **Demo**: A guided, read-only, mock-backed walkthrough. Must be explicitly labeled as a demo.
- **Marketing Page**: Public-facing content describing a capability. OK to exist without a workspace.

## Route Model

| Route | Purpose | Layer |
|---|---|---|
| `/` | AQLIYA Company homepage | Company/Marketing |
| `/audit` | AuditOS governed workspace | Workspace |
| `/auditos` | AuditOS guided demo | Demo |
| `/decisions` | DecisionOS workspace | Workspace |
| `/sales` | SalesOS prototype dashboard | Workspace/Prototype |
| `/products/simulation` | SimulationOS marketing page | Marketing |
| `/products/local-content` | Local Content OS marketing page | Marketing |
| `/products/*` | Product detail pages | Marketing |
| `/about`, `/contact`, `/how-we-work` | Company pages | Company |
| `/custom-product` | Custom product inquiry | Company |
| `/login`, `/access-denied` | Auth | Internal |
| `/published/recommendation/[decisionId]` | Legacy published decision view | Legacy |
