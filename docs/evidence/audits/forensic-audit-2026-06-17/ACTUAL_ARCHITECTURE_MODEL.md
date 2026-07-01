# ACTUAL ARCHITECTURE MODEL — AQLIYA Forensic Audit

**Generated:** 2026-06-17  
**Method:** Filesystem enumeration, file reads, grep — code-proven only  
**Evidence cross-ref:** `docs/audits/reality-audit-2026-06-17/architecture-reality.md`, Phase 3 subagent report

---

## Runtime Stack (VERIFIED)

| Layer | Technology | Evidence |
|-------|------------|----------|
| Framework | Next.js **16.2.4** | `package.json` dependencies |
| UI | React 19.2.4, Tailwind 4, shadcn | `package.json` |
| Auth | NextAuth v5 beta.31, JWT | `package.json`, middleware |
| ORM | Prisma 7.8.0 | `package.json`, `prisma/schema.prisma` |
| DB | PostgreSQL | `schema.prisma` datasource |
| Cache/Queue | Redis (ioredis), Bull | `package.json` |
| Storage | AWS S3 SDK | `package.json` |
| i18n | next-intl 4.12 | `next.config.mjs` |
| Observability | Sentry | `package.json`, `next.config.mjs` |
| Output | Next standalone | `next.config.mjs` L1 |

---

## Structural Pattern (VERIFIED)

**Modular monolith** — single deployable, product boundaries by route prefix + `src/lib/{product}/`.

```
src/app/          → 457 files, 234 page.tsx, 46 route.ts
src/actions/      → 69 server action files (inventory-report.md)
src/components/   → 323 files (inventory-report.md)
src/lib/          → 1,051 files
prisma/           → 214 models (grep ^model schema.prisma)
```

---

## Actual Product Systems

| System | App routes | Lib code | Status |
|--------|-----------|----------|--------|
| **AuditOS** | `src/app/audit/` — 72 files, ~27 pages | `src/lib/audit/` — 139 files | VERIFIED real workflow |
| **LocalContentOS** | `src/app/local-content/` — 42 files | `src/lib/local-content/` — 87 files | VERIFIED workbook/scoring/ERP |
| **SalesOS** | `src/app/sales/` — 76 files | `src/lib/sales/` — **358 files (34%)** | VERIFIED; TS debt |
| **DecisionOS** | `(dashboard)/decisions/` + `decision/` — dual tree | `src/lib/decision/` — 36 files | VERIFIED dual routes |
| **WorkflowOS** | `src/app/workflowos/` — 11 files | `src/lib/workflowos/` — 14 files | VERIFIED |
| **Sunbul legacy** | `src/app/sunbul/` — 3 files | Redirect in `next.config.mjs` | VERIFIED alias |
| **LocalContactOS** | `src/app/contacts/` — 6 files | `src/lib/localcontactos/` — 2 files | VERIFIED thin lib |
| **Office AI** | `office-ai/`, `(dashboard)/assistant/` | `src/lib/office-ai/` — 7 files | VERIFIED |
| **Content Studio** | `src/app/content-studio/` — 12 files | NOT VERIFIED lib path | Partial |
| **Risk submodule** | `src/app/risk/` — 7 files | `src/lib/risk/` — **0 files** | Routes without lib |
| **Public demo** | `src/app/auditos/` — 11 files | Mock-backed | VERIFIED demo rules in docs |
| **Marketing** | `(marketing)/`, `en/` — 63 files | `src/lib/marketing/` — 7 files | VERIFIED public |

---

## API Surface (VERIFIED)

- **46** `route.ts` handlers under `src/app/` (44 under `api/`, 2 product export routes)
- Namespaces: `ai/`, `auth/`, `audit/`, `decisions/`, `health/`, `local-content/`, `monitoring/`, `office-ai/`, `platform/`, `scim/v2/`, `skills/`
- **Risk route opened:** `src/app/api/test-token/route.ts` — returns JWT + cookies (no auth gate)

