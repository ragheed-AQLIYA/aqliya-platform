# AQLIYA Notion OS — Governance Rules

**Author:** OpenCode Agent — Notion OS Build  
**Date:** 2026-05-30  
**Status:** Proposed — requires adoption by team  
**Authority:** This document is subordinate to `docs/official/*`, `docs/source-of-truth/*`, and `AGENTS.md`. Notion governance operates within the Git truth hierarchy. See `docs/DOCUMENTATION_AUTHORITY.md`.

---

## 0. First Principle

> **Notion is the Intelligence Command Layer, not the product truth layer.**

Product truth lives in Git (`PRODUCT_STATUS_MATRIX.md`, code, routes, tests).  
Commercial architecture lives in Git (`COMMERCIAL_ARCHITECTURE.md`).  
Governance framework lives in Git (`GOVERNANCE_FRAMEWORK.md`).  

Notion operates the intelligence layer on top of these truths. It does not replace, override, or drift from them.

---

## Rule 1: Git vs Notion vs AQLIYA App — Source of Truth Map

| Domain | Source of Truth | Notion's Role | AQLIYA App's Role |
|---|---|---|---|
| Product status (L0-L6) | `PRODUCT_STATUS_MATRIX.md` (Git) | Display reconciled status; never override | Product workflows |
| Commercial architecture | `COMMERCIAL_ARCHITECTURE.md` (Git) | Instantiate per-account/claim/pilot | SalesOS (future) |
| Governance framework | `GOVERNANCE_FRAMEWORK.md` (Git) | Operate within governance rules | Governance engine |
| Route map | `ROUTE_STRATEGY.md` (Git) | Reference for product claims | Route middleware |
| Institutional signals | **Notion** | Primary capture | Future signal product |
| Strategic scores | **Notion** | Assessment layer | Future scoring engine |
| Customer intelligence | **Notion** | Intelligence layer | SalesOS (future) |
| Proof management | **Notion** | Proof graph + verification | Future proof product |
| Decision learning | **Notion** | Quality tracking | DecisionOS upgrade |
| Founder briefings | **Notion** | Operational cadence | Future automated briefing |

**Rule:** When Git and Notion conflict on product status, commercial architecture, governance, or routes — Git wins, Notion is wrong, fix Notion.

---

## Rule 2: Product Status Claims — Strict Anchoring

**Rule:** Every product status entry in Notion's Product Portfolio must be reconcilable to `PRODUCT_STATUS_MATRIX.md`.

**Enforcement:**
1. `Git Status` field must contain the exact status from `PRODUCT_STATUS_MATRIX.md`
2. `Git Status Verified Date` must be within 7 days
3. `Notion Level` must match the Git status level
4. If they differ, Git wins — update Notion within 24 hours
5. Any commercial claim referencing product status must also reference the Git status

**Consequences:**
- Product entry with `Git Status Verified Date` > 7 days = stale, mark as `NEEDS RECONCILIATION`
- Notion level ≠ Git level = `CONFLICT` — fix within 24 hours
- Claim using stale product status = invalid — do not use externally

---

## Rule 3: Commercial Claims — The Claim Ladder

**Rule:** Every commercial claim in Notion's Claims Register must have a `Claim Ladder Level` (C1-C5) that matches the product's Git maturity.

**The Claim Ladder (from COMMERCIAL_ARCHITECTURE.md §10.1):**

| Claim Level | Permitted Phrasing | Requires Product Status |
|---|---|---|
| C1 Concept | "planned," "on the roadmap," "future" | L0 |
| C2 Built | "implemented," "usable v0.1" | L4 |
| C3 Pilot-ready | "pilot-ready (with conditions)" | L5 |
| C4 Externally validated | "external pilot executed" | L5 + executed external pilot |
| C5 Production / certified | "production-ready" | L6 + ops evidence |

**Enforcement:**
1. Every claim's `Claim Ladder Level` must be at or below the product's Git maturity level
2. If Git product status is L4, maximum claim level is C2
3. C4 claims require proof of an executed external pilot session (none exist today)
4. C5 claims are **forbidden** until L6 is reached

