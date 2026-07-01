# Claims Verification Matrix — AuditOS Factory Program PR #5

**Audit:** Independent Technical Audit Council  
**Branch:** `auditos/factory-memory-2026-06`  
**Date:** 2026-06-15  

---

## Methodology

Each claim is tested against three sources of truth:

| Source | Weight | Rule |
|--------|--------|------|
| **Code** | Highest | Direct file inspection, test execution |
| **Evidence** | High | Runtime artifacts, JSON validation outputs |
| **Documentation** | Lowest | Docs may be aspirational or stale |

**Verdict scale:**
- **Proven** — Code + evidence independently confirm
- **Partially Proven** — Code confirms but with caveats/limitations
- **Not Proven** — Evidence contradicts claim, or claim cannot be verified from repository

---

## Claims Register

### C-001 — "Factory Accuracy ≈ 94%"

| Field | Value |
|-------|-------|
| **Claim** | Factory accuracy ≈94% on Shalfa pilot TB |
| **Source** | PR #5 body, `shalfa-live-validation.json`, `FACTORY_ACCURACY_AUDITED_FS_V4.md` |
| **Verdict** | **Partially Proven** |
| **Evidence** | `shalfa-live-validation.json` shows `scores.factoryAccuracy: 94` with 578 accounts. Scores breakdown: structural=70, economic=100, lineItem=100. Net profit variance is 0.0015%. |
| **Caveats** | 1. Accuracy is specific to one client's TB file (`TB 31-12-2025 Final.xlsx`) not in repository. 2. Sanitized evidence removed account-level detail — exact reproduction requires specific TB_FILE env var. 3. Generalization holdout (Phase 3B.1) shows only 46% on unseen accounts — the 94% includes firm memory which has seen all accounts. 4. The "structural" score of 70 (out of 100) indicates some structural differences remain. |
| **Reproducible** | Partially — requires Shalfa TB file + seeded engagement + `npm run shalfa:validate` |

---

### C-002 — "Firm Memory 100%"

| Field | Value |
|-------|-------|
| **Claim** | Firm memory achieves 100% accuracy (578/578 exact matches) |
| **Source** | `phase-3c-firm-memory-validation.json`, `PHASE_3C_FIRM_MEMORY_VALIDATION.md` |
| **Verdict** | **Proven** |
| **Evidence** | `phase-3c-firm-memory-validation.json` shows `accuracy: 1`, `exact: 578`, `missed: 0`. All 578 Shalfa accounts have stored patterns. |
| **Caveats** | 1. 100% accuracy is MEMORY-ONLY — it measures pattern lookup, not generalization. Every account was seen during the backfill. 2. 0 accounts qualify for auto-suggest (`autoSuggestEligible: 0`) meaning no pattern has sufficient confidence (`>0.85`) or reviewer count (`≥2`) for unsupervised reuse. 3. All 578 patterns are in "CONFIRMED" status, 0 in "TRUSTED". |
| **Reproducible** | Yes — `npm run phase-3c:validate` against seeded Shalfa engagement |

---

### C-003 — "TB Intelligence Pipeline (ADR-001)"

| Field | Value |
|-------|-------|
| **Claim** | ADR-001 pipeline with firm memory → rules → pattern → local AI → cloud AI ordering |
| **Source** | `engine.ts`, `ADR-001-AI-RUNTIME-STRATEGY.md` |
| **Verdict** | **Proven** |
| **Evidence** | `engine.ts:classifyTrialBalanceAccount` implements the ADR-001 pipeline ordering. Each stage is an independent function. Code confirmed at lines 72-180. |
| **Caveats** | 1. No direct unit tests verifying the pipeline ordering (only integration test). 2. Engine does not have `import "server-only"` guard. 3. Local AI and Cloud AI branches lack dedicated integration tests. |
| **Reproducible** | Yes — `tb-upload-mapping-fs.integration.test.ts` tests the full pipeline |

---

### C-004 — "7 Prisma Migrations (Additive Only)"

