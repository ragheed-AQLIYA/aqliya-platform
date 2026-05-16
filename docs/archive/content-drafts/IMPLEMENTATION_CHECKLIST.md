# AQLIYA Website Content Rewrite
## Implementation Checklist v2

**Version:** Final Merged Rewrite  
**Status:** Ready for implementation  
**Date:** 2026-05-16

---

## PHASE 1: Copy Safety Pass

### Global Changes
- [ ] Update homepage hero headline (English + Arabic)
- [ ] Update platform one-liner (both languages)
- [ ] Verify trust principle is present on all marketing surfaces
- [ ] Review all product status badges for v1.1 alignment

### Product Status Badges
- [ ] AuditOS: "أول تطبيق مُثبت — جاهز للتجربة" / "First proof product — pilot-ready"
- [ ] LocalContentOS: "استراتيجي — المنتج الثاني — قيد التخطيط" / "Strategic second product — in planning"
- [ ] DecisionOS: Change to "نظام مجاور — نشط" / "Adjacent active system"
- [ ] SalesOS: Soften language to future/conditional, verify no backend claims
- [ ] SimulationOS: Update badge to "مفهوم — مستقبلي" / "Marketing concept — future"

### Deployment Language
- [ ] Cloud: "متاح الآن" / "Available now"
- [ ] Private/On-Prem: "قيد التخطيط والتحضير" / "Strategic future — not yet available"
- [ ] Air-Gapped: "مستقبلي" / "Strategic/future — not yet implemented"
- [ ] Remove any Docker/Kubernetes availability claims
- [ ] Remove any "Local AI" claims

### Footer Updates
- [ ] Deployment model wording alignment
- [ ] Brand description refinement
- [ ] Group titles polished

### Sidebar/Navigation Polish
- [ ] Sidebar subtitle: Replace "Mind The Future" with "منصة ذكاء مؤسسي خاص ومحكوم"
- [ ] Navigation label: "كيف نعمل" → "منهجية العمل"
- [ ] Verify RTL formatting for Arabic text

---

## PHASE 2: Content Polish Pass

### Homepage Updates
- [ ] Hero section: Complete rewrite with impact metrics
- [ ] Deployment cards: Update with new language
- [ ] Product cards: Status badge alignment
- [ ] CTAs: Standardize across all surfaces

### Product Pages (`/products`)
- [ ] Products page hero
- [ ] Individual product page badges and descriptions:
  - AuditOS page: Strongest messaging, full demo content
  - LocalContentOS page: Clear planning disclaimer
  - DecisionOS page: Adjacent system positioning
  - SalesOS page: Prototype/future disclaimer
  - SimulationOS page: Concept/not-in-dev disclaimer

### About Page (`/about`)
- [ ] Operating Beliefs label alignment
- [ ] System lines status badges
- [ ] Differentiators review

### Contact Page (`/contact`)
- [ ] Eyebrow label: "Engagement Start" → "بداية التشغيل"

### Static Pages
- [ ] 404 page: Minor language polish
- [ ] Access Denied page: Description shortened

---

## PHASE 3: QA & Validation

### Copy Safety Checklist
- [ ] ✓ No unsupported capabilities claimed
- [ ] ✓ AQLIYA not reduced to AuditOS
- [ ] ✓ AuditOS remains first proof product
- [ ] ✓ LocalContentOS remains second strategic product
- [ ] ✓ DecisionOS aligned with v1.1 taxonomy
- [ ] ✓ Arabic-first copy polished
- [ ] ✓ CTAs consistent
- [ ] ✓ Navigation aligned
- [ ] ✓ Footer aligned
- [ ] ✓ Metadata verified

### Technical Validation
- [ ] Run TypeScript check: `npx tsc --noEmit`
- [ ] Run linter: `npm run lint`
- [ ] Build: `npm run build`
- [ ] Verify no build errors
- [ ] Test Arabic RTL rendering in Chrome, Safari, Firefox
- [ ] Test English LTR rendering consistency

