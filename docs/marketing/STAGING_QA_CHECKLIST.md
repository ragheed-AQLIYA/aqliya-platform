# Marketing Staging QA Checklist

**Program:** Marketing Repositioning — Phase 0.2 / 0.3  
**Target:** `staging.aqliya.com`  
**Date:** 2026-06-23

---

## Pre-deploy

- [ ] `npx tsc --noEmit` — Pass
- [ ] `npm test -- src/__tests__/unit/marketing/` — Pass
- [ ] `npm run build` — Pass (note route count)
- [ ] Commit on `main` or `staging` branch includes marketing bundle

---

## Smoke URLs (AR — vision layer)

| URL | Check |
|-----|--------|
| `/` | Hero = institutional platform; no L4/L5/pilot-ready |
| `/platform` | Capability labels only; no build badges |
| `/about` | No engineering status table |
| `/products` | Operating systems framing |
| `/products/audit` | No L6 badge |
| `/industries` | Outcomes + sectors |

---

## Smoke URLs (AR — proof layer)

| URL | Check |
|-----|--------|
| `/proof` | Operational evaluation language |
| `/pilot-proof` | Evidence-based decision framing |
| `/procurement-pack` | Evaluation pack cards load |
| `/engagement-models` | Operational evaluation / institutional activation |
| `/contact` | Form submits (rate limit OK) |

---

## Smoke URLs (EN mirror)

| URL | Check |
|-----|--------|
| `/en` | Platform-first hero |
| `/en/platform` | publicOsStatusEn labels |
| `/en/proof` | Links to `/en/procurement-pack` |
| `/en/procurement-pack` | EN pack cards |
| `/en/engagement-models` | Five models in English |
| `/en/deployment` | Honest availability labels |
| `/en/products/decision` | Page renders |
| `/en/products/local-content` | Page renders |

---

## Locale switcher

- [ ] `/platform` ↔ `/en/platform`
- [ ] `/procurement-pack` ↔ `/en/procurement-pack`
- [ ] `/products/decision` ↔ `/en/products/decision`

---

## Print / PDF

| URL | Check |
|-----|--------|
| `/print/executive-brief-en` | Print toolbar; no pilot-ready |
| `/print/evaluation-sow-en` | EN SOW terminology |

---

## API (proof intake)

| Endpoint | Check |
|----------|--------|
| `POST /api/pilot-review` | 200 on valid body; 429 after burst |
| `POST /api/custom-product-submit` | 200 on valid body; 429 after burst |

---

## AuditOS public demo (`/auditos`)

| URL | Check |
|-----|--------|
| `/auditos` | Demo Only banner; mock data overview |
| `/auditos/trial-balance` | Step navigates; no upload mutation |
| `/auditos/mapping` | AI suggest + human approve framing |
| `/auditos/statements` | Traceable figures |
| `/auditos/evidence` | Evidence vault mock |
| `/auditos/traceability` | Audit trail chain |
| `/en/demo` | CTA → `/auditos` |

**Automated:** `npm run demo:smoke` + `src/__tests__/unit/auditos/demo-routes.test.ts`

---

## Post-deploy smoke (staging)

```bash
npm run smoke:local
# or
node scripts/platform/post-deploy-smoke.mjs --base-url https://staging.aqliya.com
```

## Sign-off

| Role | Name | Date | Result |
|------|------|------|--------|
| Marketing / Director | | | |
| QA | | | |

**Exit criteria (Phase 0):** Buyer sees institutional platform narrative in under 30 seconds; zero forbidden terms on vision pages (automated test).
