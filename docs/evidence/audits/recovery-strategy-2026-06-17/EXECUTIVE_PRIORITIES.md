# EXECUTIVE PRIORITIES — AQLIYA Recovery & Scale

**Date:** 2026-06-17  
**Role:** CTO Executive Remediation Program  
**Evidence base:** `docs/audits/forensic-audit-2026-06-17/*`, `docs/audits/reality-audit-2026-06-17/*`, `PRODUCT_STATUS_MATRIX.md`  
**Rule:** No new audit. Decisions trace to existing findings only.

---

## Phase 1 — Executive Analysis

### 1. What is actually broken?

These items **block deploy, due diligence, or enterprise trust today**:

| ID | Item | Evidence | Why it is broken |
|----|------|----------|------------------|
| B-01 | **Production build** | build-audit: 9 TS errors, `npm run build` FAIL | CI `deploy.yml` runs `tsc --noEmit` first — cannot ship |
| B-02 | **`/api/test-token`** | SECURITY_AUDIT: opened route returns JWT + cookies | Session compromise in any deployed environment |
| B-03 | **`CoreAccessControl` stub** | `access-control.ts`: always `granted` | Fine-grained RBAC is illusory for enterprise buyers |
| B-04 | **Schema–code drift** | `platformAuditEvent`, `SecretEntry` missing | Platform audit + secrets vault fail at compile |
| B-05 | **Commercial truth vs build** | DOCUMENT_CONFLICT_MATRIX DC-01: Phase 7 claims green | Due diligence discovers lie within hours |
| B-06 | **MFA login gap** | security-audit SEC-H04: JWT fields not set at login | MFA gate ineffective end-to-end |

---

### 2. What only looks broken?

| Item | Looks like | Reality (audit evidence) | Action |
|------|------------|--------------------------|--------|
| **33,662 ESLint problems** | Code quality disaster | CONFIG_AUDIT: lint scans `docs/archive/code/`, not scoped to `src/` | Fix lint scope — do not treat as product defect |
| **1,735 markdown files** | Doc chaos | 352 theoretical + 227 archive = background by design | Governance labels, not mass delete |
| **SalesOS "no backend"** | Product missing | 358 lib files, 76 app files — master ref stale | Fix docs, not rebuild Sales |
| **96.4% test pass with 29 suite fails** | Test crisis | Clustered: stale fixtures, optional integration DB | Fix ~3 root causes, not rewrite tests |
| **RiskOS L0** | Missing product | `/risk/*` exists as audit submodule | Document correctly; do not launch RiskOS brand |
| **214 Prisma models** | Over-engineered | Real multi-product platform scale | Consolidate usage, not schema rewrite |
| **Sales `(1)` duplicates** | Architecture failure | Windows copy artifacts — 19 files | Delete in 1 hour |

---

### 3. What is technical debt?

Pay down **after** P0 green build, **before** major new features:

| Debt | Severity | Evidence |
|------|----------|----------|
| Sales `v02` / `_v02` / `vnext` sprawl | High | DUPLICATION_REPORT: 358 lib files, mirrored trees |
| Dual DecisionOS routes | Medium | `(dashboard)/decisions/` + `decision/` |
| Sunbul + WorkflowOS dual layer | Medium | Redirects work; legacy pages remain |
| File scanner pass-through | High | security-audit SEC-H05 — enterprise claim gap |
| SAML stub | Medium | security-audit SEC-M03 |
| `content-studio` `prisma as any` | Medium | code-health-report |
| Stale `.next/types` | Low | build-audit sales/contacts reference |
| Edge rate limit memory-only | Medium | security-audit SEC-M10 |

---

### 4. What is documentation debt?

| Debt | Impact | Evidence |
|------|--------|----------|
| Master ref §6, §9, §16 stale | Investor/customer mistrust | DOCUMENT_CONFLICT_MATRIX DC-02–DC-05 |
| `docs/reports/` missing | Broken authority hierarchy | DOCUMENTATION_AUTHORITY Level 6 empty |
| README SalesOS "prototype" | Wrong buyer signal | DC-03 |
| Phase 7 "build green" | False release record | DC-01 |
| AI README "Local AI not implemented" | Engineering confusion | DC-21 |
| Duplicate RELEASE_DECISION | Operator confusion | KNOWLEDGE_GOVERNANCE_REPORT |

**Not documentation debt:** theoretical-reference corpus (352 files) — it is **classified background**, not stale product docs.

---

### 5. What is architecture debt?

| Debt | Business risk | Evidence |
|------|---------------|----------|
| RBAC stub at Core layer | Enterprise procurement fail | access-control.ts |
| Sales dominates lib (34%) | Velocity drag on all products | ACTUAL_ARCHITECTURE_MODEL |
| Empty `lib/risk/` with routes | Boundary violation | CURRENT_STRUCTURE |
| SSO admin CRUD not wired to login | False enterprise SSO story | security-audit SEC-M01 |
| DB SSO vs env OAuth split | Operator setup complexity | security-audit |

**Not architecture debt requiring rewrite:** modular monolith pattern is **correct** for current stage (EXECUTIVE_SUMMARY: 457 app files, proven products).

---

### 6. What is noise?

