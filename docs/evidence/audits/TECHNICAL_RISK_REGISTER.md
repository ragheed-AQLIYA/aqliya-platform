# Technical Risk Register — AuditOS Factory Program PR #5

**Audit:** Independent Technical Audit Council  
**Branch:** `auditos/factory-memory-2026-06`  
**Date:** 2026-06-15  
**Classification:** Internal — Audit Council Report

---

## Risk Scoring

| Score | Meaning | Action |
|-------|---------|--------|
| Critical (5) | Data loss, governance bypass, deployment blocker | Fix before merge |
| High (4) | Incorrect output, security vulnerability | Fix before production |
| Medium (3) | Missing coverage, degraded capability | Fix within 1 sprint |
| Low (2) | Cleanup, technical debt | Schedule |
| Info (1) | Observation, documentation gap | Document |

---

## Risk Register

### R-001 — LeadSchedule Table Has No Migration

| Field | Value |
|-------|-------|
| **ID** | R-001 |
| **Severity** | **Critical (5)** |
| **Status** | Open |
| **Component** | Prisma Migrations |
| **Description** | `LeadSchedule` model defined at `prisma/schema.prisma:4447` but no migration creates this table. Migration `20260613100000` creates `LeadScheduleLine` with FK to `LeadSchedule`. A fresh database deploy will fail. |
| **Evidence** | `Select-String -Pattern "CREATE TABLE.*LeadSchedule" -Path prisma/migrations/**/migration.sql` returns no results. Staging validation report documents it as a "Known gap." |
| **Impact** | Migration deploy fails on clean database. Developers and CI must manually create the table. |
| **Likelihood** | Certain (100%) on fresh DB |
| **Mitigation** | Create migration `20260615XXXXX_create_lead_schedule` with CREATE TABLE and indexes |
| **Owner** | Database Team |

---

### R-002 — Governance Bypass via promoteFinancialStatementsOnApproval

| Field | Value |
|-------|-------|
| **ID** | R-002 |
| **Severity** | **Critical (5)** |
| **Status** | Open |
| **Component** | Governance Engine |
| **Description** | `promoteFinancialStatementsOnApproval` in `governance-engine.ts:107-114` uses `updateMany` with `where: { status: { not: "approved" } }` to force-approve ALL non-approved financial statements. No governance gate check. No per-statement audit trail. |
| **Evidence** | Code review of `governance-engine.ts` lines 107-114. `updateMany` does not generate individual audit events. |
| **Impact** | Any user with access to this function can bypass the entire review/approval workflow. Audit trail cannot attribute which statements were approved by which actor. |
| **Likelihood** | High — function is exported from `governance/index.ts` |
| **Mitigation** | Remove or gate-guard the function. Route through proper `transitionFinancialStatementStatus` lifecycle. |
| **Owner** | Governance Team |

---

### R-003 — Graph Sync Destructive Rebuild Without Transaction

| Field | Value |
|-------|-------|
| **ID** | R-003 |
| **Severity** | **Critical (5)** |
| **Status** | Open |
| **Component** | Reporting Graph |
| **Description** | `syncReportingGraphForEngagement` (`graph-sync-service.ts:61`) calls `clearReportingGraphContent(graph.id)` which deletes ALL nodes and edges before rebuilding. If the 256-line sync fails mid-way, the graph is empty. No transaction isolation. |
| **Evidence** | Code review of `graph-sync-service.ts` lines 54-310. No `$transaction` usage. |
| **Impact** | Empty reporting graph after sync failure. Downstream consumers (factory map UI, mind map) display empty or broken state. |
| **Likelihood** | Medium — any transient DB error during sync causes this |
| **Mitigation** | Wrap in Prisma interactive transaction. Remove clear-before-rebuild pattern — use upsert instead. |
| **Owner** | Reporting Graph Team |

---

### R-004 — FS Rebuild Has No Transaction Safety

