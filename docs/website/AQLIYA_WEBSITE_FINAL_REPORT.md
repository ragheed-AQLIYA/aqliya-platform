# AQLIYA Website — Final Report

> **Status:** Delivered | **Date:** 2026-09-09 | **Scope this pass:** Flagship homepage redesign (AR + EN) + shared design system + navigation/footer, refactoring within the existing `/en` duplicate-tree architecture.

---

## Executive Summary

- Elevated the AQLIYA homepage from a flat, text-only hero into a **conceptual institutional-intelligence experience** in both Arabic (RTL, default) and English (LTR), without disturbing the ~70 interior pages or any product functionality.
- Added a **conceptual platform-architecture hero visual** (institution → governance → knowledge → intelligence → operating systems → institutional outcome) — pure CSS/SVG, no fake dashboard.
- Added a dedicated **on-home Trust section** (private governed AI · permissions & tenant isolation · traceable evidence · full audit trail) reinforcing the core positioning and the principle *"AI assists. Humans decide. Evidence governs."*
- Introduced **progressive, reduced-motion-safe scroll reveals** and consistent enterprise card/hover treatments across all home sections.
- Fixed two real defects exposed on the flagship surface: an **invisible secondary hero CTA** (white-on-white contrast failure) and an **always-Arabic top bar on English pages**.
- All changes validated: `tsc` clean, lint 0 errors/0 warnings on touched files, live browser QA across 6 breakpoints × 2 locales with zero horizontal overflow.

---

## Before / After

| Aspect | Before | After |
|--------|--------|-------|
| Hero | Centered text only, no visual | 2-col: copy + conceptual architecture stack; trust signals; labeled persona chips |
| Secondary CTA | `.btn-outline` → white-on-white (invisible on dark hero) | `.btn-secondary` frosted glass, legible |
| Trust | Footer principle line only | Dedicated dark Trust section with 4 pillars + principle card |
| Motion | Static (unused stagger classes) | SSR-visible scroll reveals, reduced-motion-safe |
| Top bar on /en | Arabic tagline/status | English tagline/status |
| Nav/footer | Flat | Gradient hairlines, animated active underline |
| Section rhythm | Mixed (`py-14/18`) | Standardized `py-16 sm:py-20` |

---

## Architecture

- **No architectural change.** Refactored in place within Next.js 16 App Router. The `/` (AR) and `/en` (EN) marketing trees and all redirects are preserved.
- New components are additive; changed props on `HomeHeroSection` (`visual`, `trustSignals`, `personaLabel`) are **optional** — backward-compatible with any other caller (only the two homepages use it).

---

## Pages

- **Home (AR)** — `src/app/(marketing)/page.tsx` — redesigned, TrustSection + hero visual wired.
- **Home (EN)** — `src/app/en/page.tsx` — redesigned, mirror content.
- Shared chrome (header/nav/footer/top-bar) improvements apply site-wide but conservatively.

---

## Components

| File | Change |
|------|--------|
| `src/components/marketing/reveal.tsx` | **New** — progressive scroll-reveal island. |
| `src/components/marketing/platform-architecture.tsx` | **New** — conceptual intelligence-stack visual. |
| `src/components/marketing/home-sections.tsx` | Rebuilt — enterprise treatment, reveals, `TrustSection`, hero visual/trust props, CTA fix. |
| `src/components/layout/components/top-bar.tsx` | Locale-aware (fixes AR-on-EN). |
| `src/components/layout/components/desktop-nav.tsx` | Animated active/hover underline. |
| `src/components/layout/site-header.tsx` | Gradient hairline; passes locale to top bar. |
| `src/components/layout/site-footer.tsx` | Top accent line. |
| `src/app/(marketing)/page.tsx`, `src/app/en/page.tsx` | Wire hero visual, trust signals, TrustSection. |

---

## Design System

Documented in `AQLIYA_DESIGN_SYSTEM.md`. Tokens unchanged (already strong in `globals.css`); the pass consumed existing tokens and standardized spacing/motion/RTL conventions. No new hardcoded colors introduced.

---

## SEO

- Preserved: per-page metadata, OG/Twitter, sitemap/robots/manifest, Organization/WebSite/FAQ JSON-LD.
- Hero visual is real DOM text (headings/paragraphs) — fully crawlable; reveals are SSR-visible.
- **Deferred:** `hreflang`/`alternates.languages` between ar↔en (cross-site change; flagged in audit §7).

---

## Accessibility

- Fixed contrast failure on secondary hero CTA.
- `Reveal` is SSR-visible and fully disabled under `prefers-reduced-motion` — no content hidden from no-JS or reduced-motion users.
- Decorative elements marked `aria-hidden`; landmarks, skip-link, focus-trapped mobile menu retained.
- **Not done this pass:** exhaustive WCAG 2.2 AA sweep of all interior pages.

---

## Performance

- New client JS is minimal (one small IntersectionObserver island). Homepage remains server-rendered.
- **Flagged (not changed):** 341 KB PNG logo vs. available 6 KB SVG — shared chrome asset, out of scope.

---

## Security

- No new attack surface: static marketing content, no new deps, no secrets, no `dangerouslySetInnerHTML` added (existing JSON-LD unchanged). Prisma/server boundaries untouched.

---

## Responsive QA

Verified **zero horizontal overflow** at **1440, 1280, 1024, 768, 430, 390, 375** on the redesigned homepage. Hero visual hidden < `lg`; CTAs stack full-width on mobile; grids collapse 4→2→1.

---

## RTL QA

- AR: `dir=rtl`, logo/nav mirrored, copy right-aligned, architecture accent bars on the correct (start) edge, arrows point `←`. Verified in browser.
- EN: `dir=ltr`, mirrored correctly, arrows `→`, top bar English. Verified in browser.
- Built with logical properties (`ps/pe`, `start/end`, `inset-x`) — no `left/right` regressions.

---

## Tests / Validation

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | **Pass** (exit 0, before and after) |
| `npx eslint <touched files>` | **Pass** (0 errors, 0 warnings) |
| Dev server boot + `curl /` and `/en` | **Pass** (HTTP 200 both) |
| Live browser QA (6 breakpoints × AR/EN) | **Pass** (no overflow; CTAs legible; mobile menu opens) |
| `npx next build` | See build log `/tmp/aqliya-build.log` — run at handoff |

Pre-existing dev-log noise (SSO Prisma w/o DB, OTel duplicate registration, Sentry config deprecation, Windows Watchpack lstat) is unrelated to these changes.

---

## Known Limitations

1. Scope was deliberately limited (per direction) to **homepage + design system + chrome**. Interior pages (Platform, Products, Intelligence, product details, About, Contact) were audited and blueprinted but not re-implemented this pass.
2. EN homepage has no FAQ section (AR only) — parity deferred.
3. hreflang, route-sprawl consolidation, logo SVG swap, and true locale-routing migration remain as flagged tech debt.

---

## Remaining Recommendations (priority order)

1. **Add hreflang** linking `/` ↔ `/en` on every mirrored page (biggest SEO win).
2. Elevate **Platform** and **product-detail** pages with the new `PlatformArchitecture` visual + section treatments.
3. Swap chrome logo PNG → existing SVG; add OG image verification.
4. Bring EN homepage FAQ to parity with AR.
5. Consolidate proof/pilot and executive-brief route sprawl behind redirects.
6. Plan migration to true `next-intl` locale routing to retire the duplicate `/en` tree.
