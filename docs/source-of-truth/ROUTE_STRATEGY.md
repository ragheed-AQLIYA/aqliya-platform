# AQLIYA Route Strategy

## Route Model

| Route | Purpose | Layer | Current Status |
|---|---|---|---|
| `/` | AQLIYA Company homepage | Company/Marketing | Active |
| `/about` | About AQLIYA | Company | Active |
| `/contact` | Contact page | Company | Active |
| `/how-we-work` | Methodology page | Company | Active |
| `/custom-product` | Custom product inquiry | Company | Active |
| `/products` | Product catalog | Marketing | Active |
| `/products/audit` | AuditOS product page | Marketing | Active |
| `/products/decision` | DecisionOS product page | Marketing | Active |
| `/products/simulation` | SimulationOS product page | Marketing | Active — marketing only |
| `/products/sales` | SalesOS product page | Marketing | Active |
| `/products/local-content` | Local Content OS product page | Marketing | Active — marketing only |
| `/audit` | AuditOS governed workspace | Workspace | Active |
| `/audit/engagements/[engagementId]/*` | AuditOS engagement workflow | Workspace | Active |
| `/audit/admin/users` | AuditOS admin panel | Workspace | Active |
| `/auditos` | AuditOS guided demo | Demo | Active — mock-backed, unauthenticated |
| `/auditos/*` | Demo workflow steps | Demo | Active |
| `/decisions` | DecisionOS workspace | Workspace | Active |
| `/decisions/new` | New decision creation | Workspace | Active |
| `/decisions/[id]/*` | Decision workflow sub-pages | Workspace | Active |
| `/organizations` | Organization management | Workspace | Active |
| `/organizations/[id]` | Organization detail | Workspace | Active |
| `/intelligence/sectors` | Sector intelligence | Workspace | Active |
| `/intelligence/sectors/[id]` | Sector detail | Workspace | Active |
| `/sales` | SalesOS prototype dashboard | Workspace/Prototype | Active — static dashboard only |
| `/settings` | Settings page | Workspace | Active |
| `/login` | Authentication | Internal | Active |
| `/access-denied` | Access denied page | Internal | Active |
| `/api/auth/[...nextauth]` | NextAuth API | Internal | Active |
| `/api/custom-product-submit` | Custom product form submission | Internal | Active |
| `/published/recommendation/[decisionId]` | Legacy published decision | Legacy | Active |

## Route Rules

1. `/audit` = governed workspace (authenticated, DB-backed, auditable). Do not treat as a public demo.
2. `/auditos` = guided demo (public, mock-backed, read-only). Always label as "Demo" in UI and docs.
3. Do not create `/simulation` or `/local-content` top-level routes until those systems have real workspace implementations.
4. Product marketing pages belong under `/products/*`.
5. Company pages (`/about`, `/contact`, `/how-we-work`) must not funnel users to a single product demo.
