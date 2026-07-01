# AQLIYA — 90-Day Enterprise Stabilization & Production Readiness Roadmap
**Version 1.0 | Issued: 2026-06-24**
**Classification: Internal — Engineering Leadership & Executive**

---

## Mission

Deliver a measurably more stable, secure, maintainable, and enterprise-ready AQLIYA platform within 90 days — without creating new products, expanding product scope, or adding speculative features.

Every action in this roadmap is grounded in Phase 0 repository reality. All findings referenced herein have evidence in `docs/phase0/`.

---

## Guiding Principles

1. **Consolidation over expansion** — Prefer merging and deleting over adding.
2. **Evidence first** — No phase closes without proof.
3. **Prefer measurable outcomes** — Every phase has concrete success criteria that can be verified by running commands or reading files.
4. **Minimal blast radius** — Prefer smallest correct change. No speculative refactors.
5. **Human decisions govern** — AI assists. No autonomous final decisions.
6. **Repository reality is truth** — Documentation claims are not accepted without code confirmation.

---

## Roles Responsible

| Role | Responsibility |
|---|---|
| Principal Software Architect | Architecture consolidation, dependency decisions, ADRs |
| Staff Engineer | Code-level execution of consolidations and fixes |
| Security Architect | Security program, ABAC enforcement, MFA policy |
| AI Platform Architect | AI evaluation framework, spend controls, observability |
| Platform Reliability Engineer | Infrastructure, DR drills, load testing, CI improvements |
| Governance Architect | Feature flag governance, taxonomy updates, audit trail coverage |
| Enterprise Architect | API versioning, DPA alignment, SOC2 readiness preparation |

---

## Phase Summary

| Phase | Days | Focus | Key Output |
|---|---|---|---|
| 0 | 1–7 | Full Reality Audit | 5 audit documents (complete) |
| 1 | 8–21 | Architecture Consolidation | Reduced duplication, ADRs |
| 2 | 22–35 | Enterprise Authorization | ABAC enforcement, unified auth |
| 3 | 36–49 | Governance & Audit Consolidation | Feature flag registry, audit coverage |
| 4 | 50–63 | AI Production Readiness | Golden datasets, spend limits, observability |
| 5 | 64–75 | Security & Reliability | Security scan CI, DR drill, load tests |
| 6 | 76–84 | Repository Governance | Dead code removal, taxonomy cleanup |
| 7 | 85–90 | Executive Readiness Review | Scorecards, final report |

---

## Phase 0 — Full Reality Audit (Days 1–7) ✅ COMPLETE

**Status: DONE**

All five Phase 0 audit documents are complete and committed to `docs/phase0/`:

| Document | Location | Status |
|---|---|---|
| CURRENT_STATE_REPORT.md | docs/phase0/ | ✅ Complete |
| ARCHITECTURE_MAP.md | docs/phase0/ | ✅ Complete |
| DEPENDENCY_GRAPH.md | docs/phase0/ | ✅ Complete |
| TECHNICAL_DEBT_REGISTER.md | docs/phase0/ | ✅ Complete |
| ENTERPRISE_GAP_ANALYSIS.md | docs/phase0/ | ✅ Complete |

**Key findings from Phase 0:**

- **Scale**: 2,250 TS/TSX files, ~200 Prisma models, 260 pages, 62 API routes, 55 migrations
- **Architecture**: Three overlapping "core" layers (`src/core/`, `src/lib/core/`, `src/lib/platform/`) with incomplete migration
- **Critical defects**: ~30 TypeScript errors in SalesOS (schema drift, missing enum, type mismatches)
- **High debt**: Dead re-export layer (`lib/ai/`), decision module split (3 locations), sales version proliferation (v02 + vnext), duplicate marketing routes (`/en/`)
- **Security gaps**: ABAC disabled, MFA not universal, no automated security scanning in CI, ClamAV unverified in production
- **AI gaps**: No golden datasets, no hard spend limits, local AI unverified in production
- **Operations gaps**: No load tests, no confirmed DR drill, integration tests not in CI
- **Governance gaps**: 17+ feature flags with no registry, 4 active products undocumented in taxonomy

---

## Phase 1 — Architecture Consolidation Program (Days 8–21)

### Objective
Reduce architectural duplication, eliminate dead code layers, fix critical TypeScript errors, and establish clear module ownership boundaries.

### Tasks

#### 1.1 — Fix SalesOS TypeScript Errors (Critical — TD-001)
**Owner**: Staff Engineer
**Days**: 8–11

