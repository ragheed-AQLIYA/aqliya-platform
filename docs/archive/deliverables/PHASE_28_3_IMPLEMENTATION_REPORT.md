# PHASE 28.3 — Knowledge Foundation Operations & Governance UX

**Date:** 2026-06-21  
**Status:** COMPLETE  
**Phase:** 28.3 (Operations & Governance UX)  
**Prior phases frozen:** 28.1, 28.2 — not reopened  
**Next phase:** 28.4 (cryptographic verification at activate)

---

## Summary

Phase 28.3 delivers operator visibility and governance tooling around candidate bindings, release readiness, provenance quality, and version lifecycle — without modifying release cryptographic verification, diff semantics, rollback, or activation paths.

| Deliverable | Status |
|-------------|--------|
| Foundation Dashboard KPIs (version + candidate metrics) | ✅ |
| `evaluateReleaseReadiness(versionId)` | ✅ |
| Version detail readiness + provenance display | ✅ |
| Eligible pool visibility + filters | ✅ |
| `ProvenanceSummaryCard` component | ✅ |
| `generateFoundationGovernanceReport(versionId)` | ✅ |
| Audit events (readiness + report generated) | ✅ |
| Unit tests | ✅ |

---

## Architecture Impact

- **No schema changes** — all metrics derived from existing `KnowledgeFoundationVersion`, junction bindings, and provenance manifest APIs.
- **No changes** to `release-generator.ts`, `diff-engine.ts`, `rollback-service.ts`, or `activateVersion`.
- New read-only service modules:
  - `release-readiness.ts` — governance scoring
  - `governance-report.ts` — export aggregation
  - `provenance-summary.ts` — safe manifest aggregation (no org IDs)
  - `candidate-pool-overview.ts` — platform pool stats
- Extended `getFoundationKPIs()` with `versionCounts` and `candidateMetrics`.

---

## Governance Impact

| Control | Implementation |
|---------|----------------|
| RBAC | Readiness/report/pool actions require OPERATOR or ADMIN |
| Tenant isolation | Platform-wide foundation (MODEL_B) — unchanged |
| Evidence | Readiness warns on missing evidence; provenance summary excludes raw evidence |
| Audit trail | `knowledge.foundation.readiness.generated`, `knowledge.foundation.report.generated` (informational) |
| Review/approval | Readiness requires APPROVED status — does not auto-approve |
| Export control | Governance report JSON download — read-only, operator-gated |
| AI boundary | N/A — no AI in this phase |
| Auto-release | **Explicitly not implemented** — governance display only |

---

## Files Changed

### Core libraries

| File | Change |
|------|--------|
| `src/lib/knowledge-foundation/release-readiness.ts` | **New** — `evaluateReleaseReadiness()` |
| `src/lib/knowledge-foundation/governance-report.ts` | **New** — `generateFoundationGovernanceReport()` |
| `src/lib/knowledge-foundation/provenance-summary.ts` | **New** — `summarizeProvenanceManifest()` |
| `src/lib/knowledge-foundation/candidate-pool-overview.ts` | **New** — pool overview + bound list |
| `src/lib/knowledge-foundation/types.ts` | Extended `FoundationKPIs` |
| `src/lib/knowledge-foundation/kf-service.ts` | Extended `getFoundationKPIs()` |
| `src/lib/knowledge-foundation/events.ts` | Added readiness + report event types |
| `src/lib/knowledge-foundation/audit-handler.ts` | Mapped new events |

### Actions

| File | Change |
|------|--------|
| `src/actions/knowledge-foundation/actions.ts` | Added readiness, report, provenance summary, pool overview actions |

### UI

| File | Change |
|------|--------|
| `src/components/knowledge-foundation/kpi-cards.tsx` | Version status + candidate metric cards |
| `src/components/knowledge-foundation/provenance-summary-card.tsx` | **New** — reusable provenance display |
| `src/components/knowledge-foundation/release-readiness-panel.tsx` | **New** — readiness score/blockers/warnings |
| `src/components/knowledge-foundation/version-governance-section.tsx` | **New** — readiness + export tools |
| `src/components/knowledge-foundation/candidate-pool-overview-card.tsx` | **New** — pool stats on dashboard |
| `src/components/knowledge-foundation/new-version-form.tsx` | Pool stats + filters (canonical, confidence, date) |
| `src/app/(dashboard)/knowledge-foundation/page.tsx` | Pool overview for operators |
| `src/app/(dashboard)/knowledge-foundation/[id]/page.tsx` | Readiness, provenance, released count |
| `src/app/(dashboard)/knowledge-foundation/new/page.tsx` | Pool overview passed to form |

### Tests / mocks

| File | Change |
|------|--------|
| `src/__tests__/unit/knowledge-foundation/phase-28-3-readiness.test.ts` | **New** — 6 cases |
| `src/__tests__/unit/knowledge-foundation/phase-28-3-governance-report.test.ts` | **New** — 3 cases |
| `src/__mocks__/prisma-mock.js` | Added `groupBy` for KPI tests |

---

## Test Results

| Suite | Result |
|-------|--------|
| `phase-28-3-readiness.test.ts` | Pass (6 tests) |
| `phase-28-3-governance-report.test.ts` | Pass (3 tests) |
| All `knowledge-foundation` tests | **69/69 Pass** |

### Coverage

- Ready APPROVED version with bindings
- Blocked DRAFT version
- Blocked empty bindings
- Duplicate canonical code blocker
- Missing evidence + low confidence warnings
- Released candidate count in metrics
- Provenance aggregation (no orgId leakage)
- Full governance report structure
- Blocked readiness in report

---

## Validation

| Command | Result |
|---------|--------|
| `npx prisma generate` | Pass |
| `npx tsc --noEmit` | Pass |
| `npm test -- knowledge-foundation` | Pass (69/69) |
| `npm run build` | Pass (SSO ECONNREFUSED warnings during SSG — pre-existing, no DB at build time) |

---

## Known Limitations

1. **No component RTL tests** — `@testing-library/react` is not a project dependency; provenance UI covered via `summarizeProvenanceManifest` unit tests.
2. **Passive page-load readiness** does not emit audit events; audit fires only on explicit operator refresh/export via actions.
3. **Readiness score** is heuristic (blockers −25, warnings −10) — not a certification gate; Phase 28.4 adds cryptographic verification.
4. **KPI averages** computed from full PROMOTED pool, not per-version.
5. **No bulk auto-binding** — by design (operator selects individually or via form multi-select).

---

## Next Recommended Step (Phase 28.4)

Implement cryptographic release verification at activate:

- Hash verification of release artifacts
- Trust chain / signature validation
- Activate-time integrity checks (no changes to readiness UX from 28.3)

---

## Operator Success Criteria — Verified

| Criterion | Met |
|-----------|-----|
| See release readiness | ✅ Version detail + governance section |
| Understand provenance quality | ✅ ProvenanceSummaryCard |
| Review governance health | ✅ Dashboard KPIs + pool overview |
| Assess candidate coverage | ✅ Pool stats + new-version filters |
| Generate governance report | ✅ JSON export with audit event |

**Verdict:** `PHASE_28_3_COMPLETE` · `READY_FOR_PHASE_28_4`
