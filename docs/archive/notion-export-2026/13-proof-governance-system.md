# Proof Governance System — Proof Graph 2.0

**Status:** Design — Upgrade Path Confirmed  
**Date:** 2026-05-30  
**Current Proof Library maturity:** L4+ (strongest governance database)  

---

## 1. EXECUTIVE SUMMARY

The current Proof Library is AQLIYA's most mature governance database:

- 14 fields with verification level ladder (Screenshot→Revenue)
- Dual safety flags (Customer-Safe?, Can Be Public?)
- Relations to Claims, Products, ICP, Messaging
- 6 verification levels

**Verdict: Upgrade, do NOT rebuild.** The current Proof Library can become Proof Graph 2.0 with 4 additional fields and 2 additional relations.

---

## 2. CURRENT PROOF LIBRARY AUDIT

### Strengths
| Strength | Detail |
|---|---|
| Verification Level | Screenshot Only → Demo → Code → Test → Customer → Revenue Verified |
| Safety | Dual customer/public safety flags |
| Type taxonomy | 10 proof types |
| Relations | Supports Claim, Product, ICP Proof Needed, Messaging Proof Required |

### Weaknesses
| Weakness | Impact | Fix |
|---|---|---|
| No Outcome field | Cannot link proof to business outcome | Add Outcome relation |
| No Pilot reverse relation | Cannot trace proof to originating pilot | Add reverse relation or Pilot field |
| No Account relation | Cannot trace proof to customer | Add Account relation |
| Last Verified not enforced | Proof can go stale | Add auto-expiry rule |
| Claim Supported is duplicate text field | Redundant with Supports Claim relation | Remove or repurpose |

---

## 3. UPGRADE PATH: PROOF GRAPH 2.0

### Fields to Add (4)

| Field | Type | Purpose |
|---|---|---|
| **Outcome** | Relation→Pilot Outcome or Text | Business result: Time saved, Cost reduced, Revenue generated, Risk mitigated |
| **Pilot** | Relation→Pilot Tracker | Which pilot produced this proof |
| **Account** | Relation→Accounts CRM | Which customer/account produced this proof |
| **Expiry Date** | Date | When this proof must be re-verified |

### Fields to Remove (1)

| Field | Reason |
|---|---|
| Claim Supported (text) | Duplicate of Supports Claim (relation) |

### Fields to Keep (13)

Proof Item (Title), Type, Status, Source Type, Verification Level, Source (URL), Product (Relation), Supports Claim (Relation), Last Verified, Can Be Public?, Customer-Safe?, Notes, Pilot (NEW), Account (NEW), Outcome (NEW), Expiry Date (NEW)

### Total after upgrade: 16 fields

---

## 4. PROOF GRAPH 2.0 FULL SCHEMA

| Field | Type | Required | Notes |
|---|---|---|---|
| Proof Item | Title | Yes | — |
| Type | Select | Yes | Screenshot, Demo Result, Test Result, Customer Feedback, Pilot Evidence, Security Report, Performance Result, Case Study, Before/After, Commercial Asset |
| Status | Select | Yes | Draft, Validated, Needs Review, Outdated |
| Source Type | Select | Yes | Internal Test, Customer Demo, Production Data, Screenshot, Security Scan, Performance Test |
| Verification Level | Select | Yes | Screenshot Only, Demo Verified, Code Verified, Test Verified, Customer Verified, Revenue Verified |
| Source | URL | Yes | Link to evidence |
| Product | Relation | Yes | → Product Portfolio |
| Supports Claim | Relation | Yes | → Claims Register |
| Pilot | Relation | No | → Pilot Tracker (NEW) |
| Account | Relation | No | → Accounts CRM (NEW) |
| Outcome | Relation/Text | No | Business result (NEW) |
| Last Verified | Date | Yes | — |
| Expiry Date | Date | No | Auto-calculated (NEW) |
| Can Be Public? | Checkbox | Yes | — |
| Customer-Safe? | Checkbox | Yes | — |
| Notes | Text | No | — |

---

## 5. THE COMPLETE EVIDENCE CHAIN

```
                    ┌─────────────┐
                    │   Claim     │
                    │  (Approved) │
                    └──────┬──────┘
                           │ Supports
                    ┌──────▼──────┐
                    │    Proof    │
                    │  (Verified) │
                    └──────┬──────┘
                           │ Originates from
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  Pilot   │ │ Customer │ │  Outcome │
        └──────────┘ └──────────┘ └──────────┘
              │
              ▼
        ┌──────────┐
        │ Decision │
        │   Memo   │
        └──────────┘
```

---

## 6. GOVERNANCE RULES

### Rule 1: Proof Expiry
- Verification Level "Screenshot Only": expires in 30 days
- Verification Level "Demo Verified": expires in 90 days
- Verification Level "Code/Test Verified": expires in 180 days
- Verification Level "Customer/Revenue Verified": expires in 365 days
- Status changes to "Needs Review" on expiry

### Rule 2: Claim Approval Gate
- A Claim cannot reach "Approved" status without at least one linked Proof with Verification Level ≥ "Demo Verified"
- Commercial Audience claims require Verification Level ≥ "Customer Verified"

### Rule 3: Public Proof
- A Proof can only be marked "Can Be Public?" if Verification Level ≥ "Code Verified"
- AND Customer-Safe? is checked

### Rule 4: Mandatory Verification
- Every Proof must have Last Verified date
- Proof without Last Verified for 90+ days → auto "Needs Review"

---

## 7. REQUIRED VIEWS

| View | Filter | Purpose |
|---|---|---|
| Proof Gate Risks | Verification Level < Customer, Status = Validated | Claims using weak proof |
| Expiring Proof | Expiry Date < 30 days | What needs re-verification |
| Customer Evidence | Source Type = Customer Demo, Production Data, Customer Feedback | Sales-safe proof |
| Pilot Evidence | Pilot is not empty | Proof generated by pilots |
| Revenue Proof | Verification Level = Revenue Verified | Strongest evidence |
| Needs Review | Status = Needs Review | Overdue proof |

---

## 8. MIGRATION STEPS

1. ADD Outcome field (Text) — backward compatible, no data loss
2. ADD Pilot relation → Pilot Tracker — backward compatible
3. ADD Account relation → Accounts CRM — backward compatible
4. ADD Expiry Date field — backward compatible
5. REMOVE Claim Supported (text) — migrate data to Supports Claim relation first
6. UPDATE CEO Dashboard with new views
7. ENTER 3 sample complete evidence chains

**Database-level changes:** Add 4 fields, remove 1, no data loss
**Risk:** Low (all additions are additive; only removal is a text field with existing relation)
