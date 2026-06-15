# Claims Verification Matrix — AuditOS Factory Program

**Audit date:** 2026-06-15  
**Method:** Each claim checked against repository code, committed evidence JSON, CI logs, or migration SQL.  
**Reproducibility:** **R** = reproducible · **P** = partially · **N** = not reproducible / not proven

---

## 1. Git & release claims

| Claim | Source | Verification | Status | Reproducibility |
|-------|--------|--------------|--------|-----------------|
| Factory program exists in Git on reviewable branch | Program status docs | 13 commits vs `main`; PR #5 OPEN | **Proven** | R — clone branch |
| PR is mergeable without conflicts | GitHub | `gh pr view 5` → MERGEABLE | **Proven** | R |
| PR CI is green | Implicit release readiness | Run `27548070717` → FAILURE | **Disproven** | R — CI log |
| All required assets committed for build | Assumed | `ifrs-mapping.json` missing until `608579c` | **Partially proven** | R after `608579c` |
| Staging deployed | Operator checklist | AWS creds fail; DNS ENOTFOUND | **Not proven** | N |

---

## 2. Shalfa & factory accuracy

| Claim | Source | Verification | Status | Reproducibility |
|-------|--------|--------------|--------|-----------------|
| Shalfa Factory Accuracy ≈ **94%** | Signoff docs, validation report | `shalfa-live-validation.json`: `"factoryAccuracy": 94`, `"pass": true`, 578 mappings | **Proven** (full TB) | **P** — requires `TB 31-12-2025 Final.xlsx` + DB |
| Shalfa validation passes gate | Scripts | `pass: factoryAccuracy >= 85` in `shalfa-live-validation.mjs:198` | **Proven** | P |
| Net profit variance ≈ 0.000016% | Reports | JSON `netProfitPct: 1.56e-5` | **Proven** | P |
| Truncated TB yields same result | — | 211-line `TB.xlsx` → 26% (documented) | **Disproven** | R |
| All line items within 1% | Marketing tone | Revenue −0.25%; Total assets +2.48%; structural score **70** | **Partially proven** | P — weighted score still 94 |
| Factory works without presentation policy | — | Policy `shalfa-pilot-audited-v1` seeded in migration + required for audited alignment | **Partially proven** | P — Shalfa-specific |

---

## 3. Firm memory

| Claim | Source | Verification | Status | Reproducibility |
|-------|--------|--------------|--------|-----------------|
| Firm Memory **100%** on Shalfa | Phase 3C docs | `phase-3c-firm-memory-validation.json`: `"exact": 578`, `"accuracy": 1` | **Proven** (same-ERP replay) | P — same TB/context |
| Firm Memory generalizes to new accounts | Strategy docs | Hold-out `accuracy: 0.4609375` (~46%) in `phase-3b1-holdout-validation.json` | **Not proven** | P for hold-out script; N as "100% product" |
| Governance TRUSTED lifecycle enforced | Phase 3D docs | `firm-memory-governance.ts` + tests `firm-memory-governance.test.ts` | **Proven** (logic) | R — unit tests |
| Memory patterns survive clean DB | — | Depends on seed/backfill; not verified in audit run | **Partially proven** | N without staging DB |

---

## 4. TB intelligence & AI

| Claim | Source | Verification | Status | Reproducibility |
|-------|--------|--------------|--------|-----------------|
| TB Intelligence engine implemented | Architecture docs | `src/lib/tb-intelligence/engine.ts` + 14 test suites | **Proven** | R — `npm test` patterns |
| Rules-only classification high accuracy | AI docs | `shalfa-real-tb-classification.json`: rules accuracy **~11.4%** | **Disproven** for rules-only | R |
| Local AI benchmark valid for release | Local AI plan | `local-ai-phase0-smoke.json`: Ollama/qwen3 local smoke pass | **Partially proven** | P — dev machine only |
| Local AI is production path | Some docs | Feature flags default off; assistive routing only | **Not proven** | N for production |
| RAG / embeddings production-ready | Various | Migrations exist; not part of factory RC gate | **Not proven** | N |

---

## 5. Hold-out & generalization

