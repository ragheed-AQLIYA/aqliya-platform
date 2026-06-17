# LocalContentOS — Pilot Operating Runbook

**Status:** Pilot Operations Guide — not software
**Purpose:** Full step-by-step operating procedure for the AQLIYA analyst running a LocalContentOS pilot

---

## Overview

This runbook defines 17 operating steps from pre-kickoff to post-pilot follow-up. Each step specifies:

- **Objective** — what this step achieves
- **Owner** — who is responsible
- **Input** — what is needed to start
- **Action** — what to do
- **Output** — what is produced
- **Quality Gate** — how to verify quality
- **Evidence Required** — what documentation is needed
- **Escalation Trigger** — when to raise an issue

---

## Step 1: Pre-Kickoff Preparation

| Field                  | Detail                                                                                                                                                                                                                                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**          | Prepare the analyst pack and customer materials before the kickoff call                                                                                                                                                                                                                                                                               |
| **Owner**              | AQLIYA Analyst                                                                                                                                                                                                                                                                                                                                        |
| **Input**              | Intake checklist completion, customer contact details, pilot scope                                                                                                                                                                                                                                                                                    |
| **Action**             | 1. Review intake checklist and confirm readiness<br>2. Prepare customer instructions and data templates (from Data Templates Pack)<br>3. Prepare kickoff deck (see meeting agendas)<br>4. Prepare evidence folder structure template<br>5. Set up pilot workspace (shared folder, communication channel)<br>6. Confirm meeting schedule with customer |
| **Output**             | Kickoff pack ready — customer instructions, data templates, evidence folder template, meeting invites                                                                                                                                                                                                                                                 |
| **Quality Gate**       | All intake acceptance criteria met                                                                                                                                                                                                                                                                                                                    |
| **Evidence Required**  | Completed intake checklist                                                                                                                                                                                                                                                                                                                            |
| **Escalation Trigger** | Customer cannot confirm meeting schedule within 5 business days                                                                                                                                                                                                                                                                                       |

---

## Step 2: Customer Kickoff

| Field                  | Detail                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**          | Align on pilot scope, process, deliverables, and expectations                                                                                           |
| **Owner**              | AQLIYA Lead + Analyst                                                                                                                                   |
| **Input**              | Kickoff pack, completed intake checklist                                                                                                                |
| **Action**             | Conduct kickoff meeting (see meeting agendas). Cover: scope, timeline, data requirements, regulatory boundary, decision options, meeting cadence, roles |
| **Output**             | Kickoff meeting notes, agreed scope document, confirmed timeline                                                                                        |
| **Quality Gate**       | Customer confirms understanding of scope and regulatory boundary                                                                                        |
| **Evidence Required**  | Kickoff meeting notes                                                                                                                                   |
| **Escalation Trigger** | Customer still expects software or regulatory submission after kickoff                                                                                  |

---

## Step 3: Data Request

| Field                  | Detail                                                                                                                                                                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**          | Send formal data request to customer with templates and instructions                                                                                                                                                                           |
| **Owner**              | AQLIYA Analyst                                                                                                                                                                                                                                 |
| **Input**              | Customer instructions, data templates, evidence folder template                                                                                                                                                                                |
| **Action**             | 1. Send data request email (see commercial follow-up pack)<br>2. Include: customer instructions, all CSV templates, evidence folder structure<br>3. Set deadline (typically 1–2 weeks after kickoff)<br>4. Schedule data intake review meeting |
| **Output**             | Data request sent with templates and deadline                                                                                                                                                                                                  |
| **Quality Gate**       | Customer acknowledges receipt and confirms understanding                                                                                                                                                                                       |
| **Evidence Required**  | Email or communication record                                                                                                                                                                                                                  |
| **Escalation Trigger** | No response within 3 business days                                                                                                                                                                                                             |

---

## Step 4: Data Receipt

| Field                  | Detail                                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**          | Receive customer data and confirm delivery                                                                                                                                |
| **Owner**              | AQLIYA Analyst                                                                                                                                                            |
| **Input**              | Customer data files, evidence folder                                                                                                                                      |
| **Action**             | 1. Confirm receipt with customer<br>2. Log receipt date and file inventory<br>3. Quick check: folder structure, file naming, file count<br>4. Schedule data intake review |
| **Output**             | Data receipt confirmation, preliminary file inventory                                                                                                                     |
| **Quality Gate**       | All expected files received (or documented gap)                                                                                                                           |
| **Evidence Required**  | File inventory log                                                                                                                                                        |
| **Escalation Trigger** | Critical files missing after deadline — escalate to customer sponsor                                                                                                      |

