# 08 — Competitive Positioning

**Date:** 2026-06-01  
**Scope:** Institutional sales / revenue intelligence — not generic SMB CRM

---

## Comparison Table

| Dimension | Salesforce | HubSpot | Twenty | Attio | Pipedrive | **SalesOS (AQLIYA)** |
|-----------|------------|---------|--------|-------|-----------|----------------------|
| Primary identity | Enterprise CRM | Inbound CRM + marketing | Open-source CRM | Relationship CRM | Pipeline CRM | **Governed revenue intelligence** |
| Governance / audit | Add-ons / complex | Light | Basic | Light | Minimal | **Core design requirement** |
| Evidence traceability | Via apps | Limited | Limited | Limited | None | **Evidence governs outputs** |
| AI positioning | Einstein | Copilot | Agents (emerging) | AI fields | AI sales assistant | **AI assists; human decides** |
| Arabic / RTL | Partial | Partial | No | No | Partial | **Arabic-first target** |
| Saudi institutional fit | Partners | Marketing | None | None | Generic | **LocalContent/Decision adjacency** |
| Private / on-prem story | Enterprise $$$ | Cloud | Self-host AGPL | Cloud | Cloud | **Platform private-ready direction** |
| Custom data model | Heavy config | Medium | Metadata engine | Flexible | Fixed pipeline | **Fixed governed schema** |
| Time to value | Months | Weeks | Days (self-host) | Days | Days | **Weeks (native build)** |
| License | Proprietary | Proprietary | AGPL + Enterprise | Proprietary | Proprietary | **Proprietary platform** |
| Cross-product intelligence | AppExchange | Hub ecosystem | Apps | API | Integrations | **AuditOS, DecisionOS, LocalContentOS** |
| Current AQLIYA status | N/A | N/A | Benchmark only | N/A | N/A | **L3 prototype — not operational** |

---

## What SalesOS IS

**English:**
> SalesOS under AQLIYA is governed revenue intelligence — institutional sales memory, qualification, pipeline visibility, and evidence-backed commercial outputs within a controlled platform where AI suggests and humans approve.

**Arabic:**
> SalesOS ضمن عقلية هو ذكاء إيرادات محكوم — ذاكرة تجارية مؤسسية، تأهيل، رؤية للمسار، ومخرجات تجارية مدعومة بأدلة داخل منصة مضبوطة حيث الذكاء الاصطناعي يقترح والإنسان يقرر.

### Core capabilities (target v0.3)

- Account and stakeholder registry with sensitivity levels
- Opportunity pipeline with governed stages
- Interaction log with audit trail
- AI drafts (forecast, proposal, next action) — never autonomous
- Commercial claim review before export
- Sales memory (institutional learning from wins/losses)
- Arabic-first workspace under `/sales`

---

## What SalesOS IS NOT

**English — do not claim:**
- A Salesforce/HubSpot replacement
- A generic CRM with email sync on day one
- An AI chatbot that closes deals
- A standalone SaaS (it's a product on AQLIYA Core)
- Operational / pilot-ready today (current: L3 prototype)
- Legal/compliance certification for commercial claims

**Arabic:**
> SalesOS ليس CRM عاماً، وليس بديلاً جاهزاً لـ Salesforce أو HubSpot، وليس شاتботاً يغلق الصفقات تلقائياً، وليس منتجاً تشغيلياً جاهزاً للعميل اليوم — إنه سطح نموذجي قيد البناء ضمن منصة عقلية المحكومة.

---

## Positioning vs Twenty Specifically

| | Twenty | SalesOS |
|---|--------|---------|
| Buyer | Teams wanting open CRM | Institutions wanting governed commercial intelligence |
| Wedge | Price + self-host + UX | Trust + evidence + Arabic institutional workflows |
| Build vs buy | Use Twenty | **Build native** (see 06-integration-decision.md) |
| When Twenty wins | Need CRM in days, English team, minimal governance | — |
| When SalesOS wins | Saudi institution, cross-product platform, audit/evidence requirements | — |

---

## Market Message Pillars

1. **Memory, not just pipeline** — institutional learning persists
2. **Governance, not just velocity** — commercial claims reviewed
3. **Platform, not point tool** — links to DecisionOS, LocalContentOS, AuditOS
4. **Arabic institutional UX** — not translated CRM
5. **Honest maturity** — prototype today; v0.3 path documented

---

## Website / Demo Discipline

Current marketing (`/products/sales`) correctly states **قيد التطوير**. Maintain until L4 validated.

**Do not demo** `/sales` dashboard to external customers as operational (per `docs/systems/salesos/README.md`).

---

## Validation

Positioning document only. Commercial claims must match `PRODUCT_STATUS_MATRIX.md` at release time.
