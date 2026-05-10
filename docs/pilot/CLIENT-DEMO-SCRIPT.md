# AQLIYA AuditOS — Client Demo Script

## Opening Positioning (3 minutes)

**What AQLIYA AuditOS is:**
A controlled audit engagement platform that digitizes the statutory audit workflow — from trial balance intake through financial statement publication — with full traceability, AI-assisted drafting, and role-based review and approval.

**Who it is for:**
Audit firms conducting IFRS for SMEs and similar framework audits. Designed for engagement teams with preparers, reviewers, and partners who need structured, auditable collaboration.

**What problem it solves:**
- Fragmented spreadsheets and email-based audit workflows
- Missing traceability from source data to published statements
- Manual drafting of standard disclosure notes
- No structured evidence-to-finding linkage
- Approval without readiness checks

**Why audit traceability matters:**
Every number in audit should be traceable back to its source. Every decision should have an actor, a timestamp, and a rationale. AQLIYA AuditOS makes this a structural requirement, not an afterthought.

**Why AI is assistant-only:**
AI assists. Humans decide. Evidence governs. All AI output is draft, requires human review, and is never final by default. The platform enforces this separation at every level — schema, service layer, server actions, and UI.

---

## Demo Scenario (2 minutes)

**Client:** Gulf Trading Co.  
**Period:** FY2025 (January 1 – December 31, 2025)  
**Framework:** IFRS for SMEs  
**Currency:** SAR (Saudi Riyal)  
**Engagement Type:** Full Audit  
**Status:** In Progress  

Gulf Trading Co. is a Saudi-based trading company. The audit engagement has been set up with trial balance data uploaded, accounts mapped, financial statements structured, and initial evidence collected. The team is actively working through findings and review.

---

## Walkthrough Flow

### 1. Dashboard (2 minutes)

**What the user sees:**  
Summary cards: total engagements, active engagements, pending reviews, open findings, missing evidence, ready for approval. Recent activity feed shows latest audit events. Engagement list with status indicators.

**What is happening technically:**  
Dashboard queries aggregate counts from Prisma across engagements, events, findings, and evidence. Uses the service layer with DB-first, mock-fallback pattern.

**Audit value:**  
At-a-glance view of engagement health. Missing evidence and open findings surface immediately.

**Business value:**  
Managers and partners can assess portfolio status without opening individual engagement files.

**Risk/control message:**  
Dashboard reflects real database state. If evidence is missing, it shows here.

**Narration:**  
"This is the engagement dashboard. You can see active engagements, pending reviews, open findings, and missing evidence at a glance. Each number here is a live count from the database."

---

### 2. Engagement Overview (2 minutes)

**What the user sees:**  
Engagement header with client info, period, status. Workflow progress bar. Activity feed. Traceability summary. AI Outputs panel.

**Audit value:**  
Workflow progress shows where you are: setup → in progress → under review → ready for approval → approved → published.

**Narration:**  
"Each engagement has a clear status and workflow progress. The AI Outputs panel on this page shows any AI-generated suggestions."

---

### 3. Trial Balance (2 minutes)

**What the user sees:**  
Trial balance table with account code, name, debits, credits, balance, account type. Trust state indicator. Variance display.

**Audit value:**  
Variance between total debits and credits is visible. Trust state (trusted/conditional/blocked) is computed automatically.

**Narration:**  
"The trial balance shows 22 accounts for Gulf Trading Co. The system computes total debits versus credits and assigns a trust state. A non-zero variance is highlighted for review."

---

### 4. Account Mapping (2 minutes)

**What the user sees:**  
Source accounts mapped to canonical accounts. Mapping status: pending or confirmed. Mapping type: AI suggested or manually confirmed.

**Audit value:**  
Every source account must be mapped to a standard chart of accounts. Pending mappings block approval readiness.

**Narration:**  
"Each source account needs a canonical mapping. Here you can see 21 of 22 accounts are confirmed. One account — Sundry Income — is still pending."

---

### 5. Financial Statements (2 minutes)

**What the user sees:**  
Income Statement, Balance Sheet, Statement of Changes in Equity. Each with line items, amounts, totals, indentation.

**Audit value:**  
Statement lines are linked to account mappings. Status is tracked (draft/reviewed/approved).

**Narration:**  
"Three statements are structured from the mapped accounts: Income Statement, Balance Sheet, and Equity. Each line is linked to underlying account mappings for full traceability."

---

### 6. Notes to Financial Statements (2 minutes)

**What the user sees:**  
Disclosure notes with note number, title, content, status. Missing information badges. AI Drafted indicator.

**Audit value:**  
Notes track missing information requirements. AI-drafted notes are clearly marked.

