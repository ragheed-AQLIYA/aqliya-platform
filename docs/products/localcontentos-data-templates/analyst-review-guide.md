# LocalContentOS — Analyst Review Guide

**Status:** Pilot Template Pack — not software
**Purpose:** Internal guide for AQLIYA analysts processing LocalContentOS pilot data

---

## Overview

This guide defines the step-by-step process for an AQLIYA analyst to receive, validate, process, and report on customer data in a LocalContentOS pilot. The pilot is an **analyst-led service engagement** — there is no software to operate. The analyst uses the templates from this pack and follows the workflow defined in the Discovery Pack.

---

## Step 1: Intake Checks

Before processing any data, verify the customer submission is complete.

### Checklist

- [ ] Customer instructions were shared and understood
- [ ] All required templates received (Vendor Master, Procurement Spend, Evidence Register)
- [ ] File names follow the naming convention
- [ ] Folder structure is correct
- [ ] No password-protected files
- [ ] Evidence files are accessible
- [ ] Data covers the agreed pilot scope (period, category, vendors)

### Outcome

| Status                  | Action                                                   |
| ----------------------- | -------------------------------------------------------- |
| Complete                | Proceed to completeness checks                           |
| Partial (minor gaps)    | Log gaps, proceed with available data, request remaining |
| Incomplete (major gaps) | Do not proceed — request complete submission             |

---

## Step 2: Completeness Checks

### Vendor Master

- [ ] All required fields filled for each vendor
- [ ] No blank vendor_id values
- [ ] CR numbers present for Saudi vendors
- [ ] Classification values are valid (Local, Non-Local, Mixed, Undetermined)

### Procurement Spend

- [ ] All required fields filled for each transaction
- [ ] No blank vendor_id values
- [ ] Amounts are numeric without formatting
- [ ] vendor_id values match Vendor Master

### Evidence Register

- [ ] All required fields filled
- [ ] related_record_id values match Vendor Master or Spend
- [ ] File names referenced actually exist in the evidence folder

### Contracts (if provided)

- [ ] All required fields filled
- [ ] vendor_id values match Vendor Master

### Completeness Log

Create a log of completeness issues found:

| Template | Issue | Count | Severity |
| -------- | ----- | ----- | -------- |

---

## Step 3: Duplicate Checks

### Vendor Duplicates

- Check for same vendor appearing with different IDs (compare by name + CR)
- Check for same CR number under different vendor entries
- Flag duplicates with both IDs for customer confirmation

### Transaction Duplicates

- Check for duplicate PO numbers or invoice IDs
- Verify no transactions have identical vendor, date, and amount combinations

### Evidence Duplicates

- Check for same file referenced under multiple evidence IDs

---

## Step 4: Vendor Matching Checks

### Cross-Template Matching

- [ ] Every vendor_id in Procurement Spend exists in Vendor Master
- [ ] Every vendor_id in Contracts exists in Vendor Master
- [ ] Every vendor_id in Evidence Register (where related_record_type = Vendor) exists in Vendor Master

### Unmatched Records

Create a log of unmatched records:

| Record Type | Record ID | Found In | Missing From |
| ----------- | --------- | -------- | ------------ |

For unmatched records:

- If spend data references a vendor not in Vendor Master, flag and request addition
- If vendor exists but ID differs, confirm correct ID with customer

---

## Step 5: Spend Classification Checks

### Initial Classification

For each transaction:

1. Look up the vendor in Vendor Master
2. Apply `ownership_classification` as the initial classification
3. Check if evidence supports the classification
4. If vendor is Unclassified or Undetermined, flag as pending

### Classification Confidence

Assign confidence per the Evidence Register:

| Evidence Present                        | Confidence |
| --------------------------------------- | ---------- |
| Official certificate or valid CR        | High       |
| Supplier declaration or contract clause | Medium     |
| Self-declaration only                   | Low        |
| No evidence                             | None       |

### Classification Summary

