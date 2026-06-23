# AQLIYA Marketing Terminology System

**Version:** 1.1 (R6.5 — aligned with `VOICE_GUIDE.md`)  
**Status:** Official — internal terminology reference  
**Scope:** Marketing routes, labels, navigation, CTAs, and customer-facing copy  
**Does NOT apply to:** `PRODUCT_STATUS_MATRIX.md`, `READINESS_GATES.md`, roadmap, architecture, or internal engineering docs

**Customer copy authority:** For live website text, follow `docs/marketing/VOICE_GUIDE.md` and `src/lib/marketing/copy-*.ts`. This document defines **internal ↔ public mapping** — do not paste it verbatim into Hero or CTAs.

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

**Proof-layer** pages (`/proof`, `/demo`, `/procurement-pack`, `/deployment`, `/security`, `/contact`) may describe **trials on customer data** and **rollout** — but use plain language per `VOICE_GUIDE.md` (e.g. «تجربة على بياناتكم» not «تقييم تشغيلي»). Still avoid L-levels and engineering jargon.

---

## Approved Vocabulary

| Internal / legacy (avoid on site) | Customer-facing (AR) | Customer-facing (EN) |
|-----------------------------------|----------------------|----------------------|
| Product / Products | حل / حلول عقلية | Solution / AQLIYA solutions |
| Pilot / operational evaluation | تجربة على بياناتكم | Trial on your data |
| Diagnostic session | مكالمة تعريفية | Intro call |
| Institution activation | تشغيل / البدء في التطبيق | Rollout / go live |
| Ready for institutional activation | متاح للتطبيق | Available to deploy |
| Integrated (system) | متكامل في المنصة | Integrated into platform |
| On platform roadmap | قريباً على خارطة المنصة | Coming on platform roadmap |
| Shared capability | خدمة مشتركة | Shared service |
| Evidence-based decision | تقرير بعد النتائج | Report after you see results |
| Go/No-Go | قراركم بعد التجربة | Your decision after the trial |
| Learn more | استكشف الأمثلة / راجع الإثبات | Explore examples / Review proof |

---

## Layer Model

### Vision Layer

**What AQLIYA is and what outcomes it delivers.**

Routes: `/`, `/platform`, `/about`, `/products/*`, `/industries`, `/governance`, `/use-cases`, `/start`, `/case-studies`, `/custom-product`, `/how-we-work`

Language: problems, outcomes, institutional capability, governance philosophy.

### Proof Layer

**How value is validated before full commitment.**

Routes: `/proof`, `/demo`, `/pilot-proof`, `/pilot-outcomes`, `/proof-library`, `/executive-brief`, `/buyers/*`, `/engagement-models`, `/procurement-pack`, `/deployment`, `/security`, `/contact`

Language: trials on customer data, intro calls, proof materials, rollout scope.

---

## CTA Standards

| Context | Arabic CTA | English CTA |
|---------|------------|---------------|
| Primary conversion | احجز مكالمة / تواصل معنا | Book a call / Talk to us |
| Demo | شاهد الديمو | Watch the demo |
| Proof | راجع الإثبات / مواد الإثبات | Review proof |
| Start | من أين تبدأ؟ | Where to start? |
| Executive | ملخص للقيادة | Leadership summary |

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
| Hero shorthand | منصة للمراجعة والقرار والامتثال | Platform for audit, decisions, and compliance |
| Trust principle | (Footer / `/governance` only — once) | (Footer / `/governance` only — once) |

---

## Compliance Check (Before Publish)

Every public sentence must answer: **"Why does the customer care?"**

- Prefer outcomes over features.
- Prefer sectors and use cases over architecture.
- Never expose engineering maturity on vision-layer pages.
- Never claim capabilities that do not exist (On-Prem/Air-Gapped as live products, Local AI runtime, etc.) — present as deployment options in `/deployment` only.
