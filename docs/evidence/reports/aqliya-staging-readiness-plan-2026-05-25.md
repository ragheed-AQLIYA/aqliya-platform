# AQLIYA Staging Readiness Plan

**Date:** 2026-05-25  
**Status:** Level 6 — Evidence only  
**Verdict:** READY FOR STAGING VERIFICATION — NOT YET STAGING VERIFIED

> This plan defines the prerequisites, risks, smoke checklist, and Go/No-Go criteria for deploying a controlled pilot staging environment. It does not authorize public production deployment.

---

## 1. Current Verified Baseline

| Area | Status | Evidence |
|------|--------|----------|
| AuditOS DB-backed exports PDF | ✅ | 200, `application/pdf`, `%PDF-1.3`, 7,947 bytes |
| AuditOS DB-backed exports XLSX | ✅ | 200, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `PK\x03\x04`, 35,522 bytes |
| AuditOS protected API | ✅ | `exportEngagementAction` requires auth + role + tenant guard + rate limit |
| AuditOS audit event `export.generated` | ✅ | Recorded on each export |
| LocalContentOS exports PDF | ✅ | 200, `application/pdf`, `%PDF-1.3`, 2,510 bytes |
| LocalContentOS exports XLSX | ✅ | 200, XLSX MIME, `PK\x03\x04`, 17,582 bytes |
| Browser smoke (LocalContentOS) | ✅ | 0 console errors, reports page loads, resilience files work |
| Browser smoke (DecisionOS) | ✅ | not-found page, inline error handling |
| Browser smoke (AuditOS exports) | ✅ | Page loads with 3 statements, download buttons enabled |
| Unit tests (local-content export) | ✅ | 3/3 pass |
| Release lock report | ✅ | `aqliya-controlled-pilot-release-lock-2026-05-25.md` |
| Product status matrix | ✅ | Synced with Phase 0–6 completions |

---

## 2. Staging Prerequisites

### 2.1 Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_URL` | ✅ | Auth callback URL (staging domain) |
| `NEXTAUTH_SECRET` | ✅ | Auth encryption secret |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public app URL for links and redirects |
| `UPLOAD_DIR` | ✅ | File upload storage path |
| `AI_MODEL_PROVIDER` | Conditional | AI provider for pilot features |
| `AI_MODEL_API_KEY` | Conditional | AI provider API key |
| `NODE_ENV` | ✅ | Must be `production` for staging |
| `LOG_LEVEL` | Recommended | `info` for pilot monitoring |

### 2.2 Database

- PostgreSQL instance (separate from development)
- Run `npx prisma migrate dev` or equivalent to apply schema
- Run seed commands:
  - `npm run seed:audit` (AuditOS demo engagement + financial statements)
  - Standard seeds for main platform data (users, organizations)
- Verify `admin@aqliya.com` or staging user has corresponding `AuditUser` record in `auditUser` table

### 2.3 Auth

- NextAuth v5 configured with credentials provider
- Demo fallback (`getAuditActor` line 69-81) must NOT activate in staging/production
- Staging user must have:
  - `User` record in platform `User` table
  - `AuditUser` record in `auditUser` table with matching `organizationId` + `email`
  - Active status
- Demo fallback auto-disables when `NODE_ENV=production`

### 2.4 Storage

- File uploads directory writable
- For pilot: local filesystem storage is acceptable
- For future: S3-compatible object storage should be prepared but NOT required at staging

### 2.5 Domain / Runtime

- Staging domain: e.g., `staging.aqliya.com` or `pilot.aqliya.com`
- HTTPS termination (TLS certificate)
- Node.js 20+ runtime
- Minimum 2GB RAM, recommended 4GB

---

## 3. Demo Fallback Risk

### 3.1 Where Fallback Exists

| Location | File | Line | Behavior |
|----------|------|------|----------|
| `getAuditActor` | `src/lib/audit/actor-context.ts` | 69-81 | Falls to hardcoded `{ actorId: "usr-ahmed", organizationId: "org-aqliya", role: "operator" }` when no AuditUser mapping found AND `NODE_ENV=development` |
| `getDashboardSummary` | `src/lib/audit/db/index.ts` | 404-407 | Returns `mock.mockDashboardSummary` when no engagements found |
| `getEngagement` | `src/lib/audit/db/index.ts` | 452-455 | Returns mock engagement when DB query returns empty |
| `getFinancialStatements` | `src/lib/audit/db/index.ts` | 1158-1159 | Returns mock statements when DB returns empty |
| All service functions | `src/lib/audit/services.ts` | 44-58 | `tryDb` wrapper catches DB errors and falls to mock fallback |

### 3.2 Why Acceptable Locally

- Development environment has no production data and no real customers
- Demo fallback allows developers to test UI without seeding full DB
- `NODE_ENV=development` gate prevents fallback activation in staging/production

### 3.3 Why Not for Staging Pilot

