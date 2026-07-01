# AQLIYA First Controlled Pilot — Handoff Package

**Date:** 2026-05-25  
**Status:** Level 6 — Evidence only  
**Verdict:** READY FOR FIRST CONTROLLED PILOT SETUP — INFRASTRUCTURE REQUIRED  
**Phase:** 11 (Handoff)  
**Prerequisites:** Phases 0–10 → Staging smoke GO (local verification) → Infrastructure provisioning required

> This document is a handoff package for the team or person responsible for deploying the first controlled pilot staging environment. It does not authorize public production deployment. Do not deploy without completing the checklist in Section 4.

---

## 1. Executive Summary

AQLIYA Phases 0–10 are complete. The system has been verified locally:

| Area | Verdict | Evidence |
|------|---------|----------|
| AuditOS DB-backed auth actor | ✅ | Login → User → PlatformOrganization → AuditOrganization → AuditUser (bridge fixed in Task 9.2) |
| AuditOS PDF export | ✅ | 200, `application/pdf`, `%PDF-1.3`, 7,949 bytes |
| AuditOS XLSX export | ✅ | 200, XLSX MIME, `PK\x03\x04`, 35,522 bytes |
| AuditOS protected API | ✅ | Export returns 401 without session, 403 for wrong role/org |
| LocalContentOS PDF export | ✅ | 200, `application/pdf`, `%PDF-1.3`, 2,510 bytes |
| LocalContentOS XLSX export | ✅ | 200, XLSX MIME, `PK\x03\x04`, 17,582 bytes |
| DecisionOS resilience | ✅ | 0 errors on list page, graceful not-found |
| Console errors (all routes) | ✅ | 0 errors — sidebar duplicate-key warnings fixed |
| Staging smoke (local) | ✅ | GO verdict — no blocking issues |
| Release lock | ✅ | `aqliya-controlled-pilot-release-lock-2026-05-25.md` |
| Staging readiness plan | ✅ | `aqliya-staging-readiness-plan-2026-05-25.md` |
| Unit tests (export) | ✅ | 3/3 pass |

**The blocker is operational, not code-based.** Staging infrastructure must be provisioned before pilot deployment can proceed.

---

## 2. Infrastructure Prerequisites

### 2.1 Server / Hosting

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js runtime | 20.x | 22.x LTS |
| RAM | 2 GB | 4 GB |
| Disk | 10 GB | 20 GB |
| OS | Linux or Windows Server | Linux (Ubuntu 22.04+) |
| HTTPS certificate | TLS 1.2+ | Let's Encrypt or corporate CA |

### 2.2 Database

- PostgreSQL 15+ instance (separate from development — do not share dev DB)
- Connection string format: `postgresql://user:password@host:5432/aqliya?schema=public`
- Must be accessible from the server runtime

### 2.3 Domain / Network

- Staging domain: e.g., `staging.aqliya.com` or `pilot.aqliya.com`
- HTTPS termination (TLS)
- Port 443 (HTTPS) open
- Outbound access for AI provider API (if used)

### 2.4 Storage

- File uploads directory: writable by the Node process
- For pilot: local filesystem storage is sufficient
- S3-compatible object storage: NOT required for pilot — prepare for future but do not block on it

---

## 3. Environment Variables

### 3.1 Required

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/aqliya?schema=public` |
| `NEXTAUTH_URL` | Auth callback URL (staging domain with HTTPS) | `https://staging.aqliya.com` |
| `AUTH_SECRET` | Auth.js v5 encryption secret (generate: `openssl rand -base64 32`) | `SWPbmu3Vn4pYC0wUo+O2GpHXCIwaG2K6GMnV68spl8o=` |
| `AUTH_URL` | Auth URL (same as NEXTAUTH_URL for same-origin) | `https://staging.aqliya.com` |
| `NODE_ENV` | Must be `production` for staging (disables demo fallback) | `production` |

### 3.2 Platform

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_APP_URL` | Public app URL for links and redirects | `https://staging.aqliya.com` |

### 3.3 Optional / Conditional

| Variable | Purpose | Required for |
|----------|---------|--------------|
| `LOG_LEVEL` | Logging verbosity | Monitoring — recommended: `info` |
| `UPLOAD_DIR` | File upload storage path | Evidence uploads — default: `./uploads` |
| `AI_MODEL_PROVIDER` | AI provider (e.g., `openai`, `local`) | AI review features |
| `AI_MODEL_API_KEY` | AI provider API key | AI review features |
| `SENTRY_DSN` / `SENTRY_AUTH_TOKEN` / `NEXT_PUBLIC_SENTRY_DSN` | Error monitoring | Pilot monitoring |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Analytics domain | Pilot analytics |
| `ANALYZE` | Bundle analysis | Development only — set `false` |