| Field | Value |
|-------|-------|
| **Claim** | 7 new migrations, all additive (CREATE TABLE / ADD COLUMN) |
| **Source** | PR #5 body, `MIGRATION_WALKTHROUGH.md` |
| **Verdict** | **Partially Proven** |
| **Evidence** | 7 migrations confirmed: `20260609`, `20260613`, `20260614x3`, `20260615`. All are CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS. **However**, migration #4 (`20260614130000`) inserts seed data (2 system policies) via INSERT — this is non-idempotent if run multiple times despite ON CONFLICT DO NOTHING. |
| **Caveats** | 1. `LeadSchedule` model has no migration (see R-001). 2. Migration #4 has hardcoded IDs (`pol-generic-v1`, `pol-shalfa-pilot-audited-v1`) that could conflict with future migrations. 3. Reporting graph migration had index drift requiring manual SQL repair on staging. |
| **Reproducible** | Partially — known drift on fresh databases for LeadSchedule |

---

### C-005 — "235+ Targeted AuditOS Unit Tests"

| Field | Value |
|-------|-------|
| **Claim** | 235+ targeted AuditOS unit tests pass |
| **Source** | PR #5 body |
| **Verdict** | **Partially Proven** |
| **Evidence** | `test-output.txt` from archive shows Jest tests passing across the full suite. TB Intelligence has ~39 tests, Presentation/FS/Governance have ~60 assertions. The full suite (including non-AuditOS Platform tests) likely exceeds 235. |
| **Caveats** | 1. "235+ targeted AuditOS" may include non-AuditOS tests in the count. 2. 13 critical AuditOS functions have ZERO test coverage. 3. The test count includes many new Platform tests (content-studio: 10 tests, org-adv: 14 tests, etc.) that are not AuditOS-specific. |
| **Reproducible** | Yes — `npm test` |

---

### C-006 — "Build PASS, tsc --noEmit PASS"

| Field | Value |
|-------|-------|
| **Claim** | Production build and TypeScript both pass |
| **Source** | PR #5 body, staging validation report |
| **Verdict** | **Proven** |
| **Evidence** | `build-output.txt` shows Next.js 16.2.4 build completing in ~111s. `tsc-output.txt` shows zero errors. Staging validation confirms both. |
| **Caveats** | Build was on local Windows environment, not on CI Ubuntu or staging RDS. |
| **Reproducible** | Yes — `npm run build` and `npx tsc --noEmit` |

---

### C-007 — "Phase 3B.1 Holdout: 46% Accuracy on Unseen Accounts"

| Field | Value |
|-------|-------|
| **Claim** | Holdout evaluation shows 46% accuracy on unseen accounts |
| **Source** | `phase-3b1-holdout-validation.json`, `PHASE_3B1_HOLDOUT_REPORT.md` |
| **Verdict** | **Proven** |
| **Evidence** | `phase-3b1-holdout-validation.json` shows `holdout.accuracy: 0.4609375` with 128 unseen accounts. 450 train, 128 holdout. Sorted by GL code. |
| **Caveats** | 1. The split method ("Sorted by GL account code ascending; first 450 = train, next 128 = hold-out") is not randomized — this could produce non-representative splits if GL codes have ordering bias. 2. Only deterministic rules (prefix, Map1, Map2, name pattern) were evaluated — no AI assist. 3. This is the truthful number that should be cited alongside the 94% factory accuracy. |
| **Reproducible** | Yes — `scripts/phase-3b1-holdout-validation.ts` |

---

### C-008 — "Phase 3B.2 Stratified Holdout"

| Field | Value |
|-------|-------|
| **Claim** | Stratified holdout by category |
| **Source** | `phase-3b2-stratified-holdout.json`, `PHASE_3B2_STRATIFIED_HOLDOUT_REPORT.md` |
| **Verdict** | **Proven** |
| **Evidence** | `phase-3b2-stratified-holdout.json` shows 80/20 stratified split within each category. 462 train, 116 test. |
| **Caveats** | Same caveat as Phase 3B.1 — deterministic rules only, no AI. |
| **Reproducible** | Yes — `scripts/phase-3b2-stratified-holdout.ts` |

---

### C-009 — "Shalfa Pilot Setup + Validation"

| Field | Value |
|-------|-------|
| **Claim** | Shalfa pilot setup and validation both pass |
| **Source** | PR #5 body, `SHALFA_PILOT_ROLLOUT.md`, `SHALFA_PILOT_SIGNOFF.md` |
| **Verdict** | **Proven** |
| **Evidence** | `factory-pilot-full-run-2026-06-13.txt` shows full pilot run output. `shalfa-pilot-setup.json` shows 211 TB lines. Live validation shows 94% factory accuracy. |
| **Caveats** | 1. Setup uses a truncated TB file (211 lines vs full 578). 2. Evidence files sanitized — account-level detail removed. 3. Requires local DB with specific seed data. |
| **Reproducible** | Partially — requires TB_FILE env + seeded Shalfa engagement |

