# LCGPA REGULATORY INTELLIGENCE ENGINE — IMPLEMENTATION REPORT

**Date:** 2026-08-21
**Scope:** LocalContentOS only. SalesOS untouched.
**Module:** `src/lib/local-content/lcgpa/regulatory/`

---

## Repository state

| | |
|---|---|
| Baseline commits | `ed3f29f3` (computation engine), `f2908675` (data acquisition pipeline) |
| Working tree | new files only — **no existing source file modified** |
| Rule version | `LCGPA_RULE_VERSION = 2026-01` — **unchanged, still frozen** |
| Existing engine | `calculation-engine.ts`, `mandatory-list.ts`, `product-registry.ts`, `types.ts`, … left intact |
| New code | 6,620 lines across 20 modules |
| New tests | 4,114 lines across 14 suites + 2 fixture files |
| New docs | 1,220 lines across 9 documents |

Existing functionality was audited before writing anything. `product-registry.ts`
already provided SHA-256 hashing, a code-level version diff, record validation
and an import gate; it is **not** duplicated and **not** rewritten. The new
engine sits above it and supplies what it did not have: continuous monitoring,
immutable artifact versioning, field-level semantic diffing, effective-date
resolution, impact analysis, a governance gate, activation, rollback, alerting,
a change journal and an audit trail.

---

## Official sources discovered

| Source | Tier | Reachable from build env | Status |
|---|---|---|---|
| LCGPA Mandatory List documents page | 1 | **No** | UNVERIFIED |
| LCGPA Documents Library | 1 | **No** | UNVERIFIED |
| LCGPA national factories list | 1 | **No** | UNVERIFIED |
| LCGPA local content mechanisms | 1 | **No** | UNVERIFIED |
| SPA announcement N2514218 | 2 | **Yes — retrieved** | corroborating only |
| NCC Istitlaa LCGPA consultations | 2 | not fetched | corroborating only |
| LCGPA product-addition e-service | 3 | **No** | corroborating only |
| Global Trade Alert measure page | 4 | n/a | discovery only, ingestion blocked |

### Canonical source — BLOCKED AT THE EVIDENCE BOUNDARY

`lcgpa.gov.sa` did not respond to this environment's egress (robots.txt fetch
timed out on every attempt) and the Chrome browser bridge was not connected.
The device bridge has no network access.

**Therefore the canonical downloadable artifact behind the Mandatory List page
was NOT retrieved, NOT hashed and NOT verified.** Its URL, filename, content
type and column structure are all UNKNOWN to this system.

No assumption was substituted. In particular:

- No artifact URL is asserted as canonical.
- No column layout is assumed — the default parser fails closed.
- No product count is hardcoded anywhere, in code or in tests.
- The third-party figure of 1,749 products was **not** used.

### Verified corroborating evidence recorded

**SPA N2514218** (announced 2026-02-17): 233 products become subject to minimum
local content requirements from **2026-08-01**; a further cohort (split air
conditioners, water pumps, water valves, copper wires, medical devices and
supplies) from **2027-08-01**. The announcement states explicitly that the
percentages themselves are published on the LCGPA website — they are therefore
still UNKNOWN. This is TIER 2: it can corroborate and it can alert, and it can
never write to the registry.

---

## What was built

