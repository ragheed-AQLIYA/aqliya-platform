# AQLIYA Notion OS — Target Architecture v2

**Author:** OpenCode Agent — Notion OS Build  
**Date:** 2026-05-30  
**Authority:** Architecture proposal document — implementation approval required  
**Prerequisite:** `docs/archive/notion-export-2026/02-gap-analysis.md`

---

## 0. Design Principles

1. **Notion serves the Intelligence Command Layer, not product operations.** Product workflows live in the AQLIYA app. Notion is for commercial intelligence, strategic signals, decision quality, and founder briefing.
2. **Git is the source of truth for product status and architecture.** Notion references Git — it does not duplicate, override, or drift from it.
3. **Every Notion claim must trace to evidence.** The "Claim → Proof → Source → Outcome" chain is non-negotiable.
4. **Databases are relational.** Every major database links to others via relations. No silos.
5. **Templates enforce structure.** Every entry starts from a template that requires governance fields.
6. **CEO Dashboard is the aggregator.** It pulls data from all other databases; it is not a standalone page.

---

## 1. Database Architecture Map

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                          FOUNDER BRIEFINGS (Daily/Weekly)                       │
│  "Today's critical move · Top opportunity · Risk · Claims not safe to say ·     │
│   Accounts needing action · Decisions waiting · Proof missing · Stop doing"      │
└──────────────────────────┬─────────────────────────────────────────────────────┘
                           │ reads from all below
┌────────────────┬────────────────┬────────────────┬────────────────┬──────────────┐
│  INSTITUTIONAL │   STRATEGIC    │  CUSTOMER      │  PROOF GRAPH   │   DECISION   │
│   SIGNALS      │   SCORES       │  INTELLIGENCE  │  2.0           │   REVIEWS    │
├────────────────┼────────────────┼────────────────┼────────────────┼──────────────┤
│ Market signals │ Product scores │ Account ICP    │ Claim → Proof  │ Decision log │
│ Objections     │ Account scores │ Pain severity  │ Source outcome │ Expected vs  │
│ Meeting notes  │ Claim scores   │ Budget signal  │ Verification   │ actual       │
│ Source intel   │ Pilot scores   │ Authority      │ Approved msg   │ Quality      │
│ Converted task │ Review date    │ Trust level    │ Public use?    │ Lessons      │
│ Converted dec  │ Pilot scores   │ Objections     │ Last verified  │ Follow-up    │
└────────────────┴────────────────┴────────────────┴────────────────┴──────────────┘
         │                │                │                │                │
         └────────────────┴────────────────┴────────────────┴────────────────┘
                                    │
                        ┌───────────┴───────────┐
                        │     EXISTING (UPGRADE) │
                        │ Product Portfolio      │
                        │ Pilot Tracker          │
                        │ Claims Register        │
                        │ Accounts CRM           │
                        │ Execution Board        │
                        │ Source Sync Register   │
                        └───────────────────────┘
