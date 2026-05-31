# AQLIYA Notion OS — Implementation Plan

**Author:** OpenCode Agent — Notion OS Build  
**Date:** 2026-05-30  
**Prerequisites:** `docs/archive/notion-export-2026/01-current-state-audit.md`, `docs/archive/notion-export-2026/02-gap-analysis.md`, `docs/archive/notion-export-2026/03-target-architecture-v2.md`

---

## 0. Execution Principles

1. **Build in phases, not all at once.** Each phase produces a usable capability.
2. **Start from existing databases.** Upgrade before creating. Preserve existing structure.
3. **No database without governance rules.** Every new database gets a governance rule in `06-governance-rules.md`.
4. **No database without a template.** Every new database gets a template entry in `05-templates.md`.
5. **CEO Dashboard is the last phase, not the first.** It needs the other databases to function.
6. **Git sync is a weekly ritual, not an automation.** Do not build Git → Notion sync automation until Phase E.

---

## Phase A — Core Intelligence (Day 1)

**Goal:** Create the 3 new intelligence databases that enable everything else.

### A1. Institutional Signals Database

| Item | Detail |
|---|---|
| **Action** | Create new Notion database: "Institutional Signals" |
| **Fields** | As specified in `03-target-architecture-v2.md §2.1` |
| **Template** | Use template from `05-templates.md §1` |
| **Governance** | Every team member can add signals. Weekly review required. Signals older than 30 days with Status ≠ "Actioned" auto-archive. |
| **Expected value** | Centralized intelligence intake. No more lost insights from meetings, calls, or sources. |
| **Risk** | Low. New database, no data migration needed. Risk of abandonment if not used. Mitigation: add to daily briefing workflow. |
| **Notion entities affected** | New database |
| **Source-of-truth rule** | Signals are Notion-native. No Git equivalent. Signals that trigger decisions or challenge claims must be linked to those databases. |
| **Acceptance criteria** | 5+ signals entered in first week. At least 2 signals linked to claims or decisions. Weekly review happens. |
| **Time estimate** | 1 hour |

### A2. Strategic Scores Database

| Item | Detail |
|---|---|
| **Action** | Create new Notion database: "Strategic Scores" |
| **Fields** | As specified in `03-target-architecture-v2.md §2.2` |
| **Template** | Use template from `05-templates.md` (to be created) |
| **Governance** | Scored by founder/leadership. Monthly review cadence. Product scores must be reconciled with `PRODUCT_STATUS_MATRIX.md`. |
| **Expected value** | Data-driven prioritization. Answers "what should we focus on?" with structured scoring. |
| **Risk** | Low. Scores are subjective — risk of false precision. Mitigation: document scoring rules clearly, review monthly. |
| **Notion entities affected** | New database. Product Portfolio (add Strategic Score relation field). |
| **Source-of-truth rule** | Scores are Notion-native assessments. Product scores must not claim higher maturity than `PRODUCT_STATUS_MATRIX.md` allows. |
| **Acceptance criteria** | All 7 products scored. Top 5 accounts scored. All active claims scored. Monthly review scheduled. |
| **Time estimate** | 1 hour |

### A3. Decision Reviews Database

| Item | Detail |
|---|---|
| **Action** | Create new Notion database: "Decision Reviews" |
| **Fields** | As specified in `03-target-architecture-v2.md §2.3` |
| **Template** | Use template from `05-templates.md §3` |
| **Governance** | Every major decision gets a record. Review date set at creation. Quarterly review of all pending reviews. |
| **Expected value** | Decision quality tracking and learning loop. Stop repeating mistakes. |
| **Risk** | Low. New database. Risk of not using it — mitigation: attach to existing Decisions Log and migrate entries. |
| **Notion entities affected** | New database. Existing Decisions Log — migrate entries to new format. Keep old DB as archive. |
| **Source-of-truth rule** | This is a lightweight tracking layer. Formal decisions with governance workflow live in DecisionOS in the AQLIYA app. Where a formal DecisionOS record exists, link to it. |
| **Acceptance criteria** | Past 10 major decisions entered. Review dates set. At least 3 past decisions have actual outcomes recorded. |
| **Time estimate** | 1 hour |

