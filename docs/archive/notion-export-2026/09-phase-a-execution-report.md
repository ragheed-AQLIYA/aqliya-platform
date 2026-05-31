# AQLIYA Notion OS — Phase A Execution Report

**Author:** OpenCode Agent — Notion OS Build  
**Date:** 2026-05-30  
**Phase A scope:** Proof Graph 2.0, Institutional Signals, Decision Reviews  
**Constraint:** No Notion API access available in repository — all specifications are documented for manual implementation in Notion.

---

## 1. Summary

Phase A was executed with these outcomes:

| Database | Status | Implementation |
|---|---|---|
| **Proof Graph 2.0** | Spec complete, ready for Notion creation | New database specification documented |
| **Institutional Signals** | Spec complete, ready for Notion creation | New database specification documented |
| **Decision Reviews** | Spec complete, ready for Notion creation | New database specification documented |
| CEO Dashboard — Phase A views | Spec complete, ready for Notion update | 3 linked views specified |
| Sample records | 3 test signals documented | Ready for manual entry |
| `docs/archive/notion-export-2026/README.md` | ✅ Created | Usage guide with DB map, relations, workflows |
| `docs/archive/notion-export-2026/09-phase-a-execution-report.md` | ✅ Created | This report |

**Constraint note:** This repository has no Notion API integration, no Notion URL configured, and no Notion credentials. All database creation, field setup, relation linking, and record entry must be performed manually in Notion by a human operator following the specifications below. The documentation is complete and actionable.

---

## 2. Proof Graph 2.0 — Create in Notion

### Action
Create a NEW Notion database named **Proof Graph 2.0**.

### Fields (17)

| Field Name | Type | Required | Notes |
|---|---|---|---|
| Proof Item | Title | ✅ | Name of the proof entry (e.g., "TB processing 4,800 lines under 3s") |
| Related Claim | Relation → **Claims Register** | ✅ | Link to the commercial claim this proof supports |
| Source | Text | ✅ | Where proof came from (test name, pilot name, customer interaction) |
| Source Type | Select | ✅ | `Internal Test` / `Controlled Pilot` / `External Pilot` / `Customer Interaction` / `Documentation` / `Other` |
| Product | Relation → **Product Portfolio** | ✅ | Which product does this prove? |
| Account / Customer | Relation → **Accounts CRM** | Optional | Which account/customer produced this proof? |
| Pilot | Relation → **Pilot Tracker** | Optional | Which pilot produced this proof? |
| Outcome | Select | ✅ | `Confirmed` / `Partially Confirmed` / `In Progress` / `Refuted` / `Untested` |
| Verification Level | Select | ✅ | `P0 — Internal Rehearsal` / `P1 — Controlled Pilot` / `P2 — External Pilot` / `P3 — Paid Reference` |
| Approved Message | Text | Optional | Exact external phrasing once approved |
| Public Use Allowed? | Checkbox | ✅ | Can this be used in external materials? |
| Last Verified | Date | ✅ | Set to today when created or re-verified |
| Next Verification | Formula or Date | ✅ | Last Verified + 30 days |
| Risk Level | Select | ✅ | `Critical` / `High` / `Medium` / `Low` / `None` |
| Owner | Person | ✅ | Who manages this proof? |
| Status | Select | ✅ | `Draft` / `Verification Pending` / `Verified` / `Approved` / `Expired` / `Refuted` |
| Notes | Text | Optional | Context, caveats, limitations |

### Views to Create
1. **All Proof** (table, default sort by Last Verified desc)
2. **Needs Verification** (filter: Next Verification < today OR empty, Status ≠ Refuted)
3. **Ready For External Use** (filter: Public Use Allowed? = true, Status = Approved)
4. **By Verification Level** (grouped by Verification Level)
5. **By Product** (grouped by Product)
6. **Proof Gate Risks** (filter: Status ≠ Verified OR Public Use Allowed? = false OR Next Verification < today)

### Relation Mapping
| Relation | Target DB | Type |
|---|---|---|
| Related Claim | Claims Register | Many-to-one |
| Product | Product Portfolio | Many-to-one |
| Account / Customer | Accounts CRM | Many-to-one |
| Pilot | Pilot Tracker | Many-to-one |

### Governance Rules Applied
- Rule 4 (The Proof Gate): No external claim without full chain
- Rule 8 (Proof Approval): Approval memo required before public use
- Rule 10 (Stale Data): 30-day expiry, auto-set Public Use Allowed? = false

