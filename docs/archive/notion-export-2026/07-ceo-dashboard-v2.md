# AQLIYA Notion OS — CEO Dashboard v2

**Author:** OpenCode Agent — Notion OS Build  
**Date:** 2026-05-30  
**Authority:** This is a design proposal. Implements `docs/archive/notion-export-2026/03-target-architecture-v2.md` §2.5 and §3.6.  
**Prerequisite:** All Phase A-D databases must be populated before this dashboard is useful.

---

## 0. Design Philosophy

The CEO Dashboard is an **aggregator**, not a standalone page. It reads from all other Notion databases and presents a unified intelligence surface. If data is missing from the underlying databases, the dashboard shows gaps — not fake data.

**Principles:**
1. Every block pulls from a source database — no manual data entry on the dashboard
2. If a source database has a gap, the dashboard shows the gap (not fabricated data)
3. The dashboard is updated automatically when source data changes
4. The dashboard has ONE purpose: tell the founder what to do today

---

## 1. Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  AQLIYA CEO DASHBOARD v2                               [Last synced] │
│  Trust principle: AI assists. Humans decide. Evidence governs.      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─ TODAY'S CRITICAL MOVE ─────────────────────────────────────┐   │
│  │  [Single action from latest Founder Briefing]                │   │
│  │  Source: Founder Briefings (latest, type=Daily or Weekly)    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─ TOP PRODUCT FOCUS ──────┐  ┌─ REVENUE PIPELINE ────────────┐   │
│  │ Product with highest     │  │ Total pipeline value           │   │
│  │ Invest score from        │  │ # active opportunities         │   │
│  │ Strategic Scores         │  │ Weighted pipeline              │   │
│  │                          │  │ Source: Customer Intelligence  │   │
│  │  Last scored: [date]     │  │ + Accounts CRM                 │   │
│  └──────────────────────────┘  └────────────────────────────────┘   │
│                                                                     │
│  ┌─ ACCOUNTS NEEDING ACTION ──┐  ┌─ PILOTS AT RISK ─────────────┐   │
│  │ Accounts with:             │  │ Pilots where:                 │   │
│  │  • Next Best Action ≠ None │  │  • Risk Disclosure not signed│   │
│  │  • Not updated > 14 days   │  │  • Outcome = Extended/No-Go  │   │
│  │  • Conversion > 50%        │  │  • Stalled > 14 days         │   │
│  │  • Trust Level = Low       │  │                               │   │
│  │                            │  │ Source: Pilot Tracker         │   │
│  │ Source: Customer Intel     │  │                               │   │
│  └────────────────────────────┘  └───────────────────────────────┘   │
│                                                                     │
│  ┌─ CLAIMS NEEDING PROOF ────┐  ┌─ CLAIMS FORBIDDEN EXTERNALLY ─┐   │
│  │ Claims where:             │  │ Claims that:                   │   │
│  │  • No linked proof        │  │  • Exceed product Git status   │   │
│  │  • Proof = Untested       │  │  • Not approved for public use │   │
│  │  • Proof = Expired        │  │  • Are C1 (future/planned)     │   │
│  │                           │  │  • Violate forbidden list      │   │
│  │ Source: Claims Register   │  │                               │   │
│  │        + Proof Graph 2.0  │  │ Source: Claims Register        │   │
│  └───────────────────────────┘  └───────────────────────────────┘   │
│                                                                     │
│  ┌─ DECISIONS WAITING ───────┐  ┌─ SOURCE SYNC CONFLICTS ───────┐   │
│  │ Decisions where:          │  │ Source sync entries where:     │   │
│  │  • Pending outcome        │  │  • Status ≠ Synced             │   │
│  │  • Review date overdue    │  │  • Conflict detected           │   │
│  │  • Blocked on founder     │  │                               │   │
│  │                           │  │ Source: Source Sync Register   │   │
│  │ Source: Decision Reviews  │  │                               │   │
│  └───────────────────────────┘  └───────────────────────────────┘   │
│                                                                     │
│  ┌─ PROOF CREATED THIS WEEK ──┐  ┌─ PRODUCT MATURITY CHANGES ──┐   │
│  │ Count of Proof Graph 2.0   │  │ Products where:              │   │
│  │ entries where              │  │  • Notion Level ≠ Git Status │   │
│  │ Last Verified > 7 days ago │  │  • Not reconciled in 7 days  │   │
│  │                            │  │  • Level changed             │   │
│  │ Source: Proof Graph 2.0    │  │                               │   │
│  └────────────────────────────┘  │ Source: Product Portfolio     │   │
│                                  └───────────────────────────────┘   │
│  ┌─ STOP DOING ─────────────────────────────────────────────────┐   │
│  │  [From latest Founder Briefing]                               │   │
│  │  Source: Founder Briefings (latest)                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─ QUICK LINKS ───────────────────────────────────────────────┐   │
│  │  [Weekly Briefing] [New Signal] [New Decision] [Proof Gate]  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Blocks — Specifications

