# LocalContentOS — Pilot Risk Register

**Status:** Pilot Operations Guide — not software
**Purpose:** Risk identification, assessment, and mitigation for the LocalContentOS analyst-led pilot

---

## Risk Summary

| ID    | Risk                                   | Likelihood | Impact | Severity | Status  |
| ----- | -------------------------------------- | ---------- | ------ | -------- | ------- |
| R-001 | Missing vendor master                  | Medium     | High   | High     | Tracked |
| R-002 | Incomplete procurement data            | High       | High   | High     | Tracked |
| R-003 | Weak evidence                          | High       | Medium | Medium   | Tracked |
| R-004 | Unclear supplier classification        | Medium     | High   | High     | Tracked |
| R-005 | Unofficial formula expectations        | Medium     | High   | High     | Tracked |
| R-006 | Customer expects regulatory submission | Low        | High   | Medium   | Tracked |
| R-007 | Data sensitivity concerns              | Medium     | Medium | Medium   | Tracked |
| R-008 | Stakeholder misalignment               | Medium     | Medium | Medium   | Tracked |
| R-009 | No decision owner                      | Low        | High   | Medium   | Tracked |
| R-010 | Pilot scope creep                      | Medium     | Medium | Medium   | Tracked |

---

## R-001: Missing Vendor Master

| Field                  | Detail                                                                                                                                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description**        | Customer cannot provide a complete vendor master list. Vendors are identified only in transaction data without a centralized register.                                                                                      |
| **Likelihood**         | Medium — many organizations have vendor data scattered across systems                                                                                                                                                       |
| **Impact**             | High — without vendor master, classification foundation is missing                                                                                                                                                          |
| **Mitigation**         | 1. Request the best available vendor list from ERP or procurement system<br>2. Accept a partial list as long as it covers the pilot category<br>3. If not available, reconstruct vendor list from spend data (deduplicated) |
| **Owner**              | AQLIYA Analyst                                                                                                                                                                                                              |
| **Escalation Trigger** | Cannot produce vendor list covering > 80% of the pilot spend after two attempts                                                                                                                                             |

---

## R-002: Incomplete Procurement Data

| Field                  | Detail                                                                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description**        | Customer procurement data is incomplete — missing transactions, inconsistent periods, or incorrect amounts.                                                                                                                           |
| **Likelihood**         | High — procurement data quality varies significantly across organizations                                                                                                                                                             |
| **Impact**             | High — spend classification will be incomplete or inaccurate                                                                                                                                                                          |
| **Mitigation**         | 1. Set clear data requirements in the kickoff meeting<br>2. Provide template with validation rules<br>3. Conduct data intake review before starting classification<br>4. Document all data gaps and their potential impact on results |
| **Owner**              | AQLIYA Analyst                                                                                                                                                                                                                        |
| **Escalation Trigger** | > 20% of expected spend not covered by submitted data                                                                                                                                                                                 |

---

## R-003: Weak Evidence

| Field                  | Detail                                                                                                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description**        | Customer provides insufficient or low-quality evidence to support classifications. CRs missing, certificates expired, invoices illegible.                                                                                                               |
| **Likelihood**         | High — evidence collection is a known challenge                                                                                                                                                                                                         |
| **Impact**             | Medium — analysis can proceed with lower confidence levels, but findings will be less definitive                                                                                                                                                        |
| **Mitigation**         | 1. Clearly communicate evidence requirements upfront<br>2. Provide examples of acceptable evidence<br>3. Use confidence levels to reflect evidence quality (High, Medium, Low, None)<br>4. Flag evidence gaps as findings rather than blocking analysis |
| **Owner**              | AQLIYA Analyst                                                                                                                                                                                                                                          |
| **Escalation Trigger** | > 50% of classifications have Low or None confidence                                                                                                                                                                                                    |

---

## R-004: Unclear Supplier Classification

| Field                  | Detail                                                                                                                                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Description**        | Customer cannot clearly classify suppliers as local or non-local. Suppliers may be locally registered but foreign-owned, or have complex corporate structures.                                                                                               |
| **Likelihood**         | Medium — common for companies with diverse supply chains                                                                                                                                                                                                     |
| **Impact**             | High — directly affects local content calculation                                                                                                                                                                                                            |
| **Mitigation**         | 1. Define clear classification criteria upfront based on customer's policy<br>2. Use Mixed and Undetermined categories for ambiguous cases<br>3. Document classification assumptions clearly<br>4. Request customer management decisions on borderline cases |
| **Owner**              | AQLIYA Analyst + Customer SME                                                                                                                                                                                                                                |
| **Escalation Trigger** | > 15% of vendors classified as Mixed or Undetermined with no resolution path                                                                                                                                                                                 |

---

## R-005: Unofficial Formula Expectations

| Field                  | Detail                                                                                                                                                                                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description**        | Customer expects the pilot to use official regulatory formulas (e.g., LCGPA formula) and produce compliance-grade results.                                                                                                                                                                   |
| **Likelihood**         | Medium — natural expectation from local content professionals                                                                                                                                                                                                                                |
| **Impact**             | High — expectation mismatch can undermine pilot credibility                                                                                                                                                                                                                                  |
| **Mitigation**         | 1. Clearly state regulatory boundary in kickoff and all communications<br>2. Use conceptual formulas with disclaimers<br>3. Frame results as "draft management materials" not "regulatory submissions"<br>4. If customer has specific formula requirements, document as future product input |
| **Owner**              | AQLIYA Lead                                                                                                                                                                                                                                                                                  |
| **Escalation Trigger** | Customer insists on regulatory-grade output after regulatory boundary explanation                                                                                                                                                                                                            |

