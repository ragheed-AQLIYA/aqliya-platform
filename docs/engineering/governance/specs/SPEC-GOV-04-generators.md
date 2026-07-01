# SPEC-GOV-04: Generators

> **Engineering Specification** | **Derived Artifacts Rule (GR-002)**  

---

## 1. Manifest Generator

```
Input: Product PROD-ID, Claims for product, Evidence items
Output: MANIFEST-{Product}.md + manifest-hashes.json

Process:
  1. Load all Claims for product (CLM-{AREA}-NNNN)
  2. Resolve all Evidence refs (EV-NNNN)
  3. Compute T1–T7 coverage from Evidence
  4. Compute Integrity Score (6 components)
  5. Generate Dependency Graph (CLM → EV → SRC)
  6. Compute Coverage Drift (compare with previous run)
  7. Generate Governance Stability section
  8. Hash the output (SHA256)
  9. Write MANIFEST-{Product}.md
  10. Update manifest-hashes.json
  11. Update manifest-index.md

Validation:
  - Determinism: same input → same hash
  - Reverse: extract claims from Manifest → 100% match registry
```

## 2. Dossier Generator

```
Input: MANIFEST-{Product}.md, DoD Rubric data, Strategic Intent
Output: DOSSIER-{Product}.md

Process:
  1. Read Manifest
  2. Add Executive Summary (auto-generated from Manifest summary)
  3. Add Product Identity (from Product Registry)
  4. Add Strategic Intent (from Decision Registry)
  5. Add Current Governance Status
  6. Add Claim Summary (from Manifest)
  7. Add Evidence Summary (from Manifest)
  8. Add DoD Rubric (mapped from AGENTS.md §21)
  9. Add Risks (auto-generated from evidence gaps)
  10. Add Outstanding Decisions (from Decision Registry)
  11. Add Governance Recommendation
  12. Add Appendices (Manifest Hash, Evidence Map, Freshness, History)
```

## 3. Coverage Generator

```
Input: All Products, their Claims, their Evidence
Output: evidence-coverage-matrix.md

Process:
  1. Per product: compute T1–T7 scores
  2. Compute Evidence Quality distribution
  3. Compute Coverage Quality Index
  4. Compute Evidence Concentration
  5. Compute Cross-product Reuse Ratio
  6. Compute Authority Coverage
  7. Validate Confidence assignments
```

## 4. Freshness Generator

```
Input: All Evidence items
Output: evidence-freshness-report.md

Process:
  1. For each EV: compare Expires to today
  2. Categorize: fresh, expiring (≤30 days), expired
  3. Group by product
  4. Group by reviewer
```

## 5. Decision Package Generator

```
Input: Product DOSSIER, Outstanding Decisions, Findings
Output: governance-review-brief.md

Process:
  1. Compile all product Dossiers
  2. List outstanding decisions
  3. List open findings (FND)
  4. Generate next steps
```

## 6. Hash Generator

```typescript
interface HashManifest {
  generated: string;         // date
  generator: string;         // version
  manifests: {
    [filename: string]: {
      version: string;
      hash: string;          // SHA256
      claims: number;
      products: string[];
    };
  };
  total_manifests: number;
  total_claims: number;
}
```

## 7. Determinism Requirements

All generators must pass:
1. Same input → same output (identical hash)
2. No random elements
3. No time-based content (except explicit timestamps)
4. Stable sort order for all lists