Steps:
1. Add `SALES_OS` to the product registry enum in the appropriate constants file
2. Fix form handler signatures in `deal-create-form.tsx`, `deal-stage-form.tsx`, `deal-status-form.tsx` — replace `FormData` with typed input objects
3. Fix `deal-follow-up-panel.tsx` — correct server action argument shapes
4. Resolve `@/components/platform/command-surface/metric-action-card` missing module
5. Reconcile `WaveAInstitutionalSignal`, `WaveCInstitutionalLearningView`, `MarketIntelligenceSnapshot` types against `v02/` definitions
6. Run `npx tsc --noEmit` — must pass zero errors

**Success criteria**: `npx tsc --noEmit` exits 0. No SalesOS TS errors in `.salesos-ts-errors.txt`.

#### 1.2 — Remove `src/lib/ai/` Re-Export Shell (TD-002)
**Owner**: Staff Engineer
**Days**: 12–14

Steps:
1. Grep all imports of `@/lib/ai` across the codebase
2. Migrate each import to `@/lib/core/ai`
3. Move test files from `src/lib/ai/__tests__/` to `src/lib/core/ai/__tests__/`
4. Delete `src/lib/ai/` directory
5. Run `npx tsc --noEmit` — verify no broken imports

**Success criteria**: `src/lib/ai/` deleted. Zero import references remain. TSC passes.

**ADR Required**: `docs/phase1/ADR-001-canonical-ai-import-path.md`

#### 1.3 — Consolidate Decision Module (TD-004)
**Owner**: Staff Engineer
**Days**: 15–17

Steps:
1. Merge `src/lib/decisions/export.ts` into `src/lib/decision/index.ts` or equivalent
2. Remove `src/lib/decisions/` directory
3. Update all imports
4. Document the split: `lib/core/decision/` = engine, `lib/decision/` = product layer

**Success criteria**: `src/lib/decisions/` deleted. TSC passes. Tests pass.

**ADR Required**: `docs/phase1/ADR-002-decision-module-boundary.md`

#### 1.4 — Audit `src/lib/rag/` vs `src/lib/core/knowledge/rag/` (TD-016)
**Owner**: Staff Engineer
**Days**: 15–17

Steps:
1. Read both directories fully
2. Determine if `src/lib/rag/` is a wrapper, a duplicate, or unique logic
3. If wrapper: migrate imports, delete `src/lib/rag/`
4. If unique: document what `src/lib/rag/` adds that `lib/core/knowledge/rag/` does not

**Success criteria**: Single RAG implementation, or documented reason for two.

#### 1.5 — Document SalesOS Version Strategy (TD-006)
**Owner**: Principal Software Architect
**Days**: 18–21

Steps:
1. Read `src/lib/sales/v02/` and `src/lib/sales/vnext/` fully
2. Map which features are in each version tier
3. Define a merge plan: what is the target state of `lib/sales/` post-Phase-1?
4. Write `docs/phase1/SALES_MODULE_CONSOLIDATION_PLAN.md`
5. Begin migration — merge `vnext/` features into base, remove `vnext/` if possible

**Success criteria**: `SALES_MODULE_CONSOLIDATION_PLAN.md` committed. At minimum, `vnext/` merged into base or formally gated by a feature flag.

#### 1.6 — Fix Migration Timestamp Year 2027 (TD-007)
**Owner**: Staff Engineer
**Days**: 8–9

Steps:
1. Document the 8 affected migration file names in `AGENTS.md` or `docs/phase1/`
2. Evaluate whether renaming is safe at this point (requires team coordination)
3. If naming is kept: add comment to `migration_lock.toml` noting the intentional year
4. Add `.gitignore`-level guard or linting rule to catch future timestamp mistakes

**Success criteria**: Issue documented. Team aware. Future migration naming standard enforced.

### Deliverables

- `docs/phase1/ADR-001-canonical-ai-import-path.md`
- `docs/phase1/ADR-002-decision-module-boundary.md`
- `docs/phase1/SALES_MODULE_CONSOLIDATION_PLAN.md`
- `docs/phase1/ARCHITECTURE_CONSOLIDATION_PLAN.md` — summary of all changes made

### Validation

```bash
npx tsc --noEmit          # Must pass: 0 errors
npm run lint               # Must pass
npm test                   # Must pass: all unit tests green
```

### Success Criteria

- `npx tsc --noEmit` exits 0 (including SalesOS)
- `src/lib/ai/` directory removed
- `src/lib/decisions/` directory removed
- SalesOS v02/vnext strategy documented and at least one version tier merged
- Complexity reduction measurable: fewer directories, fewer duplicate export surfaces

---

## Phase 2 — Enterprise Authorization Program (Days 22–35)

