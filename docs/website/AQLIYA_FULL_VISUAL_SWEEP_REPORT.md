# AQLIYA Website — Full Visual Sweep Report

> **Status:** Complete | **Date:** 2026-09-09 | **Purpose:** Pre-release page-by-page visual + UX audit of every public route against the approved Phase 1/2 design system, in Arabic RTL and English LTR, using actual rendered pages (production build, real browser).
> **Method:** `next build` (170/170 pages) → `next start` → HTTP status pass on all routes → per-route rendered-DOM overflow/structure probe at 1440px and 390px in both locales → targeted screenshots → fix → re-validate → re-check.

---

## Coverage

| Metric | Count |
|---|---|
| **Total unique public pages reviewed** | **~62** (31 route templates × 2 locales, minus AR-only `pricing`/`engagement-models`/`how-we-work` and redirect-only routes) |
| Arabic (RTL) pages reviewed | 31 route templates (`/`, platform, products index + 6 product details, governance, security, deployment, proof, demo, procurement-pack, case-studies, industries, use-cases, insights, about, start, contact, pricing, soc2-roadmap, custom-product, privacy, terms, 5× buyers) |
| English (LTR) pages reviewed | 30 route templates (same set; no `/en/pricing` by design — EN nav points to shared `/pricing`) |
| Breakpoints checked | 1440px (desktop) + 390px (mobile) on every probed route; both locales |
| Redirects verified | `/products/simulation`→`/products`, `/buyers/procurement`→`/procurement-pack`, `/executive-briefing`, `/engagement-models`→`/start#engagement`, `/how-we-work`→`/start#process`, `/buyers/*`→`/start#<persona>` |

**Result of overflow/structure probe:** every AR and EN route returned `overflow: false` at both 1440px and 390px, with a valid `<h1>`. Zero horizontal-scroll defects, zero broken layouts, zero empty-main pages.

---

## Issues Found

| # | Severity | Locale | Issue | Root cause | Pre-existing? |
|---|---|---|---|---|---|
| 1 | **High (broken conversion path)** | AR | `/start` redirected to `/login` (403-style auth wall). Homepage persona chips (`/start#executive`…) and all `/buyers/*` redirects (→ `/start#…`) landed on a login page instead of the start hub. | `/start` missing from the default-deny `PUBLIC_EXACT` allowlist in `src/lib/auth/public-paths.ts`. `/en/start` worked only because it matched the `/en/` prefix. | **Yes** (pre-existing; not introduced in Phase 1/2) |
| 2 | **Medium (bilingual inconsistency)** | EN | Header CTA button rendered **"احجز جلسة تشخيص"** (Arabic) on English pages; mobile toggle + locale-switch + menu aria-labels also resolved to Arabic. | `DesktopNav`/`MobileMenu`/`SiteHeader` used `useTranslations("common")`, which resolves to the document locale (`ar`) on the `/en` duplicate-tree. Same class as the Phase-1 TopBar bug, but the nav CTA + aria-labels were missed. | **Yes** (pre-existing) |

**Non-issues investigated and cleared:**
- `dir="rtl"` on `<html>` for EN pages — the EN layout's inner `dir="ltr"` wrapper correctly overrides; `main`/`h1` compute `direction: ltr` and render properly LTR (visually confirmed). Cosmetic root-attribute mismatch only; deferred with the known `/en` duplicate-tree architecture.
- `/buyers/{cfo,cio,government,audit-partner}` sharing one H1 — intentional; they are thin redirects to `/start#<persona>`.
- `/en/pricing` 404 — no page by design; EN nav correctly links the shared `/pricing`. Not a broken link.

---

## Issues Fixed

**Issue 1 — AR `/start` auth wall (fix: 1 line):**
- `src/lib/auth/public-paths.ts`: added `"/start"` to `PUBLIC_EXACT`.
- Verified: `/start` now returns **200** (was redirecting to `/login`); `/buyers/*` persona entry points now reach the start hub.