---

## Step 5: File Inventory

| Field                  | Detail                                                                                                                                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**          | Create a complete inventory of all received files                                                                                                                                                                                  |
| **Owner**              | AQLIYA Analyst                                                                                                                                                                                                                     |
| **Input**              | Customer data files                                                                                                                                                                                                                |
| **Action**             | 1. List all files received per template category<br>2. Check file naming against convention<br>3. Check file format (CSV, XLSX, PDF)<br>4. Check file accessibility (no passwords)<br>5. Record file count, total size, any issues |
| **Output**             | File inventory log                                                                                                                                                                                                                 |
| **Quality Gate**       | All files accessible and named correctly                                                                                                                                                                                           |
| **Evidence Required**  | File inventory log                                                                                                                                                                                                                 |
| **Escalation Trigger** | Password-protected files or corrupted files                                                                                                                                                                                        |

---

## Step 6: Completeness Review

| Field                  | Detail                                                                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**          | Check each template for required field completeness                                                                                                                                                                 |
| **Owner**              | AQLIYA Analyst                                                                                                                                                                                                      |
| **Input**              | CSV templates from customer                                                                                                                                                                                         |
| **Action**             | 1. Check each template against required fields (see Data Templates Pack)<br>2. Log missing required fields<br>3. Check data format validity (dates, amounts, codes)<br>4. Summarize completeness score per template |
| **Output**             | Completeness review log                                                                                                                                                                                             |
| **Quality Gate**       | > 90% required fields populated across all templates                                                                                                                                                                |
| **Evidence Required**  | Completeness log                                                                                                                                                                                                    |
| **Escalation Trigger** | < 70% completeness — escalate for data gap resolution                                                                                                                                                               |

---

## Step 7: Vendor Master Review

| Field                  | Detail                                                                                                                                                                                                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Objective**          | Review and validate the vendor master data                                                                                                                                                                                                                                                                                           |
| **Owner**              | AQLIYA Analyst                                                                                                                                                                                                                                                                                                                       |
| **Input**              | Vendor Master CSV, customer classification                                                                                                                                                                                                                                                                                           |
| **Action**             | 1. Check vendor_id uniqueness<br>2. Check CR number format (10 digits for Saudi)<br>3. Check country codes<br>4. Validate ownership_classification values<br>5. Flag missing CR numbers for Saudi vendors<br>6. Flag duplicates (same CR, different IDs)<br>7. Record initial vendor count, local/non-local/mixed/undetermined split |
| **Output**             | Vendor review log — validated vendors with flags                                                                                                                                                                                                                                                                                     |
| **Quality Gate**       | All vendor IDs unique. CRs present for all Local-classified Saudi vendors                                                                                                                                                                                                                                                            |
| **Evidence Required**  | Vendor review log                                                                                                                                                                                                                                                                                                                    |
| **Escalation Trigger** | > 20% of vendors are Undetermined — need customer reclassification                                                                                                                                                                                                                                                                   |

---

## Step 8: Procurement Spend Review

| Field                  | Detail                                                                                                                                                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**          | Review and validate procurement spend data                                                                                                                                                                                                                                      |
| **Owner**              | AQLIYA Analyst                                                                                                                                                                                                                                                                  |
| **Input**              | Procurement Spend CSV, Vendor Master (for linking)                                                                                                                                                                                                                              |
| **Action**             | 1. Check every vendor_id exists in Vendor Master<br>2. Flag unmatched vendor_ids<br>3. Check amount format and validity<br>4. Check dates are within reporting period<br>5. Flag out-of-period transactions<br>6. Summarize: total spend, transaction count, category breakdown |
| **Output**             | Spend review log — validated transactions with flags                                                                                                                                                                                                                            |
| **Quality Gate**       | All vendor IDs matched. All amounts valid. All dates in period                                                                                                                                                                                                                  |
| **Evidence Required**  | Spend review log                                                                                                                                                                                                                                                                |
| **Escalation Trigger** | > 10% unmatched vendor IDs — data linking issue                                                                                                                                                                                                                                 |

---

## Step 9: Contract Review

