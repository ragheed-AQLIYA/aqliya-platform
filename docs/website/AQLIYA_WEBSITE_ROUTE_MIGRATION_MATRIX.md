# AQLIYA Website — Route Migration Matrix (Phase 2)

> **Status:** Active | **Date:** 2026-09-09 | **Depends on:** Phase 1 (`AQLIYA_WEBSITE_*` docs). | **Method:** Direct inspection of every `page.tsx` under `src/app/(marketing)` (AR) and `src/app/en` (EN).

## Canonical baseline (from Phase 1)

The validated homepage + shared chrome define the canonical language. Interior pages already share the **visual tokens** (`hero-gradient`, `btn-primary/secondary`, `section-gradient-*`, `SectionEyebrow`, enterprise/visual component library). The **only systematic gaps** vs. canonical are:

1. **Motion** — interior pages have no scroll-reveal; the canonical language uses the `Reveal` primitive (SSR-visible, reduced-motion-safe).
2. **Section rhythm** — interior pages mix `py-14`; canonical is `py-16 sm:py-20`.

Therefore most interior routes need **visual migration (light)**, not content restructuring or rebuild. This is a deliberately low-risk transformation that keeps copy, structure, SEO, and governance-gated status intact.

### Migration action legend
- **PRESERVE** — already canonical / no change needed.
- **MIGRATE-LIGHT** — wrap sections in `Reveal`, normalize rhythm; no copy/structure change.
- **MIGRATE-MED** — light + reuse a canonical shared visual (e.g. `PlatformArchitecture`) or hero 2-col treatment.
- **RESTRUCTURE** — content hierarchy change (none required this phase).
- **DEFER** — flagged, not this phase.

---

## Matrix

| # | Route (AR `/`, EN `/en`) | Locale | Purpose | Current quality | Target | Priority | Dependencies | SEO risk | Action | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `/` · `/en` | both | Home | **Canonical (Phase 1)** | — | — | home-sections, platform-architecture, reveal | none | PRESERVE | ✅ Done (P1) |
| 2 | `/platform` · `/en/platform` | both | Intelligence Core / 4 layers | High; on-brand; static | +motion, rhythm | **W1** | Reveal | low (no copy/URL change) | MIGRATE-LIGHT | Wave 1 |
| 3 | `/governance` · `/en/governance` | both | Trust/governance depth | High (v2 depth page) | +motion, rhythm | **W1** | Reveal | low | MIGRATE-LIGHT | Wave 1 |
| 4 | `/security` · `/en/security` | both | Security depth | High (`security-depth-page`) | +motion, rhythm | **W1** | Reveal | low | MIGRATE-LIGHT | Wave 1 |
| 5 | `/deployment` · `/en/deployment` | both | Deployment models | High (`deployment-depth-page`) | +motion, rhythm | **W1** | Reveal | low | MIGRATE-LIGHT | Wave 1 |
| 6 | `/products` · `/en/products` | both | OS ecosystem index | High; `MarketingPageShell` | +motion, rhythm | **W2** | Reveal | low | MIGRATE-LIGHT | Wave 2 |
| 7 | `/products/audit` · `/en/…` | both | AuditOS detail | High (`product-page-template`) | +motion via template | **W2** | template | low | MIGRATE-LIGHT (via template) | Wave 2 |
| 8 | `/products/local-content` · `/en/…` | both | LocalContentOS | High (template) | +motion via template | **W2** | template | low | MIGRATE-LIGHT | Wave 2 |
| 9 | `/products/decision` · `/en/…` | both | DecisionOS | High (template) | +motion via template | **W2** | template | low | MIGRATE-LIGHT | Wave 2 |
| 10 | `/products/sales` · `/en/…` | both | SalesOS (**FROZEN**) | High (template) | +motion via template only; **no architecture/claim change** | **W2** | template | low | MIGRATE-LIGHT (presentation only) | Wave 2 |
| 11 | `/products/office-ai` · `/en/…` | both | Office AI (shared capability) | High (template) | +motion via template | **W2** | template | low | MIGRATE-LIGHT | Wave 2 |
| 12 | `/products/simulation` · `/en/…` | both | SimulationOS (roadmap) | Medium; roadmap-gated | +motion via template | W2 | template | low | MIGRATE-LIGHT | Wave 2 |
| 13 | `/proof` · `/en/proof` | both | Proof center | High | +motion, rhythm | W3 | Reveal | low | MIGRATE-LIGHT | Wave 3 |
| 14 | `/demo` · `/en/demo` | both | Interactive demo | High; interactive | verify motion non-conflict | W3 | — | med (interactive) | MIGRATE-LIGHT (careful) | Wave 3 |
| 15 | `/procurement-pack` · `/en/…` | both | Procurement PDF pack | High; print-oriented | rhythm only | W3 | print-toolbar | low | MIGRATE-LIGHT | Wave 3 |
| 16 | `/case-studies` · `/en/…` | both | Case studies (evidence-gated) | Medium | +motion; **no invented customers** | W3 | Reveal | low | MIGRATE-LIGHT | Wave 3 |
| 17 | `/insights` (+3 articles) · `/en/…` | both | Articles/thought leadership | Medium | +motion, rhythm | W3 | Reveal | low (content pages) | MIGRATE-LIGHT | Wave 3 |
| 18 | `/soc2-roadmap` · `/en/…` | both | SOC2 **roadmap** (not cert) | High; correctly framed | rhythm only; **keep roadmap framing** | W3 | — | low | MIGRATE-LIGHT | Wave 3 |
| 19 | `/executive-briefing` · `/en/…` | both | Exec brief (redirect target of `/executive-brief`) | Medium | rhythm; verify redirect intact | W3 | next.config redirects | med (redirect) | MIGRATE-LIGHT | Wave 3 |
| 20 | `/industries` · `/en/industries` | both | Institutional segments | High | +motion, rhythm | W4 | Reveal | low | MIGRATE-LIGHT | Wave 4 |
| 21 | `/use-cases` · `/en/use-cases` | both | Institutional problems | High | +motion, rhythm | W4 | Reveal | low | MIGRATE-LIGHT | Wave 4 |
| 22 | `/buyers/cfo,cio,government,procurement,audit-partner` · `/en/…` | both | Persona landing (from home chips) | Medium; overlaps industries | +motion; flag overlap w/ industries | W4 | Reveal | med (overlap/redirect: `/buyers/procurement`→`/procurement-pack` exists) | MIGRATE-LIGHT | Wave 4 |
| 23 | `/about` · `/en/about` | both | Mission/philosophy | High | +motion, rhythm | W5 | Reveal | low | MIGRATE-LIGHT | Wave 5 |
| 24 | `/start` · `/en/start` | both | Role router / engagement hub | High (`start-hub-page`) | +motion | W5 | start-hub | low | MIGRATE-LIGHT | Wave 5 |
| 25 | `/contact` · `/en/contact` | both | Diagnostic form | High; form | verify form untouched | W5 | form actions | med (form) | MIGRATE-LIGHT (careful) | Wave 5 |
| 26 | `/engagement-models` (AR only) | ar | Engagement models | Medium | +motion; **EN missing** | W5 | Reveal | med (locale asymmetry) | MIGRATE-LIGHT + flag | Wave 5 |
| 27 | `/how-we-work` (AR only) | ar | Process | Medium | +motion; **EN missing** | W5 | Reveal | med (asymmetry) | MIGRATE-LIGHT + flag | Wave 5 |
| 28 | `/custom-product` · `/en/…` | both | Custom systems (Studio) | Medium; do-not-overclaim | +motion; keep "strategic" framing | W5 | Reveal | low | MIGRATE-LIGHT | Wave 5 |
| 29 | `/pricing` (shared, AR) | ar | Pricing/planning | Medium | rhythm; nav points here from both locales | W5 | — | med (shared route) | MIGRATE-LIGHT | Wave 5 |
| 30 | `/privacy` · `/en/privacy` | both | Legal | Adequate | PRESERVE (legal text) | W6 | — | low | PRESERVE | Wave 6 |
| 31 | `/terms` · `/en/terms` | both | Legal | Adequate | PRESERVE (legal text) | W6 | — | low | PRESERVE | Wave 6 |

