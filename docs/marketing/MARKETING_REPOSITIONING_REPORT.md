# AQLIYA Marketing Repositioning Report

**Date:** 2026-06-23  
**Program:** Marketing Repositioning  
**Owner:** CMO / Product Marketing / Enterprise Positioning

---

## Strategic Rationale

AQLIYA's public site must communicate **institutional operating capability**, not repository implementation status. Internal documents (`PRODUCT_STATUS_MATRIX`, `READINESS_GATES`, roadmaps) remain the engineering truth. The website speaks to CEOs, CFOs, audit partners, and government directors in **outcome language**.

**Core shift:**

| Before | After |
|--------|-------|
| Platform explaining itself | Platform solving institutional problems |
| Product catalog with maturity tags | Operating systems with capability framing |
| Pilot-ready / active / L5 | Institutional activation / integrated / evidence-based |
| Placeholder honesty on homepage | Professional anonymized case narratives |
| English product-first nav | English platform-first nav aligned with Arabic |

---

## Before State

1. Homepage strong on platform narrative but weak on **business outcomes**; journey exposed "Pilot" and Go/No-Go.
2. `/products` titled "المنتجات" with "3 أنظمة نشطة" and engineering proof notes.
3. `/about` listed systems with جاهز للبايلوت / نشط / قيد التطوير.
4. System pages exposed `L4`, `L5`, `L6` badges.
5. `/case-studies` had explicit placeholder block for pilot reference.
6. English homepage used Pilot-ready / Active / Coordinated pilot tags.
7. `public-status.ts` centralized buyer-facing build-state labels.

---

## After State

1. **Homepage:** Outcomes section (5 cards); hero covers audit/decisions/compliance/governance; journey uses تقييم تشغيلي / قرار بالأدلة; CTAs optimized.
2. **Systems (`/products`):** Renamed conceptually to operating systems; capability notes; sector tags; roadmap tier without purchase rejection language.
3. **About:** Vision, philosophy, operating systems + platform roadmap — no build status.
4. **Platform:** Vision status labels from terminology system; deployment as capability options.
5. **Industries:** Outcomes + systems per sector; compliance sector added.
6. **Case studies:** Anonymized institutional scenarios; compliance case; placeholder removed.
7. **Proof layer:** Operational evaluation framing; pilot-outcomes renamed; proof center updated.
8. **English:** Platform-first nav; outcomes-aligned homepage.
9. **Terminology:** `docs/marketing/MARKETING_TERMINOLOGY.md` + updated `public-status.ts`.

---

## What Did NOT Change

- Routes (`/products/*` kept — no URL migration)
- Backend, schema, business logic
- Internal status documents
- Factual limits on deployment models (proof/deployment pages remain honest)

---

## Success Criteria Check

**Target CEO impression (30 seconds):**

> "AQLIYA helps institutions make governed decisions, improve auditability, strengthen compliance, and operate with evidence-backed intelligence."

**Avoided impression:**

> "This is a software project progressing through pilot stages."

**Assessment:** Vision-layer pages now meet target. Proof-layer retains evaluation mechanics without leaking into homepage or system pages.

---

## Next Recommended Steps

1. Align `/use-cases` and `/contact` copy fully to terminology system.
2. Expand English mirror pages (`/en/platform`, `/en/about`) beyond homepage.
3. Add `docs/marketing/CONTENT_STYLE_GUIDE.md` for future contributors.
4. Quarterly compliance scan against forbidden terms.
