# LocalContentOS Data Templates Pack

**Status:** Pilot Template Pack — not software
**Version:** 1.0
**Phase:** Phase 1 (Data Templates) — maps to roadmap Phase 1 in the Discovery Pack
**Depends on:** `docs/product/localcontentos-discovery-pack/`

---

## Purpose

This pack contains customer-fillable data templates for a future **LocalContentOS analyst-led pilot**.

These templates are not a software application. They are structured documents (Markdown specs + CSV headers) that define:

- What data the customer must prepare
- How to format and submit the data
- Validation rules for each field
- Evidence requirements for local content classification

The templates enable an AQLIYA analyst to process customer data manually — without any software implementation — and produce a local content assessment, findings report, and pilot summary.

---

## Status

- **Product:** Discovery / Planned — not implemented
- **Templates:** Complete — ready for pilot conversations
- **Software:** None — no code, no schema, no routes, no UI

---

## How to Use the Templates

1. **Read the Discovery Pack first** — understand the product concept, workflow, and data requirements
2. **Identify a pilot customer** — use ICP and use cases from the discovery pack
3. **Send customer instructions** — share `customer-instructions.md` with the customer
4. **Customer fills templates** — customer provides data in CSV files following the template specs
5. **Analyst reviews data** — use `analyst-review-guide.md` for intake and quality checks
6. **Process and report** — analyst processes data, classifies, identifies gaps, and produces pilot summary

---

## Template Index

| Template                | File                                                                  | Priority  | Purpose                                                |
| ----------------------- | --------------------------------------------------------------------- | --------- | ------------------------------------------------------ |
| Vendor Master           | `vendor-master-template.md` + `csv/vendor-master.csv`                 | Essential | Supplier identification and locality classification    |
| Procurement Spend       | `procurement-spend-template.md` + `csv/procurement-spend.csv`         | Essential | Transaction classification and local spend calculation |
| Contracts               | `contracts-template.md` + `csv/contracts.csv`                         | High      | Multi-period commitment tracking                       |
| Evidence Register       | `evidence-register-template.md` + `csv/evidence-register.csv`         | High      | Evidence management and confidence assessment          |
| Classification Review   | `classification-review-template.md` + `csv/classification-review.csv` | Required  | Review and override decisions                          |
| Exceptions and Findings | `exceptions-findings-template.md` + `csv/exceptions-findings.csv`     | Required  | Gap analysis and management review                     |
| Pilot Summary           | `pilot-summary-template.md` + `csv/pilot-summary.csv`                 | Required  | Final pilot assessment and recommendation              |

---

## Required vs. Optional Templates

| Template                | Required for Pilot | Can Be Skipped?                            |
| ----------------------- | ------------------ | ------------------------------------------ |
| Vendor Master           | **Yes**            | No — essential for supplier classification |
| Procurement Spend       | **Yes**            | No — essential for spend calculation       |
| Contracts               | Recommended        | Yes — if no contract data available        |
| Evidence Register       | **Yes**            | No — essential for evidence governance     |
| Classification Review   | **Yes**            | No — captures human review decisions       |
| Exceptions and Findings | **Yes**            | No — captures gaps and recommendations     |
| Pilot Summary           | **Yes**            | No — required for pilot completion         |

---

## Data Sensitivity Note

- Some fields contain commercially sensitive information (spend amounts, supplier contracts)
- Customer should anonymize or aggregate sensitive data if needed for the pilot
- All data is handled per AQLIYA data processing agreements
- Do not include personal data (individual names, IDs) unless explicitly required
- Evidence files should be redacted of unnecessary sensitive information

---

## Regulatory Boundary

These templates are designed for **internal local content governance and measurement support**. They do not:

- Constitute an official regulatory submission
- Replace statutory local content reporting
- Represent LCGPA or any regulatory body's endorsed format
- Provide binding legal or compliance determinations

All classification criteria and calculation logic must be validated against applicable regulations and customer-specific policies before production use.

---

## Relationship to Discovery Pack

| Discovery Pack Document        | Maps To                                                      |
| ------------------------------ | ------------------------------------------------------------ |
| `product-definition.md`        | Product scope and boundaries for template design             |
| `workflow-design.md`           | Steps 3–10: data upload → classification → evidence → review |
| `data-requirements.md`         | Field-level requirements for each template                   |
| `local-content-logic-model.md` | Classification criteria and evidence confidence              |
| `pilot-offer.md`               | Pilot scope and what customer provides                       |
| `roadmap.md`                   | This is Phase 1 (Data Templates)                             |