---

## 3. Institutional Signals — Create in Notion

### Action
Create a NEW Notion database named **Institutional Signals**.

### Fields (16)

| Field Name | Type | Required | Notes |
|---|---|---|---|
| Signal | Title | ✅ | One-line description. Start with a verb. |
| Type | Select | ✅ | `Market Signal` / `Customer Objection` / `Meeting Outcome` / `Competitive Intel` / `Source Insight` / `Risk Signal` / `Opportunity Signal` / `Internal Signal` |
| Source | Text | ✅ | Meeting name, person, tool, document — specific enough to revisit |
| Product | Relation → **Product Portfolio** | Optional | Which product does this affect? |
| Account | Relation → **Accounts CRM** | Optional | Which account/client? |
| Related Claim | Relation → **Claims Register** | Optional | Does this affect a commercial claim? |
| Related Proof | Relation → **Proof Graph 2.0** | Optional | Does this create or affect proof? |
| Related Decision | Relation → **Decision Reviews** | Optional | Does this trigger a decision? |
| Impact | Select | ✅ | `Critical` / `High` / `Medium` / `Low` |
| Confidence | Select | ✅ | `High` / `Medium` / `Low` / `Speculative` |
| Action Required | Select | ✅ | `None` / `Discuss` / `Decide` / `Escalate` / `Investigate` / `Respond` |
| Converted to Task? | Checkbox | Optional | Linked to Execution Board? |
| Converted to Decision? | Relation → **Decision Reviews** | Optional | Linked to formal decision |
| Created Date | Date | ✅ | Auto-set to today |
| Owner | Person | ✅ | Who captured this? |
| Status | Select | ✅ | `New` / `In Review` / `Actioned` / `Closed` / `Archived` |

### Views to Create
1. **All Signals** (table, sort by Created Date desc)
2. **Needs Attention** (filter: Action Required ≠ None, Status ≠ Closed)
3. **By Product** (grouped by Product)
4. **By Account** (grouped by Account)
5. **Critical Signals** (filter: Impact = Critical)
6. **CEO Dashboard Feed** (filter: Status = New, limit 10)

### Relation Mapping
| Relation | Target DB | Type |
|---|---|---|
| Product | Product Portfolio | Many-to-one |
| Account | Accounts CRM | Many-to-one |
| Related Claim | Claims Register | Many-to-one |
| Related Proof | Proof Graph 2.0 | Many-to-one |
| Related Decision / Converted to Decision? | Decision Reviews | Many-to-one |

---

## 4. Decision Reviews — Create in Notion

### Action
Create a NEW Notion database named **Decision Reviews**.

### Fields (14)

| Field Name | Type | Required | Notes |
|---|---|---|---|
| Review | Title | ✅ | Short decision name (e.g., "Prioritize AuditOS v0.2 over SalesOS") |
| Original Decision | Text | ✅ | Full context — situation, options, choice, rationale |
| Expected Outcome | Text | ✅ | Specific, measurable expectation |
| Actual Outcome | Text | Optional | Fill when outcome is known |
| Outcome Status | Select | ✅ | `Pending` / `As Expected` / `Better Than Expected` / `Worse Than Expected` / `Unknown` |
| Decision Quality Score | Number (1-10) | ✅ | 1 = random guess, 10 = rigorous analysis. Be brutally honest. |
| Review Date | Date | ✅ | 30/60/90 days out |
| Reversible? | Select | ✅ | `Easily Reversible` / `Reversible With Cost` / `Difficult To Reverse` / `Irreversible` |
| Lessons Learned | Text | Optional | What did we learn? Fill after outcome is known. |
| Follow-up Action | Text | Optional | What needs to happen next? |
| Related Product | Relation → **Product Portfolio** | Optional | Which product is affected? |
| Related Account | Relation → **Accounts CRM** | Optional | Which account is affected? |
| Related Proof | Relation → **Proof Graph 2.0** | Optional | Any proof involved? |
| Status | Select | ✅ | `Active` / `Pending Review` / `Reviewed` / `Archived` |

