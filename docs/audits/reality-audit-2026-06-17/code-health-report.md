# Code Health Report — AQLIYA Deep Reality Audit

**Audit date:** 2026-06-17  
**Overall Score: 55/100**

---

## Technical Debt Inventory

| Category | Severity | Count/Evidence | Recommendation |
|----------|----------|----------------|----------------|
| Duplicate `(1)` files | High | 24+ test files, 2+ action files in SalesOS | Delete duplicates |
| Schema-code drift | Critical | platformAuditEvent, content-studio models | Align schema + migrate |
| Stub security controls | Critical | CoreAccessControl, file-scanner | Implement or remove |
| Dual workflow architecture | Medium | Sunbul + WorkflowTemplate | Consolidation epic |
| SalesOS version sprawl | Medium | `_v02/`, `vnext/`, `(1)` copies | Archive unused |
| Stale .next types | Medium | sales/contacts page reference | Clean rebuild |
| TODO stubs from phantom fix | Medium | Platform module stubs in SalesOS | Complete or archive |
| Doc-code drift | Medium | AI README, status matrix | Sync docs |

---

## Dead Code Candidates

| Path | Evidence |
|------|----------|
| `src/lib/ai/intelligence-runtime (1).ts` | Untracked duplicate |
| `src/lib/ai/governed-ai-metadata (1).ts` | Untracked duplicate |
| `src/actions/sales-*-actions (1).ts` | Duplicate actions |
| `docs/archive/code/` | Archived reference code — not runtime |

**Recommendation:** Run `knip` or `ts-prune` after build fix for systematic dead code detection.

---

## Large Files (Sample)

| File | Approx Lines | Risk |
|------|-------------|------|
| `prisma/seed-audit.ts` | ~2,500 | Maintainability |
| `src/actions/audit-actions.ts` | Large | Split by domain |
| `src/actions/sales-actions.ts` | Large | Split by domain |
| `prisma/schema.prisma` | ~2,300+ | Normal for multi-product |

---

## Architectural Violations

| Violation | Location |
|-----------|----------|
| `prisma as any` | content-studio-service.ts |
| Client/server boundary | No violations found in spot check |
| Debug endpoint in prod code | test-token/route.ts |

---

## Duplicate Code

- SalesOS `(1).test.ts` files appear to be exact duplicates — not intentional variants
- Multiple provider factories (`provider-factory.ts`, `ai-provider-factory.ts`, orchestrator inline)

---

## Unused Dependencies — UNVERIFIED

`npm run analyze` / depcheck not run. Manual note: large dependency tree typical for Next.js enterprise app.

---

## Complex Functions — UNVERIFIED

No cyclomatic complexity analysis run. Orchestrator and audit-actions flagged for future refactor.

---

## Test Health

| Metric | Value |
|--------|------:|
| Test pass rate | 96.4% |
| Suite pass rate | 87.5% |
| Duplicate test noise | ~24 suites |

---

## Recommendations

| Priority | Action | Effort |
|----------|--------|--------|
| P0 | Fix 9 TS errors | 1-2d |
| P0 | Delete `(1)` duplicate files | 2h |
| P1 | Resolve schema drift | 1d |
| P1 | Implement or delete CoreAccessControl | 2-5d |
| P2 | Consolidate provider factories | 3d |
| P2 | Sunbul → WorkflowOS migration completion | 2-4w |

---

**Code health verdict:** Substantial valuable codebase with **acute hygiene debt** (duplicates, schema drift) blocking ship.
