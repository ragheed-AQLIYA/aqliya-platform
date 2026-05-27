# AuditOS Pilot Session Runbook

## Session Structure

Total estimated time: 45-60 minutes

| Phase               | Duration | Activity                                   |
| ------------------- | -------- | ------------------------------------------ |
| 1. Briefing         | 5 min    | Read constraints, confirm understanding    |
| 2. Navigation       | 5 min    | Login, dashboard walkthrough               |
| 3. Core workflow    | 20 min   | Engagement → mapping → evidence → findings |
| 4. Review & approve | 10 min   | Submit, review, approve, verify            |
| 5. Export           | 5 min    | Generate and verify export                 |
| 6. Debrief          | 5-10 min | Collect feedback, observations             |

## Phase 1: Briefing

**Objective:** Set expectations and confirm participant understanding.

**Script:**

> "This is a controlled pilot of AuditOS. It is not production software. Data may be reset between sessions. AI outputs are suggestions, not final decisions. Everything is logged. You are in control — human decides, evidence governs."

**Check:**

- [ ] Participant confirms understanding
- [ ] Participant knows they can stop at any time
- [ ] Participant knows how to report issues

## Phase 2: Navigation

**Objective:** Orient the participant in the workspace.

**Steps:**

1. Navigate to the AuditOS URL
2. Log in with pilot credentials
3. Show the dashboard:
   - Total engagements
   - Total evidence items
   - Status distribution
   - Recent activity
4. Explain what each metric means
5. Navigate to engagement list
6. Select the pilot engagement

**Expected state:** Dashboard loads with real (not hardcoded) metrics. Engagement list shows at least 1 engagement.

## Phase 3: Core Workflow

**Objective:** Walk through the primary audit workflow.

### Trial Balance

1. Open trial balance tab
2. Review uploaded trial balance data
3. Verify account codes and balances display correctly

### Account Mapping

1. Navigate to mapping section
2. Review AI-suggested mappings
3. Accept a suggested mapping
4. Manually adjust a mapping (if applicable)
5. Verify mapped accounts appear in financial statements

### Financial Statements

1. Navigate to statements tab
2. Verify income statement and balance sheet are generated
3. Review numbers for consistency

### Evidence

1. Navigate to evidence vault
2. Upload a test evidence file
3. Verify file appears in evidence list
4. Open evidence detail
5. Link evidence to a finding or recommendation

### Findings & Recommendations

1. Navigate to findings tab
2. Review AI-generated signals
3. Accept a finding as-is
4. Edit a finding description
5. Add a recommendation
6. Link evidence to finding

## Phase 4: Review & Approval

**Objective:** Demonstrate governance workflow.

### Submission

1. Submit engagement for review
2. Verify status changes to "Under Review"

### Review

1. Switch to reviewer role (if available) or discuss the review step
2. Add review comment
3. Show approval / return actions

### Approval

1. Approve the engagement
2. Verify status changes to "Approved"
3. Show approval record in audit trail

## Phase 5: Export

**Objective:** Verify export output is correct and governance-compliant.

### PDF Export

1. Generate PDF export
2. Open the exported PDF
3. Verify:
   - Engagement metadata correct
   - Financial statements present
   - Status label correct (Draft / Approved)
   - Disclaimer present
   - Approval info present (if approved)

### XLSX Export

1. Generate XLSX export
2. Open the exported file
3. Verify data integrity

## Phase 6: Debrief

**Objective:** Collect structured feedback.

1. Ask open questions first:
   - "What was most useful?"
   - "What was confusing?"
   - "What would you change?"

2. Record answers in evidence capture (05)

3. Rate overall experience (1-5)

4. Ask: "Would you use this for real audit work?"

5. Explain next steps:
   - Session data will be preserved
   - They will receive a summary
   - Feedback will inform improvements

## Session Completion

- [ ] All phases completed
- [ ] Evidence capture document filled
- [ ] Screenshots taken for key steps
- [ ] Post-session review initiated

## Troubleshooting During Session

| Problem                     | Action                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| Page fails to load          | Refresh. If persists, check proxy and auth.                                                 |
| Dashboard shows no data     | Verify seed data loaded. Check DB connection.                                               |
| Export fails                | Check error message. Verify engagement has statements.                                      |
| AI suggestion not appearing | AI is deterministic — refresh or re-navigate.                                               |
| Evidence upload fails       | Check file size (20MB limit) and type.                                                      |
| Rate limit error            | Wait 1 minute and retry.                                                                    |
| Auth error                  | Re-login. Check session expiry.                                                             |
| Unexpected error            | Note the error, capture screenshot, continue if possible. If blocking, use escalation (04). |
