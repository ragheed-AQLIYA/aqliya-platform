# ADR-102: Database Strategy

**Status:** Accepted — Codified from repository reality  
**Date:** 2026-07-19  
**Owner:** Data Architecture / Platform  
**Constitution principles:** Consumer-Driven Extraction; One Owner Rule  
**Related:** ADR-100, ADR-103 (Tenant Isolation), engineering ADR-002 (Prisma sole access)

---

## Context

AQLIYA persists all product and platform state in PostgreSQL via Prisma 7 (`prisma/schema.prisma`, ~244 models, ~591 indexes). Migrations live under `prisma/migrations/` (~55 folders). Seeds are multi-file (`prisma/seed.ts` + product seeds). pgvector is used for RAG embeddings with JSON fallback. CI applies migrations with `prisma migrate deploy` against pgvector Postgres 16.

---

## Problem

1. Single mega-schema couples all products physically despite logical isolation.
2. Dual tooling (`db:migrate` / `db:push`) and dual Terraform env folders create operational ambiguity.
3. Some models lack org indexes (scanner: `KnowledgeCandidateEvidence`).
4. N+1 and unbounded `findMany` patterns threaten scale.
5. Prod tfvars still show `db.t4g.micro` ACCOUNT-BLOCKED — sizing ≠ “L6 hardened” claims.

---

## Options Considered

### Option A — Database-per-product now

| Pros | Cons |
|------|------|
| Strong isolation | Breaks joins, transactions, current Kernel; multi-quarter rewrite |

### Option B — Stay on Prisma + single Postgres; logical tenancy + migrate discipline (selected)

| Pros | Cons |
|------|------|
| Matches codebase | Schema growth risk |
| Transactional workflows across evidence/audit | Requires indexing & query hygiene |

### Option C — Prisma for OLTP + separate analytics warehouse

| Pros | Cons |
|------|------|
| Scales reporting | Premature without customer volume; no warehouse in repo |

---

## Decision

1. **PostgreSQL 16 + Prisma 7** is the sole OLTP stack. Application code does not introduce alternate ORMs.
2. **Migrations:** Production/CI use `prisma migrate deploy`. `db push` is local/dev convenience only — not a deploy path.
3. **Access path:** Server Actions / server modules → Kernel prisma bridge → Prisma. **No Prisma in Client Components** (GOV-01).
4. **Raw SQL:** Forbidden for business queries; `$queryRaw` only for fixed health checks (`SELECT 1`) per Security Risk Register.
5. **Multi-tenancy:** Prefer `organizationId` / `platformOrganizationId` on business models with composite indexes (ADR-103).
6. **pgvector:** Optional extension; embeddings degrade to JSON when unavailable — do not hard-require vector for core CRUD.
7. **Schema evolution:** New models require a product owner, tenant fields, and migration. No speculative On-Prem/Air-Gap tables.
8. **Physical split:** Deferred. A future ADR may partition schemas/databases only after tenant + query evidence justifies cost.

---

## Consequences

### Positive
- One migration story for ops.
- Type-safe access across products.
- Aligns with existing seeds, CI, Terraform RDS.

### Negative
- Mega-schema continues until partitioning ADR.
- Requires continuous index/N+1 governance (engineering performance agent).

---

## Migration Strategy

1. Keep `migrate deploy` in CI (`ci.yml`).
2. Remediate missing org indexes (P1).
3. Fix N+1 HIGH findings before expanding read-heavy dashboards.
4. Collapse `prod` vs `production` Terraform so RDS class matches environment truth (ADR-108).
5. Document seed order in `prisma/seed.ts` when adding products.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| CI migrate deploy | Green on main |
| Client Prisma imports | 0 new; GOV-01 residual → 0 |
| Missing org-index suspects | 0 HIGH |
| N+1 HIGH findings | Trend down from 8 |
| Prod DB class | Documented and not free-tier-blocked for production claims |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Migration drift across envs | `migrate status` in CI; forbid silent `db push` in prod |
| Schema bloat | Product owners; refuse speculative models |
| pgvector ops gaps | Health scripts `db:verify-pgvector` |

---

## Related Components

- `prisma/schema.prisma`, `prisma/migrations/`, `prisma.config.ts`
- `src/lib/kernel/prisma.ts`, `src/lib/prisma.ts`
- `infra/terraform/modules/database/`
- `engineering/reports/performance.md`

---

## Repository Evidence

| Evidence | Path |
|----------|------|
| Model count ~244 | `prisma/schema.prisma` |
| CI migrate | `.github/workflows/ci.yml` |
| Scripts | `package.json` `db:migrate`, `db:push`, `test:integration:setup` |
| Prod sizing notes | `infra/terraform/environments/prod/terraform.tfvars` |
| Health `$queryRaw` accepted risks | `engineering/security/RISK_REGISTER.md` SR-001–005 |
