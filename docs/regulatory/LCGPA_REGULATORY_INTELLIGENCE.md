# LCGPA Regulatory Intelligence Engine — Architecture

**Status:** IMPLEMENTED (acquisition blocked at the evidence boundary — see §3)
**Module:** `src/lib/local-content/lcgpa/regulatory/`
**Rule version:** `LCGPA_RULE_VERSION = 2026-01` (frozen)
**Schema version:** `REGULATORY_SCHEMA_VERSION = 1.0.0`

---

## 1. What this system is

It is **not** a data import. It is a continuously operating regulatory
intelligence system that answers, at any point in time:

- What did LCGPA change?
- When did it change, and when does it become effective?
- What official artifact proves the change?
- What was the previous state?
- What LocalContentOS calculations, projects, tenders, suppliers, contracts and
  reports are affected?
- Was the change reviewed, and by whom?
- Which exact regulatory version produced any given calculation?

## 2. Pipeline

```
OFFICIAL LCGPA
      │
      ▼
SOURCE MONITOR ────────────► NO_CHANGE / SOURCE_UNAVAILABLE
      │ CHANGE_DETECTED
      ▼
ARTIFACT CAPTURE (raw bytes preserved first)
      │
      ▼
SHA-256 + INTEGRITY + PROVENANCE ──► QUARANTINED
      │
      ▼
PARSE (fail-closed) ───────────────► REGULATORY_DATA_PIPELINE_FAILURE
      │
      ▼
DATASET VERSION
      │
      ▼
SEMANTIC DIFF ──► CHANGE CLASSIFICATION
      │
      ├──────────────┬──────────────┐
      ▼              ▼              │
 DATA CHANGE     RULE CHANGE        │
      └──────┬───────┘              │
             ▼                      │
      IMPACT ANALYSIS               │
             │                      │
             ▼                      ▼
      GOVERNANCE GATE ──────► ALERTS + CHANGE JOURNAL
        ┌────┴────┐
        ▼         ▼
     APPROVE   REJECT
        │
        ▼
   PUBLISHED  ──(effective date)──►  ACTIVE
        │                              │
        │                        ┌─────┴─────┐
        │                        ▼           ▼
        │                    CURRENT      FUTURE
        │                        └─────┬─────┘
        ▼                              ▼
   ROLLBACK                    LCGPA COMPUTATION ENGINE
   (previous verified)                 │
                                       ▼
                              AUDITABLE RESULT
```

## 3. Evidence status (read this first)

**Resolved 2026-08-22.** The canonical LCGPA artifacts were retrieved, hashed,
parsed and ingested. Full detail in
[the artifact catalogue](./LCGPA_ARTIFACT_CATALOGUE.md).

| | |
|---|---|
| Canonical source | `https://lcgpa.gov.sa/#/ar_SA/MandatoryListNationalProducts/Documents` (Mendix SPA) |
| Artifacts retrieved | 8 (3 XLSX datasets, 5 PDF regulations) |
| Mandatory List — government entities | 1,727 products, 14 sectors, SHA-256 `93f3e1f4…` |
| Mandatory List — state-owned companies | 1,727 products, SHA-256 `f613722d…` |
| Minimum local content schedule | 1,198 products, 2026-2031, SHA-256 `acec6451…` |
| Effective-date claims on record | 73, each with a source and a confidence |
| Open regulatory conflicts | 6, all `PENDING_HUMAN_REVIEW` |
| Persistence | 12 Prisma models; migration generated and reviewed, **not applied** |

### What is deliberately unresolved

1. **Six products** (`2802, 2804, 2805, 2808, 2809, 2814` — document management,
   health information systems, ERP, vehicle GPS, e-archiving, ticket machines)
   carry a published minimum local content percentage for 2028 but do **not**
   appear in the July 2026 Mandatory List. Two TIER 1 artifacts of the same month
   disagree. Recorded as `REGULATORY_CONFLICT`; LCGPA must say which governs.
2. **No dataset-level effective date** is stated inside the workbooks. Activation
   refuses with `EFFECTIVE_DATE_UNKNOWN` until an operator records evidence.
3. **The 233-product cohort is not one fact.** SPA N2514218 says 233 products
   from 2026-08-01; the July workbook splits them 2 / 231 across 2026-08-01 and
   2027-08-01. Both claims are on record with their sources.

### Three distinctions the engine now enforces

Conflating any of these produces false regulatory facts, so each is modelled
explicitly:

| Distinction | Why it matters |
|---|---|
| **Announcement vs artifact** | An SPA announcement is `CORROBORATED` evidence about a named cohort; it never becomes a product fact |
| **Kind of date** | `تاريخ التطبيق` (list inclusion) and `تاريخ بدء إشتراط الحد الأدنى` (minimum commencement) are different dates about different things — before this distinction existed the engine reported 80 phantom "disagreements"; afterwards, zero |
| **Regime** | The same product commences on different dates for government entities and for state-owned companies. Two regimes, not a conflict |

