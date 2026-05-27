# AQLIYA Route Strategy

> **Status:** Level 4 — Supporting reference  
> **Authority:** See `docs/DOCUMENTATION_AUTHORITY.md` for the documentation hierarchy.  
> **Cross-reference:** `docs/official/AQLIYA_MASTER_REFERENCE.md`, `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`  
> **Last updated:** 2026-05-23 — Route governance cleanup after P0 auth hardening

---

## Route Model

### Route Type Options

- platform landing
- product marketing page
- guided demo
- governed workspace
- dashboard
- settings/admin
- prototype/shell
- API / server-action-backed workspace
- legacy

### Implementation Status Options

- active
- pilot-ready
- L5 with conditions
- active adjacent system (L4)
- shared application (L4)
- prototype (L3)
- shell (L2)
- marketing-only (L1)
- strategic/future (L0)
- legacy

---

## Complete Route Table

### Company & Marketing Routes

| Route                 | Product/System | Route Type             | Public/Protected | Implementation Status | Notes                                 |
| --------------------- | -------------- | ---------------------- | ---------------- | --------------------- | ------------------------------------- |
| `/`                   | AQLIYA Company | Platform landing       | Public           | Active                | Marketing homepage                    |
| `/about`              | AQLIYA Company | Product marketing page | Public           | Active                |                                       |
| `/contact`            | AQLIYA Company | Product marketing page | Public           | Active                |                                       |
| `/deployment`         | AQLIYA Company | Product marketing page | Public           | Active                |                                       |
| `/engagement-models`  | AQLIYA Company | Product marketing page | Public           | Active                |                                       |
| `/executive-brief`    | AQLIYA Company | Product marketing page | Public           | Active                | Canonical executive brief route       |
| `/executive-briefing` | AQLIYA Company | Product marketing page | Public           | Active                | Redirect alias to `/executive-brief`  |
| `/governance`         | AQLIYA Company | Product marketing page | Public           | Active                |                                       |
| `/how-we-work`        | AQLIYA Company | Product marketing page | Public           | Active                |                                       |
| `/insights`           | AQLIYA Company | Product marketing page | Public           | Active                | Blog/insights index                   |
| `/insights/*`         | AQLIYA Company | Product marketing page | Public           | Active                | Individual insight articles           |
| `/platform`           | AQLIYA Company | Product marketing page | Public           | Active                |                                       |
| `/pilot-proof`        | AQLIYA Company | Product marketing page | Public           | Active                |                                       |
| `/proof-library`      | AQLIYA Company | Product marketing page | Public           | Active                |                                       |
| `/security`           | AQLIYA Company | Product marketing page | Public           | Active                |                                       |
| `/terms`              | AQLIYA Company | Product marketing page | Public           | Active                |                                       |
| `/privacy`            | AQLIYA Company | Product marketing page | Public           | Active                |                                       |
| `/use-cases`          | AQLIYA Company | Product marketing page | Public           | Active                |                                       |
| `/case-studies`       | AQLIYA Company | Product marketing page | Public           | Active                |                                       |
| `/demo`               | AQLIYA Company | Product marketing page | Public           | Active                |                                       |
| `/buyers/*`           | AQLIYA Company | Product marketing page | Public           | Active                | Buyer personas                        |
| `/custom-product`     | AQLIYA Company | Product marketing page | Public           | Active                | Leads to `/api/custom-product-submit` |

### Product Marketing Routes

| Route                     | Product/System  | Route Type             | Public/Protected | Implementation Status | Notes                                                               |
| ------------------------- | --------------- | ---------------------- | ---------------- | --------------------- | ------------------------------------------------------------------- |
| `/products`               | Product catalog | Product marketing page | Public           | Active                | Product index                                                       |
| `/products/audit`         | AuditOS         | Product marketing page | Public           | Active                | Marketing page                                                      |
| `/products/decision`      | DecisionOS      | Product marketing page | Public           | Active                | Marketing page                                                      |
| `/products/simulation`    | SimulationOS    | Product marketing page | Public           | Marketing-only (L1)   | Not a standalone system                                             |
| `/products/sales`         | SalesOS         | Product marketing page | Public           | Marketing-only (L1)   | Future-facing                                                       |
| `/products/local-content` | LocalContentOS  | Product marketing page | Public           | Active                | Marketing page. Workspace routes at `/local-content/*` (12 routes). |

