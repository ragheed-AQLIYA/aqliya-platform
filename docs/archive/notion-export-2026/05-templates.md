# AQLIYA Notion OS — Templates

**Author:** OpenCode Agent — Notion OS Build  
**Date:** 2026-05-30  
**Purpose:** Structured templates for every major Notion entry type. Templates enforce governance, reduce blank-page paralysis, and ensure consistent data.

---

## Template 1: Institutional Signal

**Purpose:** Capture a signal from any source (meeting, call, document, news, competitive intelligence). Signals are the raw intelligence that feeds decisions, claims, and actions.

**Required Fields:**

| Field | Instructions |
|---|---|
| Signal | One-line description. Start with a verb. Good: "Audit firm X is evaluating AI audit tools." Bad: "Market stuff." |
| Signal Type | Select the type. Be specific. `Market Signal` for industry trends, `Customer Objection` for sales blockers, `Meeting Outcome` for internal meetings. |
| Source | Where did this come from? Be specific enough to revisit. "Q3 call with X" not "a meeting." |
| Impact | `Critical` = requires immediate action. `High` = requires discussion this week. `Medium` = useful context. `Low` = informational. |
| Confidence | `High` = firsthand, reliable source. `Medium` = secondhand, plausible. `Low` = rumor. `Speculative` = guess. |
| Action Required | Select the action type. Be honest — `None` is acceptable for informational signals. |
| Status | Leave as `New`. Will be updated during review. |

**Usage Rules:**
- Create a signal within 24 hours of receiving the intelligence
- Link to Account if the signal is customer-specific
- Link to Product if the signal affects a specific product
- If the signal triggers an action, create a task on the Execution Board and check "Converted to Task?"
- If the signal requires a decision, link to Decision Reviews
- If the signal challenges a claim, link to Claims Register

**Completion Checklist:**
- [ ] Signal description is specific and actionable
- [ ] Signal Type is correct
- [ ] Source is documented
- [ ] Impact and Confidence are assessed
- [ ] Action Required is set
- [ ] Relations to Account, Product, Claim, or Decision are set where applicable

**Good Example:**
> Signal: "Prospect X's procurement team asked about data residency — they require KSA-hosted data."
> Type: Customer Objection
> Source: Discovery call with X, May 28
> Impact: High
> Confidence: High
> Account: Prospect X
> Related Claim: "AQLIYA supports KSA data residency" (which needs proof)
> Action Required: Investigate → "Check current deployment options for KSA hosting"

**Bad Example:**
> Signal: "Some stuff about the market"
> Type: (empty)
> Source: (empty)
> Impact: (empty)

**What Not To Write:**
- Vague signals without source attribution
- Signals that are actually tasks (create a task instead)
- Signals that repeat existing product knowledge without new information
- Emotional reactions without factual basis

---

## Template 2: Weekly Founder Intelligence Review

**Purpose:** Weekly structured briefing that forces prioritization, risk visibility, and action. This is the CEO Dashboard in narrative form.

**Required Fields:**

| Field | Instructions |
|---|---|
| Briefing Date | Set to Monday of current week |
| Type | `Weekly` |
| Critical Move | ONE thing that must happen this week. Not three. ONE. |
| Top Revenue Opportunity | The deal or opportunity with the highest revenue impact this week |
| Revenue Amount | Estimated USD value |
| Top Product Risk | The biggest risk to product velocity or quality |
| Risk Severity | Be honest. `Critical` = ship-blocking. |
| Claims Not Safe To Say | List specific claims from Claims Register that cannot be used externally. Be explicit. |
| Claims Ready To Use | List specific claims that are validated and safe to use |
| Accounts Needing Follow-up | Which accounts need founder attention this week |
| Decisions Waiting | Which decisions are blocked on founder input |
| Proof Missing | Which proof entries are blocking claims from being used |
| Stop Doing | What should the company stop doing this week. Be specific. |

**Usage Rules:**
- Created every Monday morning
- Owner: Founder or CEO
- Must reference data from other databases (Accounts CRM, Claims Register, Decision Reviews, Proof Graph)
- Must be reviewed by at least one other person before end of Monday
- Archived after next week's briefing is created

**Completion Checklist:**
- [ ] Critical Move is ONE specific action
- [ ] Top Revenue Opportunity is identified
- [ ] Top Product Risk is named
- [ ] Claims Not Safe To Say is populated (even if empty — explicitly state "None")
- [ ] Accounts Needing Follow-up are listed
- [ ] Decisions Waiting are listed
- [ ] Proof Missing is listed
- [ ] Stop Doing is populated
- [ ] Next 3 Actions are concrete and assigned