| Capability | Module | Notes |
|---|---|---|
| Source registry + authority tiers | `source-registry.ts` | TIER 1 only, and only after operator verification |
| Source discovery / monitoring | `source-monitor.ts` | fetch → fingerprint → compare; ETag/Last-Modified recorded but never authoritative |
| Monitoring frequency | `source-registry.ts` | HOURLY / DAILY / WEEKLY / ON_DEMAND, exponential backoff to 16× |
| Artifact acquisition | `artifact-store.ts` | raw bytes preserved → SHA-256 → validate → parse a copy |
| Integrity + security | `integrity.ts` | magic bytes, ZIP central-directory read without decompression, zip-bomb ratio, macro rejection, external-link and formula warnings |
| Provenance | `artifact-store.ts` | 17-field chain, completeness enforced |
| Document / dataset / product versioning | `versioning.ts` | three independent axes; rule version never bumped by data |
| Semantic diff | `semantic-diff.ts` | 16 change types incl. code-rename detection and per-requirement diffs |
| Change classification | `change-classification.ts` | documented base policy + 6 escalation rules, every severity explainable |
| Effective-date engine | `effective-date.ts` | detected / published / effective-from / effective-to kept distinct; no implicit "latest" |
| Future scheduled changes | `effective-date.ts` | `futureScheduledStates()` |
| Historical calculations | `effective-date.ts` | `resolveForCalculation()` throws without an explicit date |
| Impact analysis | `impact-analysis.ts` | counts resolved from the DB via `ImpactResolver`; never invented |
| Governance gate | `governance.ts` | 15-state machine, illegal transitions throw |
| Approval / rejection | `governance.ts` | human approval refuses system principals |
| Auto-approval | `governance.ts` | policy-controlled, **disabled by default**, fully auditable |
| Activation | `governance.ts` + `effective-date.ts` | refused before the effective date |
| Rollback | `governance.ts` | invalid dataset quarantined, never destroyed |
| Conflict detection | `conflict-detection.ts` | `PENDING_HUMAN_REVIEW`, never auto-resolved |
| Third-party blocking | `source-registry.ts`, `artifact-store.ts`, `alerts.ts` | blocked at three layers |
| Alerts | `alerts.ts` | 14 categories, evidence + recommended action on every alert |
| Change journal | `change-journal.ts` | append-only, `CHANGE-YYYY-NNNNN`, deduped |
| Audit trail | `change-journal.ts` | 18 actions, actor required, correlation ids |
| Observability | `observability.ts` | 13 metric counters over the existing platform logger |
| Read model + explainability | `read-model.ts` | answers "why did LocalContentOS use this percentage?" |
| Orchestration | `pipeline.ts` | stops at the first blocker; ends at PENDING_REVIEW, never at ACTIVE |

### Monitoring mechanism and frequency

Content hashing (SHA-256 of the raw body) is the sole basis for artifact
identity. LCGPA mandatory list and documents library are configured DAILY;
factories list, mechanisms page, consultations and third-party trackers WEEKLY;
`ON_DEMAND` sources are never scheduled. Intervals live only in
`CHECK_INTERVAL_MS`.

### Governance path

```
DETECTED → VERIFIED → PARSED → DIFFED → CLASSIFIED → IMPACT_ANALYZED
→ PENDING_REVIEW → APPROVED → PUBLISHED → (effective date) → ACTIVE
                 ↘ REJECTED                                 ↘ ROLLED_BACK
```

The pipeline never advances past `PENDING_REVIEW` on its own unless an
explicitly enabled auto-approval policy matches. Activation is a separate,
deliberate call that is refused before the effective date.

---

## Verification results

| Check | Result |
|---|---|
| TypeScript (device, repo tsconfig, `tsconfig.regulatory.json`) | **0 errors** |
| TypeScript (isolated toolchain, incl. all test files) | **0 errors** |
| New test suites | **14 suites, 267 tests, 267 passing** |
| Existing source files modified | **0** |
| Network calls in tests | **0** (all I/O injected through ports) |

Test execution environment: the repository's `node_modules` is a Windows
install, so jest cannot run inside the Linux bridge VM (`ts-jest` preset fails
to resolve there). The suite was therefore executed against an isolated
jest 29 / ts-jest 29 / typescript 5 toolchain with the repository's real
`lcgpa/types.ts` and a signature-identical stand-in for
`@/lib/observability/logger`. **The full repository suite (254 existing tests)
must be re-run on the Windows machine** — see "Remaining blockers".

### Test coverage by requirement

