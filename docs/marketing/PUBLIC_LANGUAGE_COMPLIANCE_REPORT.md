# Public Language Compliance Report

**Date:** 2026-06-23  
**Scan scope:** Vision-layer marketing routes  
**Reference:** `docs/marketing/MARKETING_TERMINOLOGY.md`

---

## Forbidden Terms Checked

| Term | Vision layer | Proof layer |
|------|--------------|-------------|
| L0–L6 | ❌ Must not appear | ❌ Must not appear |
| pilot-ready | ❌ | ⚠️ Use "operational evaluation" |
| pilot candidate | ❌ | ❌ |
| conditional | ❌ | ❌ |
| active system (as status) | ❌ | ❌ |
| prototype | ❌ | ❌ |
| shell | ❌ | ❌ |
| usable v0.1 | ❌ | ❌ |
| under development (status) | ❌ | ⚠️ Technical export notes OK |
| roadmap status (as badge) | ❌ | ❌ |
| internal preview | ❌ | ❌ |
| placeholder (content) | ❌ | ❌ |

---

## Vision Layer Scan Results

**Automated guard:** `src/__tests__/unit/marketing/vision-layer-language.test.ts` (17 vision pages) + `marketing-routes.test.ts` (route existence + locale maps).

**Round 6 (2026-06-23):** EN proof-layer mirror complete (`/en/procurement-pack`, `/en/engagement-models`, `/en/deployment`). EN product trio verified in smoke test.

| Finding | Status |
|---------|--------|
| L4/L5/L6 on system pages | ✅ Removed |
| pilot-ready on homepage/EN | ✅ Removed |
| placeholder on homepage/case-studies | ✅ Removed |
| "المنتجات" as primary framing | ✅ Replaced with أنظمة التشغيل |
| جاهز للبايلوت / نشط / قيد التطوير on about/products | ✅ Removed |
| HTML `placeholder=` attributes | ✅ Ignored (not content) |

**Verdict: PASS** for vision-layer forbidden engineering terms.

---

## Proof Layer Notes

These pages **may** describe operational evaluation:

- `/proof`, `/pilot-proof`, `/pilot-outcomes`, `/buyers`, `/engagement-models`, `/contact`, `/deployment`, `/procurement-pack`

Remaining proof-layer terms (e.g. "قيد التطوير" for PDF Arabic export in `/proof-library`) are **technical evaluation notes**, not vision-layer maturity badges.

**Round 3 (2026-06-23):** `/en/governance`, print layer terminology (`/print/*`), locale mapping.

**Deploy readiness (round 4):** `npm run build` — see validation below.

---

## Central Label Source

`src/lib/marketing/public-status.ts` — vision labels (AR + EN) use approved vocabulary.

---

## Compliance Verdict

**Vision layer:** ✅ COMPLIANT  
**Proof layer:** ✅ COMPLIANT  
**Print layer:** ✅ COMPLIANT — user-facing titles updated; URL slugs unchanged (`/print/pilot-sow-template`)  
**English alignment:** ✅ Full EN nav mirror including `/en/governance`  
**Build validation (2026-06-23):** ✅ `npm run build` — Pass (141 routes, `/en/governance` included)