**Good Example:**
> Critical Move: "Sign pilot agreement with X — legal has approved, awaiting founder signature."
> Top Revenue Opportunity: "X pilot → conversion → $120K ARR"
> Claims Not Safe To Say: "AQLIYA supports On-Prem deployment" (not implemented), "AQLIYA has executed external audit pilots" (T2 not reached)
> Stop Doing: "Building demo modifications for prospects who haven't qualified ICP. Use standard demo only."

**Bad Example:**
> Critical Move: (empty)
> Claims Not Safe To Say: (empty — means all claims are safe, which is unlikely)
> Stop Doing: (empty)

**What Not To Write:**
- More than one Critical Move
- Claims as safe that have not been verified through Proof Graph
- Vague "we need to do better" statements without specific actions
- Information that belongs in other databases (signals, proof, decisions)

---

## Template 3: Decision Review Memo

**Purpose:** Record a decision for later quality review. Not a full decision governance workflow — that lives in DecisionOS. This is the lightweight learning loop.

**Required Fields:**

| Field | Instructions |
|---|---|
| Decision | One-line statement of what was decided. "We decided to X." |
| Original Decision | Full context. What was the situation? What options were considered? What was chosen and why? |
| Decision Date | When was the decision made? (Not when this record is created.) |
| Expected Outcome | What did you expect to happen? Be specific and measurable if possible. |
| Outcome Status | `Pending` if too early to evaluate. Update when outcome is known. |
| Decision Quality Score | At time of decision: 1 = random guess, 5 = reasonable process, 10 = rigorous analysis with full information. Be honest. |
| Review Date | Set a date 30/60/90 days out to review the outcome. |
| Reversible? | Be honest about commitment level. |

**Usage Rules:**
- Create within 24 hours of a major decision
- Major = strategic direction, product scope, commercial terms, people, >$10K spend
- Minor decisions (daily ops) do not need an entry
- Review date must be set at creation
- Link to related signal if the decision was triggered by an intelligence signal

**Completion Checklist:**
- [ ] Decision statement is clear and specific
- [ ] Original context is documented (enough for someone 6 months later to understand)
- [ ] Expected outcome is specific
- [ ] Decision Quality Score is assigned (brutally honest)
- [ ] Review Date is set
- [ ] Reversibility is assessed
- [ ] Related signals/claims are linked if applicable

**Good Example:**
> Decision: "Prioritize AuditOS v0.2 over starting SalesOS build"
> Original Decision: "We had two paths: harden AuditOS to external pilot readiness, or begin building SalesOS production backend. AuditOS has existing product-market fit signals. SalesOS is premature until we have a repeatable sales motion. Decision: AuditOS v0.2 gets next 4 weeks of engineering."
> Expected Outcome: "AuditOS reaches external pilot candidate status by June 15."
> Decision Quality Score: 7/10 (good data, but AuditOS focus may delay revenue diversification)
> Reversible?: Reversible With Cost (shifting back to SalesOS would lose 4 weeks)

**Bad Example:**
> Decision: "Did a thing"
> Original Decision: (empty)
> Expected Outcome: "It will be fine"
> Decision Quality Score: (empty)

**What Not To Write:**
- Routine operational decisions
- Decisions that already have a full DecisionOS record (link instead)
- Blame-oriented post-mortems (focus on system, not individuals)
- Speculative outcomes without basis

---

## Template 4: Customer Intelligence Review

**Purpose:** Structured intelligence entry for an account. Not a CRM contact record — this is the strategic intelligence layer.

**Required Fields:**

| Field | Instructions |
|---|---|
| Account | Link to Accounts CRM record. Must exist first. |
| ICP Segment | Select from ICP-1 to ICP-7. Be honest — not every prospect fits an ICP. |
| Pain Severity | 1-10. 10 = "they will lose business/face regulatory action without solving this." 1 = "nice to have." |
| Budget Signal | `Confirmed` = they have allocated budget. `Indicated` = they mentioned budget. `Unknown` = no signal. |
| Authority Level | Who have we spoken to? `Champion` = internal advocate. `Economic Buyer` = decision maker. |
| Timing | Their timeline. Not our desired timeline. Be honest. |
| Trust Level | Our relationship health. Be honest about `Low` or `Damaged`. |
| Next Best Action | Based on the signals, what is the single next action? |

**Usage Rules:**
- One entry per account (not per contact)
- Update after every meaningful interaction
- Owner is responsible for keeping current
- Review all active entries weekly

