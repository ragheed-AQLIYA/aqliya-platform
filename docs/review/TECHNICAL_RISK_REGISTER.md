# Technical Risk Register — AuditOS Factory Program (PR #5)

**Audit date:** 2026-06-15  
**Branch:** `auditos/factory-memory-2026-06`  
**Severity scale:** Critical · High · Medium · Low

---

## R-001 — GitHub PR CI failing

| Field | Value |
|-------|-------|
| **Severity** | **High** |
| **Category** | Release / QA |
| **Evidence** | `gh run 27548070717`: 5 suites failed, 10 tests failed |
| **Failed suites** | `tb-upload-mapping-fs.integration.test.ts`, `ifrs-rules.test.ts`, `socpa-rules.test.ts`, `verification-checklist.test.ts`, `platform/siem/delivery.test.ts` |
| **Note** | IFRS/SOCPA pass locally (11/11); failures may be CI env / ordering / DB — still blocks official green gate |
| **Mitigation** | Triage failures; fix or quarantine with documented waiver before merge |
| **Owner** | Engineering |

---

## R-002 — Staging deploy blocked (AWS credentials)

| Field | Value |
|-------|-------|
| **Severity** | **High** |
| **Category** | Operations |
| **Evidence** | `gh run 27547489983`: `Credentials could not be loaded` on Terraform + Docker jobs |
| **Impact** | No proof on real infra; `staging.aqliya.com` not validated |
| **Mitigation** | Add `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`; re-run deploy (`OPERATOR_DEPLOY_CHECKLIST.md`) |
| **Owner** | Operator / DevOps |

---

## R-003 — Untracked auth token leak endpoint

| Field | Value |
|-------|-------|
| **Severity** | **Critical** (if committed) · **High** (while untracked locally) |
| **Category** | Security |
| **Evidence** | `src/app/api/test-token/route.ts` — returns JWT + cookies; **untracked**, not in PR |
| **Impact** | Session/token exposure if merged or deployed |
| **Mitigation** | Delete file; add to `.gitignore` / pre-commit guard; never deploy |
| **Owner** | Engineering |

---

## R-004 — LeadSchedule schema without migration

| Field | Value |
|-------|-------|
| **Severity** | **Medium** |
| **Category** | Data / Schema |
| **Evidence** | `LeadSchedule` in `schema.prisma`; `grep CREATE TABLE LeadSchedule prisma/migrations` → **0**; runtime P2021 errors in factory smoke |
| **Impact** | Lead schedule auto-gen and graph sync partially fail; reconciliation ties skipped |
| **Mitigation** | Post-merge migration; or feature-flag off until table exists |
| **Owner** | Engineering |

---

## R-005 — Migration drift on apply

| Field | Value |
|-------|-------|
| **Severity** | **Medium** |
| **Category** | Data / Migrations |
| **Evidence** | Local staging validation: governance enum exists but migration failed; reporting-graph unique indexes missing until repair SQL |
| **Impact** | `migrate deploy` may fail or leave partial schema on RDS |
| **Mitigation** | `MIGRATION_WALKTHROUGH.md`; `migrate resolve --applied` when objects verified; `STAGING_DRIFT_REPAIR_reporting-graph.sql` |
| **Owner** | Operator / DBA |

---

## R-006 — Platform scope bundled in factory PR (`58e4021`)

| Field | Value |
|-------|-------|
| **Severity** | **Medium** |
| **Category** | Architecture / Release |
| **Evidence** | Commit `58e4021`: middleware +95 lines, CI changes, Cypress, extensive doc edits — not factory-only |
| **Impact** | Regression blast radius; harder rollback; review fatigue |
| **Mitigation** | Staging smoke + RBAC probes; post-merge optional platform split (Cycle 2) |
| **Owner** | Release / Architecture |

---

## R-007 — Middleware RBAC expansion

| Field | Value |
|-------|-------|
| **Severity** | **Medium** |
| **Category** | Security |
| **Evidence** | `src/middleware.ts` route-to-role map includes `/monitoring` → admin, `/audit` → viewer |
| **Impact** | Incorrect role mapping could lock out pilots or expose routes |
| **Mitigation** | Deployed smoke + manual 307/401 checks; review `58E4021_REVIEW_PACK.md` |
| **Owner** | Security / Engineering |