### 3.4 Sensitive Variables — Do NOT Commit

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/aqliya
NEXTAUTH_URL=https://staging.aqliya.com
AUTH_SECRET=<generated-secret>
AUTH_URL=https://staging.aqliya.com
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging.aqliya.com

# Optional
LOG_LEVEL=info
UPLOAD_DIR=./uploads
```

---

## 4. Deployment Sequence

### Step 1 — Provision Infrastructure

1. Provision server (VM or container)
2. Create staging PostgreSQL database
3. Configure DNS — point staging domain to server IP
4. Issue TLS certificate (Let's Encrypt or corporate CA)
5. Configure reverse proxy (nginx/Caddy) → Next.js (port 3000)

### Step 2 — Deploy Application

```bash
# Clone repository
git clone <repo-url> /opt/aqliya
cd /opt/aqliya

# Install dependencies
npm install

# Set environment variables (see Section 3)
# Write .env file or set via deployment platform UI

# Build
npm run build

# Start (use process manager like PM2)
npm start
```

### Step 3 — Apply Schema

```bash
# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate deploy
```

### Step 4 — Run Seeds (Strict Order)

```bash
# 1. Platform seed — creates Organization, PlatformOrganization, User, roles
npx tsx prisma/seed.ts

# 2. AuditOS seed — creates AuditOrganization, AuditUser, engagement eng-gulf-2025
npm run seed:audit
```

**Seed order matters.** `prisma/seed.ts` creates the `PlatformOrganization` bridge record. `prisma/seed-audit.ts` links `AuditOrganization.platformOrganizationId` to the same bridge. Running them in reverse will cause the bridge link to be missing.

### Step 5 — Verify Auth Chain

1. Navigate to staging URL
2. Log in with seed user:
   - Email: `admin@aqliya.com`
   - Password: (set in prisma/seed.ts — default: `Admin@123456`)
3. Verify dashboard loads with real data

### Step 6 — Run Smoke Checklist (Section 8)

---

## 5. Seed Data Overview

### 5.1 `prisma/seed.ts` (Platform)

Creates:

| Entity | Details |
|--------|---------|
| `PlatformOrganization` | Slug: `aqliya-demo` — bridge entity linking platform Org ↔ AuditOrg |
| `Organization` | "AQLIYA Demo Organization" — linked to PlatformOrganization |
| `User` | 4 users: admin, decision maker, risk manager, regular user |
| `DecisionOS` data | 3 seed decisions with alternatives, risks, recommendations, approvals, audit logs |
| `Setting`, `ApiKey`, etc. | Platform configuration |

**Key admin user:** `admin@aqliya.com`

### 5.2 `npm run seed:audit`

Creates:

| Entity | Details |
|--------|---------|
| `AuditOrganization` | ID: `org-aqliya` — linked to `PlatformOrganization` via `platformOrganizationId` |
| `AuditUser` | 5 users: admin (roles), operator, reviewer, partner, client |
| `AuditTrialBalance` | 53 account lines |
| `AuditCanonicalAccount` | 23 mapped accounts |
| `AuditAccountMapping` | 23 mappings (trial balance → canonical) |
| `AuditFinancialStatement` | 3 statements: Balance Sheet, Income Statement, Cash Flow |
| `AuditDisclosureNote` | 5 disclosure notes |
| `AuditEvidence` | 5 evidence records |
| `AuditFinding` | 5 findings |
| `AuditRecommendation` | 3 recommendations |
| `AuditReviewComment` | 6 review comments |
| `AuditApprovalRecord` | Approval chain |

---

## 6. Auth Chain Summary

```
Login (admin@aqliya.com)
  → User.organizationId = Organization.id  ("AQLIYA Demo Organization")
    → Organization.platformOrganizationId = PlatformOrganization.id (slug: "aqliya-demo")
      → AuditOrganization.platformOrganizationId = PlatformOrganization.id (same)
        → AuditUser.organizationId = AuditOrganization.id ("org-aqliya")
          → AuditUser.email = "admin@aqliya.com"
            → getAuditActor() resolves as DB-backed actor (name: "Admin User", role: "admin")
              → assertEngagementAccess() allows engagement "eng-gulf-2025"
                → Export routes work with real permissions
