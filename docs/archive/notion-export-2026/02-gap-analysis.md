# AQLIYA Notion OS — Gap Analysis

**Author:** OpenCode Agent — Notion OS Build  
**Date:** 2026-05-30  
**Authority:** Evidence/report document, not doctrine.  
**Prerequisite:** `docs/archive/notion-export-2026/01-current-state-audit.md`

---

## 0. Target Architecture Overview

AQLIYA Intelligence Command Layer — 6 layers:

1. **Institutional Signals Database** — external signals, objections, market shifts
2. **Strategic Scoring Engine** — prioritize products, accounts, claims, decisions
3. **Customer Intelligence Layer** — ICP fit, pain, trust, conversion probability
4. **Proof Graph 2.0** — claim → proof → source → outcome → approved message
5. **Decision Quality System** — decisions with expected vs actual outcome, review cycles
6. **Founder AI Briefing System** — daily/weekly briefing, critical moves, stop-doing

---

## 1. Institutional Signals Database

| Aspect | Current State | Gap | Severity |
|---|---|---|---|
| Signal collection | Ad-hoc, likely scattered across meeting notes, DMs, email | No centralized signal intake | High |
| Structured fields | Not present | Missing: Type, Source, Product, Impact, Confidence, Action Required | Critical |
| Link to decisions | Not present | Signals should feed decisions; currently disconnected | High |
| Link to claims | Not present | Objections and signals should create Proof Needed in Claims Register | High |
| Link to accounts | Partial (Accounts CRM exists but likely not linked to signals) | No relational link between signal and account | High |
| Automation | None | Every meeting should produce signals; currently manual | Medium |
| **Should live in:** | Notion | Flexible schema, quick capture, multi-user input | |
| **Should later move to:** | AQLIYA app (as structured institutional intelligence) | When volume justifies product-grade persistence | |

**Missing entirely.** This database does not exist in any recognizable form.

---

## 2. Strategic Scoring Engine

| Aspect | Current State | Gap | Severity |
|---|---|---|---|
| Scoring framework | Not present | No structured scoring of products, accounts, claims, decisions | Critical |
| Product scoring | Implicit in PRODUCT_STATUS_MATRIX.md (L0-L6) but no Notion equivalent | Notion may have different view of product priority | High |
| Account scoring | Not present (Accounts CRM likely flat list) | No lead qualification score in Notion | High |
| Claim scoring | Not present (Claims Register likely flat list) | No prioritization of which claims need proof first | High |
| Decision scoring | Not present (Decisions Log likely flat list) | No strategic importance scoring on decisions | Medium |
| Automated score updates | None | Scoring must be manual or periodically reviewed | Medium |
| **Should live in:** | Notion initially | Flexible, easy to iterate. Move to AQLIYA app when productized. | |

**Missing entirely.** No scoring engine exists.

---

## 3. Customer Intelligence Layer

| Aspect | Current State | Gap | Severity |
|---|---|---|---|
| Account records | Accounts CRM exists; schema unknown | Likely lightweight CRM fields | Medium |
| ICP segment mapping | Defined in COMMERCIAL_ARCHITECTURE.md (ICP-1 through ICP-7) but not in Notion | No ICP segment field on accounts | High |
| Pain/budget/authority tracking | Not present | No structured sales intelligence | Critical |
| Trust level tracking | Not present | No relationship health scoring | High |
| Objection patterns | Documented in auditos-commercial-assets/objection-handling.md but not in Notion | No per-account objection tracking | High |
| Proof needed per account | Not present | No link from account to Proof Graph | High |
| Conversion probability | Not present | No lead scoring | Critical |
| **Should live in:** | Notion | CRM-like data belongs in flexible workspace | |
| **Should later move to:** | AQLIYA app (SalesOS) | When SalesOS is production-hardened | |

**Major gap.** Existing Accounts CRM is likely a flat contact list without intelligence fields.

---

## 4. Proof Graph 2.0

| Aspect | Current State | Gap | Severity |
|---|---|---|---|
| Proof Library exists | Yes — as listed database | Schema unknown, likely unstructured | Medium |
| Claim → Proof linking | Not present | No relational link | Critical |
| Verification levels | Not present (tiers P0-P3 defined in COMMERCIAL_ARCHITECTURE.md) | No verification field | Critical |
| Customer/pilot outcome | Not present | No source outcome tracking | Critical |
| Approved message capture | Not present | No "what can we say" field | Critical |
| Public use gating | Not present | No permission/consent tracking | Critical |
| Last verified date | Not present | No freshness tracking | High |
| **Should live in:** | Notion | The natural home for proof management | |
| **Should later move to:** | AQLIYA app | When proof volume justifies product surface | |

**Critical gap.** Proof Library appears to exist but with no structured verification, no claim linking, no public-use gating — it cannot currently serve as the evidence spine of commercial truth.

---

## 5. Decision Quality System

| Aspect | Current State | Gap | Severity |
|---|---|---|---|
| Decisions Log exists | Yes — as listed database | Likely simple log | Medium |
| Expected vs actual outcome | Not present | No outcome tracking | Critical |
| Decision quality scoring | Not present | No quality assessment | High |
| Review date tracking | Not present | No systematic reviews | High |
| Reversibility check | Not present | No "can we undo this?" field | Medium |
| Lessons learned | Not present | No learning loop | High |
| Link to signals | Not present | Should trace: signal → decision → outcome | High |
| **Should live in:** | Notion initially | Quick to set up; later integrate with DecisionOS | |
| **Should later move to:** | AQLIYA app (DecisionOS upgrade) | Full governance integration | |

