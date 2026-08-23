# LCGPA Regulatory Intelligence — Operational Runbook

**Audience:** LocalContentOS data governance operators and on-call engineers
**Module:** `src/lib/local-content/lcgpa/regulatory/`

---

## 0. Current state

The engine is **operational**. As of 2026-08-22 the official LCGPA artifacts
have been retrieved, hashed, parsed and ingested to `PENDING_REVIEW`:

| Dataset | Products | SHA-256 |
|---|---:|---|
| Mandatory List — government entities (July 2026) | 1,727 | `93f3e1f4…` |
| Mandatory List — state-owned companies (July 2026) | 1,727 | `f613722d…` |
| Minimum local content schedule (July 2026) | 1,198 | `acec6451…` |

Two open items need a human, not code:

1. **Effective dates.** The workbooks state no dataset-level effective date, so
   activation refuses with `EFFECTIVE_DATE_UNKNOWN`. Supply an evidence-backed
   date at approval (§6), or leave the datasets published and inactive.
2. **A regulatory conflict.** Six product codes (`2802, 2804, 2805, 2808, 2809,
   2814`) carry a published minimum but are absent from the July 2026 Mandatory
   List. See §12.

### Everyday commands

```bash
npm run lc:regulatory:monitor                  # dry run: detect, write nothing
npm run lc:regulatory:monitor -- --commit      # detect and persist
npm run lc:regulatory:monitor -- --seed        # register seed sources (first run)
npm run lc:regulatory:activate                 # dry run: what would activate
npm run lc:regulatory:activate -- --commit     # activate approved + effective datasets
npm run lc:regulatory:ingest -- --source lcgpa-mandatory-list-government
```

The scheduled job is `.github/workflows/lcgpa-regulatory.yml` (daily 02:00 AST).
It requires `DATABASE_URL` and outbound access to `lcgpa.gov.sa`. It detects and
persists; it never approves and never activates anything a human has not already
approved.

### Database migration — READ BEFORE RUNNING

The migration is **generated and reviewed** but **not applied**:

```
prisma/migrations/20260822000000_lcgpa_regulatory_intelligence/migration.sql
```

It is purely additive — 19 `CREATE TABLE`, 83 indexes, 22 constraints, 3
nullable `ADD COLUMN`, and **zero** `DROP`/`TRUNCATE`. All 15 regulatory foreign
keys are `ON DELETE RESTRICT`.

**Do not run `prisma migrate dev`.** The development database is drifted — 238
tables but only 22 of 58 migrations recorded — so Prisma will offer to **reset**
it, dropping everything. Pick a path instead:

| Situation | Command |
|---|---|
| Apply only this migration to a drifted dev DB | `npx prisma db execute --file prisma/migrations/20260822000000_lcgpa_regulatory_intelligence/migration.sql --schema prisma/schema.prisma` |
| Fix the history properly first | `npx prisma migrate resolve --applied <name>` for each already-reflected migration, then `npx prisma migrate deploy` |
| Staging / production | `npx prisma migrate deploy` — never `migrate dev` |

Verify afterwards:

```bash
npx prisma migrate status
node -e "require('@prisma/client')"    # client matches the schema
```

Then consider the database-level hardening in
[the schema audit](./LCGPA_SCHEMA_AUDIT.md) §5 — `Restrict` stops cascades, but
only revoked grants or triggers stop a privileged `DELETE`.

### First ingestion

```bash
npm run lc:regulatory:bootstrap                 # dry run — shows the whole P0 chain
npm run lc:regulatory:bootstrap -- --commit     # persist datasets, evidence, conflicts
```

The bootstrap ingests the three preserved artifacts, derives effective-date
evidence from what each artifact states, records the SPA announcement as a
separate cohort claim, and detects the cross-artifact conflicts. It approves
nothing, activates nothing and resolves no conflict.

## 1. Verify a canonical source

**When:** a TIER 1 source is `UNVERIFIED`, or its URL has moved.

1. Open the LCGPA page from a network that can reach `lcgpa.gov.sa`.
2. Find the actual downloadable artifact behind the page — not the page itself.
   Record the **direct** URL, the filename, and the content type.