### Auth & Internal Routes

| Route            | Product/System  | Route Type     | Public/Protected | Implementation Status | Notes |
| ---------------- | --------------- | -------------- | ---------------- | --------------------- | ----- |
| `/login`         | AQLIYA Platform | Authentication | Public           | Active                |       |
| `/access-denied` | AQLIYA Platform | Access control | Public           | Active                |       |

### AuditOS — Governed Workspace

| Route                                               | Product/System | Route Type         | Public/Protected | Implementation Status | Notes                      |
| --------------------------------------------------- | -------------- | ------------------ | ---------------- | --------------------- | -------------------------- |
| `/audit`                                            | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      | Dashboard, engagement list |
| `/audit/admin/users`                                | AuditOS        | Settings/admin     | Protected        | Pilot-ready (L5)      | Admin panel                |
| `/audit/engagements/[engagementId]`                 | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      | Engagement detail          |
| `/audit/engagements/[engagementId]/trial-balance`   | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/mapping`         | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      | Account mapping            |
| `/audit/engagements/[engagementId]/statements`      | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      | Financial statements       |
| `/audit/engagements/[engagementId]/notes`           | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/evidence`        | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      | Evidence vault             |
| `/audit/engagements/[engagementId]/findings`        | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/review`          | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/approval`        | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/recommendations` | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/publication`     | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/validation`      | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/audit-trail`     | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/pilot`           | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      | Pilot-specific             |

### AuditOS — Guided Demo

| Route                    | Product/System | Route Type  | Public/Protected | Implementation Status | Notes                        |
| ------------------------ | -------------- | ----------- | ---------------- | --------------------- | ---------------------------- |
| `/auditos`               | AuditOS demo   | Guided demo | Public           | Demo (L1)             | Mock-backed, unauthenticated |
| `/auditos/trial-balance` | AuditOS demo   | Guided demo | Public           | Demo (L1)             |                              |
| `/auditos/mapping`       | AuditOS demo   | Guided demo | Public           | Demo (L1)             |                              |
| `/auditos/statements`    | AuditOS demo   | Guided demo | Public           | Demo (L1)             |                              |
| `/auditos/evidence`      | AuditOS demo   | Guided demo | Public           | Demo (L1)             |                              |
| `/auditos/traceability`  | AuditOS demo   | Guided demo | Public           | Demo (L1)             |                              |

### DecisionOS — Active Adjacent System

| Route                            | Product/System | Route Type         | Public/Protected | Implementation Status | Notes           |
| -------------------------------- | -------------- | ------------------ | ---------------- | --------------------- | --------------- |
| `/decisions`                     | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  | Decision list   |
| `/decisions/new`                 | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  | Create decision |
| `/decisions/[id]`                | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  | Decision detail |
| `/decisions/[id]/overview`       | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/intake`         | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/signals`        | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/sector`         | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/risks`          | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/scenarios`      | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/simulation`     | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/recommendation` | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/governance`     | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/framework`      | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/alerts`         | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/insight`        | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/outcome`        | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/report`         | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/tender`         | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/what-to-do`     | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |

### LocalContentOS — Pilot-Ready Product Workspace (12 routes)

