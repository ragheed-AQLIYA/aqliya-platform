# VALUE vs EFFORT MATRIX — AQLIYA Recovery & Scale

**Date:** 2026-06-17  
**Scoring:** 1–5 scale (5 = highest impact/effort)  
**Evidence:** Forensic audit findings only

---

## Scoring Legend

| Dimension | 5 | 1 |
|-----------|---|---|
| Business impact | Revenue / deal unblock | Internal convenience |
| Technical impact | Unblocks all products | Isolated module |
| Security impact | Critical CVE-class | Cosmetic |
| Customer impact | Procurement requirement | Invisible |
| Effort | Multi-week program | <2 hours |
| Risk (of doing) | High regression | Trivial |

---

## Major Findings Matrix

| Finding | Biz | Tech | Sec | Cust | Effort | Risk | Quadrant |
|---------|----:|-----:|----:|-----:|-------:|-----:|----------|
| Remove `/api/test-token` | 3 | 2 | **5** | 4 | **1** | 1 | **WIN** |
| Fix 9 TS errors + green build | **5** | **5** | 3 | **5** | 2 | 2 | **WIN** |
| Delete `(1)` + `.bak` files | 1 | 2 | 1 | 1 | **1** | 1 | **WIN** |
| Fix 3 stale test fixtures | 2 | 3 | 1 | 2 | **1** | 1 | **WIN** |
| Scope ESLint to `src/` | 2 | 3 | 1 | 1 | **1** | 1 | **WIN** |
| Sync master ref + README | **4** | 1 | 2 | **5** | 2 | 1 | **WIN** |
| Create `docs/reports/` + snapshot | 3 | 1 | 2 | **4** | 2 | 1 | **WIN** |
| MFA JWT at login | 3 | 3 | **4** | **4** | 2 | 2 | **WIN** |
| SSO admin role guard | 2 | 2 | **4** | 3 | **1** | 1 | **WIN** |
| CoreAccessControl real matrix | 3 | **4** | **5** | **5** | 4 | 3 | High value / medium effort |
| Wire DB SSO to login | 3 | 3 | 4 | **5** | 4 | 3 | Enterprise path |
| LocalContent pilot hardening | **5** | 3 | 2 | **5** | 3 | 2 | **Revenue** |
| AuditOS protect + pilot ops | **5** | 2 | 3 | **5** | 2 | 2 | **Revenue** |
| File scanner integration | 2 | 2 | **4** | **4** | 4 | 2 | Enterprise later |
| Sales v02/_v02 merge | 2 | **4** | 1 | 1 | **5** | **4** | Defer |
| Decision route consolidation | 1 | 3 | 1 | 2 | 3 | 3 | Defer |
| SAML full implementation | 2 | 3 | 3 | **5** | **5** | 3 | Defer |
| Mass doc dedup (1735 files) | 2 | 1 | 1 | 3 | **5** | 2 | **Avoid now** |
| Platform rewrite | 1 | **5** | 3 | 1 | **5** | **5** | **Never** |
| SalesOS feature expansion | 2 | 3 | 1 | 1 | 4 | 3 | **Freeze** |

---

## HIGH VALUE / LOW EFFORT Wins (Do First)

| # | Action | Time | Value |
|---|--------|------|-------|
| 1 | Delete `/api/test-token` | 15 min | Closes critical SEC finding |
| 2 | Delete 30 dead files `(1)` + `.bak` | 2 hr | CI signal + hygiene |
| 3 | Fix SecretEntry export + Sales TS types | 2 hr | Unblocks build |
| 4 | Fix platformAuditEvent schema/migration | 2 hr | Unblocks platform audit writes |
| 5 | Clean `.next` + rebuild | 15 min | Removes stale type noise |
| 6 | Fix migration-evidence + retrieval tests | 30 min | CI green signal |
| 7 | ESLint ignore `docs/**`, `knowledge-foundation/**` | 2 hr | Stops false 33K metric |
| 8 | SSO admin ADMIN guard | 1 hr | Closes privilege escalation |
| 9 | Update master ref §6/§9 (Sales, SSO, Local AI) | 4 hr | Due diligence trust |
| 10 | Add build status row to PRODUCT_STATUS_MATRIX | 1 hr | Truth in authority docs |

**Combined effort:** ~2 engineering days  
**Combined unlock:** Deploy pipeline + investor doc trust + critical SEC closed

---

## HIGH VALUE / HIGH EFFORT (Schedule, Don't Sprint)

| Action | Weeks | Why wait |
|--------|-------|----------|
| CoreAccessControl full matrix | 1–2 | Needs design after build green |
| SAML production | 2–4 | Env OAuth may suffice for first enterprise |
| Sales tree merge | 1 | High regression; Sales frozen |
| File scanner (ClamAV/cloud) | 1–2 | Needed for gov RFP, not first pilot |
| Redis edge rate limit | 1 | Scale issue, not pilot blocker |

---

## LOW VALUE / HIGH EFFORT (Avoid in 90 Days)

| Action | Why avoid |
|--------|-----------|
| Rewrite SalesOS | 358 files work; freeze instead |
| Consolidate 352 theoretical docs | Background by authority |
| Perfect zero ESLint repo-wide | Scope fix sufficient |
| Build On-Prem package | Correctly L0 strategic |
| Launch RiskOS as product | Submodule exists; no market ask in audit |
| Merge all 1735 docs | Ongoing governance, not sprint |

---

## Product Investment Matrix

| Product | Revenue speed | Moat | Current readiness | Invest? |
|---------|--------------|------|-------------------|---------|
| **LocalContentOS** | **Fast** (Saudi LC market) | **High** (workbook + ERP + V3.5 AI) | L4 + pilot dashboard | **YES — primary** |
| **AuditOS** | **Fast** (audit firms) | **High** (governance + lifecycle) | L5 conditional | **YES — protect** |
| **Platform Core** | Enabler | **High** (shared trust) | Blocked by build/security | **YES — P0/P1** |
| **SalesOS** | Slow (internal CRM-lite) | Medium | L5 internal, TS debt | **FREEZE** |
| **DecisionOS** | Medium | Medium | L4 stable | **Maintain** |
| **WorkflowOS** | Medium | Medium | L4→L5 partial | **Maintain** |

---

## Effort Budget Recommendation (90 Days, Small Team)

| Bucket | % time | Focus |
|--------|-------:|-------|
| P0 Build + security | 25% | Weeks 1–2 |
| P1 Enterprise auth + docs truth | 20% | Weeks 2–4 |
| P2 LocalContent + AuditOS pilots | 40% | Weeks 3–10 |
| P3 Consolidation | 15% | Weeks 8–12 |