### Phase A Summary

| Database | Expected Value | Risk | Time |
|---|---|---|---|
| Institutional Signals | Intelligence capture | Low | 1h |
| Strategic Scores | Prioritization | Low | 1h |
| Decision Reviews | Learning loop | Low | 1h |
| **Total** | — | **Low** | **3h** |

---

## Phase B — Upgrade Existing Databases (Day 2-3)

**Goal:** Add intelligence fields to existing databases without breaking current workflows.

### B1. Product Portfolio Upgrade

| Item | Detail |
|---|---|
| **Action** | Add fields to existing Product Portfolio database |
| **Add fields** | `Git Status`, `Git Status Verified Date`, `Notion Level`, `Strategic Score` (relation), `Current Pilot` (relation), `Key Claims` (relation), `Last Reconciliation` |
| **Expected value** | Product portfolio becomes truth-anchored to Git. No more drift. |
| **Risk** | Medium — existing views may break if fields are renamed. Mitigation: only add fields, don't rename/delete. |
| **Notion entities affected** | Product Portfolio database |
| **Source-of-truth rule** | Weekly reconciliation with `PRODUCT_STATUS_MATRIX.md`. Git wins on conflict. |
| **Acceptance criteria** | All products reconciled with Git. `Git Status Verified Date` populated. Relation to Strategic Scores working. |
| **Time estimate** | 30 min |

### B2. Accounts CRM Upgrade

| Item | Detail |
|---|---|
| **Action** | Add intelligence fields to existing Accounts CRM |
| **Add fields** | `ICP Segment`, `Intelligence` (relation to Customer Intelligence — created in Phase C), `Owner`, `Status`, `Last Contact` |
| **Expected value** | CRM becomes intelligence-capable. Foundation for Customer Intelligence. |
| **Risk** | Low — additive only. |
| **Notion entities affected** | Accounts CRM database |
| **Source-of-truth rule** | Account records are Notion-native operational data. Formal account governance (RBAC, evidence) belongs in the AQLIYA app when SalesOS matures. |
| **Acceptance criteria** | All active accounts have ICP segment assigned. Owner assigned. Status populated. |
| **Time estimate** | 30 min |

### B3. Pilot Tracker Upgrade

| Item | Detail |
|---|---|
| **Action** | Add fields to existing Pilot Tracker |
| **Add fields** | `Pilot Tier`, `Customer` (relation), `Success Criteria`, `Evidence Outputs`, `Outcome`, `Produced Proof` (relation), `Risk Disclosure Signed?`, `Conversion Path`, `Git Pilot Doc` (URL) |
| **Expected value** | Pilots become evidence-producing machines. Clear tier, clear outcome, linked proof. |
| **Risk** | Medium — existing pilot entries need data migration. Mitigation: batch fill after schema change. |
| **Notion entities affected** | Pilot Tracker database |
| **Source-of-truth rule** | Pilot tier must match commercial architecture. T2/T3 pilot conversions must be approved in Git before updating Notion. |
| **Acceptance criteria** | All active pilots have tier, outcome, and customer assigned. At least one pilot linked to produced proof. |
| **Time estimate** | 30 min |

### B4. Claims Register Upgrade

| Item | Detail |
|---|---|
| **Action** | Add governance fields to existing Claims Register |
| **Add fields** | `Claim Ladder Level` (C1-C5), `Git Status Reference`, `Proof Required` (relation), `Proof Complete?` (formula), `Approved Message`, `Public Use Allowed?`, `Last Validated` |
| **Expected value** | Claims become governable. Every claim traces to its Git truth and required proof. |
| **Risk** | Medium — commercial claims may need to be downgraded when compared to Git truth. Mitigation: expect some uncomfortable downgrades; document them. |
| **Notion entities affected** | Claims Register database |
| **Source-of-truth rule** | **The most important governance rule:** Every claim's `Claim Ladder Level` must be supported by the product's Git maturity in `PRODUCT_STATUS_MATRIX.md`. If a claim exceeds its supporting Git status, it must be downgraded. |
| **Acceptance criteria** | All claims have claim ladder level assigned. At least 50% of claims have proof required linked. No claim exceeds its supporting Git status. |
| **Time estimate** | 1 hour (may involve uncomfortable claim downgrades) |

