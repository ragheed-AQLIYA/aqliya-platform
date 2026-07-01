# LocalContentOS — Local Content Logic Model

**Status:** Discovery / Planned (not implemented)
**Version:** 1.0 — Discovery Pack — Conceptual, Non-Final

---

## Important Disclaimer

This document describes a **conceptual logic model** for local content measurement. It is:

- NOT an official regulatory formula
- NOT a binding legal or compliance calculation
- NOT validated against LCGPA, SASO, or any other official framework

**Formulas and logic in this document must be validated against:**

- Official Saudi regulations and standards
- Customer-specific local content policies and commitments
- Applicable contractual obligations
- Legal and compliance requirements of the customer's industry

The purpose of this model is to inform product design, data requirements, and workflow planning — not to serve as a production calculation engine.

---

## Conceptual Logic Components

### 1. Supplier Locality

Determines whether a supplier is classified as local or non-local.

| Factor                              | Description                                      | Data Source                        |
| ----------------------------------- | ------------------------------------------------ | ---------------------------------- |
| **Registration Country**            | Country where the supplier is legally registered | Vendor master (CR)                 |
| **Ownership**                       | Majority Saudi ownership (≥51%)                  | CR, ownership documents            |
| **Manufacturing / Operations Base** | Where the supplier manufactures or operates      | Supplier declaration, certificates |
| **Local Content Certificate**       | Official certification of local status           | LCGPA/SASO certificate             |
| **Classification Basis**            | Why the supplier is classified as local          | Customer classification, evidence  |

**Locality Outcomes:**

- **Local** — Meets local criteria (Saudi registered, Saudi owned, Saudi operations)
- **Non-Local** — Does not meet local criteria
- **Mixed** — Partially local (e.g., local distributor for non-local manufacturer)
- **Undetermined** — Insufficient data to classify

---

### 2. Spend Locality

Classifies procurement spend based on supplier locality and transaction characteristics.

| Classification         | Description                                      |
| ---------------------- | ------------------------------------------------ |
| **Local Spend**        | Spend with suppliers classified as Local         |
| **Non-Local Spend**    | Spend with suppliers classified as Non-Local     |
| **Mixed Spend**        | Spend with Mixed suppliers (partial attribution) |
| **Unclassified Spend** | Spend with Undetermined suppliers                |

**Conceptual Metrics:**

- `Local Spend % = Local Spend / Total Spend × 100`
- `Non-Local Spend % = Non-Local Spend / Total Spend × 100`
- `Mixed Attribution = Mixed Spend × Mixed Attribution Factor`

---

### 3. Contract Locality

Tracks local content commitments and performance at the contract level.

| Element                           | Description                                    |
| --------------------------------- | ---------------------------------------------- |
| **Contract Local Content Target** | Local content percentage committed in contract |
| **Contract Local Spend Actual**   | Actual local spend against contract            |
| **Contract Local Content Gap**    | Target minus actual                            |
| **Commitment Period**             | Period over which commitment is measured       |

**Conceptual Tracking:**

- Gap analysis: Expected vs. actual local content
- Cumulative tracking across multiple periods for multi-year contracts
- Exception flagging when performance deviates significantly from commitment

---

### 4. Workforce / Local Participation (if applicable)

Measures local workforce contribution to local content.

| Element                    | Description                               | Data Source           |
| -------------------------- | ----------------------------------------- | --------------------- |
| **Saudi Workforce %**      | Saudi employees as % of total             | HR/payroll data       |
| **Local Workforce Spend**  | Salaries and benefits for Saudi employees | Payroll data          |
| **Contractor Locality**    | Whether contracted workforce is local     | Contractor agreements |
| **Training / Development** | Investment in local workforce development | Training records      |

**Note:** Workforce local content measurement depends on the customer's local content framework. Some frameworks focus entirely on spend and procurement; others include workforce. This dimension is optional in the conceptual model.

---

### 5. Evidence Confidence

Assigns a confidence level to each local content classification based on available evidence.