**Forbidden Claims (never in Notion):**
- Executed external pilot, named customer, customer reference, testimonial, logo, case study
- Production-ready, certified, audited, SOC/ISO-attested
- On-Prem, Air-Gapped, Local AI as available
- Autonomous audit / autonomous decision
- Any price as binding quote
- DecisionOS / WorkflowOS / SalesOS / L-F product as standalone pilot

---

## Rule 4: Public Messaging — The Proof Gate

**Rule:** No external claim may be used unless the full chain exists in Proof Graph 2.0:

```
Claim → Proof → Source → Customer/Pilot/Outcome → Approved Message
```

**Enforcement:**
1. Before any external message is published (website, deck, demo script, pitch), check Proof Graph 2.0
2. The claim must have an approved entry with `Public Use Allowed? = true`
3. The `Approved Message` field contains the exact wording permitted
4. If the proof verification level is P1 (controlled pilot), the approved message must include conditions
5. Re-verify every 30 days — expired proof = no public use

**Accountability:**
- Founder/CEO is the approval gate for all public claim messages
- Founder/CEO signs off on each `Approved Message`
- Violation = commercial truth breach, documented in Decisions Log

---

## Rule 5: Pilot Evidence

**Rule:** Every pilot must produce evidence. No evidence = no claim about the pilot.

**Enforcement:**
1. Every Pilot Tracker entry must have `Success Criteria` defined before pilot start
2. Every Pilot Tracker entry must have `Evidence Outputs` defined
3. After pilot completion, evidence must be linked to Proof Graph 2.0
4. Pilot `Outcome` must be documented within 1 week of completion
5. If pilot outcome is No-Go, reasons must be documented
6. Pilot tier (T0-T4) must match commercial architecture — T2 (external pilot) claims forbidden until executed

**Evidence Standards:**
- T0 (Internal Rehearsal): Screenshots, logs, internal notes — P0 proof only
- T1 (Controlled Pilot): Structured feedback, success criteria results — P1 proof
- T2 (External Pilot): Real customer outcome data — P2 proof (not reached)
- T3 (Paid): Conversion documentation — P3 proof (not reached)

---

## Rule 6: Customer Notes — Sensitivity and Privacy

**Rule:** Customer intelligence in Notion is sensitive. Treat all entries as confidential.

**Rules:**
1. Never include real customer passwords, API keys, or access credentials in Notion
2. Never include customer employee PII beyond name, title, email (and only with consent)
3. Customer objections and pain points may be documented by name; but do not share outside the team without anonymization
4. If a customer requests deletion of their data from Notion, comply within 7 business days
5. Customer intelligence entries older than 6 months without update are candidates for archiving
6. If SalesOS moves to AQLIYA app, migrate customer data to governed storage and delete from Notion

---

## Rule 7: Decisions — Recording and Review

**Rule:** All major decisions must be recorded in Decision Reviews within 24 hours.

**What constitutes a major decision:**
- Strategic direction (which product, which market, which ICP)
- Product scope (feature set, architecture change, build vs buy)
- Commercial terms (pricing, pilot scope, partnership)
- People (hiring, role changes, team structure)
- Spend > $10K equivalent

**Enforcement:**
1. Decision is recorded within 24 hours
2. `Decision Quality Score` is assigned at creation (brutally honest)
3. `Review Date` is set (30/60/90 days)
4. `Expected Outcome` is specific and measurable
5. `Reversible?` is assessed honestly
6. When outcome is known, `Actual Outcome` and `Lessons Learned` are filled
7. Quarterly review of all decisions with outcomes

**Decision Log hygiene:**
- Minor decisions (daily ops) do not need entries
- Decisions already recorded in DecisionOS (AQLIYA app) should be linked, not duplicated
- Historical decisions may be backfilled but must be labeled with accurate dates

---

## Rule 8: Proof Approval

**Rule:** The Proof Approval Memo template must be completed before any claim is used externally.

