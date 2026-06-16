# Release Decision — AuditOS Factory Program PR #5

**Audit:** Independent Technical Audit Council  
**Branch:** `auditos/factory-memory-2026-06`  
**PR:** #5 — "feat(auditos): factory memory program"  
**Date:** 2026-06-15  
**Authority:** This decision supersedes all prior internal readiness assessments.

---

## Decision

# APPROVE WITH CONDITIONS ❌→⚠️→✅

**PR #5 may be merged to `main` only after conditions below are satisfied.**

**Staging validation must pass independently on proper staging infrastructure before any production deployment.**

---

## Required Conditions (Blocking — All Must Be Satisfied)

### Condition 1 — Fix `LeadSchedule` Migration Gap

**Severity:** Critical  
**Evidence:** `LeadSchedule` model exists at `prisma/schema.prisma:4447` but no migration creates the table. Migration `20260613100000` creates `LeadScheduleLine` with FK to `LeadSchedule`. A fresh database `migrate deploy` will fail.

**Action required:** Create migration `20260615XXXXX_create_lead_schedule` or add `CREATE TABLE IF NOT EXISTS "LeadSchedule"` to an existing migration.

**Verification:** `npx prisma migrate deploy` on clean database must apply all 8 migrations without error.

---

### Condition 2 — Fix Governance Bypass

**Severity:** Critical  
**Evidence:** `promoteFinancialStatementsOnApproval` in `governance-engine.ts:107-114` uses `updateMany` to force-approve ALL non-approved financial statements in a single query with no audit trail per statement. This bypasses the entire governance lifecycle.

**Action required:** Either:
- Remove the function entirely and gate financial statement approval through the proper `transitionFinancialStatementStatus` lifecycle, or
- Add individual audit events per statement with actor identity and timestamp

**Verification:** Tests must verify that `approveAllFinancialStatementsForEngagement` or equivalent goes through governance gates and generates per-statement audit events.

---

### Condition 3 — Add Transaction Safety to FS Rebuild and Graph Sync

**Severity:** Critical  
**Evidence:**
- `rebuildFinancialStatementsV2` (`fs-rebuild-service.ts:50-103`) — no transaction. Partial rebuild on failure leaves DB with stale data for some statement types.
- `syncReportingGraphForEngagement` (`graph-sync-service.ts:61`) — clears graph content before rebuilding, no transaction. Failure = empty graph.

**Action required:** Wrap both functions in Prisma interactive transactions.

**Verification:** Inject a failure after partial completion and verify that no partial data remains in the database.

---

### Condition 4 — Fix Knowledge Actions Tenant Isolation Gap

**Severity:** High  
**Evidence:** `audit-knowledge-actions.ts` — functions like `listPatternsAction(organizationId)`, `getTopPatternsAction(organizationId)`, `listBenchmarksAction(organizationId)`, `derivePatternsAction(engagementId)`, `generateRecommendationsAction(engagementId)` accept `organizationId`/`engagementId` as parameters without verifying the actor belongs to that organization/engagement.

**Action required:** Add `assertOrganizationAccess(organizationId, actor)` and `assertEngagementAccess(engagementId, actor)` calls to all knowledge actions.

**Verification:** Tests must verify cross-org access is rejected.

---

### Condition 5 — Confirm Factory Accuracy on Staging with Full TB Data

**Severity:** High  
**Evidence:** Factory accuracy ≈94% was validated on local environment with `TB 31-12-2025 Final.xlsx` (578 accounts). The Shalfa pilot evidence has been sanitized (99.4% size reduction) removing account-level detail.

**Action required:** Run full Shalfa validation on staging RDS with the actual TB file. Document results including per-category accuracy breakdown.

**Verification:** `npm run shalfa:validate` must produce accuracy ≥90% with `pass: true` and per-category scores.

---

### Condition 6 — Separate Platform/Integration Code from AuditOS Factory Scope

**Severity:** Medium  
**Evidence:** Commit `58e4021` contains 32,101 LOC of Platform/Integration code (94.3% of that commit) that is unrelated to AuditOS Factory. This includes institutional memory, content studio, org advanced, sales intelligence, ABAC, audit risk, secrets management, and cross-product AI.

