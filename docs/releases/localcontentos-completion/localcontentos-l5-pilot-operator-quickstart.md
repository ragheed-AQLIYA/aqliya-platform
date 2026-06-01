# LocalContentOS L5 — Pilot Operator Quickstart
# دليل المشغّل السريع — LocalContentOS L5

**Date / التاريخ:** 2026-06-01  
**Product level / مستوى المنتج:** **L5 with conditions** — internal pilot OK; **NOT L6**; **NOT Production Ready**  
**Validation / التحقق:** Light validated — smoke **6/6 PASS**, unit tests **25/25 PASS**  
**Evidence pack / حزمة الأدلة:** `docs/releases/localcontentos-completion/`

---

## 0. Start pilot runtime / تشغيل بيئة التجريب

| Step | English | العربية |
|------|---------|---------|
| 1 | From repo root, start dev against pilot DB `aqliya_lc_pilot`: `npm run dev:localcontent-pilot` **or** `powershell -ExecutionPolicy Bypass -File scripts/run-localcontent-pilot.ps1` | من جذر المستودع: `npm run dev:localcontent-pilot` أو السكربت أعلاه |
| 2 | Script reads `.env.local` or `.env`, swaps **dbname only** to `aqliya_lc_pilot`, sets `LOCALCONTENT_CONTENT_BACKEND=prisma`. Does **not** edit `.env`. | يقرأ `.env` ويستبدل اسم قاعدة البيانات فقط؛ لا يعدّل الملف |
| 3 | Open **http://localhost:3000** (or `-Port 3001` if 3000 is busy). | افتح **http://localhost:3000** |
| 4 | Full setup: `localcontentos-pilot-runtime-guide.md` | التفاصيل: `localcontentos-pilot-runtime-guide.md` |

---

## 1. What this is / ما هذا

| English | العربية |
|---------|---------|
| **LocalContentOS Content Studio** is AQLIYA governed content workflow: Idea to Source to Draft to Review to Approval to Output. | **استوديو المحتوى** في LocalContentOS مسار محتوى محكوم: فكرة، مصدر، مسودة، مراجعة، موافقة، مخرجات. |
| **Compliance workspace** (`/local-content/projects/*`) remains the mature L5 compliance path — separate from Content Studio. | **مساحة الامتثال** (`/local-content/projects/*`) مسار امتثال L5 منفصل عن استوديو المحتوى. |
| AI assist is **deterministic / template-based** — not a production LLM. Every AI output requires human review. | المساعدة بالذكاء الاصطناعي **قالبية/حتمية** — ليست LLM إنتاجية. كل مخرج AI يتطلب مراجعة بشرية. |

---

## 2. Login / تسجيل الدخول

| Step | English | العربية |
|------|---------|---------|
| 1 | Open the app (pilot: `http://localhost:3001` or deployed pilot URL). | افتح التطبيق (تجريبي: `http://localhost:3001` أو رابط الـ pilot). |
| 2 | Go to **`/login`**. | انتقل إلى **`/login`**. |
| 3 | Sign in with org credentials. **Seed (dev/pilot):** `admin@aqliya.com` / `admin123` (ADMIN, Sunbul org). | سجّل الدخول. **بذرة:** `admin@aqliya.com` / `admin123` (ADMIN، Sunbul). |
| 4 | Confirm session before Content Studio nav. Use hard refresh or `?refresh=1` on review/outputs if counts look stale. | تأكد من الجلسة. حدّث الصفحة أو استخدم `?refresh=1` على المراجعة/المخرجات. |

**Tip / ملاحظة:** Type credentials manually — React controlled inputs may block automation-only login.

---

## 3. Routes / المسارات

### Content Studio (pilot scope)

| Route | English | العربية | Primary role |
|-------|---------|---------|--------------|
| `/local-content` | Command center | **مركز القيادة** | All |
| `/local-content/campaigns` | Create project + campaign | إنشاء مشروع + حملة | OPERATOR, ADMIN |
| `/local-content/campaigns/[id]` | Campaign detail — sources, items, draft assist | تفاصيل الحملة | OPERATOR, ADMIN |
| `/local-content/review` | Review queue — dimensions + notes | **قائمة المراجعة** | OPERATOR, ADMIN |
| `/local-content/outputs` | Output packages — create + export | **حزم المخرجات** | OPERATOR, ADMIN |

### Compliance workspace (preserved)

| Route | English | العربية |
|-------|---------|---------|
| `/local-content/projects` | Compliance project list | قائمة مشاريع الامتثال |
| `/local-content/projects/[projectId]/*` | Evidence, findings, spend, reports, audit trail | الأدلة، النتائج، الإنفاق، التقارير |

---

## 4. Workflow — Idea to Output / المسار

