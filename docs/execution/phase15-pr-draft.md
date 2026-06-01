# Phase 15 PR Draft

**Title:** feat(phase15): browser smoke evidence and CI pilot pipeline

**Base:** `main`  
**Head:** `feature/salesos-l6-unblock`

---

## Summary

- Agent browser smoke evidence for `/login`, `/sales`, `/audit` on `aqliya_pilot` (human sign-off still pending).
- Idempotent `scripts/ensure-audit-user-admin.ts` — provisions `AuditUser` for `admin@aqliya.com` so AuditOS dashboard renders fully.
- New `.github/workflows/pilot-ci.yml` — postgres, migrate deploy, seed, build, governance jest (16), authenticated curl smoke via `next start`.
- Updated execution docs: browser smoke report, master execution report Phase 15, production readiness checklist (CI + browser rows).

## Test plan

- [ ] `npx next build --webpack` — exit 0
- [ ] `npm test -- --testPathPatterns="sales-governance|sales-l5-governance"` — 16/16
- [ ] `npx tsx scripts/smoke-auth-routes.ts` — 6/6 (dev or `next start`)
- [ ] `npx tsx scripts/ensure-audit-user-admin.ts` — idempotent on pilot
- [ ] Human browser walkthrough: `/sales/*`, `/workflowos`, `/audit`, `/local-content`
- [ ] GitHub Actions: first `Pilot CI` workflow run green on PR

## Honest gates

- **Production:** no-go
- **Pilot rehearsal:** conditional go on `aqliya_pilot` with curl + jest green
- Agent browser evidence ≠ human institutional sign-off
