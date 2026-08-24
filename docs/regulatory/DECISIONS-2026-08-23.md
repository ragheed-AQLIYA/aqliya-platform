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

## 6. Independent Review Record — RV-2026-08-23-01

> **⚠️ Nature of this review:** performed by a system delegate filling the human-reviewer role under the same Owner Directive. It is an independent *evidence* examination (adversarial, source-first), **not** an external human seal. Both verdicts are recorded in ledger history with kind `INDEPENDENT_REVIEW`.

**Verdict for both DRs: ACCEPTED WITH CONDITIONS.**

### Evidence verified against live DB and on-disk official artifacts

| # | Check | Result |
|---|---|---|
| V1 | MIN_LC product date distribution | **Exact match:** 2 @ 2026-08-01, 231 @ 2027-08-01, 965 @ 2028-06-01 (total 1,198) |
| V2 | Dataset-level date provenance | Artifacts state dates only per-product; anchor `2026-08-01` = earliest cohort → valid ASSERTED evidence |
| V3 | Artifact integrity chain | All three XLSX SHA-256 on disk match DB identities; binding target `f613722d4017…` = SOC list file hash — chain closed: file → hash → dataset → calculation run |
| V4 | Six conflict codes | All six ABSENT from GOV/SOC lists, present ONLY in MIN_LC with `effectiveFrom=2028-06-01` **and `minLcPct=NULL`** — membership without stated percentage strengthens exclusion (no enforceable obligation exists to waive) |
| V5 | Resolver adversarial read | No code path binds a future-dated dataset or product row before its instant (concurs with security verdict) |

### Conditions that keep this review non-final

1. **Permanent-open:** direct LCGPA inquiry on codes 2802/2804/2805/2808/2809/2814 (OPEN_ITEMS 5.6). No system review can substitute an authority response.
2. External confirmation that LCGPA published no contradicting dataset-level effective date.
3. SPA N2514218 amendment covering the 231-product phase split.
4. Strict-audit follow-up (`writePlatformAuditLog` non-strict default) before production promotion.

Ledger writer: `scripts/localcontent/lcgpa-record-review.ts` (idempotent via `RV-2026-08-23-01` marker).

---

*Issued 2026-08-23 under delegated owner authority. Independently reviewed same-day (§6) with conditions open; external human seal still required.*
