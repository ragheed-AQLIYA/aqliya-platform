# AQLIYA Design System (Website)

> **Status:** Active | **Date:** 2026-09-09 | **Source of truth:** `src/app/globals.css` + `src/app/aqliya-animations.css`

This documents the **implemented** website design system. Tokens are defined once in `globals.css` (Tailwind v4 `@theme inline` + CSS variables) and consumed via utility classes — no hardcoded hex values in components.

---

## 1. Color

### Brand
| Token | Value | Use |
|-------|-------|-----|
| `--aqliya-deep` | `#0a0f24` | Hero/dark section base |
| `--aqliya-indigo` | `#1e3a8a` | Mid brand gradient, module-audit |
| `--aqliya-blue` (`--primary`) | `#2563eb` | Primary actions, links, accents |
| `--aqliya-cyan` | `#0ea5e9` | Intelligence accent, gradient tip, focus glow |

### Semantic (light theme)
`--background #fff` · `--foreground #111827` · `--muted #f8fafc` · `--muted-foreground #6b7280` · `--border #e5e7eb` · `--primary #2563eb` · `--accent #eff6ff`. Dark theme defined under `.dark`.

### Status
`--status-success #10b981` · `--status-warning #f59e0b` · `--status-error #ef4444` · `--status-info #8b5cf6`.

### Gradients
`--gradient-brand` (deep→indigo→blue), `--gradient-ai` (indigo→cyan), `--gradient-trust` (emerald→cyan). Section helpers: `.hero-gradient`, `.section-gradient-dark`, `.section-gradient-light`.

**Rule:** accents flow **blue → cyan** to signal "governance → intelligence". Never introduce neon or off-brand gradients (brief §7, §45).

---

## 2. Typography

- **Family:** `Noto Sans Arabic` (weights 100–900, Arabic + Latin subsets) via `next/font/google`, exposed as `--font-sans`. One family serves both scripts for visual unity.
- **Scale (component classes in `globals.css`):** `.text-display` (3.05rem) · `.text-h1` (2.44rem) · `.text-h2` (1.95rem) · `.text-h3` (1.56rem) · `.text-h4` (1.25rem) · `.text-body-lg/body/body-sm` · `.text-caption` · `.text-label` (uppercase tracked) · `.text-kpi-value` · `.text-financial` (mono tabular).
- **Marketing headings** use `font-black` at `text-2xl sm:text-3xl` for section H2s and `text-4xl sm:text-5xl` for the hero H1, `leading-[1.08]`.

---

## 3. Spacing & Rhythm

- Container: `mx-auto max-w-7xl px-6`.
- **Section vertical rhythm (standardized this pass):** `py-16 sm:py-20`. Hero: `py-16 sm:py-20 lg:py-24`.
- Card padding: `p-5` (compact) / `p-6` (feature).
- Gaps: grids use `gap-4`; hero column gap `gap-12 lg:gap-16`.

---

## 4. Grid

| Breakpoint | Behavior |
|------------|----------|
| Desktop ≥1024 (`lg`) | Hero: 2-col `[1.05fr_0.95fr]` (copy + architecture visual). Product/layer grids: 4-col. |
| Tablet 768 (`sm`/`md`) | 2-col grids; hero collapses to single column, visual hidden. |
| Mobile ≤430 | Single column, full-width stacked CTAs, visual hidden (`hidden lg:block`). |

Verified overflow-free at 1440 / 1280 / 1024 / 768 / 430 / 390 / 375 in both AR and EN.

---

## 5. Components (marketing)

| Component | File | Notes |
|-----------|------|-------|
| `SiteHeader` / `TopBar` / `DesktopNav` / `MobileMenu` | `src/components/layout/**` | Sticky, blur, gradient hairline; animated nav underline; locale-aware top bar; focus-trapped mobile drawer. |
| `SiteFooter` | `src/components/layout/site-footer.tsx` | 5-col, locale-aware, top accent line, institutional-principle card. |
| `HomeHeroSection` | `home-sections.tsx` | Optional `visual` (arch stack) + `trustSignals` + `personaLabel` props (additive, backward-compatible). |
| `PlatformArchitecture` | `platform-architecture.tsx` | Conceptual vertical intelligence stack, pure CSS/SVG, RTL-neutral (logical props). |
| `ProblemSection`, `ComparisonSection`, `PlatformLayersSection`, `SystemCardGrid`, `TrustSection`, `ProofSection` | `home-sections.tsx` | Consistent card treatment, hover elevation + accent bar, scroll-reveal. |
| `Reveal` | `reveal.tsx` | Progressive-enhancement scroll reveal (SSR-visible, reduced-motion-safe). |
| `ConversionBand`, `MarketingPageShell` | `v2/marketing-shell.tsx` | Shared across interior pages (unchanged). |
| `FAQSection` | `faq-section.tsx` | Accordion + `FAQPage` JSON-LD (unchanged). |

### Buttons
- `.btn-primary` — blue→cyan gradient, white text. Any surface.
- `.btn-secondary` — frosted glass, white text. **Dark surfaces only** (hero). *(Redesign corrected hero secondary CTA to this.)*
- `.btn-outline` — bordered, foreground text. **Light surfaces only.**

---

## 6. States

- **Hover:** cards lift (`-translate-y-0.5` via shadow utilities) + reveal a blue→cyan accent bar/line; nav items grow an underline.
- **Focus:** `focus-visible:ring-2` on primary/cyan (built into button classes).
- **Loading/empty/error:** interior app routes retain existing states; marketing is static content.
- **Active nav:** `bg-primary/8 text-primary` + persistent underline + `aria-current="page"`.

---

## 7. Motion

- Implemented via the `Reveal` island: fade + 16px rise, 700ms ease-out, staggered by `delay` (60–260ms in hero, `i*70` in grids).
- **SSR renders everything visible** (SEO + no-JS safe). Motion only activates post-mount when motion is allowed.
- Under `prefers-reduced-motion: reduce` → **no animation at all** (component early-returns to static; plus global CSS + JS `.reduce-motion` fallbacks in `globals.css`).
- Decorative accents (gradient hairlines, hover bars) are CSS-only and also collapse under reduced motion.
- No parallax, no floating objects, no heavy 3D (brief §22).

---

## 8. RTL Rules

- Use **logical properties everywhere**: `ps-*`/`pe-*`, `start-*`/`end-*`, `inset-x-*`, `text-start`. Avoid `left/right`, `ml/mr`, `pl/pr` in new marketing code.
- Directional glyphs (arrows) are passed as props per locale (`←` AR, `→` EN) so flow reads correctly.
- The architecture visual is direction-neutral (vertical flow, centered connectors) so it needs no mirroring.
- `dir` is set at the document root (`ar → rtl`, `en → ltr`) in `layout.tsx`; the `/en` layout also sets `lang=en dir=ltr` on its wrapper.

---

## 9. Responsive Behavior

Mobile layouts are designed independently, not shrunk: hero visual is dropped, copy centers, CTAs go full-width and stack, persona/trust rows wrap and center. Tablet uses 2-col grids. Desktop uses the 2-col hero and 4-col ecosystem/layer grids.
