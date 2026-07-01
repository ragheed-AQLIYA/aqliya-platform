# AQLIYA — Skeptical Evidence-Based Audit

**Date:** 2026-06-03
**Auditor role:** Principal Architect / Staff Eng / Security / DevOps / Technical Auditor
**Method:** Code-first verification. No completion report, commit message, or doc claim accepted without code proof.
**Validation note:** Light validation only (file/grep/route inspection, schema reads). Full `tsc --noEmit`, `npm run build`, and `npm test` were **NOT run** in this audit per low-load protocol — readiness claims that depend on a green build are flagged where relevant.

---

## Executive Summary

The recently claimed work is, on the whole, **substantially real** — this is not a vaporware repo. OpenAPI, notifications, AI streaming, AI observability, the storage abstraction, and the deployment pipeline are all backed by genuine, non-trivial implementations wired to real dependencies (AWS SDK, OpenAI/Anthropic streaming APIs, Prisma models, Terraform/ECS, GitHub Actions). The documentation is unusually self-aware and mostly honest about its own limits.

The single most serious finding is a **broken TOTP implementation**: the "MFA improvements" use `crypto.createHash("sha1")` (a plain hash) instead of `createHmac` — this is **not RFC-6238 compliant and will not interoperate with Google Authenticator / Authy / 1Password**. MFA "works" only because the same broken algorithm is used for both generation and verification internally.

Secondary concerns are **hygiene/tech-debt**: 46 duplicated `"... (1).ts"` files (Google-Drive sync artifacts), stale committed error dumps (`.salesos-ts-errors.txt`), SalesOS `vnext` modules that are throwing placeholders, and minor documentation drift (undocumented `/api/auth/sessions` routes).

**Overall grade: 78 / 100.**

---

## Verified Completions

| Claim | Verdict | Evidence |
|---|---|---|
| L0-08 OpenAPI specification | **VERIFIED** | `docs/api/openapi.yaml` (3.0.3), served via `src/app/api/openapi.json/route.ts`; 26 documented paths map 1:1 to real `route.ts` files |
| L0-15 Notification preferences UI | **VERIFIED** | `PlatformNotification` + `UserNotificationPreference` models; 4 API routes; `src/actions/platform/notifications.ts`; `notification-bell.tsx`, `settings/notifications` UI |
| IC-03 AI streaming | **VERIFIED** | Real SSE endpoint `api/ai/stream`; `orchestrator.generateStream` with fallback; OpenAI + Anthropic `stream()` calling vendor streaming APIs; auth + feature flag + audit log |
| IC-07 AI observability dashboard | **VERIFIED** | `src/lib/ai/observability.ts` aggregates `platformAuditLog`; latency p50/p95/p99, spend, per-provider, per-product; ADMIN-gated `api/ai/observability` |
| L0-12 S3 storage provider | **VERIFIED (with caveat)** | `s3-storage-provider.ts` (real `@aws-sdk/client-s3`, presigned URLs, healthCheck); local provider; `migrate-local-storage-to-s3.ts`; `STORAGE_PROVIDER` flag |
| L0-13 CI deploy + promotion | **VERIFIED** | `ci.yml` (tsc, lint, test, build, prisma, npm audit); `deploy.yml` (Terraform/ECR/ECS); `promote.yml` (staging→prod + rollback + environment gates); post-deploy smoke tests |
| Monitoring dashboards | **VERIFIED** | `api/monitoring/health`, `queue/jobs`, `queue/retry`; `/monitoring` page (real aggregate counts) |

## Partial Completions

