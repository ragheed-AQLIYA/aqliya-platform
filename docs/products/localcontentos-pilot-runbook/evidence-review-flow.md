# LocalContentOS — Evidence Review Flow

**Status:** Pilot Operations Guide — not software
**Purpose:** Standard process for reviewing, classifying, and managing evidence in a LocalContentOS pilot

---

## Evidence Types

| Type                      | Code | Description                                                    | Typical Formats    |
| ------------------------- | ---- | -------------------------------------------------------------- | ------------------ |
| Commercial Registration   | CR   | Official Saudi CR or equivalent foreign registration           | PDF, scanned copy  |
| Local Content Certificate | CERT | LCGPA, SASO, or other recognized LC certificate                | PDF                |
| Supplier Declaration      | DECL | Self-declaration of local status or manufacturing capability   | PDF, signed letter |
| Invoice                   | INV  | Tax invoice for a procurement transaction                      | PDF, scanned copy  |
| Contract                  | CTR  | Signed contract with LC clause                                 | PDF                |
| Purchase Order            | PO   | Official purchase order document                               | PDF, XLSX          |
| Payment Proof             | PAY  | Bank transfer or payment confirmation                          | PDF                |
| Ownership Document        | OWN  | Shareholder registry or ownership structure                    | PDF                |
| Manufacturing Proof       | MFG  | Factory license, production capacity, industrial operator card | PDF                |
| Previous Report           | PREV | Past local content assessment or report                        | PDF, XLSX          |
| Policy Document           | POL  | Customer's internal local content classification policy        | PDF, DOCX          |
| Other                     | OTH  | Any other supporting documentation                             | Various            |

---

## Evidence Confidence Levels

| Level              | Code | Criteria                                                                                                                  | Weight in Reporting                |
| ------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **High**           | H    | Official government-issued document. Valid and unexpired. Entity name matches record.                                     | Counts fully in verified metrics   |
| **Medium**         | M    | Strong supporting document but not official certification. Supplier-signed declaration. Invoice or PO with clear details. | Counts with confidence note        |
| **Low**            | L    | Self-declaration without independent verification. Verbal confirmation. Unclear or partial document.                      | Flagged as unverified              |
| **None**           | N    | No evidence provided. Classification has no supporting documentation.                                                     | Excluded from verified metrics     |
| **Not Applicable** | NA   | Evidence not expected for this record type (e.g., internal cost center transfer).                                         | Excluded from coverage calculation |

---

## Evidence Status Definitions

| Status       | Definition                                                 | Next Action                   |
| ------------ | ---------------------------------------------------------- | ----------------------------- |
| **Received** | File received but not yet reviewed                         | Review within 3 business days |
| **Verified** | File reviewed, matches record, is valid                    | No action needed              |
| **Expired**  | File is time-bound and past expiry date                    | Request updated document      |
| **Missing**  | File referenced but not provided with data submission      | Request from customer         |
| **Rejected** | File reviewed but does not match record or is insufficient | Request correct document      |

---

## Required Evidence by Dataset

### Vendor Master

| Field                               | Minimum Evidence      | Target Evidence                    |
| ----------------------------------- | --------------------- | ---------------------------------- |
| vendor_id                           | None (internal ID)    | —                                  |
| vendor_name                         | None                  | CR (for verification)              |
| commercial_registration_number      | CR document           | CR + Saudi MoC verification        |
| country                             | None                  | CR indicating registration country |
| ownership_classification            | At least Low evidence | CR + ownership docs                |
| local_content_certificate_available | Certificate document  | Certificate + verification         |

### Procurement Spend

| Field                | Minimum Evidence               | Target Evidence               |
| -------------------- | ------------------------------ | ----------------------------- |
| vendor_id            | Vendor exists in Vendor Master | Vendor Master match confirmed |
| amount_excluding_vat | Invoice or PO document         | Invoice + payment proof       |
| evidence_reference   | Evidence Register entry        | Evidence file accessible      |

### Contracts

