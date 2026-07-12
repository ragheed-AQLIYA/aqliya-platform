# AQLIYA Website Reality Audit — Current Marketing Site vs Approved Strategy
**Date:** 2026-07-04 · **Scope:** actual code under `src/app/(marketing)`, `src/app/en`, `src/components/layout`, `src/components/marketing`, `src/lib/marketing` · **Method:** source inspection, not doc summary.

> **Headline verdict:** The site is **honesty-strong but positioning-weak**. Claim discipline is genuinely good (no fake SOC2, honest roadmap labels, "sample data" disclaimers, value-based status labels — *no L4/L5/TRL/pilot-ready language leaks onto public pages*). The real problem is **framing**: the Home page sells AQLIYA as a *product-suite / workflow tool* ("audit, decisions, and local content in one platform"), not as the **Governed Institutional Intelligence platform** the strategy demands. Governance is missing from the nav, the primary CTA is a generic "Book a call," and the system set is inconsistent across pages (Home says "three solutions" but renders five).

---

## 1. Current Public Page Inventory

Content is centralized in `src/lib/marketing/*` constants; pages are thin wrappers. AR is the default (`(marketing)`), EN is a partial mirror (`/en`).

| Route | Source file | Type | Current hero framing | CTA(s) | Communicates | Framing verdict |
|-------|------------|------|---------------------|--------|-------------|-----------------|
| `/` | `(marketing)/page.tsx` + `copy-plain.ts` | Home | "من ميزان المراجعة إلى ملف جاهز للاعتماد — بدون تشتت في Excel والبريد" | Book a call (start) + demo + contact (**3 CTAs**) | Workflow tool for audit/decisions/local-content; "one platform, AI suggests, team approves, log for every step" | **Product/workflow-led** ❌ |
| `/platform` | `(marketing)/platform/page.tsx` | Platform | "البنية الأساسية المشتركة التي تعتمد عليها جميع منتجات وتطبيقات عقلية" / "AQLIYA Intelligence Core" | See systems / roadmap | Shared governed core; "platform applied via operational tracks — not separate products"; 6 components | **Platform-led** ✅ |
| `/products` | `(marketing)/products/page.tsx` | Systems index | "أنظمة تشغيل مؤسسية على نواة واحدة" | Per-card | Systems on one core, "same governance, evidence, human approval" | **Platform-led** ✅ |
| `/products/audit` | template + `product-pages-content.ts` | Product (AuditOS) | template-driven | Diagnostic/demo | Audit workflow OS | Product ✅ (needs check) |
| `/products/local-content` | template | Product (LocalContentOS) | template-driven | Diagnostic/demo | Suppliers, spend, local content, regulatory reports | Product ✅ |
| `/products/decision` | template | Product (DecisionOS) | template | — | Decision governance memos | Extra system ⚠️ |
| `/products/sales` | template | Product (SalesOS) | template + roadmap | roadmap | Commercial memory | Roadmap-labeled ✅ |
| `/products/office-ai` | template | Product (Office AI) | template | — | Cross-platform assistant | Extra / AI-generic risk ⚠️ |
| `/products/simulation` | template | Product (SimulationOS) | template + roadmap | roadmap | Scenario simulation | Roadmap ✅ |
| `/governance` | `(marketing)/governance/page.tsx` | Governance | "كل مخرج له تاريخ كامل يمكن تتبعه" | → /contact | Evidence chain, AI governance, permissions, immutable audit log, org isolation | **Strong, aligned** ✅ (but not in nav) |
| `/proof` | `proof/page.tsx` + `copy-proof.ts` | Proof | "كل مواد التقييم في مكان واحد" | Book / review | Demo, exec brief, evidence samples, pilot framework, "no real client data" | Aligned ✅ |
| `/about` | `(marketing)/about/page.tsx` | About | "ذكاء يمكن الوثوق به ومساءلته" | Book (email) | Philosophy + lists **6–7 systems** (adds SimulationOS, Custom Systems) | Aligned but system sprawl ⚠️ |
| `/contact` | `contact/page.tsx` | Contact | booking form | submit | Intro-call booking (`interest=diagnostic`) | CTA mislabeled ⚠️ |
| `/start` | `start/page.tsx` | Hub | "من أين تبدأ مع عقلية؟" | role-based | Persona router → reading paths | OK, but occupies a nav slot |
| `/demo`, `/deployment`, `/security`, `/soc2-roadmap`, `/procurement-pack` | respective | Trust/proof support | — | — | Demo, deployment tiers, security posture, honest SOC2 roadmap, procurement PDFs | **Honesty-strong** ✅ |
| `/industries`, `/use-cases`, `/case-studies`, `/insights/*`, `/buyers/*`, `/custom-product`, `/executive-briefing` | respective | Secondary/content | — | — | Segment & content pages (AR only for several) | Mixed; EN parity gap ⚠️ |
| `/privacy`, `/terms` | respective | Legal | — | — | — | OK |

