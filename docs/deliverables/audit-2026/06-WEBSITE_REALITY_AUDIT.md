# WEBSITE REALITY AUDIT — AQLIYA
**Date:** 2026-06-20  
**Scope:** `src/app/`, `public/`, `messages/`, `i18n/` vs documented identity, taxonomy, and route strategy

---

## 1. Route Groups Overview

| Group | Files | Type | Auth Required |
|-------|-------|------|---------------|
| `(marketing)/` | 42 | Public marketing pages | No |
| `(dashboard)/` | 79 | Authenticated workspace | Yes |
| `audit/` | 72 | AuditOS workspace | Yes |
| `sales/` | 82 | SalesOS workspace | Yes |
| `local-content/` | 46 | LocalContentOS workspace | Yes |
| `decisions/` (in dashboard) | ~30 | DecisionOS | Yes |
| `auditos/` | 11 | Public demo | No |
| `en/` | 10 | English marketing | No |
| `workflowos/` | 11 | WorkflowOS | Yes |
| `contacts/` | 13 | LocalContactOS | Yes |
| `settings/` | 14 | Platform settings | Yes |

## 2. Marketing Claims vs Reality

| Claim (from marketing page) | Reality | Status |
|-----------------------------|---------|--------|
| "Private Governed Institutional Intelligence Platform" | ✅ Match — identity consistent | ✅ |
| "Multi-product ecosystem" | ✅ 9 products in codebase | ✅ |
| "AuditOS — Financial Audit Intelligence" | ✅ Full AuditOS L5 workflow | ✅ |
| "LocalContentOS — Local Content Management" | ✅ L5 workflow complete | ✅ |
| "DecisionOS — Decision Governance" | ✅ DecisionOS workflow | ✅ |
| "SalesOS — Governed Revenue Intelligence" | ⚠️ Labeled prototype | ⚠️ Overstated |
| "Office AI Assistant" | ✅ Workspace with tasks | ✅ |
| "On-Prem deployment" | ⚠️ Design only, not implemented | ⚠️ Overstated |
| "Air-Gapped deployment" | ⚠️ Not implemented | ⚠️ Overstated |
| "Local AI runtime" | ⚠️ Config exists, not production | ⚠️ Overstated |
| "Kubernetes deployment" | ❌ Not implemented | ❌ Claimed |
| "SOC2 certified" | ⚠️ Roadmap only, not certified | ⚠️ Overstated |

## 3. Broken Paths / Missing Pages

| Current Path | Status | Expected | Notes |
|-------------|--------|----------|-------|
| `/auditos` | ✅ Working | Public demo | Protected from real data |
| `/products/audit` | ✅ Working | AuditOS product page | — |
| `/products/local-content` | ✅ Working | LC product page | — |
| `/products/decision` | ✅ Working | DecisionOS product page | — |
| `/products/sales` | ⚠️ Exists | SalesOS marketing | Matches status |
| `/products/office-ai` | ✅ Working | Office AI product page | — |
| `/products/simulation` | ⚠️ Exists | SimulationOS | May not match taxonomy |
| `/buyers/*` | ✅ Working | Buyer personas | 4 buyer pages |
| `/insights/*` | ✅ 3 articles | Blog/insights | — |
| `/en/` | ✅ English mirror | English marketing | Partial coverage |
| `/proof-library/` | ⚠️ Exists | Empty/skeleton | **BROKEN CTA** |
| `/deployment/` | ⚠️ Exists | Deployment page | May overclaim |

## 4. Broken CTAs

| CTA Location | Target | Status | Issue |
|-------------|--------|--------|-------|
| "Start Free Trial" (marketing) | `/signup` | ✅ Working | — |
| "Book a Demo" (marketing) | External Calendly | ⚠️ No env var set | Falls back to placeholder |
| "View Demo" (AuditOS page) | `/auditos` | ✅ Working | — |
| "See Proof" (marketing) | `/proof-library` | ⚠️ Empty page | **BROKEN** |
| "Download Procurement Pack" | `/procurement-pack` | ✅ Working | PDF available |
| "View Case Studies" | `/case-studies` | ⚠️ May be empty | Check for content |
| "Contact Sales" | `/contact` | ✅ Working | — |
| "Get Started" (products) | `/signup` | ✅ Working | — |

## 5. SEO Issues

| Issue | Detail | Severity |
|-------|--------|----------|
| Arabic canonical URLs | Need verification | MEDIUM |
| Missing meta descriptions | Check product pages | LOW |
| `sitemap.xml` | ✅ Present at `/sitemap.xml` | ✅ |
| `robots.txt` | ✅ Present at `/robots.txt` | ✅ |
| Page load performance | Not measured in this audit | — |
| Duplicate content risk | `/en/` mirror copies English content | MEDIUM |

## 6. Arabic UX Issues

| Area | Observation | Status |
|------|-------------|--------|
| Primary language | Arabic-first ✅ | Consistent |
| RTL layout | ✅ `dir="rtl"` in layout | ✅ |
| English pages | `/en/` route group | ✅ Separate |
| Mixed direction | Tables reviewed | ✅ Handled |
| Arabic financial terms | Glossary exists | ✅ |
| Arabic product names | Used consistently | ✅ |

## 7. English Issues

| Area | Observation | Status |
|------|-------------|--------|
| English pages | `/en/` has 10 pages | ⚠️ Partial coverage |
| Product pages | Not all translated | MEDIUM gap |
| Blog/insights | English content present | ✅ |
| Technical docs | Mostly English | ✅ Intentional |

## 8. Trust Gaps

| Gap | Detail | Severity |
|-----|--------|----------|
| "On-Prem" claim | Design only, not implemented | HIGH |
| "Air-Gapped" claim | Not implemented | HIGH |
| "SOC2" claim | Roadmap only, not certified | HIGH |
| "Kubernetes" claim | Not in infra/ | MEDIUM |
| "Local AI" claim | Config exists, not validated | MEDIUM |
| Demo data safety | `/auditos` uses mock data | ✅ Protected |

## 9. Conversion Gaps

| Gap | Detail | Impact |
|-----|--------|--------|
| No live demo environment | `/auditos` is guided, not interactive | MEDIUM |
| No self-service onboarding | `/signup` → manual process | MEDIUM |
| No pricing page | Custom only | LOW (B2B) |
| Booking CTA not configured | `NEXT_PUBLIC_BOOKING_URL` env not set | HIGH |
| Proof library empty | `/proof-library` has no content | HIGH |

## 10. Recommendations

1. **Fix commercial claims** — Audit marketing pages for On-Prem, Air-Gapped, SOC2, Kubernetes claims
2. **Fill proof library** — Publish at least 3 case studies or remove the route
3. **Configure booking CTA** — Set `NEXT_PUBLIC_BOOKING_URL` in production
4. **Complete English marketing** — Audit `/en/` coverage gaps
5. **SEO audit** — Run Lighthouse/Plausible for performance metrics
6. **Product page alignment** — Ensure all product pages match current L-levels
7. **Deployment page compliance** — Remove or correct unsubstantiated claims