### B5. Execution Board Upgrade

| Item | Detail |
|---|---|
| **Action** | Add fields to existing Execution Board |
| **Add fields** | `Related Signal` (relation), `Strategic Score` (relation), `Product` (relation), `Blocked By`, `Go/No-Go Date` |
| **Expected value** | Execution becomes signal-driven and scored. |
| **Risk** | Low — additive. |
| **Notion entities affected** | Execution Board database |
| **Source-of-truth rule** | Tasks linked to signals must respect the signal's action requirements. |
| **Acceptance criteria** | Top 10 active tasks linked to products. At least 3 tasks linked to signals. |
| **Time estimate** | 20 min |

### B6. Source Sync Register Upgrade

| Item | Detail |
|---|---|
| **Action** | Add fields to existing Source Sync Register |
| **Add fields** | `Git Doc` (URL), `Notion DB` (relation), `Last Synced`, `Sync Status`, `Conflicts` |
| **Expected value** | Systematic tracking of Git ↔ Notion alignment. |
| **Risk** | Low — new tracking fields only. |
| **Notion entities affected** | Source Sync Register database |
| **Source-of-truth rule** | This register exists to manage drift, not to resolve it. Conflict resolution follows `DOCUMENTATION_AUTHORITY.md`. |
| **Acceptance criteria** | All major Git docs mapped to Notion DBs. Sync status populated. |
| **Time estimate** | 30 min |

### Phase B Summary

| Upgrade | Expected Value | Risk | Time |
|---|---|---|---|
| Product Portfolio | Truth anchoring | Low | 30m |
| Accounts CRM | Intelligence foundation | Low | 30m |
| Pilot Tracker | Evidence production | Medium | 30m |
| Claims Register | Claim governance | Medium | 1h |
| Execution Board | Signal-driven work | Low | 20m |
| Source Sync Register | Drift management | Low | 30m |
| **Total** | — | **Medium** | **3.5h** |

---

## Phase C — Proof & Intelligence (Day 3-4)

**Goal:** Build the two high-governance databases that enforce "Evidence governs."

### C1. Proof Graph 2.0 Database

| Item | Detail |
|---|---|
| **Action** | Create new Notion database: "Proof Graph 2.0" |
| **Fields** | As specified in `03-target-architecture-v2.md §2.6` |
| **Template** | Use template from `05-templates.md §4` |
| **Governance** | Most strict governance of any Notion database. Every claim mapped to proof. Verification levels enforced. Public use gating. |
| **Expected value** | The spine of "Evidence governs." Enables truthful commercial messaging. |
| **Risk** | High — this database will surface proof gaps that may be uncomfortable. Existing claims may need to be downgraded. **This is correct behavior, not a problem.** |
| **Notion entities affected** | New database. Claims Register (add relation). Pilot Tracker (add relation). |
| **Source-of-truth rule** | **No external claim may be used unless the full chain exists: Claim → Proof → Source → Customer/Pilot/Outcome → Approved Message.** |
| **Acceptance criteria** | All existing commercial claims mapped to proof entries. Verification level assigned to all proof. At least 3 proof entries with Approved Message. Public use gating populated. |
| **Time estimate** | 2 hours (includes uncomfortable proof gap discovery) |

### C2. Customer Intelligence Database