## 4. Modules

| Module | Responsibility | Spec |
|---|---|---|
| `types.ts` | Type foundation, ports (`RegulatoryFetcher`, `Clock`, `ImpactResolver`) | — |
| `ids.ts` | Deterministic identifiers; no randomness anywhere | §33 |
| `source-registry.ts` | Sources, authority tiers, verification, scheduling, health | §4, §5, §31, §39 |
| `source-monitor.ts` | Fetch → fingerprint → compare; failure handling | §6, §7, §26 |
| `integrity.ts` | SHA-256, magic bytes, ZIP safety, macro/formula hazards | §10, §41 |
| `artifact-store.ts` | Immutable content-addressed artifacts, provenance | §8, §9, §11, §32 |
| `parser.ts` | Fail-closed parsing contract, explicit column mapping | §28, §45 |
| `versioning.ts` | Document / document-version / dataset versions, rule separation | §12, §13, §42 |
| `semantic-diff.ts` | Field-level regulatory change detection | §15, §16 |
| `change-classification.ts` | Explainable severity policy with escalation rules | §17 |
| `effective-date.ts` | Temporal state: historical / current / future resolution | §18-§20, §37 |
| `impact-analysis.ts` | Blast radius resolved from the database | §21, §22 |
| `governance.ts` | Lifecycle state machine, approval, activation, rollback | §24, §25, §50 |
| `alerts.ts` | Evidence-carrying alerts with recommended actions | §23, §30 |
| `conflict-detection.ts` | Official-source contradictions; third-party discovery signals | §29, §30 |
| `change-journal.ts` | Append-only change journal + audit trail | §34, §49 |
| `observability.ts` | Metric counters over the platform structured logger | §40 |
| `read-model.ts` | Explainability + dashboard read contracts | §36, §38 |
| `pipeline.ts` | End-to-end orchestration, stops at the first blocker | §53 |
| `calculation-binding.ts` | Binds every recorded calculation to its regulatory version | §20, §36 |
| `parsers/xlsx-reader.ts` | OOXML reader — cached cell values only, never formulas | §41 |
| `parsers/arabic-dates.ts` | Explicit Arabic + ISO date parsing, fail-closed | §45 |
| `parsers/lcgpa-mandatory-list.ts` | Mandatory List workbook parser (verified against the official artifact) | §28 |
| `parsers/lcgpa-minimum-lc.ts` | Minimum-LC schedule parser, multi-year | §19, §28 |
| `fetchers/http-fetcher.ts` | HTTPS fetcher with Mendix session handling; preserved-bytes replay | §7 |
| `persistence/repository.ts` | Prisma hydrate/persist adapter — the engine core stays pure | §5 |
| `persistence/impact-resolver.ts` | Real impact resolution with declared coverage | §21, §45 |
| `effective-date-evidence.ts` | Effective dates as sourced, contradictable claims | P0.7, §18 |
| `persistence/mappers.ts` | Prisma ↔ domain, including product version identity | §33 |

## 5. Design contract

1. **No I/O in the engine.** Network, database and time are injected through
   `RegulatoryFetcher`, `ImpactResolver` and `Clock`. Every test is
   deterministic and no test touches the network.
2. **Append-only.** Artifacts, datasets, change events and audit events are
   never overwritten or deleted.
3. **Content-addressed identity.** `artifactId = sourceId:sha256`. Re-fetching
   identical bytes is a no-op.
4. **Fail closed.** Unknown structure, unparseable value, ambiguous date,
   missing effective date, incomplete provenance — all block, none default.
5. **No implicit "latest".** Every regulatory resolution requires an explicit
   `asOf` instant.
6. **The engine detects and explains. It never interprets law.** Ambiguity goes
   to a human (§51).

## 6. Integration points

- `LCGPA_RULE_VERSION` is imported from `src/lib/local-content/lcgpa/types.ts`
  and remains frozen at `2026-01`.
- Audit events are shaped for `createLocalContentAuditEvent`
  (`src/lib/local-content/audit-events.ts`) → `PlatformAuditLog`.
- Logging uses `@/lib/observability/logger`; no parallel logging framework.
- `ImpactResolver` is the single seam the application layer implements against
  Prisma to resolve affected entities.

## 7. Related documents

- [Source registry](./LCGPA_SOURCE_REGISTRY.md)
- [Monitoring policy](./LCGPA_MONITORING_POLICY.md)
- [Change detection](./LCGPA_CHANGE_DETECTION.md)
- [Versioning](./LCGPA_VERSIONING.md)
- [Provenance](./LCGPA_PROVENANCE.md)
- [Impact analysis](./LCGPA_IMPACT_ANALYSIS.md)
- [Governance](./LCGPA_GOVERNANCE.md)
- [Artifact catalogue](./LCGPA_ARTIFACT_CATALOGUE.md)
- [Schema audit](./LCGPA_SCHEMA_AUDIT.md)
- [Operational runbook](./LCGPA_RUNBOOK.md)