| Requirement | Suite |
|---|---|
| Source monitoring: unchanged / changed / unavailable / HTTP failure / invalid artifact | `source-monitor.test.ts` |
| Artifact: SHA generation, mismatch, duplicate, new version | `artifact-store.test.ts`, `integrity.test.ts` |
| Parsing: valid, malformed, missing columns, invalid values, ambiguous dates | `parser.test.ts` |
| Diff: added, removed, renamed, percentage, sector, category, effective date, code change, requirements | `semantic-diff.test.ts` |
| Versioning: historical, current, future lookup | `effective-date.test.ts` |
| Governance: pending, approved, rejected, activation, rollback, auto-approval | `governance.test.ts` |
| Impact: affected calculations / suppliers / tenders, no impact, high impact | `impact-analysis.test.ts` |
| Reproducibility: same artifact + parser + rule + dataset → same result | `pipeline.test.ts`, `golden-regulatory.test.ts` |
| Golden dataset `LCGPA_GOLDEN_2026_08` | `golden-regulatory.test.ts` |
| Security: macros, zip bombs, MIME mismatch, OLE2, size | `integrity.test.ts` |
| Authority tiers and third-party blocking | `source-registry.test.ts`, `pipeline.test.ts` |
| Alerts, conflicts, journal, audit trail | `alerts-conflicts-journal.test.ts` |
| Explainability and dashboard read model | `read-model.test.ts` |

---

## Files created

**Engine** (`src/lib/local-content/lcgpa/regulatory/`)
`types.ts`, `ids.ts`, `integrity.ts`, `source-registry.ts`, `source-monitor.ts`,
`artifact-store.ts`, `parser.ts`, `versioning.ts`, `change-classification.ts`,
`semantic-diff.ts`, `effective-date.ts`, `impact-analysis.ts`, `governance.ts`,
`alerts.ts`, `conflict-detection.ts`, `change-journal.ts`, `observability.ts`,
`read-model.ts`, `pipeline.ts`, `index.ts`

**Tests** (`.../regulatory/__tests__/`)
`fixtures.ts`, `dataset-helpers.ts`, `integrity.test.ts`,
`source-registry.test.ts`, `source-monitor.test.ts`, `artifact-store.test.ts`,
`parser.test.ts`, `change-classification.test.ts`, `semantic-diff.test.ts`,
`effective-date.test.ts`, `impact-analysis.test.ts`, `governance.test.ts`,
`alerts-conflicts-journal.test.ts`, `pipeline.test.ts`,
`golden-regulatory.test.ts`, `read-model.test.ts`

**Documentation** (`docs/regulatory/`)
`LCGPA_REGULATORY_INTELLIGENCE.md`, `LCGPA_SOURCE_REGISTRY.md`,
`LCGPA_MONITORING_POLICY.md`, `LCGPA_CHANGE_DETECTION.md`,
`LCGPA_VERSIONING.md`, `LCGPA_PROVENANCE.md`, `LCGPA_IMPACT_ANALYSIS.md`,
`LCGPA_GOVERNANCE.md`, `LCGPA_RUNBOOK.md`, this report

**Tooling**
`tsconfig.regulatory.json` — fast type check of the regulatory module

## Files modified

`docs/local-content/LCGPA_DATA_ACQUISITION.md` — added a "superseded in part"
banner pointing at the new engine. No source file was modified.

## Database / schema changes

**None.** The engine is storage-agnostic: `ArtifactStore`, `DatasetStore`,
`ChangeJournal`, `AuditTrail` and `SourceRegistry` are interfaces with in-memory
implementations. Persisting them is a deliberate follow-up (see "Future work"),
so this change carries no migration risk.

## API / service changes

**None exposed yet.** `buildReadModel()` and `explainRegulatoryValue()` are the
backend contracts a future dashboard or API route consumes. No route, server
action or Prisma model was added.

---

## Security findings

1. **Untrusted-input handling is now explicit.** Artifacts are validated before
   parsing: extension allow-list, magic-byte check, MIME/extension agreement,
   size ceiling, ZIP entry count, total uncompressed size, per-entry compression
   ratio, macro rejection, external-link warning, formula warning.