**Narration:**  
"Disclosure notes are structured with status tracking. Notes that were AI-drafted show an 'AI Drafted' badge. Missing information requirements are visible."

---

### 7. Evidence (3 minutes)

**What the user sees:**  
Evidence table with filename, type, uploader, state (missing/uploaded/linked/reviewed/accepted/rejected). Evidence detail panel with link to finding.

**What is happening technically:**  
Evidence is stored with file metadata. Linking uses AuditEvidenceLink join table. File type validation and size limits apply on upload.

**Audit value:**  
Evidence lifecycle from missing to accepted. Evidence links to findings create the material trace.

**Narration:**  
"Evidence items have a clear lifecycle: missing, uploaded, linked, reviewed, accepted, or rejected. Each item can be linked to findings to show what audit evidence supports what conclusion."

---

### 8. Findings (2 minutes)

**What the user sees:**  
Findings table with title, severity, type, status. Detail view with description, root cause, impact. Linked evidence shown. AI Drafted flag.

**Audit value:**  
Findings have severity (low/medium/high/critical). Unresolved high/critical findings block approval.

**Narration:**  
"Four findings are logged for this engagement. One has high severity — Missing Inventory Evidence — which blocks approval until resolved."

---

### 9. Recommendations (2 minutes)

**What the user sees:**  
Recommendations linked to findings. Risk level, status, AI contribution flag.

**Audit value:**  
Every recommendation is linked to a specific finding. Recommendations can be AI-suggested or human-created.

**Narration:**  
"Recommendations are tied to findings. Each shows risk level and status. AI-contributed recommendations are flagged."

---

### 10. Review Comments (2 minutes)

**What the user sees:**  
Review comments with target entity selector (finding/statement/note). Comment, required action, status (open/resolved). Resolution text.

**What is happening technically:**  
Comments target real entity IDs via a selector. Status transitions from open to resolved with required action tracking.

**Audit value:**  
Review comments are not free text — they target specific entities. Open comments block approval.

**Narration:**  
"Review comments target real entities — findings, statements, or notes. Required actions like 'revise' or 'provide evidence' are tracked. Open comments prevent premature approval."

---

### 11. Approval Readiness Gate (2 minutes)

**What the user sees:**  
Readiness checklist: accounts mapped, evidence collected, reviews resolved, no critical findings, status eligible. Red/green per item. Blocking issues listed.

**What is happening technically:**  
`getApprovalStatus()` queries counts across mappings, evidence, review comments, and findings. Returns structured readiness data.

**Audit value:**  
Approval requires all gates to pass. Ensures no engagement is approved prematurely.

**Narration:**  
"The approval readiness gate checks five conditions before allowing approval. Currently, there are blockers: unmapped accounts, missing evidence, open reviews, and unresolved high-severity findings."

---

### 12. Blocked Approval Scenario (1 minute)

**What the user sees:**  
Approve button is disabled. Blocking issues are displayed. Rejection with reason is still available.

**Audit value:**  
Rejection with reason is always allowed — even when approval is blocked.

**Narration:**  
"Notice the Approve button is disabled. But Rejection with reason is still available — a reviewer can always flag that the engagement is not ready."

---

### 13. Fix Blockers and Approve (2 minutes)

**What the user sees:**  
After fixing blockers (mapping all accounts, collecting evidence, resolving reviews): the readiness checklist turns green. Approve button becomes active. Approval with rationale is recorded.

**What is happening technically:**  
`updateEngagementStatus()` changes engagement status to "approved". `AuditEvent` records the approval. `createApprovalRecord()` stores approval metadata.

**Audit value:**  
Approval is timestamped with approver identity, role, and rationale.

**Narration:**  
"After resolving all blockers, the gate opens. The partner approves with rationale. Every approval is recorded with actor, role, timestamp, and reason."

---

### 14. Audit Trail (2 minutes)

**What the user sees:**  
Chronological list of all audit events. Filterable by event type. Shows actor, timestamp, target type, target ID, description. AI-related events flagged.

**What is happening technically:**  
Every material server action creates an `AuditEvent` record. Events are append-only — they cannot be edited or deleted from the UI.

**Audit value:**  
Complete, immutable history of every action. Supports audit quality review and regulatory inspection.

**Narration:**  
"The audit trail shows every action taken during the engagement — who did what, when, and to which entity. Events range from engagement creation through AI output generation to approval."

---

### 15. TraceabilityDrawer (2 minutes)

**What the user sees:**  
From any entity (evidence, finding, note), clicking "Traceability" opens a slide-in drawer showing forward trace (source → account → evidence → finding → recommendation) and backward trace (publication ← approval ← review ← statements).