---

## R-008 — Shalfa-specific presentation policy in migration seed

| Field | Value |
|-------|-------|
| **Severity** | **Medium** |
| **Category** | Product / Commercial truthfulness |
| **Evidence** | `20260614130000_presentation_policy_engine/migration.sql` inserts GL codes for Shalfa pilot |
| **Impact** | Second client requires new policy seed; docs must not claim generic engine without client config |
| **Mitigation** | Document pilot coupling; Cycle 2 generalization work |
| **Owner** | Product |

---

## R-009 — Missing knowledge assets (fixed late)

| Field | Value |
|-------|-------|
| **Severity** | **Medium** (was **High** before `608579c`) |
| **Category** | Release |
| **Evidence** | `coa-loader.ts` imports `knowledge/chart-of-accounts/ifrs-mapping.json`; untracked until `608579c`; caused first staging deploy `tsc` fail |
| **Impact** | CI/deploy break on clean checkout |
| **Mitigation** | **Fixed** in `608579c`; add CI check for required JSON imports |
| **Owner** | Engineering |

---

## R-010 — Dual PostgreSQL on developer machines

| Field | Value |
|-------|-------|
| **Severity** | **Low** |
| **Category** | Operations |
| **Evidence** | Windows `postgres.exe` + Docker both on `:5432`; Prisma vs docker exec see different DBs |
| **Impact** | False validation signals locally |
| **Mitigation** | Document single authoritative `DATABASE_URL`; stop duplicate listener |
| **Owner** | Developer / Operator |

---

## R-011 — Evidence / customer data hygiene

| Field | Value |
|-------|-------|
| **Severity** | **Low** (improved) |
| **Category** | Security / Privacy |
| **Evidence** | `shalfa-real-tb-classification.json` sanitized (`_sanitized: true`); `shalfa-live-validation.json` contains aggregate FS reference numbers only |
| **Impact** | Full TB file remains outside repo (correct); TB must not be committed |
| **Mitigation** | Keep TB client-side; maintain sanitization on evidence exports |
| **Owner** | Engineering |

---

## R-012 — Documentation optimism bias

| Field | Value |
|-------|-------|
| **Severity** | **Low** |
| **Category** | Governance |
| **Evidence** | Program docs claim pilot/L5 readiness; hold-out accuracy ~46%; Local AI smoke ≠ product |
| **Impact** | Stakeholder overconfidence |
| **Mitigation** | Use `CLAIMS_VERIFICATION_MATRIX.md` as authority for claims |
| **Owner** | Product / Docs |

---

## Risk heat map

```text
Critical:  R-003 (if test-token merged)
High:      R-001, R-002
Medium:    R-004, R-005, R-006, R-007, R-008, R-009 (resolved)
Low:       R-010, R-011, R-012
```

---

## Migration-specific risks (7 factory migrations)

| Migration | Staging | Production | Rollback | Data-loss |
|-----------|---------|------------|----------|-----------|
| `20260609100000_tb_intelligence_firm_memory` | Safe* | Safe* | Medium — drop tables | Low — additive |
| `20260613100000_reporting_graph_foundation` | Safe* | Safe* | Medium | Low — additive; **index drift risk** |
| `20260614120000_engagement_presentation_profile` | Safe | Safe | Easy — column nullable | Low |
| `20260614130000_presentation_policy_engine` | Safe | Safe | Medium — seeded policies | Low |
| `20260614140000_firm_memory_erp_context` | Safe | Safe | Easy — nullable columns | Low |
| `20260614150000_firm_memory_governance` | Safe* | Safe* | Medium — enum | Low — **drift seen** |
| `20260615100000_tb_classification_detail` | Safe | Safe | Easy — nullable JSONB | Low |

\*Safe with drift playbook if partial apply detected.

**Overall migration posture:** **Safe for staging with operator playbook**; **production** requires successful staging replay first.

---

## R-013 — Cash flow builder: operating logic real, investing/financing zero from architecture

