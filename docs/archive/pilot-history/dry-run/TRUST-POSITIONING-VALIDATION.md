# AQLIYA Trust Positioning Validation

**Document:** TRUST-POSITIONING-VALIDATION.md  
**Purpose:** Audit every trust-related claim in the pilot documentation and demo script to ensure AQLIYA never overclaims.  

---

## Section 1: Core Trust Principle

| Element | Required | Current Status |
|---------|----------|---------------|
| Principle stated | "AI assists. Humans decide. Evidence governs." | ✅ Present in README, demo script, brand docs |
| Visible in demo | Opening script states it directly | ✅ Section: Opening Script (3 minutes) |
| Visible in workspace | "Draft · Requires human review · Not final" | ✅ AI outputs panel |
| Visible in marketing | Brand docs, homepage | ✅ Homepage trust section |

## Section 2: Every AI Suggestion

| Check | Must Be True | Validated? |
|-------|-------------|------------|
| Every AI suggestion has a confidence score | Yes | ✅ (AIIndicator, AISuggestionPanel, AIOutputsPanel) |
| Every AI suggestion requires human acceptance/rejection | Yes | ✅ Accept/Reject buttons on all AI panels |
| Human decisions are tracked separately from AI | Yes | ✅ Actor name + timestamp on every action |
| Model version is recorded | Yes | ✅ Where available (AISuggestionPanel) |
| AI suggestions are visually distinct | Yes | ✅ Different badge color (violet/cyan) |

## Section 3: Every Output

| Check | Must Be True | Validated? |
|-------|-------------|------------|
| Draft status is visible on every output | Yes | ✅ Badges on statements, notes, evidence |
| No output is marked as "Final" without approval | Yes | ✅ Approval workflow required |
| Every output is traceable to its source | Yes | ✅ Traceability QA checklist |
| Review comments show attribution | Yes | ✅ Actor name + timestamp |

## Section 4: What We Never Say

| Forbidden Phrase | Found Anywhere? | Action |
|-----------------|-----------------|--------|
| "Fully automated audit" | ❌ Not found | ✅ Clean |
| "Replaces auditors" | ❌ Not found | ✅ Clean |
| "AI-powered audit" (without qualifier) | ❌ Not found | ✅ Clean |
| "No human review needed" | ❌ Not found | ✅ Clean |
| "Production-ready" (for pilot outputs) | ❌ Not found | ✅ Clean |
| "Audit-approved" | ❌ Not found | ✅ Clean |
| "Financial statement final" | ❌ Not found | ✅ Clean |
| "Guaranteed accuracy" | ❌ Not found | ✅ Clean |

## Section 5: Trust Touchpoints in the Demo

| Demo Section | Trust Signal | Present? | Effective? |
|-------------|-------------|----------|------------|
| Opening | Trust principle statement | ✅ | ✅ Direct and clear |
| Section 2 (AuditOS Purpose) | Draft/Review/Approval badges visible | ✅ | ✅ Shows governance |
| Section 4 (Account Mapping) | Confidence scores, Accept/Reject actions | ✅ | ✅ Demonstrates human control |
| Section 5 (Financial Statements) | Draft watermark, traceable line items | ✅ | ✅ Shows source visibility |
| Section 9 (Traceability) | Full audit trail demonstration | ✅ | ✅ Core trust signal |
| Section 11 (Human Review Disclaimer) | Explicit "AuditOS assists. It does not replace." | ✅ | ✅ Critical trust moment |
| Closing | Next steps — customer controls timeline | ✅ | ✅ Customer owns the process |

## Section 6: Trust Gaps

| Gap | Severity | Recommended Action |
|-----|----------|-------------------|
| No trust signals in the login page | Low | Login page is pre-auth — acceptable |
| AI confidence color coding not explained to customer | Medium | Add a brief explanation during mapping demo: "Green = high confidence, Amber = moderate, Red = low — all require your review" |
| "Suggested by AI" label may not be visible in all contexts | Low | Verify during dry run |

## Section 7: Founder Trust Script Confidence

| Statement | Founder Must Say | Dry Run Result |
|-----------|-----------------|----------------|
| Opening: "AI assists. Humans decide. Evidence governs." | ✅ | ☐ Pass ☐ Needs Practice |
| Mapping: "AI suggests, you decide. Every suggestion shows confidence." | ✅ | ☐ Pass ☐ Needs Practice |
| Statements: "Draft — not final — requires human review." | ✅ | ☐ Pass ☐ Needs Practice |
| Closing: "Nothing is final until a human approves it." | ✅ | ☐ Pass ☐ Needs Practice |

## Sign-Off

| Role | Name | Date |
|------|------|------|
| Founder | | |
| Pilot Lead | | |