---

## R-006: Customer Expects Regulatory Submission

| Field                  | Detail                                                                                                                                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description**        | Customer believes the pilot will result in a regulatory submission to LCGPA or other bodies.                                                                                                                         |
| **Likelihood**         | Low — mitigated by clear upfront communication                                                                                                                                                                       |
| **Impact**             | High — misunderstanding could damage customer relationship                                                                                                                                                           |
| **Mitigation**         | 1. Explicitly state in kickoff: "This pilot does not produce regulatory submissions"<br>2. Include regulatory boundary in all customer-facing materials<br>3. If need persists, redirect to formal advisory channels |
| **Owner**              | AQLIYA Lead                                                                                                                                                                                                          |
| **Escalation Trigger** | Customer refuses to acknowledge regulatory boundary after kickoff                                                                                                                                                    |

---

## R-007: Data Sensitivity Concerns

| Field                  | Detail                                                                                                                                                                                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description**        | Customer is reluctant to share some data due to confidentiality concerns. Spend amounts, supplier relationships, or contract terms may be considered highly sensitive.                                                                                                      |
| **Likelihood**         | Medium — especially for larger organizations                                                                                                                                                                                                                                |
| **Impact**             | Medium — analysis can proceed with aggregated or anonymized data                                                                                                                                                                                                            |
| **Mitigation**         | 1. Offer data anonymization options (rounded amounts, aggregated categories)<br>2. Sign NDA or data processing agreement<br>3. Agree on sensitivity classification per data type<br>4. Allow customer to redact specific sensitive fields while keeping classification data |
| **Owner**              | AQLIYA Lead                                                                                                                                                                                                                                                                 |
| **Escalation Trigger** | Customer cannot provide any spend data even in aggregate form                                                                                                                                                                                                               |

---

## R-008: Stakeholder Misalignment

| Field                  | Detail                                                                                                                                                                                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description**        | Different departments within the customer have different expectations or priorities for the pilot. Procurement may want one thing, compliance another, finance a third.                                                                                              |
| **Likelihood**         | Medium — common in larger organizations                                                                                                                                                                                                                              |
| **Impact**             | Medium — may slow down decisions and data provision                                                                                                                                                                                                                  |
| **Mitigation**         | 1. Identify all stakeholders in the intake checklist<br>2. Ensure kickoff includes representatives from all relevant departments<br>3. Document and confirm pilot scope with all stakeholders<br>4. If conflicts arise, escalate to executive sponsor for resolution |
| **Owner**              | AQLIYA Lead                                                                                                                                                                                                                                                          |
| **Escalation Trigger** | Stakeholders disagree on pilot scope after kickoff                                                                                                                                                                                                                   |

---

## R-009: No Decision Owner

| Field                  | Detail                                                                                                                                                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description**        | Customer participates in the pilot but no one is authorized to make decisions or commit to next steps.                                                                                                                        |
| **Likelihood**         | Low — mitigated by intake checklist requirement                                                                                                                                                                               |
| **Impact**             | High — pilot may produce results with no path to action                                                                                                                                                                       |
| **Mitigation**         | 1. Require decision owner identification before pilot starts (intake checklist)<br>2. Confirm decision owner participation in kickoff and final meeting<br>3. If no decision owner emerges, pause pilot until one is assigned |
| **Owner**              | AQLIYA Lead                                                                                                                                                                                                                   |
| **Escalation Trigger** | Customer cannot identify a decision owner by the end of kickoff                                                                                                                                                               |

---

## R-010: Pilot Scope Creep

| Field                  | Detail                                                                                                                                                                                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description**        | Customer requests expanded scope during the pilot — more categories, additional periods, deeper analysis — beyond the agreed scope.                                                                                                                        |
| **Likelihood**         | Medium — natural as customer sees value                                                                                                                                                                                                                    |
| **Impact**             | Medium — extends timeline, increases analyst effort                                                                                                                                                                                                        |
| **Mitigation**         | 1. Document clear scope in kickoff and intake checklist<br>2. Track scope changes as they arise<br>3. For small requests: accommodate if within current capacity<br>4. For significant expansion: propose as a separate pilot extension with revised terms |
| **Owner**              | AQLIYA Analyst + Lead                                                                                                                                                                                                                                      |
| **Escalation Trigger** | Customer requests scope that would double the original pilot effort                                                                                                                                                                                        |

---

## Risk Scoring Matrix

| Severity   | Likelihood | Impact | Action                          |
| ---------- | ---------- | ------ | ------------------------------- |
| **High**   | High       | High   | Must mitigate before proceeding |
| **High**   | Medium     | High   | Active mitigation required      |
| **Medium** | High       | Medium | Monitor and mitigate            |
| **Medium** | Medium     | Medium | Standard monitoring             |
| **Low**    | Low        | Low    | Accept                          |

---

## How to Use This Register

1. **Before pilot start** — review all risks with the AQLIYA lead. Identify which risks are active for this specific customer.
2. **During pilot** — track risk status in each weekly check-in. Update likelihood as conditions change.
3. **When risk materializes** — execute the mitigation plan. If mitigation is insufficient, escalate per the escalation trigger.
4. **After pilot** — document which risks materialized and whether mitigation was effective. Update register for future pilots.
