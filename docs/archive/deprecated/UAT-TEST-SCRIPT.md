# AuditOS — UAT Test Script

## Setup
- URL: http://localhost:3000/audit
- Demo credentials: email=admin@aqliya.sa (or use demo fallback)
- Seed data: `npm run seed:audit`

---

## TC-01: Create Engagement

**Steps:**
1. Navigate to /audit
2. Click "New Engagement"
3. Enter: client name = "UAT Test Client", fiscal period = "FY2025", engagement type = "Full Audit"
4. Click "Create"

**Expected:**
- Engagement appears in list
- Status is "setup"
- AuditEvent "engagement.created" is recorded

---

## TC-02: Upload Trial Balance

**Steps:**
1. Open the engagement from TC-01
2. Navigate to Trial Balance tab
3. Upload CSV/XLSX file (or use seeded data)
4. Verify accounts appear

**Expected:**
- Trial balance lines loaded
- Total debits = Total credits (variance = 0 or minimal)
- AuditEvent "trial_balance.uploaded" recorded

---

## TC-03: Map Accounts

**Steps:**
1. Navigate to Mapping tab
2. Review pending mappings
3. Map at least one account to a canonical account
4. Confirm mapping

**Expected:**
- Mapping status changes to "confirmed"
- AuditEvent recorded

---

## TC-04: Create Evidence

**Steps:**
1. Navigate to Evidence tab
2. Click "Request Evidence"
3. Enter filename (e.g. "test_evidence.pdf")
4. Click "Request Evidence"

**Expected:**
- Evidence appears in table
- State is "missing"
- Error message shown for invalid file types
- Error message shown if we could add fileSize > 20MB

---

## TC-05: Link Evidence to Finding

**Steps:**
1. Select an evidence item (click on it)
2. Click "Link to Finding"
3. Select a finding
4. Click "Link"

**Expected:**
- Evidence now shows linked entity
- AuditEvent "evidence.linked" recorded
- Traceability shows the connection

---

## TC-06: Create Finding

**Steps:**
1. Navigate to Findings tab
2. Click "New Finding"
3. Fill in: title, description, severity
4. Click "Create"

**Expected:**
- Finding appears in list
- AuditEvent "finding.created" recorded

---

## TC-07: Create Recommendation

**Steps:**
1. Navigate to Recommendations tab
2. Click "New Recommendation"
3. Select a finding, enter title, description, action
4. Click "Create"

**Expected:**
- Recommendation appears in list
- AuditEvent "recommendation.created" recorded

---

## TC-08: Add Review Comment

**Steps:**
1. Navigate to Reviews tab
2. Select a target entity (finding/statement/note)
3. Enter a comment
4. Click "Add Comment"

**Expected:**
- Comment appears in review list
- AuditEvent "review.comment_added" recorded

---

## TC-09: Resolve Review Comment

**Steps:**
1. Open the review comment from TC-08
2. Click "Resolve" with resolution text
3. Confirm resolution

**Expected:**
- Comment status changes to "resolved"
- AuditEvent "review.comment_resolved" recorded

---

## TC-10: Test Approval Blocked

**Steps:**
1. Navigate to Approval tab
2. Check readiness checklist — should show blockers
3. Try to approve engagement

**Expected:**
- Approval button is disabled
- Blocking issues are shown (unmapped accounts, missing evidence, open reviews)
- Rejection with reason is allowed

---

## TC-11: Fix Blockers and Approve

**Steps:**
1. Map all unmapped accounts (Mapping tab)
2. Collect/verify all evidence (Evidence tab)
3. Resolve all review comments (Reviews tab)
4. Navigate to Approval tab
5. Verify readiness checklist shows all green
6. Click "Approve" with rationale

**Expected:**
- Approval is successful
- AuditEvent recorded
- Engagement status changes to "approved"

---

## TC-12: Generate AI Draft Notes

**Steps:**
1. Navigate to Notes tab
2. Click "Generate Draft Notes"
3. Wait for AI generation to complete

**Expected:**
- AI Draft Notes panel appears
- Each draft shows: title, content, missing information checklist
- "Not final" badge displayed
- Confidence percentage shown
- Accept and Reject buttons visible

---

## TC-13: Accept/Reject AI Outputs

**Steps:**
1. On the AI Draft Notes panel, click "Accept" on one draft
2. Click "Reject" on another draft

**Expected:**
- Accepted draft becomes a disclosure note (visible in notes list)
- Rejected draft disappears from AI panel
- AuditEvents: "ai.notes_draft_accepted" and "ai.notes_draft_rejected" recorded
- Accepted note has "AI Drafted" badge

