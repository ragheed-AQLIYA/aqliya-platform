# AuditOS — Demo Dataset Checklist

## 1. Trial Balance

| Requirement                           | Status      | Notes                                                         |
| ------------------------------------- | ----------- | ------------------------------------------------------------- |
| 20–50 accounts minimum                | ✅ 22 lines | Assets, liabilities, equity, revenue, expenses                |
| All account types present             | ✅          | Asset, non-current-asset, liability, equity, revenue, expense |
| At least one unmapped account         | ✅          | Sundry Income (5100) — 1 pending mapping                      |
| At least one variance or review issue | ✅          | Variance: SAR -415,000 (intentional)                          |
| Currency set                          | ✅          | SAR                                                           |
| Reporting period set                  | ✅          | FY2025                                                        |

---

## 2. Evidence Files

| Requirement                         | Status | Notes                                          |
| ----------------------------------- | ------ | ---------------------------------------------- |
| PDF sample                          | ✅     | bank_confirmation_samba.pdf                    |
| XLSX sample                         | ✅     | gulf_trading_tb_fy2025.xlsx, ppe_schedule.xlsx |
| At least one missing evidence item  | ✅     | inventory_count_sheet.pdf                      |
| At least one accepted evidence item | ✅     | 4 accepted items                               |
| At least one reviewed evidence item | ✅     | loan_agreement.pdf                             |
| Evidence links to accounts          | ✅     | 6 links to account mappings                    |

---

## 3. Findings

| Requirement                    | Status | Notes                                                                    |
| ------------------------------ | ------ | ------------------------------------------------------------------------ |
| One low/medium finding         | ✅     | Negative Balance in Accrued Expenses (medium)                            |
| One high/critical finding      | ✅     | Short-term Loan Classification (high), Missing Inventory Evidence (high) |
| One finding linked to evidence | ✅     | Short-term Loan Classification linked to loan_agreement.pdf              |
| One unresolved finding         | ✅     | 2 open, 1 in_review, 1 draft                                             |
| AI-suggested findings          | ✅     | aiSuggested=true on 3 findings                                           |

---

## 4. Recommendations

| Requirement         | Status | Notes                                 |
| ------------------- | ------ | ------------------------------------- |
| Linked to a finding | ✅     | All 3 linked to findings              |
| One accepted        | ✅     | rec-1: Accrued Expenses adjustment    |
| One pending         | ✅     | rec-3: Revenue Recognition disclosure |
| AI-contributed      | ✅     | 3 with aiContributed=true             |

---

## 5. Review Comments

| Requirement                     | Status | Notes                                      |
| ------------------------------- | ------ | ------------------------------------------ |
| One open comment                | ✅     | "Other Income needs separate presentation" |
| One resolved comment            | ⚠️     | Not in seed — resolve during demo          |
| Comments linked to real targets | ✅     | Target: statement (fs-is-1)                |
| Required action set             | ✅     | e.g., "revise" or "clarify"                |

---

## 6. Approval Scenarios

| Requirement             | Status | Notes                                                                           |
| ----------------------- | ------ | ------------------------------------------------------------------------------- |
| Blocked approval case   | ✅     | 4 blockers active (unmapped, missing evidence, open reviews, critical findings) |
| Ready-for-approval case | ⚠️     | Requires fixing blockers during demo                                            |
| Rejection with reason   | ✅     | Supported — can reject without readiness gate                                   |

---

## 7. AI Outputs

| Requirement                        | Status | Notes                                                 |
| ---------------------------------- | ------ | ----------------------------------------------------- |
| Draft note                         | ✅     | 1 AI note draft (accepted_by_human)                   |
| Evidence suggestion                | ⚠️     | Generate during demo via "Suggest Evidence"           |
| Finding draft                      | ✅     | 1 AI finding draft                                    |
| Recommendation draft               | ✅     | 1 AI recommendation draft (accepted_by_human)         |
| Analytical review output           | ✅     | 1 anomaly_explanation output                          |
| Source entity traceability         | ✅     | All AI outputs have sourceEntityType + sourceEntityId |
| All AI outputs are draft/suggested | ✅     | Statuses: suggested, accepted_by_human                |

---

## 8. Audit Trail

| Requirement                  | Status | Notes                                    |
| ---------------------------- | ------ | ---------------------------------------- |
| Engagement created event     | ✅     | engagement.created                       |
| Trial balance upload event   | ✅     | trial_balance.uploaded                   |
| Evidence created events      | ✅     | 6 evidence.created events                |
| Evidence linked events       | ✅     | 6 evidence.linked events                 |
| Finding created event        | ✅     | finding.created                          |
| Recommendation created event | ✅     | recommendation.created                   |
| Review comment added event   | ✅     | review.comment_added                     |
| AI output events             | ⚠️     | Generated during demo via AI actions     |
| Export events                | ⚠️     | Generated during demo via export actions |

---

## 9. Exports

| Requirement                       | Status | Notes                                                |
| --------------------------------- | ------ | ---------------------------------------------------- |
| Financial statements JSON         | ✅     | 3 statements, 10 notes                               |
| Audit file JSON                   | ✅     | Evidence, findings, recs, reviews, approvals, events |
| Bilingual export labels           | ✅     | Arabic/English statement title prefixes              |
| Draft label included              | ✅     | isDraft flag in export                               |
| Approval metadata (when approved) | ✅     | approvalInfo with approver and timestamp             |

---

## 10. Data Quality Notes

- **Trial balance variance is intentional.** Used to demonstrate the validation and trust state features. In a real audit, the variance should be investigated and resolved.
- **One mapping is intentionally pending.** Used to demonstrate the approval readiness gate blocking due to unmapped accounts.
- **Evidence items use placeholder file metadata.** Actual file content is not stored — only metadata (filename, type, size, hash).
- **AI outputs from seed are pre-generated.** During a live demo, additional AI outputs can be generated on demand using the Generate buttons.
- **No sensitive/real client data is used.** All names and amounts are synthetic.

---

## Data Reset Command

```bash
npm run seed:audit
```

This reseeds the database to the initial state described above. Use before each demo to ensure consistent starting state.