3. Capture evidence: the document reference, a screenshot, or a ticket id.
4. Apply:

```ts
const verified = verifySource(source, {
  verifiedById: "<authenticated user id>",
  verifiedAt: new Date(),
  evidence: "LCGPA documents library, entry «القائمة الإلزامية», ticket LC-1421",
  confirmedUrl: "<direct artifact URL>",
});
registry.upsert(verified);
```

5. Confirm: `canUpdateAuthoritativeState(verified).allowed === true`.
6. Audit action: `SOURCE_VERIFIED`.

**Do not** verify a source you have not personally confirmed serves the
artifact. Verification is the gate that allows regulatory truth to change.

---

## 2. Register a parser

Parsers for the three current LCGPA datasets already exist and are verified
against the official artifacts:

```ts
parsers.register("lcgpa-mandatory-list-government",
  createMandatoryListParser({ variant: "GOVERNMENT_ENTITIES" }));
parsers.register("lcgpa-mandatory-list-state-owned",
  createMandatoryListParser({ variant: "STATE_OWNED_COMPANIES" }));
parsers.register("lcgpa-minimum-lc-schedule",
  createMinimumLcParser({ effectiveYear: 2026 }));   // year is always explicit
```

An unregistered source falls back to `unresolvedArtifactParser`, which fails
closed with `EVIDENCE_BOUNDARY`. That is the correct behaviour for a source
whose structure nobody has verified.

**When LCGPA changes a column heading**, the parse fails with `MISSING_COLUMNS`
and the dataset is not created. Update the column fragments in
`parsers/lcgpa-mandatory-list.ts` (`MANDATORY_LIST_COLUMNS`) or
`parsers/lcgpa-minimum-lc.ts` (`MINIMUM_LC_COLUMNS`) after looking at the real
file. Columns are matched on the **Arabic** half of the bilingual header,
because the English half is unreliable — the published `البناء و التشييد` sheet
labels its Arabic name column "Commodity Title (English)".

**For a new delimited source**, `createDelimitedParser({ mapping })` takes an
explicit `ColumnMapping`. Dry-run it before wiring it in:

```ts
const result = await runParser(parser, artifact, rawBuffer);
// result.ok === false ⇒ read result.errors; do NOT relax validation to make it pass
```

`productCode`, `productNameAr` and `sectorCode` are mandatory. A missing mapped
column, an unparseable percentage, an ambiguous date or a duplicate code fails
the **whole** dataset by design.

## 3. Change monitoring frequency

Edit the source's `checkFrequency` (`HOURLY | DAILY | WEEKLY | ON_DEMAND`) and
upsert it. Never hardcode an interval anywhere else — `CHECK_INTERVAL_MS` is the
only table.

---

## 4. Trigger a check manually

```ts
await checkSource({ source, fetcher, clock, correlationId, force: true });
// or a whole cycle:
await runRegulatoryCycle({ ctx, sources, correlationId, datasetKey, document, force: true });
```

`force: true` bypasses the schedule only. It does **not** bypass the authority
gate, integrity validation, parsing or governance.

---

## 5. Inspect a detected change

```ts
const model = buildReadModel({ sources, datasets, journal, cases, alerts, checks, now });
model.pendingReviews          // cases awaiting a human
model.recentChanges           // journal, newest first
model.highImpactChanges       // HIGH / CRITICAL only
renderChangeEvent(model.recentChanges[0]);
```

For a single value: `renderExplanation(explainRegulatoryValue({ datasets,
productCode, field, asOf, journal, cases }))`.

---

## 6. Review, approve, reject

**Before approving**, confirm against the official artifact — not against the
diff. Compare `artifactSha256` in the case with the file you opened.

```ts
// approve
const approved = approveCase(case_, {
  actorId: "<real authenticated user id>",   // a system principal is refused
  actorName: "<name>",
  correlationId,
  clock,
  note: "Confirmed against LCGPA artifact 9f2a…; effective date matches circular.",
});

// reject
const rejected = rejectCase(case_, { ...actor, reason: "<why>" });
```