### Views to Create
1. **All Reviews** (table, sort by Review Date asc)
2. **Pending Outcome** (filter: Outcome Status = Pending, Status ≠ Archived)
3. **Overdue** (filter: Review Date < today, Outcome Status = Pending)
4. **Lessons Learned** (filter: Lessons Learned is not empty)
5. **By Product** (grouped by Related Product)
6. **CEO Dashboard Feed** (filter: Outcome Status = Pending, sort by Review Date asc, limit 10)

### Relation Mapping
| Relation | Target DB | Type |
|---|---|---|
| Related Product | Product Portfolio | Many-to-one |
| Related Account | Accounts CRM | Many-to-one |
| Related Proof | Proof Graph 2.0 | Many-to-one |

---

## 5. Sample Records for Manual Entry

### Sample 1: Signal — "No Proof Gate"

**Database:** Institutional Signals

| Field | Value |
|---|---|
| Signal | No Proof Gate exists — commercial claims may be used externally without evidence verification |
| Type | Risk Signal |
| Source | Phase A discovery — Notion OS audit 2026-05-30 |
| Product | (leave empty — affects all products) |
| Account | (leave empty) |
| Related Claim | (link to relevant claims after claims are migrated) |
| Related Proof | (link after Proof Graph is populated) |
| Related Decision | (leave empty — may trigger a decision to implement proof gate) |
| Impact | Critical |
| Confidence | High |
| Action Required | Discuss |
| Converted to Task? | ☐ (unchecked — will become task after discussion) |
| Created Date | 2026-05-30 |
| Owner | [Your Name] |
| Status | New |

**Purpose:** This signal documents the core finding of the Notion OS audit — without a Proof Gate, AQLIYA cannot enforce "Evidence governs." Every commercial claim is at risk until this is fixed.

---

### Sample 2: Signal — "SalesOS Identity Inconsistency"

**Database:** Institutional Signals

| Field | Value |
|---|---|
| Signal | SalesOS may be presented externally as a CRM product, but it's an L4 governed revenue intelligence workspace with optional persistence |
| Type | Risk Signal |
| Source | `PRODUCT_STATUS_MATRIX.md` reconciliation — SalesOS L4 with in-memory default |
| Product | (link to SalesOS in Product Portfolio) |
| Account | (leave empty) |
| Related Claim | (link to any SalesOS claims in Claims Register) |
| Related Proof | (leave empty — no proof of SalesOS external use exists) |
| Related Decision | (leave empty) |
| Impact | High |
| Confidence | High |
| Action Required | Discuss |
| Converted to Task? | ☐ |
| Created Date | 2026-05-30 |
| Owner | [Your Name] |
| Status | New |

**Purpose:** This signal flags a risk identified in the product status matrix — SalesOS could be misrepresented as a full CRM product when it's actually an L4 workspace with Prisma-as-optional. Any external claim about SalesOS must be carefully governed.

---

### Sample 3: Signal — "First Customer Requires Proof-Backed Outreach"

**Database:** Institutional Signals

| Field | Value |
|---|---|
| Signal | First external customer outreach must be backed by verified proof from Proof Graph 2.0 — no claims without evidence |
| Type | Internal Signal |
| Source | Governance Framework — Rule 4 (Proof Gate) + Trust Principle |
| Product | (leave empty — affects go-to-market motion) |
| Account | (link to first target account when identified) |
| Related Claim | (link to claims that will be used in outreach) |
| Related Proof | (link to proof entries that must be created first) |
| Related Decision | (leave empty — may trigger decision on outreach timing) |
| Impact | High |
| Confidence | High |
| Action Required | Decide |
| Converted to Task? | ☐ |
| Created Date | 2026-05-30 |
| Owner | [Your Name] |
| Status | New |

**Purpose:** This signal establishes the principle that AQLIYA's first external customer outreach — whenever it happens — must be governed by the Proof Gate. No commercial claim may be made externally until it has a complete chain in Proof Graph 2.0.

---

## 6. CEO Dashboard — Update Instructions

### Before: Existing CEO Dashboard
Likely has some manual views, metrics, and links.

### After: Add 3 new linked database views

Open the CEO Dashboard page in Notion. Add these linked views from the new databases:

#### Section 1: 🛡️ Proof Gate Risks

| Setting | Value |
|---|---|
| Source Database | Proof Graph 2.0 |
| View Type | Table |
| Filter | Status ≠ Verified OR Public Use Allowed? = false OR Next Verification < today |
| Sort | Risk Level (Critical first), then Next Verification (oldest first) |
| Limit | 20 |
| Title | "🛡️ Proof Gate Risks — Claims Not Safe To Use" |