| Field                  | Detail                                                                                                                                                                                                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**          | Review contracts data if provided                                                                                                                                                                                                                                                                         |
| **Owner**              | AQLIYA Analyst                                                                                                                                                                                                                                                                                            |
| **Input**              | Contracts CSV, Vendor Master                                                                                                                                                                                                                                                                              |
| **Action**             | 1. Check vendor_id exists in Vendor Master<br>2. Flag unmatched contract vendor IDs<br>3. Check date validity (start before end)<br>4. Review local_content_clause_present values<br>5. Flag contracts with LC clause but no description<br>6. Summarize: contract count, total value, LC clause coverage |
| **Output**             | Contract review log — validated contracts with flags                                                                                                                                                                                                                                                      |
| **Quality Gate**       | All vendor IDs matched. LC clauses documented where present                                                                                                                                                                                                                                               |
| **Evidence Required**  | Contract review log                                                                                                                                                                                                                                                                                       |
| **Escalation Trigger** | Major contracts with LC commitments but no evidence                                                                                                                                                                                                                                                       |

---

## Step 10: Evidence Register Setup

| Field                  | Detail                                                                                                                                                                                                                                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**          | Set up the evidence register and link evidence to records                                                                                                                                                                                                                                                  |
| **Owner**              | AQLIYA Analyst                                                                                                                                                                                                                                                                                             |
| **Input**              | Evidence Register CSV, evidence files                                                                                                                                                                                                                                                                      |
| **Action**             | 1. Validate evidence IDs are unique<br>2. Check each related_record_id exists (vendor, transaction, contract)<br>3. Check evidence files referenced actually exist<br>4. Assign or confirm confidence levels<br>5. Flag missing evidence for critical records<br>6. Calculate evidence coverage percentage |
| **Output**             | Evidence validation log, evidence coverage summary                                                                                                                                                                                                                                                         |
| **Quality Gate**       | All evidence files accessible. Related records verified                                                                                                                                                                                                                                                    |
| **Evidence Required**  | Evidence validation log                                                                                                                                                                                                                                                                                    |
| **Escalation Trigger** | < 50% evidence coverage — critical gap                                                                                                                                                                                                                                                                     |

---

## Step 11: Classification Review

| Field                  | Detail                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**          | Review and validate each supplier and transaction classification                                                                                                                                                                                                                                                                                            |
| **Owner**              | AQLIYA Analyst                                                                                                                                                                                                                                                                                                                                              |
| **Input**              | Vendor Master (classified), Procurement Spend (linked), Classification Review CSV                                                                                                                                                                                                                                                                           |
| **Action**             | 1. For each vendor, verify classification against evidence<br>2. For each transaction, apply vendor classification<br>3. Flag classifications without adequate evidence<br>4. Flag classification changes from customer self-reported data<br>5. Document classification confidence per vendor<br>6. Produce classification summary with counts and amounts |
| **Output**             | Classification review log, classification summary report                                                                                                                                                                                                                                                                                                    |
| **Quality Gate**       | Every vendor classified. Classification supported by evidence or documented note                                                                                                                                                                                                                                                                            |
| **Evidence Required**  | Classification review log                                                                                                                                                                                                                                                                                                                                   |
| **Escalation Trigger** | Critical classification without any evidence                                                                                                                                                                                                                                                                                                                |

---

## Step 12: Exception Identification

| Field                  | Detail                                                                                                                                                                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**          | Identify and document all exceptions from the review                                                                                                                                                                                                                                                          |
| **Owner**              | AQLIYA Analyst                                                                                                                                                                                                                                                                                                |
| **Input**              | All review logs, classification report, evidence coverage                                                                                                                                                                                                                                                     |
| **Action**             | 1. Review all flags from previous steps<br>2. Categorize exceptions: Data Gap, Evidence Gap, Classification Gap, Policy Gap, Compliance Risk<br>3. Assign severity: Critical, High, Medium, Low, Info<br>4. Quantify financial impact where applicable<br>5. Draft exception descriptions and recommendations |
| **Output**             | Exceptions and findings report (populated from Exceptions-Findings template)                                                                                                                                                                                                                                  |
| **Quality Gate**       | Every critical and high exception has clear description, evidence gap, and recommendation                                                                                                                                                                                                                     |
| **Evidence Required**  | Exceptions and findings report                                                                                                                                                                                                                                                                                |
| **Escalation Trigger** | Critical compliance risk identified — immediate escalation to AQLIYA lead                                                                                                                                                                                                                                     |

---

## Step 13: Findings Drafting

