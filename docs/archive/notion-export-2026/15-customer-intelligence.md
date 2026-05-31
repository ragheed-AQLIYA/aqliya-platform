# Customer Intelligence Engine

**Status:** Design — Upgrade Path  
**Date:** 2026-05-30  
**Current Accounts CRM maturity:** L3  

---

## 1. CURRENT STATE AUDIT

Accounts CRM (14 fields) tracks pipeline stages, priorities, and contacts. It is a functional CRM but not an intelligence system.

| Weakness | Impact |
|---|---|
| No objection tracking | Cannot analyze why deals are lost |
| No proof requirements per account | Cannot prepare for sales conversations |
| No conversion probability | Cannot prioritize pipeline |
| No trust/relationship scoring | Cannot assess relationship depth |
| No pain depth assessment | Cannot tailor messaging |
| No buying authority verification | Cannot assess deal reality |

---

## 2. UPGRADE PATH: CUSTOMER INTELLIGENCE CRM v2

### Fields to Add (8)

| Field | Type | Purpose |
|---|---|---|
| **Pain Depth** | Select | None, Aware, Active Problem, Critical, Regulatory |
| **Budget Status** | Select | Unknown, No Budget, Budget Identified, Budget Approved, Budget Allocated |
| **Authority Level** | Select | User, Influencer, Recommender, Decision Maker, Economic Buyer |
| **Buying Timeline** | Select | Unknown, >12 months, 6-12 months, 3-6 months, <3 months, Immediate |
| **Relationship Depth** | Select | New Contact, Connected, Regular Meetings, Trusted Advisor, Strategic Partner |
| **Conversion Probability** | Select | Low (<25%), Medium (25-50%), High (50-75%), Very High (>75%), Committed |
| **Objections** | Multi-Select | Price, Timing, Authority, Need, Trust, Competition, Compliance, Integration |
| **Objection Notes** | Text | Detail on each objection |
| **Proof Needed** | Relation→Proof Library | Proof items needed for this account |
| **Account Signals** | Relation→Signals (NEW) | Signals tagged to this account |

### Accounts CRM v2 Full Schema (24 fields)

| Field | Type | Notes |
|---|---|---|
| Account | Title | — |
| Stage | Select | Current pipeline |
| Priority | Select | Critical, High, Medium, Low |
| Pain Depth | Select | NEW |
| Budget Status | Select | NEW |
| Authority Level | Select | NEW |
| Buying Timeline | Select | NEW |
| Relationship Depth | Select | NEW |
| Conversion Probability | Select | NEW |
| Objections | Multi-Select | NEW |
| Objection Notes | Text | NEW |
| Source | Select | Current |
| Contact Name | Text | Current |
| Contact Role | Text | Current |
| Owner | Person | Current |
| Primary Product | Relation→Product | Current |
| ICP Segment | Relation→ICP | Current |
| Related Pilot | Relation→Pilot | Current |
| Proof Needed | Relation→Proof | NEW |
| Account Signals | Relation→Signals | NEW |
| Next Step | Text | Current |
| Next Step Date | Date | Current |
| Last Touch | Date | Current |
| Notes | Text | Current |

---

## 3. CUSTOMER INTELLIGENCE DIMENSIONS

### The BATRAP Framework

| Dimension | Field | Weight |
|---|---|---|
| **B**udget | Budget Status | 20% |
| **A**uthority | Authority Level | 20% |
| **T**iming | Buying Timeline | 15% |
| **R**elationship | Relationship Depth | 15% |
| **P**ain | Pain Depth | 20% |
| **T**rust | Relationship Depth + Objections | 10% |

### Conversion Probability Matrix

| Pain Depth | Budget | Authority | Timing | Probability |
|---|---|---|---|---|
| Critical+Active | Approved+Allocated | Decision Maker+Economic Buyer | <3 months+Immediate | Very High |
| Active+Critical | Identified+Approved | Recommender+Decision Maker | 3-6 months | High |
| Aware+Active | No Budget+Identified | User+Influencer | 6-12 months | Medium |
| None+Aware | Unknown+No Budget | User | >12 months+Unknown | Low |

---

## 4. OBJECTION INTELLIGENCE

### Objection Tracking

Track objections per account to build patterns:

| Objection | Frequency | Common Stage | Recommended Response |
|---|---|---|---|
| Price | — | Pilot Proposed | Show ROI proof from similar accounts |
| Timing | — | Discovery | Identify trigger event |
| Authority | — | Qualified | Map buying committee |
| Need | — | Discovery | Refine pain assessment |
| Trust | — | Demo Completed | Share case studies, arrange reference calls |
| Competition | — | Demo | Differentiate on governance |
| Compliance | — | Pilot Proposed | Share security proof |
| Integration | — | Pilot Active | Technical deep-dive |

---

## 5. REQUIRED VIEWS

| View | Filter | Purpose |
|---|---|---|
| Ready to Close | Conversion Probability = Very High, Committed | Today's priority |
| High Priority | Priority = Critical/High, Conversion Probability ≥ High | This week's focus |
| Objection Patterns | Objections not empty | Training and messaging |
| Needs Proof | Proof Needed not empty | Prepare evidence |
| Stale Accounts | Last Touch > 30 days | Re-engagement needed |
| Pipeline Forecast | Stage + Conversion Probability | Revenue projection |

---

## 6. MIGRATION STEPS

1. ADD Pain Depth select field
2. ADD Budget Status select field
3. ADD Authority Level select field
4. ADD Buying Timeline select field
5. ADD Relationship Depth select field
6. ADD Conversion Probability select field
7. ADD Objections multi-select field
8. ADD Objection Notes text field
9. ADD Proof Needed relation → Proof Library
10. ADD Account Signals relation → Signals (after Signals DB is created)
11. UPDATE CEO Dashboard with intelligence views
12. BACKFILL: Score existing accounts with BATRAP dimensions

**Total field additions:** 10 (8 selects, 1 multi-select, 1 text, 2 relations)
**Risk:** Low (all additive, no data loss)
