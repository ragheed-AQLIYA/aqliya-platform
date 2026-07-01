# Time Study Readiness Audit

**Audit date:** 2026-06-15  
**Documents reviewed:**

- `docs/operations/client-2-firm-memory-checklist.md` (`6d712b5`)
- `docs/review/cycle-2/ECONOMICS_READINESS_SCORECARD.md`
- `docs/review/cycle-2/ASSUMPTION_RISK_REGISTER.md`
- `docs/audits/TB_MEMORY_KPI_BASELINE.md`

---

## Overall Rating

```text
READY WITH CONDITIONS
```

Process and definitions are **sufficient to start** a time study. **Execution discipline** and **Year 1 baseline capture** are the conditions — not missing engineering.

---

## 1. Definitions — Unambiguous?

| Term | Defined? | Location | Gap |
| ---- | -------- | -------- | --- |
| Hours Saved % | ✅ | `(Y1 − Y2) / Y1 × 100` | Requires frozen workflow scope |
| Human Review Hours | ✅ | Activity table: Upload, Mapping, FS, Governance | Partner level recommended by leadership; checklist has Senior/Manager/Other only |
| Memory Reuse Rate | ✅ | `firm_memory` hits / classified accounts | Script: `tb-memory-reuse-rate.mjs` |
| TRUSTED Growth | ✅ | Delta in TRUSTED count vs baseline | Baseline = 0 documented |
| Manual Corrections % | ✅ | `corrected / total` in exception log | Manual only |
| Accuracy ≥ Year 1 | ⚠️ Partial | `phase-3c:validate` or factory validate | Must pick one baseline metric per engagement |
| Auto-accept | ✅ | Exception log | Not tied to UI export |

**Verdict:** Definitions are **clear enough** for a manual study. Partner-level hours should be added as a spreadsheet column (process fix, not code).

---

## 2. Measurement Procedure — Reproducible?

| Step | Documented? | Reproducible? |
| ---- | ----------- | ------------- |
| Pre-run spreadsheet setup | ✅ Checklist §Pre-conditions | Yes |
| Year 1 timed pass | ✅ Checklist §Onboarding 1–6 | Yes if operator follows |
| Year 2 timed pass | ✅ Steps 7–9 | Yes |
| KPI script invocation | ✅ Commands with `ENGAGEMENT_ID` | Yes |
| Go/No-Go decision | ✅ >25% + accuracy | Yes |

**Gap:** No committed template spreadsheet in repo — operators copy tables from markdown. **Acceptable** for Cycle 2.

---

## 3. Reviewer Roles

| Role | Documented | In product RBAC |
| ---- | ---------- | --------------- |
| Operator | Upload, initial review | `admin`, `operator` for confirm |
| Reviewer 1 | Confirm → memory write | Same |
| Reviewer 2 | Second confirm for TRUSTED | Must be **distinct** `actorId` |
| Partner | Governance review timing | Log in spreadsheet; optional sign-off |
| Senior / Manager | Hours by seniority | Checklist table |

**Gap:** Partner not in checklist markdown table — add in spreadsheet per director guidance.

---

## 4. Activity Categories

| Category | In time log? | Notes |
| -------- | ------------ | ----- |
| Upload TB | ✅ | |
| Mapping review | ✅ | Split auto vs manual in notes |
| FS validation | ✅ | |
| Governance review | ✅ | |
| Total / Hours saved % | ✅ | |

**Sufficient** for Effective Review Reduction tracking.

---

## 5. Time Logging Instructions

| Criterion | Assessment |
| --------- | ---------- |
| Wall-clock vs estimate | ✅ Requires wall-clock per session |
| Same scope Year 1/Y2 | ✅ Explicit rule |
| Reviewer count changes | ✅ Must note |
| Exception log parallel | ✅ Required |
| In-app timer | ❌ Not available — spreadsheet only |

---

## Part 3 — KPI Traceability Audit

| KPI | Source of truth | Automated? | Confidence | Manipulation risk |
| --- | --------------- | ---------- | ---------- | ----------------- |
| **Hours Saved %** | Operator spreadsheet (activity time log) | **No** | **Medium** — depends on honest logging & scope discipline | Inflate savings by narrowing Y1 scope or estimating; **mitigate:** frozen scope doc + partner review |
| **Reuse %** | `TBClassificationHistory.source === "firm_memory"` per account, latest row; script `tb-memory-reuse-rate.mjs` | **Yes** | **High** for classification source; **Low** for economic meaning | Bulk classify without review still counts reuse; **mitigate:** Tier 1 hours gate |
| **TRUSTED Growth** | `TBMappingPattern.status` count via `phase-3d-validate-governance.ts`; org-scoped | **Yes** (snapshot) | **High** for count; **Medium** for growth rate | Single reviewer backfill never reaches TRUSTED; gaming requires 2 real reviewers — **mitigate:** live confirms only |
| **Manual Corrections %** | Operator exception log: corrected / total mappings | **No** | **Medium** | Under-report corrections if not logged during review; **mitigate:** mapping review notes column |

### Data flow summary

```text
Hours Saved     ← spreadsheet (manual)
Reuse %         ← TBClassificationHistory ← logClassificationHistory ← engine classify
TRUSTED         ← TBMappingPattern ← recordFirmMemoryFeedback ← confirmMappingAction
Corrections %   ← spreadsheet (manual)
Accuracy        ← phase-3c:validate / shalfa:validate pattern
```

---

## Conditions Before Time Study Starts

1. Create spreadsheet from checklist tables (+ Partner column).  
2. Write **Workflow Scope Definition** (1 page): which activities included, which excluded.  
3. Assign Reviewer A and Reviewer B (distinct audit user IDs).  
4. Record **Year 1 start timestamp** before any TB upload — Shalfa has no retroactive Y1 time.  
5. Do not change scope between Year 1 and Year 2 passes.

---

## Rating Summary

| Dimension | Rating |
| --------- | ------ |
| Definition clarity | **READY** |
| Procedure reproducibility | **READY WITH CONDITIONS** (discipline-dependent) |
| Tooling for Tier 1 KPI | **NOT READY** (by design — manual study) |
| Tooling for Tier 2–3 KPIs | **READY** |
| **Overall** | **READY WITH CONDITIONS** |
