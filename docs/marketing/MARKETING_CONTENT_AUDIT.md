# AQLIYA Marketing Content Audit

**Date:** 2026-06-23  
**Program:** Marketing Repositioning  
**Scope:** Public marketing routes — vision vs proof layers

---

## Executive Summary

The site had strong platform-first homepage architecture but leaked **engineering maturity language** on `/products`, `/about`, system detail pages, and English routes. This audit documents **before** state and **recommended/implemented** rewrites per page.

**Layer model:**
- **Vision layer** — outcomes, capability, institutional value (no L-levels, no build status)
- **Proof layer** — operational evaluation, diagnostic sessions, evidence packages

---

## Homepage `/`

| Field | Detail |
|-------|--------|
| **Current message (before)** | Platform-first hero; problem/tools section; operating chain; principles; industries; use cases; journey with "Pilot" and Go/No-Go; proof cards with "placeholder" |
| **Hidden internal language** | Pilot, Go/No-Go, placeholder, "اعرف المزيد" |
| **Customer interpretation** | Mixed: strong institutional framing but proof section signals unfinished product |
| **Recommended rewrite** | Add business outcomes section before architecture; replace Pilot journey step with "تقييم تشغيلي"; outcome-focused CTAs |
| **Status** | ✅ Implemented |

---

## Platform `/platform`

| Field | Detail |
|-------|--------|
| **Current message (before)** | Intelligence Core components; OS cards with جاهز للبايلوت / نشط / بايلوت منسّق; Private "قيد التطوير" |
| **Hidden internal language** | pilot-ready, active status enums, build-state deployment labels |
| **Customer interpretation** | "Which modules are done?" not "What can I run?" |
| **Recommended rewrite** | Use `publicOsStatus` vision labels; deployment as capability options; roadmap link without "غير متاح للبايلوت" |
| **Status** | ✅ Implemented |

---

## About `/about`

| Field | Detail |
|-------|--------|
| **Current message (before)** | Strong vision narrative; systems list with جاهز للبايلوت / نشط / قيد التطوير; "أنظمة نشطة" section |
| **Hidden internal language** | Pilot, active, development status, implementation planning disclaimers |
| **Customer interpretation** | Software project status board |
| **Recommended rewrite** | Operating systems + platform roadmap; philosophy and methodology only |
| **Status** | ✅ Implemented |

---

## Products `/products` (Systems)

| Field | Detail |
|-------|--------|
| **Current message (before)** | "عائلة المنتجات"; 3 أنظمة نشطة; proof notes like "نشط في الإنتاج"; tier-2 "قيد التطوير" |
| **Hidden internal language** | Product family, active count, engineering proof notes, pilot scope |
| **Customer interpretation** | Product catalog with release tags |
| **Recommended rewrite** | "أنظمة التشغيل"; capability notes; sector tags; roadmap tier without purchase blocks |
| **Status** | ✅ Implemented |

---

## Governance `/governance`

| Field | Detail |
|-------|--------|
| **Current message** | Trust architecture, human gates, evidence — already vision-aligned |
| **Hidden internal language** | Minimal (HTML placeholder attributes only) |
| **Customer interpretation** | Enterprise governance credibility |
| **Recommended rewrite** | No change required |
| **Status** | ✅ Compliant |

---

## Deployment `/deployment`

| Field | Detail |
|-------|--------|
| **Current message** | Cloud / Private / Air-Gapped with honest availability |
| **Layer** | Proof layer — appropriate for evaluation honesty |
| **Recommended rewrite** | Keep factual deployment options; avoid "غير متاح كمنتج" in vision cross-links |
| **Status** | Proof layer — acceptable |

---

## Proof Library `/proof-library`

| Field | Detail |
|-------|--------|
| **Current message** | Sample outputs per system; some "قيد التطوير" on PDF Arabic |
| **Layer** | Proof |
| **Recommended rewrite** | Operational evaluation framing; technical export notes OK in proof |
| **Status** | Partial — proof-layer technical notes retained |

---

## Pilot Proof `/pilot-proof`

| Field | Detail |
|-------|--------|
| **Current message** | Evaluation criteria, Go/No-Go framework |
| **Layer** | Proof — pilot/evaluation language appropriate here |
| **Recommended rewrite** | Rename user-facing labels to "تقييم تشغيلي" where visible from vision links |
| **Status** | Linked from proof center with updated labels |

---

## Executive Brief `/executive-brief`

| Field | Detail |
|-------|--------|
| **Current message (before)** | Strong structure; system cards with جاهز للبايلوت / نشط / قيد التطوير |
| **Hidden internal language** | Product roles, pilot-ready, planning status |
| **Customer interpretation** | Executive deck mixed with engineering status |
| **Recommended rewrite** | Capability notes + vision status labels; deployment as options |
| **Status** | ✅ Implemented |

---

## Use Cases `/use-cases`

| Field | Detail |
|-------|--------|
| **Current message** | Use-case oriented — largely compliant |
| **Recommended rewrite** | Align CTAs to diagnostic / proof package |
| **Status** | Review recommended (low priority) |

---

## Buyers `/buyers`

| Field | Detail |
|-------|--------|
| **Current message (before)** | Pilot-ready security note; pilot models |
| **Layer** | Proof |
| **Recommended rewrite** | Operational evaluation + institutional activation language |
| **Status** | ✅ Partial (Pilot-ready removed) |

---

## Case Studies `/case-studies`

| Field | Detail |
|-------|--------|
| **Current message (before)** | Good scenarios; placeholder reference slot; pilot notes |
| **Hidden internal language** | placeholder, pilot reference, "قيد الإعداد" |
| **Customer interpretation** | Demo scenarios + empty customer proof |
| **Recommended rewrite** | Professional anonymized scenarios; compliance case; remove placeholder block |
| **Status** | ✅ Implemented |

---

## Contact `/contact`

| Field | Detail |
|-------|--------|
| **Current message** | Diagnostic + pilot request flow |
| **Layer** | Proof / conversion |
| **Recommended rewrite** | "تقييم تشغيلي" in proof context; product → system in copy |
| **Status** | Partial — proof-layer pilot terms acceptable |

---

## Industries `/industries`

| Field | Detail |
|-------|--------|
| **Current message (before)** | Sector challenges + platform value |
| **Recommended rewrite** | Add outcomes + systems per sector; compliance sector |
| **Status** | ✅ Implemented |

---

## English `/en/*`

| Field | Detail |
|-------|--------|
| **Current message (before)** | Product-heavy nav; Pilot-ready / Active tags on homepage |
| **Recommended rewrite** | Match Arabic platform-first nav; outcomes section |
| **Status** | ✅ Homepage + header implemented |

---

## Compliance Target

Vision-layer pages must not contain: L4–L6, pilot-ready, conditional, prototype, placeholder, قيد التطوير (as status), جاهز للبايلوت.

See `PUBLIC_LANGUAGE_COMPLIANCE_REPORT.md` for verification.