| Route                                                | Product/System | Route Type         | Public/Protected | Implementation Status | Notes                                                |
| ---------------------------------------------------- | -------------- | ------------------ | ---------------- | --------------------- | ---------------------------------------------------- |
| `/local-content`                                     | LocalContentOS | Governed workspace | Protected        | L5 with conditions    | Dashboard with project metrics, server-action-backed |
| `/local-content/projects`                            | LocalContentOS | Governed workspace | Protected        | L5 with conditions    | Project list with create form, server-action-backed  |
| `/local-content/projects/[projectId]`                | LocalContentOS | Governed workspace | Protected        | L5 with conditions    | Project detail with scoring, navigation to sub-pages |
| `/local-content/projects/[projectId]/suppliers`      | LocalContentOS | Governed workspace | Protected        | L5 with conditions    | Supplier/vendor records                              |
| `/local-content/projects/[projectId]/spend`          | LocalContentOS | Governed workspace | Protected        | L5 with conditions    | Spend/procurement records                            |
| `/local-content/projects/[projectId]/classification` | LocalContentOS | Governed workspace | Protected        | L5 with conditions    | Local content classification workflow                |
| `/local-content/projects/[projectId]/evidence`       | LocalContentOS | Governed workspace | Protected        | L5 with conditions    | Evidence upload with file storage                    |
| `/local-content/projects/[projectId]/findings`       | LocalContentOS | Governed workspace | Protected        | L5 with conditions    | Gap/risk findings                                    |
| `/local-content/projects/[projectId]/review`         | LocalContentOS | Governed workspace | Protected        | L5 with conditions    | Review workflow                                      |
| `/local-content/projects/[projectId]/approval`       | LocalContentOS | Governed workspace | Protected        | L5 with conditions    | Approval workflow                                    |
| `/local-content/projects/[projectId]/reports`        | LocalContentOS | Governed workspace | Protected        | L5 with conditions    | Export/reports generation                            |
| `/local-content/projects/[projectId]/audit-trail`    | LocalContentOS | Governed workspace | Protected        | L5 with conditions    | Audit log viewer                                     |

**LocalContentOS route limitations:**

- L5 with conditions / usable v0.1 — not L6 production-hardened
- Mutation feedback loop verified (2026-05-23); finding create PASS on `/local-content/projects/lc-project-demo-001/findings`
- Review/approval/report inline server forms may still need clean manual pass
- PDF/XLSX binary generation implemented using pdfkit + xlsx libraries
- No project/finding edit-delete UI in v0.1
- See `docs/reports/localcontentos-v0.1-documentation-truth-sync-2026-05-23.md`

### Office AI Assistant — Shared Application

| Route                 | Product/System      | Route Type         | Public/Protected | Implementation Status   | Notes                          |
| --------------------- | ------------------- | ------------------ | ---------------- | ----------------------- | ------------------------------ |
| `/assistant`          | Office AI Assistant | Shared application | Protected        | Shared application (L4) | Real governed task workspace   |
| `/assistant/[taskId]` | Office AI Assistant | Shared application | Protected        | Shared application (L4) | Real files/outputs/review flow |

### Intelligence / Sector Routes

| Route                        | Product/System | Route Type         | Public/Protected | Implementation Status | Notes               |
| ---------------------------- | -------------- | ------------------ | ---------------- | --------------------- | ------------------- |
| `/intelligence/sectors`      | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  | Sector intelligence |
| `/intelligence/sectors/[id]` | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  | Sector detail       |

### SalesOS — Prototype Dashboard

| Route    | Product/System | Route Type | Public/Protected | Implementation Status | Notes                                        |
| -------- | -------------- | ---------- | ---------------- | --------------------- | -------------------------------------------- |
| `/sales` | SalesOS        | Dashboard  | Protected        | Prototype (L3)        | Static dashboard only. No backend workspace. |

### Organizations — Prototype Surface

| Route                   | Product/System | Route Type      | Public/Protected | Implementation Status | Notes                      |
| ----------------------- | -------------- | --------------- | ---------------- | --------------------- | -------------------------- |
| `/organizations`        | Organizations  | Prototype/shell | Protected        | Prototype (L3)        | Mock/internal preview only |
| `/organizations/[id]`   | Organizations  | Prototype/shell | Protected        | Prototype (L3)        | Mock/internal preview only |
| `/organizations/sunbul` | Organizations  | Workspace       | Protected        | Prototype (L3)        | Links to Sunbul surface    |

### Platform Settings / Admin / Diagnostics