| Item | Detail |
|---|---|
| **Action** | Create new Notion database: "Customer Intelligence" |
| **Fields** | As specified in `03-target-architecture-v2.md §2.4` |
| **Template** | Use template from `05-templates.md §4` |
| **Governance** | Weekly review of hot leads. Monthly full review. Owner responsible for updates. |
| **Expected value** | Structured customer intelligence. Conversion probability scoring. Clear next actions for every account. |
| **Risk** | Medium — requires consistent input from sales/customer-facing team. Risk of abandonment. Mitigation: link to weekly briefing. |
| **Notion entities affected** | New database. Accounts CRM (add relation). Proof Graph 2.0 (add relation). |
| **Source-of-truth rule** | Customer Intelligence is Notion-native operational data. When SalesOS reaches L5, move to AQLIYA app. |
| **Acceptance criteria** | All active accounts have intelligence entry. Conversion probability calculated. Next Best Action assigned. Weekly review scheduled. |
| **Time estimate** | 1 hour |

### Phase C Summary

| Database | Expected Value | Risk | Time |
|---|---|---|---|
| Proof Graph 2.0 | Evidence governs | High (discomfort) | 2h |
| Customer Intelligence | Sales intelligence | Medium | 1h |
| **Total** | — | **Medium-High** | **3h** |

---

## Phase D — Briefing & Governance (Day 4-5)

**Goal:** Build the Founder Briefing and finalize governance. CEO Dashboard v2 is separate (Phase E).

### D1. Founder Briefings Database

| Item | Detail |
|---|---|
| **Action** | Create new Notion database: "Founder Briefings" |
| **Fields** | As specified in `03-target-architecture-v2.md §2.5` |
| **Template** | Use template from `05-templates.md §2` |
| **Governance** | Daily briefing created by founder/leadership. Weekly briefing every Monday. Monthly briefing first of month. |
| **Expected value** | Forced prioritization, risk visibility, commercial truth discipline. |
| **Risk** | Low — new database. Risk of inconsistent use. Mitigation: hard schedule (daily/weekly/monthly). |
| **Notion entities affected** | New database. CEO Dashboard (will consume this data). |
| **Source-of-truth rule** | Briefings are time-bound operational documents. They are Notion-native. Historical briefings are archive-only. |
| **Acceptance criteria** | First weekly briefing created. Daily briefing scheduled. Relations to Accounts, Decisions, Proof, Claims working. |
| **Time estimate** | 1 hour |

### D2. Governance Rules Documentation

| Item | Detail |
|---|---|
| **Action** | Finalize and implement `docs/archive/notion-export-2026/06-governance-rules.md` |
| **Details** | See Phase 6 deliverable |
| **Expected value** | All Notion activity is governed. No claim drift, no stale data, no fake proof. |
| **Risk** | Low — documentation only. Enforcement depends on team discipline. |
| **Notion entities affected** | All databases |
| **Acceptance criteria** | All rules documented. Weekly review scheduled. Owner assigned for each database. |
| **Time estimate** | 1 hour |

### Phase D Summary

| Action | Expected Value | Risk | Time |
|---|---|---|---|
| Founder Briefings | Operational discipline | Low | 1h |
| Governance Rules | Truth enforcement | Low | 1h |
| **Total** | — | **Low** | **2h** |

---

## Phase E — CEO Dashboard v2 (Day 5-6)

**Goal:** Build the aggregated CEO Dashboard that reads from all other databases.

### E1. CEO Dashboard v2 Construction

| Item | Detail |
|---|---|
| **Action** | Redesign existing CEO Dashboard as an aggregated view. See `docs/archive/notion-export-2026/07-ceo-dashboard-v2.md` for full design. |
| **Fields** | As specified in `07-ceo-dashboard-v2.md` |
| **Expected value** | Single pane of glass for all Notion intelligence. Critical moves, risks, opportunities, proof gaps, decisions waiting. |
| **Risk** | Medium — depends on other databases being populated. Mitigation: build dashboard last, after Phase A-D. |
| **Notion entities affected** | CEO Dashboard (redesign). All other databases (read relations). |
| **Source-of-truth rule** | CEO Dashboard is a read-aggregator. It does not create new data — it displays data from other databases. |
| **Acceptance criteria** | All 15 data blocks populated from other databases. Dashboard auto-updates when source data changes. Weekly review uses dashboard. |
| **Time estimate** | 2 hours |

