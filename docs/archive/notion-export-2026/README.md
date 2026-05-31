> **Historical — not authoritative.** Notion OS strategic planning export (2026-05). Not product status authority. See docs/official/ and docs/source-of-truth/.

# AQLIYA Notion Operating System — Usage Guide

> **Trust principle:** AI assists. Humans decide. Evidence governs.
> **Last updated:** 2026-05-30 (Parallel Phase)

---

## What This Is

AQLIYA's Notion OS is the **Intelligence Command Layer** — it does NOT replace the AQLIYA application, Git docs, or product workflows. It is the team's operational brain for commercial intelligence, strategic signals, decision quality, and founder briefing.

---

## Database Map

| Database | Status | Purpose |
|---|---|---|
| **Proof Library** 🔬 | ⬆️ Upgraded (5 fields added) | Evidence chain: Claim→Proof→Pilot→Account→Outcome |
| **Decisions Log** 📝 | ⬆️ Upgraded (6 fields added) | Decision quality scoring + review cycle |
| **Accounts CRM** 👥 | ⬆️ Upgraded (9 fields added) | BATRAP intelligence + objection tracking |
| **Product Portfolio** 📦 | ⬆️ Upgraded (8 fields added) | Product strategic scoring |
| **Observations** 👁️ | ✅ NEW | Raw observations from meetings, calls, sources |
| **Signals** 📡 | ✅ NEW | Structured intelligence → decision/task/proof |
| **Learnings** 📚 | ✅ NEW | Institutional knowledge synthesis |
| **Risks** ⚠️ | ✅ NEW | Risk tracking linked to signals |
| Claims Register | ⬆️ Unchanged | Commercial claims with proof linking |
| Pilot Tracker | ⬆️ Unchanged | Pilot evidence tracking |
| ICP Register | 🔒 Unchanged | Ideal Customer Profile segments |
| Roadmap | 🔒 Unchanged | Strategic roadmap |
| Execution Board | 🔒 Unchanged | Operational execution |
| Source Sync Register | 🔒 Unchanged | Git↔Notion reconciliation |
| External Messaging Register | 🔒 Unchanged | Approved commercial messaging |
| Documentation Authority | 🔒 Unchanged | Docs hierarchy governance |
| Conflicts Register | 🔒 Unchanged | Decision conflicts tracking |

---

## How to Use Each Database

### Observations 👁️ — Capture Raw Intelligence

**When to create an entry:**
- After every customer meeting, call, or conversation
- After internal strategy discussions
- When noticing market/competitive/regulatory signals
- After product usage review or demo
- Within 24 hours of the observation

**Entry workflow:**
1. Note the source type and provide a raw note
2. Link to related Product and/or Account if applicable
3. Weekly review: convert high-value observations to Signals

### Signals 📡 — Convert Observations to Actionable Intelligence

**When to create an entry:**
- When an observation has strategic significance
- When a pattern is noticed across multiple observations
- When competitive, market, or risk information is confirmed

**Entry workflow:**
1. Create with Impact and Confidence ratings
2. Link back to source Observation, Claim, Proof, or Decision
3. If action required: check "Action Required" and create linked task/decision
4. Track conversion: set "Converted to Task?" or "Converted to Decision?"

### Learnings 📚 — Institutionalize Knowledge

**When to create an entry:**
- When a signal repeats or is confirmed
- After a decision outcome is known
- When a pilot completes or produces insight
- Weekly: synthesize top signals into learnings

### Risks ⚠️ — Capture Emerging Risks

**When to create an entry:**
- When a signal indicates potential negative outcome
- When a decision carries execution risk
- When market/competitive/compliance conditions change
- Weekly review: update status and reassess probability

### Proof Library 🔬 — The Spine of "Evidence Governs"

**When to create an entry:**
- Before any external commercial claim is made
- After any test, pilot, or customer interaction that produces evidence
- When an objection is raised that requires proof
- Weekly: reverify existing proof entries

**Entry workflow:**
1. **Create entry** — link to the commercial claim from Claims Register
2. **Document proof** — what evidence exists, where it came from
3. **Set verification level** — P0 (internal) / P1 (controlled pilot) / P2 (external pilot) / P3 (paid reference)
4. **Draft approved message** — exact external phrasing
5. **Get approval** — founder/CEO sets `Public Use Allowed?`
6. **Set verification date** — re-verify in 30 days

**The Proof Gate (hard rule):**
> No external claim may be used unless the full chain exists:
> **Claim → Proof → Source → Customer/Pilot → Outcome → Approved Message**

Without this chain: the claim is **not safe to use externally**.

