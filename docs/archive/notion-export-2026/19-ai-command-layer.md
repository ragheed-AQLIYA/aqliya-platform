# AI Command Layer — Design Document

Status: Design Only — NOT for implementation
Date: 2026-05-30
Note: Do NOT implement any AI capability until at least Phase D of the evolution roadmap. This document designs the target architecture.

---

## 1. PRINCIPLES

- AI assists. Humans decide. Evidence governs.
- Every AI output must link to source data in Notion
- No autonomous decisions
- No AI-generated external claims without approval
- Audit trail required for every AI action

---

## 2. CAPABILITY MAP

### Layer 1: Intelligence Aggregation (Read-only)

| Capability | Description | Data Source |
|---|---|---|
| Daily Briefing | Auto-summarize new signals, risks, overdue decisions | Signals, Risks, Decisions |
| Weekly Intelligence Report | Auto-generate weekly report from all systems | All databases |
| Signal Clustering | Group related signals into themes | Signals |
| Pilot Progress Report | Auto-summary of active pilots | Pilot Tracker |

### Layer 2: Decision Support (Suggestions, not decisions)

| Capability | Description | Data Source |
|---|---|---|
| Decision Assistant | Given context+options, suggest best option with confidence | Decisions Log (historical) |
| Outcome Predictor | Predict outcome probability for new decisions | Decisions Log patterns |
| Risk Monitor | Flag risks from signal patterns | Signals + Risks |

### Layer 3: Governance Enforcement (Validation)

| Capability | Description | Data Source |
|---|---|---|
| Claim Validator | Check if claim has sufficient proof before approval | Claims + Proof |
| Proof Auditor | Check proof expiry, verification levels, completeness | Proof Library |
| Objection Analyzer | Pattern-match objections across accounts | Accounts CRM |
| Message Compliance | Check external message against approved wording | External Messaging |

### Layer 4: Intelligence Agents (Synthesis)

| Capability | Description | Data Source |
|---|---|---|
| Customer Intelligence Agent | Synthesize all data on an account for sales prep | Accounts, Signals, Proof, Decisions |
| Product Intelligence Agent | Auto-update product score from evidence changes | Product, Proof, Pilots |
| Market Signal Agent | Flag market changes from captured signals | Signals |
| Decision Pattern Agent | Quarterly analysis of decision quality by area | Decisions Log |

---

## 3. DATA READINESS ASSESSMENT

| Capability | Data Required | Readiness | Gap |
|---|---|---|---|
| Daily Briefing | Signals, Risks, Decisions | NOT READY | Signals and Risks DBs don't exist |
| Weekly Report | All DBs with quality data | NOT READY | Quality fields not populated |
| Decision Assistant | 20+ scored decisions | NOT READY | 6 decisions, no quality scoring |
| Claim Validator | Claims + Proof linked | MOSTLY READY | Relations exist, need verification |
| Proof Auditor | Expiry dates, verification levels | PARTIALLY | Expiry dates not implemented |
| Signal Clustering | 50+ signals | NOT READY | Signal DB doesn't exist |

### Current AI Readiness: L1 (No data infrastructure)

AI layer requires:
1. All 4 new institutional memory databases (Observations, Signals, Learnings, Risks)
2. All quality scoring fields populated (Decision Quality, Product Score, etc.)
3. Minimum 3 months of data across all systems
4. All missing relations implemented

---

## 4. IMPLEMENTATION PREREQUISITES

### Database Prerequisites

| Phase | Database | AI Dependency |
|---|---|---|
| Phase B | Observations | Daily Briefing raw material |
| Phase B | Signals | Daily Briefing + Signal Clustering + Market Signal Agent |
| Phase B | Risks | Risk Monitor |
| Phase B | Learnings | Decision Pattern Agent |
| Phase C | Decision Reviews | Decision Assistant + Outcome Predictor |
| Phase C | Product Scoring | Product Intelligence Agent |
| Phase C | Customer Scoring | Customer Intelligence Agent |

### Data Volume Prerequisites

| Capability | Minimum Records |
|---|---|
| Signal Clustering | 50+ signals |
| Decision Assistant | 20+ scored decisions |
| Outcome Predictor | 30+ decisions with outcomes |
| Customer Intelligence | 15+ accounts with BATRAP scores |

### Timeline