| Field | Value |
|-------|-------|
| **Source** | CRITICAL_REMEDIATION_REPORT.md pre-existing R-003 |
| **Severity** | **Medium** (was **High** in CRITICAL_REMEDIATION_REPORT) |
| **Category** | Architecture / Data |
| **Evidence** | `src/lib/audit/fs-engine/cash-flow-builder.ts` — `deriveCashFlowContext()` extracts `netProfit` from income‑statement lines, computes `depreciationAddBack` from mapping canonical names (`Accumulated Depreciation`) and source account names (`.includes("depreciation")`). `buildCashFlowLinesFromContext()` generates an operating section with Net Profit line, depreciation add‑back, and Net Cash from Operating Activities subtotal. |
| **Reclassification** | **Not a UI shell.** The **operating cash flow** derivation is real — net profit extraction, depreciation identification, FS‑line building. The investing/financing/beginning‑cash gaps are **architectural**: no prior‑period balance‑sheet data exists to compute working‑capital changes required by the indirect method. `netCashFromInvesting = 0`, `netCashFromFinancing = 0`, `cashAtBeginning = 0` by construction. |
| **Impact** | Cash‑flow statement shows operating activity only; investing/financing sections are zero‑value headers. Not misleading for first‑period engagements, but incomplete for any period‑over‑period disclosure. |
| **Mitigation** | (1) Document as architectural limitation in pilot context. (2) When period‑over‑period data is introduced, implement working‑capital delta computation. (3) Until then, cash‑flow is usable for operating‑cash tie‑outs only. |
| **Owner** | Architecture / Product |
| **Status** | **ACKNOWLEDGED — NOT FIXED** |

> **R-013 reclassified, not resolved.** Cash flow completeness remains limited by absence of prior-period balances. Do not read this risk as closed or IFRS cash-flow disclosure complete.

---

## R-014 — Shalfa-specific GL codes in Generic Presentation Policy (partially overlaps R-008)

| Field | Value |
|-------|-------|
| **Source** | CRITICAL_REMEDIATION_REPORT.md pre-existing R-004 |
| **Severity** | **Low** (was **Medium** before R-004 fix) |
| **Category** | Product / Commercial truthfulness |
| **Evidence** | R-004 investigation found `GENERIC_PRESENTATION_POLICY_V1` in `presentation-policy-types.ts` contained `affiliateGlCodes: ["4401010005"]`, `contractRevenueGlCodes: ["4401010004"]`, `unbilledDuplicateGlCodes: ["4401010003"]` — all Shalfa‑pilot‑specific. The migration seed (`20260614130000`) matched. |
| **Fix applied (2026-06-15)** | (1) Source: cleared the three arrays in `GENERIC_PRESENTATION_POLICY_V1` (now `[]`). (2) Migration: updated the seeded JSONB to match. (3) `SHALFA_PILOT_PRESENTATION_POLICY_V1` retains all codes. (4) Verification: `temp_verify_policy.mjs` confirmed migration seed JSON exactly matches TypeScript source — **zero drift**. |
| **Impact** | Generic policy is now truly generic. Second client will get clean empty arrays. Shalfa pilot policy remains intact. No data migration needed — JSONB fix is presentational. |
| **Owner** | Engineering |
| **Status** | **FIXED** |

---

## R-015 — Test coverage gap for critical audit functions (PHASE 1 COMPLETE)

| Field | Value |
|-------|-------|
| **Source** | CRITICAL_REMEDIATION_REPORT.md pre-existing R-H01 |
| **Severity** | **Medium** |
| **Category** | QA / Test coverage |
| **Evidence** | CRITICAL_REMEDIATION_REPORT.md listed 13 critical functions without direct unit tests. Phase 1 (2026-06-15) added 15 new tests covering **6 functions**. |
| **New coverage** | See test coverage delta below. |
| **Remaining gap** | 7 critical functions still lack direct unit tests (require Prisma‑integration mocks beyond current mock scope). |
| **Mitigation** | Phase 2 test expansion required for remaining functions (see `CRITICAL_REMEDIATION_REPORT.md` R-H01). |
| **Owner** | Engineering (QA) |
| **Status** | **PARTIALLY ADDRESSED**

---

## Test Coverage Delta (R-H01 Phase 1)

### Before (baseline)

| Test file | Tests |
|-----------|-------|
| `presentation-policy-service.test.ts` | 3 |
| `fs-engine.test.ts` | 4 (1 overlaps with status-lifecycle) |
| `income-statement-presentation.test.ts` | 7 |
| `status-lifecycle.test.ts` | — (did not exist) |
| **Total** | **14** |