```
Idea → Source → Draft + AI assist → Submit review → Review dimensions → ADMIN approve → Output package → Export
```

| Step | Where | Action (EN) | الإجراء (AR) | Who |
|------|-------|-------------|--------------|-----|
| 1 Idea | `/local-content/campaigns/[id]` | Create content item | **عنصر محتوى جديد** | OPERATOR+ |
| 2 Source | Campaign detail | Add source | **إضافة مصدر** | OPERATOR+ |
| 3 Draft | Item card | **Draft assist (AI)** | **مساعدة مسودة (AI)** | OPERATOR+ |
| 4 Submit | Item card | Submit for review | **إرسال للمراجعة** | OPERATOR+ |
| 5 Review | `/local-content/review` | Record review (5 dimensions) | **تسجيل مراجعة** | OPERATOR+ |
| 6 Approve | `/local-content/review` | **Approve (ADMIN)** | **موافقة (ADMIN)** | ADMIN |
| 7 Output | `/local-content/outputs` | Create output package | **حزمة مخرجات جديدة** | OPERATOR+ |
| 8 Export | Output card | **Export (ADMIN)** | **تصدير (ADMIN)** | ADMIN |

### Review dimensions (5)

| Key | English | العربية |
|-----|---------|---------|
| `sourceGrounding` | Source grounding | مرتبط بالمصادر |
| `brand` | Brand alignment | العلامة |
| `compliance` | Compliance | الامتثال |
| `factualClaims` | Factual claims | الادعاءات |
| `languageQuality` | Language quality | اللغة |

**Smoke reference:** Worker 2 — **6/6 PASS**; review `crev_mpulmiwi_nzagcrh` (all dimensions true). See `agent-14-smoke-results.md`.

---

## 5. Permissions by role / الصلاحيات

| Permission | VIEWER | OPERATOR | ADMIN |
|------------|:------:|:--------:|:-----:|
| `localcontentos:read` | Yes | Yes | Yes |
| `localcontentos:create` | — | Yes | Yes |
| `localcontentos:update` | — | Yes | Yes |
| `localcontentos:review` | — | Yes | Yes |
| `localcontentos:approve` | — | — | Yes |
| `localcontentos:export` | — | — | Yes |

| Role | Summary (EN) | ملخص |
|------|--------------|------|
| VIEWER | Read-only | قراءة فقط |
| OPERATOR | Create, draft, review — no approve/export | إنشاء ومراجعة — بدون موافقة/تصدير |
| ADMIN | Full workflow including approve and export | مسار كامل |

**Tests:** `content-studio.test.ts` — **25/25 PASS**.

---

## 6. Audit events / أحداث التدقيق

`sourceSystem: localcontentos_content_studio` via `logContentStudioAudit` (12 mutation paths; dual-write non-blocking).

| Audit action | When |
|--------------|------|
| `localcontent.content_project.created` | Project created |
| `localcontent.content_campaign.created` | Campaign created |
| `localcontent.content_campaign.activated` | Campaign activated |
| `localcontent.content_source.created` | Source added |
| `localcontent.content_source.verified` | Source verified |
| `localcontent.content_item.created` | Item created |
| `localcontent.content_item.draft_assisted` | Governed AI assist |
| `localcontent.content_item.review_submitted` | Sent to review |
| `localcontent.content_review.completed` | Review recorded |
| `localcontent.content_approval.decided` | ADMIN decision |
| `localcontent.content_output.created` | Output package created |
| `localcontent.content_output.exported` | Output exported |

Compliance writes: `localcontent_compliance`.

---

## 7. Persistence and B3 guard / التخزين

| Path | Backend | When |
|------|---------|------|
| Pilot | **Prisma** | `DATABASE_URL` set; no `LOCALCONTENT_CONTENT_BACKEND=file` |
| Unit tests | File | `NODE_ENV=test` only |

**B3 guard** (`repository-instance.ts`): production-like env **refuses** file backend when Prisma expected. File store is **test-only**. Blocker B3 **OPEN (mitigated)** until PO signs Prisma-only path.

**Migration:** `20260601120000_localcontentos_content_studio`. **B1** SalesOS drift — no blind `migrate deploy`.

---

## 8. AI boundary / حدود AI

- Deterministic template only — not production LLM
- `reviewRequired: true` always
- Not compliance certification

---

## 9. Troubleshooting

| Symptom | Fix |
|---------|-----|
| Empty review queue | Login + item `draft`/`in_review` + `/local-content/review?refresh=1` |
| Export missing | ADMIN role required |
| Persistence errors | Check DATABASE_URL, B1 drift |

---

## 10. Related docs

- `localcontentos-l5-po-signoff-template.md`
- `localcontentos-human-smoke-checklist.md`
- `localcontentos-l6-program-closure.md`

**Production claim:** **NO / لا**