### Objective
Complete the authorization consolidation, validate tenant isolation, and enable ABAC enforcement in shadow → staging → production progression.

### Tasks

#### 2.1 — Complete `src/core/access/` Migration (TD-005)
**Owner**: Staff Engineer
**Days**: 22–25

Steps:
1. Audit all imports of `src/core/access/` across the codebase
2. Map each to its canonical replacement in `src/lib/authorization/`
3. For anything not yet in `src/lib/authorization/`, migrate the logic
4. Archive `src/core/access/` — move to `archive/` or delete
5. Run all authorization tests: `src/lib/authorization/__tests__/` and `src/core/access/__tests__/`

**Success criteria**: `src/core/access/` removed from active codebase. All auth tests pass.

**ADR Required**: `docs/phase2/ADR-003-authorization-consolidation.md`

#### 2.2 — ABAC Shadow Mode Audit (G-SEC-001)
**Owner**: Security Architect
**Days**: 22–27

Steps:
1. Enable `FF_ABAC_SHADOW=true` in staging if not already active
2. Run `src/core/access/abac-shadow-report.ts` tooling against staging data
3. Review all shadow denials — classify as: false positive, correct denial, policy gap
4. Document policy gaps in `docs/phase2/ABAC_SHADOW_AUDIT.md`
5. Resolve false positives in policy definitions

**Success criteria**: Shadow audit complete. `ABAC_SHADOW_AUDIT.md` committed. Zero false positives in shadow mode for core product flows.

#### 2.3 — Enable ABAC Enforcement on High-Risk Routes (G-SEC-001)
**Owner**: Security Architect
**Days**: 28–33

Steps:
1. Based on 2.2 findings, identify top-5 routes where ABAC adds most security value
2. Enable `FF_ABAC_ENFORCE=true` scoped to those routes (or organization IDs via `ABAC_ENFORCE_ORG_IDS`)
3. Run smoke tests: `npm run smoke:tier2`
4. Monitor for denial incidents

**Success criteria**: ABAC enforcement active for at least 5 high-risk route prefixes. Zero false-denial incidents in smoke tests.

#### 2.4 — Tenant Isolation Verification (G-GOV-005 partial)
**Owner**: Security Architect + Staff Engineer
**Days**: 28–35

Steps:
1. Run `npm run cross-tenant-isolation` test suite (already exists)
2. Extend tests to cover SalesOS, ContentStudio, LocalContactOS
3. Verify that `checkTenantAccess()` is called in all critical server actions across products
4. Write `docs/phase2/TENANT_ISOLATION_VERIFICATION.md`

**Success criteria**: Cross-tenant isolation test suite covers all 8 products. All pass.

#### 2.5 — MFA Policy Documentation
**Owner**: Security Architect
**Days**: 22–24

Steps:
1. Document current MFA enforcement rules (which roles require MFA)
2. Assess whether all production users in sensitive roles have MFA enrolled
3. Write recommendation for universal MFA requirement (for Phase 5 implementation)
4. Document in `docs/phase2/MFA_POLICY.md`

**Success criteria**: `MFA_POLICY.md` committed. Clear recommendation for Phase 5.

### Deliverables

- `docs/phase2/ADR-003-authorization-consolidation.md`
- `docs/phase2/ABAC_SHADOW_AUDIT.md`
- `docs/phase2/TENANT_ISOLATION_VERIFICATION.md`
- `docs/phase2/MFA_POLICY.md`
- `docs/phase2/AUTHORIZATION_AUDIT.md` — overall authorization state

### Validation

```bash
npx tsc --noEmit
npm run test:integration:setup && npm run test:integration
npm run cross-tenant-isolation    # (existing test)
npm run smoke:tier2
```

### Success Criteria

- `src/core/access/` removed or archived
- ABAC shadow mode reporting zero false positives
- ABAC enforcement active for at least 5 high-risk route prefixes
- Cross-tenant isolation tests cover all active products and pass
- Authorization consolidation ADR committed

---

## Phase 3 — Governance & Audit Consolidation (Days 36–49)

### Objective
Establish a feature flag registry, confirm audit trail completeness, resolve governance conflicts, and formalize the undocumented product taxonomy.

### Tasks

#### 3.1 — Feature Flag Registry (TD-011, G-GOV-001)
**Owner**: Governance Architect
**Days**: 36–40

Steps:
1. Create `docs/FEATURE_FLAGS.md` registry
2. For each of the 17+ `FF_*` flags, document: name, purpose, owner, current production state, intended expiry
3. Identify flags that have shipped and should be removed (hardcoded to true)
4. Add lint rule or PR check to catch new `FF_` env var additions without registry entry
5. Add `FEATURE_FLAGS.md` to `CLAUDE.md` required reading list