```

---

## 2. Database Specifications

### 2.1 Institutional Signals

**Purpose:** Centralized intake for all external intelligence — market signals, customer objections, meeting outcomes, source insights, competitive moves. This is the raw intake layer of the Intelligence Command.

**Fields:**

| Field Name | Type | Required | Description |
|---|---|---|---|
| Signal | Title | ✅ | One-line description of the signal |
| Signal Type | Select | ✅ | `Market Signal` / `Customer Objection` / `Meeting Outcome` / `Competitive Intel` / `Source Insight` / `Risk Signal` / `Opportunity Signal` / `Internal Signal` |
| Source | Text | ✅ | Where did this come from? (meeting name, person, tool, document) |
| Product | Relation: Product Portfolio | Optional | Which product does this affect? |
| Account | Relation: Accounts CRM | Optional | Which account/client does this relate to? |
| Related Claim | Relation: Claims Register | Optional | Does this signal affect a commercial claim? |
| Related Proof | Relation: Proof Graph 2.0 | Optional | Does this create or affect proof? |
| Related Decision | Relation: Decision Reviews | Optional | Does this trigger or inform a decision? |
| Impact | Select | ✅ | `Critical` / `High` / `Medium` / `Low` |
| Confidence | Select | ✅ | `High` / `Medium` / `Low` / `Speculative` |
| Action Required | Select | ✅ | `None` / `Discuss` / `Decide` / `Escalate` / `Investigate` / `Respond` |
| Action Details | Text | Optional | What specific action is needed? |
| Converted to Task? | Checkbox | Optional | Linked to Execution Board |
| Converted to Decision? | Relation: Decision Reviews | Optional | Linked to formal decision |
| Created Date | Date | ✅ | Auto-set |
| Owner | Person | ✅ | Who captured this? |
| Status | Select | ✅ | `New` / `In Review` / `Actioned` / `Closed` / `Archived` |

**Views:**
- All Signals (table, sorted by date desc)
- Needs Attention (filter: Action Required ≠ None, Status ≠ Closed)
- By Product (grouped by Product)
- By Account (grouped by Account)
- Critical Signals (filter: Impact = Critical)

**Relations:**
- Many-to-one: Product Portfolio
- Many-to-one: Accounts CRM
- Many-to-one: Claims Register
- Many-to-one: Proof Graph 2.0
- Many-to-one: Decision Reviews
- Many-to-many: Execution Board (via Converted to Task?)

**Source-of-truth rule:** Signals are Notion-native. They do not duplicate any Git data. A signal that becomes a decision must create a record in Decision Reviews. A signal that challenges a claim must be linked to Claims Register.

---

### 2.2 Strategic Scores

**Purpose:** Structured prioritization of products, accounts, claims, pilots, and decisions. Answers "what should we focus on?"

**Fields:**

| Field Name | Type | Required | Description |
|---|---|---|---|
| Object | Title | ✅ | Name of the scored entity |
| Object Type | Select | ✅ | `Product` / `Account` / `Claim` / `Task` / `Pilot` / `Decision` |
| Market Pull | Number (1-10) | ✅ | How strong is market demand? |
| Revenue Potential | Number (1-10) | ✅ | Revenue impact if successful |
| Proof Level | Number (1-10) | ✅ | How strong is our evidence/validation? |
| Technical Readiness | Number (1-10) | ✅ | Do we have the technical capability? |
| Risk | Number (1-10) | ✅ | Risk level (10 = highest risk) |
| Complexity | Number (1-10) | ✅ | Implementation complexity (10 = most complex) |
| Strategic Score | Formula | ✅ | Calculated: (MarketPull + RevenuePotential + ProofLevel + TechnicalReadiness - Risk - Complexity) / 6 |
| Recommended Action | Select | ✅ | `Invest` / `Maintain` / `Monitor` / `Deprioritize` / `Stop` |
| Review Date | Date | ✅ | When should this score be reviewed? |
| Previous Score | Number | Optional | Score from last review (for trend) |
| Trend | Formula | Optional | StrategicScore - PreviousScore |
| Notes | Text | Optional | Context for the score |

**Object Type scoring rules:**
- **Product:** Score drives product investment priority. Market Pull weighted 2x.
- **Account:** Score drives sales priority. Revenue Potential weighted 2x.
- **Claim:** Score drives proof urgency. Proof Level weighted 2x (lower = more urgent).
- **Pilot:** Score drives pilot execution priority. Technical Readiness weighted 1.5x.
- **Decision:** Score drives review priority. Risk weighted 1.5x.

**Views:**
- All Scores (table)
- By Object Type (grouped)
- By Recommended Action (grouped)
- Invest Priority (filter: Recommended Action = Invest, sorted by Strategic Score desc)
- Needs Review (filter: Review Date < today)

**Relations:**
- Relation to whichever object it scores (not always possible in Notion — use Object Name + Type as text key or manual linking)

**Source-of-truth rule:** Scores are Notion-native assessments. They must be reviewed at least monthly. Product scores must be reconciled with `PRODUCT_STATUS_MATRIX.md` to ensure alignment.

---

### 2.3 Decision Reviews

**Purpose:** Decision quality tracking — record decisions, compare expected vs actual outcomes, capture lessons. This is the learning loop.

**Fields:**

| Field Name | Type | Required | Description |
|---|---|---|---|
| Decision | Title | ✅ | Short decision statement |
| Decision Link | URL | Optional | Link to DecisionOS record or meeting note |
| Original Decision | Text | ✅ | Full description of the decision made |
| Decision Date | Date | ✅ | When was the decision made? |
| Expected Outcome | Text | ✅ | What did we expect to happen? |
| Actual Outcome | Text | Optional | What actually happened? (filled on review) |
| Outcome Status | Select | ✅ | `Pending` / `As Expected` / `Better Than Expected` / `Worse Than Expected` / `Unknown` |
| Decision Quality Score | Number (1-10) | ✅ | Self-assessed quality at time of decision (1 = bad process, 10 = rigorous) |
| Review Date | Date | ✅ | Date for scheduled review |
| Reversible? | Select | ✅ | `Easily Reversible` / `Reversible With Cost` / `Difficult To Reverse` / `Irreversible` |
| Lessons Learned | Text | Optional | What did we learn? |
| Follow-up Action | Text | Optional | What needs to happen next? |
| Related Signal | Relation: Institutional Signals | Optional | Which signal triggered this? |
| Related Claim | Relation: Claims Register | Optional | Which claim does this affect? |
| Owner | Person | ✅ | Who made/recommended the decision? |
| Decision Type | Select | ✅ | `Strategic` / `Product` / `Commercial` / `People` / `Technical` / `Process` / `Governance` |

**Views:**
- All Decisions (table, sorted by date desc)
- Pending Review (filter: Outcome Status = Pending, sorted by Review Date asc)
- Lessons Learned (records with Lessons Learned filled)
- By Decision Type (grouped)

**Relations:**
- Many-to-one: Institutional Signals
- Many-to-one: Claims Register

**Source-of-truth rule:** Decision Reviews are a lightweight tracking layer. Formal decisions with governance workflow live in DecisionOS in the AQLIYA app. This database tracks decision quality and learning, not the decision itself. Where a formal DecisionOS record exists, link to it.

---

### 2.4 Customer Intelligence

**Purpose:** Structured customer/account intelligence — ICP fit, pain, budget, authority, trust, objections. The sales intelligence layer.

**Fields:**

| Field Name | Type | Required | Description |
|---|---|---|---|
| Account | Relation: Accounts CRM | ✅ | Linked CRM account |
| ICP Segment | Select | ✅ | `ICP-1` (Audit firms) / `ICP-2` (Internal audit) / `ICP-3` (Local content) / `ICP-4` (Procurement) / `ICP-5` (Decision governance) / `ICP-6` (Process governance) / `ICP-7` (Bespoke) |
| Pain Severity | Number (1-10) | ✅ | How painful is their problem? (10 = critical) |
| Budget Signal | Select | ✅ | `Confirmed` / `Indicated` / `Unknown` / `None` / `Tight` |
| Authority Level | Select | ✅ | `Champion` / `Influencer` / `Economic Buyer` / `User` / `No Access` |
| Timing | Select | ✅ | `Immediate (<1mo)` / `Short (1-3mo)` / `Medium (3-6mo)` / `Long (6-12mo)` / `No Timeline` |
| Trust Level | Select | ✅ | `High` / `Medium` / `Low` / `New (not established)` / `Damaged` |
| Objection Pattern | Select | Optional | `Price` / `Timing` / `Need Clarity` / `Competitor` / `Risk Aversion` / `Internal Politics` / `No Objection` / `Other` |
| Objection Detail | Text | Optional | Specific objection details |
| Proof Needed | Relation: Proof Graph 2.0 | Optional | What proof would overcome their objection? |
| Conversion Probability | Formula | ✅ | Calculated: ((PainSeverity * 2) + BudgetBonus + AuthorityBonus + TimingBonus + TrustBonus) / 20 |
| Next Best Action | Select | ✅ | `Demo` / `Pilot Proposal` / `Follow-up Call` / `Send Proof` / `Executive Meeting` / `Technical Review` / `Proposal` / `Nurture` / `Disqualify` |
| Last Updated | Date | ✅ | Auto-set |
| Owner | Person | ✅ | Account owner |

**Conversion Probability Formula Notes:**
- PainSeverity (1-10) * 2 = 0-20 points
- BudgetBonus: Confirmed=5, Indicated=3, Unknown=1, None/Tight=0
- AuthorityBonus: Economic Buyer=5, Champion=4, Influencer=2, User=1, No Access=0
- TimingBonus: Immediate=5, Short=4, Medium=3, Long=1, No Timeline=0
- TrustBonus: High=5, Medium=3, Low=1, New/Damaged=0
- Total out of 40; Convert to percentage

**Views:**
- All Accounts (table)
- Hot Leads (filter: Conversion Probability > 60, sorted desc)
- Needs Attention (filter: Next Best Action ≠ Nurture or Disqualify)
- By ICP Segment (grouped)
- Needs Proof (records where Proof Needed is not empty)

**Relations:**
- One-to-one: Accounts CRM
- Many-to-one: Proof Graph 2.0

**Source-of-truth rule:** Customer Intelligence is Notion-native. It integrates field knowledge, not product data. When SalesOS reaches L5, structured account intelligence may move to the AQLIYA app. Until then, Notion is the canonical home.

---

### 2.5 Founder Briefings

**Purpose:** Daily/weekly structured briefing that forces prioritization, risk visibility, and action. This is the CEO Dashboard's executive interface.

**Fields:**

| Field Name | Type | Required | Description |
|---|---|---|---|
| Briefing Date | Date | ✅ | Date of the briefing |
| Type | Select | ✅ | `Daily` / `Weekly` / `Monthly` / `Strategic` |
| Critical Move | Text | ✅ | The single most important action today/this week |
| Top Revenue Opportunity | Text | ✅ | The highest-revenue opportunity in play |
| Revenue Amount (USD) | Number | Optional | Estimated revenue if won |
| Top Product Risk | Text | ✅ | The biggest product risk right now |
| Risk Severity | Select | ✅ | `Critical` / `High` / `Medium` / `Low` |
| Claims Not Safe To Say | Multi-select | ✅ | Commercial claims that cannot be made publicly (relation to Claims Register or text) |
| Claims Ready To Use | Multi-select | Optional | Claims validated and ready (relation to Claims Register) |
| Accounts Needing Follow-up | Relation: Accounts CRM / Customer Intelligence | ✅ | Which accounts need founder attention |
| Decisions Waiting | Relation: Decision Reviews | ✅ | Decisions awaiting founder input |
| Proof Missing | Relation: Proof Graph 2.0 | ✅ | What proof gaps are blocking progress |
| Proof Created This Week | Number | Optional | Count of proof assets created |
| Source Sync Conflicts | Number | Optional | Unresolved Git ↔ Notion discrepancies |
| Product Maturity Changes | Text | Optional | Any product status changes since last briefing |
| Stop Doing | Text | ✅ | What should we stop doing? |
| Next 3 Actions | Text | ✅ | Three concrete next actions after this briefing |
| Created By | Person | ✅ | Briefing author |
| Reviewed By | Person | Optional | Person who reviewed the briefing |

**Views:**
- All Briefings (table, sorted by date desc)
- Latest Weekly (filter: Type = Weekly, sorted by date desc, limit 1)
- Latest Daily (filter: Type = Daily, sorted by date desc, limit 1)

**Relations:**
- Many-to-one: Claims Register
- Many-to-one: Accounts CRM
- Many-to-one: Customer Intelligence
- Many-to-one: Decision Reviews
- Many-to-one: Proof Graph 2.0

**Source-of-truth rule:** Founder Briefings are Notion-native operational documents. They are time-bound and replaced by newer briefings. Historical briefings are archive-only.

---

### 2.6 Proof Graph 2.0

**Purpose:** The spine of "Evidence governs." Every commercial claim maps to proof, source, customer/pilot outcome, verification level, and approved message. This is the most governance-critical database in Notion.

**Fields:**

| Field Name | Type | Required | Description |
|---|---|---|---|
| Claim | Title | ✅ | The commercial claim being made |
| Claim Source | Text | ✅ | Where is this claim documented? (Git doc, page, PRD) |
| Proof | Text | ✅ | What constitutes proof of this claim? |
| Proof File | File | Optional | Attached evidence file |
| Source | Text | ✅ | Where did the proof come from? (pilot name, test, document, customer interaction) |
| Customer / Pilot | Relation: Pilot Tracker | Optional | Which customer or pilot produced the proof? |
| Outcome | Select | ✅ | `Confirmed` / `Partially Confirmed` / `In Progress` / `Refuted` / `Untested` |
| Verification Level | Select | ✅ | `P0 Internal Rehearsal` / `P1 Controlled Pilot` / `P2 External Pilot` / `P3 Paid Reference` |
| Verification Detail | Text | Optional | Specifics of verification |
| Approved Message | Text | Optional | What can we say externally? (exact phrasing) |
| Public Use Allowed? | Checkbox | ✅ | Can this be used in external materials? |
| Public Use Restrictions | Text | Optional | Any restrictions on public use |
| Last Verified | Date | ✅ | When was this last verified? |
| Next Verification | Date | Optional | When should this be re-verified? |
| Owner | Person | ✅ | Who owns this proof? |
| Related Signal | Relation: Institutional Signals | Optional | Signal that triggered this proof need |
| Related Claim Register | Relation: Claims Register | Optional | Commercial claim this proof supports |
| Status | Select | ✅ | `Draft` / `Verification Pending` / `Verified` / `Approved` / `Expired` / `Refuted` |

**Views:**
- All Proof (table)
- Ready For External Use (filter: Public Use Allowed = true, Status = Approved)
- Needs Verification (filter: Next Verification < today or empty, Status ≠ Refuted)
- By Verification Level (grouped)
- By Outcome (grouped)
- Proof Created This Week (filter: Last Verified > 7 days ago)

**Relations:**
- Many-to-one: Pilot Tracker
- Many-to-one: Institutional Signals
- Many-to-one: Claims Register

**Source-of-truth rule:** This is the most critical governance database. The rule is absolute: **No external claim may be used unless the full chain exists: Claim → Proof → Source → Customer/Pilot/Outcome → Approved Message.** See `docs/archive/notion-export-2026/06-governance-rules.md` for full governance.

---

## 3. Existing Databases — Upgrade Specifications

### 3.1 Product Portfolio (upgrade)

**Add fields:**
- `Git Status` (text — must match PRODUCT_STATUS_MATRIX.md)
- `Git Status Verified Date` (date)
- `Notion Level` (select: L0-L6) — must be reconciled with Git
- `Strategic Score` (relation: Strategic Scores)
- `Current Pilot` (relation: Pilot Tracker)
- `Key Claims` (relation: Claims Register)
- `Last Reconciliation` (date)

**Governance rule:** Product Portfolio must be reconciled with `PRODUCT_STATUS_MATRIX.md` weekly. If they conflict, Git wins.

### 3.2 Pilot Tracker (upgrade)

**Add fields:**
- `Pilot Tier` (select: T0 Internal Rehearsal / T1 Controlled / T2 External / T3 Paid / T4 Production)
- `Customer` (relation: Accounts CRM)
- `Success Criteria` (text)
- `Evidence Outputs` (text) — what proof must the pilot produce?
- `Outcome` (select: Not Started / In Progress / Completed / Extended / No-Go)
- `Produced Proof` (relation: Proof Graph 2.0)
- `Risk Disclosure Signed?` (checkbox)
- `Conversion Path` (text)
- `Git Pilot Doc` (URL) — link to the relevant Git pilot docs

### 3.3 Claims Register (upgrade)

**Add fields:**
- `Claim Ladder Level` (select: C1 Concept / C2 Built / C3 Pilot-ready / C4 Externally Validated / C5 Production)
- `Git Status Reference` (text) — product status that supports this claim
- `Proof Required` (relation: Proof Graph 2.0)
- `Proof Complete?` (formula: count of related Proofs where Outcome = Confirmed)
- `Approved Message` (text)
- `Public Use Allowed?` (checkbox)
- `Last Validated` (date)

### 3.4 Accounts CRM (upgrade)

**Add fields:**
- `ICP Segment` (select: ICP-1 through ICP-7)
- `Intelligence` (relation: Customer Intelligence)
- `Owner` (person)
- `Status` (select: Prospect / Active / Pilot / Customer / Past / Disqualified)
- `Last Contact` (date)

### 3.5 Execution Board (upgrade)

**Add fields:**
- `Related Signal` (relation: Institutional Signals)
- `Strategic Score` (relation: Strategic Scores)
- `Product` (relation: Product Portfolio)
- `Blocked By` (text)
- `Go/No-Go Date` (date)

### 3.6 Source Sync Register (upgrade)

**Add fields:**
- `Git Doc` (URL)
- `Notion DB` (relation)
- `Last Synced` (date)
- `Sync Status` (select: Synced / Drifted / Conflict / Not Synced)
- `Conflicts` (text)

---

## 4. Database Relation Map

```
Accounts CRM ────────── Customer Intelligence (1:1)
Accounts CRM ────────── Pilot Tracker (1:many)
Accounts CRM ────────── Founder Briefings (many:many)
Accounts CRM ────────── Institutional Signals (1:many)