**Nav (from `site-header.tsx`):** `المنصة · أنظمة التشغيل · من أين تبدأ · الإثبات · عن عقلية` + button **"احجز مكالمة" / "Book a call"**. Topbar strip carries the category line *"Private Governed Institutional Intelligence Platform"* (10px, hidden on mobile).

---

## 2. Live Messaging / Claims Audit

**Claim-type patterns actually live:**
- **Category claim:** present but demoted — "Private Governed Institutional Intelligence Platform" appears only in the tiny topbar. Home hero instead says *"One platform for audit, decisions, and local content."*
- **Product-status labels (`public-status.ts`)** — customer-facing, value-based, **not** internal maturity codes:
  - AuditOS → "متاح للتطبيق" / **"Available to deploy"**
  - DecisionOS → "متكامل في المنصة" / **"Integrated into platform"**
  - LocalContentOS → "متاح باتفاق النطاق" / "Available by agreed scope"
  - Office AI → "خدمة مشتركة" / "Shared service"
  - SalesOS & SimulationOS → "قريباً على خارطة المنصة" / **"Coming on platform roadmap"**
- **Governance/privacy claims** (`governance/page.tsx`, `security-page-content.ts`): human-in-the-loop as an *engineering constraint*, immutable audit log, per-org isolation, permissions without implicit access. Strong and specific.
- **Compliance honesty (excellent):** `security-page-content.ts` → "SOC2 / ISO: Roadmap — no certification claim until earned"; `soc2-roadmap.ts` → "We do not hold SOC2 or ISO certification today… not a compliance claim"; `procurement-pack-items.ts` → "no false SOC2 claims." Deployment air-gapped explicitly flagged "strategic — not a readiness claim."
- **Proof honesty:** "الديمو والنماذج على بيانات تجريبية — لا بيانات عملاء حقيقية" (demo on sample data, no real client data). No fabricated logos/metrics found.
- **Generic-AI language:** present as a *contrast device* ("ذكاء اصطناعي عام يعطي إجابة سريعة بدون مسار مراجعة") — used correctly to differentiate, not to self-describe. ✅

**Claims to validate (borderline maturity):** "Available to deploy" (AuditOS) and "Integrated into platform" (DecisionOS) are availability assertions. If these OSes are not actually deployable/integrated today, they are the site's only over-reach. Confirm against real product status.

**Internal-status-language leak check:** **None found.** No L4/L5, TRL, "pilot-ready," "production-ready," or engineering-maturity codes on public pages. This is a clean result and a genuine strength.

---

## 3. Page-by-Page Strategy Gap Analysis

Benchmark: Platform-led · Problem-anchored · Systems-proven · Governance-centered · Trust-first · Primary CTA = Book a Diagnostic Session · systems as governed workflows.

**Home** — biggest gap. Hero is workflow/product-first ("trial balance → sign-off-ready file"), positioning AQLIYA as a productivity/workflow platform, not the governed-intelligence *category*. Category line is buried in the topbar. Governance has **no dedicated section** (only a hero clause "log for every step"). Three competing hero CTAs; primary is generic "Book a call." Systems section heading says **"ثلاثة حلول / Three solutions"** but the array renders **five** cards (AuditOS, DecisionOS, LocalContentOS, SalesOS, Office AI) — a factual inconsistency that dents credibility.

**Platform** — aligned. Explicitly platform-led ("shared foundation… inherits constrained-AI logic," "applied via operational tracks — not separate products"). Minor: leads with "Intelligence Core" architecture language before customer value; could surface the *why-it-matters* higher.

**Governance** — content is strong and on-strategy, but **not in the primary nav** — the moat is hidden. Strategy makes it a top-level nav item.

**Proof** — aligned and honest; good use of demo/exec-brief/pilot framework in the absence of logos. Keep.

**AuditOS / LocalContentOS** — template-driven and structurally reasonable (workflow-oriented). Need to confirm they lead with the *professional problem* before capabilities and that "Available to deploy" is accurate.

**Contact / CTA flow** — booking URL is internally tagged `interest=diagnostic` but the button everywhere says **"Book a call" / "احجز مكالمة."** Strategy's dominant CTA is **"Book a Diagnostic Session."** Label/intent mismatch + no single dominant CTA.

**About** — aligned philosophy, but amplifies **system sprawl** (lists 6–7 systems incl. SimulationOS and "Custom Systems"), reinforcing house-of-products perception over one governed platform.

**System-set consistency (cross-page):** Home = 5, About = 6–7, Platform = "six components," products index = core + roadmap. No single canonical system list. Strategy focus is AuditOS + LocalContentOS + SalesOS(roadmap); DecisionOS / Office AI / SimulationOS dilute focus.

**AR/EN parity:** Home AR and EN copy are correctly mirrored (same hero, same "Book a call"). But EN is a **partial** mirror — missing `case-studies`, `buyers/*`, `insights/*`, `custom-product`, `executive-briefing`. EN visitors get a thinner proof/buyer surface.

