# AQLIYA Phase 3 — Baseline (Gate 0)

> **Date:** 2026-09-09 | **Purpose:** Record repository state and SEO/localization architecture before Phase 3 hardening.

## Git

- **Branch:** `feat/authz-platform-admin-separation`
- **HEAD:** `0629f30fda75ab159f0be9fa12585c5a1f8be8db`
- **Working tree:** dirty — uncommitted Phase 1/2/3 website work present (66 marketing/chrome files modified + new `docs/website/`, `platform-architecture.tsx`, `reveal.tsx`, `seo.ts`). Two pre-existing unrelated modified files (`phase-28-final-hotfix.test.ts`, `organization-actions.ts`) are **not** part of this work and will be excluded from the commit.
- Nothing committed yet (per instruction).

## Route architecture

- Next.js 16 App Router. Public marketing under `src/app/(marketing)/*` (Arabic, default, `dir=rtl`) and a duplicated English tree `src/app/en/*` (`dir=ltr` via layout wrapper). **Preserved as-is** (no locale-routing migration).
- Redirects in `next.config.mjs` (e.g. `/executive-briefing`, `/products/simulation`, `/buyers/procurement`, `/sunbul→/workflowos`) plus in-page `redirect()` shims for `/buyers/*`, `/executive-briefing`, `/products/simulation`.

## Metadata architecture

- Per-page `generateMetadata`/`export const metadata`. Root + `(marketing)` layout provide `metadataBase`, default OG/Twitter, robots.
- **SEO helper (`src/lib/marketing/seo.ts`, new/uncommitted):** `SITE_URL`, verified `AR_TO_EN_PAIRS` (28 real pairs), `AR_ONLY` (`/pricing`), `buildAlternates(route)` → canonical + `languages` (ar-SA / en-US / x-default), `localizedPagePairs()`. Wired into 47 pages via `alternates: buildAlternates(...)`. Legal pages (privacy/terms × AR/EN) wired in during Phase 3 (Gate 2).

## Sitemap architecture

- `src/app/sitemap.ts` — consumes `localizedPagePairs()` + priority map; emits AR + EN URLs with per-entry hreflang `alternates.languages`, AR-only pages, and public collateral (`/print/*`, `/auditos/*`). Absolute URLs from `SITE_URL`.

## Robots architecture

- `src/app/robots.ts` — allow `/`, disallow `/api/`, auth, and all authenticated app workspaces (audit, decisions, local-content, workflowos, etc.); `sitemap` + `host` set to `SITE_URL`.

## Localization architecture

- `next-intl` for shared chrome strings (now largely replaced by locale-aware `headerLabels` in `use-site-header.ts` after Phase 2 sweep). Marketing copy lives in `src/lib/marketing/copy-*` (AR) and `copy-*-en` (EN). Language switch via `locale-paths.ts` (`toEnglishPath`/`toArabicPath`).

## Disposition

Existing SEO scaffolding (`seo.ts` + sitemap + robots) is valid, verified, and preserved. Phase 3 completes hreflang coverage (legal pages), validates rendered output, and runs the full release gate. No architecture migration.