**Action required:** Either:
- Create a separate PR for Platform/Integration code, or
- Document explicitly that PR #5 includes non-AuditOS platform foundation code, with rationale and review trail

**Verification:** PR description must accurately reflect the scope of Platform vs AuditOS changes.

---

## Non-Blocking Recommendations (Address Within 1 Sprint of Merge)

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Fix cash flow builder — investing/financing are hardcoded to zero | High | FS Engine team |
| 2 | Fix `trustHost: true` in auth config — scope by environment | High | Security team |
| 3 | Add CodeQL + `npm audit` to CI | Medium | DevOps team |
| 4 | Add tests for 13 uncovered critical functions | High | QA team |
| 5 | Fix IFRS/SOCPA over-citation — use precise statement type matching | Medium | Rules Engine team |
| 6 | Encrypt legacy credentials in DB — `CrmConnection.accessToken`, etc. | Medium | Platform team |
| 7 | Replace `sleep 60` in deploy with `aws ecs wait services-stable` | Low | DevOps team |
| 8 | Add `server-only` guards to engine.ts and prisma-importing files | Low | Engineering |
| 9 | Fix `pattern-matcher.ts` — either scope to engagement or document cross-engagement intent | Medium | TB Intelligence team |
| 10 | Document the `LeadSchedule` migration gap as a known issue if not fixed before merge | Medium | Documentation |

---

## Staging Validation Prerequisites

Before merge to `main`, the following must pass on **real staging infrastructure** (not local Windows):

| Gate | Required | Verification |
|------|----------|--------------|
| `npx prisma migrate deploy` | Full pass (8/8 migrations) | `npx prisma migrate status` |
| `npm run build` | PASS | Build output |
| `npx tsc --noEmit` | PASS | Zero errors |
| `npm test` | PASS | Full test suite |
| `npm run shalfa:validate` | PASS with ≥90% accuracy | Validation report |
| `npm run factory:smoke` | PASS | 33+ checks |
| Route probes | ALL auth-protected routes return 307; public routes return 200 | Smoke test output |
| Post-deploy smoke | PASS (29/29 critical) | Smoke report |

---

## Rollback Plan

If PR #5 causes regression after merge to `main`:

```bash
git revert --no-commit main..auditos/factory-memory-2026-06
git commit -m "revert: PR #5 factory memory program"
git push origin main
```

**Database rollback:** All 7 migrations are additive (CREATE TABLE / ADD COLUMN). No rollback SQL is provided. If rollback is needed:
1. Deploy pre-PR #5 app code (will ignore new tables/columns)
2. Schedule migration removal for next maintenance window
3. `npx prisma migrate diff` to generate rollback SQL

**Data preservation:** Firm memory patterns, reporting graph data, and presentation policies are retained even if rollback is needed — they are inert without the new app code.

---

## Final Verdict

**PR #5 is a substantial, well-structured program with strong core architecture in many areas.** The ADR-001 pipeline, firm memory governance (as pure functions), and approval gates (as pure functions) demonstrate high engineering quality.

**However, 5 critical issues and 5 high-severity issues prevent unconditional approval.** The most concerning are: the `LeadSchedule` migration gap (would break fresh deploys), the governance bypass (undermines the entire governance model), and the missing transaction safety (risks data corruption on partial failures).

**The factory accuracy ≈94% claim is substantiated by evidence artifacts** but requires specific input data to reproduce. The marketing/docs language describing L6 readiness is ahead of code reality — the cash flow builder is a placeholder, and several governance paths bypass the gates entirely.

**Recommendation:** Fix the 6 blocking conditions, then merge. Do not deploy to production without independent staging validation on proper infrastructure.

---

## Sign-off

| Role | Decision | Date |
|------|----------|------|
| Independent Audit Council | **APPROVE WITH CONDITIONS** | 2026-06-15 |
| Conditions verified | Pending | TBD |
| Merge authorized | Pending condition satisfaction | TBD |