**Approval workflow:**
1. Claim is identified as needed for external use
2. Proof Graph 2.0 entry is created with all fields
3. Proof is verified against source (test, pilot, customer interaction)
4. `Approved Message` is drafted (exact external phrasing)
5. Founder/CEO reviews and approves
6. `Public Use Allowed?` is set to true
7. `Next Verification` date is set (30 days max)

**Without this workflow:** No external claim may be made. Period.

**Renewal:**
- Proof entries expire 30 days after `Last Verified` date
- Expired proof = `Public Use Allowed?` is automatically set to false
- Re-verify by running the proof again or confirming the status hasn't changed
- Re-verification must be documented in `Verification Detail`

---

## Rule 9: Conflict Resolution

**Rule:** When Notion and Git conflict, follow `docs/DOCUMENTATION_AUTHORITY.md`.

**Hierarchy (from highest to lowest):**
1. `docs/DOCUMENTATION_AUTHORITY.md` — meta-authority
2. `docs/official/*` — doctrine (identity, governance, strategic positioning)
3. `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` — product maturity (single source of truth)
4. `docs/source-of-truth/*` — architecture, routes, commercial, governance
5. `AGENTS.md` — agent operating contract
6. Code, routes, actions, tests, validation reports — implementation reality
7. **Notion databases** — intelligence layer, subordinate to all above

**Conflict types and resolution:**

| Conflict | Resolution |
|---|---|
| Notion product status ≠ Git status | Git wins. Update Notion immediately. |
| Notion claim level > Git product level | Downgrade claim to match Git. |
| Commercial claim without Proof Graph entry | Suspend claim until proof is entered and approved. |
| Pilot outcome claimed but no evidence linked | Not a valid outcome. Remove or link evidence. |
| Notion says "external pilot executed" but no Git evidence | Remove claim. This is a critical violation. |
| Founder Briefing critical move ≠ Strategic Score priority | Reconcile in weekly review. One of them is wrong. |

---

## Rule 10: Stale Data — Expiry and Cleanup

**Rule:** Notion data decays. Set expiry dates and review regularly.

| Database | Freshness Requirement | Action When Stale |
|---|---|---|
| Product Portfolio | `Git Status Verified Date` < 7 days | Mark as `NEEDS RECONCILIATION` |
| Institutional Signals | Status updated within 30 days | Auto-archive signals with Status = "New" > 30 days |
| Strategic Scores | Review within 30 days | Mark scores as `STALE` |
| Decision Reviews | Review within 90 days | Flag pending reviews > 90 days overdue |
| Customer Intelligence | Update within 30 days | Mark as `STALE` — downgrade conversion probability |
| Proof Graph 2.0 | Re-verify within 30 days | Auto-set `Public Use Allowed? = false` |
| Founder Briefings | Created weekly | Archive previous week's briefing |
| Pilot Tracker | Update within 7 days of pilot event | Flag stalled pilots |
| Claims Register | Validate within 30 days | Downgrade claim level to C1 |

---

## Rule 11: Weekly Review Rhythm

**Rule:** The Notion Operating System requires regular maintenance. Without it, data decays and the system becomes unreliable.

**Weekly Intelligence Review (every Monday, 30 min):**

| Step | Action | Source Database | Time |
|---|---|---|---|
| 1 | Review new signals (last 7 days) | Institutional Signals | 5 min |
| 2 | Action signals that need action | Institutional Signals | 5 min |
| 3 | Check proof verification | Proof Graph 2.0 (Needs Verification view) | 5 min |
| 4 | Review pending decisions | Decision Reviews (Pending Review view) | 5 min |
| 5 | Check claims drift against Git | Claims Register + PRODUCT_STATUS_MATRIX.md | 5 min |
| 6 | Update strategic scores (if monthly) | Strategic Scores | 5 min |
| 7 | Create weekly Founder Briefing | Founder Briefings | 5 min |

**Monthly Proof Audit (first Monday of month, 15 min):**
- Review every Proof Graph 2.0 entry
- Set new verification dates
- Downgrade expired entries

