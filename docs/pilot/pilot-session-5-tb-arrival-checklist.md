# Pilot Session 5 — Trial Balance Arrival Checklist

## 1. Status

- AuditOS is post-deploy validated.
- No critical blockers are open.
- Pilot Session 5 is waiting for a real customer Trial Balance file.
- This checklist starts when the customer TB file is received.

## 2. Before Receiving the File

- [ ] Confirm customer name / entity
- [ ] Confirm fiscal year / period
- [ ] Confirm file format expected
- [ ] Confirm who sent the file
- [ ] Confirm data permission / consent for pilot use
- [ ] Confirm whether the file contains sensitive personal data
- [ ] Confirm storage location and access limitation

## 3. File Intake Checklist

- [ ] Save original file without modification
- [ ] Record original filename
- [ ] Record received date/time
- [ ] Record sender
- [ ] Record file type
- [ ] Record file size
- [ ] Store file in approved pilot intake location
- [ ] Do not overwrite synthetic dataset
- [ ] Do not rename original before making a working copy
- [ ] Create a working copy if transformation is needed

## 4. Pre-Upload File Inspection

| Check                                 | Result | Notes |
| ------------------------------------- | ------ | ----- |
| Column headers present                |        |       |
| Account code column                   |        |       |
| Account name column                   |        |       |
| Debit / credit columns                |        |       |
| Opening / movement / closing balances |        |       |
| Currency                              |        |       |
| Period                                |        |       |
| Empty rows                            |        |       |
| Duplicate accounts                    |        |       |
| Negative balances                     |        |       |
| Unbalanced totals                     |        |       |
| Missing account names                 |        |       |
| Unexpected merged cells               |        |       |
| Multiple sheets                       |        |       |
| Arabic / English account names        |        |       |
| Encoding issues                       |        |       |

## 5. Go / Conditional Go / Hold Criteria

### Go

Proceed if:

- File opens.
- Trial balance structure is clear.
- Account names/codes are usable.
- Debits/credits or balance columns are identifiable.
- No critical corruption.

### Conditional Go

Proceed with caution if:

- Headers need mapping.
- Minor cleaning required.
- Some accounts need manual review.
- Multiple sheets require choosing one.
- Currency/period needs confirmation.

### Hold

Stop if:

- File cannot open.
- Critical columns are missing.
- Data is materially incomplete.
- File appears corrupted.
- Permission to use file is unclear.
- Sensitive data concerns require clarification.

## 6. AuditOS Upload Preparation

- [ ] Create or identify customer engagement
- [ ] Confirm engagement period
- [ ] Confirm organization/entity
- [ ] Prepare TB upload
- [ ] Keep synthetic dataset separate
- [ ] Record all assumptions
- [ ] Do not modify canonical mappings before inspection
- [ ] Do not force mapping if uncertain

## 7. Execution Sequence

1. Backup current database
2. Record current app/build status
3. Save customer TB original
4. Inspect file structure
5. Create customer engagement
6. Upload TB through AuditOS flow
7. Review upload result
8. Check mapping status
9. Review unmapped accounts
10. Generate statements if mapping is sufficient
11. Check notes/evidence/finding workflow
12. Run validation checks
13. Export PDF/XLSX if appropriate
14. Record issues and observations
15. Decide Go / Conditional / Hold for next pilot step

## 8. Evidence and Logging

| Time | Action                      | Result | Owner | Notes |
| ---- | --------------------------- | ------ | ----- | ----- |
|      | File receipt                |        |       |       |
|      | Inspection result           |        |       |       |
|      | Upload result               |        |       |       |
|      | Mapping result              |        |       |       |
|      | Statement generation result |        |       |       |
|      | Evidence gaps               |        |       |       |
|      | Findings                    |        |       |       |
|      | Export result               |        |       |       |
|      | Any errors                  |        |       |       |

## 9. What Not To Do

- Do not edit the original file.
- Do not overwrite demo/synthetic data.
- Do not claim AuditOS has completed audit work.
- Do not send outputs to customer before internal review.
- Do not ignore unmapped accounts.
- Do not force classifications without reviewer approval.
- Do not treat AI suggestions as final.
- Do not change product code during pilot unless a critical blocker is confirmed.
- Do not open LocalContentOS / SalesOS / SimulationOS work during this pilot step.

## 10. Pilot Session 5 Output

At the end of the session, produce:

- TB intake summary
- Data quality assessment
- Upload result
- Mapping status
- Statement readiness status
- Evidence gap list
- Findings / issues list
- Export status
- Go / Conditional Go / Hold decision
- Next action

## 11. Decision Template

```
Pilot Session 5 Decision:
[Go / Conditional Go / Hold]

Reason:
-

Blocking issues:
-

Non-blocking issues:
-

Next action:
-
```

## 12. Success Criteria

Pilot Session 5 is successful if:

- Real customer TB is safely received and preserved.
- File structure is understood.
- Upload path is tested with real data.
- Mapping quality is assessed.
- Issues are logged clearly.
- No unsupported claims are made to the customer.
- Next decision is evidence-based.