| Route                             | Product/System | Route Type     | Public/Protected | Implementation Status | Notes                             |
| --------------------------------- | -------------- | -------------- | ---------------- | --------------------- | --------------------------------- |
| `/settings`                       | Platform       | Settings/admin | Protected        | Shell (L2)            | Local-state-only internal preview |
| `/settings/workspaces`            | Platform       | Settings/admin | Protected        | Active (L4)           | Real workspace diagnostics        |
| `/settings/platform-organization` | Platform       | Settings/admin | Protected        | Active (L4)           | Real platform org diagnostics     |
| `/settings/audit-logs`            | Platform       | Settings/admin | Protected        | Active (L4)           | Real audit log viewer             |
| `/monitoring`                     | Platform       | Settings/admin | Protected        | Active (L4)           | Real aggregate counts             |

### Sunbul — Custom Workspace

| Route                                           | Product/System | Route Type       | Public/Protected | Implementation Status | Notes                  |
| ----------------------------------------------- | -------------- | ---------------- | ---------------- | --------------------- | ---------------------- |
| `/sunbul`                                       | Sunbul         | Custom workspace | Protected        | Custom workspace (L4) | Real governed workflow |
| `/sunbul/admin`                                 | Sunbul         | Custom workspace | Protected        | Custom workspace (L4) |                        |
| `/sunbul/clients/[clientId]/records/[recordId]` | Sunbul         | Custom workspace | Protected        | Custom workspace (L4) | Record detail          |

### workflowos — Redirect Alias to Sunbul

| Route                                               | Product/System | Route Type        | Public/Protected | Implementation Status | Notes                                                                    |
| --------------------------------------------------- | -------------- | ----------------- | ---------------- | --------------------- | ------------------------------------------------------------------------ |
| `/workflowos`                                       | workflowos     | Route alias (302) | Protected        | Redirect alias        | `permanentRedirect` to `/sunbul`. No components, no data, no UI.         |
| `/workflowos/admin`                                 | workflowos     | Route alias (302) | Protected        | Redirect alias        | `permanentRedirect` to `/sunbul/admin`.                                  |
| `/workflowos/clients/[clientId]/records/[recordId]` | workflowos     | Route alias (302) | Protected        | Redirect alias        | `permanentRedirect` to matching `/sunbul/clients/.../records/...` route. |

### Legacy Routes

| Route                                    | Product/System | Route Type | Public/Protected | Implementation Status | Notes                                                       |
| ---------------------------------------- | -------------- | ---------- | ---------------- | --------------------- | ----------------------------------------------------------- |
| `/published/recommendation/[decisionId]` | DecisionOS     | Legacy     | Protected        | Legacy                | Legacy route backed by organization-scoped publication data |

---

## API Routes

| Route                                                                 | Product/System      | Route Type     | Public/Protected | Implementation Status | Notes                                           |
| --------------------------------------------------------------------- | ------------------- | -------------- | ---------------- | --------------------- | ----------------------------------------------- |
| `/api/auth/[...nextauth]`                                             | AQLIYA Platform     | API — auth     | Public           | Active                | NextAuth v5                                     |
| `/api/health`                                                         | AQLIYA Platform     | API — health   | Public           | Active                | Safe health check                               |
| `/api/custom-product-submit`                                          | AQLIYA Platform     | API — form     | Public           | Active                | Custom product inquiry                          |
| `/api/metrics`                                                        | AQLIYA Platform     | API — metrics  | Protected        | Active                | Admin-only                                      |
| `/api/audit/evidence/[evidenceId]/download`                           | AuditOS             | API — download | Protected        | Active                | Authenticated + engagement access + audit log   |
| `/api/audit/engagements/[engagementId]/exports/[format]`              | AuditOS             | API — export   | Protected        | Active                | Authenticated + engagement access               |
| `/api/office-ai/download`                                             | Office AI Assistant | API — download | Protected        | Active                | Authenticated + platform-org access + audit log |
| `/api/local-content/projects/[projectId]/reports/[reportId]/download` | LocalContentOS      | API — download | Protected        | Active                | Authenticated + project access + audit log      |
| `/api/sunbul/clients/[clientId]/records/[recordId]/export/pdf`        | Sunbul              | API — export   | Protected        | Active                |                                                 |
| `/api/sunbul/documents/[documentId]/download`                         | Sunbul              | API — download | Protected        | Active                | Authenticated + client access + audit log       |