| Claim | Verdict | Gap |
|---|---|---|
| "MFA improvements" | **PARTIALLY VERIFIED** | Schema (`mfaSecret`, `mfaBackupCodes`), verify route, encrypted secret, single-use SHA-256 backup codes all real — **but the TOTP algorithm is non-standard/broken** (see Security) |
| "L0-12 S3 **default** storage provider" | **PARTIALLY / CONTRADICTED** | Default is `"local"`, not S3: `(process.env.STORAGE_PROVIDER) ?? "local"`. S3 is opt-in, not default |
| ROUTE_STRATEGY "synchronized" / drift fixed | **PARTIALLY VERIFIED** | Mostly accurate and self-aware, but `/api/auth/sessions` and `/api/auth/sessions/[jti]` are **undocumented** in ROUTE_STRATEGY despite the 2026-06-03 "drift fix" note; API count stated 27 vs **30 actual** |
| AI observability metrics fidelity | **PARTIALLY VERIFIED** | Real aggregation, but `averageConfidence` silently defaults to `0.85` when metadata absent — a fabricated-looking metric; accuracy depends on upstream metadata population |

## Unverified / Stale Claims

| Item | Verdict | Evidence |
|---|---|---|
| SalesOS "0 TS errors, Phantom Imports Gate passed" | **NOT VERIFIED (stale artifact present)** | `.salesos-ts-errors.txt` (670 lines) is **stale** — the `Product` enum now includes `SALES_OS` (`audit-logger.ts:24`), so the dumped errors are historical. Current green build not independently confirmed (tsc/build not run) |
| SalesOS L4 "Usable v0.1" | **CONTRADICTED (generous)** | `src/lib/sales/vnext/*` is full of `throw new Error("TODO: SalesOS vnext placeholder ...")`; intelligence market/proof/graph tabs are placeholders. Agent-G's own note pegs it L3. CLAUDE.md classifies SalesOS as **L3 prototype** |
| Local AI runtime | **HONESTLY NOT IMPLEMENTED** | `local-provider.ts` throws "Local AI is not implemented — Phase 4 planned" — matches docs, no false claim |

---

## Scores by Area

| Area | Score | Notes |
|---|---|---|
| A. OpenAPI | **9/10** | Accurate, served at runtime; 3 undocumented auth routes; documents a non-existent `/api/auth/session` |
| B. Notifications | **9/10** | Full stack; ownership check on mark-read (`recipientId !== user.id`); preferences persisted & scoped by `userId` |
| C. AI Streaming | **9/10** | Genuine vendor streaming, fallback, auth, audit, flag |
| D. AI Observability | **8/10** | Real percentile/spend/provider aggregation; confidence default & metadata-dependence are soft spots |
| E. Storage Layer | **9/10** | S3+local, signed URLs, health checks, migration, flag; "default" is local not S3 |
| F. Deployment Pipeline | **8/10** | Rigorous CI + Terraform/ECS deploy + promote + rollback + smoke; depends on AWS secrets/infra existing |
| G. Security | **6/10** | Sessions/revocation/RBAC strong; **TOTP is broken (createHash not HMAC)** |
| H. Route Strategy Accuracy | **7/10** | Largely accurate & self-aware; residual drift (auth/sessions undocumented; 27 vs 30 API count) |

---

## Architecture Assessment

**Strengths.** Clean provider/orchestrator abstraction for AI (`provider-router`, `orchestrator`, typed `AIProviderId`), a single storage interface with swappable providers, a shared `PlatformAuditLog` that observability reads from, and consistent `requireUserContext(role)` gating across API routes. Server-only boundaries are marked (`import "server-only"`).

**Maintainability / tech debt (significant).**
- **46 duplicated `"... (1).ts/.tsx"` files** across `src/lib/ai`, `src/lib/sales`, `src/actions`, `src/components` — Google-Drive sync collisions (a `.tmp.driveupload/` dir exists). These shadow real modules and are a correctness landmine.
- **Stale committed dumps in repo root**: `.salesos-ts-errors.txt` (118 KB), `.salesos-vnext-errors.txt`, `.salesos-missing-modules.txt`, `tmp-head-status.md`. Should not be in version control.
- **SalesOS `vnext` = throwing stubs** (`commercial-review-runtime.ts`, `deal-review.ts`, `proposal-workflow.ts`, `commercial-evidence.ts`) marked `SALESOS_VNEXT_PLACEHOLDER`.
- **Two parallel storage stacks** (`src/lib/audit/storage` and `src/lib/platform/storage`) — partial duplication of intent.

