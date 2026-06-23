# AQLIYA Marketing Terminology System

**Version:** 1.0  
**Status:** Official — public-facing website copy only  
**Scope:** Marketing routes, labels, navigation, CTAs, and customer-facing copy  
**Does NOT apply to:** `PRODUCT_STATUS_MATRIX.md`, `READINESS_GATES.md`, roadmap, architecture, or internal engineering docs

---

## Core Principle

Internal reality and public positioning are **different layers**.

- **Internal docs** describe implementation state, maturity, gates, and engineering truth.
- **Public website** describes institutional value, outcomes, capability, and business impact.

---

## Forbidden Public Terms

Never appear on **vision-layer** pages (homepage, platform, about, `/products/*`, industries, governance, use-cases):

| Forbidden | Reason |
|-----------|--------|
| L0–L6 | Internal maturity model |
| pilot-ready, pilot candidate | Engineering readiness |
| conditional, usable v0.1 | Release classification |
| active system, prototype, shell | Implementation state |
| under development, roadmap status | Build status |
| internal preview, placeholder | Engineering honesty markers |
| قيد التطوير, جاهز للبايلوت, نشط (as status) | Arabic equivalents of build state |

**Proof-layer** pages (`/proof`, `/pilot-proof`, `/pilot-outcomes`, `/buyers`, `/engagement-models`, `/procurement-pack`, `/deployment`) may describe **operational evaluation** and **institution activation** processes — but still avoid L-levels and engineering jargon.

---

## Approved Vocabulary

| Avoid | Use (Arabic) | Use (English) |
|-------|--------------|---------------|
| Product / Products | نظام تشغيل / أنظمة التشغيل | Operating system / Operating systems |
| Product family | أنظمة التشغيل على المنصة | Operating systems on the platform |
| Pilot | تقييم تشغيلي | Operational evaluation |
| Conditional / coordinated pilot | نطاق تفعيل مؤسسي | Institution activation scope |
| Active | متكامل في المنصة | Integrated into the platform |
| Under development | في خارطة المنصة | On the platform roadmap |
| Shared application | قدرة مشتركة | Shared capability |
| Ready for pilot | جاهز للتفعيل المؤسسي | Ready for institutional activation |
| Go/No-Go | قرار بالأدلة | Evidence-based decision |
| Learn more | استكشف حالات الاستخدام / راجع حزمة الإثبات | Explore use cases / Review proof package |

---

## Layer Model

### Vision Layer

**What AQLIYA is and what outcomes it delivers.**

Routes: `/`, `/platform`, `/about`, `/products/*`, `/industries`, `/governance`, `/use-cases`, `/case-studies`, `/custom-product`, `/how-we-work`

Language: problems, outcomes, institutional capability, governance philosophy.

### Proof Layer

**How value is validated before full commitment.**

Routes: `/proof`, `/demo`, `/pilot-proof`, `/pilot-outcomes`, `/proof-library`, `/executive-brief`, `/buyers/*`, `/engagement-models`, `/procurement-pack`, `/deployment`, `/security`, `/contact`

Language: operational evaluation, diagnostic session, proof package, activation scope.

---

## CTA Standards

| Context | Arabic CTA | English CTA |
|---------|------------|---------------|
| Primary conversion | احجز جلسة تشخيص | Book diagnostic session |
| Enterprise buyer | ناقش التفعيل المؤسسي | Discuss institutional activation |
| Executive | اطلب الملخص التنفيذي | Request executive briefing |
| Evaluation | راجع حزمة الإثبات | Review proof package |
| Exploration | استكشف حالات الاستخدام | Explore use cases |

Avoid: اعرف المزيد، اقرأ المزيد، انقر هنا (without context).

---

## System Naming (Public)

| System | Arabic subtitle | Positioning |
|--------|-----------------|-------------|
| AuditOS | نظام التدقيق والذكاء المالي | Institutional audit operating system |
| DecisionOS | نظام حوكمة القرارات | Governed decision operating system |
| LocalContentOS | نظام المحتوى المحلي والامتثال | Local content & compliance operating system |
| SalesOS | نظام الذاكرة التجارية | Commercial intelligence operating system (roadmap) |
| Office AI Assistant | المساعد المؤسسي المحكوم | Shared capability — not standalone system |

---

## Identity Lines

| Context | Arabic | English |
|---------|--------|---------|
| Full identity | منصة ذكاء مؤسسي خاص ومحكوم | Private Governed Institutional Intelligence Platform |
| Hero shorthand | منصة تشغيل مؤسسية | Institutional operating platform |
| Trust principle | الذكاء يساعد. الإنسان يقرر. الدليل يحكم. | AI assists. Humans decide. Evidence governs. |

---

## Compliance Check (Before Publish)

Every public sentence must answer: **"Why does the customer care?"**

- Prefer outcomes over features.
- Prefer sectors and use cases over architecture.
- Never expose engineering maturity on vision-layer pages.
- Never claim capabilities that do not exist (On-Prem/Air-Gapped as live products, Local AI runtime, etc.) — present as deployment options in `/deployment` only.
