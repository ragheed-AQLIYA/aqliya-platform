# workflowos — Internal Alias over Sunbul

**Status:** Internal/custom alias route family, not a separate product  
**Canonical workspace:** `/sunbul/*`  
**Alias routes:** `/workflowos/*` redirect to the matching `/sunbul/*` path

---

## Current Reality

The repository codebase does **not** prove a distinct WorkflowOS domain.

- `src/app/workflowos/*` reuses Sunbul pages/components and now redirects to `/sunbul/*`
- `src/lib/sunbul/*` contains the actual services, guards, storage, export logic, and data access
- API routes are named under `/api/sunbul/*`, not `/api/workflowos/*`
- Official and source-of-truth docs classify `workflowos` as an alias/duplicate custom workspace surface

Because of that, `workflowos` must currently be treated as an **internal alias over Sunbul**, not as an independent AQLIYA product.

---

## Route Governance

| Route                                               | Status    | Rule                                      |
| --------------------------------------------------- | --------- | ----------------------------------------- |
| `/sunbul`                                           | Canonical | Real custom/client workspace route        |
| `/sunbul/admin`                                     | Canonical | Real admin surface                        |
| `/sunbul/clients/[clientId]/records/[recordId]`     | Canonical | Real record detail route                  |
| `/workflowos`                                       | Alias     | Redirects to `/sunbul`                    |
| `/workflowos/admin`                                 | Alias     | Redirects to `/sunbul/admin`              |
| `/workflowos/clients/[clientId]/records/[recordId]` | Alias     | Redirects to matching `/sunbul/...` route |

---

## Positioning Rule

- Do not present `workflowos` as a standalone product.
- Do not claim a separate data model, product boundary, or release maturity for `workflowos`.
- If a distinct WorkflowOS product/domain is ever created, it must be proven by separate routes, services, models, and documentation.