### After (this remediation)

| Test file | Tests | New | Note |
|-----------|-------|-----|------|
| `presentation-policy-service.test.ts` | 9 | +6 | 1 for R-004 verification, 2 for `createOrgPresentationPolicyFromTemplate`, 3 for `updateOrgPresentationPolicy` |
| `status-lifecycle.test.ts` | 9 | +9 | **New file** — 1 for `canTransitionFsStatus`, 3 for `transitionFinancialStatementStatus`, 2 for `markAllFinancialStatementsReviewed`, 3 for `approveAllFinancialStatementsForEngagement` |
| `fs-engine.test.ts` | 4 | 0 | Unchanged |
| `income-statement-presentation.test.ts` | 7 | 0 | Modified for R-004 (policy parameter added), not new |
| **Total** | **29** | **+15** | |

### Newly covered functions

| Function | Tests | File |
|----------|-------|------|
| `GENERIC_PRESENTATION_POLICY_V1` — empty codes verification | 1 | `presentation-policy-service.test.ts` |
| `createOrgPresentationPolicyFromTemplate(slug)` — slug found in memory | 1 | `presentation-policy-service.test.ts` |
| `createOrgPresentationPolicyFromTemplate(slug)` — fallback to builtin | 1 | `presentation-policy-service.test.ts` |
| `updateOrgPresentationPolicy(...)` — not found / not editable error | 1 | `presentation-policy-service.test.ts` |
| `updateOrgPresentationPolicy(...)` — invalid rules in database | 1 | `presentation-policy-service.test.ts` |
| `updateOrgPresentationPolicy(...)` — success update | 1 | `presentation-policy-service.test.ts` |
| `canTransitionFsStatus(draft → reviewed)` | 1 | `status-lifecycle.test.ts` |
| `transitionFinancialStatementStatus(...)` — statement not found | 1 | `status-lifecycle.test.ts` |
| `transitionFinancialStatementStatus(...)` — invalid transition | 1 | `status-lifecycle.test.ts` |
| `transitionFinancialStatementStatus(...)` — success + audit event | 1 | `status-lifecycle.test.ts` |
| `markAllFinancialStatementsReviewed(...)` — no drafts | 1 | `status-lifecycle.test.ts` |
| `markAllFinancialStatementsReviewed(...)` — marks drafts | 1 | `status-lifecycle.test.ts` |
| `approveAllFinancialStatementsForEngagement(...)` — no pending | 1 | `status-lifecycle.test.ts` |
| `approveAllFinancialStatementsForEngagement(...)` — approves reviewed | 1 | `status-lifecycle.test.ts` |
| `approveAllFinancialStatementsForEngagement(...)` — promotes drafts pipeline | 1 | `status-lifecycle.test.ts` |

### Remaining critical functions without direct unit tests

| Function | Module | Dependencies blocking mock |
|----------|--------|---------------------------|
| `rebuildFinancialStatementsV2` | `fs-engine/fs-engine.ts` | Prisma DB access, prior FS state |
| `syncReportingGraphForEngagement` | `reporting-graph/graph-builder.ts` | Prisma graph node query, cache |
| `promoteFinancialStatementsOnApproval` | `governance/governance-engine.ts` | Prisma updateMany (refactored, but function itself not unit-tested) |
| `enrichMappingsWithErpMap1` | `presentation/enrich-mapping-map1.ts` | External mapping data, Prisma |
| `buildPresentationIncomeStatementTotals` | `db/income-statement-presentation.ts` | Complex aggregation with policy resolution |
| `reconcileTrialBalanceToFs` | `reconciliation/reconciliation.ts` | Prisma batch read, multiple FS types |
| `classifyRevenuePresentationSegment` | `db/income-statement-presentation.ts` | Covered indirectly via income-statement-presentation tests but not as isolated unit |

---

## Risk heat map (updated)

```text
Critical:  R-003 (auth token — untracked, not merged)
High:      R-001, R-002
Medium:    R-004 (LeadSchedule migration gap), R-005, R-006, R-007, R-013 (cash flow — architectural), R-015 (test gap)
Low:       R-008 (partially fixed by R-014), R-009 (resolved), R-010, R-011, R-012
Resolved:  R-014 (Shalfa codes in generic policy — FIXED)
```