| Claim | Source | Verification | Status | Reproducibility |
|-------|--------|--------------|--------|-----------------|
| Hold-out evaluation exists | Phase 3B docs | `phase-3b1-holdout-validation.json` committed | **Proven** | R — artifact |
| Hold-out accuracy strong | Implied | **46.1%** hold-out accuracy | **Disproven** as "strong" | R |
| Client B/C generalization | Generalization report | `p12-generalization-validation.json` — mixed scores (53–87%) | **Partially proven** | P |
| Single ERP moat = 100% reuse | Marketing | True for replay; false for unseen codes | **Partially proven** | P |

---

## 6. Architecture components

| Claim | Source | Verification | Status | Reproducibility |
|-------|--------|--------------|--------|-----------------|
| Presentation Policy Engine live | Phase 13.2 | Migration + `presentation-policy-service.ts` + tests | **Proven** | R |
| Reporting graph foundation | Phase 2 | Migration + `graph-sync-service.ts`; index drift observed | **Partially proven** | P |
| Lead schedules auto-generate | Factory docs | No `LeadSchedule` migration; runtime errors caught | **Not proven** | N on clean migrate |
| IFRS / SOCPA rules engines | L6 program | Code + tests; CI flakiness on rules suites | **Proven** (code) | R locally |
| Factory smoke end-to-end | Scripts | `factory-pilot-smoke.ts` passed locally after index repair | **Partially proven** | P |

---

## 7. Security & compliance

| Claim | Source | Verification | Status | Reproducibility |
|-------|--------|--------------|--------|-----------------|
| No customer GL in PR evidence | Sanitization claim | `shalfa-real-tb-classification.json` has `_sanitized: true` | **Proven** | R |
| RBAC enforced on audit routes | Platform docs | Middleware route map + local 307 probes | **Partially proven** | P — not on staging |
| `/auditos/*` remains public demo | Doctrine | Local 200 on `/auditos` | **Proven** (local) | P |
| No dangerous debug routes in PR | — | `test-token` **untracked**, not in PR diff | **Proven** (not merged) | R — but local risk |
| Secrets in repository | — | No `.env` committed; AWS secrets missing from GitHub (expected) | **Proven** | R |

---

## 8. CI/CD & deploy

| Claim | Source | Verification | Status | Reproducibility |
|-------|--------|--------------|--------|-----------------|
| Deploy workflow validates tsc | deploy.yml | Staging Test job pass @ `608579c` | **Proven** | R |
| Full deploy succeeds | Operator expectation | Terraform/Docker fail — no AWS creds | **Not proven** | N |
| Post-deploy smoke on staging | deploy.yml | Job skipped due to deploy fail | **Not proven** | N |
| Vercel preview green | PR checks | Vercel SUCCESS; deploy-preview FAILURE | **Partially proven** | R |

---

## Summary table

| Category | Proven | Partially | Not proven / Disproven |
|----------|--------|-----------|-------------------------|
| Git / release | 2 | 1 | 2 |
| Shalfa accuracy | 3 | 3 | 1 |
| Firm memory | 2 | 1 | 1 |
| TB / AI | 1 | 1 | 3 |
| Generalization | 1 | 2 | 1 |
| Architecture | 2 | 3 | 1 |
| Security | 2 | 2 | 0 |
| CI/CD | 1 | 1 | 2 |

---

## Claims the audit council accepts for RC (narrow)

1. Shalfa full-TB factory accuracy **≥85** (observed **94**) with pilot presentation policy — **reproducible with full TB file + DB**.
2. Firm memory **exact replay** on same Shalfa ERP context — **578/578** in committed evidence.
3. Factory codebase is **substantial, tested, and merged to staging branch** for deploy attempt.

## Claims the audit council rejects or narrows

1. **"100% firm memory"** as generalization → **same-ERP replay only**.
2. **"Local AI ready"** → **dev smoke only**; rules-only TB **~11%**.
3. **"CI green / production-ready"** → **false today**.
4. **"Staging validated"** → **false until AWS deploy + RDS + Shalfa on staging**.

---

## Reproduce key proofs (operator / auditor)

```bash
# Factory unit tests
npm test -- --testPathPatterns="tb-intelligence|firm-memory|presentation"

# Shalfa gate (full TB required)
TB_FILE="/path/to/TB 31-12-2025 Final.xlsx" npm run shalfa:setup
npm run shalfa:validate

# TypeScript
npx tsc --noEmit

# CI truth
gh run view <latest-pr-run> --log-failed
```