### Duplicate / obsolete / weak routes (flagged)
- `/executive-brief` → `/executive-briefing`/`/proof#executive-brief` (redirects in `next.config.mjs`). Keep redirects.
- `proof` vs `proof-library` vs `pilot-proof` vs `pilot-outcomes` — sprawl; consolidation **DEFERRED** (out of Phase 2, needs redirect plan).
- `/buyers/*` overlaps `/industries` — **DEFERRED** IA consolidation.
- `/products/simulation` → `/products` permanent redirect already exists in config for `/products/simulation`? (config shows `source: "/products/simulation" → "/products"`). **Verify page vs redirect conflict in Wave 2.**
- Locale asymmetry: `engagement-models`, `how-we-work`, `pricing` exist AR-only. **Flag, do not fabricate EN.**

### Global (Wave 6)
- hreflang/`alternates.languages` — **DEFERRED** (cross-site SEO; noted in Phase 1 audit).
- Logo PNG→SVG swap — DEFERRED.
- WCAG 2.2 AA full sweep, performance pass, RTL/LTR + breakpoint QA across migrated pages.

---

## Wave plan (controlled)

| Wave | Scope | Gate |
|------|-------|------|
| **W1** | Core platform: platform, governance, security, deployment (AR+EN) | tsc + lint + build + browser QA AR/EN |
| W2 | Product ecosystem: products index + `product-page-template` (motion once → all 6 details) | same |
| W3 | Intelligence/proof/resources: proof, demo, procurement-pack, case-studies, insights, soc2-roadmap, executive-briefing | same |
| W4 | Industries / use-cases / buyers | same |
| W5 | About / start / contact / engagement / how-we-work / custom-product / pricing | same |
| W6 | Global polish: SEO, a11y, performance, RTL/LTR + full breakpoint QA; legal PRESERVE | same |

**Risk control:** because `product-page-template` (Wave 2) and the v2 depth-page components are shared, migrating the template/shared component once propagates canonical motion to many routes with a single low-risk edit — the highest-leverage moves.