### Signals 📡 — Intelligence Intake

**When to create an entry:**
- After every customer meeting, call, or email
- After every internal strategy discussion
- When you read market news or competitive intelligence
- When you receive an objection or question from a prospect
- After every pilot interaction or feedback session

**Entry workflow:**
1. **Create entry** within 24 hours of the intelligence event
2. **Be specific** — "Prospect X asked about data residency" NOT "customer stuff"
3. **Set Impact and Confidence** honestly
4. **Set Action Required** — if action is needed, create a linked task
5. **Link to related entities** — account, product, claim, proof, decision
6. **Track conversion** — set "Converted to Task?" or "Converted to Decision?"

**Signal lifecycle:**
- `Captured` → `Analyzed` (during weekly review) → `Actioned` → `Closed`

### Learnings 📚 — Institutional Knowledge

**When to create an entry:**
- When a signal repeats or is confirmed
- After reviewing a decision outcome
- After a pilot completes
- Weekly: synthesize key signals into learnings

**Entry workflow:**
1. Link to the source Signals that produced this learning
2. Classify by Lesson Type (Product/Customer/Market/Process/Technical/Strategic/Governance)
3. Rate Strategic Impact (Transformative/High/Moderate/Minor/Informational)
4. Document Action Taken (what was done as a result)
5. Mark as Reusable? if applicable to other products or accounts

---

## Relations Between Databases

```
┌──────────────────────────────────────────────────────────┐
│                    CORE EVIDENCE CHAIN                    │
│  Claim ──→ Proof ──→ Pilot ──→ Outcome ──→ Verification  │
│                        ↓                                  │
│                     Account (CRM)                         │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│               INSTITUTIONAL MEMORY CHAIN                  │
│  Observation ──→ Signal ──→ Learning ──→ Decision        │
│                    ↓             ↓                         │
│                   Risk       Product Change               │
│                              Proof Update                 │
│                              Task Creation                │
└──────────────────────────────────────────────────────────┘
```

### Cross-Database Relations

| From | To | Via |
|------|----|-----|
| Proof Library | Claims Register | Supports Claim |
| Proof Library | Pilot Tracker | Pilot |
| Proof Library | Accounts CRM | Account |
| Proof Library | Product Portfolio | Product |
| Proof Library | Signals | Related Proof |
| Decisions Log | Product Portfolio | Product |
| Accounts CRM | Proof Library | Proof Needed |
| Accounts CRM | Product Portfolio | Primary Product |
| Accounts CRM | Pilot Tracker | Related Pilot |
| Accounts CRM | ICP Register | ICP Segment |
| Signals | Observations | Related Observation |
| Signals | Claims Register | Related Claim |
| Signals | Proof Library | Related Proof |
| Signals | Decisions Log | Related Decision |
| Signals | Accounts CRM | Account |
| Signals | Product Portfolio | Product |
| Learnings | Signals | Source Signals |
| Learnings | Accounts CRM | Account |
| Learnings | Product Portfolio | Product |
| Risks | Signals | Related Signal |
| Risks | Accounts CRM | Account |
| Risks | Product Portfolio | Product |

---

## Weekly Intelligence Review (every Monday, 30 min)

1. **Signals review** — New Signals view (last 7 days) — 5 min
2. **Risks review** — Unresolved Risks view — 3 min
3. **Proof verification** — Missing Verification view — 5 min
4. **Decision review** — Decisions Waiting Review view — 5 min
5. **Claims drift check** — Claims Register vs PRODUCT_STATUS_MATRIX — 5 min
6. **Learnings capture** — Convert top signal to Learning if pattern confirmed — 3 min
7. **Account updates** — Critical Follow-ups view — 4 min

---

## Governance Quick Reference

| Rule | Summary |
|---|---|
| Git wins | If Notion and Git conflict on product status, Git wins. Fix Notion. |
| Proof Gate | No external claim without: Claim → Proof → Source → Account → Outcome → Verification |
| Verification ladder | Screenshot Only → Demo Verified → Code Verified → Test Verified → Customer Verified → Revenue Verified |
| Public use | Only when: Can Be Public? = Yes AND Customer-Safe? = Yes AND Verification ≥ Customer Verified |
| Claim integrity | Every Claim must link to at least one Proof record before external use |
| Decision review | Every decision scored at creation. Review date set by reversibility (30-365 days). |
| Memory rhythm | Weekly: Observations → Signals → Learnings. Monthly: Risk reassessment. |

---

## CEO Dashboard — Available Views

The following views exist in the system and can be added to the CEO Dashboard page:

