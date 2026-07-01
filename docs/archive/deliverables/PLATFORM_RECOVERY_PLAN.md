# Platform Recovery Plan

**Generated:** 2026-06-22  
**Input:** Tracks A–F evidence in sibling deliverables.

---

## P0 — Blockers (execute first)

| ID | Task | Owner | Effort | Risk | Dependencies |
|----|------|-------|--------|------|--------------|
| P0-1 | Fix 6 ESLint **errors** blocking CI (`abac-service.ts`, signal producers, KF form/link, mining route) | Engineering | 2–4h | Low | None |
| P0-2 | **Create staging DNS** for canonical host (`staging.aqliya.com` per terraform) | DevOps/DNS | 1–2h | Medium | Domain registrar access |
| P0-3 | Attach staging domain to deployment target (Vercel staging project **or** ECS ALB) | DevOps | 2–4h | Medium | P0-2 |
| P0-4 | Set GitHub secret `DATABASE_URL` for `backup.yml` | DevOps | 15m | Low | Staging/prod DB URL |
| P0-5 | Add missing **`KnowledgeCandidate` CREATE TABLE** migration (schema gap) | Engineering | 4–8h | Medium | Prisma review |

### P0-2 DNS steps (if Vercel staging)

1. Vercel dashboard → Project → Settings → Domains → Add `staging.aqliya.com`
2. Registrar → CNAME `staging` → `cname.vercel-dns.com` (or value Vercel shows)
3. Wait propagation → `node scripts/platform/staging-probe.mjs` exit 0

### P0-5 migration steps

1. `npx prisma migrate diff --from-migrations ...` or hand-author CREATE for `KnowledgeCandidate`, evidence, promotion history
2. Test on empty Postgres: `migrate deploy` → seed mining → KF migrations
3. Remove reliance on `tabletop-minimal-schema.sql` for fresh installs (keep as emergency doc only)

---

## P1 — Stabilization

| ID | Task | Owner | Effort | Risk | Dependencies |
|----|------|-------|--------|------|--------------|
| P1-1 | Decide single production path: **Vercel (active)** vs **AWS ECS (failing)** — archive or fix unused workflow | Platform | 2h decision | Low | Leadership |
| P1-2 | If ECS retained: configure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, verify `deploy.yml` | DevOps | 4h | High | AWS account |
| P1-3 | Align `docker-compose.staging.yml` `NEXTAUTH_URL` to `staging.aqliya.com` (remove `.ai` drift) | Engineering | 15m | Low | P0-2 |
| P1-4 | Run `platform:bootstrap-tabletop` on staging DB after deploy | Engineering | 1h | Medium | P0-3 |
| P1-5 | Re-enable green CI on `main` (lint + full pipeline) | Engineering | 1h | Low | P0-1 |
| P1-6 | Local dev DB: full `migrate deploy` + seed on clean Postgres OR document pgvector compose path | Engineering | 4h | Medium | P0-5 |

---

## P2 — Hardening

| ID | Task | Owner | Effort | Risk | Dependencies |
|----|------|-------|--------|------|--------------|
| P2-1 | Reduce ESLint warnings (269) or tighten CI to errors-only with baseline | Engineering | 1–2d | Low | P1-5 |
| P2-2 | Fix `preview.yml` / refresh Vercel PR preview secrets | DevOps | 2h | Low | VERCEL_* secrets |
| P2-3 | Execute human tabletop locally; file `TABLETOP_EXECUTION_RECORD.md` | Governance | 4h | Low | Local CONDITIONAL GO |
| P2-4 | Schedule remote tabletop after staging bootstrap | Governance | 1d | Medium | P1-4 |
| P2-5 | Mark `deploy.yml` / `promote.yml` as deprecated in repo README if Vercel-only | Docs | 30m | Low | P1-1 |

---

## Workflows to Disable or Fix

| Workflow | Action |
|----------|--------|
| `ci.yml` | **Fix** (P0-1) — must pass on every `main` push |
| `deploy.yml` | **Fix secrets** OR **disable** if Vercel is sole prod path |
| `backup.yml` | **Fix** `DATABASE_URL` secret (P0-4) |
| `promote.yml` | **Do not use** until staging DNS live |
| `preview.yml` | **Optional** — fix secrets if PR previews needed |

---

## Validation Gate (re-run after P0)

```bash
npm run lint          # 0 errors
npm test              # pass
npx tsc --noEmit      # pass
npm run build         # pass
npx prisma validate   # pass
node scripts/platform/staging-probe.mjs  # exit 0
npm run platform:bootstrap-tabletop      # TABLETOP_READY=YES on target DB
```

---

## Execution Order

```text
P0-1 (CI green) → P0-5 (migration gap) → P0-2/3 (staging DNS+deploy) → P1-4 (staging bootstrap) → P2-3 (human tabletop local) → P2-4 (remote tabletop)
```
