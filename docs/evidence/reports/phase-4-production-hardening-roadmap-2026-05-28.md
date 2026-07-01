# Phase 4 — Production Hardening Roadmap

**Date:** 2026-05-28
**Agent:** Production Hardening Backlog Agent
**Status:** Assessment complete

---

## Classification

| Priority | Definition |
|----------|------------|
| **P0** | Controlled deployment blocker — must fix before deployment to any environment beyond local |
| **P1** | Operational hardening — important for reliability and governance maturity |
| **P2** | Quality maturity — improves UX, maintainability, and robustness |
| **P3** | Institutional scale maturity — needed for multi-instance or enterprise deployment |

---

## P0 — Controlled Deployment Blockers

| Item | Area | Product | Effort | Detail |
|------|------|---------|--------|--------|
| P0.1 — Root middleware auth guard | Auth | Platform | ~2h | Add `src/middleware.ts` protecting `/(dashboard)/*` and `/api/*` routes. Currently no global auth guard — every route handler checks individually, making the auth surface fragile |
| P0.2 — Platform storage path traversal protection | Evidence | Platform | ~30min | `src/lib/platform/storage/local-storage-provider.ts` lacks the TRAVERSAL_PATTERN and resolved-path checks that `src/lib/audit/storage/local-storage-provider.ts` has |

---

## P1 — Operational Hardening

| Item | Area | Product | Effort | Detail |
|------|------|---------|--------|--------|
| P1.1 — Wire platform org guard into routes | Auth | AuditOS, LC | ~1h | `requirePlatformOrganization` exists but is not wired into any route |
| P1.2 — DOWNLOAD_TOKEN_SECRET in .env.example | Config | Platform | ~5min | Missing from `.env.example`; deployment will fail without it |
| P1.3 — Rate limit reset on restart | Observability | Platform | ~2h | In-memory rate limiting resets on every server restart; document as deployment constraint |
| P1.4 — Unified audit mutation helper | Auditability | Platform | ~4h | Create thin helper to standardize audit logging across products (reduce fragmentation across 4 models) |
| P1.5 — Operational health events | Observability | Platform | ~2h | Add system actor logging for startup, migration, backup, deployment events |
| P1.6 — loading.tsx at DecisionOS top level | Resilience | DecisionOS | ~15min | Add `loading.tsx` at `src/app/(dashboard)/decisions/` |
| P1.7 — PDF export stream/buffer limit | Exports | AuditOS, LC | ~1h | Add memory limit check on PDF/XLSX buffer; consider streaming for large exports |

---

## P2 — Quality Maturity

| Item | Area | Product | Effort | Detail |
|------|------|---------|--------|--------|
| P2.1 — Arabic font for PDF export | Exports | All | ~2h | Register Arabic-capable font (e.g., Noto Sans Arabic) in pdfkit PDF exporter |
| P2.2 — Error boundary at LC project detail | Resilience | LocalContentOS | ~15min | Add `error.tsx` at `local-content/projects/[projectId]/` |
| P2.3 — Error boundary at WorkflowOS top | Resilience | WorkflowOS | ~15min | Add `error.tsx` at `workflowos/` |
| P2.4 — SetInterval cleanup on HMR | Resilience | Platform | ~30min | Fix `setInterval` leaks in route modules; use proper cleanup or move to server lifecycle |
| P2.5 — Start-up validation for critical env vars | Config | Platform | ~30min | Validate `DOWNLOAD_TOKEN_SECRET`, `AUTH_SECRET`, `DATABASE_URL` at startup |
| P2.6 — Export filename human-readable | Exports | AuditOS | ~15min | Use client name + period instead of truncated engagement ID |
| P2.7 — Audit rate limiter should return 429 not 500 | Resilience | AuditOS | ~15min | `enforceAuditRateLimit` throws Error → caught as 500; should return 429 |

---

## P3 — Institutional Scale Maturity

| Item | Area | Product | Effort | Detail |
|------|------|---------|--------|--------|
| P3.1 — Redis-backed rate limiting | Scale | Platform | ~3-5d | Replace in-memory rate limiters with Redis for multi-instance deployments |
| P3.2 — Object storage for multi-instance | Scale | Platform | ~3-5d | Implement and test S3/Azure Blob providers for shared file storage |
| P3.3 — Multi-instance session revocation | Scale | Platform | ~2-3d | Add JWT blocklist or switch to database sessions |
| P3.4 — Backup/restore tooling | Ops | Platform | ~2-3d | Prisma backup scripts, automated migration pipeline |
| P3.5 — Docker container build | Ops | Platform | ~1d | Dockerfile + docker-compose for PostgreSQL + app |
| P3.6 — HSTS header | Security | Platform | ~5min | Add `Strict-Transport-Security` to middleware |
| P3.7 — Audit model unification | Data | Platform | ~1w | Merge 4 separate audit models into one (PlatformAuditLog) |

---

## What NOT to Touch Yet

| Item | Reason |
|------|--------|
| Auth provider replacement | NextAuth v5 works; replacement (e.g., Auth.js v5 native) is future |
| Schema-wide rewrite | Current schema is functional; rewrite is cost without benefit |
| Kubernetes deployment | Not viable for v0.1; requires multi-instance infra first |
| SSO/LDAP/AD integration | Strategic/future; not required for pilot |
| Full Arabic PDF rendering | P2 quality gap; acceptable for pilot with English-primary exports |
| On-Prem package | Strategic/future; doesn't block current deployment |
| Air-Gapped mode | Strategic/future; not viable without local AI runtime |

---

## Recommended Sequencing

```
Week 1: P0 items (auth middleware, storage traversal fix)
Week 2: P1 items (platform org guard, env fixes, audit helper, health events)
Week 3: P1-P2 items (error boundaries, loading states, export buffer limits)
Week 4: P2 items (Arabic font, startup validation, HMR cleanup)
Future: P3 items (Redis, object storage, Docker, backup tooling)
```

## Priority by Area

| Area | P0 | P1 | P2 | P3 | Total |
|------|----|----|----|----|-------|
| Auth | 1 | 1 | 0 | 1 | 3 |
| Observability | 0 | 2 | 1 | 1 | 4 |
| Exports | 0 | 1 | 2 | 0 | 3 |
| Resilience | 0 | 1 | 3 | 0 | 4 |
| Config | 0 | 1 | 1 | 0 | 2 |
| Scale | 0 | 0 | 0 | 3 | 3 |
| Ops | 0 | 0 | 0 | 2 | 2 |
| Security | 1 | 0 | 0 | 1 | 2 |
| **Total** | **2** | **6** | **7** | **8** | **23** |
