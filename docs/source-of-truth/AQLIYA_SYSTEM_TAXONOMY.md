# AQLIYA System Taxonomy

## Terms

| Term                             | Definition                                                                       | Examples                                             | Allowed Usage                                           | Forbidden Usage                                     |
| -------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------- |
| **Company**                      | Parent legal and brand entity                                                    | AQLIYA                                               | Use as top-level identity                               | Do not present as a single product                  |
| **Platform Layer**               | Shared underlying technical/governance foundation                                | AQLIYA Intelligence Core                             | Use for cross-product/shared foundations                | Do not market as a finished product                 |
| **Product / System**             | Named operational system with route, data, workflow, and governance purpose      | AuditOS, DecisionOS                                  | Use for real operational systems                        | Do not apply to marketing-only pages                |
| **Shared Application**           | Governed application built on the Core but not a standalone product family       | Office AI Assistant                                  | Use for real shared work-assistant style applications   | Do not reframe as product without explicit decision |
| **Custom Workspace**             | Real governed workspace tailored to a client-specific or custom workflow         | Sunbul                                               | Use when code exists but positioning is custom/internal | Do not hide if it exists                            |
| **Custom Workspace Alias**       | Duplicate or alias route family over an existing custom workspace implementation | workflowos                                           | Use when routes exist without a separate domain         | Do not describe as separate product                 |
| **Demo**                         | Guided, read-only, mock-backed walkthrough                                       | `/auditos`                                           | Use only for explicit demo surfaces                     | Do not present as live workspace                    |
| **Prototype / Internal Preview** | Incomplete or local-state-only workspace-like surface                            | `/sales`, `/organizations`, `/settings`              | Use to label real but incomplete surfaces               | Do not present as v0.1-complete product             |
| **Marketing-only Product Page**  | Product description with no operational implementation                           | LocalContentOS, SimulationOS, SalesOS marketing page | Use on `/products/*`                                    | Do not claim as working product                     |
| **Strategic / Future**           | Planned direction without implemented route/workflow/data proof                  | On-Prem, Air-Gapped, Studio, RiskOS                  | Use for roadmap truthfulness                            | Do not present as available                         |

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

### Sunbul and workflowos

- `Sunbul` = real custom workspace
- `workflowos` = real alias/duplicate route family over Sunbul patterns
- Neither should be hidden, and neither should be promoted into a general AQLIYA product claim without further product decisions

### SalesOS, organizations, settings

- `SalesOS` current runtime surface is prototype only
- `/organizations/*` and `/settings` generic surfaces are internal preview/prototype only
- These must not be shown as implemented v0.1 operational modules

### LocalContentOS and SimulationOS

- `LocalContentOS` = strategic second product, not implemented
- `SimulationOS` = current marketing/category label, not standalone runtime

## Release-Scope Mapping

| Area                | Release Inclusion Status                | Maturity       | Customer Demo Status          |
| ------------------- | --------------------------------------- | -------------- | ----------------------------- |
| AQLIYA Platform     | Included in v0.1                        | L4 Usable v0.1 | Safe to show with explanation |
| AuditOS             | Included as pilot-ready product         | L5 Pilot-ready | Safe to show                  |
| DecisionOS          | Included as active adjacent system      | L4 Usable v0.1 | Safe to show with explanation |
| Office AI Assistant | Included as governed shared application | L4 Usable v0.1 | Safe to show with explanation |
| Sunbul              | Included as custom/internal workspace   | L4 Usable v0.1 | Safe to show with explanation |
| workflowos          | Included as custom/internal workspace   | L3 Prototype   | Internal only                 |
| auditos             | Included as demo only                   | L1 Marketing   | Demo only                     |
| SalesOS             | Prototype / internal preview            | L3 Prototype   | Do not show as implemented    |
| LocalContentOS      | Strategic / future                      | L1 Marketing   | Do not show as implemented    |
