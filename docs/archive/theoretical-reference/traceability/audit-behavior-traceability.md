# Audit Behaviour Traceability

## End-to-end audit workflow trace

### Step: Trial Balance

- **Input:** Source ledger export (CSV, API, or direct DB snapshot)
- **Governance Gate:** Ingestion schema validation; checksum verification against source hash
- **Actor:** Automated ingestion service
- **Output:** Normalised trial balance record with content-addressable reference
- **Evidence Link:** Ingestion manifest stored in evidence store, linked to source hash and schema version

### Step: Mapping

- **Input:** Normalised trial balance record
- **Governance Gate:** Mapping ruleset validation; unmapped account warning
- **Actor:** Mapping engine (AI-assisted) with human review trigger on unmapped accounts
- **Output:** Mapped chart of accounts with mapping justification per account
- **Evidence Link:** Mapping evidence record containing source account, target account, ruleset version, justification, and reviewer

### Step: Evidence

- **Input:** Mapped accounts requiring supporting documentation
- **Governance Gate:** Evidence quality check — completeness, format validity, checksum integrity
- **Actor:** Evidence collector (AI or API) / Human uploader
- **Output:** Evidence bundle with content-addressable hash, type tag, and timestamp
- **Evidence Link:** Evidence store entry keyed by bundle hash; linked to mapped account via `evidence_for` reference

### Step: Finding

- **Input:** Mapped accounts with associated evidence bundles
- **Governance Gate:** Analytical threshold rules; anomaly score must exceed configurable floor before finding is produced
- **Actor:** AI analysis engine / Human auditor
- **Output:** Structured finding record with severity, description, evidence references, and recommended action
- **Evidence Link:** Finding record in event store with `derived_from` references to evidence bundles and mapped accounts

### Step: Recommendation

- **Input:** Finding record
- **Governance Gate:** 4-eyes principle — recommendation must be reviewed by a second human
- **Actor:** Recommender (AI or human) / Reviewer (human, distinct from recommender)
- **Output:** Recommendation record with status (draft → submitted → reviewed → accepted / rejected)
- **Evidence Link:** Recommendation event chain; review event references the submission event via `reviews` link

### Step: Approval

- **Input:** Reviewed recommendation
- **Governance Gate:** Authority level check — approver must hold sufficient delegation for the finding severity
- **Actor:** Human approver with appropriate authority level
- **Output:** Signed approval record; may include conditional acceptance with corrective actions
- **Evidence Link:** Approval event in event store with `approves` link to recommendation; recorded with approver identity, role, and timestamp

### Step: Publication

- **Input:** Fully approved audit package
- **Governance Gate:** Publication preflight — all required approvals present, no open rejections, package integrity check
- **Actor:** Publication service (automated, triggered by final approval)
- **Output:** Published audit report with public commitment hash; read-only distribution
- **Evidence Link:** Publication event with publication hash, manifest of all contained evidence, and final approval event reference
