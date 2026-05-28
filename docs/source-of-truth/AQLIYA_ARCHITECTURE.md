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
│   └── LocalContentOS          (workspace at /local-content/*, L5 pilot-ready with conditions, strategic second product)
├── Custom / Client-Specific Workspaces
│   └── WorkflowOS              (/workflowos) — real governed custom workflow workspace (canonical)
├── Workspaces (execution environments)
│   ├── AuditOS Workspace       (/audit)  — governed operational environment
│   ├── DecisionOS Workspace    (/decisions, /intelligence/sectors)
│   ├── Office AI Workspace     (/assistant) — shared application workspace
│   ├── WorkflowOS Workspace    (/workflowos) — canonical custom client-specific execution environment
│   ├── Sunbul Workspace        (/sunbul) — legacy redirect alias to /workflowos
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
- **Custom Workspace Alias**: A legacy redirect alias to a custom workspace. No independent components, data, or UI.
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
| `/workflowos`                            | WorkflowOS governed workspace               | Custom Workspace       |
| `/sunbul`                                | Sunbul legacy redirect alias to /workflowos | Custom Workspace Alias |
| `/organizations`                         | Protected mock organizations surface        | Workspace/Prototype    |
| `/settings`                              | Protected generic settings preview          | Workspace/Prototype    |
| `/sales`                                 | SalesOS prototype dashboard                 | Workspace/Prototype    |
| `/products/simulation`                   | SimulationOS marketing page                 | Marketing              |
| `/local-content`                         | LocalContentOS governed workspace           | Workspace              |
| `/products/local-content`                | Local Content OS marketing page             | Marketing              |
| `/products/*`                            | Product detail pages                        | Marketing              |
| `/custom-product`                        | Custom product inquiry                      | Company                |
| `/login`, `/access-denied`               | Auth                                        | Internal               |
| `/published/recommendation/[decisionId]` | Legacy published decision view              | Legacy                 |

## Download Security Standard

Every file download API route must implement these three layers in order:

1. **Authentication** — Require valid session at entry (`requireUserContext`, `getCurrentUser`, or `getAuditActor`).
2. **Tenant-safe access** — Return **404 on any failure** (not found, wrong org, no storage key). Never return 403 for "exists but not yours" — this leaks record existence.
3. **Audit trail** — Log successful downloads via `writePlatformAuditLog` with fields: `productKey`, `action`, `platformOrganizationId`, `actorId`, `actorType`, `actorName`, `targetType`, `targetId`, `targetLabel`, `sourceSystem`, `status: "success"`.

Response headers must include `Cache-Control: private, no-store` and `X-Content-Type-Options: nosniff`.

**Enforced on**: Sunbul documents, Office AI outputs, AuditOS evidence, DecisionOS evidence, LocalContentOS evidence.

## Reality Alignment Notes

- `Office AI Assistant` is implemented in code today as a governed shared application, even though some official v1.1 documents still describe it as planned.
- `Sunbul` and `workflowos` are real route families and must remain visible in architecture documentation; however, they are currently best classified as custom/client-specific workspace surfaces rather than core AQLIYA product-family products.
- `workflowos` does not have a distinct domain schema. It currently reuses Sunbul components, actions, and models.
- `/organizations`, `/settings`, and `/sales` are protected surfaces but do not yet meet v0.1 workspace completeness requirements.
- `LocalContentOS` is implemented as a governed workspace at `/local-content/*` with 12 routes, server actions, seed data, bilingual UI, evidence upload, protected evidence/report downloads, review/approval, binary PDF/XLSX exports (pdfkit + xlsx), and audit trail. Status: L5 pilot-ready with conditions — not L6 production-hardened. Arabic PDF font rendering is P2 quality gap. See `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` for current maturity details.
- `DecisionOS` now includes stored evidence files plus protected evidence download routes under `/api/decisions/[decisionId]/evidence/[evidenceId]/download`, in addition to governed export preparation inside the workspace.
- **Schema v0.2 (2026-05-28)**:
  - `createdById: String?` added to 10 models: PlatformOrganization, ClientWorkspace, Project, AuditOrganization, AuditUser, AuditClient, AuditEngagement, AuditFinding, LocalContentSupplier, LocalContentSpendRecord
  - `DecisionEvidence` model added with document fields linked to Decision (rbac check + DecisionEvidence.organizationId for tenant isolation)
  - `platformOrganizationId: String?` added to SunbulClient for tenant isolation from platform organizations
  - Migration applied: `add_governance_fields_v0_2`
  - 14 AuditOS Prisma enums attempted but reverted to `String @default(...)` due to value mismatch with existing codebase; application-level types in `src/types/audit/index.ts` continue to provide type safety
