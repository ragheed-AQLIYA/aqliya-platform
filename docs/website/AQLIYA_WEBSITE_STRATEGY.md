# AQLIYA Website Strategy

> **Status:** Active | **Date:** 2026-09-09 | **Depends on:** `AQLIYA_WEBSITE_AUDIT.md`

---

## 1. Positioning

**AQLIYA — Private, Governed Institutional Intelligence.**

AQLIYA is the **platform**. Operating systems (AuditOS, LocalContentOS, DecisionOS, SalesOS, WorkflowOS, RiskOS) are **modules that inherit** governance, knowledge, and intelligence from the shared core. The website must always express:

```
AQLIYA (platform)
  → Foundations: Governance · Knowledge · Intelligence · Execution
    → Operating Systems (products)
      → Institutional outcomes
```

**Not** a collection of independent apps. **Not** an AI chatbot. **Not** SaaS-only.

Arabic anchor: *عقلية منصة ذكاء مؤسسي خاص ومحكوم.*

---

## 2. Audience

**Primary (design for executive credibility first):** CEO, CIO, CTO, COO, CFO, audit/risk/compliance executives, procurement leaders, strategy, legal/regulatory, government-related and regulated Saudi/Arab enterprises.

**Secondary:** enterprise AI leaders, digital transformation, knowledge management, operations, professional services.

Implication: the homepage must be legible in **5–10 seconds** to a non-technical executive, without requiring AI vocabulary.

---

## 3. Messaging Hierarchy

1. **Institutional problem** — knowledge, decisions, regulations, and expertise are fragmented across tools; nothing is defensible under review.
2. **AQLIYA solution** — a governed operating layer that turns those assets into defensible institutional intelligence.
3. **Platform** — four stacked layers (Governance → Knowledge → Intelligence → Operating Systems), inherited by every product.
4. **Products** — specialized systems on the core, not separate companies.
5. **Proof** — interactive demo, leadership summary, procurement pack.
6. **Trust** — private/governed AI, permissions, tenant isolation, traceable evidence, full audit trail.
7. **Conversion** — one diagnostic session.

The differentiator sentence, repeated as the institutional principle:
**"AI assists. Humans decide. Evidence governs." / "الذكاء يساعد. الإنسان يقرّر. الدليل يحكم."**

---

## 4. Value Proposition

> Generic AI: **Prompt → Answer.**
> AQLIYA: **Institutional context + Knowledge + Governance + Evidence + AI + Workflow + Decision → Institutional outcome.**

The homepage hero visual encodes exactly this as a vertical intelligence stack (institution inputs → governance → knowledge → intelligence → operating systems → institutional outcome), rendered in pure CSS/SVG — **no fake dashboards** (brief §11, §45).

---

## 5. Information Architecture (retained)

The existing platform-first IA is retained (user decision: keep the `/en` duplicate-tree architecture, lowest risk). Primary nav stays: **Platform · Systems · Pricing · Governance · Why AQLIYA · About.** Products remain reachable and consistently framed as operating systems on the platform.

Future (out of this pass, flagged in audit §12): consolidate proof/pilot route sprawl; migrate to true `next-intl` locale routing with hreflang.

---

## 6. Conversion Strategy

- **Primary CTA (everywhere):** Book a Diagnostic Session / احجز جلسة تشخيص.
- **Secondary:** Explore the Platform / تعمّق في المنصة.
- **Tertiary (contextual):** Explore Products, Proof materials.

CTA hierarchy is deliberate — one dominant action per view. The redesign fixed the previously-invisible secondary CTA so the "explore" path is now viable.

---

## 7. Content Rules (enforced)

- No fabricated customers, revenue, market share, certifications, partnerships, government relationships, deployment numbers, or AI-accuracy claims.
- Product status is gated through `src/lib/marketing/public-status.ts` evidence-based labels.
- LocalContentOS presented as a serious Saudi local-content solution **without** unverifiable regulatory/certification claims.
- SalesOS presentation unchanged in architecture (frozen); shown only as an existing roadmap module.

---

## 8. Arabic / English Strategy

- **Arabic is the primary, default experience** (`/`, `dir=rtl`, `lang=ar`). English is a full mirror under `/en`.
- Both directions are designed properly, not auto-mirrored: the redesign uses **logical properties** (`ps-*`, `pe-*`, `inset-x`, `start/end`) so RTL and LTR both read naturally.
- Locale-sensitive chrome (top bar) now renders in the correct language per tree (previously always Arabic on `/en`).
- Deferred: `hreflang`/`alternates.languages` linking the two locales (cross-site SEO change).

---

## 9. Success Criteria (this pass)

- A CEO understands "governed institutional intelligence platform" within 10 seconds of the hero. ✅ (hero headline + conceptual stack + trust signals)
- A CTO sees a platform, not a chatbot. ✅ (4-layer platform + inheritance messaging + trust section)
- A security leader sees privacy/governance/evidence/audit as fundamental. ✅ (dedicated on-home Trust section)
- AR and EN both production-quality, zero overflow at all target breakpoints. ✅ (verified in browser QA)
- No existing functionality broken; tsc + lint clean. ✅
