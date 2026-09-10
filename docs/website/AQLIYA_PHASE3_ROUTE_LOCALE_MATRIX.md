# AQLIYA Phase 3 — Route / Locale Matrix (Gate 1)

> **Date:** 2026-09-09 | **Method:** Enumerated every `page.tsx` under `src/app/(marketing)` and `src/app/en`, cross-checked against `src/lib/marketing/seo.ts` pairs. Existence of all 28 pairs verified programmatically (28/28). Redirect shims inspected individually.

Legend — **Indexable:** page returns content (not a `redirect()`); **Hreflang:** has `alternates.languages` AR↔EN via `buildAlternates`.

## Localized content pages (AR ↔ EN pairs — all verified to exist)

| Route | Locale | Counterpart | Canonical | Indexable | Hreflang |
|---|---|---|---|---|---|
| `/` | ar | `/en` | `https://aqliya.com` | Yes | Yes |
| `/en` | en | `/` | `https://aqliya.com/en` | Yes | Yes |
| `/platform` | ar | `/en/platform` | self | Yes | Yes |
| `/en/platform` | en | `/platform` | self | Yes | Yes |
| `/products` | ar | `/en/products` | self | Yes | Yes |
| `/en/products` | en | `/products` | self | Yes | Yes |
| `/products/audit` | ar | `/en/products/audit` | self | Yes | Yes |
| `/en/products/audit` | en | `/products/audit` | self | Yes | Yes |
| `/products/local-content` | ar | `/en/products/local-content` | self | Yes | Yes |
| `/en/products/local-content` | en | ar | self | Yes | Yes |
| `/products/decision` | ar | `/en/products/decision` | self | Yes | Yes |
| `/en/products/decision` | en | ar | self | Yes | Yes |
| `/products/sales` (**SalesOS, frozen**) | ar | `/en/products/sales` | self | Yes | Yes |
| `/en/products/sales` | en | ar | self | Yes | Yes |
| `/products/office-ai` | ar | `/en/products/office-ai` | self | Yes | Yes |
| `/en/products/office-ai` | en | ar | self | Yes | Yes |
| `/governance` | ar | `/en/governance` | self | Yes | Yes |
| `/en/governance` | en | ar | self | Yes | Yes |
| `/security` | ar | `/en/security` | self | Yes | Yes |
| `/en/security` | en | ar | self | Yes | Yes |
| `/deployment` | ar | `/en/deployment` | self | Yes | Yes |
| `/en/deployment` | en | ar | self | Yes | Yes |
| `/proof` | ar | `/en/proof` | self | Yes | Yes |
| `/en/proof` | en | ar | self | Yes | Yes |
| `/demo` | ar | `/en/demo` | self | Yes | Yes |
| `/en/demo` | en | ar | self | Yes | Yes |
| `/procurement-pack` | ar | `/en/procurement-pack` | self | Yes | Yes |
| `/en/procurement-pack` | en | ar | self | Yes | Yes |
| `/case-studies` | ar | `/en/case-studies` | self | Yes | Yes |
| `/en/case-studies` | en | ar | self | Yes | Yes |
| `/industries` | ar | `/en/industries` | self | Yes | Yes |
| `/en/industries` | en | ar | self | Yes | Yes |
| `/use-cases` | ar | `/en/use-cases` | self | Yes | Yes |
| `/en/use-cases` | en | ar | self | Yes | Yes |
| `/insights` | ar | `/en/insights` | self | Yes | Yes |
| `/en/insights` | en | ar | self | Yes | Yes |
| `/insights/ai-institutional-failures` | ar | `/en/…` | self | Yes | Yes |
| `/insights/assistant-vs-governed-intelligence` | ar | `/en/…` | self | Yes | Yes |
| `/insights/governance-over-intelligence` | ar | `/en/…` | self | Yes | Yes |
| (3 EN insight articles) | en | ar | self | Yes | Yes |
| `/about` | ar | `/en/about` | self | Yes | Yes |
| `/en/about` | en | ar | self | Yes | Yes |
| `/start` | ar | `/en/start` | self | Yes | Yes |
| `/en/start` | en | ar | self | Yes | Yes |
| `/contact` | ar | `/en/contact` | self | Yes | Yes |
| `/en/contact` | en | ar | self | Yes | Yes |
| `/custom-product` | ar | `/en/custom-product` | self | Yes | Yes |
| `/en/custom-product` | en | ar | self | Yes | Yes |
| `/soc2-roadmap` | ar | `/en/soc2-roadmap` | self | Yes | Yes |
| `/en/soc2-roadmap` | en | ar | self | Yes | Yes |
| `/privacy` | ar | `/en/privacy` | self | Yes | Yes (added Gate 2) |
| `/en/privacy` | en | ar | self | Yes | Yes (added Gate 2) |
| `/terms` | ar | `/en/terms` | self | Yes | Yes (added Gate 2) |
| `/en/terms` | en | ar | self | Yes | Yes (added Gate 2) |

## AR-only content pages (no EN counterpart — none invented)

| Route | Locale | Counterpart | Canonical | Indexable | Hreflang |
|---|---|---|---|---|---|
| `/pricing` | ar | — (AR-only) | self | Yes | ar-SA only |

## Redirect-only routes (not indexable → correctly excluded from hreflang/sitemap pairs)

| Route | Behavior |
|---|---|
| `/executive-briefing`, `/en/executive-briefing` | → `/proof#executive-brief` (in-page redirect) |
| `/products/simulation` | → `/products` (redirect) |
| `/en/products/simulation` | → redirect (SimulationOS roadmap; excluded) |
| `/buyers/{cfo,cio,government,procurement,audit-partner}` (+ `/en/…`) | → `/start#<persona>` / `/procurement-pack` |
| `/engagement-models`, `/how-we-work` (AR) | → `/start#…` (next.config) |

## Validation

- 28/28 declared AR↔EN pairs exist on disk (verified programmatically).
- 7 EN pages absent from the hreflang map are all `redirect()` shims — correct exclusion.
- No fabricated counterparts. `/pricing` correctly AR-only.
- **Gate 1: PASS.**
