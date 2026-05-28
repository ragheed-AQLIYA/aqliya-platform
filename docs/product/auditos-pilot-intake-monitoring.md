# AuditOS Pilot Intake Monitoring

**Status:** Operator runbook for `/contact` pilot review submissions  
**Purpose:** Know when a form is submitted and capture it in the tracker when no CRM exists  
**API:** `POST /api/pilot-review` (public, rate-limited via middleware)  
**Manual fallback:** `docs/product/auditos-pilot-manual-intake-fallback.md`  
**Last updated:** 2026-05-28 (Wave 10)

---

## 1. Intake Reality Summary

| Question                                   | Answer                                                                     |
| ------------------------------------------ | -------------------------------------------------------------------------- |
| Are submissions stored in PostgreSQL?      | **No**                                                                     |
| Are submissions stored on disk by the app? | **No**                                                                     |
| What persists when webhook is set?         | Payload POSTed to **your** endpoint only                                   |
| What persists when webhook is unset?       | **Nothing server-side** (user sees success)                                |
| Dev visibility                             | Partial console log + WARNING (development)                                |
| Production visibility without webhook      | Server **WARNING** log line (org + timestamp only) + manual/email fallback |

**Production blind spot:** If `PILOT_REVIEW_WEBHOOK_URL` is unset and operators do not monitor email/inbox or logs, **submissions are lost to operations** after the HTTP response.

---

## 2. Flow Diagram

```
User submits /contact form
  → POST /api/pilot-review
  → Validation
  → warnIfWebhookUnset() if no env var (server log — NOT persistence)
  → safeDevLog() if NODE_ENV=development (summary only)
  → POST to PILOT_REVIEW_WEBHOOK_URL if set (5s timeout; status logged)
  → Log: webhook=delivered | webhook=failed | webhook=error | WARNING if unset
  → { ok: true } to browser (even on webhook failure)
```

---

## 3. When Webhook IS Set

### Required env var

```env
PILOT_REVIEW_WEBHOOK_URL=https://your-endpoint.example/hooks/pilot-review
```

Set in deployment environment. Restart/redeploy after change. Never commit to repo.

### Expected success behavior

1. User receives `{ ok: true, message: "Pilot review request received." }`
2. App POSTs full JSON payload to your URL within 5 seconds
3. Your endpoint is responsible for storage (sheet, Slack, email, queue, etc.)
4. Operator copies payload into CSV tracker per manual fallback §3

### Failure behavior (Wave 10 — status logged)

| Failure          | User sees  | Server log (no payload/email)      | Operator must                     |
| ---------------- | ---------- | ---------------------------------- | --------------------------------- |
| Webhook 2xx      | Success    | `webhook=delivered \| status=200`  | Copy to CSV if not auto-synced    |
| Webhook 4xx/5xx  | Success    | `webhook=failed \| status=4xx/5xx` | Fix endpoint; manual fallback §14 |
| Timeout (>5s)    | Success    | `webhook=error \| reason=timeout`  | Manual fallback §14               |
| Network error    | Success    | `webhook=error \| reason=...`      | Manual fallback §14               |
| Webhook unset    | Success    | `WARNING ... unset`                | Manual fallback SOP               |
| Validation error | Error JSON | None                               | N/A                               |

Log lines include **org + timestamp only** — not email, use case, or webhook URL.

**The app still fails open for UX.** Operators must monitor logs and/or webhook destination.

---

## 4. When Webhook IS Unset

| Layer       | Behavior                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Browser     | Success message — starts fit review, not pilot acceptance                                         |
| Server      | No DB write; WARNING log: `PILOT_REVIEW_WEBHOOK_URL unset — submission not persisted server-side` |
| Development | Additional product field in WARNING; `[PilotReview]` info log                                     |
| Operators   | **Must** use manual intake SOP + email monitoring                                                 |

See: `docs/product/auditos-pilot-manual-intake-fallback.md`

---

## 5. Webhook Payload Reference

