# WorkflowOS — Canonical Governed Workflow Workspace

**Status:** L4 Usable v0.1 — governed workspace  
**Canonical routes:** `/workflowos/*`, `/api/workflowos/*`  
**Legacy redirect alias:** `/sunbul/*` (302 permanent redirect to `/workflowos/*`)  
**Freeze document:** `docs/product/workflowos/workflowos-v0.1-status.md`

---

## Identity

WorkflowOS is the canonical product name for the governed workflow workspace under AQLIYA. It provides record management, workflow states, file storage, audit trail, and PDF export — all tenant-scoped and permissioned.

## Current Reality

- `src/app/workflowos/*` — canonical route implementations (real pages, server actions, data flows)
- `src/app/api/workflowos/*` — download and export API routes (permissioned, audited)
- `src/lib/workflowos/` — shared services, tenant guard, storage, audit, export
- `src/components/workflowos/` — shared UI components (16 `Workflow*` components)
- `src/actions/workflowos-actions.ts` — 19 server actions (`workflow_*` prefix)
- `src/app/sunbul/*` — legacy redirect alias (`permanentRedirect(302)` to matching `/workflowos/*`)

## Legacy Compatibility

### Sunbul Prisma models (not renamed)

The database schema retains `Sunbul*` model names (`SunbulClient`, `SunbulRecord`, `SunbulDocument`, `SunbulUserMembership`, `SunbulAuditEvent`). TypeScript type aliases in `src/lib/workflowos/types.ts` bridge the gap:

```ts
export type WorkflowClient = SunbulClient;
export type WorkflowRecord = SunbulRecord;
// etc.
```

These models are intentionally not renamed because:

1. A Prisma rename requires a migration with potential data loss risk
2. Existing seed scripts (`seed-sunbul-pilot.ts`, `seed-sunbul-organization.ts`) reference these models
3. Historical audit logs reference Sunbul model keys
4. There is no operational requirement to rename — the alias layer is sufficient

### `Product.SUNBUL` audit key (retained)

The `Product.SUNBUL` key remains in `src/lib/platform/audit-logger.ts` for backward compatibility with existing audit log entries. New events use `Product.WORKFLOWOS`.

### `/organizations/sunbul` page (legacy reference)

The organization reference page at `/organizations/sunbul` still uses Sunbul terminology and Prisma model names. This is acceptable because:

1. The Sunbul organization is a real pilot entity in the seed data
2. The page displays reference data, not product functionality
3. Updating it would require Prisma model changes (Phase 3)

### Historical docs (preserved)

Archive docs under `docs/product/sunbul/` and `docs/reports/security-audit-2026-05-23.md` reference the old Sunbul API routes (`/api/sunbul/...`). These are preserved as historical records. The `/api/sunbul/*` routes no longer exist in the codebase.

---

## Route Governance

| Route                                                              | Status    | Rule                                                         |
| ------------------------------------------------------------------ | --------- | ------------------------------------------------------------ |
| `/workflowos`                                                      | Canonical | Real governed workspace route                                |
| `/workflowos/admin`                                                | Canonical | Real admin surface                                           |
| `/workflowos/clients/[clientId]/records/[recordId]`                | Canonical | Real record detail route                                     |
| `/api/workflowos/clients/[clientId]/records/[recordId]/export/pdf` | Canonical | Permissioned PDF export API route                            |
| `/api/workflowos/documents/[documentId]/download`                  | Canonical | Permissioned document download API route                     |
| `/sunbul`                                                          | Legacy    | `permanentRedirect(302)` to `/workflowos`                    |
| `/sunbul/admin`                                                    | Legacy    | `permanentRedirect(302)` to `/workflowos/admin`              |
| `/sunbul/clients/[clientId]/records/[recordId]`                    | Legacy    | `permanentRedirect(302)` to matching `/workflowos/...` route |

---

## Positioning

- WorkflowOS is a governed workspace under AQLIYA, not a standalone product
- Sunbul is a legacy name — no new code should reference it directly
- Prisma rename (Phase 3) is deferred until an operational requirement exists
