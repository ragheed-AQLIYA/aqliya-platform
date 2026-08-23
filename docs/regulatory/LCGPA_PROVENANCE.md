# LCGPA Provenance & Artifact Integrity

**Modules:** `artifact-store.ts`, `integrity.ts`

---

## 1. Order of operations (non-negotiable)

```
download  →  preserve raw bytes  →  SHA-256  →  validate  →  parse a COPY
```

Never `download → modify → hash`. The raw body is fingerprinted exactly as
served; parsing operates on a copy and can never influence the hash.

## 2. SHA-256 is mandatory

- Every artifact has a 64-character SHA-256 of its raw body.
- If the hash cannot be generated, **ingestion is BLOCKED**
  (`SHA256_UNAVAILABLE`, `INGESTION_BLOCKED`).
- If the hash changes, that is a **new artifact version** — the previous
  artifact is retained forever.
- Artifact identity is content-addressed: `artifactId = ${sourceId}:${sha256}`,
  which makes re-acquisition idempotent.

## 3. Artifact record

```ts
interface RegulatoryArtifact {
  artifactId; sourceId; sourceUrl; directUrl;
  filename; mimeType; size; sha256;
  acquiredAt; acquiredBy;
  publishedAt; effectiveFrom; effectiveTo; version;   // null unless declared
  status;        // ACQUIRED | VERIFIED | PARSED | PARSE_FAILED | QUARANTINED | SUPERSEDED | REJECTED
  blockedReason;
  integrity;     // full IntegrityReport
}
```

The store is **append-only**: `supersede`, `quarantine`, `markParsed` and
`markParseFailed` change status; nothing deletes.

## 3b. Filenames come from the server

The Mendix document endpoint serves from an **extensionless** URL
(`/file?guid=…`). `deriveFilename()` therefore resolves the name in order of
authority:

1. `Content-Disposition` — `filename*` (RFC 5987, handles Arabic) then `filename`
2. the last URL path segment, when it carries an extension
3. the `name=` query parameter (Mendix double-encodes it)
4. the last path segment without an extension
5. the source id

Path separators are stripped from anything the server supplies, so a served
filename can never escape its directory.

Getting this wrong is not cosmetic: the first real ingestion attempt was
correctly **quarantined** with `EXTENSION_NOT_ALLOWED` because the filename had
resolved to `file`.

## 4. Provenance record

Required for every normalized regulatory value (`validateProvenance` enforces
completeness):

```
sourceAuthority        sourceId              sourceUrl
directArtifactUrl      artifactFilename      artifactSha256
artifactSize           acquiredAt            acquiredBy
publicationDate        effectiveFrom         effectiveTo
datasetVersion         documentVersion       parserVersion
schemaVersion          ruleVersion
```

Missing fields produce `PROVENANCE_FIELD_MISSING: <field>` and the pipeline
stops with `PROVENANCE_INCOMPLETE`. A malformed hash produces
`PROVENANCE_HASH_INVALID`.

## 5. Security validation of untrusted artifacts

All external artifacts are untrusted input. `validateArtifactIntegrity` runs:

| Check | Behaviour on failure |
|---|---|
| `SHA256_COMPUTED` | **block** — cannot ingest an unhashable artifact |
| `SIZE_WITHIN_LIMIT` (50 MB default) | **block** `ARTIFACT_TOO_LARGE` |
| `EXTENSION_ALLOWED` (`xlsx csv pdf json html htm xml`) | **block** `EXTENSION_NOT_ALLOWED` |
| `MAGIC_BYTES_DETECTED` | recorded; drives the checks below |
| legacy OLE2 `.xls` | **block** `LEGACY_OLE2_REJECTED` |
| `.xlsx` is a real ZIP container | **block** `MIME_MISMATCH` (catches an HTML error page served as a document) |
| `.pdf` begins `%PDF` | **block** `MIME_MISMATCH` |
| declared MIME vs extension | warn `DECLARED_MIME_UNEXPECTED` |
| `ZIP_DIRECTORY_READABLE` | **block** `MALFORMED_ZIP` |
| `ZIP_ENTRY_COUNT` ≤ 5000 | **block** `ZIP_ENTRY_COUNT_EXCEEDED` |
| `ZIP_TOTAL_UNCOMPRESSED` ≤ 500 MB | **block** `DECOMPRESSION_LIMIT_EXCEEDED` |
| `ZIP_COMPRESSION_RATIO` ≤ 200:1 | **block** `ZIP_BOMB_SUSPECTED` |
| `NO_MACROS` (`vbaProject.bin`, macrosheets) | **block** `MACRO_DETECTED` |
| `NO_EXTERNAL_LINKS` (`xl/externalLinks/`) | warn `EXTERNAL_LINKS_PRESENT` |
| calc chain present | warn `FORMULAS_PRESENT` |

The ZIP central directory is read **without decompressing anything**, so a bomb
is detected before any expansion. Macros are never executed. Formulas are never
treated as regulatory truth — only cached cell values may be read, and only
after explicit validation.

Any blocking error ⇒ the artifact is stored with `status: QUARANTINED` and can
never reach the registry.

## 6. Explainability

`explainRegulatoryValue()` reconstructs the full chain behind any value:

```
Product:          P-00421
Field:            minimumLcPct
Value:            50
Source Authority: LCGPA
Source URL:       https://lcgpa.gov.sa/...
Document:         2026-08
Dataset:          LCGPA_MANDATORY_LIST_2026-08
Artifact SHA-256: 9f2a…
Effective:        2026-10-01
Previous:         40
Change Event:     CHANGE-2026-00017
Approval:         user-reg-officer-1 at 2026-09-02T09:14:00Z
Rule Version:     2026-01
Parser Version:   lcgpa-mandatory-list@1.0.0
```

When nothing resolves, `outcome` is `UNKNOWN` with a rationale — never a
substituted value.