---

## 4. Quick Fixes vs Section Rewrites vs Structural Rebuilds

**A) Quick copy fixes**
- Relabel CTA "Book a call / احجز مكالمة" → **"Book a Diagnostic Session / احجز جلسة تشخيص"** (in `site-header.tsx`, `copy-plain.ts`, `copy-plain-en.ts`, conversion bands).
- Fix "Three solutions" heading to match the actual number, or trim cards to match (see B).
- Verify/soften "Available to deploy" & "Integrated into platform" if not accurate.
- Promote the category line off the 10px topbar into a visible hero eyebrow.

**B) Section-level rewrites**
- **Home hero + problem section:** re-anchor from "trial-balance workflow" to **problem→platform** (regulated institutions can't run on indefensible AI → AQLIYA is the governed intelligence layer). Keep page skeleton.
- **Home systems section:** collapse to the canonical set (AuditOS, LocalContentOS, + SalesOS roadmap); demote DecisionOS/Office AI/Simulation to the products index; fix the count.
- **Add a Home "How governance & evidence work" section** (currently absent).
- **About systems list:** reconcile to the canonical set.

**C) Structural rebuilds**
- None strictly required. The architecture (centralized copy constants + platform/governance/proof pages) is sound. The Home page needs a **framing rebuild of the top third**, not a teardown.

---

## 5. Priority Remediation Plan

| Priority | Page | Problem | Change type | Recommended action |
|---|---|---|---|---|
| 1 | **Home** | Product/workflow-led hero; category buried; no governance section; 3 CTAs; "three solutions" vs 5 cards | **B (+A)** | Rewrite hero to problem→platform framing; surface category line; add governance/evidence section; reduce to one dominant CTA; fix system count |
| 2 | **Global nav / CTA** (`site-header.tsx`) | Governance not in nav; generic "Book a call"; no dominant CTA | **A** | Add **الحوكمة/Governance** to nav; relabel CTA to **Book a Diagnostic Session**; make it the single primary CTA |
| 3 | **Governance + Proof** | Strong content, under-surfaced (governance not linked in nav) | **A** | Elevate governance to nav + Home section; keep proof as-is |
| 4 | **AuditOS** | Confirm problem-first + accuracy of "Available to deploy" | **A/B** | Validate maturity claim; ensure problem precedes capabilities |
| 5 | **LocalContentOS** | Same template checks | **A/B** | Validate scope claim; problem-first ordering |
| 6 | **Contact / CTA flow** | Label/intent mismatch; weak funnel | **A** | Rename to diagnostic; make contact a true diagnostic-booking page |
| 7 | **About** | System sprawl (6–7) undermines one-platform story | **B** | Reconcile to canonical system set |
| 8 | **System-set consistency** (`public-status.ts`, About, Home) | No canonical list across pages | **A** | Define one source-of-truth system list; render everywhere from it |
| 9 | **EN parity** | Missing proof/buyer pages in EN | **B** | Port case-studies/buyers/insights or hide AR-only links for EN visitors |
| 10 | Insights / secondary | Lower commercial weight | — | Leave until core is fixed |

---

## 6. High-Risk / Outdated Messaging to Address First

1. **Positioning risk (highest):** Home hero "One platform for audit, decisions, and local content" + "trial balance → sign-off-ready file" reads as a **workflow SaaS / product-suite**, not the **Governed Institutional Intelligence** category. This is the single biggest deviation from strategy — fix the Home top-third first.
2. **Credibility inconsistency:** Home heading **"Three solutions"** while rendering **five** system cards (AR and EN). Visible factual mismatch on the most-trafficked page.
3. **Weak CTA architecture:** generic **"Book a call"** as the sitewide primary, plus three competing hero CTAs — dilutes the enterprise conversion the strategy centers on.
4. **Governance hidden:** the platform's core differentiator is **absent from the primary nav**.
5. **Borderline maturity claims to verify:** "Available to deploy" (AuditOS) / "Integrated into platform" (DecisionOS) — confirm accurate or soften.
6. **System sprawl:** 5→7 systems across Home/About/Platform with no canonical list reinforces a house-of-products perception.

**Not a problem (explicitly cleared):** No false compliance claims — SOC2/ISO are honestly framed as roadmap; demos are labeled sample-data; **no internal status language (L4/L5/pilot-ready/TRL) on public pages**; generic-AI language is used as a contrast device, not self-description. On the honesty axis, this site is already in good shape — the work is **framing, CTA, nav, and consistency**, not a claims cleanup.

---

### Missing-but-should-exist (per strategy)
- **Governance in primary nav** — content exists, entry point does not.
- **Home governance/evidence section** — page has none.
- **A single canonical "Book a Diagnostic Session" conversion** — currently fragmented across call/demo/contact.
- (Optional) EN equivalents of AR-only proof/buyer pages.

*— End of audit —*
