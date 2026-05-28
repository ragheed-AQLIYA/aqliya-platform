# Pilot Review Intake API — v0.2

## Endpoint

```
POST /api/pilot-review
```

لا يتطلب مصادقة. يستقبل طلبات مراجعة Pilot من صفحة `/contact`.

## Required Fields

| Field             | Type   | Description                             |
| ----------------- | ------ | --------------------------------------- |
| `name`            | string | الاسم الكامل                            |
| `email`           | string | البريد الإلكتروني (validation: `*@*.*`) |
| `organization`    | string | الجهة / المؤسسة                         |
| `productInterest` | string | المنتج المهتم به                        |
| `useCase`         | string | وصف use case                            |
| `dataType`        | string | نوع البيانات                            |
| `goal`            | string | الهدف من البايلوت                       |

## Optional Fields

| Field             | Type   |
| ----------------- | ------ |
| `role`            | string |
| `interest`        | string |
| `currentWorkflow` | string |

## Validation

- جميع الحقول المطلوبة: non-empty string
- max field length: 2000 chars
- max body size: 50 KB
- email format: `*@*.*`
- Invalid JSON → 400
- Validation errors → 400 with joined messages
- Payload too large → 413

## Response Shape

### Success (200)

```json
{
  "ok": true,
  "message": "Pilot review request received."
}
```

### Error (400 / 413 / 500)

```json
{
  "ok": false,
  "error": "وصف المشكلة"
}
```

## Environment Variables

| Variable                   | Required | Description                                                                                                         |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `PILOT_REVIEW_WEBHOOK_URL` | No       | Optional webhook endpoint. If set, the full structured payload is forwarded via POST (fire-and-forget, 5s timeout). |

## Webhook Payload

When `PILOT_REVIEW_WEBHOOK_URL` is set, the following payload is sent:

```json
{
  "source": "pilot-review-form",
  "submittedAt": "2026-05-28T12:00:00.000Z",
  "environment": "production",
  "request": {
    "name": "...",
    "email": "...",
    "organization": "...",
    "role": "...",
    "productInterest": "...",
    "dataType": "...",
    "useCase": "...",
    "goal": "..."
  },
  "meta": {
    "userAgent": "...",
    "referer": "..."
  }
}
```

- Webhook is **optional**. Disabled when env var is absent.
- Fire-and-forget: failure does not affect the client response.
- Timeout: 5 seconds.
- Only send to endpoints you trust.
- Data is not stored in any database in v0.2.

## Storage

**No database storage in v0.2.** Submissions are:

- Logged minimally in development only (`organization`, `productInterest`, `submittedAt`)
- Forwarded to webhook if configured
- Not stored in any database or persistent store

## Security & Privacy

- No email sending in v0.2
- No database writes
- Webhook URL must not be logged or exposed to clients
- Sensitive fields (email, useCase, goal) are not printed in production logs
- Stack traces are never returned to the client

## Tracking Events

| Event                       | Trigger                    |
| --------------------------- | -------------------------- |
| `start_pilot_review_form`   | First field interaction    |
| `submit_pilot_review_form`  | Button click               |
| `pilot_review_form_success` | API returns 200            |
| `pilot_review_form_error`   | API fails or returns error |

## Related Files

- `src/app/api/pilot-review/route.ts` — API route implementation
- `src/app/(marketing)/contact/contact-form.tsx` — Client form component
- `src/lib/tracking.ts` — Tracking utility

## Next Steps (v0.3+)

- Email notification
- Database storage + admin review page
- Notion / CRM webhook scenario