Product Portfolio ───── Strategic Scores (1:1 per product score)
Product Portfolio ───── Pilot Tracker (1:many)
Product Portfolio ───── Claims Register (1:many)

Claims Register ─────── Proof Graph 2.0 (1:many)
Claims Register ─────── Founder Briefings (many:many)
Claims Register ─────── Institutional Signals (many:many)

Proof Graph 2.0 ─────── Pilot Tracker (many:1)
Proof Graph 2.0 ─────── Accounts CRM (many:1)

Institutional Signals ── Decision Reviews (many:1)
Institutional Signals ── Claims Register (many:1)
Institutional Signals ── Proof Graph 2.0 (many:1)
Institutional Signals ── Execution Board (many:many)

Decision Reviews ────── Founder Briefings (many:many)
Strategic Scores ────── Founder Briefings (reference only)
```

---

## 5. Implementation Order

| Phase | Databases | Time Estimate |
|---|---|---|
| **A — Core Intelligence** | Institutional Signals, Strategic Scores, Decision Reviews | 1 day |
| **B — Existing Upgrade** | Product Portfolio, Accounts CRM, Pilot Tracker, Claims Register, Decisions Log, CEO Dashboard | 2 days |
| **C — Proof & Intelligence** | Proof Graph 2.0, Customer Intelligence | 1 day |
| **D — Briefing & Governance** | Founder Briefings, Governance Rules, Templates | 1 day |
| **E — Automation Layer** | Meeting → Signals, Objection → Proof Needed, Claim → Proof | Ongoing |

---

## 6. Next Step

Proceed to `docs/archive/notion-export-2026/04-implementation-plan.md` — detailed implementation plan for all phases.
