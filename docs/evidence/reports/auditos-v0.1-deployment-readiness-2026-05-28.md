# AuditOS v0.1 — Deployment Readiness Report (Track C)

**Date:** 2026-05-28  
**Track:** C — Deployment & Environment Readiness  
**Prior status:** CONDITIONAL GO (product/workflow — Track B Go/No-Go)  
**Trust principle:** AI assists. Humans decide. Evidence governs.

---

## 1. Deployment Readiness Summary

AuditOS v0.1 is ready for **controlled single-instance deployment rehearsal** on a VPS, private server, or internal VM with PostgreSQL and writable local storage.

Track C delivered:

- Explicit environment inventory
- Realistic deployment guide (no K8s/HA fantasy)
- Honest security posture documentation
- Internal rehearsal script (11-step walkthrough)
- Lightweight runtime improvements (env validation, health checks, startup warnings)
- P2 polish triage without scope creep

**Classification:**

> **Controlled Single-Instance Deployment Ready**

**Not classified as:**

- Enterprise-scale ready
- HA ready
- Certified production ready

---

## 2. Environment Assumptions

| Assumption | Detail |
| ---------- | ------ |
| Node.js | 20.x |
| Database | PostgreSQL 15+ single instance |
| Storage | `STORAGE_PROVIDER=local` with writable `LOCAL_STORAGE_DIR` |
| Process | One `next start` instance |
| Auth secret | `AUTH_SECRET` (32+ chars) — not legacy `NEXTAUTH_SECRET` alone |
| Download tokens | `DOWNLOAD_TOKEN_SECRET` recommended for evidence token downloads |
| Build | `npm run build` on deploy host or CI artifact |
| Schema | `npx prisma db push` or `migrate deploy` — no Track C schema changes |

Full inventory: `docs/deployment/auditos-v0.1-environment-inventory.md`

---

## 3. Operational Assumptions

| Area | v0.1 expectation |
| ---- | ---------------- |
| Backups | Manual `npm run db:backup` + storage directory archive — operator scheduled |
| Monitoring | `/api/health` liveness + optional Sentry — no Prometheus/Grafana stack |
| Logs | Structured console via `src/lib/logger.ts`; startup env warnings in Node runtime |
| Uploads | Local filesystem under configurable base dir |
| Exports | In-memory generation streamed to client |
| Scaling | Single instance — no horizontal scale guidance |
| SSL | Terminated at reverse proxy |
| Docker | Optional; Dockerfile needs `output: 'standalone'` before reliable use |

Deployment guide: `docs/deployment/auditos-v0.1-deployment-guide.md`

---

## 4. Security Posture Summary

**Implemented:** JWT auth, middleware route protection, tenant guards, RBAC on server actions, audit trail, path traversal protection on storage, signed download tokens, security headers, assistive-only AI boundary.

**Not implemented:** SSO/LDAP, MFA, integrated virus scanning, SOC2/ISO certification, independent pen test, HA/security ops stack.

**Explicit:** Controlled deployment only — not enterprise security certified.

Full document: `docs/deployment/auditos-v0.1-security-posture.md`

---

## 5. Rehearsal Readiness

Internal rehearsal guide documents an 11-step walkthrough from engagement through export and audit trail verification, using seeded `eng-gulf-2025` and `admin@aqliya.com`.

Includes:

- Expected friction points (P2, non-blocking)
- Blocker criteria (auth bypass, tenant leak, governance bypass, data loss)
- Output template for post-rehearsal notes

Guide: `docs/deployment/auditos-v0.1-internal-rehearsal.md`

---

## 6. Remaining Limitations

| Limitation | Severity | Deployment impact |
| ---------- | -------- | ------------------- |
| Docker standalone output not configured | **Resolved (Track C.1)** | `output: 'standalone'` enabled |
| `docker-compose.yml` missing `AUTH_SECRET` | **Resolved (Track C.1)** | Compose uses `AUTH_SECRET` + upload volume |
| 4 workflow tabs without loading/error boundaries | P2 | Non-blocking for rehearsal |
| Dashboard N+1 readiness fetch | P2 | Acceptable for single-instance v0.1 |
| Evidence reject retains files on disk | P2 | Disclose to operators |
| No integrated virus scanning | P2 | Operator policy for trusted uploads |
| No SSO | Future | VPN/internal network for rehearsal |
| Not L6 production-hardened | Expected | Do not claim certification |

---

## 7. Deployment Classification

| Level | Assessment |
| ----- | ---------- |
| **Controlled Single-Instance Deployment Ready** | **Yes** |
| Multi-instance / HA | No |
| Enterprise cloud scale | No |
| Certified production audit deployment | No |
| Public internet without operator hardening | Not recommended |

---

## 8. P2 Polish Triage (Agent 7)

| Item | Classification | Rationale |
| ---- | -------------- | --------- |
| Missing loading/error on trial-balance, validation, recommendations, publication tabs | **Acceptable v0.1** | 8/12 core tabs covered in Wave F; remaining are lower-traffic or sub-flows |
| Dashboard N+1 readiness per engagement | **Acceptable v0.1** | Fine for seeded/small engagement counts; batch later if scale grows |
| Evidence physical deletion absent on reject | **Acceptable v0.1** | Disclosed; state change is governed; deletion is future hardening |
| Pre-approval draft exports | **Acceptable v0.1** | Policy accepted for internal review; copy labels draft status |
| EN/AR inconsistencies in deep admin UI | **Future** | Not blocking controlled rehearsal; Arabic-first on primary gate flows |
| Docker/env drift (`NEXTAUTH_SECRET` vs `AUTH_SECRET`) | **Must-fix before Docker deploy** | **Resolved in Track C.1** |
| `output: 'standalone'` for Dockerfile | **Must-fix before Docker deploy** | **Resolved in Track C.1** |
| Integrated virus scanning | **Future** | Stub exists; not v0.1 blocker for controlled trusted uploads |
| SSO/LDAP | **Future** | Required before broad external production, not v0.1 rehearsal |
| SOC2 / pen test | **Never (v0.1 scope)** | Out of scope; do not claim |
| Autonomous audit decisions | **Never** | Violates trust principle |

