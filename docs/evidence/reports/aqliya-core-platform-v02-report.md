# AQLIYA Core Platform v0.2 Report — Agent 1

**Date:** 2026-05-29  
**Agent:** 1 — Core Platform & Security Perimeter  
**Branch:** `eid-sprint-stabilization-2026-05-29` @ `6034950`  
**Scope:** Middleware perimeter, platform ADMIN surfaces, download tokens, tenant isolation on admin metrics  
**Out of scope (per boundaries):** `/audit/*`, `/local-content/*`, marketing, DecisionOS product work, schema/migrations, auth redesign, middleware rewrite

---

## Summary

- Inspected auth middleware, platform ADMIN routes, RBAC, tenant isolation, audit logs, monitoring, download/export safety, and health endpoints.
- **Fixed 4 high-confidence gaps:** missing ADMIN gates on two diagnostic settings pages; global (cross-tenant) counts on `/monitoring` and `/api/metrics`; global linkage stats on `/settings/workspaces`; added denied download-token audit logging.
- **No middleware or schema changes.** Platform admin layer strengthened with minimal, targeted diffs.
- P1-7 (`platformOrganizationId` guard parity across product libs) **not implemented** — remains optional/backlog per expansion plan unless explicitly approved.

---

## Route Access Matrix (Platform-Owned Surfaces)

### Middleware (`src/middleware.ts`)

| Class | Routes | Auth | Notes |
| ----- | ------ | ---- | ----- |
| **Public exact** | `/`, `/login`, `/access-denied`, marketing roots, `/auditos`, `/api/custom-product-submit`, `/api/pilot-review` | None | JWT bypass |
| **Public prefix** | `/_next`, `/api/auth`, `/api/health`, `/auditos/`, `/products/`, `/buyers/`, `/insights/` | None | Static + marketing |
| **Protected (matcher)** | `/settings/*`, `/monitoring`, `/organizations/*`, `/assistant/*`, `/sales`, `/intelligence/*`, `/workflowos/*`, `/sunbul/*`, product workspaces, sensitive `/api/*` | JWT required | Redirect → `/login` or 401 JSON |
| **Not in matcher** | `/api/health`, `/api/auth/*` | Public by design | Route handlers own auth where needed |

**Middleware matcher coverage:** All listed sensitive API download/export routes and platform admin page prefixes are in the matcher. No new unmatched sensitive API routes found.

### Platform Settings / Admin Pages

| Route | Middleware | Page RBAC | Tenant scope | Status |
| ----- | ---------- | --------- | ------------ | ------ |
| `/settings` | Protected | Any authenticated user | N/A (local-state shell) | L2 shell — banner present |
| `/settings/audit-logs` | Protected | **ADMIN** | `platformOrganizationId` on queries | OK (pre-existing + refactored helper) |
| `/settings/platform-organization` | Protected | **ADMIN** *(fixed)* | User session + resolved org | **Fixed** — was any authenticated user |
| `/settings/workspaces` | Protected | **ADMIN** *(fixed)* | Workspace list tenant-scoped; stats **now tenant-scoped** | **Fixed** |
| `/monitoring` | Protected | **ADMIN** | Counts **now tenant-scoped** | **Fixed** — was global counts |

### Platform API Routes (Agent 1 ownership)

| Route | Middleware | Handler RBAC | Tenant scope | Audit on success |
| ----- | ---------- | ------------ | ------------ | ---------------- |
| `/api/health` | Public | None | N/A | No |
| `/api/metrics` | Protected | **ADMIN** | **Now tenant-scoped** *(fixed)* | No |
| `/api/pilot/ops` | Protected | Authenticated | Session metadata only | No |
| `/api/office-ai/download` | Protected | VIEWER+ | `platformOrganizationId` match | Yes |
| Download token action | Server action | Auth + resource verify | Org resolved per resource type | Yes (+ **denied** log added) |

### Download Token Flow (`src/actions/download-token-actions.ts`)

| Resource type | Permission check | Token org field | Consumer route |
| ------------- | ---------------- | --------------- | -------------- |
| `audit_evidence` | Audit org via `platformOrganizationId` → `auditOrganization` | Audit org ID | `/api/audit/evidence/[id]/download?token=` |
| `office_ai_output` | Task `platformOrganizationId` match | Legacy `organizationId` | Not wired to token download today (direct auth route) |

Token signing: HMAC-SHA256, 5-minute expiry, `DOWNLOAD_TOKEN_SECRET` required.

---

## Findings — Gaps & Resolutions

### P0 — Fixed this pass

| ID | Gap | Resolution |
| -- | --- | ---------- |
| G1 | `/settings/platform-organization` and `/settings/workspaces` lacked ADMIN gate | Added `requirePlatformAdminPage()` — shared helper at `src/lib/platform/require-platform-admin.ts` |
| G2 | `/monitoring` and `/api/metrics` returned **global** cross-tenant counts to ADMIN users | Added `src/lib/platform/admin-metrics-scope.ts`; counts filtered via resolved audit/decision org IDs + workspace scope |
| G3 | `/settings/workspaces` summary stats were global while workspace list was tenant-scoped | Reused `countPlatformWorkspaceLinkage()` with same tenant filters |
| G4 | Download token denial had no audit trail | `download_token.denied` logged (warning severity) when authenticated user fails permission check |

### P1 — Open / deferred (not fixed — boundary or approval)