**Scalability / operational readiness.** Streaming uses `force-dynamic` + `maxDuration 120`, observability caps at `take: 10000` audit rows (will degrade/clip at scale — needs windowed aggregation or a rollup table). Deploy is ECS/Terraform-based with health + smoke gates, which is production-grade *if* the AWS backend and secrets are provisioned (not verifiable from repo).

Scores — maintainability 6/10, modularity 8/10, technical debt 5/10, duplicated logic 4/10, hidden risks 6/10, scalability 6/10, operational readiness 7/10.

---

## Security Assessment

**Critical — broken TOTP (MFA not interoperable).** `src/lib/auth/mfa.ts:90`:
```ts
const hmac = createHash("sha1").update(key).update(counterBuf).digest();
```
RFC-6238 requires **HMAC-SHA1** (`createHmac("sha1", key)`), not a plain SHA-1 hash of `key ‖ counter`. Result: codes from any standard authenticator app will never match. Internal generate/verify agree only because both use the same wrong primitive. **"MFA improvements" is CONTRADICTED BY CODE** as a usable authenticator-app MFA. Fix: switch to `createHmac`, or adopt `otplib`/`speakeasy`.

**Strong elsewhere.**
- Sessions: `UserSession` model + `RevokedToken`; `revokeSession`, `revokeAllUserSessions` (admin), device fingerprint, `jti` indexing. Real session lifecycle + revocation.
- Backup codes: SHA-256 hashed, **single-use** (spliced on consumption). Good.
- MFA secret encrypted at rest (`decrypt(...)` via `lib/auth/encryption`).
- RBAC: consistent `requireUserContext("ADMIN"|"VIEWER")` on sensitive routes; observability ADMIN-gated; notification ownership enforced.
- `npm audit --audit-level=high` in CI.

**Gaps.** No explicit device-trust/"remember this device" table beyond per-session fingerprint. MFA verify route lacks visible rate-limiting/lockout on repeated attempts.

---

## Operational Readiness

CI is comprehensive (prisma generate → tsc → action-guard audit → demo smoke → lint → db push → test → AI eval → build → npm audit). Deploy pipeline covers build/push (ECR), infra (Terraform), service update (ECS), post-deploy health + smoke, plus a promote workflow with rollback and protected environments. Scheduled DB backup workflow exists. This is L5-grade plumbing. The unverifiable dependency is the live AWS/secret/infra backing (cannot be proven from the repo alone).

---

## Production Readiness Levels

| Component | Level | Why |
|---|---|---|
| **Platform Foundation** | **L5 (pilot-ready)** | Storage, notifications, monitoring, OpenAPI, CI/CD all real and wired |
| **Intelligence Core** | **L4–L5** | Streaming + observability + governance real; Local AI explicitly unimplemented holds it below full L5 |
| **AuditOS** | **L5 (pilot-ready)** | Consistent with docs; governed routes, exports, evidence download present |
| **DecisionOS** | **L4 (usable v0.1)** | Workspace + evidence download routes real; matches docs |
| **LocalContentOS** | **L5 with conditions** | Project/evidence/report routes real; matches docs |
| **SalesOS** | **L3 (prototype)** | `vnext` throwing stubs + placeholder intelligence tabs; ROUTE_STRATEGY's L4 label is generous vs CLAUDE.md/Agent-G's own L3 |

---

## Top Risks (rank ordered)

