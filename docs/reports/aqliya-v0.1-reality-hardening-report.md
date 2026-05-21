# AQLIYA v0.1 Reality Hardening Report

## 1. Executive Summary

- Hardened three sensitive endpoints so file downloads and internal metrics are no longer exposed without explicit server-side checks.
- Reclassified implemented systems in source-of-truth docs so Office AI Assistant, Sunbul, and workflowos are visible without being overstated as finished platform products.
- Marked `/sales`, `/organizations`, and generic `/settings` as prototype/internal-preview surfaces in both UI and docs.
- Repaired the Jest stack by converting governance validation scripts into real tests, fixing the Prisma mock, and documenting intentional English allowlist logic in the i18n scan.
- AQLIYA is materially closer to credible v0.1 scope definition, but still needs one more hardening pass because some official v1.1 docs still conflict with repository reality and some prototype/operator visibility decisions remain unresolved.

## 2. Security Hardening

| Endpoint                                    | Previous State              | Change Made                                                                                                 | Auth           | Tenant Check                                      | Result    |
| ------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------- | --------- |
| `/api/audit/evidence/[evidenceId]/download` | No visible route-level auth | Added `getAuditActor()` + `assertEngagementAccess()`, safe 401/403 handling, filename sanitization          | Required       | Engagement-level organization access              | Protected |
| `/api/office-ai/download`                   | No route-level auth         | Added `requireUserContext("VIEWER")`, platform-org access check, format allowlist, private/no-store headers | Required       | Output task must match user platform organization | Protected |
| `/api/metrics`                              | Public internal counts      | Added `requireUserContext("ADMIN")` and explicit 401/403 responses                                          | Admin required | N/A, route is platform-internal                   | Protected |

## 3. System Status Decisions

| Area                | Final Classification                           | Evidence                                                                      | Customer Demo Status                                         | Documentation Updated |
| ------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------- |
| Office AI Assistant | Shared governed application on AQLIYA Core     | `/assistant`, `OfficeAi*` models, `office-ai-actions.ts`, platform audit logs | Demo-safe with explanation, not standalone product marketing | Yes                   |
| Sunbul              | Real custom/client-specific governed workspace | `/sunbul/*`, `Sunbul*` models, storage/review/export code                     | Safe with explanation as custom workspace                    | Yes                   |
| workflowos          | Duplicate route family / alias over Sunbul     | `/workflowos/*` reuses Sunbul components, actions, and models                 | Internal/custom alias only                                   | Yes                   |
| SalesOS             | Prototype shell                                | `/sales`, no backend/schema/actions                                           | Not a real v0.1 product surface                              | Yes                   |
| organizations       | Protected prototype surface                    | Mock array/detail page, no persistence                                        | Internal preview only                                        | Yes                   |
| settings            | Protected local-state preview                  | Local client state only, no persistence                                       | Internal preview only                                        | Yes                   |

## 4. Shell / Prototype Separation

| Route                 | Previous Risk                               | Change Made                                                                     | Current Label/Status                          |
| --------------------- | ------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------- |
| `/sales`              | Looked workspace-like despite mock data     | Added explicit prototype/v0.1 exclusion notice                                  | Prototype, internal preview, demo data        |
| `/organizations`      | Protected route implied real org management | Added prototype notice, disabled misleading create CTA, fixed route link target | Prototype, internal preview, demo data        |
| `/organizations/[id]` | Detail page implied real org record         | Added prototype notice, badge, corrected back-link                              | Prototype, internal preview                   |
| `/settings`           | Local-state page looked like real settings  | Added internal preview banner and non-persistent CTA copy                       | Prototype, internal preview, local-state only |

## 5. Test Stack Repair

| Test Area                             | Previous Failure                                          | Change Made                                                                        | Current Result |
| ------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------- |
| Governance validation files           | Jest reported “must contain at least one test”            | Replaced script-style files with real Jest assertions                              | Pass           |
| `src/__mocks__/prisma-client-mock.js` | TypeScript syntax inside `.js` and shallow model stubs    | Replaced with stateful in-memory Prisma mock and exported runtime enums            | Pass           |
| i18n audit component scan             | Failed on intentional English technical/accounting labels | Added documented exact/pattern allowlist for intentional bilingual/technical terms | Pass           |
| Integration suites                    | Failed behind broken Prisma mock behavior                 | Stateful mock now supports create/find/update/delete/include flows used by tests   | Pass           |

## 6. Documentation Alignment

Updated docs:

- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` — aligned implemented systems, prototypes, and custom/shared classifications.
- `docs/source-of-truth/ROUTE_STRATEGY.md` — documented assistant, Sunbul, workflowos, prototype routes, and hardened internal APIs.
- `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` — added shared app/custom workspace reality and prototype-route treatment.
- `docs/product/office-ai-assistant-foundation-design.md` — changed status from unimplemented design-only to partially implemented governed shared app.
- `docs/product/sunbul/sunbul-product-brief.md` — clarified Sunbul as a real custom workspace implementation.
- `docs/product/workflowos/workflowos-route-alias-report.md` — clarified workflowos as a route alias/duplicate over Sunbul.

Reality-alignment note:

- Official v1.1 docs still contain a conflict: they describe Office AI Assistant as planned/MVP target, while current code and source-of-truth now classify it as implemented shared application. That conflict was not silently ignored; it remains a documented follow-up.

## 7. Files Changed

- `src/app/api/audit/evidence/[evidenceId]/download/route.ts` — added authenticated engagement access checks and safe error handling.
- `src/app/api/office-ai/download/route.ts` — added authenticated platform-org access checks and safer download behavior.
- `src/app/api/metrics/route.ts` — restricted internal metrics to admins.
- `src/app/sales/page.tsx` — labeled SalesOS workspace as prototype/not part of v0.1.
- `src/app/(dashboard)/organizations/page.tsx` — marked org list as internal prototype and removed misleading creation CTA.
- `src/app/(dashboard)/organizations/[id]/page.tsx` — marked org detail as internal prototype and fixed route back-link.
- `src/app/(dashboard)/settings/page.tsx` — marked generic settings as local-state preview only.
- `src/__mocks__/prisma-client-mock.js` — replaced broken stub with stateful in-memory Prisma mock.
- `src/__tests__/i18n/no-english-strings.test.ts` — documented and implemented intentional-English allowlist logic.
- `src/lib/governance/__tests__/retrieval-validation.test.ts` — converted to real Jest tests.
- `src/lib/governance/__tests__/approval-state-validation.test.ts` — converted to real Jest tests.
- `src/lib/governance/__tests__/escalation-validation.test.ts` — converted to real Jest tests.
- `src/lib/governance/__tests__/provenance-validation.test.ts` — converted to real Jest tests.
- `src/lib/governance/__tests__/prompt-validation.test.ts` — converted to real Jest tests.
- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` — updated product/system reality classification.
- `docs/source-of-truth/ROUTE_STRATEGY.md` — updated route classification and protection rules.
- `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` — updated architecture reality map.
- `docs/product/office-ai-assistant-foundation-design.md` — updated implementation status and reality note.
- `docs/product/sunbul/sunbul-product-brief.md` — updated Sunbul implementation classification.
- `docs/product/workflowos/workflowos-route-alias-report.md` — updated workflowos alias classification.
- `docs/reports/aqliya-v0.1-reality-hardening-report.md` — added this report.

## 8. Validation Results

| Command                   | Result | Notes                                                                                                                                                                                |
| ------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npx tsc --noEmit`        | Pass   | No TypeScript errors after converting tests to explicit Jest globals                                                                                                                 |
| `npm run lint`            | Pass   | 134 pre-existing warnings, 0 errors                                                                                                                                                  |
| `npm run build`           | Pass   | Build succeeded; existing warnings remain for workspace-root detection, deprecated `middleware` convention, missing Sentry auth token, and dynamic-server usage logs on `/decisions` |
| `npm test -- --runInBand` | Pass   | 18/18 suites passed, 176/176 tests passed                                                                                                                                            |
| `npm run audit:health`    | Pass   | 7/7 checks passed                                                                                                                                                                    |
| `npm run backup:verify`   | Pass   | Data-integrity backup verification passed                                                                                                                                            |

## 9. Remaining Risks

- Official `docs/official/` v1.1 materials still lag code reality for Office AI Assistant and should be aligned deliberately in a follow-up pass.
- `/monitoring` now has a protected API backend, but broader page-level visibility policy for internal aggregate metrics may still need tightening.
- Prototype routes remain present by design; they are now labeled honestly, but they are still not real v0.1 product modules.
- Build still emits existing Next.js/Sentry warnings that were not introduced by this pass.

## 10. v0.1 Readiness Verdict

**Needs one more hardening pass**

Why:

- The implemented systems are now clearer and safer.
- The test stack is repaired and validation is passing.
- But official-vs-source-of-truth documentation still conflicts on some shared/custom systems, and platform/operator access policy is not fully normalized across all surfaces.

## 11. Next Recommended Step

Align the remaining official v1.1 docs and operator-only visibility rules with the now-hardened repository reality before defining the final AQLIYA v0.1 release scope.