2. **ZIP inspection never decompresses.** The central directory is parsed
   directly, so a bomb is detected before expansion.
3. **HTML-served-as-document is caught.** A `.xlsx` URL returning an error page
   fails `MIME_MISMATCH` rather than reaching the parser.
4. **Formulas are not regulatory truth.** `FORMULAS_PRESENT` is raised whenever
   a calc chain exists; only cached values may be read, after validation.
5. **Legacy OLE2 `.xls` is rejected outright.**
6. **Attribution is enforced.** Acquisition, approval, activation, rollback and
   every audit event require an actor; approval refuses system principals.
7. **Prompt/data-injection surface is bounded.** Third-party content can never
   reach the registry, at three separate layers.

---

## Known limitations

1. **The engine cannot ingest anything today.** Every TIER 1 source is
   UNVERIFIED and the default parser fails closed. This is intentional and is
   the correct state given the evidence boundary — but it means no LCGPA data
   flows until an operator completes runbook §1 and §2.
2. **No XLSX parser is included.** Only a delimited (CSV/TSV) parser with an
   explicit column mapping. Writing an XLSX parser before seeing the real
   workbook would have meant inventing its structure.
3. **Storage is in-memory.** No Prisma models were added, so nothing persists
   across processes yet.
4. **No scheduler is wired.** `runRegulatoryCycle` is the entry point; the cron
   or job runner that calls it is not installed.
5. **`futureScheduledStates` includes ACTIVE datasets** whose effective date is
   in the future — correct for a "what's coming" view, worth noting for callers.
6. **The 254 existing tests were not executed in this session** (see below).

---

## Remaining blockers

| # | Blocker | Owner | Unblocks |
|---|---|---|---|
| **B1** | `lcgpa.gov.sa` unreachable from this environment; canonical artifact URL, filename, content type and column structure UNKNOWN | Data governance operator on a network that can reach LCGPA | All ingestion. Runbook §1 |
| **B2** | No verified column mapping, therefore no working parser | Same operator, after B1 | Dataset creation. Runbook §2 |
| **B3** | Minimum LC percentages for the 233 products effective 2026-08-01 are not in the SPA announcement and were not retrievable | Same operator | Populating `minimumLcPct`; currently correctly UNKNOWN |
| **B4** | Repository test suite (254 existing tests) not executed — the repo's `node_modules` is a Windows install and jest cannot run in the Linux bridge VM | Run `npm test` on the Windows machine | Confirmation of no regression (risk is minimal: zero existing files modified) |
| **B5** | Persistence layer (Prisma models for sources, artifacts, datasets, changes, cases, alerts, journal) not designed | Database agent | Cross-process durability |
| **B6** | `ImpactResolver` has no Prisma implementation | Application layer | Real affected-entity counts |

---

## Future improvements

1. Prisma models + migration for the store interfaces (B5), then swap the
   in-memory implementations at the composition root.
2. A real `ImpactResolver` over `LcCalculationRun`, `LocalContentProject`,
   supplier, tender, contract and report tables (B6).
3. An XLSX parser reading cached cell values only, once B1/B2 are cleared.
4. Scheduler wiring for `runRegulatoryCycle` plus an activation sweep that
   retries published datasets as their effective dates arrive.
5. A reviewer UI over `buildReadModel().pendingReviews` and
   `renderExplanation()`.
6. Bind the existing `calculation-engine.ts` to `resolveForCalculation()` so
   every stored calculation records the dataset and rule version that produced
   it.

---

## Final position

The system does not merely answer *"what is the current LCGPA product list?"*.
It is built to answer, continuously: what changed, when, on what official
evidence, when it becomes effective, what it affects, who approved it, and
which regulatory version produced every calculation.

What it will not do is answer any of those questions with a value it cannot
prove. The canonical LCGPA artifact could not be retrieved from this
environment, so the engine stops there, says so, and refuses to ingest —
rather than substituting a third-party figure or an assumed schema.