Approval alone changes nothing in production. Publish next.

---

## 7. Publish and activate

```ts
const { dataset: published, case: c } = publishDataset(dataset, approved, actor);

const result = activateDataset(published, c, {
  ...actor,
  currentActive,
  effectiveDateEvidence,   // consulted only when the artifact states no date
});
if (!result.ok) console.log(result.reason);   // e.g. NOT_YET_EFFECTIVE
```

Activation is refused before `effectiveFrom`. Schedule a job that re-attempts
activation as effective dates arrive — the refusal reason carries `activateAt`.
`npm run lc:regulatory:activate` is that job.

### When the artifact states no effective date

The July 2026 workbooks state per-product `تاريخ التطبيق` dates but **no
dataset-level effective date**, so activation refuses with
`EFFECTIVE_DATE_UNKNOWN`. Do **not** invent one. Record evidence instead:

```ts
const claim = createEffectiveDateEvidence({
  sourceId: "lcgpa-mandatory-list-government",
  datasetVersion: "LCGPA_MANDATORY_LIST_GOV_2026-07",
  scope: "DATASET",
  effectiveFrom: new Date("2026-08-01T00:00:00.000Z"),
  confidence: "ASSERTED",                    // not VERIFIED — no artifact says it
  evidence: "LCGPA letter ref …, confirming the July publication applies from 1 August 2026.",
  recordedById: "<authenticated user id>",
}, clock);
await persistEvidence(prisma, [claim]);
```

`confidence` must be honest:

| Value | Use when |
|---|---|
| `VERIFIED` | a TIER 1 artifact states it, in the document |
| `CORROBORATED` | an official TIER 2/3 source states it, but LCGPA's artifact does not |
| `ASSERTED` | an operator supplies it, with written evidence, because no artifact does |
| `DISPUTED` | a higher-confidence source contradicts it — never applied |

The activation decision records which evidence it rested on, so a later reviewer
sees that the date came from a letter rather than from the workbook.

## 8. Roll back

**When:** an activated dataset is discovered to be invalid.

```ts
const result = rollbackDataset(active, previousVerified, activeCase, {
  ...actor,
  reason: "Row 412 minimum LC did not match the official artifact.",
});
// result.quarantined  → the invalid dataset, preserved as evidence
// result.restored     → the previous verified dataset, back to ACTIVE
```

Never delete the invalid dataset. Investigate from the preserved artifact hash.

---

## 9. Investigate a parser failure

Symptom: `outcome: PARSER_FAILED`, alert `PARSING_FAILURE`, evidence
`datasetUpdated=false`.

1. The dataset was **not** updated — this is correct, not a bug to work around.
2. Take the `artifactSha256` from the alert and pull that exact artifact from
   the store (`artifacts.getByHash(sourceId, sha256)`).
3. Reproduce: `parser.parse(artifact, rawBuffer)` and read `errors`.
4. Common causes: LCGPA changed the column headers (update the mapping via §2);
   the artifact is an HTML error page (integrity would normally catch it);
   a date format changed away from ISO-8601.
5. Never loosen validation to force a parse. Fix the mapping or the parser and
   re-run.

---

## 10. Investigate a source failure

Symptom: alert `SOURCE_UNAVAILABLE` or `SOURCE_AUTHENTICATION_FAILURE`.

1. The active dataset **stays active**. Do not invalidate it.
2. Check `model.dataPipelineFailures` for `errorCode`, `attemptCount`, `retryAt`.
3. `DEGRADED` becomes `UNAVAILABLE` after 3 consecutive failures; backoff is
   2/4/8/16× the normal interval.
4. On 401/403, verify access policy for the official source. Do **not**
   substitute a third-party source.
5. If LCGPA has moved the URL, that is a re-verification (§1), not a hotfix.

---

## 11. Handle a quarantined artifact

Symptom: `outcome: ARTIFACT_QUARANTINED`, alert `DATA_VALIDATION_FAILURE`.