**Quarterly Decision Review (first week of quarter, 30 min):**
- Review all decisions with outcomes
- Extract systemic lessons
- Update Decision Quality framework

---

## Rule 12: Database Ownership

| Database | Owner | Backup Person |
|---|---|---|
| Institutional Signals | Team (anyone can create) | Founder reviews weekly |
| Strategic Scores | Founder/CEO | CTO |
| Decision Reviews | Founder/CEO | Leadership team |
| Customer Intelligence | Sales/commercial lead | Founder |
| Founder Briefings | Founder/CEO | — |
| Proof Graph 2.0 | Founder/CEO | CTO |
| Product Portfolio | CTO | Founder |
| Pilot Tracker | Pilot lead per product | CTO |
| Claims Register | Founder/CEO | Commercial lead |
| Execution Board | Operations lead | Founder |
| Accounts CRM | Commercial lead | Founder |
| Source Sync Register | CTO | Founder |

---

## Rule 13: Prohibited Actions

The following are **never** permitted in Notion:

1. ❌ Deleting or renaming existing databases without explicit approval (per task brief)
2. ❌ Stating product status that contradicts Git truth
3. ❌ Making commercial claims without Proof Graph entry
4. ❌ Listing proof that does not exist (fabricated evidence)
5. ❌ Claiming external pilot execution before it happens
6. ❌ Stating On-Prem, Air-Gapped, Local AI as available
7. ❌ Including customer PII beyond what is necessary and consented
8. ❌ Presenting pricing placeholders as binding quotes
9. ❌ Editing Product Portfolio `Git Status` field to match Notion (Notion must match Git, not reverse)
10. ❌ Using Notion as the primary workflow tool for product operations (AQLIYA app is for that)

---

## Rule 14: Enforcement

| Violation | First Occurrence | Second Occurrence | Third Occurrence |
|---|---|---|---|
| Stale product status (>7 days) | Warning, fix within 24h | Escalated in weekly review | Flagged to founder |
| Commercial claim without proof | Claim suspended, fix within 24h | +1 in decision log | Commercial truth review |
| Claim level exceeds Git status | Downgrade claim, fix within 24h | +1 in decision log | Governance escalation |
| Product status edited to match Notion (reverse) | Revert, warning | Revert, escalation | Governance review |
| External messaging without approved proof | Stop, fix, document | Stop, document in decisions log | Commercial truth breach |

---

## Rule 15: Review and Amendment

- These governance rules are reviewed quarterly
- Amendments require founder approval
- Amendment must be documented in Decision Reviews with rationale
- Old version archived, new version published

---

## Quick Reference Card

```
                     GIT TRUTH MAP
  ┌──────────────────────────────────────────────┐
  │  PRODUCT_STATUS_MATRIX.md  ──►  Git wins     │
  │  COMMERCIAL_ARCHITECTURE.md ──►  Git wins     │
  │  GOVERNANCE_FRAMEWORK.md    ──►  Git wins     │
  │  ROUTE_STRATEGY.md          ──►  Git wins     │
  │  AGENTS.md                  ──►  Git wins     │
  │  CODE / TESTS               ──►  Git wins     │
  └──────────────────────────────────────────────┘
                         │
                         ▼
              NOTION INTELLIGENCE LAYER
  ┌──────────────────────────────────────────────┐
  │  Signals, Scores, Intelligence, Proof,      │
  │  Decisions, Briefings                       │
  │                                              │
  │  Rule: Link to Git truth.                   │
  │  Rule: No external claim without Proof.     │
  │  Rule: Review weekly.                       │
  │  Rule: Stale = unreliable.                  │
  └──────────────────────────────────────────────┘

  THE PROOF GATE — BEFORE ANY EXTERNAL CLAIM:
  Claim → Proof → Source → Outcome → Approved Message
  Without this chain: DO NOT SAY IT.
```

---

## Next Step

Proceed to `docs/archive/notion-export-2026/07-ceo-dashboard-v2.md` — CEO Dashboard v2 design.