### Block 1: Today's Critical Move

| Aspect | Detail |
|---|---|
| **Source** | Founder Briefings database, latest entry where Type = Daily or Weekly |
| **Field** | `Critical Move` |
| **Display** | Large, bold, single line |
| **Empty state** | "No critical move set for today. Create a Founder Briefing." |
| **Refresh** | Every time a new briefing is created |
| **Note** | If no briefing exists for today, show latest. If no briefing at all, show empty state prominently. |

### Block 2: Top Product Focus

| Aspect | Detail |
|---|---|
| **Source** | Strategic Scores database, Object Type = Product, sorted by Strategic Score desc, first result where Recommended Action = Invest |
| **Fields** | Object, Strategic Score, Market Pull, Technical Readiness, Review Date |
| **Display** | Product name + score + last reviewed date |
| **Empty state** | "No products scored. Add entries to Strategic Scores." |
| **Note** | If no products have Invest recommendation, show top-scored product with "(Maintain)" label |

### Block 3: Revenue Pipeline

| Aspect | Detail |
|---|---|
| **Source** | Customer Intelligence database |
| **Computation** | Sum of estimated deal values from Accounts CRM or Customer Intelligence (Revenue Amount field from Founder Briefings as fallback) |
| **Fields** | Total pipeline value ($), # of active opportunities, # hot (conversion > 60%) |
| **Empty state** | "No pipeline data. Update Customer Intelligence." |
| **Note** | This is a rough estimate, not a CRM report. Accuracy depends on consistent data entry. |

### Block 4: Accounts Needing Action

| Aspect | Detail |
|---|---|
| **Source** | Customer Intelligence database |
| **Filter** | Any account where: (a) Next Best Action ≠ "Nurture" or "Disqualify" AND (Not updated in 14 days OR Conversion Probability > 50% OR Trust Level = "Low" OR Trust Level = "Damaged") |
| **Display** | Account name, Next Best Action, Conversion Probability, days since last update |
| **Limit** | Top 5, sorted by urgency (Conversion Probability desc, then days since update desc) |
| **Empty state** | "No accounts needing immediate action." |
| **Note** | If more than 5 accounts need action, add a "(+N more)" link |

### Block 5: Pilots at Risk

| Aspect | Detail |
|---|---|
| **Source** | Pilot Tracker database |
| **Filter** | Any pilot where: Outcome ≠ "Completed" AND Outcome ≠ "No-Go" AND (Risk Disclosure Signed? = false OR Stalled > 14 days OR Outcome = "Extended") |
| **Display** | Pilot name, Customer, days since last update, risk reason |
| **Limit** | Top 5 |
| **Empty state** | "No pilots at risk." |
| **Note** | If a pilot has been in "In Progress" for > 30 days without update, flag it |

### Block 6: Claims Needing Proof

| Aspect | Detail |
|---|---|
| **Source** | Claims Register database + Proof Graph 2.0 relation |
| **Filter** | Claims where: Proof Required is empty (no proof linked) OR related Proof has Outcome = "Untested" OR related Proof has Status = "Expired" |
| **Display** | Claim, Claim Ladder Level, Product, missing proof detail |
| **Limit** | Top 5 |
| **Empty state** | "All claims have linked proof." (unlikely — celebrate when true) |
| **Note** | This is the most important governance block. If claims are being used without proof, this block will flag them. |

### Block 7: Claims Forbidden Externally

| Aspect | Detail |
|---|---|
| **Source** | Claims Register database |
| **Filter** | Claims where: Claim Ladder Level > Product Git status level OR Proof Graph Public Use Allowed? = false OR Claim Ladder Level = C1 OR Claim violates forbidden list (Rule 3) |
| **Display** | Claim, reason forbidden, action to fix |
| **Limit** | Top 5 |
| **Empty state** | "No claims are forbidden." (verify against forbidden list — if state is empty but forbidden claims exist, the filter is broken) |
| **Note** | This is a commercial risk indicator. Every item here is a claim that could cause reputational or legal damage if used externally. |

### Block 8: Decisions Waiting

