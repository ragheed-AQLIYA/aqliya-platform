# AQLIYA Security Remediation Report

**Date:** 2026-08-31  
**Baseline audit:** `docs/audits/AQLIYA_DEEP_SECURITY_AUDIT_2026-08-31.md`  
**Baseline commit:** `1e65d00211e84eaebedbbe842a30ee2fc2e41e32`  
**Authorization model:** `docs/audits/AQLIYA_AUTHORIZATION_MODEL_REMEDIATION.md`

This report is evidence, not doctrine. Implementation status is taken from the current tree.

---

## Findings Before Remediation

From the 2026-08-31 deep audit of commit `1e65d002`:

| Class | Count | Notes |
|---|---|---|
| P0 | 4 | ADMIN tenant bypass; notification cross-tenant feed; unscoped retention; tenant admin org/user ops |
| P1 | 14 | Unauthenticated Server Actions, webhook email mutation, SSRF, SSO secret disclosure, IDOR, privilege escalation, dead AI auth |
| P2 | 16 | Including SCIM ADMIN mint, middleware allowlist |
| P3 | 10 | Hardening |
| Cross-tenant | 11 | Including ADMIN bypass + notification + retention + admin ops |
| IDOR/BOLA | 8 | Knowledge mining, Office AI projects, Workflow membership, hybrid search, etc. |
| Privilege escalation | 6 | Invite any role, tenant ADMIN as platform, Workflow membership, org role write, DecisionOS escalations |
| Unauthenticated entry points | 4 | `createNotification`, DecisionOS gov reads, `listWebhooksAction`, webhook-adjacent |
| SSRF | Confirmed | WorkflowOS webhooks, notification webhooks, SIEM HTTP |
| Secret disclosure | 1 | SSO `clientSecret` decrypted into list/get responses |

Original verdict: **SECURITY STATUS: NO-GO**

---

## Changes Made

### Security model

- Platform privilege is an env allow-list (`PLATFORM_ADMIN_USER_IDS`, `PLATFORM_ADMIN_EMAILS`), not a Prisma role.
- Empty allow-list fails closed.
- Tenant `UserRole.ADMIN` is scoped to `user.organizationId`.

### P0

1. `checkTenantAccess()` — cross-tenant only for `isPlatformAdmin()`. Organization/settings `resource.id` is the target tenant when `tenantId` is omitted.
2. Platform notification aggregation and SSE — session org on Decision, Workflow, LocalContent (via project), SalesDeal, audit logs.
3. Retention engine — `organizationId` required; org-owned models filtered; non-org models skipped on tenant runs; HTTP route binds tenant ADMIN to session org.
4. Admin user/org operations — `assertAdmin` rejects foreign org IDs; org update/delete pass `tenantId`; `getSunbulStats` scoped to caller tenant.

### P1 / related

- `createNotification` requires session; forces session org; same-org target users only for ADMIN.
- DecisionOS gov actions authenticate and scope escalations/event logs.
- `listWebhooksAction` authenticates and strips secrets.
- Sales intel webhook binds tenant from `${PROVIDER}_WEBHOOK_ORGANIZATION_ID`; contact/deal lookups include `organizationId`.
- Central SSRF helper (`assertSafeOutboundUrl` / `safeFetchJson`) wired into WorkflowOS webhooks, notification webhooks, SIEM HTTP/Splunk; SIEM file path jailed.
- Knowledge mining APIs force session `organizationId`; `getCandidate`/`deleteCandidate` compare ownership; knowledge org override only for platform admin.
- Hybrid vector search no longer queries all tenants when org is missing (returns empty).
- Workflow `requireClientAccess` fails closed without client org binding; membership-by-email authorizes first and looks up users in the caller org.
- Outbox process/retry/status require platform admin.
- Escalation-check requires ADMIN and is tenant-scoped.
- SSO public responses return `hasClientSecret`, never `clientSecret`. Auth paths decrypt internally.
- `authorizeAIAction` no longer fail-open on missing identity; orchestrator `generate`/`generateStream` call it when `userId` is present.
- Invite cannot grant a role higher than the caller.
- Office AI project list scoped via workspace org; task detail fails closed without org; task list rejects other `userId`.

---

## Security Invariants

