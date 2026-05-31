# Founder Command System — Daily / Weekly / Monthly Intelligence

Status: Design
Date: 2026-05-30
Prerequisite: docs/archive/notion-export-2026/12, 14, 15, 16

---

## 1. DESIGN PRINCIPLES

- Answer automatically: What matters now? What should stop? Biggest opportunity? Biggest risk?
- Aggregate from existing databases — no new data entry burden
- Three cadences: Daily (5 min), Weekly (30 min), Monthly (2 hours)
- Low-touch: Founder reviews, not enters

---

## 2. DAILY INTELLIGENCE (5 MIN)

### Morning Scan

Read from CEO Dashboard:

| What | Source | Format |
|---|---|---|
| New Signals | Signals DB (Status = New) | 1-line list |
| Overdue Decisions | Decisions Log (Review Date ≤ Today) | 1-line list |
| Critical Account Events | Accounts CRM (Stage change, Next Step today) | 1-line list |
| Active Risks | Risks DB (Status = Identified/Mitigating) | Top 3 |
| Today's Tasks | Execution Board (Due Today) | Kanban |

### Daily Dashboard View

Single page showing:
```
🔴 CRITICAL TODAY
- Signal: Customer X concerned about pricing [New]
- Decision: LocalContentOS v0.1 scope review overdue [Day 14]
- Risk: SalesOS demo making unauthorized claims [Active]

📡 NEW SIGNALS (3)
- [Market] Competitor Y launched audit AI feature
- [Customer] BigCo interested but needs compliance proof
- [Product] Pilot user struggling with TB upload

✅ TODAY'S TASKS (2)
- Prepare compliance proof pack for BigCo
- Review SalesOS demo script

📊 PIPELINE TODAY
- Demo: BigCo at 2pm
- Follow-up: MidCorp proposal review
```

---

## 3. WEEKLY INTELLIGENCE (30 MIN)

### Weekly Founder Review Enhanced

Based on current Weekly Founder Review template, enhanced with:

### Section 1: What Moved?

Auto-aggregated from:
- Products: Status changes, milestones hit
- Accounts: Stage changes, new contacts
- Pilots: Stage changes, outcomes
- Signals: New signals by type
- Decisions: New decisions, pending reviews

### Section 2: What is Blocked?

From:
- Execution Board (Status = Blocked)
- Risks DB (Status = Realized)
- Pilots (Current Risk = High)

### Section 3: What Can Be Sold?

From:
- Product Portfolio (Maturity >= L4, Customer Demo Status = Safe)
- Evidence Level (>= Customer Verified)

### Section 4: What is Forbidden to Say?

From:
- External Messaging Register (Status = Needs Review, Rejected)
- Conflicts Register (Status = Open)
- Claims Register (Status = Needs Proof)

### Section 5: Who is the Next Customer?

From:
- Accounts CRM sorted by Conversion Probability DESC, Priority DESC
- Top 5 accounts

### Section 6: What Decision is Required?

From:
- Decisions Log (Review Date ≤ Today)
- Signals (Status = New/Acknowledged, Urgency = Now/This Week)

### Section 7: Proof Watch

From:
- Proof Library (Expiry Date < 30 days)
- Claims Register (Status = Needs Proof)

### Section 8: Stop Doing

Founder manually fills (no auto-source):

| What to Stop | Why | Impact |
|---|---|---|
| — | — | — |

---

## 4. MONTHLY INTELLIGENCE (2 HOURS)

### Section 1: Decision Quality Review

| Area | Decisions This Month | Quality Score | Key Learnings |
|---|---|---|---|
| Product Strategy | — | — | — |
| Commercial | — | — | — |
| Architecture | — | — | — |

### Section 2: Signal Pattern Analysis

| Signal Type | Count | Actionable | Key Theme |
|---|---|---|---|
| Customer Signals | — | — | — |
| Market Signals | — | — | — |
| Product Signals | — | — | — |
| Competitive | — | — | — |

### Section 3: Pilot Performance

| Pilot | Outcome | Evidence Produced | Strategic Value |
|---|---|---|---|
| — | — | — | — |

### Section 4: Commercial Pipeline

| Stage | Count | Value | Top 3 Accounts |
|---|---|---|---|
| Discovery | — | — | — |
| Demo | — | — | — |
| Pilot Proposed | — | — | — |
| Pilot Active | — | — | — |

### Section 5: Product Score Update

Re-score each product on Market Pull, Revenue Potential, Evidence Level.

### Section 6: Proof Inventory

| Verification Level | Count | Expiring < 30 days | Missing |
|---|---|---|---|
| Screenshot Only | — | — | — |
| Demo Verified | — | — | — |
| Code/Test Verified | — | — | — |
| Customer Verified | — | — | — |
| Revenue Verified | — | — | — |

### Section 7: Next Month Priorities

Auto-suggested from:
- Strategic Importance = Core AND Evidence Level < Customer Verified
- Signals: Urgency = Now
- Risks: Probability = High, Impact = Critical
- Decisions: Review Date overdue

---

## 5. NOTION COMMAND PAGE

Create a single page `🏗️ Founder Command` under HQ with:

### Integrated Views

```
┌─────────────────────────────────────────────────────────┐
│ 🏗️ FOUNDER COMMAND — AQLIYA                              │
├─────────────────────────────────────────────────────────┤
│ 📡 SIGNALS TODAY          ⚠️ RISKS TODAY                  │
│ [Signals DB, filter: New] [Risks DB, filter: Active]     │
├─────────────────────────────────────────────────────────┤
│ ✅ TODAY'S TASKS           📊 PIPELINE TODAY               │
│ [Exec Board, filter: Due] [Accounts CRM, sorted by Prob] │
├─────────────────────────────────────────────────────────┤
│ 🔍 PENDING DECISIONS      🔬 PROOF WATCH                 │
│ [Decisions, filter: Review] [Proof, filter: Expiring]     │
├─────────────────────────────────────────────────────────┤
│ ⏹️ STOP DOING (manual)                                   │
│ -                                                       │
└─────────────────────────────────────────────────────────┘
```

### Weekly Review Template Header

Link to existing Weekly Founder Review enhanced with all 8 sections.

---

## 6. EXECUTION PLAN

1. CREATE Signals DB (Phase 2 prerequisite)
2. CREATE Risks DB (Phase 2 prerequisite)
3. UPGRADE Decisions Log with quality fields
4. UPGRADE Product Portfolio with intelligence fields
5. UPGRADE Accounts CRM with intelligence fields
6. CREATE new HQ section "Institutional Intelligence" with signal/risk/learning views
7. UPDATE Weekly Founder Review template with 8 sections
8. RUN first weekly review