### Content Verification
- [ ] All product cards have correct status badges
- [ ] No future capabilities marked as available
- [ ] No Private/On-Prem marked as production-ready
- [ ] Trust principle visible on:
  - [ ] Homepage hero
  - [ ] Products page
  - [ ] AuditOS page
  - [ ] About page

### Metadata Check
- [ ] Homepage title: `AQLIYA | منصة ذكاء مؤسسي خاص ومحكوم`
- [ ] Homepage description updated
- [ ] OpenGraph tags aligned
- [ ] All page titles match v1.1 positioning

---

## PHASE 4: Staging & Review

### Pre-Launch Testing
- [ ] QA sign-off: Copy accuracy
- [ ] QA sign-off: RTL/LTR formatting
- [ ] QA sign-off: Link integrity
- [ ] Design review: Visual alignment
- [ ] Legal/Compliance: No unsupported claims

### Stakeholder Review
- [ ] Product leadership: Product positioning accuracy
- [ ] Marketing: Copy tone and clarity
- [ ] Legal: Claims compliance
- [ ] Engineering: Technical implementation quality

### Deployment Plan
- [ ] Staging deployment complete
- [ ] Production deployment window scheduled
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured

---

## CONSTRAINTS: MUST NOT VIOLATE

### Never Claim As Available
- [ ] ✗ Private/On-Prem as production package
- [ ] ✗ Air-Gapped as implemented
- [ ] ✗ Local AI runtime
- [ ] ✗ AQLIYA Studio as available
- [ ] ✗ Institutional Memory
- [ ] ✗ Model Governance
- [ ] ✗ Docker/Kubernetes deployment

### Always Maintain
- [ ] ✓ Platform-first positioning
- [ ] ✓ Governance-first language
- [ ] ✓ AuditOS as proof product
- [ ] ✓ LocalContentOS as second strategic product
- [ ] ✓ DecisionOS as adjacent active system
- [ ] ✓ Trust principle baked in
- [ ] ✓ Arabic-first copy

---

## File Changes Required

| Source File | Changes | Priority |
|---|---|---|
| `src/app/(marketing)/page.tsx` | Hero, metrics, deployment, product cards, CTAs | **HIGH** |
| `src/app/(marketing)/products/page.tsx` | Product descriptions, status badges | **HIGH** |
| `src/app/(marketing)/products/decision/page.tsx` | Badge alignment, output labels | **HIGH** |
| `src/app/(marketing)/products/sales/page.tsx` | Future-conditional language | **MEDIUM** |
| `src/app/(marketing)/products/simulation/page.tsx` | Status badge, disclaimer | **MEDIUM** |
| `src/app/(marketing)/about/page.tsx` | Operating beliefs, badges, differentiators | **MEDIUM** |
| `src/app/(marketing)/contact/page.tsx` | Eyebrow label translation | **LOW** |
| `src/app/not-found.tsx` | Minor polish | **LOW** |
| `src/app/access-denied/page.tsx` | Description, CTA | **LOW** |
| `src/components/layout/site-header.tsx` | Nav label update | **LOW** |
| `src/components/layout/site-footer.tsx` | Deployment labels, descriptions | **MEDIUM** |
| `src/components/platform/platform-sidebar.tsx` | Subtitle replacement, footer label | **HIGH** |
| `src/app/layout.tsx` | Metadata verification only | **LOW** |

---

## Success Criteria

- [ ] All product pages load without errors
- [ ] No console warnings related to missing copy
- [ ] Arabic text renders RTL correctly on all pages
- [ ] English text renders LTR correctly
- [ ] All CTAs route to correct pages
- [ ] No unsupported capability claims present
- [ ] Trust principle visible on key marketing surfaces
- [ ] Product status badges match v1.1 taxonomy
- [ ] Build passes all tests and linting

---

## Sign-Off

**Approved by:** ___________________  
**Date:** ___________________  
**Ready for Deployment:** ☐ Yes ☐ No

---

*For questions or changes, refer to the source document: AQLIYA_Website_Content_Rewrite.docx*
