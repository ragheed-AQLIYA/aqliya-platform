# Independent Audit — Executive Summary

**Audit date:** 2026-06-15  
**Scope:** AuditOS Factory Program · PR #5 · branch `auditos/factory-memory-2026-06`  
**Method:** Repository-first verification; documentation treated as claims until corroborated by code, migrations, tests, CI logs, and committed evidence artifacts.

---

## Verdict

| Question | Answer |
|----------|--------|
| Is the Factory Program **real in Git**? | **Yes** — 13 commits, 602 files, substantial committed code |
| Is it **Release Candidate** for Shalfa pilot scope? | **Conditionally yes** — pilot path proven locally |
| Is it **unconditionally merge-ready**? | **No** — CI red, staging undeployed, schema gaps, generalization overstated in some docs |
| Independent release posture | **APPROVE WITH CONDITIONS** |

---

## What Is Proven

1. **TB Intelligence + Firm Memory** — Implemented under `src/lib/tb-intelligence/` with 14 Jest suites / 72 tests passing locally (2026-06-15).
2. **Presentation Policy Engine** — Migrations, seed policies, resolver code, and tests exist and run.
3. **Factory pipeline** — FS rebuild, reporting graph, reconciliation, IFRS/SOCPA rules engines exist under `src/lib/audit/` with tests.
4. **Shalfa pilot accuracy gate** — Committed evidence `shalfa-live-validation.json` shows **578 mappings**, **factoryAccuracy: 94**, **pass: true**; script threshold is `>= 85` (`scripts/shalfa-live-validation.mjs:198`).
5. **Same-ERP firm memory replay** — `phase-3c-firm-memory-validation.json` shows **578/578 exact** on Shalfa TB replay (not hold-out generalization).
6. **Local build gate** — `npx tsc --noEmit` passes on audit branch (verified 2026-06-15).
7. **Staging deploy Test job** — `tsc` passes on GitHub Actions when COA JSON assets present (`608579c`).

---

## What Is Partially Proven

1. **Shalfa ≈94%** — Reproducible **only** with full TB file (`TB 31-12-2025 Final.xlsx`, ~578 rows). Repo `TB.xlsx` (211 rows) yields ~26% — confirms metric is input-sensitive, not arbitrary.
2. **Firm Memory “100%”** — True for **same-ERP pattern replay** on Shalfa; **false** as a generalization claim (hold-out accuracy **~46%** in `phase-3b1-holdout-validation.json`).
3. **Migration safety** — Migrations are mostly additive with `IF NOT EXISTS` patterns on later steps; **drift observed locally** (governance enum, reporting-graph indexes). Documented repair paths exist; not yet proven on RDS.
4. **RBAC / middleware** — Code changes in `src/middleware.ts` (+95 lines in PR) are real; local route probes passed; **not proven on deployed staging** (`staging.aqliya.com` unreachable / undeployed).
5. **Full test suite** — 1961/1992 tests pass in CI; **10 failures / 5 suites** (integration DB, platform SIEM path, some rule tests). Factory-targeted tests pass locally; CI is **not green**.

---

## What Is Not Proven

1. **Real staging environment validation** — AWS deploy blocked (missing GitHub AWS secrets). DNS probe to `staging.aqliya.com` failed (`ENOTFOUND`).
2. **Production deployment** — Never completed in this audit window.
3. **Local AI as product capability** — `local-ai-phase0-smoke.json` proves local Ollama routing on a dev machine; **not** a governed production feature. Rules-only TB classification on Shalfa is **~11.4%** (`shalfa-real-tb-classification.json`).
4. **LeadSchedule production table** — Model exists in `schema.prisma`; **no migration creates `LeadSchedule`**. Runtime errors are caught gracefully but feature is incomplete.
5. **“L5/L6 production-hardened”** claims in some program docs — **Not supported** by deploy proof or full CI green.

---

## Architecture Scores (0–10, independent)

| Component | Score | Rationale |
|-----------|-------|-----------|
| Factory Engine (FS, graph, reconciliation) | **7** | Substantial code + tests; LeadSchedule gap; graph index drift risk |
| TB Intelligence | **7** | Strong Shalfa path; hold-out generalization weak |
| Firm Memory | **8** | Clear governance model; proven on same ERP |
| Governance Layer | **7** | Pure functions tested; TRUSTED lifecycle not fully DB-proven |
| Presentation Policy Engine | **8** | Real policy resolution; Shalfa-specific GL codes seeded in SQL |

---

## Top Risks (summary)

| Severity | Risk |
|----------|------|
| **High** | PR CI failing (10 tests); merge would bypass green gate |
| **High** | Staging never deployed; operational reproducibility unproven |
| **High** | Untracked `src/app/api/test-token/` — token leak endpoint if ever committed |
| **Medium** | Migration drift on real RDS |
| **Medium** | `58e4021` bundles platform scope (middleware, docs, Cypress) with factory |
| **Medium** | Shalfa presentation policy hard-coded to client GL codes in migration seed |
| **Low** | Optimistic “100% / generalization” language in program docs vs hold-out evidence |

---

## Recommended Posture

```text
Release Candidate — Conditional Approval

Merge PR #5 → main ONLY AFTER:
  1. Staging deploy succeeds (AWS secrets + pipeline)
  2. RDS migrate deploy succeeds (with drift playbook if needed)
  3. Post-deploy smoke + Shalfa 94% reproduced on staging
  4. CI failures triaged (fix or document waivers with evidence)

Do NOT treat documentation alone as release proof.
```

**Related deliverables:** `RELEASE_DECISION.md`, `TECHNICAL_RISK_REGISTER.md`, `CLAIMS_VERIFICATION_MATRIX.md`