| # | Risk | Sev | Likelihood | Impact | Fix |
|---|---|---|---|---|---|
| 1 | TOTP uses `createHash` not HMAC → MFA unusable with real authenticator apps | Critical | Certain | Users locked out / false sense of MFA security | Replace with `createHmac`/`otplib`; add tests vs RFC vectors |
| 2 | 46 duplicate `"(1)"` files shadow real modules | High | High | Wrong module imported, silent regressions | Delete dupes; add CI guard; stop Drive-syncing the repo |
| 3 | MFA verify lacks rate-limiting/lockout | High | Medium | Brute-force of 6-digit codes | Add attempt throttling + lockout |
| 4 | Observability `take: 10000` cap | Medium | High at scale | Truncated/incorrect metrics | Windowed aggregation / rollup table |
| 5 | "S3 default" claim false (default local) | Medium | Certain | Prod may run on local disk unexpectedly | Fix claim or default to s3 in prod env |
| 6 | SalesOS `vnext` throwing stubs reachable if wired | Medium | Medium | Runtime 500s | Gate behind flags; finish or remove |
| 7 | Stale error dumps committed in root | Low | Certain | Confusion, leaks paths | `.gitignore` + remove |
| 8 | Route doc drift (auth/sessions undocumented) | Low | Certain | OpenAPI/RBAC review blind spots | Document + add route-count CI check |
| 9 | `averageConfidence` defaults 0.85 | Low | Certain | Misleading dashboard metric | Show null/"n/a" when absent |
| 10 | Two parallel storage stacks | Low | Medium | Divergent behavior | Consolidate |
| 11 | Build greenness unverified this audit | Medium | Unknown | Claimed "0 TS errors" not reproduced | Run tsc/build in clean env |
| 12 | OpenAPI documents non-existent `/api/auth/session` | Low | Certain | Client confusion | Remove or implement |
| 13 | Streaming `maxDuration 120` on serverless | Low | Medium | Truncated long generations | Confirm platform limits |
| 14 | No visible audit log retention/rotation | Low | Medium | Table growth | Add retention job |
| 15 | Secret-dependent deploy unverifiable | Medium | Unknown | Deploy fails without infra | Document required secrets/infra |
| 16 | SalesOS L4 label vs L3 reality | Low | Certain | Overstated maturity | Align labels to L3 |
| 17 | Device-trust not modeled | Low | Low | Re-MFA friction only | Optional trusted-device table |
| 18 | `prisma db push` in CI (not migrate) | Low | Medium | Schema drift masking | Use `migrate deploy` in CI |
| 19 | Backup codes count fixed (8) no regen UX verified | Low | Low | Lockout when exhausted | Verify regeneration flow |
| 20 | `.env` committed alongside examples | Medium | Unknown | Possible secret exposure | Confirm `.env` is gitignored/empty |

---

## Recommended Next 10 Tasks (prioritized)

1. **Fix TOTP** → `createHmac("sha1", base32Decode(secret))`; add RFC-6238 test vectors; verify against a real authenticator app.
2. **Purge the 46 `"(1)"` duplicate files**; stop syncing the working tree through Google Drive; add a CI check that fails on `"(1)"`-suffixed sources.
3. **Add MFA rate-limiting / lockout** on `/api/auth/mfa/verify`.
4. **Remove stale root artifacts** (`.salesos-*.txt`, `tmp-head-status.md`) and confirm `.env` is not tracked.
5. **Re-run `tsc --noEmit` + `npm run build` in a clean env** and record the result to substantiate "0 TS errors".
6. **Make observability scale-safe** (windowed/rollup aggregation; drop the 10k cap) and stop defaulting confidence to 0.85.
7. **Reconcile route docs**: add `/api/auth/sessions*`, fix API count (27→30), remove phantom `/api/auth/session` from OpenAPI; add a route-count CI assertion.
8. **Relabel SalesOS to L3** in ROUTE_STRATEGY to match CLAUDE.md / Agent-G; gate `vnext` stubs behind a disabled flag.
9. **Clarify storage default** (either default to s3 in production or correct the "S3 default" claim).
10. **Switch CI to `prisma migrate deploy`** and document required AWS secrets/infra for the deploy pipeline.

---

## Final Verdict

- **Can the platform foundation honestly be called L5 (pilot-ready)?** → **Yes**, with the MFA fix as a gating condition. The foundational systems (storage, notifications, observability, streaming, CI/CD) are real.
- **L4 overall?** → **Yes, comfortably.** The bulk of claimed work is genuinely implemented.
- **L6 (production-ready)?** → **No.** Blocked by the broken TOTP, significant file-duplication tech debt, unverified clean build, and infra/secret dependencies that cannot be proven from the repo.

**The reported progress is largely real, not fabricated** — but two specific claims are overstated: "MFA improvements" (the TOTP is broken) and "S3 **default** storage" (default is local). SalesOS L4 is generous relative to its own code.