```text
Tenant ADMIN = ADMIN inside user.organizationId
            ≠ platform superuser

Authenticated user
  → session tenant
  → resource.organizationId must match
  → action permission

Webhook
  → secret
  → env organization binding
  → tenant-scoped lookup
  → mutation

Outbound URL
  → parse
  → block private/loopback/link-local/metadata/internal names
  → DNS resolve
  → revalidate redirects

SSO list/get
  → metadata only
  → no clientSecret

AI
  → identity + tenant from request fields
  → not from prompt text
```

---

## Tests Added

| Area | Location |
|---|---|
| Tenant ADMIN cannot use organization `resource.id` as another tenant | `src/lib/authorization/__tests__/tenant-guard.test.ts` |
| Platform admin allow-list fail-closed | `src/lib/authorization/__tests__/platform-admin.test.ts` |
| Authorize org-beta denied for tenant ADMIN | `src/lib/authorization/__tests__/e2e-authorization-pipeline.test.ts` |
| SSRF IP/host/protocol cases | `src/lib/security/__tests__/ssrf.test.ts` |
| Retention requires organizationId | `src/lib/core/policy/retention/__tests__/engine-scope.test.ts` |
| Notifications scoped for VIEWER/OPERATOR/ADMIN | `src/__tests__/unit/platform/platform-overview-actions.test.ts` |
| Tenant ADMIN cannot list/update other-tenant users | `src/__tests__/unit/admin/admin-actions.test.ts` |
| SSO list has no `clientSecret` | `src/__tests__/unit/sso-service.test.ts`, `src/__tests__/actions/sso-admin-actions.test.ts` |
| AI missing identity denied | `src/lib/kernel/__tests__/ai-authorization.test.ts` |
| SIEM file jail | `src/lib/platform/siem/__tests__/delivery.test.ts` |

Existing tenant-guard test that expected ADMIN cross-tenant allow was inverted to deny.

---

## Tests Passed

| Command | Result |
|---|---|
| `npx tsc --noEmit` | Pass (0 errors) |
| `npm run lint` | Pass — 0 errors, 145 warnings (unused vars + `security/detect-object-injection` in `xlsx`; pre-existing class) |
| `npm run build` | Pass — compiled successfully (~2.0 min). Prerender logs `Failed to load DB SSO providers` / `prisma.ssoProvider.findMany()` when DB is unavailable at build time. **Pre-existing:** HEAD already catches this and returns `[]`. This cycle only decrypts secrets after a successful `findMany`; that path is not reached when the query fails. |
| `npm test` (full suite) | Pass — 526 suites / 7,646 tests, 0 failed (5 skipped). Independent re-validation of the working tree, 2026-09-01. |
| Targeted Jest (A–D leftovers) | Pass — 16 suites, 140 tests (public-paths, client-ip, session-cookie, SSRF, SCIM, auth pipeline, rate-limit, health, platform-operator, platform-admin, knowledge-mining, retention holds, spend, skills/evaluate) |
| `npm audit --omit=dev` | See Dependency Status |

New/updated security tests in the first cycle passed as part of the full suite (tenant-guard, platform-admin, SSRF, retention scope, notifications org filter, admin cross-tenant deny, SSO secret stripping, AI identity gate).

---

## Remaining Findings

These are **not** closed as fully hardened:

1. **No live penetration test.** Static + unit evidence only. This remains the GO gate.
2. **Live ops verification** (Redis rate-limit, ClamAV, RDS restore drill, IaC apply) is outside this repository.
3. **Toolchain High CVEs** (`next`/`postcss`/`sharp`/`nanoid`) were not force-upgraded.
4. **DNS rebinding after connect** is mitigated by per-hop redirect revalidation, not TCP peer pinning.
5. **SCIM still supports a single fallback key** (`SCIM_API_KEY` + `SCIM_DEFAULT_ORG_ID`) for one-org deployments. Prefer `SCIM_ORG_KEYS` in multi-tenant.
6. **Build-time SSO loader noise** is fail-open to `[]` when Postgres is absent during prerender. Not a new regression vs HEAD. Do not treat it as a silent production SSO outage — runtime with a live DB still loads providers.

Closed in the full follow-up pass (2026-08-31):

