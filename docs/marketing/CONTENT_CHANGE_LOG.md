# Marketing Content Change Log

**Program:** Marketing Repositioning  
**Date:** 2026-06-23

---

## New Files

| File | Change |
|------|--------|
| `docs/marketing/MARKETING_TERMINOLOGY.md` | Approved public vocabulary + layer model |
| `docs/marketing/MARKETING_CONTENT_AUDIT.md` | Full page audit |
| `docs/marketing/MARKETING_REPOSITIONING_REPORT.md` | Before/after strategic report |
| `docs/marketing/PUBLIC_LANGUAGE_COMPLIANCE_REPORT.md` | Forbidden-term verification |
| `docs/marketing/EXECUTIVE_SUMMARY.md` | 2-page executive summary |

---

## Modified Files

| File | What changed |
|------|----------------|
| `src/lib/marketing/public-status.ts` | Vision-layer capability labels; `publicCapabilityNote`; `publicEngagementGate` |
| `src/app/(marketing)/page.tsx` | Outcomes section; hero rewrite; journey/proof/CTA updates |
| `src/app/(marketing)/about/page.tsx` | Removed build status; operating systems + roadmap |
| `src/app/(marketing)/products/page.tsx` | Systems positioning; capability notes; hero/tier labels |
| `src/app/(marketing)/platform/page.tsx` | Status labels; deployment copy; roadmap link fix |
| `src/app/(marketing)/products/audit/page.tsx` | Removed L6 badge; systems back link |
| `src/app/(marketing)/products/decision/page.tsx` | Removed L4 badge; systems back link |
| `src/app/(marketing)/products/local-content/page.tsx` | Removed L5 badge; systems CTAs |
| `src/app/(marketing)/products/sales/page.tsx` | Roadmap positioning; removed dev/pilot rejection |
| `src/app/(marketing)/products/office-ai/page.tsx` | Removed L4; shared capability copy |
| `src/app/(marketing)/industries/page.tsx` | Outcomes + systems; compliance sector |
| `src/app/(marketing)/case-studies/page.tsx` | Placeholder removed; anonymized compliance case |
| `src/app/(marketing)/proof/page.tsx` | Operational evaluation framing |
| `src/app/(marketing)/pilot-outcomes/page.tsx` | Renamed framing; no placeholder language |
| `src/app/(marketing)/executive-brief/page.tsx` | System cards use capability labels |
| `src/app/(marketing)/buyers/page.tsx` | Removed Pilot-ready security note; proof-layer terminology (round 2) |
| `src/app/en/page.tsx` | Full rewrite — outcomes + platform-first |
| `src/app/en/platform/page.tsx` | Full rewrite — vision labels via `publicOsStatusEn` (round 2) |
| `src/app/en/about/page.tsx` | **New** — English about mirror (round 2) |
| `src/app/en/industries/page.tsx` | **New** — English industries mirror (round 3) |
| `src/app/en/executive-brief/page.tsx` | Vision labels; removed pilot-ready (round 3) |
| `src/app/en/products/audit/page.tsx` | `publicOsStatusEn` labels (round 3) |
| `src/app/en/proof/page.tsx` | Operational evaluation terminology (round 3) |
| `src/app/en/contact/page.tsx` | Evaluation terminology (round 3) |
| `src/lib/marketing/procurement-pack-items.ts` | Proof-layer labels (round 3) |
| `src/app/(marketing)/procurement-pack/page.tsx` | Metadata terminology (round 3) |
| `src/app/(marketing)/proof/page.tsx` | Hero copy (round 3) |
| `src/app/(marketing)/security/page.tsx` | Procurement CTA copy (round 3) |
| `src/app/(marketing)/demo/page.tsx` | CTA card (round 3) |
| `src/app/(marketing)/how-we-work/page.tsx` | Phase title (round 3) |
| `src/app/(marketing)/executive-brief/page.tsx` | Systems + CTA (round 3) |
| `src/app/(marketing)/contact/page.tsx` | Intake heading (round 3) |
| `src/app/(marketing)/products/decision/page.tsx` | Back link label (round 3) |
| `src/app/(marketing)/platform/page.tsx` | Vision-layer systems copy (round 3) |
| `src/app/(marketing)/deployment/page.tsx` | Air-gapped honesty copy (round 3) |
| `src/app/en/governance/page.tsx` | **New** — English governance mirror (round 4) |
| `src/app/print/executive-brief/page.tsx` | Evaluation terminology (round 4) |
| `src/app/print/executive-brief-en/page.tsx` | `publicOsStatusEn` labels (round 4) |
| `src/app/print/pilot-sow-template/page.tsx` | Evaluation SOW terminology (round 4) |
| `src/app/print/pilot-weekly-metrics/page.tsx` | Weekly checkpoint terminology (round 4) |
| `src/app/print/reference-case-template/page.tsx` | Reference template terminology (round 4) |
| `src/app/print/objection-handling/page.tsx` | Objection responses (round 4) |
| `src/app/print/industry-audit-firms/page.tsx` | Industry brief terminology (round 4) |
| `src/app/print/dpa-summary/page.tsx` | DPA scope wording (round 4) |
| `src/app/print/data-residency/page.tsx` | Residency wording (round 4) |
| `src/components/layout/site-header.tsx` | EN nav: About, Industries, Governance → EN routes |
| `src/lib/marketing/locale-paths.ts` | `/about`, `/industries`, `/governance` ↔ EN |
| `src/app/(marketing)/engagement-models/page.tsx` | Proof-layer terminology pass (round 2) |
| `src/app/(marketing)/contact/page.tsx` | Proof-layer terminology pass (round 2) |
| `src/app/(marketing)/contact/contact-form.tsx` | User-facing labels → تقييم تشغيلي / جلسة تشخيص (round 2) |
| `src/app/(marketing)/pilot-proof/page.tsx` | Full proof-layer terminology pass (round 2) |
| `src/app/(marketing)/proof-library/page.tsx` | Proof-layer terminology pass (round 2) |
| `src/app/print/executive-brief/page.tsx` | `publicEngagementGate` import |