| ID | Gap | Owner / note |
| -- | --- | ------------ |
| G5 | P1-7: `platformOrganizationId` guard parity in product action libs | Deferred — requires explicit approval per expansion plan |
| G6 | `requirePlatformOrganization()` exists but is **not wired** into routes (report-only guard) | Intentional non-blocking mode; wiring is a broader change |
| G7 | `/settings` shell has no ADMIN gate | Documented L2 internal preview — acceptable per ROUTE_STRATEGY |
| G8 | `/api/pilot/ops` exposes aggregate diagnostics to any authenticated user | Pilot-week facilitator tool — not platform admin; out of Agent 1 change scope |
| G9 | WorkflowOS download returns 403 on access denied (ROUTE_STRATEGY prefers 404 for tenant-safe) | WorkflowOS route — Agent 4 boundary |
| G10 | `office_ai_output` download tokens not consumed by `/api/office-ai/download` | Token path exists in actions but direct auth used; low risk today |

### P2 — Observations (no code change)

| Item | Detail |
| ---- | ------ |
| Health endpoint | `/api/health` public; returns pilot liveness diagnostics only — not L6 certification |
| Rate limiting | Middleware rate limit + per-route download rate limits (office-ai, audit) |
| Audit log viewer | Already tenant-scoped; shows missing org/workspace/project counts as diagnostics |
| Actor lineage (P3-1) | Governance Core adoption not started — future approved work |

---

## Audit Log Coverage Improvements

| Event | Before | After |
| ----- | ------ | ----- |
| `download_token.issued` | Yes | Unchanged |
| `download_token.denied` | No | **Added** — authenticated denial only |
| Admin page access | No | Not added (would be noisy; deferred) |
| Metrics/monitoring reads | No | Not added (read-only admin diagnostics) |

---

## Settings / Admin / Monitoring UX

| Surface | UX state |
| ------- | -------- |
| `/settings` | Client shell with amber "Internal Preview" banner — honest about no persistence |
| `/settings/audit-logs` | Functional ADMIN viewer with filters |
| `/settings/platform-organization` | Guard report + linkage diagnostics — now ADMIN-only |
| `/settings/workspaces` | Linkage verification — now ADMIN-only + tenant-scoped stats |
| `/monitoring` | Arabic KPI cards — now tenant-scoped with unscoped-session warning |

No new UI shells added. Existing scaffolds labeled appropriately.

---

## Health / Readiness

| Endpoint / doc | Role |
| -------------- | ---- |
| `/api/health` | Public liveness + pilot sanity (`buildPilotOpsDiagnostics`) |
| `/api/pilot/ops` | Authenticated facilitator diagnostics (Session 4 metadata) |
| `docs/source-of-truth/READINESS_GATES.md` | Unchanged — Agent 7 owns sync post-validation |
| `docs/source-of-truth/ROUTE_STRATEGY.md` | Accurate for platform routes; no update required for this pass |

**Recommendation:** After Agent 6 medium validation pass, Agent 7 may add a Phase 10 row noting platform admin tenant-scoping hardening (this report as evidence).

---

## Files Changed

| File | Change |
| ---- | ------ |
| `src/lib/platform/admin-metrics-scope.ts` | **Created** — tenant-scoped admin metric filters and counters |
| `src/lib/platform/require-platform-admin.ts` | **Created** — shared ADMIN page gate |
| `src/app/(dashboard)/monitoring/page.tsx` | Tenant-scoped metrics; uses ADMIN helper |
| `src/app/api/metrics/route.ts` | Tenant-scoped groupBy/counts; meta includes org ID |
| `src/app/(dashboard)/settings/platform-organization/page.tsx` | ADMIN gate |
| `src/app/(dashboard)/settings/workspaces/page.tsx` | ADMIN gate + tenant-scoped linkage stats |
| `src/app/(dashboard)/settings/audit-logs/page.tsx` | Refactored to ADMIN helper (behavior unchanged) |
| `src/actions/download-token-actions.ts` | Audit log on denied token requests |
| `docs/reports/aqliya-core-platform-v02-report.md` | **Created** — this report |

---

## Governance Check

| Control | Status |
| ------- | ------ |
| RBAC | ADMIN enforced on all platform diagnostic admin pages |
| Tenant isolation | Admin metrics/API no longer leak cross-tenant totals |
| Evidence | N/A — no evidence workflow changes |
| Audit trail | Download token denial now logged |
| Review/approval | N/A |
| Export control | Download token path unchanged; denial logged |
| AI boundary | N/A |

---

## Validation

| Command | Result |
| ------- | ------ |
| `npx tsc --noEmit` (filtered to changed paths) | **Pass** |
| `npx eslint <changed-paths> --quiet` | **Pass** (no output) |
| `npm run build` | **Not run** (per low-load / task boundary) |
| `npm run lint` (full) | **Not run** |
| `npm test` | **Not run** |

---

## Risks / Limitations

- Admin metrics depend on `AuditOrganization.platformOrganizationId` and `Organization.platformOrganizationId` linkage — unlinked legacy rows excluded (counts may under-report until linkage complete).
- Sessions without `platformOrganizationId` show zero metrics with warning — safer than global leak but may confuse admins until session enrichment is complete.
- P1-7 product-level guard parity not addressed.
- Full validation suite not re-run on integrated tree (delegated to Agent 6).

---

## Next Recommended Step

1. **Agent 6** — Include changed paths in medium validation pass.
2. **Optional (explicit approval)** — P1-7: wire `requirePlatformOrganization({ throwOnError: true })` into high-risk mutation paths outside Agent 1 scope.
3. **Agent 7** — Reference this report when syncing readiness gates / matrix Phase 10.

---

## Agent 1 Sign-off

| Field | Value |
| ----- | ----- |
| **Status** | **DONE** |
| **Code changed** | Yes (targeted platform admin hardening) |
| **Schema changed** | No |
| **Classification impact** | Platform admin L4 → L4 hardened (tenant-scoped admin metrics) |

*Agent 1 — Core Platform v0.2. Boundaries preserved; no overlap with AuditOS, LocalContentOS, marketing, or DecisionOS product streams.*