| Field | Value |
|-------|-------|
| **ID** | R-004 |
| **Severity** | **Critical (5)** |
| **Status** | Open |
| **Component** | FS Engine |
| **Description** | `rebuildFinancialStatementsV2` (`fs-rebuild-service.ts:50-103`) iterates over 4 statement types without transaction wrapping. If a failure occurs after 2 of 4 types are updated, the DB has partial data — some statements reflect v2, some are stale. |
| **Evidence** | Code review of `fs-rebuild-service.ts`. `Promise.all` (line 34) for parallel queries, but no `$transaction`. |
| **Impact** | Engagement dashboard shows inconsistent financial statements. Incorrect amounts visible to reviewer/approver. |
| **Likelihood** | Medium — any per-statement error (timeout, constraint, data format) causes this |
| **Mitigation** | Wrap loop in Prisma `$transaction`. |
| **Owner** | FS Engine Team |

---

### R-005 — Knowledge Actions Missing Tenant Isolation

| Field | Value |
|-------|-------|
| **ID** | R-005 |
| **Severity** | **High (4)** |
| **Status** | Open |
| **Component** | Audit Knowledge Actions |
| **Description** | `listPatternsAction(organizationId)`, `getTopPatternsAction(organizationId)`, `listBenchmarksAction(organizationId)`, `derivePatternsAction(engagementId)`, `generateRecommendationsAction(engagementId)`, and `getEngagementProfileAction(engagementId)` accept `organizationId`/`engagementId` as parameters but do not verify the actor belongs to that organization/engagement. |
| **Evidence** | Code review of `audit-knowledge-actions.ts`. No `assertOrganizationAccess()` or `assertEngagementAccess()` calls. |
| **Impact** | Cross-tenant data access. Org A user can read Org B's firm memory patterns, benchmarks, and engagement profiles by guessing or enumerating IDs. |
| **Likelihood** | Medium — requires knowing other org's ID, but UUIDs can be enumerated |
| **Mitigation** | Add `assertOrganizationAccess` and `assertEngagementAccess` to all knowledge actions. |
| **Owner** | Security Team |

---

### R-006 — Cash Flow Builder Placeholder

| Field | Value |
|-------|-------|
| **ID** | R-006 |
| **Severity** | **High (4)** |
| **Status** | Open |
| **Component** | FS Engine — Cash Flow |
| **Description** | `cash-flow-builder.ts:51-54` has `cashAtBeginning = 0`, `netCashFromInvesting = 0`, `netCashFromFinancing = 0`. Operating cash flow is derived from net cash change, not operations. The cash flow statement is not production-usable. |
| **Evidence** | Code review of `cash-flow-builder.ts`. Also confirmed in `factory-accuracy-auditos-export.json` — cash flow lines show `INVESTING ACTIVITIES: 0` and `FINANCING ACTIVITIES: 0`. |
| **Impact** | Published cash flow statements are incorrect. Investing, financing, and opening cash are all wrong. Users cannot rely on generated cash flow statements. |
| **Likelihood** | Certain (100%) |
| **Mitigation** | Implement proper cash flow derivation: opening balance from prior period, investing/financing from actual GL mappings, operating from working capital changes. |
| **Owner** | FS Engine Team |

---

### R-007 — trustHost: True Disables Host Verification

| Field | Value |
|-------|-------|
| **ID** | R-007 |
| **Severity** | **High (4)** |
| **Status** | Open |
| **Component** | Auth Configuration |
| **Description** | `trustHost: true` in `src/lib/auth-config.ts` disables NextAuth host verification. Callbacks are accepted from any host, enabling open redirect and callback URL manipulation attacks. |
| **Evidence** | Code review of `auth-config.ts`. `trustHost: true` documented as "PR #12345 should address this." |
| **Impact** | Potential account takeover via callback URL manipulation. Phishing risk. |
| **Likelihood** | Low-Medium — requires social engineering |
| **Mitigation** | Remove `trustHost: true`. Set to `false` or scope per environment. |
| **Owner** | Security Team |

---

### R-008 — No Transaction in Presentation Policy Service