| Confidence Level | Description                                    | Evidence Required                                |
| ---------------- | ---------------------------------------------- | ------------------------------------------------ |
| **High**         | Official certification or unambiguous evidence | LCGPA certificate, CR, audited financials        |
| **Medium**       | Strong supporting evidence                     | Supplier declaration, contract clauses, invoices |
| **Low**          | Self-declaration without verification          | Vendor self-classification, no supporting docs   |
| **None**         | No evidence                                    | Classification is a best guess                   |

**Effect on Reporting:**

- High confidence classifications count fully
- Medium confidence classifications count with a note
- Low confidence classifications are flagged as unverified
- None classifications are excluded from verified metrics

---

### 6. Exception Flags

Conditions that trigger exceptions requiring human review.

| Exception Type            | Trigger                                    | Severity |
| ------------------------- | ------------------------------------------ | -------- |
| **Missing Evidence**      | Classification without supporting evidence | Warning  |
| **Confidence Drop**       | Evidence expired or revoked                | Critical |
| **Classification Change** | Supplier reclassified between periods      | Info     |
| **Outlier Spend**         | Spend with a single supplier > threshold   | Warning  |
| **Undetermined Supplier** | No classification possible                 | Critical |
| **Expired Certificate**   | Local content certificate past expiry date | Critical |

---

### 7. Manual Override with Approval

Allows human override of system classifications with proper governance.

| Element               | Detail                                                                     |
| --------------------- | -------------------------------------------------------------------------- |
| **Override Action**   | Change classification, adjust spend attribution, modify metrics            |
| **Reason Required**   | Detailed justification for override                                        |
| **Evidence Required** | Supporting documentation for the override decision                         |
| **Approval Required** | Override must be approved by authorized reviewer                           |
| **Audit Trail**       | Full record of original value, override value, reason, approver, timestamp |

---

### 8. Review Status

Tracks the review state of each local content item.

| Status               | Description                                  |
| -------------------- | -------------------------------------------- |
| **Draft**            | Initial classification, not reviewed         |
| **Pending Evidence** | Awaiting supporting documentation            |
| **Ready for Review** | Data complete, waiting for human review      |
| **In Review**        | Being reviewed by designated reviewer        |
| **Returned**         | Returned for revision or additional evidence |
| **Approved**         | Finalized and approved                       |
| **Locked**           | Cannot be modified after approval            |

---

### 9. Calculation Traceability

Every calculated metric must be traceable to its source data.

| Trace Element          | Description                                  |
| ---------------------- | -------------------------------------------- |
| **Source Transaction** | Original PO, invoice, or contract            |
| **Vendor Record**      | Vendor classification at time of calculation |
| **Evidence Reference** | Files supporting the classification          |
| **Calculation Rule**   | Which rule or formula was applied            |
| **Human Reviewer**     | Who reviewed and approved the calculation    |
| **Timestamp**          | When the calculation was performed           |
| **Version**            | Calculation logic version used               |

---

## Conceptual Metrics Summary

These are illustrative examples — not finalized metrics:

| Metric                    | Formula (Conceptual)                            | Dependency                            |
| ------------------------- | ----------------------------------------------- | ------------------------------------- |
| Overall Local Spend %     | Local Spend / Total Spend                       | Spend classification, vendor locality |
| Local Vendor Count        | Count of Local vendors                          | Vendor locality                       |
| Local Vendor %            | Local Vendors / Total Vendors                   | Vendor locality                       |
| Evidence Coverage %       | Transactions with High/Medium evidence / Total  | Evidence attachment                   |
| Exception Rate            | Flagged exceptions / Total items                | Exception rules                       |
| Period-over-Period Change | (Current Local % - Previous Local %) / Previous | Multiple periods                      |
| Unclassified Spend %      | Unclassified Spend / Total                      | Vendor locality, classification       |

---

## Regulatory Boundary

LocalContentOS is designed as a **governance and evidence management system** for local content, not as a regulatory submission platform.

**In scope:**

- Internal local content measurement and reporting
- Evidence collection and management
- Review and approval workflows
- Audit trail for local content decisions
- Report generation for management and tender preparation

**Out of scope (unless specifically integrated):**

- Direct submission to LCGPA or other regulatory portals
- Official regulatory endorsement of calculated metrics
- Binding legal local content determinations
- Regulatory compliance certification
