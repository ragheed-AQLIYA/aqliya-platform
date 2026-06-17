# LocalContentOS — Analyst SOP

**Status:** Pilot Operations Guide — not software
**Purpose:** Standard operating procedures and boundaries for the pilot analyst

---

## Analyst Role

The analyst is the primary executor of the LocalContentOS pilot. They:

- Receive and validate customer data
- Process and classify vendors, transactions, and contracts
- Review evidence and assign confidence levels
- Identify exceptions and draft findings
- Prepare management summaries and pilot reports
- Maintain documentation and audit trail throughout the pilot

---

## What Analyst May Do

- Request additional data or clarification from customer
- Classify vendors based on evidence (CR, certificates, declarations)
- Assign evidence confidence levels (High, Medium, Low, None)
- Flag exceptions and draft findings
- Make initial classification recommendations for customer review
- Document assumptions and methodology decisions
- Use the Data Templates and Pilot Runbook as operational guides
- Present findings to customer management (with AQLIYA lead)

---

## What Analyst Must NOT Do

- Claim LocalContentOS is implemented, operational, or regulatory-approved
- Provide legal or compliance interpretations
- Make final binding classification decisions without customer approval
- Hide or omit exceptions or evidence gaps
- Use AI or automated tools to classify without human review
- Share customer data outside the pilot engagement
- Commit to deliverables or timelines without AQLIYA lead approval
- Present findings as regulatory submissions or official certifications
- Calculate local content metrics using unvalidated formulas without clear disclaimers

---

## Review Sequence

Always follow this sequence — do not skip steps:

1. Vendor Master → validate and classify vendors first
2. Procurement Spend → link to vendors, then classify transactions
3. Contracts → link to vendors, review LC commitments
4. Evidence Register → link to all above, confirm coverage
5. Classification Review → document human decisions
6. Exceptions and Findings → aggregate issues
7. Pilot Summary → final assessment

**Reason:** Each step depends on the previous. Vendor classification is the foundation.

---

## Classification Rules

### Vendor Classification

| Criterion                  | Local           | Non-Local    | Mixed            |
| -------------------------- | --------------- | ------------ | ---------------- |
| Saudi CR                   | Required        | Not required | Required         |
| Saudi registration country | Required        | Not required | Required         |
| Saudi ownership (>= 51%)   | Recommended     | Not required | Not required     |
| Local content certificate  | Strong evidence | N/A          | Partial evidence |
| Operations base in Saudi   | Recommended     | Not required | Partially        |

**Undetermined:** Use when classification criteria cannot be met due to insufficient data. Always flag for customer action.

### Transaction Classification

- A transaction inherits the classification of its linked vendor
- If the vendor is Mixed, apply attribution: document the basis and percentage
- If the vendor is Undetermined, the transaction is automatically Unclassified

### Contract Classification

- Contracts inherit vendor classification
- LC commitment clause presence is tracked separately
- Gap analysis compares committed vs. actual LC per vendor/contract

---

## How to Handle Missing Data

| Missing Item                                | Action                                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Vendor CR number                            | Flag as Evidence Gap. Request from customer. Leave classification as Undetermined until received. |
| Vendor ID in spend but not in vendor master | Flag as Data Gap. Request vendor details from customer. Do not classify transaction.              |
| Spend amount without invoice evidence       | Flag as Evidence Gap (Low confidence). Request invoice.                                           |
| Contract with LC clause but no description  | Flag as Data Gap. Request LC commitment details.                                                  |
| Evidence file referenced but not provided   | Flag as Evidence Gap. Request file. Update evidence_status to Missing.                            |
| Previous period data unavailable            | Note as limitation. Proceed with current period only.                                             |

---

## How to Handle Conflicting Data

| Conflict                                           | Resolution                                                            |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| Vendor master says Local, evidence shows Non-Local | Evidence overrides self-declaration. Flag as Classification Override. |
| Customer SME says one thing, data says another     | Document both. Flag for management decision.                          |
| Two different CR numbers for same vendor           | Verify with customer. Flag as duplicate until resolved.               |
| Spend amount in invoice differs from PO            | Use invoice amount (actual spend). Note PO amount as reference.       |

---

## How to Document Assumptions

Every assumption made during the pilot must be documented:

| Field             | Description                                  |
| ----------------- | -------------------------------------------- |
| **Assumption ID** | Unique identifier: ASM-001, ASM-002, etc.    |
| **Description**   | What was assumed and why                     |
| **Impact**        | What would change if the assumption is wrong |
| **Owner**         | Who made the assumption                      |
| **Date**          | When the assumption was made                 |
| **Status**        | Active / Validated / Invalidated / Resolved  |

Include the assumptions log in the final pilot report.

---

## How to Create Findings

Each finding must follow this structure:

| Section              | Content                                                            |
| -------------------- | ------------------------------------------------------------------ |
| **Finding ID**       | FND-YYYY-NNNN                                                      |
| **Title**            | Clear, concise title                                               |
| **Severity**         | Critical / High / Medium / Low / Info                              |
| **Description**      | What was expected vs. what was found. Include evidence references. |
| **Evidence Gap**     | What evidence is missing or insufficient                           |
| **Financial Impact** | Affected amount in SAR (if applicable)                             |
| **Recommendation**   | Specific, actionable recommendation                                |
| **Owner**            | Who should resolve                                                 |
| **Due Date**         | Target resolution date                                             |

### Writing Guidelines

- Be factual: "CR not provided for vendor VEN-0005" not "Vendor is not compliant"
- Quantify impact: "320,000 SAR spend affected" not "Significant amount"
- Be specific: "Request CR with 10-digit format from procurement team" not "Follow up"
- Reference evidence: "Per EVD-2025-004, only self-declaration provided"

---

## How to Prepare Management Summary

The management summary should fit on one page and include:

1. **Pilot scope** — one line
2. **Key metrics** — total spend, vendors, local %, evidence coverage, exception count
3. **Top 3 findings** — most critical items only
4. **Recommended decision** — proceed, extend, pause, or not proceed
5. **Next steps** — what happens after this meeting

**Do not include:** detailed methodology, individual transaction lists, raw data tables.

---

## Quality Checklist

Before submitting any pilot output, verify:

- [ ] Every vendor has a classification (or documented reason for Undetermined)
- [ ] Every transaction is linked to a classified vendor
- [ ] Every classification has evidence or a documented reason for insufficient evidence
- [ ] All exceptions are logged with severity, description, and recommendation
- [ ] All findings follow the structured format
- [ ] Assumptions are documented
- [ ] No unsupported regulatory claims are made
- [ ] Regulatory boundary is stated in all customer-facing documents
- [ ] Classification methodology is documented in the pilot report
- [ ] All customer data is handled per the data sensitivity agreement