| Field | Value |
|-------|-------|
| **ID** | R-008 |
| **Severity** | **Medium (3)** |
| **Status** | Open |
| **Component** | Presentation Policy |
| **Description** | `presentation-policy-service.ts` has no transaction wrapping around multi-step operations like `createOrgPresentationPolicyFromTemplate` (read template → generate ID → create policy) or `updateOrgPresentationPolicy`. Concurrent edits could lose data. |
| **Evidence** | Code review of `presentation-policy-service.ts`. Manual ID generation with `Date.now()` suffix (line 112) could collide on rapid parallel requests. |
| **Impact** | Lost policy updates on concurrent edits. Duplicate policy IDs possible under high concurrency. |
| **Likelihood** | Low (single-tenant currently, grows with multi-tenant) |
| **Mitigation** | Wrap multi-step operations in transactions. Use UUID for IDs instead of `Date.now()`. |
| **Owner** | Presentation Team |

---

### R-009 — Silent Fallback on Missing Engagement

| Field | Value |
|-------|-------|
| **ID** | R-009 |
| **Severity** | **Medium (3)** |
| **Status** | Open |
| **Component** | Engagement Config |
| **Description** | `engagement-presentation-config.ts:12-25` — if `prisma.auditEngagement.findUnique` returns null (deleted or invalid engagement ID), the function silently returns a default config with `presentationPolicyId: null` and generic policy. No error is raised. |
| **Evidence** | Code review of `engagement-presentation-config.ts`. No null check after `findUnique`. |
| **Impact** | Downstream code produces plausible-looking but incorrect financial statements for phantom engagements. |
| **Likelihood** | Medium — invalid engagement IDs from URL manipulation or deleted records |
| **Mitigation** | Add null check after `findUnique`. Throw `NotFoundError` or similar. |
| **Owner** | Config Team |

---

### R-010 — CI Pipeline Lacks Security Scanning

| Field | Value |
|-------|-------|
| **ID** | R-010 |
| **Severity** | **Medium (3)** |
| **Status** | Open |
| **Component** | CI/CD |
| **Description** | `.github/workflows/ci.yml` has no `npm audit`, CodeQL, or gitleaks step. Vulnerable dependencies could ship to production undetected. |
| **Evidence** | Review of `.github/workflows/ci.yml`. Only tsc, test, lint, and build steps. |
| **Impact** | Undetected vulnerable dependencies. No visibility into supply chain risk. |
| **Likelihood** | Low-Medium (depends on dependency hygiene) |
| **Mitigation** | Add `npm audit --audit-level=high`, CodeQL analysis, and gitleaks secrets scanning to CI. |
| **Owner** | DevOps Team |

---

### R-011 — IFRS/SOCPA Citation Engines Over-Cite

| Field | Value |
|-------|-------|
| **ID** | R-011 |
| **Severity** | **Medium (3)** |
| **Status** | Open |
| **Component** | Rules Engines |
| **Description** | `ifrs-rules-engine.ts:115-119` and `socpa-rules-engine.ts:99-102` use broad fuzzy label matching. Any line containing "revenue", "asset", "cash", or any total line gets ALL passing citations. A "Total Assets" line gets IFRS 15 revenue citations. |
| **Evidence** | Code review of fuzzy matching conditions. `line.label.toLowerCase().includes("revenue")` is extremely broad. |
| **Impact** | Published financial statements contain misleading or irrelevant IFRS/SOCPA citations. Erodes trust in AI-generated disclosure annotations. |
| **Likelihood** | Certain (100%) — the matching logic is deterministic and always over-cites |
| **Mitigation** | Use precise statement-type-aware matching. Only cite revenue standards on income statement revenue lines, etc. |
| **Owner** | Rules Engine Team |

---

### R-012 — pattern-matcher.ts Silent Error Catch

| Field | Value |
|-------|-------|
| **ID** | R-012 |
| **Severity** | **Medium (3)** |
| **Status** | Open |
| **Component** | TB Intelligence — Pattern Matcher |
| **Description** | `pattern-matcher.ts:39` uses bare `catch { return null }` which swallows ALL errors including database connection failures, permission errors, and query syntax errors. Makes debugging production failures extremely difficult. |
| **Evidence** | Code review of `pattern-matcher.ts`. |
| **Impact** | Silent failures during classification. Users see a null pattern match with no indication of a DB error. Operator has no log to investigate. |
| **Likelihood** | Medium — DB connection drops, transient failures |
| **Mitigation** | Log the error before returning null. At minimum: `catch (e) { console.error("[PatternMatcher]", e); return null; }`. |
| **Owner** | TB Intelligence Team |