---

## Phase F — Automation Layer (Ongoing)

**Goal:** Make Notion a self-sustaining intelligence system through lightweight automation.

### F1. Meeting → Signals Automation

| Item | Detail |
|---|---|
| **Action** | Add "Create Signal" as the last agenda item for every meeting template |
| **Notion mechanism** | Linked template or automated form |
| **Expected value** | Every meeting produces at least one signal. No intelligence lost. |

### F2. Objection → Proof Needed Automation

| Item | Detail |
|---|---|
| **Action** | When "Objection Pattern" is filled in Customer Intelligence, auto-create a Proof Graph 2.0 entry |
| **Notion mechanism** | Notion automation (button or formula) |
| **Expected value** | Every objection automatically creates a proof requirement |

### F3. Claim → Proof Required Automation

| Item | Detail |
|---|---|
| **Action** | When a claim is added to Claims Register, require Proof Required field |
| **Notion mechanism** | Template requirement (not optional in template) |
| **Expected value** | No claim enters the system without a proof requirement |

### F4. Weekly Review Rhythm

| Item | Detail |
|---|---|
| **Action** | Set recurring reminder for weekly Intelligence Review |
| **Agenda** | 1. Review new signals (Institutional Signals, last 7 days) 2. Check proof verification (Proof Graph needs verification) 3. Review pending decisions (Decision Reviews pending review) 4. Check claims drift (Claims Register vs Git) 5. Update strategic scores (if monthly) 6. Create weekly Founder Briefing |
| **Expected value** | Regular cadence prevents data decay |

### F5. Monthly Proof Audit

| Item | Detail |
|---|---|
| **Action** | Review every Proof Graph 2.0 entry for freshness |
| **Criteria** | If Last Verified > 60 days ago, reverify or mark as expired |
| **Expected value** | Proof library stays current. No stale evidence used in commercial messaging. |

---

## Implementation Sequencing

```
Week 1:
  Mon: Phase A — Institutional Signals, Strategic Scores, Decision Reviews
  Tue: Phase B — Product Portfolio, Accounts CRM, Pilot Tracker upgrades
  Wed: Phase B — Claims Register, Execution Board, Source Sync upgrades
  Thu: Phase C — Proof Graph 2.0, Customer Intelligence
  Fri: Phase D — Founder Briefings, Governance rules

Week 2:
  Mon: Phase E — CEO Dashboard v2
  Tue-Fri: Populate data, train team, establish review rhythm

Ongoing:
  Phase F — Automation layer buildout
```

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Notion abandoned after build | Medium | High | Integrate into daily/weekly rituals. Add to Founder Briefing. |
| Claims downgraded due to Git truth cause discomfort | High | Medium | This is correct behavior. Document downgrades as evidence of truthfulness. |
| Proof Graph reveals major gaps | High | Medium | Expected and necessary. Gaps are commercial risk, not Notion failure. |
| Team over-reliance on Notion for governance | Low | High | Git remains source of truth for product status. Governance rules enforce this. |
| Data decay without consistent input | Medium | High | Review rhythm (weekly/monthly) prevents decay. |
| CEO Dashboard becomes static if not fed | Medium | Medium | Build only after other databases are populated. |

---

## Acceptance Criteria — Overall

1. All 9 databases operational (3 new + 6 upgraded)
2. CEO Dashboard v2 shows real data from all databases
3. Governance rules documented and distributed
4. Weekly review rhythm established
5. All existing Notion databases preserved (no data loss)
6. All commercial claims verified against Git truth
7. Proof Graph shows verification levels for all claims
8. Founder Briefings running on schedule

---

## Next Step

Proceed to `docs/archive/notion-export-2026/05-templates.md` — build the Notion entry templates.