**Success criteria**: Every `FF_*` flag has an entry in `docs/FEATURE_FLAGS.md`. At least 2 shipped flags removed (hardcoded, then env var removed).

#### 3.2 — Update Product Taxonomy (G-GOV-002)
**Owner**: Governance Architect
**Days**: 36–39

Steps:
1. Add ContentStudio, Institutional Memory, Sampling, and Knowledge Foundation to `CLAUDE.md` taxonomy table
2. Assign maturity levels based on code reality (not aspiration)
3. Define route governance rules for each (demo vs workspace, auth requirements)
4. Update `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`

**Success criteria**: All active products appear in `CLAUDE.md` taxonomy. `PRODUCT_STATUS_MATRIX.md` updated.

#### 3.3 — Audit Trail Coverage Verification (G-GOV-005)
**Owner**: Governance Architect + Staff Engineer
**Days**: 40–46

Steps:
1. For each product (AuditOS, LocalContentOS, DecisionOS, WorkflowOS, SalesOS, ContentStudio, LocalContactOS), identify all mutation paths (server actions + API routes)
2. Verify each path writes to `PlatformAuditLog` or equivalent
3. Document gaps
4. Fix gaps (add audit log writes where missing)
5. Write `docs/phase3/AUDIT_TRAIL_COVERAGE.md`

**Success criteria**: All mutation paths verified. `AUDIT_TRAIL_COVERAGE.md` committed. Zero uncovered high-risk mutations.

#### 3.4 — Retention Policy Consolidation (TD-012)
**Owner**: Staff Engineer
**Days**: 40–44

Steps:
1. Read both `src/lib/core/policy/retention/` and `src/lib/platform/retention/` fully
2. Determine which is authoritative
3. Merge into one canonical location
4. Update all imports
5. Run retention policy tests

**Success criteria**: Single retention policy location. All tests pass.

#### 3.5 — SIEM Delivery Verification (G-SEC-004)
**Owner**: Platform Reliability Engineer
**Days**: 44–49

Steps:
1. Trace `outbox-siem-handler.ts` → `lib/platform/siem/delivery.ts` execution path
2. Verify `FF_EVENT_OUTBOX` is enabled in production
3. Confirm SIEM events are being delivered (check delivery logs or external SIEM receipt)
4. Write `docs/phase3/SIEM_DELIVERY_VERIFICATION.md`

**Success criteria**: SIEM delivery confirmed or gap formally documented with remediation plan.

#### 3.6 — API Versioning Strategy (G-ENT-003)
**Owner**: Enterprise Architect
**Days**: 36–40

Steps:
1. Audit the 62 API routes — categorize: internal-only, product API, public API
2. Define versioning strategy for externally-used APIs
3. Write `docs/phase3/API_VERSIONING_STRATEGY.md`
4. Implement `/api/v1/` prefix for at minimum the top-5 externally-used routes

**Success criteria**: `API_VERSIONING_STRATEGY.md` committed. Versioning decision made.

### Deliverables

- `docs/FEATURE_FLAGS.md` — full flag registry
- `docs/phase3/AUDIT_TRAIL_COVERAGE.md`
- `docs/phase3/SIEM_DELIVERY_VERIFICATION.md`
- `docs/phase3/API_VERSIONING_STRATEGY.md`
- `docs/phase3/GOVERNANCE_REVIEW.md` — overall governance state

### Validation

```bash
npx tsc --noEmit
npm test
npm run smoke:tier2
npm run smoke:tier3:http
```

### Success Criteria

- Every `FF_*` flag documented in registry
- All active products in taxonomy
- Audit trail verified for all product mutation paths
- Single retention policy implementation
- SIEM delivery confirmed or gap formally documented

---

## Phase 4 — AI Production Readiness Program (Days 50–63)

### Objective
Make every AI workflow measurable. Establish evaluation baselines, enforce spend limits, confirm local AI status, and export observability to external systems.

### Tasks

#### 4.1 — Create AI Golden Datasets (G-AI-001)
**Owner**: AI Platform Architect
**Days**: 50–56

Steps:
1. Identify the top 5 AI workflows by volume/importance: trial balance classification, decision recommendation, local content scoring, knowledge mining, office AI extraction
2. For each workflow, create a golden dataset: 20–50 input/output pairs that represent correct behavior
3. Commit datasets to `src/lib/ai/eval/suites/[workflow]/golden.json`
4. Wire each dataset into `eval-runner.ts` as a regression test suite
5. Add eval runner to CI with `npm run eval:skills` (already exists)