---

### C-010 — "Phase 3D Governance: 0 TRUSTED (Expected)"

| Field | Value |
|-------|-------|
| **Claim** | After backfill, 0 patterns are TRUSTED, all are CONFIRMED — expected behavior |
| **Source** | `phase-3d-governance-validation.json`, `PHASE_3D_GOVERNANCE_VALIDATION.md` |
| **Verdict** | **Proven** |
| **Evidence** | `phase-3d-governance-validation.json` shows `storedStatusCounts.CONFIRMED: 578`, `TRUSTED: 0`, `DEPRECATED: 0`. Governance validation confirms `storedStatusMismatch: 0`. |
| **Caveats** | 1. All patterns backfilled as CONFIRMED — none meet TRUSTED criteria (hitCount≥5, ≥2 reviewers). 2. This is correct for a fresh backfill but means every classification still requires human review. 3. No aging-based DRAFT transitions — stale patterns may never be re-evaluated. |
| **Reproducible** | Yes — `npm run phase-3d:validate` |

---

### C-011 — "Staging Validation Substantially Passed"

| Field | Value |
|-------|-------|
| **Claim** | All local staging gates pass |
| **Source** | `STAGING_VALIDATION_REPORT.md` |
| **Verdict** | **Partially Proven** |
| **Evidence** | Report documents PASS for: migrations (after drift fix), build, tsc, factory smoke (33 checks), live smoke (39 graph nodes), post-deploy smoke (29/29), Shalfa validate (94%). |
| **Caveats** | 1. Migrations FAILED on first attempt — enum drift required manual `migrate resolve`. 2. Reporting graph indexes were MISSING — required manual SQL repair. 3. LeadSchedule migration gap documented as "known gap" — not fixed. 4. Validation was on local Windows PostgreSQL, not on staging RDS. 5. AWS credentials blocker prevented actual staging deploy. |
| **Reproducible** | Yes (with documented manual intervention steps) |

---

### C-012 — "PR #5 is AuditOS Factory Program"

| Field | Value |
|-------|-------|
| **Claim** | PR #5 is primarily an AuditOS Factory PR with TB Intelligence, Firm Memory, and Presentation Engine |
| **Source** | PR #5 title: "feat(auditos): factory memory program" |
| **Verdict** | **Not Proven** |
| **Evidence** | `PR_DECOMPOSITION.md` shows commit `58e4021` contains 32,101 LOC of Platform/Integration code (94.3%) vs 778 LOC of AuditOS code (2.3%). The PR includes institutional memory, content studio, org advanced, sales intelligence, ABAC, audit risk, secrets management, cross-product AI, sampling, office AI assistant, and decision governance — none of which are AuditOS Factory. |
| **Caveats** | 1. The Platform code may have legitimately been developed alongside AuditOS work and is correctly included. 2. The PR body lists Platform L0 as "review last." 3. However, the PR title and description understate the non-AuditOS scope by ~40x. |
| **Reproducible** | Yes — `git diff --stat` confirms 118956 additions across 602 files |

---

### C-013 — "CI Enables Full Test Suite"

| Field | Value |
|-------|-------|
| **Claim** | CI pipeline runs tsc, npm test, npm run lint, and npm run build |
| **Source** | `.github/workflows/ci.yml` diff |
| **Verdict** | **Proven** |
| **Evidence** | `git diff main...HEAD -- .github/workflows/ci.yml` shows addition of `npm test` and `npm run lint` steps alongside existing `tsc` and `build`. |
| **Caveats** | 1. CI does not run on PR branch yet (not yet merged to main). 2. No security scanning. 3. Test environment has no PostgreSQL — tests requiring DB will fail. |
| **Reproducible** | Yes — CI workflow file |

---

### C-014 — "Memory Governance with Status Lifecycle"

