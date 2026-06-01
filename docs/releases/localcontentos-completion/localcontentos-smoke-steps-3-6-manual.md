# Manual Smoke — Steps 3–6 (Content Studio)

**Purpose:** Complete human browser validation after Agent 16 form fixes.  
**Environment:** `http://localhost:3001` with dev server running and PostgreSQL + `DATABASE_URL` set.  
**Credentials:** `admin@aqliya.com` / `admin123` (seed ADMIN, Sunbul org)

## Prerequisites

1. Dev server: `npm run dev` (port 3001 if configured).
2. Log in via `/login` (use real typing — React controlled inputs).
3. Complete step 2 if no campaign exists (see below).

## Step 2 (if needed): Project + campaign

1. Open `/local-content/campaigns`.
2. Fill **مشروع محتوى جديد** → **إنشاء مشروع**. List should refresh; campaign form appears.
3. Fill **حملة جديدة** → **إنشاء حملة**. You should redirect to `/local-content/campaigns/[id]`.

**Pass criteria:** Campaign detail page loads with empty items/sources.

## Step 3: Source + content item

On campaign detail (`/local-content/campaigns/[id]`):

1. **مصدر / دليل:** title e.g. `Official LC policy`, type `url`, URL `https://example.com/lc` → **إضافة مصدر**.
2. Confirm **المصادر** count increments after refresh.
3. **عنصر محتوى جديد:** title e.g. `Pilot article`, format `article` → **إنشاء**.
4. Confirm item card appears in **عناصر المحتوى**.

**Pass criteria:** Source count ≥ 1, item visible with status draft.

## Step 4: Draft assist (governed AI)

1. On the item card, click **مساعدة مسودة (AI)**.
2. Wait for refresh; body text should appear (deterministic template).
3. Item should show AI-generated indicators in DB/tests; UI shows body preview.

**Pass criteria:** Body text populated; no unhandled error alert.

## Step 5: Review + ADMIN approve

1. Click **إرسال للمراجعة** on the item.
2. Open `/local-content/review` — item appears in queue.
3. Check review dimensions, add notes, **تسجيل مراجعة**.
4. As ADMIN, click **موافقة (ADMIN)** (or **طلب تعديلات** to test alternate path).

**Pass criteria:** Queue updates; item status moves toward approved.

## Step 6: Output package + export

1. Open `/local-content/outputs`.
2. If sidebar form visible, create **حزمة مخرجات جديدة** with a title.
3. Confirm package lists includes (campaign summary, calendar, approved content, compliance memo flags).
4. Click **تصدير (ADMIN)** on the package.
5. Confirm status shows **مُصدّر**.

**Pass criteria:** Output package created and export action completes without error.

## Record results

Update `agent-14-smoke-results.md` and `localcontentos-human-smoke-checklist.md` with PASS/PARTIAL/BLOCKED per step.

## Known automation limitations

- Cursor browser MCP `browser_fill` does not update React controlled inputs — use `browser_type` slowly or manual login.
- Do not treat automation failures as product failures if manual steps pass.