**Success criteria**: 5 golden datasets committed. `npm run eval:skills:mock` passes all suites.

#### 4.2 — Enforce AI Spend Hard Limits (G-AI-002)
**Owner**: AI Platform Architect
**Days**: 50–55

Steps:
1. Audit `budget-manager.ts` — determine if it currently blocks or only tracks
2. If tracking only: add rejection logic — return error when org budget is exceeded
3. Set default budget limits per org tier
4. Add test: budget exceeded → AI call rejected → error surfaced to user
5. Document in `docs/phase4/AI_SPEND_CONTROLS.md`

**Success criteria**: AI calls rejected when budget exceeded. Tests confirm rejection. Hard limits documented.

#### 4.3 — AI Observability → External Export (G-AI-004)
**Owner**: AI Platform Architect + Platform Reliability Engineer
**Days**: 55–60

Steps:
1. Instrument `observability.ts` to emit metrics to CloudWatch (or equivalent)
2. Create CloudWatch dashboard for: AI latency p50/p95, error rate by provider, token consumption by org, cost per workflow
3. Configure CloudWatch alarms: AI latency p95 > 5s, error rate > 5%, daily cost > threshold
4. Document in `docs/phase4/AI_OBSERVABILITY_SETUP.md`

**Success criteria**: AI metrics visible in CloudWatch. At least 3 alarms configured.

#### 4.4 — Confirm or Disable Local AI (G-AI-003)
**Owner**: AI Platform Architect
**Days**: 56–60

Steps:
1. Check production ECS task definition — is Ollama running as a sidecar or separate service?
2. If not running: set `AI_LOCAL_BASE_URL` as intentionally unset in production and document
3. If intended to run: add Terraform/Docker configuration for local AI sidecar
4. Update `CLAUDE.md` accordingly: "Local AI: [deployed / not deployed]"

**Success criteria**: Local AI status is definitively documented. Marketing does not claim a capability that isn't deployed.

#### 4.5 — Per-Tenant AI Rate Limiting (G-SEC-006)
**Owner**: AI Platform Architect
**Days**: 58–63

Steps:
1. Add per-organization rate limiting to AI API endpoints (`/api/ai/*`)
2. Use existing Redis rate limiter infrastructure
3. Set configurable limits (requests/minute per org)
4. Test that one org's high-volume requests do not affect another org

**Success criteria**: Per-tenant AI rate limit enforced. Tests confirm isolation.

### Deliverables

- `src/lib/ai/eval/suites/[5 workflows]/golden.json`
- `docs/phase4/AI_SPEND_CONTROLS.md`
- `docs/phase4/AI_OBSERVABILITY_SETUP.md`
- `docs/phase4/AI_READINESS_REPORT.md` — overall AI maturity state
- `docs/phase4/AI_EVALUATION_FRAMEWORK.md` — eval process documentation

### Validation

```bash
npx tsc --noEmit
npm run eval:skills:mock     # All golden datasets pass
npm run smoke:tier2
```

### Success Criteria

- 5 golden datasets committed and passing
- AI spend hard limits enforced and tested
- AI metrics visible in CloudWatch with alarms
- Local AI status definitively resolved and documented
- Per-tenant AI rate limiting active

---

## Phase 5 — Security & Reliability Program (Days 64–75)

### Objective
Close the most critical security gaps, confirm disaster recovery, add load testing baselines, fix CI test infrastructure, and begin SOC2 readiness preparation.

### Tasks

#### 5.1 — Security Scanning in CI (G-SEC-003)
**Owner**: Security Architect
**Days**: 64–67

Steps:
1. Add `npm audit --audit-level=high` to `ci.yml` — fail on high-severity CVEs
2. Add `truffleHog` or `gitleaks` to CI for secret scanning
3. Evaluate adding a SAST tool (e.g., CodeQL via GitHub Actions — free for public/private repos)
4. Configure to not block on medium/low findings initially — report only
5. Document in `docs/phase5/SECURITY_SCANNING_SETUP.md`

**Success criteria**: `npm audit` and secret scanning run on every push. Zero high-severity CVEs unresolved.

#### 5.2 — ClamAV Production Verification (G-SEC-007)
**Owner**: Platform Reliability Engineer
**Days**: 64–66

Steps:
1. Check ECS task definition for ClamAV sidecar or separate service
2. If not deployed: add to Terraform/ECS configuration OR set `SCANNER_PROVIDER=none` and document the gap formally
3. Run `npm run platform:scanner-smoke` against staging
4. Document in `docs/phase5/CLAMAV_STATUS.md`