1. Read `artifact.integrity.errors` — e.g. `MACRO_DETECTED`, `ZIP_BOMB_SUSPECTED`,
   `MIME_MISMATCH`, `LEGACY_OLE2_REJECTED`.
2. `MIME_MISMATCH` on an `.xlsx` usually means the server returned an HTML error
   page. Re-check the URL.
3. `MACRO_DETECTED` on a genuine LCGPA file is an escalation, not an override.
   Obtain a macro-free publication.
4. Release a source quarantine only after the cause is understood:
   `releaseQuarantine(source, at)`.

---

## 12. Handle a regulatory conflict

Symptom: alert `REGULATORY_CONFLICT` (CRITICAL).

Do **not** pick a source. Escalate with both artifact hashes and both values.
`resolution` is fixed at `PENDING_HUMAN_REVIEW`; resolution is a regulatory
decision recorded by a human, not a code path.

### Open conflict as of 2026-08-22

Six product codes appear in the minimum-local-content schedule with a published
percentage but are **absent from the July 2026 Mandatory List**:

```
2802  2804  2805  2808  2809  2814
```

| | |
|---|---|
| Artifact A | `القائمة الإلزامية للجهات الحكومية (يوليو 2026).xlsx` — `93f3e1f4…` |
| Artifact B | `الحد الأدنى لنسبة المحتوى المحلي … يوليو 2026.xlsx` — `acec6451…` |

Both are TIER 1 LCGPA publications of the same month. Possible readings — a
pending addition to the list, a withdrawal not yet reflected in the schedule, or
a publication error — cannot be distinguished from the artifacts alone.

**Required action:** ask LCGPA which artifact governs these six products. Until
that is answered, they resolve as `UNKNOWN` and no calculation may treat them as
either listed or unlisted.

## 13. Reproduce a dataset

```ts
// Required inputs, all recorded in provenance:
//   artifactSha256 + parserVersion + schemaVersion + ruleVersion
const artifact = artifacts.getByHash(sourceId, artifactSha256);
const parsed   = parser.parse(artifact, rawBuffer);
datasetFingerprint(rebuiltDataset) === datasetFingerprint(originalDataset);  // must be true
```

If the fingerprints differ, the parser or schema version changed. That is a
finding, not a rounding difference.

---

## 14. Verify a SHA-256

```bash
# Linux / macOS
sha256sum mandatory-list-2026-08.xlsx

# Windows PowerShell
Get-FileHash -Algorithm SHA256 .\mandatory-list-2026-08.xlsx
```

Compare with `artifact.sha256` / `provenance.artifactSha256`. A mismatch means
you are not holding the file the system ingested.

---

## 15. Run the tests

```bash
# Regulatory intelligence suite only (fast)
npm test -- src/lib/local-content/lcgpa/regulatory

# Whole LCGPA engine (existing computation engine + regulatory intelligence)
npm test -- src/lib/local-content/lcgpa

# Type check: whole repo
npx tsc --noEmit

# Type check: regulatory module only (seconds instead of minutes)
npx tsc --noEmit -p tsconfig.regulatory.json
```

`tsconfig.regulatory.json` extends the root config and narrows `include` to the
regulatory module plus its two real dependencies (`lcgpa/types.ts`,
`observability/logger.ts`). It applies the same `strict` settings as the repo.

---

## 16. Escalation

| Situation | Action |
|---|---|
| CRITICAL change detected | Notify data governance owner same day; do not approve without artifact confirmation |
| Retroactive effective date | Escalate immediately — already-produced results fall inside the new regime |
| Regulatory conflict | Escalate with both artifacts; never resolve in code |
| Methodology change suspected | Do not approve. A rule-version decision is required first (see [versioning](./LCGPA_VERSIONING.md) §1) |
| TIER 1 source unreachable > 3 days | Escalate; active dataset stays in force meanwhile |

---

## 17. Verification against a real database (2026-08-22)

The migration and the whole chain were executed against a real PostgreSQL, in a
throwaway database (`aqliya_lcgpa_verify`), never against the dev database.

**Method.** The dev database has drifted (238 tables, 22 of 58 migrations
recorded), so the migration was verified in isolation rather than by replaying
the chain:

