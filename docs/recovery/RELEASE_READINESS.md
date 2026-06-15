# Release Readiness — AuditOS Recovery

**Branch:** `auditos/factory-memory-2026-06`  
**Target merge:** `main`  
**Date:** 2026-06-15

---

## Ready For Merge

*(After commit slices complete on recovery branch)*

- Prisma schema validates
- TypeScript passes (`npx tsc --noEmit`)
- Targeted unit tests pass (25/25 memory + presentation)
- Migration SQL reviewed — additive, ordered
- Recovery inventory + commit plan documented
- Binary/temp exclusions defined

---

## Needs Review

| Item | Owner | Notes |
|------|-------|-------|
| Full `npm run build` | QA | Not run in recovery session |
| Full `npm test` | QA | CI may surface pre-existing failures |
| `package-lock.json` delta | Platform | Large dependency tree |
| `.github/workflows/ci.yml` changes | Platform | Verify CI still passes |
| Mixed non-AuditOS modified docs | Product | 23 modified docs — some marketing |
| `_prisma_migrations` drift on dev | DBA | 3 migrations flagged pending |
| Evidence JSON in git | Compliance | No customer PII in committed JSON — spot-check Shalfa artifacts |

---

## Blocking Issues

| # | Blocker | Status |
|---|---------|--------|
| 1 | **Work not committed** | ⏳ In progress — recovery commits |
| 2 | **Not pushed to remote** | ❌ Branch local only — data loss risk |
| 3 | **Production missing migrations** | ❌ Until deploy pipeline runs `migrate deploy` |
| 4 | **Full build unverified** | ❌ Required before production |

---

## Staging Plan

1. Push `auditos/factory-memory-2026-06` to `origin`
2. Open PR → `main`; require review + CI tsc
3. Deploy staging from PR branch or merge to `staging`
4. `npx prisma migrate deploy` on staging RDS
5. `npx prisma db seed` (presentation policies)
6. Manual smoke: `/audit/engagements/*/mapping` — Trust + Evidence badges
7. Optional: `npm run phase-3c:validate` with Shalfa engagement on staging DB

---

## Production Plan

1. Merge PR to `main` after staging sign-off
2. RDS snapshot
3. `migrate deploy` → `generate` → ECS/Vercel deploy
4. Post-deploy smoke script
5. **No global firm memory backfill** — engagement-by-engagement only
6. Monitor Sentry/CloudWatch for mapping/FS errors

---

## Rollback Plan

1. Revert application deployment to `18366fc` image
2. Schema is forward-only — **do not** drop new tables on rollback
3. Deprecated firm memory patterns excluded from lookup
4. Restore RDS snapshot only for catastrophic migration failure

---

## Merge Readiness Verdict

| Environment | Ready? |
|-------------|--------|
| Local recovery branch | **In progress** |
| Staging | **No** — after push + migrate |
| Production | **No** — after staging + build gate |