| Field                  | Detail                                                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**          | Draft structured findings with management recommendations                                                                                                                                         |
| **Owner**              | AQLIYA Analyst                                                                                                                                                                                    |
| **Input**              | Exceptions report, classification summary, evidence coverage                                                                                                                                      |
| **Action**             | 1. Group related exceptions into findings<br>2. Write clear finding narratives<br>3. Draft management recommendations<br>4. Assign owners and due dates<br>5. Prepare draft findings presentation |
| **Output**             | Draft findings report, findings presentation deck                                                                                                                                                 |
| **Quality Gate**       | Findings are factual, evidence-based, and actionable                                                                                                                                              |
| **Evidence Required**  | Findings report                                                                                                                                                                                   |
| **Escalation Trigger** | Findings reveal material misclassification that could affect business decisions                                                                                                                   |

---

## Step 14: Management Review

| Field                  | Detail                                                                                                                                                                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**          | Present findings to customer management and collect responses                                                                                                                                                                                                         |
| **Owner**              | AQLIYA Lead                                                                                                                                                                                                                                                           |
| **Input**              | Findings report, classification summary, evidence coverage report                                                                                                                                                                                                     |
| **Action**             | 1. Schedule findings review meeting (see meeting agendas)<br>2. Present key findings, evidence gaps, and recommendations<br>3. Collect management responses<br>4. Document management decisions on each finding<br>5. Identify unresolved items for the decision memo |
| **Output**             | Management-reviewed findings report with decisions                                                                                                                                                                                                                    |
| **Quality Gate**       | All critical and high findings reviewed by management                                                                                                                                                                                                                 |
| **Evidence Required**  | Meeting notes, management response log                                                                                                                                                                                                                                |
| **Escalation Trigger** | Management unwilling to make decisions on critical findings                                                                                                                                                                                                           |

---

## Step 15: Pilot Summary Preparation

| Field                  | Detail                                                                                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**          | Prepare the final pilot summary with assessment and recommendation                                                                                                                     |
| **Owner**              | AQLIYA Analyst + Lead                                                                                                                                                                  |
| **Input**              | All review logs, classification summary, evidence report, management responses                                                                                                         |
| **Action**             | 1. Complete the Pilot Summary template<br>2. Calculate pilot success scores (see scorecard)<br>3. Draft recommendation<br>4. Prepare decision memo<br>5. Prepare decision meeting deck |
| **Output**             | Pilot summary, decision memo, decision meeting deck                                                                                                                                    |
| **Quality Gate**       | All pilot activities documented. Scores calculated. Recommendation supported by evidence                                                                                               |
| **Evidence Required**  | Pilot summary, decision memo                                                                                                                                                           |
| **Escalation Trigger** | Internal disagreement on recommendation — resolve before customer meeting                                                                                                              |

---

## Step 16: Final Decision Meeting

| Field                  | Detail                                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Objective**          | Present pilot outcomes and agree on next steps with customer                                                                                                             |
| **Owner**              | AQLIYA Lead                                                                                                                                                              |
| **Input**              | Pilot summary, decision memo, management responses                                                                                                                       |
| **Action**             | 1. Present pilot outcomes<br>2. Present recommendation<br>3. Discuss decision options (proceed to MVP, extend pilot, pause, not proceed)<br>4. Capture customer decision |
| **Output**             | Decision meeting notes, agreed next steps                                                                                                                                |
| **Quality Gate**       | Clear decision documented and agreed by both parties                                                                                                                     |
| **Evidence Required**  | Decision meeting notes                                                                                                                                                   |
| **Escalation Trigger** | Customer indecision — offer extension or define conditions for revisit                                                                                                   |

---

## Step 17: Post-Pilot Follow-Up

| Field                  | Detail                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Objective**          | Close the pilot, deliver final outputs, and follow commercial process                                                                                                                                                                                                                                                                                                          |
| **Owner**              | AQLIYA Lead                                                                                                                                                                                                                                                                                                                                                                    |
| **Input**              | Decision outcome, all pilot files                                                                                                                                                                                                                                                                                                                                              |
| **Action**             | 1. Deliver final pilot report and evidence package to customer<br>2. Send thank-you and follow-up message (see commercial follow-up)<br>3. If proceeding: initiate commercial conversion process<br>4. If extending: agree on revised scope and timeline<br>5. If pausing: set revisit date and conditions<br>6. If not proceeding: archive pilot files and document learnings |
| **Output**             | Pilot closure confirmation, archived pilot pack                                                                                                                                                                                                                                                                                                                                |
| **Quality Gate**       | All deliverables provided. Customer satisfied with process                                                                                                                                                                                                                                                                                                                     |
| **Evidence Required**  | Pilot closure email, archived files                                                                                                                                                                                                                                                                                                                                            |
| **Escalation Trigger** | Customer disputes findings after pilot — schedule resolution meeting                                                                                                                                                                                                                                                                                                           |