| Section | Source Database | Filter/Sort |
|---|---|---|
| **🛡️ Proof Gate Risks** | Proof Library | Sorted by Risk Level DESC |
| **👁️ Account-Verified Proof** | Proof Library | Account not empty |
| **🔬 Missing Verification** | Proof Library | Screenshot Only / Demo Verified |
| **🔗 Proof Linked to Pilot** | Proof Library | Pilot not empty |
| **✅ Public-Approved Proof** | Proof Library | Customer Verified |
| **📋 Decisions Waiting Review** | Decisions Log | Review Date not empty |
| **❌ Failed / Underperforming** | Decisions Log | Unsuccessful / Partially Successful |
| **🏆 Successful Decisions** | Decisions Log | Successful |
| **📈 High Conversion Probability** | Accounts CRM | High / Very High |
| **📎 Proof Needed by Account** | Accounts CRM | Proof Needed not empty |
| **🔴 Critical Follow-ups** | Accounts CRM | Priority = Critical |
| **🧪 Pilot Candidates** | Accounts CRM | Stage = Demo Completed |
| **📊 Objection Patterns** | Accounts CRM | Board by Objections |
| **⚠️ Weak Authority / Low Trust** | Accounts CRM | User / Influencer |
| **🎯 Product Focus Board** | Product Portfolio | Board by Strategic Importance |
| **🏅 Highest Strategic Score** | Product Portfolio | Sorted by Product Score DESC |
| **🚨 Low Proof / High Claim Risk** | Product Portfolio | Evidence = None / Internal Demo |
| **⚡ Products Needing Action** | Product Portfolio | Risk = High / Critical |
| **📡 New Signals** | Signals | Sorted by Created Date DESC |
| **🔥 High Impact Signals** | Signals | Impact = Critical / High |
| **📚 Recent Learnings** | Learnings | Sorted by Date DESC |
| **⚠️ Unresolved Risks** | Risks | Status = Active / Monitoring |

---

## File Structure

```
docs/archive/notion-export-2026/
├── README.md                         ← This file — usage guide
├── 01-current-state-audit.md         ← Phase 1: Current state
├── 02-gap-analysis.md                ← Phase 2: Gap analysis
├── 03-target-architecture-v2.md      ← Phase 3: Target architecture
├── 04-implementation-plan.md         ← Phase 4: Implementation plan
├── 05-templates.md                   ← Phase 5: Entry templates
├── 06-governance-rules.md            ← Phase 6: Governance rules
├── 07-ceo-dashboard-v2.md            ← Phase 7: CEO Dashboard v2 design
├── 08-final-recommendation.md        ← Phase 8: Executive recommendation
├── 09-phase-a-execution-report.md    ← Phase A initial execution report
├── 10-full-notion-asset-inventory.md ← Phase 0: Complete DB inventory
├── 11-aqliya-knowledge-graph.md      ← Phase 1: Entity graph analysis
├── 12-institutional-memory-system.md ← Phase 2: Memory DB designs
├── 13-proof-governance-system.md     ← Phase 3: Proof upgrade design
├── 14-decision-intelligence.md       ← Phase 4: Decision upgrade design
├── 15-customer-intelligence.md       ← Phase 5: CRM upgrade design
├── 16-product-intelligence.md        ← Phase 6: Product upgrade design
├── 17-founder-command-system.md      ← Phase 7: Command design
├── 18-ceo-dashboard-v3.md            ← Phase 8: Dashboard redesign
├── 19-ai-command-layer.md            ← Phase 9: AI future design
├── 20-aqliya-notion-evolution-roadmap.md ← Phase 10: 3-year roadmap
├── 21-executive-verdict.md           ← Executive summary
├── 22-agent-1-proof-graph-execution.md   ← Agent report: Proof upgrade
├── 23-agent-2-decision-intelligence-execution.md ← Agent report: Decision upgrade
├── 24-agent-3-customer-intelligence-execution.md ← Agent report: CRM upgrade
├── 25-agent-4-product-intelligence-execution.md ← Agent report: Product upgrade
├── 26-agent-5-institutional-memory-execution.md ← Agent report: Memory build
├── 27-agent-6-ceo-dashboard-v3-execution.md   ← Agent report: Dashboard
├── 28-notion-v1-implementation-summary.md     ← Implementation summary
└── 29-final-parallel-execution-report.md     ← Final integrated report
```

---

## How to Update This Guide

When adding new databases or changing workflows:
1. Update the Database Map table
2. Add usage instructions for new databases
3. Update the Relations section
4. Update the Weekly Review section
5. Cross-reference with governance rules
6. Notify the team