---

### R-013 — Zero Test Coverage for 13 Critical Functions

| Field | Value |
|-------|-------|
| **ID** | R-013 |
| **Severity** | **Medium (3)** |
| **Status** | Open |
| **Component** | Multiple |
| **Description** | 13 critical functions across governance, FS engine, graph sync, and presentation have zero direct test coverage. These include `rebuildFinancialStatementsV2`, `syncReportingGraphForEngagement`, `approveAllFinancialStatementsForEngagement`, `promoteFinancialStatementsOnApproval`, `evaluateFactoryApprovalGatesForEngagement`, `createOrgPresentationPolicyFromTemplate`, `updateOrgPresentationPolicy`, `enrichMappingsWithErpMap1`, and more. |
| **Evidence** | Audit of test files across `src/lib/audit/*/__tests__/`. 13 functions identified with zero coverage. |
| **Impact** | Regressions in critical governance and data integrity functions will not be caught by tests. |
| **Likelihood** | Medium — any code change to these functions is untested |
| **Mitigation** | Add unit tests for all 13 functions. Priority order: governance engine → FS rebuild → graph sync → presentation service. |
| **Owner** | QA Team |

---

### R-014 — Secret Resolver Stores Credentials in Plaintext

| Field | Value |
|-------|-------|
| **ID** | R-014 |
| **Severity** | **Medium (3)** |
| **Status** | Open |
| **Component** | Integration — Secret Resolver |
| **Description** | `secret-resolver.ts` stores `CrmConnection.accessToken`, `ErpConnection.apiKey`, and `TenantIntegration.configMetadata` credentials as plaintext in the database. In-memory cache also exposes secrets in process memory. |
| **Evidence** | Code review of `secret-resolver.ts` lines 364-366, 387-389, 512-578. |
| **Impact** | Database compromise exposes all integration credentials (API keys, tokens, passwords). Process memory dump exposes cached secrets. |
| **Likelihood** | Low-Medium (DB compromise required) |
| **Mitigation** | Encrypt credential fields at rest using `encryption-service.ts`. Use vault-backed `vaultSecretId` instead of plaintext JSON. |
| **Owner** | Platform Team |

---

### R-015 — Factory Accuracy 94% Not Reproducible Without Specific TB File

| Field | Value |
|-------|-------|
| **ID** | R-015 |
| **Severity** | **Medium (3)** |
| **Status** | Open |
| **Component** | Shalfa Pilot |
| **Description** | The 94% factory accuracy is evidenced against a specific TB file (`TB 31-12-2025 Final.xlsx` with 578 accounts) that is not committed to the repository. The evidence artifacts have been sanitized (99.4% reduction). The accuracy may not generalize to other clients' TB data. |
| **Evidence** | Phase 3B.1 holdout shows 46% on unseen accounts. Phase 3B.2 stratified holdout shows similar results. The deterministic pipeline achieves 65% on 100 benchmark accounts. |
| **Impact** | Claimed 94% accuracy is specific to one client's TB data. Generalization to Client #2 may be significantly lower. |
| **Likelihood** | High — generalization gap is documented in hold-out reports |
| **Mitigation** | Set expectations: 94% is Shalfa-specific. Document Client #2 replication as the next milestone. |
| **Owner** | Product Team |

---

### R-016 — Deploy Pipeline Sleep 60 for ECS

| Field | Value |
|-------|-------|
| **ID** | R-016 |
| **Severity** | **Low (2)** |
| **Status** | Open |
| **Component** | CI/CD — Deploy |
| **Description** | `deploy.yml` line 172 uses `sleep 60` to wait for ECS deployment. Should use `aws ecs wait services-stable`. |
| **Evidence** | Code review of `deploy.yml`. |
| **Impact** | Fragile — deployment could still be in progress after 60s. Smoke test could pass/falsely. |
| **Likelihood** | Medium |
| **Mitigation** | Replace with `aws ecs wait services-stable --cluster ... --service ...`. |
| **Owner** | DevOps Team |

