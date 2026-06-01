# Phase 16 PR Draft

**Title:** feat(phase16): extended smoke, CI local validation, integrator checklist

**Base:** `main`  
**Head:** `feature/salesos-l6-unblock`

---

## Summary

- Extended `scripts/smoke-auth-routes.ts` to **8/8** routes (+ `/local-content`, `/local-content/command-center`) with pass/fail exit code.
- Committed `.github/workflows/pilot-ci.yml` (postgres, migrate deploy, seed, seed:audit, build, jest 16, `next start` + smoke).
- Pilot DB re-seed on `aqliya_pilot` — `AuditUser` for `admin@aqliya.com` verified after seed + `seed:audit`.
- Local pilot-ci simulation: all steps green (build, jest, curl smoke).
- Integrator browser checklist: `docs/reports/salesos-l6-integrator-checklist.md`.
- Agent browser evidence: `/audit`, `/local-content` PASS; login form MCP gap persists.

## Test plan

- [x] `npx next build --webpack` — exit 0
- [x] `npm test -- --testPathPatterns="sales-governance|sales-l5-governance"` — 16/16
- [x] `npx tsx scripts/smoke-auth-routes.ts` — 8/8
- [x] `npx prisma db seed` + `seed:audit` on `aqliya_pilot`
- [ ] Human browser walkthrough per integrator checklist
- [ ] GitHub Actions: first **Pilot CI** green on PR

## Honest gates

- **Production:** no-go
- **Pilot rehearsal:** conditional go on `aqliya_pilot` with curl 8/8 + jest 16/16
- Agent browser ≠ human institutional sign-off