**Completion Checklist:**
- [ ] Account is linked
- [ ] ICP Segment is assigned
- [ ] Pain Severity is scored (with basis)
- [ ] Budget Signal is current
- [ ] Authority Level reflects most recent interaction
- [ ] Timing is honest
- [ ] Trust Level is assessed
- [ ] Next Best Action is clear and assigned

**Good Example:**
> Account: X (Audit firm, Riyadh)
> ICP Segment: ICP-1
> Pain Severity: 8/10 (manual review process is failing, reviewer quit)
> Budget Signal: Indicated (mentioned Q3 budget cycle)
> Authority Level: Champion (CFO liked demo), Economic Buyer (CEO) — no access yet
> Timing: Short (1-3 months — they want solution before next engagement)
> Trust Level: Medium (good rapport with CFO, CEO is skeptical)
> Next Best Action: "Executive meeting with CEO to address skepticism. Send CEO the trust principle one-pager."

**What Not To Write:**
- Static contact info (that belongs in Accounts CRM)
- Wishful thinking about timeline or budget
- Outdated intelligence without a last-updated timestamp
- Speculation presented as fact

---

## Template 5: Proof Approval Memo

**Purpose:** Document the approval of a proof entry for external use. This is the gate that enforces "Evidence governs."

**Required Fields:**

| Field | Instructions |
|---|---|
| Claim | The exact claim to be made externally. Precise wording matters. |
| Claim Source | Link to where this claim is documented (Git doc, product page, marketing copy) |
| Proof | The evidence that supports this claim. Be specific. |
| Source | Where did the proof come from? Pilot name, test ID, customer interaction. |
| Customer / Pilot | Which pilot or customer interaction produced this proof? |
| Outcome | Was the proof outcome `Confirmed` or `Partially Confirmed`? |
| Verification Level | `P1` (controlled pilot — with conditions), `P2` (external pilot — if executed), `P3` (paid reference) |
| Approved Message | Exact phrasing that can be used externally. Every word matters for commercial truth. |
| Public Use Allowed? | Check if approved for external use. Uncheck if internal only. |
| Public Use Restrictions | Any context or restrictions on use (e.g., "only in demos, not in published case studies") |

**Usage Rules:**
- Every external claim requires an approved Proof entry
- Approval must be documented before the claim is used
- Re-verify every 30 days
- If the underlying product status changes, re-verify immediately
- If verification level is P1, the approved message must include conditions

**Completion Checklist:**
- [ ] Claim is specific and exact
- [ ] Claim Source is documented (Git link or document reference)
- [ ] Proof is specific (not "we tested it" — "we tested with X data, Y outcome")
- [ ] Source is named
- [ ] Verification Level is correct
- [ ] Approved Message is written and reviewed
- [ ] Public Use Allowed is set (with restrictions if needed)
- [ ] Next Verification date is set (30 days)

**Good Example:**
> Claim: "AuditOS processes trial balances of up to 5,000 lines"
> Claim Source: `docs/product/auditos-mvp-prd.md`
> Proof: "Imported X sample TB with 4,800 lines. All accounts mapped. Statements generated. Performance under 3 seconds."
> Source: Internal rehearsal on seed data, May 2026
> Approval Level: P1 (Controlled Pilot)
> Approved Message: "In controlled pilots, AuditOS has processed trial balances exceeding 4,500 lines. Performance and accuracy conditions apply."
> Public Use Allowed: ✅
> Restrictions: "Use in demos only. Not for published case studies."

**Bad Example:**
> Claim: "AuditOS is great"
> Proof: "We think it works"
> Approved Message: (empty)

**What Not To Write:**
- Claims without specific, documented proof
- Verification levels that exceed actual maturity
- Approved messages that overstate what the proof supports
- Claims for products that are L0-L1 (unless labeled as "future" / "planned")

---

## Template 6: Product Focus Review

**Purpose:** Structured review of product focus — which product should get attention, investment, or deprioritization. Feeds Strategic Scores.

**Required Fields:**

| Field | Instructions |
|---|---|
| Object | Product name |
| Object Type | `Product` |
| Market Pull | 1-10. Evidence-based: customer requests, market signals, competitive pressure. |
| Revenue Potential | 1-10. Estimate based on ICP size, deal size, conversion probability. |
| Proof Level | 1-10. How validated is this product? AuditOS = 8, LocalContentOS = 7, DecisionOS = 6, SalesOS = 3, SimulationOS = 1. |
| Technical Readiness | 1-10. How mature is the codebase? |
| Risk | 1-10. What could go wrong? Competitive, technical, market risk. |
| Complexity | 1-10. How hard is it to build and maintain? |
| Recommended Action | `Invest` = increase resources. `Maintain` = keep current pace. `Monitor` = watch, no change. `Deprioritize` = reduce. `Stop` = kill. |
| Review Date | 30 days from now |