```

**NODE_ENV=production** disables the demo fallback in `actor-context.ts` (line 78). If the DB bridge fails in production, the system throws an error rather than silently using a demo actor.

---

## 7. First Pilot Tenant Setup Checklist

### 7.1 Organization

- [ ] Create Organization record (if not using seed org)
- [ ] Create PlatformOrganization record with unique slug
- [ ] Link Organization.platformOrganizationId to PlatformOrganization
- [ ] Create AuditOrganization record with platformOrganizationId linked to same PlatformOrganization
- [ ] Verify tenant isolation: `assertEngagementAccess` scopes to AuditOrganization

### 7.2 Users / Roles

- [ ] Create User record with appropriate role (`admin`, `operator`, `reviewer`, `partner`, `client`)
- [ ] Ensure User.organizationId matches the Organization
- [ ] Create AuditUser record with:
  - Same email as User
  - organizationId = AuditOrganization.id
  - Appropriate role (`admin`, `operator`, `reviewer`, `partner`, `client`)
  - Active status
- [ ] Verify login works and actor resolves as DB-backed user (not fallback)

### 7.3 Engagement / Project

- [ ] Create engagement via AuditOS workspace UI (or seed)
- [ ] Upload trial balance
- [ ] Map accounts
- [ ] Generate financial statements
- [ ] Attach evidence
- [ ] Run review/approval workflow
- [ ] Verify export access

### 7.4 Data Boundaries

- [ ] Verify tenant 1 cannot see tenant 2 data
- [ ] Verify unauthenticated user cannot access any workspace route
- [ ] Verify export route returns 401/403 for unauthorized users

### 7.5 Export Access

- [ ] Verify PDF export returns `application/pdf` + `%PDF-1.3` header
- [ ] Verify XLSX export returns correct MIME + `PK\x03\x04` header
- [ ] Verify export records audit event (`export.generated`)
- [ ] Verify export API guarded: 401 without session, 403 for wrong role/org

---

## 8. Staging Smoke Checklist

### 8.1 Auth / Platform

| # | Check | Expected |
|---|-------|----------|
| 1 | Login with staging admin | 200, dashboard loads |
| 2 | Dashboard shows real data | No mock fallback warning in console |
| 3 | Logout works | Session cleared |
| 4 | Actor resolves as DB user | Audit events show "Admin User" not "Ahmed Al Ghamdi" (fallback) |

### 8.2 AuditOS

| # | Check | Expected |
|---|-------|----------|
| 5 | `/audit` | Loads with metrics, 0 console errors |
| 6 | `/audit/engagements/eng-gulf-2025` | Detail page loads with tabs, 0 errors |
| 7 | `/audit/engagements/eng-gulf-2025/exports` | Shows 3 statements, download buttons enabled, 0 errors |
| 8 | PDF download | 200, `application/pdf`, `%PDF-1.3`, >5 KB |
| 9 | XLSX download | 200, XLSX MIME, `PK\x03\x04`, >10 KB |
| 10 | No-auth export | 401 |
| 11 | Wrong-role export | 403 |
| 12 | Audit event recorded | Verify `auditEvent` table has `export.generated` event |

### 8.3 LocalContentOS

| # | Check | Expected |
|---|-------|----------|
| 13 | `/local-content/projects` | Loads with project cards, 0 errors |
| 14 | Project detail page | Loads if seed exists |
| 15 | Reports page | 0 errors |
| 16 | PDF download | 200, `application/pdf`, `%PDF-1.3` |
| 17 | XLSX download | 200, XLSX MIME, `PK\x03\x04` |

### 8.4 DecisionOS

| # | Check | Expected |
|---|-------|----------|
| 18 | `/decisions` | Loads with decision list, 0 errors |
| 19 | Valid decision `[id]` | Detail page loads if seed exists |
| 20 | Nonexistent decision | Shows "القرار غير موجود" gracefully |

### 8.5 Console / Runtime

| # | Check | Expected |
|---|-------|----------|
| 21 | All routes combined | 0 console errors |
| 22 | No 500 errors | Any unexpected server error |

---

## 9. Go / No-Go Criteria

### 9.1 GO

All of the following must pass:

- [ ] Login works with DB-backed credentials
- [ ] Dashboard loads with real DB data
- [ ] AuditOS actor resolves as DB-backed user (not fallback)
- [ ] AuditOS PDF export returns `%PDF-1.3` binary
- [ ] AuditOS XLSX export returns `PK\x03\x04` binary
- [ ] LocalContentOS PDF export returns `%PDF-1.3` binary
- [ ] LocalContentOS XLSX export returns `PK\x03\x04` binary
- [ ] Export API returns 401 without valid session
- [ ] No P0 runtime errors in any verified route
- [ ] Console errors: zero
- [ ] `NODE_ENV=production` (demo fallback disabled)
- [ ] AuditUser mapping exists for the staging admin
- [ ] Tenant 1 cannot see tenant 2 data

### 9.2 NO-GO (Blockers)

Any of these blocks the pilot:

- [ ] Login fails or relies on demo/mock credentials
- [ ] No DB-backed `AuditUser` for the staging admin
- [ ] Seed not run — engagement inaccessible or actor uses fallback
- [ ] Export API returns 401/403/500 for authenticated user
- [ ] Export route is publicly accessible without auth
- [ ] Tenant data leaks across organizations
- [ ] Files are publicly accessible without permission
- [ ] Application crashes on any smoke route (500 errors)
- [ ] Demo fallback activates in production (`getAudiActor` line 78 with `NODE_ENV=production`)

---

## 10. Rollback Plan

If staging deploy produces blocking issues:

1. **Stop the staging server** — prevent further access
2. **Restore previous DB backup** (if migration/seed caused issues):
   `pg_restore -U user -d aqliya /backup/aqliya-pre-pilot.dump`
3. **Reset DNS** to point back to development or maintenance page
4. **Document the blocker** — add entry to `aqliya-controlled-pilot-release-lock-2026-05-25.md`
5. **Fix and repeat** — do not force deploy with known blockers
6. **Communicate** — notify product owner and pilot operator of status change

---

## 11. Controlled Pilot Rules

### 11.1 Allowed Claims

- ✅ "AQLIYA staged — controlled pilot environment"
- ✅ "First controlled pilot — verifying DB-backed auth and export chain"
- ✅ "AuditOS — showing governed audit workflow with real financial data"
- ✅ "LocalContentOS — PDF and XLSX export verified"
- ✅ "DecisionOS — governed decision workflow with evidence chain"
- ✅ "AI review available with human oversight"
- ✅ "This is a controlled pilot environment — not live production"

### 11.2 Forbidden Claims

- ❌ "AQLIYA is production-ready" — it is controlled pilot-ready
- ❌ "Full production SaaS" — infrastructure is not production-hardened
- ❌ "Automated audit certification" — AI assists, humans decide
- ❌ "Production On-Prem available" — designed but not implemented
- ❌ "Air-Gapped mode available" — strategic only
- ❌ "Local AI runtime" — not implemented
- ❌ "SLA guaranteed" — no SLA without ops infrastructure
- ❌ "SOC 2 / ISO 27001 certified" — not certified

### 11.3 Mandatory Disclaimers

Every pilot output (exported PDF, XLSX, report) must include:

> "مخرجات تجريبية — مسودة أولية — ليست معتمدة نهائيًا"
> "Pilot output — preliminary draft — not a final approved report"

This is enforced by the export generators in `src/lib/local-content/export.ts` and `src/lib/audit/export.ts`.

---

## 12. Known Non-Blocking Limitations

| Gap | Impact | Severity |
|-----|--------|----------|
| Arabic font embedding in PDFs | Arabic text may not render correctly in exported PDFs | P2 — Defer |
| XLSX styling improvements | XLSX exports use default styling, functional but plain | P3 — Defer |
| LocalContentOS mutation tests | No Server Action tests for create/update/delete | P3 — Defer |
| No CI/CD pipeline | Manual deploy only | P2 — Defer |
| No automated backup verification | Manual backup only | P2 — Defer |
| No load testing | Unknown performance under concurrent users | P3 — Defer |
| No monitoring/alerting | Manual observation only | P2 — Defer |

None of these block the first controlled pilot. Document them for the pilot operator.

---

## 13. Ownership Matrix

| Role | Responsibility | Assigned to |
|------|----------------|-------------|
| **Deployment Owner** | Server provisioning, DNS, HTTPS, deploy scripts | _TBD_ |
| **Database Owner** | PostgreSQL provisioning, backup, access control | _TBD_ |
| **Product Owner** | Product readiness, pilot scope, feature decisions | _TBD_ |
| **Pilot Operator** | Daily pilot operation, user management, support | _TBD_ |
| **Customer Contact** | Primary point of contact for pilot tenant | _TBD_ |
| **Technical Contact** | Bug triage, code fixes during pilot | _TBD_ |
| **Documentation Owner** | Keeping docs in sync with pilot findings | _TBD_ |

---

## 14. Recommended Next Step

1. **Assign infra owner and create staging environment** — This is the blocker. No code changes are needed.
2. Once staging is live, the assigned deployment owner runs the smoke checklist (Section 8).
3. If all Go criteria pass: mark `docs/reports/README.md` as staging verified and begin pilot onboarding.
4. If any blocker occurs: execute rollback (Section 10) and document the issue.

**Do not begin SalesOS, LocalContentOS mutation tests, or any product expansion until the staging smoke passes with all Go criteria.**

---

## 15. Reference Documents

| Document | Location |
|----------|----------|
| Release lock | `docs/reports/aqliya-controlled-pilot-release-lock-2026-05-25.md` |
| Staging readiness plan | `docs/reports/aqliya-staging-readiness-plan-2026-05-25.md` |
| Product status matrix | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` |
| Route strategy | `docs/source-of-truth/ROUTE_STRATEGY.md` |
| Architecture | `docs/official/aqliya-core-architecture-v1.1.md` |
| Master reference | `docs/official/AQLIYA_MASTER_REFERENCE.md` |
| Implementation rules | `docs/official/aqliya-implementation-rules-v1.1.md` |
| Agent context | `docs/official/aqliya-agent-context-v1.1.md` |