- Staging pilot must prove real DB-backed auth and data flow
- Fallback bypasses tenant isolation, audit logging, and role checks
- Fallback creates false sense of security (e.g., admin operations appear to work without real permissions)
- `assertEngagementAccess` does NOT use fallback — it queries Prisma directly, so it will throw in staging if engagement is not in DB

### 3.4 Recommended Closure Path

1. Create `AuditUser` record for every staging user (via `ensureAuditUserProvisioned` or seed)
2. Run `npm run seed:audit` to load `eng-gulf-2025` with statements
3. Verify login → AuditOS exports work with real DB user, not demo actor
4. Optional: add `DISABLE_AUDIT_DEMO_FALLBACK=1` env check for explicit safety

---

## 4. Staging Smoke Checklist

| # | Check | Expected Result |
|---|-------|-----------------|
| 1 | Login | Authenticate with staging credentials |
| 2 | AuditOS Dashboard | Loads with metrics, no mock fallback console warning |
| 3 | AuditOS Engagement `eng-gulf-2025` | Loads detail page with tabs |
| 4 | AuditOS Export page | Shows "3 قائمة" financial statements, PDF + XLSX buttons enabled |
| 5 | AuditOS Export PDF download | 200, `application/pdf`, `%PDF-1.3`, >5KB |
| 6 | AuditOS Export XLSX download | 200, XLSX MIME, `PK\x03\x04`, >10KB |
| 7 | AuditOS protected API without auth | Returns 401 |
| 8 | LocalContentOS Projects list | Loads with project cards |
| 9 | LocalContentOS Reports page | Loads with 4 reports + export notes card |
| 10 | LocalContentOS PDF download | 200, `application/pdf`, `%PDF-1.3` |
| 11 | LocalContentOS XLSX download | 200, XLSX MIME, `PK\x03\x04` |
| 12 | DecisionOS not-found | Shows "القرار غير موجود" for nonexistent ID |
| 13 | Console errors (all pages) | 0 new errors per route (pre-existing sidebar warnings exempted) |

---

## 5. Go/No-Go Criteria

### 5.1 Go

All of the following must pass:

- [ ] Login works with DB-backed credentials
- [ ] AuditOS engagement page loads with DB data (no mock fallback)
- [ ] AuditOS PDF export returns `%PDF-1.3` binary
- [ ] AuditOS XLSX export returns `PK\x03\x04` binary
- [ ] LocalContentOS PDF export returns `%PDF-1.3` binary
- [ ] LocalContentOS XLSX export returns `PK\x03\x04` binary
- [ ] Export API returns 401 without valid session
- [ ] No P0 runtime errors in any verified route
- [ ] Console errors count: only pre-existing sidebar duplicate-key warnings
- [ ] AuditUser mapping exists for the staging admin user
- [ ] `NODE_ENV=production` (demo fallback disabled)

### 5.2 No-Go Blocker

Any of these blocks the pilot:

- [ ] Login fails or relies on mock/demo credentials
- [ ] No DB-backed `AuditUser` for the staging admin
- [ ] `npm run seed:audit` not run (engagement not accessible)
- [ ] Export API returns 401/403/500 for authenticated user
- [ ] Export route is publicly accessible without auth
- [ ] Tenant data leaks across organizations
- [ ] Files are publicly accessible without permission
- [ ] Application crashes on any smoke route (500 errors)

---

## 6. Rollback Plan

If staging deploy produces blocking issues:

1. **Stop the staging server** — prevent further access
2. **Restore previous DB backup** (if seed/migration caused issues):
   `npm run db:restore`
3. **Reset DNS** to point back to development or previous staging
4. **Document the blocker** in the release lock report
5. **Fix and repeat** — do not force deploy with known blockers

---

## 7. Known Non-Blocking Gaps

| Gap | Impact | Severity |
|-----|--------|----------|
| Arabic font embedding in PDFs | Arabic text may not render correctly in exported PDFs | P2 |
| XLSX styling improvements | XLSX exports are functional but use default styling | P3 |
| Sidebar duplicate-key warnings (14×) | Console noise only, no UX impact — fixed in code, needs rebuild | P3 |
| LocalContentOS mutation tests | No Server Action tests for create/update/delete | P3 |
| No CI/CD pipeline | Manual deploy only | P2 |
| No automated backup verification in staging | Manual backup only | P2 |

---

## 8. Recommended Next Implementation

After the plan is accepted:

1. **Create DB-backed AuditUser mapping** for the staging admin email
2. **Fix sidebar duplicate-key warnings** — already done (use `item.name` instead of `item.href` as key)
3. **Prepare staging environment** — provision server, DB, env vars
4. **Run staging smoke** — execute checklist in Section 4
5. **If all Go criteria pass** — mark staging verified
6. **Onboard first controlled pilot tenant**
7. **Only after pilot feedback** — begin SalesOS or LocalContentOS mutation tests