| Classification | Count | Total Amount (SAR) | % of Total |
| -------------- | ----- | ------------------ | ---------- |
| Local          | —     | —                  | —          |
| Non-Local      | —     | —                  | —          |
| Mixed          | —     | —                  | —          |
| Undetermined   | —     | —                  | —          |
| Unclassified   | —     | —                  | —          |
| **Total**      | —     | —                  | 100%       |

---

## Step 6: Evidence Confidence Review

### Review Each Evidence Item

- Verify the evidence file is accessible and readable
- Check expiry dates on certificates
- Assess if the evidence type matches the claimed classification
- Assign or confirm confidence level

### Evidence Coverage

Calculate evidence coverage:

- `Evidence Coverage % = (Records with High/Medium evidence / Total Records) × 100`

### Evidence Gap Summary

| Confidence Level | Count | Required Action             |
| ---------------- | ----- | --------------------------- |
| High             | —     | No action                   |
| Medium           | —     | Monitor — may need upgrade  |
| Low              | —     | Flag for follow-up          |
| None             | —     | Critical — request evidence |

---

## Step 7: Exception Identification

### Automatic Exceptions

Based on data patterns, flag:

| Exception Type        | Rule                                                                   |
| --------------------- | ---------------------------------------------------------------------- |
| Missing Evidence      | Classification without supporting evidence                             |
| Expired Certificate   | Evidence status = Expired                                              |
| Undetermined Vendor   | Vendor with no classification                                          |
| Unclassified Spend    | Transaction with no classification                                     |
| Classification Change | Vendor reclassified compared to prior period (if prior data available) |
| Spend Concentration   | Single vendor > 30% of total spend                                     |
| LC Commitment Gap     | Contract commitment vs. actual spend mismatch                          |

### Exception Log

| Exception ID | Type | Severity | Record Affected | Description |
| ------------ | ---- | -------- | --------------- | ----------- |

---

## Step 8: Management Review Preparation

### Prepare Review Package

Assemble the following for management review:

1. **Executive Summary** — one-page overview with key metrics, findings, recommendation
2. **Classification Summary** — local vs. non-local breakdown with confidence levels
3. **Evidence Coverage Report** — which records have evidence, which don't
4. **Exception Log** — all flagged items with severity and description
5. **Findings and Gaps Report** — formal findings with recommendations
6. **Recommended Decisions** — specific decisions management needs to make

### Key Metrics to Include

| Metric                | Value                    |
| --------------------- | ------------------------ |
| Total Spend Reviewed  | —                        |
| Local Spend           | — (% of total)           |
| Non-Local Spend       | — (% of total)           |
| Unclassified Spend    | — (% of total)           |
| Vendors Classified    | — of —                   |
| Vendors with Evidence | — of —                   |
| Evidence Coverage     | — %                      |
| Exceptions Identified | — (Critical: —, High: —) |
| Open Findings         | —                        |

---

## Step 9: Go/No-Go Decision for Pilot Analysis

Before proceeding to the final pilot summary, decide:

| Criterion               | Go                                      | No-Go                          |
| ----------------------- | --------------------------------------- | ------------------------------ |
| Data quality acceptable | Errors < 10% of records                 | Errors > 10% of records        |
| Classification complete | > 80% of records classified             | < 80% of records classified    |
| Evidence coverage       | > 50% of records have evidence          | < 50% of records have evidence |
| Customer engaged        | Customer responsive, answered questions | Customer unresponsive          |

### If No-Go

- Document the reasons
- Present a remediation plan
- Set a timeline for re-submission
- Do not produce a final pilot report until resolved

### If Go

- Proceed to complete the Pilot Summary template
- Prepare the final pilot report
- Schedule the closeout meeting

---

## Pilot Completion Checklist

- [ ] All templates validated
- [ ] Classification completed
- [ ] Evidence reviewed
- [ ] Exceptions logged
- [ ] Findings documented
- [ ] Management review package prepared
- [ ] Pilot Summary completed
- [ ] Recommendation ready
- [ ] Closeout meeting scheduled
