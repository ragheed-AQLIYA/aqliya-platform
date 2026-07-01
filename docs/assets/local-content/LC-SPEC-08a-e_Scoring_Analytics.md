# LC-SPEC-08a-e: Scoring & Analytics — All Specs

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Parent:** `LC-PRD-08_Scoring_Analytics.md`
> **Template:** LC-SPEC-01a–01e (Golden Reference)
> **Epic:** LC-EPIC-08

---

## Domain Specification (LC-SPEC-08a)

### Entities
No separate model. Scoring is computed at query time from suppliers, spend records, classifications, evidence, and findings.

### Value Objects
| Object | Values |
|---|---|
| ScoringResult | `{ localContentPercentage, totalSpend, supplierCounts, evidenceStats, findingStats }` |
| SpendAnalytics | `{ totalSpend, byCategory, byPeriod, metrics }` |

---

## API Specification (LC-SPEC-08b)

| Action | Signature | Permission |
|---|---|---|
| `getLocalContentSpendAnalyticsAction` | `() ⇒ ActionResult<SpendAnalytics>` | `VIEWER` |
| `calculateProjectScoreAction` | `(projectId) ⇒ ActionResult<ScoringResult>` | `view` |

*(calculateProjectScoreAction called internally by report generation)*

---

## Workflow Specification (LC-SPEC-08c)

### Scoring Flow
```
1. Triggered by report generation (LC-EPIC-05) or dashboard load
2. Server fetches all project data in parallel (suppliers, spend, classification, evidence, findings)
3. For each supplier: calculate 4-factor weighted score
4. Aggregate: supplier scores, spend-weighted local %, evidence coverage, finding stats
5. Return ScoringResult
```

### Analytics Flow
```
1. Triggered by organization dashboard
2. Server lists all projects for organization
3. For each project: fetch spend records enriched with supplier data
4. Build analytics: total spend, by category, by period
5. Return SpendAnalytics
```

---

## UX Specification (LC-SPEC-08d)

### Dashboard (`/local-content/projects`)

| Card | Data Source |
|---|---|
| Total Spend | `getOrganizationSpendAnalytics` |
| Supplier Count | Per-project aggregation |
| Local Content % | Scoring result |
| Evidence Coverage | Evidence status stats |

---

## Test Specification (LC-SPEC-08e)

| File | Tests | What It Tests |
|---|---|---|
| `scoring.test.ts` | 18 weight tests + full scoring | All 4 factors + aggregation |
| `spend-analytics.test.ts` | Analytics | `buildOrganizationSpendAnalytics` |

### Key Scenarios
```
✓ scoreLocalityFactor: local→40, non_local→0, mixed proportional
✓ scoreOwnershipFactor: Saudi→25, foreign→4, joint_venture→15
✓ scoreWorkforceFactor: 100%→20, 50%→10, null→8
✓ scoreDeclaredContent: 100%→15, 0%→0
✓ calculateFullScoring: aggregates all factors correctly
✓ buildOrganizationSpendAnalytics: handles empty, single, multi-project
```

---

## Freeze Checklist — LC-EPIC-08

| Check | Status |
|---|---|
| All 5 Specs Frozen | ✅ LC-PRD-08 + LC-SPEC-08a–08e |
| Code Evidence Verified | ✅ scoring.ts (390 lines, 18 tests), spend-analytics.ts, scoring.test.ts |
| Architecture Drift | None |