**Usage Rules:**
- Reviewed monthly as part of Strategic Score updates
- Must reference current product status from `PRODUCT_STATUS_MATRIX.md`
- Scores must align with Git reality (e.g., SalesOS cannot score 10 on Proof Level when it's L4)
- If two products have similar scores, qualitative context in Notes decides tiebreaker

**Completion Checklist:**
- [ ] Market Pull is evidence-based (cite signals if possible)
- [ ] Revenue Potential has a basis (deal size × ICP size)
- [ ] Proof Level matches `PRODUCT_STATUS_MATRIX.md`
- [ ] Technical Readiness matches code reality
- [ ] Risk is honestly assessed
- [ ] Recommended Action is decisive
- [ ] Review Date is set

**What Not To Write:**
- Scores that conflict with `PRODUCT_STATUS_MATRIX.md` (if they do, update one or the other)
- Optimistic scoring to justify pet projects
- "Middle of the road" scores for everything (be decisive)
- Recommended Action = `Invest` for every product (you cannot invest in everything)

---

## Template 7: Pilot Outcome Review

**Purpose:** Structured review of a pilot after completion. Captures what happened, what proof was produced, and what the next step is.

**Required Fields:**

| Field | Instructions |
|---|---|
| Pilot Name | Link to Pilot Tracker entry |
| Outcome | `Completed` / `Extended` / `No-Go` |
| Success Criteria Met? | Text — list each criterion and whether it was met |
| Evidence Produced | Link to Proof Graph 2.0 entries created from this pilot |
| Customer Feedback | Summary of key feedback, positive and negative |
| What Went Well | Specific practices to repeat |
| What Went Wrong | Specific issues to fix |
| Lessons Learned | Systemic improvements |
| Conversion Path | Next step: `Paid Conversion` / `Second Pilot` / `Pilot Complete — No Conversion` / `Unknown` |
| Risk Disclosure Signed? | Was the risk/limitation disclosure acknowledged? |

**Usage Rules:**
- Complete within 1 week of pilot end
- All evidence produced during the pilot must be linked to Proof Graph 2.0
- If conversion is possible, create a follow-up action
- If No-Go, document why honestly

**Completion Checklist:**
- [ ] Outcome is selected
- [ ] Success criteria are evaluated
- [ ] All evidence is linked to Proof Graph 2.0
- [ ] Lessons learned are documented
- [ ] Conversion path is determined
- [ ] If No-Go, reasons are documented

**Good Example:**
> Pilot: AuditOS Internal Rehearsal (May 2026)
> Outcome: Completed
> Success Criteria: "Process 5,000-line TB" → YES, "Generate statements" → YES, "Complete under 5 minutes" → YES (3.2s)
> Evidence Produced: TB processing speed, statement accuracy, mapping completeness
> What Went Well: "Upload flow was intuitive. Mapping suggestions saved time."
> What Went Wrong: "Report formatting needs work. Arabic PDF rendering has quality gaps."
> Conversion Path: "Controlled pilot with prospect X. Risk disclosure updated for formatting limitations."

**What Not To Write:**
- Outcome claims not supported by evidence
- Hiding negative feedback
- Conversion path that is aspirational (if no buyer is identified, say "Unknown")
- Lessons learned that are vague — "improve communication" without specifics

---

## Template Usage Matrix

| Template | Database | When To Use | Owner |
|---|---|---|---|
| Institutional Signal | Institutional Signals | After any intelligence event | Anyone |
| Weekly Founder Review | Founder Briefings | Every Monday | Founder/CEO |
| Decision Review Memo | Decision Reviews | After major decision | Decision-maker |
| Customer Intelligence | Customer Intelligence | After customer interaction | Account owner |
| Proof Approval Memo | Proof Graph 2.0 | Before any external claim | Founder/CEO |
| Product Focus Review | Strategic Scores | Monthly | Founder/CEO |
| Pilot Outcome Review | Pilot Tracker | Within 1 week of pilot end | Pilot lead |

---

## Next Step

Proceed to `docs/archive/notion-export-2026/06-governance-rules.md` — strict governance rules for Notion.