```json
{
  "source": "pilot-review-form",
  "submittedAt": "2026-05-28T12:00:00.000Z",
  "environment": "production",
  "request": {
    "name": "string",
    "email": "string",
    "organization": "string",
    "role": "string | omitted",
    "productInterest": "string",
    "interest": "string | omitted",
    "useCase": "string",
    "dataType": "string",
    "currentWorkflow": "string | omitted",
    "goal": "string"
  },
  "meta": {
    "userAgent": "string",
    "referer": "string"
  }
}
```

### Field mapping to CSV

| Payload field             | CSV column                   |
| ------------------------- | ---------------------------- |
| `request.organization`    | Account Name                 |
| `request.name`            | Contact Name                 |
| `request.email`           | Contact Email                |
| `request.role`            | Contact Role                 |
| `request.productInterest` | Primary Use Case             |
| `request.interest`        | Next Action (type)           |
| `request.useCase`         | Main Pain / Primary Use Case |
| `request.dataType`        | Evidence Need                |
| `request.currentWorkflow` | Current Workflow             |
| `request.goal`            | Notes / Evidence Need        |
| `submittedAt`             | Notes (intake timestamp)     |

Full mapping: `auditos-pilot-account-tracker.md` §8.

---

## 6. Webhook Destination Options (Operator Choice)

| Destination type                        | Pros            | Cons                                                        |
| --------------------------------------- | --------------- | ----------------------------------------------------------- |
| **Slack/Teams incoming webhook**        | Fast team alert | Needs formatter (Zapier/Make/script)                        |
| **Google Sheets / Airtable automation** | Structured log  | External data handling review                               |
| **Email via automation**                | Familiar inbox  | Delay; threading                                            |
| **Custom HTTPS endpoint**               | Full control    | You maintain availability                                   |
| **Server log scraping only**            | No setup        | **Insufficient** — WARNING lacks full payload in production |

**No vendor is coupled in app code.** URL is generic POST JSON.

---

## 7. Production Setup Checklist

**Owner:** Pilot operations lead (assign named person)

- [ ] Decide destination (Slack, sheet, email, custom endpoint)
- [ ] Create endpoint that accepts POST JSON
- [ ] Set `PILOT_REVIEW_WEBHOOK_URL` in production env
- [ ] Redeploy / restart application
- [ ] Run test procedure (§8) against production URL
- [ ] Confirm test row appears at destination AND in CSV tracker workflow
- [ ] Document who monitors destination daily (§9)
- [ ] If webhook cannot be set: activate manual fallback SOP + daily inbox check

---

## 8. Test Procedure

### Local (development)

```bash
npm run dev
```

```bash
curl -s -X POST http://localhost:3000/api/pilot-review \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"organization\":\"Test Org\",\"productInterest\":\"AuditOS\",\"interest\":\"Pilot Review — تقييم المنتج على بيانات فعلية\",\"useCase\":\"Trial balance workflow\",\"dataType\":\"بيانات مالية (ميزان مراجعة، قوائم)\",\"goal\":\"Evaluate fit on one engagement\"}"
```

**Expect:**

- Response: `{"ok":true,"message":"Pilot review request received."}`
- Console: `[PilotReview]` log line
- If webhook unset: `WARNING PILOT_REVIEW_WEBHOOK_URL unset`
- If webhook set, success: `webhook=delivered | status=200` (or 201, etc.)
- If webhook set, HTTP error: `webhook=failed | status=...`
- If webhook set, timeout: `webhook=error | reason=timeout`

### Production smoke test (after deploy)

1. Submit test via curl to production `/api/pilot-review` with clearly marked test org name
2. Verify webhook destination received payload
3. Delete/archive test entry; do not treat as real lead

### Browser test

1. `/contact` → submit form
2. DevTools → Network → confirm 200 + `ok: true`
3. Verify webhook or manual CSV step completed

---

## 9. Manual Monitoring Checklist (Daily, 10 min)

| Check                                               | Owner               | Action if fail                        |
| --------------------------------------------------- | ------------------- | ------------------------------------- |
| Webhook inbox / automation                          | Pilot owner         | Investigate endpoint; manual fallback |
| Email ragheed@aqliya.com                            | Pilot owner         | CSV row + triage                      |
| Server logs for `webhook=failed` or `webhook=error` | Pilot owner         | Manual fallback §14 within 4h         |
| Server logs for WARNING unset                       | Ops (if log access) | Configure webhook urgently            |
| CSV overdue Follow-Up Dates                         | Pilot owner         | Contact or escalate                   |
| Intake SLA > 3 business days                        | Pilot owner         | Founder escalation                    |

