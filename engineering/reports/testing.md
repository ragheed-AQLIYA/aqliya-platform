# Test Intelligence Report

**Agent:** testing  
**Generated:** 2026-07-11T02:08:05.379Z  
**Score:** 95/100  
**Findings:** 13 (critical 0, high 0, medium 7, low 5, info 1)

> Engineering Excellence — findings only. OpenCode remains implementation authority. No automatic code changes.

## Summary

| Severity | Count |
| -------- | ----- |
| critical | 0 |
| high | 0 |
| medium | 7 |
| low | 5 |
| info | 1 |

## Inventory

- Source modules (approx): 2465
- Test files: 386
- Server actions: 86 (missing test signals: 0)
- API routes: 64 (sensitive missing: 0)
- Unit-named tests: 53
- Integration-named tests: 23
- Flaky/skip markers: 7
- Coverage %: not measured

## Policy

This agent does **not** execute `npm test` (heavy). It analyzes repository structure and optional coverage artifacts only.

## MEDIUM Findings

### F-0490 — Skip/retry/flaky marker in src/__tests__/rehearsal-check.ts

- **Category:** flaky-tests
- **Files:** `src/__tests__/rehearsal-check.ts`
- **Evidence:** skip/retries/flaky keyword present
- **Suggestion:** Quarantine intentionally or fix root flake; avoid silent skips.

### F-0491 — Skip/retry/flaky marker in src/__tests__/setup.ts

- **Category:** flaky-tests
- **Files:** `src/__tests__/setup.ts`
- **Evidence:** skip/retries/flaky keyword present
- **Suggestion:** Quarantine intentionally or fix root flake; avoid silent skips.

### F-0492 — Skip/retry/flaky marker in src/__tests__/uat-run.ts

- **Category:** flaky-tests
- **Files:** `src/__tests__/uat-run.ts`
- **Evidence:** skip/retries/flaky keyword present
- **Suggestion:** Quarantine intentionally or fix root flake; avoid silent skips.

### F-0493 — Skip/retry/flaky marker in src/__tests__/i18n/no-english-strings.test.ts

- **Category:** flaky-tests
- **Files:** `src/__tests__/i18n/no-english-strings.test.ts`
- **Evidence:** skip/retries/flaky keyword present
- **Suggestion:** Quarantine intentionally or fix root flake; avoid silent skips.

### F-0494 — Skip/retry/flaky marker in src/lib/sales/vnext/__tests__/cross-product-signals.test.ts

- **Category:** flaky-tests
- **Files:** `src/lib/sales/vnext/__tests__/cross-product-signals.test.ts`
- **Evidence:** skip/retries/flaky keyword present
- **Suggestion:** Quarantine intentionally or fix root flake; avoid silent skips.

### F-0495 — Skip/retry/flaky marker in src/lib/sales/v02/cross-product-signals/__tests__/aggregator.test.ts

- **Category:** flaky-tests
- **Files:** `src/lib/sales/v02/cross-product-signals/__tests__/aggregator.test.ts`
- **Evidence:** skip/retries/flaky keyword present
- **Suggestion:** Quarantine intentionally or fix root flake; avoid silent skips.

### F-0496 — Skip/retry/flaky marker in src/lib/local-content/content/__tests__/content-studio-prisma-repository.test.ts

- **Category:** flaky-tests
- **Files:** `src/lib/local-content/content/__tests__/content-studio-prisma-repository.test.ts`
- **Evidence:** skip/retries/flaky keyword present
- **Suggestion:** Quarantine intentionally or fix root flake; avoid silent skips.

## LOW Findings

### F-0498 — Large lib module without obvious tests: pdf-export.ts

- **Category:** regression-risk
- **Files:** `src/lib/workflowos/export/pdf-export.ts`
- **Evidence:** ≥150 LOC, no matching test filename

### F-0499 — Large lib module without obvious tests: decision-scoring.ts

- **Category:** regression-risk
- **Files:** `src/lib/simulation/decision-scoring.ts`
- **Evidence:** ≥150 LOC, no matching test filename

### F-0500 — Large lib module without obvious tests: simulation-engine.ts

- **Category:** regression-risk
- **Files:** `src/lib/simulation/simulation-engine.ts`
- **Evidence:** ≥150 LOC, no matching test filename

### F-0501 — Large lib module without obvious tests: tender-simulation.ts

- **Category:** regression-risk
- **Files:** `src/lib/simulation/tender-simulation.ts`
- **Evidence:** ≥150 LOC, no matching test filename

### F-0502 — Large lib module without obvious tests: queries.ts

- **Category:** regression-risk
- **Files:** `src/lib/sales/v02/knowledge-graph/queries.ts`
- **Evidence:** ≥150 LOC, no matching test filename

## INFO Findings

### F-0497 — No coverage/coverage-summary.json present

- **Category:** coverage
- **Evidence:** Coverage not measured in this run (low-load: suite not executed)
- **Suggestion:** When approved, run jest with coverage and re-audit.

---

_AQLIYA Engineering Excellence · testing_
