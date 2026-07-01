# LocalContentOS — Reporting and Export Spec

**Status:** Specification only — not implemented
**Version:** 1.0

---

## MVP Outputs (7)

| #   | Output                        | Purpose                                               | Format    | Audience              |
| --- | ----------------------------- | ----------------------------------------------------- | --------- | --------------------- |
| 1   | Pilot Summary Report          | Key metrics and overall assessment                    | PDF, XLSX | Management            |
| 2   | Vendor Classification Summary | Vendor-level locality breakdown                       | PDF, XLSX | Procurement / LC team |
| 3   | Spend Classification Summary  | Transaction-level local/non-local allocation          | PDF, XLSX | Finance               |
| 4   | Evidence Gap Report           | Which classifications lack sufficient evidence        | PDF       | Compliance / LC team  |
| 5   | Findings Report               | All exceptions with severity, impact, recommendations | PDF       | Management            |
| 6   | Management Decision Memo      | Final recommendation with next steps                  | PDF       | Decision maker        |
| 7   | Export Package Index          | Complete file list of all exported items              | PDF       | Audit / archive       |

---

## Output 1: Pilot Summary Report

| Field                             | Detail                                                                                                                                    |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                       | Single-page executive summary of the pilot engagement. Enables management to understand results at a glance.                              |
| **Inputs**                        | Classification totals, evidence coverage %, exception count, findings summary                                                             |
| **Output Format**                 | PDF (print-ready), XLSX (data tables)                                                                                                     |
| **Reviewer/Approver Requirement** | Must be in Approved state before export                                                                                                   |
| **Disclaimer/Boundary Note**      | "This report is an internal management document. It does not constitute a regulatory submission or official local content certification." |
| **Audit Trail Requirement**       | `REPORT_EXPORTED` event with format, exported_by, timestamp                                                                               |

**Sections:**

1. Engagement title and period
2. Key metrics (total spend, local %, vendor count, evidence coverage, exception count)
3. Classification breakdown (local vs. non-local vs. mixed vs. unclassified)
4. Top 3 findings (most critical)
5. Evidence coverage confidence distribution
6. Recommendation

---

## Output 2: Vendor Classification Summary

| Field                             | Detail                                                                                 |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| **Purpose**                       | Detailed vendor-level report showing every vendor's classification and evidence status |
| **Inputs**                        | Vendor table with classification status, evidence confidence                           |
| **Output Format**                 | PDF (table), XLSX (sortable/filterable)                                                |
| **Reviewer/Approver Requirement** | Available in Draft state (analyst working copy). Final version locked after approval.  |
| **Audit Trail Requirement**       | Export logged per user action                                                          |

**Sections:**

1. Vendor count by classification (Local, Non-Local, Mixed, Undetermined)
2. Vendor table: vendor_id, name, CR, classification, confidence, evidence count, reviewer
3. Classification methodology note

---

## Output 3: Spend Classification Summary

| Field                       | Detail                                               |
| --------------------------- | ---------------------------------------------------- |
| **Purpose**                 | Financial summary of local content by spend category |
| **Inputs**                  | ProcurementSpendRecord with linked classifications   |
| **Output Format**           | PDF (charts + tables), XLSX (raw data)               |
| **Audit Trail Requirement** | Logged on export                                     |

**Sections:**

1. Total spend by classification (local SAR, non-local SAR, mixed SAR, unclassified SAR)
2. Category-level breakdown
3. Period comparison (if multiple periods exist)
4. Methodology note with formula disclaimer

---

## Output 4: Evidence Gap Report

| Field                       | Detail                                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Identifies which classifications have insufficient or missing evidence — the key governance output |
| **Inputs**                  | EvidenceRecord with confidence levels, related records                                             |
| **Output Format**           | PDF                                                                                                |
| **Audit Trail Requirement** | Logged on export                                                                                   |

**Sections:**

1. Evidence coverage percentage
2. Confidence distribution (High, Medium, Low, None counts)
3. Critical gaps (classifications with No evidence)
4. Expired evidence items
5. Recommended actions for each gap

---

## Output 5: Findings Report

| Field                       | Detail                                              |
| --------------------------- | --------------------------------------------------- |
| **Purpose**                 | Structured findings with management recommendations |
| **Inputs**                  | LocalContentFinding table                           |
| **Output Format**           | PDF                                                 |
| **Audit Trail Requirement** | Logged on export                                    |

**Sections:**

1. Finding count by severity
2. Each finding: ID, severity, description, evidence gap, financial impact, recommendation, owner, due date, status
3. Management response log (if already collected)
4. Unresolved items

---

## Output 6: Management Decision Memo

| Field                             | Detail                                     |
| --------------------------------- | ------------------------------------------ |
| **Purpose**                       | Final recommendation and decision document |
| **Inputs**                        | All report outputs, success scorecard      |
| **Output Format**                 | PDF                                        |
| **Reviewer/Approver Requirement** | Must be in Approved state                  |
| **Audit Trail Requirement**       | Logged with approval signature             |

**Sections:** Per `pilot-decision-memo-template.md` in the Pilot Runbook.

---

## Output 7: Export Package Index

| Field                       | Detail                                                        |
| --------------------------- | ------------------------------------------------------------- |
| **Purpose**                 | Complete manifest of all exported files for audit and archive |
| **Inputs**                  | All generated exports                                         |
| **Output Format**           | PDF                                                           |
| **Audit Trail Requirement** | Included in package                                           |

**Sections:**

1. Engagement information
2. File list with descriptions and formats
3. Evidence file index (all files with links)
4. Export date and exported by

---

## Export Format Specifications

### PDF Format

| Requirement | Detail                                                              |
| ----------- | ------------------------------------------------------------------- |
| Page size   | A4                                                                  |
| Font        | Arabic-supporting (Noto Sans Arabic or similar)                     |
| Language    | Arabic (primary), English (secondary)                               |
| Headers     | AQLIYA logo, engagement name, status, date                          |
| Footers     | Page number, confidentiality notice                                 |
| Color       | Professional — blue/grey palette, severity colors (red/amber/green) |

### XLSX Format

| Requirement | Detail                                               |
| ----------- | ---------------------------------------------------- |
| Sheets      | One per data section                                 |
| Headers     | Bold, frozen first row                               |
| Formatting  | Numbers without formulas (static export)             |
| Filters     | Auto-filters on all columns                          |
| Notes       | Methodology and disclaimer in a separate Notes sheet |

---

## Export Permission Matrix

| Output         | Draft (Analyst) | Review Ready | Approved |
| -------------- | --------------- | ------------ | -------- |
| Vendor Summary | ✓               | ✓            | ✓        |
| Spend Summary  | ✓               | ✓            | ✓        |
| Evidence Gap   | ✓               | ✓            | ✓        |
| Findings       | —               | ✓            | ✓        |
| Pilot Summary  | —               | —            | ✓        |
| Decision Memo  | —               | —            | ✓        |
| Package Index  | —               | —            | ✓        |
