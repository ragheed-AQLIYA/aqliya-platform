# AQLIYA Website Audit

> **Status:** Active | **Date:** 2026-09-09 | **Scope:** Public marketing website (`src/app/(marketing)` + `src/app/en`) | **Method:** Direct repository inspection + live browser QA

This audit documents the **actual** state of the AQLIYA marketing website as found in the repository — not an aspirational description. It is the evidence base for the redesign strategy, design system, and page blueprints.

---

## 1. Current Information Architecture

The site is a Next.js 16 App Router application with **two parallel marketing trees**:

- `src/app/(marketing)/*` — Arabic (default), `dir=rtl`, `lang=ar`. **38 pages.**
- `src/app/en/*` — English mirror, `dir=ltr` (via layout), **35 pages.**

Localization is **not** true `next-intl` locale routing. English is a **duplicated page tree** with its own copy modules (`*-en.ts`). `next-intl` is present and used for shared chrome strings (`messages/ar.json|en.json|tr.json`) but the marketing pages hardcode locale via separate files and `/en` path prefixes.

### Primary navigation (from `use-site-header.ts`)
`Platform · Systems (Products) · Pricing · Governance · Why AQLIYA (Proof) · About` + language toggle + "Book a Diagnostic Session" CTA.

### Page inventory (both locales unless noted)
Home, Platform, Products (+ `/products/audit`, `/local-content`, `/decision`, `/sales`), Governance, Security, Deployment, Proof, Demo, Procurement Pack, Use Cases, Industries, About, Contact, Start, Insights, Case Studies, Pricing, Privacy, Terms, Engagement Models, How We Work, Executive Brief(ing), Custom Product, Buyers (cfo/cio/government/procurement/audit-partner), SOC2 Roadmap, Pilot Outcomes/Proof.

### IA observations
- The IA is **already platform-first and coherent** — it correctly frames AQLIYA as a platform with operating systems (products) on top, not disconnected apps.
- There is **route sprawl**: `executive-brief` + `executive-briefing` (one redirects), `proof` + `proof-library` + `pilot-proof` + `pilot-outcomes`, `buyers/*` overlapping `industries`. Redirects in `next.config.mjs` handle some (`/sunbul → /workflowos`, `/executive-briefing → /proof#executive-brief`, `/solutions → /products`).
- Products are intentionally **de-emphasized in top nav** (footer-only "Operating Systems" row) — a deliberate "platform not point-tools" stance.

---

## 2. Current UX

- Homepage journey is strong and logical: **Hero → Problem → Platform-vs-Tool comparison → 4-layer platform → product ecosystem → proof → FAQ → conversion band.** This already answers the brief's five questions.
- Conversion is **single-primary** ("Book a Diagnostic Session" / "احجز جلسة تشخيص") with a secondary "Explore platform" — matches the brief's CTA-hierarchy requirement.
- Persona chips route to `/start#<role>` — good executive-first segmentation.
- **Gaps found:** the pre-redesign hero was a centered single-column text block with **no conceptual platform visual** (brief §11 explicitly wants an architecture visual, not a fake dashboard). No dedicated on-home **trust section** (§16) despite trust being core positioning.

---

## 3. Current UI

- **Design tokens** live in `src/app/globals.css` (Tailwind v4 `@theme inline` + CSS variables). Brand palette: deep navy `#0a0f24` → indigo `#1e3a8a` → blue `#2563eb` → cyan `#0ea5e9`; module accents; status colors; gradient system (`--gradient-brand`, `--gradient-ai`, `--gradient-trust`). Light + dark themes defined.
- Reusable component classes: `.btn-primary`, `.btn-secondary` (dark surfaces), `.btn-outline` (light surfaces), `.glass*`, `.hero-gradient`, `.section-gradient-*`, typography scale (`.text-display`→`.text-caption`), animations with `.stagger-*`.
- Marketing sections in `src/components/marketing/home-sections.tsx` (home only) and a `v2` system (`marketing-shell`, `product-page-template`, depth pages) for interior pages.
- **UI defects found (pre-redesign):**
  1. **Secondary hero CTA invisible** — used `.btn-outline` (white bg) with forced white text on the dark hero → white-on-white. Present in both AR and EN homepages.
  2. **Top bar always Arabic** on `/en` pages — `TopBar` used `next-intl` which resolves to the document locale (`ar`), so English visitors saw Arabic tagline/status.
  3. Hero lacked any visual asset; interior visual hierarchy was flat (uniform card treatments, minimal motion).

---

## 4. Current Content

- Copy is centralized and disciplined: `src/lib/marketing/copy-plain.ts` (AR) / `copy-plain-en.ts` (EN), with a documented "R6 Voice Reset" (`docs/marketing/VOICE_GUIDE.md`).
- **Commercial truthfulness is well-governed.** `public-status.ts` gates every product with evidence-based status labels ("Available to deploy", "Available by agreed scope", "Coming on platform roadmap"). No fabricated customers, certifications, or metrics found in homepage copy.
- Trust principle "AI assists. Humans decide. Evidence governs." / "الذكاء يساعد. الإنسان يقرّر. الدليل يحكم." is present in the footer.
- SalesOS correctly labeled roadmap ("قريباً على خارطة المنصة" / "Coming on platform roadmap") — consistent with its frozen status.

