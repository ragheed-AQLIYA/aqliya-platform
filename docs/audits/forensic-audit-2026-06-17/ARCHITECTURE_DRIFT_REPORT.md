# ARCHITECTURE DRIFT REPORT — AQLIYA Forensic Audit

**Generated:** 2026-06-17  
**Comparison:** `DOCUMENT_TRUTH_MODEL.md` vs `ACTUAL_ARCHITECTURE_MODEL.md`  
**Rule:** Evidence-only; uninspected items marked NOT VERIFIED

---

## Drift Summary

| Category | Count | Severity |
|----------|------:|----------|
| Undocumented / under-documented systems | 4 | Medium |
| Doc claims without code | 6 | High (commercial) |
| Code without doc alignment | 5 | Medium |
| Stale validation claims | 3 | **Critical** (release) |
| Internal doc contradictions | 8 | Medium |

---

## 1. Undocumented or Under-Documented Systems

| System | Code evidence | Doc gap |
|--------|---------------|---------|
| **Risk assessment UI** | `src/app/risk/` — 7 files; empty `src/lib/risk/` | PRODUCT_STATUS_MATRIX: L0; reality audit: audit submodule L3 |
| **Content Studio standalone** | `src/app/content-studio/` — 12 files | Master ref: L0 AQLIYA Studio; separate from strategic Studio claim |
| **Skill evaluation API** | `src/app/api/skills/` (inventory-report) | Partial mention in matrix; auth gap noted |
| **TB Intelligence engine** | `src/lib/tb-intelligence/` — 28 files | Deep audit docs exist in `docs/audits/` but not in source-of-truth architecture |

---

## 2. Documented but Missing / Stub Implementations

| Claim | Source | Code reality | Status |
|-------|--------|--------------|--------|
| Build passes, 0 TS errors | PRODUCT_STATUS_MATRIX Phase 7 | 9 TS errors; build FAIL | **FALSE** (`build-audit.md`) |
| CoreAccessControl RBAC | Architecture implied | Always `granted` | **STUB** (`access-control.ts` L7–8) |
| Virus scanning on uploads | Enterprise readiness implied | Pass-through stub | **FALSE** (`file-scanner.ts` per security-audit) |
| SAML SSO from admin UI | SSO L4 claim | SAML stub returns null | **PARTIAL** (security-audit SEC-08) |
| Model Governance registry | Architecture Core list | Service exists; master ref NOT implemented | **PARTIAL** |
| Institutional Memory product | Master ref NOT implemented | DB/firm-memory layer in tb-intelligence | **PARTIAL** |
| On-Prem / Air-Gapped package | Strategic docs only | No deployment package | **MISSING** (correctly strategic) |
| AQLIYA Studio builder | L0 | No builder routes | **MISSING** (correct) |

---

## 3. Implemented but Understated in Master Reference

| Capability | Master Reference | Actual code |
|------------|------------------|-------------|
| **SalesOS backend** | L3, "no backend" (§6, §9) | 76 app files, 358 lib files, Prisma models | **Major drift** |
| **Local AI / Ollama** | NOT implemented (§9) | `local-provider.ts`, smoke PASS | **Stale master ref** |
| **SSO admin + env OAuth** | NOT implemented (§9) | `/settings/sso`, OAuth in auth-config | **Stale master ref** |
| **SCIM v2** | Not in master §9 list | `/api/scim/v2/*` routes | **Under-documented** |
| **LocalContent route count** | 12 routes | 26+ pages (inventory-report) | Count drift |

---

## 4. Route / Boundary Drift

| Issue | Evidence | Impact |
|-------|----------|--------|
| Dual DecisionOS trees | `(dashboard)/decisions/` + `decision/` | User confusion, duplicate maintenance |
| Sunbul + WorkflowOS | Both in codebase + redirects | Legacy debt |
| `/api/test-token` | Open JWT disclosure endpoint | Security drift from enterprise posture |
| Marketing `.bak` pages | 11 files under `(marketing)/` | Dead artifacts in app tree |
| `docs/reports/` missing | DOCUMENTATION_AUTHORITY Level 6 empty | Governance hierarchy broken |

---

## 5. Schema–Code Drift (Critical)

| Code reference | Schema state | Evidence |
|----------------|--------------|----------|
| `platformAuditEvent` | Not in generated client | `audit-event-service.ts:47` — build-audit |
| `SecretEntry`, `SecretsVault` types | Export missing | `vault.ts:6` — build-audit |
| Content Studio models | `prisma as any` workaround | code-health-report |
| Untracked `diff_platform_models.sql` | Migration not applied? | git status |

---

## 6. Validation Baseline Drift

| Metric | Doc claim | Executed evidence (2026-06-17) |
|--------|-----------|----------------------------------|
| TypeScript | Pass | **FAIL** — 9 errors |
| Build | Pass | **FAIL** |
| Tests | Various (213 → 2515) | 272 suites, 96.4% pass — `test-reality-report.md` |
| Prisma validate | — | **PASS** |
| Local AI smoke | — | **PASS** |

---

## 7. Recommended Doc Updates (Evidence-Based)

1. **`AQLIYA_MASTER_REFERENCE.md` §6, §9** — SalesOS, SSO, SCIM, Local AI status
2. **`README.md` L46** — SalesOS "Prototype dashboard" vs matrix L5
3. **`AQLIYA_ARCHITECTURE.md` L75** — Remove LocalContactOS from "not implemented"
4. **`PRODUCT_STATUS_MATRIX.md`** — Build/test status row for 2026-06-17
5. **`DOCUMENTATION_AUTHORITY.md`** — Resolve `docs/reports/` (create or amend hierarchy)
6. **`src/lib/ai/README.md`** — Local AI implemented (documentation-truth-matrix)

---

## NOT VERIFIED

- Whether production AWS matches Terraform definitions
- Full middleware route coverage matrix
- All 1,426 docs individually cross-checked against code