**Major gap.** Decisions Log exists but without quality system, outcome tracking, or learning loop.

---

## 6. Founder AI Briefing System

| Aspect | Current State | Gap | Severity |
|---|---|---|---|
| CEO Dashboard exists | Yes | Likely manual, static | Medium |
| Daily critical move | Not present | No forced prioritization | Critical |
| Top revenue opportunity | Not present | No revenue focus | High |
| Claims not safe to say | Not present | No commercial risk visibility | Critical |
| Accounts needing follow-up | Not present | No next-action forcing | High |
| Decisions waiting | Not present | No decision bottleneck visibility | High |
| Proof missing | Not present | No proof gap visibility | High |
| Stop-doing list | Not present | No strategic pruning | Medium |
| **Should live in:** | Notion | Daily briefing template; owner updates daily | |
| **Should later move to:** | AQLIYA app | Automated briefing generation | |

**Critical gap.** CEO Dashboard exists but without structured briefing fields, forcing functions, or risk signals.

---

## 7. Cross-Cutting Gaps

| Gap | Current State | Target |
|---|---|---|
| **Relational integrity** | No cross-database links (Claims → Proof → Pilot → Account) | Every major database must link to others |
| **Source-of-truth mapping** | Notion has no declared relationship to Git truth | Every claim in Notion must trace to Git evidence or be explicitly labeled as unverified |
| **Governance rules** | None | Strict rules: Git vs Notion vs AQLIYA app, claim ladder enforcement, stale data, review rhythm |
| **Templates** | None | Every database needs a structured template |
| **Automation** | None | Meeting → Signals, Objection → Proof Needed, Claim → Proof required |
| **Review rhythm** | None | Weekly Intelligence Review, Monthly Proof Audit, Quarterly Decision Review |
| **CEO Dashboard** | Manual, static | Fed by other databases with structured rules |

---

## 8. What Must Be Duplicated (Nothing)

| Principle | Rule |
|---|---|
| **No duplicated Git truth** | Product status, commercial architecture, governance framework live in Git. Notion references them but does not duplicate. |
| **No duplicated product workflows** | DecisionOS, AuditOS, LocalContentOS workflows live in the AQLIYA app. Notion does not replicate them. |
| **No duplicated AI governance** | AI governance rules live in code (approval-state.ts). Notion does not replace them. |
| **No duplicated audit trail** | PlatformAuditLog is the canonical audit. Notion decisions may feed it but not replace it. |

---

## 9. What Must Remain in Git

| Asset | Reason |
|---|---|
| `PRODUCT_STATUS_MATRIX.md` | Single source of truth for product maturity; Notion reads, does not edit |
| `COMMERCIAL_ARCHITECTURE.md` | ICP framework, claim law, pricing scaffold — Notion instantiates, does not redefine |
| `GOVERNANCE_FRAMEWORK.md` | Governance pillars, gaps, proposals — Notion operates within, not above |
| `ROUTE_STRATEGY.md` | Route reality — validates Notion product claims |
| `AGENTS.md` | Agent operating contract — Notion team rules must align |
| `DOCUMENTATION_AUTHORITY.md` | Conflict resolution hierarchy |
| All product workflow code | AuditOS, DecisionOS, LocalContentOS — Notion cannot replace real workflows |

---

## 10. What Should Live in Notion

| Asset | Reason |
|---|---|
| Institutional Signals | Flexible, multi-user input, quick capture |
| Strategic Scores | Iterative, easy to adjust, not product-grade |
| Customer Intelligence | CRM-like, best in Notion with flexible fields |
| Proof Graph 2.0 | Collaborative proof management |
| Decision Reviews | Lightweight quality tracking; heavy governance lives in Git |
| Founder Briefings | Daily operational cadence tool |
| Claims Register (enhanced) | Commercial claim tracking with link to Git proof |
| Pilot Tracker (enhanced) | Operational pilot tracking with link to Git pilot docs |
| CEO Dashboard v2 | Aggregated view of all databases above |

---

## 11. What Should Later Move to AQLIYA App

| Asset | When |
|---|---|
| Institutional Signals | When signal volume > 50/week — needs product-grade DB, dedup, routing |
| Customer Intelligence | When SalesOS reaches L5 — full CRM with governance |
| Decision Reviews | When DecisionOS gets integrated quality scoring |
| Proof Graph | When proof volume needs structured API access |
| Founder Briefings | When automated briefing generation exists |

---

## 12. Gap Priority Matrix

| Area | Impact | Urgency | Effort | Priority |
|---|---|---|---|---|
| Proof Graph 2.0 | Critical — commercial truth foundation | Immediate | Medium | **P0** |
| Governance rules | Critical — prevents false claims | Immediate | Low | **P0** |
| Claim → Proof linking | Critical — evidence governs | Immediate | Low | **P0** |
| CEO Dashboard v2 | High — founder visibility | This week | Medium | **P1** |
| Institutional Signals | High — capture intelligence | This week | Medium | **P1** |
| Decision Reviews | High — learning loop | This week | Medium | **P1** |
| Founder Briefings | High — daily discipline | This week | Low | **P1** |
| Customer Intelligence | Medium — sales enablement | Next week | High | **P2** |
| Strategic Scoring | Medium — prioritization | Next week | Medium | **P2** |

---

## 13. Next Step

Proceed to `docs/archive/notion-export-2026/03-target-architecture-v2.md` — design target Notion architecture.