**Ignore for the 90-day program** (no engineering time):

| Noise | Why ignore |
|-------|------------|
| Renaming every route to perfect taxonomy | Zero customer value |
| Merging 352 theoretical docs | Background corpus |
| Archiving all 227 historical docs | Already Level 8 authority |
| `knowledge-foundation/` relocation | Non-runtime reference |
| Empty lib dirs (`contacts/`, `utils/`) | Zero runtime impact |
| Perfect ESLint zero across repo | Fix scope first; perfection later |
| knip/ts-prune full dead-code sweep | After build green only |
| Rebuilding SalesOS from scratch | 358 files of real value |
| On-Prem / Air-Gapped packaging | Correctly L0 strategic |
| AQLIYA Studio | Correctly L0 |

---

### 7. What should be ignored for now?

| Item | Resume when |
|------|-------------|
| Sales v02/_v02 merge | Week 7+ (after green CI + pilot stability) |
| Decision route consolidation | Post-90-day or customer-driven |
| Full doc index deduplication | Ongoing governance, not sprint |
| Cypress E2E expansion | After build + auth hardening |
| Model Governance productization | Post-enterprise auth |
| Institutional Memory as product | TB firm-memory already partial in audit path |
| Content Studio schema completion | No paying customer signal in audit |
| RiskOS standalone branding | Audit submodule sufficient |

---

## Priority Rankings

### P0 — Ship blockers & trust killers (Days 1–10)

| Rank | Action | Evidence ref |
|------|--------|--------------|
| P0-1 | Remove/gate `/api/test-token` | SEC-C01 |
| P0-2 | Fix 9 TypeScript errors + green `npm run build` | build-audit |
| P0-3 | Resolve `platformAuditEvent` + `SecretEntry` schema drift | build-audit |
| P0-4 | Publish honest build status in PRODUCT_STATUS_MATRIX | DC-01 |
| P0-5 | Delete 19 `(1)` duplicates + 11 `.bak` files | DEAD_CODE_REPORT |
| P0-6 | Fix 3 stale test fixtures (migration-evidence, retrieval-validation) | test-reality-report |

**Success metric:** `npx tsc --noEmit` PASS · `npm run build` PASS · test-token absent · CI unblocked.

---

### P1 — Enterprise pilot gate (Days 11–30)

| Rank | Action | Evidence ref |
|------|--------|--------------|
| P1-1 | Replace or enforce `CoreAccessControl` (minimum: deny-by-default + route matrix) | SEC-C02 |
| P1-2 | MFA JWT populated at login + middleware gate verified | SEC-H02 |
| P1-3 | Sync master ref + README with code reality (Sales, SSO, Local AI) | DOCUMENT_CONFLICT_MATRIX |
| P1-4 | Create `docs/reports/` + first validation snapshot | KNOWLEDGE_GOVERNANCE |
| P1-5 | Scope ESLint to `src/`; stop false 33K signal | CONFIG_AUDIT |
| P1-6 | Wire or explicitly document SSO path (env OAuth vs DB providers) | SEC-M01 |
| P1-7 | SSO admin CRUD role guard | SEC-M07 |

**Success metric:** Security score path to 75+ · due diligence doc pack truthful · no critical SEC findings open.

---

### P2 — Revenue & pilot acceleration (Days 31–60)

| Rank | Action | Evidence ref |
|------|--------|--------------|
| P2-1 | **LocalContentOS** pilot hardening (workbook, ERP, pilot-readiness dashboard) | PRODUCT_STATUS_MATRIX Phase 11 |
| P2-2 | **AuditOS** protect + conditional pilot ops (no destabilization) | L5 pilot-ready |
| P2-3 | **Freeze SalesOS** feature expansion — fix TS only | 358 lib files, internal-only |
| P2-4 | Customer-facing claims matrix (what we sell vs what exists) | documentation-truth-matrix |
| P2-5 | Post-deploy smoke + backup restore drill once | devops-audit |
| P2-6 | File scanner: integrate or remove enterprise upload claim | SEC-H05 |

**Success metric:** 1 paid/LOI pilot on AuditOS or LocalContent · demo-to-pilot conversion path documented.

---

### P3 — Scale & consolidation (Days 61–90)

| Rank | Action | Evidence ref |
|------|--------|--------------|
| P3-1 | Sales `v02`/`_v02` merge into single tree | DUPLICATION_REPORT |
| P3-2 | Redis-backed rate limiting / WAF path | SEC-M10 |
| P3-3 | SAML implement or remove UI claim | SEC-M03 |
| P3-4 | Decision route consolidation (redirect plan) | CURRENT_STRUCTURE |
| P3-5 | Test coverage baseline (`jest --coverage`) | TEST_COVERAGE_MAP |
| P3-6 | Documentation ownership frontmatter on source-of-truth | KNOWLEDGE_GOVERNANCE |

**Success metric:** Maintainability 50→70 · deploy cadence weekly · Sales import graph single tree.

---

## Decision: What wins when resources conflict?

```
P0 build + security  >  P1 enterprise auth/docs  >  P2 product pilots  >  P3 consolidation
```

**Never trade:** P0 for doc cleanup, Sales refactor, or new product surface.
