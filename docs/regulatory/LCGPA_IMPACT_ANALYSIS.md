# LCGPA Regulatory Impact Analysis

**Module:** `impact-analysis.ts`

---

## 1. A change is a question, not an alert

When a change is detected the engine asks: *what in LocalContentOS is affected,
and how much of it?* Counts come from the database through the injected
`ImpactResolver`. Nothing is estimated, extrapolated or invented.

```ts
interface ImpactResolver {
  findAffected(productCodes: string[]): Promise<AffectedEntities>;
}

interface AffectedEntities {
  calculationIds; projectIds; tenderIds; supplierIds;
  contractIds; reportIds; complianceAssessmentIds;
}
```

The application layer implements this against Prisma. `estimatedScope` is
derived purely by counting the returned id arrays.

## 2. Impact policy

Two inputs, both reported in the rationale:

1. **Change severity** — how bad the change is
   `CRITICAL → HIGH`, `HIGH → MEDIUM`, `MEDIUM/LOW → LOW`
2. **Blast radius** — how much is touched
   `0 → NONE`, `1-5 → LOW`, `6-25 → MEDIUM`, `26-100 → HIGH`, `>100 → CRITICAL`
3. **Binding weight** — calculations + contracts + tenders carry more weight
   than passive records: `0 → NONE`, `1-5 → MEDIUM`, `>5 → HIGH`

The result is the maximum of the three. A `LOW` change touching nothing is
`NONE`. A `CRITICAL` change touching nothing is still `HIGH` — the regulation
changed even if this tenant has no exposure yet.

Every assessment carries a rationale such as:

```
highest change severity CRITICAL → HIGH; blast radius 26 entities → HIGH;
binding entities (calculations+contracts+tenders) 17 → HIGH; resolved impact HIGH
```

## 3. Assessment record

```ts
interface RegulatoryImpactAssessment {
  impactId; changeIds; diffId;
  impactLevel;            // NONE | LOW | MEDIUM | HIGH | CRITICAL
  affectedProducts;
  affected;               // the resolved id arrays
  estimatedScope;         // counts derived from `affected`
  requiresReview;
  computedAt; rationale;
}
```

## 4. Operator rendering

```
REGULATORY CHANGE

Product:   P-00421
Change:    40% → 50%
Effective: 2026-10-01

Impact:    HIGH
Affected:  14 calculations, 0 projects, 3 tenders, 7 suppliers,
           0 contracts, 2 reports, 0 compliance assessments
Review:    REQUIRED
```

Produced by `renderImpactSummary()`. Every number in it came from
`findAffected`.

## 4b. Declared coverage — a zero is not always a zero

`createPrismaImpactResolver()` resolves against the real schema and **declares
what it can and cannot answer**, because an empty array has two very different
meanings.

| Entity | State | How |
|---|---|---|
| `calculationIds` | RESOLVED | `LcCalculationRun.regulatoryDatasetVersion` → datasets stating the affected codes |
| `projectIds` | DERIVED | projects owning an affected calculation |
| `supplierIds` | DERIVED | suppliers of affected projects |
| `tenderIds` | DERIVED | `LcFinancialEvaluation` rows for affected projects |
| `reportIds` | DERIVED | `LocalContentReport` rows for affected projects |
| `complianceAssessmentIds` | DERIVED | `LcPenaltyAssessment` rows for affected projects |
| `contractIds` | **NOT_LINKED** | no contract model exists — empty means **UNKNOWN** |

`LocalContentSupplier` and `LocalContentSpendRecord` carry no LCGPA product
code, so supplier-to-product precision is not available. Matching a spend record
to a product by name similarity would manufacture a regulatory fact, so it is
not done. `describeCoverage()` and `unresolvableEntities()` expose this to
reports and the reviewer UI.

## 5. Guarantees

- An empty diff never calls the resolver and reports `impactLevel: NONE` with
  rationale `NO_CHANGES`.
- `nullImpactResolver` exists only for call sites that have determined there is
  genuinely nothing to search. It must never stand in for an unavailable
  database — a database failure is a pipeline failure, not "no impact".
- `impactId` is deterministic, so the same diff + same resolver output always
  produces the same assessment identity.
- `requiresReview` is true whenever there is at least one change and the impact
  is not `NONE`.
