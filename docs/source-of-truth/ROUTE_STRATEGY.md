# AQLIYA Route Strategy

## Route Model

| Route                                               | Purpose                              | Layer                  | Current Status                                        |
| --------------------------------------------------- | ------------------------------------ | ---------------------- | ----------------------------------------------------- |
| `/`                                                 | AQLIYA Company homepage              | Company/Marketing      | Active                                                |
| `/custom-product`                                   | Custom product inquiry               | Company                | Active                                                |
| `/products`                                         | Product catalog                      | Marketing              | Active                                                |
| `/products/audit`                                   | AuditOS product page                 | Marketing              | Active                                                |
| `/products/decision`                                | DecisionOS product page              | Marketing              | Active                                                |
| `/products/simulation`                              | SimulationOS product page            | Marketing              | Active — marketing only, not a standalone system      |
| `/products/sales`                                   | SalesOS product page                 | Marketing              | Active — future-facing marketing only                 |
| `/products/local-content`                           | LocalContentOS product page          | Marketing              | Active — marketing only                               |
| `/audit`                                            | AuditOS governed workspace           | Workspace              | Active                                                |
| `/audit/engagements/[engagementId]/*`               | AuditOS engagement workflow          | Workspace              | Active                                                |
| `/audit/admin/users`                                | AuditOS admin panel                  | Workspace              | Active                                                |
| `/auditos`                                          | AuditOS guided demo                  | Demo                   | Active — mock-backed, unauthenticated                 |
| `/auditos/*`                                        | Demo workflow steps                  | Demo                   | Active                                                |
| `/decisions`                                        | DecisionOS workspace                 | Workspace              | Active                                                |
| `/decisions/new`                                    | New decision creation                | Workspace              | Active                                                |
| `/decisions/[id]/*`                                 | Decision workflow sub-pages          | Workspace              | Active                                                |
| `/assistant`                                        | Office AI Assistant shared workspace | Shared application     | Active — real governed task workspace                 |
| `/assistant/[taskId]`                               | Office AI task detail                | Shared application     | Active — real files/outputs/review flow               |
| `/organizations`                                    | Generic organizations surface        | Workspace/Prototype    | Active — mock/internal preview only                   |
| `/organizations/[id]`                               | Generic organization detail          | Workspace/Prototype    | Active — mock/internal preview only                   |
| `/intelligence/sectors`                             | Sector intelligence                  | Workspace              | Active                                                |
| `/intelligence/sectors/[id]`                        | Sector detail                        | Workspace              | Active                                                |
| `/sales`                                            | SalesOS prototype dashboard          | Workspace/Prototype    | Active — static dashboard only                        |
| `/settings`                                         | Generic settings page                | Workspace/Prototype    | Active — local-state-only internal preview            |
| `/settings/workspaces`                              | Platform workspace diagnostics       | Internal platform      | Active — real diagnostics                             |
| `/settings/platform-organization`                   | Platform organization diagnostics    | Internal platform      | Active — real diagnostics                             |
| `/settings/audit-logs`                              | Platform audit log viewer            | Internal platform      | Active — real audit viewer                            |
| `/monitoring`                                       | Platform monitoring dashboard        | Internal platform      | Active — real aggregate counts                        |
| `/sunbul`                                           | Sunbul custom workspace              | Custom workspace       | Active — real custom/client-specific workflow         |
| `/sunbul/admin`                                     | Sunbul admin surface                 | Custom workspace       | Active                                                |
| `/sunbul/clients/[clientId]/records/[recordId]`     | Sunbul record detail                 | Custom workspace       | Active                                                |
| `/workflowos`                                       | WorkflowOS alias workspace           | Custom workspace alias | Active — duplicates Sunbul implementation             |
| `/workflowos/admin`                                 | WorkflowOS admin alias               | Custom workspace alias | Active — duplicates Sunbul implementation             |
| `/workflowos/clients/[clientId]/records/[recordId]` | WorkflowOS record detail alias       | Custom workspace alias | Active — duplicates Sunbul implementation             |
| `/login`                                            | Authentication                       | Internal               | Active                                                |
| `/access-denied`                                    | Access denied page                   | Internal               | Active                                                |
| `/api/auth/[...nextauth]`                           | NextAuth API                         | Internal               | Active                                                |
| `/api/custom-product-submit`                        | Custom product form submission       | Internal               | Active                                                |
| `/api/audit/evidence/[evidenceId]/download`         | Audit evidence file download         | Internal API           | Active — authenticated + engagement access required   |
| `/api/office-ai/download`                           | Office AI output download            | Internal API           | Active — authenticated + platform-org access required |
| `/api/metrics`                                      | Platform metrics endpoint            | Internal API           | Active — admin-only                                   |
| `/api/health`                                       | Platform health endpoint             | Internal API           | Active — safe health check                            |
| `/published/recommendation/[decisionId]`            | Legacy published decision            | Legacy                 | Active                                                |

## Route Rules

1. `/audit` = governed workspace (authenticated, DB-backed, auditable). Do not treat as a public demo.
2. `/auditos` = guided demo (public, mock-backed, read-only). Always label as `Demo` in UI and docs.
3. `/assistant` = governed shared application on AQLIYA Core. Do not market it as a standalone product unless explicitly reclassified.
4. `/sunbul` = real custom/client-specific workspace. It exists in code and docs must not hide it, but it is not a default platform product claim.
5. `/workflowos` = alias/duplicate route family over Sunbul-style implementation, not a distinct domain with separate schema.
6. `/organizations`, `/organizations/[id]`, `/settings`, and `/sales` must be labeled prototype/internal preview until they have real persistence and workflow backing.
7. `/api/audit/evidence/[evidenceId]/download`, `/api/office-ai/download`, and `/api/metrics` are sensitive internal endpoints and must remain permissioned.
8. Do not create `/simulation` or `/local-content` top-level routes until those systems have real workspace implementations.
9. Product marketing pages belong under `/products/*`.
10. Company and marketing pages must not imply future products are already implemented.
