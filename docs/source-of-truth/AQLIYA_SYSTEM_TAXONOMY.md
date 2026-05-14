# AQLIYA System Taxonomy

## Terms

| Term | Definition | Examples | Allowed Usage | Forbidden Usage |
|---|---|---|---|---|
| **Company** | The legal and brand entity that owns all systems | AQLIYA | Use as the top-level identity | Do not use as a product name |
| **System** | A named product or product line with its own route, data model, and purpose | AuditOS, DecisionOS, SalesOS | Use in product docs, UI titles, and marketing | Do not call a marketing-only page a system |
| **Workspace** | A governed operational execution environment with auth, access control, and durable data | AuditOS Workspace (`/audit`), DecisionOS (`/decisions`) | Use for authenticated, DB-backed execution surfaces | Do not apply to mock-only or marketing routes |
| **Product (marketing)** | A marketing page describing a capability without a workspace implementation | SimulationOS, Local Content OS | Use on `/products/*` pages | Do not present as operational or link to nonexistent routes |
| **Demo** | A guided, read-only, mock-backed walkthrough | `/auditos` | Use only for explicitly demo-labeled routes | Do not label as "Live" or "Production" |
| **Governance layer** | Cross-cutting controls shared by all workspaces | Audit trail, validation, publication | Apply across all workspaces | Do not make workspace-specific |
| **Marketing page** | Public-facing content explaining a product or capability | `/products/simulation`, `/products/local-content` | Link to real CTAs matched to current state | Do not link to unrelated products or nonexistent routes |

## Key Distinctions

### AuditOS is both a System and has a Workspace
- AuditOS = the product/system
- `/audit` = the governed workspace (authenticated, DB-backed, with audit trail)
- `/auditos` = the guided demo (public, mock-backed, unauthenticated)

### DecisionOS
- Active system with routes under `/(dashboard)/`
- Has DB models, server actions, components, and a real workspace

### SalesOS
- Static dashboard prototype at `/sales`
- Has no dedicated services, DB models, or deeper routes
- Positioned as an adjacent system but currently a prototype

### SimulationOS and Local Content OS
- Marketing-only: exist as `/products/*` pages with no workspace implementation
- No `src/app/simulation/` or `src/app/local-content/` routes exist
- Should not be presented as operational systems
