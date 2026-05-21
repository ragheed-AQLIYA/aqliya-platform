# AQLIYA v0.1 Release Checklist

## 1. Documentation Alignment

| Item                                                     | Status | Evidence                            | Owner/Notes     |
| -------------------------------------------------------- | ------ | ----------------------------------- | --------------- |
| Official docs aligned to hardened repository reality     | Done   | `docs/official/*.md` updates        | Scope lock pass |
| Source-of-truth docs aligned to official classifications | Done   | `docs/source-of-truth/*.md` updates | Scope lock pass |
| Release scope package created                            | Done   | `docs/releases/aqliya-v0.1-*.md`    | Scope lock pass |

## 2. Security/API Protection

| Item                              | Status | Evidence                         | Owner/Notes                             |
| --------------------------------- | ------ | -------------------------------- | --------------------------------------- |
| Audit evidence download protected | Done   | Hardening report + route handler | Protected by auth + tenant access       |
| Office AI download protected      | Done   | Hardening report + route handler | Protected by auth + platform-org access |
| Metrics endpoint protected        | Done   | Hardening report + route handler | Admin-only                              |

## 3. Product Surface Classification

| Item                                      | Status | Evidence                              | Owner/Notes                        |
| ----------------------------------------- | ------ | ------------------------------------- | ---------------------------------- |
| AuditOS classified accurately             | Done   | Official/source-of-truth/release docs | Pilot-ready product                |
| DecisionOS classified accurately          | Done   | Official/source-of-truth/release docs | Active adjacent system             |
| Office AI Assistant classified accurately | Done   | Official/source-of-truth/release docs | Governed shared application        |
| Sunbul/workflowos classified accurately   | Done   | Official/source-of-truth/release docs | Custom/internal workspace surfaces |

## 4. Prototype/Demo Labeling

| Item                                               | Status | Evidence                        | Owner/Notes                              |
| -------------------------------------------------- | ------ | ------------------------------- | ---------------------------------------- |
| SalesOS labeled as prototype                       | Done   | UI hardening + release docs     | Not part of implemented v0.1 product set |
| organizations/settings labeled as internal preview | Done   | UI hardening + demo safety docs | Protected prototype surfaces             |
| auditos labeled as demo-only                       | Done   | Source-of-truth + release docs  | Public mock demo                         |

## 5. Test Validation

| Item                                            | Status | Evidence                         | Owner/Notes                         |
| ----------------------------------------------- | ------ | -------------------------------- | ----------------------------------- |
| Jest suite passes                               | Done   | `npm test -- --runInBand`        | 18/18 suites passed in final review |
| Governance validation tests are real Jest tests | Done   | `src/lib/governance/__tests__/*` | Structural failure fixed            |

## 6. Build Validation

| Item                       | Status | Evidence           | Owner/Notes                                    |
| -------------------------- | ------ | ------------------ | ---------------------------------------------- |
| TypeScript passes          | Done   | `npx tsc --noEmit` | Pass in final review                           |
| Lint passes with no errors | Done   | `npm run lint`     | 134 documented warnings remain, 0 errors       |
| Production build succeeds  | Done   | `npm run build`    | Pass in final review; existing warnings remain |

## 7. Demo Safety

| Item                                          | Status | Evidence                                         | Owner/Notes           |
| --------------------------------------------- | ------ | ------------------------------------------------ | --------------------- |
| Demo safety guide exists                      | Done   | `docs/releases/aqliya-v0.1-demo-safety-guide.md` | Use before demos      |
| Safe-to-demo vs internal-only areas separated | Done   | Demo safety guide                                | Commercial discipline |

## 8. Commercial Claim Safety

| Item                                       | Status | Evidence                               | Owner/Notes           |
| ------------------------------------------ | ------ | -------------------------------------- | --------------------- |
| Implemented claims limited to proven areas | Done   | Vision, taxonomy, release scope docs   | Truthfulness enforced |
| Future-only claims explicitly restricted   | Done   | Release scope + known limitations docs | No overclaiming       |

## 9. Known Limitations Reviewed

| Item                               | Status | Evidence                                         | Owner/Notes                          |
| ---------------------------------- | ------ | ------------------------------------------------ | ------------------------------------ |
| Known limitations document created | Done   | `docs/releases/aqliya-v0.1-known-limitations.md` | Release package                      |
| Build/test warnings documented     | Done   | Known limitations + alignment report             | Existing warnings preserved honestly |

## 10. Final Release Decision

| Item                       | Status | Evidence                                            | Owner/Notes                                                           |
| -------------------------- | ------ | --------------------------------------------------- | --------------------------------------------------------------------- |
| Scope locked               | Done   | Release scope doc + alignment report                | v0.1 scope locked with minor follow-up                                |
| Final release tag approved | Done   | `docs/reports/aqliya-v0.1-final-go-no-go-review.md` | No P0/P1 blockers; release tag allowed with documented P2 limitations |
