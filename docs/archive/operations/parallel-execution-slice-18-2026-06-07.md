# Slice 18 — AuditOS sampling UI (stratified / systematic)

**Date:** 2026-06-07

## Delivered

| ID | Deliverable |
| -- | ----------- |
| **A1-02 UI** | `audit-sampling-form` — stratified/systematic methods, confidence/margin, strata + statistics display |
| **Actions** | `generateAuditSamplingAction` accepts extended sampling params |

## Validation

| Command | Result |
| ------- | ------ |
| `npm test -- sampling-engine.test.ts` | 5 passed (unchanged) |
| `npx tsc --noEmit` | See commit |

**Status:** DONE_WITH_CONCERNS — browser smoke not run