---

## 5. Technical Architecture

- **Stack:** Next.js 16.3 (App Router, webpack build), React 19.2, TypeScript 5 strict, Tailwind v4, next-intl 4, shadcn/ui, Sentry, OpenTelemetry.
- **SEO:** per-page `generateMetadata`/`metadata`, OpenGraph + Twitter cards, `sitemap.ts`, `robots.ts`, `manifest.ts`, JSON-LD (`OrganizationJsonLd`, `WebSiteJsonLd`, `FAQPage`).
- **Analytics:** modular `TrackerProvider` + `Analytics` + `WebVitals` components (provider-agnostic, no invasive tracking hardcoded).
- **A11y:** `A11yProvider` (JS reduced-motion toggle), `SkipToContent`, CSS `prefers-reduced-motion` fallback, semantic landmarks (`role=banner/main/contentinfo`), mobile menu with focus management + Escape handling.
- **Fonts:** `Noto_Sans_Arabic` (weights 100–900, Arabic+Latin subsets) via `next/font/google` — single family serves both scripts.

### Baseline health (verified this pass)
- `npx tsc --noEmit` → **exit 0** (clean before and after changes).
- Dev server boots in ~4s; AR `/` and EN `/en` both return **200**.
- Log noise (pre-existing, unrelated to marketing): SSO Prisma error (no DB in dev), OTel duplicate-registration, Sentry `sentry.*.config.ts` deprecation, Windows Watchpack `lstat` errors.

---

## 6. Performance

- Homepage is largely **server-rendered**; the only client islands are the header, FAQ accordion, tracker, and (new) the scroll-reveal wrapper — all small.
- Logo served as a **341 KB PNG** (`aqliya-logo-approved.png`) at 116×34 display size — oversized; an SVG (`aqliya-logo.svg`, 6 KB) exists and should be preferred. **Flagged, not changed** (shared across all pages; out of this pass's scope).
- No self-hosted fonts (`next/font/google` handles optimization). `.lighthouserc.json` present for CI budgets.

---

## 7. SEO Issues

- **hreflang not implemented.** With the `/` (ar) and `/en` split there are no `alternates.languages` / `hreflang` tags linking the two locales. This is the single biggest SEO gap. (Deferred — cross-site change beyond this pass.)
- OG images referenced (`/og-home.png`, `/og-default.png`) — presence not verified in this pass.
- Otherwise metadata coverage is strong.

---

## 8. Accessibility Issues

- Pre-redesign: invisible secondary CTA (contrast failure) — **fixed**.
- Icon-only controls are labeled; reduced-motion is respected at CSS + JS levels; the new `Reveal` component is SSR-visible and disables all motion under `prefers-reduced-motion` (no content hidden from no-JS or reduced-motion users).
- Remaining: full WCAG 2.2 AA contrast sweep across all 70+ interior pages not performed this pass.

---

## 9. Mobile Issues

- Verified **zero horizontal overflow** at 1440/1280/1024/768/430/390/375 on the redesigned homepage (AR + EN).
- Mobile drawer menu opens, traps focus, and lists all nav links + CTA. Hero architecture visual correctly hidden < `lg`.

---

## 10. Brand Consistency

- Palette, logo, and the trust principle are applied consistently. Brand assets present: `aqliya-logo.svg`, `aqliya-logo-approved.png`, `aqliya-mark.svg` (geometric gradient mark), favicons, PDF/PNG variants.
- No new logo needed (brief §25) — existing identity is the foundation.

---

## 11. Conversion Issues

- Conversion architecture is already deliberate and healthy. The pre-redesign weakness was purely visual (invisible secondary CTA reducing the "Explore platform" path).

---

## 12. Technical Debt

| Item | Severity | Disposition |
|------|----------|-------------|
| EN as duplicated page tree (not locale-routed) | High | Deferred (user chose to keep architecture) |
| Missing hreflang between ar/en | High | Deferred (cross-site) |
| 341 KB PNG logo vs available 6 KB SVG | Medium | Flagged |
| Route sprawl (proof/proof-library/pilot-*, executive-brief/-briefing, buyers/industries overlap) | Medium | Flagged for later IA consolidation |
| `home-sections` motion/visual flatness | Medium | **Fixed this pass** |
| Invisible secondary hero CTA | High (a11y) | **Fixed this pass** |
| Top bar always-Arabic on /en | Medium | **Fixed this pass** |

---

## 13. Verdict

The AQLIYA site is **not** a generic SaaS landing page in need of a ground-up rebuild — it is a mature, governance-compliant, platform-first bilingual site with disciplined evidence-based copy. The highest-leverage work is **visual elevation of the flagship surface** (hero conceptual visual, trust section, motion, contrast fixes) rather than IA or messaging replacement. This redesign pass targets exactly that: homepage + shared design system + nav/footer, in AR and EN, without destabilizing the ~70 interior pages.