**Success criteria**: ClamAV status definitively confirmed. No silent scanning bypass.

#### 5.3 — Universal MFA Enforcement (G-SEC-002)
**Owner**: Security Architect
**Days**: 67–70

Steps:
1. Based on Phase 2 `MFA_POLICY.md`, implement universal MFA requirement for all roles
2. Test MFA bypass paths — confirm there are no gaps
3. Add MFA enrollment status check to user onboarding flow if not present
4. Run `npm run db:verify-mfa` (already exists)

**Success criteria**: All non-viewer roles required to complete MFA. `db:verify-mfa` passes.

#### 5.4 — Disaster Recovery Drill (G-OPS-002)
**Owner**: Platform Reliability Engineer
**Days**: 68–72

Steps:
1. Execute `npm run db:restore:drill` against staging environment
2. Measure and record: RTO (time to restore), RPO (data loss window)
3. Execute full application smoke test post-restore: `npm run smoke:tier2`
4. Document results in `docs/phase5/DR_DRILL_RESULTS.md`

**Success criteria**: DR drill executed, results documented. RTO and RPO measured.

#### 5.5 — Integration Tests in CI (G-OPS-003)
**Owner**: Platform Reliability Engineer
**Days**: 64–68

Steps:
1. Add PostgreSQL service container to `ci.yml` using `services:` block
2. Run `prisma migrate deploy` as a CI step
3. Add `npm run test:integration` to CI job
4. Fix any `--forceExit` issues by properly closing DB connections in test teardown (TD-015)

**Success criteria**: Integration tests run on every push to main/staging. Zero `--forceExit` dependency.

#### 5.6 — Load Testing Baseline (G-OPS-001)
**Owner**: Platform Reliability Engineer
**Days**: 70–75

Steps:
1. Select a load testing tool (k6 recommended — lightweight, scriptable)
2. Write baseline load test for top 3 critical paths: login → AuditOS engagement, LocalContentOS project load, DecisionOS decision view
3. Run against staging at 50, 100, 200 concurrent users
4. Record: throughput (req/s), p95 latency, error rate, ECS task count at saturation
5. Document in `docs/phase5/LOAD_TEST_BASELINE.md`

**Success criteria**: Load test suite committed. Baseline metrics documented. ECS scaling behavior confirmed.

#### 5.7 — Secrets Management Consolidation (G-SEC-005)
**Owner**: Security Architect
**Days**: 67–71

Steps:
1. Audit which secrets are stored as env vars vs. in the vault
2. Migrate the top 3 highest-risk secrets (AI API keys, AUTH_SECRET, database credentials) to vault or AWS Secrets Manager
3. Update deployment scripts to retrieve secrets at runtime, not bake-time
4. Document in `docs/phase5/SECRETS_MANAGEMENT_PLAN.md`

**Success criteria**: At least 3 critical secrets managed via vault/Secrets Manager (not hardcoded env vars in deployment configs).

### Deliverables

- `docs/phase5/SECURITY_SCANNING_SETUP.md`
- `docs/phase5/CLAMAV_STATUS.md`
- `docs/phase5/DR_DRILL_RESULTS.md`
- `docs/phase5/LOAD_TEST_BASELINE.md`
- `docs/phase5/SECRETS_MANAGEMENT_PLAN.md`
- `docs/phase5/SECURITY_REVIEW.md` — overall security state
- `docs/phase5/RELIABILITY_REVIEW.md` — overall reliability state

### Validation

```bash
npx tsc --noEmit
npm test                   # including integration tests in CI
npm run smoke:tier2
npm run smoke:tier3:http
npm run db:restore:drill
npm run backup:verify
```

### Success Criteria

- Security scanning (CVE + secrets) runs in CI
- ClamAV status confirmed
- Universal MFA for all non-viewer roles
- DR drill executed with documented RTO/RPO
- Integration tests run in CI
- Load test baseline committed
- At least 3 critical secrets in managed store

---

## Phase 6 — Repository Governance Program (Days 76–84)

### Objective
Measurably reduce repository complexity by removing dead code, archiving legacy surface area, cleaning up taxonomy conflicts, and enforcing naming conventions.

### Tasks

#### 6.1 — Remove `src/app/en/` Duplicate Routes (TD-003)
**Owner**: Staff Engineer
**Days**: 76–79

Steps:
1. Confirm with product/marketing team the intent of `/en/*` routes
2. If purely duplicate: add redirects from `/en/*` → `/*` in `next.config.mjs` for all 21 paths
3. Remove `src/app/en/` directory tree
4. Run marketing route tests: `npm run test -- --testPathPattern=marketing`