### Round 5 — Phase 0 closure (2026-06-23)

| File | What changed |
|------|----------------|
| `src/app/en/products/decision/page.tsx` | **New** — English DecisionOS mirror |
| `src/app/en/products/local-content/page.tsx` | **New** — English LocalContentOS mirror |
| `src/app/print/evaluation-sow-en/page.tsx` | **New** — EN evaluation SOW print template |
| `src/lib/marketing/locale-paths.ts` | `/products/decision`, `/products/local-content` ↔ EN |
| `src/lib/marketing/procurement-pack-items.ts` | EN evaluation SOW pack item |
| `src/app/api/pilot-review/route.ts` | IP rate limit (8/min); success message wording |
| `src/__tests__/unit/marketing/vision-layer-language.test.ts` | **New** — forbidden-term guard on vision pages |

### Round 6 — Phase 1 closure (2026-06-23)

| File | What changed |
|------|----------------|
| `src/app/en/engagement-models/page.tsx` | **New** — EN engagement models |
| `src/app/en/deployment/page.tsx` | **New** — EN deployment (honest availability) |
| `src/app/en/procurement-pack/page.tsx` | **New** — EN procurement hub |
| `src/app/en/how-we-work/page.tsx` | **New** — EN methodology page |
| `src/lib/marketing/procurement-pack-items.ts` | `procurementPackItemsEn` array |
| `src/lib/marketing/locale-paths.ts` | Proof-layer AR ↔ EN mappings |
| `src/app/en/proof/page.tsx` | EN internal links for pack/models/deployment |
| `src/app/en/contact/page.tsx` | Procurement pack → `/en/procurement-pack` |
| `src/__tests__/unit/marketing/marketing-routes.test.ts` | **New** — route + locale smoke |
| `docs/marketing/STAGING_QA_CHECKLIST.md` | **New** — Phase 0.2/0.3 QA |

### Round 7 — Phase 1.3–1.5 + smoke hardening (2026-06-23)

| File | What changed |
|------|----------------|
| `src/lib/rate-limit.ts` | `clientIpRateLimitKey` for public POST APIs |
| `src/app/api/pilot-review/route.ts` | Use shared IP rate-limit helper |
| `src/app/api/custom-product-submit/route.ts` | IP rate limit (6/min) |
| `scripts/platform/post-deploy-smoke.mjs` | EN marketing routes + `/auditos` demo path |
| `scripts/platform/demo-smoke-check.mjs` | AuditOS demo files + EN marketing + banner check |
| `src/__tests__/unit/auditos/demo-routes.test.ts` | **New** — demo route + safety tests |
| `docs/marketing/STAGING_QA_CHECKLIST.md` | AuditOS + post-deploy smoke section |

### Round 8 — Phase 2 AuditOS entry (2026-06-23)