| Field | Value |
|-------|-------|
| **Claim** | Firm memory patterns have governed lifecycle: DRAFT → CONFIRMED → TRUSTED → DEPRECATED |
| **Source** | `firm-memory-governance.ts`, `PHASE_3D_MEMORY_GOVERNANCE.md` |
| **Verdict** | **Proven** |
| **Evidence** | `firm-memory-governance.ts` implements all four statuses with transition rules. `evaluatePatternGovernance` computes target status based on hitCount, freshness, and reviewer count. Transition logic is well-tested (5 governance tests + 3 lifecycle tests). |
| **Caveats** | 1. All 578 patterns are currently CONFIRMED (none TRUSTED, none DEPRECATED). 2. The governance transition functions are pure and well-tested, but the end-to-end workflow (who triggers re-evaluation, how often) is not tested. 3. Schema default is `@default(CONFIRMED)` which may skip DRAFT for new patterns. |
| **Reproducible** | Yes — `firm-memory-governance.test.ts` + `firm-memory-lifecycle.test.ts` |

---

### C-015 — "Local AI Phase 0 Deferred"

| Field | Value |
|-------|-------|
| **Claim** | Local AI is Phase 0, deferred, not a commercial moat |
| **Source** | `AUDITOS_PROGRAM_STATUS.md`, `LOCAL_AI_PHASE0_REPORT.md` |
| **Verdict** | **Proven** |
| **Evidence** | `local-ai-phase0-smoke.json` shows local AI smoke test results. `LOCAL_AI_IMPLEMENTATION_PLAN.md` and `LOCAL_AI_READINESS_AUDIT.md` describe Phase 0 as exploratory. AuditOS program status explicitly lists Local AI as "deferred." |
| **Caveats** | None — deferred status is honestly documented. |
| **Reproducible** | N/A |

---

### C-016 — "NPM Run Build Succeeds"

| Field | Value |
|-------|-------|
| **Claim** | Production build completes without errors |
| **Source** | PR #5 body, staging validation report |
| **Verdict** | **Proven** |
| **Evidence** | `archive/recovery-artifacts/runtime-logs/docs-audits-evidence/build-output.txt` shows successful Next.js build. Staging validation confirms PASS. |
| **Caveats** | Local Windows build. CI Ubuntu or staging RDS build not yet verified. |
| **Reproducible** | Yes — `npm run build` |

---

### C-017 — "Security: Strong Server-Action Pattern"

| Field | Value |
|-------|-------|
| **Claim** | All actions follow `getAuditActor → requireRole → assertEngagementAccess → audit log` |
| **Source** | Security audit findings, code review |
| **Verdict** | **Partially Proven** |
| **Evidence** | Majority of server actions follow this pattern. Audit confirmed consistent pattern across `audit-actions.ts`, `audit-export-actions.ts`, `audit-factory-map-actions.ts`, etc. |
| **Caveats** | 1. `audit-knowledge-actions.ts` is missing tenant isolation (see R-005). 2. `isAuditIntelligenceEnabledAction` has no auth at all. 3. `audit-intelligence-actions.ts` allows `viewer` role to run intelligence. |
| **Reproducible** | Yes — code review confirms |

---

### C-018 — "Audit Trail: SHA-256 Hash Chain"

| Field | Value |
|-------|-------|
| **Claim** | Immutable audit trail with SHA-256 hashing and proof-of-work |
| **Source** | `src/lib/platform/audit/hash-chain.ts` |
| **Verdict** | **Proven** |
| **Evidence** | `hash-chain.ts` implements SHA-256 hashing with nonce proof-of-work (2-zero prefix). `audit-store.ts` provides CRUD for audit events. `verification.ts` provides full chain verification and offline proof export. |
| **Caveats** | 1. `findNonce` has no max iterations safeguard. 2. `verifyAuditRange` passes `where` as `Record<string, unknown>` (type escape). 3. No persistence testing for the hash chain. |
| **Reproducible** | Yes — `hash-chain.test.ts` |

---

### C-019 — "RBAC: Role-Based Access on All Mutations"

| Field | Value |
|-------|-------|
| **Claim** | Every data mutation has RBAC enforcement |
| **Source** | Security audit, code review |
| **Verdict** | **Partially Proven** |
| **Evidence** | All audited server actions use `requireRole()`. The pattern is consistently applied. |
| **Caveats** | RBAC at action level is strong, but `routeMinRoles` in middleware has gaps — some API routes (`/api/sunbul/`, `/api/integration/`, `/api/custom-product-submit`) are not listed in middleware RBAC. |
| **Reproducible** | Yes — code review confirms |

