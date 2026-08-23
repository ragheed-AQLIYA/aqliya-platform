# LCGPA Versioning & Temporal State

**Modules:** `versioning.ts`, `effective-date.ts`

---

## 1. Three independent version axes

| Axis | Example | Changes when |
|---|---|---|
| **Rule version** | `LCGPA_RULE_VERSION = 2026-01` | the regulatory **methodology** changes |
| **Document version** | `2026-08`, `v.3` | LCGPA publishes a new version of a document |
| **Dataset version** | `LCGPA_MANDATORY_LIST_2026-08` | a new normalized product snapshot exists |

**A product-data update is a DATASET CHANGE. It never bumps the rule version.**
`decideRuleVersion(reviewerIndicators)` returns `requiresNewRuleVersion: false`
unless a reviewer supplies an explicit methodology indicator
(`CALCULATION_METHODOLOGY`, `RULE_INTERPRETATION`, `SCOPE_DEFINITION`,
`WEIGHTING_CHANGE`). The engine never decides this by itself.

## 2. Dataset version derivation

Preference order — the authority's own label always wins:

1. `DECLARED_VERSION` — version stated by LCGPA → `LCGPA_MANDATORY_LIST_2026-08`
2. `PUBLICATION_DATE` — publication month stated by LCGPA → `LCGPA_MANDATORY_LIST_2026-08`
3. `CONTENT_FINGERPRINT` — nothing stated → `LCGPA_MANDATORY_LIST_sha-<12 hex>`

Derivations 2 and 3 are flagged `derived: true` and must never be presented as
an official LCGPA version label.

## 3. Document vs effect

`publicationDate`, `effectiveFrom` and `effectiveTo` are copied from the
artifact and are `null` when the authority did not state them. They are never
inferred. A document published today may take effect next year.

## 4. Temporal resolution

```
DETECTED_AT     when the engine noticed
PUBLISHED_AT    when the authority published
EFFECTIVE_FROM  when the rule begins to bind
EFFECTIVE_TO    when it stops binding
```

`resolveRegulatoryState(datasets, asOf)` selects the dataset whose effectivity
window contains `asOf`, among `ACTIVE` and `SUPERSEDED` datasets, newest
effective date first. It **never** falls back to "the newest dataset":

- No dataset in force at `asOf` → `dataset: null`, `NO_STATE_RESOLVED`.
- Datasets exist but state no effective date → explicitly reported, because
  effective dates are never inferred.

`futureScheduledStates(datasets, now)` exposes approved/published datasets whose
effective date is still ahead, so the system can answer both:

```
CURRENT  Product P-00421 = 40%
FUTURE   Product P-00421 = 55%   effective 2027-01-01
```

## 5. Historical calculations

```ts
resolveForCalculation(datasets, { calculationDate, productCodes })
```

- **Throws** `CALCULATION_DATE_REQUIRED` if no date is supplied. There is no
  implicit "latest" for a historical calculation.
- Returns, per product: the resolved product, `datasetVersion`, `ruleVersion`
  and full provenance, or `outcome: "UNKNOWN"` with a rationale
  (`PRODUCT_NOT_IN_FORCE`, `PRODUCT_NOT_YET_EFFECTIVE`, `PRODUCT_EXPIRED`).
- Reports `unresolved` product codes rather than substituting values.

## 6. Reproducibility

`datasetFingerprint(dataset)` digests
`(artifactSha256, parserVersion, schemaVersion, ruleVersion, every normalized product field)`.

Given the same artifact, parser, schema and rule version, the engine reproduces
a byte-identical normalized state and an identical `datasetId`. Products are
stored sorted by product code so input ordering cannot change the result.

## 7. Dataset lifecycle statuses

```
DRAFT → PENDING_REVIEW → APPROVED → PUBLISHED → ACTIVE → SUPERSEDED
                       ↘ REJECTED           ↘ ROLLED_BACK / QUARANTINED
```

Only `ACTIVE` and `SUPERSEDED` datasets are consulted when resolving regulatory
truth. `DRAFT`, `PENDING_REVIEW`, `APPROVED` and `PUBLISHED` datasets are
invisible to calculations.

## 8. Timeline

`buildTimeline(datasets, changes)` merges publication, detection, diff,
activation and effect into one chronological view:

```
2026-01-01  EFFECTIVE   LCGPA_MANDATORY_LIST_2026-01 takes effect
2026-08-20  PUBLISHED   LCGPA published LCGPA_MANDATORY_LIST_2026-08
2026-08-21  DETECTED    System normalized LCGPA_MANDATORY_LIST_2026-08
2026-08-21  DIFFED      P-00421 MINIMUM_LC_CHANGED: 40 → 50
2026-10-01  ACTIVATED   LCGPA_MANDATORY_LIST_2026-08 activated
2026-10-01  EFFECTIVE   P-00421 MINIMUM_LC_CHANGED becomes effective
```