**Success criteria**: `src/app/en/` removed. 21 route redirects confirmed working. 0 broken links.

#### 6.2 — Remove `src/app/sunbul/` Live Pages (TD-008)
**Owner**: Staff Engineer
**Days**: 76–78

Steps:
1. Verify next.config.mjs redirect `/sunbul` → `/workflowos` is functioning
2. Remove `src/app/sunbul/` directory (page.tsx, admin/, clients/)
3. Verify redirect still works and no 404s result

**Success criteria**: `src/app/sunbul/` removed. Redirect confirmed. No 404s.

#### 6.3 — Resolve RiskOS Governance Conflict (TD-010, G-GOV-004)
**Owner**: Governance Architect + Principal Software Architect
**Days**: 76–80

Steps:
1. Decision required (from product leadership): RiskOS — keep or remove?
2. If keep: add to CLAUDE.md taxonomy as L2, assign owner, document route governance
3. If remove: delete `src/app/risk/`, remove middleware matcher entries, archive `src/lib/` risk code if any
4. Update `AGENTS.md` accordingly

**Success criteria**: RiskOS governance conflict resolved. Decision documented and implemented.

#### 6.4 — Remove `desktop.ini` Files (TD-014)
**Owner**: Staff Engineer
**Days**: 76–77

Steps:
1. Add `desktop.ini` to `.gitignore`
2. Run `git rm --cached $(git ls-files --ignored --exclude-standard | grep desktop.ini)`
3. Commit

**Success criteria**: All `desktop.ini` files removed from tracking. `.gitignore` updated.

#### 6.5 — Archive Diagnostic Scripts from Root
**Owner**: Staff Engineer
**Days**: 80–82

Steps:
1. Root-level files `_check.mjs`, `_check2.mjs`, `_check_db.mjs`, `_check_mig.mjs`, `_test_loader.cjs`, `kf-capture.mjs`, `kf-diag.mjs`, `kf-query-test.mjs`, `dev_server.log`, `*.log`, `*.png` (diagnostics) are development artifacts
2. Move diagnostic scripts to `scripts/diagnostics/` or remove
3. Move logs to `.local-cleanup/` or add to `.gitignore`
4. Remove diagnostic PNG screenshots from root

**Success criteria**: Repository root is clean. No debug artifacts at top level.

#### 6.6 — Audit `src/lib/simulation/` (TD-017)
**Owner**: Staff Engineer
**Days**: 80–82

Steps:
1. Read `src/lib/simulation/` fully
2. Determine if any active code imports from it
3. If unused: delete
4. If used by live features: document it

**Success criteria**: `src/lib/simulation/` either removed or documented with purpose.

### Deliverables

- `docs/phase6/REPOSITORY_GOVERNANCE_REPORT.md`
- `docs/phase6/REPOSITORY_SIMPLIFICATION_PLAN.md`

### Validation

```bash
npx tsc --noEmit
npm test
npm run smoke:tier2
# Measure: directory count before vs after
find src -type d | wc -l   # Should be measurably lower
```

### Success Criteria

- `src/app/en/` removed (21 directories eliminated)
- `src/app/sunbul/` live pages removed
- RiskOS conflict resolved
- `desktop.ini` files removed from git tracking
- Repository root cleaned of diagnostic artifacts
- Total directory count measurably reduced

---

## Phase 7 — Executive Readiness Review (Days 85–90)

### Objective
Produce a board-level assessment of the platform's maturity across all dimensions, with before/after comparisons and a prioritized 180-day forward roadmap.

### Tasks

#### 7.1 — Produce Scorecard Documents
**Owner**: Governance Architect + Principal Software Architect
**Days**: 85–89

For each scorecard, score on a 1–5 scale with evidence.

**Scorecards to produce:**

| Document | Owner |
|---|---|
| `PLATFORM_HEALTH_SCORECARD.md` | Principal Software Architect |
| `SECURITY_SCORECARD.md` | Security Architect |
| `AI_SCORECARD.md` | AI Platform Architect |
| `GOVERNANCE_SCORECARD.md` | Governance Architect |
| `OPERATIONS_SCORECARD.md` | Platform Reliability Engineer |
| `ENTERPRISE_READINESS_SCORECARD.md` | Enterprise Architect |

**Scoring dimensions per scorecard:**

- Score: 1 (critical gaps) → 5 (enterprise-ready)
- Before score: based on Phase 0 findings
- After score: based on work completed in Phases 1–6
- Remaining risks: what was not fixed in this 90-day window
- Confidence: High / Medium / Low (based on whether we have validation evidence)

