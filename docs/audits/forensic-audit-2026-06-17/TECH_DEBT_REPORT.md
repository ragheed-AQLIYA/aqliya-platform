# TECH DEBT REPORT — AQLIYA Forensic Audit

**Generated:** 2026-06-17  
**Method:** Grep `\b(TODO|FIXME|HACK|DEPRECATED|WORKAROUND)\b` in `src/` + code-health-report

---

## Marker Counts (VERIFIED — grep)

| Marker | Files | Match lines | Notes |
|--------|------:|------------:|-------|
| TODO | 17 | 32 | Sales vnext/v02 cross-product |
| FIXME | 0 | 0 | — |
| HACK | 0 | 0 | — |
| DEPRECATED | 8 | 16 | TB firm memory, model governance |
| WORKAROUND | 0 | 0 | — |
| TEMP (noisy) | 18 | 77 | Includes `template`, `temperature` false positives |

---

## TODO Hotspots (VERIFIED)

| File | Count | Domain |
|------|------:|--------|
| `src/lib/sales/vnext/deal-review.ts` | 4 | SalesOS |
| `src/lib/sales/v02/cross-product-signals/aggregator.ts` | 4 | SalesOS |
| `src/lib/sales/_v02/cross-product-signals/aggregator.ts` | 4 | SalesOS |
| `src/products/sales/core-adapters/output-adapter.ts` | 3 | Sales adapters |
| Other v02/_v02 signal files | 1 each | Duplicated debt |

---

## DEPRECATED Hotspots (VERIFIED)

| File | Count | Domain |
|------|------:|--------|
| `src/lib/tb-intelligence/firm-memory-engine.ts` | 4 | Audit TB memory |
| `src/lib/tb-intelligence/firm-memory-governance.ts` | 2 | Governance |
| `src/lib/platform/model-governance/model-governance-service.ts` | 2 | Platform |
| `src/lib/tb-intelligence/classification-explanation.ts` | 2 | TB |

---

## Structural Debt (Code Inspection + Prior Audits)

| ID | Category | Severity | Evidence |
|----|----------|----------|----------|
| TD-01 | Schema-code drift | **Critical** | platformAuditEvent, SecretEntry — build-audit |
| TD-02 | CoreAccessControl stub | **Critical** | access-control.ts |
| TD-03 | test-token debug route | **Critical** | test-token/route.ts |
| TD-04 | 19 `(1)` duplicate files | High | glob |
| TD-05 | Sales v02/_v02/vnext sprawl | High | 358 lib files |
| TD-06 | Dual DecisionOS routes | Medium | app tree |
| TD-07 | Sunbul legacy layer | Medium | redirects + pages |
| TD-08 | 11 marketing `.bak` files | Medium | glob |
| TD-09 | ESLint 33K problems | Medium | build-audit (scope issue) |
| TD-10 | Doc-code drift | Medium | DOCUMENT_CONFLICT_MATRIX |
| TD-11 | MFA JWT incomplete | High | security-audit |
| TD-12 | File scanner stub | High | security-audit |
| TD-13 | Empty lib/risk with routes | Medium | Phase 3 |
| TD-14 | content-studio `prisma as any` | Medium | code-health-report |
| TD-15 | Stale migration-evidence test | Low | test-reality-report |

---

## Debt by Product

| Product | Primary debt |
|---------|--------------|
| Platform | Schema drift, RBAC stub, secrets types |
| SalesOS | Version sprawl, duplicates, TODOs, TS errors |
| AuditOS | DEPRECATED firm-memory paths (migration in progress) |
| LocalContentOS | Build blocked; otherwise tested |
| DecisionOS | Dual route trees |
| Auth | MFA, SSO wiring, CSRF |

---

## Effort Estimates (from prior audits — execution-based)

| Item | Effort | Source |
|------|--------|--------|
| Remove test-token | 15m | security-audit |
| Fix migration-evidence test | 15m | test-reality-report |
| Delete `(1)` files | 1h | code-health-report |
| CoreAccessControl | 2–5d | security-audit |
| SSO wire-up | 1–2w | security-audit |
| Consolidate Sales v02/_v02 | 3–5d | duplication-report |

**Note:** Effort figures sourced from opened `security-audit.md` and related reports — not independent re-estimation.

---

## NOT VERIFIED

- Full TODO text content for all 32 lines
- Technical debt in `scripts/` (154 files)
- Debt in `prisma/seed-*.ts` large files
- Dependency outdatedness (`npm outdated` not run)
