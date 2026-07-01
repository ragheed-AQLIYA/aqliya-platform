# Route Strategy Alignment — v0.1

**Date:** 2026-05-22  
**Type:** Documentation alignment  
**Product/System affected:** AQLIYA Platform — route documentation

---

## Summary

- Rewrote `docs/source-of-truth/ROUTE_STRATEGY.md` with complete route table including all 12 LocalContentOS routes.
- Added 65+ routes that were previously undocumented, including all sub-routes for AuditOS (16), DecisionOS (19), LocalContentOS (12), and all marketing/company pages (20+).
- Added explicit route type, public/protected, and implementation status columns.
- Added API route table including the previously undocumented `/api/local-content/*/download` and `/api/sunbul/*` routes.

## Files Changed

- `docs/source-of-truth/ROUTE_STRATEGY.md` — Complete rewrite with categorized route tables, explicit statuses, and detailed limitations

## Routes Discovered

Total routes documented: 95+ (including API routes)

### Company & Marketing Pages (20+ routes)

`/`, `/about`, `/contact`, `/deployment`, `/engagement-models`, `/executive-brief`, `/executive-briefing`, `/governance`, `/how-we-work`, `/insights`, `/insights/*`, `/platform`, `/pilot-proof`, `/proof-library`, `/security`, `/terms`, `/privacy`, `/use-cases`, `/case-studies`, `/demo`, `/buyers/*`, `/custom-product`

### Product Marketing Pages (6 routes)

`/products`, `/products/audit`, `/products/decision`, `/products/simulation`, `/products/sales`, `/products/local-content`

### AuditOS Governed Workspace (16 routes)

`/audit`, `/audit/admin/users`, and 14 engagement sub-routes

### AuditOS Guided Demo (6 routes)

`/auditos` and 5 demo sub-pages

### DecisionOS (19 routes)

`/decisions`, `/decisions/new`, `/decisions/[id]` and 16 sub-routes

### LocalContentOS (12 workspace routes + 1 API route)

See LocalContentOS Routes Added section below

### Office AI Assistant (2 routes)

`/assistant`, `/assistant/[taskId]`

### SalesOS (1 route)

`/sales`

### Organizations (3 routes)

`/organizations`, `/organizations/[id]`, `/organizations/sunbul`

### Platform Settings / Admin (5 routes)

`/settings`, `/settings/workspaces`, `/settings/platform-organization`, `/settings/audit-logs`, `/monitoring`

### Sunbul (3 routes)

`/sunbul`, `/sunbul/admin`, `/sunbul/clients/[clientId]/records/[recordId]`

### workflowos (3 routes)

`/workflowos`, `/workflowos/admin`, `/workflowos/clients/[clientId]/records/[recordId]`

### API Routes (10 routes)

Auth, health, metrics, audit evidence download, audit export, office-ai download, local-content download, sunbul export, sunbul document download, custom product submit

### Legacy (1 route)

`/published/recommendation/[decisionId]`

---

## LocalContentOS Routes Added

| Route                                                | Type               | Protected    | Status             | Notes                          |
| ---------------------------------------------------- | ------------------ | ------------ | ------------------ | ------------------------------ |
| `/local-content`                                     | Governed workspace | ✅ Protected | L5 with conditions | Dashboard with project metrics |
| `/local-content/projects`                            | Governed workspace | ✅ Protected | L5 with conditions | Project list with create form  |
| `/local-content/projects/[projectId]`                | Governed workspace | ✅ Protected | L5 with conditions | Detail with scoring            |
| `/local-content/projects/[projectId]/suppliers`      | Governed workspace | ✅ Protected | L5 with conditions | Supplier records               |
| `/local-content/projects/[projectId]/spend`          | Governed workspace | ✅ Protected | L5 with conditions | Spend records                  |
| `/local-content/projects/[projectId]/classification` | Governed workspace | ✅ Protected | L5 with conditions | Classification workflow        |
| `/local-content/projects/[projectId]/evidence`       | Governed workspace | ✅ Protected | L5 with conditions | Evidence upload                |
| `/local-content/projects/[projectId]/findings`       | Governed workspace | ✅ Protected | L5 with conditions | Gap/risk findings              |
| `/local-content/projects/[projectId]/review`         | Governed workspace | ✅ Protected | L5 with conditions | Review workflow                |
| `/local-content/projects/[projectId]/approval`       | Governed workspace | ✅ Protected | L5 with conditions | Approval workflow              |
| `/local-content/projects/[projectId]/reports`        | Governed workspace | ✅ Protected | L5 with conditions | Export/reports                 |
| `/local-content/projects/[projectId]/audit-trail`    | Governed workspace | ✅ Protected | L5 with conditions | Audit log                      |

All routes are server-action-backed (`@/actions/localcontent-actions`). Limitations: 13/45 browser smoke tests pending, PDF/XLSX binary generation deferred.

---

## Route Strategy Corrections

1. **LocalContentOS route note updated** — Old route table had `/products/local-content` with note "Workspace routes at `/local-content/*` are now live (Phase 3: 5 routes implemented)." This was out of date. There are 12 routes, all at L5 with conditions.

2. **Rule 8 updated** — Old rule said "do not create `/simulation` top-level routes until that system has a real workspace implementation. `/local-content/*` workspace routes are planned and scope-locked for v0.1 — implementation may begin once the scope-lock report confirms readiness." Updated to reflect that `/local-content/*` routes are already implemented and live.

3. **Missing routes added** — The old route table was incomplete. Routes added:
   - All 12 LocalContentOS workspace routes
   - All AuditOS engagement sub-routes (16 total)
   - All DecisionOS sub-routes (19 total)
   - All company/marketing pages
   - All API routes including local-content download and sunbul exports
   - `/organizations/sunbul`
   - Legacy `/published/recommendation/[decisionId]`

4. **API route `/api/local-content/projects/[projectId]/reports/[reportId]/download`** — Previously undocumented. It is authenticated, permissioned (project access check), and audit-logged.

5. **Route type classification added** — Each route now has explicit type, public/protected status, and implementation status.

---

## Validation Results

| Command            | Result                              |
| ------------------ | ----------------------------------- |
| `npx tsc --noEmit` | Not run (documentation-only change) |
| `npm run lint`     | Not run (documentation-only change) |
| `npm run build`    | Not run (documentation-only change) |
| `npm test`         | Not run (documentation-only change) |

**Note:** This task changed only `docs/source-of-truth/ROUTE_STRATEGY.md` and created one report file. No code or schema files were modified. No build, lint, or test impact.

---

## Remaining Risks

1. **No code changes were made** — This is a documentation-only alignment. If any route paths change in the future, `ROUTE_STRATEGY.md` must be updated.
2. **AuditOS `/audit/engagements/[engagementId]/pilot`** route exists in code but may be a special surface — verified it uses same patterns as other AuditOS routes.
3. **LocalContentOS route limitations** remain honest: not L6; binary PDF/XLSX deferred; review/approval/report inline forms may need clean manual pass. Mutation feedback loop verified 2026-05-23 — see `docs/reports/localcontentos-v0.1-documentation-truth-sync-2026-05-23.md`.
4. **Route protection verification** — The route table marks `/local-content/*` as protected based on server-action patterns and `getCurrentUser()` calls. Full middleware/proxy auth coverage should be verified independently.

## Next Recommended Step

Run a targeted auth audit on all protected routes to confirm middleware/proxy coverage is consistent across `/audit/*`, `/decisions/*`, `/local-content/*`, `/assistant/*`, `/sunbul/*`, and `/workflowos/*`.