---

## TC-14: Generate AI Finding Drafts

**Steps:**
1. Navigate to Findings tab
2. Click "Generate Draft Findings"
3. Accept one draft

**Expected:**
- AI Draft Findings panel appears
- Accepted draft becomes a finding
- Finding has aiSuggested=true
- AuditEvents recorded

---

## TC-15: AI Analytical Review

**Steps:**
1. Navigate to Validation tab
2. Click "Analytical Review"
3. View risk flags

**Expected:**
- Risk flags appear with severity indicators
- "Requires human review" badge shown
- Confidence percentages displayed
- AuditEvent "ai.analytical_review_generated" recorded

---

## TC-16: Export Financial Statements

**Steps:**
1. Navigate to Publication tab
2. Click "Export Statements"

**Expected:**
- JSON file downloads
- File contains: statements, notes, draft/approved labels
- If engagement is draft: labels.isDraft = true, draftWarning present
- If engagement is approved: labels.isApproved = true, approvalInfo present
- AuditEvent "export.financial_statements_generated" recorded

---

## TC-17: Export Audit File

**Steps:**
1. Navigate to Publication tab
2. Click "Export Audit File"

**Expected:**
- JSON file downloads
- File contains: evidence checklist, findings, recommendations, review comments, approval records, audit trail
- Each item includes actor/timestamp data
- AuditEvent "export.audit_file_generated" recorded

---

## TC-18: Bilingual Export

**Steps:**
1. Navigate to Publication tab
2. Click "Bilingual Export (AR/EN)"

**Expected:**
- JSON file downloads
- Statement titles prefixed with "بيان" (Arabic)
- Labels and structure preserved

---

## TC-19: Verify Audit Trail

**Steps:**
1. Navigate to Audit Trail tab
2. Verify all events from this UAT session appear
3. Check event type labels

**Expected:**
- All events visible with correct labels
- Actor, timestamp, targetType, targetId shown
- AI events have "aiRelated" badge
- Export events shown

---

## TC-20: Verify Traceability

**Steps:**
1. Navigate to any entity (finding, evidence, note)
2. Click "Traceability"
3. Verify forward and backward trace nodes

**Expected:**
- Forward trace shows source → account → evidence → finding → recommendation
- Backward trace shows publication ← approval ← review ← statements
- AI output nodes visible where applicable
- Empty trace shows "No forward trace available"

---

## TC-21: Role Enforcement (Server-side)

**Steps:**
1. When authenticated as "viewer" role:
   - Try to create engagement → should fail
   - Try to create evidence → should fail
   - Try to create finding → should fail
2. When authenticated as "operator" role:
   - Try to approve → should fail
3. When authenticated as "partner" role:
   - Try to create evidence → should fail
   - Try to approve → should succeed

**Expected:**
- Server actions throw "Access denied" errors
- Only authorized roles can perform their respective actions

---

## TC-22: Security — Demo Fallback

**Steps:**
1. In production mode (NODE_ENV=production), try accessing without auth
2. In development mode, verify demo fallback works

**Expected:**
- Production: "Authentication required" error
- Development: Demo actor "Ahmed Al Ghamdi" used

---

## TC-23: Upload Validation

**Steps:**
1. Try to request evidence with invalid file type (e.g. "test.exe")
2. Try to set file size > 20MB

**Expected:**
- Error message: "Unsupported file type" for .exe
- Error message: "File too large" for > 20MB

---

## Results Summary

| TC# | Test Case | Result | Notes |
|-----|-----------|--------|-------|
| 01 | Create Engagement | | |
| 02 | Upload Trial Balance | | |
| 03 | Map Accounts | | |
| 04 | Create Evidence | | |
| 05 | Link Evidence | | |
| 06 | Create Finding | | |
| 07 | Create Recommendation | | |
| 08 | Add Review Comment | | |
| 09 | Resolve Review | | |
| 10 | Approval Blocked | | |
| 11 | Fix & Approve | | |
| 12 | AI Draft Notes | | |
| 13 | Accept/Reject AI | | |
| 14 | AI Finding Drafts | | |
| 15 | AI Analytical Review | | |
| 16 | Export Statements | | |
| 17 | Export Audit File | | |
| 18 | Bilingual Export | | |
| 19 | Audit Trail | | |
| 20 | Traceability | | |
| 21 | Role Enforcement | | |
| 22 | Demo Fallback | | |
| 23 | Upload Validation | | |

**Tester:** __________________ **Date:** __________________

**Sign-off:** ☐ Pass ☐ Conditional Pass ☐ Fail
