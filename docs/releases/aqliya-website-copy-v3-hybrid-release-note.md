# AQLIYA Website Copy v3 Hybrid — Release Note

## 1. Release Status

**Status:** Complete / Ready for Publish

---

## 2. Scope

- Implemented approved website copy v3 hybrid across all public-facing surfaces
- Polished CTA labels after visual QA pass
- Removed all legacy `Mind The Future` references from source code
- Aligned all product statuses with AQLIYA v1.1 official taxonomy
- Ensured no unsupported deployment, compliance, or capability claims

---

## 3. Commits Included

| Commit    | Purpose                                  | Scope           |
| --------- | ---------------------------------------- | --------------- |
| `9d6c5ff` | Implement Website Copy v3 Hybrid         | 13 source files |
| `18b54e4` | Polish CTA labels after Visual QA        | 3 source files  |
| `ac19a8d` | Remove legacy Mind The Future references | 3 source files  |

---

## 4. Final Website State

| Aspect                          | Status                                                                    |
| ------------------------------- | ------------------------------------------------------------------------- |
| **Platform identity**           | AQLIYA positioned as Private Governed Institutional Intelligence Platform |
| **AuditOS**                     | First proof product — pilot-ready, strongest marketed product             |
| **LocalContentOS**              | Second strategic product — in planning                                    |
| **DecisionOS**                  | Adjacent active system — badge: `نظام مجاور — نشط`                        |
| **SalesOS**                     | Prototype/future — no backend claims                                      |
| **SimulationOS**                | Concept/future — marketing page only                                      |
| **Cloud deployment**            | Available now                                                             |
| **Private / On-Prem**           | Strategic/future — not production-ready                                   |
| **Air-Gapped**                  | Strategic/future — not implemented                                        |
| **`Mind The Future` in `src/`** | **0 occurrences** — fully removed                                         |

---

## 5. Claims Safety

| Claim                                           | Status         |
| ----------------------------------------------- | -------------- |
| Docker / Kubernetes availability                | ❌ Removed     |
| On-Prem as production package                   | ❌ Not claimed |
| Air-Gapped implemented                          | ❌ Not claimed |
| Local AI runtime available                      | ❌ Not claimed |
| AQLIYA Studio available                         | ❌ Not claimed |
| Unsupported performance metrics                 | ❌ Not present |
| KYC / AML / SAMA / PDPL claims                  | ❌ Not present |
| Active development language for future products | ❌ Removed     |

---

## 6. Validation

| Tool               | Result                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------- |
| `npx tsc --noEmit` | ✅ Passed — 0 errors                                                                    |
| `npm run lint`     | ✅ Passed — 0 errors (128 pre-existing warnings, all in DecisionOS/shared library code) |
| `npm run build`    | ✅ Succeeded                                                                            |

---

## 7. Files / Surfaces Affected

| Surface / File                                                 | Scope of Change                                                                                        |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Homepage (`(marketing)/page.tsx`)                              | Hero support line, new sections, deployment cards, product data, trust principle, CTAs, impact metrics |
| Products page (`(marketing)/products/page.tsx`)                | Status badges, SalesOS wording, CTA labels                                                             |
| AuditOS page (`(marketing)/products/audit/page.tsx`)           | CTA labels                                                                                             |
| DecisionOS page (`(marketing)/products/decision/page.tsx`)     | Status badge `متاح للتفعيل` → `نظام مجاور — نشط`                                                       |
| SalesOS page (`(marketing)/products/sales/page.tsx`)           | Body softened to explore/conditional tense                                                             |
| SimulationOS page (`(marketing)/products/simulation/page.tsx`) | Badge `مستقبلي — تسويقي` → `مفهوم — مستقبلي`                                                           |
| About page (`(marketing)/about/page.tsx`)                      | Opening story, label `مبادئ التشغيل`                                                                   |
| Contact form (`(marketing)/contact/contact-form.tsx`)          | Eyebrow `بداية التشغيل`                                                                                |
| Login page                                                     | Description shortened                                                                                  |
| Not found page                                                 | Body text polish                                                                                       |
| Access denied page                                             | Description + CTA label                                                                                |
| Header (`components/layout/site-header.tsx`)                   | Nav label `منهجية العمل`                                                                               |
| Footer (`components/layout/site-footer.tsx`)                   | Brand description, deployment labels, group title, link labels                                         |
| Platform sidebar (`components/platform/platform-sidebar.tsx`)  | Subtitle, aria-label, footer area                                                                      |
| JSON-LD (`components/platform/json-ld.tsx`)                    | Slogan `منصة ذكاء مؤسسي خاص ومحكوم`                                                                    |
| Audit sidebar (`components/audit/layout/audit-sidebar.tsx`)    | Aria-label + image alt                                                                                 |
| Legacy header (`components/layout/header.tsx`)                 | Aria-label + image alt                                                                                 |

---

## 8. Release Decision

The AQLIYA public website messaging is ready for publish.

All public-facing copy has been aligned with:

- AQLIYA v1.1 official vision and taxonomy
- Trust principle: `الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.`
- Platform-first, governance-first, Arabic-first positioning
- Strict claims safety discipline

---

## 9. Next Recommended Step

1. **Deploy** the current `main` branch to production
2. **Run a post-deploy smoke test** on all 15 public surfaces:
   - Verify all pages render
   - Verify all CTAs route correctly
   - Verify RTL alignment on all pages
   - Verify no console errors
3. **Optional:** Archive old content files or create a content governance checklist to prevent positioning drift in future commits