---

### R-017 — isAuditIntelligenceEnabledAction Has No Auth

| Field | Value |
|-------|-------|
| **ID** | R-017 |
| **Severity** | **Low (2)** |
| **Status** | Open |
| **Component** | Audit Intelligence Actions |
| **Description** | `isAuditIntelligenceEnabledAction` (line 17-19) has no `getAuditActor()` or `requireRole()` call. Returns feature flag state without any authentication. |
| **Evidence** | Code review of `audit-intelligence-actions.ts` lines 17-19. |
| **Impact** | Unauthenticated users can read feature flag state. Low risk (feature flag only) but inconsistent pattern. |
| **Likelihood** | Low |
| **Mitigation** | Add standard `getAuditActor()` check. |
| **Owner** | Frontend Team |

---

### R-018 — Deprecated Functions Still in Active Use

| Field | Value |
|-------|-------|
| **ID** | R-018 |
| **Severity** | **Low (2)** |
| **Status** | Open |
| **Component** | Income Statement Presentation |
| **Description** | 5 functions in `income-statement-presentation.ts` marked `@deprecated` but still in use. Hardcode Shalfa-specific policy fallbacks. |
| **Evidence** | Code review — `isPilotAuditedPresentationProfile`, `isAuditedOperatingRevenueExcluded`, `isAuditedCorPresentationExcluded`, `getAuditedAlignedFinanceCostNet`, `getAuditedAlignedOtherIncomeNet`. |
| **Impact** | Technical debt. New clients beyond Shalfa will not get correct presentation policy behavior from these functions. |
| **Likelihood** | Low (current single-pilot) |
| **Mitigation** | Migrate callers to policy-aware versions. Remove deprecated functions. |
| **Owner** | FS Engine Team |

---

### R-019 — findNonce Has No Max Iterations

| Field | Value |
|-------|-------|
| **ID** | R-019 |
| **Severity** | **Info (1)** |
| **Status** | Open |
| **Component** | Audit Hash Chain |
| **Description** | `findNonce` in `hash-chain.ts:58` uses `while (true)` with no max iterations. Currently prefix is "00" (~256 iterations avg). If prefix requirement increases, this becomes unbounded. |
| **Evidence** | Code review of `hash-chain.ts`. |
| **Impact** | Extremely low under current configuration. CPU-bound if prefix difficulty increases. |
| **Likelihood** | Low |
| **Mitigation** | Add max iterations safeguard with error throw on timeout. |
| **Owner** | Platform Team |

---

### R-020 — Demo Fallback with Hardcoded Superuser

| Field | Value |
|-------|-------|
| **ID** | R-020 |
| **Severity** | **Low (2)** |
| **Status** | Open |
| **Component** | Actor Context |
| **Description** | `actor-context.ts:96-101` — if `NODE_ENV !== "production"` AND `AUDIT_DEV_FALLBACK_ENABLED === "true"`, returns hardcoded actor `"usr-ahmed"` with operator role. |
| **Evidence** | Code review of `actor-context.ts`. Requires two conditions to activate. |
| **Impact** | If both conditions are accidentally set in staging, allows unauthenticated operator access. |
| **Likelihood** | Low (two independent safeguards) |
| **Mitigation** | Add IP restriction or remove fallback entirely. |
| **Owner** | Security Team |

---

## Risk Summary

| Risk Level | Count | IDs |
|------------|-------|-----|
| Critical (5) | 4 | R-001, R-002, R-003, R-004 |
| High (4) | 3 | R-005, R-006, R-007 |
| Medium (3) | 8 | R-008, R-009, R-010, R-011, R-012, R-013, R-014, R-015 |
| Low (2) | 4 | R-016, R-017, R-018, R-020 |
| Info (1) | 1 | R-019 |
| **Total** | **20** | |

---

## Risk Trend

| Pre-Audit | Post-Audit |
|-----------|------------|
| Internal assessment: GREEN | Independent assessment: YELLOW with 4 critical risks |
| "Staging validation substantially passed" | Requires 6 conditions before unconditional approval |
| Self-reported 235+ tests | ~60 direct AuditOS assertions; 13 critical functions untested |