#### 7.2 — Produce Executive Summary
**Owner**: Governance Architect
**Days**: 88–90

Steps:
1. Compile all scorecard results
2. Write `EXECUTIVE_SUMMARY.md` — non-technical, board-level narrative
3. Include: what we found, what we fixed, what remains, what to do in next 90 days

#### 7.3 — Produce Final Report
**Owner**: All
**Days**: 90

Produce `AQLIYA_ENTERPRISE_STABILIZATION_PROGRAM_FINAL_REPORT.md` in the repository root.

### Deliverables

All in `docs/phase7/`:
- `EXECUTIVE_SUMMARY.md`
- `PLATFORM_HEALTH_SCORECARD.md`
- `SECURITY_SCORECARD.md`
- `AI_SCORECARD.md`
- `GOVERNANCE_SCORECARD.md`
- `OPERATIONS_SCORECARD.md`
- `ENTERPRISE_READINESS_SCORECARD.md`

In repository root:
- `AQLIYA_ENTERPRISE_STABILIZATION_PROGRAM_FINAL_REPORT.md`

### Validation (Final)

```bash
npx tsc --noEmit           # Zero errors
npm run lint               # Zero errors
npm test                   # All tests pass
npm run smoke:tier2        # Smoke tests pass
npm run smoke:tier3:http   # Tier 3 smoke passes
npm run eval:skills:mock   # All AI eval suites pass
```

---

## Mandatory Validation Checkpoints

No phase closes without running and recording the output of:

| Command | Required Phase Completion Gate |
|---|---|
| `npx tsc --noEmit` | Every phase |
| `npm run lint` | Phase 1, 3, 5, 6 |
| `npm test` | Every phase |
| `npm run smoke:tier2` | Phase 2, 4, 5, 7 |
| `npm run smoke:tier3:http` | Phase 5, 7 |
| `npm run test:integration` | Phase 5+ (once CI integration tests are running) |
| `npm run eval:skills:mock` | Phase 4+ |
| `npm run db:restore:drill` | Phase 5 |

Evidence of each validation run must be committed to `docs/phaseN/validation-results.md`.

---

## Non-Negotiable Rules (Binding)

These rules apply to every person working in every phase:

1. **Do NOT create new products.** This program is consolidation-only.
2. **Do NOT add speculative features.** Every change must map to a specific gap in this roadmap.
3. **Do NOT inflate maturity levels.** If a feature is incomplete, document it as incomplete.
4. **Do NOT rewrite without evidence.** Every consolidation decision requires an ADR.
5. **Do NOT change Prisma schema speculatively.** Schema changes only if a concrete active feature requires it.
6. **Always prefer deletion over addition.**
7. **Always prefer shared services over duplication.**
8. **Never say validation passed unless the command ran and you have the output.**
9. **Preserve tenant isolation, RBAC, audit trails, and human review requirements at all times.**
10. **AI features must remain assistive only. No autonomous final decisions.**

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| SalesOS TS fix breaks runtime behavior | Medium | High | Full smoke test after each fix; no functional changes, types only |
| ABAC enforcement causes false denials in production | Medium | High | Shadow mode audit in Phase 2 before enforcement |
| Removing `lib/ai/` breaks imports not caught by TSC | Low | Medium | Grep all `@/lib/ai` imports before deletion |
| DR drill reveals RTO > acceptable threshold | Low | High | Staged drill starting in staging; fix before Phase 7 |
| Load test reveals capacity gap | Medium | High | Test in staging; scale before production load |
| Migration timestamp rename causes team conflict | Low | Medium | Document and communicate; rename optional |

---

## Recommended Next 90–180 Days (Post-Program)

Based on Phase 0 findings and expected Phase 0–7 outcomes, the following are recommended for the subsequent 90-day window:

1. **SOC2 Type II audit preparation** — Engage a SOC2 auditor. Evidence collection begins in months 4–6.
2. **On-Premises deployment package** — If commercial pipeline requires it. Terraform + Docker Compose offline package.
3. **Full ABAC enforcement** — Complete the enforcement rollout across all products.
4. **API v1 stabilization** — Lock the API surface for enterprise integrations.
5. **AI regression testing automation** — Run golden dataset evals nightly.
6. **Active-active multi-region** — Route read traffic to DR region replica.
7. **SalesOS stabilization to L5** — Fix remaining TypeScript, schema drift, complete feature set.
8. **ContentStudio and Institutional Memory formal L4 readiness** — Define readiness gates and complete them.

---

*Roadmap grounded in Phase 0 repository reality — 2026-06-24. All findings have evidence in `docs/phase0/`. No documentation was accepted as a source of truth without code confirmation.*