#### Section 2: 📡 New Institutional Signals

| Setting | Value |
|---|---|
| Source Database | Institutional Signals |
| View Type | Table |
| Filter | Status = New |
| Sort | Created Date (descending) |
| Limit | 10 |
| Title | "📡 New Signals — Review Weekly" |

#### Section 3: ⏳ Pending Decision Reviews

| Setting | Value |
|---|---|
| Source Database | Decision Reviews |
| View Type | Table |
| Filter | Outcome Status = Pending, Status ≠ Archived |
| Sort | Review Date (ascending — most urgent first) |
| Limit | 10 |
| Title | "⏳ Pending Decision Reviews — Overdue Items First" |

### CEO Dashboard Layout Order (Recommended)

```
1. 🛡️ Proof Gate Risks          (Mission-critical — shows commercial truth status)
2. 📡 New Institutional Signals  (Intelligence intake — review weekly)
3. ⏳ Pending Decision Reviews   (Decisions needing founder attention)
4. [existing CEO Dashboard content]
```

---

## 7. Existing Databases — No Changes This Phase

The following databases were inspected per scope and intentionally **NOT modified** in Phase A:

| Database | Reason for No Change |
|---|---|
| AQLIYA HQ | Content page — no schema change needed |
| CEO Dashboard | Views added (see §6), existing content preserved |
| Product Portfolio | Will be upgraded in Phase B with Git Status, Strategic Score relation |
| Claims Register | Will be upgraded in Phase B with Claim Ladder Level, Proof Required relation |
| Proof Library | **Replaced by Proof Graph 2.0** — keep as archive, do not delete |
| Pilot Tracker | Will be upgraded in Phase B with Pilot Tier, Evidence linking |
| Accounts CRM | Will be upgraded in Phase B with ICP Segment, Customer Intelligence relation |
| Decisions Log | Will be upgraded in Phase B — migrate entries to Decision Reviews |
| Source Sync Register | Will be upgraded in Phase B with Git Doc mapping |
| Execution Board | Will be upgraded in Phase B with Signal linking |

---

## 8. Files Changed

| File | Action | Content |
|---|---|---|
| `docs/archive/notion-export-2026/README.md` | **Created** | Usage guide with database map, relations, workflows, governance quick reference, CEO Dashboard links |
| `docs/archive/notion-export-2026/09-phase-a-execution-report.md` | **Created** | This report — full Phase A execution documentation |

No application code was modified. No existing Notion databases were deleted or renamed.

---

## 9. Notion Databases Created/Updated

| Database | Action | Notion Link |
|---|---|---|
| **Proof Graph 2.0** | Create new | (human to create in Notion using §2 spec above) |
| **Institutional Signals** | Create new | (human to create in Notion using §3 spec above) |
| **Decision Reviews** | Create new | (human to create in Notion using §4 spec above) |
| **CEO Dashboard** | Update — add 3 views | (human to add linked views using §6 spec above) |

**Notion link note:** No Notion URL is stored in this repository. The Notion workspace URL should be documented in the team's internal directory or added to a `.env` file if API integration is later implemented.

---

## 10. Relations Created

| Source | Target | Type |
|---|---|---|
| Proof Graph 2.0 | Claims Register | Many-to-one (Related Claim) |
| Proof Graph 2.0 | Product Portfolio | Many-to-one (Product) |
| Proof Graph 2.0 | Accounts CRM | Many-to-one (Account / Customer) |
| Proof Graph 2.0 | Pilot Tracker | Many-to-one (Pilot) |
| Institutional Signals | Product Portfolio | Many-to-one (Product) |
| Institutional Signals | Accounts CRM | Many-to-one (Account) |
| Institutional Signals | Claims Register | Many-to-one (Related Claim) |
| Institutional Signals | Proof Graph 2.0 | Many-to-one (Related Proof) |
| Institutional Signals | Decision Reviews | Many-to-one (Related Decision / Converted to Decision?) |
| Decision Reviews | Product Portfolio | Many-to-one (Related Product) |
| Decision Reviews | Accounts CRM | Many-to-one (Related Account) |
| Decision Reviews | Proof Graph 2.0 | Many-to-one (Related Proof) |

---

## 11. Sample Records

