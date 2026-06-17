# Runtime Reality — AQLIYA Deep Reality Audit

**Audit date:** 2026-06-17  
**Method:** Build attempt, smoke scripts, static route analysis  
**Full browser/runtime navigation:** NOT EXECUTED (build blocked; no dev server started)

---

## Runtime Validation Status

| Validation | Executed | Result |
|------------|----------|--------|
| `npm run build` | YES | **FAIL** — TS error blocks production server |
| `npm run start` / dev server | NO | Blocked by build failure |
| Browser workflow navigation | NO | INSUFFICIENT EVIDENCE |
| Cypress E2E | NO | Requires build + server |
| `npm run local-ai:smoke` | YES | **PASS** (Ollama) |
| `npm run demo:smoke` | NO | Not run |
| `npm run smoke:local` | NO | Requires running server |
| DB-dependent flows | NO | Postgres not confirmed running |

---

## Inferred Runtime State (from smoke + code)

| Workflow | Expected Runtime | Evidence | Status |
|----------|-----------------|----------|--------|
| Login/auth | Works if DB seeded | auth-config + custom-login exist | UNVERIFIED live |
| AuditOS engagement flow | Full workflow | 27 routes, seed-audit, tests pass | PARTIALLY VERIFIED |
| LocalContent workbook | Scoring + import | Workbook tests pass | PARTIALLY VERIFIED |
| Local AI hybrid | Ollama inference | Smoke PASS | **VERIFIED** |
| Platform audit log write | Requires DB | Smoke showed Prisma error | **FAIL without DB** |
| Office AI tasks | Deterministic output | Service tests pass | PARTIALLY VERIFIED |
| SCIM provisioning | API key auth | Unit tests exist | PARTIALLY VERIFIED |
| Public /auditos demo | Mock read-only | Demo smoke script exists | UNVERIFIED |

---

## Known Runtime Failures (Evidence-Based)

1. **Production build fails** — app cannot start in production mode
2. **platformAuditLog.create() fails** without DB — observed in local-ai smoke stderr
3. **Integration tests fail** without test Postgres on 5433
4. **Stale .next/types** reference missing `sales/contacts/page` — may cause dev instability

---

## Broken Flows (Static Analysis)

| Flow | Issue | Severity |
|------|-------|----------|
| Content Studio standalone | Prisma models missing from schema | High — runtime DB errors |
| Platform audit event service | `platformAuditEvent` model missing | High — write failures |
| MFA enforcement | JWT fields not populated | Medium — gate ineffective |
| DB-configured SSO login | Providers not registered in NextAuth | Medium — feature appears broken |
| Sales contacts page | Possible missing page file | Medium — route 404 risk |

---

## Runtime Validation Plan (Post-Fix)

After build restoration:
1. `docker compose up -d db && npx prisma db push && npx prisma db seed`
2. `npm run build && npm run start`
3. `npm run smoke:local`
4. `npm run demo:smoke`
5. Manual: login → audit engagement → TB upload → LC workbook → decision create
6. `npm run cy:local` for E2E

---

## Verdict

**Runtime maturity: L3** — Core logic testable in isolation; full stack runtime **UNVERIFIED** due to build block and no server session.

**Classification:** INSUFFICIENT EVIDENCE for production runtime certification.
