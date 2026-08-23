# LCGPA Source Registry

**Module:** `src/lib/local-content/lcgpa/regulatory/source-registry.ts`

---

## 1. Authority tiers

| Tier | Name | May update authoritative state? | Role |
|---|---|---|---|
| 1 | `REGULATORY_AUTHORITY` | **Yes**, if operator-verified | LCGPA itself: documents, datasets, APIs, circulars |
| 2 | `OFFICIAL_GOVERNMENT` | No | SPA, MOF, NCC, government portals — corroboration, announcements |
| 3 | `SUPPORTING_OFFICIAL` | No | Other government sources referencing LCGPA requirements |
| 4 | `THIRD_PARTY` | **Never** | Commercial sites, consultancies, press, scraped datasets |

`canUpdateAuthoritativeState(source)` requires **all** of:

1. `authorityTier === 1`
2. `enabled === true`
3. `status !== "QUARANTINED"`
4. `verification !== null` — an authenticated operator confirmed the canonical URL

TIER 4 sources are additionally refused at acquisition
(`THIRD_PARTY_INGESTION_BLOCKED`) and at the alert layer, where they can only
produce `POSSIBLE_CHANGE_DETECTED`.

## 2. Source record

```ts
interface RegulatorySource {
  id; authority; name; description; url;
  sourceType;        // WEB_PAGE | DOCUMENT | XLSX | CSV | PDF | API | JSON | ANNOUNCEMENT | CIRCULAR
  authorityTier;     // 1 | 2 | 3 | 4
  monitoringMethod;  // HTTP_FETCH | DOCUMENT_DISCOVERY | API_POLL | FILE_FINGERPRINT | CONTENT_HASH
  checkFrequency;    // HOURLY | DAILY | WEEKLY | ON_DEMAND
  enabled;
  lastCheckedAt; lastSuccessfulCheckAt; lastFailedAt;
  lastArtifactHash; lastKnownVersion; consecutiveFailures;
  status;            // UNVERIFIED | HEALTHY | DEGRADED | UNAVAILABLE | QUARANTINED | DISABLED
  verification;      // { verifiedById, verifiedAt, evidence, confirmedUrl } | null
  createdAt; updatedAt;
}
```

## 3. Seeded sources

Verified reachable and fingerprinted on 2026-08-22. Full artifact detail in
[the artifact catalogue](./LCGPA_ARTIFACT_CATALOGUE.md).

| id | Tier | Type | Monitoring | Frequency |
|---|---|---|---|---|
| `lcgpa-mandatory-list-documents` | 1 | WEB_PAGE | DOCUMENT_DISCOVERY | DAILY |
| `lcgpa-mandatory-list-government` | 1 | XLSX | FILE_FINGERPRINT | DAILY |
| `lcgpa-mandatory-list-state-owned` | 1 | XLSX | FILE_FINGERPRINT | DAILY |
| `lcgpa-minimum-lc-schedule` | 1 | XLSX | FILE_FINGERPRINT | DAILY |
| `lcgpa-delivery-instructions` | 1 | PDF | FILE_FINGERPRINT | WEEKLY |
| `spa-lcgpa-announcements` | 2 | ANNOUNCEMENT | CONTENT_HASH | DAILY |
| `third-party-trade-alert` | 4 | WEB_PAGE | CONTENT_HASH | WEEKLY |

### Why the registry shrank

`lcgpa.gov.sa` migrated to a Mendix single-page application. The SharePoint
paths previously seeded here no longer resolve — `/ar/Regulations/DocumentsLibrary/…`
redirects to a 404 route, and `/en/Regulations/Docs-Lists/…`,
`/en/LocalContent/Pages/…` and `/en/eservices/Pages/…` time out. They were
removed rather than left in place as dead monitoring targets that would page
someone every night.

### Two monitoring methods, deliberately

- The **documents page** is monitored by `DOCUMENT_DISCOVERY`, because a
  republished document gets a **new guid** and the old artifact URL simply
  disappears. Discovery notices the replacement.
- Each **current artifact** is monitored by `FILE_FINGERPRINT`, which notices an
  in-place change to the same guid.

### Session requirement

`/file?guid=…&changedDate=…` returns **HTTP 401** without a Mendix runtime
session cookie. `createHttpFetcher()` performs the handshake against
`https://lcgpa.gov.sa/` and replays the cookies — the same thing a browser does.
The documents are public; this is not an authentication bypass.

The URL carries **no file extension**. The real filename arrives in
`Content-Disposition`, which `deriveFilename()` reads before falling back to the
URL path and then the `name=` query parameter.

### Rendering requirement

The documents page is a SPA: a plain HTTP GET returns only the ~26 KB shell. A
`DOCUMENT_DISCOVERY` fetcher for it must render the page (headless browser) to
see the published documents. `createHttpFetcher()` alone is sufficient for the
`FILE_FINGERPRINT` sources but **not** for discovery.

### Verified corroborating evidence on record

- **SPA N2514218** (2026-02-17): 233 products become subject to minimum local
  content from **2026-08-01**. In the July 2026 schedule those 233 are split
  2 / 231 across 2026-08-01 and 2027-08-01. Both statements are recorded with
  their sources; the interpretation belongs to a human (§51).

## 4. Operator verification

A TIER 1 source becomes usable only through `verifySource`:

```ts
verifySource(source, {
  verifiedById: "<authenticated user id>",
  verifiedAt: new Date(),
  evidence: "<what the operator relied on: document ref, screenshot, ticket>",
  confirmedUrl: "<the exact URL that serves the artifact>",
});
```

The confirmed URL **replaces** the registered URL, so verification is also the
correction mechanism when the seeded candidate URL turns out to be wrong.
Verification is refused without a verifier id, evidence, and a confirmed URL.

## 5. Adding a source

1. Add a `CreateSourceInput` to `SEED_SOURCE_INPUTS` (or register at runtime).
2. Choose the tier honestly. If it is not LCGPA, it is not TIER 1.
3. Choose `checkFrequency` — never hardcode an interval elsewhere.
4. For a TIER 1 source, register a parser with an explicit, verified
   `ColumnMapping` before it can produce a dataset.
5. Verify the canonical URL with `verifySource`.

See the [runbook](./LCGPA_RUNBOOK.md) for the operational procedure.
