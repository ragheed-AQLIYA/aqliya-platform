# AQLIYA Commercial Funnel + Pilot Activation Report

**Date:** 2026-05-29  
**Agent:** 5 — Commercial Funnel + Pilot Activation (Eid Build Sprint)  
**Scope:** Marketing funnel inspection, conservative claim alignment, safe CTA fixes, launch ops docs  
**Authority:** `docs/reports/aqliya-eid-sprint-reality-check.md`, `PRODUCT_STATUS_MATRIX`, Session 4 pilot reports

---

## Executive Summary

The commercial funnel is **structurally strong** for controlled pilot activation: proof pages, engagement models, and contact intake are aligned on “fit review → pilot → evidence,” not production deploy. Gaps were mainly **CTA hierarchy drift** (demo ahead of pilot on homepage/audit product), **one broken product link**, **form/API mismatch on `goal`**, and **a few over-strong availability claims**. Safe fixes were applied in marketing pages only; backend webhook behavior was left as scaffolded (Wave 10).

---

## 1. Funnel Path Review

### Intended path (pilot activation)

```text
Awareness → Proof → Fit → Intake → Ops
   │         │       │      │       │
   /         /auditos, /proof-library, /pilot-proof
   /products/audit, /executive-brief
   /engagement-models
   /contact (+ /api/pilot-review)
   CSV + manual SOP (auditos-pilot-*)
```

### Page-by-page CTA hierarchy (after fixes)

| Page | Primary CTA | Secondary | Tertiary / proof |
| ---- | ----------- | --------- | ---------------- |
| **Homepage** | طلب مراجعة Pilot → `/contact` | ديمو `/auditos` | إحاطة `/executive-brief` |
| **Homepage (footer CTA)** | Pilot → `/contact` | ديمو | proof-library |
| **`/products/audit`** | طلب مراجعة Pilot → `/contact` | إحاطة تنفيذية | proof-library |
| **`/executive-brief`** | طلب الجلسة → `/contact` | ديمو | engagement-models |
| **`/engagement-models`** | طلب تشخيص → `/contact` | pilot-proof | executive-brief |
| **`/pilot-proof`** | طلب تشخيص → `/contact` | proof-library | engagement-models |
| **`/proof-library`** | طلب تشخيص → `/contact` | executive-brief | pilot-proof |
| **`/contact`** | Form → `/api/pilot-review` | mailto fallback | pilot-proof, engagement-models |

### Pre-fix issues (resolved)

1. Homepage hero put **interactive demo** as `btn-primary` while comment block said executive/pilot primary.
2. `/products/audit` hero sent pilot seekers to **`/custom-product`** (custom build funnel, wrong intent).
3. `/products/audit` final CTA prioritized executive brief over **contact**.
4. **`/products/office-ai`** linked from contact/engagement/pilot-proof but **no marketing route exists** → 404 risk.

### Unchanged (acceptable)

- `/custom-product` remains correct for **custom system** inquiries only.
- Webhook **fail-open** (`ok: true` even if webhook fails) — documented in Wave 10; ops must monitor logs + CSV fallback.
- Proof library shows **synthetic/demo** samples only — appropriately labeled.

---

## 2. Copy & Claims Audit

### Strong / evidence-aligned

- Trust principle repeated consistently: الذكاء يساعد · الإنسان يقرر · الدليل يحكم.
- Contact + engagement **boundary lists** (no compliance guarantee, no auto production deploy).
- Pilot-proof **“ما لا يُدّعى”** section matches Session 4 / matrix (no SOC2, no ERP, no full production).
- Maturity section on homepage (L5/L4/L3/L0) matches reality check product map.

### Weak or unclear (addressed or documented)

| Location | Issue | Action |
| -------- | ----- | ------ |
| Homepage badge | “جاهز للتجربة” vague | → “بايلوت محكوم L5” |
| Executive brief `availableNow` | “سير عمل كامل على بيانات فعلية” | Softened to controlled rehearsal + fit-gated external pilot |
| Audit product “Is” list | “فرق مراجعة حالية” | Softened to controlled environments + scheduled external pilot |
| Proof library | Illustrative numbers (147 accounts, etc.) | OK if read as **demo samples** — keep badge “بيانات تجريبية” visible |
| Executive brief comparison table | All ✓ on AQLIYA column | Acceptable as **design intent** if paired with “not yet” list (present) |

