# 06 — Integration Decision: SalesOS vs Twenty

**Date:** 2026-06-01  
**Disclaimer:** Engineering/licensing risk assessment only — not legal advice.

---

## Options Evaluated

### Option A — Build native SalesOS on AQLIYA Core (recommended)

Build governed revenue intelligence using Prisma + Server Actions + existing governance engines. Twenty as **UX/architecture benchmark only**.

| Pros | Cons |
|------|------|
| Full alignment with trust principle | Longer initial build |
| No license contagion | Must build pipeline UX from scratch |
| Reuses LocalContentOS patterns | No email/calendar sync day one |
| Arabic-first, institutional positioning | |
| Cross-product links (DecisionOS, AuditOS) | |

**Engineering risk:** Low  
**License risk:** None

---

### Option B — Self-host Twenty alongside AQLIYA (sidecar CRM)

Run Twenty as separate service; sync via webhooks/API.

| Pros | Cons |
|------|------|
| Fast CRM features | Two systems, two auth models |
| Email/calendar out of box | AGPL source availability if modified |
| | No native governance/evidence graph |
| | Arabic/RTL gap |
| | Institutional buyers see "attached CRM" not SalesOS |
| | Ops burden (second DB, upgrades) |

**Engineering risk:** Medium-High  
**License risk:** Medium — AGPL obligations if Twenty code modified and offered as network service; sidecar SaaS may trigger copyleft review

---

### Option C — Embed/fork Twenty codebase into AQLIYA monorepo

Import Twenty packages or fork server/front into repo.

| Pros | Cons |
|------|------|
| Single deploy artifact | **AGPL v3 copyleft** on combined work |
| Deep CRM features | Architecture mismatch (GraphQL vs Server Actions) |
| | Enterprise files under commercial license |
| | Massive maintenance surface |
| | Conflicts with AGENTS.md "not a CRM clone" |
| | Metadata engine duplicates Prisma |

**Engineering risk:** Very High  
**License risk:** **High** — AGPL network clause; enterprise carve-outs; derivative work questions

---

### Option D — Twenty as external SaaS + AQLIYA overlay

Use Twenty Cloud; AQLIYA reads via OAuth/API for display only.

| Pros | Cons |
|------|------|
| Zero CRM build | Data leaves institutional boundary |
| | Subscription + data residency concerns |
| | Cannot enforce AQLIYA governance on Twenty data |
| | Not credible for private/on-prem story |
| | API rate limits, vendor lock-in |

**Engineering risk:** Medium  
**License risk:** Low (API consumer) — but **data governance risk: High**

---

## License Engineering Notes (Twenty)

From [Twenty LICENSE](https://github.com/twentyhq/twenty/blob/main/LICENSE):

- **Default:** GNU **AGPL v3**
- **Exception:** Files with `/* @license Enterprise */` — commercial license
- **AGPL implication:** Modified versions used over a network may require source disclosure
- **AQLIYA context:** Private institutional platform with potential on-prem delivery — copyleft embedding is strategically incompatible without explicit legal review

**Do not** import Twenty npm packages into `src/` without license review.

---

## Decision Matrix

| Criterion | A Native | B Sidecar | C Embed | D SaaS |
|-----------|----------|-----------|---------|--------|
| Governance fit | ★★★★★ | ★★ | ★★ | ★ |
| Time to first demo | ★★ | ★★★★ | ★★ | ★★★★★ |
| Arabic/RTL | ★★★★★ | ★★ | ★★ | ★★ |
| Maintenance | ★★★★ | ★★ | ★ | ★★★ |
| License safety | ★★★★★ | ★★★ | ★ | ★★★★ |
| Institutional credibility | ★★★★★ | ★★★ | ★★ | ★★ |
| Cross-product intelligence | ★★★★★ | ★★ | ★★ | ★★ |

---

## Recommendation

**Option A — Build native SalesOS v0.3 on AQLIYA Core.**

Use Twenty exclusively as:

- UX reference (pipeline board, record pages, timeline)
- Data model vocabulary reference (Company/Person/Opportunity → SalesAccount/Contact/Opportunity)
- API/webhook patterns for future P2 integrations

**Explicitly reject** Options C and D for institutional SalesOS. Option B acceptable only as **temporary internal sales team tool** during build — not branded as SalesOS product surface.

---

## If Sidecar Needed (Option B guardrails)

- Do not expose Twenty UI under `/sales` AQLIYA routes
- Do not sync customer audit/evidence data into Twenty without classification review
- Document as "external CRM tool" in internal ops runbook only
- Re-evaluate exit path to Option A

---

## Next Decision Gate

Before any Twenty code import, require documented approval covering: license review, data classification, and product positioning sign-off.

**Status:** Recommendation only — not validated by legal counsel.