Weekly CSV review: `auditos-pilot-account-tracker.md` §12.

---

## 10. Operator Responsibilities

| Role            | Responsibility                                              |
| --------------- | ----------------------------------------------------------- |
| **Pilot owner** | Triage, CSV updates, follow-up SLAs                         |
| **Founder**     | Escalations, webhook unset in production, red health pilots |
| **Deploy/ops**  | Set and verify `PILOT_REVIEW_WEBHOOK_URL`                   |
| **No role**     | Assuming form auto-saves to database — **false**            |

---

## 11. Required Form Fields (API)

| Field                                 | Required | Max length |
| ------------------------------------- | -------- | ---------- |
| `name`                                | Yes      | 2000       |
| `email`                               | Yes      | 2000       |
| `organization`                        | Yes      | 2000       |
| `productInterest`                     | Yes      | 2000       |
| `useCase`                             | Yes      | 2000       |
| `dataType`                            | Yes      | 2000       |
| `goal`                                | Yes      | 2000       |
| `role`, `interest`, `currentWorkflow` | No       | 2000       |

Max body: **50 KB**.

---

## 14. Production Go-Live Checklist

Complete **before** accepting real pilot intake on production `/contact`.

### Pre-go-live

- [ ] Named pilot owner and backup owner assigned
- [ ] `PILOT_REVIEW_WEBHOOK_URL` set in production environment
- [ ] Webhook endpoint tested with curl (§8) — log shows `webhook=delivered`
- [ ] Webhook destination monitored (Slack/sheet/email/inbox)
- [ ] CSV tracker file ready with real owner names (not placeholders only)
- [ ] Manual fallback SOP reviewed: `auditos-pilot-manual-intake-fallback.md`
- [ ] First-response SLA understood (≤ 3 business days; ≤ 2 warm/referral)

### Go-live smoke test (production)

1. Submit test with org name prefix `TEST-GOLIVE-` via curl or form
2. Confirm `webhook=delivered` in server logs
3. Confirm payload at webhook destination
4. Add test row to CSV then delete/archive — do not treat as lead
5. Remove or ignore test org in tracker

### Post-go-live (daily)

- [ ] Check webhook destination + logs for failures (§9)
- [ ] New intakes in CSV within **same business day**
- [ ] First customer reply within SLA

### Failure response procedure

When log shows `webhook=failed` or `webhook=error`:

1. **Within 4 hours:** Check if payload reached destination anyway (duplicate check)
2. If lost: search server logs for org name; if insufficient, email customer to confirm submission
3. Manual CSV row from recovered fields — tag Notes: `webhook_failure YYYY-MM-DD`
4. Fix webhook endpoint or env; re-run smoke test
5. If repeated failures: escalate to deploy owner; do not claim intake is automated

### CSV update SLA (after intake visible)

| Event                     | CSV action                | Deadline                     |
| ------------------------- | ------------------------- | ---------------------------- |
| Webhook received          | Row create/update         | Same business day            |
| Manual email intake       | Row create                | Same business day            |
| First triage reply sent   | Last Contact Date + Notes | ≤ 3 business days (≤ 2 warm) |
| Webhook failure recovered | Row from manual capture   | Within 4 hours of detection  |

---

## 15. What This Document Does Not Do

- Does not add database tables or CRM sync
- Does not change auth or middleware
- Does not guarantee webhook delivery (app fails open)
- Does not replace CSV tracker discipline

Future wave (explicit approval): intake queue, admin UI, or Prisma persistence.

---

## 16. Related Documents

| Document               | Path                                                      |
| ---------------------- | --------------------------------------------------------- |
| Manual intake fallback | `docs/product/auditos-pilot-manual-intake-fallback.md`    |
| Pilot execution index  | `docs/product/auditos-pilot-execution-index.md`           |
| Account tracker        | `docs/product/auditos-pilot-account-tracker.md`           |
| CSV template           | `docs/product/auditos-pilot-account-tracker-template.csv` |
| API implementation     | `src/app/api/pilot-review/route.ts`                       |