### Missing proof (gaps — not fixed in copy alone)

| Gap | Recommendation |
| --- | -------------- |
| No **named** external org pilot on site | Do not add logos/quotes until Session 4+ external org executes |
| No downloadable proof pack | Keep “assets on request during pilot” boundary in proof-library |
| Case studies page | Verify content is synthetic/placeholder before outbound links |
| First-party **ROI** numbers | Do not add until pilot closeout memos exist |

### Over-claim risk (do not publish)

Per reality check B3/B4/B10: do **not** say “external pilot complete,” “production certified,” “L6,” or “SOC2/ISO ready.” Session 4 PASS = **rehearsal**, not first real external org.

---

## 3. Forms & Backend

### `/api/pilot-review` (scaffolded — no schema)

| Aspect | Status |
| ------ | ------ |
| Validation | Required: name, email, org, productInterest, useCase, dataType, **goal** |
| Persistence | Webhook only (`PILOT_REVIEW_WEBHOOK_URL`) |
| Logging | Org + timestamp; no email/payload in logs (Wave 10) |
| User experience | Success even if webhook fails (by design) |

### Fix applied

- **`goal` field** marked `required` in `contact-form.tsx` to match API (previously optional UI → 400 errors).

### Not changed (needs ops, not code)

- Configure production webhook + go-live checklist §14 (`auditos-pilot-intake-monitoring.md`).
- Manual CSV row same business day (`auditos-pilot-manual-intake-fallback.md`).

---

## 4. Safe Code Changes (This Agent)

| File | Change |
| ---- | ------ |
| `src/app/(marketing)/page.tsx` | Pilot-primary hero CTAs; badge wording |
| `src/app/(marketing)/products/audit/page.tsx` | `/contact` for pilot; soften L5 claim; pilot-primary footer CTA |
| `src/app/(marketing)/executive-brief/page.tsx` | Soften `availableNow` pilot evidence line |
| `src/app/(marketing)/contact/page.tsx` | Fix Office AI link → `/products` |
| `src/app/(marketing)/contact/contact-form.tsx` | `goal` required |
| `src/app/(marketing)/engagement-models/page.tsx` | Fix Office AI link → `/products` |
| `src/app/(marketing)/pilot-proof/page.tsx` | Fix Office AI link → `/products` |

No changes to `api/pilot-review/route.ts`, Prisma, or auth.

---

## 5. Activation Readiness

| Dimension | Rating | Notes |
| --------- | ------ | ----- |
| Funnel narrative | **Green** | Proof → fit → contact is coherent |
| CTA consistency | **Green** (post-fix) | Pilot primary on home + audit |
| Claim truthfulness | **Green** (post-fix) | Residual risk in comparison tables — mitigated by boundaries |
| Intake plumbing | **Amber** | Webhook + CSV ops not proven on production env |
| Social proof | **Red** | No external org reference yet — do not invent |

---

## 6. Recommended Next Steps

1. Run **Batch 1 outreach** per `docs/product/launch/batch-1-outreach-plan.md` (10–20 accounts).
2. Complete webhook go-live + first real intake → CSV cycle (Wave 11 ops).
3. Agent 7: sync `READINESS_GATES.md` ESLint/pilot wording if sprint includes doc pass.
4. After first external org session: add **one** anonymized evidence line to pilot-proof (optional, evidence-only).

---

## 7. Sign-off

| Field | Value |
| ----- | ----- |
| **Status** | **DONE** |
| **Marketing code** | Safe funnel fixes applied |
| **New docs** | This report + batch-1 outreach plan |
| **Governance** | Claims conservative; no L6/production/certification language added |

---

*Agent 5 — Eid Build Sprint. Commercial funnel + pilot activation.*