| Aspect | Detail |
|---|---|
| **Source** | Decision Reviews database |
| **Filter** | Decisions where: Outcome Status = "Pending" AND (Review Date < today OR Review Date < 30 days from creation) |
| **Display** | Decision, Decision Date, Review Date, days overdue |
| **Limit** | Top 5 |
| **Empty state** | "No pending decisions." |
| **Note** | Founder should check this daily. Blocked decisions block execution. |

### Block 9: Source Sync Conflicts

| Aspect | Detail |
|---|---|
| **Source** | Source Sync Register database |
| **Filter** | Entries where Sync Status = "Conflict" or "Drifted" |
| **Display** | Git Doc, Notion DB, Sync Status, Conflicts summary |
| **Limit** | Top 5 |
| **Empty state** | "All sources in sync." |
| **Note** | Conflicts must be resolved within 24 hours. Drifted status within 7 days. |

### Block 10: Proof Created This Week

| Aspect | Detail |
|---|---|
| **Source** | Proof Graph 2.0 database |
| **Computation** | Count of entries where Last Verified >= 7 days ago |
| **Display** | Number + list of new proof entries |
| **Empty state** | "No proof created this week." |
| **Note** | Zero proof created in a week is a signal. Either no claims are being used (good) or governance is being bypassed (bad). |

### Block 11: Product Maturity Changes

| Aspect | Detail |
|---|---|
| **Source** | Product Portfolio database |
| **Filter** | Products where: `Git Status Verified Date` > 7 days OR `Notion Level` ≠ Git status |
| **Display** | Product, Notion Level, Git Status, Last Reconciliation, days overdue |
| **Limit** | All products with conflicts |
| **Empty state** | "All product statuses reconciled with Git." |
| **Note** | If a product's status was upgraded in Git (e.g., SalesOS L3→L4), Notion must be updated within 24 hours. If it was downgraded, claims must be updated. |

### Block 12: Stop Doing

| Aspect | Detail |
|---|---|
| **Source** | Founder Briefings database, latest entry |
| **Field** | `Stop Doing` |
| **Display** | Full text of Stop Doing from latest briefing |
| **Empty state** | "No stop-doing items set." (If this is always empty, the founder is not prioritizing.) |
| **Note** | Stop Doing is the hardest column. If it's consistently empty, the team is not saying no to anything. |

---

## 3. View Options

The CEO Dashboard should have multiple views:

| View | Purpose | Filter |
|---|---|---|
| **Daily View** | What I need to do today | Critical Move, Decisions Waiting, Accounts Needing Action, Stop Doing |
| **Weekly Review View** | Weekly intelligence review | All blocks |
| **Risk View** | What could go wrong | Pilots at Risk, Claims Forbidden, Claims Needing Proof, Source Sync Conflicts |
| **Commercial View** | Revenue and accounts | Revenue Pipeline, Accounts Needing Action, Customer Intelligence |
| **Product View** | Product focus and health | Top Product Focus, Product Maturity Changes, Strategic Scores |

---

## 4. Implementation Notes

### In Notion
CEO Dashboard v2 is implemented as a Notion page with linked database views and rollups. It is NOT a standalone database — it is a surface that shows data from other databases.

**Technical approach:**
1. Create a CEO Dashboard v2 page
2. Add linked database views for each of the 12 blocks (filtered as specified)
3. Use rollup fields where counts/aggregations are needed
4. Add the Founder Briefing as an inline view (latest entry, Critical Move prominent)
5. Add quick-link buttons to create new entries in source databases
6. Archive the old CEO Dashboard or keep as reference

### Stale Data Warning
If the dashboard shows empty blocks for populated databases, the linked views may be misconfigured. The dashboard should include a "Data Health" indicator that shows how many source databases have been updated in the last 7 days:

```
Data Health: Signals ✅ | Scores ✅ | Decisions ⚠️ (3d stale) | Intel ✅ | Proof ✅ | Briefing ✅
```

---

## 5. Success Criteria

| Criterion | Measurement |
|---|---|
| Founder uses dashboard daily | Dashboard is the founder's first-view each morning |
| Critical Move is set every day | Founder Briefing has Critical Move for every day or weekly |
| Claims needing proof < 3 | Most claims are linked to proof |
| Claims forbidden == 0 | No active claims violate commercial truth rules |
| Decisions waiting < 3 | Decisions are being reviewed on schedule |
| Source sync conflicts == 0 | Git and Notion are reconciled weekly |
| Proof created weekly > 0 | The team is capturing evidence consistently |
| Product statuses reconciled weekly | Product Portfolio `Git Status Verified Date` < 7 days for all products |

---

## Next Step

Proceed to `docs/archive/notion-export-2026/08-final-recommendation.md` — final executive recommendation.