| Field                        | Minimum Evidence                        | Target Evidence                  |
| ---------------------------- | --------------------------------------- | -------------------------------- |
| contract_id                  | Signed contract document                | Contract + LC commitment clause  |
| local_content_clause_present | Contract clause (screenshot or excerpt) | Full contract with signed clause |

---

## How to Handle Missing Evidence

| Scenario                                      | Action                                                       | Documentation                                             |
| --------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------- |
| CR not provided for Saudi vendor              | Flag as Evidence Gap. Contact customer.                      | Evidence status = Missing. Finding created.               |
| Certificate expired                           | Flag as Evidence Gap. Contact customer for renewal.          | Evidence status = Expired. Finding created.               |
| Invoice referenced but not in evidence folder | Flag as Evidence Gap. Request file.                          | Evidence status = Missing.                                |
| Self-declaration provided instead of CR       | Accept as Low confidence. Flag for upgrade.                  | Evidence status = Received. Confidence = Low.             |
| No evidence for a critical classification     | Escalate to AQLIYA lead. Do not proceed with classification. | Evidence status = Missing. Classification = Undetermined. |

---

## How to Handle Weak Evidence

| Weak Evidence Type                                 | Assessment                                 | Action                                                             |
| -------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| Photograph instead of official document            | Accept only as Low confidence              | Flag for upgrade. Recommend requesting official document.          |
| Expired certificate                                | Low confidence even if once valid          | Flag for renewal. Note expiry date.                                |
| Document in name of parent company, not the vendor | Medium confidence — establish relationship | Note relationship in evidence notes. Flag if relationship unclear. |
| Unreadable or partial scan                         | Low confidence                             | Request clear copy. Note unreadable parts.                         |
| Verbal confirmation (email)                        | Low confidence                             | Accept as interim. Flag for formal documentation.                  |

---

## How to Link Evidence to Findings

Every finding should reference specific evidence items that support or contradict the finding:

| Finding                                     | Evidence Link                                                                          |
| ------------------------------------------- | -------------------------------------------------------------------------------------- |
| Vendor VEN-0005 has no CR                   | EVD-2025-004 (self-declaration only — Low confidence)                                  |
| Contract CTR-2024-001 LC commitment at risk | EVD-2025-006 (contract with 70% LC clause) + Procurement Spend data showing 65% actual |
| Certificate expired for VEN-0004            | EVD-2025-005 (certificate expiry date: 2025-03-31, current review: 2025-05)            |

**Format:** "Per [evidence_id] — [brief description]"

---

## How to Escalate Evidence Gaps

| Escalation Level          | Trigger                                                              | Action                                   |
| ------------------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| **Level 1 — Analyst**     | Missing evidence for non-critical classification                     | Analyst contacts customer directly       |
| **Level 2 — AQLIYA Lead** | Missing evidence for critical classification. Customer unresponsive. | Lead contacts customer sponsor           |
| **Level 3 — Pilot Hold**  | Critical evidence missing after Level 2. No resolution path.         | Pilot paused pending evidence resolution |

---

## Evidence Review Table Template

Use this table to document evidence review for each record:

| Record ID     | Record Type | Evidence ID  | Evidence Type | Confidence | Status   | Reviewer | Review Date | Notes          |
| ------------- | ----------- | ------------ | ------------- | ---------- | -------- | -------- | ----------- | -------------- |
| VEN-0001      | Vendor      | EVD-2025-001 | CR            | High       | Verified | A.Alamri | 2025-01-15  | Saudi CR valid |
| VEN-0001      | Vendor      | EVD-2025-002 | Certificate   | High       | Verified | A.Alamri | 2025-01-15  | LCGPA 85%      |
| VEN-0005      | Vendor      | EVD-2025-004 | Declaration   | Low        | Received | —        | —           | Missing CR     |
| INV-2025-1001 | Transaction | EVD-2025-003 | Invoice       | Medium     | Verified | A.Alamri | 2025-01-22  | Matches PO     |
