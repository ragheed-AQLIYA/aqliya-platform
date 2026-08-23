# LCGPA Semantic Change Detection & Classification

**Modules:** `semantic-diff.ts`, `change-classification.ts`

---

## 1. Beyond FILE_CHANGED

A hash difference tells you nothing regulatory. The diff engine determines what
changed **inside** the content, per product, per field.

## 2. Change types

```
PRODUCT_ADDED              PRODUCT_REMOVED            PRODUCT_RESTORED
PRODUCT_RENAMED            PRODUCT_CODE_CHANGED       PRODUCT_DESCRIPTION_CHANGED
CATEGORY_CHANGED           SECTOR_CHANGED             HS_CODE_CHANGED
MINIMUM_LC_CHANGED         REQUIREMENT_ADDED          REQUIREMENT_REMOVED
EFFECTIVE_DATE_CHANGED     EXPIRY_DATE_CHANGED        APPLICABILITY_CHANGED
REGULATORY_STATUS_CHANGED  PRICE_CEILING_CHANGED      BASELINE_REQUIREMENT_CHANGED
MINIMUM_LC_SCHEDULE_CHANGED
```

The last three exist because the official artifacts publish them:
`السقف السعري` (price ceiling), `الحد الأدنى لخط الأساس لمصنع المنتج`
(manufacturer baseline), and the multi-year `نسبة الحد الأدنى لعام YYYY`
schedule. A schedule is compared as a whole and serialised as
`2026:23;2027:27;…;2031:TBD`, so a moved year or a changed future percentage is
one legible change rather than six.

Special cases:

- **Product code rename.** A code that disappears while another appears with the
  same Arabic name and sector is reported once as `PRODUCT_CODE_CHANGED`, not as
  an unrelated removal plus addition.
- **Restoration.** `REMOVED → ACTIVE` is reported as `PRODUCT_RESTORED` and
  suppresses the redundant `REGULATORY_STATUS_CHANGED`.
- **Requirements.** Set difference; one change record per requirement.
- **First observation.** With no prior dataset every product is `PRODUCT_ADDED`
  and `datasetBefore` is `null`. The diff is flagged `isBaseline: true`.

### Baselines are not changes

Every product in a first observation carries a historical effective date, so the
retroactivity escalation would fire on all of them — the first real ingestion of
the Mandatory List produced 1,724 CRITICAL changes before this was fixed. A
baseline is the system **learning the existing state**, not the authority
changing it. Therefore:

- the retroactivity escalation is suppressed when `isBaseline` is true;
- the alert engine emits **one** `NEW_REGULATION` alert summarising the baseline
  instead of one alert per product.

Once a baseline exists, the retroactivity rule applies in full.

## 3. Change record

```ts
interface RegulatoryChange {
  changeId;             // deterministic
  datasetBefore; datasetAfter;
  productCode; changeType; field;
  oldValue; newValue;   // normalized strings, null stays null
  detectedAt;
  effectiveFrom;        // as stated by the artifact; null when unstated
  sourceArtifactBefore; sourceArtifactAfter;   // SHA-256 on both sides
  severity; severityRationale;
}
```

Example:

```
PRODUCT: P-00421
BEFORE:  Minimum LC = 40%   Effective = 2026-01-01
AFTER:   Minimum LC = 50%   Effective = 2026-10-01

CHANGE_TYPE:    MINIMUM_LC_CHANGED
OLD_VALUE:      40
NEW_VALUE:      50
EFFECTIVE_FROM: 2026-10-01
SEVERITY:       CRITICAL
RATIONALE:      [POL-CRIT-LC-INCREASE] Minimum local content increased from
                40% to 50%. Previously compliant results can become non-compliant.
```

## 4. Severity policy

Base policy — every change type has a documented entry with a `policyId`:

| Severity | Applies to |
|---|---|
| `LOW` | `PRODUCT_RENAMED`, `PRODUCT_DESCRIPTION_CHANGED` — labelling only |
| `MEDIUM` | `CATEGORY_CHANGED`, `SECTOR_CHANGED`, `HS_CODE_CHANGED` — classification routing |
| `HIGH` | scope (`PRODUCT_ADDED/REMOVED/RESTORED`, `APPLICABILITY_CHANGED`), identity (`PRODUCT_CODE_CHANGED`), requirement (`MINIMUM_LC_CHANGED`, `REQUIREMENT_*`), timing (`EFFECTIVE_DATE_CHANGED`, `EXPIRY_DATE_CHANGED`) |
| `CRITICAL` | `REGULATORY_STATUS_CHANGED` |

Escalation rules, applied in order:

| Rule | policyId | Effect |
|---|---|---|
| Reviewer-confirmed methodology change | `POL-CRIT-METHODOLOGY` | → CRITICAL, requires a new rule version |
| New value effective **before** detection | `POL-CRIT-RETROACTIVE` | → CRITICAL (MEDIUM and above only) |
| Minimum LC introduced where none existed | `POL-CRIT-LC-INTRODUCED` | → CRITICAL |
| Minimum LC increased | `POL-CRIT-LC-INCREASE` | → CRITICAL |
| Minimum LC withdrawn | `POL-HIGH-LC-WITHDRAWN` | stays HIGH; value becomes **UNKNOWN, not zero** |
| Effective date moved earlier | `POL-CRIT-DATE-ADVANCED` | → CRITICAL |

`classifyChange()` always returns `{ severity, policyId, rationale }`, so every
severity in the UI can be explained. `describeSeverityPolicy()` renders the
whole table for the runbook.

## 5. Determinism

Change ids are `CHG-<16 hex>` derived from
`(datasetBefore, datasetAfter, productCode, changeType, field, oldValue, newValue)`.
Changes are sorted by product code, then type, then field. The same pair of
datasets always yields the same diff id and the same change ids.

## 6. Conflict detection

`detectConflicts()` compares datasets from two **different official** sources.
Where both state a value for the same product field and the values differ, a
`RegulatoryConflict` is recorded with both artifact hashes and both values, and
`resolution` is fixed at `PENDING_HUMAN_REVIEW`. The engine never picks a
winner. Silence on one side is not disagreement. Third-party sources can never
raise a conflict — they raise a discovery signal instead.