| File | What changed |
|------|----------------|
| `src/__tests__/unit/audit/workflow-next-action.test.ts` | **New** — engagement next-step routing tests |
| `src/__tests__/unit/audit/engagement-workflow-routes.test.ts` | **New** — 19-tab route + export governance guards |
| `src/__tests__/unit/auditos/demo-routes.test.ts` | StepNav presence on all demo pages |
| `scripts/platform/demo-smoke-check.mjs` | AuditOS workflow module static checks |
| `scripts/platform/post-deploy-smoke.mjs` | `/en/demo` smoke URL |

### Round 9 — Phase 2-B/C product entry (2026-06-23)

| File | What changed |
|------|----------------|
| `src/lib/local-content/pilot-readiness.ts` | Exported `computeOverallPilotStatus` |
| `src/__tests__/unit/local-content/pilot-readiness-status.test.ts` | **New** |
| `src/__tests__/unit/local-content/project-workflow-routes.test.ts` | **New** — 12 project tabs |
| `src/__tests__/unit/decision/workflow-routes.test.ts` | **New** — DecisionOS routes |
| `scripts/platform/demo-smoke-check.mjs` | LC + Decision static checks |
| `docs/deliverables/PHASE_2_LOCALCONTENT_ENTRY.md` | **New** |
| `docs/deliverables/PHASE_2_DECISION_ENTRY.md` | **New** |

### Round 10 — Marketing gap closure + journey structure (2026-06-23)

| File | What changed |
|------|----------------|
| `docs/marketing/MARKETING_GAP_ASSESSMENT.md` | **New** — honest scorecard (2.8/5) |
| `docs/marketing/MARKETING_ROADMAP.md` | **New** — 6-phase commercial roadmap |
| `src/lib/marketing/buyer-journeys.ts` | **New** — 6 persona paths |
| `src/lib/marketing/institutional-use-cases.ts` | **New** — shared use-case content |
| `src/app/(marketing)/start/page.tsx` | **New** — «من أين تبدأ» hub |
| `src/app/(marketing)/use-cases/page.tsx` | **Fixed** — real page (was redirect to insights) |
| `src/components/layout/site-header.tsx` | Systems + Get Started in nav |
| `src/components/layout/site-footer.tsx` | Fixed pilot label; /products, /start links |
| `src/app/(marketing)/page.tsx` | Sharper hero, persona chips, journey CTAs |
| `src/app/(marketing)/proof/page.tsx` | Persona path strip → `/start` |
| `src/app/(marketing)/insights/page.tsx` | Imports shared use cases |

### Round 11 — Redesign plan (2026-06-23)

| File | What changed |
|------|----------------|
| `docs/marketing/MARKETING_REDESIGN_PLAN.md` | **New** — full IA, merge map, R1–R5 waves, −62% LOC target |
| `docs/marketing/MARKETING_ROADMAP.md` | Linked redesign waves R1–R5 |

### Round 12 — Audit bug-fix B1–B4 + EN parity (2026-06-23)

| File | What changed |
|------|----------------|
| `src/components/layout/site-header.tsx` | EN: Systems → `/en/products`, Get Started → `/en/start` |
| `src/lib/marketing/locale-paths.ts` | `/products` → `/en/products`, `/start` → `/en/start`, `/use-cases` → `/en/use-cases` |
| `src/app/en/products/page.tsx` | **New** — EN operating systems hub |
| `src/app/en/start/page.tsx` | **New** — EN buyer journey hub |
| `src/app/en/use-cases/page.tsx` | **New** — EN use cases (4 core) |
| `src/lib/marketing/buyer-journeys-en.ts` | **New** — 7 EN personas incl. contracting |
| `src/lib/marketing/buyer-journeys.ts` | Added `contracting` persona (AR) |
| `src/app/(marketing)/page.tsx` | Chip: مقاولات / محتوى محلي |
| `marketing-routes.test.ts` | EN route + locale mapping tests |

### Round 13 — R1 homepage + bug-fix commit (2026-06-23)

| File | What changed |
|------|----------------|
| `src/components/marketing/v2/marketing-shell.tsx` | **New** — MarketingPageShell + ConversionBand |
| `src/app/(marketing)/page.tsx` | R1: 9 sections → 4 blocks (~240 lines) |
| `next.config.mjs` | `/how-we-work` → `/start` redirect |

---

## Not Modified (by design)

- `PRODUCT_STATUS_MATRIX.md`, `READINESS_GATES.md`, roadmaps, architecture docs
- Backend routes (`/api/pilot-review`), analytics event names, schema, business logic
- `/procurement-pack`, `/deployment` — terminology aligned in round 3