1. `prisma db push` of `git HEAD:prisma/schema.prisma` — the exact pre-LCGPA
   schema state.
2. `20260822000000_lcgpa_regulatory_intelligence/migration.sql` executed
   **verbatim**, with no correction. 237 → 256 tables, 12 `LcRegulatory*`
   tables, 16 regulatory foreign keys, all `ON DELETE RESTRICT`.
3. `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma`
   → **"No difference detected."**

That last step is the proof: pre-LCGPA state **+** this migration **=** the
target schema exactly. No drift, nothing missing, nothing extra.

**What the bootstrap then persisted** (`lc:regulatory:bootstrap -- --commit`):

| Table | Rows |
|---|---|
| `LcRegulatorySource` | 7 (5 TIER 1, 1 TIER 2, 1 TIER 4) |
| `LcRegulatoryArtifact` | 3, all `VERIFIED` |
| `LcRegulatoryDataset` | 3 (1727 / 1727 / 1198 products), all `DRAFT` |
| `LcRegulatoryProduct` | 4652 |
| `LcRegulatoryChange` | 4652, all baseline |
| `LcRegulatoryCase` | 3, all `PENDING_REVIEW` |
| `LcRegulatoryConflict` | 6, all `PENDING_HUMAN_REVIEW` |
| `LcRegulatoryEffectiveDateEvidence` | 73 (69 VERIFIED, 1 CORROBORATED, 3 cohort) |
| **ACTIVE datasets** | **0** |

A second identical run created nothing: content-addressed identity makes the
bootstrap idempotent. `DELETE FROM "LcRegulatorySource"` was refused
(`23503`), so persisted regulatory history cannot be removed by a delete.

**Acceptance chain, executed end to end.** With a simulated operator in the
verification database:

- A `DRAFT` dataset is unusable: `REGULATORY_STATE_UNRESOLVED`.
- Approval by `system:` is refused; a human actor is required.
- Activation is **refused** while only cohort-scoped dates are on record —
  the engine will not turn per-cohort dates into a dataset-level one.
- After a `DATASET`-scoped `EffectiveDateEvidence` is recorded (`ASSERTED`,
  attributed, with its basis), the dataset activates and the activation reason
  names the evidence that justified the date.
- A calculation binds to `LCGPA_MINIMUM_LC_sha-acec64519033`, artifact
  `acec6451…`, parser `lcgpa-minimum-lc-xlsx@1.0.0`, rule `2026-01`.
- A product whose requirement starts in 2028 resolves as `UNKNOWN` with
  `PRODUCT_NOT_YET_EFFECTIVE` — recorded, never substituted. Recording is
  refused by default and requires an explicit `allowIncompleteResolution`.
- Deleting that dataset afterwards is refused by
  `LcCalculationRun_regulatoryDatasetVersion_fkey`.
- Re-binding the same calculation date returns an identical binding.

This walk is pinned as a permanent test:
`src/lib/local-content/lcgpa/regulatory/__tests__/acceptance-chain.test.ts`.

### Two defects this surfaced

**1. The repository's migration chain is not replayable from scratch.**
`20260711153755_add_enums_ondelete` fails on a clean database in two ways:

- `DROP INDEX "KnowledgeFoundationRelease_versionId_key";` (and others) target
  indexes that back `UNIQUE` constraints; PostgreSQL refuses with `2BP01`.
- It contains `CREATE TABLE "ContentEvidence"`, which
  `20260703000001_add_content_evidence` already created.

Both belong to Knowledge Foundation, not to LCGPA, and are **out of scope for
this work** (§54). They are recorded here because they explain the dev
database's drift and because they mean `prisma migrate deploy` cannot rebuild
this database from the repository today. Prisma does not wrap migrations in
transactions, so each failure also leaves partial state behind.

**2. `migration.sql` was written with a UTF-8 BOM.** Prisma tolerates it;
`psql` and any driver that executes the file directly do not — the first
statement fails with a syntax error on the BOM character. The BOM was removed
and `migration-evidence.test.ts` now fails the build if one returns.
