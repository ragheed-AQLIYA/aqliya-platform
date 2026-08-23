# Operator-Delegate Decision Records — 2026-08-23

**Status:** PUBLISHED (governance ledger) | **Authority:** Delegated under Owner Directive Session 2026-08-23 | **Human re-verification:** PENDING

> ⚠️ **Delegated authority notice:** Both decisions below were issued and recorded by an `owner-delegated-operator` under the explicit authorization "Owner Directive Session 2026-08-23". They are binding operational defaults, not regulator confirmations. A real-human reviewer must complete the open review requirements in §4 before these defaults can be treated as externally verified.

---

## 1. DR-2026-08-23-01 — Effective Date Reconciliation

| Field | Value |
|-------|-------|
| Decision ID | DR-2026-08-23-01 |
| Governance case | `case-dr-2026-08-23-01` (PUBLISHED) |
| Actor | `owner-delegated-operator` |
| Authorization | "Owner Directive Session 2026-08-23" |
| Recorded by | `scripts/localcontent/lcgpa-record-decisions.ts` (idempotent governance ledger writer) |

### Decision

Dataset-level `effectiveFrom = 2026-08-01` is **CONFIRMED** for all three LCGPA regulatory datasets (LCGPA_MANDATORY_LIST_GOV, LCGPA_MANDATORY_LIST_SOC, LCGPA_MINIMUM_LC).

Product-level MIN_LC commence dates (2027-08-01: 231 products; 2028-06-01: 965 products) remain **authoritative-as-published future phases** — they are not overridden and become enforceable only when their dates come into force.

### Resolver defect fixed

The effective-date resolver previously mishandled the case where a dataset-level effectiveFrom equals the dataset's own activation date while product-level MIN_LC entries carry future dates. Fixed behavior:

1. **Mandatory-list precedence at equal dataset effectiveFrom:** when Mandatory List and MIN_LC datasets share the same dataset-level effectiveFrom, the Mandatory List governs.
2. **Per-product fall-through to in-force candidates:** where no mandatory-list entry applies for a product, resolution falls through per-product to whichever candidate schedule is actually in force as of `regulatoryAsOf`.

### Rationale summary

First observation is a baseline, not retroactivity. The earliest commencement date (2026-08-01) matches SPA N2514218 announcement timing; later dates are declared future phases that must not be applied early.

---

## 2. DR-2026-08-23-02 — Six-Product Conflict Resolution

| Field | Value |
|-------|-------|
| Decision ID | DR-2026-08-23-02 |
| Governance case | `case-dr-2026-08-23-02` (PUBLISHED) |
| Actor | `owner-delegated-operator` |
| Authorization | "Owner Directive Session 2026-08-23" |
| Recorded by | `scripts/localcontent/lcgpa-record-decisions.ts` (idempotent governance ledger writer) |

### Decision

Codes **2802, 2804, 2805, 2808, 2809, 2814** are CONFIRMED as **"Mandatory List governs."** These products are excluded from mandatory classification because they do not appear in the July 2026 Mandatory List.

This decision **ratifies Option B** from the original conflict analysis and **supersedes the Option C narrative** in `docs/regulatory/LCGPA_CONFLICT_ANALYSIS.md`. The CONFLICT_ANALYSIS document remains as historical analysis only; the governing decision is this record.

### Rationale summary

The Mandatory List is the primary enforcement instrument under LCGPA. If a product is not listed, it cannot be mandatory. This default excludes uncertain products rather than incorrectly mandating them — fail-safe direction.

---

## 3. Runtime Evidence Supporting Both Decisions

- E2E verification (`scripts/localcontent/e2e-lcgpa-scoring.ts`) now achieves `recordable=true`: an `LcCalculationRun` row persisted with `datasetVersion`, `artifactSha256`, and `regulatoryAsOf`.
- Persistence bound to artifact **`LCGPA_MANDATORY_LIST_SOC_sha-f613722d4017…`**.
- LCGPA test suite: **743/743 passing**, including 3 new persistence-gate tests.
- Audit-write made **blocking** inside `computeLcgpaWorkbookScoreAction` (scoring fails closed if audit trail write fails).

---

## 4. Open Review Requirements — Real-Human Reviewer

These items remain open and require a human reviewer with access to official LCGPA sources. Neither decision may be treated as externally verified until closed.

| # | Requirement | Applies to | Description |
|---|-------------|------------|-------------|
| R-1 | Verify SPA N2514218 amendment regarding 231-product rescheduling | DR-2026-08-23-01 | Confirm whether any amendment to SPA N2514218 reschedules the 231 products currently dated 2027-08-01. If rescheduled, re-run the governance cycle (rollback → re-ingest → re-activate). |
| R-2 | Direct inquiry to LCGPA on the six codes | DR-2026-08-23-02 | Submit a direct inquiry to LCGPA covering codes 2802, 2804, 2805, 2808, 2809, 2814 to obtain an authoritative ruling on mandatory-list vs minimum-LC precedence. Record the response as a new governance case. |

---

## 5. Ledger Publication

Both decisions were written to the governance ledger by `scripts/localcontent/lcgpa-record-decisions.ts`:

```
npx tsx scripts/localcontent/lcgpa-record-decisions.ts
```

The script is idempotent: re-running does not duplicate cases. Cases `case-dr-2026-08-23-01` and `case-dr-2026-08-23-02` are PUBLISHED.

---

*Issued 2026-08-23 under delegated owner authority. Human re-verification pending per §4.*
