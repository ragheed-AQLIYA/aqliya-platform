# SPEC-GOV-07: Repository Contracts

> **Engineering Specification** | **File formats, conventions, and contracts**

---

## 1. Registry File Contracts

### CLAIM_REGISTRY.md

```
Contract:
  - Markdown table with headers: CLM-ID, Version, Type, Origin, Dimension, CapRef (optional), Claim Text, KA, Product, Auth, Evidence, Confidence, Completeness
  - Each row = one Claim
  - Sections separated by ### headers for waves
  - Metrics line at end of each section: bold **text**

Parsing:
  - Extract tables by header match
  - Extract metrics by regex: **Product: N Claims | ...**
  - Validate: no duplicate CLM-IDs
```

### product-registry.md

```
Contract:
  - Markdown table: PROD-ID, Product Name, Entity Type, KA, Authority, Current L-Level, L-Level Status, Strategic Intent, Parent, Evidence Status, Manifest Status, Dossier Status, Last Verification
  - Each row = one product
  - Required: PROD-ID must be uppercase, e.g., PROD-AUDITOS
```

### decision-registry.md

```
Contract:
  - Multiple DEC-YYYY-NNNN entries
  - Each entry: DEC-ID, Type, Product, Decision, Authority, Date, Status
  - Lifecycle states: Draft, Under Review, Approved, Rejected, Active, Superseded, Archived
```

### governance-findings-log.md

```
Contract:
  - Table: FND-ID, Severity, Product, Category, Description, Recommendation, Status, Resolved By
  - Severity: Critical, High, Medium, Low, Observation
  - Status: Open, Resolved, Accepted, Rejected
```

## 2. Entity ID Contracts

| Entity | Pattern | Regex | Example |
|--------|---------|-------|---------|
| Product | PROD-{NAME} | `^PROD-[A-Z][A-Z0-9-]+$` | PROD-AUDITOS |
| Claim | CLM-{AREA}-{NNNN} | `^CLM-[A-Z]+-\d{4}$` | CLM-AUDIT-0001 |
| Evidence | EV-{NNNN} | `^EV-\d{4}$` | EV-0001 |
| Source | SRC-{TYPE}-{NNNN} | `^SRC-(CODE\|SCHEMA\|TEST\|DOC\|OPERATION)-\d{4}$` | SRC-CODE-0001 |
| Authority | AUTH-{AREA} | `^AUTH-[A-Z][A-Z0-9-]+$` | AUTH-AUDIT |
| Decision | DEC-{YYYY}-{NNNN} | `^DEC-\d{4}-\d{4}$` | DEC-2026-0001 |
| Review | REV-{YYYY}-{NNNN} | `^REV-\d{4}-\d{4}$` | REV-2026-0001 |
| Finding | FND-{REV}-{NNNN} | `^FND-[A-Z0-9]+-\d{2}$` | FND-REV20260001-01 |
| Capability | CAP-{NNN} | `^CAP-\d{3}$` | CAP-003 |
| KnowledgeArea | KA-{NN} | `^KA-\d{2}$` | KA-10 |

## 3. File Path Contracts

| Registry | Path |
|----------|------|
| Claim Registry | docs/governance/CLAIM_REGISTRY.md |
| Product Registry | docs/governance/evidence-catalog/product-registry.md |
| Decision Registry | docs/governance/evidence-catalog/decision-registry.md |
| Findings Log | docs/governance/evidence-catalog/governance-findings-log.md |
| Manifests | docs/governance/evidence-catalog/manifests/MANIFEST-{Product}.md |
| Dossiers | docs/governance/evidence-catalog/dossiers/DOSSIER-{Product}.md |
| Coverage Matrix | docs/governance/evidence-catalog/evidence-coverage-matrix.md |
| Freshness Report | docs/governance/evidence-catalog/evidence-freshness-report.md |
| Freeze Certificate | docs/governance/m2-baseline-freeze-v2.md |
| Config | .github/gov-config.yml |
| Hashes | docs/governance/evidence-catalog/manifests/manifest-hashes.json |