---

## Proxy Auth Protection

Next.js 16 uses `src/proxy.ts` (proxy middleware) for route protection. It uses `getToken` from `next-auth/jwt` (Edge-compatible) to validate JWT session tokens before allowing access to protected routes.

### Protected Route Prefixes

- `/audit`
- `/decisions`
- `/local-content`
- `/assistant`
- `/organizations`
- `/settings`
- `/monitoring`
- `/intelligence`
- `/sunbul`
- `/workflowos`
- `/sales`
- `/published/recommendation`

Protected route behavior:

- Page requests without a valid JWT redirect to `/login?callbackUrl=<original_path>`.
- Security headers are applied to all responses via `setSecurityHeaders`.

### Public Route Exclusions

Marketing pages, demo routes, auth pages, and static assets bypass the auth check:

- Root `/`, `/about`, `/contact`, `/custom-product`, `/demo`, `/deployment`
- `/engagement-models`, `/executive-brief`, `/executive-briefing`, `/governance`
- `/how-we-work`, `/insights/*`, `/pilot-proof`, `/platform`, `/privacy`
- `/proof-library`, `/products/*`, `/security`, `/terms`, `/use-cases`
- `/case-studies`, `/auditos/*`, `/buyers/*`
- `/login`, `/access-denied`
- `/api/auth/*`, `/api/health`
- Static: `/_next/*`, `/favicon.ico`, `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`

`/auditos/*` is the only intentionally public AuditOS route family. Its public status is allowed only because it is a sanitized guided demo, not a workspace.

## Route Rules

1. `/audit/*` = governed workspace (authenticated, DB-backed, auditable). Do not treat as a public demo.
2. `/auditos/*` = guided demo (public, mock-backed, read-only). Always label as `Demo` in UI and docs.
   `/auditos/*` is intentionally public because it is a sanitized, mock-only, read-only guided demo. It must not use customer data, uploads, mutations, exports/downloads, tenant state, or operational audit workflows. If any of these are introduced, the route must move behind authentication/gating before release.
3. `/assistant/*` = governed shared application on AQLIYA Core. Do not market it as a standalone product unless explicitly reclassified.
4. `/local-content/*` = governed workspace (authenticated, server-action-backed, auditable). Pilot-ready with conditions (L5). See limitations in route table above.
5. `/sunbul/*` = real custom/client-specific workspace. It exists in code and docs must not hide it, but it is not a default platform product claim.
6. `/workflowos/*` = redirect alias family over Sunbul implementation, not a distinct domain or prototype. Every route is a `permanentRedirect(302)` wrapper. Do not describe as a prototype — it is purely a route alias.
7. `/organizations/*`, `/settings`, and `/sales` must be labeled prototype/internal preview until they have real persistence and workflow backing.
8. `/api/*` sensitive endpoints (`/api/audit/evidence/*`, `/api/office-ai/download`, `/api/metrics`, `/api/local-content/*/download`) must remain permissioned.
9. Do not create `/simulation` top-level routes until that system has a real workspace implementation.
10. Product marketing pages belong under `/products/*`.
11. Company and marketing pages must not imply future products are already implemented.
12. `/decisions/*` = DecisionOS active adjacent governed workspace (authenticated, DB-backed).
13. `/published/recommendation/*` is protected in current code reality because the backing action requires an authenticated user from the same organization.
14. `/executive-brief` is the canonical executive brief route. `/executive-briefing` is preserved only as a redirect alias.

15. **Download Security Standard** — Every file download API route must implement all three layers: (a) authentication at entry, (b) tenant-safe access check returning 404 on any failure (never 403 for "exists but not yours"), and (c) successful download audit trail via `writePlatformAuditLog` with `status: "success"`, `targetType`, `targetId`, `targetLabel`, `actorId`, `actorType`, `sourceSystem`. Response must use `Cache-Control: private, no-store`. Currently enforced on: `/api/audit/evidence/*/download`, `/api/office-ai/download`, `/api/sunbul/documents/*/download`.