**No P2 items were auto-fixed in Track C** except deployment/runtime clarity improvements.

---

## 9. Track C Code Changes (Agents 3 & 4)

| Change | Purpose |
| ------ | ------- |
| `scripts/validate-env.mjs` | Align checks with `AUTH_SECRET`; add deployment recommendations |
| `.env.example` | Document actual runtime variables |
| `src/lib/platform/runtime-env-check.ts` | Shared env and storage writability checks |
| `src/instrumentation.ts` | Startup warnings for missing critical env |
| `src/app/api/health/route.ts` | DB + storage checks; degraded status on failure |

No schema, auth/middleware, or architecture changes.

---

## 10. Next Recommended Track

> **Execute the internal rehearsal** per `docs/deployment/auditos-v0.1-internal-rehearsal.md` on the deployment target environment, capture friction log, then decide on first external pilot scope.

Optional follow-ups (post-rehearsal):

1. ~~Enable `output: 'standalone'` if Docker deployment is chosen~~ — done in Track C.1
2. Add loading/error to remaining 4 workflow tabs if operators report confusion
3. Batch dashboard readiness fetch if engagement count > ~20

---

## Track C.1 Addendum (2026-05-28)

Config alignment for controlled single-instance Docker/bare-metal parity:

- Enabled `output: 'standalone'` in `next.config.mjs`
- Aligned `docker-compose.yml` with `AUTH_SECRET`, `DOWNLOAD_TOKEN_SECRET`, `LOCAL_STORAGE_DIR`, upload volume
- Simplified `Dockerfile` (builder + runner) with build-time env placeholders for postinstall
- Clarified `DOWNLOAD_TOKEN_SECRET` as optional at startup, required for token-based downloads only

Docker build/runtime validated in Track C.2. Internal rehearsal executed in Track C.3 — see `docs/reports/auditos-v0.1-internal-rehearsal-2026-05-28.md`.

---

## Track C.2 Validation (2026-05-28)

Docker controlled single-instance path **validated locally**:

| Step | Result |
| ---- | ------ |
| `docker compose build` | **Pass** (after Dockerfile `npm ci --ignore-scripts` + `.dockerignore`) |
| `docker compose up -d db` | **Pass** — Postgres healthy |
| Schema + seed via compose network | **Pass** — required `@db:5432` (host `localhost:5432` was separate Postgres) |
| `docker compose up -d app` | **Pass** — Next.js ready on :3000 |
| `GET /api/health` | **Pass** — `status: ok`, DB + storage writable |
| Login smoke (`admin@aqliya.com`) | **Pass** — after correct DB seed |
| `/audit/engagements/eng-gulf-2025` | **Pass** — engagement overview loads |
| `/audit/.../exports` | **Pass** — draft export UI + Arabic gates |

**Deployment rehearsal classification:** **PASS** for controlled Docker single-instance (with documented host/compose DB caveat).

Fixes applied during validation (not secrets):

- `Dockerfile` — `npm ci --ignore-scripts`
- `.dockerignore` — reduce build context
- Deployment docs — compose-network seed procedure

---

## Track C.4 Validation (2026-05-28)

Statements Docker runtime blocker fixed and rechecked:

| Step | Result |
| ---- | ------ |
| Root cause | Client import of `exportEngagementAction` bundled `pdfkit` into statements route |
| Fix | API fetch export + `server-only` on PDF/extraction modules |
| `docker compose build app` | **Pass** |
| `/statements` on `eng-gulf-2025` | **Pass** — financial statements render |
| C.3 P1 blocker | **Resolved** |

**Post-redeploy operator note:** hard refresh after Docker app rebuild to avoid stale Server Action IDs.

See `docs/reports/auditos-v0.1-internal-rehearsal-2026-05-28.md` (Track C.4 addendum).

---

## Track C.5 Final Rehearsal (2026-05-28)

Full 11-step internal rehearsal after C.4 fix:

| Result | Detail |
| ------ | ------ |
| Steps | **11/11 PASS** (with hard refresh) |
| `/api/health` | **Pass** before and after |
| First blocker | **None** |
| Verdict | **Controlled internal rehearsal PASS** |

Report: `docs/reports/auditos-v0.1-internal-rehearsal-c5-2026-05-28.md`

---

## References

| Document | Path |
| -------- | ---- |
| Environment inventory | `docs/deployment/auditos-v0.1-environment-inventory.md` |
| Deployment guide | `docs/deployment/auditos-v0.1-deployment-guide.md` |
| Security posture | `docs/deployment/auditos-v0.1-security-posture.md` |
| Internal rehearsal | `docs/deployment/auditos-v0.1-internal-rehearsal.md` |
| Product Go/No-Go | `docs/reports/auditos-v0.1-go-no-go-review-2026-05-28.md` |

---

**Report status:** Final  
**Architecture drift:** None  
**Fake enterprise claims:** None introduced
