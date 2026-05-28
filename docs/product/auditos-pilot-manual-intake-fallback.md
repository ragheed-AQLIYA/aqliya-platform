# AuditOS Pilot Manual Intake Fallback

**Status:** Standard operating procedure when webhook/CRM persistence is unavailable  
**Purpose:** Capture every inbound lead in the CSV tracker without claiming automatic persistence  
**Last updated:** 2026-05-28 (Wave 10)

---

## 1. When to Use This SOP

| Situation                                   | Use manual fallback                                  |
| ------------------------------------------- | ---------------------------------------------------- |
| `PILOT_REVIEW_WEBHOOK_URL` not configured   | ✅ Yes — form submissions are not stored server-side |
| Webhook delivery failed (see server log)    | ✅ Yes — within 4h per intake monitoring §14         |
| Customer emailed directly                   | ✅ Yes                                               |
| Referral or warm intro (WhatsApp, event)    | ✅ Yes                                               |
| Webhook working and logged to your endpoint | ❌ No — copy from webhook payload to CSV only        |

**Truth:** The `/contact` form returns success to the user even when nothing is persisted. Manual capture is **required** unless webhook (or email inbox discipline) is active.

---

## 2. Intake Sources and Tags

Record **Relationship Source** in CSV:

| Tag        | When to use                      | Initial stage                        |
| ---------- | -------------------------------- | ------------------------------------ |
| `Inbound`  | `/contact` form, website inquiry | Identified → Researched after triage |
| `Outbound` | You reached out first            | Researched or Contacted              |
| `Referral` | Intro from partner/customer      | Researched (prioritize)              |
| `Partner`  | Channel/partner lead             | Researched                           |
| `Event`    | Conference, webinar, meeting     | Identified or Researched             |

**Temperature** (record in **Notes**, not a separate column):

| Label       | Signal                                            | Action                              |
| ----------- | ------------------------------------------------- | ----------------------------------- |
| **Warm**    | Referral, repeat contact, explicit pilot interest | Triage ≤ 2 business days            |
| **Neutral** | Form submit or cold inbound with clear use case   | Triage ≤ 3 business days            |
| **Cold**    | General inquiry, weak fit, no pain articulated    | Triage ≤ 3 business days; may defer |

---

## 3. Manual Capture Steps (Every Intake)

### Step 1 — Capture raw intake (within same business day)

Record from form, email, or call:

- Organization, contact name, email, role
- Product interest, request type (pilot/demo/partnership)
- Use case, data type, current workflow, goal

If form-only and webhook unset: ask customer to confirm fields via email if you did not receive payload.

### Step 2 — Update CSV tracker

File: [`auditos-pilot-account-tracker-template.csv`](auditos-pilot-account-tracker-template.csv)

**Minimum fields on first row create:**

| Field                        | Value                                                             |
| ---------------------------- | ----------------------------------------------------------------- |
| Account Name                 | Organization                                                      |
| Contact Name                 | From intake                                                       |
| Contact Email                | From intake                                                       |
| Contact Role                 | From intake or TBD                                                |
| Relationship Source          | Inbound / Outbound / Referral / etc.                              |
| Current Stage                | Identified or Researched                                          |
| Internal Owner               | Assign now — never leave blank                                    |
| Next Action Owner            | Same as internal owner unless delegated                           |
| Next Action                  | e.g. "Send triage reply" / "Book intro call"                      |
| Follow-Up Date               | SLA date (see §4)                                                 |
| Last Contact Date            | Date intake received                                              |
| Main Pain / Primary Use Case | From useCase field                                                |
| Evidence Need                | From dataType + goal                                              |
| Risk Level                   | Initial estimate: Low / Medium / High                             |
| Notes                        | Intake source, temperature (warm/neutral/cold), raw date received |

Full mapping: `auditos-pilot-account-tracker.md` §8.

### Step 3 — Record first response

In **Notes**, append after first reply:

```
First response: YYYY-MM-DD | channel: email/call | outcome: [scheduled call / sent brief / deferred]
```

Update **Last Contact Date** to response date.

### Step 4 — Never leave row incomplete

If any of these are empty after 24h of intake, escalate:

- Internal Owner
- Next Action
- Next Action Owner
- Follow-Up Date

---

## 4. SLA Rules

| Event                  | Deadline                                  | CSV update                     |
| ---------------------- | ----------------------------------------- | ------------------------------ |
| Intake received        | Same day                                  | Row created, owner assigned    |
| First triage reply     | ≤ 3 business days (≤ 2 for warm/referral) | Last Contact Date, Next Action |
| After intro/demo       | Follow-up ≤ 48h                           | Stage, Follow-Up Date          |
| Overdue Follow-Up Date | Escalate same day                         | Risk Level ↑, Notes            |

---

## 5. CSV Update Checklist (Per Intake)

- [ ] New row or existing row updated (no duplicate accounts without note)
- [ ] Relationship Source set
- [ ] Temperature noted in Notes (warm / neutral / cold)
- [ ] Internal Owner assigned
- [ ] Current Stage set
- [ ] Next Action + Next Action Owner filled
- [ ] Follow-Up Date set to SLA deadline
- [ ] Main Pain / Primary Use Case populated from intake
- [ ] No claim that form auto-synced to tracker

---

## 6. Weekly Review Checklist (Monday, 15 min)

- [ ] Every inbound from last 7 days has a CSV row
- [ ] No row missing Internal Owner or Next Action
- [ ] All overdue Follow-Up Dates addressed or escalated
- [ ] Stale leads reviewed (see tracker §12)
- [ ] Referral/warm leads triaged within SLA
- [ ] Webhook status confirmed — if still unset, ops note to founder

Cross-reference: `auditos-pilot-account-tracker.md` §12, `auditos-pilot-command-center.md` §3.

---

## 8. Webhook Failure Response

When production logs show `webhook=failed` or `webhook=error`:

1. Check webhook destination for duplicate delivery (may have succeeded despite log)
2. Search logs for `org=` matching customer organization
3. If payload lost: contact customer within **4 hours** to confirm submission fields
4. Create CSV row manually; Notes: `webhook_failure YYYY-MM-DD`
5. Send first triage reply within SLA once row is complete
6. Escalate repeated failures to deploy owner — fix endpoint before next intake

Do **not** tell customer their data is stored in AQLIYA database — it is not.

---

## 9. What This SOP Does Not Claim

- Does **not** persist submissions in AQLIYA database
- Does **not** replace webhook for production intake visibility
- Does **not** guarantee CRM sync
- Does **not** auto-create pilot accounts in `/audit/*`

---

## 10. Related Documents

| Document                    | Path                                                      |
| --------------------------- | --------------------------------------------------------- |
| Intake monitoring (webhook) | `docs/product/auditos-pilot-intake-monitoring.md`         |
| CSV template                | `docs/product/auditos-pilot-account-tracker-template.csv` |
| Account tracker fields      | `docs/product/auditos-pilot-account-tracker.md`           |
| Execution index             | `docs/product/auditos-pilot-execution-index.md`           |
