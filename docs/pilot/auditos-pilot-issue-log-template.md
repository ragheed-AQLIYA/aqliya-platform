# AuditOS — Pilot Issue Log

**Status:** Pilot operations document
**Purpose:** Track every issue encountered during the pilot — from file intake to final decision

---

## Issue Log

| #   | Date | Issue | Severity | Area | Customer Impact | Workaround | Owner | Decision | Status |
| --- | ---- | ----- | -------- | ---- | --------------- | ---------- | ----- | -------- | ------ |
|     |      |       |          |      |                 |            |       |          |        |

---

## Severity Definitions

| Severity     | Meaning                                          | Response Time     |
| ------------ | ------------------------------------------------ | ----------------- |
| **Critical** | Blocks pilot progress entirely                   | Immediate         |
| **High**     | Significant impact on workflow or output quality | Within 24 hours   |
| **Medium**   | Moderate impact — should be addressed            | Within 3 days     |
| **Low**      | Minor issue — process improvement                | Before next pilot |
| **Info**     | Observation — no action required                 | Logged            |

---

## Area Definitions

| Area            | Description                                        |
| --------------- | -------------------------------------------------- |
| **File Intake** | File format, column issues, data quality           |
| **Upload**      | System upload, record count mismatch               |
| **Mapping**     | Account mapping, unmapped accounts, low confidence |
| **Statements**  | SFP, P&L generation, balance errors                |
| **Notes**       | AI draft quality, missing disclosures              |
| **Evidence**    | Evidence links, file issues                        |
| **Findings**    | Review process, severity classification            |
| **Export**      | PDF/XLSX generation, format issues                 |
| **Customer**    | Communication, expectations, feedback              |
| **System**      | Performance, bugs, authentication                  |

---

## Example Entries

| #   | Date       | Issue                                                                                   | Severity | Area        | Customer Impact              | Workaround                              | Owner          | Decision                              | Status   |
| --- | ---------- | --------------------------------------------------------------------------------------- | -------- | ----------- | ---------------------------- | --------------------------------------- | -------------- | ------------------------------------- | -------- |
| 001 | 2026-05-16 | TB file has 1 SAR rounding difference (Debits: 12,345,678.00 vs Credits: 12,345,677.00) | Medium   | File Intake | None — within tolerance      | Accept with note                        | Technical Lead | Accept — document as known difference | Resolved |
| 002 | 2026-05-16 | 3 account codes have leading zeros stripped by Excel                                    | Critical | File Intake | Accounts may map incorrectly | Request customer to format as text      | Pilot Lead     | Contact customer for corrected file   | Open     |
| 003 | 2026-05-17 | AI mapping confidence < 60% for 12 revenue accounts                                     | High     | Mapping     | Manual review overhead       | Reviewer manually maps flagged accounts | Reviewer       | Proceed with manual review            | Resolved |

---

## Issue Logging Procedure

1. **Detect** — identify issue during any pilot stage
2. **Log** — add entry to this log with all fields
3. **Severity** — assign based on impact
4. **Assign** — set owner for resolution
5. **Decide** — determine action: accept, work around, fix, or escalate
6. **Resolve** — update status when resolved
7. **Verify** — confirm resolution before proceeding past the impacted gate

---

## Issue Status Flow

```
Open → In Progress → Resolved → Verified
  ↓         ↓
Escalated  Won't Fix
  ↓
Accepted (with documented impact)
```

---

## Escalation Path

| Level | Who            | When                                              |
| ----- | -------------- | ------------------------------------------------- |
| L1    | Technical Lead | Any technical issue                               |
| L2    | Pilot Lead     | Issue affecting timeline or customer relationship |
| L3    | Founder        | Critical blocker or customer escalation           |
