# Architectural Compliance

**Generated:** 2026-07-11T11:27:35.412Z  
**Compliance Score:** **82%**

| Rule | Score | Violations | Weight |
| ---- | ----- | ---------- | ------ |
| NO_PRISMA_IN_CLIENT | **99%** | 3 | 20 |
| ACTIONS_USE_ENFORCE | **52%** | 13 | 25 |
| NO_AUTH_BYPASS | **100%** | 0 | 20 |
| NO_CROSS_DOMAIN_DEEP_IMPORTS | **100%** | 0 | 15 |
| NO_ACTIONS_IMPORT_APP | **100%** | 0 | 10 |
| DOWNLOAD_ROUTES_TENANT_SCOPED | **45%** | 6 | 10 |

## Rule Details

### NO_PRISMA_IN_CLIENT — No Prisma from Client Components

- Score: **99%**
- Violations: 3
  - `src/app/local-content/settings/integrations/page.tsx`
  - `src/app/(dashboard)/decisions/[id]/tender/page.tsx`
  - `src/app/(dashboard)/decisions/[id]/outcome/page.tsx`

### ACTIONS_USE_ENFORCE — Mutating Server Actions use enforce()/authorize()

- Score: **52%**
- Violations: 13
  - `src/actions/contact-export-actions.ts`
  - `src/actions/contact-review-actions.ts`
  - `src/actions/content-evidence-actions.ts`
  - `src/actions/decision-templates.ts`
  - `src/actions/ingestion-actions.ts`
  - `src/actions/institutional-memory-actions.ts`
  - `src/actions/localcontent-audit-admin-actions.ts`
  - `src/actions/localcontent-review-actions.ts`
  - `src/actions/localcontent-workbook-actions.ts`
  - `src/actions/mfa.ts`
  - `src/actions/office-ai-actions.ts`
  - `src/actions/registration-actions.ts`

### NO_AUTH_BYPASS — No obvious authorization bypass patterns

- Score: **100%**
- Violations: 0

### NO_CROSS_DOMAIN_DEEP_IMPORTS — No deep cross-product domain imports

- Score: **100%**
- Violations: 0

### NO_ACTIONS_IMPORT_APP — Actions must not import from app/ routes

- Score: **100%**
- Violations: 0

### DOWNLOAD_ROUTES_TENANT_SCOPED — Download/export routes reference organizationId

- Score: **45%**
- Violations: 6
  - `src/app/api/workflowos/documents/[documentId]/download/route.ts`
  - `src/app/api/workflowos/clients/[clientId]/records/[recordId]/export/pdf/route.ts`
  - `src/app/api/office-ai/download/route.ts`
  - `src/app/api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts`
  - `src/app/api/local-content/projects/[projectId]/audit/export/route.ts`
  - `src/app/api/audit/engagements/[engagementId]/exports/[format]/route.ts`

> Remediation owned by OpenCode. EngineeringOS only measures.