- Middleware matcher is **default-deny**; public routes are an explicit allowlist (`src/lib/auth/public-paths.ts`).
- Institutional knowledge (`organizationId: null`) is not listed or mutated by tenant callers.
- SSRF IPv6 ULA + IPv4-mapped addresses.
- SCIM per-org keys via `SCIM_ORG_KEYS`; ADMIN mint still denied unless env flag.
- JWT lifetime default 12h; role/org refreshed hourly from DB; SAML/MFA/middleware salt = cookie name.
- Health probes no longer disclose `AUTH_SECRET` presence/length.
- `X-Forwarded-For` trusted only when `TRUST_PROXY=true`.
- POW challenge is public + rate-limited.
- ABAC engine errors fail-closed when `FF_ABAC_ENFORCE=true`.
- CRM webhook requires `HUBSPOT_WEBHOOK_ORGANIZATION_ID` (optional portal pin).
- `trustHost` is production-gated (`AUTH_TRUST_HOST=true` behind a proxy).
- `/monitoring` platform panels and `/operator` require `isPlatformAdmin()`.
- Platform operator Server Actions (`getEnterpriseHealthAction`, outbox process/retry) require `assertPlatformAdmin()`, not tenant `isAdmin()`.
- SIEM export binds tenant ADMIN to `user.organizationId` (no `platformOrganizationId` fallback).

Closed in the follow-up pass (2026-08-31):

- Platform-global operator routes locked to `assertPlatformAdmin()`: enterprise-health, monitoring/health, skills/evaluate, eval-gate GET/PUT, retention catalog + history, evidence health, event registry.
- Tenant-scoped: `/api/metrics`, cache/warm, AI spend/governance (org filter), retention policies/holds (`user.organizationId`), integration health LCOS counts.
- SCIM ADMIN mint denied unless `SCIM_ALLOW_ADMIN_ROLE=true`.

---

## New Findings Discovered

1. **`enforce({ type: "organization" })` without `tenantId` previously defaulted to the caller’s org and always passed.** Closing the ADMIN bypass alone was insufficient; resource.id is now the tenant for `organization`/`settings`.
2. **`getSunbulStats()` listed every user and every Sunbul client globally** for any tenant ADMIN. Scoped in this cycle.
3. **`buildProviderConfig` used the encrypted DB `clientSecret` for NextAuth** until decrypt was applied at the auth load site.

---

## Dependency Status

`npm audit --omit=dev` (2026-08-31): **8 vulnerabilities (3 moderate, 5 high), 0 critical**.

High: `brace-expansion` (DoS), `nanoid` <3.3.18, `postcss` via `next`, `sharp` via `next`. Moderate: `uuid` via `bull`/`exceljs`.

These are toolchain/transitive. No application-exploitable critical CVE was shown. `npm audit fix --force` was **not** applied (would install breaking `bull@1.1.3`).

---

## SSRF Status

Central helper implemented and wired into WorkflowOS webhook delivery, notification webhook channel, and SIEM HTTP/Splunk. Register-webhook Server Action validates URL before persist. Regression tests cover localhost, loopback, RFC1918, link-local/metadata, internal suffixes, and non-http schemes.

---

## Tenant Isolation Status

`checkTenantAccess` no longer grants tenant ADMIN cross-tenant access. Notification, retention, admin user/org, knowledge mining list/detail, sales intel webhook, and Workflow client binding were re-scoped. Platform-global operator APIs require `isPlatformAdmin()`. Tenant ADMIN retains org-scoped metrics, cache warm, AI spend/governance, and retention policies/holds.

---

## Authorization Status

```text
Tenant ADMIN  → own organization only
Platform admin → env allow-list only
Client-supplied organizationId → compared to session, not trusted as authority
Server Actions identified in the audit as unauthenticated → now authenticate
```

---

## Final Security Verdict

```text
SECURITY STATUS: CONDITIONAL GO
```

**Why not GO:** Application P0/P1 leftovers from this audit cycle are closed in code, including middleware default-deny. Still blocking for GO: (1) no external pen-test, (2) live ops verification (Redis/ClamAV/restore).

**Why not NO-GO:** The four confirmed P0s and the residual operator-API / SCIM / middleware allowlist cluster have code-level fixes and negative tests.

GO would require: a passing external pen-test and verified production ops gates.

### Remaining plan gates (cannot close in this repository)

| Gate | Owner | Status |
|---|---|---|
| E — Live ops | AWS/ops | Open: `RATE_LIMITER=redis`, `SCANNER_PROVIDER=clamav`, RDS restore drill |
| F — External pen-test | Vendor | Open: blocking for SECURITY GO (ADR-109) |
| G — Commercial GO | Product/legal | Open: do not market production-hardened until E + F pass |
