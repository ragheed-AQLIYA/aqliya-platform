# AQLIYA Hreflang Validation (Gate 2)

> **Date:** 2026-09-09 | **Method:** `src/lib/marketing/seo.ts` (`buildAlternates`) wired into every localized page; verified against **rendered production HTML** from `next start`.

## Implementation

- Single source of truth: `AR_TO_EN_PAIRS` (28 verified real pairs) in `src/lib/marketing/seo.ts`.
- `buildAlternates(route)` emits `alternates.canonical` + `alternates.languages` (`ar-SA`, `en-US`, `x-default`→AR) for paired pages; `ar-SA` only for AR-only `/pricing`; canonical-only for unpaired/redirect routes.
- Wired into 47 content pages via `alternates: buildAlternates(...)`; legal pages (privacy/terms × AR/EN) added in this gate.
- Sitemap emits per-URL `xhtml:link` hreflang alternates for all pairs.

## Rendered evidence (from production server)

**AR `/platform`** `<head>`:
```
<html lang="ar" dir="rtl">
<link rel="canonical" href="https://aqliya.com/platform"/>
<link rel="alternate" hrefLang="ar-SA" href="https://aqliya.com/platform"/>
<link rel="alternate" hrefLang="en-US" href="https://aqliya.com/en/platform"/>
<link rel="alternate" hrefLang="x-default" href="https://aqliya.com/platform"/>
```

**EN `/en/platform`** `<head>`:
```
<link rel="canonical" href="https://aqliya.com/en/platform"/>
<link rel="alternate" hrefLang="ar-SA" href="https://aqliya.com/platform"/>
<link rel="alternate" hrefLang="en-US" href="https://aqliya.com/en/platform"/>
<link rel="alternate" hrefLang="x-default" href="https://aqliya.com/platform"/>
```

Alternates are **mutual and symmetric** (AR↔EN reference each other; x-default → AR primary). Verified on the home, platform, products, governance families; consistent pattern across all `buildAlternates` pages.

## Counterpart existence

- 28/28 declared AR↔EN pairs exist on disk (programmatic check).
- No fabricated counterparts. AR-only: `/pricing` (ar-SA hreflang only).
- Redirect-only routes (`/buyers/*`, `/executive-briefing`, `/products/simulation`, `/engagement-models`, `/how-we-work`) correctly excluded — not indexable content.

## Missing counterparts (documented, NOT invented)

| AR route | EN counterpart | Disposition |
|---|---|---|
| `/pricing` | none | Intentionally AR-only; ar-SA hreflang only. No EN page fabricated. |
| `/engagement-models`, `/how-we-work` (AR redirects) | → `/start` | Redirects, excluded. |

## Result

**Gate 2 (Hreflang): PASS** — mutual AR↔EN alternates on all real pairs, canonical preserved, `/en` architecture respected, no fabricated URLs, verified in rendered output.