**Issue 2 — EN nav Arabic labels (fix: locale-aware labels, no `useTranslations` in chrome):**
- `src/components/layout/components/use-site-header.ts`: added a locale-keyed `headerLabels` map + `HeaderLabels` type; hook now returns a `labels` object (matches the Phase-1 TopBar pattern).
- `src/components/layout/site-header.tsx`: consumes `labels`, passes to children, drops `useTranslations`.
- `src/components/layout/components/desktop-nav.tsx` + `mobile-menu.tsx`: use `labels.bookSession` / `labels.mainNavigation` / `labels.mobileNavigation` / `labels.switchTo*` instead of `t(...)`.
- Verified rendered: EN desktop CTA = **"Book a Diagnostic Session"**; EN toggle aria-label = **"Open menu"**; AR CTA remains **"احجز جلسة تشخيص"**. Mobile CTA uses the same verified `labels.bookSession` expression.

Both fixes are shared-chrome changes; a full production rebuild was run afterward and re-verified in the browser.

---

## Pages Requiring No Changes

All pages **except** the two chrome-level fixes above required no changes. Specifically confirmed clean (visual + overflow + hierarchy + CTA + platform-first framing) in both locales:

- **Core platform:** `/platform`, `/governance`, `/security`, `/deployment` — canonical hero, motion, rhythm, institutional-principle language consistent with home.
- **Product ecosystem:** `/products` index + `/products/{audit,local-content,decision,sales,office-ai}` — consistent `product-page-template`, evidence-gated status badges, platform-first titles ("… operating system under AQLIYA"). SalesOS presentation unchanged (frozen).
- **Proof/resources:** `/proof`, `/demo`, `/procurement-pack`, `/case-studies`, `/insights`, `/soc2-roadmap` (correctly framed "Targets, not certificates"), `/custom-product`.
- **Industries/use-cases/about/start/contact/pricing/legal** — all consistent.

Content-quality/claims check: no fabricated customers, certifications, partnerships, or regulatory guarantees found; SOC2 page remains a roadmap; deployment page keeps "honest options" framing; LocalContentOS avoids unverifiable regulatory claims.

---

## Remaining Issues

None blocking. Deferred (pre-existing, out of sweep scope; tracked in the route migration matrix):
1. **hreflang / `alternates.languages`** linking ar↔en — biggest remaining SEO gap.
2. **`<html dir>` cosmetic mismatch on `/en`** — content renders correct LTR via wrapper; a true fix requires the deferred locale-routing migration.
3. **Route sprawl** (proof/proof-library/pilot-*, executive-brief/-briefing) and **AR-only** `pricing`/`engagement-models`/`how-we-work` locale asymmetry.
4. **Logo PNG→SVG** swap for payload.
5. `/contact`, `/demo` intentionally not motion-wrapped (protect interactive/form behavior).

---

## Validation (post-fix)

| Check | Result |
|---|---|
| `npx tsc --noEmit` (full project) | **Pass — 0 errors** |
| `npx eslint src/` (full) | **Pass — 0 errors** (146 pre-existing `lib/*` warnings; chrome files 0 warnings) |
| `npx next build --webpack` | **Pass — exit 0, 170/170 static pages** |
| Route HTTP status (all AR + EN) | All 200 or intended redirects; `/start` fixed 302→200 |
| Rendered overflow probe (every route, 1440 + 390, both locales) | **0 overflow, 0 broken layouts** |
| EN nav CTA / aria-labels | English (fixed); AR unchanged |

---

## Final Visual QA Status

**CLEAN.** Every public AQLIYA page renders consistently against the approved Phase 1/2 design system in both Arabic RTL and English LTR: unified hero treatment, typography, spacing rhythm, canonical nav (with locale-correct labels), footer, CTA hierarchy, motion, and platform-first product framing. No visual regressions, no overflow, no broken or duplicate layouts, no fabricated content. The two defects found were pre-existing and are now fixed and re-verified.

---

## Release Recommendation

**APPROVE for production release.**

The full visual sweep is clean. All authoritative gates are green (tsc 0, lint 0 errors, build 170/170, no overflow across ~62 page renders in both locales). Two genuine pre-existing defects (AR `/start` auth wall; EN nav Arabic labels) were found and fixed with minimal, verified changes. Remaining items are non-blocking deferred enhancements (hreflang first among them) appropriate for Phase 3.

**No Git commit has been made. Awaiting explicit approval to commit.**