Based on typical data accumulation:
- Phase B complete: 30 days → 10-15 signals, 5-8 decisions
- Phase C complete: 90 days → 30-40 signals, 15-20 decisions
- Phase D complete: 6 months → 60+ signals, 30+ decisions
- AI ready: 6-12 months

---

## 5. ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    AQLIYA AI COMMAND LAYER                    │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  BRIEFING    │  │  DECISION   │  │ GOVERNANCE  │         │
│  │  AGENTS      │  │  AGENTS     │  │ AGENTS      │         │
│  │              │  │             │  │             │         │
│  │ Daily Brief  │  │ Decision   │  │ Claim Valid │         │
│  │ Weekly Report│  │ Assistant   │  │ Proof Audit │         │
│  │ Signal Digest│  │ Outcome Pred│  │ Message Check│        │
│  └──────┬───────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                 │                 │                │
│  ┌──────▼─────────────────▼─────────────────▼──────┐        │
│  │              NOTION DATA LAYER                   │        │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │        │
│  │  │Sig. │ │Risk │ │Dec. │ │Proof│ │CRM  │ ...    │        │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘       │        │
│  └─────────────────────────────────────────────────┘        │
│                                                             │
│  ┌─────────────────────────────────────────────────┐        │
│  │              EXTERNAL AI PROVIDER                 │        │
│  │  (Anthropic Claude — primary)                    │        │
│  │  (No sensitive data to external providers)       │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. GOVERNANCE RULES FOR AI

| Rule | Detail |
|---|---|
| No autonomous decisions | Every AI suggestion requires human review |
| Source transparency | Every AI output must cite its Notion sources |
| Confidence displayed | Every AI output must show confidence level |
| Audit trail | Every AI action logged in Decisions/Proof |
| No external data | AI only accesses Notion data, no external enrichment |
| Human override | Any AI suggestion can be overridden by human |
| Stale data warning | If source data is >30 days old, AI must warn |

---

## 7. REQUESTED AI BEHAVIOR

### Daily Briefing Output Format

```
📡 AQLIYA DAILY BRIEFING — [DATE]

🔴 CRITICAL (requires action today)
- [Signal/Decision/Risk] — [Link]

📡 NEW SIGNALS ([Count])
- [Signal] — [Type] — [Urgency]

⚠️ ACTIVE RISKS ([Count])
- [Risk] — [Probability/Impact] — [Status]

📝 DECISION QUEUE ([Count])
- [Decision] — [Days Overdue if applicable]

✅ TODAY'S TASKS ([Count])
- [Task] — [Priority] — [Product]

📊 GENERATED BY AI FROM NOTION DATA
- Sources: [Database links]
- Confidence: [High/Medium/Low based on data completeness]
```

### Weekly Intelligence Report Format

```
📊 AQLIYA WEEKLY INTELLIGENCE REPORT

1. SIGNAL TRENDS
   - Top signal type this week: [Type]
   - Emerging theme: [Theme]
   - Actionable signals: [Count]

2. DECISION QUALITY
   - Decisions this week: [Count]
   - Average quality: [Score]
   - Pending reviews: [Count]

3. COMMERCIAL PULSE
   - Pipeline value: [$]
   - Conversion probability trend: [Trend]
   - Top obstacles: [Objections]

4. PROOF HEALTH
   - New proof: [Count]
   - Expiring: [Count]
   - Weakest verification area: [Area]

5. RISK WATCH
   - New risks: [Count]
   - Critical: [Count]
   - Mitigated: [Count]

6. RECOMMENDATIONS (AI)
   - [Recommendation 1 with source]
   - [Recommendation 2 with source]
```

---

## 8. PHASING PLAN

| Phase | Timeline | Capabilities |
|---|---|---|
| **Phase D: AI Foundation** | 6 months | Data infrastructure complete, quality fields populated, minimum 3 months data |
| **Phase E: Intelligence Aggregation** | 9 months | Daily Briefing, Weekly Report, Signal Clustering — read-only agents |
| **Phase F: Governance Agents** | 12 months | Claim Validator, Proof Auditor, Message Compliance |
| **Phase G: Decision Support** | 18 months | Decision Assistant, Outcome Predictor, Risk Monitor |
| **Phase H: Full Intelligence** | 24+ months | All agents operational, AI-assisted weekly review |

Do NOT start Phase D before all Phase A-C database upgrades are complete AND at least 3 months of quality data exists.