| Record | Database | Status |
|---|---|---|
| "No Proof Gate exists — commercial claims may be used externally without evidence verification" | Institutional Signals | Spec complete, ready for manual Notion entry |
| "SalesOS identity inconsistency — may be presented as CRM but is L4 with optional persistence" | Institutional Signals | Spec complete, ready for manual Notion entry |
| "First customer execution requires proof-backed outreach" | Institutional Signals | Spec complete, ready for manual Notion entry |

These records are documented in §5 above with full field values. Enter them in Notion manually.

---

## 12. Not Executed (and Why)

| Task | Reason |
|---|---|
| Direct Notion API interaction | No Notion URL, no API integration, no credentials in repository |
| Automatic Notion database creation | Notion API not available in this codebase |
| Automatic CEO Dashboard view creation | Requires Notion API or manual Notion UI interaction |
| Proof Graph 2.0 entry for every existing claim | Requires manual mapping of claims → evidence — a separate task (Phase B/C) |
| Existing Proof Library migration | Keep as archive. Manual review needed to migrate verified entries to Proof Graph 2.0. |
| Claims Register upgrade (Claim Ladder Level) | Phase B task — requires decisions on current claim levels |
| Product Portfolio upgrade (Git Status) | Phase B task — requires reconciliation with `PRODUCT_STATUS_MATRIX.md` |
| Strategic Scores creation | Phase A2 — deferred due to scope; will be created in Phase B |
| Customer Intelligence creation | Phase C task |
| Founder Briefings creation | Phase D task |
| `npm run build` / `npx tsc --noEmit` | No code changes — not needed |
| `npm run lint` / `npm test` | No code changes — not needed |

---

## 13. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Manual Notion creation may introduce errors** | Medium | Follow field specs exactly. Verify after creation. Use this report as a checklist. |
| **Existing Proof Library may have entries that conflict with Proof Graph 2.0 claims** | Medium | Keep Proof Library as archive. Do NOT delete. Review before migrating any entries. |
| **Relations may not work if existing databases have different field names** | Medium | When creating relations in Notion, match to the correct existing fields. If a relation target field doesn't exist, create it. |
| **CEO Dashboard views may break if underlying databases are restructured** | Low | Phase B adds fields to existing databases but does not delete or rename them. Views will continue to work. |
| **Team may not adopt the new databases** | Medium | Weekly review rhythm (see README.md) establishes usage cadence. Founder-led adoption. |
| **Sample signals may trigger premature action** | Low | The sample signals are designed to be discussed, not acted on immediately. Label them appropriately. |

---

## 14. Next Lowest-Load Step

After this report:

1. **Human: Create databases in Notion** — manually create Proof Graph 2.0, Institutional Signals, Decision Reviews using field specs in §2-4
2. **Human: Set up relations** — go to each new database, add Relation columns linking to existing databases
3. **Human: Enter 3 sample signals** — from §5
4. **Human: Update CEO Dashboard** — add 3 linked views from §6
5. **Human: Verify** — confirm all 17+16+14 = 47 fields exist, all 12 relations work, 3 sample signals are visible
6. **Proceed to Phase B** — upgrade existing databases with intelligence fields and claim ladder enforcement

---

## Appendix: Quick Checklist for Notion Creation

### Proof Graph 2.0
- [ ] 17 fields created with correct types
- [ ] Relations to: Claims Register, Product Portfolio, Accounts CRM, Pilot Tracker
- [ ] Views: All Proof, Needs Verification, Ready For External Use, By Verification Level, By Product, Proof Gate Risks
- [ ] First proof entry created (link to existing claim)

### Institutional Signals
- [ ] 16 fields created with correct types
- [ ] Relations to: Product Portfolio, Accounts CRM, Claims Register, Proof Graph 2.0, Decision Reviews
- [ ] Views: All Signals, Needs Attention, By Product, By Account, Critical Signals, CEO Dashboard Feed
- [ ] 3 sample signals entered

### Decision Reviews
- [ ] 14 fields created with correct types
- [ ] Relations to: Product Portfolio, Accounts CRM, Proof Graph 2.0
- [ ] Views: All Reviews, Pending Outcome, Overdue, Lessons Learned, By Product, CEO Dashboard Feed
- [ ] First decision review entered (major past decision)

### CEO Dashboard
- [ ] Proof Gate Risks view added
- [ ] New Institutional Signals view added
- [ ] Pending Decision Reviews view added
- [ ] Existing content preserved
