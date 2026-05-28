# Pilot Review Webhook Scenario — v0.2B

## Overview

مسار استقبال طلبات Pilot Review بدون تخزين داخلي:

```
/contact form
→ POST /api/pilot-review
→ PILOT_REVIEW_WEBHOOK_URL (optional env var)
→ Make / Zapier / n8n / automation
→ Notion database or CRM board
```

AQLIYA لا يخزن الطلبات في v0.2. الـ webhook الخارجي هو المسؤول عن التخزين والتصنيف.

---

## Webhook Payload

Shape ثابت يُرسل إلى webhook عند توفر `PILOT_REVIEW_WEBHOOK_URL`:

```json
{
  "source": "pilot-review-form",
  "submittedAt": "2026-05-28T12:00:00.000Z",
  "environment": "production",
  "request": {
    "name": "أحمد السالم",
    "email": "a.salim@example.com",
    "organization": "مكتب السالم للتدقيق",
    "role": "شريك تدقيق",
    "productInterest": "AuditOS",
    "interest": "Pilot Review — تقييم المنتج على بيانات فعلية",
    "useCase": "تدقيق شركات مساهمة — ٣ ارتباطات سنويًا",
    "dataType": "بيانات مالية (ميزان مراجعة، قوائم)",
    "currentWorkflow": "Excel / جداول يدوية",
    "goal": "تقليل وقت إعداد القوائم وتوحيد مسار الأدلة"
  },
  "meta": {
    "userAgent": "Mozilla/5.0 ...",
    "referer": "https://aqliya.com/contact"
  }
}
```

---

## Recommended Notion / Fields

أنشئ قاعدة بيانات Notion (أو CRM board) باسم **AQLIYA Pilot Reviews** بالحقول التالية:

| Field            | Type          | Mapping (from payload)                  |
| ---------------- | ------------- | --------------------------------------- |
| Title            | Title (text)  | `request.name` + `request.organization` |
| Name             | Text          | `request.name`                          |
| Email            | Email         | `request.email`                         |
| Organization     | Text          | `request.organization`                  |
| Role             | Select        | `request.role`                          |
| Product Interest | Select        | `request.productInterest`               |
| Interest Type    | Select        | `request.interest`                      |
| Data Type        | Select        | `request.dataType`                      |
| Use Case         | Text          | `request.useCase`                       |
| Current Workflow | Select        | `request.currentWorkflow`               |
| Goal             | Text          | `request.goal`                          |
| Source           | Select        | `source`                                |
| Environment      | Select        | `environment`                           |
| Submitted At     | Date          | `submittedAt`                           |
| Status           | Select        | `New` (default)                         |
| Priority         | Select        | Auto-calculated                         |
| Owner            | Person / Text | —                                       |
| Next Step        | Text          | —                                       |
| Notes            | Text          | —                                       |

### Status Options

```
New
Qualified
Needs Clarification
Pilot Review Scheduled
Not Fit
Closed
```

### Priority Options

```
High
Medium
Low
```

### Product Interest Options

```
AuditOS
LocalContentOS
DecisionOS
Office AI Assistant
غير متأكد — أحتاج توجيهًا
```

---

## Automation Rules (Make / Zapier / n8n)

اقتراحات لقواعد الأتمتة بعد استقبال الـ webhook:

### Priority Assignment

```
If productInterest = "AuditOS" AND organization ≠ ""
  → Priority = High
Elif useCase length > 50 chars
  → Priority = Medium
Else
  → Priority = Low
```

### Status Assignment

```
If useCase length < 20 chars OR goal length < 10 chars
  → Status = "Needs Clarification"
Elif environment ≠ "production"
  → Status = "Needs Clarification" (tag as test)
Else
  → Status = "New"
```

### Security Review Flag

```
If dataType contains "حساس" or "حكومي" or "سري"
  → Add note: "Data sensitivity flagged — review security before pilot"
```

### Notification

```
On Status = "New" AND Priority = "High"
  → Send notification to team (email / Slack / Telegram)
```

---

## Security Notes

- لا ترسل البيانات إلى webhook غير موثوق.
- لا تخزن بيانات حساسة خارج بيئة معتمدة.
- لا تضع webhook URL في repo — استخدم env var فقط.
- `PILOT_REVIEW_WEBHOOK_URL` اختياري: معطل افتراضيًا.
- لا تسجل payload كامل في logs.
- الـ webhook fire-and-forget: فشله لا يؤثر على المستخدم.
- اختبار webhook أولاً بـ Webhook.site أو Make test endpoint.

---

## Test Payload (آمن)

لاختبار automation قبل تشغيله على طلبات حقيقية، استخدم هذا JSON:

```json
{
  "source": "pilot-review-form",
  "submittedAt": "2026-05-28T10:00:00.000Z",
  "environment": "development",
  "request": {
    "name": "Test User",
    "email": "test@example.com",
    "organization": "Test Org",
    "role": "CFO",
    "productInterest": "AuditOS",
    "interest": "Pilot Review — تقييم المنتج على بيانات فعلية",
    "useCase": "اختبار أتمتة استقبال طلبات الـ Pilot",
    "dataType": "بيانات مالية (ميزان مراجعة، قوائم)",
    "currentWorkflow": "Excel / جداول يدوية",
    "goal": "التحقق من وصول البيانات إلى Notion"
  },
  "meta": {
    "userAgent": "TestAgent/1.0",
    "referer": "https://aqliya.com/contact"
  }
}
```

---

## Operational Next Step

بعد وصول أول 5-10 طلبات حقيقية، قرر:

| Option                  | Action                                                 |
| ----------------------- | ------------------------------------------------------ |
| Email notification      | تفعيل Resend (موجود فعليًا في `custom-product-submit`) |
| DB storage + admin page | إنشاء Prisma model + لوحة مراجعة داخلية                |
| CRM deeper integration  | ربط webhook مباشر بـ CRM مستخدم فعليًا                 |
| Keep current setup      | لا تغيير — الـ webhook كافٍ للمرحلة                    |

لا تنتقل إلى DB أو Admin قبل وجود طلبات حقيقية.
