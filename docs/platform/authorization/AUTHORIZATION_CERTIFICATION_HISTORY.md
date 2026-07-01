---
title: "Authorization Certification History"
status: active
program: "Platform Authorization"
phase: "Operational Certification"
version: "1.0"
date: 2026-06-28
---

# Authorization Certification History

> **Purpose:** Living record of all operational certification runs. Each row represents a completed certification cycle with evidence package, metrics, and gate result.

---

## Certification Runs

| # | Date | Engine Ver | Git Commit | Evaluations | Match Rate | Unexpected ALLOW | Critical Mismatch | Policy Cover | Permission Cover | Latency (Avg/P95/P99) | Stability | Drift | Result | Approved By | Notes |
|---|------|:----------:|:----------:|:-----------:|:----------:|:----------------:|:-----------------:|:------------:|:----------------:|:---------------------:|:---------:|:-----:|:------:|:-----------:|-------|
|   |      |            |            |             |            |                  |                   |              |                  |                       |           |       |        |             |       |

*(First entry pending — complete `FEATURE_AUTHZ_SHADOW=1` data collection)*

---

## How to Add a New Entry

1. Ensure `FEATURE_AUTHZ_SHADOW=1` has been active for sufficient time to meet coverage criteria
2. Run `generateEvidencePackage(shadowLogger)` to produce the evidence package
3. If a previous baseline exists, `detectDrift()` will run automatically
4. Copy the metrics into the table above
5. Commit the evidence package + history update

### Required Tooling

```typescript
import { shadowLogger, generateEvidencePackage } from '@/lib/authorization/engine'

// After data collection:
const pkg = generateEvidencePackage(shadowLogger, 'docs/platform/authorization/parity/cert-001');

console.log(`Match rate: ${pkg.report.matchRate}%`);
console.log(`Stability: ${pkg.report.decisionStability.stabilityPercentage}%`);
console.log(`Gate passed: ${pkg.report.gatePassed}`);
```

---

## Certification Stages

| Stage | Description | Duration | Exit Criteria |
|-------|-------------|:--------:|---------------|
| **Shadow Smoke** | Verify shadow infrastructure works | 30 min | 5 smoke tests pass |
| **Passive Shadow** | Collect data from real traffic | Days–weeks | Coverage criteria met |
| **Certification Review** | Analyze evidence package | 2–4 hours | Team review completed |
| **Board Sign-off** | Go/No-Go for W4B | 1 hour | All 10 gates pass |

---

## Historical Baseline

The first certification run establishes the baseline. All subsequent runs compare against it:

```
Baseline: cert-001
  ├── cert-002: drift check vs cert-001
  ├── cert-003: drift check vs cert-001
  └── ...
```

Any `CRITICAL` or `MAJOR` drift triggers investigation before proceeding.

---

## Related Documents

| Document | Location |
|----------|----------|
| RB-02A Authorization Model | `docs/platform/authorization/RB-02A_AUTHORIZATION_MODEL.md` |
| MIGRATION_PARITY_PLAN.md | `docs/platform/authorization/MIGRATION_PARITY_PLAN.md` |
| POLICY_CATALOG.md | `docs/platform/authorization/POLICY_CATALOG.md` |
| OPERATIONAL_CERTIFICATION_GATE.md | `docs/platform/authorization/OPERATIONAL_CERTIFICATION_GATE.md` |
| GUARD_MIGRATION_MAP.md | `docs/platform/authorization/GUARD_MIGRATION_MAP.md` |
| Evidence packages | `docs/platform/authorization/parity/` |
