# AQLIYA Page Blueprints

> **Status:** Active | **Date:** 2026-09-09

This pass delivered the **Homepage** (AR + EN) and the **shared chrome** (nav/footer/top-bar) plus the reusable design-system primitives. The homepage blueprint below reflects **what was implemented**. Remaining pages are specified as blueprints for subsequent passes (architecture already exists via the `v2` `product-page-template` and `MarketingPageShell`).

---

## HOMEPAGE — `src/app/(marketing)/page.tsx` (AR) · `src/app/en/page.tsx` (EN) — IMPLEMENTED

- **Objective:** Establish "Private, Governed Institutional Intelligence platform" in <10s; route executives to a diagnostic session.
- **Audience:** C-suite of regulated/knowledge-intensive Saudi/Arab institutions.
- **User intent:** "What is this, is it for me, can I trust it, what do I do next?"
- **CTA:** Primary = Book a Diagnostic Session; Secondary = Explore the Platform.

### Section sequence
1. **Hero** (`HomeHeroSection`) — eyebrow badge, `font-black` H1, subtitle, primary + secondary CTA, **trust signals row** (source-linked evidence · human review · full audit trail), **persona chips** with "For whom?" label, and a **conceptual `PlatformArchitecture` visual** on desktop (institution → governance → knowledge → intelligence → operating systems → institutional outcome). Dark `hero-gradient` surface, grid backdrop, top cyan hairline.
2. **Problem** (`ProblemSection`) — fragmented tools (Excel / email+chat / generic AI) vs. AQLIYA's governed path (upload → review → approval → final file).
3. **Comparison** (`ComparisonSection`) — Standalone AI tool (red) vs. AQLIYA platform (emerald): tool solves a problem, platform runs the institution.
4. **Platform layers** (`PlatformLayersSection`) — 4 stacked layers (Governance → Knowledge → Intelligence → Operating Systems), hover accent.
5. **Product ecosystem** (`SystemCardGrid`) — AuditOS, LocalContentOS, DecisionOS, SalesOS with evidence-gated status labels; links to product pages.
6. **Trust** (`TrustSection`, **new**) — dark section, 4 pillars (private governed AI · permissions & tenant isolation · traceable evidence · full audit trail) + institutional-principle highlight card.
7. **Proof** (`ProofSection`) — demo / leadership summary / procurement pack.
8. **FAQ** (`FAQSection`, AR only currently) — accordion + `FAQPage` JSON-LD.
9. **Conversion** (`ConversionBand`) — single diagnostic-session CTA + proof secondary.

- **Components:** all from `home-sections.tsx` + `platform-architecture.tsx` + `reveal.tsx`.
- **SEO:** `generateMetadata` (AR) / `metadata` (EN); OG + Twitter; inherits Organization/WebSite JSON-LD from marketing layout.
- **Mobile:** architecture visual hidden < `lg`; single column; full-width stacked CTAs; centered trust/persona rows. Verified overflow-free 375–1440.

---

## PLATFORM — `/platform`, `/en/platform` — EXISTS (blueprint for future elevation)
- **Objective:** Explain the four foundations in depth (Governance, Knowledge, Intelligence, Execution) and inheritance.
- **Sections:** hero → layered architecture (reuse `PlatformArchitecture` at larger scale) → each foundation expanded → security/privacy → CTA.
- **Reuse:** `MarketingPageShell` + section components from `home-sections`.

## PRODUCTS INDEX — `/products`, `/en/products` — EXISTS
- Grid of operating systems with consistent `SystemCard` treatment + evidence-gated status; links to detail pages. Framed as modules on the platform.

## PRODUCT DETAIL (reusable) — `/products/{audit,local-content,decision,sales}` — EXISTS via `v2/product-page-template`
- **Blueprint order (brief §15):** Hero → Problem → Solution → How it works → Capabilities → Intelligence/governance layer → Workflow → Evidence/outputs → Security/governance → Institutional outcomes → CTA.
- **SalesOS:** presentation only; architecture frozen — no new functionality or claims.
- **LocalContentOS:** local-content intelligence, calculation, supplier/tender evaluation, evidence, governance — **no unverifiable regulatory/certification claims**.

## INTELLIGENCE — (concept lives in Platform + Governance today)
- **Blueprint:** Institutional Memory, Knowledge Foundation, Governed AI, Context, Evidence, Decision intelligence. Keep technical implementation (vectors/RAG) secondary (brief §18).

## GOVERNANCE / SECURITY — `/governance`, `/security` (+ `/en`) — EXISTS (depth pages in `v2`)
- Trust architecture in depth: private/governed AI, access control, auditability, evidence, traceability. **No invented certifications** (SOC2 page is explicitly a *roadmap*).

## ABOUT — `/about`, `/en/about` — EXISTS
- Mission, philosophy, Arab-first approach, institutional intelligence.

## CONTACT / DEMO — `/contact`, `/demo` (+ `/en`) — EXISTS
- Enterprise diagnostic-session form (name, organization, work email, role, country, area of interest, message); client+server validation; no unnecessary PII.

---

## Deferred (flagged, not built this pass)
- `hreflang`/`alternates.languages` linking ar↔en.
- Route consolidation (proof/proof-library/pilot-*, executive-brief/-briefing).
- EN FAQ parity on homepage.
- Logo SVG swap (PNG→SVG) across chrome.
- True `next-intl` locale routing migration.