---

### C-020 — "Presentation Engine with Profile + Policy Management"

| Field | Value |
|-------|-------|
| **Claim** | Presentation profiles and policies are fully implemented |
| **Source** | `presentation-profile.ts`, `presentation-policy-service.ts` |
| **Verdict** | **Proven** |
| **Evidence** | Profile management (`presentation-profile.ts`, Score 9/10) is well-implemented and well-tested. Policy service (`presentation-policy-service.ts`) provides full CRUD. Two system policies seeded. |
| **Caveats** | 1. Policy service has no transaction safety (see R-008). 2. `engagement-presentation-config.ts` has zero test coverage. 3. Policy resolver has hardcoded magic string IDs. 4. Only 2 policies exist — future policies require code changes to `presentation-policy-types.ts`. |
| **Reproducible** | Yes — `presentation-policy.test.ts` and `presentation-profile.test.ts` |

---

## Summary

| ID | Claim | Verdict | Confidence |
|----|-------|---------|------------|
| C-001 | Factory Accuracy ≈ 94% | **Partially Proven** | Medium — client-specific, non-reproducible without TB file |
| C-002 | Firm Memory 100% | **Proven** | High — confirmed by evidence artifact |
| C-003 | ADR-001 Pipeline | **Proven** | High — confirmed by code review |
| C-004 | 7 Additive Migrations | **Partially Proven** | Medium — LeadSchedule missing, index drift documented |
| C-005 | 235+ AuditOS Tests | **Partially Proven** | Low — count likely includes Platform tests |
| C-006 | Build + tsc PASS | **Proven** | High — multiple evidence artifacts |
| C-007 | Holdout 46% | **Proven** | High — confirmed by evidence artifact |
| C-008 | Stratified Holdout | **Proven** | High — confirmed by evidence artifact |
| C-009 | Shalfa Pilot Setup | **Proven** | Medium — requires TB_FILE to reproduce |
| C-010 | Phase 3D Governance | **Proven** | High — confirmed by evidence artifact |
| C-011 | Staging Substantially Passed | **Partially Proven** | Medium — two failures required manual fix |
| C-012 | PR #5 is AuditOS-only | **Not Proven** | High confidence — 94.3% of 58e4021 is Platform code |
| C-013 | CI Full Test Suite | **Proven** | High — confirmed by diff |
| C-014 | Memory Governance Lifecycle | **Proven** | High — well-tested pure functions |
| C-015 | Local AI Deferred | **Proven** | High — honestly documented |
| C-016 | Build Succeeds | **Proven** | High — multiple evidence artifacts |
| C-017 | Strong Server-Action Pattern | **Partially Proven** | Medium — knowledge actions gap found |
| C-018 | SHA-256 Hash Chain | **Proven** | High — confirmed by code review |
| C-019 | RBAC on All Mutations | **Partially Proven** | Medium — middleware RBAC gaps |
| C-020 | Presentation Engine | **Proven** | High — code + tests confirmed |

---

## Proven Claims: 11 of 20
## Partially Proven: 6 of 20 (C-001, C-004, C-005, C-011, C-017, C-019)
## Not Proven: 1 of 20 (C-012 — scope misrepresentation)
## Deferred: 2 of 20 (C-007, C-008 — confirms what was claimed)

---

## Pattern Analysis

### Overclaimed
- **C-012** — PR scope representation. 94.3% Platform code, not primarily AuditOS Factory.
- **C-005** — "235+ targeted AuditOS tests" likely includes non-AuditOS tests.
- **C-001** — 94% accuracy is real but client-specific. Generalization not proven.

### Accurately Claimed
- **C-002, C-003, C-006, C-007, C-008, C-010, C-013, C-014, C-015, C-016, C-018, C-020** — claims match repository evidence.

### Underclaimed
- **The Platform/infrastructure work** (32,101 LOC in commit 58e4021) is significant engineering but not called out in PR scope.
- **Security patterns** — the consistent server-action pattern is genuinely strong but not highlighted.

### Missing From Claims
- Cash flow builder limitations
- Governance bypass path
- LeadSchedule migration gap
- IFRS/SOCPA over-citation
- Cross-engagement pattern matching behavior