---

## Platform Core (VERIFIED)

| Service | Path | Notes |
|---------|------|-------|
| Secrets vault | `src/lib/platform/secrets/vault.ts` | TS error: missing `SecretEntry` export (build-audit) |
| Audit events | `src/lib/platform/audit-event-service.ts` | TS error: `platformAuditEvent` missing from Prisma client |
| Redis config | `src/lib/platform/redis-config.ts` | Present |
| Queue runtime | `src/lib/platform/operations/queue-runtime.ts` | Present |
| Monitoring | `src/lib/platform/monitoring/system-monitor.ts` | Present |
| Email | `src/lib/platform/email/sender.ts` | Tested |
| MFA | `src/lib/auth/mfa.ts`, `/settings/mfa` | TOTP; JWT gap at login (security-audit) |

---

## Intelligence Core (VERIFIED)

| Component | Path | Evidence |
|-----------|------|----------|
| AI orchestrator | `src/lib/ai/` — 73 files | Provider factory, eval-gate, spend |
| Governance | `src/lib/governance/` — 25 files | Retrieval router, prompt framework |
| RAG | `src/lib/rag/` — 11 files | pgvector integration |
| Skill runtime | `src/lib/skill-runtime/` — 8 files | Evaluator + registry |
| Local provider | `src/lib/ai/providers/` | `local-ai:smoke` PASS (test-reality-report) |

**Default behavior:** Deterministic handlers; real LLM gated by env flags (ADR-001 + architecture-reality.md).

---

## Data Layer (VERIFIED)

- **214 Prisma models** in `prisma/schema.prisma`
- **87 migration files** in `prisma/migrations/` (inventory-report)
- Untracked: `prisma/migrations/diff_platform_models.sql` (git status snapshot)
- Tenancy: `organizationId` on user + domain models (architecture-reality.md)

---

## Security Layer (VERIFIED — with gaps)

| Control | Actual behavior | File evidence |
|---------|----------------|---------------|
| Middleware RBAC | Role hierarchy on routes | `src/middleware.ts` — NOT fully opened |
| CoreAccessControl | **Always grants** | `src/core/access/access-control.ts` L7–8 |
| Tenant isolation | Product-specific guards | cross-tenant test exists (architecture-reality) |
| SCIM | API + timing-safe key | `src/app/api/scim/v2/` |
| CSP | Restrictive + unsafe-inline | `next.config.mjs` |

---

## Infrastructure (VERIFIED in repo)

| Asset | Path | Live state |
|-------|------|------------|
| Terraform | `infra/terraform/` — 20 files | IaC present; live AWS **NOT VERIFIED** |
| CI/CD | `.github/workflows/` — 5 files | `deploy.yml` runs `tsc --noEmit` first |
| Docker | `Dockerfile` | NOT opened |
| Vercel | `vercel.json` | NOT opened |

---

## Dependency Highlights (VERIFIED)

From `package.json`: next 16.2.4, prisma 7.8, zod 4.4, bull, ioredis, @aws-sdk/client-s3, xlsx, pdfkit, mammoth, @sentry/nextjs.

**50+ npm scripts** for domain operations (TB intelligence, local-content pilot, shalfa, etc.).

---

## Actual Boundaries — Weak Points

1. **SalesOS sprawl:** `sales/v02/`, `sales/_v02/`, `sales/vnext/` coexist — 358 lib files
2. **Dual DecisionOS routes:** `(dashboard)/decisions/` and `decision/`
3. **Risk routes without lib:** `src/lib/risk/` empty
4. **19 duplicate `(1).ts` files** — Windows copy artifacts (glob verified)
5. **11 marketing `.bak` files** — not active routes

---

## NOT VERIFIED

- Runtime middleware behavior under load
- Production ECS task count / RDS state
- Full import graph / circular dependencies
- Cypress E2E pass/fail (not executed this audit)
