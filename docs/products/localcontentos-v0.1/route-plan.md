# LocalContentOS v0.1 — Route Plan

## Route Architecture

Following the repository convention established by AuditOS (`/audit/engagements/[engagementId]/*`) and DecisionOS (`/decisions/[id]/*`), LocalContentOS uses the `/local-content/projects/[projectId]/*` pattern.

Base route: `src/app/local-content/`

## Route Map

| Route                                                | Purpose                                    | Data Needed                                   | Mutations                                           | Governance                            | v0.1 Priority |
| ---------------------------------------------------- | ------------------------------------------ | --------------------------------------------- | --------------------------------------------------- | ------------------------------------- | ------------- |
| `/local-content`                                     | Dashboard — list projects, KPIs            | Projects list, status counts, recent activity | Create project                                      | Auth, org scoping                     | P0            |
| `/local-content/projects/[projectId]`                | Project detail — overview, status, summary | Project, scores, supplier/spend counts        | Update project metadata                             | Auth, project access                  | P0            |
| `/local-content/projects/[projectId]/suppliers`      | Supplier registry — add/edit/list          | Suppliers list per project                    | Create, update, delete supplier                     | Auth, project access, role: OPERATOR+ | P0            |
| `/local-content/projects/[projectId]/spend`          | Spend records — import/list                | Spend records per project, per supplier       | Create, import CSV, delete                          | Auth, project access, role: OPERATOR+ | P0            |
| `/local-content/projects/[projectId]/classification` | Classification — classify spend/suppliers  | Classification entries, evidence links        | Create, update classification                       | Auth, project access, role: OPERATOR+ | P0            |
| `/local-content/projects/[projectId]/evidence`       | Evidence vault — upload, link, review      | Evidence records, file metadata, storage keys | Upload, link, delete, review evidence               | Auth, project access, role: OPERATOR+ | P0            |
| `/local-content/projects/[projectId]/findings`       | Findings — gap/risk register               | Findings, severity, linked evidence           | Create, update finding                              | Auth, project access, role: OPERATOR+ | P0            |
| `/local-content/projects/[projectId]/review`         | Review — submit, comment, return           | Review comments, workflow state               | Submit for review, add comment, return for revision | Auth, project access, role: REVIEWER+ | P0            |
| `/local-content/projects/[projectId]/approval`       | Approval — approve/reject                  | Approval record, governance context           | Approve, reject                                     | Auth, project access, role: ADMIN+    | P0            |
| `/local-content/projects/[projectId]/reports`        | Reports — generate and download            | Report configurations, export status          | Generate report, download PDF/XLSX                  | Auth, project access, role: OPERATOR+ | P0            |
| `/local-content/projects/[projectId]/audit-trail`    | Audit trail — event log                    | Audit events filtered by project              | (read-only)                                         | Auth, project access                  | P0            |

## API Routes

| Route                                                      | Purpose                | Method | Auth                               |
| ---------------------------------------------------------- | ---------------------- | ------ | ---------------------------------- |
| `/api/local-content/projects/[projectId]/exports/[format]` | Export generation      | GET    | Auth, project access               |
| `/api/local-content/evidence/[evidenceId]/download`        | Evidence file download | GET    | Auth, project access, tenant check |
| `/api/local-content/projects/[projectId]/spend/import`     | CSV import             | POST   | Auth, project access               |

## Layout Pattern

```
src/app/local-content/
├── page.tsx                       # Dashboard
├── layout.tsx                     # Shared layout (sidebar, header, breadcrumbs)
├── loading.tsx                    # Loading state
├── error.tsx                      # Error boundary
├── not-found.tsx                  # 404
├── projects/
│   ├── page.tsx                   # Project list (or redirect to dashboard)
│   └── [projectId]/
│       ├── page.tsx               # Project detail
│       ├── layout.tsx             # Project-level layout (tabs, workflow progress)
│       ├── loading.tsx
│       ├── error.tsx
│       ├── not-found.tsx
│       ├── suppliers/
│       │   └── page.tsx
│       ├── spend/
│       │   └── page.tsx
│       ├── classification/
│       │   └── page.tsx
│       ├── evidence/
│       │   └── page.tsx
│       ├── findings/
│       │   └── page.tsx
│       ├── review/
│       │   └── page.tsx
│       ├── approval/
│       │   └── page.tsx
│       ├── reports/
│       │   └── page.tsx
│       └── audit-trail/
│           └── page.tsx
```

## Route Protection Rules

1. All `/local-content/*` routes require authentication.
2. Project-scoped routes must verify project access (organization membership).
3. Evidence download API must check project access before serving files.
4. Marketing route `/products/local-content` remains public and unchanged.
5. Workspace routes must not be linked from marketing pages as if they are live products.
