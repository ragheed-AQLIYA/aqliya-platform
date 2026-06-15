# AQLIYA System Taxonomy

> **Language note (2026-06-09):** Public-facing materials now refer to "Specialized Operating Systems" instead of "Products." The platform is positioned as an "institutional operating platform" first, with capabilities surfaced inside it. See `docs/official/AQLIYA_MASTER_REFERENCE.md §5b` for details.

## Terms

| Term                             | Definition                                                                       | Examples                                | Allowed Usage                                           | Forbidden Usage                                     |
| -------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------- | --------------------------------------------------- |
| **Company**                      | Parent legal and brand entity                                                    | AQLIYA                                  | Use as top-level identity                               | Do not present as a single product                  |
| **Platform Layer**               | Shared underlying technical/governance foundation                                | AQLIYA Intelligence Core                | Use for cross-product/shared foundations                | Do not market as a finished product                 |
| **Product / System**             | Named operational system with route, data, workflow, and governance purpose      | AuditOS, DecisionOS                     | Use for real operational systems                        | Do not apply to marketing-only pages                |
| **Shared Application**           | Governed application built on the Core but not a standalone product family       | Office AI Assistant                     | Use for real shared work-assistant style applications   | Do not reframe as product without explicit decision |
| **Custom Workspace**             | Real governed workspace tailored to a client-specific or custom workflow         | WorkflowOS                              | Use for the canonical governed workflow workspace       | Do not hide if it exists                            |
| **Legacy Redirect Alias**        | Permanent redirect route family to a canonical workspace                         | Sunbul                                  | Use only for legacy `/sunbul/*` redirect compatibility  | Do not describe as separate product or workspace     |
| **Demo**                         | Guided, read-only, mock-backed walkthrough                                       | `/auditos`                              | Use only for explicit demo surfaces                     | Do not present as live workspace                    |
| **Prototype / Internal Preview** | Incomplete or local-state-only workspace-like surface                            | `/sales`, `/organizations`, `/settings` | Use to label real but incomplete surfaces               | Do not present as v0.1-complete product             |
| **Marketing-only Product Page**  | Product description with no operational implementation                           | SimulationOS, SalesOS marketing page    | Use on `/products/*`                                    | Do not claim as working product                     |
| **Strategic / Future**           | Planned direction without implemented route/workflow/data proof                  | On-Prem, Air-Gapped, Studio, RiskOS     | Use for roadmap truthfulness                            | Do not present as available                         |

## Key Distinctions

### AuditOS

- `AuditOS` = product/system
- `/audit` = real governed workspace
- `/auditos` = demo only

### DecisionOS

- Real product/system
- Real workspace under `/decisions`
- Included in v0.1 as active adjacent system

### Office AI Assistant

- Real governed shared application
- Real routes at `/assistant/*`
- Not a standalone product claim

### WorkflowOS and Sunbul

- `WorkflowOS` = canonical governed workspace at `/workflowos/*` (L4 Usable v0.1)
- `Sunbul` = legacy redirect alias only; `/sunbul/*` routes are `permanentRedirect(302)` to matching `/workflowos/*` routes
- Prisma models retain `Sunbul*` prefixes for schema compatibility; product identity is WorkflowOS
- Neither should be hidden, and WorkflowOS should not be promoted into a general AQLIYA product claim without further product decisions

### SalesOS, organizations, settings

- `SalesOS` current runtime surface is prototype only
- `/organizations/*` and `/settings` generic surfaces are internal preview/prototype only
- These must not be shown as implemented v0.1 operational modules

### LocalContentOS and SimulationOS

- `LocalContentOS` = strategic second product with real workspace at `/local-content/*` (L5 pilot-ready with conditions / usable v0.1). Marketing page at `/products/local-content` is not the workspace.
- `SimulationOS` = current marketing/category label, not standalone runtime

## Release-Scope Mapping

| Area                | Release Inclusion Status                | Maturity       | Customer Demo Status          |
| ------------------- | --------------------------------------- | -------------- | ----------------------------- |
| AQLIYA Platform     | Included in v0.1                        | L4 Usable v0.1 | Safe to show with explanation |
| AuditOS             | Included as pilot-ready product         | L5 Pilot-ready | Safe to show                  |
| DecisionOS          | Included as active adjacent system      | L4 Usable v0.1 | Safe to show with explanation |
| Office AI Assistant | Included as governed shared application | L4 Usable v0.1 | Safe to show with explanation |
| WorkflowOS          | Included as governed workspace          | L4 Usable v0.1 | Safe to show with explanation |
| Sunbul              | Legacy redirect alias over WorkflowOS   | Redirect alias | Internal only                 |
| auditos             | Included as demo only                   | L1 Marketing   | Demo only                     |
| SalesOS             | Prototype / internal preview            | L3 Prototype   | Do not show as implemented    |
| LocalContentOS      | Included as pilot-ready with conditions | L5 Pilot-ready | Safe to show with explanation |