**What is happening technically:**  
`getTraceability()` in the DB layer queries across trial balance, mappings, evidence, findings, recommendations, review comments, approvals, events, and AI outputs.

**Audit value:**  
Every material entity can be traced in both directions. Traceability is not fabricated — it reflects real database links.

**Narration:**  
"From any finding or evidence item, you can open the Traceability drawer. It shows the forward path from source data through to recommendation, and the backward path from publication back through approvals and review."

---

### 16. AI Draft Notes (3 minutes)

**What the user sees:**  
"Generate Draft Notes" button. AI Draft Notes panel showing: title, content, missing information checklist. "Not final" badge. Accept and Reject buttons.

**What is happening technically:**  
`generateDraftNotes()` analyzes trial balance and existing notes, creates AIOutput records with `sourceEntityType` and `sourceEntityId`. Accepting calls `acceptDraftNote()` which creates/updates a DisclosureNote.

**Audit value:**  
AI notes are draft-only. Human must accept before they appear in statements. Missing information is surfaced explicitly.

**AI limitation message:**  
"AI draft notes are starting points. They require human review, verification of amounts, and tailoring to the company's specific circumstances."

**Narration:**  
"Click 'Generate Draft Notes' to create AI suggestions for missing disclosure notes. Each draft shows content, missing information checklist, and confidence. Accept creates a real note. Reject dismisses it."

---

### 17. AI Evidence Suggestions (2 minutes)

**What the user sees:**  
"Suggest Evidence" button. AI suggestion panel showing: suggested filename, reason (material balance or finding-driven). Accept to create evidence request.

**Audit value:**  
AI suggests evidence based on materiality and findings. Human confirmation required before evidence is created.

**Narration:**  
"AI analyzes material balances and open findings to suggest evidence items. Accepting creates an evidence request in 'missing' state — no evidence is auto-collected."

---

### 18. AI Analytical Review (2 minutes)

**What the user sees:**  
"Analytical Review" button on Validation page. Risk flags with severity, description, confidence percentage, flag type.

**Audit value:**  
AI flags unusual balances, unmapped accounts, and large balances for human review. No automatic accounting changes.

**Narration:**  
"Analytical review detects negative balances, large balances, and unmapped accounts. Each flag shows severity, confidence, and description. All flags require human review."

---

### 19. Export Financial Statements (2 minutes)

**What the user sees:**  
"Export Statements" button on Publication page. JSON file downloads. File contains: statements, notes, labels (isDraft, isApproved, draftWarning, approvalInfo).

**Audit value:**  
Exports include clear status labels. Draft exports show a warning. Approved exports include approval metadata.

**Export limitation message:**  
"Current export format is JSON. PDF and Word export are under consideration for a future release."

**Narration:**  
"Export downloads the financial statements package as JSON. The file includes status labels — if the engagement is draft, a clear 'DRAFT — Not final' warning is embedded."

---

### 20. Export Audit File (1 minute)

**What the user sees:**  
"Export Audit File" button. Download includes evidence checklist, findings, recommendations, review comments, approval records, audit trail.

**Narration:**  
"The audit file export packages all workpaper components into one downloadable file."

---

### 21. Bilingual Export (1 minute)

**What the user sees:**  
"Bilingual Export (AR/EN)" button. Statement titles prefixed with Arabic equivalent.

**Narration:**  
"The bilingual export adds Arabic labels to statement titles while keeping the accounting content unchanged."

---

## Closing Narrative (3 minutes)

**What is ready now:**
- Complete audit workflow: engagement → trial balance → mapping → statements → notes → evidence → findings → recommendations → review → approval
- AI-assisted drafting for notes, evidence suggestions, findings, recommendations, and analytical review
- Role-based security (preparer, reviewer, partner, admin) enforced at server-action level
- Full audit trail with 18+ event types
- Traceability from source data through to publication
- Approval readiness gate
- JSON export with draft/approved labels
- Bilingual export for Arabic/English labels

**What is pilot scope:**
This is a controlled pilot using structured demo data under supervised conditions. The product is ready for:
- Internal team evaluation
- Controlled client walkthrough
- Workflow validation
- AI capability demonstration

**What is NOT production-ready yet:**
- PDF/Word export — current output is JSON
- Virus/malware scanning — file uploads should be treated as trusted documents
- Production authentication — user provisioning still requires setup
- Multi-tenant isolation — verified for single organization only
- External production deployment — requires additional security review

**Next step after pilot:**
1. Collect stakeholder feedback
2. Prioritize production requirements
3. Address identified gaps
4. Schedule production readiness review

**Final message:**
"Thank you for your time. We are excited to share AQLIYA AuditOS with you and look forward to your feedback as we prepare for production deployment."
